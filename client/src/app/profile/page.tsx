'use client';

import { useState } from 'react';
import { Layout, Container } from '@/components/layout';
import RequireAuth from '@/components/auth/RequireAuth';
import { useAuth } from '@/contexts/AuthContext';
import {
  UserIcon,
  KeyIcon,
  CreditCardIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const ProfilePage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'subscriptions'>('profile');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    displayName: user?.displayName || '',
    email: user?.email || '',
    phone: '',
    bio: '',
    location: '',
    birthDate: ''
  });
  
  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Mock subscription data
  const subscriptions = [
    {
      id: '1',
      courseName: 'كورس مصارعة الذراعين المتقدم',
      status: 'active',
      startDate: '2024-01-15',
      endDate: '2024-07-15',
      price: 299,
      progress: 75
    },
    {
      id: '2',
      courseName: 'تدريب القوة الأساسي',
      status: 'active',
      startDate: '2024-01-10',
      endDate: '2024-06-10',
      price: 199,
      progress: 45
    },
    {
      id: '3',
      courseName: 'فنون القتال المختلطة',
      status: 'completed',
      startDate: '2023-10-01',
      endDate: '2024-01-01',
      price: 249,
      progress: 100
    }
  ];
  
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle profile update
    console.log('Profile update:', profileForm);
    // Add success message or API call here
  };
  
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle password change
    console.log('Password change:', passwordForm);
    // Add validation and API call here
  };
  
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
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <UserIcon className="w-5 h-5 inline ml-2" />
                      تعديل الملف الشخصي
                    </button>
                    <button
                      onClick={() => setActiveTab('password')}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'password'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <KeyIcon className="w-5 h-5 inline ml-2" />
                      تغيير كلمة المرور
                    </button>
                    <button
                      onClick={() => setActiveTab('subscriptions')}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'subscriptions'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
                    <form onSubmit={handleProfileSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            الاسم الكامل
                          </label>
                          <input
                            type="text"
                            value={profileForm.displayName}
                            onChange={(e) => setProfileForm({ ...profileForm, displayName: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="أدخل اسمك الكامل"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            البريد الإلكتروني
                          </label>
                          <input
                            type="email"
                            value={profileForm.email}
                            onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                            placeholder="your@email.com"
                            disabled
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            رقم الهاتف
                          </label>
                          <input
                            type="tel"
                            value={profileForm.phone}
                            onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="+966 50 123 4567"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            تاريخ الميلاد
                          </label>
                          <input
                            type="date"
                            value={profileForm.birthDate}
                            onChange={(e) => setProfileForm({ ...profileForm, birthDate: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            الموقع
                          </label>
                          <input
                            type="text"
                            value={profileForm.location}
                            onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="المدينة، البلد"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          نبذة شخصية
                        </label>
                        <textarea
                          value={profileForm.bio}
                          onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="اكتب نبذة مختصرة عن نفسك..."
                        />
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          حفظ التغييرات
                        </button>
                      </div>
                    </form>
                  </div>
                )}
                
                {/* Password Tab */}
                {activeTab === 'password' && (
                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">تغيير كلمة المرور</h2>
                    <form onSubmit={handlePasswordSubmit} className="space-y-6 max-w-md">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          كلمة المرور الحالية
                        </label>
                        <div className="relative">
                          <input
                            type={showCurrentPassword ? 'text' : 'password'}
                            value={passwordForm.currentPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pl-10"
                            placeholder="أدخل كلمة المرور الحالية"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showCurrentPassword ? (
                              <EyeSlashIcon className="w-5 h-5" />
                            ) : (
                              <EyeIcon className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          كلمة المرور الجديدة
                        </label>
                        <div className="relative">
                          <input
                            type={showNewPassword ? 'text' : 'password'}
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pl-10"
                            placeholder="أدخل كلمة المرور الجديدة"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showNewPassword ? (
                              <EyeSlashIcon className="w-5 h-5" />
                            ) : (
                              <EyeIcon className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          تأكيد كلمة المرور الجديدة
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={passwordForm.confirmPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pl-10"
                            placeholder="أعد إدخال كلمة المرور الجديدة"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showConfirmPassword ? (
                              <EyeSlashIcon className="w-5 h-5" />
                            ) : (
                              <EyeIcon className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-yellow-800 mb-2">متطلبات كلمة المرور:</h4>
                        <ul className="text-sm text-yellow-700 space-y-1">
                          <li>• يجب أن تحتوي على 8 أحرف على الأقل</li>
                          <li>• يجب أن تحتوي على حرف كبير وحرف صغير</li>
                          <li>• يجب أن تحتوي على رقم واحد على الأقل</li>
                          <li>• يجب أن تحتوي على رمز خاص واحد على الأقل</li>
                        </ul>
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          تغيير كلمة المرور
                        </button>
                      </div>
                    </form>
                  </div>
                )}
                
                {/* Subscriptions Tab */}
                {activeTab === 'subscriptions' && (
                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">إدارة الاشتراكات</h2>
                    <div className="space-y-6">
                      {subscriptions.map((subscription) => (
                        <div key={subscription.id} className="border border-gray-200 rounded-lg p-6">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-medium text-gray-900">
                                  {subscription.courseName}
                                </h3>
                                {getStatusBadge(subscription.status)}
                              </div>
                              <div className="text-sm text-gray-600 space-y-1">
                                <p>تاريخ البداية: {new Date(subscription.startDate).toLocaleDateString('ar-SA')}</p>
                                <p>تاريخ الانتهاء: {new Date(subscription.endDate).toLocaleDateString('ar-SA')}</p>
                                <p>السعر: {subscription.price} ريال</p>
                              </div>
                              {subscription.status === 'active' && (
                                <div className="mt-3">
                                  <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                                    <span>التقدم</span>
                                    <span>{subscription.progress}%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                      style={{ width: `${subscription.progress}%` }}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="mt-4 md:mt-0 md:mr-6">
                              {subscription.status === 'active' && (
                                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                                  متابعة التعلم
                                </button>
                              )}
                              {subscription.status === 'completed' && (
                                <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                                  تحميل الشهادة
                                </button>
                              )}
                              {subscription.status === 'expired' && (
                                <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
                                  تجديد الاشتراك
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {subscriptions.length === 0 && (
                        <div className="text-center py-12">
                          <CreditCardIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد اشتراكات</h3>
                          <p className="text-gray-600 mb-6">لم تقم بالاشتراك في أي دورة تدريبية بعد</p>
                          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                            تصفح الدورات
                          </button>
                        </div>
                      )}
                    </div>
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