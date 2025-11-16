'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import RequireAuth from '@/components/auth/RequireAuth';
import { Layout, Container } from '@/components/layout';
import { 
  ShoppingBagIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  XCircleIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import Cookies from 'js-cookie';

interface Order {
  _id: string;
  orderType: 'course' | 'consultation';
  courseId?: string;
  courseTitle?: string;
  consultationTitle?: string;
  amount: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
  bankTransfer?: {
    verificationStatus?: string;
    receiptImage?: string;
  };
}

function OrdersContentInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState(searchParams.get('status') || 'all');

  // Rest of your component code...
  // This should include all the JSX and logic from your original OrdersPage component
  
  return (
    <RequireAuth>
      <Layout>
        <Container>
          <div className="py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-8">طلباتي</h1>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-500">سيتم عرض الطلبات هنا</p>
              </div>
            )}
          </div>
        </Container>
      </Layout>
    </RequireAuth>
  );
}

export const OrdersContent = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-500">جاري التحميل...</p>
        </div>
      </div>
    }>
      <OrdersContentInner />
    </Suspense>
  );
};
