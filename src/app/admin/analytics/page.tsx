'use client';

import { useState, useMemo } from 'react';
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
  CalendarIcon
} from '@heroicons/react/24/outline';

// Mock data for analytics
const weeklySalesData = [
  { week: 'الأسبوع 1', sales: 1200, orders: 8, students: 12 },
  { week: 'الأسبوع 2', sales: 1800, orders: 12, students: 18 },
  { week: 'الأسبوع 3', sales: 2400, orders: 16, students: 24 },
  { week: 'الأسبوع 4', sales: 1600, orders: 10, students: 15 },
  { week: 'الأسبوع 5', sales: 2800, orders: 18, students: 28 },
  { week: 'الأسبوع 6', sales: 3200, orders: 22, students: 32 },
  { week: 'الأسبوع 7', sales: 2600, orders: 17, students: 26 },
  { week: 'الأسبوع 8', sales: 3600, orders: 24, students: 36 }
];

const topCoursesByRevenue = [
  { name: 'كورس تدريب كمال الأجسام المتقدم', revenue: 8970, students: 30, color: '#3B82F6' },
  { name: 'كورس تدريب الملاكمة', revenue: 7470, students: 30, color: '#10B981' },
  { name: 'كورس تدريب المصارعة للمبتدئين', revenue: 5970, students: 30, color: '#F59E0B' },
  { name: 'كورس التغذية الرياضية', revenue: 4470, students: 30, color: '#EF4444' },
  { name: 'كورس تدريب اللياقة البدنية', revenue: 2985, students: 15, color: '#8B5CF6' }
];

const monthlyGrowthData = [
  { month: 'يناير', revenue: 12000, students: 45, courses: 4 },
  { month: 'فبراير', revenue: 15000, students: 62, courses: 5 },
  { month: 'مارس', revenue: 18000, students: 78, courses: 5 },
  { month: 'أبريل', revenue: 22000, students: 95, courses: 6 },
  { month: 'مايو', revenue: 28000, students: 118, courses: 7 },
  { month: 'يونيو', revenue: 32000, students: 142, courses: 8 }
];

const courseCompletionData = [
  { name: 'مكتمل', value: 68, color: '#10B981' },
  { name: 'قيد التقدم', value: 24, color: '#F59E0B' },
  { name: 'لم يبدأ', value: 8, color: '#EF4444' }
];

const deviceData = [
  { name: 'الهاتف المحمول', value: 52, color: '#3B82F6' },
  { name: 'سطح المكتب', value: 35, color: '#10B981' },
  { name: 'الجهاز اللوحي', value: 13, color: '#F59E0B' }
];

