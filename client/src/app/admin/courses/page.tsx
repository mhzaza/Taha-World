'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  GlobeAltIcon,
  Bars3Icon,
} from '@heroicons/react/24/outline';
import { adminAPI, courseAPI, apiUtils, type Course } from '@/lib/api';


type SortField = 'createdAt' | 'title' | 'price' | 'enrollmentCount' | 'rating';
type SortOrder = 'asc' | 'desc';
type StatusFilter = 'all' | 'published' | 'draft' | 'featured';

function CoursesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  
  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
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



  // Fetch courses on mount
  useEffect(() => {
    fetchCourses();
  }, []);
  

  const fetchCourses = async () => {
    try {
      setLoading(true);
      console.log('Fetching courses using adminAPI...');
      
      const response = await adminAPI.getCourses({
        page: currentPage,
        limit: itemsPerPage
      });
      
      console.log('Response status:', response.status);
      console.log('Response data:', response.data);
      
      if (response.data.success) {
        setCourses(response.data.data || []);
        console.log('Courses set:', (response.data.data || []).length, 'courses');
      } else {
        console.error('API returned success: false', response.data);
        addNotification('error', 'فشل في جلب الكورسات');
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      const errorMessage = apiUtils.handleApiError(error);
      addNotification('error', `خطأ في جلب الكورسات: ${errorMessage}`);
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
      let aValue: string | number;
      let bValue: string | number;
      
      if (sortField === 'createdAt') {
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
      } else if (sortField === 'rating') {
        aValue = a.rating.average;
        bValue = b.rating.average;
      } else if (sortField === 'price') {
        aValue = a.price;
        bValue = b.price;
      } else if (sortField === 'enrollmentCount') {
        aValue = a.enrollmentCount;
        bValue = b.enrollmentCount;
      } else {
        // For title sorting
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
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


  const handleDeleteCourse = async () => {
    if (!selectedCourse) return;
    
    try {
      const response = await adminAPI.deleteCourse(selectedCourse._id);
      
      if (response.data.success) {
        addNotification('success', 'تم حذف الكورس بنجاح!');
        setShowDeleteModal(false);
        setSelectedCourse(null);
        fetchCourses();
      } else {
        addNotification('error', response.data.arabic || response.data.error || 'خطأ في حذف الكورس');
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      const errorMessage = apiUtils.handleApiError(error);
      addNotification('error', `خطأ في حذف الكورس: ${errorMessage}`);
    }
  };

  const handleTogglePublish = async (course: Course) => {
    try {
      const response = await courseAPI.publishCourse(course._id, !course.isPublished);
      
      if (response.data.success) {
        addNotification('success', course.isPublished ? 'تم إلغاء نشر الكورس' : 'تم نشر الكورس بنجاح');
        fetchCourses();
      } else {
        addNotification('error', response.data.arabic || response.data.error || 'خطأ في تحديث حالة الكورس');
      }
    } catch (error) {
      console.error('Error toggling course publish status:', error);
      const errorMessage = apiUtils.handleApiError(error);
      addNotification('error', `خطأ في تحديث حالة الكورس: ${errorMessage}`);
    }
  };


  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      calendar: 'gregory',
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
                'bg-[#41ADE1]/30 border border-[#41ADE1]/40 text-[#41ADE1]'
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
          onClick={() => router.push('/admin/courses/new')}
          className="inline-flex items-center px-4 py-2 bg-[#41ADE1] text-white rounded-lg hover:bg-[#3399CC] transition-colors"
        >
          <PlusIcon className="h-4 w-4 ml-2" />
          إنشاء كورس جديد
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AcademicCapIcon className="h-8 w-8 text-[#41ADE1]" />
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
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#41ADE1] focus:border-transparent"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#41ADE1] focus:border-transparent"
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
              
              {/* Lesson reminder for unpublished courses */}
              {!course.isPublished && (
                <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-xs text-yellow-800">
                    💡 لا تنس إضافة الدروس قبل نشر الكورس
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => router.push(`/courses/${course._id}`)}
                    className="text-[#41ADE1] hover:text-[#3399CC] p-1"
                    title="عرض الكورس"
                  >
                    <EyeIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => router.push(`/admin/courses/${course._id}/edit`)}
                    className="text-green-600 hover:text-green-700 p-1"
                    title="تعديل الكورس"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('Navigating to lessons page for course:', course._id);
                      // Navigate to lessons page
                      router.push(`/admin/courses/${course._id}/lessons`);
                    }}
                    className="text-purple-600 hover:text-purple-700 p-1"
                    title="إدارة الدروس"
                  >
                    <Bars3Icon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleTogglePublish(course)}
                    className={`p-1 ${course.isPublished ? 'text-orange-600 hover:text-orange-700' : 'text-[#41ADE1] hover:text-[#3399CC]'}`}
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
              onClick={() => router.push('/admin/courses/new')}
              className="mt-4 inline-flex items-center px-4 py-2 bg-[#41ADE1] text-white rounded-lg hover:bg-[#3399CC] transition-colors"
            >
              <PlusIcon className="h-4 w-4 ml-2" />
              إنشاء أول كورس
            </button>
          )}
        </div>
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

    </div>
  );
}

export default function CoursesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#41ADE1] mx-auto mb-4"></div>
          <p className="text-gray-400">جاري التحميل...</p>
        </div>
      </div>
    }>
      <CoursesPageContent />
    </Suspense>
  );
}

