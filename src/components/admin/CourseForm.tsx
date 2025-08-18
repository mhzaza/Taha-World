'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  PhotoIcon,
  DocumentIcon,
  PlusIcon,
  TrashIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { Course, Lesson } from '@/types';

interface CourseFormProps {
  course?: Course;
  isEditing?: boolean;
}

interface FormData {
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  price: number;
  originalPrice: number;
  currency: 'USD' | 'SAR' | 'EGP';
  level: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  tags: string[];
  requirements: string[];
  whatYouWillLearn: string[];
  language: 'ar' | 'en';
  thumbnail: string;
  previewVideo: string;
  isPublished: boolean;
  isFeatured: boolean;
  instructor: {
    name: string;
    bio: string;
    credentials: string[];
  };
}

interface FormErrors {
  [key: string]: string;
}

export default function CourseForm({ course, isEditing = false }: CourseFormProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [tagInput, setTagInput] = useState('');
  const [requirementInput, setRequirementInput] = useState('');
  const [learningInput, setLearningInput] = useState('');
  const [credentialInput, setCredentialInput] = useState('');

  const [formData, setFormData] = useState<FormData>({
    title: course?.title || '',
    titleEn: course?.titleEn || '',
    description: course?.description || '',
    descriptionEn: course?.descriptionEn || '',
    price: course?.price || 0,
    originalPrice: course?.originalPrice || 0,
    currency: course?.currency || 'USD',
    level: course?.level || 'beginner',
    category: course?.category || '',
    tags: course?.tags || [],
    requirements: course?.requirements || [],
    whatYouWillLearn: course?.whatYouWillLearn || [],
    language: course?.language || 'ar',
    thumbnail: course?.thumbnail || '',
    previewVideo: course?.previewVideo || '',
    isPublished: course?.isPublished || false,
    isFeatured: course?.isFeatured || false,
    instructor: {
      name: course?.instructor?.name || '',
      bio: course?.instructor?.bio || '',
      credentials: course?.instructor?.credentials || []
    }
  });

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Required fields validation
    if (!formData.title.trim()) {
      newErrors.title = 'عنوان الكورس مطلوب';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'وصف الكورس مطلوب';
    }

    if (formData.price <= 0) {
      newErrors.price = 'سعر الكورس يجب أن يكون أكبر من صفر';
    }

    if (!formData.category.trim()) {
      newErrors.category = 'فئة الكورس مطلوبة';
    }

    if (!formData.instructor.name.trim()) {
      newErrors.instructorName = 'اسم المدرب مطلوب';
    }

    if (formData.whatYouWillLearn.length === 0) {
      newErrors.whatYouWillLearn = 'يجب إضافة ما سيتعلمه الطالب';
    }

    // Price validation
    if (formData.originalPrice > 0 && formData.originalPrice <= formData.price) {
      newErrors.originalPrice = 'السعر الأصلي يجب أن يكون أكبر من السعر الحالي';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!user) {
      setErrors({ submit: 'يجب تسجيل الدخول أولاً' });
      return;
    }

    setLoading(true);

    try {
      // Get Firebase token
      const token = await user.getIdToken();
      
      const url = isEditing ? `/api/admin/courses/${course?.id}` : '/api/admin/courses';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          duration: 0, // Will be calculated from lessons
          lessons: course?.lessons || [],
          rating: course?.rating || { average: 0, count: 0 },
          enrollmentCount: course?.enrollmentCount || 0
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'حدث خطأ أثناء حفظ الكورس');
      }

      router.push('/admin/courses');
    } catch (error) {
      console.error('Error saving course:', error);
      setErrors({ submit: error instanceof Error ? error.message : 'حدث خطأ غير متوقع' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleInstructorChange = (field: keyof FormData['instructor'], value: string) => {
    setFormData(prev => ({
      ...prev,
      instructor: { ...prev.instructor, [field]: value }
    }));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  const addRequirement = () => {
    if (requirementInput.trim() && !formData.requirements.includes(requirementInput.trim())) {
      setFormData(prev => ({
        ...prev,
        requirements: [...prev.requirements, requirementInput.trim()]
      }));
      setRequirementInput('');
    }
  };

  const removeRequirement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }));
  };

  const addLearning = () => {
    if (learningInput.trim() && !formData.whatYouWillLearn.includes(learningInput.trim())) {
      setFormData(prev => ({
        ...prev,
        whatYouWillLearn: [...prev.whatYouWillLearn, learningInput.trim()]
      }));
      setLearningInput('');
    }
  };

  const removeLearning = (index: number) => {
    setFormData(prev => ({
      ...prev,
      whatYouWillLearn: prev.whatYouWillLearn.filter((_, i) => i !== index)
    }));
  };

  const addCredential = () => {
    if (credentialInput.trim() && !formData.instructor.credentials.includes(credentialInput.trim())) {
      setFormData(prev => ({
        ...prev,
        instructor: {
          ...prev.instructor,
          credentials: [...prev.instructor.credentials, credentialInput.trim()]
        }
      }));
      setCredentialInput('');
    }
  };

  const removeCredential = (index: number) => {
    setFormData(prev => ({
      ...prev,
      instructor: {
        ...prev.instructor,
        credentials: prev.instructor.credentials.filter((_, i) => i !== index)
      }
    }));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditing ? 'تعديل الكورس' : 'إنشاء كورس جديد'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Alert */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                <div className="mr-3">
                  <p className="text-sm text-red-800">{errors.submit}</p>
                </div>
              </div>
            </div>
          )}

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                عنوان الكورس *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.title ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="أدخل عنوان الكورس"
              />
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                العنوان بالإنجليزية
              </label>
              <input
                type="text"
                value={formData.titleEn}
                onChange={(e) => handleInputChange('titleEn', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter course title in English"
              />
            </div>
          </div>

          {/* Description */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                وصف الكورس *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.description ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="أدخل وصف الكورس"
              />
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الوصف بالإنجليزية
              </label>
              <textarea
                value={formData.descriptionEn}
                onChange={(e) => handleInputChange('descriptionEn', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter course description in English"
              />
            </div>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                سعر الكورس *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.price ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                السعر الأصلي
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.originalPrice}
                onChange={(e) => handleInputChange('originalPrice', parseFloat(e.target.value) || 0)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.originalPrice ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.originalPrice && <p className="mt-1 text-sm text-red-600">{errors.originalPrice}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                العملة
              </label>
              <select
                value={formData.currency}
                onChange={(e) => handleInputChange('currency', e.target.value as 'USD' | 'SAR' | 'EGP')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="USD">دولار أمريكي (USD)</option>
                <option value="SAR">ريال سعودي (SAR)</option>
                <option value="EGP">جنيه مصري (EGP)</option>
              </select>
            </div>
          </div>

          {/* Level and Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                مستوى الكورس
              </label>
              <select
                value={formData.level}
                onChange={(e) => handleInputChange('level', e.target.value as 'beginner' | 'intermediate' | 'advanced')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="beginner">مبتدئ</option>
                <option value="intermediate">متوسط</option>
                <option value="advanced">متقدم</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                فئة الكورس *
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.category ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="مثل: كمال الأجسام، اللياقة البدنية"
              />
              {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
            </div>
          </div>

          {/* Language and Media */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                لغة الكورس
              </label>
              <select
                value={formData.language}
                onChange={(e) => handleInputChange('language', e.target.value as 'ar' | 'en')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ar">العربية</option>
                <option value="en">الإنجليزية</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                صورة الكورس
              </label>
              <input
                type="url"
                value={formData.thumbnail}
                onChange={(e) => handleInputChange('thumbnail', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="رابط صورة الكورس"
              />
            </div>
          </div>

          {/* Preview Video */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              فيديو المعاينة
            </label>
            <input
              type="url"
              value={formData.previewVideo}
              onChange={(e) => handleInputChange('previewVideo', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="رابط فيديو المعاينة"
            />
          </div>

          {/* Instructor Information */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">معلومات المدرب</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  اسم المدرب *
                </label>
                <input
                  type="text"
                  value={formData.instructor.name}
                  onChange={(e) => handleInstructorChange('name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.instructorName ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="أدخل اسم المدرب"
                />
                {errors.instructorName && <p className="mt-1 text-sm text-red-600">{errors.instructorName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نبذة عن المدرب
                </label>
                <textarea
                  value={formData.instructor.bio}
                  onChange={(e) => handleInstructorChange('bio', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="نبذة مختصرة عن المدرب"
                />
              </div>
            </div>

            {/* Instructor Credentials */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                مؤهلات المدرب
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={credentialInput}
                  onChange={(e) => setCredentialInput(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="أدخل مؤهل أو شهادة"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCredential())}
                />
                <button
                  type="button"
                  onClick={addCredential}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <PlusIcon className="h-4 w-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.instructor.credentials.map((credential, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {credential}
                    <button
                      type="button"
                      onClick={() => removeCredential(index)}
                      className="mr-2 text-blue-600 hover:text-blue-800"
                    >
                      <TrashIcon className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              علامات الكورس
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="أدخل علامة"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <PlusIcon className="h-4 w-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(index)}
                    className="mr-2 text-gray-600 hover:text-gray-800"
                  >
                    <TrashIcon className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Requirements */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              متطلبات الكورس
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={requirementInput}
                onChange={(e) => setRequirementInput(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="أدخل متطلب"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
              />
              <button
                type="button"
                onClick={addRequirement}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <PlusIcon className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-2">
              {formData.requirements.map((requirement, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                  <span className="text-sm">{requirement}</span>
                  <button
                    type="button"
                    onClick={() => removeRequirement(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* What You Will Learn */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ما سيتعلمه الطالب *
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={learningInput}
                onChange={(e) => setLearningInput(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="أدخل ما سيتعلمه الطالب"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLearning())}
              />
              <button
                type="button"
                onClick={addLearning}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <PlusIcon className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-2">
              {formData.whatYouWillLearn.map((learning, index) => (
                <div key={index} className="flex items-center justify-between bg-green-50 px-3 py-2 rounded">
                  <span className="text-sm">{learning}</span>
                  <button
                    type="button"
                    onClick={() => removeLearning(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            {errors.whatYouWillLearn && <p className="mt-1 text-sm text-red-600">{errors.whatYouWillLearn}</p>}
          </div>

          {/* Publishing Options */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">خيارات النشر</h3>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPublished"
                  checked={formData.isPublished}
                  onChange={(e) => handleInputChange('isPublished', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isPublished" className="mr-2 block text-sm text-gray-900">
                  نشر الكورس
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isFeatured"
                  checked={formData.isFeatured}
                  onChange={(e) => handleInputChange('isFeatured', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isFeatured" className="mr-2 block text-sm text-gray-900">
                  كورس مميز
                </label>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'جاري الحفظ...' : (isEditing ? 'تحديث الكورس' : 'إنشاء الكورس')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}