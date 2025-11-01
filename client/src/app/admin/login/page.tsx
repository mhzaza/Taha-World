'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ShieldCheckIcon, UserPlusIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('admin@taha-world.com');
  const [password, setPassword] = useState('admin123456');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await login(email, password);
      setSuccess('تم تسجيل الدخول بنجاح!');
      setTimeout(() => {
        router.push('/admin');
      }, 1000);
    } catch (error: any) {
      setError('خطأ في تسجيل الدخول: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const createAdminAccount = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Create admin account using our backend API
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          displayName: 'مدير النظام',
          isAdmin: true,
          adminRole: 'super_admin',
          permissions: [
            'courses.create',
            'courses.edit', 
            'courses.delete',
            'users.manage',
            'orders.view',
            'analytics.view'
          ]
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSuccess('تم إنشاء حساب المدير بنجاح! يمكنك الآن تسجيل الدخول.');
        } else {
          setError(data.arabic || data.error || 'خطأ في إنشاء الحساب');
        }
      } else {
        const errorData = await response.json();
        if (errorData.error?.includes('already exists') || errorData.arabic?.includes('موجود')) {
          setError('الحساب موجود بالفعل. جرب تسجيل الدخول.');
        } else {
          setError(errorData.arabic || errorData.error || 'خطأ في إنشاء الحساب');
        }
      }
    } catch (error: any) {
      setError('خطأ في إنشاء الحساب: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#41ADE1] to-[#3399CC] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <ShieldCheckIcon className="mx-auto h-12 w-12 text-[#41ADE1] mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              لوحة إدارة المدرب طه صباغ
            </h2>
            <p className="text-gray-600">
              تسجيل دخول المدير
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
              {success}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                البريد الإلكتروني
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#41ADE1] focus:border-transparent"
                placeholder="admin@tahasabag.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                كلمة المرور
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#41ADE1] focus:border-transparent"
                placeholder="admin123456"
              />
            </div>

            <div className="space-y-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#41ADE1] hover:bg-[#3399CC] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#41ADE1] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <ArrowRightOnRectangleIcon className="h-5 w-5 ml-2" />
                    تسجيل الدخول
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={createAdminAccount}
                disabled={loading}
                className="w-full flex justify-center items-center py-3 px-4 border border-[#41ADE1] rounded-lg shadow-sm text-sm font-medium text-[#41ADE1] bg-white hover:bg-[#41ADE1]/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#41ADE1] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#41ADE1]"></div>
                ) : (
                  <>
                    <UserPlusIcon className="h-5 w-5 ml-2" />
                    إنشاء حساب مدير جديد
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-2">بيانات تجريبية:</h3>
            <p className="text-xs text-gray-600">البريد: admin@tahasabag.com</p>
            <p className="text-xs text-gray-600">كلمة المرور: admin123456</p>
            <p className="text-xs text-gray-500 mt-2">
              إذا لم يكن الحساب موجوداً، اضغط على "إنشاء حساب مدير جديد" أولاً
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}