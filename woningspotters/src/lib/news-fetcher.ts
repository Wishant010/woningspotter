import { createServerClient } from './supabase-server';

interface RSSItem {
  title: string;
  description: string;
  link: string;
  pubDate: string;
  category?: string;
}

interface NewsArticle {
  title: string;
  summary: string;
  content: string | null;
  category: 'Marktanalyse' | 'Nieuwbouw' | 'Hypotheek' | 'Regelgeving' | 'Tips';
  source_url: string;
  image_url: string | null;
  is_featured: boolean;
  published_at: string;
}

// Primary keywords - these MUST appear for an article to be included
const PRIMARY_HOUSING_KEYWORDS = [
  'woning', 'woningen', 'woningmarkt', 'woningbouw', 'woningnood', 'woningtekort', 'wooncrisis',
  'huis', 'huizen', 'huizenprijs', 'huizenprijzen', 'huizenmarkt',
  'hypotheek', 'hypotheken', 'hypotheekrente',
  'koopwoning', 'koopwoningen', 'huurwoning', 'huurwoningen',
  'koophuis', 'huurhuis',
  'makelaar', 'makelaars', 'nvm', 'funda',
  'nieuwbouw', 'nieuwbouwwoning', 'nieuwbouwwoningen',
  'appartement', 'appartementen',
  'vastgoed', 'vastgoedmarkt',
  'starterswoning', 'starterswoningen',
  'koopmarkt', 'huurmarkt',
  'woningcorporatie', 'woningcorporaties',
  'bouwproject', 'bouwprojecten',
  'overdrachtsbelasting',
  'huurtoeslag',
  'sociale huur', 'vrije sector',
  'woz-waarde', 'woz waarde',
  'energielabel',
  'nhg', 'nationale hypotheek garantie',
];

// Secondary keywords - boost relevance if combined with housing context
const SECONDARY_HOUSING_KEYWORDS = [
  'kopen', 'verkopen', 'verhuren', 'huren',
  'starter', 'starters', 'doorstromer', 'doorstromers',
  'bouwvergunning', 'bouwvergunningen',
  'isolatie', 'verduurzaming', 'verduurzamen',
  'rente', 'rentetarief',
  'bouwen', 'verbouwen',
  'verhuizen',
];

// Exclusion keywords - if these appear WITHOUT housing context, skip
const EXCLUSION_KEYWORDS = [
  'beurs', 'aandelen', 'crypto', 'bitcoin',
  'auto', 'vliegtuig', 'trein',
  'restaurant', 'hotel',
  'voetbal', 'sport', 'wedstrijd',
  'oorlog', 'militair',
  'film', 'muziek', 'concert',
];

// Determine article category based on content
function categorizeArticle(title: string, description: string): NewsArticle['category'] {
  const text = `${title} ${description}`.toLowerCase();

  if (text.includes('hypotheek') || text.includes('rente') || text.includes('lening') || text.includes('nhg')) {
    return 'Hypotheek';
  }
  if (text.includes('nieuwbouw') || text.includes('bouw') || text.includes('woningbouw') || text.includes('project')) {
    return 'Nieuwbouw';
  }
  if (text.includes('wet') || text.includes('regel') || text.includes('belasting') || text.includes('subsidie') || text.includes('overheid') || text.includes('minister')) {
    return 'Regelgeving';
  }
  if (text.includes('tip') || text.includes('advies') || text.includes('hoe') || text.includes('stappenplan')) {
    return 'Tips';
  }
  return 'Marktanalyse';
}

// Check if article is housing-related with strict filtering
function isHousingRelated(title: string, description: string): boolean {
  const text = `${title} ${description}`.toLowerCase();

  // Must have at least one primary housing keyword
  const hasPrimaryKeyword = PRIMARY_HOUSING_KEYWORDS.some(keyword => text.includes(keyword));

  if (!hasPrimaryKeyword) {
    // Check if it has secondary keywords - these alone are not enough
    // but combined with other housing context might be relevant
    const hasSecondaryKeyword = SECONDARY_HOUSING_KEYWORDS.some(keyword => text.includes(keyword));

    // If no primary and only secondary, it's probably not housing-specific enough
    if (!hasSecondaryKeyword) {
      return false;
    }

    // Has secondary but no primary - check if it's really about housing
    // by requiring at least 2 secondary keywords
    const secondaryCount = SECONDARY_HOUSING_KEYWORDS.filter(keyword => text.includes(keyword)).length;
    if (secondaryCount < 2) {
      return false;
    }
  }

  // Check for exclusion keywords - if present without strong housing context, skip
  const hasExclusionKeyword = EXCLUSION_KEYWORDS.some(keyword => text.includes(keyword));

  if (hasExclusionKeyword) {
    // Count how many primary housing keywords are present
    const primaryCount = PRIMARY_HOUSING_KEYWORDS.filter(keyword => text.includes(keyword)).length;

    // If exclusion keyword is present but only 1 primary keyword, likely not housing-focused
    if (primaryCount < 2) {
      return false;
    }
  }

  return true;
}

