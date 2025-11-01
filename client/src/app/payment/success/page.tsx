'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

interface Order {
  courseId: string;
  courseTitle: string;
  amount: number;
  currency: string;
}

function PaymentSuccessContent() {
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handlePaymentSuccess = async () => {
      const paymentId = searchParams.get('paymentId');
      const PayerID = searchParams.get('PayerID');

      if (!paymentId || !PayerID) {
        setError('معرفات الدفع مفقودة');
        setLoading(false);
        return;
      }

      try {
        // Get auth token
        const token = document.cookie
          .split('; ')
          .find(row => row.startsWith('token='))
          ?.split('=')[1];

        if (!token) {
          setError('يجب تسجيل الدخول أولاً');
          setLoading(false);
          return;
        }

        // Capture the payment
        const response = await fetch('http://localhost:5050/api/payment/paypal/capture', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ orderId: paymentId }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.arabic || errorData.error || 'فشل في إتمام الدفع');
        }

        const data = await response.json();
        setOrder(data.order);
        
        // Redirect to course after 3 seconds
        setTimeout(() => {
          router.push(`/courses/${data.order.courseId}`);
        }, 3000);

      } catch (error: unknown) {
        console.error('Payment capture error:', error);
        const errorMessage = error instanceof Error ? error.message : 'حدث خطأ أثناء إتمام الدفع';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    handlePaymentSuccess();
  }, [searchParams, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#41ADE1] mx-auto mb-4"></div>
          <p className="text-gray-600">جاري إتمام الدفع...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">فشل في الدفع</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/courses')}
            className="bg-[#41ADE1] hover:bg-[#3399CC] text-white font-semibold py-2 px-4 rounded-lg"
          >
            العودة إلى الكورسات
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="text-green-500 mb-4">
          <CheckCircleIcon className="w-16 h-16 mx-auto" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">تم الدفع بنجاح!</h1>
        <p className="text-gray-600 mb-6">
          تم إتمام عملية الدفع بنجاح. يمكنك الآن الوصول إلى الكورس.
        </p>
        {order && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600">
              <strong>الكورس:</strong> {order.courseTitle}
            </p>
            <p className="text-sm text-gray-600">
              <strong>المبلغ:</strong> {order.amount} {order.currency}
            </p>
          </div>
        )}
        <p className="text-sm text-gray-500 mb-4">
          سيتم توجيهك إلى الكورس خلال 3 ثوانٍ...
        </p>
        <button
          onClick={() => router.push(`/courses/${order?.courseId}`)}
          className="bg-[#41ADE1] hover:bg-[#3399CC] text-white font-semibold py-2 px-4 rounded-lg"
        >
          الذهاب إلى الكورس الآن
        </button>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#41ADE1] mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
