'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import CourseForm, { CourseFormData } from '@/components/admin/CourseForm';
import { courseAPI, apiUtils } from '@/lib/api';

export default function NewCoursePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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

  const handleSubmit = async (formData: CourseFormData) => {
    try {
      setLoading(true);
      
      const response = await courseAPI.createCourse(formData as any);
      
      if (response.data.success) {
        // Backend returns { success: true, data: course } directly
        const courseId = response.data.data?.course._id;
        addNotification('success', 'تم إنشاء الكورس بنجاح! سيتم توجيهك لإضافة الدروس...');
        // Redirect to lesson management page directly
        setTimeout(() => {
          router.push(`/admin/courses/${courseId}/lessons`);
        }, 1500);
      } else {
        addNotification('error', response.data.arabic || response.data.error || 'خطأ في إنشاء الكورس');
      }
    } catch (error) {
      console.error('Error creating course:', error);
      const errorMessage = apiUtils.handleApiError(error);
      addNotification('error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

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
                'bg-blue-100 border border-blue-200 text-blue-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium">{notification.message}</p>
                  {notification.type === 'success' && (
                    <p className="text-xs mt-1 text-green-600">
                      💡 تذكر: أضف الدروس لجعل الكورس جاهزاً للنشر
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
                  className="text-gray-400 hover:text-gray-600 ml-2"
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
            <h1 className="text-3xl font-bold text-gray-900">إنشاء كورس جديد</h1>
            <p className="mt-2 text-gray-600">أنشئ كورساً جديداً وأضف جميع التفاصيل المطلوبة</p>
          </div>
        </div>

        {/* Course Form */}
        <CourseForm
          onSubmit={handleSubmit}
          submitText="إنشاء الكورس"
          loading={loading}
        />
      </div>
    </div>
  );
}
