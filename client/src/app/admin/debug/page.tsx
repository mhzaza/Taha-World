'use client';

import { useAuth } from '@/contexts/AuthContext';
import { isUserAdmin, isAdminEmail } from '@/lib/admin';
import { useState, useEffect } from 'react';

export default function AdminDebugPage() {
  const { user, loading } = useAuth();
  const [adminStatus, setAdminStatus] = useState<boolean | null>(null);
  const [emailCheck, setEmailCheck] = useState<boolean>(false);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) return;
      
      setChecking(true);
      try {
        const isAdmin = await isUserAdmin(user);
        const emailAdmin = isAdminEmail(user.email);
        
        setAdminStatus(isAdmin);
        setEmailCheck(emailAdmin);
      } catch (error) {
        console.error('Error checking admin:', error);
      } finally {
        setChecking(false);
      }
    };

    checkAdmin();
  }, [user]);

  if (loading) {
    return <div className="p-8">جاري التحميل...</div>;
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">صفحة تشخيص صلاحيات الأدمن</h1>
      
      <div className="space-y-4">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold mb-2">حالة المستخدم:</h2>
          <p>مسجل دخول: {user ? 'نعم' : 'لا'}</p>
          {user && (
            <>
              <p>البريد الإلكتروني: {user.email}</p>
              <p>ID: {user._id}</p>
              <p>اسم العرض: {user.displayName || 'غير محدد'}</p>
            </>
          )}
        </div>

        <div className="bg-blue-100 p-4 rounded">
          <h2 className="font-semibold mb-2">فحص صلاحيات الأدمن:</h2>
          <p>جاري الفحص: {checking ? 'نعم' : 'لا'}</p>
          <p>فحص البريد الإلكتروني: {emailCheck ? 'مدير' : 'ليس مدير'}</p>
          <p>فحص قاعدة البيانات: {adminStatus === null ? 'لم يتم الفحص' : adminStatus ? 'مدير' : 'ليس مدير'}</p>
        </div>

        <div className="bg-yellow-100 p-4 rounded">
          <h2 className="font-semibold mb-2">متغيرات البيئة:</h2>
          <p>ADMIN_EMAILS: {process.env.ADMIN_EMAILS || 'غير محدد'}</p>
          <p>NEXT_PUBLIC_ADMIN_EMAILS: {process.env.NEXT_PUBLIC_ADMIN_EMAILS || 'غير محدد'}</p>
          <p className="text-sm text-gray-600 mt-2">ملاحظة: في البيئة العميل، فقط متغيرات NEXT_PUBLIC_ متاحة</p>
        </div>

        <div className="bg-green-100 p-4 rounded">
          <h2 className="font-semibold mb-2">الإجراءات:</h2>
          <button 
            onClick={() => window.location.href = '/admin/login'}
            className="bg-blue-600 text-white px-4 py-2 rounded mr-2"
          >
            صفحة تسجيل دخول الأدمن
          </button>
          <button 
            onClick={() => window.location.href = '/admin'}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            لوحة الإدارة
          </button>
        </div>
      </div>
    </div>
  );
}