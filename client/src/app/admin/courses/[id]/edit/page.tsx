'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import CourseForm, { CourseFormData } from '@/components/admin/CourseForm';
import { courseAPI, adminAPI, apiUtils, type Course } from '@/lib/api';

export default function EditCoursePage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id as string;
  
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
    timestamp: Date;
  }>>([]);

  // Add notification function
  const addNotification = (type: 'success' | 'error' | 'info' | 'warning', message: string) => {
    const notification = {
      id: Date.now().toString(),
      type,
      message,
      timestamp: new Date()
    };
    setNotifications(prev => [notification, ...prev.slice(0, 4)]);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  };

  // Fetch course data
  useEffect(() => {
    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      setFetchLoading(true);
      
      // Validate courseId format (MongoDB ObjectId should be 24 characters)
      if (!courseId || courseId.length !== 24) {
        console.error('Invalid course ID format:', courseId);
        addNotification('error', 'معرف الكورس غير صحيح');
        router.push('/admin/courses');
        return;
      }
      
      console.log('Fetching course with ID:', courseId);
      const response = await adminAPI.getCourse(courseId);
      console.log('Course API response:', response.data);
      
      if (response.data.success) {
        // The API returns { success: true, course: {...} } directly
        console.log('Course data:', (response.data as any).course);
        setCourse((response.data as any).course || null);
      } else {
        addNotification('error', (response.data as any).arabic || (response.data as any).error || 'فشل في جلب بيانات الكورس');
        router.push('/admin/courses');
      }
    } catch (error) {
      console.error('Error fetching course:', error);
      console.error('Error details:', error);
      
      let errorMessage = 'حدث خطأ أثناء جلب بيانات الكورس';
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as any;
        if (axiosError.response?.status === 404) {
          errorMessage = 'الكورس غير موجود';
        } else if (axiosError.response?.data?.arabic) {
          errorMessage = axiosError.response.data.arabic;
        } else if (axiosError.response?.data?.error) {
          errorMessage = axiosError.response.data.error;
        }
      }
      
      addNotification('error', errorMessage);
      // Don't redirect immediately, let the user see the error
    } finally {
      setFetchLoading(false);
    }
  };

  const handleSubmit = async (formData: CourseFormData) => {
    try {
      setLoading(true);
      
      console.log('Submitting course update with data:', formData);
      
      const response = await adminAPI.updateCourse(courseId, formData as any);
      
      if (response.data.success) {
        addNotification('success', 'تم تحديث الكورس بنجاح!');
        // Redirect to courses list after a short delay
        setTimeout(() => {
          router.push('/admin/courses');
        }, 1500);
      } else {
        addNotification('error', response.data.arabic || response.data.error || 'خطأ في تحديث الكورس');
      }
    } catch (error) {
      console.error('Error updating course:', error);
      const errorMessage = apiUtils.handleApiError(error);
      addNotification('error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Convert course data to form data format
  const getInitialFormData = (course: Course): Partial<CourseFormData> => {
    return {
      title: course.title,
      titleEn: course.titleEn || '',
      description: course.description,
      descriptionEn: course.descriptionEn || '',
      price: course.price,
      originalPrice: course.originalPrice || 0,
      currency: course.currency,
      duration: course.duration,
      level: course.level,
      category: course.category,
      tags: course.tags,
      requirements: course.requirements || [],
      whatYouWillLearn: course.whatYouWillLearn,
      language: course.language,
      subtitles: course.subtitles || [],
      isPublished: course.isPublished,
      isFeatured: course.isFeatured,
      thumbnail: course.thumbnail,
      instructor: {
        id: course.instructor.id,
        name: course.instructor.name,
        bio: course.instructor.bio || '',
        credentials: course.instructor.credentials || [],
      },
    };
  };

  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#41ADE1] mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل بيانات الكورس...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">لم يتم العثور على الكورس</p>
          <button
            onClick={() => router.push('/admin/courses')}
            className="mt-4 px-4 py-2 bg-[#41ADE1] text-white rounded-md hover:bg-[#3399CC]"
          >
            العودة إلى الكورسات
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg shadow-lg max-w-sm ${
                notification.type === 'success' ? 'bg-green-100 border border-green-200 text-green-800' :
                notification.type === 'error' ? 'bg-red-100 border border-red-200 text-red-800' :
                notification.type === 'warning' ? 'bg-yellow-100 border border-yellow-200 text-yellow-800' :
                'bg-[#41ADE1]/30 border border-[#41ADE1]/40 text-[#41ADE1]'
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{notification.message}</p>
                <button
                  onClick={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={() => router.push('/admin/courses')}
              className="inline-flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowRightIcon className="h-5 w-5 ml-1" />
              العودة إلى الكورسات
            </button>
          </div>
          
          <div>
            <h1 className="text-3xl font-bold text-gray-900">تعديل الكورس</h1>
            <p className="mt-2 text-gray-600">تعديل تفاصيل الكورس: {course.title}</p>
          </div>
        </div>

        {/* Course Form */}
        <CourseForm
          initialData={getInitialFormData(course)}
          onSubmit={handleSubmit}
          submitText="حفظ التغييرات"
          loading={loading}
        />
      </div>
    </div>
  );
}
