'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { userAPI, type Course } from '@/lib/api';
import { AcademicCapIcon, PlayIcon, ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface UserCourse {
  _id: string;
  id: string;
  title: string;
  thumbnail: string;
  duration: number;
  lessons: any[];
  enrolledAt: string;
  progress?: {
    completedLessons: string[];
    status: 'not_started' | 'in_progress' | 'completed';
    lastAccessed?: string;
  };
}

export default function UserCourses() {
  const [courses, setCourses] = useState<UserCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchUserCourses = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Fetch user courses from API
        const response = await userAPI.getEnrolledCourses();
        
        if (response.data.success) {
          const coursesData = response.data.data?.courses || [];
          // Transform Course[] to UserCourse[]
          const transformedCourses: UserCourse[] = coursesData.map((course: Course) => ({
            _id: course._id,
            id: course._id, // Use _id as id if no separate id field
            title: course.title,
            thumbnail: course.thumbnail,
            duration: course.duration,
            lessons: course.lessons || [],
            enrolledAt: course.createdAt || new Date().toISOString(), // Use course creation date as fallback
            progress: undefined
          }));
          setCourses(transformedCourses);
          setError(null);
        } else {
          throw new Error(response.data.error || 'فشل في تحميل الدورات');
        }
      } catch (err: any) {
        console.error('Error fetching user courses:', err);
        setError('حدث خطأ أثناء تحميل الدورات. يرجى المحاولة مرة أخرى.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserCourses();
  }, [user]);

  // Format date for display
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  // Calculate progress percentage
  const calculateProgress = (course: UserCourse) => {
    if (!course.progress || !course.lessons || course.lessons.length === 0) {
      return 0;
    }
    
    const completedLessons = course.progress.completedLessons?.length || 0;
    const totalLessons = course.lessons.length;
    
    return Math.round((completedLessons / totalLessons) * 100);
  };

  // Get status text in Arabic
  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'مكتمل';
      case 'in_progress':
        return 'قيد التقدم';
      case 'not_started':
        return 'لم يبدأ';
      default:
        return 'غير محدد';
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-6">دوراتي التدريبية</h2>
      
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-8">
          <AcademicCapIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">لم تشترك في أي دورات بعد</h3>
          <p className="text-gray-600 mb-6">استكشف دوراتنا التدريبية واشترك فيها لتطوير مهاراتك</p>
          <Link 
            href="/courses"
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition duration-300"
          >
            استكشف الدورات
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => {
            const progressPercentage = calculateProgress(course);
            
            return (
              <div key={course.id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition duration-300">
                {course.thumbnail && (
                  <div className="relative h-40 overflow-hidden">
                    <img 
                      src={course.thumbnail} 
                      alt={course.title} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition duration-300">
                      <Link 
                        href={`/courses/${course.id}`}
                        className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition duration-300 flex items-center"
                      >
                        <PlayIcon className="h-5 w-5 ml-2" />
                        متابعة التعلم
                      </Link>
                    </div>
                  </div>
                )}
                
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-2">
                    <Link href={`/courses/${course.id}`} className="hover:text-primary transition duration-300">
                      {course.title}
                    </Link>
                  </h3>
                  
                  <div className="flex items-center text-sm text-gray-600 mb-4">
                    <ClockIcon className="h-4 w-4 ml-1" />
                    <span>{course.duration || '--'} ساعة</span>
                    
                    <span className="mx-2">•</span>
                    
                    <span>{course.lessons?.length || 0} درس</span>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">التقدم</span>
                      <span className="font-medium">{progressPercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-primary h-2.5 rounded-full" 
                        style={{ width: `${progressPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {course.enrolledAt && (
                    <div className="text-sm text-gray-600 mb-4">
                      <span>تاريخ الاشتراك: {formatDate(new Date(course.enrolledAt))}</span>
                    </div>
                  )}

                  {course.progress?.status && (
                    <div className="text-sm text-gray-600 mb-4">
                      <span>الحالة: {getStatusText(course.progress.status)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <Link
                      href={`/courses/${course.id}`}
                      className="text-primary hover:text-primary-dark transition duration-300 text-sm font-medium"
                    >
                      {progressPercentage === 100 ? 'مراجعة الدورة' : 'متابعة الدورة'}
                    </Link>
                    
                    {progressPercentage === 100 && (
                      <div className="flex items-center text-green-600 text-sm">
                        <CheckCircleIcon className="h-4 w-4 ml-1" />
                        مكتمل
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
