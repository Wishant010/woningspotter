'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PageTransition } from '../components/PageTransition';
import { useAuth } from '@/context/AuthContext';
import {
  Users,
  Crown,
  Rocket,
  Mail,
  CreditCard,
  TrendingUp,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Shield,
  Zap,
  Euro,
  UserPlus,
} from 'lucide-react';
import { createClient } from '@/lib/supabase';

interface Stats {
  totalUsers: number;
  usersByTier: {
    free: number;
    pro: number;
    ultra: number;
  };
  newsletterSubscribers: number;
  activeSubscriptions: number;
  recentSignups: number;
  totalRevenue: number;
}

interface User {
  id: string;
  email: string;
  subscription_tier: string;
  is_admin: boolean;
  created_at: string;
  searches_today: number;
}

interface NewsletterSubscriber {
  id: string;
  email: string;
  is_active: boolean;
  subscribed_at: string;
}

type TabType = 'overview' | 'users' | 'newsletter';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Stats
  const [stats, setStats] = useState<Stats | null>(null);

  // Users
  const [users, setUsers] = useState<User[]>([]);
  const [usersPage, setUsersPage] = useState(1);
  const [usersTotalPages, setUsersTotalPages] = useState(1);
  const [usersSearch, setUsersSearch] = useState('');
  const [usersLoading, setUsersLoading] = useState(false);

  // Newsletter
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [newsletterPage, setNewsletterPage] = useState(1);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/admin');
      return;
    }

    if (user) {
      checkAdminStatus();
    }
  }, [user, authLoading, router]);

  const checkAdminStatus = async () => {
    const supabase = createClient();
    if (!supabase || !user) return;

    const { data } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (data?.is_admin) {
      setIsAdmin(true);
      fetchStats();
    } else {
      router.push('/');
    }
    setLoading(false);
  };

  const fetchStats = async () => {
    if (!user) return;

    try {
      const response = await fetch('/api/admin/stats', {
        headers: { 'x-user-id': user.id },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchUsers = async (page = 1, search = '') => {
    if (!user) return;
    setUsersLoading(true);

    try {
      const response = await fetch(
        `/api/admin/users?page=${page}&limit=20&search=${encodeURIComponent(search)}`,
        { headers: { 'x-user-id': user.id } }
      );

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
        setUsersTotalPages(data.totalPages);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchNewsletter = async (page = 1) => {
    if (!user) return;

    try {
      const response = await fetch(`/api/admin/newsletter?page=${page}`, {
        headers: { 'x-user-id': user.id },
      });

      if (response.ok) {
        const data = await response.json();
        setSubscribers(data.subscribers);
      }
    } catch (error) {
      console.error('Error fetching newsletter:', error);
    }
  };

  const updateUserTier = async (userId: string, tier: string) => {
    if (!user) return;

    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify({ userId, subscriptionTier: tier }),
      });

      if (response.ok) {
        setUsers(prev =>
          prev.map(u => (u.id === userId ? { ...u, subscription_tier: tier } : u))
        );
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  useEffect(() => {
    if (activeTab === 'users' && users.length === 0) {
      fetchUsers(usersPage, usersSearch);
    } else if (activeTab === 'newsletter' && subscribers.length === 0) {
      fetchNewsletter(newsletterPage);
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'users') {
      const debounce = setTimeout(() => {
        fetchUsers(1, usersSearch);
        setUsersPage(1);
      }, 300);
      return () => clearTimeout(debounce);
    }
  }, [usersSearch]);

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

  if (!isAdmin) {
    return null;
  }

  return (
    <PageTransition>
      <div className="px-4 md:px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <Shield className="w-8 h-8 text-[#FF7A00]" />
              Admin Dashboard
            </h1>
            <p className="text-white/50">Beheer gebruikers, abonnementen en statistieken</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-8">
            {(['overview', 'users', 'newsletter'] as TabType[]).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-[#FF7A00] text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                {tab === 'overview' && 'Overzicht'}
                {tab === 'users' && 'Gebruikers'}
                {tab === 'newsletter' && 'Nieuwsbrief'}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && stats && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="glass rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-[#5BA3D0]" />
                    <span className="text-xs text-white/50">Totaal gebruikers</span>
                  </div>
                  <p className="text-2xl font-bold">{stats.totalUsers}</p>
                </div>

                <div className="glass rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-white/50" />
                    <span className="text-xs text-white/50">Free</span>
                  </div>
                  <p className="text-2xl font-bold">{stats.usersByTier.free}</p>
                </div>

                <div className="glass rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Crown className="w-4 h-4 text-[#e94560]" />
                    <span className="text-xs text-white/50">Pro</span>
                  </div>
                  <p className="text-2xl font-bold">{stats.usersByTier.pro}</p>
                </div>

                <div className="glass rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Rocket className="w-4 h-4 text-[#a855f7]" />
                    <span className="text-xs text-white/50">Ultra</span>
                  </div>
                  <p className="text-2xl font-bold">{stats.usersByTier.ultra}</p>
                </div>

                <div className="glass rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="w-4 h-4 text-[#FF7A00]" />
                    <span className="text-xs text-white/50">Nieuwsbrief</span>
                  </div>
                  <p className="text-2xl font-bold">{stats.newsletterSubscribers}</p>
                </div>

                <div className="glass rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Euro className="w-4 h-4 text-green-400" />
                    <span className="text-xs text-white/50">Omzet</span>
                  </div>
                  <p className="text-2xl font-bold">{stats.totalRevenue.toFixed(2)}</p>
                </div>
              </div>

              {/* Additional Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="glass rounded-xl p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-[#5BA3D0]" />
                    Actieve Abonnementen
                  </h3>
                  <p className="text-4xl font-bold">{stats.activeSubscriptions}</p>
                  <p className="text-sm text-white/50 mt-2">Betaalde abonnementen</p>
                </div>

                <div className="glass rounded-xl p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-green-400" />
                    Nieuwe Aanmeldingen
                  </h3>
                  <p className="text-4xl font-bold">{stats.recentSignups}</p>
                  <p className="text-sm text-white/50 mt-2">Afgelopen 7 dagen</p>
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <input
                  type="text"
                  value={usersSearch}
                  onChange={e => setUsersSearch(e.target.value)}
                  placeholder="Zoek op email..."
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-[#2B7CB3] focus:outline-none"
                />
              </div>

              {/* Users Table */}
              <div className="glass rounded-xl overflow-hidden">
                {usersLoading ? (
                  <div className="p-8 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-white/50" />
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-white/5">
                      <tr>
                        <th className="text-left p-4 text-sm font-medium text-white/50">Email</th>
                        <th className="text-left p-4 text-sm font-medium text-white/50">Tier</th>
                        <th className="text-left p-4 text-sm font-medium text-white/50">Zoek vandaag</th>
                        <th className="text-left p-4 text-sm font-medium text-white/50">Aangemeld</th>
                        <th className="text-left p-4 text-sm font-medium text-white/50">Acties</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u.id} className="border-t border-white/5">
                          <td className="p-4">
                            <span className="flex items-center gap-2">
                              {u.email}
                              {u.is_admin && (
                                <Shield className="w-4 h-4 text-[#FF7A00]" />
                              )}
                            </span>
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                u.subscription_tier === 'ultra'
                                  ? 'bg-[#a855f7]/20 text-[#a855f7]'
                                  : u.subscription_tier === 'pro'
                                  ? 'bg-[#e94560]/20 text-[#e94560]'
                                  : 'bg-white/10 text-white/50'
                              }`}
                            >
                              {u.subscription_tier}
                            </span>
                          </td>
                          <td className="p-4 text-white/70">{u.searches_today || 0}</td>
                          <td className="p-4 text-white/50 text-sm">
                            {new Date(u.created_at).toLocaleDateString('nl-NL')}
                          </td>
                          <td className="p-4">
                            <select
                              value={u.subscription_tier}
                              onChange={e => updateUserTier(u.id, e.target.value)}
                              className="px-2 py-1 bg-white/5 border border-white/10 rounded text-sm focus:outline-none"
                            >
                              <option value="free" className="bg-[#1a1a2e]">Free</option>
                              <option value="pro" className="bg-[#1a1a2e]">Pro</option>
                              <option value="ultra" className="bg-[#1a1a2e]">Ultra</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {/* Pagination */}
                <div className="flex items-center justify-between p-4 border-t border-white/5">
                  <button
                    onClick={() => {
                      const newPage = usersPage - 1;
                      setUsersPage(newPage);
                      fetchUsers(newPage, usersSearch);
                    }}
                    disabled={usersPage <= 1}
                    className="p-2 bg-white/10 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-sm text-white/50">
                    Pagina {usersPage} van {usersTotalPages}
                  </span>
                  <button
                    onClick={() => {
                      const newPage = usersPage + 1;
                      setUsersPage(newPage);
                      fetchUsers(newPage, usersSearch);
                    }}
                    disabled={usersPage >= usersTotalPages}
                    className="p-2 bg-white/10 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Newsletter Tab */}
          {activeTab === 'newsletter' && (
            <div className="glass rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium text-white/50">Email</th>
                    <th className="text-left p-4 text-sm font-medium text-white/50">Status</th>
                    <th className="text-left p-4 text-sm font-medium text-white/50">Aangemeld op</th>
                  </tr>
                </thead>
                <tbody>
                  {subscribers.map(s => (
                    <tr key={s.id} className="border-t border-white/5">
                      <td className="p-4">{s.email}</td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            s.is_active
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}
                        >
                          {s.is_active ? 'Actief' : 'Uitgeschreven'}
                        </span>
                      </td>
                      <td className="p-4 text-white/50 text-sm">
                        {new Date(s.subscribed_at).toLocaleDateString('nl-NL')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
