'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface RequireAuthProps {
  children: React.ReactNode;
  redirectTo?: string;
}

const RequireAuth: React.FC<RequireAuthProps> = ({ 
  children, 
  redirectTo = '/auth/login' 
}) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push(redirectTo);
    }
  }, [user, loading, router, redirectTo]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#41ADE1] mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحقق من الهوية...</p>
        </div>
      </div>
    );
  }

  // Show nothing while redirecting
  if (!user) {
    return null;
  }

  // User is authenticated, render children
  return <>{children}</>;
};

export default RequireAuth;