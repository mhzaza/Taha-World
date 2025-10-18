'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface RedirectIfAuthenticatedProps {
  children: React.ReactNode;
  redirectTo?: string;
}

const RedirectIfAuthenticated: React.FC<RedirectIfAuthenticatedProps> = ({ 
  children, 
  redirectTo = '/dashboard' 
}) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push(redirectTo);
    }
  }, [user, loading, router, redirectTo]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحقق من الهوية...</p>
        </div>
      </div>
    );
  }

  // Show nothing while redirecting authenticated user
  if (user) {
    return null;
  }

  // User is not authenticated, render children (auth forms)
  return <>{children}</>;
};

export default RedirectIfAuthenticated;
