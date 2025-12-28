import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { SearchFilters } from '@/types';

interface Alert {
  id: string;
  user_id: string;
  name: string;
  search_criteria: SearchFilters;
  is_active: boolean;
  last_checked_at: string | null;
  last_results_count: number;
  created_at: string;
}

// GET - Fetch all alerts for the current user
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Check if user has Pro or Ultra subscription
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', userId)
      .single();

    if (!profile || profile.subscription_tier === 'free') {
      return NextResponse.json(
        { error: 'Alerts are only available for Pro and Ultra users', requiresUpgrade: true },
        { status: 403 }
      );
    }

    const { data: alerts, error } = await supabase
      .from('search_alerts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching alerts:', error);
      return NextResponse.json(
        { error: 'Failed to fetch alerts' },
        { status: 500 }
      );
    }

    return NextResponse.json({ alerts });
  } catch (error) {
    console.error('Error in alerts GET:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new alert
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { userId, name, searchCriteria } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Check if user has Pro or Ultra subscription
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', userId)
      .single();

    if (!profile || profile.subscription_tier === 'free') {
      return NextResponse.json(
        { error: 'Alerts are only available for Pro and Ultra users', requiresUpgrade: true },
        { status: 403 }
      );
    }

    // Limit alerts based on tier
    const { data: existingAlerts } = await supabase
      .from('search_alerts')
      .select('id')
      .eq('user_id', userId);

    const alertLimit = profile.subscription_tier === 'ultra' ? 10 : 3;
    if (existingAlerts && existingAlerts.length >= alertLimit) {
      return NextResponse.json(
        { error: `Je kunt maximaal ${alertLimit} alerts hebben met je ${profile.subscription_tier === 'ultra' ? 'Ultra' : 'Pro'} abonnement` },
        { status: 400 }
      );
    }

    if (!name || !searchCriteria) {
      return NextResponse.json(
        { error: 'Name and search criteria are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('search_alerts')
      .insert({
        user_id: userId,
        name,
        search_criteria: searchCriteria,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating alert:', error);
      return NextResponse.json(
        { error: 'Failed to create alert' },
        { status: 500 }
      );
    }

    return NextResponse.json({ alert: data });
  } catch (error) {
    console.error('Error in alerts POST:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Remove an alert
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { userId, alertId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    if (!alertId) {
      return NextResponse.json(
        { error: 'Alert ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('search_alerts')
      .delete()
      .eq('user_id', userId)
      .eq('id', alertId);

    if (error) {
      console.error('Error deleting alert:', error);
      return NextResponse.json(
        { error: 'Failed to delete alert' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in alerts DELETE:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH - Toggle alert active status
export async function PATCH(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { userId, alertId, isActive } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    if (!alertId || typeof isActive !== 'boolean') {
      return NextResponse.json(
        { error: 'Alert ID and isActive status are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('search_alerts')
      .update({
        is_active: isActive,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('id', alertId)
      .select()
      .single();

    if (error) {
      console.error('Error updating alert:', error);
      return NextResponse.json(
        { error: 'Failed to update alert' },
        { status: 500 }
      );
    }

    return NextResponse.json({ alert: data });
  } catch (error) {
    console.error('Error in alerts PATCH:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
