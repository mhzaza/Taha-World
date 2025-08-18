'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Booking, Consultation, TimeSlot } from '@/types/booking';
import { getUserBookings, getConsultationById, updateBookingStatus } from '@/lib/services/bookingService';
import { CalendarIcon, ClockIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

export default function UserBookings() {
  const [bookings, setBookings] = useState<(Booking & { consultation?: Consultation })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchUserBookings = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const bookingsData = await getUserBookings(user.uid);
        
        // Fetch consultation details for each booking
        const bookingsWithDetails = await Promise.all(
          bookingsData.map(async (booking) => {
            try {
              const consultation = await getConsultationById(booking.consultationId);
              return { ...booking, consultation };
            } catch (err) {
              console.error(`Error fetching consultation for booking ${booking.id}:`, err);
              return booking;
            }
          })
        );
        
        setBookings(bookingsWithDetails);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching user bookings:', err);
        setError('حدث خطأ أثناء تحميل الحجوزات. يرجى المحاولة مرة أخرى.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserBookings();
  }, [user]);

  // Format date for display
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ar-SA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  // Format time for display
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('ar-SA', {
      hour: '2-digit',
      minute: '2-digit',
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
  const getStatusLabel = (status: Booking['status']) => {
    switch (status) {
      case 'pending':
        return 'قيد الانتظار';
      case 'confirmed':
        return 'مؤكد';
      case 'cancelled':
        return 'ملغي';
      case 'completed':
        return 'مكتمل';
      default:
        return status;
    }
  };

  // Helper function to get status color
  const getStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Helper function to get payment status label in Arabic
  const getPaymentStatusLabel = (status: Booking['paymentStatus']) => {
    switch (status) {
      case 'pending':
        return 'قيد الانتظار';
      case 'completed':
        return 'مدفوع';
      case 'failed':
        return 'فشل الدفع';
      case 'refunded':
        return 'مسترد';
      default:
        return status;
    }
  };

  // Helper function to get payment status color
  const getPaymentStatusColor = (status: Booking['paymentStatus']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('هل أنت متأكد من رغبتك في إلغاء هذا الحجز؟')) {
      return;
    }
    
    try {
      await updateBookingStatus(bookingId, 'cancelled');
      
      // Update the local state
      setBookings(prevBookings => 
        prevBookings.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: 'cancelled', cancelledAt: new Date() } 
            : booking
        )
      );
    } catch (err: any) {
      console.error('Error cancelling booking:', err);
      alert('حدث خطأ أثناء إلغاء الحجز. يرجى المحاولة مرة أخرى.');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-6">حجوزاتي</h2>
      
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-8">
          <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">لا توجد حجوزات</h3>
          <p className="text-gray-600 mb-6">لم تقم بحجز أي استشارات بعد</p>
          <button 
            onClick={() => router.push('/consultations')}
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition duration-300"
          >
            استكشف الاستشارات
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => (
            <div key={booking.id} className="border rounded-lg overflow-hidden">
              <div className="p-4 border-b bg-gray-50">
                <div className="flex flex-wrap justify-between items-center">
                  <h3 className="text-lg font-semibold">
                    {booking.consultation?.title || 'استشارة'}
                  </h3>
                  <div className="flex space-x-2 space-x-reverse">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                      {getStatusLabel(booking.status)}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(booking.paymentStatus)}`}>
                      {getPaymentStatusLabel(booking.paymentStatus)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <CalendarIcon className="h-5 w-5 text-gray-500 ml-2 mt-0.5" />
                      <div>
                        <p className="font-medium">تاريخ الاستشارة</p>
                        <p className="text-gray-600">{booking.timeSlotId ? 'يتم تحميل التاريخ...' : 'غير محدد'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <ClockIcon className="h-5 w-5 text-gray-500 ml-2 mt-0.5" />
                      <div>
                        <p className="font-medium">المدة</p>
                        <p className="text-gray-600">{booking.consultation?.duration || '--'} دقيقة</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <div className="h-5 w-5 text-gray-500 ml-2 flex items-center justify-center">
                        <span className="text-lg font-bold">₪</span>
                      </div>
                      <div>
                        <p className="font-medium">المبلغ</p>
                        <p className="text-gray-600">{formatCurrency(booking.amount, booking.currency)}</p>
                      </div>
                    </div>
                    
                    {booking.createdAt && (
                      <div className="flex items-start">
                        <CalendarIcon className="h-5 w-5 text-gray-500 ml-2 mt-0.5" />
                        <div>
                          <p className="font-medium">تاريخ الحجز</p>
                          <p className="text-gray-600">{formatDate(booking.createdAt)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {booking.status === 'pending' && (
                  <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end">
                    <button
                      onClick={() => handleCancelBooking(booking.id)}
                      className="flex items-center text-red-600 hover:text-red-800 transition duration-300"
                    >
                      <XCircleIcon className="h-5 w-5 ml-1" />
                      إلغاء الحجز
                    </button>
                  </div>
                )}
                
                {booking.status === 'confirmed' && booking.meetingUrl && (
                  <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end">
                    <a
                      href={booking.meetingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition duration-300"
                    >
                      <CheckCircleIcon className="h-5 w-5 ml-1" />
                      انضم للاستشارة
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}