'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { 
  UserIcon, 
  CalendarIcon, 
  CreditCardIcon, 
  AcademicCapIcon,
  CogIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

interface ProfileLayoutProps {
  children: ReactNode;
}

export default function ProfileLayout({ children }: ProfileLayoutProps) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/profile');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const menuItems = [
    { 
      name: 'الملف الشخصي', 
      href: '/profile', 
      icon: UserIcon 
    },
    { 
      name: 'حجوزاتي', 
      href: '/profile/bookings', 
      icon: CalendarIcon 
    },
    { 
      name: 'دوراتي', 
      href: '/profile/courses', 
      icon: AcademicCapIcon 
    },
    { 
      name: 'المدفوعات', 
      href: '/profile/payments', 
      icon: CreditCardIcon 
    },
    { 
      name: 'الإعدادات', 
      href: '/profile/settings', 
      icon: CogIcon 
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-1/4">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center mb-6">
              <div className="w-20 h-20 rounded-full bg-gray-200 mx-auto mb-4 flex items-center justify-center">
                {user.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt={user.displayName || 'صورة المستخدم'} 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <UserIcon className="h-10 w-10 text-gray-500" />
                )}
              </div>
              <h2 className="text-xl font-bold">{user.displayName || 'المستخدم'}</h2>
              <p className="text-gray-600 text-sm">{user.email}</p>
            </div>
            
            <nav className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link 
                    key={item.href} 
                    href={item.href}
                    className="flex items-center p-3 rounded-md hover:bg-gray-100 transition duration-300"
                  >
                    <Icon className="h-5 w-5 ml-3 text-gray-600" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              
              <button 
                onClick={handleLogout}
                className="w-full flex items-center p-3 rounded-md hover:bg-gray-100 transition duration-300 text-red-600"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5 ml-3" />
                <span>تسجيل الخروج</span>
              </button>
            </nav>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="w-full md:w-3/4">
          {children}
        </div>
      </div>
    </div>
  );
}