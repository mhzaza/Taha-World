'use client';

import { useState, useEffect } from 'react';
import { Layout, Container } from '@/components/layout';
import RequireAuth from '@/components/auth/RequireAuth';
import { useAuth } from '@/contexts/AuthContext';
import { userAPI, Course, User } from '@/lib/api';
import {
  UserIcon,
  CreditCardIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const ProfilePage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'subscriptions'>('profile');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    displayName: user?.displayName || '',
    email: user?.email || '',
    phone: '',
    bio: '',
    location: '',
    birthDate: '',
    gender: '',
    fitnessLevel: '',
    goals: [] as string[]
  });

  // Load user profile data
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user) return;
      
      try {
        console.log('Loading user profile for user:', user);
        const response = await userAPI.getProfile();
        console.log('Profile API response:', response.data);
        
        if (response.data.success && 'user' in response.data) {
          const userData = (response.data as { success: boolean; user: User }).user;
          console.log('User data from API:', userData);
          setProfileForm({
            displayName: userData.displayName || user.displayName || '',
            email: userData.email || user.email || '',
            phone: userData.phone || '',
            bio: userData.bio || '',
            location: userData.location || '',
            birthDate: userData.birthDate || '',
            gender: userData.gender || '',
            fitnessLevel: userData.fitnessLevel || '',
            goals: userData.goals || []
          });
        } else {
          console.log('Profile API response not successful or missing user data');
          // Use fallback data from auth context
          setProfileForm({
            displayName: user.displayName || '',
            email: user.email || '',
            phone: user.phone || '',
            bio: user.bio || '',
            location: user.location || '',
            birthDate: user.birthDate || '',
            gender: user.gender || '',
            fitnessLevel: user.fitnessLevel || '',
            goals: user.goals || []
          });
        }
      } catch (err) {
        console.error('Error loading user profile:', err);
        // Use fallback data from auth context
        setProfileForm({
          displayName: user.displayName || '',
          email: user.email || '',
          phone: user.phone || '',
          bio: user.bio || '',
          location: user.location || '',
          birthDate: user.birthDate || '',
          gender: user.gender || '',
          fitnessLevel: user.fitnessLevel || '',
          goals: user.goals || []
        });
      }
    };

    loadUserProfile();
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError(null);

    try {
      if (!user) throw new Error('يجب تسجيل الدخول لتحديث الملف الشخصي');

      // Client-side validation
      if (!profileForm.displayName.trim()) {
        setError('الاسم مطلوب');
        setLoading(false);
        return;
      }

      if (profileForm.displayName.trim().length < 2) {
        setError('الاسم يجب أن يكون على الأقل حرفين');
        setLoading(false);
        return;
      }

      if (profileForm.bio.trim().length > 500) {
        setError('النبذة الشخصية يجب أن تكون أقل من 500 حرف');
        setLoading(false);
        return;
      }

      // Prepare data for API call - only send non-empty values
      const updateData: {
        displayName?: string;
        phone?: string;
        location?: string;
        birthDate?: string;
        bio?: string;
        gender?: string;
        fitnessLevel?: string;
        goals?: string[];
      } = {};
      
      updateData.displayName = profileForm.displayName.trim();
      if (profileForm.phone.trim()) updateData.phone = profileForm.phone.trim();
      if (profileForm.location.trim()) updateData.location = profileForm.location.trim();
      if (profileForm.bio.trim()) updateData.bio = profileForm.bio.trim();
      if (profileForm.gender) updateData.gender = profileForm.gender;
      if (profileForm.fitnessLevel) updateData.fitnessLevel = profileForm.fitnessLevel;
      if (profileForm.goals.length > 0) updateData.goals = profileForm.goals;
      
      // Only send birthDate if it's not empty
      if (profileForm.birthDate) {
        updateData.birthDate = profileForm.birthDate;
      }

      console.log('Sending profile update data:', updateData);

      // Update profile via API
      const response = await userAPI.updateProfile(updateData);

      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        throw new Error(response.data.error || 'فشل في تحديث الملف الشخصي');
      }
    } catch (err: unknown) {
      console.error('Error updating profile:', err);
      
      // Handle specific error messages
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response: { data: { details?: Array<{ msg: string }>, error?: string, arabic?: string } } };
        
        if (axiosError.response?.data?.details) {
          // Handle validation errors from backend
          const validationErrors = axiosError.response.data.details.map((error) => error.msg).join(', ');
          setError(`خطأ في التحقق من البيانات: ${validationErrors}`);
        } else if (axiosError.response?.data?.error) {
          setError(axiosError.response.data.error);
        } else if (axiosError.response?.data?.arabic) {
          setError(axiosError.response.data.arabic);
        } else {
          setError('حدث خطأ أثناء تحديث الملف الشخصي');
        }
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('حدث خطأ أثناء تحديث الملف الشخصي');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Dynamic subscription data
  interface Subscription {
    id: string;
    courseName: string;
    status: 'active' | 'completed' | 'expired';
    startDate: string;
    endDate: string;
    price: number;
    progress: number;
    duration?: number;
    level?: string;
    thumbnail?: string;
  }

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [subscriptionsLoading, setSubscriptionsLoading] = useState(false);
  const [subscriptionsError, setSubscriptionsError] = useState<string | null>(null);

  // Load user subscriptions
  useEffect(() => {
    const loadSubscriptions = async () => {
      if (!user || activeTab !== 'subscriptions') return;
      
      try {
        setSubscriptionsLoading(true);
        setSubscriptionsError(null);
        
        // Fetch user courses (enrollments) from real API
        const response = await userAPI.getCourses();
        console.log('getCourses API response:', response.data);
        
        if (response.data.success) {
          const courses = response.data.courses || [];
          console.log('Courses from API:', courses);
          
          // Transform courses to subscription format
          const subscriptionsData = courses.map((course: Course & { progress?: { completedLessons?: number; totalLessons?: number } }) => {
            // Calculate progress percentage from the progress data
            const progressPercentage = course.progress ? 
              Math.round((course.progress.completedLessons || 0) / (course.progress.totalLessons || 1) * 100) : 0;
            
            // Determine status based on progress
            const status = progressPercentage === 100 ? 'completed' : 'active';
            
            // Map level to Arabic
            const levelMap: { [key: string]: string } = {
              'beginner': 'مبتدئ',
              'intermediate': 'متوسط', 
              'advanced': 'متقدم'
            };

            return {
              id: course._id,
              courseName: course.title,
              status: status as 'active' | 'completed' | 'expired',
              startDate: course.createdAt || new Date().toISOString(), // Use course creation date as enrollment date
              endDate: new Date(new Date(course.createdAt || new Date()).getTime() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year from creation
              price: course.price || 0,
              progress: progressPercentage,
              duration: course.duration || 0,
              level: levelMap[course.level] || 'مبتدئ',
              thumbnail: course.thumbnail || '/api/placeholder/400/200'
            };
          });
          
          console.log('Transformed subscriptions data:', subscriptionsData);
          setSubscriptions(subscriptionsData);
        } else {
          throw new Error('فشل في تحميل الاشتراكات');
        }
      } catch (err: unknown) {
        console.error('Error loading subscriptions:', err);
        setSubscriptionsError('حدث خطأ أثناء تحميل الاشتراكات');
        
        // Fallback to mock data if API fails
        setSubscriptions([
    {
      id: '1',
      courseName: 'كورس مصارعة الذراعين المتقدم',
      status: 'active',
            startDate: '2024-01-15T10:30:00Z',
            endDate: '2025-01-15',
      price: 299,
            progress: 75,
            duration: 8,
            level: 'متقدم',
            thumbnail: '/api/placeholder/400/200'
    },
    {
      id: '2',
      courseName: 'تدريب القوة الأساسي',
      status: 'active',
            startDate: '2024-01-10T14:20:00Z',
            endDate: '2025-01-10',
      price: 199,
            progress: 45,
            duration: 6,
            level: 'مبتدئ',
            thumbnail: '/api/placeholder/400/200'
          }
        ]);
      } finally {
        setSubscriptionsLoading(false);
      }
    };

    loadSubscriptions();
  }, [user, activeTab]);
  
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircleIcon className="w-3 h-3 ml-1" />
            نشط
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <CheckCircleIcon className="w-3 h-3 ml-1" />
            مكتمل
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircleIcon className="w-3 h-3 ml-1" />
            منتهي الصلاحية
          </span>
        );
      default:
        return null;
    }
  };
  
  return (
    <RequireAuth>
      <Layout>
        <section className="py-16 bg-gray-50 min-h-screen">
          <Container>
            <div className="max-w-4xl mx-auto">
              {/* Page Header */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">الملف الشخصي</h1>
                <p className="text-gray-600">إدارة معلوماتك الشخصية وإعدادات الحساب</p>
              </div>
              
              {/* Tabs Navigation */}
              <div className="bg-white rounded-lg shadow-sm mb-6">
                <div className="border-b border-gray-200">
                  <nav className="flex space-x-8 space-x-reverse px-6">
                    <button
                      onClick={() => setActiveTab('profile')}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'profile'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <UserIcon className="w-5 h-5 inline ml-2" />
                      تعديل الملف الشخصي
                    </button>
                    <button
                      onClick={() => setActiveTab('subscriptions')}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'subscriptions'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <CreditCardIcon className="w-5 h-5 inline ml-2" />
                      إدارة الاشتراكات
                    </button>
                  </nav>
                </div>
              </div>
              
              {/* Tab Content */}
              <div className="bg-white rounded-lg shadow-sm">
                {/* Profile Tab */}
                {activeTab === 'profile' && (
                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">تعديل الملف الشخصي</h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">
                            الاسم الكامل <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="displayName"
                            value={profileForm.displayName}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="أدخل اسمك الكامل"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">
                            البريد الإلكتروني
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={profileForm.email}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                            placeholder="your@email.com"
                            disabled
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">
                            رقم الهاتف
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            value={profileForm.phone}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="+966 50 123 4567"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">
                            تاريخ الميلاد
                          </label>
                          <input
                            type="date"
                            name="birthDate"
                            value={profileForm.birthDate}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">
                            الموقع
                          </label>
                          <input
                            type="text"
                            name="location"
                            value={profileForm.location}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="المدينة، البلد"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">
                            الجنس
                          </label>
                          <select
                            name="gender"
                            value={profileForm.gender}
                            onChange={handleSelectChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="">اختر الجنس</option>
                            <option value="male">ذكر</option>
                            <option value="female">أنثى</option>
                            <option value="other">آخر</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">
                            مستوى اللياقة البدنية
                          </label>
                          <select
                            name="fitnessLevel"
                            value={profileForm.fitnessLevel}
                            onChange={handleSelectChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="">اختر مستوى اللياقة</option>
                            <option value="beginner">مبتدئ</option>
                            <option value="intermediate">متوسط</option>
                            <option value="advanced">متقدم</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">
                          نبذة شخصية
                        </label>
                        <textarea
                          name="bio"
                          value={profileForm.bio}
                          onChange={handleInputChange}
                          rows={4}
                          maxLength={500}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="اكتب نبذة مختصرة عن نفسك..."
                        />
                        <div className="flex justify-between text-sm text-gray-500 mt-1">
                          <span>{profileForm.bio.length}/500</span>
                          {profileForm.bio.length > 450 && (
                            <span className="text-yellow-600">اقتربت من الحد الأقصى</span>
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">
                          الأهداف التدريبية
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {['بناء العضلات', 'فقدان الوزن', 'تحسين اللياقة العامة', 'زيادة القوة', 'تحسين المرونة', 'التحضير للمسابقات'].map((goal) => (
                            <label key={goal} className="flex items-center">
                          <input
                                type="checkbox"
                                checked={profileForm.goals.includes(goal)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setProfileForm(prev => ({
                                      ...prev,
                                      goals: [...prev.goals, goal]
                                    }));
                                  } else {
                                    setProfileForm(prev => ({
                                      ...prev,
                                      goals: prev.goals.filter(g => g !== goal)
                                    }));
                                  }
                                }}
                                className="ml-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-200">{goal}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Error Message */}
                      {error && (
                        <div className="bg-red-50 border-l-4 border-red-400 p-4">
                          <div className="flex">
                            <div className="flex-shrink-0">
                              <XCircleIcon className="h-5 w-5 text-red-400" />
                            </div>
                            <div className="mr-3">
                              <p className="text-sm text-red-700">{error}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Success Message */}
                      {success && (
                        <div className="bg-green-50 border-l-4 border-green-400 p-4">
                          <div className="flex">
                            <div className="flex-shrink-0">
                              <CheckCircleIcon className="h-5 w-5 text-green-400" />
                      </div>
                            <div className="mr-3">
                              <p className="text-sm text-green-700">تم تحديث الملف الشخصي بنجاح</p>
                        </div>
                      </div>
                      </div>
                      )}

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={loading}
                          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
                
                {/* Subscriptions Tab */}
                {activeTab === 'subscriptions' && (
                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">إدارة الاشتراكات</h2>
                    
                    {subscriptionsLoading ? (
                      <div className="flex justify-center items-center h-40">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
                      </div>
                    ) : subscriptionsError ? (
                      <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                        <span className="block sm:inline">{subscriptionsError}</span>
                      </div>
                    ) : subscriptions.length === 0 ? (
                      <div className="text-center py-12">
                        <CreditCardIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد اشتراكات</h3>
                        <p className="text-gray-600 mb-6">لم تقم بالاشتراك في أي دورة تدريبية بعد</p>
                        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                          تصفح الدورات
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {subscriptions.map((subscription) => (
                          <div key={subscription.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
                            {/* Course Thumbnail Placeholder */}
                            <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                              <div className="text-center text-white">
                                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-2">
                                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
                                  </svg>
                                </div>
                                <h3 className="text-lg font-semibold">{subscription.courseName}</h3>
                              </div>
                            </div>

                            <div className="p-6">
                              {/* Course Info */}
                              <div className="mb-4">
                                <div className="flex items-center justify-between mb-2">
                                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                                  {subscription.courseName}
                                </h3>
                                {getStatusBadge(subscription.status)}
                              </div>
                              <div className="text-sm text-gray-600 space-y-1">
                                  <p>تاريخ الاشتراك: {new Date(subscription.startDate).toLocaleDateString('ar-EG', { calendar: 'gregory' })}</p>
                                  <p>السعر: ${subscription.price}</p>
                                  <div className="flex items-center gap-4 text-xs">
                                    <span className="flex items-center">
                                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                      {subscription.duration || 4} ساعة
                                    </span>
                                    <span className="flex items-center">
                                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                      </svg>
                                      {subscription.level || 'مبتدئ'}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Progress Section */}
                              <div className="mb-4">
                                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                                    <span>التقدم</span>
                                  <span className="font-medium">{subscription.progress}%</span>
                                  </div>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                  <div
                                    className={`h-3 rounded-full transition-all duration-500 ${
                                      subscription.progress === 100 
                                        ? 'bg-green-500' 
                                        : subscription.progress > 50 
                                        ? 'bg-blue-500' 
                                        : 'bg-yellow-500'
                                    }`}
                                      style={{ width: `${subscription.progress}%` }}
                                    />
                                  </div>
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                  <span>0%</span>
                                  <span>100%</span>
                                </div>
                            </div>

                              {/* Action Buttons */}
                              <div className="flex gap-2">
                              {subscription.status === 'active' && (
                                  <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                                    {subscription.progress === 100 ? 'مراجعة الدورة' : 'متابعة التعلم'}
                                </button>
                              )}
                              {subscription.status === 'completed' && (
                                  <button className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
                                  تحميل الشهادة
                                </button>
                              )}
                              {subscription.status === 'expired' && (
                                  <button className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium">
                                  تجديد الاشتراك
                                </button>
                              )}
                            </div>

                              {/* Additional Info */}
                              <div className="mt-4 pt-4 border-t border-gray-100">
                                <div className="flex items-center justify-between text-xs text-gray-500">
                                  <span>آخر نشاط</span>
                                  <span>{new Date(subscription.startDate).toLocaleDateString('ar-EG', { calendar: 'gregory' })}</span>
                                </div>
                            </div>
                          </div>
                        </div>
                      ))}
                        </div>
                      )}
                  </div>
                )}
              </div>
            </div>
          </Container>
        </section>
      </Layout>
    </RequireAuth>
  );
};

export default ProfilePage;