// Parse RSS XML to items
function parseRSS(xml: string): RSSItem[] {
  const items: RSSItem[] = [];

  // Simple regex-based parsing for RSS items
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];

    const getTagContent = (tag: string): string => {
      const tagRegex = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`);
      const tagMatch = itemXml.match(tagRegex);
      if (tagMatch) {
        return (tagMatch[1] || tagMatch[2] || '').trim();
      }
      return '';
    };

    const title = getTagContent('title');
    const description = getTagContent('description');
    const link = getTagContent('link');
    const pubDate = getTagContent('pubDate');

    if (title && link) {
      items.push({
        title: decodeHTMLEntities(title),
        description: decodeHTMLEntities(stripHtml(description)),
        link,
        pubDate,
      });
    }
  }

  return items;
}

// Decode HTML entities
function decodeHTMLEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

// Strip HTML tags
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

// Fetch RSS feed
async function fetchRSSFeed(url: string): Promise<RSSItem[]> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'WoningSpotters/1.0 News Aggregator',
      },
    });

    if (!response.ok) {
      console.error(`Failed to fetch RSS from ${url}: ${response.status}`);
      return [];
    }

    const xml = await response.text();
    return parseRSS(xml);
  } catch (error) {
    console.error(`Error fetching RSS from ${url}:`, error);
    return [];
  }
}

// RSS sources for Dutch housing news
const RSS_SOURCES = [
  {
    url: 'https://feeds.nos.nl/nosnieuwseconomie',
    name: 'NOS Economie',
    filterForHousing: true,
  },
  {
    url: 'https://feeds.nos.nl/nosnieuwsbinnenland',
    name: 'NOS Binnenland',
    filterForHousing: true,
  },
];

// Fetch news from all sources
export async function fetchNewsFromSources(): Promise<NewsArticle[]> {
  const allArticles: NewsArticle[] = [];

  for (const source of RSS_SOURCES) {
    console.log(`Fetching news from ${source.name}...`);
    const items = await fetchRSSFeed(source.url);

    for (const item of items) {
      // Skip non-housing articles if filtering is enabled
      if (source.filterForHousing && !isHousingRelated(item.title, item.description)) {
        continue;
      }

      const article: NewsArticle = {
        title: item.title,
        summary: item.description.slice(0, 500) || item.title,
        content: null,
        category: categorizeArticle(item.title, item.description),
        source_url: item.link,
        image_url: null, // Could extract from content if available
        is_featured: false,
        published_at: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
      };

      allArticles.push(article);
    }
  }

  // Sort by published date (newest first)
  allArticles.sort((a, b) =>
    new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
  );

  // Mark the newest article as featured
  if (allArticles.length > 0) {
    allArticles[0].is_featured = true;
  }

  return allArticles;
}

// Save articles to database (avoiding duplicates)
export async function saveNewsToDatabase(articles: NewsArticle[]): Promise<{ added: number; skipped: number }> {
  const supabase = createServerClient();
  let added = 0;
  let skipped = 0;

  for (const article of articles) {
    // Check if article already exists (by source_url)
    const { data: existing } = await supabase
      .from('news_articles')
      .select('id')
      .eq('source_url', article.source_url)
      .single();

    if (existing) {
      skipped++;
      continue;
    }

    // Insert new article
    const { error } = await supabase
      .from('news_articles')
      .insert({
        title: article.title,
        summary: article.summary,
        content: article.content,
        category: article.category,
        source_url: article.source_url,
        image_url: article.image_url,
        is_featured: article.is_featured,
        published_at: article.published_at,
      });

    if (error) {
      console.error('Error inserting article:', error);
      skipped++;
    } else {
      added++;
    }
  }

  return { added, skipped };
}

// Main function to refresh news
export async function refreshNews(): Promise<{ success: boolean; added: number; skipped: number; total: number }> {
  try {
    // Fetch from all sources
    const articles = await fetchNewsFromSources();
    console.log(`Fetched ${articles.length} housing-related articles`);

    if (articles.length === 0) {
      return { success: true, added: 0, skipped: 0, total: 0 };
    }

    // Save to database
    const { added, skipped } = await saveNewsToDatabase(articles);

    // Update featured status - only latest should be featured
    const supabase = createServerClient();

    // First, remove all featured flags
    await supabase
      .from('news_articles')
      .update({ is_featured: false })
      .eq('is_featured', true);

    // Set the newest article as featured
    const { data: newest } = await supabase
      .from('news_articles')
      .select('id')
      .order('published_at', { ascending: false })
      .limit(1)
      .single();

    if (newest) {
      await supabase
        .from('news_articles')
        .update({ is_featured: true })
        .eq('id', newest.id);
    }

    return { success: true, added, skipped, total: articles.length };
  } catch (error) {
    console.error('Error refreshing news:', error);
    return { success: false, added: 0, skipped: 0, total: 0 };
  }
}
