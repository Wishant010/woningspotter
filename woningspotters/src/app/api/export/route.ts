import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { Woning } from '@/types';

// POST - Export search results to CSV/Excel
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Je moet ingelogd zijn om te exporteren' },
        { status: 401 }
      );
    }

    // Check if user has Ultra tier
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Kon gebruikersprofiel niet ophalen' },
        { status: 500 }
      );
    }

    if (profile.subscription_tier !== 'ultra') {
      return NextResponse.json(
        { error: 'Export is alleen beschikbaar voor Ultra gebruikers' },
        { status: 403 }
      );
    }

    const { results, format = 'csv' } = await request.json() as {
      results: Woning[];
      format?: 'csv' | 'excel';
    };

    if (!results || !Array.isArray(results) || results.length === 0) {
      return NextResponse.json(
        { error: 'Geen zoekresultaten om te exporteren' },
        { status: 400 }
      );
    }

    const csvContent = generateCSV(results);
    const headers = new Headers();
    const filename = `woningen-export-${new Date().toISOString().split('T')[0]}`;

    if (format === 'excel') {
      headers.set('Content-Type', 'text/csv; charset=utf-8');
      headers.set('Content-Disposition', `attachment; filename="${filename}.xls"`);
    } else {
      headers.set('Content-Type', 'text/csv; charset=utf-8');
      headers.set('Content-Disposition', `attachment; filename="${filename}.csv"`);
    }

    // Add BOM for Excel UTF-8 compatibility
    const bom = '\uFEFF';
    return new NextResponse(bom + csvContent, { headers });

  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Er is een fout opgetreden bij het exporteren' },
      { status: 500 }
    );
  }
}

function generateCSV(results: Woning[]): string {
  const headers = [
    'Titel',
    'Adres',
    'Postcode',
    'Plaats',
    'Prijs',
    'Kamers',
    'Oppervlakte (m2)',
    'Type',
    'Bouwjaar',
    'Energielabel',
    'Makelaar',
    'URL'
  ];

  const escapeCSV = (value: string | number | undefined): string => {
    if (value === undefined || value === null) return '';
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const formatPrice = (price: number): string => {
    return `EUR ${price.toLocaleString('nl-NL')}`;
  };

  const rows = results.map(woning => [
    escapeCSV(woning.titel),
    escapeCSV(woning.adres),
    escapeCSV(woning.postcode),
    escapeCSV(woning.plaats),
    escapeCSV(formatPrice(woning.prijs)),
    escapeCSV(woning.kamers),
    escapeCSV(woning.oppervlakte),
    escapeCSV(woning.type),
    escapeCSV(woning.bouwjaar),
    escapeCSV(woning.energielabel),
    escapeCSV(woning.makelaar),
    escapeCSV(woning.url)
  ].join(','));

  return [headers.join(','), ...rows].join('\n');
}
