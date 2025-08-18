'use client';

import { useState, useMemo } from 'react';
import {
  MagnifyingGlassIcon,
  UserIcon,
  EyeIcon,
  PlusIcon,
  MinusIcon,
  CalendarIcon,
  AcademicCapIcon,
  EnvelopeIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  lastLoginAt?: string;
  enrolledCourses: string[];
  totalSpent: number;
  status: 'active' | 'inactive' | 'suspended';
  notes?: string;
}

interface Course {
  id: string;
  title: string;
  price: number;
}

// Mock data for demonstration
const mockUsers: User[] = [
  {
    id: 'user-1',
    email: 'ahmed@example.com',
    name: 'أحمد محمد',
    createdAt: '2024-01-10T10:30:00Z',
    lastLoginAt: '2024-01-15T14:20:00Z',
    enrolledCourses: ['course-1', 'course-3'],
    totalSpent: 448,
    status: 'active',
    notes: 'عضو نشط ومتفاعل'
  },
  {
    id: 'user-2',
    email: 'sara@example.com',
    name: 'سارة أحمد',
    createdAt: '2024-01-08T15:45:00Z',
    lastLoginAt: '2024-01-14T09:15:00Z',
    enrolledCourses: ['course-2'],
    totalSpent: 199,
    status: 'active'
  },
  {
    id: 'user-3',
    email: 'omar@example.com',
    name: 'عمر خالد',
    createdAt: '2024-01-05T12:00:00Z',
    lastLoginAt: '2024-01-12T16:30:00Z',
    enrolledCourses: [],
    totalSpent: 0,
    status: 'inactive',
    notes: 'لم يكمل أي كورس بعد'
  },
  {
    id: 'user-4',
    email: 'fatima@example.com',
    name: 'فاطمة علي',
    createdAt: '2024-01-03T08:20:00Z',
    lastLoginAt: '2024-01-13T11:45:00Z',
    enrolledCourses: ['course-1', 'course-2', 'course-4'],
    totalSpent: 747,
    status: 'active',
    notes: 'عضو مميز - اشترى عدة كورسات'
  },
  {
    id: 'user-5',
    email: 'hassan@example.com',
    name: 'حسن محمود',
    createdAt: '2024-01-01T14:10:00Z',
    enrolledCourses: ['course-4'],
    totalSpent: 249,
    status: 'suspended',
    notes: 'تم تعليق الحساب مؤقتاً'
  }
];

const mockCourses: Course[] = [
  { id: 'course-1', title: 'كورس تدريب كمال الأجسام المتقدم', price: 299 },
  { id: 'course-2', title: 'كورس تدريب المصارعة للمبتدئين', price: 199 },
  { id: 'course-3', title: 'كورس التغذية الرياضية', price: 149 },
  { id: 'course-4', title: 'كورس تدريب الملاكمة', price: 249 }
];

