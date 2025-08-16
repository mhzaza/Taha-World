'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Consultation, TimeSlot } from '@/types/booking';
import { getConsultationById, getAvailableTimeSlots } from '@/lib/services/bookingService';
import { ArrowLeftIcon, ClockIcon, CurrencyDollarIcon, CalendarIcon, VideoCameraIcon, PhoneIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import PageHeader from '@/components/ui/PageHeader';
import BookingCalendar from '@/components/consultations/BookingCalendar';

export default function ConsultationDetailPage() {
  const { id } = useParams();
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchConsultationDetails = async () => {
      try {
        setLoading(true);
        if (typeof id !== 'string') return;
        
        const consultationData = await getConsultationById(id);
        setConsultation(consultationData);
        
        const timeSlotsData = await getAvailableTimeSlots(id);
        setTimeSlots(timeSlotsData);
        
        setError(null);
      } catch (err: any) {
        console.error('Error fetching consultation details:', err);
        setError('حدث خطأ أثناء تحميل تفاصيل الاستشارة. يرجى المحاولة مرة أخرى.');
      } finally {
        setLoading(false);
      }
    };

    fetchConsultationDetails();
  }, [id]);

  const handleTimeSlotSelect = (timeSlot: TimeSlot) => {
    setSelectedTimeSlot(timeSlot);
  };

  const handleBooking = () => {
    if (!user) {
      // Redirect to login if user is not authenticated
      router.push(`/auth/login?redirect=/consultations/${id}`);
      return;
    }

    if (!selectedTimeSlot) {
      alert('يرجى اختيار موعد للاستشارة');
      return;
    }

    // Redirect to checkout page with consultation and time slot details
    router.push(`/checkout/consultation?consultationId=${id}&timeSlotId=${selectedTimeSlot.id}`);
  };

  // Helper function to get the appropriate icon based on consultation type
  const getTypeIcon = () => {
    if (!consultation) return null;
    
    switch (consultation.type) {
      case 'video':
        return <VideoCameraIcon className="h-6 w-6 text-primary" />;
      case 'audio':
        return <PhoneIcon className="h-6 w-6 text-primary" />;
      case 'in-person':
        return <UserGroupIcon className="h-6 w-6 text-primary" />;
      default:
        return <VideoCameraIcon className="h-6 w-6 text-primary" />;
    }
  };

  // Helper function to get the type label in Arabic
  const getTypeLabel = () => {
    if (!consultation) return '';
    
    switch (consultation.type) {
      case 'video':
        return 'استشارة مرئية';
      case 'audio':
        return 'استشارة صوتية';
      case 'in-person':
        return 'استشارة شخصية';
      default:
        return 'استشارة';
    }
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

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title={consultation?.title || 'تفاصيل الاستشارة'}
        description={consultation?.description || 'جاري تحميل التفاصيل...'}
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
      ) : consultation ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Consultation Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-6">
                {getTypeIcon()}
                <span className="mr-2 text-lg text-gray-700">{getTypeLabel()}</span>
              </div>
              
              <h2 className="text-2xl font-bold mb-4">{consultation.title}</h2>
              
              <div className="mb-6">
                <p className="text-gray-700 whitespace-pre-line">{consultation.description}</p>
              </div>
              
              <div className="flex flex-col space-y-4">
                <div className="flex items-center">
                  <ClockIcon className="h-5 w-5 text-gray-500 ml-3" />
                  <span className="text-gray-700">المدة: {consultation.duration} دقيقة</span>
                </div>
                
                <div className="flex items-center">
                  <CurrencyDollarIcon className="h-5 w-5 text-gray-500 ml-3" />
                  <span className="text-gray-700">السعر: {formatCurrency()}</span>
                </div>
              </div>
              
              {consultation.tags && consultation.tags.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-2">الوسوم</h3>
                  <div className="flex flex-wrap">
                    {consultation.tags.map((tag, index) => (
                      <span 
                        key={index} 
                        className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full ml-2 mb-2"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">ماذا ستستفيد من هذه الاستشارة؟</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 pr-4">
                  <li>تحليل شامل لحالتك الرياضية الحالية</li>
                  <li>خطة تدريبية مخصصة تناسب أهدافك</li>
                  <li>نصائح غذائية تساعدك على تحسين أدائك</li>
                  <li>إجابات على جميع استفساراتك من خبير متخصص</li>
                  <li>متابعة مستمرة لضمان تحقيق أفضل النتائج</li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* Booking Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h3 className="text-xl font-bold mb-4">حجز موعد</h3>
              
              {timeSlots.length === 0 ? (
                <div className="text-center py-8">
                  <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">لا توجد مواعيد متاحة حالياً</p>
                  <p className="text-gray-500 text-sm mt-2">يرجى التحقق مرة أخرى لاحقاً</p>
                </div>
              ) : (
                <>
                  <BookingCalendar 
                    timeSlots={timeSlots} 
                    onSelectTimeSlot={handleTimeSlotSelect} 
                    selectedTimeSlot={selectedTimeSlot}
                  />
                  
                  {selectedTimeSlot && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-md">
                      <h4 className="font-semibold mb-2">الموعد المختار:</h4>
                      <p className="text-gray-700">{formatDate(selectedTimeSlot.startTime)}</p>
                      <p className="text-gray-700">
                        {formatTime(selectedTimeSlot.startTime)} - {formatTime(selectedTimeSlot.endTime)}
                      </p>
                    </div>
                  )}
                  
                  <div className="mt-6">
                    <button
                      onClick={handleBooking}
                      disabled={!selectedTimeSlot}
                      className={`w-full py-3 px-4 rounded-md text-white font-semibold ${!selectedTimeSlot ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-primary-dark'}`}
                    >
                      {user ? 'متابعة الحجز' : 'تسجيل الدخول للحجز'}
                    </button>
                    
                    {!user && (
                      <p className="text-sm text-gray-500 text-center mt-2">
                        يجب تسجيل الدخول أولاً لإتمام عملية الحجز
                      </p>
                    )}
                  </div>
                </>
              )}
              
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h4 className="font-semibold mb-3">معلومات الاستشارة:</h4>
                <div className="flex items-center mb-2">
                  <ClockIcon className="h-5 w-5 text-gray-500 ml-2" />
                  <span className="text-sm text-gray-600">{consultation.duration} دقيقة</span>
                </div>
                <div className="flex items-center mb-2">
                  <CurrencyDollarIcon className="h-5 w-5 text-gray-500 ml-2" />
                  <span className="text-sm text-gray-600">{formatCurrency()}</span>
                </div>
                <div className="flex items-center">
                  {getTypeIcon()}
                  <span className="mr-2 text-sm text-gray-600">{getTypeLabel()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold mb-2">لم يتم العثور على الاستشارة</h3>
          <p className="text-gray-600">الاستشارة التي تبحث عنها غير موجودة أو تم إزالتها.</p>
        </div>
      )}
    </div>
  );
}