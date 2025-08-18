'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowRightIcon,
  PlusIcon,
  TrashIcon,
  PhotoIcon,
  PencilIcon,
  EyeIcon
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
  isPublished: boolean;
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

// Mock data for demonstration
const mockCourse: Course = {
  id: '1',
  title: 'كورس تدريب كمال الأجسام المتقدم',
  description: 'كورس شامل لتعلم تقنيات كمال الأجسام المتقدمة مع التركيز على التغذية والتمارين المتخصصة.',
  price: 299,
  level: 'متقدم',
  duration: '12 أسبوع',
  instructor: 'طه صباغ',
  thumbnail: '/images/bodybuilding-course.jpg',
  isPublished: true,
  lessons: [
    {
      id: '1',
      title: 'مقدمة في كمال الأجسام المتقدم',
      duration: '25 دقيقة',
      videoUrl: 'https://example.com/video1.mp4'
    },
    {
      id: '2',
      title: 'تقنيات التدريب المتقدمة',
      duration: '35 دقيقة',
      videoUrl: 'https://example.com/video2.mp4'
    },
    {
      id: '3',
      title: 'التغذية للاعبي كمال الأجسام',
      duration: '30 دقيقة',
      videoUrl: 'https://example.com/video3.mp4'
    }
  ]
};

