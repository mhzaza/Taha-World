'use client';

import { useState, useEffect } from 'react';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  PlayIcon,
  ClockIcon,
  DocumentTextIcon,
  CheckIcon,
  CloudArrowUpIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { uploadAPI } from '@/lib/api';
import { AxiosError } from 'axios';

interface Lesson {
  _id: string;
  title: string;
  description: string;
  videoUrl: string;
  duration: number;
  order: number;
  isFree: boolean;
  resources: Array<{
    title: string;
    url: string;
    type: string;
  }>;
  quiz: {
    questions: Array<{
      question: string;
      options: string[];
      correctAnswer: number;
      explanation: string;
      points: number;
    }>;
    passingScore: number;
  };
}

interface LessonManagerContentProps {
  courseId: string;
  courseTitle: string;
  onBack: () => void;
}

interface LessonFormData {
  title: string;
  description: string;
  videoUrl: string;
  duration: number;
  order: number;
  isFree: boolean;
}

export default function LessonManagerContent({ courseId, courseTitle, onBack }: LessonManagerContentProps) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [formData, setFormData] = useState<LessonFormData>({
    title: '',
    description: '',
    videoUrl: '',
    duration: 0,
    order: 1,
    isFree: false
  });
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
  }>>([]);
  const [videoUploadType, setVideoUploadType] = useState<'url' | 'file'>('url');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  // Helper function to get auth token
  const getAuthToken = () => {
    return document.cookie
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1];
  };

  // Add notification
  const addNotification = (type: 'success' | 'error' | 'warning' | 'info', message: string) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  // Handle video file upload
  const handleVideoUpload = async (file: File) => {
    // Validate file size (100MB limit)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      addNotification('error', `حجم الفيديو كبير جداً. الحد الأقصى المسموح 100 ميجابايت. حجم الملف الحالي: ${(file.size / (1024 * 1024)).toFixed(1)} ميجابايت`);
      return;
    }

    try {
      setUploadingVideo(true);
      setVideoFile(file);
      
      const response = await uploadAPI.uploadLessonVideo(file);
      
      if (response.data.success && response.data.data?.video) {
        const videoData = response.data.data.video as any;
        setFormData(prev => ({ ...prev, videoUrl: videoData.secure_url || videoData.url }));
        addNotification('success', 'تم رفع الفيديو بنجاح');
      } else {
        throw new Error('فشل في رفع الفيديو');
      }
    } catch (error) {
      console.error('Video upload error:', error);
      
      // Handle specific error types
      if (error instanceof AxiosError) {
        if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
          addNotification('error', 'انتهت مهلة الرفع. الفيديو كبير جداً أو الاتصال بطيء. يرجى المحاولة مرة أخرى أو اختيار فيديو أصغر.');
        } else if (error.response?.status === 413) {
          addNotification('error', 'حجم الفيديو كبير جداً. الحد الأقصى المسموح 100 ميجابايت.');
        } else if (error.response?.status && error.response.status >= 500) {
          addNotification('error', 'خطأ في الخادم. يرجى المحاولة مرة أخرى لاحقاً.');
        } else {
          addNotification('error', error.response?.data?.arabic || 'خطأ في رفع الفيديو');
        }
      } else {
        addNotification('error', 'خطأ في رفع الفيديو');
      }
      
      setVideoFile(null);
    } finally {
      setUploadingVideo(false);
    }
  };

  // Fetch lessons
  const fetchLessons = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      if (!token) {
        addNotification('error', 'يجب تسجيل الدخول أولاً');
        return;
      }

      const response = await fetch(`http://localhost:5050/api/admin/courses/${courseId}/lessons`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setLessons(data.lessons || []);
      } else {
        const errorData = await response.json();
        addNotification('error', errorData.arabic || errorData.error || 'فشل في جلب الدروس');
      }
    } catch (error) {
      console.error('Error fetching lessons:', error);
      addNotification('error', 'حدث خطأ أثناء جلب الدروس');
    } finally {
      setLoading(false);
    }
  };

  // Add lesson
  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate video input
    if (videoUploadType === 'url' && !formData.videoUrl.trim()) {
      addNotification('error', 'يرجى إدخال رابط الفيديو');
      return;
    }
    if (videoUploadType === 'file' && !videoFile && !formData.videoUrl.trim()) {
      addNotification('error', 'يرجى اختيار ملف فيديو أو إدخال رابط');
      return;
    }
    
    try {
      const token = getAuthToken();
      if (!token) {
        addNotification('error', 'يجب تسجيل الدخول أولاً');
        return;
      }

      const response = await fetch(`http://localhost:5050/api/admin/courses/${courseId}/lessons`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        addNotification('success', 'تم إضافة الدرس بنجاح');
        setFormData({
          title: '',
          description: '',
          videoUrl: '',
          duration: 0,
          order: lessons.length + 1,
          isFree: false
        });
        setVideoUploadType('url');
        setVideoFile(null);
        setShowAddForm(false);
        fetchLessons();
      } else {
        const errorData = await response.json();
        addNotification('error', errorData.arabic || errorData.error || 'فشل في إضافة الدرس');
      }
    } catch (error) {
      console.error('Error adding lesson:', error);
      addNotification('error', 'حدث خطأ أثناء إضافة الدرس');
    }
  };

  // Update lesson
  const handleUpdateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLesson) return;

    // Validate video input
    if (videoUploadType === 'url' && !formData.videoUrl.trim()) {
      addNotification('error', 'يرجى إدخال رابط الفيديو');
      return;
    }
    if (videoUploadType === 'file' && !videoFile && !formData.videoUrl.trim()) {
      addNotification('error', 'يرجى اختيار ملف فيديو أو إدخال رابط');
      return;
    }

    try {
      const token = getAuthToken();
      if (!token) {
        addNotification('error', 'يجب تسجيل الدخول أولاً');
        return;
      }

      const response = await fetch(`http://localhost:5050/api/admin/courses/${courseId}/lessons/${editingLesson._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        addNotification('success', 'تم تحديث الدرس بنجاح');
        setEditingLesson(null);
        setFormData({
          title: '',
          description: '',
          videoUrl: '',
          duration: 0,
          order: 1,
          isFree: false
        });
        setVideoUploadType('url');
        setVideoFile(null);
        fetchLessons();
      } else {
        const errorData = await response.json();
        addNotification('error', errorData.arabic || errorData.error || 'فشل في تحديث الدرس');
      }
    } catch (error) {
      console.error('Error updating lesson:', error);
      addNotification('error', 'حدث خطأ أثناء تحديث الدرس');
    }
  };

  // Delete lesson
  const handleDeleteLesson = async (lessonId: string, lessonTitle: string) => {
    if (!confirm(`هل أنت متأكد من حذف الدرس "${lessonTitle}"؟`)) {
      return;
    }

    try {
      const token = getAuthToken();
      if (!token) {
        addNotification('error', 'يجب تسجيل الدخول أولاً');
        return;
      }

      const response = await fetch(`http://localhost:5050/api/admin/courses/${courseId}/lessons/${lessonId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        addNotification('success', 'تم حذف الدرس بنجاح');
        fetchLessons();
      } else {
        const errorData = await response.json();
        addNotification('error', errorData.arabic || errorData.error || 'فشل في حذف الدرس');
      }
    } catch (error) {
      console.error('Error deleting lesson:', error);
      addNotification('error', 'حدث خطأ أثناء حذف الدرس');
    }
  };

  // Start editing lesson
  const startEditing = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setFormData({
      title: lesson.title,
      description: lesson.description,
      videoUrl: lesson.videoUrl,
      duration: lesson.duration,
      order: lesson.order,
      isFree: lesson.isFree
    });
    setVideoUploadType('url');
    setVideoFile(null);
    setShowAddForm(false);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingLesson(null);
    setFormData({
      title: '',
      description: '',
      videoUrl: '',
      duration: 0,
      order: lessons.length + 1,
      isFree: false
    });
    setVideoUploadType('url');
    setVideoFile(null);
  };

  // Format duration
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}س ${mins}د`;
    }
    return `${mins}د`;
  };

  useEffect(() => {
    fetchLessons();
  }, [courseId]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">إدارة الدروس</h2>
            <p className="text-gray-600 mt-1">{courseTitle}</p>
          </div>
          <div className="flex items-center space-x-3 space-x-reverse">
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-[#41ADE1] hover:bg-[#3399CC] text-white px-4 py-2 rounded-lg flex items-center"
            >
              <PlusIcon className="h-5 w-5 ml-2" />
              إضافة درس
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Notifications */}
        {notifications.length > 0 && (
          <div className="mb-4 space-y-2">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 rounded-lg ${
                  notification.type === 'success' ? 'bg-green-100 border border-green-200 text-green-800' :
                  notification.type === 'error' ? 'bg-red-100 border border-red-200 text-red-800' :
                  notification.type === 'warning' ? 'bg-yellow-100 border border-yellow-200 text-yellow-800' :
                  'bg-[#41ADE1]/30 border border-[#41ADE1]/40 text-[#41ADE1]'
                }`}
              >
                {notification.message}
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Form */}
        {(showAddForm || editingLesson) && (
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">
              {editingLesson ? 'تعديل الدرس' : 'إضافة درس جديد'}
            </h3>
            <form onSubmit={editingLesson ? handleUpdateLesson : handleAddLesson} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    عنوان الدرس *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#41ADE1] focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ترتيب الدرس *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#41ADE1] focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  وصف الدرس
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#41ADE1] focus:border-transparent"
                />
              </div>

              {/* Video Input Section */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الفيديو *
                  </label>
                  
                  {/* Upload Type Selection */}
                  <div className="flex space-x-4 space-x-reverse mb-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="url"
                        checked={videoUploadType === 'url'}
                        onChange={(e) => setVideoUploadType(e.target.value as 'url' | 'file')}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">رابط فيديو</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="file"
                        checked={videoUploadType === 'file'}
                        onChange={(e) => setVideoUploadType(e.target.value as 'url' | 'file')}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">رفع ملف</span>
                    </label>
                  </div>

                  {/* Video URL Input */}
                  {videoUploadType === 'url' && (
                    <div>
                      <input
                        type="url"
                        value={formData.videoUrl}
                        onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                        placeholder="https://example.com/video.mp4"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#41ADE1] focus:border-transparent"
                        required={videoUploadType === 'url'}
                      />
                    </div>
                  )}

                  {/* Video File Upload */}
                  {videoUploadType === 'file' && (
                    <div className="space-y-3">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        {videoFile ? (
                          <div className="space-y-2">
                            <div className="flex items-center justify-center">
                              <CloudArrowUpIcon className="h-8 w-8 text-green-500" />
                            </div>
                            <p className="text-sm text-gray-600">{videoFile.name}</p>
                            <p className="text-xs text-gray-500">
                              الحجم: {(videoFile.size / (1024 * 1024)).toFixed(1)} ميجابايت
                            </p>
                            <div className="flex items-center justify-center space-x-2 space-x-reverse">
                              <button
                                type="button"
                                onClick={() => {
                                  setVideoFile(null);
                                  setFormData(prev => ({ ...prev, videoUrl: '' }));
                                }}
                                className="text-red-600 hover:text-red-800 text-sm flex items-center"
                              >
                                <XMarkIcon className="h-4 w-4 ml-1" />
                                إزالة
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <div>
                              <label htmlFor="video-upload" className="cursor-pointer">
                                <span className="mt-2 block text-sm font-medium text-gray-900">
                                  {uploadingVideo ? 'جاري الرفع...' : 'اختر ملف فيديو'}
                                </span>
                                <span className="mt-1 block text-xs text-gray-500">
                                  MP4, AVI, MOV أو ملفات فيديو أخرى<br />
                                  الحد الأقصى: 100 ميجابايت
                                </span>
                              </label>
                              <input
                                id="video-upload"
                                type="file"
                                accept="video/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    handleVideoUpload(file);
                                  }
                                }}
                                className="sr-only"
                                disabled={uploadingVideo}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                      {uploadingVideo && (
                        <div className="flex items-center justify-center space-x-2 space-x-reverse">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#41ADE1]"></div>
                          <span className="text-sm text-gray-600">جاري رفع الفيديو...</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    مدة الدرس (بالدقائق) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#41ADE1] focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isFree"
                  checked={formData.isFree}
                  onChange={(e) => setFormData({ ...formData, isFree: e.target.checked })}
                  className="h-4 w-4 text-[#41ADE1] focus:ring-[#41ADE1] border-gray-300 rounded"
                />
                <label htmlFor="isFree" className="mr-2 text-sm text-gray-700">
                  درس مجاني
                </label>
              </div>

              <div className="flex items-center space-x-3 space-x-reverse">
                <button
                  type="submit"
                  className="bg-[#41ADE1] hover:bg-[#3399CC] text-white px-6 py-2 rounded-lg flex items-center"
                >
                  <CheckIcon className="h-5 w-5 ml-2" />
                  {editingLesson ? 'تحديث' : 'إضافة'}
                </button>
                <button
                  type="button"
                  onClick={editingLesson ? cancelEditing : () => setShowAddForm(false)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-lg"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Lessons List */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#41ADE1] mx-auto"></div>
            <p className="text-gray-600 mt-2">جاري تحميل الدروس...</p>
          </div>
        ) : lessons.length === 0 ? (
          <div className="text-center py-8">
            <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">لا توجد دروس في هذا الكورس</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="mt-4 bg-[#41ADE1] hover:bg-[#3399CC] text-white px-4 py-2 rounded-lg"
            >
              إضافة أول درس
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {lessons
              .sort((a, b) => a.order - b.order)
              .map((lesson) => (
                <div key={lesson._id} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 space-x-reverse mb-2">
                        <span className="bg-[#41ADE1]/30 text-[#41ADE1] text-xs font-medium px-2.5 py-0.5 rounded">
                          #{lesson.order}
                        </span>
                        <h3 className="text-lg font-semibold text-gray-900">{lesson.title}</h3>
                        {lesson.isFree && (
                          <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                            مجاني
                          </span>
                        )}
                      </div>
                      {lesson.description && (
                        <p className="text-gray-600 text-sm mb-2">{lesson.description}</p>
                      )}
                      <div className="flex items-center space-x-4 space-x-reverse text-sm text-gray-500">
                        <div className="flex items-center">
                          <ClockIcon className="h-4 w-4 ml-1" />
                          {formatDuration(lesson.duration)}
                        </div>
                        <div className="flex items-center">
                          <PlayIcon className="h-4 w-4 ml-1" />
                          <a
                            href={lesson.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#41ADE1] hover:text-[#41ADE1]"
                          >
                            عرض الفيديو
                          </a>
                        </div>
                        {lesson.resources.length > 0 && (
                          <div className="flex items-center">
                            <DocumentTextIcon className="h-4 w-4 ml-1" />
                            {lesson.resources.length} مورد
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <button
                        onClick={() => startEditing(lesson)}
                        className="text-[#41ADE1] hover:text-[#41ADE1] p-1"
                        title="تعديل الدرس"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteLesson(lesson._id, lesson.title)}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="حذف الدرس"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
