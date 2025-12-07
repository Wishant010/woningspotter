'use client';

import { useState, useEffect } from 'react';
import { GTM_ID, GA4_ID } from '../../gtm';

interface ConsentSettings {
  ad_storage: string;
  ad_user_data: string;
  ad_personalization: string;
  analytics_storage: string;
}

interface DebugInfo {
  gtmLoaded: boolean;
  ga4CookiesPresent: boolean;
  ga4Cookies: string[];
  consentStored: ConsentSettings | null;
  dataLayerLength: number;
  consentEvents: unknown[];
}

export default function ConsentDebugPage() {
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    gtmLoaded: false,
    ga4CookiesPresent: false,
    ga4Cookies: [],
    consentStored: null,
    dataLayerLength: 0,
    consentEvents: [],
  });
  const [refreshKey, setRefreshKey] = useState(0);

  // Register global console helper functions
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const w = window as unknown as {
      dataLayer?: unknown[];
      checkConsent?: () => void;
      getConsentState?: () => unknown;
      resetConsent?: () => void;
    };

    w.checkConsent = () => {
      console.log('=== CONSENT DEBUG INFO ===');
      console.log('dataLayer:', w.dataLayer);
      console.log('dataLayer length:', w.dataLayer?.length || 0);
      console.log('cookie_consent (localStorage):', localStorage.getItem('cookie_consent'));
      console.log('GA4 cookies:', document.cookie.split(';').filter(c => c.trim().startsWith('_ga')));
      console.log('GTM loaded:', typeof (window as unknown as { google_tag_manager?: unknown }).google_tag_manager !== 'undefined');
      console.log('==========================');
    };

    w.getConsentState = () => {
      const stored = localStorage.getItem('cookie_consent');
      const state = stored ? JSON.parse(stored) : null;
      console.log('Current consent state:', state);
      return state;
    };

    w.resetConsent = () => {
      localStorage.removeItem('cookie_consent');
      document.cookie.split(';').forEach(c => {
        const name = c.trim().split('=')[0];
        if (name.startsWith('_ga')) {
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        }
      });
      console.log('Consent gereset - refresh de pagina om de cookie banner te zien.');
    };

    console.log('Debug helpers loaded: checkConsent(), getConsentState(), resetConsent()');
  }, []);

  useEffect(() => {
    const checkDebugInfo = () => {
      // Check GTM
      const gtmLoaded = typeof (window as unknown as { google_tag_manager?: unknown }).google_tag_manager !== 'undefined';

      // Check GA4 cookies
      const ga4Cookies = document.cookie.split(';').filter(c => c.trim().startsWith('_ga'));

      // Check stored consent
      let consentStored: ConsentSettings | null = null;
      const stored = localStorage.getItem('cookie_consent');
      if (stored) {
        try {
          consentStored = JSON.parse(stored);
        } catch {
          consentStored = null;
        }
      }

      // Check dataLayer
      const dataLayer = (window as unknown as { dataLayer?: unknown[] }).dataLayer || [];
      const consentEvents = dataLayer.filter((item: unknown) => {
        if (Array.isArray(item)) {
          return item[0] === 'consent';
        }
        return false;
      });

      setDebugInfo({
        gtmLoaded,
        ga4CookiesPresent: ga4Cookies.length > 0,
        ga4Cookies,
        consentStored,
        dataLayerLength: dataLayer.length,
        consentEvents,
      });
    };

    checkDebugInfo();
    const interval = setInterval(checkDebugInfo, 2000);
    return () => clearInterval(interval);
  }, [refreshKey]);

  const resetConsent = () => {
    localStorage.removeItem('cookie_consent');
    // Clear GA4 cookies
    document.cookie.split(';').forEach(c => {
      const name = c.trim().split('=')[0];
      if (name.startsWith('_ga')) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      }
    });
    setRefreshKey(k => k + 1);
    alert('Consent gereset! Refresh de pagina om de cookie banner te zien.');
  };

  const getStatusColor = (status: boolean | string) => {
    if (status === true || status === 'granted') return 'text-green-400 bg-green-500/20';
    if (status === false || status === 'denied') return 'text-red-400 bg-red-500/20';
    return 'text-yellow-400 bg-yellow-500/20';
  };

  const getStatusIcon = (status: boolean | string) => {
    if (status === true || status === 'granted') return '✓';
    if (status === false || status === 'denied') return '✗';
    return '?';
  };

  return (
    <div className="min-h-screen p-8 layout-bg">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">Consent Mode V2 Debug</h1>
        <p className="text-gray-400 mb-8">Real-time overzicht van je consent configuratie</p>

        {/* IDs */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-[#2a2a4a] rounded-xl p-4">
            <h3 className="text-sm text-gray-400 mb-1">GTM ID</h3>
            <p className="text-white font-mono">{GTM_ID}</p>
          </div>
          <div className="bg-[#2a2a4a] rounded-xl p-4">
            <h3 className="text-sm text-gray-400 mb-1">GA4 ID</h3>
            <p className="text-white font-mono">{GA4_ID}</p>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* GTM Status */}
          <div className="bg-[#2a2a4a] rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-white">GTM Status</h3>
              <span className={`px-2 py-1 rounded-full text-sm ${getStatusColor(debugInfo.gtmLoaded)}`}>
                {getStatusIcon(debugInfo.gtmLoaded)} {debugInfo.gtmLoaded ? 'Geladen' : 'Niet geladen'}
              </span>
            </div>
            <p className="text-sm text-gray-400">
              Google Tag Manager container
            </p>
          </div>

          {/* GA4 Cookies */}
          <div className="bg-[#2a2a4a] rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-white">GA4 Cookies</h3>
              <span className={`px-2 py-1 rounded-full text-sm ${getStatusColor(debugInfo.ga4CookiesPresent)}`}>
                {getStatusIcon(debugInfo.ga4CookiesPresent)} {debugInfo.ga4CookiesPresent ? 'Aanwezig' : 'Geen'}
              </span>
            </div>
            <p className="text-sm text-gray-400">
              {debugInfo.ga4CookiesPresent
                ? `${debugInfo.ga4Cookies.length} cookie(s) gevonden`
                : 'Geen GA4 cookies (consent denied of nog niet gegeven)'
              }
            </p>
          </div>

          {/* DataLayer */}
          <div className="bg-[#2a2a4a] rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-white">DataLayer</h3>
              <span className="px-2 py-1 rounded-full text-sm text-blue-400 bg-blue-500/20">
                {debugInfo.dataLayerLength} items
              </span>
            </div>
            <p className="text-sm text-gray-400">
              {debugInfo.consentEvents.length} consent event(s)
            </p>
          </div>
        </div>

        {/* Consent Status */}
        <div className="bg-[#2a2a4a] rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Consent Status (localStorage)</h2>

          {debugInfo.consentStored ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-[#1a1a2e] rounded-lg p-4">
                <h4 className="text-sm text-gray-400 mb-2">analytics_storage</h4>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(debugInfo.consentStored.analytics_storage)}`}>
                  {debugInfo.consentStored.analytics_storage}
                </span>
              </div>
              <div className="bg-[#1a1a2e] rounded-lg p-4">
                <h4 className="text-sm text-gray-400 mb-2">ad_storage</h4>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(debugInfo.consentStored.ad_storage)}`}>
                  {debugInfo.consentStored.ad_storage}
                </span>
              </div>
              <div className="bg-[#1a1a2e] rounded-lg p-4">
                <h4 className="text-sm text-gray-400 mb-2">ad_user_data</h4>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(debugInfo.consentStored.ad_user_data)}`}>
                  {debugInfo.consentStored.ad_user_data}
                </span>
              </div>
              <div className="bg-[#1a1a2e] rounded-lg p-4">
                <h4 className="text-sm text-gray-400 mb-2">ad_personalization</h4>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(debugInfo.consentStored.ad_personalization)}`}>
                  {debugInfo.consentStored.ad_personalization}
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
              <p className="text-yellow-400">
                ⚠️ Geen consent opgeslagen - Cookie banner zou moeten worden getoond
              </p>
            </div>
          )}
        </div>

        {/* Expected Behavior */}
        <div className="bg-[#2a2a4a] rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Verwacht Gedrag (OPTIE B)</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className={`mt-1 ${!debugInfo.consentStored || debugInfo.consentStored.analytics_storage === 'denied' ? 'text-green-400' : 'text-red-400'}`}>
                {!debugInfo.consentStored || debugInfo.consentStored.analytics_storage === 'denied' ? '✓' : '✗'}
              </span>
              <div>
                <p className="text-white">GA4 is uitgeschakeld VOORDAT consent is gegeven</p>
                <p className="text-sm text-gray-400">analytics_storage moet &apos;denied&apos; zijn bij default</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className={`mt-1 ${debugInfo.consentStored?.analytics_storage === 'granted' && debugInfo.ga4CookiesPresent ? 'text-green-400' : 'text-yellow-400'}`}>
                {debugInfo.consentStored?.analytics_storage === 'granted' && debugInfo.ga4CookiesPresent ? '✓' : '○'}
              </span>
              <div>
                <p className="text-white">GA4 activeert NA consent &apos;granted&apos;</p>
                <p className="text-sm text-gray-400">GA4 cookies verschijnen alleen na accepteren</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className={`mt-1 ${debugInfo.gtmLoaded ? 'text-green-400' : 'text-red-400'}`}>
                {debugInfo.gtmLoaded ? '✓' : '✗'}
              </span>
              <div>
                <p className="text-white">GTM container is geladen</p>
                <p className="text-sm text-gray-400">GTM laadt altijd, maar respecteert consent</p>
              </div>
            </div>
          </div>
        </div>

        {/* GA4 Cookies Detail */}
        {debugInfo.ga4Cookies.length > 0 && (
          <div className="bg-[#2a2a4a] rounded-xl p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-4">GA4 Cookies Gevonden</h2>
            <div className="space-y-2">
              {debugInfo.ga4Cookies.map((cookie, i) => (
                <div key={i} className="bg-[#1a1a2e] rounded-lg p-3 font-mono text-sm text-gray-300 break-all">
                  {cookie.trim()}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-4">
          <button
            onClick={resetConsent}
            className="px-6 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-lg font-medium transition-colors"
          >
            Reset Consent & Cookies
          </button>
          <button
            onClick={() => setRefreshKey(k => k + 1)}
            className="px-6 py-3 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 rounded-lg font-medium transition-colors"
          >
            Refresh Status
          </button>
          <button
            onClick={() => {
              if (typeof window !== 'undefined' && (window as unknown as { checkConsent?: () => void }).checkConsent) {
                (window as unknown as { checkConsent: () => void }).checkConsent();
              }
            }}
            className="px-6 py-3 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/30 rounded-lg font-medium transition-colors"
          >
            Log to Console
          </button>
        </div>

        {/* Console Commands */}
        <div className="mt-8 bg-[#2a2a4a] rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Console Commands</h2>
          <p className="text-gray-400 mb-4">Open DevTools (F12) en gebruik deze commands:</p>
          <div className="space-y-3 font-mono text-sm">
            <div className="bg-[#1a1a2e] rounded-lg p-3">
              <code className="text-green-400">checkConsent()</code>
              <span className="text-gray-500 ml-3">// Volledige debug info</span>
            </div>
            <div className="bg-[#1a1a2e] rounded-lg p-3">
              <code className="text-green-400">getConsentState()</code>
              <span className="text-gray-500 ml-3">// Huidige consent state</span>
            </div>
            <div className="bg-[#1a1a2e] rounded-lg p-3">
              <code className="text-green-400">resetConsent()</code>
              <span className="text-gray-500 ml-3">// Reset consent (refresh nodig)</span>
            </div>
            <div className="bg-[#1a1a2e] rounded-lg p-3">
              <code className="text-green-400">dataLayer</code>
              <span className="text-gray-500 ml-3">// Bekijk alle GTM events</span>
            </div>
          </div>
        </div>

        {/* Test Instructions */}
        <div className="mt-8 bg-gradient-to-r from-[#FF6B35]/20 to-[#FF6B35]/5 border border-[#FF6B35]/30 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Test Instructies</h2>
          <ol className="space-y-3 text-gray-300">
            <li className="flex gap-3">
              <span className="text-[#FF6B35] font-bold">1.</span>
              <span>Open een incognito/privé venster</span>
            </li>
            <li className="flex gap-3">
              <span className="text-[#FF6B35] font-bold">2.</span>
              <span>Ga naar je website - cookie banner moet verschijnen</span>
            </li>
            <li className="flex gap-3">
              <span className="text-[#FF6B35] font-bold">3.</span>
              <span>Open DevTools → Application → Cookies</span>
            </li>
            <li className="flex gap-3">
              <span className="text-[#FF6B35] font-bold">4.</span>
              <span>Controleer: GEEN _ga cookies aanwezig (consent denied)</span>
            </li>
            <li className="flex gap-3">
              <span className="text-[#FF6B35] font-bold">5.</span>
              <span>Klik &quot;Accepteer alles&quot; op de cookie banner</span>
            </li>
            <li className="flex gap-3">
              <span className="text-[#FF6B35] font-bold">6.</span>
              <span>Controleer: _ga cookies zijn nu WEL aanwezig</span>
            </li>
            <li className="flex gap-3">
              <span className="text-[#FF6B35] font-bold">7.</span>
              <span>Check Console: <code className="bg-[#1a1a2e] px-2 py-0.5 rounded">checkConsent()</code></span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
