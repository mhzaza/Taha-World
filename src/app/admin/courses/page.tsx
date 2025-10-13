'use client';

import { useEffect, useMemo, useState } from 'react';
import CourseAdminPanel from '@/components/course/CourseAdminPanel';
import type { Course } from '@/types';

interface CourseOption {
  id: string;
  title: string;
  level?: string;
}

const EMPTY_SELECTION_MESSAGE =
  'اختر دورة من القائمة لعرض تفاصيلها وإدارة الدروس المرفقة بها.';

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/courses');
        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload.error || 'تعذّر تحميل قائمة الدورات.');
        }

        const data: Course[] = await response.json();
        setCourses(data);

        if (data.length > 0) {
          setSelectedCourseId(data[0].id);
        }
      } catch (err) {
        console.error('فشل تحميل الدورات:', err);
        setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع أثناء تحميل الدورات.');
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, []);

  const courseOptions: CourseOption[] = useMemo(
    () =>
      courses.map((course) => ({
        id: course.id,
        title: course.title || 'دورة بدون عنوان',
        level: course.level,
      })),
    [courses]
  );

  const selectedCourse = useMemo(
    () => courses.find((course) => course.id === selectedCourseId) || null,
    [courses, selectedCourseId]
  );

  const handleCourseChange = (updatedCourse: Course) => {
    setCourses((prev) =>
      prev.map((course) => (course.id === updatedCourse.id ? updatedCourse : course))
    );
  };

  return (
    <div className="space-y-8">
      <header className="rounded-lg bg-white p-6 shadow">
        <h1 className="text-2xl font-bold text-gray-900">إدارة الدورات</h1>
        <p className="mt-2 text-gray-600">
          اختر دورة لتعديل محتواها وتنظيم دروسها. جميع التعديلات تحفظ مباشرة في قاعدة البيانات.
        </p>
      </header>

      <section className="rounded-lg bg-white p-6 shadow">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">اختيار الدورة</h2>
            <p className="text-sm text-gray-600">
              يمكن البحث عن الدورة بالعنوان أو المستوى لتسهيل الوصول.
            </p>
          </div>
          <div className="w-full max-w-md">
            <label htmlFor="course-selector" className="mb-2 block text-sm font-medium text-gray-700">
              الدورات المتاحة
            </label>
            <select
              id="course-selector"
              value={selectedCourseId}
              onChange={(event) => setSelectedCourseId(event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-right focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {courseOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.title} {option.level ? `- المستوى: ${option.level}` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading && (
          <div className="mt-6 rounded-lg border border-dashed border-gray-300 p-8 text-center text-gray-500">
            جارٍ تحميل قائمة الدورات...
          </div>
        )}

        {!loading && error && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && courses.length === 0 && (
          <div className="mt-6 rounded-lg border border-dashed border-gray-300 p-8 text-center text-gray-500">
            لا توجد دورات مسجلة حتى الآن. يمكنك إضافة دورة جديدة من خلال أدوات إدارة المحتوى.
          </div>
        )}
      </section>

      {selectedCourse ? (
        <CourseAdminPanel course={selectedCourse} courseId={selectedCourse.id} onCourseChange={handleCourseChange} />
      ) : (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500 shadow">
          {loading ? 'جارٍ التحضير...' : EMPTY_SELECTION_MESSAGE}
        </div>
      )}
    </div>
  );
}
