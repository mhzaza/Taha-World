'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ConsultationBookingModal from '@/components/consultation/ConsultationBookingModal';
import { consultationsAPI } from '@/lib/api';
import toast from 'react-hot-toast';

interface Consultation {
  _id: string;
  title: string;
  description: string;
  duration: string;
  durationMinutes: number;
  price: number;
  currency: string;
  category: string;
  features: string[];
  consultationType: string;
  image?: string;
}

export default function BookConsultationPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const consultationId = searchParams.get('type');

  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!authLoading && !user) {
      toast.error('يرجى تسجيل الدخول أولاً');
      router.push(`/auth/login?redirect=/consultations/book${consultationId ? `?type=${consultationId}` : ''}`);
      return;
    }

    // Check if user has phone number (required for consultations)
    if (user && !user.phone) {
      toast.error('يرجى إضافة رقم الهاتف في الملف الشخصي أولاً');
      router.push('/profile/settings');
      return;
    }

    // Load consultation if type is specified
    if (consultationId && user) {
      loadConsultation();
    } else if (user) {
      // If no consultation selected, show all consultations
      router.push('/consultations');
    }
  }, [user, authLoading, consultationId, router]);

  const loadConsultation = async () => {
    if (!consultationId) return;

    try {
      setLoading(true);
      const response = await consultationsAPI.getById(consultationId);
      const data = response.data as any;
      setConsultation(data.consultation as Consultation);
      setShowBookingModal(true);
    } catch (error) {
      console.error('Error loading consultation:', error);
      toast.error('فشل في تحميل الاستشارة');
      router.push('/consultations');
    } finally {
      setLoading(false);
    }
  };

  const handleBookingComplete = (bookingId: string) => {
    setShowBookingModal(false);
    toast.success('تم إنشاء الحجز بنجاح! جاري التحويل للدفع...');
    // The modal will handle payment redirection
  };

  const handleModalClose = () => {
    setShowBookingModal(false);
    router.push('/consultations');
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-400">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-4">
              احجز استشارتك
            </h1>
            <p className="text-gray-300 mb-8">
              يرجى تعبئة النموذج لحجز الاستشارة
            </p>
          </div>
        </div>
      </div>

      {consultation && user && (
        <ConsultationBookingModal
          isOpen={showBookingModal}
          onClose={handleModalClose}
          consultation={consultation}
          user={user}
          onBookingComplete={handleBookingComplete}
        />
      )}

      <Footer />
    </div>
  );
}
