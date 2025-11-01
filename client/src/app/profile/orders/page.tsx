'use client';

import { useEffect, useState } from 'react';
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

export default function OrdersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState(searchParams.get('status') || 'all');

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user]);

  // Auto-refresh when page comes into focus
  useEffect(() => {
    const handleFocus = () => {
      if (user && !loading && !refreshing) {
        loadOrders();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user, loading, refreshing]);

  const loadOrders = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      const token = Cookies.get('token');
      if (!token) return;

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5050';
      const response = await fetch(`${backendUrl}/api/users/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadOrders(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processing': return 'bg-[#41ADE1]/30 text-[#41ADE1] border-[#41ADE1]/40';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'مكتمل';
      case 'pending': return 'قيد الانتظار';
      case 'processing': return 'قيد المعالجة';
      case 'failed': return 'فاشل';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircleIcon className="h-5 w-5" />;
      case 'pending': return <ClockIcon className="h-5 w-5" />;
      case 'processing': return <ClockIcon className="h-5 w-5 animate-spin" />;
      case 'failed': return <XCircleIcon className="h-5 w-5" />;
      default: return <ClockIcon className="h-5 w-5" />;
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  return (
    <RequireAuth>
      <Layout>
        <Container>
          <div className="py-12">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">طلباتي</h1>
                <p className="text-gray-600">عرض وإدارة جميع طلباتك</p>
              </div>
              <button
                onClick={handleRefresh}
                disabled={refreshing || loading}
                className="inline-flex items-center px-4 py-2 bg-[#41ADE1] text-white rounded-lg hover:bg-[#3399CC] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ArrowPathIcon className={`h-5 w-5 ml-2 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'جاري التحديث...' : 'تحديث'}
              </button>
            </div>

            {/* Filters */}
            <div className="mb-6 flex flex-wrap gap-2">
              {['all', 'pending', 'processing', 'completed', 'failed'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === status
                      ? 'bg-[#41ADE1] text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {status === 'all' ? 'الكل' : getStatusText(status)}
                </button>
              ))}
            </div>

            {/* Orders List */}
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#41ADE1]"></div>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <ShoppingBagIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">لا توجد طلبات</h3>
                <p className="text-gray-600 mb-6">لم تقم بأي طلبات بعد</p>
                <button
                  onClick={() => router.push('/courses')}
                  className="bg-[#41ADE1] text-white px-6 py-3 rounded-lg hover:bg-[#3399CC] transition-colors"
                >
                  تصفح الدورات
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <div key={order._id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {order.orderType === 'course' ? order.courseTitle : order.consultationTitle}
                        </h3>
                        
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-3">
                          <span className="inline-flex items-center">
                            <ShoppingBagIcon className="h-4 w-4 ml-1" />
                            {order.orderType === 'course' ? 'دورة' : 'استشارة'}
                          </span>
                          <span>•</span>
                          <span>{new Date(order.createdAt).toLocaleDateString('ar-EG')}</span>
                          <span>•</span>
                          <span className="capitalize">{order.paymentMethod === 'bank_transfer' ? 'تحويل بنكي' : order.paymentMethod}</span>
                        </div>

                        {order.paymentMethod === 'bank_transfer' && order.bankTransfer?.verificationStatus === 'pending' && (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                            <p className="text-sm text-yellow-800">
                              ⏳ تحويلك البنكي قيد المراجعة. سيتم تفعيل الطلب بعد التحقق من الإيصال.
                            </p>
                          </div>
                        )}

                        {order.paymentMethod === 'bank_transfer' && order.bankTransfer?.verificationStatus === 'rejected' && (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                            <p className="text-sm text-red-800">
                              ❌ تم رفض التحويل البنكي. يرجى التواصل مع الدعم.
                            </p>
                          </div>
                        )}

                        <div className="flex items-center gap-4">
                          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            {getStatusText(order.status)}
                          </span>
                          <span className="text-lg font-bold text-gray-900">${order.amount}</span>
                        </div>
                      </div>

                      {order.status === 'completed' && order.orderType === 'course' && order.courseId && (
                        <button
                          onClick={() => router.push(`/courses/${order.courseId}`)}
                          className="bg-[#41ADE1] text-white px-4 py-2 rounded-lg hover:bg-[#3399CC] transition-colors text-sm font-medium"
                        >
                          الذهاب للدورة
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Container>
      </Layout>
    </RequireAuth>
  );
}

