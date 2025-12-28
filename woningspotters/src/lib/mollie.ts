import createMollieClient, { MollieClient } from '@mollie/api-client';

let mollieClientInstance: MollieClient | null = null;

export function getMollieClient(): MollieClient {
  if (!mollieClientInstance) {
    const mollieApiKey = process.env.MOLLIE_API_KEY;
    
    if (!mollieApiKey) {
      throw new Error('MOLLIE_API_KEY is not set in environment variables');
    }
    
    mollieClientInstance = createMollieClient({ apiKey: mollieApiKey });
  }
  
  return mollieClientInstance;
}

// Plan configuration
export const PLANS = {
  pro: {
    name: 'Pro',
    amount: '7.00',
    currency: 'EUR',
    interval: '1 month',
    description: 'WoningSpotters Pro - Maandelijks abonnement',
    searchLimit: 30,
  },
  ultra: {
    name: 'Ultra',
    amount: '15.00',
    currency: 'EUR',
    interval: '1 month',
    description: 'WoningSpotters Ultra - Maandelijks abonnement',
    searchLimit: 100,
  },
} as const;

// Search limits per tier
export const SEARCH_LIMITS = {
  free: 5,
  pro: 30,
  ultra: 100,
} as const;

export type PlanType = keyof typeof PLANS;
