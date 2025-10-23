'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import type { Course, Lesson } from '@/types';
import { Certificate } from '@/lib/api';
import Cookies from 'js-cookie';
import EnhancedMediaPlayer from '@/components/course/EnhancedMediaPlayer';
import LessonsList from '@/components/course/LessonsList';
import CourseHeader from '@/components/course/CourseHeader';
import CourseReviews from '@/components/course/CourseReviews';
import CongratulationsPopup from '@/components/course/CongratulationsPopup';
import CertifiedUserReviewPopup from '@/components/course/CertifiedUserReviewPopup';
import SkeletonLoader from '@/components/ui/SkeletonLoader';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { generateCertificatePDF } from '@/utils/certificateGenerator';
import { userAPI, reviewsAPI } from '@/lib/api';
// Firebase imports removed - using API calls instead

interface CourseProgress {
  completedLessons: string[];
  currentLesson: string;
  progressPercentage: number;
}

interface CourseResponse {
  course?: Course;
  _id?: string;
  id?: string;
  lessons?: Array<{
    _id?: string;
    id?: string;
    order?: number;
    isFree?: boolean;
    [key: string]: unknown;
  }>;
  rating?: { average: number; count: number };
  enrollmentCount?: number;
  isEnrolled?: boolean;
  [key: string]: unknown;
}

const EMPTY_PROGRESS: CourseProgress = {
  completedLessons: [],
  currentLesson: '',
  progressPercentage: 0,
};

const FIRST_LESSON_INDEX = 0;

const AR = {
  invalidCourseId: 'معرف الدورة غير صحيح.',
  courseNotFound: 'لم يتم العثور على الدورة المطلوبة.',
  loadError: 'حدث خطأ أثناء تحميل الدورة. يرجى المحاولة مرة أخرى.',
  unexpectedLoadError: 'حدث خطأ غير متوقع أثناء تحميل تفاصيل الدورة.',
  genericErrorTitle: 'حدث خطأ غير متوقع',
  notFoundHint: 'تأكد من صحة الرابط أو اختر دورة مختلفة من قائمة الدورات.',
  genericErrorHint: 'واجهنا مشكلة أثناء تحميل تفاصيل الدورة. يرجى المحاولة من جديد أو التواصل مع الدعم الفني.',
  retry: 'إعادة المحاولة',
  backToCourses: 'العودة إلى صفحة الدورات',
  untitledLesson: 'درس بدون عنوان',
  lessonPlaceholder: 'لم يتم العثور على محتوى هذا الدرس.',
  lockedTitle: 'المحتوى غير متاح',
  loginPrompt: 'سجّل الدخول للوصول إلى الدروس ومتابعة تقدمك في الدورة.',
  loginAction: 'تسجيل الدخول',
  registerAction: 'إنشاء حساب جديد',
  purchasePrompt: 'للحصول على محتوى الدورة الكامل، يرجى شراء الدورة أو التأكد من تفعيل اشتراكك.',
  oneTimePayment: 'دفعة واحدة - وصول دائم',
  buyNow: 'اشترِ الآن',
  paymentNote: 'ملاحظة: بوابة الدفع الحقيقية غير مفعلة بعد، هذا الزر للعرض فقط.',
  savingProgress: 'جارٍ حفظ التقدم...',
  lessonCompleted: 'تم إكمال الدرس',
  markComplete: 'علّم الدرس كمكتمل',
  lessonLabel: 'الدرس',
  ofLabel: 'من',
};

