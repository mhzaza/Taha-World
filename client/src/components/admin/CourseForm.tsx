'use client';

import { useState } from 'react';
import { PhotoIcon } from '@heroicons/react/24/outline';
import { uploadAPI } from '@/lib/api';

interface CourseFormData {
  title: string;
  titleEn?: string;
  description: string;
  descriptionEn?: string;
  price: number;
  originalPrice?: number;
  currency: string;
  duration: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  tags: string[];
  requirements: string[];
  whatYouWillLearn: string[];
  language: 'ar' | 'en';
  subtitles: string[];
  isPublished: boolean;
  isFeatured: boolean;
  thumbnail: string;
  instructor: {
    name: string;
    bio?: string;
    credentials?: string[];
  };
}

interface CourseFormProps {
  initialData?: Partial<CourseFormData>;
  onSubmit: (data: CourseFormData) => Promise<void>;
  submitText: string;
  loading?: boolean;
}

export default function CourseForm({ initialData, onSubmit, submitText, loading = false }: CourseFormProps) {
  const [formData, setFormData] = useState<CourseFormData>({
    title: '',
    titleEn: '',
    description: '',
    descriptionEn: '',
    price: 0,
    originalPrice: 0,
    currency: 'USD',
    duration: 0,
    level: 'beginner',
    category: '',
    tags: [],
    requirements: [],
    whatYouWillLearn: [],
    language: 'ar',
    subtitles: [],
    isPublished: false,
    isFeatured: false,
    thumbnail: '',
    instructor: {
      name: '',
      bio: '',
      credentials: [],
    },
    ...initialData,
  });

  const [uploadingImage, setUploadingImage] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [newRequirement, setNewRequirement] = useState('');
  const [newLearningPoint, setNewLearningPoint] = useState('');
  const [newCredential, setNewCredential] = useState('');

  const handleImageUpload = async (file: File) => {
    try {
      setUploadingImage(true);
      const response = await uploadAPI.uploadCourseThumbnail(file);
      if (response.data.success && response.data.data?.thumbnail) {
        const thumbnail = response.data.data.thumbnail as { secure_url: string };
        setFormData(prev => ({ ...prev, thumbnail: thumbnail.secure_url }));
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('خطأ في رفع الصورة');
    } finally {
      setUploadingImage(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag.trim()] }));
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  const addRequirement = () => {
    if (newRequirement.trim() && !formData.requirements.includes(newRequirement.trim())) {
      setFormData(prev => ({ ...prev, requirements: [...prev.requirements, newRequirement.trim()] }));
      setNewRequirement('');
    }
  };

  const removeRequirement = (requirement: string) => {
    setFormData(prev => ({ ...prev, requirements: prev.requirements.filter(r => r !== requirement) }));
  };

  const addLearningPoint = () => {
    if (newLearningPoint.trim() && !formData.whatYouWillLearn.includes(newLearningPoint.trim())) {
      setFormData(prev => ({ ...prev, whatYouWillLearn: [...prev.whatYouWillLearn, newLearningPoint.trim()] }));
      setNewLearningPoint('');
    }
  };

  const removeLearningPoint = (point: string) => {
    setFormData(prev => ({ ...prev, whatYouWillLearn: prev.whatYouWillLearn.filter(p => p !== point) }));
  };

  const addCredential = () => {
    if (newCredential.trim() && !formData.instructor.credentials?.includes(newCredential.trim())) {
      setFormData(prev => ({ 
        ...prev, 
        instructor: { 
          ...prev.instructor, 
          credentials: [...(prev.instructor.credentials || []), newCredential.trim()] 
        } 
      }));
      setNewCredential('');
    }
  };

  const removeCredential = (credential: string) => {
    setFormData(prev => ({ 
      ...prev, 
      instructor: { 
        ...prev.instructor, 
        credentials: prev.instructor.credentials?.filter(c => c !== credential) || [] 
      } 
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <div className="bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-6">المعلومات الأساسية</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              عنوان الكورس (عربي) *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="أدخل عنوان الكورس"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              عنوان الكورس (إنجليزي)
            </label>
            <input
              type="text"
              value={formData.titleEn}
              onChange={(e) => setFormData(prev => ({ ...prev, titleEn: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter course title"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              الوصف (عربي) *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="أدخل وصف الكورس"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              الوصف (إنجليزي)
            </label>
            <textarea
              value={formData.descriptionEn}
              onChange={(e) => setFormData(prev => ({ ...prev, descriptionEn: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter course description"
            />
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-6">التسعير</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              السعر الحالي *
            </label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0"
              min="0"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              السعر الأصلي
            </label>
            <input
              type="number"
              value={formData.originalPrice}
              onChange={(e) => setFormData(prev => ({ ...prev, originalPrice: Number(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0"
              min="0"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              العملة
            </label>
            <select
              value={formData.currency}
              onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="USD">USD</option>
              <option value="SAR">SAR</option>
              <option value="EUR">EUR</option>
            </select>
          </div>
        </div>
      </div>

      {/* Course Details */}
      <div className="bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-6">تفاصيل الكورس</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              المدة (ساعات) *
            </label>
            <input
              type="number"
              value={formData.duration}
              onChange={(e) => setFormData(prev => ({ ...prev, duration: Number(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0"
              min="0"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              المستوى *
            </label>
            <select
              value={formData.level}
              onChange={(e) => setFormData(prev => ({ ...prev, level: e.target.value as 'beginner' | 'intermediate' | 'advanced' }))}
              className="w-full px-3 py-2 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="beginner">مبتدئ</option>
              <option value="intermediate">متوسط</option>
              <option value="advanced">متقدم</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              الفئة *
            </label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="أدخل فئة الكورس"
              required
            />
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-200 mb-2">
            اللغة
          </label>
          <select
            value={formData.language}
            onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value as 'ar' | 'en' }))}
            className="w-full px-3 py-2 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent max-w-xs"
          >
            <option value="ar">العربية</option>
            <option value="en">English</option>
          </select>
        </div>
      </div>

      {/* Thumbnail Upload */}
      <div className="bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-6">صورة الكورس</h2>
        
        <div className="flex items-center space-x-4">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImageUpload(file);
            }}
            className="hidden"
            id="thumbnail-upload"
          />
          <label
            htmlFor="thumbnail-upload"
            className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-200 bg-gray-800 hover:bg-gray-700"
          >
            <PhotoIcon className="h-4 w-4 ml-2" />
            {uploadingImage ? 'جاري الرفع...' : 'رفع صورة'}
          </label>
          {formData.thumbnail && (
            <img
              src={formData.thumbnail}
              alt="Course thumbnail"
              className="h-20 w-32 object-cover rounded-md"
            />
          )}
        </div>
      </div>

      {/* Instructor Information */}
      <div className="bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-6">معلومات المدرب</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              اسم المدرب *
            </label>
            <input
              type="text"
              value={formData.instructor.name}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                instructor: { ...prev.instructor, name: e.target.value }
              }))}
              className="w-full px-3 py-2 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="أدخل اسم المدرب"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              نبذة عن المدرب
            </label>
            <textarea
              value={formData.instructor.bio}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                instructor: { ...prev.instructor, bio: e.target.value }
              }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="أدخل نبذة عن المدرب"
            />
          </div>
        </div>
      </div>

      {/* Tags */}
      <div className="bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-6">العلامات</h2>
        
        <div className="flex items-center space-x-2 mb-4">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
            className="flex-1 px-3 py-2 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="أدخل علامة جديدة"
          />
          <button
            type="button"
            onClick={addTag}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            إضافة
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="mr-2 text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Requirements */}
      <div className="bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-6">المتطلبات</h2>
        
        <div className="flex items-center space-x-2 mb-4">
          <input
            type="text"
            value={newRequirement}
            onChange={(e) => setNewRequirement(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
            className="flex-1 px-3 py-2 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="أدخل متطلب جديد"
          />
          <button
            type="button"
            onClick={addRequirement}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            إضافة
          </button>
        </div>
        <div className="space-y-2">
          {formData.requirements.map((requirement) => (
            <div
              key={requirement}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
            >
              <span className="text-sm">{requirement}</span>
              <button
                type="button"
                onClick={() => removeRequirement(requirement)}
                className="text-red-600 hover:text-red-800"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* What You Will Learn */}
      <div className="bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-6">ما سوف تتعلمه</h2>
        
        <div className="flex items-center space-x-2 mb-4">
          <input
            type="text"
            value={newLearningPoint}
            onChange={(e) => setNewLearningPoint(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLearningPoint())}
            className="flex-1 px-3 py-2 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="أدخل نقطة تعلم جديدة"
          />
          <button
            type="button"
            onClick={addLearningPoint}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            إضافة
          </button>
        </div>
        <div className="space-y-2">
          {formData.whatYouWillLearn.map((point) => (
            <div
              key={point}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
            >
              <span className="text-sm">{point}</span>
              <button
                type="button"
                onClick={() => removeLearningPoint(point)}
                className="text-red-600 hover:text-red-800"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Instructor Credentials */}
      <div className="bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-6">مؤهلات المدرب</h2>
        
        <div className="flex items-center space-x-2 mb-4">
          <input
            type="text"
            value={newCredential}
            onChange={(e) => setNewCredential(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCredential())}
            className="flex-1 px-3 py-2 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="أدخل مؤهل جديد"
          />
          <button
            type="button"
            onClick={addCredential}
            className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
          >
            إضافة
          </button>
        </div>
        <div className="space-y-2">
          {formData.instructor.credentials?.map((credential) => (
            <div
              key={credential}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
            >
              <span className="text-sm">{credential}</span>
              <button
                type="button"
                onClick={() => removeCredential(credential)}
                className="text-red-600 hover:text-red-800"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Status Options */}
      <div className="bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-6">خيارات النشر</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isPublished"
              checked={formData.isPublished}
              onChange={(e) => setFormData(prev => ({ ...prev, isPublished: e.target.checked }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded"
            />
            <label htmlFor="isPublished" className="mr-3 block text-sm text-gray-900">
              نشر الكورس
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isFeatured"
              checked={formData.isFeatured}
              onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded"
            />
            <label htmlFor="isFeatured" className="mr-3 block text-sm text-gray-900">
              كورس مميز
            </label>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'جاري الحفظ...' : submitText}
        </button>
      </div>
    </form>
  );
}

export type { CourseFormData };