type StatusFilter = 'all' | 'active' | 'inactive' | 'suspended';
type SortField = 'createdAt' | 'name' | 'totalSpent' | 'enrolledCourses';
type SortOrder = 'asc' | 'desc';

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [userNotes, setUserNotes] = useState('');

  // Filter and sort users
  const filteredUsers = useMemo(() => {
    let filtered = mockUsers.filter(user => {
      // Search filter
      const searchMatch = searchTerm === '' || 
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Status filter
      const statusMatch = statusFilter === 'all' || user.status === statusFilter;
      
      return searchMatch && statusMatch;
    });

    // Sort users
    filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];
      
      if (sortField === 'createdAt') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      } else if (sortField === 'enrolledCourses') {
        aValue = aValue.length;
        bValue = bValue.length;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [searchTerm, statusFilter, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

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
    return new Date(dateString).toLocaleDateString('ar-SA', {
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

  const openUserModal = (user: User) => {
    setSelectedUser(user);
    setUserNotes(user.notes || '');
    setShowUserModal(true);
  };

  const closeUserModal = () => {
    setSelectedUser(null);
    setUserNotes('');
    setShowUserModal(false);
  };

  const saveUserNotes = () => {
    if (selectedUser) {
      // Mock API call to save notes
      console.log('Saving notes for user:', selectedUser.id, userNotes);
      alert('تم حفظ الملاحظات بنجاح!');
      closeUserModal();
    }
  };

  const enrollUserInCourse = (courseId: string) => {
    if (selectedUser) {
      // Mock API call to enroll user
      console.log('Enrolling user:', selectedUser.id, 'in course:', courseId);
      alert('تم تسجيل المستخدم في الكورس بنجاح!');
      setShowEnrollModal(false);
    }
  };

  const unenrollUserFromCourse = (courseId: string) => {
    if (selectedUser && confirm('هل أنت متأكد من إلغاء تسجيل المستخدم من هذا الكورس؟')) {
      // Mock API call to unenroll user
      console.log('Unenrolling user:', selectedUser.id, 'from course:', courseId);
      alert('تم إلغاء تسجيل المستخدم من الكورس!');
    }
  };

  const toggleUserStatus = (userId: string, newStatus: string) => {
    if (confirm(`هل أنت متأكد من تغيير حالة المستخدم إلى "${getStatusText(newStatus)}"؟`)) {
      // Mock API call to update user status
      console.log('Updating user status:', userId, 'to:', newStatus);
      alert('تم تحديث حالة المستخدم بنجاح!');
    }
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const totalUsers = filteredUsers.length;
    const activeUsers = filteredUsers.filter(user => user.status === 'active').length;
    const inactiveUsers = filteredUsers.filter(user => user.status === 'inactive').length;
    const suspendedUsers = filteredUsers.filter(user => user.status === 'suspended').length;
    const totalRevenue = filteredUsers.reduce((sum, user) => sum + user.totalSpent, 0);
    
    return {
      totalUsers,
      activeUsers,
      inactiveUsers,
      suspendedUsers,
      totalRevenue
    };
  }, [filteredUsers]);

  const getCourseTitle = (courseId: string) => {
    const course = mockCourses.find(c => c.id === courseId);
    return course ? course.title : 'كورس غير معروف';
  };

  const getAvailableCoursesForUser = (user: User) => {
    return mockCourses.filter(course => !user.enrolledCourses.includes(course.id));
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إدارة المستخدمين</h1>
          <p className="mt-2 text-gray-600">عرض وإدارة جميع المستخدمين المسجلين</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UserGroupIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-500">إجمالي المستخدمين</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold">{stats.activeUsers}</span>
              </div>
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-500">مستخدمين نشطين</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeUsers}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-yellow-600 font-bold">{stats.inactiveUsers}</span>
              </div>
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-500">مستخدمين غير نشطين</p>
              <p className="text-2xl font-bold text-gray-900">{stats.inactiveUsers}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 font-bold">{stats.suspendedUsers}</span>
              </div>
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-500">مستخدمين معلقين</p>
              <p className="text-2xl font-bold text-gray-900">{stats.suspendedUsers}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 font-bold">$</span>
              </div>
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
                placeholder="البحث في المستخدمين..."
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">جميع الحالات</option>
              <option value="active">نشط</option>
              <option value="inactive">غير نشط</option>
              <option value="suspended">معلق</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              مسح الفلاتر
            </button>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-sm text-gray-500">
            عرض {paginatedUsers.length} من {filteredUsers.length} مستخدم
          </p>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
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
                      <span className="text-blue-600">
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
                      <span className="text-blue-600">
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
                      <span className="text-blue-600">
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
                      <span className="text-blue-600">
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
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <UserIcon className="h-6 w-6 text-gray-600" />
                        </div>
                      </div>
                      <div className="mr-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">
                          آخر دخول: {user.lastLoginAt ? formatDate(user.lastLoginAt) : 'لم يدخل بعد'}
                        </div>
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
                        {user.enrolledCourses.slice(0, 2).map(courseId => (
                          <div key={courseId} className="truncate max-w-xs">
                            {getCourseTitle(courseId)}
                          </div>
                        ))}
                        {user.enrolledCourses.length > 2 && (
                          <div className="text-blue-600">+{user.enrolledCourses.length - 2} أخرى</div>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(user.totalSpent)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      getStatusColor(user.status)
                    }`}>
                      {getStatusText(user.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => openUserModal(user)}
                      className="text-blue-600 hover:text-blue-900 flex items-center"
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
                  عرض <span className="font-medium">{startIndex + 1}</span> إلى{' '}
                  <span className="font-medium">
                    {Math.min(startIndex + itemsPerPage, filteredUsers.length)}
                  </span>{' '}
                  من <span className="font-medium">{filteredUsers.length}</span> نتيجة
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
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
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
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">تفاصيل المستخدم</h3>
                <button
                  onClick={closeUserModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-6">
                {/* User Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">الاسم</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedUser.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">البريد الإلكتروني</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedUser.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">تاريخ التسجيل</label>
                    <p className="mt-1 text-sm text-gray-900">{formatDate(selectedUser.createdAt)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">آخر دخول</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedUser.lastLoginAt ? formatDate(selectedUser.lastLoginAt) : 'لم يدخل بعد'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">إجمالي الإنفاق</label>
                    <p className="mt-1 text-sm text-gray-900">{formatCurrency(selectedUser.totalSpent)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">الحالة</label>
                    <div className="mt-1">
                      <select
                        value={selectedUser.status}
                        onChange={(e) => toggleUserStatus(selectedUser.id, e.target.value)}
                        className="text-sm border border-gray-300 rounded-md px-3 py-1"
                      >
                        <option value="active">نشط</option>
                        <option value="inactive">غير نشط</option>
                        <option value="suspended">معلق</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Enrolled Courses */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-md font-medium text-gray-900">الكورسات المسجلة</h4>
                    <button
                      onClick={() => setShowEnrollModal(true)}
                      className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                    >
                      <PlusIcon className="h-4 w-4 ml-1" />
                      تسجيل في كورس
                    </button>
                  </div>
                  
                  {selectedUser.enrolledCourses.length === 0 ? (
                    <p className="text-sm text-gray-500">لم يسجل في أي كورس بعد</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedUser.enrolledCourses.map(courseId => (
                        <div key={courseId} className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                          <span className="text-sm text-gray-900">{getCourseTitle(courseId)}</span>
                          <button
                            onClick={() => unenrollUserFromCourse(courseId)}
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="أضف ملاحظات حول المستخدم..."
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-4 mt-6">
                <button
                  onClick={closeUserModal}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  إلغاء
                </button>
                <button
                  onClick={saveUserNotes}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
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
                {getAvailableCoursesForUser(selectedUser).length === 0 ? (
                  <p className="text-sm text-gray-500">المستخدم مسجل في جميع الكورسات المتاحة</p>
                ) : (
                  getAvailableCoursesForUser(selectedUser).map(course => (
                    <div key={course.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-md">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{course.title}</h4>
                        <p className="text-sm text-gray-500">{formatCurrency(course.price)}</p>
                      </div>
                      <button
                        onClick={() => enrollUserInCourse(course.id)}
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
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
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
              className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              مسح الفلاتر
            </button>
          )}
        </div>
      )}
    </div>
  );
}