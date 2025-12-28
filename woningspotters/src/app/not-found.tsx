'use client';

import Link from 'next/link';
import { Home, Search, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 mx-auto mb-6 bg-[#FF7A00]/20 rounded-full flex items-center justify-center">
          <span className="text-5xl font-bold text-[#FF7A00]">404</span>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold mb-3">
          Pagina niet gevonden
        </h1>

        <p className="text-white/50 mb-8">
          De pagina die je zoekt bestaat niet of is verplaatst.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="px-6 py-3 btn-gradient rounded-xl font-medium inline-flex items-center justify-center gap-2"
          >
            <Search className="w-5 h-5" />
            Zoek woningen
          </Link>

          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl font-medium inline-flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Ga terug
          </button>
        </div>
      </div>
    </div>
  );
}
