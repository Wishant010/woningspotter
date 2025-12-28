'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PageTransition } from '../components/PageTransition';
import { useAuth } from '@/context/AuthContext';
import { Lock, ArrowRight, Eye, EyeOff, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { updatePassword } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Wachtwoorden komen niet overeen');
      return;
    }

    if (password.length < 6) {
      setError('Wachtwoord moet minimaal 6 tekens bevatten');
      return;
    }

    setLoading(true);

    try {
      const { error } = await updatePassword(password);
      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push('/');
        }, 3000);
      }
    } catch (err) {
      setError('Er is iets misgegaan. Probeer het opnieuw.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <PageTransition>
        <div className="min-h-[60vh] flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-md text-center">
            <div className="glass rounded-2xl p-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-2">Wachtwoord gewijzigd!</h1>
              <p className="text-white/50 mb-4">
                Je wachtwoord is succesvol gewijzigd. Je wordt doorgestuurd naar de homepage...
              </p>
              <Link
                href="/"
                className="text-[#FF7A00] hover:underline"
              >
                Klik hier als je niet wordt doorgestuurd
              </Link>
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-[60vh] flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link href="/" className="flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center">
              <Image src="/logo.svg" alt="WoningSpotters" width={48} height={48} priority />
            </div>
            <span className="text-xl font-bold tracking-tight">WoningSpotters</span>
          </Link>

          {/* Card */}
          <div className="glass rounded-2xl p-8">
            <h1 className="text-2xl font-bold text-center mb-2">Nieuw wachtwoord instellen</h1>
            <p className="text-white/50 text-center text-sm mb-6">
              Kies een nieuw wachtwoord voor je account
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">
                  Nieuw wachtwoord
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full pl-10 pr-10 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:border-[#2B7CB3] focus:ring-1 focus:ring-[#2B7CB3] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">
                  Bevestig wachtwoord
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full pl-10 pr-10 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:border-[#2B7CB3] focus:ring-1 focus:ring-[#2B7CB3] transition-all"
                  />
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 btn-gradient rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Wachtwoord opslaan
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer */}
          <p className="text-center text-white/40 text-xs mt-6">
            <Link href="/login" className="text-[#FF7A00] hover:underline">
              Terug naar inloggen
            </Link>
          </p>
        </div>
      </div>
    </PageTransition>
  );
}
