'use client';

import { useState, useEffect } from 'react';

// Declare gtag function type
declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

type ConsentState = 'granted' | 'denied';

interface ConsentSettings {
  ad_storage: ConsentState;
  ad_user_data: ConsentState;
  ad_personalization: ConsentState;
  analytics_storage: ConsentState;
}

const CONSENT_COOKIE_NAME = 'cookie_consent';

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [consent, setConsent] = useState<ConsentSettings>({
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
  });

  // Check for existing consent on mount
  useEffect(() => {
    // Ensure gtag is available
    if (typeof window !== 'undefined') {
      window.dataLayer = window.dataLayer || [];
      if (!window.gtag) {
        window.gtag = function gtag() {
          window.dataLayer.push(arguments);
        };
      }
    }

    const savedConsent = localStorage.getItem(CONSENT_COOKIE_NAME);

    if (savedConsent) {
      try {
        const parsedConsent = JSON.parse(savedConsent) as ConsentSettings;
        setConsent(parsedConsent);
        // Update GTM with saved consent
        updateGtagConsent(parsedConsent);
      } catch {
        // Invalid saved consent, show banner
        setShowBanner(true);
      }
    } else {
      // No consent saved, show banner
      setShowBanner(true);
    }
  }, []);

  // Update consent in Google Tag Manager
  const updateGtagConsent = (settings: ConsentSettings) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        'ad_storage': settings.ad_storage,
        'ad_user_data': settings.ad_user_data,
        'ad_personalization': settings.ad_personalization,
        'analytics_storage': settings.analytics_storage,
      });

      // Send event to GTM to confirm consent update
      window.gtag('event', 'consent_update', {
        'ad_storage': settings.ad_storage,
        'ad_user_data': settings.ad_user_data,
        'ad_personalization': settings.ad_personalization,
        'analytics_storage': settings.analytics_storage,
      });
    }
  };

  // Save consent to localStorage and update GTM
  const saveConsent = (settings: ConsentSettings) => {
    localStorage.setItem(CONSENT_COOKIE_NAME, JSON.stringify(settings));
    setConsent(settings);
    updateGtagConsent(settings);
    setShowBanner(false);
    setShowPreferences(false);
  };

  // Accept all cookies
  const acceptAll = () => {
    const allGranted: ConsentSettings = {
      ad_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted',
      analytics_storage: 'granted',
    };
    saveConsent(allGranted);
  };

  // Deny all cookies (only essential)
  const denyAll = () => {
    const allDenied: ConsentSettings = {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: 'denied',
    };
    saveConsent(allDenied);
  };

  // Save custom preferences
  const savePreferences = () => {
    saveConsent(consent);
  };

  // Toggle individual consent setting
  const toggleConsent = (key: keyof ConsentSettings) => {
    setConsent(prev => ({
      ...prev,
      [key]: prev[key] === 'granted' ? 'denied' : 'granted',
    }));
  };

  if (!showBanner) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-end justify-center p-4 pointer-events-none">
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 transition-opacity pointer-events-auto ${showPreferences ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setShowPreferences(false)}
      />

      {/* Cookie Banner */}
      <div className="relative w-full max-w-4xl bg-[#1e1e3f] border border-[#FF6B35]/30 rounded-2xl shadow-2xl pointer-events-auto overflow-hidden">
        {/* Main Banner */}
        {!showPreferences ? (
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="text-4xl">🍪</div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">
                  Wij gebruiken cookies
                </h3>
                <p className="text-gray-300 text-sm mb-4">
                  WoningSpotters maakt gebruik van functionele cookies en, met jouw toestemming, analytische
                  cookies van Google Analytics 4. Deze worden geladen via Google Tag Manager en pas geactiveerd
                  nadat je daarvoor toestemming hebt gegeven. Je kunt je voorkeuren op elk moment wijzigen.
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={acceptAll}
                    className="px-6 py-2.5 bg-[#FF6B35] hover:bg-[#ff8555] text-white font-semibold rounded-lg transition-colors"
                  >
                    Accepteer alles
                  </button>
                  <button
                    onClick={denyAll}
                    className="px-6 py-2.5 bg-transparent border border-gray-500 hover:border-gray-400 text-gray-300 hover:text-white font-semibold rounded-lg transition-colors"
                  >
                    Alleen noodzakelijk
                  </button>
                  <button
                    onClick={() => setShowPreferences(true)}
                    className="px-6 py-2.5 text-[#FF6B35] hover:text-[#ff8555] font-semibold transition-colors underline underline-offset-2"
                  >
                    Voorkeuren aanpassen
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Preferences Panel */
          <div className="p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Cookie voorkeuren</h3>
              <button
                onClick={() => setShowPreferences(false)}
                aria-label="Voorkeuren sluiten"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {/* Necessary Cookies - Always enabled */}
              <div className="p-4 bg-[#2a2a4a] rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-white">Noodzakelijke cookies</h4>
                    <p className="text-sm text-gray-400 mt-1">
                      Deze cookies zijn technisch noodzakelijk om de website goed te laten functioneren
                      (bijvoorbeeld om je cookievoorkeuren op te slaan). Voor deze cookies is geen toestemming vereist.
                    </p>
                  </div>
                  <div className="px-3 py-1 bg-green-500/20 text-green-400 text-sm rounded-full">
                    Altijd actief
                  </div>
                </div>
              </div>

              {/* Analytics Cookies */}
              <div className="p-4 bg-[#2a2a4a] rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex-1 mr-4">
                    <h4 className="font-semibold text-white">Analytische cookies (Google Analytics 4)</h4>
                    <p className="text-sm text-gray-400 mt-1">
                      Wij gebruiken Google Analytics 4 via Google Tag Manager om statistieken bij te houden over het
                      gebruik van onze website. Deze cookies worden pas geactiveerd na jouw toestemming.
                    </p>
                  </div>
                  <button
                    onClick={() => toggleConsent('analytics_storage')}
                    aria-label="Analytische cookies in-/uitschakelen"
                    className={`relative w-14 h-7 rounded-full transition-colors ${
                      consent.analytics_storage === 'granted' ? 'bg-[#FF6B35]' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                        consent.analytics_storage === 'granted' ? 'translate-x-8' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Ad Storage Cookies */}
              <div className="p-4 bg-[#2a2a4a] rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex-1 mr-4">
                    <h4 className="font-semibold text-white">Advertentie cookies</h4>
                    <p className="text-sm text-gray-400 mt-1">
                      Worden gebruikt om advertenties relevanter te maken.
                    </p>
                  </div>
                  <button
                    onClick={() => toggleConsent('ad_storage')}
                    aria-label="Advertentie cookies in-/uitschakelen"
                    className={`relative w-14 h-7 rounded-full transition-colors ${
                      consent.ad_storage === 'granted' ? 'bg-[#FF6B35]' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                        consent.ad_storage === 'granted' ? 'translate-x-8' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Ad User Data */}
              <div className="p-4 bg-[#2a2a4a] rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex-1 mr-4">
                    <h4 className="font-semibold text-white">Gebruikersdata voor advertenties</h4>
                    <p className="text-sm text-gray-400 mt-1">
                      Toestemming voor het verzenden van gebruikersgegevens naar Google voor advertentiedoeleinden.
                    </p>
                  </div>
                  <button
                    onClick={() => toggleConsent('ad_user_data')}
                    aria-label="Gebruikersdata voor advertenties in-/uitschakelen"
                    className={`relative w-14 h-7 rounded-full transition-colors ${
                      consent.ad_user_data === 'granted' ? 'bg-[#FF6B35]' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                        consent.ad_user_data === 'granted' ? 'translate-x-8' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Ad Personalization */}
              <div className="p-4 bg-[#2a2a4a] rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex-1 mr-4">
                    <h4 className="font-semibold text-white">Gepersonaliseerde advertenties</h4>
                    <p className="text-sm text-gray-400 mt-1">
                      Toestemming voor gepersonaliseerde advertenties op basis van je interesses.
                    </p>
                  </div>
                  <button
                    onClick={() => toggleConsent('ad_personalization')}
                    aria-label="Gepersonaliseerde advertenties in-/uitschakelen"
                    className={`relative w-14 h-7 rounded-full transition-colors ${
                      consent.ad_personalization === 'granted' ? 'bg-[#FF6B35]' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                        consent.ad_personalization === 'granted' ? 'translate-x-8' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-gray-700">
              <button
                onClick={savePreferences}
                className="px-6 py-2.5 bg-[#FF6B35] hover:bg-[#ff8555] text-white font-semibold rounded-lg transition-colors"
              >
                Voorkeuren opslaan
              </button>
              <button
                onClick={acceptAll}
                className="px-6 py-2.5 bg-transparent border border-[#FF6B35] text-[#FF6B35] hover:bg-[#FF6B35] hover:text-white font-semibold rounded-lg transition-colors"
              >
                Accepteer alles
              </button>
              <button
                onClick={denyAll}
                className="px-6 py-2.5 bg-transparent border border-gray-500 hover:border-gray-400 text-gray-300 hover:text-white font-semibold rounded-lg transition-colors"
              >
                Weiger alles
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
