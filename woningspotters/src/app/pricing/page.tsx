'use client';

import { useState } from 'react';
import { PageTransition } from '../components/PageTransition';
import { Check, Zap, Crown, Rocket, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

const plans = [
  {
    id: 'plan-free',
    name: 'Gratis',
    price: '€0',
    period: '/maand',
    description: 'Voor starters',
    icon: Zap,
    features: [
      'Maximaal 5 zoekopdrachten per dag',
      'Basis filters',
      'Zoekresultaten bekijken',
    ],
    cta: 'Gratis starten',
    href: '/login',
    popular: false,
    tier: 'free',
    isPaid: false,
  },
  {
    id: 'plan-pro',
    name: 'Pro',
    price: '€7',
    period: '/maand',
    description: 'Voor actieve zoekers',
    icon: Crown,
    features: [
      'Maximaal 30 zoekopdrachten per dag',
      'Alle filters',
      'Advertentievrije ervaring',
      'Favorieten opslaan',
      'Email alerts bij nieuwe woningen',
      'Priority support',
    ],
    cta: 'Start Pro',
    href: '/login',
    popular: true,
    tier: 'pro',
    isPaid: true,
  },
  {
    id: 'plan-ultra',
    name: 'Ultra',
    price: '€15',
    period: '/maand',
    description: 'Voor professionals',
    icon: Rocket,
    features: [
      'Maximaal 100 zoekopdrachten per dag',
      'Alles van Pro',
      'Export naar Excel/CSV',
      'Vroege toegang tot nieuwe features',
    ],
    cta: 'Start Ultra',
    href: '/login',
    popular: false,
    tier: 'ultra',
    isPaid: true,
  },
];

export default function PricingPage() {
  const { user } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async (plan: string) => {
    if (!user) {
      // Redirect to login if not authenticated
      window.location.href = '/login?redirect=/pricing';
      return;
    }

    setLoadingPlan(plan);
    setError(null);

    try {
      const response = await fetch('/api/mollie/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan,
          userId: user.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Er ging iets mis');
      }

      // Redirect to Mollie checkout
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er ging iets mis');
      setLoadingPlan(null);
    }
  };

  return (
    <PageTransition>
      <div className="px-4 md:px-6 py-8 md:py-12 pb-16">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10 md:mb-14">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold gradient-text mb-4">
              Kies jouw plan
            </h1>
            <p className="text-white/50 text-base md:text-lg lg:text-xl max-w-2xl mx-auto">
              Van gratis tot premium – er is altijd een plan dat bij je past.
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-8 p-5 bg-red-500/10 border border-red-500/30 rounded-xl text-center">
              <p className="text-red-400 text-base md:text-lg">{error}</p>
            </div>
          )}

          {/* Plans grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-8 items-center">
            {plans.map((plan) => {
              const Icon = plan.icon;
              const isPro = plan.tier === 'pro';
              const isUltra = plan.tier === 'ultra';
              const isLoading = loadingPlan === plan.tier;

              return (
                <div
                  key={plan.name}
                  id={plan.id}
                  className={`relative glass rounded-2xl p-6 md:p-8 flex flex-col transition-all duration-500 ease-out cursor-pointer hover:-translate-y-2 hover:shadow-2xl ${
                    isPro
                      ? 'ring-2 ring-[#e94560] bg-white/10 md:py-10 shadow-lg shadow-[#e94560]/20 hover:shadow-[#e94560]/40'
                      : isUltra
                      ? 'ring-1 ring-[#a855f7]/50 bg-white/5 hover:ring-[#a855f7] hover:shadow-[#a855f7]/30'
                      : 'hover:bg-white/5 hover:shadow-white/10'
                  }`}
                >
                  {/* Popular badge - only for Pro */}
                  {isPro && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#FF7A00] rounded-full text-xs font-semibold whitespace-nowrap shadow-lg shadow-[#e94560]/30">
                      Meest gekozen
                    </div>
                  )}

                  {/* Icon */}
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${
                      isPro
                        ? 'btn-gradient shadow-lg shadow-[#e94560]/30'
                        : isUltra
                        ? 'bg-gradient-to-br from-[#a855f7] to-[#6366f1]'
                        : 'bg-white/10'
                    }`}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </div>

                  {/* Name & Description */}
                  <h3
                    className={`text-lg font-semibold mb-1 ${
                      isPro ? 'text-[#e94560]' : isUltra ? 'text-[#a855f7]' : ''
                    }`}
                  >
                    {plan.name}
                  </h3>
                  <p className="text-white/50 text-sm mb-4">{plan.description}</p>

                  {/* Price */}
                  <div className="mb-6">
                    <span
                      className={`text-3xl font-bold ${
                        isPro ? 'text-white' : isUltra ? 'text-white' : ''
                      }`}
                    >
                      {plan.price}
                    </span>
                    <span className="text-white/50 text-sm">{plan.period}</span>
                  </div>

                  {/* Features */}
                  <ul className="space-y-2.5 mb-6 flex-1">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm">
                        <Check
                          className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                            isPro
                              ? 'text-[#e94560]'
                              : isUltra
                              ? 'text-[#a855f7]'
                              : 'text-[#e94560]'
                          }`}
                        />
                        <span className="text-white/70">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  {plan.isPaid ? (
                    <button
                      onClick={() => handleSubscribe(plan.tier)}
                      disabled={isLoading || loadingPlan !== null}
                      className={`w-full py-2.5 rounded-lg font-medium text-center text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                        isPro
                          ? 'btn-gradient hover:shadow-lg hover:shadow-[#e94560]/40 hover:scale-[1.02]'
                          : isUltra
                          ? 'bg-gradient-to-r from-[#a855f7] to-[#6366f1] hover:shadow-lg hover:shadow-[#a855f7]/30 hover:scale-[1.02]'
                          : 'bg-white/10 hover:bg-white/20'
                      }`}
                    >
                      {isLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Laden...
                        </span>
                      ) : (
                        plan.cta
                      )}
                    </button>
                  ) : (
                    <Link
                      href={plan.href}
                      className={`w-full py-2.5 rounded-lg font-medium text-center text-sm transition-all block ${
                        isPro
                          ? 'btn-gradient hover:shadow-lg hover:shadow-[#e94560]/40 hover:scale-[1.02]'
                          : isUltra
                          ? 'bg-gradient-to-r from-[#a855f7] to-[#6366f1] hover:shadow-lg hover:shadow-[#a855f7]/30 hover:scale-[1.02]'
                          : 'bg-white/10 hover:bg-white/20'
                      }`}
                    >
                      {plan.cta}
                    </Link>
                  )}
                </div>
              );
            })}
          </div>

          {/* Contact hint */}
          <div className="mt-10 text-center">
            <p className="text-white/40 text-sm">
              Vragen over prijzen?{' '}
              <Link href="/contact" className="text-[#5BA3D0] hover:underline">
                Neem contact op
              </Link>
            </p>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
