'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PageTransition } from '../components/PageTransition';
import { useAuth } from '@/context/AuthContext';
import {
  Bell,
  Plus,
  Trash2,
  MapPin,
  Home,
  Euro,
  BedDouble,
  Loader2,
  Crown,
  ToggleLeft,
  ToggleRight,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import { SearchFilters } from '@/types';

interface Alert {
  id: string;
  name: string;
  search_criteria: SearchFilters;
  is_active: boolean;
  last_results_count: number;
  created_at: string;
}

const woningTypeLabels: Record<string, string> = {
  appartement: 'Appartement',
  rijtjeshuis: 'Rijtjeshuis',
  vrijstaand: 'Vrijstaand',
  'twee-onder-een-kap': '2-onder-1-kap',
  penthouse: 'Penthouse',
  studio: 'Studio',
};

export default function AlertsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscriptionTier, setSubscriptionTier] = useState<string>('free');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newAlert, setNewAlert] = useState({
    name: '',
    locatie: '',
    type: 'koop' as 'koop' | 'huur',
    minPrijs: '',
    maxPrijs: '',
    kamers: '',
    woningType: '' as SearchFilters['woningType'],
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/alerts');
      return;
    }

    if (user) {
      fetchSubscriptionTier();
      fetchAlerts();
    }
  }, [user, authLoading, router]);

  const fetchSubscriptionTier = async () => {
    const supabase = createClient();
    if (!supabase || !user) return;

    const { data } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .single();

    if (data) {
      setSubscriptionTier(data.subscription_tier || 'free');
    }
  };

  const fetchAlerts = async () => {
    if (!user) return;

    try {
      const response = await fetch('/api/alerts', {
        headers: { 'x-user-id': user.id },
      });

      if (response.ok) {
        const data = await response.json();
        setAlerts(data.alerts || []);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newAlert.name || !newAlert.locatie) return;

    setCreating(true);
    try {
      const response = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          name: newAlert.name,
          searchCriteria: {
            locatie: newAlert.locatie,
            type: newAlert.type,
            minPrijs: newAlert.minPrijs,
            maxPrijs: newAlert.maxPrijs,
            kamers: newAlert.kamers,
            woningType: newAlert.woningType,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAlerts(prev => [data.alert, ...prev]);
        setShowCreateModal(false);
        setNewAlert({
          name: '',
          locatie: '',
          type: 'koop',
          minPrijs: '',
          maxPrijs: '',
          kamers: '',
          woningType: '',
        });
      }
    } catch (error) {
      console.error('Error creating alert:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleToggleAlert = async (alertId: string, currentStatus: boolean) => {
    if (!user) return;

    try {
      const response = await fetch('/api/alerts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          alertId,
          isActive: !currentStatus,
        }),
      });

      if (response.ok) {
        setAlerts(prev =>
          prev.map(a => (a.id === alertId ? { ...a, is_active: !currentStatus } : a))
        );
      }
    } catch (error) {
      console.error('Error toggling alert:', error);
    }
  };

  const handleDeleteAlert = async (alertId: string) => {
    if (!user) return;

    try {
      const response = await fetch('/api/alerts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, alertId }),
      });

      if (response.ok) {
        setAlerts(prev => prev.filter(a => a.id !== alertId));
      }
    } catch (error) {
      console.error('Error deleting alert:', error);
    }
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

  // Free tier - show upgrade prompt
  if (subscriptionTier === 'free') {
    return (
      <PageTransition>
        <div className="min-h-[60vh] flex items-center justify-center px-4 py-8">
          <div className="text-center max-w-lg">
            <div className="w-24 h-24 mx-auto mb-6 bg-[#e94560]/20 rounded-full flex items-center justify-center">
              <Bell className="w-12 h-12 text-[#e94560]" />
            </div>

            <h1 className="text-2xl md:text-3xl font-bold mb-4">Email Alerts</h1>

            <p className="text-white/50 mb-8">
              Ontvang automatisch een email wanneer er nieuwe woningen beschikbaar komen die aan jouw criteria voldoen.
            </p>

            <div className="glass rounded-2xl p-6 mb-8 text-left">
              <h3 className="font-medium mb-4 flex items-center gap-2">
                <Crown className="w-5 h-5 text-[#e94560]" />
                Met Pro krijg je:
              </h3>
              <ul className="text-sm text-white/50 space-y-2">
                <li>Tot 3 actieve zoek-alerts</li>
                <li>Dagelijkse email notificaties</li>
                <li>Nooit meer een woning missen</li>
              </ul>
            </div>

            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 px-6 py-3 btn-gradient rounded-xl font-medium hover:shadow-lg hover:shadow-[#FF7A00]/30 transition-shadow"
            >
              <Crown className="w-5 h-5" />
              Upgrade naar Pro
            </Link>
          </div>
        </div>
      </PageTransition>
    );
  }

  const alertLimit = subscriptionTier === 'ultra' ? 10 : 3;

  return (
    <PageTransition>
      <div className="px-4 md:px-6 py-8 md:py-12">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                <Bell className="w-8 h-8 text-[#e94560]" />
                Mijn Alerts
              </h1>
              <p className="text-white/50">
                {alerts.length} van {alertLimit} alerts actief
              </p>
            </div>

            {alerts.length < alertLimit && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 btn-gradient rounded-lg font-medium flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Nieuwe alert
              </button>
            )}
          </div>

          {/* Alerts list */}
          {alerts.length === 0 ? (
            <div className="text-center py-16 glass rounded-2xl">
              <Bell className="w-16 h-16 mx-auto mb-4 text-white/20" />
              <h2 className="text-xl font-semibold mb-2">Geen alerts</h2>
              <p className="text-white/50 mb-6">
                Maak je eerste alert om notificaties te ontvangen
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 btn-gradient rounded-lg font-medium inline-flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Nieuwe alert
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {alerts.map(alert => (
                <div key={alert.id} className="glass rounded-xl p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{alert.name}</h3>
                      <p className="text-sm text-white/50">
                        Aangemaakt op {new Date(alert.created_at).toLocaleDateString('nl-NL')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleAlert(alert.id, alert.is_active)}
                        className={`p-2 rounded-lg transition-colors ${
                          alert.is_active
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-white/10 text-white/50'
                        }`}
                        title={alert.is_active ? 'Actief' : 'Gepauzeerd'}
                      >
                        {alert.is_active ? (
                          <ToggleRight className="w-5 h-5" />
                        ) : (
                          <ToggleLeft className="w-5 h-5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteAlert(alert.id)}
                        className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-white/10 rounded-full text-sm flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      {alert.search_criteria.locatie}
                    </span>
                    <span className="px-3 py-1 bg-white/10 rounded-full text-sm flex items-center gap-1.5">
                      <Home className="w-3.5 h-3.5" />
                      {alert.search_criteria.type === 'koop' ? 'Koop' : 'Huur'}
                    </span>
                    {(alert.search_criteria.minPrijs || alert.search_criteria.maxPrijs) && (
                      <span className="px-3 py-1 bg-white/10 rounded-full text-sm flex items-center gap-1.5">
                        <Euro className="w-3.5 h-3.5" />
                        {alert.search_criteria.minPrijs || '0'} - {alert.search_criteria.maxPrijs || 'max'}
                      </span>
                    )}
                    {alert.search_criteria.kamers && (
                      <span className="px-3 py-1 bg-white/10 rounded-full text-sm flex items-center gap-1.5">
                        <BedDouble className="w-3.5 h-3.5" />
                        {alert.search_criteria.kamers} kamers
                      </span>
                    )}
                    {alert.search_criteria.woningType && (
                      <span className="px-3 py-1 bg-white/10 rounded-full text-sm">
                        {woningTypeLabels[alert.search_criteria.woningType] || alert.search_criteria.woningType}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="glass rounded-2xl p-6 w-full max-w-md animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Nieuwe Alert</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAlert} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Alert naam</label>
                <input
                  type="text"
                  value={newAlert.name}
                  onChange={e => setNewAlert(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="bijv. Appartementen Amsterdam"
                  required
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm focus:border-[#2B7CB3] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Locatie</label>
                <input
                  type="text"
                  value={newAlert.locatie}
                  onChange={e => setNewAlert(prev => ({ ...prev, locatie: e.target.value }))}
                  placeholder="bijv. Amsterdam"
                  required
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm focus:border-[#2B7CB3] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Type</label>
                <select
                  value={newAlert.type}
                  onChange={e => setNewAlert(prev => ({ ...prev, type: e.target.value as 'koop' | 'huur' }))}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm focus:border-[#2B7CB3] focus:outline-none"
                >
                  <option value="koop" className="bg-[#1a1a2e]">Koop</option>
                  <option value="huur" className="bg-[#1a1a2e]">Huur</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Min prijs</label>
                  <input
                    type="number"
                    value={newAlert.minPrijs}
                    onChange={e => setNewAlert(prev => ({ ...prev, minPrijs: e.target.value }))}
                    placeholder="0"
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm focus:border-[#2B7CB3] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Max prijs</label>
                  <input
                    type="number"
                    value={newAlert.maxPrijs}
                    onChange={e => setNewAlert(prev => ({ ...prev, maxPrijs: e.target.value }))}
                    placeholder="Geen max"
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm focus:border-[#2B7CB3] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Min kamers</label>
                <select
                  value={newAlert.kamers}
                  onChange={e => setNewAlert(prev => ({ ...prev, kamers: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm focus:border-[#2B7CB3] focus:outline-none"
                >
                  <option value="" className="bg-[#1a1a2e]">Alle</option>
                  <option value="1+" className="bg-[#1a1a2e]">1+</option>
                  <option value="2+" className="bg-[#1a1a2e]">2+</option>
                  <option value="3+" className="bg-[#1a1a2e]">3+</option>
                  <option value="4+" className="bg-[#1a1a2e]">4+</option>
                  <option value="5+" className="bg-[#1a1a2e]">5+</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={creating}
                className="w-full py-3 btn-gradient rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {creating ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    Alert aanmaken
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </PageTransition>
  );
}
