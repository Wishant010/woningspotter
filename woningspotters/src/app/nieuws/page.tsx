'use client';

import { useState, useEffect } from 'react';
import { PageTransition } from '../components/PageTransition';
import { Calendar, Clock, ArrowRight, TrendingUp, Home, Gavel, Building2, Landmark, CheckCircle, Loader2, Mail, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface NewsArticle {
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

const categoryIcons: Record<string, React.ElementType> = {
  'Marktanalyse': TrendingUp,
  'Nieuwbouw': Building2,
  'Hypotheek': Landmark,
  'Regelgeving': Gavel,
  'Tips': Home,
};

const categories = [
  { name: 'Alle', value: 'all' },
  { name: 'Marktanalyse', value: 'Marktanalyse' },
  { name: 'Regelgeving', value: 'Regelgeving' },
  { name: 'Nieuwbouw', value: 'Nieuwbouw' },
  { name: 'Hypotheek', value: 'Hypotheek' },
  { name: 'Tips', value: 'Tips' },
];

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const day = date.getDate();
  const months = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

function estimateReadTime(summary: string, content: string | null): string {
  const text = summary + (content || '');
  const wordCount = text.split(/\s+/).length;
  const minutes = Math.max(2, Math.ceil(wordCount / 200));
  return `${minutes} min`;
}

function getSourceName(url: string | null): string | null {
  if (!url) return null;
  try {
    const hostname = new URL(url).hostname.replace('www.', '');
    const sourceMap: Record<string, string> = {
      'nos.nl': 'NOS',
      'nvm.nl': 'NVM',
      'funda.nl': 'Funda',
      'rabobank.nl': 'Rabobank',
      'rtlnieuws.nl': 'RTL Nieuws',
      'nu.nl': 'NU.nl',
      'ad.nl': 'AD',
      'telegraaf.nl': 'De Telegraaf',
      'volkskrant.nl': 'De Volkskrant',
      'parool.nl': 'Het Parool',
    };
    return sourceMap[hostname] || hostname;
  } catch {
    return null;
  }
}

export default function NieuwsPage() {
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchNews() {
      try {
        setIsLoading(true);
        setFetchError(null);
        const response = await fetch('/api/news');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Fout bij ophalen nieuws');
        }

        setNewsArticles(data.articles || []);
      } catch (err) {
        console.error('Error fetching news:', err);
        setFetchError(err instanceof Error ? err.message : 'Er ging iets mis');
      } finally {
        setIsLoading(false);
      }
    }

    fetchNews();
  }, []);

  // Filter articles based on selected category
  const filteredArticles = selectedCategory === 'all'
    ? newsArticles
    : newsArticles.filter((a) => a.category === selectedCategory);

  const featuredArticle = filteredArticles.find((a) => a.is_featured);
  const regularArticles = filteredArticles.filter((a) => !a.is_featured);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Er ging iets mis. Probeer het opnieuw.');
      } else {
        setIsSubscribed(true);
        setEmail('');
      }
    } catch {
      setError('Er ging iets mis. Probeer het opnieuw.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const defaultImage = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=500&fit=crop';

  return (
    <PageTransition>
      <div className="px-4 md:px-6 py-8 md:py-12 pb-16">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10 md:mb-14">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold gradient-text mb-4">
              Nieuws
            </h1>
            <p className="text-white/50 text-base md:text-lg lg:text-xl max-w-2xl mx-auto">
              Het laatste nieuws over de woningmarkt, regelgeving en trends
            </p>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2 md:gap-3 justify-center mb-10 md:mb-12">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-5 py-2.5 md:px-6 md:py-3 rounded-xl text-sm md:text-base font-medium transition-all ${
                  selectedCategory === cat.value
                    ? 'btn-gradient'
                    : 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-[#FF7A00] animate-spin mb-4" />
              <p className="text-white/50">Nieuws laden...</p>
            </div>
          )}

          {/* Error State */}
          {fetchError && !isLoading && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
              <p className="text-white/70 mb-2">Er ging iets mis</p>
              <p className="text-white/40 text-sm">{fetchError}</p>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !fetchError && filteredArticles.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 mb-4 bg-white/10 rounded-full flex items-center justify-center">
                <Mail className="w-8 h-8 text-white/40" />
              </div>
              <p className="text-white/70 mb-2">Geen nieuws gevonden</p>
              <p className="text-white/40 text-sm">
                {selectedCategory === 'all'
                  ? 'Er zijn nog geen nieuwsartikelen beschikbaar.'
                  : 'Geen artikelen in deze categorie.'}
              </p>
            </div>
          )}

          {/* Featured Article */}
          {!isLoading && !fetchError && featuredArticle && (
            <div className="mb-10">
              <a
                href={featuredArticle.source_url || '#'}
                target={featuredArticle.source_url ? '_blank' : undefined}
                rel="noopener noreferrer"
                className="block"
              >
                <div className="glass rounded-2xl overflow-hidden group cursor-pointer hover:bg-white/10 transition-all">
                  <div className="grid grid-cols-1 md:grid-cols-2">
                    <div className="relative h-64 md:h-auto overflow-hidden">
                      <img
                        src={featuredArticle.image_url || defaultImage}
                        alt={featuredArticle.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = defaultImage;
                        }}
                      />
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 bg-[#FF7A00] rounded-full text-xs font-semibold">
                          Uitgelicht
                        </span>
                      </div>
                    </div>
                    <div className="p-6 md:p-8 flex flex-col justify-center">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="flex items-center gap-1.5 text-[#FF7A00] text-sm font-medium">
                          {categoryIcons[featuredArticle.category] && (
                            (() => {
                              const Icon = categoryIcons[featuredArticle.category];
                              return <Icon className="w-4 h-4" />;
                            })()
                          )}
                          {featuredArticle.category}
                        </span>
                        <span className="text-white/30">•</span>
                        <span className="flex items-center gap-1 text-white/50 text-sm">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(featuredArticle.published_at)}
                        </span>
                      </div>
                      <h2 className="text-2xl font-bold mb-3 group-hover:text-[#FF7A00] transition-colors">
                        {featuredArticle.title}
                      </h2>
                      <p className="text-white/60 mb-4 line-clamp-3">
                        {featuredArticle.summary}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-sm">
                          <span className="flex items-center gap-1 text-white/40">
                            <Clock className="w-3.5 h-3.5" />
                            {estimateReadTime(featuredArticle.summary, featuredArticle.content)} leestijd
                          </span>
                          {getSourceName(featuredArticle.source_url) && (
                            <span className="text-[#FF7A00] font-medium">
                              Bron: {getSourceName(featuredArticle.source_url)}
                            </span>
                          )}
                        </div>
                        <span className="flex items-center gap-1 text-[#FF7A00] text-sm font-medium group-hover:gap-2 transition-all">
                          Lees artikel <ArrowRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </a>
            </div>
          )}

          {/* Articles Grid */}
          {!isLoading && !fetchError && regularArticles.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularArticles.map((article) => {
                const Icon = categoryIcons[article.category] || TrendingUp;
                return (
                  <a
                    key={article.id}
                    href={article.source_url || '#'}
                    target={article.source_url ? '_blank' : undefined}
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <article className="glass rounded-xl overflow-hidden group cursor-pointer hover:bg-white/10 transition-all h-full">
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={article.image_url || defaultImage}
                          alt={article.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = defaultImage;
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <div className="absolute bottom-3 left-3">
                          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-black/50 backdrop-blur-sm rounded-full text-xs font-medium">
                            <Icon className="w-3.5 h-3.5 text-[#FF7A00]" />
                            {article.category}
                          </span>
                        </div>
                      </div>
                      <div className="p-5">
                        <div className="flex items-center gap-3 mb-2 text-xs text-white/50">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(article.published_at)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {estimateReadTime(article.summary, article.content)}
                          </span>
                          {getSourceName(article.source_url) && (
                            <span className="text-[#FF7A00]">
                              {getSourceName(article.source_url)}
                            </span>
                          )}
                        </div>
                        <h3 className="font-semibold mb-2 line-clamp-2 group-hover:text-[#FF7A00] transition-colors">
                          {article.title}
                        </h3>
                        <p className="text-white/50 text-sm line-clamp-2 mb-3">
                          {article.summary}
                        </p>
                        <span className="flex items-center gap-1 text-[#FF7A00] text-sm font-medium group-hover:gap-2 transition-all">
                          Lees artikel <ArrowRight className="w-4 h-4" />
                        </span>
                      </div>
                    </article>
                  </a>
                );
              })}
            </div>
          )}

          {/* Newsletter Signup */}
          <div className="mt-16 glass rounded-2xl p-8 text-center">
            {isSubscribed ? (
              <>
                <div className="w-16 h-16 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">Je bent aangemeld!</h3>
                <p className="text-white/50 mb-4 max-w-md mx-auto">
                  Bedankt voor je aanmelding. Je ontvangt binnenkort het laatste nieuws over de woningmarkt in je inbox.
                </p>
                <div className="flex items-center justify-center gap-2 text-white/40 text-sm">
                  <Mail className="w-4 h-4" />
                  <span>Check je inbox voor een bevestiging</span>
                </div>
                <div className="mt-6">
                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 px-5 py-2.5 btn-gradient rounded-xl font-medium text-sm hover:shadow-lg hover:shadow-[#FF7A00]/30 transition-all"
                  >
                    Ga naar woningen zoeken <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </>
            ) : (
              <>
                <div className="w-12 h-12 mx-auto mb-4 btn-gradient rounded-xl flex items-center justify-center">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">Blijf op de hoogte</h3>
                <p className="text-white/50 mb-6 max-w-md mx-auto">
                  Ontvang wekelijks het laatste nieuws over de woningmarkt in je inbox, plus een directe link naar onze site.
                </p>
                <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Je e-mailadres"
                    required
                    className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm placeholder:text-white/40 focus:border-[#2B7CB3] focus:outline-none transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-3 btn-gradient rounded-xl font-medium whitespace-nowrap flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-[#FF7A00]/30 transition-all"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Aanmelden...
                      </>
                    ) : (
                      'Aanmelden'
                    )}
                  </button>
                </form>
                {error && (
                  <p className="mt-3 text-red-400 text-sm">{error}</p>
                )}
                <p className="mt-4 text-white/30 text-xs">
                  Je kunt je op elk moment uitschrijven. We delen je gegevens niet met derden.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
