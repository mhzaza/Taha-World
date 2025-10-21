'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Layout, Container } from '@/components/layout';
import RequireAuth from '@/components/auth/RequireAuth';
import { useAuth } from '@/contexts/AuthContext';
import { userAPI, apiUtils, Course } from '@/lib/api';
import UserCertificates from '@/components/profile/UserCertificates';

interface UserProgress {
  courseId: string;
  completedLessons: string[];
  totalLessons: number;
  progressPercentage: number;
  totalWatchTime: number;
}

interface DashboardStats {
  totalCourses: number;
  averageProgress: number;
  totalWatchTime: number;
  completedCourses: number;
}

const DashboardPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'courses' | 'progress' | 'certificates'>('courses');
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalCourses: 0,
    averageProgress: 0,
    totalWatchTime: 0,
    completedCourses: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours} ساعة${mins > 0 ? ` و ${mins} دقيقة` : ''}`;
    }
    return `${mins} دقيقة`;
  };

  const formatPrice = (price: number, currency: string) => {
    return `${price} ${currency === 'USD' ? '$' : currency}`;
  };

  // Fetch user's enrolled courses and progress
  const fetchDashboardData = async () => {
    if (!user?._id) return;
    
    try {
      setLoading(true);
      setError(null);

      // Fetch enrolled courses and user progress
      const [coursesResponse, progressResponse] = await Promise.all([
        userAPI.getCourses(),
        userAPI.getProgress()
      ]);


      let courses: Course[] = [];
      let progressData: UserProgress[] = [];

      if (coursesResponse.data.success) {
        courses = ((coursesResponse.data as any).courses || []) as Course[];
        setEnrolledCourses(courses);
      }

      if (progressResponse.data.success) {
        progressData = (progressResponse.data.data?.progress || []) as UserProgress[];
        setUserProgress(progressData);
      }
      
      // Calculate dashboard stats
      const totalCourses = courses.length;
      const averageProgress = totalCourses > 0 
        ? Math.round(progressData.reduce((acc: number, p: UserProgress) => acc + (p.progressPercentage || 0), 0) / totalCourses)
        : 0;
      const totalWatchTime = progressData.reduce((acc: number, p: UserProgress) => acc + (p.totalWatchTime || 0), 0);
      const completedCourses = progressData.filter((p: UserProgress) => (p.progressPercentage || 0) >= 100).length;

      setDashboardStats({
        totalCourses,
        averageProgress,
        totalWatchTime,
        completedCourses
      });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(apiUtils.handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  // Get progress for a specific course
  const getProgressData = (courseId: string): number => {
    const courseProgress = userProgress.find(p => p.courseId === courseId);
    return courseProgress?.progressPercentage || 0;
  };

  // Load dashboard data when component mounts or user changes
  useEffect(() => {
    if (user?._id) {
      fetchDashboardData();
    }
  }, [user?._id]);

  // Auto-refresh dashboard data every 30 seconds to catch enrollment changes
  useEffect(() => {
    if (!user?._id) return;
    
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [user?._id]);

  return (
    <RequireAuth>
      <Layout>
        {/* Welcome Section */}
        <section className="bg-gradient-to-br from-gray-400 to-gray-500 py-16">
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                مرحباً، {user?.displayName || 'المتدرب'}
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                تابع تقدمك في الدورات التدريبية وواصل رحلتك نحو تحقيق أهدافك
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {loading ? '...' : dashboardStats.totalCourses}
                </div>
                <div className="text-gray-600">الدورات المسجلة</div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {loading ? '...' : `${dashboardStats.averageProgress}%`}
                </div>
                <div className="text-gray-600">متوسط التقدم</div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <div className="text-3xl font-bold text-yellow-600 mb-2">
                  {loading ? '...' : Math.round(dashboardStats.totalWatchTime / 60)}
                </div>
                <div className="text-gray-600">ساعات التدريب</div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {loading ? '...' : dashboardStats.completedCourses}
                </div>
                <div className="text-gray-600">دورات مكتملة</div>
              </div>
            </div>
        </section>

        {/* Dashboard Content */}
        <section className="py-16">
          <Container>
            {/* Tabs Navigation */}
            <div className="flex flex-wrap gap-4 mb-8 border-b border-gray-200">
              <button
                onClick={() => setActiveTab('courses')}
                className={`pb-4 px-2 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'courses'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                دوراتي
              </button>
              <button
                onClick={() => setActiveTab('progress')}
                className={`pb-4 px-2 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'progress'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                التقدم
              </button>
              <button
                onClick={() => setActiveTab('certificates')}
                className={`pb-4 px-2 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'certificates'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                الشهادات
              </button>
            </div>

            {/* Courses Tab */}
            {activeTab === 'courses' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">دوراتي التدريبية</h2>
                  <Link
                    href="/courses"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    تصفح المزيد من الدورات
                  </Link>
                </div>

                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">جاري تحميل دوراتك...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-12">
                    <div className="text-red-400 text-6xl mb-4">⚠️</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">حدث خطأ في تحميل البيانات</h3>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                      onClick={fetchDashboardData}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                    >
                      إعادة المحاولة
                    </button>
                  </div>
                ) : enrolledCourses.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">📚</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">لم تسجل في أي دورة بعد</h3>
                    <p className="text-gray-600 mb-6">ابدأ رحلتك التدريبية اليوم واختر من مجموعة واسعة من الدورات</p>
                    <Link
                      href="/courses"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                    >
                      تصفح الدورات
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {enrolledCourses.map((course) => {
                      const progress = getProgressData(course._id);
                      return (
                        <div key={course._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                          <div className="relative">
                            {course.thumbnail ? (
                              <img 
                                src={course.thumbnail} 
                                alt={course.title}
                                className="h-48 w-full object-cover"
                              />
                            ) : (
                              <div className="h-48 bg-gradient-to-br from-blue-400 to-green-400 flex items-center justify-center">
                                <div className="text-white text-6xl font-bold opacity-20">
                                  {course.title.charAt(0)}
                                </div>
                              </div>
                            )}
                            <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                              {formatDuration(course.duration)}
                            </div>
                            <div className="absolute top-4 right-4 bg-green-500 text-white px-2 py-1 rounded text-sm font-medium">
                              مسجل
                            </div>
                          </div>
                          
                          <div className="p-6">
                            <div className="flex items-center justify-between mb-2">
                              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                                {course.category}
                              </span>
                              <span className="text-sm text-gray-500">
                                {course.level === 'beginner' ? 'مبتدئ' : 
                                 course.level === 'intermediate' ? 'متوسط' : 'متقدم'}
                              </span>
                            </div>
                            
                            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                              {course.title}
                            </h3>
                            
                            {/* Progress Bar */}
                            <div className="mb-4">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-gray-600">التقدم</span>
                                <span className="text-sm font-medium text-gray-900">{progress}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${progress}%` }}
                                ></div>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="text-sm text-gray-600">
                                {course.lessons?.length || 0} درس
                              </div>
                              <Link
                                href={`/courses/${course._id}`}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                              >
                                {progress > 0 ? 'متابعة التعلم' : 'بدء التعلم'}
                              </Link>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Progress Tab */}
            {activeTab === 'progress' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">تقدمي في التعلم</h2>
                <div className="space-y-6">
                  {enrolledCourses.map((course) => {
                    const progress = getProgressData(course._id);
                    return (
                      <div key={course._id} className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{course.title}</h3>
                            <p className="text-gray-600">{course.category}</p>
                          </div>
                          <div className="text-left">
                            <div className="text-2xl font-bold text-blue-600">{progress}%</div>
                            <div className="text-sm text-gray-500">مكتمل</div>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                          <div 
                            className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>{Math.round((course.lessons?.length || 0) * progress / 100)} من {course.lessons?.length || 0} دروس</span>
                          <span>{Math.round(course.duration * progress / 100)} من {course.duration} دقيقة</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Certificates Tab */}
            {activeTab === 'certificates' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">شهاداتي</h2>
                  <div className="text-sm text-gray-500">
                    شهادات معتمدة لإتمام الدورات التدريبية
                  </div>
                </div>
                <UserCertificates />
              </div>
            )}
          </Container>
        </section>
      </Layout>
    </RequireAuth>
  );
};

export default DashboardPage;