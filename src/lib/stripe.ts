import { loadStripe, Stripe } from '@stripe/stripe-js';
import StripeServer from 'stripe';

// Client-side Stripe instance
let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!publishableKey) {
      throw new Error('Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY environment variable');
    }
    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
};

// Server-side Stripe instance
export const stripe = new StripeServer(
  process.env.STRIPE_SECRET_KEY!,
  {
    apiVersion: '2024-12-18.acacia',
    typescript: true,
  }
);

// Webhook signature verification
export const verifyWebhookSignature = (payload: string, signature: string) => {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error('Missing STRIPE_WEBHOOK_SECRET environment variable');
  }
  
  try {
    return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    throw error;
  }
};

// Helper function to format price for Stripe (convert to cents)
export const formatPriceForStripe = (price: number): number => {
  return Math.round(price * 100);
};

// Helper function to format price for display
export const formatPriceForDisplay = (priceInCents: number): string => {
  return (priceInCents / 100).toFixed(2);
};