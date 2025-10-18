'use client';

import ReviewManager from '@/components/admin/ReviewManager';

export default function AdminReviewsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">إدارة التقييمات</h1>
        <p className="mt-2 text-sm text-gray-600">
          إدارة جميع تقييمات الدورات - عرض، إخفاء، أو حذف التقييمات
        </p>
      </div>
      
      <ReviewManager />
    </div>
  );
}
