'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  CalendarIcon,
  UserIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilIcon,
  EyeIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import toast from 'react-hot-toast';

interface ConsultationBooking {
  _id: string;
  bookingNumber: string;
  userId: {
    _id: string;
    displayName: string;
    email: string;
    phone?: string;
  };
  consultationId: {
    _id: string;
    title: string;
    price: number;
    currency: string;
    duration: string;
  };
  preferredDate: string;
  preferredTime: string;
  confirmedDateTime?: string;
  meetingType: 'online' | 'in_person';
  status: string;
  paymentStatus: string;
  amount: number;
  createdAt: string;
}

interface Stats {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  totalRevenue: number;
}

function ConsultationsListContent() {
  const searchParams = useSearchParams();
  const [bookings, setBookings] = useState<ConsultationBooking[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchBookings();
  }, [filter]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050/api';
      
      // Fetch all bookings (admin endpoint)
      const response = await axios.get(`${API_BASE_URL}/consultations/admin/bookings`, {
        withCredentials: true,
        params: filter !== 'all' ? { status: filter } : {}
      });

      if (response.data.success) {
        setBookings(response.data.bookings || []);
        calculateStats(response.data.bookings || []);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('فشل في تحميل الحجوزات');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (bookingsData: ConsultationBooking[]) => {
    const stats = {
      total: bookingsData.length,
      pending: bookingsData.filter(b => b.status === 'pending_confirmation').length,
      confirmed: bookingsData.filter(b => b.status === 'confirmed').length,
      completed: bookingsData.filter(b => b.status === 'completed').length,
      totalRevenue: bookingsData
        .filter(b => b.paymentStatus === 'completed')
        .reduce((sum, b) => sum + b.amount, 0)
    };
    setStats(stats);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: { [key: string]: { color: string; label: string } } = {
      pending_payment: { color: 'bg-yellow-100 text-yellow-800', label: 'في انتظار الدفع' },
      pending_confirmation: { color: 'bg-[#41ADE1]/30 text-[#41ADE1]', label: 'في انتظار التأكيد' },
      confirmed: { color: 'bg-green-100 text-green-800', label: 'مؤكد' },
      completed: { color: 'bg-gray-100 text-gray-800', label: 'مكتمل' },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'ملغي' },
      rescheduled: { color: 'bg-purple-100 text-purple-800', label: 'تم إعادة الجدولة' },
      no_show: { color: 'bg-orange-100 text-orange-800', label: 'لم يحضر' }
    };
    
    const config = statusConfig[status] || statusConfig.pending_confirmation;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      calendar: 'gregory',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    const symbol = currency === 'USD' ? '$' : currency === 'SAR' ? 'ر.س' : 'ج.م';
    return `${amount}${symbol}`;
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.userId?.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.bookingNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                <CalendarIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">إجمالي الحجوزات</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">{stats.total}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Other stat cards... */}
      </div>

      {/* Search and Filter */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              className="block w-full pr-10 pl-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="ابحث عن حجز..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="relative">
              <select
                className="appearance-none block w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">الكل</option>
                <option value="pending_confirmation">في انتظار التأكيد</option>
                <option value="confirmed">مؤكد</option>
                <option value="completed">مكتمل</option>
                <option value="cancelled">ملغي</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
            
            <Link
              href="/admin/consultations/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PencilIcon className="ml-2 -mr-1 h-4 w-4" />
              <span>حجز جديد</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  رقم الحجز
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  المستخدم
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الاستشارة
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  التاريخ والوقت
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الحالة
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  المبلغ
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">إجراءات</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                    جاري التحميل...
                  </td>
                </tr>
              ) : filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                    لا توجد حجوزات متاحة
                  </td>
                </tr>
              ) : (
                filteredBookings.map((booking) => (
                  <tr key={booking._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {booking.bookingNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-gray-200">
                          <UserIcon className="h-5 w-5 text-gray-500" />
                        </div>
                        <div className="mr-4">
                          <div className="text-sm font-medium text-gray-900">{booking.userId?.displayName}</div>
                          <div className="text-sm text-gray-500">{booking.userId?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{booking.consultationId?.title}</div>
                      <div className="text-sm text-gray-500">{booking.meetingType === 'online' ? 'أونلاين' : 'حضوري'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {booking.confirmedDateTime 
                          ? formatDate(booking.confirmedDateTime)
                          : `${booking.preferredDate} - ${booking.preferredTime}`}
                      </div>
                      <div className="text-sm text-gray-500">
                        {booking.consultationId?.duration} دقيقة
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(booking.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(booking.amount, booking.consultationId?.currency)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/admin/consultations/${booking._id}`}
                        className="text-blue-600 hover:text-blue-900 ml-4"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function ConsultationsList() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#41ADE1] mx-auto mb-4"></div>
          <p className="text-gray-400">جاري التحميل...</p>
        </div>
      </div>
    }>
      <ConsultationsListContent />
    </Suspense>
  );
}
