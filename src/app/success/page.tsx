'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

export default function SuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sessionIdParam = searchParams.get('session_id');
    setSessionId(sessionIdParam);
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
        {/* Success Icon */}
        <div className="mb-6">
          <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto" />
        </div>

        {/* Success Message */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          تم الدفع بنجاح!
        </h1>
        
        <p className="text-gray-600 mb-6 leading-relaxed">
          شكراً لك على شراء الكورس. تم تسجيلك بنجاح ويمكنك الآن الوصول إلى جميع دروس الكورس.
        </p>

        {/* Session ID (for debugging) */}
        {sessionId && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-500 mb-1">معرف الجلسة:</p>
            <p className="text-xs font-mono text-gray-700 break-all">
              {sessionId}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 space-x-reverse"
          >
            <span>الذهاب إلى لوحة التحكم</span>
            <ArrowRightIcon className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => router.push('/courses')}
            className="w-full bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            تصفح المزيد من الكورسات
          </button>
        </div>

        {/* Additional Info */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            ستتلقى رسالة تأكيد عبر البريد الإلكتروني قريباً
          </p>
        </div>
      </div>
    </div>
  );
}