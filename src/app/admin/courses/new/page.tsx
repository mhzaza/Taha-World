'use client';

import { ArrowRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import CourseForm from '@/components/admin/CourseForm';

export default function NewCoursePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link
                href="/admin/courses"
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowRightIcon className="h-5 w-5 ml-2" />
                العودة إلى قائمة الكورسات
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <CourseForm />
      </div>
    </div>
  );
}