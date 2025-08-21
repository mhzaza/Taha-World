'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import CourseForm from '@/components/admin/CourseForm';
import AdminLayout from '@/components/layouts/AdminLayout';
// Remove unused import since LoadingSkeleton component is not being used
import { Course } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

export default function EditCoursePage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
const { user } = useAuth();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 2;
  
  // Fetch course data
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        console.log('Fetching course with ID:', courseId, 'Attempt:', retryCount + 1);
        const token = user ? await user.getIdToken() : null;
        const response = await fetch(`/api/admin/courses/${courseId}`, {
          // Add cache: 'no-store' to prevent caching issues
          cache: 'no-store',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('API error response:', response.status, errorData);
          throw new Error(errorData.error || 'فشل في تحميل بيانات الكورس');
        }
        
        const data = await response.json();
        console.log('Course data received:', data.course ? 'success' : 'empty');
        
        if (!data.course) {
          throw new Error('لم يتم العثور على بيانات الكورس');
        }
        
        setCourse(data.course);
      } catch (error) {
        console.error('Error fetching course:', error);
        setError(error instanceof Error ? error.message : 'حدث خطأ أثناء تحميل الكورس');
        
        // Retry logic
        if (retryCount < MAX_RETRIES) {
          console.log(`Retrying fetch (${retryCount + 1}/${MAX_RETRIES})...`);
          setRetryCount(prev => prev + 1);
          return; // Will trigger useEffect again due to retryCount change
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourse();
  }, [courseId, retryCount]);

  if (loading) {
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

        {/* Loading Content */}
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="p-6 space-y-6">
                {/* Loading skeleton */}
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                    <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
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

        {/* Error Content */}
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white shadow rounded-lg">
              <div className="p-6 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="mt-2 text-sm font-medium text-gray-900">خطأ في تحميل الكورس</h3>
                <p className="mt-1 text-sm text-gray-500">{error}</p>
                <div className="mt-6">
                  <Link
                    href="/admin/courses"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                  >
                    العودة إلى قائمة الكورسات
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
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

        {/* Not Found Content */}
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white shadow rounded-lg">
              <div className="p-6 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100">
                  <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.5-.816-6.207-2.179C5.207 12.821 5.207 12.821 5.207 12.821L3 13.5l1.207-.679C5.793 11.179 8.66 10 12 10s6.207 1.179 7.793 2.821L21 13.5l-1.207-.679s0 0 0 0C18.207 11.179 15.34 10 12 10z" />
                  </svg>
                </div>
                <h3 className="mt-2 text-sm font-medium text-gray-900">الكورس غير موجود</h3>
                <p className="mt-1 text-sm text-gray-500">لم يتم العثور على الكورس المطلوب</p>
                <div className="mt-6">
                  <Link
                    href="/admin/courses"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                  >
                    العودة إلى قائمة الكورسات
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
        <CourseForm course={course} isEditing={true} />
      </div>
    </div>
  );
}