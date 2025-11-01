'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  MagnifyingGlassIcon,
  UserIcon,
  EyeIcon,
  PlusIcon,
  MinusIcon,
  CalendarIcon,
  AcademicCapIcon,
  EnvelopeIcon,
  UserGroupIcon,
  FunnelIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  BellIcon,
  ExclamationCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { adminAPI, apiUtils, User, Course } from '@/lib/api';

// User interface is now imported from @/lib/api

// Extended User type for admin with populated courses
interface AdminUser extends Omit<User, 'enrolledCourses'> {
  enrolledCourses: (string | { _id: string; id?: string; title: string })[];
  lastLoginAt?: string;
  status?: 'active' | 'suspended' | 'inactive';
  totalSpent?: number;
}


type StatusFilter = 'all' | 'active' | 'inactive' | 'suspended';
type SortField = 'createdAt' | 'name' | 'totalSpent' | 'enrolledCourses';
type SortOrder = 'asc' | 'desc';

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [userNotes, setUserNotes] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
    timestamp: Date;
  }>>([]);
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);

  // Fetch users data from API
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        sortBy: sortField,
        sortOrder: sortOrder
      };

      const response = await adminAPI.getUsers(params);
      
      if (response.data.success) {
        setUsers(response.data.data?.users || []);
        setTotalUsers(response.data.data?.pagination?.totalItems || 0);
        setTotalPages(response.data.data?.pagination?.totalPages || 0);
        setLastUpdated(new Date());
      } else {
        throw new Error(response.data.error || 'Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      const errorMessage = apiUtils.handleApiError(error);
      setError(errorMessage);
      
      // Add error notification
      addNotification('error', `خطأ في تحميل المستخدمين: ${errorMessage}`);
      
      // Set empty data if API fails
      setUsers([]);
      setTotalUsers(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, searchTerm, statusFilter, sortField, sortOrder]);

  const refreshUsers = async () => {
    setRefreshing(true);
    await fetchUsers();
    setRefreshing(false);
  };

  // Fetch available courses for enrollment
  const fetchCourses = useCallback(async () => {
    try {
      setLoadingCourses(true);
      const response = await adminAPI.getCourses({ limit: 100 }); // Get all courses
      
      if (response.data.success) {
        setAvailableCourses(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      const errorMessage = apiUtils.handleApiError(error);
      addNotification('error', `خطأ في تحميل الكورسات: ${errorMessage}`);
    } finally {
      setLoadingCourses(false);
    }
  }, []);

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

  // Load users on component mount and when dependencies change
  useEffect(() => {
    fetchUsers();
    fetchCourses(); // Load courses for better course title display
  }, [fetchUsers, fetchCourses]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading && !refreshing) {
        fetchUsers();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchUsers, loading, refreshing]);

  // Filter and sort users
  const filteredUsers = useMemo(() => {
    const filtered = users.filter(user => {
      // Search filter
      const searchMatch = searchTerm === '' || 
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.displayName.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Status filter
      const statusMatch = statusFilter === 'all' || user.status === statusFilter;
      
      return searchMatch && statusMatch;
    });

    // Sort users
    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;
      
      switch (sortField) {
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'name':
          aValue = a.displayName.toLowerCase();
          bValue = b.displayName.toLowerCase();
          break;
        case 'totalSpent':
          aValue = a.totalSpent || 0;
          bValue = b.totalSpent || 0;
          break;
        case 'enrolledCourses':
          aValue = a.enrolledCourses.length;
          bValue = b.enrolledCourses.length;
          break;
        default:
          aValue = a[sortField as keyof User] as string | number;
          bValue = b[sortField as keyof User] as string | number;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [users, searchTerm, statusFilter, sortField, sortOrder]);

  // Pagination - using API pagination instead of client-side
  const paginatedUsers = filteredUsers; // API handles pagination

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-yellow-100 text-yellow-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'نشط';
      case 'inactive':
        return 'غير نشط';
      case 'suspended':
        return 'معلق';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      calendar: 'gregory',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setCurrentPage(1);
  };

  const openUserModal = (user: AdminUser) => {
    setSelectedUser(user);
    setUserNotes(user.notes || '');
    setShowUserModal(true);
  };

  const closeUserModal = () => {
    setSelectedUser(null);
    setUserNotes('');
    setShowUserModal(false);
  };

  const saveUserNotes = async () => {
    if (selectedUser) {
      try {
        await adminAPI.updateUserNotes(selectedUser._id, userNotes);
        addNotification('success', 'تم حفظ الملاحظات بنجاح!');
        closeUserModal();
        // Refresh users to get updated data
        fetchUsers();
      } catch (error) {
        console.error('Error saving user notes:', error);
        const errorMessage = apiUtils.handleApiError(error);
        addNotification('error', `خطأ في حفظ الملاحظات: ${errorMessage}`);
      }
    }
  };

  const enrollUserInCourse = async (courseId: string) => {
    if (selectedUser) {
      try {
        await adminAPI.enrollUserInCourse(selectedUser._id, courseId);
        addNotification('success', 'تم تسجيل المستخدم في الكورس بنجاح!');
        setShowEnrollModal(false);
        
        // Update selected user immediately to reflect changes in modal
        const course = availableCourses.find(c => c._id === courseId);
        if (course) {
          setSelectedUser(prev => prev ? {
            ...prev,
            enrolledCourses: [...prev.enrolledCourses, course]
          } : null);
          
          // Also update the users list immediately
          setUsers(prevUsers => prevUsers.map(user => 
            user._id === selectedUser._id ? {
              ...user,
              enrolledCourses: [...user.enrolledCourses, course]
            } : user
          ));
        }
        
        // Refresh users list silently to sync with server
        refreshUsers();
      } catch (error) {
        console.error('Error enrolling user:', error);
        const errorMessage = apiUtils.handleApiError(error);
        addNotification('error', `خطأ في تسجيل المستخدم: ${errorMessage}`);
      }
    }
  };

  const unenrollUserFromCourse = async (courseId: string) => {
    if (selectedUser && confirm('هل أنت متأكد من إلغاء تسجيل المستخدم من هذا الكورس؟')) {
      try {
        await adminAPI.unenrollUserFromCourse(selectedUser._id, courseId);
        addNotification('success', 'تم إلغاء تسجيل المستخدم من الكورس!');
        
        // Update selected user immediately to reflect changes in modal
        setSelectedUser(prev => prev ? {
          ...prev,
          enrolledCourses: prev.enrolledCourses.filter(course => 
            typeof course === 'string' ? course !== courseId : course._id !== courseId
          )
        } : null);
        
        // Also update the users list immediately
        setUsers(prevUsers => prevUsers.map(user => 
          user._id === selectedUser._id ? {
            ...user,
            enrolledCourses: user.enrolledCourses.filter(course => 
              typeof course === 'string' ? course !== courseId : course._id !== courseId
            )
          } : user
        ));
        
        // Refresh users list silently to sync with server
        refreshUsers();
      } catch (error) {
        console.error('Error unenrolling user:', error);
        const errorMessage = apiUtils.handleApiError(error);
        addNotification('error', `خطأ في إلغاء تسجيل المستخدم: ${errorMessage}`);
      }
    }
  };

  const toggleUserStatus = async (userId: string, newStatus: string) => {
    if (confirm(`هل أنت متأكد من تغيير حالة المستخدم إلى "${getStatusText(newStatus)}"؟`)) {
      try {
        await adminAPI.updateUser(userId, { 
          isActive: newStatus === 'active' 
        });
        addNotification('success', 'تم تحديث حالة المستخدم بنجاح!');
        // Refresh users to get updated data
        fetchUsers();
      } catch (error) {
        console.error('Error updating user status:', error);
        const errorMessage = apiUtils.handleApiError(error);
        addNotification('error', `خطأ في تحديث حالة المستخدم: ${errorMessage}`);
      }
    }
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const totalUsers = filteredUsers.length;
    const activeUsers = filteredUsers.filter(user => user.status === 'active').length;
    const inactiveUsers = filteredUsers.filter(user => user.status === 'inactive').length;
    const suspendedUsers = filteredUsers.filter(user => user.status === 'suspended').length;
    const totalRevenue = filteredUsers.reduce((sum, user) => sum + (user.totalSpent || 0), 0);
    
    return {
      totalUsers,
      activeUsers,
      inactiveUsers,
      suspendedUsers,
      totalRevenue
    };
  }, [filteredUsers]);

  const getCourseTitle = (courseId: string) => {
    const course = availableCourses.find(c => c._id === courseId);
    return course ? course.title : 'كورس غير معروف';
  };

  const getAvailableCoursesForUser = (user: AdminUser): Course[] => {
    return availableCourses.filter(course => 
      !user.enrolledCourses.some(enrolled => 
        typeof enrolled === 'string' ? enrolled === course._id : enrolled._id === course._id
      )
    );
  };

  const openEnrollModal = async () => {
    setShowEnrollModal(true);
    if (availableCourses.length === 0) {
      await fetchCourses();
    }
  };

  return (
    <div className="space-y-6">
      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden transform transition-all duration-300 ease-in-out ${
                notification.type === 'success' ? 'border-l-4 border-green-500' :
                notification.type === 'error' ? 'border-l-4 border-red-500' :
                notification.type === 'warning' ? 'border-l-4 border-yellow-500' :
                'border-l-4 border-[#41ADE1]'
              }`}
            >
              <div className="p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    {notification.type === 'success' && <CheckCircleIcon className="h-6 w-6 text-green-500" />}
                    {notification.type === 'error' && <ExclamationCircleIcon className="h-6 w-6 text-red-500" />}
                    {notification.type === 'warning' && <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500" />}
                    {notification.type === 'info' && <InformationCircleIcon className="h-6 w-6 text-[#41ADE1]" />}
                  </div>
                  <div className="mr-3 w-0 flex-1 pt-0.5">
                    <p className="text-sm font-medium text-gray-900">{notification.message}</p>
                    <p className="mt-1 text-sm text-gray-500">
                      {notification.timestamp.toLocaleTimeString('ar-SA')}
                    </p>
                  </div>
                  <div className="ml-4 flex-shrink-0 flex">
                    <button
                      className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
                      onClick={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
                    >
                      <XCircleIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إدارة المستخدمين</h1>
          <p className="mt-2 text-gray-600">عرض وإدارة جميع المستخدمين المسجلين</p>
          <p className="mt-1 text-sm text-gray-500">
            آخر تحديث: {lastUpdated.toLocaleString('ar-EG', { calendar: 'gregory' })}
            {refreshing && <span className="text-[#41ADE1] mr-2">(جاري التحديث...)</span>}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={refreshUsers}
            disabled={refreshing}
            className="inline-flex items-center px-4 py-2 bg-[#41ADE1] text-white rounded-lg hover:bg-[#3399CC] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
          >
            <ArrowPathIcon className={`h-4 w-4 ml-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'جاري التحديث...' : 'تحديث البيانات'}
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <ExclamationCircleIcon className="h-5 w-5 text-red-400" />
            </div>
            <div className="mr-3">
              <h3 className="text-sm font-medium text-red-800">خطأ في تحميل البيانات</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 border-r-4 border-[#41ADE1]">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UserGroupIcon className="h-8 w-8 text-[#41ADE1]" />
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-500">إجمالي المستخدمين</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              <div className="flex items-center mt-1">
                <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 ml-1" />
                <span className="text-xs text-green-600">+12% هذا الشهر</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 border-r-4 border-green-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircleIcon className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-500">مستخدمين نشطين</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeUsers}</p>
              <div className="flex items-center mt-1">
                <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 ml-1" />
                <span className="text-xs text-green-600">+8% هذا الشهر</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 border-r-4 border-yellow-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-500">مستخدمين غير نشطين</p>
              <p className="text-2xl font-bold text-gray-900">{stats.inactiveUsers}</p>
              <div className="flex items-center mt-1">
                <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 ml-1" />
                <span className="text-xs text-red-600">-5% هذا الشهر</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 border-r-4 border-red-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                <XCircleIcon className="h-5 w-5 text-red-600" />
              </div>
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-500">مستخدمين معلقين</p>
              <p className="text-2xl font-bold text-gray-900">{stats.suspendedUsers}</p>
              <div className="flex items-center mt-1">
                <span className="text-xs text-gray-500">مستقر</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <FunnelIcon className="h-5 w-5 ml-2" />
            فلاتر البحث
          </h3>
          <button
            onClick={clearFilters}
            className="text-sm text-[#41ADE1] hover:text-[#41ADE1] flex items-center"
          >
            <span className="ml-1">مسح الكل</span>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              البحث في المستخدمين
            </label>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#41ADE1] focus:border-transparent transition-colors"
                placeholder="البحث بالاسم أو البريد الإلكتروني..."
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              حالة المستخدم
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#41ADE1] focus:border-transparent transition-colors"
            >
              <option value="all">جميع الحالات</option>
              <option value="active">نشط</option>
              <option value="inactive">غير نشط</option>
              <option value="suspended">معلق</option>
            </select>
          </div>

          {/* Items per page */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              عدد النتائج
            </label>
            <select
              value={itemsPerPage}
              onChange={(e) => setCurrentPage(1)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#41ADE1] focus:border-transparent transition-colors"
              disabled
            >
              <option value="10">10 لكل صفحة</option>
              <option value="25">25 لكل صفحة</option>
              <option value="50">50 لكل صفحة</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <p className="text-sm text-gray-500">
              عرض <span className="font-medium text-gray-900">{paginatedUsers.length}</span> من{' '}
              <span className="font-medium text-gray-900">{totalUsers}</span> مستخدم
            </p>
            {(searchTerm || statusFilter !== 'all') && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#41ADE1]/30 text-[#41ADE1]">
                فلاتر نشطة
              </span>
            )}
          </div>
          <div className="text-sm text-gray-500">
            الصفحة {currentPage} من {totalPages}
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#41ADE1] mx-auto"></div>
            <p className="mt-4 text-gray-600">جاري تحميل المستخدمين...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center space-x-1">
                    <UserIcon className="h-4 w-4" />
                    <span>المستخدم</span>
                    {sortField === 'name' && (
                      <span className="text-[#41ADE1]">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center space-x-1">
                    <EnvelopeIcon className="h-4 w-4" />
                    <span>البريد الإلكتروني</span>
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('createdAt')}
                >
                  <div className="flex items-center space-x-1">
                    <CalendarIcon className="h-4 w-4" />
                    <span>تاريخ التسجيل</span>
                    {sortField === 'createdAt' && (
                      <span className="text-[#41ADE1]">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('enrolledCourses')}
                >
                  <div className="flex items-center space-x-1">
                    <AcademicCapIcon className="h-4 w-4" />
                    <span>الكورسات المسجلة</span>
                    {sortField === 'enrolledCourses' && (
                      <span className="text-[#41ADE1]">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('totalSpent')}
                >
                  <div className="flex items-center space-x-1">
                    <span>إجمالي الإنفاق</span>
                    {sortField === 'totalSpent' && (
                      <span className="text-[#41ADE1]">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الحالة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedUsers.map((user) => (
                <tr 
                  key={user._id} 
                  className="hover:bg-[#161d2a] transition-colors duration-200 cursor-pointer"
                  onClick={() => openUserModal(user)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12">
                        {user.avatar ? (
                          <img
                            className="h-12 w-12 rounded-full object-cover border-2 border-gray-200"
                            src={user.avatar}
                            alt={user.displayName}
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#161d2a] to-[#777] flex items-center justify-center">
                            <span className="text-white font-semibold text-lg">
                              {user.displayName.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="mr-4">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900">{user.displayName}</div>
                          {user.emailVerified && (
                            <CheckCircleIcon className="h-4 w-4 text-green-500 mr-1" />
                          )}
                          {user.isAdmin && (
                            <span className="mr-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                              مدير
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          آخر دخول: {user.lastLoginAt ? formatDate(user.lastLoginAt) : 'لم يدخل بعد'}
                        </div>
                        {user.subscription && (
                          <div className="text-xs text-gray-400">
                            اشتراك: {user.subscription.type === 'free' ? 'مجاني' : 
                                    user.subscription.type === 'premium' ? 'مميز' : 'احترافي'}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {user.enrolledCourses.length} كورس
                    </div>
                    {user.enrolledCourses.length > 0 && (
                      <div className="text-xs text-gray-500">
                        {user.enrolledCourses.slice(0, 2).map((course, index) => (
                          <div key={typeof course === 'string' ? course : course._id || course.id || index} className="truncate max-w-xs">
                            {typeof course === 'string' ? getCourseTitle(course) : course.title || 'كورس غير معروف'}
                          </div>
                        ))}
                        {user.enrolledCourses.length > 2 && (
                          <div className="text-[#41ADE1]">+{user.enrolledCourses.length - 2} أخرى</div>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(user.totalSpent || 0)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      getStatusColor(user.status || 'active')
                    }`}>
                      {getStatusText(user.status || 'active')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openUserModal(user);
                      }}
                      className="text-[#41ADE1] hover:text-[#41ADE1] flex items-center transition-colors duration-200"
                    >
                      <EyeIcon className="h-4 w-4 ml-1" />
                      عرض
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                السابق
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="mr-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                التالي
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  عرض <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> إلى{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * itemsPerPage, totalUsers)}
                  </span>{' '}
                  من <span className="font-medium">{totalUsers}</span> نتيجة
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    السابق
                  </button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === pageNum
                            ? 'z-10 bg-[#41ADE1]/20 border-[#41ADE1] text-[#41ADE1]'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    التالي
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-4/5 lg:w-3/4 xl:w-2/3 shadow-xl rounded-lg bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  {selectedUser.avatar ? (
                    <img
                      className="h-16 w-16 rounded-full object-cover border-4 border-gray-200 ml-4"
                      src={selectedUser.avatar}
                      alt={selectedUser.displayName}
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[#41ADE1] to-purple-500 flex items-center justify-center ml-4">
                      <span className="text-white font-bold text-2xl">
                        {selectedUser.displayName.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{selectedUser.displayName}</h3>
                    <p className="text-sm text-gray-500">{selectedUser.email}</p>
                    {selectedUser.isAdmin && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 mt-1">
                        مدير النظام
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={closeUserModal}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-8">
                {/* Basic Info */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">المعلومات الأساسية</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">الاسم الكامل</label>
                      <p className="mt-1 text-sm text-black">{selectedUser.displayName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">البريد الإلكتروني</label>
                      <div className="mt-1 flex items-center">
                        <p className="text-sm text-gray-900">{selectedUser.email}</p>
                        {selectedUser.emailVerified && (
                          <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">رقم الهاتف</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedUser.phone || 'غير محدد'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">الموقع</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedUser.location || 'غير محدد'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">تاريخ الميلاد</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedUser.birthDate ? formatDate(selectedUser.birthDate) : 'غير محدد'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">الجنس</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedUser.gender === 'male' ? 'ذكر' : 
                         selectedUser.gender === 'female' ? 'أنثى' : 'غير محدد'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Account Status */}
                <div className="bg-[#41ADE1]/20 rounded-lg p-6">
                  <h4 className="text-lg font-semibold !text-black mb-4">حالة الحساب</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium !text-black">الحالة</label>
                      <div className="mt-1">
                        <select
                          value={selectedUser.status}
                          onChange={(e) => toggleUserStatus(selectedUser._id, e.target.value)}
                          className="text-sm border border-black rounded-md px-3 py-2 bg-white"
                        >
                          <option value="active">نشط</option>
                          <option value="inactive">غير نشط</option>
                          <option value="suspended">معلق</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-black">تاريخ التسجيل</label>
                      <p className="mt-1 text-sm text-gray-900">{formatDate(selectedUser.createdAt)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-black">آخر دخول</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedUser.lastLoginAt ? formatDate(selectedUser.lastLoginAt) : 'لم يدخل بعد'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Fitness & Goals */}
                <div className="bg-green-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold !text-black mb-4">اللياقة والأهداف</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium !text-black">مستوى اللياقة</label>
                      <p className="mt-1 text-sm !text-black">
                        {selectedUser.fitnessLevel === 'beginner' ? 'مبتدئ' :
                         selectedUser.fitnessLevel === 'intermediate' ? 'متوسط' :
                         selectedUser.fitnessLevel === 'advanced' ? 'متقدم' : 'غير محدد'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-black">الأهداف</label>
                      <div className="mt-1">
                        {selectedUser.goals && selectedUser.goals.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {selectedUser.goals.map((goal, index) => (
                              <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {goal}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">لا توجد أهداف محددة</p>
                        )}
                      </div>
                    </div>
                  </div>
                  {selectedUser.bio && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-black">نبذة شخصية</label>
                      <p className="mt-1 text-sm text-black">{selectedUser.bio}</p>
                    </div>
                  )}
                </div>

                {/* Enrolled Courses */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-md font-medium text-gray-900">الكورسات المسجلة</h4>
                    <button
                      onClick={openEnrollModal}
                      className="inline-flex items-center px-3 py-1 bg-[#41ADE1] text-white text-sm rounded-md hover:bg-[#3399CC]"
                    >
                      <PlusIcon className="h-4 w-4 ml-1" />
                      تسجيل في كورس
                    </button>
                  </div>
                  
                  {selectedUser.enrolledCourses.length === 0 ? (
                    <p className="text-sm text-gray-500">لم يسجل في أي كورس بعد</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedUser.enrolledCourses.map((course, index) => (
                        <div key={typeof course === 'string' ? course : course._id || course.id || index} className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                          <span className="text-sm text-gray-900">
                            {typeof course === 'string' ? getCourseTitle(course) : course.title || 'كورس غير معروف'}
                          </span>
                          <button
                            onClick={() => {
                              const courseId = typeof course === 'string' ? course : course._id || course.id;
                              if (courseId) unenrollUserFromCourse(courseId);
                            }}
                            className="text-red-600 hover:text-red-700"
                          >
                            <MinusIcon className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ملاحظات</label>
                  <textarea
                    value={userNotes}
                    onChange={(e) => setUserNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#41ADE1] focus:border-transparent"
                    placeholder="أضف ملاحظات حول المستخدم..."
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-4 mt-6">
                <button
                  onClick={closeUserModal}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-[#777] hover:text-white"
                >
                  إلغاء
                </button>
                <button
                  onClick={saveUserNotes}
                  className="px-4 py-2 bg-[#41ADE1] text-white rounded-md hover:bg-[#3399CC]"
                >
                  حفظ الملاحظات
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enroll in Course Modal */}
      {showEnrollModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">تسجيل في كورس جديد</h3>
                <button
                  onClick={() => setShowEnrollModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                {loadingCourses ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#41ADE1]"></div>
                    <span className="mr-3 text-sm text-gray-600">جاري تحميل الكورسات...</span>
                  </div>
                ) : getAvailableCoursesForUser(selectedUser).length === 0 ? (
                  <p className="text-sm text-gray-500">المستخدم مسجل في جميع الكورسات المتاحة</p>
                ) : (
                  getAvailableCoursesForUser(selectedUser).map(course => (
                    <div key={course._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-md">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{course.title}</h4>
                        <p className="text-sm text-gray-500">{formatCurrency(course.price)}</p>
                      </div>
                      <button
                        onClick={() => enrollUserInCourse(course._id)}
                        className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
                      >
                        تسجيل
                      </button>
                    </div>
                  ))
                )}
              </div>
              
              <div className="flex items-center justify-end mt-6">
                <button
                  onClick={() => setShowEnrollModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-[#777] hover:text-white"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredUsers.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">لا توجد مستخدمين</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || statusFilter !== 'all'
              ? 'لا توجد مستخدمين يطابقون معايير البحث الحالية'
              : 'لم يتم تسجيل أي مستخدمين بعد'}
          </p>
          {(searchTerm || statusFilter !== 'all') && (
            <button
              onClick={clearFilters}
              className="mt-4 inline-flex items-center px-4 py-2 bg-[#41ADE1] text-white rounded-lg hover:bg-[#3399CC] transition-colors"
            >
              مسح الفلاتر
            </button>
          )}
        </div>
      )}
    </div>
  );
}