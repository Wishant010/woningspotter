import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content: string | null;
  category: string;
  source_url: string | null;
  image_url: string | null;
  is_featured: boolean;
  published_at: string;
  created_at: string;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('news_articles')
      .select('*')
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (category && category !== 'Alle') {
      query = query.eq('category', category);
    }

    const { data: articles, error, count } = await query;

    if (error) {
      console.error('Error fetching news:', error);
      return NextResponse.json(
        { error: 'Er is een fout opgetreden bij het ophalen van nieuws' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      articles: articles || [],
      total: count || articles?.length || 0,
    });
  } catch (error) {
    console.error('News API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
