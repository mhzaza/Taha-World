'use client';

import { useRouter } from 'next/navigation';
import { HomeIcon, AcademicCapIcon } from '@heroicons/react/24/outline';

export default function NotFoundPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="text-6xl font-bold text-gray-300 mb-4">404</div>
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AcademicCapIcon className="w-12 h-12 text-blue-600" />
          </div>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            الصفحة غير موجودة
          </h1>
          <p className="text-gray-600 leading-relaxed">
            عذراً، لم نتمكن من العثور على الصفحة التي تبحث عنها. 
            قد تكون الصفحة قد تم نقلها أو حذفها.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={() => router.push('/')}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <HomeIcon className="w-5 h-5" />
            العودة للرئيسية
          </button>
          
          <button
            onClick={() => router.push('/courses')}
            className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
          >
            <AcademicCapIcon className="w-5 h-5" />
            تصفح الكورسات
          </button>
          
          <button
            onClick={() => router.back()}
            className="w-full text-blue-600 py-2 px-4 rounded-lg font-medium hover:bg-blue-50 transition-colors"
          >
            العودة للصفحة السابقة
          </button>
        </div>

        {/* Help Section */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">
            هل تحتاج مساعدة؟
          </p>
          <div className="flex justify-center space-x-4 text-sm">
            <a 
              href="/contact" 
              className="text-blue-600 hover:text-blue-700 transition-colors"
            >
              تواصل معنا
            </a>
            <span className="text-gray-300">|</span>
            <a 
              href="/help" 
              className="text-blue-600 hover:text-blue-700 transition-colors"
            >
              مركز المساعدة
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}