'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  UserIcon,
  AcademicCapIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  BellIcon,
  XMarkIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { adminAPI, apiUtils, Order } from '@/lib/api';
import OrderDetailsModal from '@/components/admin/OrderDetailsModal';

// Order interface is now imported from @/lib/api

// Enhanced mock data with more realistic orders
const mockOrders: Order[] = [
  {
    id: 'ORD-001',
    userId: 'user-1',
    userEmail: 'ahmed@example.com',
    userName: 'أحمد محمد',
    courseId: 'course-1',
    courseTitle: 'كورس تدريب كمال الأجسام المتقدم',
    amount: 299,
    status: 'completed',
    paymentMethod: 'paypal',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:35:00Z',
    transactionId: 'TXN-123456',
    processingTime: 5
  },
  {
    id: 'ORD-002',
    userId: 'user-2',
    userEmail: 'sara@example.com',
    userName: 'سارة أحمد',
    courseId: 'course-2',
    courseTitle: 'كورس تدريب المصارعة للمبتدئين',
    amount: 199,
    status: 'processing',
    paymentMethod: 'stripe',
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
    updatedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 minutes ago
    processingTime: 15,
    isNew: true
  },
  {
    id: 'ORD-003',
    userId: 'user-3',
    userEmail: 'omar@example.com',
    userName: 'عمر خالد',
    courseId: 'course-3',
    courseTitle: 'كورس التغذية الرياضية',
    amount: 149,
    status: 'failed',
    paymentMethod: 'paypal',
    createdAt: '2024-01-13T09:15:00Z',
    updatedAt: '2024-01-13T09:20:00Z',
    notes: 'فشل في التحقق من البطاقة الائتمانية'
  },
  {
    id: 'ORD-004',
    userId: 'user-4',
    userEmail: 'fatima@example.com',
    userName: 'فاطمة علي',
    courseId: 'course-1',
    courseTitle: 'كورس تدريب كمال الأجسام المتقدم',
    amount: 299,
    status: 'refunded',
    paymentMethod: 'stripe',
    createdAt: '2024-01-12T14:45:00Z',
    updatedAt: '2024-01-13T10:00:00Z',
    transactionId: 'TXN-789012',
    refundReason: 'طلب من العميل'
  },
  {
    id: 'ORD-005',
    userId: 'user-5',
    userEmail: 'hassan@example.com',
    userName: 'حسن محمود',
    courseId: 'course-4',
    courseTitle: 'كورس تدريب الملاكمة',
    amount: 249,
    status: 'completed',
    paymentMethod: 'paypal',
    createdAt: '2024-01-11T11:30:00Z',
    updatedAt: '2024-01-11T11:35:00Z',
    transactionId: 'TXN-345678',
    processingTime: 5
  },
  {
    id: 'ORD-006',
    userId: 'user-6',
    userEmail: 'layla@example.com',
    userName: 'ليلى سعد',
    courseId: 'course-5',
    courseTitle: 'كورس اليوجا والتأمل',
    amount: 179,
    status: 'pending',
    paymentMethod: 'bank_transfer',
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
    updatedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    isNew: true
  },
  {
    id: 'ORD-007',
    userId: 'user-7',
    userEmail: 'youssef@example.com',
    userName: 'يوسف أحمد',
    courseId: 'course-6',
    courseTitle: 'كورس الرقص المعاصر',
    amount: 229,
    status: 'processing',
    paymentMethod: 'crypto',
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    updatedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    processingTime: 30
  }
];

