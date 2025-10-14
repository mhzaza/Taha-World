'use client';

import AdminGuard from '@/components/admin/AdminGuard';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  HomeIcon,
  AcademicCapIcon,
  ShoppingCartIcon,
  UsersIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: '\u0644\u0648\u062d\u0629 \u0627\u0644\u062a\u062d\u0643\u0645', href: '/admin', icon: HomeIcon },
  { name: '\u0627\u0644\u062f\u0648\u0631\u0627\u062a', href: '/admin/courses', icon: AcademicCapIcon },
  { name: '\u0627\u0644\u0637\u0644\u0628\u0627\u062a', href: '/admin/orders', icon: ShoppingCartIcon },
  { name: '\u0627\u0644\u0645\u0633\u062a\u062e\u062f\u0645\u0648\u0646', href: '/admin/users', icon: UsersIcon },
  { name: '\u0627\u0644\u062a\u062d\u0644\u064a\u0644\u0627\u062a', href: '/admin/analytics', icon: ChartBarIcon },
  { name: '\u0627\u0644\u0625\u0639\u062f\u0627\u062f\u0627\u062a', href: '/admin/settings', icon: Cog6ToothIcon },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50">
        <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
          <div className="fixed inset-0 bg-gray-600/75" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 right-0 flex w-full max-w-xs flex-col bg-white shadow-xl">
            <div className="flex h-16 items-center justify-between px-4">
              <h2 className="text-lg font-semibold text-gray-900">{'\u0644\u0648\u062d\u0629 \u0627\u0644\u062a\u062d\u0643\u0645'}</h2>
              <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-gray-600">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <nav className="flex-1 space-y-1 px-4 py-4">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group flex items-center rounded-md px-2 py-2 text-sm font-medium ${
                      isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className="ml-3 h-5 w-5 flex-shrink-0" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
            <div className="border-t border-gray-200 p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white">
                    {user?.email?.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="mr-3 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">{user?.email}</p>
                  <p className="text-xs text-gray-500">{'\u0645\u062f\u064a\u0631 \u0627\u0644\u0646\u0638\u0627\u0645'}</p>
                </div>
                <button onClick={handleLogout} className="text-gray-400 hover:text-gray-600">
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="hidden lg:fixed lg:inset-y-0 lg:right-0 lg:z-40 lg:flex lg:w-72 lg:flex-col">
          <div className="flex grow flex-col gap-y-6 overflow-y-auto bg-white px-6 shadow-lg">
            <div className="flex h-16 shrink-0 items-center border-b border-gray-200">
              <h1 className="text-xl font-bold text-gray-900">{'\u0644\u0648\u062d\u0629 \u0627\u0644\u062a\u062d\u0643\u0645'}</h1>
            </div>
            <nav className="flex flex-1 flex-col">
              <ul className="flex flex-1 flex-col gap-y-7">
                <li>
                  <ul className="space-y-1">
                    {navigation.map((item) => {
                      const isActive = pathname === item.href;
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            className={`group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 ${
                              isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50 hover:text-blue-700'
                            }`}
                          >
                            <item.icon className="h-6 w-6 shrink-0" />
                            {item.name}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </li>
                <li className="mt-auto border-t border-gray-200 pt-4">
                  <div className="flex items-center gap-x-4 px-2 py-3 text-sm font-semibold leading-6 text-gray-900">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white">
                      {user?.email?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">{user?.email}</p>
                      <p className="text-xs text-gray-500">{'\u0645\u062f\u064a\u0631 \u0627\u0644\u0646\u0638\u0627\u0645'}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="text-gray-400 hover:text-gray-600"
                      title="تسجيل الخروج"
                    >
                      <ArrowRightOnRectangleIcon className="h-5 w-5" />
                    </button>
                  </div>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        <div className="lg:pr-72">
          <div className="sticky top-0 z-30 flex h-16 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:px-6 lg:px-8">
            <button
              type="button"
              className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Bars3Icon className="h-6 w-6" />
            </button>

            <div className="flex flex-1 items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">{'\u0625\u062f\u0627\u0631\u0629 \u0627\u0644\u0645\u0646\u0635\u0629'}</h2>
              <Link href="/" className="text-sm font-medium text-gray-700 hover:text-blue-600">
                العودة للموقع
              </Link>
            </div>
          </div>

          <main className="py-8">
            <div className="px-4 sm:px-6 lg:px-8">{children}</div>
          </main>
        </div>
      </div>
    </AdminGuard>
  );
}
