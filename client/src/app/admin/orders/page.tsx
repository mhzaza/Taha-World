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
        
        // Ensure all order data is properly structured (no nested objects)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sanitizedOrders = newOrders.map((order: any) => {
          const isCourse = !!order.courseId;
          const isConsultation = !!order.consultationBookingId;
          
          return {
            ...order,
            userId: typeof order.userId === 'object' ? order.userId._id || order.userId.id : order.userId,
            courseId: typeof order.courseId === 'object' ? order.courseId._id || order.courseId.id : order.courseId,
            consultationBookingId: typeof order.consultationBookingId === 'object' ? order.consultationBookingId._id || order.consultationBookingId.id : order.consultationBookingId,
            userEmail: order.userEmail || (order.userId && typeof order.userId === 'object' ? order.userId.email : ''),
            userName: order.userName || (order.userId && typeof order.userId === 'object' ? order.userId.displayName : ''),
            courseTitle: order.courseTitle || (order.courseId && typeof order.courseId === 'object' ? order.courseId.title : ''),
            courseThumbnail: order.courseThumbnail || (order.courseId && typeof order.courseId === 'object' ? order.courseId.thumbnail : ''),
            consultationTitle: order.consultationTitle || (order.consultationBookingId && typeof order.consultationBookingId === 'object' ? order.consultationBookingId.consultationId?.title : ''),
            consultationBookingNumber: order.consultationBookingNumber || (order.consultationBookingId && typeof order.consultationBookingId === 'object' ? order.consultationBookingId.bookingNumber : ''),
            orderType: isCourse ? 'course' as const : isConsultation ? 'consultation' as const : undefined
          };
        });
        
        setOrders(sanitizedOrders);
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
        (order.courseTitle && order.courseTitle.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (order.consultationTitle && order.consultationTitle.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (order.consultationBookingNumber && order.consultationBookingNumber.toLowerCase().includes(searchTerm.toLowerCase()));
      
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
      let aValue: string | number = a[sortField];
      let bValue: string | number = b[sortField];
      
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
    return new Date(dateString).toLocaleDateString('ar-EG', {
      calendar: 'gregory',
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
      'نوع الطلب',
      'الدورة/الاستشارة',
      'المبلغ',
      'الحالة',
      'طريقة الدفع',
      'تاريخ الإنشاء',
      'رقم المعاملة'
    ];

    const csvContent = [
      headers.join(','),
      ...filteredOrders.map(order => {
        const orderTypeName = order.orderType === 'course' ? 'دورة' : order.orderType === 'consultation' ? 'استشارة' : '';
        const itemTitle = order.orderType === 'course' ? order.courseTitle : order.consultationTitle;
        return [
          order.id,
          order.userEmail,
          order.userName,
          orderTypeName,
          `"${itemTitle || ''}"`,
          order.amount,
          getStatusText(order.status),
          order.paymentMethod,
          formatDate(order.createdAt),
          order.transactionId || ''
        ].join(',');
      })
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
    const pendingBankTransfers = filteredOrders.filter(order => 
      order.paymentMethod === 'bank_transfer' && 
      order.bankTransfer?.verificationStatus === 'pending'
    ).length;
    
    return {
      totalRevenue,
      completedOrders,
      pendingOrders,
      failedOrders,
      pendingBankTransfers,
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
            آخر تحديث: {lastUpdated.toLocaleString('ar-EG', { calendar: 'gregory' })}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative inline-flex items-center px-3 py-2 bg-[#41ADE1] text-white rounded-lg hover:bg-[#3399CC] transition-colors"
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
                      <div key={notification.id} className="p-4 border-b border-gray-100 hover:bg-[#333]">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500">{notification.timestamp.toLocaleString('ar-EG', { calendar: 'gregory' })}</p>
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
            className="inline-flex items-center px-4 py-2 bg-[#41ADE1] text-white rounded-lg hover:bg-[#3399CC] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowPathIcon className={`h-4 w-4 ml-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'جاري التحديث...' : 'تحديث'}
          </button>
          
          {/* Export Button */}
          <button
            onClick={exportToCSV}
            className="inline-flex items-center px-4 py-2 bg-[#41ADE1] text-white rounded-lg hover:bg-[#3399CC] transition-colors"
          >
            <ArrowDownTrayIcon className="h-4 w-4 ml-2" />
            تصدير CSV
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
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
        
        <div className="bg-white rounded-lg shadow p-6 border-2 border-orange-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-orange-600 font-bold">{stats.pendingBankTransfers}</span>
              </div>
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-500">تحويلات تحتاج موافقة</p>
              <p className="text-2xl font-bold text-orange-600">{stats.pendingBankTransfers}</p>
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
              <option value="processing">قيد المعالجة</option>
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
            className="text-sm text-[#41ADE1] hover:text-[#3399CC] font-medium"
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
                <tr key={order.id} className="hover:bg-[#282828]">
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
                    <div className="flex items-center gap-2">
                      {order.orderType === 'course' ? (
                        <>
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            <AcademicCapIcon className="h-3 w-3 ml-1" />
                            دورة
                          </span>
                          <div className="text-sm text-gray-900 max-w-xs truncate" title={order.courseTitle}>
                            {order.courseTitle}
                          </div>
                        </>
                      ) : order.orderType === 'consultation' ? (
                        <>
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                            <ClockIcon className="h-3 w-3 ml-1" />
                            استشارة
                          </span>
                          <div className="max-w-xs">
                            <div className="text-sm text-gray-900 truncate" title={order.consultationTitle}>
                              {order.consultationTitle}
                            </div>
                            {order.consultationBookingNumber && (
                              <div className="text-xs text-gray-500">
                                #{order.consultationBookingNumber}
                              </div>
                            )}
                          </div>
                        </>
                      ) : (
                        <div className="text-sm text-gray-500">غير محدد</div>
                      )}
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
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm text-gray-900 capitalize">
                        {order.paymentMethod === 'bank_transfer' ? 'تحويل بنكي' : order.paymentMethod}
                      </span>
                      {order.paymentMethod === 'bank_transfer' && order.bankTransfer?.verificationStatus === 'pending' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
                          <ExclamationTriangleIcon className="h-3 w-3 ml-1" />
                          يحتاج موافقة
                        </span>
                      )}
                      {order.paymentMethod === 'bank_transfer' && order.bankTransfer?.verificationStatus === 'verified' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircleIcon className="h-3 w-3 ml-1" />
                          تم التحقق
                        </span>
                      )}
                      {order.paymentMethod === 'bank_transfer' && order.bankTransfer?.verificationStatus === 'rejected' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                          <XCircleIcon className="h-3 w-3 ml-1" />
                          مرفوض
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      className="text-[#41ADE1] hover:text-[#2277AA] flex items-center"
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
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                السابق
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="mr-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
                            ? 'z-10 bg-[#E6F5FB] border-[#41ADE1] text-[#41ADE1]'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-500'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                     className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
              className="mt-4 inline-flex items-center px-4 py-2 bg-[#41ADE1] text-white rounded-lg hover:bg-[#3399CC] transition-colors"
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
        onVerifyBankTransfer={async (orderId: string, status: 'verified' | 'rejected', reason?: string) => {
          try {
            const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050/api';
            
            // Get authentication token
            const token = document.cookie
              .split('; ')
              .find(row => row.startsWith('token='))
              ?.split('=')[1];

            if (!token) {
              addNotification('error', 'يرجى تسجيل الدخول مرة أخرى');
              return;
            }

            console.log('Verifying bank transfer:', { orderId, status, reason });

            const response = await fetch(`${API_BASE_URL}/payment/bank-transfer/verify/${orderId}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              credentials: 'include',
              body: JSON.stringify({ status, rejectionReason: reason })
            });

            console.log('Verify response status:', response.status);

            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}));
              console.error('Verify error response:', errorData);
              throw new Error(errorData.arabic || errorData.message || 'فشل في التحقق من التحويل البنكي');
            }

            const data = await response.json();
            console.log('Verify success:', data);
            
            // Update local state with the verified order
            await fetchOrders();
            setIsModalOpen(false);
            setSelectedOrder(null);
            
            if (status === 'verified') {
              addNotification('success', 'تم قبول التحويل البنكي وتفعيل الطلب بنجاح!');
            } else {
              addNotification('success', 'تم رفض التحويل البنكي');
            }
          } catch (error) {
            console.error('Error verifying bank transfer:', error);
            addNotification('error', 'حدث خطأ أثناء التحقق من التحويل البنكي');
          }
        }}
      />
    </div>
  );
}