'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { ExternalLink, MessageCircle, Clock, CreditCard, Copy } from 'lucide-react'

interface TemporaryPaymentRedirectProps {
  item: {
    _id: string
    title: string
    price: number
    currency: string
    thumbnail?: string
  } | null
  itemType: 'course' | 'consultation'
}

export default function TemporaryPaymentRedirect({ item, itemType }: TemporaryPaymentRedirectProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleStripePayment = () => {
    // Redirect to the Stripe payment link
    window.open('https://buy.stripe.com/4gMcN50cBbdM2yYerM57W0B', '_blank')
  }

  const handleCliqPayment = () => {
    // Copy CliQ account number to clipboard
    navigator.clipboard.writeText('0786437929').then(() => {
      alert('تم نسخ رقم الحساب: 0786437929')
    }).catch(() => {
      // Fallback if clipboard API is not available
      alert('رقم الحساب CliQ: 0786437929')
    })
  }

  const handleWhatsAppContact = () => {
    const message = `مرحباً، قمت بالدفع للكورس: ${item?.title || 'غير محدد'}\nسأرسل لك لقطة شاشة من عملية الدفع.`
    const whatsappUrl = `https://wa.me/962786437929?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#41ADE1]/5 to-[#41ADE1]/10 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#41ADE1] mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#41ADE1]/5 to-[#41ADE1]/10 py-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            إتمام عملية الشراء
          </h1>
          <p className="text-gray-600">
            نظام الدفع المؤقت - سيتم تفعيل حسابك خلال 24 ساعة
          </p>
        </div>

        {/* Item Details */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex items-center gap-4 mb-6">
            {item.thumbnail && (
              <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={item.thumbnail}
                  alt={item.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 mb-1">
                {item.title}
              </h2>
              <p className="text-sm text-gray-600">
                {itemType === 'course' ? 'دورة تدريبية' : 'استشارة'}
              </p>
            </div>
            <div className="text-left">
              <div className="text-2xl font-bold text-[#41ADE1]">
                {item.price} {item.currency}
              </div>
            </div>
          </div>

          {/* Payment Instructions */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#41ADE1]" />
              خطوات الدفع
            </h3>
            
            <div className="space-y-4">
              {/* Step 1: Choose Payment Method */}
              <div className="p-4 bg-[#41ADE1]/10 rounded-lg">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-6 h-6 bg-[#41ADE1] text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                    1
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      اختر طريقة الدفع
                    </h4>
                    <p className="text-gray-600 text-sm mb-4">
                      يمكنك الدفع عبر إحدى الطرق التالية
                    </p>
                  </div>
                </div>
                
                {/* Payment Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mr-9">
                  {/* Stripe Option */}
                  <div className="border border-gray-200 rounded-lg p-4 hover:border-[#41ADE1] transition-colors">
                    <h5 className="font-medium text-gray-900 mb-2">الدفع عبر Visa/Mastercard</h5>
                    <p className="text-gray-600 text-xs mb-3">دفع آمن عبر Stripe</p>
                    <button
                      onClick={handleStripePayment}
                      className="w-full inline-flex items-center justify-center gap-2 bg-[#41ADE1] text-white px-4 py-2 rounded-lg hover:bg-[#41ADE1]/90 transition-colors text-sm"
                    >
                      <ExternalLink className="w-4 h-4" />
                      الدفع عبر visa or master card
                    </button>
                  </div>
                  
                  {/* CliQ Option */}
                  <div className="border border-gray-200 rounded-lg p-4 hover:border-[#41ADE1] transition-colors">
                    <h5 className="font-medium text-gray-900 mb-2">الدفع عبر CliQ</h5>
                    <p className="text-gray-600 text-xs mb-3">رقم الحساب: 0786437929</p>
                    <button
                      onClick={handleCliqPayment}
                      className="w-full inline-flex items-center justify-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm"
                    >
                      <Copy className="w-4 h-4" />
                      نسخ رقم الحساب
                    </button>
                  </div>
                </div>
              </div>

              {/* Step 2: Send Screenshot */}
              <div className="flex items-start gap-3 p-4 bg-emerald-50 rounded-lg">
                <div className="w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                  2
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold !text-black mb-2">
                    أرسل لقطة شاشة للدفع
                  </h4>
                  <p className="!text-black text-sm mb-3">
                    بعد إتمام الدفع، أرسل لقطة شاشة لعملية الدفع للكابتن عبر واتساب
                  </p>
                  <button
                    onClick={handleWhatsAppContact}
                    className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    إرسال عبر واتساب: +962786437929
                  </button>
                </div>
              </div>

              {/* Step 3: Activation */}
              <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg">
                <div className="w-6 h-6 bg-amber-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                  3
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold !text-black mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    تفعيل الحساب
                  </h4>
                  <p className="!text-black text-sm">
                    سيتم تفعيل الكورس في حسابك خلال 24 ساعة من إرسال لقطة الشاشة للكابتن
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Important Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5">⚠️</div>
            <div>
              <h4 className="font-semibold text-amber-800 mb-1">ملاحظة مهمة</h4>
              <p className="text-amber-700 text-sm">
                هذا نظام دفع مؤقت. سيتم استبداله بنظام الدفع الآلي قريباً. 
                تأكد من إرسال لقطة شاشة واضحة لعملية الدفع لضمان التفعيل السريع.
              </p>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="text-center">
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-800 transition-colors"
          >
            ← العودة للخلف
          </button>
        </div>
      </div>
    </div>
  )
}
