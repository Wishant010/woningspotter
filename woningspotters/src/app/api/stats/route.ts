import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

export async function GET() {
  try {
    const supabase = createServerClient();

    // Get total users count
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // Get total searches count
    const { count: totalSearches } = await supabase
      .from('search_history')
      .select('*', { count: 'exact', head: true });

    // Get total news articles
    const { count: totalNews } = await supabase
      .from('news_articles')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({
      users: totalUsers || 0,
      searches: totalSearches || 0,
      news: totalNews || 0,
    });
  } catch (error) {
    console.error('Stats API error:', error);
    return NextResponse.json(
      { users: 0, searches: 0, news: 0 },
      { status: 500 }
    );
  }
}
