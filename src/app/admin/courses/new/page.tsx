'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRightIcon,
  PlusIcon,
  TrashIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import { Course, Lesson } from '@/types';

interface CourseFormData {
  title: string;
  description: string;
  price: number;
  level: string;
  duration: string;
  instructor: string;
  thumbnail: string;
  published: boolean;
  lessons: Lesson[];
}

interface FormErrors {
  title?: string;
  description?: string;
  price?: string;
  level?: string;
  duration?: string;
  instructor?: string;
  thumbnail?: string;
  lessons?: string;
}

export default function NewCoursePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CourseFormData>({
    title: '',
    description: '',
    price: 0,
    level: 'مبتدئ',
    duration: '',
    instructor: 'طه صباغ',
    thumbnail: '',
    published: false,
    lessons: []
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = 'عنوان الكورس مطلوب';
    } else if (formData.title.length < 5) {
      newErrors.title = 'عنوان الكورس يجب أن يكون 5 أحرف على الأقل';
    }

    // Description validation
    if (!formData.description.trim()) {
      newErrors.description = 'وصف الكورس مطلوب';
    } else if (formData.description.length < 20) {
      newErrors.description = 'وصف الكورس يجب أن يكون 20 حرف على الأقل';
    }

    // Price validation
    if (formData.price <= 0) {
      newErrors.price = 'سعر الكورس يجب أن يكون أكبر من صفر';
    }

    // Duration validation
    if (!formData.duration.trim()) {
      newErrors.duration = 'مدة الكورس مطلوبة';
    }

    // Instructor validation
    if (!formData.instructor.trim()) {
      newErrors.instructor = 'اسم المدرب مطلوب';
    }

    // Thumbnail validation
    if (!formData.thumbnail.trim()) {
      newErrors.thumbnail = 'صورة الكورس مطلوبة';
    } else if (!isValidUrl(formData.thumbnail)) {
      newErrors.thumbnail = 'رابط الصورة غير صحيح';
    }

    // Lessons validation
    if (formData.lessons.length === 0) {
      newErrors.lessons = 'يجب إضافة درس واحد على الأقل';
    } else {
      const hasInvalidLesson = formData.lessons.some(lesson => 
        !lesson.title.trim() || !lesson.duration.trim()
      );
      if (hasInvalidLesson) {
        newErrors.lessons = 'جميع الدروس يجب أن تحتوي على عنوان ومدة';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleInputChange = (field: keyof CourseFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const addLesson = () => {
    const newLesson: Lesson = {
      id: Date.now().toString(),
      title: '',
      duration: '',
      videoUrl: ''
    };
    setFormData(prev => ({
      ...prev,
      lessons: [...prev.lessons, newLesson]
    }));
  };

  const updateLesson = (index: number, field: keyof Lesson, value: string) => {
    setFormData(prev => ({
      ...prev,
      lessons: prev.lessons.map((lesson, i) => 
        i === index ? { ...lesson, [field]: value } : lesson
      )
    }));
  };

  const removeLesson = (index: number) => {
    setFormData(prev => ({
      ...prev,
      lessons: prev.lessons.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Mock API call - replace with real implementation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newCourse: Course = {
        id: Date.now().toString(),
        ...formData
      };
      
      console.log('Creating course:', newCourse);
      
      // Redirect to courses list
      router.push('/admin/courses');
    } catch (error) {
      console.error('Error creating course:', error);
      alert('حدث خطأ أثناء إنشاء الكورس. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAsDraft = async () => {
    setFormData(prev => ({ ...prev, published: false }));
    await handleSubmit(new Event('submit') as any);
  };

  const handlePublish = async () => {
    setFormData(prev => ({ ...prev, published: true }));
    await handleSubmit(new Event('submit') as any);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowRightIcon className="h-5 w-5 ml-2" />
            العودة
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">إنشاء كورس جديد</h1>
            <p className="mt-2 text-gray-600">أضف كورس تدريبي جديد للمنصة</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">المعلومات الأساسية</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                عنوان الكورس *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="مثال: كورس تدريب كمال الأجسام المتقدم"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                وصف الكورس *
              </label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="وصف شامل للكورس ومحتواه وما سيتعلمه الطالب..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                السعر (بالدولار) *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.price ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="199"
              />
              {errors.price && (
                <p className="mt-1 text-sm text-red-600">{errors.price}</p>
              )}
            </div>

            {/* Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                مستوى الكورس *
              </label>
              <select
                value={formData.level}
                onChange={(e) => handleInputChange('level', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="مبتدئ">مبتدئ</option>
                <option value="متوسط">متوسط</option>
                <option value="متقدم">متقدم</option>
              </select>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                مدة الكورس *
              </label>
              <input
                type="text"
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.duration ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="8 أسابيع"
              />
              {errors.duration && (
                <p className="mt-1 text-sm text-red-600">{errors.duration}</p>
              )}
            </div>

            {/* Instructor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                المدرب *
              </label>
              <input
                type="text"
                value={formData.instructor}
                onChange={(e) => handleInputChange('instructor', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.instructor ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="طه صباغ"
              />
              {errors.instructor && (
                <p className="mt-1 text-sm text-red-600">{errors.instructor}</p>
              )}
            </div>

            {/* Thumbnail */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                رابط صورة الكورس *
              </label>
              <div className="flex space-x-4">
                <input
                  type="url"
                  value={formData.thumbnail}
                  onChange={(e) => handleInputChange('thumbnail', e.target.value)}
                  className={`flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.thumbnail ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="https://example.com/image.jpg"
                />
                {formData.thumbnail && (
                  <div className="flex-shrink-0">
                    <img
                      src={formData.thumbnail}
                      alt="معاينة"
                      className="h-10 w-10 rounded-lg object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/course-placeholder.jpg';
                      }}
                    />
                  </div>
                )}
              </div>
              {errors.thumbnail && (
                <p className="mt-1 text-sm text-red-600">{errors.thumbnail}</p>
              )}
            </div>
          </div>
        </div>

        {/* Lessons */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium text-gray-900">دروس الكورس</h2>
            <button
              type="button"
              onClick={addLesson}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="h-4 w-4 ml-2" />
              إضافة درس
            </button>
          </div>

          {formData.lessons.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
              <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">لا توجد دروس</h3>
              <p className="mt-1 text-sm text-gray-500">ابدأ بإضافة الدرس الأول</p>
              <button
                type="button"
                onClick={addLesson}
                className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <PlusIcon className="h-4 w-4 ml-2" />
                إضافة درس
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {formData.lessons.map((lesson, index) => (
                <div key={lesson.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-medium text-gray-900">الدرس {index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => removeLesson(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        عنوان الدرس
                      </label>
                      <input
                        type="text"
                        value={lesson.title}
                        onChange={(e) => updateLesson(index, 'title', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="مثال: مقدمة في كمال الأجسام"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        المدة
                      </label>
                      <input
                        type="text"
                        value={lesson.duration}
                        onChange={(e) => updateLesson(index, 'duration', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="15 دقيقة"
                      />
                    </div>
                    
                    <div className="md:col-span-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        رابط الفيديو (اختياري)
                      </label>
                      <input
                        type="url"
                        value={lesson.videoUrl}
                        onChange={(e) => updateLesson(index, 'videoUrl', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="https://example.com/video.mp4"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {errors.lessons && (
            <p className="mt-2 text-sm text-red-600">{errors.lessons}</p>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-between bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              إلغاء
            </button>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={handleSaveAsDraft}
              disabled={loading}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'جاري الحفظ...' : 'حفظ كمسودة'}
            </button>
            
            <button
              type="submit"
              onClick={handlePublish}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'جاري النشر...' : 'نشر الكورس'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}