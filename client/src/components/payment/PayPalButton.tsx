'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface PayPalButtonProps {
  courseId: string;
  courseTitle: string;
  amount: number;
  currency: string;
  onSuccess?: (order: any) => void;
  onError?: (error: string) => void;
}

export default function PayPalButton({ 
  courseId, 
  courseTitle, 
  amount, 
  currency, 
  onSuccess, 
  onError 
}: PayPalButtonProps) {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handlePayment = async () => {
    if (!user) {
      onError?.('يجب تسجيل الدخول أولاً');
      return;
    }

    setLoading(true);
    
    try {
      // Get auth token
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];

      if (!token) {
        onError?.('يجب تسجيل الدخول أولاً');
        return;
      }

      // Create PayPal order
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050/api'}/payment/paypal/create-order`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ courseId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.arabic || errorData.error || 'فشل في إنشاء طلب الدفع');
      }

      const data = await response.json();
      
      // Redirect to PayPal
      window.location.href = data.approvalUrl;

    } catch (error: any) {
      console.error('Payment error:', error);
      onError?.(error.message || 'حدث خطأ أثناء الدفع');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading || !user}
      className="w-full bg-[#41ADE1] hover:bg-[#3399CC] disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
    >
      {loading ? (
        <>
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white ml-2"></div>
          جاري التوجيه إلى PayPal...
        </>
      ) : (
        <>
          <svg className="w-5 h-5 ml-2" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.543-.676c-.608-.685-1.47-1.074-2.543-1.074H8.957c-.524 0-.968.382-1.05.9L6.33 19.041h4.746c.524 0 .968-.382 1.05-.9l1.12-7.106h2.19c2.57 0 4.578-.543 5.69-1.81 1.01-1.15 1.304-2.42 1.012-4.287-.023-.143-.047-.288-.077-.437z"/>
          </svg>
          ادفع بـ PayPal - {amount} {currency}
        </>
      )}
    </button>
  );
}