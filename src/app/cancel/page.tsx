'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { XCircleIcon } from '@heroicons/react/24/solid';
import { ArrowRightIcon, CreditCardIcon } from '@heroicons/react/24/outline';

export default function CancelPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [courseId, setCourseId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for both Stripe (course_id) and PayPal (courseId) parameters
    const courseIdParam = searchParams.get('course_id') || searchParams.get('courseId');
    setCourseId(courseIdParam);
    setLoading(false);
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* Cancel Icon */}
        <div className="mb-6">
          <XCircleIcon className="w-16 h-16 text-red-500 mx-auto" />
        </div>

        {/* Cancel Message */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          تم إلغاء عملية الدفع
        </h1>
        
        <p className="text-gray-600 mb-6 leading-relaxed">
          لم تكتمل عملية الشراء. لا تقلق، لم يتم خصم أي مبلغ من حسابك.
        </p>

        {/* Payment Method Info */}
        <div className="text-sm text-gray-500 mb-4">
          <p>يمكنك استخدام PayPal أو بطاقة ائتمان للدفع</p>
        </div>

        {/* Reassurance */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-700">
            💡 يمكنك المحاولة مرة أخرى في أي وقت. الكورس سيبقى متاحاً لك.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {courseId && (
            <button
              onClick={() => router.push(`/courses/${courseId}`)}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 space-x-reverse"
            >
              <CreditCardIcon className="w-5 h-5" />
              <span>المحاولة مرة أخرى</span>
            </button>
          )}
          
          <button
            onClick={() => router.push('/courses')}
            className="w-full bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors flex items-center justify-center space-x-2 space-x-reverse"
          >
            <span>تصفح الكورسات</span>
            <ArrowRightIcon className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => router.push('/')}
            className="w-full text-gray-500 px-6 py-2 rounded-lg hover:text-gray-700 transition-colors"
          >
            العودة إلى الصفحة الرئيسية
          </button>
        </div>

        {/* Help Section */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-2">
            تحتاج مساعدة؟
          </p>
          <div className="flex justify-center space-x-4 space-x-reverse">
            <button className="text-sm text-blue-600 hover:text-blue-700">
              تواصل معنا
            </button>
            <span className="text-gray-300">|</span>
            <button className="text-sm text-blue-600 hover:text-blue-700">
              الأسئلة الشائعة
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}