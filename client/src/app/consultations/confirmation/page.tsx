'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { consultationTypes } from '@/data/consultations'

export default function ConfirmationPage() {
  const searchParams = useSearchParams()
  const [bookingDetails, setBookingDetails] = useState(null)

  useEffect(() => {
    const date = searchParams.get('date')
    const time = searchParams.get('time')
    const type = searchParams.get('type')
    
    if (date && time && type) {
      const consultation = consultationTypes.find(c => c.id === parseInt(type))
      const bookingId = 'BK' + Date.now().toString().slice(-6)
      
      setBookingDetails({
        id: bookingId,
        consultation,
        date,
        time,
        status: 'confirmed'
      })
    }
  }, [searchParams])

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ar-SA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (!bookingDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-300">جاري تحميل تفاصيل الحجز...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">تم تأكيد حجزك بنجاح!</h1>
          <p className="text-gray-300">سيتم التواصل معك قريباً لتأكيد موعد الاستشارة</p>
        </div>

        {/* Booking Details Card */}
        <div className="bg-gray-800 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">تفاصيل الحجز</h2>
            <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
              مؤكد
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-gray-400 text-sm">رقم الحجز</label>
                <p className="text-white font-semibold text-lg">{bookingDetails.id}</p>
              </div>
              
              <div>
                <label className="text-gray-400 text-sm">نوع الاستشارة</label>
                <p className="text-white font-semibold">{bookingDetails.consultation.title}</p>
                <p className="text-gray-300 text-sm">{bookingDetails.consultation.description}</p>
              </div>

              <div>
                <label className="text-gray-400 text-sm">التاريخ</label>
                <p className="text-white font-semibold">{formatDate(bookingDetails.date)}</p>
              </div>

              <div>
                <label className="text-gray-400 text-sm">الوقت</label>
                <p className="text-white font-semibold">{bookingDetails.time}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-gray-400 text-sm">المدة</label>
                <p className="text-white font-semibold">{bookingDetails.consultation.duration}</p>
              </div>

              <div>
                <label className="text-gray-400 text-sm">السعر</label>
                <p className="text-blue-400 font-bold text-xl">{bookingDetails.consultation.price}</p>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <h3 className="text-blue-400 font-semibold mb-2">معلومات مهمة</h3>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• يرجى الحضور قبل 10 دقائق من الموعد</li>
                  <li>• إحضار ملابس رياضية مناسبة</li>
                  <li>• يمكن إعادة جدولة الموعد قبل 24 ساعة</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-gray-800 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">الخطوات التالية</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                1
              </div>
              <div>
                <h3 className="text-white font-semibold">تأكيد الموعد</h3>
                <p className="text-gray-300 text-sm">سيتم التواصل معك خلال 24 ساعة لتأكيد الموعد وإرسال تفاصيل إضافية</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                2
              </div>
              <div>
                <h3 className="text-white font-semibold">الدفع</h3>
                <p className="text-gray-300 text-sm">يمكن الدفع نقداً عند الحضور أو عبر التحويل البنكي المسبق</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                3
              </div>
              <div>
                <h3 className="text-white font-semibold">الحضور</h3>
                <p className="text-gray-300 text-sm">احضر في الموعد المحدد مع إحضار أي تقارير طبية أو معلومات ذات صلة</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-gray-800 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">معلومات التواصل</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path>
                </svg>
              </div>
              <h3 className="text-white font-semibold">الهاتف</h3>
              <p className="text-gray-300">+966 50 123 4567</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
                </svg>
              </div>
              <h3 className="text-white font-semibold">البريد الإلكتروني</h3>
              <p className="text-gray-300">info@tahasabag.com</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path>
                </svg>
              </div>
              <h3 className="text-white font-semibold">العنوان</h3>
              <p className="text-gray-300">الرياض، المملكة العربية السعودية</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => window.print()}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
            </svg>
            طباعة التفاصيل
          </button>
          
          <Link 
            href="/consultations"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors text-center"
          >
            حجز استشارة أخرى
          </Link>
          
          <Link 
            href="/"
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors text-center"
          >
            العودة للرئيسية
          </Link>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-8 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <p className="text-yellow-400 text-sm">
            <strong>ملاحظة:</strong> هذا حجز تجريبي لأغراض العرض. في التطبيق الفعلي، سيتم ربط النظام بقاعدة البيانات ونظام الدفع.
          </p>
        </div>
      </div>
    </div>
  )
}