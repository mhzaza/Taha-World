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
  const { user, loading, hasToken } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If we have tokens, redirect immediately even if we're still loading user data
    // This prevents showing login form to users who are already authenticated
    if (hasToken()) {
      router.push(redirectTo);
    } else if (!loading && user) {
      // Fallback: redirect if user data is loaded and user exists
      router.push(redirectTo);
    }
  }, [user, loading, hasToken, router, redirectTo]);

  // Show loading spinner while checking authentication or if user has tokens
  if (loading || hasToken()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {hasToken() ? 'جاري التحقق من الهوية...' : 'جاري التحميل...'}
          </p>
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
