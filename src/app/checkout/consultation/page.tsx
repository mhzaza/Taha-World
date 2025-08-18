'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Consultation, TimeSlot } from '@/types/booking';
import { getConsultationById, getBookingById, createBooking, updateBookingPayment } from '@/lib/services/bookingService';
import { ArrowLeftIcon, ClockIcon, CalendarIcon, CreditCardIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import PageHeader from '@/components/ui/PageHeader';

export default function ConsultationCheckoutPage() {
  const searchParams = useSearchParams();
  const consultationId = searchParams.get('consultationId');
  const timeSlotId = searchParams.get('timeSlotId');
  const bookingId = searchParams.get('bookingId'); // For returning from payment
  
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [timeSlot, setTimeSlot] = useState<TimeSlot | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal' | 'bank_transfer'>('stripe');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchCheckoutData = async () => {
      try {
        setLoading(true);
        
        // If returning from payment with bookingId
        if (bookingId) {
          const bookingData = await getBookingById(bookingId);
          if (bookingData.paymentStatus === 'completed') {
            setPaymentSuccess(true);
          }
          const consultationData = await getConsultationById(bookingData.consultationId);
          setConsultation(consultationData);
          setLoading(false);
          return;
        }
        
        // Normal checkout flow
        if (!consultationId || !timeSlotId) {
          setError('معلومات الحجز غير مكتملة');
          setLoading(false);
          return;
        }
        
        const consultationData = await getConsultationById(consultationId);
        setConsultation(consultationData);
        
        // Fetch time slot details
        // Note: In a real implementation, you would have an API to get a specific time slot
        // For now, we'll simulate this by getting all available time slots and finding the one we need
        const availableTimeSlots = await getAvailableTimeSlots(consultationId);
        const selectedTimeSlot = availableTimeSlots.find(slot => slot.id === timeSlotId);
        
        if (!selectedTimeSlot) {
          setError('الموعد المحدد غير متاح');
          setLoading(false);
          return;
        }
        
        setTimeSlot(selectedTimeSlot);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching checkout data:', err);
        setError('حدث خطأ أثناء تحميل بيانات الدفع. يرجى المحاولة مرة أخرى.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchCheckoutData();
    } else {
      router.push('/auth/login');
    }
  }, [consultationId, timeSlotId, bookingId, user, router]);

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
  const formatCurrency = () => {
    if (!consultation) return '';
    
    switch (consultation.currency) {
      case 'USD':
        return `$${consultation.price}`;
      case 'SAR':
        return `${consultation.price} ر.س`;
      case 'EGP':
        return `${consultation.price} ج.م`;
      default:
        return `${consultation.price}`;
    }
  };

  const handlePaymentMethodChange = (method: 'stripe' | 'paypal' | 'bank_transfer') => {
    setPaymentMethod(method);
  };

  const handlePayment = async () => {
    if (!user || !consultation || !timeSlot) return;
    
    try {
      setPaymentLoading(true);
      
      // Create booking first
      const bookingResult = await createBooking({
        userId: user.uid,
        consultationId: consultation.id,
        timeSlotId: timeSlot.id,
        status: 'pending',
        paymentStatus: 'pending',
        paymentMethod,
        amount: consultation.price,
        currency: consultation.currency,
      });
      
      // Simulate payment process based on selected method
      if (paymentMethod === 'stripe') {
        // In a real implementation, redirect to Stripe checkout
        // For demo purposes, we'll simulate a successful payment after a delay
        setTimeout(async () => {
          await updateBookingPayment(bookingResult.id, 'completed', 'stripe_' + Date.now());
          setPaymentSuccess(true);
          setPaymentLoading(false);
        }, 2000);
      } else if (paymentMethod === 'paypal') {
        // In a real implementation, redirect to PayPal checkout
        // For demo purposes, we'll simulate a successful payment after a delay
        setTimeout(async () => {
          await updateBookingPayment(bookingResult.id, 'completed', 'paypal_' + Date.now());
          setPaymentSuccess(true);
          setPaymentLoading(false);
        }, 2000);
      } else if (paymentMethod === 'bank_transfer') {
        // For bank transfer, we'll mark the payment as pending and show instructions
        setPaymentSuccess(true);
        setPaymentLoading(false);
      }
    } catch (err: any) {
      console.error('Error processing payment:', err);
      setError('حدث خطأ أثناء معالجة الدفع. يرجى المحاولة مرة أخرى.');
      setPaymentLoading(false);
    }
  };

  const handleViewBookings = () => {
    router.push('/profile');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title={paymentSuccess ? 'تم الحجز بنجاح' : 'إتمام الحجز'}
        description={paymentSuccess ? 'شكراً لك على حجز استشارة مع المدرب طه' : 'أكمل عملية الدفع لتأكيد حجز الاستشارة'}
        backButton={{
          label: 'العودة للاستشارات',
          href: '/consultations',
          icon: ArrowLeftIcon,
        }}
      />

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      ) : paymentSuccess ? (
        // Payment Success View
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8 mt-8">
          <div className="text-center mb-8">
            <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">تم تأكيد الحجز بنجاح!</h2>
            <p className="text-gray-600">سيتم التواصل معك قريباً لتأكيد تفاصيل الاستشارة</p>
          </div>
          
          <div className="border-t border-b border-gray-200 py-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">تفاصيل الحجز</h3>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="ml-3 flex-shrink-0">
                  <ClockIcon className="h-5 w-5 text-gray-500" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">{consultation?.title}</p>
                  <p className="text-gray-600">{consultation?.duration} دقيقة</p>
                </div>
              </div>
              
              {timeSlot && (
                <div className="flex items-start">
                  <div className="ml-3 flex-shrink-0">
                    <CalendarIcon className="h-5 w-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{formatDate(timeSlot.startTime)}</p>
                    <p className="text-gray-600">{formatTime(timeSlot.startTime)} - {formatTime(timeSlot.endTime)}</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-start">
                <div className="ml-3 flex-shrink-0">
                  <CreditCardIcon className="h-5 w-5 text-gray-500" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">المبلغ المدفوع</p>
                  <p className="text-gray-600">{formatCurrency()}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <button
              onClick={handleViewBookings}
              className="bg-primary text-white px-6 py-3 rounded-md hover:bg-primary-dark transition duration-300"
            >
              عرض حجوزاتي
            </button>
          </div>
        </div>
      ) : consultation && timeSlot ? (
        // Checkout View
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-6">ملخص الطلب</h2>
              
              <div className="border-b border-gray-200 pb-6 mb-6">
                <h3 className="font-semibold mb-4">تفاصيل الاستشارة</h3>
                
                <div className="flex items-start mb-4">
                  <div className="ml-3 flex-shrink-0">
                    <ClockIcon className="h-5 w-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{consultation.title}</p>
                    <p className="text-gray-600">{consultation.duration} دقيقة</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="ml-3 flex-shrink-0">
                    <CalendarIcon className="h-5 w-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{formatDate(timeSlot.startTime)}</p>
                    <p className="text-gray-600">{formatTime(timeSlot.startTime)} - {formatTime(timeSlot.endTime)}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4">اختر طريقة الدفع</h3>
                
                <div className="space-y-3">
                  <div 
                    className={`flex items-center p-4 border rounded-md cursor-pointer ${paymentMethod === 'stripe' ? 'border-primary bg-primary bg-opacity-5' : 'border-gray-200 hover:border-primary'}`}
                    onClick={() => handlePaymentMethodChange('stripe')}
                  >
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      checked={paymentMethod === 'stripe'} 
                      onChange={() => handlePaymentMethodChange('stripe')} 
                      className="ml-3"
                    />
                    <div>
                      <p className="font-medium">بطاقة ائتمان</p>
                      <p className="text-sm text-gray-500">Visa, Mastercard, American Express</p>
                    </div>
                  </div>
                  
                  <div 
                    className={`flex items-center p-4 border rounded-md cursor-pointer ${paymentMethod === 'paypal' ? 'border-primary bg-primary bg-opacity-5' : 'border-gray-200 hover:border-primary'}`}
                    onClick={() => handlePaymentMethodChange('paypal')}
                  >
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      checked={paymentMethod === 'paypal'} 
                      onChange={() => handlePaymentMethodChange('paypal')} 
                      className="ml-3"
                    />
                    <div>
                      <p className="font-medium">PayPal</p>
                      <p className="text-sm text-gray-500">الدفع باستخدام حساب PayPal الخاص بك</p>
                    </div>
                  </div>
                  
                  <div 
                    className={`flex items-center p-4 border rounded-md cursor-pointer ${paymentMethod === 'bank_transfer' ? 'border-primary bg-primary bg-opacity-5' : 'border-gray-200 hover:border-primary'}`}
                    onClick={() => handlePaymentMethodChange('bank_transfer')}
                  >
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      checked={paymentMethod === 'bank_transfer'} 
                      onChange={() => handlePaymentMethodChange('bank_transfer')} 
                      className="ml-3"
                    />
                    <div>
                      <p className="font-medium">تحويل بنكي</p>
                      <p className="text-sm text-gray-500">سيتم إرسال تفاصيل الحساب البنكي بعد تأكيد الحجز</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Order Total */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h3 className="text-lg font-bold mb-4">ملخص الدفع</h3>
              
              <div className="border-b border-gray-200 pb-4 mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">سعر الاستشارة</span>
                  <span>{formatCurrency()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">الضريبة</span>
                  <span>0.00</span>
                </div>
              </div>
              
              <div className="flex justify-between font-bold mb-6">
                <span>الإجمالي</span>
                <span>{formatCurrency()}</span>
              </div>
              
              <button
                onClick={handlePayment}
                disabled={paymentLoading}
                className={`w-full py-3 px-4 rounded-md text-white font-semibold ${paymentLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-primary-dark'}`}
              >
                {paymentLoading ? (
                  <span className="flex items-center justify-center">
                    <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white ml-2"></span>
                    جاري معالجة الدفع...
                  </span>
                ) : (
                  'تأكيد الدفع'
                )}
              </button>
              
              <p className="text-xs text-gray-500 text-center mt-4">
                بالضغط على "تأكيد الدفع"، أنت توافق على شروط الخدمة وسياسة الخصوصية الخاصة بنا.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold mb-2">معلومات الحجز غير مكتملة</h3>
          <p className="text-gray-600">يرجى العودة واختيار استشارة وموعد للمتابعة.</p>
        </div>
      )}
    </div>
  );
}