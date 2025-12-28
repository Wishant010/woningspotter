'use client';

import { PageTransition } from '../components/PageTransition';
import { Heart, Home, ArrowRight, LogIn, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useFavorites } from '@/context/FavoritesContext';
import { WoningCard } from '../components/WoningCard';

export default function FavoritesPage() {
  const { user, loading: authLoading } = useAuth();
  const { favorites, loading: favoritesLoading, removeFavorite } = useFavorites();

  const loading = authLoading || favoritesLoading;

  // Loading state
  if (loading) {
    return (
      <PageTransition>
        <div className="min-h-[60vh] flex items-center justify-center px-4 py-8">
          <div className="w-12 h-12 relative">
            <div className="absolute inset-0 border-4 border-white/10 rounded-full" />
            <div className="absolute inset-0 border-4 border-transparent border-t-[#FF7A00] rounded-full animate-spin" />
          </div>
        </div>
      </PageTransition>
    );
  }

  // Not logged in state
  if (!user) {
    return (
      <PageTransition>
        <div className="min-h-[60vh] flex items-center justify-center px-4 md:px-6 py-8 md:py-12">
          <div className="text-center max-w-lg">
            {/* Icon */}
            <div className="w-24 h-24 md:w-28 md:h-28 mx-auto mb-6 md:mb-8 bg-white/5 rounded-full flex items-center justify-center">
              <Heart className="w-12 h-12 md:w-14 md:h-14 text-[#5BA3D0]" />
            </div>

            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">Log in om favorieten op te slaan</h1>

            <p className="text-white/50 text-base md:text-lg mb-8">
              Bewaar je favoriete woningen en bekijk ze later terug.
            </p>

            {/* Features */}
            <div className="glass rounded-2xl p-6 md:p-8 mb-8 text-left">
              <h3 className="font-medium text-base md:text-lg mb-4 flex items-center gap-2">
                <Home className="w-5 h-5 text-[#FF7A00]" />
                Met een Pro account kun je:
              </h3>
              <ul className="text-sm md:text-base text-white/50 space-y-3">
                <li>Je favoriete woningen opslaan</li>
                <li>Woningen snel terugvinden</li>
                <li>Email alerts ontvangen bij nieuwe woningen</li>
                <li>Tot 30 zoekopdrachten per dag uitvoeren</li>
              </ul>
            </div>

            <Link
              href="/login"
              className="inline-flex items-center gap-2.5 px-8 py-4 btn-gradient rounded-xl text-base md:text-lg font-medium hover:shadow-lg hover:shadow-[#FF7A00]/30 transition-shadow"
            >
              <LogIn className="w-5 h-5" />
              Inloggen of registreren
            </Link>
          </div>
        </div>
      </PageTransition>
    );
  }

  // Logged in - show favorites
  return (
    <PageTransition>
      <div className="px-4 md:px-6 py-8 md:py-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              <Heart className="inline-block w-8 h-8 mr-3 text-[#e94560]" />
              Mijn Favorieten
            </h1>
            <p className="text-white/50">
              {favorites.length === 0
                ? 'Je hebt nog geen favoriete woningen opgeslagen.'
                : `${favorites.length} ${favorites.length === 1 ? 'woning' : 'woningen'} opgeslagen`}
            </p>
          </div>

          {/* Empty state */}
          {favorites.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 bg-white/5 rounded-full flex items-center justify-center">
                <Heart className="w-12 h-12 text-[#5BA3D0]" />
              </div>
              <h2 className="text-xl font-semibold mb-3">Geen favorieten</h2>
              <p className="text-white/50 mb-8 max-w-md mx-auto">
                Zoek woningen en klik op het hartje om ze hier te bewaren.
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2.5 px-6 py-3 btn-gradient rounded-xl font-medium hover:shadow-lg hover:shadow-[#FF7A00]/30 transition-shadow"
              >
                Start met zoeken <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          ) : (
            /* Favorites grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {favorites.map((favorite, index) => (
                <WoningCard
                  key={favorite.id}
                  woning={favorite.property_data}
                  index={index}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
