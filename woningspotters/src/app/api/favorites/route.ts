import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

// GET - Fetch all favorites for the current user
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();

    // Get user from auth header or session
    const authHeader = request.headers.get('authorization');
    const userId = authHeader?.replace('Bearer ', '');

    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { data: favorites, error } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching favorites:', error);
      return NextResponse.json(
        { error: 'Failed to fetch favorites' },
        { status: 500 }
      );
    }

    return NextResponse.json({ favorites });
  } catch (error) {
    console.error('Error in favorites GET:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Add a new favorite
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { userId, propertyUrl, propertyData } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    if (!propertyUrl || !propertyData) {
      return NextResponse.json(
        { error: 'Property URL and data are required' },
        { status: 400 }
      );
    }

    // Check user's subscription tier for favorites limit
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', userId)
      .single();

    // Free users can't save favorites
    if (!profile || profile.subscription_tier === 'free') {
      return NextResponse.json(
        { error: 'Upgrade to Pro to save favorites', requiresUpgrade: true },
        { status: 403 }
      );
    }

    // Insert the favorite
    const { data, error } = await supabase
      .from('favorites')
      .insert({
        user_id: userId,
        property_url: propertyUrl,
        property_data: propertyData,
      })
      .select()
      .single();

    if (error) {
      // Handle duplicate
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Property already in favorites' },
          { status: 409 }
        );
      }
      console.error('Error adding favorite:', error);
      return NextResponse.json(
        { error: 'Failed to add favorite' },
        { status: 500 }
      );
    }

    return NextResponse.json({ favorite: data });
  } catch (error) {
    console.error('Error in favorites POST:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Remove a favorite
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { userId, propertyUrl } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    if (!propertyUrl) {
      return NextResponse.json(
        { error: 'Property URL is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('property_url', propertyUrl);

    if (error) {
      console.error('Error removing favorite:', error);
      return NextResponse.json(
        { error: 'Failed to remove favorite' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in favorites DELETE:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