type TimeRange = '7d' | '30d' | '90d' | '1y';

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [selectedMetric, setSelectedMetric] = useState<'sales' | 'orders' | 'students'>('sales');

  // Calculate key metrics
  const metrics = useMemo(() => {
    const totalRevenue = topCoursesByRevenue.reduce((sum, course) => sum + course.revenue, 0);
    const totalStudents = topCoursesByRevenue.reduce((sum, course) => sum + course.students, 0);
    const totalCourses = topCoursesByRevenue.length;
    const avgRevenuePerStudent = totalRevenue / totalStudents;
    
    // Calculate growth rates (mock)
    const revenueGrowth = 15.2;
    const studentGrowth = 23.8;
    const courseGrowth = 8.5;
    
    return {
      totalRevenue,
      totalStudents,
      totalCourses,
      avgRevenuePerStudent,
      revenueGrowth,
      studentGrowth,
      courseGrowth
    };
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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">التحليلات والإحصائيات</h1>
          <p className="mt-2 text-gray-600">تتبع أداء المنصة والمبيعات</p>
        </div>
        
        {/* Time Range Selector */}
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
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="mr-4 flex-1">
              <p className="text-sm font-medium text-gray-500">إجمالي الإيرادات</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.totalRevenue)}</p>
              <div className="flex items-center mt-1">
                <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 ml-1" />
                <span className="text-sm text-green-600">+{metrics.revenueGrowth}%</span>
                <span className="text-sm text-gray-500 mr-2">من الشهر الماضي</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UserGroupIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mr-4 flex-1">
              <p className="text-sm font-medium text-gray-500">إجمالي الطلاب</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.totalStudents.toLocaleString()}</p>
              <div className="flex items-center mt-1">
                <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 ml-1" />
                <span className="text-sm text-green-600">+{metrics.studentGrowth}%</span>
                <span className="text-sm text-gray-500 mr-2">من الشهر الماضي</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AcademicCapIcon className="h-8 w-8 text-purple-600" />
            </div>
            <div className="mr-4 flex-1">
              <p className="text-sm font-medium text-gray-500">عدد الكورسات</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.totalCourses}</p>
              <div className="flex items-center mt-1">
                <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 ml-1" />
                <span className="text-sm text-green-600">+{metrics.courseGrowth}%</span>
                <span className="text-sm text-gray-500 mr-2">من الشهر الماضي</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ChartBarIcon className="h-8 w-8 text-orange-600" />
            </div>
            <div className="mr-4 flex-1">
              <p className="text-sm font-medium text-gray-500">متوسط الإيراد لكل طالب</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.avgRevenuePerStudent)}</p>
              <div className="flex items-center mt-1">
                <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 ml-1" />
                <span className="text-sm text-red-600">-2.1%</span>
                <span className="text-sm text-gray-500 mr-2">من الشهر الماضي</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Sales Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">المبيعات الأسبوعية</h3>
            <div className="flex items-center space-x-2">
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value as any)}
                className="text-sm border border-gray-300 rounded-md px-2 py-1"
              >
                <option value="sales">المبيعات</option>
                <option value="orders">الطلبات</option>
                <option value="students">الطلاب</option>
              </select>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklySalesData}>
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
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">أفضل الكورسات حسب الإيرادات</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topCoursesByRevenue} layout="horizontal">
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
                  formatter={(value: any) => [formatCurrency(value), 'الإيرادات']}
                  labelStyle={{ fontSize: '12px' }}
                />
                <Bar 
                  dataKey="revenue" 
                  fill="#3B82F6"
                  radius={[0, 4, 4, 0]}
                >
                  {topCoursesByRevenue.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Growth Trend */}
        <div className="bg-white rounded-lg shadow p-6">
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
        <div className="bg-white rounded-lg shadow p-6">
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
                  {courseCompletionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center space-x-6 mt-4">
            {courseCompletionData.map((item, index) => (
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
        <div className="bg-white rounded-lg shadow p-6">
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
                  {deviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2">
            {deviceData.map((item, index) => (
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
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">إحصائيات سريعة</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">معدل التحويل</span>
              <span className="text-sm font-medium text-gray-900">3.2%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">متوسط وقت الجلسة</span>
              <span className="text-sm font-medium text-gray-900">24 دقيقة</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">معدل الارتداد</span>
              <span className="text-sm font-medium text-gray-900">42%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">الزوار الجدد</span>
              <span className="text-sm font-medium text-gray-900">68%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">الزوار العائدون</span>
              <span className="text-sm font-medium text-gray-900">32%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">متوسط قيمة الطلب</span>
              <span className="text-sm font-medium text-gray-900">{formatCurrency(224)}</span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">النشاط الأخير</h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">طالب جديد سجل في كورس الملاكمة</p>
                <p className="text-xs text-gray-500">منذ 5 دقائق</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">تم إنشاء كورس جديد: تدريب السباحة</p>
                <p className="text-xs text-gray-500">منذ 15 دقيقة</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">تم تحديث كورس كمال الأجسام</p>
                <p className="text-xs text-gray-500">منذ 30 دقيقة</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">طلب جديد بقيمة $299</p>
                <p className="text-xs text-gray-500">منذ ساعة</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-2 h-2 bg-red-500 rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">تم إلغاء طلب بقيمة $149</p>
                <p className="text-xs text-gray-500">منذ ساعتين</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Empty State for No Data */}
      {weeklySalesData.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">لا توجد بيانات</h3>
          <p className="mt-1 text-sm text-gray-500">
            لا توجد بيانات تحليلية متاحة للفترة المحددة
          </p>
        </div>
      )}
    </div>
  );
}