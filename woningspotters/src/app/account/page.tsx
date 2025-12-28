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
  Lock,
  Save,
  CheckCircle,
  Edit3,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
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
  const { user, loading: authLoading, signOut, updatePassword } = useAuth();
  const { favorites } = useFavorites();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancellingSubscription, setCancellingSubscription] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // Profile editing state
  const [editingProfile, setEditingProfile] = useState(false);
  const [fullName, setFullName] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Password change state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

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

  const handleSaveProfile = async () => {
    if (!user) return;
    setSavingProfile(true);
    setProfileError(null);
    setProfileSuccess(null);

    const supabase = createClient();
    if (!supabase) {
      setProfileError('Database niet beschikbaar');
      setSavingProfile(false);
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName, updated_at: new Date().toISOString() })
      .eq('id', user.id);

    if (error) {
      setProfileError('Fout bij opslaan');
    } else {
      setProfileSuccess('Profiel opgeslagen!');
      if (profile) {
        setProfile({ ...profile, full_name: fullName });
      }
      setEditingProfile(false);
      setTimeout(() => setProfileSuccess(null), 3000);
    }
    setSavingProfile(false);
  };

  const handleChangePassword = async () => {
    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword !== confirmPassword) {
      setPasswordError('Wachtwoorden komen niet overeen');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('Wachtwoord moet minimaal 6 tekens zijn');
      return;
    }

    setSavingPassword(true);

    const { error } = await updatePassword(newPassword);
    if (error) {
      setPasswordError(error.message);
    } else {
      setPasswordSuccess('Wachtwoord gewijzigd!');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordForm(false);
      setTimeout(() => setPasswordSuccess(null), 3000);
    }
    setSavingPassword(false);
  };

  const startEditingProfile = () => {
    setFullName(profile?.full_name || '');
    setEditingProfile(true);
    setProfileError(null);
    setProfileSuccess(null);
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
                {editingProfile ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Je naam"
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:border-[#5BA3D0] focus:outline-none"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveProfile}
                        disabled={savingProfile}
                        className="px-3 py-1.5 btn-gradient rounded-lg text-sm font-medium flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Opslaan
                      </button>
                      <button
                        onClick={() => setEditingProfile(false)}
                        className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors"
                      >
                        <X className="w-4 h-4" />
                        Annuleren
                      </button>
                    </div>
                    {profileError && (
                      <p className="text-red-400 text-sm flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" /> {profileError}
                      </p>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-xl font-semibold">
                        {profile.full_name || user.email}
                      </h2>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${tier.bgColor} ${tier.color}`}>
                        {tier.name}
                      </span>
                      <button
                        onClick={startEditingProfile}
                        className="p-1 hover:bg-white/10 rounded transition-colors"
                        title="Naam bewerken"
                      >
                        <Edit3 className="w-4 h-4 text-white/50 hover:text-white" />
                      </button>
                    </div>
                    {profile.full_name && (
                      <p className="text-white/70 text-sm mb-1">{user.email}</p>
                    )}
                    <p className="text-white/50 text-sm">
                      Lid sinds {new Date(profile.created_at).toLocaleDateString('nl-NL', {
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </>
                )}
                {profileSuccess && (
                  <p className="text-green-400 text-sm flex items-center gap-1 mt-2">
                    <CheckCircle className="w-4 h-4" /> {profileSuccess}
                  </p>
                )}
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

          {/* Password Section */}
          <div className="glass rounded-2xl p-6 mb-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-[#5BA3D0]" />
              Beveiliging
            </h3>

            {!showPasswordForm ? (
              <button
                onClick={() => setShowPasswordForm(true)}
                className="text-sm text-white/70 hover:text-white flex items-center gap-2 transition-colors"
              >
                <Edit3 className="w-4 h-4" />
                Wachtwoord wijzigen
              </button>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-white/50 mb-1.5">Nieuw wachtwoord</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimaal 6 tekens"
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:border-[#5BA3D0] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/50 mb-1.5">Bevestig wachtwoord</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Herhaal je wachtwoord"
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:border-[#5BA3D0] focus:outline-none"
                  />
                </div>
                {passwordError && (
                  <p className="text-red-400 text-sm flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> {passwordError}
                  </p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={handleChangePassword}
                    disabled={savingPassword || !newPassword || !confirmPassword}
                    className="px-4 py-2 btn-gradient rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-50"
                  >
                    {savingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Opslaan
                  </button>
                  <button
                    onClick={() => {
                      setShowPasswordForm(false);
                      setNewPassword('');
                      setConfirmPassword('');
                      setPasswordError(null);
                    }}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Annuleren
                  </button>
                </div>
              </div>
            )}
            {passwordSuccess && (
              <p className="text-green-400 text-sm flex items-center gap-1 mt-3">
                <CheckCircle className="w-4 h-4" /> {passwordSuccess}
              </p>
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
