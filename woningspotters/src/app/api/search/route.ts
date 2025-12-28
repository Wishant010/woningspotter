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

    // Check if Apify token is configured
    if (!process.env.APIFY_API_TOKEN) {
      console.log('No APIFY_API_TOKEN configured, returning mock data');
      return NextResponse.json<SearchResponse & { remaining: number; limit: number }>({
        success: true,
        data: getMockData(filters.locatie),
        totalResults: 6,
        remaining,
        limit,
      });
    }

    const woningen = await runWoningScraper(apifyInput);

    return NextResponse.json<SearchResponse & { remaining: number; limit: number }>({
      success: true,
      data: woningen,
      totalResults: woningen.length,
      remaining,
      limit,
    });
  } catch (error) {
    console.error('Search API error:', error);

    // Return mock data for development
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json<SearchResponse>({
        success: true,
        data: getMockData('Amsterdam'),
        totalResults: 6,
      });
    }

    return NextResponse.json<SearchResponse>(
      { success: false, error: 'Er is een fout opgetreden bij het zoeken' },
      { status: 500 }
    );
  }
}

function getMockData(location: string) {
  return [
    {
      id: '1',
      titel: 'Prachtig appartement in centrum',
      adres: 'Keizersgracht 123',
      postcode: '1015 CJ',
      plaats: location || 'Amsterdam',
      prijs: 425000,
      kamers: 3,
      oppervlakte: 85,
      foto: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=400&fit=crop',
      type: 'Appartement',
      url: 'https://funda.nl',
      makelaar: 'Makelaardij Amsterdam',
      energielabel: 'A',
    },
    {
      id: '2',
      titel: 'Ruime gezinswoning met tuin',
      adres: 'Willemstraat 45',
      postcode: '3511 RJ',
      plaats: location || 'Utrecht',
      prijs: 550000,
      kamers: 5,
      oppervlakte: 140,
      foto: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&h=400&fit=crop',
      type: 'Rijtjeshuis',
      url: 'https://funda.nl',
      makelaar: 'Makelaars Groep',
      energielabel: 'B',
    },
    {
      id: '3',
      titel: 'Moderne nieuwbouwwoning',
      adres: 'Parkweg 78',
      postcode: '5611 AH',
      plaats: location || 'Eindhoven',
      prijs: 389000,
      kamers: 4,
      oppervlakte: 110,
      foto: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=400&fit=crop',
      type: '2-onder-1-kap',
      url: 'https://funda.nl',
      makelaar: 'Vastgoed Plus',
      energielabel: 'A++',
    },
    {
      id: '4',
      titel: 'Karakteristiek herenhuis',
      adres: 'Oude Haven 12',
      postcode: '3011 GE',
      plaats: location || 'Rotterdam',
      prijs: 675000,
      kamers: 6,
      oppervlakte: 180,
      foto: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&h=400&fit=crop',
      type: 'Vrijstaand',
      url: 'https://funda.nl',
      makelaar: 'Rotterdam Huizen',
      energielabel: 'C',
    },
    {
      id: '5',
      titel: 'Luxe penthouse met uitzicht',
      adres: 'Skyline Tower 42',
      postcode: '1012 AB',
      plaats: location || 'Amsterdam',
      prijs: 895000,
      kamers: 4,
      oppervlakte: 150,
      foto: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&h=400&fit=crop',
      type: 'Penthouse',
      url: 'https://funda.nl',
      makelaar: 'Luxury Living',
      energielabel: 'A+',
    },
    {
      id: '6',
      titel: 'Gezellige studio in de stad',
      adres: 'Centrumplein 8',
      postcode: '2511 VJ',
      plaats: location || 'Den Haag',
      prijs: 189000,
      kamers: 1,
      oppervlakte: 35,
      foto: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&h=400&fit=crop',
      type: 'Studio',
      url: 'https://funda.nl',
      makelaar: 'City Makelaars',
      energielabel: 'B',
    },
  ];
}
