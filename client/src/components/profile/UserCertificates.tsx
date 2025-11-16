'use client';

import { useState, useEffect } from 'react';
import { userAPI, type Certificate } from '@/lib/api';
import { generateCertificatePDF } from '@/utils/certificateGenerator';

export default function UserCertificates() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await userAPI.getCertificates();
        
        if (response.data.success) {
          setCertificates(response.data.certificates || []);
        } else {
          throw new Error('فشل في تحميل الشهادات');
        }
      } catch (err: any) {
        console.error('Error fetching certificates:', err);
        setError('حدث خطأ أثناء تحميل الشهادات. يرجى المحاولة مرة أخرى.');
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, []);

  const handleDownloadCertificate = async (certificate: Certificate) => {
    try {
      console.log('Downloading certificate from profile:', {
        userName: certificate.userName,
        courseTitle: certificate.courseTitle,
        issuedDate: certificate.issuedAt,
        verificationCode: certificate.verificationCode,
      });

      await generateCertificatePDF({
        userName: certificate.userName || 'Name Not Available',
        courseTitle: certificate.courseTitle || 'Course Title Not Available',
        issuedDate: certificate.issuedAt,
        verificationCode: certificate.verificationCode || 'N/A',
      });
    } catch (error) {
      console.error('Error downloading certificate:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      calendar: 'gregory',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#41ADE1]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-lg mb-4">⚠️</div>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (certificates.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-6">🏆</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-3">لا توجد شهادات بعد</h3>
        <p className="text-gray-600 mb-6">أكمل دوراتك التدريبية للحصول على شهادات إتمام معتمدة</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {certificates.map((certificate) => (
          <div
            key={certificate._id}
            className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            {/* Certificate Header */}
            <div className="bg-gradient-to-r from-[#41ADE1] to-indigo-600 p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-white bg-opacity-10 rounded-full -translate-y-10 translate-x-10"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-white bg-opacity-10 rounded-full translate-y-8 -translate-x-8"></div>
              
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">شهادة إنجاز</h3>
                    <p className="text-[#41ADE1]/40 text-sm">معتمدة</p>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-xs text-[#41ADE1]/40 mb-1">رقم التحقق</div>
                  <div className="font-mono text-sm font-bold bg-white bg-opacity-20 px-2 py-1 rounded">
                    {certificate.verificationCode.slice(0, 8)}...
                  </div>
                </div>
              </div>
            </div>

            {/* Certificate Content */}
            <div className="p-6">
              <div className="mb-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {certificate.courseTitle}
                </h4>
                <p className="text-sm text-gray-600">
                  تم إكمال الدورة بنجاح
                </p>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">تاريخ الإصدار</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatDate(certificate.issuedAt)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">التحقق</span>
                  <span className="text-xs text-green-600 font-medium">✓ معتمدة</span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleDownloadCertificate(certificate)}
                className="w-full bg-gradient-to-r from-[#41ADE1] to-indigo-600 hover:from-[#3399CC] hover:to-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                تحميل الشهادة
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
