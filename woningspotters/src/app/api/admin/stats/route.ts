import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', userId)
      .single();

    if (profileError || !profile?.is_admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get total users count
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // Get users by tier
    const { data: tierCounts } = await supabase
      .from('profiles')
      .select('subscription_tier');

    const usersByTier = {
      free: 0,
      pro: 0,
      ultra: 0,
    };

    tierCounts?.forEach(u => {
      const tier = u.subscription_tier as keyof typeof usersByTier;
      if (tier in usersByTier) usersByTier[tier]++;
    });

    // Get newsletter subscribers count
    const { count: newsletterSubscribers } = await supabase
      .from('newsletter_subscribers')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    // Get active subscriptions count
    const { count: activeSubscriptions } = await supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    // Get recent signups (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { count: recentSignups } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo.toISOString());

    // Get total revenue (sum of paid payments)
    const { data: payments } = await supabase
      .from('payments')
      .select('amount')
      .eq('status', 'paid');

    const totalRevenue = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

    return NextResponse.json({
      stats: {
        totalUsers: totalUsers || 0,
        usersByTier,
        newsletterSubscribers: newsletterSubscribers || 0,
        activeSubscriptions: activeSubscriptions || 0,
        recentSignups: recentSignups || 0,
        totalRevenue,
      },
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
