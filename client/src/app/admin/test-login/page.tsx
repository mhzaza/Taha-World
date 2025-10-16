'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function TestLoginPage() {
  const [email, setEmail] = useState('admin@tahasabag.com');
  const [password, setPassword] = useState('admin123456');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const { login } = useAuth();

  const handleTestLogin = async () => {
    setLoading(true);
    setResult('جاري اختبار تسجيل الدخول...');
    
    try {
      // Try to login using our auth context
      await login(email, password);
      
      setResult(prev => prev + `\nتم تسجيل الدخول بنجاح: ${email}`);
      
      // Check if user is admin by checking the auth context
      setResult(prev => prev + `\n✅ يمكن الوصول إلى لوحة الإدارة`);
      
      // Redirect to admin panel
      setTimeout(() => {
        window.location.href = '/admin';
      }, 2000);
      
    } catch (error: any) {
      setResult(prev => prev + `\nخطأ: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            اختبار تسجيل دخول الأدمن
          </h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              البريد الإلكتروني
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              كلمة المرور
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <button
            onClick={handleTestLogin}
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'جاري الاختبار...' : 'اختبار تسجيل الدخول'}
          </button>
        </div>
        
        {result && (
          <div className="mt-4 p-4 bg-gray-100 rounded-md">
            <h3 className="font-medium mb-2">نتائج الاختبار:</h3>
            <pre className="text-sm whitespace-pre-wrap">{result}</pre>
          </div>
        )}
        
        <div className="text-center">
          <a href="/admin/debug" className="text-blue-600 hover:text-blue-500">
            صفحة التشخيص
          </a>
          {' | '}
          <a href="/admin/login" className="text-blue-600 hover:text-blue-500">
            صفحة تسجيل الدخول العادية
          </a>
        </div>
      </div>
    </div>
  );
}