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
    amount: '9.00',
    currency: 'EUR',
    interval: '1 month',
    description: 'WoningSpotters Pro - Maandelijks abonnement',
  },
  ultra: {
    name: 'Ultra',
    amount: '29.00',
    currency: 'EUR',
    interval: '1 month',
    description: 'WoningSpotters Ultra - Maandelijks abonnement',
  },
} as const;

export type PlanType = keyof typeof PLANS;
