'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  AcademicCapIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  StarIcon,
  CalendarIcon,
  GlobeAltIcon,
  PhotoIcon,
  VideoCameraIcon,
  DocumentTextIcon,
  Bars3Icon,
} from '@heroicons/react/24/outline';
import { uploadToCloudinary, uploadPresets, getCloudinaryUrl } from '@/lib/cloudinary';
import type { Course } from '@/lib/api';
import LessonManager from '@/components/admin/LessonManager';

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

type SortField = 'createdAt' | 'title' | 'price' | 'enrollmentCount' | 'rating';
type SortOrder = 'asc' | 'desc';
type StatusFilter = 'all' | 'published' | 'draft' | 'featured';

export default function CoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showLessonManager, setShowLessonManager] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  
  // Form state
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
  });
  
  const [formLoading, setFormLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [newRequirement, setNewRequirement] = useState('');
  const [newLearningPoint, setNewLearningPoint] = useState('');
  const [newCredential, setNewCredential] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
    timestamp: Date;
  }>>([]);

  // Add notification function
  const addNotification = (type: 'success' | 'error' | 'info' | 'warning', message: string) => {
    const notification = {
      id: Date.now().toString(),
      type,
      message,
      timestamp: new Date()
    };
    setNotifications(prev => [notification, ...prev.slice(0, 4)]); // Keep only last 5 notifications
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  };

  // Form validation
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.title.trim()) {
      errors.title = 'عنوان الكورس مطلوب';
    }

    if (!formData.description.trim()) {
      errors.description = 'وصف الكورس مطلوب';
    }

    if (formData.price <= 0) {
      errors.price = 'السعر يجب أن يكون أكبر من صفر';
    }

    if (formData.duration <= 0) {
      errors.duration = 'مدة الكورس يجب أن تكون أكبر من صفر';
    }

    if (!formData.category.trim()) {
      errors.category = 'فئة الكورس مطلوبة';
    }

    if (!formData.instructor.name.trim()) {
      errors.instructorName = 'اسم المدرب مطلوب';
    }

    if (formData.tags.length === 0) {
      errors.tags = 'يجب إضافة علامة واحدة على الأقل';
    }

    if (formData.whatYouWillLearn.length === 0) {
      errors.whatYouWillLearn = 'يجب إضافة نقطة تعلم واحدة على الأقل';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Helper function to get auth token
  const getAuthToken = () => {
    return document.cookie
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1];
  };

  // Fetch courses
  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      console.log('Fetching courses from:', `http://localhost:5050/api/admin/courses?page=${currentPage}&limit=${itemsPerPage}`);
      
      const token = getAuthToken();
      if (!token) {
        console.error('No authentication token found');
        addNotification('error', 'يجب تسجيل الدخول أولاً');
        return;
      }
      
      const response = await fetch(`http://localhost:5050/api/admin/courses?page=${currentPage}&limit=${itemsPerPage}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Response data:', data);
        if (data.success) {
          setCourses(data.data);
          console.log('Courses set:', data.data.length, 'courses');
        } else {
          console.error('API returned success: false', data);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('API error:', response.status, errorData);
        addNotification('error', errorData.arabic || errorData.error || 'فشل في جلب الكورسات');
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      addNotification('error', 'خطأ في الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort courses
  const filteredCourses = useMemo(() => {
    const filtered = courses.filter(course => {
      // Search filter
      const searchMatch = searchTerm === '' || 
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Status filter
      let statusMatch = true;
      if (statusFilter === 'published') {
        statusMatch = course.isPublished;
      } else if (statusFilter === 'draft') {
        statusMatch = !course.isPublished;
      } else if (statusFilter === 'featured') {
        statusMatch = course.isFeatured;
      }
      
      return searchMatch && statusMatch;
    });

    // Sort courses
    filtered.sort((a, b) => {
      let aValue: string | number = a[sortField as keyof Course];
      let bValue: string | number = b[sortField as keyof Course];
      
      if (sortField === 'createdAt') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      } else if (sortField === 'rating') {
        aValue = a.rating.average;
        bValue = b.rating.average;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [courses, searchTerm, statusFilter, sortField, sortOrder]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalCourses = courses.length;
    const publishedCourses = courses.filter(c => c.isPublished).length;
    const draftCourses = courses.filter(c => !c.isPublished).length;
    const featuredCourses = courses.filter(c => c.isFeatured).length;
    const totalEnrollments = courses.reduce((sum, c) => sum + c.enrollmentCount, 0);
    const totalRevenue = courses.reduce((sum, c) => sum + (c.price * c.enrollmentCount), 0);
    const averageRating = courses.reduce((sum, c) => sum + c.rating.average, 0) / totalCourses || 0;
    
    return {
      totalCourses,
      publishedCourses,
      draftCourses,
      featuredCourses,
      totalEnrollments,
      totalRevenue,
      averageRating,
    };
  }, [courses]);

  const handleImageUpload = async (file: File) => {
    try {
      setUploadingImage(true);
      const result = await uploadToCloudinary(file, 'courseThumbnail');
      setFormData(prev => ({ ...prev, thumbnail: result.secure_url }));
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

  const handleCreateCourse = async () => {
    try {
      setFormLoading(true);
      
      const token = getAuthToken();
      if (!token) {
        addNotification('error', 'يجب تسجيل الدخول أولاً');
        return;
      }
      
      const response = await fetch('http://localhost:5050/api/admin/courses', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          addNotification('success', 'تم إنشاء الكورس بنجاح!');
          setShowCreateModal(false);
          resetForm();
          fetchCourses();
        } else {
          addNotification('error', data.arabic || data.error || 'خطأ في إنشاء الكورس');
        }
      } else {
        const errorData = await response.json();
        addNotification('error', errorData.arabic || errorData.error || 'خطأ في إنشاء الكورس');
      }
    } catch (error) {
      console.error('Error creating course:', error);
      addNotification('error', 'خطأ في إنشاء الكورس');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditCourse = async () => {
    if (!selectedCourse) return;
    
    try {
      setFormLoading(true);
      
      const token = getAuthToken();
      if (!token) {
        addNotification('error', 'يجب تسجيل الدخول أولاً');
        return;
      }
      
      const response = await fetch(`http://localhost:5050/api/admin/courses/${selectedCourse._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          addNotification('success', 'تم تحديث الكورس بنجاح!');
          setShowEditModal(false);
          resetForm();
          fetchCourses();
        } else {
          addNotification('error', data.arabic || data.error || 'خطأ في تحديث الكورس');
        }
      } else {
        const errorData = await response.json();
        addNotification('error', errorData.arabic || errorData.error || 'خطأ في تحديث الكورس');
      }
    } catch (error) {
      console.error('Error updating course:', error);
      addNotification('error', 'خطأ في تحديث الكورس');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteCourse = async () => {
    if (!selectedCourse) return;
    
    try {
      const token = getAuthToken();
      if (!token) {
        addNotification('error', 'يجب تسجيل الدخول أولاً');
        return;
      }
      
      const response = await fetch(`http://localhost:5050/api/admin/courses/${selectedCourse._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          addNotification('success', 'تم حذف الكورس بنجاح!');
          setShowDeleteModal(false);
          setSelectedCourse(null);
          fetchCourses();
        } else {
          addNotification('error', data.arabic || data.error || 'خطأ في حذف الكورس');
        }
      } else {
        const errorData = await response.json();
        addNotification('error', errorData.arabic || errorData.error || 'خطأ في حذف الكورس');
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      addNotification('error', 'خطأ في حذف الكورس');
    }
  };

  const handleTogglePublish = async (course: Course) => {
    try {
      const token = getAuthToken();
      if (!token) {
        addNotification('error', 'يجب تسجيل الدخول أولاً');
        return;
      }
      
      const response = await fetch(`http://localhost:5050/api/admin/courses/${course._id}/publish`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ isPublished: !course.isPublished }),
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          addNotification('success', course.isPublished ? 'تم إلغاء نشر الكورس' : 'تم نشر الكورس بنجاح');
          fetchCourses();
        } else {
          addNotification('error', data.arabic || data.error || 'خطأ في تحديث حالة الكورس');
        }
      } else {
        const errorData = await response.json();
        addNotification('error', errorData.arabic || errorData.error || 'خطأ في تحديث حالة الكورس');
      }
    } catch (error) {
      console.error('Error toggling course publish status:', error);
      addNotification('error', 'خطأ في تحديث حالة الكورس');
    }
  };

  const resetForm = () => {
    setFormData({
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
    });
  };

  const openEditModal = (course: Course) => {
    setSelectedCourse(course);
    setFormData({
      title: course.title,
      titleEn: course.titleEn || '',
      description: course.description,
      descriptionEn: course.descriptionEn || '',
      price: course.price,
      originalPrice: course.originalPrice || 0,
      currency: course.currency,
      duration: course.duration,
      level: course.level,
      category: course.category,
      tags: course.tags,
      requirements: course.requirements || [],
      whatYouWillLearn: course.whatYouWillLearn,
      language: course.language,
      subtitles: course.subtitles || [],
      isPublished: course.isPublished,
      isFeatured: course.isFeatured,
      thumbnail: course.thumbnail,
      instructor: {
        name: course.instructor.name,
        bio: course.instructor.bio || '',
        credentials: course.instructor.credentials || [],
      },
    });
    setShowEditModal(true);
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg shadow-lg max-w-sm ${
                notification.type === 'success' ? 'bg-green-100 border border-green-200 text-green-800' :
                notification.type === 'error' ? 'bg-red-100 border border-red-200 text-red-800' :
                notification.type === 'warning' ? 'bg-yellow-100 border border-yellow-200 text-yellow-800' :
                'bg-blue-100 border border-blue-200 text-blue-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{notification.message}</p>
                <button
                  onClick={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إدارة الكورسات</h1>
          <p className="mt-2 text-gray-600">إنشاء وإدارة جميع الكورسات</p>
        </div>
        
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="h-4 w-4 ml-2" />
          إنشاء كورس جديد
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AcademicCapIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-500">إجمالي الكورسات</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCourses}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <GlobeAltIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-500">كورسات منشورة</p>
              <p className="text-2xl font-bold text-gray-900">{stats.publishedCourses}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UserGroupIcon className="h-8 w-8 text-purple-600" />
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-500">إجمالي التسجيلات</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalEnrollments}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CurrencyDollarIcon className="h-8 w-8 text-orange-600" />
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-500">إجمالي الإيرادات</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              البحث
            </label>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="البحث في الكورسات..."
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الحالة
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">جميع الكورسات</option>
              <option value="published">منشورة</option>
              <option value="draft">مسودة</option>
              <option value="featured">مميزة</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              مسح الفلاتر
            </button>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredCourses.map((course) => (
          <div key={course._id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
            {/* Course Thumbnail */}
            <div className="relative">
              <img
                src={course.thumbnail || '/placeholder-course.jpg'}
                alt={course.title}
                className="w-full h-48 object-cover rounded-t-lg"
              />
              <div className="absolute top-2 right-2 flex space-x-1">
                {course.isFeatured && (
                  <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                    مميز
                  </span>
                )}
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  course.isPublished 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-500 text-white'
                }`}>
                  {course.isPublished ? 'منشور' : 'مسودة'}
                </span>
              </div>
            </div>

            {/* Course Info */}
            <div className="p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2 line-clamp-2">
                {course.title}
              </h3>
              
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {course.description}
              </p>

              {/* Course Stats */}
              <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                <div className="flex items-center">
                  <UserGroupIcon className="h-4 w-4 ml-1" />
                  <span>{course.enrollmentCount}</span>
                </div>
                <div className="flex items-center">
                  <StarIcon className="h-4 w-4 ml-1 text-yellow-500" />
                  <span>{course.rating.average.toFixed(1)}</span>
                </div>
                <div className="flex items-center">
                  <CurrencyDollarIcon className="h-4 w-4 ml-1" />
                  <span>{formatCurrency(course.price)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => router.push(`/courses/${course._id}`)}
                    className="text-blue-600 hover:text-blue-700 p-1"
                    title="عرض الكورس"
                  >
                    <EyeIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => openEditModal(course)}
                    className="text-green-600 hover:text-green-700 p-1"
                    title="تعديل الكورس"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedCourse(course);
                      setShowLessonManager(true);
                    }}
                    className="text-purple-600 hover:text-purple-700 p-1"
                    title="إدارة الدروس"
                  >
                    <Bars3Icon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleTogglePublish(course)}
                    className={`p-1 ${course.isPublished ? 'text-orange-600 hover:text-orange-700' : 'text-blue-600 hover:text-blue-700'}`}
                    title={course.isPublished ? 'إلغاء نشر الكورس' : 'نشر الكورس'}
                  >
                    <GlobeAltIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedCourse(course);
                      setShowDeleteModal(true);
                    }}
                    className="text-red-600 hover:text-red-700 p-1"
                    title="حذف الكورس"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
                
                <span className="text-xs text-gray-400">
                  {formatDate(course.createdAt)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredCourses.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <AcademicCapIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">لا توجد كورسات</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || statusFilter !== 'all'
              ? 'لا توجد كورسات تطابق معايير البحث الحالية'
              : 'لم يتم إنشاء أي كورسات بعد'}
          </p>
          {!searchTerm && statusFilter === 'all' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="h-4 w-4 ml-2" />
              إنشاء أول كورس
            </button>
          )}
        </div>
      )}

      {/* Create Course Modal */}
      {showCreateModal && (
        <CourseFormModal
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleCreateCourse}
          onClose={() => setShowCreateModal(false)}
          loading={formLoading}
          uploadingImage={uploadingImage}
          onImageUpload={handleImageUpload}
          addTag={addTag}
          removeTag={removeTag}
          newTag={newTag}
          setNewTag={setNewTag}
          addRequirement={addRequirement}
          removeRequirement={removeRequirement}
          newRequirement={newRequirement}
          setNewRequirement={setNewRequirement}
          addLearningPoint={addLearningPoint}
          removeLearningPoint={removeLearningPoint}
          newLearningPoint={newLearningPoint}
          setNewLearningPoint={setNewLearningPoint}
          addCredential={addCredential}
          removeCredential={removeCredential}
          newCredential={newCredential}
          setNewCredential={setNewCredential}
          title="إنشاء كورس جديد"
          submitText="إنشاء الكورس"
        />
      )}

      {/* Edit Course Modal */}
      {showEditModal && selectedCourse && (
        <CourseFormModal
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleEditCourse}
          onClose={() => setShowEditModal(false)}
          loading={formLoading}
          uploadingImage={uploadingImage}
          onImageUpload={handleImageUpload}
          addTag={addTag}
          removeTag={removeTag}
          newTag={newTag}
          setNewTag={setNewTag}
          addRequirement={addRequirement}
          removeRequirement={removeRequirement}
          newRequirement={newRequirement}
          setNewRequirement={setNewRequirement}
          addLearningPoint={addLearningPoint}
          removeLearningPoint={removeLearningPoint}
          newLearningPoint={newLearningPoint}
          setNewLearningPoint={setNewLearningPoint}
          addCredential={addCredential}
          removeCredential={removeCredential}
          newCredential={newCredential}
          setNewCredential={setNewCredential}
          title="تعديل الكورس"
          submitText="حفظ التغييرات"
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedCourse && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <TrashIcon className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-4">تأكيد الحذف</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  هل أنت متأكد من حذف الكورس &quot;{selectedCourse.title}&quot;؟ 
                  هذا الإجراء لا يمكن التراجع عنه.
                </p>
              </div>
              <div className="items-center px-4 py-3">
                <button
                  onClick={handleDeleteCourse}
                  className="px-4 py-2 bg-red-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300"
                >
                  حذف
                </button>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="mt-3 px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lesson Manager Modal */}
      {showLessonManager && selectedCourse && (
        <LessonManager
          courseId={selectedCourse._id}
          courseTitle={selectedCourse.title}
          onClose={() => {
            setShowLessonManager(false);
            setSelectedCourse(null);
          }}
        />
      )}
    </div>
  );
}

// Course Form Modal Component
interface CourseFormModalProps {
  formData: CourseFormData;
  setFormData: React.Dispatch<React.SetStateAction<CourseFormData>>;
  onSubmit: () => void;
  onClose: () => void;
  loading: boolean;
  uploadingImage: boolean;
  onImageUpload: (file: File) => void;
  addTag: () => void;
  removeTag: (tag: string) => void;
  newTag: string;
  setNewTag: (tag: string) => void;
  addRequirement: () => void;
  removeRequirement: (requirement: string) => void;
  newRequirement: string;
  setNewRequirement: (requirement: string) => void;
  addLearningPoint: () => void;
  removeLearningPoint: (point: string) => void;
  newLearningPoint: string;
  setNewLearningPoint: (point: string) => void;
  addCredential: () => void;
  removeCredential: (credential: string) => void;
  newCredential: string;
  setNewCredential: (credential: string) => void;
  title: string;
  submitText: string;
}

function CourseFormModal({
  formData,
  setFormData,
  onSubmit,
  onClose,
  loading,
  uploadingImage,
  onImageUpload,
  addTag,
  removeTag,
  newTag,
  setNewTag,
  addRequirement,
  removeRequirement,
  newRequirement,
  setNewRequirement,
  addLearningPoint,
  removeLearningPoint,
  newLearningPoint,
  setNewLearningPoint,
  addCredential,
  removeCredential,
  newCredential,
  setNewCredential,
  title,
  submitText,
}: CourseFormModalProps) {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-4 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          
          <div className="max-h-96 overflow-y-auto space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  عنوان الكورس (عربي) *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="أدخل عنوان الكورس"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  عنوان الكورس (إنجليزي)
                </label>
                <input
                  type="text"
                  value={formData.titleEn}
                  onChange={(e) => setFormData(prev => ({ ...prev, titleEn: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter course title"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الوصف (عربي) *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="أدخل وصف الكورس"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الوصف (إنجليزي)
                </label>
                <textarea
                  value={formData.descriptionEn}
                  onChange={(e) => setFormData(prev => ({ ...prev, descriptionEn: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter course description"
                />
              </div>
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  السعر الحالي *
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  السعر الأصلي
                </label>
                <input
                  type="number"
                  value={formData.originalPrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, originalPrice: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  العملة
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="USD">USD</option>
                  <option value="SAR">SAR</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
            </div>

            {/* Course Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  المدة (ساعات) *
                </label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  المستوى *
                </label>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData(prev => ({ ...prev, level: e.target.value as 'beginner' | 'intermediate' | 'advanced' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="beginner">مبتدئ</option>
                  <option value="intermediate">متوسط</option>
                  <option value="advanced">متقدم</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الفئة *
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="أدخل فئة الكورس"
                />
              </div>
            </div>

            {/* Language */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اللغة
              </label>
              <select
                value={formData.language}
                onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value as 'ar' | 'en' }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ar">العربية</option>
                <option value="en">English</option>
              </select>
            </div>

            {/* Thumbnail Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                صورة الكورس
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onImageUpload(file);
                  }}
                  className="hidden"
                  id="thumbnail-upload"
                />
                <label
                  htmlFor="thumbnail-upload"
                  className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  اسم المدرب *
                </label>
                <input
                  type="text"
                  value={formData.instructor.name}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    instructor: { ...prev.instructor, name: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="أدخل اسم المدرب"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نبذة عن المدرب
                </label>
                <textarea
                  value={formData.instructor.bio}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    instructor: { ...prev.instructor, bio: e.target.value }
                  }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="أدخل نبذة عن المدرب"
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                العلامات
              </label>
              <div className="flex items-center space-x-2 mb-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="أدخل علامة جديدة"
                />
                <button
                  onClick={addTag}
                  className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  إضافة
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="mr-1 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Requirements */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                المتطلبات
              </label>
              <div className="flex items-center space-x-2 mb-2">
                <input
                  type="text"
                  value={newRequirement}
                  onChange={(e) => setNewRequirement(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addRequirement()}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="أدخل متطلب جديد"
                />
                <button
                  onClick={addRequirement}
                  className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  إضافة
                </button>
              </div>
              <div className="space-y-1">
                {formData.requirements.map((requirement) => (
                  <div
                    key={requirement}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                  >
                    <span className="text-sm">{requirement}</span>
                    <button
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ما سوف تتعلمه
              </label>
              <div className="flex items-center space-x-2 mb-2">
                <input
                  type="text"
                  value={newLearningPoint}
                  onChange={(e) => setNewLearningPoint(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addLearningPoint()}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="أدخل نقطة تعلم جديدة"
                />
                <button
                  onClick={addLearningPoint}
                  className="px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                >
                  إضافة
                </button>
              </div>
              <div className="space-y-1">
                {formData.whatYouWillLearn.map((point) => (
                  <div
                    key={point}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                  >
                    <span className="text-sm">{point}</span>
                    <button
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                مؤهلات المدرب
              </label>
              <div className="flex items-center space-x-2 mb-2">
                <input
                  type="text"
                  value={newCredential}
                  onChange={(e) => setNewCredential(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addCredential()}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="أدخل مؤهل جديد"
                />
                <button
                  onClick={addCredential}
                  className="px-3 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                >
                  إضافة
                </button>
              </div>
              <div className="space-y-1">
                {formData.instructor.credentials?.map((credential) => (
                  <div
                    key={credential}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                  >
                    <span className="text-sm">{credential}</span>
                    <button
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPublished"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData(prev => ({ ...prev, isPublished: e.target.checked }))}
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
                  onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isFeatured" className="mr-2 block text-sm text-gray-900">
                  كورس مميز
                </label>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-end space-x-4 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              إلغاء
            </button>
            <button
              onClick={onSubmit}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'جاري الحفظ...' : submitText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
