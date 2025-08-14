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
import { ChevronLeftIcon, ChevronRightIcon, CheckIcon } from '@heroicons/react/24/outline';

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
        if (courseData.lessons.length > 0 && !currentLessonId) {
          setCurrentLessonId(courseData.lessons[0].id);
        }
        
        // Load progress from localStorage
        loadProgress(courseId);
        
        // Check enrollment status (dummy check for now)
        checkEnrollmentStatus(courseId);
        
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
  }, [courseId, getCourseById, router, currentLessonId]);

  // Load progress from localStorage
  const loadProgress = (courseId: string) => {
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

  // Check enrollment status (dummy implementation)
  const checkEnrollmentStatus = (courseId: string) => {
    if (user) {
      // For demo purposes, consider first 3 courses as enrolled
      const enrolledCourses = ['1', '2', '3'];
      setIsEnrolled(enrolledCourses.includes(courseId));
    } else {
      // User not logged in - not enrolled
      setIsEnrolled(false);
    }
  };

  // Mark lesson as complete
  const markLessonComplete = (lessonId: string) => {
    if (!course) return;
    
    const newCompletedLessons = [...progress.completedLessons];
    if (!newCompletedLessons.includes(lessonId)) {
      newCompletedLessons.push(lessonId);
    }
    
    const progressPercentage = (newCompletedLessons.length / course.lessons.length) * 100;
    
    const newProgress = {
      ...progress,
      completedLessons: newCompletedLessons,
      progressPercentage
    };
    
    saveProgress(newProgress);
  };

  // Navigate to next/previous lesson
  const navigateLesson = (direction: 'next' | 'prev') => {
    if (!course) return;
    
    const currentIndex = course.lessons.findIndex(lesson => lesson.id === currentLessonId);
    let newIndex;
    
    if (direction === 'next' && currentIndex < course.lessons.length - 1) {
      newIndex = currentIndex + 1;
    } else if (direction === 'prev' && currentIndex > 0) {
      newIndex = currentIndex - 1;
    } else {
      return;
    }
    
    const newLessonId = course.lessons[newIndex].id;
    setCurrentLessonId(newLessonId);
    
    const newProgress = {
      ...progress,
      currentLesson: newLessonId
    };
    saveProgress(newProgress);
  };

  const currentLesson = course?.lessons.find(lesson => lesson.id === currentLessonId);
  const currentLessonIndex = course?.lessons.findIndex(lesson => lesson.id === currentLessonId) ?? -1;
  const isLessonCompleted = progress.completedLessons.includes(currentLessonId);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SkeletonLoader />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">الكورس غير موجود</h1>
          <button
            onClick={() => router.push('/courses')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            العودة للكورسات
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
        {/* Course Header */}
        <CourseHeader 
          course={course}
          isEnrolled={isEnrolled}
          progress={progress.progressPercentage}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content - Video Player */}
            <div className="lg:col-span-3">
              {isEnrolled ? (
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                  {/* Lesson Header */}
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold text-gray-900">
                        {currentLesson?.title || 'اختر درساً'}
                      </h2>
                      <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="lg:hidden bg-blue-600 text-white px-4 py-2 rounded-lg"
                      >
                        قائمة الدروس
                      </button>
                    </div>
                    
                    {currentLesson && (
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>الدرس {currentLessonIndex + 1} من {course.lessons.length}</span>
                        <span>•</span>
                        <span>{currentLesson.duration} دقيقة</span>
                        {isLessonCompleted && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-green-600">
                              <CheckIcon className="w-4 h-4" />
                              مكتمل
                            </span>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Video Player */}
                  {currentLesson && (
                    <div className="relative">
                      <SecurePlayer 
                        url={currentLesson.videoUrl}
                        title={currentLesson.title}
                      />
                    </div>
                  )}

                  {/* Lesson Controls */}
                  <div className="p-6 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex gap-4">
                        <button
                          onClick={() => navigateLesson('prev')}
                          disabled={currentLessonIndex === 0}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronRightIcon className="w-4 h-4" />
                          الدرس السابق
                        </button>
                        
                        <button
                          onClick={() => navigateLesson('next')}
                          disabled={currentLessonIndex === course.lessons.length - 1}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          الدرس التالي
                          <ChevronLeftIcon className="w-4 h-4" />
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
                        <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700">
                          شراء الكورس - ${course.price}
                        </button>
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
   
  );
}
