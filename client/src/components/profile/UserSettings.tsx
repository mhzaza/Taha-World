'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { userAPI, type User } from '@/lib/api';
import { KeyIcon, EyeIcon, EyeSlashIcon, BellIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

export default function UserSettings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'password' | 'notifications'>('password');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    marketingEmails: false
  });

  // Load user settings on component mount
  useEffect(() => {
    const loadUserSettings = async () => {
      if (!user) return;
      
      try {
        const response = await userAPI.getProfile();
        if (response.data.success) {
          const userData = response.data.user;
          setNotificationSettings({
            emailNotifications: (userData as User & { emailNotifications?: boolean }).emailNotifications ?? true,
            marketingEmails: (userData as User & { marketingEmails?: boolean }).marketingEmails ?? false
          });
        }
      } catch (err) {
        console.error('Error loading user settings:', err);
        // Keep default values
      }
    };

    loadUserSettings();
  }, [user]);

  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setNotificationSettings(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError(null);

    // Validate password
    if (passwordForm.newPassword.length < 8) {
      setError('يجب أن تكون كلمة المرور الجديدة 8 أحرف على الأقل');
      setLoading(false);
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('كلمة المرور الجديدة وتأكيدها غير متطابقين');
      setLoading(false);
      return;
    }

    try {
      if (!user) throw new Error('يجب تسجيل الدخول لتغيير كلمة المرور');

      // Update password via API
      const response = await userAPI.changePassword(
        passwordForm.currentPassword,
        passwordForm.newPassword
      );

      if (response.data.success) {
        // Reset form
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });

        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        throw new Error(response.data.error || 'فشل في تغيير كلمة المرور');
      }
    } catch (err: unknown) {
      console.error('Error updating password:', err);
      
      // Handle specific error messages
      const errorMessage = err instanceof Error ? err.message : '';
      if (errorMessage.includes('current password') || errorMessage.includes('كلمة المرور الحالية')) {
        setError('كلمة المرور الحالية غير صحيحة');
      } else if (errorMessage.includes('too many requests') || errorMessage.includes('كثير من المحاولات')) {
        setError('تم تجاوز عدد المحاولات المسموح بها. يرجى المحاولة لاحقًا');
      } else {
        setError(errorMessage || 'حدث خطأ أثناء تحديث كلمة المرور');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError(null);

    try {
      if (!user) throw new Error('يجب تسجيل الدخول لتحديث الإعدادات');

      // For now, notification settings are handled locally
      // TODO: Implement API endpoint for notification settings if needed
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      console.error('Error updating notification settings:', err);
      const errorMessage = err instanceof Error ? err.message : '';
      setError(errorMessage || 'حدث خطأ أثناء تحديث إعدادات الإشعارات');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b">
        <button
          className={`flex-1 py-4 px-6 text-center ${activeTab === 'password' ? 'border-b-2 border-primary text-primary font-medium' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('password')}
        >
          <KeyIcon className="h-5 w-5 inline-block ml-2" />
          تغيير كلمة المرور
        </button>
        <button
          className={`flex-1 py-4 px-6 text-center ${activeTab === 'notifications' ? 'border-b-2 border-primary text-primary font-medium' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('notifications')}
        >
          <BellIcon className="h-5 w-5 inline-block ml-2" />
          إعدادات الإشعارات
        </button>
      </div>

      <div className="p-6">
        {/* Password Change Form */}
        {activeTab === 'password' && (
          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            {/* Current Password */}
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                كلمة المرور الحالية
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  id="currentPassword"
                  name="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordInputChange}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary text-right"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 left-0 pl-3 flex items-center"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                كلمة المرور الجديدة
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  id="newPassword"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordInputChange}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary text-right"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 left-0 pl-3 flex items-center"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              <p className="mt-1 text-sm text-gray-500">يجب أن تكون كلمة المرور 8 أحرف على الأقل</p>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                تأكيد كلمة المرور الجديدة
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordInputChange}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary text-right"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 left-0 pl-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && activeTab === 'password' && (
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
            {success && activeTab === 'password' && (
              <div className="bg-green-50 border-l-4 border-green-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <CheckCircleIcon className="h-5 w-5 text-green-400" />
                  </div>
                  <div className="mr-3">
                    <p className="text-sm text-green-700">تم تحديث كلمة المرور بنجاح</p>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'جاري الحفظ...' : 'تحديث كلمة المرور'}
              </button>
            </div>
          </form>
        )}

        {/* Notification Settings Form */}
        {activeTab === 'notifications' && (
          <form onSubmit={handleNotificationSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="emailNotifications"
                    name="emailNotifications"
                    type="checkbox"
                    checked={notificationSettings.emailNotifications}
                    onChange={handleNotificationChange}
                    className="focus:ring-primary h-4 w-4 text-primary border-gray-300 rounded"
                  />
                </div>
                <div className="mr-3 text-sm">
                  <label htmlFor="emailNotifications" className="font-medium text-gray-700">
                    إشعارات البريد الإلكتروني
                  </label>
                  <p className="text-gray-500">استلام إشعارات عامة عبر البريد الإلكتروني</p>
                </div>
              </div>



              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="marketingEmails"
                    name="marketingEmails"
                    type="checkbox"
                    checked={notificationSettings.marketingEmails}
                    onChange={handleNotificationChange}
                    className="focus:ring-primary h-4 w-4 text-primary border-gray-300 rounded"
                  />
                </div>
                <div className="mr-3 text-sm">
                  <label htmlFor="marketingEmails" className="font-medium text-gray-700">
                    رسائل تسويقية
                  </label>
                  <p className="text-gray-500">استلام عروض وتحديثات عن الدورات والخدمات الجديدة</p>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && activeTab === 'notifications' && (
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
            {success && activeTab === 'notifications' && (
              <div className="bg-green-50 border-l-4 border-green-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <CheckCircleIcon className="h-5 w-5 text-green-400" />
                  </div>
                  <div className="mr-3">
                    <p className="text-sm text-green-700">تم تحديث إعدادات الإشعارات بنجاح</p>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}