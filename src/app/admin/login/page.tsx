'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { ShieldCheckIcon, UserPlusIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('admin@tahasabag.com');
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
      // إنشاء حساب المدير
      const { user } = await createUserWithEmailAndPassword(auth!, email, password);
      
      // إضافة بيانات المدير إلى Firestore
      await setDoc(doc(db!, 'users', user.uid), {
        uid: user.uid,
        email: email,
        displayName: 'مدير النظام',
        isAdmin: true,
        role: 'super_admin',
        createdAt: new Date(),
        permissions: [
          'courses.create',
          'courses.edit', 
          'courses.delete',
          'users.manage',
          'orders.view',
          'analytics.view'
        ]
      });

      setSuccess('تم إنشاء حساب المدير بنجاح! يمكنك الآن تسجيل الدخول.');
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        setError('الحساب موجود بالفعل. جرب تسجيل الدخول.');
      } else {
        setError('خطأ في إنشاء الحساب: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <ShieldCheckIcon className="mx-auto h-12 w-12 text-blue-600 mb-4" />
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="admin123456"
              />
            </div>

            <div className="space-y-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
                className="w-full flex justify-center items-center py-3 px-4 border border-blue-600 rounded-lg shadow-sm text-sm font-medium text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
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