export default function CourseDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id as string;
  
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<CourseFormData>({
    title: '',
    description: '',
    price: 0,
    level: 'مبتدئ',
    duration: '',
    instructor: 'طه صباغ',
    thumbnail: '',
    isPublished: false,
    lessons: []
  });
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    // Load course data
    const loadCourse = async () => {
      try {
        // Mock API call - replace with real implementation
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (courseId === 'new') {
          setIsEditing(true);
          return;
        }
        
        // For demo, use mock data
        const course = mockCourse;
        setFormData({
          title: course.title,
          description: course.description,
          price: course.price,
          level: course.level,
          duration: course.duration,
          instructor: course.instructor,
          thumbnail: course.thumbnail,
          isPublished: course.isPublished,
          lessons: course.lessons
        });
      } catch (error) {
        console.error('Error loading course:', error);
        alert('حدث خطأ أثناء تحميل بيانات الكورس');
      }
    };

    loadCourse();
  }, [courseId]);

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
      
      console.log('Updating course:', formData);
      
      // Exit edit mode
      setIsEditing(false);
      alert('تم حفظ التغييرات بنجاح!');
    } catch (error) {
      console.error('Error updating course:', error);
      alert('حدث خطأ أثناء حفظ التغييرات. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const togglePublishStatus = async () => {
    setLoading(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newStatus = !formData.published;
      setFormData(prev => ({ ...prev, published: newStatus }));
      
      alert(newStatus ? 'تم نشر الكورس بنجاح!' : 'تم إلغاء نشر الكورس!');
    } catch (error) {
      console.error('Error toggling publish status:', error);
      alert('حدث خطأ أثناء تغيير حالة النشر');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('هل أنت متأكد من حذف هذا الكورس؟ لا يمكن التراجع عن هذا الإجراء.')) {
      return;
    }

    setLoading(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('تم حذف الكورس بنجاح!');
      router.push('/admin/courses');
    } catch (error) {
      console.error('Error deleting course:', error);
      alert('حدث خطأ أثناء حذف الكورس');
    } finally {
      setLoading(false);
    }
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
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditing ? 'تعديل الكورس' : 'تفاصيل الكورس'}
            </h1>
            <p className="mt-2 text-gray-600">
              {isEditing ? 'قم بتعديل معلومات الكورس' : 'عرض تفاصيل الكورس'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {!isEditing && (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <PencilIcon className="h-4 w-4 ml-2" />
                تعديل
              </button>
              
              <button
                onClick={togglePublishStatus}
                disabled={loading}
                className={`inline-flex items-center px-4 py-2 rounded-lg transition-colors disabled:opacity-50 ${
                  formData.published
                    ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {formData.published ? 'إلغاء النشر' : 'نشر الكورس'}
              </button>
              
              <button
                onClick={handleDelete}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                <TrashIcon className="h-4 w-4 ml-2" />
                حذف
              </button>
            </>
          )}
        </div>
      </div>

      {/* Course Status */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              formData.published
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {formData.published ? 'منشور' : 'مسودة'}
            </span>
            <span className="text-sm text-gray-500">
              آخر تحديث: {new Date().toLocaleDateString('ar-SA')}
            </span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <EyeIcon className="h-4 w-4" />
            <span>1,234 مشاهدة</span>
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
              {isEditing ? (
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="مثال: كورس تدريب كمال الأجسام المتقدم"
                />
              ) : (
                <p className="text-gray-900 font-medium">{formData.title}</p>
              )}
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                وصف الكورس *
              </label>
              {isEditing ? (
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="وصف شامل للكورس ومحتواه وما سيتعلمه الطالب..."
                />
              ) : (
                <p className="text-gray-700">{formData.description}</p>
              )}
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                السعر (بالدولار) *
              </label>
              {isEditing ? (
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
              ) : (
                <p className="text-gray-900 font-medium">${formData.price}</p>
              )}
              {errors.price && (
                <p className="mt-1 text-sm text-red-600">{errors.price}</p>
              )}
            </div>

            {/* Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                مستوى الكورس *
              </label>
              {isEditing ? (
                <select
                  value={formData.level}
                  onChange={(e) => handleInputChange('level', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="مبتدئ">مبتدئ</option>
                  <option value="متوسط">متوسط</option>
                  <option value="متقدم">متقدم</option>
                </select>
              ) : (
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  formData.level === 'مبتدئ' ? 'bg-green-100 text-green-800' :
                  formData.level === 'متوسط' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {formData.level}
                </span>
              )}
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                مدة الكورس *
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.duration ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="8 أسابيع"
                />
              ) : (
                <p className="text-gray-900">{formData.duration}</p>
              )}
              {errors.duration && (
                <p className="mt-1 text-sm text-red-600">{errors.duration}</p>
              )}
            </div>

            {/* Instructor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                المدرب *
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.instructor}
                  onChange={(e) => handleInputChange('instructor', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.instructor ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="طه صباغ"
                />
              ) : (
                <p className="text-gray-900">{formData.instructor}</p>
              )}
              {errors.instructor && (
                <p className="mt-1 text-sm text-red-600">{errors.instructor}</p>
              )}
            </div>

            {/* Thumbnail */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                صورة الكورس *
              </label>
              <div className="flex space-x-4">
                {isEditing ? (
                  <input
                    type="url"
                    value={formData.thumbnail}
                    onChange={(e) => handleInputChange('thumbnail', e.target.value)}
                    className={`flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.thumbnail ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="https://example.com/image.jpg"
                  />
                ) : (
                  <p className="flex-1 text-gray-700 break-all">{formData.thumbnail}</p>
                )}
                
                {formData.thumbnail && (
                  <div className="flex-shrink-0">
                    <img
                      src={formData.thumbnail}
                      alt="معاينة"
                      className="h-20 w-20 rounded-lg object-cover"
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
            {isEditing && (
              <button
                type="button"
                onClick={addLesson}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <PlusIcon className="h-4 w-4 ml-2" />
                إضافة درس
              </button>
            )}
          </div>

          {formData.lessons.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
              <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">لا توجد دروس</h3>
              <p className="mt-1 text-sm text-gray-500">ابدأ بإضافة الدرس الأول</p>
              {isEditing && (
                <button
                  type="button"
                  onClick={addLesson}
                  className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <PlusIcon className="h-4 w-4 ml-2" />
                  إضافة درس
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {formData.lessons.map((lesson, index) => (
                <div key={lesson.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-medium text-gray-900">الدرس {index + 1}</h4>
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => removeLesson(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        عنوان الدرس
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={lesson.title}
                          onChange={(e) => updateLesson(index, 'title', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="مثال: مقدمة في كمال الأجسام"
                        />
                      ) : (
                        <p className="text-gray-900">{lesson.title}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        المدة
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={lesson.duration}
                          onChange={(e) => updateLesson(index, 'duration', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="15 دقيقة"
                        />
                      ) : (
                        <p className="text-gray-900">{lesson.duration}</p>
                      )}
                    </div>
                    
                    <div className="md:col-span-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        رابط الفيديو
                      </label>
                      {isEditing ? (
                        <input
                          type="url"
                          value={lesson.videoUrl}
                          onChange={(e) => updateLesson(index, 'videoUrl', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="https://example.com/video.mp4"
                        />
                      ) : (
                        <p className="text-gray-700 break-all">{lesson.videoUrl || 'لا يوجد رابط'}</p>
                      )}
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
        {isEditing && (
          <div className="flex items-center justify-between bg-white rounded-lg shadow p-6">
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                إلغاء
              </button>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}