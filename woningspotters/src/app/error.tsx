'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 mx-auto mb-6 bg-red-500/20 rounded-full flex items-center justify-center">
          <AlertTriangle className="w-10 h-10 text-red-400" />
        </div>

        <h1 className="text-2xl md:text-3xl font-bold mb-3">
          Er ging iets mis
        </h1>

        <p className="text-white/50 mb-8">
          Er is een onverwachte fout opgetreden. Probeer het opnieuw of ga terug naar de homepage.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 btn-gradient rounded-xl font-medium inline-flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            Probeer opnieuw
          </button>

          <Link
            href="/"
            className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl font-medium inline-flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
          >
            <Home className="w-5 h-5" />
            Naar homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
