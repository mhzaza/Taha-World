'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { courseAPI, consultationsAPI, uploadAPI } from '@/lib/api'
import toast from 'react-hot-toast'
import axios from 'axios'

interface Course {
  _id: string
  title: string
  thumbnail: string
  price: number
  currency: string
}

interface Consultation {
  _id: string
  title: string
  price: number
  currency: string
  duration: string
}

type PaymentMethod = 'paypal' | 'stripe' | 'bank_transfer'

function CheckoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null)
  const [item, setItem] = useState<Course | Consultation | null>(null)
  const [itemType, setItemType] = useState<'course' | 'consultation'>('course')
  
  // Bank transfer specific
  const [receiptImage, setReceiptImage] = useState<File | null>(null)
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null)
  const [uploadingReceipt, setUploadingReceipt] = useState(false)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [transferDetails, setTransferDetails] = useState({
    transferReference: '',
    bankName: '',
    accountHolderName: '',
    transferDate: ''
  })

  useEffect(() => {
    loadCheckoutData()
  }, [])

  const loadCheckoutData = async () => {
    try {
      setLoading(true)
      const courseId = searchParams.get('courseId')
      const consultationId = searchParams.get('consultationId')
      const bookingId = searchParams.get('bookingId')

      if (courseId) {
        setItemType('course')
        const response = await courseAPI.getCourse(courseId)
        if (response.data && 'course' in response.data) {
          setItem(response.data.course as Course)
        }
      } else if (consultationId || bookingId) {
        setItemType('consultation')
        const id = bookingId || consultationId
        if (id) {
          const response = await consultationsAPI.getById(id)
          if (response.data && 'consultation' in response.data) {
            setItem(response.data.consultation as Consultation)
          }
        }
      } else {
        toast.error('معرف غير صالح')
        router.push('/')
      }
    } catch (error) {
      console.error('Error loading checkout data:', error)
      toast.error('فشل في تحميل البيانات')
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  const handlePayPal = async () => {
    try {
      setProcessing(true)
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050/api'
      
      const payload: any = {}
      if (itemType === 'course') {
        payload.courseId = item?._id
      } else {
        payload.consultationBookingId = searchParams.get('bookingId')
      }

      const response = await axios.post(
        `${API_BASE_URL}/payment/paypal/create-order`,
        payload,
        { withCredentials: true }
      )

      if (response.data.success && response.data.approvalUrl) {
        window.location.href = response.data.approvalUrl
      } else {
        throw new Error('فشل في إنشاء طلب الدفع')
      }
    } catch (error) {
      console.error('PayPal error:', error)
      toast.error('فشل في الدفع عبر PayPal')
      setProcessing(false)
    }
  }

  const handleStripe = async () => {
    try {
      setProcessing(true)
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050/api'
      
      const payload: any = {}
      if (itemType === 'course') {
        payload.courseId = item?._id
      } else {
        payload.consultationBookingId = searchParams.get('bookingId')
      }

      const response = await axios.post(
        `${API_BASE_URL}/payment/stripe/create-session`,
        payload,
        { withCredentials: true }
      )

      if (response.data.success && response.data.checkoutUrl) {
        window.location.href = response.data.checkoutUrl
      } else {
        throw new Error('فشل في إنشاء جلسة Stripe')
      }
    } catch (error) {
      console.error('Stripe error:', error)
      toast.error('فشل في الدفع عبر Stripe')
      setProcessing(false)
    }
  }

  const handleBankTransferInit = async () => {
    try {
      setProcessing(true)
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050/api'
      
      const payload: any = { ...transferDetails }
      if (itemType === 'course') {
        payload.courseId = item?._id
      } else {
        payload.consultationBookingId = searchParams.get('bookingId')
      }

      const response = await axios.post(
        `${API_BASE_URL}/payment/bank-transfer/create-order`,
        payload,
        { withCredentials: true }
      )

      if (response.data.success && response.data.order) {
        setOrderId(response.data.order._id)
        toast.success('تم إنشاء الطلب. يرجى رفع صورة الإيصال')
      } else {
        throw new Error('فشل في إنشاء طلب التحويل البنكي')
      }
    } catch (error) {
      console.error('Bank transfer error:', error)
      toast.error('فشل في إنشاء طلب التحويل البنكي')
    } finally {
      setProcessing(false)
    }
  }

  const handleReceiptImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setReceiptImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setReceiptPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUploadReceipt = async () => {
    if (!receiptImage || !orderId) {
      toast.error('يرجى اختيار صورة الإيصال')
      return
    }

    try {
      setUploadingReceipt(true)
      
      // Upload image to Cloudinary
      const uploadResponse = await uploadAPI.uploadSingle(receiptImage)
      
      if (!uploadResponse.data.success) {
        throw new Error('فشل في رفع الصورة')
      }

      const uploadedFile = uploadResponse.data.data?.file as any
      const receiptImageUrl = uploadedFile?.url || uploadedFile?.secure_url
      const receiptImagePublicId = uploadedFile?.public_id

      // Submit receipt to backend
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050/api'
      const response = await axios.post(
        `${API_BASE_URL}/payment/bank-transfer/upload-receipt/${orderId}`,
        {
          receiptImage: receiptImageUrl,
          receiptImagePublicId
        },
        { withCredentials: true }
      )

      if (response.data.success) {
        toast.success('تم رفع الإيصال بنجاح! في انتظار الموافقة')
        setTimeout(() => {
          router.push('/profile/payments')
        }, 2000)
      } else {
        throw new Error('فشل في رفع الإيصال')
      }
    } catch (error) {
      console.error('Upload receipt error:', error)
      toast.error('فشل في رفع صورة الإيصال')
    } finally {
      setUploadingReceipt(false)
    }
  }

  const handleProceed = async () => {
    if (!selectedMethod) {
      toast.error('يرجى اختيار طريقة الدفع')
      return
    }

    switch (selectedMethod) {
      case 'paypal':
        await handlePayPal()
        break
      case 'stripe':
        await handleStripe()
        break
      case 'bank_transfer':
        await handleBankTransferInit()
        break
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-400">جاري التحميل...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!item) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="text-center">
            <p className="text-red-500 text-xl">لم يتم العثور على العنصر</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  const price = item.price
  const currency = item.currency === 'USD' ? '$' : item.currency === 'SAR' ? 'ر.س' : 'ج.م'

  return (
    <div className="min-h-screen bg-gray-900">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-white mb-8">تأكيد الحجز ومتابعة الدفع</h1>

        {/* Order Summary */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">ملخص الطلب</h2>
          <div className="flex items-center gap-4 mb-4">
            {'thumbnail' in item && (
              <img
                src={item.thumbnail}
                alt={item.title}
                className="w-24 h-24 object-cover rounded"
              />
            )}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white">{item.title}</h3>
              {'duration' in item && (
                <p className="text-gray-400">{item.duration}</p>
              )}
            </div>
          </div>
          <div className="border-t border-gray-700 pt-4">
            <div className="flex justify-between text-lg">
              <span className="text-gray-300">المجموع:</span>
              <span className="text-2xl font-bold text-blue-400">
                {price}{currency}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Method Selection */}
        {!orderId && (
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-4">اختر طريقة الدفع</h2>
            
            <div className="space-y-4">
              {/* PayPal */}
              <button
                onClick={() => setSelectedMethod('paypal')}
                className={`w-full p-6 rounded-lg border-2 transition-all ${
                  selectedMethod === 'paypal'
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold">PP</span>
                    </div>
                    <div className="text-right">
                      <h3 className="text-white font-semibold">PayPal</h3>
                      <p className="text-sm text-gray-400">دفع فوري وآمن</p>
                    </div>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 ${
                    selectedMethod === 'paypal'
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-600'
                  }`}>
                    {selectedMethod === 'paypal' && (
                      <svg className="w-full h-full text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
              </button>

              {/* Stripe */}
              <button
                onClick={() => setSelectedMethod('stripe')}
                className={`w-full p-6 rounded-lg border-2 transition-all ${
                  selectedMethod === 'stripe'
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold">S</span>
                    </div>
                    <div className="text-right">
                      <h3 className="text-white font-semibold">Stripe</h3>
                      <p className="text-sm text-gray-400">بطاقة ائتمان أو خصم</p>
                    </div>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 ${
                    selectedMethod === 'stripe'
                      ? 'border-purple-500 bg-purple-500'
                      : 'border-gray-600'
                  }`}>
                    {selectedMethod === 'stripe' && (
                      <svg className="w-full h-full text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
              </button>

              {/* Bank Transfer */}
              <button
                onClick={() => setSelectedMethod('bank_transfer')}
                className={`w-full p-6 rounded-lg border-2 transition-all ${
                  selectedMethod === 'bank_transfer'
                    ? 'border-green-500 bg-green-500/10'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold">🏦</span>
                    </div>
                    <div className="text-right">
                      <h3 className="text-white font-semibold">تحويل بنكي</h3>
                      <p className="text-sm text-gray-400">تحويل مباشر إلى حسابنا البنكي</p>
                    </div>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 ${
                    selectedMethod === 'bank_transfer'
                      ? 'border-green-500 bg-green-500'
                      : 'border-gray-600'
                  }`}>
                    {selectedMethod === 'bank_transfer' && (
                      <svg className="w-full h-full text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
              </button>
            </div>

            {/* Bank Transfer Details */}
            {selectedMethod === 'bank_transfer' && (
              <div className="mt-6 p-6 bg-gray-700/50 rounded-lg">
                <h3 className="text-white font-semibold mb-4">معلومات التحويل البنكي</h3>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between border-b border-gray-600 pb-2">
                    <span className="text-gray-400">اسم البنك:</span>
                    <span className="text-white font-medium">البنك الأهلي السعودي</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-600 pb-2">
                    <span className="text-gray-400">رقم الحساب:</span>
                    <span className="text-white font-medium">SA1234567890123456</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-600 pb-2">
                    <span className="text-gray-400">اسم المستفيد:</span>
                    <span className="text-white font-medium">طه الصباغ</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-600 pb-2">
                    <span className="text-gray-400">IBAN:</span>
                    <span className="text-white font-medium">SA1234567890123456</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="رقم مرجع التحويل (اختياري)"
                    value={transferDetails.transferReference}
                    onChange={(e) => setTransferDetails({ ...transferDetails, transferReference: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
                  />
                  <input
                    type="date"
                    placeholder="تاريخ التحويل"
                    value={transferDetails.transferDate}
                    onChange={(e) => setTransferDetails({ ...transferDetails, transferDate: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
                  />
                </div>
              </div>
            )}

            {/* Proceed Button */}
            <button
              onClick={handleProceed}
              disabled={!selectedMethod || processing}
              className="w-full mt-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-8 py-4 rounded-lg font-bold text-lg transition-colors"
            >
              {processing ? 'جاري المعالجة...' : 'متابعة الدفع'}
            </button>
          </div>
        )}

        {/* Receipt Upload Section (Bank Transfer) */}
        {orderId && selectedMethod === 'bank_transfer' && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">رفع صورة الإيصال</h2>
            
            <div className="mb-6">
              <label className="block text-gray-300 mb-2">
                يرجى رفع صورة واضحة لإيصال التحويل البنكي
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleReceiptImageChange}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700"
              />
            </div>

            {receiptPreview && (
              <div className="mb-6">
                <img
                  src={receiptPreview}
                  alt="Receipt preview"
                  className="max-w-full h-auto rounded-lg border-2 border-gray-600"
                />
              </div>
            )}

            <button
              onClick={handleUploadReceipt}
              disabled={!receiptImage || uploadingReceipt}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-8 py-4 rounded-lg font-bold text-lg transition-colors"
            >
              {uploadingReceipt ? 'جاري الرفع...' : 'رفع الإيصال'}
            </button>

            <p className="text-gray-400 text-sm mt-4 text-center">
              سيتم مراجعة الإيصال من قبل الإدارة وسيتم تفعيل الطلب بعد الموافقة
            </p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  )
}

