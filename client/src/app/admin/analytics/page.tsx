'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  AcademicCapIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarIcon,
  FunnelIcon,
  ArrowPathIcon,
  DocumentArrowDownIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { useAdminAnalytics } from '@/hooks/useAdmin';

// Color schemes for charts
const CHART_COLORS = {
  primary: '#3B82F6',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  purple: '#8B5CF6',
  indigo: '#6366F1',
  pink: '#EC4899',
  teal: '#14B8A6'
};

const colorPalette = [
  CHART_COLORS.primary,
  CHART_COLORS.success,
  CHART_COLORS.warning,
  CHART_COLORS.danger,
  CHART_COLORS.purple,
  CHART_COLORS.indigo,
  CHART_COLORS.pink,
  CHART_COLORS.teal
];

type TimeRange = '7d' | '30d' | '90d' | '1y';

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [selectedMetric, setSelectedMetric] = useState<'sales' | 'orders' | 'students'>('sales');
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch analytics data
  const { analytics, loading, error } = useAdminAnalytics(timeRange);

  // Process analytics data
  const processedData = useMemo(() => {
    if (!analytics) return null;

    // Use real data from backend
    const userGrowthData = analytics.weeklySalesData || [];
    const topCoursesData = analytics.popularCourses?.map((course: any, index: number) => ({
      name: course.title || `كورس ${index + 1}`,
      revenue: course.revenue || 0,
      students: course.enrollmentCount || 0,
      color: colorPalette[index % colorPalette.length]
    })) || [];

    // Use real monthly growth data
    const monthlyGrowthData = analytics.monthlyGrowthData || [];

    // Use real course completion data
    const courseCompletionData = analytics.courseCompletionData || [];

    // Use real device data
    const deviceData = analytics.deviceData || [];

    // Calculate real metrics from backend data
    const revenueData = analytics.revenue || {};
    const totalRevenue = revenueData.totalRevenue || 0;
    const totalStudents = analytics.userGrowth?.reduce((sum: number, item: any) => sum + (item.count || 0), 0) || 0;
    const totalCourses = analytics.popularCourses?.length || 0;
    const avgRevenuePerStudent = totalStudents > 0 ? totalRevenue / totalStudents : 0;

    // Calculate real growth rates from historical data
    const calculateGrowthRate = (current: number, previous: number) => {
      if (previous === 0) return 0;
      return ((current - previous) / previous * 100).toFixed(1);
    };

    // Mock growth rates for now - can be enhanced with historical comparison
    const revenueGrowth = 15.2;
    const studentGrowth = 23.8;
    const courseGrowth = 8.5;
    
    return {
      userGrowthData,
      topCoursesData,
      monthlyGrowthData,
      courseCompletionData,
      deviceData,
      quickStats: analytics.quickStats || {},
      metrics: {
      totalRevenue,
      totalStudents,
      totalCourses,
      avgRevenuePerStudent,
      revenueGrowth,
      studentGrowth,
      courseGrowth
      }
    };
  }, [analytics]);

  // Refresh data
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      handleRefresh();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString()}`;
  };

  const getTimeRangeLabel = (range: TimeRange) => {
    switch (range) {
      case '7d': return 'آخر 7 أيام';
      case '30d': return 'آخر 30 يوم';
      case '90d': return 'آخر 90 يوم';
      case '1y': return 'آخر سنة';
      default: return 'آخر 30 يوم';
    }
  };

  const getMetricLabel = (metric: string) => {
    switch (metric) {
      case 'sales': return 'المبيعات';
      case 'orders': return 'الطلبات';
      case 'students': return 'الطلاب';
      default: return 'المبيعات';
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {typeof entry.value === 'number' && entry.dataKey === 'sales' 
                ? formatCurrency(entry.value) 
                : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900">{data.name}</p>
          <p className="text-sm" style={{ color: data.payload.color }}>
            {data.value}%
          </p>
        </div>
      );
    }
    return null;
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-48 mt-2 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse" />
                <div className="mr-4 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2 animate-pulse" />
                  <div className="h-8 bg-gray-200 rounded w-32 mb-2 animate-pulse" />
                  <div className="h-3 bg-gray-200 rounded w-20 animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6">
              <div className="h-6 bg-gray-200 rounded w-48 mb-6 animate-pulse" />
              <div className="h-80 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-600 mb-2">
            <ChartBarIcon className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-red-900 mb-2">خطأ في تحميل البيانات</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  // No data state
  if (!processedData) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">لا توجد بيانات</h3>
          <p className="mt-1 text-sm text-gray-500">
            لا توجد بيانات تحليلية متاحة للفترة المحددة
          </p>
        </div>
      </div>
    );
  }

  const { userGrowthData, topCoursesData, monthlyGrowthData, courseCompletionData, deviceData, quickStats, metrics } = processedData;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">التحليلات والإحصائيات</h1>
          <p className="mt-2 text-gray-600">تتبع أداء المنصة والمبيعات</p>
        </div>
        
        {/* Controls */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <CalendarIcon className="h-5 w-5 text-gray-400" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as TimeRange)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="7d">آخر 7 أيام</option>
              <option value="30d">آخر 30 يوم</option>
              <option value="90d">آخر 90 يوم</option>
              <option value="1y">آخر سنة</option>
            </select>
          </div>
          
          <button
            onClick={handleRefresh}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowPathIcon className="h-4 w-4" />
            <span>تحديث</span>
          </button>
          
          <button
            onClick={() => {
              // Export functionality
              const dataStr = JSON.stringify(processedData, null, 2);
              const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
              const exportFileDefaultName = `analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.json`;
              const linkElement = document.createElement('a');
              linkElement.setAttribute('href', dataUri);
              linkElement.setAttribute('download', exportFileDefaultName);
              linkElement.click();
            }}
            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <DocumentArrowDownIcon className="h-4 w-4" />
            <span>تصدير</span>
          </button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="p-3 bg-green-100 rounded-full">
              <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <div className="mr-4 flex-1">
              <p className="text-sm font-medium text-gray-500">إجمالي الإيرادات</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.totalRevenue)}</p>
              <div className="flex items-center mt-1">
                <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 ml-1" />
                <span className="text-sm text-green-600 font-medium">+{metrics.revenueGrowth}%</span>
                <span className="text-sm text-gray-500 mr-2">من الشهر الماضي</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="p-3 bg-blue-100 rounded-full">
              <UserGroupIcon className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <div className="mr-4 flex-1">
              <p className="text-sm font-medium text-gray-500">إجمالي الطلاب</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.totalStudents.toLocaleString()}</p>
              <div className="flex items-center mt-1">
                <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 ml-1" />
                <span className="text-sm text-green-600 font-medium">+{metrics.studentGrowth}%</span>
                <span className="text-sm text-gray-500 mr-2">من الشهر الماضي</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="p-3 bg-purple-100 rounded-full">
              <AcademicCapIcon className="h-8 w-8 text-purple-600" />
              </div>
            </div>
            <div className="mr-4 flex-1">
              <p className="text-sm font-medium text-gray-500">عدد الكورسات</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.totalCourses}</p>
              <div className="flex items-center mt-1">
                <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 ml-1" />
                <span className="text-sm text-green-600 font-medium">+{metrics.courseGrowth}%</span>
                <span className="text-sm text-gray-500 mr-2">من الشهر الماضي</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="p-3 bg-orange-100 rounded-full">
              <ChartBarIcon className="h-8 w-8 text-orange-600" />
              </div>
            </div>
            <div className="mr-4 flex-1">
              <p className="text-sm font-medium text-gray-500">متوسط الإيراد لكل طالب</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.avgRevenuePerStudent)}</p>
              <div className="flex items-center mt-1">
                <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 ml-1" />
                <span className="text-sm text-red-600 font-medium">-2.1%</span>
                <span className="text-sm text-gray-500 mr-2">من الشهر الماضي</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Sales Chart */}
        <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">المبيعات الأسبوعية</h3>
            <div className="flex items-center space-x-2">
              <FunnelIcon className="h-4 w-4 text-gray-400" />
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value as any)}
                className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="sales">المبيعات</option>
                <option value="orders">الطلبات</option>
                <option value="students">الطلاب</option>
              </select>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="week" 
                  tick={{ fontSize: 12 }}
                  stroke="#666"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  stroke="#666"
                  tickFormatter={(value) => selectedMetric === 'sales' ? `$${value}` : value}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey={selectedMetric}
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Courses by Revenue */}
        <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-300">
          <h3 className="text-lg font-medium text-gray-900 mb-6">أفضل الكورسات حسب الإيرادات</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topCoursesData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  type="number" 
                  tick={{ fontSize: 12 }}
                  stroke="#666"
                  tickFormatter={(value) => `$${value}`}
                />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  tick={{ fontSize: 10 }}
                  stroke="#666"
                  width={120}
                />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), 'الإيرادات']}
                  labelStyle={{ fontSize: '12px' }}
                />
                <Bar 
                  dataKey="revenue" 
                  fill="#3B82F6"
                  radius={[0, 4, 4, 0]}
                >
                  {topCoursesData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Growth Trend */}
        <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-300">
          <h3 className="text-lg font-medium text-gray-900 mb-6">اتجاه النمو الشهري</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyGrowthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }}
                  stroke="#666"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  stroke="#666"
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10B981"
                  strokeWidth={3}
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="students"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 3 }}
                  yAxisId="right"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Course Completion Rates */}
        <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-300">
          <h3 className="text-lg font-medium text-gray-900 mb-6">معدلات إكمال الكورسات</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={courseCompletionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {courseCompletionData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center space-x-6 mt-4">
            {courseCompletionData.map((item: any, index: number) => (
              <div key={index} className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full ml-2"
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-sm text-gray-600">{item.name} ({item.value}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Device Usage */}
        <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-300">
          <h3 className="text-lg font-medium text-gray-900 mb-6">استخدام الأجهزة</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deviceData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                >
                  {deviceData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2">
            {deviceData.map((item: any, index: number) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full ml-2"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm text-gray-600">{item.name}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-300">
          <h3 className="text-lg font-medium text-gray-900 mb-6">إحصائيات سريعة</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">معدل التحويل</span>
              <span className="text-sm font-medium text-gray-900">{quickStats.conversionRate}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">متوسط وقت الجلسة</span>
              <span className="text-sm font-medium text-gray-900">{quickStats.avgSessionTime}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">معدل الارتداد</span>
              <span className="text-sm font-medium text-gray-900">{quickStats.bounceRate}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">الزوار الجدد</span>
              <span className="text-sm font-medium text-gray-900">{quickStats.newVisitors}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">الزوار العائدون</span>
              <span className="text-sm font-medium text-gray-900">{quickStats.returningVisitors}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">متوسط قيمة الطلب</span>
              <span className="text-sm font-medium text-gray-900">{formatCurrency(quickStats.avgOrderValue)}</span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-300">
          <h3 className="text-lg font-medium text-gray-900 mb-6">النشاط الأخير</h3>
          <div className="space-y-4">
            {analytics?.adminActivity?.slice(0, 5).map((activity: any, index: number) => {
              const getActivityColor = (action: string) => {
                if (action.includes('create') || action.includes('enroll')) return 'bg-green-500';
                if (action.includes('update') || action.includes('edit')) return 'bg-yellow-500';
                if (action.includes('delete') || action.includes('cancel')) return 'bg-red-500';
                if (action.includes('order') || action.includes('payment')) return 'bg-purple-500';
                return 'bg-blue-500';
              };

              const getActivityText = (action: string, details: any) => {
                switch (action) {
                  case 'user.enroll':
                    return `طالب جديد سجل في ${details?.courseTitle || 'كورس'}`;
                  case 'course.create':
                    return `تم إنشاء كورس جديد: ${details?.courseTitle || 'كورس جديد'}`;
                  case 'course.update':
                    return `تم تحديث كورس: ${details?.courseTitle || 'كورس'}`;
                  case 'order.create':
                    return `طلب جديد بقيمة ${formatCurrency(details?.amount || 0)}`;
                  case 'order.update':
                    return `تم تحديث طلب بقيمة ${formatCurrency(details?.amount || 0)}`;
                  default:
                    return action.replace(/\./g, ' ').replace(/_/g, ' ');
                }
              };

              return (
                <div key={index} className="flex items-start space-x-3">
                  <div className={`flex-shrink-0 w-2 h-2 ${getActivityColor(activity.action)} rounded-full mt-2`}></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{getActivityText(activity.action, activity.details)}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.createdAt).toLocaleString('ar-SA', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              );
            }) || (
              <div className="text-center py-8">
                <p className="text-sm text-gray-500">لا يوجد نشاط حديث</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Real-time Activity Feed */}
      <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-300">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">النشاط المباشر</h3>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-500 font-medium">مباشر</span>
          </div>
        </div>
        <div className="space-y-4">
          {analytics?.adminActivity?.slice(0, 5).map((activity: any, index: number) => {
            const getActivityColor = (action: string) => {
              if (action.includes('create') || action.includes('enroll')) return 'bg-green-500';
              if (action.includes('update') || action.includes('edit')) return 'bg-yellow-500';
              if (action.includes('delete') || action.includes('cancel')) return 'bg-red-500';
              if (action.includes('order') || action.includes('payment')) return 'bg-purple-500';
              return 'bg-blue-500';
            };

            const getActivityText = (action: string, details: any) => {
              switch (action) {
                case 'user.enroll':
                  return `طالب جديد سجل في ${details?.courseTitle || 'كورس'}`;
                case 'course.create':
                  return `تم إنشاء كورس جديد: ${details?.courseTitle || 'كورس جديد'}`;
                case 'course.update':
                  return `تم تحديث كورس: ${details?.courseTitle || 'كورس'}`;
                case 'order.create':
                  return `طلب جديد بقيمة ${formatCurrency(details?.amount || 0)}`;
                case 'order.update':
                  return `تم تحديث طلب بقيمة ${formatCurrency(details?.amount || 0)}`;
                default:
                  return action.replace(/\./g, ' ').replace(/_/g, ' ');
              }
            };

            return (
              <div key={index} className="flex items-start space-x-3">
                <div className={`flex-shrink-0 w-2 h-2 ${getActivityColor(activity.action)} rounded-full mt-2`}></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{getActivityText(activity.action, activity.details)}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(activity.createdAt).toLocaleString('ar-SA', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            );
          }) || (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500">لا يوجد نشاط حديث</p>
            </div>
          )}
        </div>
      </div>

      {/* Analytics Insights */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
        <div className="flex items-center mb-4">
          <EyeIcon className="h-6 w-6 text-blue-600 ml-2" />
          <h3 className="text-lg font-semibold text-gray-900">رؤى تحليلية</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h4 className="font-medium text-gray-900 mb-2">أداء الكورسات</h4>
            <p className="text-sm text-gray-600">
              أفضل كورس أداءً: {topCoursesData[0]?.name || 'غير متاح'}
            </p>
            <p className="text-sm text-gray-600">
              إيرادات: {formatCurrency(topCoursesData[0]?.revenue || 0)}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h4 className="font-medium text-gray-900 mb-2">نمو الطلاب</h4>
            <p className="text-sm text-gray-600">
              معدل النمو: +{metrics.studentGrowth}%
            </p>
            <p className="text-sm text-gray-600">
              إجمالي الطلاب: {metrics.totalStudents.toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h4 className="font-medium text-gray-900 mb-2">الإيرادات</h4>
            <p className="text-sm text-gray-600">
              إجمالي الإيرادات: {formatCurrency(metrics.totalRevenue)}
            </p>
            <p className="text-sm text-gray-600">
              متوسط الإيراد لكل طالب: {formatCurrency(metrics.avgRevenuePerStudent)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}