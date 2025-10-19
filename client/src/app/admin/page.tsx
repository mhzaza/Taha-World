'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CurrencyDollarIcon,
  ShoppingCartIcon,
  UsersIcon,
  AcademicCapIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ChartBarIcon,
  EyeIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { adminAPI, apiUtils, type DashboardStats } from '@/lib/api';

interface RecentOrder {
  _id: string;
  userId: {
    displayName: string;
    email: string;
  };
  courseId: {
    title: string;
    _id: string;
  };
  amount: number;
  status: 'completed' | 'pending' | 'failed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

interface TopCourse {
  _id: string;
  title: string;
  revenue: number;
  enrollmentCount: number;
  rating: {
    average: number;
    count: number;
  };
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  color: string;
}

interface Alert {
  id: string;
  type: 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [topCourses, setTopCourses] = useState<TopCourse[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Quick Actions Configuration
  const quickActions: QuickAction[] = [
    {
      id: 'new-course',
      title: 'إنشاء كورس جديد',
      description: 'أضف كورساً جديداً للمنصة',
      icon: AcademicCapIcon,
      href: '/admin/courses/new',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      id: 'view-orders',
      title: 'إدارة الطلبات',
      description: 'عرض وإدارة جميع الطلبات',
      icon: ShoppingCartIcon,
      href: '/admin/orders',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      id: 'manage-users',
      title: 'إدارة المستخدمين',
      description: 'عرض وإدارة حسابات المستخدمين',
      icon: UsersIcon,
      href: '/admin/users',
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      id: 'analytics',
      title: 'التقارير والإحصائيات',
      description: 'عرض تقارير مفصلة عن الأداء',
      icon: ChartBarIcon,
      href: '/admin/analytics',
      color: 'bg-orange-500 hover:bg-orange-600'
    }
  ];

  const fetchDashboardData = async () => {
    try {
      setError(null);
      
      // Fetch dashboard stats
      const dashboardResponse = await adminAPI.getDashboard();
      if (dashboardResponse.data.success) {
        setStats(dashboardResponse.data.data?.dashboard || null);
      }

      // Fetch recent orders
      const ordersResponse = await adminAPI.getOrders({ limit: 5 });
      if (ordersResponse.data.success) {
        const orders = ordersResponse.data.data?.orders || [];
        // Transform Order[] to RecentOrder[] format
        const transformedOrders: RecentOrder[] = orders.map(order => {
          return {
            _id: order._id || '',
            userId: {
              displayName: order.userInfo?.displayName || order.userName || 'مستخدم غير معروف',
              email: order.userInfo?.email || order.userEmail || ''
            },
            courseId: {
              title: order.courseInfo?.title || order.courseTitle || 'كورس محذوف',
              _id: order.courseInfo?._id || order.courseId || ''
            },
            amount: order.amount || 0,
            status: (['completed', 'pending', 'failed', 'cancelled'].includes(order.status || '')) 
              ? (order.status as RecentOrder['status']) 
              : 'pending',
            createdAt: order.createdAt || new Date().toISOString(),
            updatedAt: order.updatedAt || new Date().toISOString()
          };
        });
        setRecentOrders(transformedOrders);
      }

      // Generate alerts based on data
      const newAlerts: Alert[] = [];
      
      if (dashboardResponse.data.data?.dashboard) {
        const stats = dashboardResponse.data.data.dashboard;
        
        // Check for low course count
        if (stats.courses.totalCourses < 5) {
          newAlerts.push({
            id: 'low-courses',
            type: 'warning',
            title: 'عدد قليل من الكورسات',
            message: 'يُنصح بإضافة المزيد من الكورسات لجذب المزيد من الطلاب',
            timestamp: new Date().toISOString()
          });
        }
        
        // Check for pending orders
        if (ordersResponse.data.data?.orders?.some(order => order.status === 'pending')) {
          newAlerts.push({
            id: 'pending-orders',
            type: 'info',
            title: 'طلبات في انتظار المراجعة',
            message: 'هناك طلبات تحتاج إلى مراجعة وموافقة',
            timestamp: new Date().toISOString()
          });
        }
      }
      
      setAlerts(newAlerts);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(apiUtils.handleApiError(error));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'منذ لحظات';
    if (diffInSeconds < 3600) return `منذ ${Math.floor(diffInSeconds / 60)} دقيقة`;
    if (diffInSeconds < 86400) return `منذ ${Math.floor(diffInSeconds / 3600)} ساعة`;
    return `منذ ${Math.floor(diffInSeconds / 86400)} يوم`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'مكتمل';
      case 'pending':
        return 'قيد الانتظار';
      case 'failed':
        return 'فاشل';
      case 'cancelled':
        return 'ملغي';
      case 'refunded':
        return 'معاد المبلغ';
      case 'processing':
        return 'جاري المعالجة';
      default:
        return status;
    }
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
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">لوحة التحكم</h1>
        <p className="mt-2 text-gray-600">نظرة عامة على أداء المنصة</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Sales */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="mr-4 flex-1">
              <p className="text-sm font-medium text-gray-600">إجمالي الإيرادات</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats ? formatCurrency(stats.orders.totalRevenue) : '$0'}
              </p>
              <div className="flex items-center mt-1">
                <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 ml-1" />
                <span className="text-sm text-green-600">
                  من الكورسات
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ShoppingCartIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mr-4 flex-1">
              <p className="text-sm font-medium text-gray-600">إجمالي الطلبات</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.orders.totalOrders || 0}
              </p>
              <div className="flex items-center mt-1">
                <ShoppingCartIcon className="h-4 w-4 text-blue-500 ml-1" />
                <span className="text-sm text-gray-600">
                  طلب هذا الشهر
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* New Students */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UsersIcon className="h-8 w-8 text-purple-600" />
            </div>
            <div className="mr-4 flex-1">
              <p className="text-sm font-medium text-gray-600">إجمالي المستخدمين</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.users.totalUsers || 0}
              </p>
              <div className="flex items-center mt-1">
                <UsersIcon className="h-4 w-4 text-purple-500 ml-1" />
                <span className="text-sm text-green-600">
                  {stats?.users.activeUsers || 0} نشط
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Total Courses */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AcademicCapIcon className="h-8 w-8 text-indigo-600" />
            </div>
            <div className="mr-4 flex-1">
              <p className="text-sm font-medium text-gray-600">إجمالي الكورسات</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.courses.totalCourses || 0}
              </p>
              <div className="flex items-center mt-1">
                <AcademicCapIcon className="h-4 w-4 text-indigo-500 ml-1" />
                <span className="text-sm text-green-600">
                  {stats?.courses.publishedCourses || 0} منشور
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400 ml-2" />
            <p className="text-sm text-red-700">{error}</p>
            <button
              onClick={handleRefresh}
              className="mr-auto text-sm text-red-600 hover:text-red-700"
            >
              إعادة المحاولة
            </button>
          </div>
        </div>
      )}

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-gray-900">التنبيهات</h2>
          <div className="grid gap-4">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border ${
                  alert.type === 'warning'
                    ? 'bg-yellow-50 border-yellow-200'
                    : alert.type === 'error'
                    ? 'bg-red-50 border-red-200'
                    : 'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="flex items-start">
                  <ExclamationTriangleIcon
                    className={`h-5 w-5 ml-2 mt-0.5 ${
                      alert.type === 'warning'
                        ? 'text-yellow-400'
                        : alert.type === 'error'
                        ? 'text-red-400'
                        : 'text-blue-400'
                    }`}
                  />
                  <div className="flex-1">
                    <h3
                      className={`text-sm font-medium ${
                        alert.type === 'warning'
                          ? 'text-yellow-800'
                          : alert.type === 'error'
                          ? 'text-red-800'
                          : 'text-blue-800'
                      }`}
                    >
                      {alert.title}
                    </h3>
                    <p
                      className={`mt-1 text-sm ${
                        alert.type === 'warning'
                          ? 'text-yellow-700'
                          : alert.type === 'error'
                          ? 'text-red-700'
                          : 'text-blue-700'
                      }`}
                    >
                      {alert.message}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {getTimeAgo(alert.timestamp)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">إجراءات سريعة</h2>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            <ArrowPathIcon className={`h-4 w-4 ml-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'جاري التحديث...' : 'تحديث البيانات'}
          </button>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <Link key={action.id} href={action.href}>
              <div className="group relative bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center">
                  <div className={`flex-shrink-0 p-3 rounded-lg ${action.color} text-white`}>
                    <action.icon className="h-6 w-6" />
                  </div>
                  <div className="mr-4 flex-1">
                    <h3 className="text-sm font-medium text-gray-900 group-hover:text-gray-700">
                      {action.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">{action.description}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">الطلبات الأخيرة</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <div key={order._id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {order.userId?.displayName || 'مستخدم غير معروف'}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {order.courseId?.title || 'كورس محذوف'}
                      </p>
                      <p className="text-xs text-gray-400">{formatDate(order.createdAt)}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          getStatusColor(order.status)
                        }`}
                      >
                        {getStatusText(order.status)}
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(order.amount)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center text-gray-500">
                <ShoppingCartIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p>لا توجد طلبات حديثة</p>
              </div>
            )}
          </div>
          <div className="px-6 py-3 bg-gray-50 text-center">
            <Link href="/admin/orders" className="text-sm text-blue-600 hover:text-blue-700">
              عرض جميع الطلبات
            </Link>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">حالة النظام</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-400 rounded-full ml-3"></div>
                <span className="text-sm text-gray-700">الخادم</span>
              </div>
              <span className="text-sm text-green-600">متصل</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-400 rounded-full ml-3"></div>
                <span className="text-sm text-gray-700">قاعدة البيانات</span>
              </div>
              <span className="text-sm text-green-600">متصلة</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-400 rounded-full ml-3"></div>
                <span className="text-sm text-gray-700">Cloudinary</span>
              </div>
              <span className="text-sm text-green-600">متصل</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <ClockIcon className="h-4 w-4 text-gray-400 ml-3" />
                <span className="text-sm text-gray-700">آخر تحديث</span>
              </div>
              <span className="text-xs text-gray-500">
                {stats ? getTimeAgo(new Date().toISOString()) : 'غير معروف'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}