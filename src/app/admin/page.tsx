'use client';

import { useState, useEffect } from 'react';
import {
  CurrencyDollarIcon,
  ShoppingCartIcon,
  UsersIcon,
  AcademicCapIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';

// Mock data - replace with real data from Firebase
interface DashboardStats {
  totalSales: number;
  totalOrders: number;
  newStudents: number;
  topCourse: {
    name: string;
    sales: number;
  };
  salesGrowth: number;
  ordersGrowth: number;
  studentsGrowth: number;
}

interface RecentOrder {
  id: string;
  user: string;
  course: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  createdAt: Date;
}

interface TopCourse {
  id: string;
  name: string;
  revenue: number;
  enrollments: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [topCourses, setTopCourses] = useState<TopCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - replace with real API calls
    const fetchDashboardData = async () => {
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock stats
        setStats({
          totalSales: 15750,
          totalOrders: 89,
          newStudents: 23,
          topCourse: {
            name: 'كورس تدريب كمال الأجسام المتقدم',
            sales: 45
          },
          salesGrowth: 12.5,
          ordersGrowth: 8.3,
          studentsGrowth: 15.7
        });

        // Mock recent orders
        setRecentOrders([
          {
            id: 'ORD-001',
            user: 'أحمد محمد',
            course: 'كورس تدريب كمال الأجسام',
            amount: 199,
            status: 'completed',
            createdAt: new Date('2024-01-15T10:30:00')
          },
          {
            id: 'ORD-002',
            user: 'فاطمة علي',
            course: 'كورس التغذية الرياضية',
            amount: 149,
            status: 'completed',
            createdAt: new Date('2024-01-15T09:15:00')
          },
          {
            id: 'ORD-003',
            user: 'محمد حسن',
            course: 'كورس اللياقة البدنية',
            amount: 99,
            status: 'pending',
            createdAt: new Date('2024-01-15T08:45:00')
          }
        ]);

        // Mock top courses
        setTopCourses([
          {
            id: 'course-1',
            name: 'كورس تدريب كمال الأجسام المتقدم',
            revenue: 8950,
            enrollments: 45
          },
          {
            id: 'course-2',
            name: 'كورس التغذية الرياضية',
            revenue: 4470,
            enrollments: 30
          },
          {
            id: 'course-3',
            name: 'كورس اللياقة البدنية للمبتدئين',
            revenue: 2970,
            enrollments: 30
          }
        ]);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
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
              <p className="text-sm font-medium text-gray-600">إجمالي المبيعات</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats ? formatCurrency(stats.totalSales) : '$0'}
              </p>
              {stats && (
                <div className="flex items-center mt-1">
                  {stats.salesGrowth > 0 ? (
                    <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 ml-1" />
                  ) : (
                    <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 ml-1" />
                  )}
                  <span className={`text-sm ${
                    stats.salesGrowth > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stats.salesGrowth > 0 ? '+' : ''}{stats.salesGrowth}%
                  </span>
                </div>
              )}
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
                {stats?.totalOrders || 0}
              </p>
              {stats && (
                <div className="flex items-center mt-1">
                  {stats.ordersGrowth > 0 ? (
                    <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 ml-1" />
                  ) : (
                    <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 ml-1" />
                  )}
                  <span className={`text-sm ${
                    stats.ordersGrowth > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stats.ordersGrowth > 0 ? '+' : ''}{stats.ordersGrowth}%
                  </span>
                </div>
              )}
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
              <p className="text-sm font-medium text-gray-600">طلاب جدد</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.newStudents || 0}
              </p>
              {stats && (
                <div className="flex items-center mt-1">
                  {stats.studentsGrowth > 0 ? (
                    <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 ml-1" />
                  ) : (
                    <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 ml-1" />
                  )}
                  <span className={`text-sm ${
                    stats.studentsGrowth > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stats.studentsGrowth > 0 ? '+' : ''}{stats.studentsGrowth}%
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Top Course */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AcademicCapIcon className="h-8 w-8 text-orange-600" />
            </div>
            <div className="mr-4 flex-1">
              <p className="text-sm font-medium text-gray-600">أفضل كورس</p>
              <p className="text-lg font-bold text-gray-900 truncate">
                {stats?.topCourse.name || 'لا يوجد'}
              </p>
              <p className="text-sm text-gray-500">
                {stats?.topCourse.sales || 0} مبيعة
              </p>
            </div>
          </div>
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
            {recentOrders.map((order) => (
              <div key={order.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{order.user}</p>
                    <p className="text-sm text-gray-500 truncate">{order.course}</p>
                    <p className="text-xs text-gray-400">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      getStatusColor(order.status)
                    }`}>
                      {getStatusText(order.status)}
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(order.amount)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="px-6 py-3 bg-gray-50 text-center">
            <a href="/admin/orders" className="text-sm text-blue-600 hover:text-blue-700">
              عرض جميع الطلبات
            </a>
          </div>
        </div>

        {/* Top Courses */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">أفضل الكورسات</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {topCourses.map((course, index) => (
              <div key={course.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center flex-1">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                      </div>
                    </div>
                    <div className="mr-3 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{course.name}</p>
                      <p className="text-sm text-gray-500">{course.enrollments} طالب</p>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900">
                      {formatCurrency(course.revenue)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          </div>
          {/* previous "Manage Courses" link removed here */}
        </div>
      </div>
    </div>
  );
}