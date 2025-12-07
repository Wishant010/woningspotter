'use client';

import { PageTransition } from '../components/PageTransition';
import { Heart, Home, ArrowRight, LogIn } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function FavoritesPage() {
  const { user, loading } = useAuth();

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
                Met een account kun je:
              </h3>
              <ul className="text-sm md:text-base text-white/50 space-y-3">
                <li>Je favoriete woningen opslaan</li>
                <li>Nieuwsartikelen bewaren om later te lezen</li>
                <li>Woningen naast elkaar vergelijken</li>
                <li>Alerts ontvangen bij prijswijzigingen</li>
                <li>Je favorieten delen met anderen</li>
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

  // Logged in - empty favorites state
  return (
    <PageTransition>
      <div className="min-h-[60vh] flex items-center justify-center px-4 md:px-6 py-8 md:py-12">
        <div className="text-center max-w-lg">
          {/* Empty state */}
          <div className="w-24 h-24 md:w-28 md:h-28 mx-auto mb-6 md:mb-8 bg-white/5 rounded-full flex items-center justify-center">
            <Heart className="w-12 h-12 md:w-14 md:h-14 text-[#5BA3D0]" />
          </div>

          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">Geen favorieten</h1>

          <p className="text-white/50 text-base md:text-lg mb-8">
            Je hebt nog geen woningen opgeslagen. Zoek woningen en klik op het hartje om ze hier te bewaren.
          </p>

          {/* Feature preview */}
          <div className="glass rounded-2xl p-6 md:p-8 mb-8 text-left">
            <h3 className="font-medium text-base md:text-lg mb-4 flex items-center gap-2">
              <Home className="w-5 h-5 text-[#FF7A00]" />
              Binnenkort beschikbaar
            </h3>
            <ul className="text-sm md:text-base text-white/50 space-y-3">
              <li>Sla je favoriete woningen op</li>
              <li>Vergelijk woningen naast elkaar</li>
              <li>Ontvang alerts bij prijswijzigingen</li>
              <li>Deel je favorieten met anderen</li>
            </ul>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-2.5 px-8 py-4 btn-gradient rounded-xl text-base md:text-lg font-medium hover:shadow-lg hover:shadow-[#FF7A00]/30 transition-shadow"
          >
            Start met zoeken <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </PageTransition>
  );
}
