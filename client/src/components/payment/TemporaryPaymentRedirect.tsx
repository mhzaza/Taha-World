'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { ExternalLink, MessageCircle, Clock, CreditCard } from 'lucide-react'

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

  const handleWhatsAppContact = () => {
    const message = `مرحباً، قمت بالدفع للكورس: ${item?.title || 'غير محدد'}\nسأرسل لك لقطة شاشة من عملية الدفع.`
    const whatsappUrl = `https://wa.me/962786437929?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
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
              <div className="text-2xl font-bold text-blue-600">
                {item.price} {item.currency}
              </div>
            </div>
          </div>

          {/* Payment Instructions */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-600" />
              خطوات الدفع
            </h3>
            
            <div className="space-y-4">
              {/* Step 1: Pay via Stripe */}
              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                  1
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    ادفع عبر Stripe
                  </h4>
                  <p className="text-gray-600 text-sm mb-3">
                    انقر على الزر أدناه للدفع بشكل آمن عبر Stripe
                  </p>
                  <button
                    onClick={handleStripePayment}
                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    الدفع عبر Stripe
                  </button>
                </div>
              </div>

              {/* Step 2: Send Screenshot */}
              <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                  2
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    أرسل لقطة شاشة للدفع
                  </h4>
                  <p className="text-gray-600 text-sm mb-3">
                    بعد إتمام الدفع، أرسل لقطة شاشة لعملية الدفع عبر واتساب
                  </p>
                  <button
                    onClick={handleWhatsAppContact}
                    className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    إرسال عبر واتساب: +962786437929
                  </button>
                </div>
              </div>

              {/* Step 3: Activation */}
              <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg">
                <div className="w-6 h-6 bg-yellow-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                  3
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    تفعيل الحساب
                  </h4>
                  <p className="text-gray-600 text-sm">
                    سيتم تفعيل حسابك وإضافة الكورس خلال 24 ساعة من إرسال لقطة الشاشة
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
