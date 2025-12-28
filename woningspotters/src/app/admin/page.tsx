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
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Shield,
  Zap,
  Euro,
  UserPlus,
  Newspaper,
  Plus,
  Trash2,
  RefreshCw,
  CheckCircle,
  X,
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

interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  category: string;
  source_url: string | null;
  image_url: string | null;
  is_featured: boolean;
  published_at: string;
}

type TabType = 'overview' | 'users' | 'newsletter' | 'nieuws';

const CATEGORIES = ['Marktanalyse', 'Nieuwbouw', 'Hypotheek', 'Regelgeving', 'Tips'] as const;

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

  // News
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [showAddNews, setShowAddNews] = useState(false);
  const [addingNews, setAddingNews] = useState(false);
  const [seedingNews, setSeedingNews] = useState(false);
  const [newsMessage, setNewsMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [newArticle, setNewArticle] = useState({
    title: '',
    summary: '',
    category: 'Marktanalyse' as typeof CATEGORIES[number],
    source_url: '',
    image_url: '',
    is_featured: false,
  });

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

  const fetchNews = async () => {
    if (!user) return;
    setNewsLoading(true);

    try {
      const response = await fetch('/api/admin/news', {
        headers: { 'x-user-id': user.id },
      });

      if (response.ok) {
        const data = await response.json();
        setNewsArticles(data.articles || []);
      }
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setNewsLoading(false);
    }
  };

  const addNewsArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setAddingNews(true);
    setNewsMessage(null);

    try {
      const response = await fetch('/api/admin/news', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify(newArticle),
      });

      const data = await response.json();

      if (response.ok) {
        setNewsMessage({ type: 'success', text: 'Artikel toegevoegd!' });
        setShowAddNews(false);
        setNewArticle({
          title: '',
          summary: '',
          category: 'Marktanalyse',
          source_url: '',
          image_url: '',
          is_featured: false,
        });
        fetchNews();
      } else {
        setNewsMessage({ type: 'error', text: data.error || 'Fout bij toevoegen' });
      }
    } catch (error) {
      console.error('Error adding news:', error);
      setNewsMessage({ type: 'error', text: 'Er ging iets mis' });
    } finally {
      setAddingNews(false);
    }
  };

  const deleteNewsArticle = async (articleId: string) => {
    if (!user || !confirm('Weet je zeker dat je dit artikel wilt verwijderen?')) return;

    try {
      const response = await fetch(`/api/admin/news?id=${articleId}`, {
        method: 'DELETE',
        headers: { 'x-user-id': user.id },
      });

      if (response.ok) {
        setNewsArticles(prev => prev.filter(a => a.id !== articleId));
        setNewsMessage({ type: 'success', text: 'Artikel verwijderd' });
      }
    } catch (error) {
      console.error('Error deleting news:', error);
      setNewsMessage({ type: 'error', text: 'Fout bij verwijderen' });
    }
  };

  const refreshNewsFromSources = async () => {
    if (!user) return;
    setSeedingNews(true);
    setNewsMessage(null);

    try {
      const response = await fetch('/api/admin/news/refresh', {
        method: 'POST',
        headers: {
          'x-user-id': user.id,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setNewsMessage({
          type: 'success',
          text: data.message || `${data.added} nieuwe artikelen opgehaald van NOS en andere bronnen`
        });
        fetchNews();
      } else {
        setNewsMessage({ type: 'error', text: data.error || 'Fout bij ophalen nieuws' });
      }
    } catch (error) {
      console.error('Error refreshing news:', error);
      setNewsMessage({ type: 'error', text: 'Er ging iets mis bij het ophalen van nieuws' });
    } finally {
      setSeedingNews(false);
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
    } else if (activeTab === 'nieuws' && newsArticles.length === 0) {
      fetchNews();
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
            <p className="text-white/50">Beheer gebruikers, abonnementen en nieuws</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-8 flex-wrap">
            {(['overview', 'users', 'newsletter', 'nieuws'] as TabType[]).map(tab => (
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
                {tab === 'nieuws' && 'Nieuws'}
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

          {/* News Tab */}
          {activeTab === 'nieuws' && (
            <div className="space-y-4">
              {/* Action Buttons */}
              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={() => setShowAddNews(true)}
                  className="flex items-center gap-2 px-4 py-2 btn-gradient rounded-lg font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Nieuw artikel
                </button>
                <button
                  onClick={refreshNewsFromSources}
                  disabled={seedingNews}
                  className="flex items-center gap-2 px-4 py-2 bg-[#FF7A00] hover:bg-[#FF7A00]/80 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {seedingNews ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  Nieuws ophalen (NOS, etc.)
                </button>
                <button
                  onClick={fetchNews}
                  disabled={newsLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {newsLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  Vernieuwen
                </button>
              </div>

              {/* Message */}
              {newsMessage && (
                <div
                  className={`flex items-center gap-2 p-3 rounded-lg ${
                    newsMessage.type === 'success'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}
                >
                  {newsMessage.type === 'success' ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <X className="w-4 h-4" />
                  )}
                  {newsMessage.text}
                </div>
              )}

              {/* Add News Modal */}
              {showAddNews && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
                  <div className="glass rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold flex items-center gap-2">
                        <Newspaper className="w-5 h-5 text-[#FF7A00]" />
                        Nieuw artikel
                      </h3>
                      <button
                        onClick={() => setShowAddNews(false)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form onSubmit={addNewsArticle} className="space-y-4">
                      <div>
                        <label className="block text-sm text-white/50 mb-1">Titel *</label>
                        <input
                          type="text"
                          value={newArticle.title}
                          onChange={e => setNewArticle(prev => ({ ...prev, title: e.target.value }))}
                          required
                          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-[#2B7CB3] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-white/50 mb-1">Samenvatting *</label>
                        <textarea
                          value={newArticle.summary}
                          onChange={e => setNewArticle(prev => ({ ...prev, summary: e.target.value }))}
                          required
                          rows={3}
                          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-[#2B7CB3] focus:outline-none resize-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-white/50 mb-1">Categorie *</label>
                        <select
                          value={newArticle.category}
                          onChange={e => setNewArticle(prev => ({ ...prev, category: e.target.value as typeof CATEGORIES[number] }))}
                          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-[#2B7CB3] focus:outline-none"
                        >
                          {CATEGORIES.map(cat => (
                            <option key={cat} value={cat} className="bg-[#1a1a2e]">
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm text-white/50 mb-1">Bron URL</label>
                        <input
                          type="url"
                          value={newArticle.source_url}
                          onChange={e => setNewArticle(prev => ({ ...prev, source_url: e.target.value }))}
                          placeholder="https://..."
                          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-[#2B7CB3] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-white/50 mb-1">Afbeelding URL</label>
                        <input
                          type="url"
                          value={newArticle.image_url}
                          onChange={e => setNewArticle(prev => ({ ...prev, image_url: e.target.value }))}
                          placeholder="https://..."
                          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-[#2B7CB3] focus:outline-none"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="is_featured"
                          checked={newArticle.is_featured}
                          onChange={e => setNewArticle(prev => ({ ...prev, is_featured: e.target.checked }))}
                          className="w-4 h-4"
                        />
                        <label htmlFor="is_featured" className="text-sm">Uitgelicht artikel</label>
                      </div>

                      <div className="flex gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setShowAddNews(false)}
                          className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg font-medium transition-colors"
                        >
                          Annuleren
                        </button>
                        <button
                          type="submit"
                          disabled={addingNews}
                          className="flex-1 px-4 py-2 btn-gradient rounded-lg font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {addingNews && <Loader2 className="w-4 h-4 animate-spin" />}
                          Toevoegen
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* News Articles Table */}
              <div className="glass rounded-xl overflow-hidden">
                {newsLoading ? (
                  <div className="p-8 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-white/50" />
                  </div>
                ) : newsArticles.length === 0 ? (
                  <div className="p-8 text-center text-white/50">
                    <Newspaper className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>Nog geen nieuwsartikelen</p>
                    <p className="text-sm mt-1">Klik op &quot;Nieuws ophalen&quot; om woningmarkt nieuws van NOS en andere bronnen op te halen</p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-white/5">
                      <tr>
                        <th className="text-left p-4 text-sm font-medium text-white/50">Titel</th>
                        <th className="text-left p-4 text-sm font-medium text-white/50">Categorie</th>
                        <th className="text-left p-4 text-sm font-medium text-white/50">Datum</th>
                        <th className="text-left p-4 text-sm font-medium text-white/50">Acties</th>
                      </tr>
                    </thead>
                    <tbody>
                      {newsArticles.map(article => (
                        <tr key={article.id} className="border-t border-white/5">
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              {article.is_featured && (
                                <span className="px-2 py-0.5 bg-[#FF7A00]/20 text-[#FF7A00] text-xs rounded-full">
                                  Uitgelicht
                                </span>
                              )}
                              <span className="line-clamp-1">{article.title}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="px-2 py-1 bg-white/10 rounded-full text-xs">
                              {article.category}
                            </span>
                          </td>
                          <td className="p-4 text-white/50 text-sm">
                            {new Date(article.published_at).toLocaleDateString('nl-NL')}
                          </td>
                          <td className="p-4">
                            <button
                              onClick={() => deleteNewsArticle(article.id)}
                              className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                              title="Verwijderen"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
