'use client';

import { useRouter } from 'next/navigation';
import { ShieldExclamationIcon, HomeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function ForbiddenPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        {/* Icon */}
        <div className="mb-8">
          <ShieldExclamationIcon className="h-24 w-24 text-red-500 mx-auto" />
        </div>

        {/* Error Code */}
        <h1 className="text-6xl font-bold text-gray-900 mb-4">403</h1>
        
        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          غير مصرح بالوصول
        </h2>
        
        {/* Description */}
        <p className="text-gray-600 mb-8 leading-relaxed">
          عذراً، ليس لديك الصلاحية اللازمة للوصول إلى هذه الصفحة. 
          هذه المنطقة مخصصة للمديرين فقط.
        </p>

        {/* Action Buttons */}
        <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
          <button
            onClick={() => router.back()}
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-500 transition-colors duration-200"
          >
            <ArrowLeftIcon className="h-5 w-5 ml-2" />
            العودة للخلف
          </button>
          
          <button
            onClick={() => router.push('/')}
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 bg-[#41ADE1] text-white rounded-lg hover:bg-[#3399CC] transition-colors duration-200"
          >
            <HomeIcon className="h-5 w-5 ml-2" />
            الصفحة الرئيسية
          </button>
        </div>

        {/* Contact Info */}
        <div className="mt-12 p-6 bg-white rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            تحتاج صلاحية إدارية؟
          </h3>
          <p className="text-gray-600 text-sm">
            إذا كنت تعتقد أنه يجب أن تكون لديك صلاحية للوصول إلى هذه المنطقة،
            يرجى التواصل مع فريق الدعم الفني.
          </p>
          <div className="mt-4">
            <a
              href="mailto:admin@tahasabag.com"
              className="text-[#41ADE1] hover:text-[#3399CC] font-medium text-sm"
            >
              admin@tahasabag.com
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-xs text-gray-500">
          <p>منصة طه صباغ للتدريب الرياضي</p>
          <p className="mt-1">جميع الحقوق محفوظة © 2024</p>
        </div>
      </div>
    </div>
  );
}