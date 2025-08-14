'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCourses } from '@/hooks/useCourses';
import { Course, Lesson } from '@/types';
// Removed RequireAuth import - course details should be viewable without login
import SecurePlayer from '@/components/course/SecurePlayer';
import LessonsList from '@/components/course/LessonsList';
import CourseHeader from '@/components/course/CourseHeader';
import SkeletonLoader from '@/components/ui/SkeletonLoader';
import { useCheckout, checkEnrollmentStatus } from '@/lib/checkout';
import { ChevronLeftIcon, ChevronRightIcon, CheckIcon, CreditCardIcon } from '@heroicons/react/24/outline';

interface CourseProgress {
  completedLessons: string[];
  currentLesson: string;
  progressPercentage: number;
}

export default function CoursePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { getCourseById } = useCourses();
  const { initiateCheckout, isAuthenticated } = useCheckout();
  
  const courseId = params.id as string;
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentLessonId, setCurrentLessonId] = useState<string>('');
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [progress, setProgress] = useState<CourseProgress>({
    completedLessons: [],
    currentLesson: '',
    progressPercentage: 0
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [purchaseLoading, setPurchaseLoading] = useState(false);

  // Load course data
  useEffect(() => {
    const loadCourse = async () => {
      try {
        const courseData = getCourseById(courseId);
        if (!courseData) {
          router.push('/404');
          return;
        }
        setCourse(courseData);
        
        // Set first lesson as current if none selected
        if (courseData.lessons && courseData.lessons.length > 0) {
          setCurrentLessonId(courseData.lessons[0].id);
        }
        
        checkUserEnrollment(courseId);
      } catch (error) {
        console.error('Error loading course:', error);
        router.push('/404');
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      loadCourse();
    }
  }, [courseId, getCourseById, router]);

  // Load progress from localStorage
  const loadProgress = () => {
    const savedProgress = localStorage.getItem(`course_progress_${courseId}`);
    if (savedProgress) {
      const progressData = JSON.parse(savedProgress);
      setProgress(progressData);
      if (progressData.currentLesson) {
        setCurrentLessonId(progressData.currentLesson);
      }
    }
  };

  // Save progress to localStorage
  const saveProgress = (newProgress: CourseProgress) => {
    localStorage.setItem(`course_progress_${courseId}`, JSON.stringify(newProgress));
    setProgress(newProgress);
  };

  // Check enrollment status
  useEffect(() => {
    if (course) {
      if (user) {
        // In a real app, this would check against user's purchased courses
        // For now, we'll simulate enrollment for demo purposes
        const enrolled = Math.random() > 0.5; // 50% chance of being enrolled
        setIsEnrolled(enrolled);
        
        if (enrolled) {
          loadProgress();
        }
      } else {
        // User not logged in - not enrolled
        setIsEnrolled(false);
      }
    }
  }, [user, course]);

  // Check enrollment status
  const checkUserEnrollment = async (courseId: string) => {
    if (user) {
      try {
        const enrolled = await checkEnrollmentStatus(user.uid, courseId);
        setIsEnrolled(enrolled);
      } catch (error) {
        console.error('Error checking enrollment:', error);
        setIsEnrolled(false);
      }
    } else {
      setIsEnrolled(false);
    }
  };

  // Handle course purchase
  const handlePurchase = async () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    if (!course) return;

    setPurchaseLoading(true);
    try {
      await initiateCheckout(courseId);
    } catch (error) {
      console.error('Purchase error:', error);
      alert('حدث خطأ أثناء عملية الشراء. يرجى المحاولة مرة أخرى.');
    } finally {
      setPurchaseLoading(false);
    }
  };

  // Mark lesson as complete
  const markLessonComplete = (lessonId: string) => {
    if (!isEnrolled) return;
    
    const newCompletedLessons = [...progress.completedLessons];
    if (!newCompletedLessons.includes(lessonId)) {
      newCompletedLessons.push(lessonId);
    }
    
    const totalLessons = course?.lessons?.length || 0;
    const progressPercentage = Math.round((newCompletedLessons.length / totalLessons) * 100);
    
    const newProgress = {
      ...progress,
      completedLessons: newCompletedLessons,
      currentLesson: currentLessonId,
      progressPercentage
    };
    
    saveProgress(newProgress);
  };

  // Navigate to next/previous lesson
  const navigateLesson = (direction: 'next' | 'prev') => {
    if (!course?.lessons) return;
    
    const currentIndex = course.lessons.findIndex(lesson => lesson.id === currentLessonId);
    let newIndex;
    
    if (direction === 'next') {
      newIndex = currentIndex + 1;
    } else {
      newIndex = currentIndex - 1;
    }
    
    if (newIndex >= 0 && newIndex < course.lessons.length) {
      setCurrentLessonId(course.lessons[newIndex].id);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SkeletonLoader type="course" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">الكورس غير موجود</h1>
          <p className="text-gray-600 mb-6">عذراً، لم نتمكن من العثور على الكورس المطلوب</p>
          <button 
            onClick={() => router.push('/courses')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            العودة إلى الكورسات
          </button>
        </div>
      </div>
    );
  }

  const currentLesson = course.lessons?.find(lesson => lesson.id === currentLessonId);
  const currentLessonIndex = course.lessons?.findIndex(lesson => lesson.id === currentLessonId) || 0;
  const isLessonCompleted = progress.completedLessons.includes(currentLessonId);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Course Header */}
      <CourseHeader 
        course={course}
        isEnrolled={isEnrolled}
        progress={progress.progressPercentage}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content - Video Player */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              {isEnrolled ? (
                <div>
                  {/* Video Player */}
                  <div className="relative">
                    {currentLesson ? (
                      <SecurePlayer
                        videoUrl={currentLesson.videoUrl}
                        title={currentLesson.title}
                        onProgress={() => {}}
                      />
                    ) : (
                      <div className="aspect-video bg-gray-200 flex items-center justify-center">
                        <p className="text-gray-500">لا يوجد درس محدد</p>
                      </div>
                    )}
                  </div>

                  {/* Lesson Info and Controls */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">
                          {currentLesson?.title}
                        </h2>
                        <p className="text-sm text-gray-600">
                          الدرس {currentLessonIndex + 1} من {course.lessons?.length}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <button
                          onClick={() => navigateLesson('prev')}
                          disabled={currentLessonIndex === 0}
                          className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronRightIcon className="w-5 h-5" />
                        </button>
                        
                        <button
                          onClick={() => navigateLesson('next')}
                          disabled={currentLessonIndex === (course.lessons?.length || 0) - 1}
                          className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronLeftIcon className="w-5 h-5" />
                        </button>
                      </div>

                      <button
                        onClick={() => markLessonComplete(currentLessonId)}
                        disabled={isLessonCompleted}
                        className={`px-6 py-2 rounded-lg font-medium ${
                          isLessonCompleted
                            ? 'bg-green-100 text-green-700 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {isLessonCompleted ? 'مكتمل' : 'تم الانتهاء'}
                      </button>
                    </div>

                    {/* Lesson Description */}
                    {currentLesson?.description && (
                      <div className="mt-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">وصف الدرس</h3>
                        <p className="text-gray-700 leading-relaxed">
                          {currentLesson.description}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                // Locked State - Not Enrolled or Not Logged In
                <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                  <div className="mb-6">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">محتوى مقفل</h3>
                    {!user ? (
                      <>
                        <p className="text-gray-600 mb-6">
                          يجب تسجيل الدخول أولاً للوصول إلى محتوى الكورس
                        </p>
                        <div className="space-y-3">
                          <button 
                            onClick={() => router.push('/auth/login')}
                            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 w-full"
                          >
                            تسجيل الدخول
                          </button>
                          <button 
                            onClick={() => router.push('/auth/register')}
                            className="bg-gray-200 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-300 w-full"
                          >
                            إنشاء حساب جديد
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="text-gray-600 mb-6">
                          يجب شراء الكورس للوصول إلى الدروس والمحتوى
                        </p>
                        <div className="space-y-4">
                          <div className="text-center">
                            <span className="text-3xl font-bold text-blue-600">${course.price}</span>
                            <span className="text-gray-500 text-sm block">دفعة واحدة - وصول مدى الحياة</span>
                          </div>
                          <button 
                            onClick={handlePurchase}
                            disabled={purchaseLoading}
                            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 space-x-reverse w-full"
                          >
                            {purchaseLoading ? (
                              <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                <span>جاري المعالجة...</span>
                              </>
                            ) : (
                              <>
                                <CreditCardIcon className="w-5 h-5" />
                                <span>شراء الكورس الآن</span>
                              </>
                            )}
                          </button>
                          <p className="text-xs text-gray-500 text-center">
                            💳 دفع آمن عبر Stripe • ضمان استرداد المال خلال 30 يوم
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar - Lessons List */}
            <div className="lg:col-span-1">
              <LessonsList
                course={course}
                currentLessonId={currentLessonId}
                onLessonSelect={setCurrentLessonId}
                completedLessons={progress.completedLessons}
                isEnrolled={isEnrolled}
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}