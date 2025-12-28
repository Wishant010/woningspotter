'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageTransition } from '../components/PageTransition';
import { useAuth } from '@/context/AuthContext';
import { Mail, Lock, ArrowRight, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

type ViewMode = 'login' | 'register' | 'forgot';

export default function LoginPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const { signIn, signUp, resetPassword } = useAuth();
  const router = useRouter();

  const isLogin = viewMode === 'login';
  const isForgot = viewMode === 'forgot';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (isForgot) {
        const { error } = await resetPassword(email);
        if (error) {
          setError(error.message);
        } else {
          setSuccess('Check je email voor de reset link!');
        }
      } else if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          setError(error.message);
        } else {
          router.push('/');
        }
      } else {
        const { error } = await signUp(email, password);
        if (error) {
          setError(error.message);
        } else {
          setSuccess('Account aangemaakt! Log nu in met je gegevens.');
          setPassword('');
          setViewMode('login');
        }
      }
    } catch (err) {
      setError('Er is iets misgegaan. Probeer het opnieuw.');
    } finally {
      setLoading(false);
    }
  };

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
            {isForgot ? (
              <>
                <button
                  type="button"
                  onClick={() => { setViewMode('login'); setError(null); setSuccess(null); }}
                  className="flex items-center gap-2 text-white/60 hover:text-white text-sm mb-4 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Terug naar inloggen
                </button>
                <h1 className="text-2xl font-bold text-center mb-2">Wachtwoord vergeten?</h1>
                <p className="text-white/50 text-center text-sm mb-6">
                  Vul je email in en we sturen je een reset link
                </p>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-center mb-2">
                  {isLogin ? 'Welkom terug' : 'Account aanmaken'}
                </h1>
                <p className="text-white/50 text-center text-sm mb-6">
                  {isLogin
                    ? 'Log in om je favorieten te bekijken'
                    : 'Maak een gratis account aan'}
                </p>

                {/* Toggle */}
                <div className="flex bg-white/5 rounded-lg p-1 mb-6">
                  <button
                    type="button"
                    onClick={() => { setViewMode('login'); setError(null); setSuccess(null); }}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                      isLogin ? 'bg-[#FF7A00] text-white' : 'text-white/60 hover:text-white'
                    }`}
                  >
                    Inloggen
                  </button>
                  <button
                    type="button"
                    onClick={() => { setViewMode('register'); setError(null); setSuccess(null); }}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                      viewMode === 'register' ? 'bg-[#FF7A00] text-white' : 'text-white/60 hover:text-white'
                    }`}
                  >
                    Registreren
                  </button>
                </div>
              </>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="naam@voorbeeld.nl"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:border-[#2B7CB3] focus:ring-1 focus:ring-[#2B7CB3] transition-all"
                  />
                </div>
              </div>

              {/* Password - hide in forgot mode */}
              {!isForgot && (
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1.5">
                    Wachtwoord
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
                  {isLogin && (
                    <button
                      type="button"
                      onClick={() => { setViewMode('forgot'); setError(null); setSuccess(null); }}
                      className="text-sm text-[#FF7A00] hover:underline mt-2"
                    >
                      Wachtwoord vergeten?
                    </button>
                  )}
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}

              {/* Success */}
              {success && (
                <div className="p-3 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 text-sm">
                  {success}
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
                    {isForgot ? 'Verstuur reset link' : isLogin ? 'Inloggen' : 'Account aanmaken'}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer */}
          <p className="text-center text-white/40 text-xs mt-6">
            Door in te loggen ga je akkoord met onze voorwaarden
          </p>
        </div>
      </div>
    </PageTransition>
  );
}
