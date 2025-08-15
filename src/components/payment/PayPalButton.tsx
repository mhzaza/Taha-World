'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePayPalCheckout, loadPayPalScript } from '@/lib/paypal-checkout';
import { useAuth } from '@/contexts/AuthContext';

interface PayPalButtonProps {
  courseId: string;
  amount: number;
  onSuccess?: (details: any) => void;
  onError?: (error: any) => void;
  onCancel?: () => void;
  disabled?: boolean;
}

export default function PayPalButton({
  courseId,
  amount,
  onSuccess,
  onError,
  onCancel,
  disabled = false,
}: PayPalButtonProps) {
  const router = useRouter();
  const { user } = useAuth();
  const paypalRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paypalLoaded, setPaypalLoaded] = useState(false);

  useEffect(() => {
    if (!user || disabled) {
      setIsLoading(false);
      return;
    }

    const initializePayPal = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Load PayPal script
        const paypal = await loadPayPalScript();
        
        if (!paypal || !paypal.Buttons) {
          throw new Error('PayPal SDK failed to load');
        }

        setPaypalLoaded(true);

        // Clear any existing PayPal buttons
        if (paypalRef.current) {
          paypalRef.current.innerHTML = '';
        }

        // Render PayPal buttons
        const buttons = paypal.Buttons({
          createOrder: async () => {
            try {
              const response = await fetch('/api/paypal/create-order', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ courseId }),
              });

              if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create order');
              }

              const { orderId } = await response.json();
              return orderId;
            } catch (error) {
              console.error('Error creating PayPal order:', error);
              const errorMessage = error instanceof Error ? error.message : 'Failed to create order';
              setError(errorMessage);
              if (onError) onError(error);
              throw error;
            }
          },
          onApprove: async (data: any) => {
            try {
              const response = await fetch('/api/paypal/capture-order', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                  orderId: data.orderID,
                  userId: user.uid,
                }),
              });

              if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to capture payment');
              }

              const captureResult = await response.json();
              
              if (onSuccess) {
                onSuccess(captureResult);
              } else {
                // Default success behavior - redirect to success page
                router.push(`/success?courseId=${courseId}&orderId=${captureResult.orderId}`);
              }

              return captureResult;
            } catch (error) {
              console.error('Error capturing PayPal payment:', error);
              const errorMessage = error instanceof Error ? error.message : 'Payment capture failed';
              setError(errorMessage);
              if (onError) onError(error);
              throw error;
            }
          },
          onError: (error: any) => {
            console.error('PayPal button error:', error);
            setError('حدث خطأ في عملية الدفع');
            if (onError) onError(error);
          },
          onCancel: (data: any) => {
            console.log('PayPal payment cancelled:', data);
            if (onCancel) {
              onCancel();
            } else {
              // Default cancel behavior - redirect to cancel page
              router.push(`/cancel?courseId=${courseId}`);
            }
          },
          style: {
            layout: 'vertical',
            color: 'blue',
            shape: 'rect',
            label: 'paypal',
            height: 45,
            tagline: false,
          },
        });

        if (paypalRef.current && buttons.isEligible()) {
          await buttons.render(paypalRef.current);
        } else {
          setError('PayPal buttons are not available');
        }
      } catch (error) {
        console.error('PayPal initialization error:', error);
        setError('فشل في تحميل PayPal');
        if (onError) onError(error);
      } finally {
        setIsLoading(false);
      }
    };

    initializePayPal();
  }, [courseId, user, disabled, router, onSuccess, onError, onCancel]);

  if (!user) {
    return (
      <div className="text-center p-4 bg-gray-50 rounded-lg">
        <p className="text-gray-600 mb-4">يجب تسجيل الدخول أولاً للشراء</p>
        <button
          onClick={() => router.push('/auth/login')}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          تسجيل الدخول
        </button>
      </div>
    );
  }

  if (disabled) {
    return (
      <div className="text-center p-4 bg-gray-50 rounded-lg">
        <p className="text-gray-500">الدفع غير متاح حالياً</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Price Display */}
      <div className="text-center mb-4">
        <span className="text-3xl font-bold text-blue-600">${amount}</span>
        <span className="text-gray-500 text-sm block">دفعة واحدة - وصول مدى الحياة</span>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm text-center">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="mr-3 text-gray-600">جاري تحميل PayPal...</span>
        </div>
      )}

      {/* PayPal Buttons Container */}
      <div 
        ref={paypalRef} 
        className={`w-full ${isLoading ? 'hidden' : ''}`}
        style={{ minHeight: isLoading ? '0' : '45px' }}
      />

      {/* Security Notice */}
      {paypalLoaded && !isLoading && (
        <p className="text-xs text-gray-500 text-center mt-3">
          🔒 دفع آمن عبر PayPal • ضمان استرداد المال
        </p>
      )}
    </div>
  );
}