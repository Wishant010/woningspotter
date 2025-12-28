import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

interface NewsArticleInput {
  title: string;
  summary: string;
  content?: string;
  category: 'Marktanalyse' | 'Nieuwbouw' | 'Hypotheek' | 'Regelgeving' | 'Tips';
  source_url?: string;
  image_url?: string;
  is_featured?: boolean;
  published_at?: string;
}

// GET - Get all news for admin (includes management data)
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

    const { data: articles, error } = await supabase
      .from('news_articles')
      .select('*')
      .order('published_at', { ascending: false });

    if (error) {
      console.error('Error fetching news:', error);
      return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
    }

    return NextResponse.json({ articles: articles || [] });
  } catch (error) {
    console.error('Admin news GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Add new news article
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

    const body = await request.json();

    // Handle single article or batch insert
    const articles: NewsArticleInput[] = Array.isArray(body.articles)
      ? body.articles
      : [body];

    // Validate articles
    for (const article of articles) {
      if (!article.title || !article.summary || !article.category) {
        return NextResponse.json(
          { error: 'Title, summary, and category are required for each article' },
          { status: 400 }
        );
      }
    }

    const articlesToInsert = articles.map(article => ({
      title: article.title,
      summary: article.summary,
      content: article.content || null,
      category: article.category,
      source_url: article.source_url || null,
      image_url: article.image_url || null,
      is_featured: article.is_featured || false,
      published_at: article.published_at || new Date().toISOString(),
    }));

    const { data: insertedArticles, error } = await supabase
      .from('news_articles')
      .insert(articlesToInsert)
      .select();

    if (error) {
      console.error('Error inserting news:', error);
      return NextResponse.json({ error: 'Failed to add news articles' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `${insertedArticles?.length || 0} article(s) added`,
      articles: insertedArticles,
    });
  } catch (error) {
    console.error('Admin news POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete a news article
export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const articleId = searchParams.get('id');

    if (!articleId) {
      return NextResponse.json({ error: 'Article ID required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('news_articles')
      .delete()
      .eq('id', articleId);

    if (error) {
      console.error('Error deleting news:', error);
      return NextResponse.json({ error: 'Failed to delete article' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Article deleted' });
  } catch (error) {
    console.error('Admin news DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
