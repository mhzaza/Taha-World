'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { isUserAdmin } from '@/lib/admin';
import { ShieldExclamationIcon } from '@heroicons/react/24/outline';

interface AdminGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function AdminGuard({ children, fallback }: AdminGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);
  const [debugInfo, setDebugInfo] = useState<string>('');

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (loading) return;
      
      if (!user) {
        console.log('AdminGuard: No user found, redirecting to login');
        router.push('/admin/login');
        return;
      }

      console.log('AdminGuard: Checking admin status for user:', user.email);
      setDebugInfo(`فحص صلاحيات المستخدم: ${user.email}`);

      try {
        const adminStatus = await isUserAdmin(user);
        console.log('AdminGuard: Admin status result:', adminStatus);
        setIsAdmin(adminStatus);
        setDebugInfo(`نتيجة الفحص: ${adminStatus ? 'مدير' : 'ليس مدير'}`);
        
        if (!adminStatus) {
          router.push('/admin/login'); // Redirect to admin login page
        }
      } catch (error) {
        console.error('AdminGuard: Error checking admin status:', error);
        setIsAdmin(false);
        setDebugInfo(`خطأ في الفحص: ${error}`);
        router.push('/admin/login');
      } finally {
        setChecking(false);
      }
    };

    checkAdminStatus();
  }, [user, loading, router]);

  // Show loading while checking authentication and admin status
  if (loading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحقق من الصلاحيات...</p>
          {debugInfo && <p className="mt-2 text-sm text-gray-500">{debugInfo}</p>}
        </div>
      </div>
    );
  }

  // Show fallback or 403 message if not admin
  if (isAdmin === false) {
    if (fallback) {
      return <>{fallback}</>;
    }
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-8">
          <ShieldExclamationIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">غير مصرح بالوصول</h1>
          <p className="text-gray-600 mb-6">
            ليس لديك صلاحية للوصول إلى لوحة الإدارة. يرجى التواصل مع المسؤول.
          </p>
          <p className="text-sm text-gray-500 mb-4">{debugInfo}</p>
          <div className="space-y-3">
            <button
              onClick={() => router.push('/admin/debug')}
              className="bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700 transition-colors mr-3"
            >
              صفحة التشخيص
            </button>
            <button
              onClick={() => router.push('/admin/login')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors mr-3"
            >
              تسجيل دخول المدير
            </button>
            <button
              onClick={() => router.push('/')}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              العودة للصفحة الرئيسية
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render children if user is admin
  return <>{children}</>;
}

/**
 * Hook to check if current user is admin
 */
export function useAdminCheck() {
  const { user, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (loading) return;
      
      if (!user) {
        setIsAdmin(false);
        setChecking(false);
        return;
      }

      try {
        const adminStatus = await isUserAdmin(user);
        setIsAdmin(adminStatus);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setChecking(false);
      }
    };

    checkAdminStatus();
  }, [user, loading]);

  return { isAdmin, checking, user };
}