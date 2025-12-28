import { NextRequest, NextResponse } from 'next/server';
import { runWoningScraper } from '@/lib/apify';
import { SearchFilters, SearchResponse, ApifyRunInput } from '@/types';
import { createServerClient } from '@/lib/supabase-server';
import { SEARCH_LIMITS } from '@/lib/mollie';

type SubscriptionTier = 'free' | 'pro' | 'ultra';

async function checkAndUpdateSearchLimit(userId: string | null): Promise<{ allowed: boolean; remaining: number; limit: number }> {
  const supabase = createServerClient();

  // If no user, use free tier limits
  if (!userId) {
    return { allowed: true, remaining: SEARCH_LIMITS.free, limit: SEARCH_LIMITS.free };
  }

  // Get user profile
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('subscription_tier, searches_today, last_search_date')
    .eq('id', userId)
    .single();

  if (error || !profile) {
    // Default to free tier if profile not found
    return { allowed: true, remaining: SEARCH_LIMITS.free, limit: SEARCH_LIMITS.free };
  }

  const tier = (profile.subscription_tier || 'free') as SubscriptionTier;
  const limit = SEARCH_LIMITS[tier];
  const today = new Date().toISOString().split('T')[0];
  const lastSearchDate = profile.last_search_date;

  // Reset count if it's a new day
  let searchesToday = profile.searches_today || 0;
  if (lastSearchDate !== today) {
    searchesToday = 0;
  }

  // Check if user has reached their limit
  if (searchesToday >= limit) {
    return { allowed: false, remaining: 0, limit };
  }

  // Update search count
  await supabase
    .from('profiles')
    .update({
      searches_today: searchesToday + 1,
      last_search_date: today,
    })
    .eq('id', userId);

  return { allowed: true, remaining: limit - searchesToday - 1, limit };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, ...filters } = body as SearchFilters & { userId?: string };

    if (!filters.locatie) {
      return NextResponse.json<SearchResponse>(
        { success: false, error: 'Locatie is verplicht' },
        { status: 400 }
      );
    }

    // Check if Apify token is configured
    if (!process.env.APIFY_API_TOKEN) {
      console.error('APIFY_API_TOKEN is not configured');
      return NextResponse.json<SearchResponse>(
        {
          success: false,
          error: 'Zoekopdracht kon niet worden uitgevoerd. Neem contact op met support.'
        },
        { status: 503 }
      );
    }

    // Check search limits
    const { allowed, remaining, limit } = await checkAndUpdateSearchLimit(userId || null);

    if (!allowed) {
      return NextResponse.json<SearchResponse & { limitReached: boolean; limit: number }>(
        {
          success: false,
          error: `Je hebt je dagelijkse zoeklimiet van ${limit} zoekopdrachten bereikt. Upgrade je abonnement voor meer zoekopdrachten.`,
          limitReached: true,
          limit,
        },
        { status: 429 }
      );
    }

    const apifyInput: ApifyRunInput = {
      location: filters.locatie,
      propertyType: filters.type,
      minPrice: filters.minPrijs ? parseInt(filters.minPrijs) : undefined,
      maxPrice: filters.maxPrijs ? parseInt(filters.maxPrijs) : undefined,
      minRooms: filters.kamers ? parseInt(filters.kamers.replace('+', '')) : undefined,
      houseType: filters.woningType || undefined,
    };

    const woningen = await runWoningScraper(apifyInput);

    if (woningen.length === 0) {
      return NextResponse.json<SearchResponse & { remaining: number; limit: number }>({
        success: true,
        data: [],
        totalResults: 0,
        remaining,
        limit,
      });
    }

    return NextResponse.json<SearchResponse & { remaining: number; limit: number }>({
      success: true,
      data: woningen,
      totalResults: woningen.length,
      remaining,
      limit,
    });
  } catch (error) {
    console.error('Search API error:', error);

    return NextResponse.json<SearchResponse>(
      {
        success: false,
        error: 'Er is een fout opgetreden bij het zoeken. Probeer het later opnieuw.'
      },
      { status: 500 }
    );
  }
}
