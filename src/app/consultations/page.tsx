'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Consultation } from '@/types/booking';
import { getConsultations } from '@/lib/services/bookingService';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import ConsultationCard from '@/components/consultations/ConsultationCard';
import PageHeader from '@/components/ui/PageHeader';

export default function ConsultationsPage() {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchConsultations = async () => {
      try {
        setLoading(true);
        const data = await getConsultations();
        setConsultations(data);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching consultations:', err);
        setError('حدث خطأ أثناء تحميل الاستشارات. يرجى المحاولة مرة أخرى.');
      } finally {
        setLoading(false);
      }
    };

    fetchConsultations();
  }, []);

  const handleConsultationSelect = (consultation: Consultation) => {
    router.push(`/consultations/${consultation.id}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="استشارات المدرب طه"
        description="احصل على استشارة شخصية من المدرب طه لمساعدتك في تحقيق أهدافك الرياضية"
        backButton={{
          label: 'العودة للرئيسية',
          href: '/',
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
      ) : consultations.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold mb-2">لا توجد استشارات متاحة حالياً</h3>
          <p className="text-gray-600">يرجى التحقق مرة أخرى لاحقاً للاطلاع على الاستشارات الجديدة.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {consultations.map((consultation) => (
            <ConsultationCard
              key={consultation.id}
              consultation={consultation}
              onClick={() => handleConsultationSelect(consultation)}
            />
          ))}
        </div>
      )}

      <div className="mt-16 bg-gray-50 rounded-lg p-6 shadow-sm">
        <h2 className="text-2xl font-bold mb-4">لماذا تختار استشارات المدرب طه؟</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold mb-2">خبرة متخصصة</h3>
            <p className="text-gray-600">استفد من خبرة المدرب طه الممتدة لأكثر من 10 سنوات في مجال التدريب الرياضي والتغذية.</p>
          </div>
          <div className="bg-white p-5 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold mb-2">برامج مخصصة</h3>
            <p className="text-gray-600">احصل على برنامج تدريبي وغذائي مخصص حسب احتياجاتك وأهدافك الشخصية.</p>
          </div>
          <div className="bg-white p-5 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold mb-2">دعم مستمر</h3>
            <p className="text-gray-600">استمتع بمتابعة دورية ودعم مستمر لضمان تحقيق أفضل النتائج في رحلتك الرياضية.</p>
          </div>
        </div>
      </div>

      <div className="mt-12 text-center">
        <h2 className="text-2xl font-bold mb-4">هل لديك أسئلة؟</h2>
        <p className="text-gray-600 mb-6">يمكنك التواصل معنا مباشرة للإجابة على استفساراتك</p>
        <button 
          onClick={() => router.push('/contact')}
          className="bg-primary text-white px-6 py-3 rounded-md hover:bg-primary-dark transition duration-300"
        >
          تواصل معنا
        </button>
      </div>
    </div>
  );
}