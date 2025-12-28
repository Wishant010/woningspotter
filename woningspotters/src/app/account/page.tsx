'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PageTransition } from '../components/PageTransition';
import { useAuth } from '@/context/AuthContext';
import { useFavorites } from '@/context/FavoritesContext';
import {
  User,
  Mail,
  Crown,
  CreditCard,
  LogOut,
  Loader2,
  Search,
  Heart,
  Bell,
  ChevronRight,
  Zap,
  Rocket,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';

interface UserProfile {
  id: string;
  email: string;
  subscription_tier: 'free' | 'pro' | 'ultra';
  searches_today: number;
  last_search_date: string | null;
  created_at: string;
}

interface Subscription {
  id: string;
  plan: string;
  status: string;
  amount: number;
  current_period_end: string | null;
}

const tierInfo = {
  free: {
    name: 'Gratis',
    icon: Zap,
    color: 'text-white/70',
    bgColor: 'bg-white/10',
    searchLimit: 5,
  },
  pro: {
    name: 'Pro',
    icon: Crown,
    color: 'text-[#e94560]',
    bgColor: 'bg-[#e94560]/20',
    searchLimit: 30,
  },
  ultra: {
    name: 'Ultra',
    icon: Rocket,
    color: 'text-[#a855f7]',
    bgColor: 'bg-[#a855f7]/20',
    searchLimit: 100,
  },
};

export default function AccountPage() {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const { favorites } = useFavorites();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancellingSubscription, setCancellingSubscription] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/account');
      return;
    }

    if (user) {
      fetchProfile();
      fetchSubscription();
    }
  }, [user, authLoading, router]);

  const fetchProfile = async () => {
    const supabase = createClient();
    if (!supabase || !user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!error && data) {
      setProfile(data);
    }
    setLoading(false);
  };

  const fetchSubscription = async () => {
    const supabase = createClient();
    if (!supabase || !user) return;

    const { data } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (data) {
      setSubscription(data);
    }
  };

  const handleCancelSubscription = async () => {
    if (!user || !subscription) return;

    setCancellingSubscription(true);
    try {
      const response = await fetch('/api/mollie/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });

      if (response.ok) {
        setSubscription(null);
        setShowCancelConfirm(false);
        fetchProfile();
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
    } finally {
      setCancellingSubscription(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  if (authLoading || loading) {
    return (
      <PageTransition>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-12 h-12 relative">
            <div className="absolute inset-0 border-4 border-white/10 rounded-full" />
            <div className="absolute inset-0 border-4 border-transparent border-t-[#FF7A00] rounded-full animate-spin" />
          </div>
        </div>
      </PageTransition>
    );
  }

  if (!user || !profile) {
    return null;
  }

  const tier = tierInfo[profile.subscription_tier];
  const TierIcon = tier.icon;
  const searchesRemaining = tier.searchLimit - (profile.searches_today || 0);

  return (
    <PageTransition>
      <div className="px-4 md:px-6 py-8 md:py-12">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Account</h1>
            <p className="text-white/50">Beheer je account en abonnement</p>
          </div>

          {/* Profile Card */}
          <div className="glass rounded-2xl p-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FF7A00] to-[#FF9933] flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-semibold">{user.email}</h2>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${tier.bgColor} ${tier.color}`}>
                    {tier.name}
                  </span>
                </div>
                <p className="text-white/50 text-sm">
                  Lid sinds {new Date(profile.created_at).toLocaleDateString('nl-NL', {
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <div className="glass rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Search className="w-4 h-4 text-[#5BA3D0]" />
                <span className="text-sm text-white/50">Zoekopdrachten</span>
              </div>
              <p className="text-2xl font-bold">{searchesRemaining}</p>
              <p className="text-xs text-white/40">van {tier.searchLimit} vandaag</p>
            </div>

            <div className="glass rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-4 h-4 text-[#e94560]" />
                <span className="text-sm text-white/50">Favorieten</span>
              </div>
              <p className="text-2xl font-bold">{favorites.length}</p>
              <p className="text-xs text-white/40">opgeslagen</p>
            </div>

            <div className="glass rounded-xl p-4 col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-2">
                <TierIcon className={`w-4 h-4 ${tier.color}`} />
                <span className="text-sm text-white/50">Abonnement</span>
              </div>
              <p className="text-2xl font-bold">{tier.name}</p>
              {subscription && (
                <p className="text-xs text-white/40">
                  Verlengt op {new Date(subscription.current_period_end || '').toLocaleDateString('nl-NL')}
                </p>
              )}
            </div>
          </div>

          {/* Subscription Section */}
          <div className="glass rounded-2xl p-6 mb-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#FF7A00]" />
              Abonnement
            </h3>

            {profile.subscription_tier === 'free' ? (
              <div className="bg-white/5 rounded-xl p-4 mb-4">
                <p className="text-white/70 mb-3">
                  Upgrade naar Pro of Ultra voor meer zoekopdrachten, favorieten opslaan en email alerts.
                </p>
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-2 px-4 py-2 btn-gradient rounded-lg text-sm font-medium"
                >
                  Bekijk plannen <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                  <div>
                    <p className="font-medium">{tier.name} Plan</p>
                    <p className="text-sm text-white/50">
                      {subscription?.amount ? `€${subscription.amount}/maand` : 'Actief abonnement'}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                    Actief
                  </span>
                </div>

                {!showCancelConfirm ? (
                  <button
                    onClick={() => setShowCancelConfirm(true)}
                    className="text-sm text-white/50 hover:text-red-400 transition-colors"
                  >
                    Abonnement opzeggen
                  </button>
                ) : (
                  <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                    <div className="flex items-start gap-3 mb-3">
                      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-red-400 mb-1">Weet je het zeker?</p>
                        <p className="text-sm text-white/50">
                          Je behoudt toegang tot {tier.name} features tot het einde van je huidige periode.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleCancelSubscription}
                        disabled={cancellingSubscription}
                        className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm font-medium hover:bg-red-500/30 transition-colors disabled:opacity-50"
                      >
                        {cancellingSubscription ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          'Ja, opzeggen'
                        )}
                      </button>
                      <button
                        onClick={() => setShowCancelConfirm(false)}
                        className="px-4 py-2 bg-white/10 rounded-lg text-sm font-medium hover:bg-white/20 transition-colors"
                      >
                        Annuleren
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div className="glass rounded-2xl overflow-hidden mb-6">
            <Link
              href="/favorites"
              className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors border-b border-white/10"
            >
              <div className="flex items-center gap-3">
                <Heart className="w-5 h-5 text-[#e94560]" />
                <span>Mijn Favorieten</span>
              </div>
              <ChevronRight className="w-5 h-5 text-white/30" />
            </Link>
            <Link
              href="/alerts"
              className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors border-b border-white/10"
            >
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-[#a855f7]" />
                <span>Mijn Alerts</span>
              </div>
              <ChevronRight className="w-5 h-5 text-white/30" />
            </Link>
            <Link
              href="/pricing"
              className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors border-b border-white/10"
            >
              <div className="flex items-center gap-3">
                <Crown className="w-5 h-5 text-[#FF7A00]" />
                <span>Abonnementen</span>
              </div>
              <ChevronRight className="w-5 h-5 text-white/30" />
            </Link>
            <Link
              href="/contact"
              className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#5BA3D0]" />
                <span>Contact & Support</span>
              </div>
              <ChevronRight className="w-5 h-5 text-white/30" />
            </Link>
          </div>

          {/* Sign Out */}
          <button
            onClick={handleSignOut}
            className="w-full glass rounded-xl p-4 flex items-center justify-center gap-2 text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Uitloggen
          </button>
        </div>
      </div>
    </PageTransition>
  );
}
