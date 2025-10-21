'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { userAPI } from '@/lib/api';
import { CreditCardIcon } from '@heroicons/react/24/outline';

interface Payment {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  paymentMethod: string;
  description: string;
  metadata?: {
    orderId?: string;
    courseId?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export default function UserPayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchPayments = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Fetch user payments from API (mock for now)
        // TODO: Implement getUserPayments in userAPI
        const mockPayments = [
          {
            id: '1',
            courseTitle: 'كورس مصارعة الذراعين المتقدم',
            amount: 299,
            status: 'completed',
            createdAt: '2024-01-15T10:30:00Z',
            paymentMethod: 'paypal',
            currency: 'USD'
          },
          {
            id: '2',
            courseTitle: 'تدريب القوة الأساسي',
            amount: 199,
            status: 'completed',
            createdAt: '2024-01-10T14:20:00Z',
            paymentMethod: 'credit_card',
            currency: 'USD'
          }
        ];
        
        const paymentsData = mockPayments.map((payment: any) => ({
            id: payment.id || payment._id,
            userId: payment.userId,
            amount: payment.amount,
            currency: payment.currency || 'USD',
            status: payment.status,
            paymentMethod: payment.paymentMethod,
            description: payment.courseTitle || payment.description || 'دفع',
            metadata: {
              orderId: payment.id || payment._id,
              courseId: payment.courseId
            },
            createdAt: new Date(payment.createdAt),
            updatedAt: new Date(payment.updatedAt || payment.createdAt)
          }));
          
          setPayments(paymentsData);
          setError(null);
      } catch (err: any) {
        console.error('Error fetching payments:', err);
        setError('حدث خطأ أثناء تحميل سجل المدفوعات. يرجى المحاولة مرة أخرى.');
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [user]);

  // Format date for display
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  // Helper function to format currency
  const formatCurrency = (price: number, currency: string) => {
    switch (currency) {
      case 'USD':
        return `$${price}`;
      case 'SAR':
        return `${price} ر.س`;
      case 'EGP':
        return `${price} ج.م`;
      default:
        return `${price}`;
    }
  };

  // Helper function to get status label in Arabic
  const getStatusLabel = (status: Payment['status']) => {
    switch (status) {
      case 'completed':
        return 'مكتمل';
      case 'pending':
        return 'قيد الانتظار';
      case 'failed':
        return 'فشل';
      case 'refunded':
        return 'مسترد';
      default:
        return status;
    }
  };

  // Helper function to get status color
  const getStatusColor = (status: Payment['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Helper function to get payment method label in Arabic
  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'credit_card':
        return 'بطاقة ائتمان';
      case 'paypal':
        return 'باي بال';
      case 'bank_transfer':
        return 'تحويل بنكي';
      case 'cash':
        return 'نقدًا';
      default:
        return method;
    }
  };

  // Helper function to get payment method icon
  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'credit_card':
        return <CreditCardIcon className="h-5 w-5 text-gray-500" />;
      case 'paypal':
        return <span className="text-blue-500 font-bold">P</span>;
      case 'bank_transfer':
        return <span className="text-green-500 font-bold">B</span>;
      case 'cash':
        return <span className="text-yellow-500 font-bold">$</span>;
      default:
        return <CreditCardIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  // Helper function to get payment type description
  const getPaymentTypeDescription = (payment: Payment) => {
    if (payment.metadata?.courseId) {
      return 'شراء دورة تدريبية';
    } else {
      return payment.description || 'دفع';
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-6">سجل المدفوعات</h2>
      
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      ) : payments.length === 0 ? (
        <div className="text-center py-8">
          <CreditCardIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">لا توجد مدفوعات</h3>
          <p className="text-gray-600">لم تقم بأي معاملات مالية بعد</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-600">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  التاريخ
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الوصف
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  طريقة الدفع
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  المبلغ
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الحالة
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-600">
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(payment.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {getPaymentTypeDescription(payment)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <span className="mr-2">{getPaymentMethodIcon(payment.paymentMethod)}</span>
                      {getPaymentMethodLabel(payment.paymentMethod)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {formatCurrency(payment.amount, payment.currency)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                      {getStatusLabel(payment.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
