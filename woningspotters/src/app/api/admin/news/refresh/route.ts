import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { refreshNews } from '@/lib/news-fetcher';

// POST - Refresh news from external sources
export async function POST(request: NextRequest) {
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

    // Fetch and save news from sources
    const result = await refreshNews();

    if (!result.success) {
      return NextResponse.json(
        { error: 'Fout bij ophalen van nieuws' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${result.added} nieuwe artikelen toegevoegd, ${result.skipped} overgeslagen (duplicaten of errors)`,
      added: result.added,
      skipped: result.skipped,
      total: result.total,
    });
  } catch (error) {
    console.error('News refresh error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