export default function CoursePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const courseId = params.id as string;
  const [course, setCourse] = useState<Course | null>(null);
  const [courseMongoId, setCourseMongoId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentLessonId, setCurrentLessonId] = useState<string>('');
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [progress, setProgress] = useState<CourseProgress>(EMPTY_PROGRESS);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [progressLoading, setProgressLoading] = useState(false);
  
  // Certificate and popup states
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [showReviewPopup, setShowReviewPopup] = useState(false);
  const [isCheckingCertificate, setIsCheckingCertificate] = useState(false);
  const [congratulationsShown, setCongratulationsShown] = useState(false);

  const adminEmailList = useMemo(
    () =>
      (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '')
        .split(',')
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean),
    []
  );

  const isAdmin = useMemo(() => {
    if (!user?.email) return false;
    return adminEmailList.includes(user.email.toLowerCase());
  }, [adminEmailList, user?.email]);

  const canAccessCourse = useMemo(() => {
    const result = isEnrolled || isAdmin;
    console.log('canAccessCourse computed:', { isEnrolled, isAdmin, result });
    return result;
  }, [isEnrolled, isAdmin]);

  // Function to refresh course rating after review changes
  const refreshCourseRating = useCallback(async () => {
    if (!courseId || !course) return;
    
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5050';
      const token = typeof window !== 'undefined' ? Cookies.get('token') : null;
      
      const response = await fetch(`${backendUrl}/api/courses/${courseId}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });

      if (response.ok) {
        const responseData = await response.json() as CourseResponse;
        const courseData = responseData.course || responseData;
        
        // Update only the rating
        setCourse(prev => prev ? {
          ...prev,
          rating: courseData.rating || { average: 0, count: 0 },
          enrollmentCount: courseData.enrollmentCount || prev.enrollmentCount
        } : null);
        
        console.log('Course rating refreshed:', courseData.rating);
      }
    } catch (error) {
      console.error('Error refreshing course rating:', error);
    }
  }, [courseId, course]);

  useEffect(() => {
    const loadCourse = async () => {
      if (!courseId) {
        setError(AR.invalidCourseId);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5050';
        
        // Get token from cookies for authentication
        const token = typeof window !== 'undefined' ? Cookies.get('token') : null;
        
        const response = await fetch(`${backendUrl}/api/courses/${courseId}`, {
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            setError(AR.courseNotFound);
            return;
          }

          const payload = await response.json().catch(() => ({}));
          setError(payload.error || AR.loadError);
          return;
        }

        const responseData = await response.json() as CourseResponse;
        console.log('Backend response:', responseData);
        
        // Extract course data from backend response structure
        const courseData = responseData.course || responseData;
        console.log('Course data:', courseData);

        // Normalize the course data to match frontend types
        const normalizedLessons = (courseData.lessons || [])
          .map((lesson: any, index: number) => {
            const fallbackOrder = lesson.order ?? index + 1;
            // Use the original lesson ID from the database
            const originalId = lesson._id || lesson.id;
            const normalizedId = originalId || `${courseId}-lesson-${fallbackOrder}`;

            return {
              ...lesson,
              id: normalizedId,
              originalId: originalId, // Keep the original ID for backend operations
              courseId: courseId,
              order: fallbackOrder,
              isPreview: lesson.isFree || false,
            } as Lesson;
          })
          .sort((a: any, b: any) => (a.order || 0) - (b.order || 0));

        const normalizedCourse: Course = {
          ...courseData,
          id: courseData._id || courseData.id,
          lessons: normalizedLessons,
          createdAt: new Date(courseData.createdAt),
          updatedAt: new Date(courseData.updatedAt),
          // Ensure required fields have default values
          rating: courseData.rating || { average: 0, count: 0 },
          enrollmentCount: courseData.enrollmentCount || 0,
          instructor: courseData.instructor || { id: '', name: 'غير محدد' },
          thumbnail: courseData.thumbnail || '',
        };
        
        console.log('Course thumbnail:', normalizedCourse.thumbnail);

        setCourse(normalizedCourse);
        // Store the original MongoDB ID for API calls
        setCourseMongoId(courseData._id || courseId);
        setIsEnrolled(courseData.isEnrolled || false);
        
        // Debug logging
        console.log('Course enrollment status:', {
          isEnrolled: courseData.isEnrolled,
          canAccessCourse: (courseData.isEnrolled || false) || isAdmin,
          user: user?.email,
          isAdmin,
          courseId: courseId,
          userEnrolledCourses: user?.enrolledCourses
        });

        if (normalizedLessons.length > 0) {
          setCurrentLessonId(normalizedLessons[FIRST_LESSON_INDEX].id);
        }

        // Double-check enrollment status after course loads
        setTimeout(() => {
          checkUserEnrollment();
        }, 500);

        // Load progress after course loads
        setTimeout(() => {
          loadProgress();
        }, 1000);
      } catch (err) {
        console.error('Error loading course:', err);
        setError(AR.unexpectedLoadError);
      } finally {
        setLoading(false);
      }
    };

    loadCourse();
  }, [courseId]);

  // Also check enrollment when user logs in or course changes
  useEffect(() => {
    if (user?._id && courseId && course) {
      checkUserEnrollment();
      loadProgress();
    }
  }, [user?._id, courseId, course]);

  // Check for certificate when progress changes and reaches 100%
  useEffect(() => {
    if (progress.progressPercentage === 100 && courseId && course && user?._id && !showCongratulations && !congratulationsShown) {
      checkForCertificate();
      setCongratulationsShown(true);
    }
  }, [progress.progressPercentage, courseId, course, user?._id, showCongratulations, congratulationsShown]);

  const getLocalProgressKey = (userId?: string | null) =>
    `course_progress_${courseId}_${userId || 'guest'}`;

  const loadProgress = async () => {
    if (!courseId) return;

    const fallbackToDefaults = () => {
      const defaultLessonId = course?.lessons?.[FIRST_LESSON_INDEX]?.id || '';
      const defaultProgress: CourseProgress = {
        completedLessons: [],
        currentLesson: defaultLessonId,
        progressPercentage: 0,
      };
      setProgress(defaultProgress);
      if (defaultLessonId) {
        setCurrentLessonId(defaultLessonId);
      }
    };

    try {
      setProgressLoading(true);
      let storedProgress: CourseProgress | null = null;

      // Try to load progress from backend first
      const token = typeof window !== 'undefined' ? Cookies.get('token') : null;
      if (token && user?._id) {
        try {
          const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5050';
          
          // Get individual lesson progress records for this course
          const response = await fetch(`${backendUrl}/api/users/progress?courseId=${courseId}`, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            console.log('Backend progress response:', data);
            
            if (data.success && data.data?.progress) {
              // The progress should be an array of individual lesson progress records
              const completedLessons = data.data.progress
                .filter((p: any) => p.completed)
                .map((p: any) => {
                  // Find the frontend lesson ID that matches this backend lesson ID
                  const lesson = course?.lessons?.find(l => (l as any).originalId === p.lessonId);
                  return lesson?.id || p.lessonId;
                })
                .filter(Boolean); // Remove any undefined values
              
              const totalLessons = course?.lessons?.length || 0;
              const progressPercentage = totalLessons > 0 ? Math.round((completedLessons.length / totalLessons) * 100) : 0;
              
              storedProgress = {
                completedLessons,
                currentLesson: course?.lessons?.[FIRST_LESSON_INDEX]?.id || '',
                progressPercentage,
              };
              
              console.log('Loaded progress from backend:', storedProgress);
              console.log('Backend progress records:', data.data.progress);
            }
          } else {
            console.log('Backend progress request failed:', response.status, response.statusText);
          }
        } catch (backendError) {
          console.log('Failed to load progress from backend, falling back to localStorage:', backendError);
        }
      }

      // Fallback to localStorage if backend failed
      if (!storedProgress && typeof window !== 'undefined') {
        const raw = localStorage.getItem(getLocalProgressKey(user?._id));
        if (raw) {
          try {
            storedProgress = JSON.parse(raw);
          } catch (parseError) {
            console.warn('Failed to parse persisted course progress', parseError);
          }
        }
      }

      if (storedProgress) {
        setProgress(storedProgress);
        if (storedProgress.currentLesson) {
          setCurrentLessonId(storedProgress.currentLesson);
        } else if (course?.lessons?.length) {
          setCurrentLessonId(course.lessons[FIRST_LESSON_INDEX].id);
        }
      } else {
        fallbackToDefaults();
      }
    } catch (err) {
      console.error('Error loading course progress:', err);
      fallbackToDefaults();
    } finally {
      setProgressLoading(false);
    }
  };

  const saveProgress = async (nextProgress: CourseProgress) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(getLocalProgressKey(user?._id), JSON.stringify(nextProgress));
      } catch (storageError) {
        console.warn('Unable to persist course progress locally', storageError);
      }
    }

    setProgress(nextProgress);
  };

  const checkUserEnrollment = async () => {
    // Double-check enrollment status if user is logged in
    if (!user?._id || !courseId) return;
    
    try {
      // Method 1: Try dedicated enrollment endpoint
      const token = typeof window !== 'undefined' ? Cookies.get('token') : null;
      if (!token) return;
      
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5050';
      const response = await fetch(`${backendUrl}/api/users/enrollment/${courseId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Double-check enrollment result:', data);
        if (data.success && data.isEnrolled !== undefined) {
          const actualEnrollmentStatus = data.isEnrolled;
          console.log('Updating enrollment status from', isEnrolled, 'to', actualEnrollmentStatus);
          console.log('Current canAccessCourse before update:', canAccessCourse);
          setIsEnrolled(actualEnrollmentStatus);
          console.log('New canAccessCourse after update:', actualEnrollmentStatus || isAdmin);
          return;
        }
      } else {
        console.log('Enrollment check failed:', response.status, response.statusText, 'trying alternative method...');
      }

      // Method 2: Fallback - check user's enrolled courses list
      try {
        const coursesResponse = await fetch(`${backendUrl}/api/users/courses`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (coursesResponse.ok) {
          const coursesData = await coursesResponse.json();
          console.log('User courses response:', coursesData);
          
          if (coursesData.success && coursesData.courses) {
            const isEnrolledInCourse = coursesData.courses.some((c: any) => 
              c._id === courseId || c.id === courseId
            );
            console.log('Enrollment check via courses list:', isEnrolledInCourse);
            console.log('Course IDs in user courses:', coursesData.courses.map((c: any) => ({ id: c._id || c.id, title: c.title })));
            console.log('Looking for courseId:', courseId);
            if (isEnrolledInCourse !== isEnrolled) {
              console.log('Updating enrollment status from', isEnrolled, 'to', isEnrolledInCourse);
              setIsEnrolled(isEnrolledInCourse);
            }
          }
        } else {
          console.log('Courses list check failed:', coursesResponse.status, coursesResponse.statusText);
        }
      } catch (fallbackError) {
        console.log('Fallback enrollment check failed:', fallbackError);
      }
      
    } catch (error) {
      console.log('Could not verify enrollment status:', error);
    }
  };

  useEffect(() => {
    if (!course || !courseId) return;

    if (!user?._id) {
      const defaultLessonId = course.lessons?.[FIRST_LESSON_INDEX]?.id || '';
      setIsEnrolled(false);
      setProgress(EMPTY_PROGRESS);
      if (defaultLessonId) {
        setCurrentLessonId(defaultLessonId);
      }
      return;
    }

    void checkUserEnrollment();
  }, [course, courseId, user?._id]);

  useEffect(() => {
    if (!course?.lessons?.length) return;
    const lessonExists = course.lessons.some((lesson) => lesson.id === currentLessonId);
    if (!lessonExists) {
      setCurrentLessonId(course.lessons[FIRST_LESSON_INDEX].id);
    }
  }, [course, currentLessonId]);

  useEffect(() => {
    if (!course?.lessons?.length) return;
    const totalLessons = course.lessons.length;
    const computedProgress =
      totalLessons > 0 ? Math.round((progress.completedLessons.length / totalLessons) * 100) : 0;

    if (computedProgress !== progress.progressPercentage) {
      setProgress((prev) => ({
        ...prev,
        progressPercentage: computedProgress,
      }));
    }
  }, [course?.lessons?.length, progress.completedLessons.length, progress.progressPercentage]);

  const markLessonComplete = async (lessonId: string) => {
    if (!lessonId || (!isEnrolled && !isAdmin)) return;

    try {
      setProgressLoading(true);

      // Update local state immediately for better UX
    const completedLessons = new Set(progress.completedLessons);
    completedLessons.add(lessonId);

    const totalLessons = course?.lessons?.length || 0;
    const progressPercentage =
      totalLessons > 0 ? Math.round((completedLessons.size / totalLessons) * 100) : 0;

      const newProgress = {
      completedLessons: Array.from(completedLessons),
      currentLesson: lessonId,
      progressPercentage,
      };

      // Save to backend
      const token = typeof window !== 'undefined' ? Cookies.get('token') : null;
      if (token && courseId) {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5050';
        
        // Find the lesson to get its original ID
        const lesson = course?.lessons?.find(l => l.id === lessonId);
        const originalLessonId = (lesson as any)?.originalId || lessonId;
        
        console.log('Saving progress:', { courseId, lessonId, originalLessonId });
        
        const response = await fetch(`${backendUrl}/api/users/progress`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            courseId: courseId,
            lessonId: originalLessonId,
            watchTime: 0, // We don't have watch time for manual completion
            totalDuration: 0, // We don't have duration for manual completion
            completed: true,
          }),
        });

        if (response.ok) {
          console.log('Progress saved to backend successfully');
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error('Failed to save progress to backend:', response.status, response.statusText, errorData);
        }
      }

      // Save to local storage as fallback
      await saveProgress(newProgress);

      // Check if course is completed and show congratulations
      if (progressPercentage === 100) {
        await checkForCertificate();
      }

    } catch (error) {
      console.error('Error marking lesson as complete:', error);
    } finally {
      setProgressLoading(false);
    }
  };

  const navigateLesson = (direction: 'next' | 'prev') => {
    if (!course?.lessons?.length) return;

    const currentIndex = course.lessons.findIndex((lesson) => lesson.id === currentLessonId);
    const offset = direction === 'next' ? 1 : -1;
    const newIndex = currentIndex + offset;

    if (newIndex < 0 || newIndex >= course.lessons.length) return;

    const nextLessonId = course.lessons[newIndex].id;
    setCurrentLessonId(nextLessonId);

    if (canAccessCourse) {
      const total = course.lessons.length;
      const progressPercentage =
        total > 0 ? Math.round((progress.completedLessons.length / total) * 100) : 0;

      void saveProgress({
        ...progress,
        currentLesson: nextLessonId,
        progressPercentage,
      });
    }
  };

  const handleLessonSelect = (lessonId: string) => {
    setCurrentLessonId(lessonId);

    if (canAccessCourse) {
      const total = course?.lessons?.length || 0;
      const progressPercentage =
        total > 0 ? Math.round((progress.completedLessons.length / total) * 100) : 0;

      void saveProgress({
        ...progress,
        currentLesson: lessonId,
        progressPercentage,
      });
    }
  };

  // Check for certificate when course is completed
  const checkForCertificate = async () => {
    if (!courseId || !course) return;
    
    try {
      setIsCheckingCertificate(true);
      
      // Add initial delay to ensure certificate creation has time to complete
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      let response;
      let attempts = 0;
      const maxAttempts = 3;
      
      // Try multiple times with increasing delays
      while (attempts < maxAttempts) {
        try {
          response = await userAPI.getCertificate(courseId);
          
          if (response.data.success && response.data.certificate) {
            setCertificate(response.data.certificate);
            setShowCongratulations(true);
            return; // Success, exit the function
          }
        } catch (error: any) {
          console.log(`Certificate check attempt ${attempts + 1} failed:`, error?.response?.status);
          
          if (error?.response?.status === 404 && attempts < maxAttempts - 1) {
            // Wait longer between retries
            const delay = (attempts + 1) * 3000; // 3s, 6s delays
            console.log(`Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          } else if (error?.response?.status !== 404) {
            // Non-404 error, don't retry
            break;
          }
        }
        
        attempts++;
      }
      
      // If we get here, all attempts failed but still show congratulations
      console.log('Certificate not created yet, but showing congratulations anyway');
      setShowCongratulations(true);
      
    } catch (error: any) {
      console.error('Error checking for certificate:', error);
      // Still show congratulations even if certificate check fails
      setShowCongratulations(true);
    } finally {
      setIsCheckingCertificate(false);
    }
  };

  // Handle certificate download
  const handleDownloadCertificate = async () => {
    if (!certificate || !user) return;
    
    try {
      console.log('Downloading certificate with data:', {
        userName: certificate.userName || user.displayName || user.email,
        courseTitle: certificate.courseTitle,
        issuedDate: certificate.issuedAt,
        verificationCode: certificate.verificationCode
      });

      await generateCertificatePDF({
        userName: certificate.userName || user.displayName || user.email,
        courseTitle: certificate.courseTitle || course?.title || 'Unknown Course',
        issuedDate: certificate.issuedAt,
        verificationCode: certificate.verificationCode
      });
    } catch (error) {
      console.error('Error downloading certificate:', error);
    }
  };

  // Handle review submission for certified user
  const handleCertifiedReview = async (rating: number, comment: string) => {
    if (!courseMongoId || !course) return;
    
    try {
      // Use the stored MongoDB ID that we got from the backend response
      const mongoId = courseMongoId;
      
      // Ensure title and comment meet validation requirements
      const baseTitle = `تقييم خريج: ${course.title}`;
      const title = baseTitle.length > 100 ? baseTitle.substring(0, 97) + '...' : baseTitle;
      
      // Ensure title is at least 5 characters
      const finalTitle = title.length < 5 ? `تقييم: ${course.title}` : title;
      
      const defaultComment = `انتهيت بنجاح من دورة "${course.title}" وأوصي بها للآخرين.`;
      let finalComment = comment && comment.length >= 10 ? comment : defaultComment;
      
      // Ensure comment is between 10-1000 characters
      if (finalComment.length < 10) {
        finalComment = defaultComment;
      } else if (finalComment.length > 1000) {
        finalComment = finalComment.substring(0, 997) + '...';
      }
      
      console.log('Submitting review with:', {
        courseId: mongoId,
        courseIdType: typeof mongoId,
        courseIdLength: mongoId?.length,
        originalCourseId: courseId,
        courseObj: {
          id: course.id,
          _id: (course as any)._id,
          title: course.title
        },
        rating,
        title: finalTitle,
        comment: finalComment,
        titleLength: finalTitle.length,
        commentLength: finalComment.length
      });
      
      await reviewsAPI.createReview({
        courseId: mongoId,
        rating,
        title: finalTitle,
        comment: finalComment
      });
      
      // Close popups on success
      setShowReviewPopup(false);
      setShowCongratulations(false);
      
      // You might want to show a success message here
      console.log('Certified user review submitted successfully!');
    } catch (error: any) {
      console.error('Error submitting certified review:', error);
      
      // Log more details about the error
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SkeletonLoader variant="course" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600">
            !
          </div>
          <h1 className="mb-3 text-2xl font-bold text-gray-900">
            {error || AR.genericErrorTitle}
          </h1>
          <p className="mb-6 text-gray-600">
            {error === AR.courseNotFound ? AR.notFoundHint : AR.genericErrorHint}
          </p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full rounded-lg bg-blue-600 px-6 py-3 text-white transition hover:bg-blue-700"
            >
              {AR.retry}
            </button>
            <button
              onClick={() => router.push('/courses')}
              className="w-full rounded-lg bg-gray-200 px-6 py-3 text-gray-700 transition hover:bg-gray-300"
            >
              {AR.backToCourses}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentLesson =
    course.lessons?.find((lesson) => lesson.id === currentLessonId) ?? course.lessons?.[0];
  const currentLessonIndex = Math.max(
    0,
    course.lessons?.findIndex((lesson) => lesson.id === currentLessonId) ?? 0
  );
  const isLessonCompleted = currentLesson?.id
    ? progress.completedLessons.includes(currentLesson.id)
    : false;

  return (
    <div className="min-h-screen">
      <Header />
      <CourseHeader course={course} isEnrolled={canAccessCourse} progress={progress.progressPercentage} />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          <div className="lg:col-span-3">
            <div className="overflow-hidden rounded-2xl bg-white shadow-xl border border-gray-100">
              {canAccessCourse ? (
                <>
                  <div className="relative p-6 pb-0">
                    <EnhancedMediaPlayer
                      videoUrl={currentLesson?.videoUrl}
                      thumbnailUrl={course.thumbnail}
                      title={currentLesson?.title || course.title}
                      isLocked={false}
                    />
                  </div>

                  <div className="p-8">
                    <div className="mb-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h1 className="text-3xl font-bold text-gray-900 mb-3 leading-tight">
                            {currentLesson?.title || AR.untitledLesson}
                          </h1>
                          <div className="flex items-center space-x-4 space-x-reverse text-sm text-gray-600">
                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 font-medium">
                              الدرس {currentLessonIndex + 1} من {course.lessons?.length || 0}
                            </span>
                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-black">
                              {Math.round(progress.progressPercentage)}% مكتمل
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center space-x-3 space-x-reverse">
                          <button
                            onClick={() => navigateLesson('prev')}
                            disabled={currentLessonIndex === 0}
                            className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 transition-colors shadow-sm"
                          >
                            <ChevronRightIcon className="h-4 w-4 ml-2" />
                            الدرس السابق
                          </button>
                          <button
                            onClick={() => navigateLesson('next')}
                            disabled={currentLessonIndex >= (course.lessons?.length || 1) - 1}
                            className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 transition-colors shadow-sm"
                          >
                            الدرس التالي
                            <ChevronLeftIcon className="h-4 w-4 mr-2" />
                          </button>
                        </div>

                        <button
                          onClick={() => currentLesson?.id && markLessonComplete(currentLesson.id)}
                          disabled={!currentLesson?.id || isLessonCompleted || progressLoading}
                          className={`inline-flex items-center px-6 py-2 rounded-lg font-medium transition-colors shadow-sm ${
                            isLessonCompleted
                              ? 'cursor-not-allowed bg-green-100 text-green-700 border border-green-200'
                              : progressLoading
                              ? 'cursor-wait bg-blue-200 text-blue-700 border border-blue-300'
                              : 'bg-blue-600 text-white hover:bg-blue-700 border border-blue-600'
                          }`}
                        >
                          {progressLoading
                            ? AR.savingProgress
                            : isLessonCompleted
                            ? AR.lessonCompleted
                            : AR.markComplete}
                        </button>
                      </div>
                    </div>

                    {currentLesson?.description && (
                      <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                        <h3 className="mb-4 text-xl font-semibold flex items-center text-black">
                          <div className="w-2 h-6 bg-blue-600 rounded-full ml-3"></div>
                          وصف الدرس
                        </h3>
                        <div className="prose prose-gray max-w-none">
                          <p className="leading-relaxed text-black text-lg">{currentLesson.description}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="p-8">
                  <EnhancedMediaPlayer
                    videoUrl={currentLesson?.videoUrl}
                    thumbnailUrl={course.thumbnail}
                    title={currentLesson?.title || course.title}
                    isLocked={true}
                    onUnlock={() => {
                      if (!user) {
                        router.push('/auth/login');
                      }
                    }}
                  />
                  
                  <div className="mt-8 text-center">
                    <h3 className="mb-6 text-2xl font-bold text-gray-900">{AR.lockedTitle}</h3>

                    {!user ? (
                      <>
                        <p className="mb-8 text-gray-600 text-lg leading-relaxed max-w-2xl mx-auto">{AR.loginPrompt}</p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                          <button
                            onClick={() => router.push('/auth/login')}
                            className="flex-1 rounded-xl bg-blue-600 px-8 py-4 font-semibold text-white transition-all hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-0.5"
                          >
                            {AR.loginAction}
                          </button>
                          <button
                            onClick={() => router.push('/auth/register')}
                            className="flex-1 rounded-xl bg-gray-200 px-8 py-4 font-semibold text-black transition-all hover:bg-gray-300 hover:shadow-lg transform hover:-translate-y-0.5"
                          >
                            {AR.registerAction}
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="mb-8 text-gray-600 text-lg leading-relaxed max-w-2xl mx-auto">
                          للحصول على محتوى الدورة الكامل، يرجى شراء الدورة أو التأكد من تفعيل اشتراكك.
                        </p>
                        <div className="max-w-md mx-auto">
                          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 mb-6 border border-blue-100">
                            <div className="text-center">
                              <span className="text-4xl font-bold !text-black block">${course.price}</span>
                              <span className="font-medium !text-black">دفعة واحدة – وصول دائم</span>
                            </div>
                          </div>
                          <button
                            onClick={() => router.push(`/checkout?courseId=${courseMongoId}`)}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition-colors"
                          >
                            {AR.buyNow}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <LessonsList
                course={course}
                currentLessonId={currentLessonId}
                onLessonSelect={handleLessonSelect}
                completedLessons={progress.completedLessons}
                isEnrolled={canAccessCourse}
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <CourseReviews 
          courseId={courseId} 
          isEnrolled={canAccessCourse}
          courseRating={course.rating}
          onReviewChange={refreshCourseRating}
        />
      </div>
      
      {/* Congratulations Popup */}
      <CongratulationsPopup
        course={course}
        certificate={certificate}
        isOpen={showCongratulations}
        onClose={() => setShowCongratulations(false)}
        onDownloadCertificate={handleDownloadCertificate}
        onReview={() => {
          setShowCongratulations(false);
          setShowReviewPopup(true);
        }}
      />

      {/* Certified User Review Popup */}
      <CertifiedUserReviewPopup
        course={course}
        isOpen={showReviewPopup}
        onClose={() => setShowReviewPopup(false)}
        onSubmit={handleCertifiedReview}
      />
      
      <Footer />
    </div>
  );
}
