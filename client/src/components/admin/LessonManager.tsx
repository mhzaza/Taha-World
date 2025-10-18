'use client';

import { useState, useEffect } from 'react';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  PlayIcon,
  ClockIcon,
  DocumentTextIcon,
  Bars3Icon,
  XMarkIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

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

interface LessonManagerProps {
  courseId: string;
  courseTitle: string;
  onClose: () => void;
}

interface LessonFormData {
  title: string;
  description: string;
  videoUrl: string;
  duration: number;
  order: number;
  isFree: boolean;
}

export default function LessonManager({ courseId, courseTitle, onClose }: LessonManagerProps) {
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">إدارة دروس الكورس</h2>
            <p className="text-gray-600 mt-1">{courseTitle}</p>
          </div>
          <div className="flex items-center space-x-3 space-x-reverse">
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
            >
              <PlusIcon className="h-5 w-5 ml-2" />
              إضافة درس
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
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
                    'bg-blue-100 border border-blue-200 text-blue-800'
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      رابط الفيديو *
                    </label>
                    <input
                      type="url"
                      value={formData.videoUrl}
                      onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      مدة الدرس (بالدقائق) *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isFree" className="mr-2 text-sm text-gray-700">
                    درس مجاني
                  </label>
                </div>

                <div className="flex items-center space-x-3 space-x-reverse">
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center"
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
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">جاري تحميل الدروس...</p>
            </div>
          ) : lessons.length === 0 ? (
            <div className="text-center py-8">
              <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">لا توجد دروس في هذا الكورس</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
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
                          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
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
                              className="text-blue-600 hover:text-blue-800"
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
                          className="text-blue-600 hover:text-blue-800 p-1"
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
    </div>
  );
}



