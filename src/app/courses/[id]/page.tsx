'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import type { Course, Lesson } from '@/types';
import SecurePlayer from '@/components/course/SecurePlayer';
import LessonsList from '@/components/course/LessonsList';
import CourseHeader from '@/components/course/CourseHeader';
import SkeletonLoader from '@/components/ui/SkeletonLoader';
import BuyButtonStub from '@/components/payment/BuyButtonStub';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';

interface CourseProgress {
  completedLessons: string[];
  currentLesson: string;
  progressPercentage: number;
}

const EMPTY_PROGRESS: CourseProgress = {
  completedLessons: [],
  currentLesson: '',
  progressPercentage: 0,
};

const FIRST_LESSON_INDEX = 0;

export default function CoursePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const courseId = params.id as string;
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentLessonId, setCurrentLessonId] = useState<string>('');
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [progress, setProgress] = useState<CourseProgress>(EMPTY_PROGRESS);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [progressLoading, setProgressLoading] = useState(false);

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

  const canAccessCourse = useMemo(() => isEnrolled || isAdmin, [isAdmin, isEnrolled]);

  useEffect(() => {
    const loadCourse = async () => {
      if (!courseId) {
        setError('معرّف الدورة غير صحيح');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        console.log(`🚀 Fetching course data for ID: ${courseId}`);

        const response = await fetch(`/api/courses/${courseId}`);

        if (!response.ok) {
          if (response.status === 404) {
            setError('لم يتم العثور على الدورة المطلوبة');
            return;
          }

          const errorData = await response.json().catch(() => ({}));
          setError(errorData.error || 'حدث خطأ أثناء تحميل الدورة. يرجى المحاولة مرة أخرى.');
          return;
        }

        const courseData: Course = await response.json();
        console.log(`✅ Successfully loaded course: ${courseData.title}`);

        const normalizedLessons = (courseData.lessons || [])
          .map((lesson, index) => {
            const fallbackOrder = lesson.order ?? index + 1;
            const normalizedId =
              lesson.id ||
              (lesson as Record<string, unknown>).lessonId ||
              `${courseId}-lesson-${fallbackOrder}`;

            return {
              ...lesson,
              id: normalizedId,
              order: fallbackOrder,
            } as Lesson;
          })
          .sort((a, b) => (a.order || 0) - (b.order || 0));

        const normalizedCourse: Course = {
          ...courseData,
          lessons: normalizedLessons,
        };

        setCourse(normalizedCourse);

        if (normalizedLessons.length > 0) {
          setCurrentLessonId(normalizedLessons[FIRST_LESSON_INDEX].id);
        }
      } catch (err) {
        console.error('⚠️ Error loading course:', err);
        setError('حدث خطأ غير متوقع أثناء تحميل تفاصيل الدورة.');
      } finally {
        setLoading(false);
      }
    };

    loadCourse();
  }, [courseId]);

  const getLocalProgressKey = (uid?: string | null) =>
    `course_progress_${courseId}_${uid || 'guest'}`;

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

      if (user?.uid && db) {
        const progressDocRef = doc(db, 'progress', `${user.uid}_${courseId}`);
        const progressDoc = await getDoc(progressDocRef);

        if (progressDoc.exists()) {
          const data = progressDoc.data() as Partial<CourseProgress>;
          storedProgress = {
            completedLessons: Array.isArray(data.completedLessons) ? data.completedLessons : [],
            currentLesson: typeof data.currentLesson === 'string' ? data.currentLesson : '',
            progressPercentage: typeof data.progressPercentage === 'number' ? data.progressPercentage : 0,
          };
        }
      }

      if (!storedProgress && typeof window !== 'undefined') {
        const raw = localStorage.getItem(getLocalProgressKey(user?.uid));
        if (raw) {
          try {
            storedProgress = JSON.parse(raw);
          } catch (parseError) {
            console.warn('Failed to parse local course progress', parseError);
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
        localStorage.setItem(getLocalProgressKey(user?.uid), JSON.stringify(nextProgress));
      } catch (storageError) {
        console.warn('Unable to persist course progress locally', storageError);
      }
    }

    setProgress(nextProgress);

    if (!user?.uid || !db) return;

    try {
      const progressDocRef = doc(db, 'progress', `${user.uid}_${courseId}`);
      await setDoc(
        progressDocRef,
        {
          userId: user.uid,
          courseId,
          completedLessons: nextProgress.completedLessons,
          currentLesson: nextProgress.currentLesson,
          progressPercentage: nextProgress.progressPercentage,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (err) {
      console.error('Error saving course progress:', err);
    }
  };

  const checkUserEnrollment = async () => {
    if (!user?.uid || !db) {
      setIsEnrolled(false);
      return;
    }

    try {
      let enrolled = false;

      const enrollmentDocRef = doc(db, 'enrollments', `${user.uid}_${courseId}`);
      const enrollmentDoc = await getDoc(enrollmentDocRef);
      if (enrollmentDoc.exists()) {
        enrolled = true;
      } else {
        const enrollmentsRef = collection(db, 'enrollments');
        const enrollmentQuery = query(
          enrollmentsRef,
          where('userId', '==', user.uid),
          where('courseId', '==', courseId)
        );
        const snapshot = await getDocs(enrollmentQuery);
        enrolled = !snapshot.empty;
      }

      if (!enrolled && isAdmin) {
        enrolled = true;
      }

      setIsEnrolled(enrolled);

      if (enrolled) {
        await loadProgress();
      } else if (course?.lessons?.length) {
        const firstLessonId = course.lessons[FIRST_LESSON_INDEX].id;
        setCurrentLessonId(firstLessonId);
        setProgress({
          completedLessons: [],
          currentLesson: firstLessonId,
          progressPercentage: 0,
        });
      }
    } catch (err) {
      console.error('Error checking enrollment:', err);
      setIsEnrolled(false);
    }
  };

  useEffect(() => {
    if (!course || !courseId) return;

    if (!user?.uid) {
      const defaultLessonId = course.lessons?.[FIRST_LESSON_INDEX]?.id || '';
      setIsEnrolled(false);
      setProgress(EMPTY_PROGRESS);
      if (defaultLessonId) {
        setCurrentLessonId(defaultLessonId);
      }
      return;
    }

    void checkUserEnrollment();
  }, [course, courseId, user?.uid]);

  useEffect(() => {
    if (!course?.lessons?.length) return;
    const lessonExists = course.lessons.some((lesson) => lesson.id === currentLessonId);
    if (!lessonExists) {
      setCurrentLessonId(course.lessons[FIRST_LESSON_INDEX].id);
    }
  }, [course, currentLessonId]);

  useEffect(() => {
    if (!course?.lessons?.length) return;
    const total = course.lessons.length;
    const computedProgress =
      total > 0 ? Math.round((progress.completedLessons.length / total) * 100) : 0;

    if (computedProgress !== progress.progressPercentage) {
      setProgress((prev) => ({
        ...prev,
        progressPercentage: computedProgress,
      }));
    }
  }, [course?.lessons?.length, progress.completedLessons.length, progress.progressPercentage]);

  const markLessonComplete = async (lessonId: string) => {
    if (!lessonId || (!isEnrolled && !isAdmin)) return;

    const completed = new Set(progress.completedLessons);
    completed.add(lessonId);

    const totalLessons = course?.lessons?.length || 0;
    const progressPercentage =
      totalLessons > 0 ? Math.round((completed.size / totalLessons) * 100) : 0;

    await saveProgress({
      completedLessons: Array.from(completed),
      currentLesson: lessonId,
      progressPercentage,
    });
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
      const totalLessons = course.lessons.length;
      const progressPercentage =
        totalLessons > 0 ? Math.round((progress.completedLessons.length / totalLessons) * 100) : 0;

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
      const totalLessons = course?.lessons?.length || 0;
      const progressPercentage =
        totalLessons > 0 ? Math.round((progress.completedLessons.length / totalLessons) * 100) : 0;

      void saveProgress({
        ...progress,
        currentLesson: lessonId,
        progressPercentage,
      });
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
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <span className="text-3xl">⚠️</span>
          </div>
          <h1 className="mb-3 text-2xl font-bold text-gray-900">
            {error || 'حدث خطأ غير متوقع'}
          </h1>
          <p className="mb-6 text-gray-600">
            {error === 'لم يتم العثور على الدورة المطلوبة'
              ? 'تأكد من صحة الرابط أو اختر دورة مختلفة من قائمة الدورات.'
              : 'واجهنا مشكلة أثناء تحميل تفاصيل الدورة. يرجى المحاولة من جديد أو الاتصال بالدعم.'}
          </p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full rounded-lg bg-blue-600 px-6 py-3 text-white transition hover:bg-blue-700"
            >
              إعادة المحاولة
            </button>
            <button
              onClick={() => router.push('/courses')}
              className="w-full rounded-lg bg-gray-200 px-6 py-3 text-gray-700 transition hover:bg-gray-300"
            >
              العودة إلى قائمة الدورات
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
    <div className="min-h-screen bg-gray-50">
      <CourseHeader course={course} isEnrolled={canAccessCourse} progress={progress.progressPercentage} />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          <div className="lg:col-span-3">
            <div className="overflow-hidden rounded-lg bg-white shadow-lg">
              {canAccessCourse ? (
                <>
                  <div className="relative">
                    {currentLesson ? (
                      <SecurePlayer url={currentLesson.videoUrl} title={currentLesson.title} />
                    ) : (
                      <div className="flex aspect-video items-center justify-center bg-gray-200">
                        <p className="text-gray-500">لم يتم العثور على محتوى هذا الدرس.</p>
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <h2 className="mb-2 text-xl font-bold text-gray-900">
                          {currentLesson?.title || 'درس بدون عنوان'}
                        </h2>
                        <p className="text-sm text-gray-600">
                          الدرس {currentLessonIndex + 1} من {course.lessons?.length || 0}
                        </p>
                      </div>

                      <div className="flex items-center space-x-2 space-x-reverse">
                        <button
                          onClick={() => navigateLesson('prev')}
                          disabled={currentLessonIndex === 0}
                          className="rounded-lg border border-gray-300 p-2 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <ChevronRightIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => navigateLesson('next')}
                          disabled={currentLessonIndex >= (course.lessons?.length || 1) - 1}
                          className="rounded-lg border border-gray-300 p-2 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <ChevronLeftIcon className="h-5 w-5" />
                        </button>
                      </div>

                      <button
                        onClick={() => markLessonComplete(currentLesson?.id || '')}
                        disabled={!currentLesson?.id || isLessonCompleted || progressLoading || !canAccessCourse}
                        className={`rounded-lg px-6 py-2 font-medium transition ${
                          isLessonCompleted
                            ? 'cursor-not-allowed bg-green-100 text-green-700'
                            : progressLoading
                            ? 'cursor-wait bg-blue-200 text-white'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {progressLoading
                          ? 'جارٍ حفظ التقدم...'
                          : isLessonCompleted
                          ? 'تم إكمال الدرس'
                          : 'علّم الدرس كمكتمل'}
                      </button>
                    </div>

                    {currentLesson?.description && (
                      <div className="mt-6">
                        <h3 className="mb-2 text-lg font-semibold text-gray-900">وصف الدرس</h3>
                        <p className="leading-relaxed text-gray-700">{currentLesson.description}</p>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="p-8 text-center">
                  <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 text-gray-500">
                    🔒
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-gray-900">المحتوى غير متاح</h3>

                  {!user ? (
                    <>
                      <p className="mb-6 text-gray-600">
                        يجب تسجيل الدخول أولاً للوصول إلى محتوى الدورة ومشاهدة الدروس.
                      </p>
                      <div className="space-y-3">
                        <button
                          onClick={() => router.push('/auth/login')}
                          className="w-full rounded-lg bg-blue-600 px-8 py-3 font-semibold text-white transition hover:bg-blue-700"
                        >
                          تسجيل الدخول
                        </button>
                        <button
                          onClick={() => router.push('/auth/register')}
                          className="w-full rounded-lg bg-gray-200 px-8 py-3 font-semibold text-gray-700 transition hover:bg-gray-300"
                        >
                          إنشاء حساب جديد
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="mb-6 text-gray-600">
                        للوصول إلى محتوى الدورة كاملة يرجى شراء الدورة أو التأكد من تفعيل اشتراكك.
                      </p>
                      <div className="space-y-4">
                        <div className="text-center">
                          <span className="text-3xl font-bold text-blue-600">${course.price}</span>
                          <span className="mt-1 block text-sm text-gray-500">دفعة واحدة – وصول دائم</span>
                        </div>
                        <BuyButtonStub
                          label="اشترِ الآن"
                          className="w-full px-8 py-3 text-lg font-semibold"
                        />
                        <p className="text-center text-xs text-gray-500">
                          💳 سيتم تفعيل بوابة الدفع قريباً، هذا الزر للتجربة فقط.
                        </p>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
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
  );
}
