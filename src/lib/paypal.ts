import { Client, Environment } from '@paypal/paypal-server-sdk';

// PayPal configuration
const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET!;
const PAYPAL_MODE = process.env.PAYPAL_MODE || 'sandbox';

if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
  throw new Error('PayPal credentials are required');
}

// Initialize PayPal client
const paypalClient = new Client({
  clientCredentialsAuthCredentials: {
    oAuthClientId: PAYPAL_CLIENT_ID,
    oAuthClientSecret: PAYPAL_CLIENT_SECRET,
  },
  environment: PAYPAL_MODE === 'production' ? Environment.Production : Environment.Sandbox,
});

export { paypalClient };

// PayPal order interfaces
export interface PayPalOrderRequest {
  courseId: string;
  amount: string;
  currency?: string;
}

export interface PayPalOrderResponse {
  id: string;
  status: string;
  links: Array<{
    href: string;
    rel: string;
    method: string;
  }>;
}

export interface PayPalCaptureResponse {
  id: string;
  status: string;
  purchase_units: Array<{
    reference_id: string;
    payments: {
      captures: Array<{
        id: string;
        status: string;
        amount: {
          currency_code: string;
          value: string;
        };
      }>;
    };
  }>;
}

// Utility functions
export const formatPayPalAmount = (amount: number): string => {
  return amount.toFixed(2);
};

export const getPayPalApprovalUrl = (order: PayPalOrderResponse): string | null => {
  const approvalLink = order.links.find(link => link.rel === 'approve');
  return approvalLink?.href || null;
};

export const validatePayPalCapture = (capture: PayPalCaptureResponse): boolean => {
  return (
    capture.status === 'COMPLETED' &&
    capture.purchase_units.length > 0 &&
    capture.purchase_units[0].payments.captures.length > 0 &&
    capture.purchase_units[0].payments.captures[0].status === 'COMPLETED'
  );
};

// Error handling
export class PayPalError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public details?: unknown
  ) {
    super(message);
    this.name = 'PayPalError';
  }
}

// PayPal webhook verification (if needed)
export const verifyPayPalWebhook = async (): Promise<boolean> => {
  // PayPal webhook verification logic would go here
  // For now, we'll use the capture verification instead
  return true;
};