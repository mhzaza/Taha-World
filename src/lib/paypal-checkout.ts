import { loadScript } from '@paypal/paypal-js';
import { useAuth } from '@/contexts/AuthContext';

export interface PayPalOrderData {
  orderID: string;
}

export interface PayPalOnApproveData {
  orderID: string;
  payerID?: string;
}

export interface PayPalOnApproveActions {
  order: {
    capture(): Promise<any>;
  };
}

// Load PayPal script
export const loadPayPalScript = async () => {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  
  if (!clientId) {
    throw new Error('PayPal Client ID is not configured');
  }

  try {
    const paypal = await loadScript({
      clientId,
      currency: 'USD',
      intent: 'capture',
    });
    
    return paypal;
  } catch (error) {
    console.error('Failed to load PayPal script:', error);
    throw error;
  }
};

// Create PayPal order
export const createPayPalOrder = async (courseId: string): Promise<string> => {
  try {
    const response = await fetch('/api/paypal/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // TODO: Add authorization header
        // 'Authorization': `Bearer ${userToken}`,
      },
      body: JSON.stringify({ courseId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create PayPal order');
    }

    const { orderId } = await response.json();
    return orderId;
  } catch (error) {
    console.error('Error creating PayPal order:', error);
    throw error;
  }
};

// Capture PayPal order
export const capturePayPalOrder = async (
  orderId: string,
  userId?: string
): Promise<any> => {
  try {
    const response = await fetch('/api/paypal/capture-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // TODO: Add authorization header
        // 'Authorization': `Bearer ${userToken}`,
      },
      body: JSON.stringify({ orderId, userId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to capture PayPal order');
    }

    return await response.json();
  } catch (error) {
    console.error('Error capturing PayPal order:', error);
    throw error;
  }
};

// PayPal button configuration
export const getPayPalButtonConfig = (
  courseId: string,
  onSuccess: (details: any) => void,
  onError: (error: any) => void,
  onCancel?: () => void
) => {
  return {
    createOrder: async () => {
      try {
        return await createPayPalOrder(courseId);
      } catch (error) {
        onError(error);
        throw error;
      }
    },
    onApprove: async (data: PayPalOnApproveData, actions: PayPalOnApproveActions) => {
      try {
        // Capture the order using our API
        const captureResult = await capturePayPalOrder(data.orderID);
        onSuccess(captureResult);
        return captureResult;
      } catch (error) {
        onError(error);
        throw error;
      }
    },
    onError: (error: any) => {
      console.error('PayPal button error:', error);
      onError(error);
    },
    onCancel: (data: any) => {
      console.log('PayPal payment cancelled:', data);
      if (onCancel) {
        onCancel();
      }
    },
    style: {
      layout: 'vertical',
      color: 'blue',
      shape: 'rect',
      label: 'paypal',
      height: 45,
    },
  };
};

// Hook for PayPal checkout
export const usePayPalCheckout = () => {
  const { user } = useAuth();

  const initiatePayPalCheckout = async (
    courseId: string,
    onSuccess: (details: any) => void,
    onError: (error: any) => void,
    onCancel?: () => void
  ) => {
    if (!user) {
      throw new Error('User must be logged in to purchase a course');
    }

    try {
      const paypal = await loadPayPalScript();
      
      if (!paypal || !paypal.Buttons) {
        throw new Error('PayPal SDK not loaded properly');
      }

      const buttonConfig = getPayPalButtonConfig(
        courseId,
        onSuccess,
        onError,
        onCancel
      );

      return buttonConfig;
    } catch (error) {
      console.error('PayPal checkout initialization error:', error);
      throw error;
    }
  };

  return {
    initiatePayPalCheckout,
    isAuthenticated: !!user,
    loadPayPalScript,
  };
};

// Utility function to check PayPal environment
export const getPayPalEnvironment = (): 'sandbox' | 'production' => {
  return process.env.PAYPAL_MODE === 'production' ? 'production' : 'sandbox';
};

// Utility function to format PayPal amount
export const formatPayPalPrice = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};