type StatusFilter = 'all' | 'pending' | 'completed' | 'failed' | 'refunded' | 'processing';
type SortField = 'createdAt' | 'amount' | 'status' | 'userName';
type SortOrder = 'asc' | 'desc';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
    timestamp: Date;
  }>>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch orders data from API
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        dateFrom: dateRange.start,
        dateTo: dateRange.end,
        sortBy: sortField,
        sortOrder: sortOrder
      };

      const response = await adminAPI.getOrders(params);
      
      if (response.data.success) {
        const newOrders = response.data.data?.orders || [];
        setOrders(newOrders);
        setTotalOrders(response.data.data?.pagination?.totalItems || 0);
        setTotalPages(response.data.data?.pagination?.totalPages || 0);
        setLastUpdated(new Date());
        
        // Check for new orders (compare with previous data)
        const newOrdersOnly = newOrders.filter((order: Order) => {
          const orderDate = new Date(order.createdAt);
          const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
          return orderDate > fiveMinutesAgo;
        });
        
        if (newOrdersOnly.length > 0) {
          setNewOrdersCount(prev => prev + newOrdersOnly.length);
          addNotification('info', `تم استلام ${newOrdersOnly.length} طلب جديد`);
        }
      } else {
        throw new Error(response.data.error || 'Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      const errorMessage = apiUtils.handleApiError(error);
      setError(errorMessage);
      
      // Add error notification
      addNotification('error', `خطأ في تحميل الطلبات: ${errorMessage}`);
      
      // Fallback to mock data if API fails
      setOrders(mockOrders);
      setTotalOrders(mockOrders.length);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, searchTerm, statusFilter, dateRange, sortField, sortOrder]);

  const refreshOrders = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

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

  // Load orders on component mount and set up real-time updates
  useEffect(() => {
    fetchOrders();
    
    // Set up real-time updates every 30 seconds
    const interval = setInterval(fetchOrders, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Filter and sort orders
  const filteredOrders = useMemo(() => {
    const filtered = orders.filter(order => {
      // Search filter
      const searchMatch = searchTerm === '' || 
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.courseTitle.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Status filter
      const statusMatch = statusFilter === 'all' || order.status === statusFilter;
      
      // Date range filter
      const orderDate = new Date(order.createdAt);
      const startDate = dateRange.start ? new Date(dateRange.start) : null;
      const endDate = dateRange.end ? new Date(dateRange.end) : null;
      
      const dateMatch = (!startDate || orderDate >= startDate) && 
                       (!endDate || orderDate <= endDate);
      
      return searchMatch && statusMatch && dateMatch;
    });

    // Sort orders
    filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];
      
      if (sortField === 'createdAt') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [orders, searchTerm, statusFilter, sortField, sortOrder, dateRange]);

  // Pagination - using API pagination instead of client-side
  const paginatedOrders = filteredOrders; // API handles pagination

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'مكتمل';
      case 'pending':
        return 'معلق';
      case 'processing':
        return 'قيد المعالجة';
      case 'failed':
        return 'فاشل';
      case 'refunded':
        return 'مسترد';
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'pending':
        return <ClockIcon className="h-4 w-4" />;
      case 'processing':
        return <ArrowPathIcon className="h-4 w-4 animate-spin" />;
      case 'failed':
        return <XCircleIcon className="h-4 w-4" />;
      case 'refunded':
        return <ExclamationTriangleIcon className="h-4 w-4" />;
      default:
        return <ClockIcon className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const exportToCSV = () => {
    const headers = [
      'رقم الطلب',
      'البريد الإلكتروني',
      'اسم المستخدم',
      'عنوان الكورس',
      'المبلغ',
      'الحالة',
      'طريقة الدفع',
      'تاريخ الإنشاء',
      'رقم المعاملة'
    ];

    const csvContent = [
      headers.join(','),
      ...filteredOrders.map(order => [
        order.id,
        order.userEmail,
        order.userName,
        `"${order.courseTitle}"`,
        order.amount,
        getStatusText(order.status),
        order.paymentMethod,
        formatDate(order.createdAt),
        order.transactionId || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `orders-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
    setDateRange({ start: '', end: '' });
    setCurrentPage(1);
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const totalRevenue = filteredOrders
      .filter(order => order.status === 'completed')
      .reduce((sum, order) => sum + order.amount, 0);
    
    const completedOrders = filteredOrders.filter(order => order.status === 'completed').length;
    const pendingOrders = filteredOrders.filter(order => order.status === 'pending').length;
    const failedOrders = filteredOrders.filter(order => order.status === 'failed').length;
    
    return {
      totalRevenue,
      completedOrders,
      pendingOrders,
      failedOrders,
      totalOrders: filteredOrders.length
    };
  }, [filteredOrders]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إدارة الطلبات</h1>
          <p className="mt-2 text-gray-600">عرض وإدارة جميع طلبات الشراء</p>
          <p className="mt-1 text-sm text-gray-500">
            آخر تحديث: {lastUpdated.toLocaleString('ar-SA')}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <BellIcon className="h-4 w-4" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </button>
            
            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute left-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">إشعارات جديدة</h3>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="p-4 text-sm text-gray-500">لا توجد إشعارات جديدة</p>
                  ) : (
                    notifications.map((notification) => (
                      <div key={notification.id} className="p-4 border-b border-gray-100 hover:bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500">{notification.timestamp.toLocaleString('ar-SA')}</p>
                          </div>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            notification.type === 'success' ? 'bg-green-100 text-green-800' :
                            notification.type === 'error' ? 'bg-red-100 text-red-800' :
                            notification.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {notification.type === 'success' ? 'نجح' :
                             notification.type === 'error' ? 'خطأ' :
                             notification.type === 'warning' ? 'تحذير' : 'معلومة'}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Refresh Button */}
          <button
            onClick={refreshOrders}
            disabled={refreshing}
            className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowPathIcon className={`h-4 w-4 ml-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'جاري التحديث...' : 'تحديث'}
          </button>
          
          {/* Export Button */}
          <button
            onClick={exportToCSV}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <ArrowDownTrayIcon className="h-4 w-4 ml-2" />
            تصدير CSV
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-500">إجمالي الإيرادات</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold">{stats.totalOrders}</span>
              </div>
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-500">إجمالي الطلبات</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold">{stats.completedOrders}</span>
              </div>
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-500">طلبات مكتملة</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completedOrders}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-yellow-600 font-bold">{stats.pendingOrders}</span>
              </div>
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-500">طلبات معلقة</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingOrders}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 font-bold">{stats.failedOrders}</span>
              </div>
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-500">طلبات فاشلة</p>
              <p className="text-2xl font-bold text-gray-900">{stats.failedOrders}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                placeholder="البحث في الطلبات..."
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              حالة الطلب
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">جميع الحالات</option>
              <option value="completed">مكتمل</option>
              <option value="pending">معلق</option>
              <option value="failed">فاشل</option>
              <option value="refunded">مسترد</option>
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              من تاريخ
            </label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              إلى تاريخ
            </label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            عرض {paginatedOrders.length} من {filteredOrders.length} طلب
          </p>
          
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            مسح الفلاتر
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('createdAt')}
                >
                  <div className="flex items-center space-x-1">
                    <CalendarIcon className="h-4 w-4" />
                    <span>التاريخ</span>
                    {sortField === 'createdAt' && (
                      <span className="text-blue-600">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  رقم الطلب
                </th>
                <th 
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('userName')}
                >
                  <div className="flex items-center space-x-1">
                    <UserIcon className="h-4 w-4" />
                    <span>المستخدم</span>
                    {sortField === 'userName' && (
                      <span className="text-blue-600">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center space-x-1">
                    <AcademicCapIcon className="h-4 w-4" />
                    <span>الكورس</span>
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('amount')}
                >
                  <div className="flex items-center space-x-1">
                    <CurrencyDollarIcon className="h-4 w-4" />
                    <span>المبلغ</span>
                    {sortField === 'amount' && (
                      <span className="text-blue-600">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center space-x-1">
                    <FunnelIcon className="h-4 w-4" />
                    <span>الحالة</span>
                    {sortField === 'status' && (
                      <span className="text-blue-600">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  طريقة الدفع
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{order.id}</div>
                    {order.transactionId && (
                      <div className="text-xs text-gray-500">TXN: {order.transactionId}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{order.userName}</div>
                    <div className="text-sm text-gray-500">{order.userEmail}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate" title={order.courseTitle}>
                      {order.courseTitle}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(order.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      getStatusColor(order.status)
                    }`}>
                      {getStatusText(order.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                    {order.paymentMethod}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      className="text-blue-600 hover:text-blue-900 flex items-center"
                      onClick={() => {
                        setSelectedOrder(order);
                        setIsModalOpen(true);
                      }}
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
                  عرض <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> إلى{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * itemsPerPage, totalOrders)}
                  </span>{' '}
                  من <span className="font-medium">{totalOrders}</span> نتيجة
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

      {/* Empty State */}
      {filteredOrders.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">لا توجد طلبات</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || statusFilter !== 'all' || dateRange.start || dateRange.end
              ? 'لا توجد طلبات تطابق معايير البحث الحالية'
              : 'لم يتم إنشاء أي طلبات بعد'}
          </p>
          {(searchTerm || statusFilter !== 'all' || dateRange.start || dateRange.end) && (
            <button
              onClick={clearFilters}
              className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              مسح الفلاتر
            </button>
          )}
        </div>
      )}

      {/* Order Details Modal */}
      <OrderDetailsModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedOrder(null);
        }}
        order={selectedOrder}
        onUpdateStatus={async (orderId: string, status: string, notes?: string) => {
          try {
            // Here you would call your API to update the order status
            // await adminAPI.updateOrderStatus(orderId, { status, notes });
            
            // For now, just update the local state
            setOrders(prev => prev.map(order => 
              order.id === orderId 
                ? { ...order, status: status as Order['status'], notes: notes || order.notes, updatedAt: new Date().toISOString() }
                : order
            ));
            
            addNotification('success', `تم تحديث حالة الطلب ${orderId} إلى ${getStatusText(status)}`);
          } catch (error) {
            console.error('Error updating order status:', error);
            addNotification('error', 'حدث خطأ أثناء تحديث حالة الطلب');
          }
        }}
      />
    </div>
  );
}