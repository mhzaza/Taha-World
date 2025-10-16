'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Course, Lesson } from '@/types';

interface CourseAdminPanelProps {
  course: Course;
  courseId: string;
  onCourseChange: (updatedCourse: Course) => void;
}

interface NewLessonForm {
  title: string;
  videoUrl: string;
  description: string;
  durationMinutes: number;
  isPreview: boolean;
}

const initialFormState: NewLessonForm = {
  title: '',
  videoUrl: '',
  description: '',
  durationMinutes: 10,
  isPreview: false,
};

const generateLessonId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `lesson-${Date.now()}-${Math.floor(Math.random() * 10_000)}`;
};

export default function CourseAdminPanel({ course, courseId, onCourseChange }: CourseAdminPanelProps) {
  const [draftLessons, setDraftLessons] = useState<Lesson[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [newLesson, setNewLesson] = useState<NewLessonForm>(initialFormState);

  useEffect(() => {
    setDraftLessons(
      [...(course.lessons || [])].map((lesson, index) => ({
        ...lesson,
        id: lesson.id || generateLessonId(),
        courseId: lesson.courseId || courseId,
        order: lesson.order ?? index + 1,
      }))
    );
  }, [course, courseId]);

  const sortedLessons = useMemo(
    () => [...draftLessons].sort((a, b) => (a.order || 0) - (b.order || 0)),
    [draftLessons]
  );

  const updateLessonField = (lessonId: string, field: keyof Lesson, value: unknown) => {
    setDraftLessons((prev) =>
      prev.map((lesson) =>
        lesson.id === lessonId
          ? {
              ...lesson,
              [field]: field === 'duration' ? Number(value) : value,
              updatedAt: new Date(),
            }
          : lesson
      )
    );
  };

  const moveLesson = (lessonId: string, direction: 'up' | 'down') => {
    setDraftLessons((prev) => {
      const lessons = [...prev].sort((a, b) => (a.order || 0) - (b.order || 0));
      const index = lessons.findIndex((lesson) => lesson.id === lessonId);
      if (index === -1) return prev;

      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= lessons.length) return prev;

      [lessons[index], lessons[targetIndex]] = [lessons[targetIndex], lessons[index]];

      return lessons.map((lesson, idx) => ({
        ...lesson,
        order: idx + 1,
      }));
    });
  };

  const deleteLesson = (lessonId: string) => {
    setDraftLessons((prev) =>
      prev
        .filter((lesson) => lesson.id !== lessonId)
        .map((lesson, index) => ({
          ...lesson,
          order: index + 1,
        }))
    );
  };

  const handleNewLessonChange = <Field extends keyof NewLessonForm>(field: Field, value: NewLessonForm[Field]) => {
    setNewLesson((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const addLesson = () => {
    if (!newLesson.title.trim() || !newLesson.videoUrl.trim()) {
      setErrorMessage('يرجى إدخال عنوان ورابط الفيديو للدرس الجديد.');
      return;
    }

    const durationSeconds = Math.max(1, Number(newLesson.durationMinutes)) * 60;
    const lessonId = generateLessonId();

    const lesson: Lesson = {
      id: lessonId,
      courseId,
      title: newLesson.title.trim(),
      description: newLesson.description.trim(),
      videoUrl: newLesson.videoUrl.trim(),
      duration: durationSeconds,
      order: draftLessons.length + 1,
      isPreview: newLesson.isPreview,
      resources: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setDraftLessons((prev) => [...prev, lesson]);
    setNewLesson(initialFormState);
    setErrorMessage(null);
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    setFeedbackMessage(null);
    setErrorMessage(null);

    const normalizedLessons = sortedLessons.map((lesson, index) => ({
      ...lesson,
      order: index + 1,
      courseId,
      updatedAt: new Date(),
    }));

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5050';
      const response = await fetch(`${backendUrl}/api/courses/${courseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lessons: normalizedLessons,
          updatedAt: new Date(),
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || 'فشل تحديث بيانات الدورة.');
      }

      onCourseChange({
        ...course,
        lessons: normalizedLessons,
      });

      setFeedbackMessage('تم حفظ التعديلات بنجاح.');
    } catch (error) {
      console.error('Failed to update course lessons:', error);
      setErrorMessage(error instanceof Error ? error.message : 'حدث خطأ غير متوقع أثناء الحفظ.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mt-10 bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">لوحة التحكم بالدروس</h2>
          <p className="text-sm text-gray-500">أضف دروساً جديدة أو عدّل المحتوى الحالي لهذه الدورة.</p>
        </div>
        <button
          onClick={handleSaveChanges}
          disabled={isSaving}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-medium px-4 py-2 rounded-lg transition-colors"
        >
          {isSaving ? 'جارِ الحفظ...' : 'حفظ التعديلات'}
        </button>
      </div>

      {feedbackMessage && (
        <div className="mx-6 mt-4 px-4 py-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-md">
          {feedbackMessage}
        </div>
      )}

      {errorMessage && (
        <div className="mx-6 mt-4 px-4 py-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-md">
          {errorMessage}
        </div>
      )}

      <div className="px-6 py-5 space-y-6">
        <div className="space-y-4">
          {sortedLessons.map((lesson, index) => {
            const durationMinutes = Math.round((lesson.duration || 0) / 60);

            return (
              <div key={lesson.id} className="border border-gray-200 rounded-lg p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">الدرس رقم {index + 1}</h3>
                    <p className="text-sm text-gray-500">المعرف: {lesson.id}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => moveLesson(lesson.id, 'up')}
                      disabled={index === 0 || isSaving}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50"
                    >
                      للأعلى
                    </button>
                    <button
                      onClick={() => moveLesson(lesson.id, 'down')}
                      disabled={index === sortedLessons.length - 1 || isSaving}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50"
                    >
                      للأسفل
                    </button>
                    <button
                      onClick={() => deleteLesson(lesson.id)}
                      disabled={isSaving}
                      className="px-3 py-1 text-sm border border-red-200 text-red-600 rounded-md hover:bg-red-50 disabled:opacity-50"
                    >
                      حذف الدرس
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">عنوان الدرس</label>
                    <input
                      type="text"
                      value={lesson.title}
                      onChange={(event) => updateLessonField(lesson.id, 'title', event.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="عنوان واضح للدرس"
                      disabled={isSaving}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">مدة الدرس (بالدقائق)</label>
                    <input
                      type="number"
                      min={1}
                      value={durationMinutes}
                      onChange={(event) =>
                        updateLessonField(lesson.id, 'duration', Math.max(1, Number(event.target.value)) * 60)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="10"
                      disabled={isSaving}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-gray-700">رابط الفيديو (YouTube / Vimeo / Mux)</label>
                    <input
                      type="text"
                      value={lesson.videoUrl}
                      onChange={(event) => updateLessonField(lesson.id, 'videoUrl', event.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="https://..."
                      disabled={isSaving}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-gray-700">وصف مختصر</label>
                    <textarea
                      value={lesson.description || ''}
                      onChange={(event) => updateLessonField(lesson.id, 'description', event.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      rows={3}
                      placeholder="شرح موجز لمحتوى الدرس"
                      disabled={isSaving}
                    />
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <input
                    id={`preview-${lesson.id}`}
                    type="checkbox"
                    checked={Boolean(lesson.isPreview)}
                    onChange={(event) => updateLessonField(lesson.id, 'isPreview', event.target.checked)}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    disabled={isSaving}
                  />
                  <label htmlFor={`preview-${lesson.id}`} className="text-sm text-gray-700">
                    إتاحة الدرس كمقطع تجريبي مفتوح
                  </label>
                </div>
              </div>
            );
          })}

          {sortedLessons.length === 0 && (
            <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center text-gray-500">
              لا توجد دروس بعد. ابدأ بإضافة الدرس الأول عبر النموذج أدناه.
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">إضافة درس جديد</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">عنوان الدرس</label>
              <input
                type="text"
                value={newLesson.title}
                onChange={(event) => handleNewLessonChange('title', event.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="مثال: مقدمة في التدريب"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">مدة الدرس (بالدقائق)</label>
              <input
                type="number"
                min={1}
                value={newLesson.durationMinutes}
                onChange={(event) => handleNewLessonChange('durationMinutes', Math.max(1, Number(event.target.value)))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="10"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-gray-700">رابط الفيديو</label>
              <input
                type="text"
                value={newLesson.videoUrl}
                onChange={(event) => handleNewLessonChange('videoUrl', event.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="https://..."
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-gray-700">وصف الدرس</label>
              <textarea
                value={newLesson.description}
                onChange={(event) => handleNewLessonChange('description', event.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                rows={3}
                placeholder="نبذة مختصرة عن محتوى الدرس"
              />
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <input
              id="new-lesson-preview"
              type="checkbox"
              checked={newLesson.isPreview}
              onChange={(event) => handleNewLessonChange('isPreview', event.target.checked)}
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
            />
            <label htmlFor="new-lesson-preview" className="text-sm text-gray-700">
              إتاحة الدرس الجديد كمقطع تجريبي مجاني
            </label>
          </div>

          <div className="mt-4">
            <button
              type="button"
              onClick={addLesson}
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium px-4 py-2 rounded-lg transition-colors"
            >
              إضافة الدرس إلى القائمة
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
