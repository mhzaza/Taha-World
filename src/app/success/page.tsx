'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCourses } from '@/hooks/useCourses';
import { Course } from '@/types';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

export default function SuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { getCourseById } = useCourses();
  
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [courseId, setCourseId] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal'>('stripe');

  useEffect(() => {
    const sessionIdParam = searchParams.get('session_id');
    const courseIdParam = searchParams.get('courseId');
    const orderIdParam = searchParams.get('orderId');
    
    setSessionId(sessionIdParam);
    setCourseId(courseIdParam);
    setOrderId(orderIdParam);
    
    // Determine payment method based on parameters
    if (courseIdParam && orderIdParam) {
      setPaymentMethod('paypal');
      // Load course data for PayPal payments
      const courseData = getCourseById(courseIdParam);
      if (courseData) {
        setCourse(courseData);
      }
    } else if (sessionIdParam) {
      setPaymentMethod('stripe');
    }
    
    setLoading(false);
  }, [searchParams, getCourseById]);

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

        {/* Course Info for PayPal */}
        {paymentMethod === 'paypal' && course && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">{course.title}</h3>
            <p className="text-sm text-gray-600">
              {course.lessons?.length} درس • {course.duration}
            </p>
          </div>
        )}

        {/* Order Details */}
        {orderId && (
          <div className="text-sm text-gray-500 mb-4">
            <p>رقم الطلب: {orderId}</p>
          </div>
        )}
        
        {/* Session ID (for Stripe debugging) */}
        {sessionId && paymentMethod === 'stripe' && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-500 mb-1">معرف الجلسة:</p>
            <p className="text-xs font-mono text-gray-700 break-all">
              {sessionId}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Show "Start Learning" button for PayPal purchases with courseId */}
          {paymentMethod === 'paypal' && courseId && (
            <button
              onClick={() => router.push(`/courses/${courseId}`)}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 space-x-reverse"
            >
              <span>ابدأ التعلم الآن</span>
              <ArrowRightIcon className="w-5 h-5" />
            </button>
          )}
          
          <button
            onClick={() => router.push('/dashboard')}
            className={`w-full px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 space-x-reverse ${
              paymentMethod === 'paypal' && courseId 
                ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
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