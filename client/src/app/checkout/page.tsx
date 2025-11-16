'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { courseAPI, consultationsAPI } from '@/lib/api'
import toast from 'react-hot-toast'
import axios from 'axios'
import Cookies from 'js-cookie'

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
  const [receiptImageUrl, setReceiptImageUrl] = useState<string | null>(null)
  const [uploadingReceipt, setUploadingReceipt] = useState(false)
  const [transferDetails, setTransferDetails] = useState({
    transferReference: '',
    bankName: '',
    accountHolderName: '',
    transferDate: ''
  })

  // Coupon code
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null)
  const [applyingCoupon, setApplyingCoupon] = useState(false)
  const [couponError, setCouponError] = useState<string | null>(null)

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
        
        // Always use consultationId to fetch consultation details
        if (consultationId) {
          const response = await consultationsAPI.getById(consultationId)
          if (response.data && 'consultation' in response.data) {
            setItem(response.data.consultation as Consultation)
          }
        } else if (bookingId) {
          // If only bookingId is provided, we need to fetch the booking to get consultationId
          toast.error('معرف الاستشارة مطلوب')
          router.push('/profile/orders')
          return
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
      
      // Get token from cookies
      const token = Cookies.get('token')
      if (!token) {
        toast.error('يرجى تسجيل الدخول أولاً')
        router.push('/auth/login')
        return
      }
      
      const payload: any = {}
      if (itemType === 'course') {
        payload.courseId = item?._id
      } else {
        payload.consultationBookingId = searchParams.get('bookingId')
      }

      const response = await axios.post(
        `${API_BASE_URL}/payment/paypal/create-order`,
        payload,
        { 
          withCredentials: true,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
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
      
      // Get token from cookies
      const token = Cookies.get('token')
      if (!token) {
        toast.error('يرجى تسجيل الدخول أولاً')
        router.push('/auth/login')
        return
      }
      
      const payload: any = {}
      if (itemType === 'course') {
        payload.courseId = item?._id
      } else {
        payload.consultationBookingId = searchParams.get('bookingId')
      }

      const response = await axios.post(
        `${API_BASE_URL}/payment/stripe/create-session`,
        payload,
        { 
          withCredentials: true,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
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
      // Validate receipt upload
      if (!receiptImageUrl) {
        toast.error('يرجى رفع صورة الإيصال أولاً')
        return
      }

      // Validate transfer details
      if (!transferDetails.transferReference || !transferDetails.bankName || 
          !transferDetails.accountHolderName || !transferDetails.transferDate) {
        toast.error('يرجى ملء جميع بيانات التحويل')
        return
      }

      setProcessing(true)
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050/api'
      
      // Get token from cookies
      const token = Cookies.get('token')
      if (!token) {
        toast.error('يرجى تسجيل الدخول أولاً')
        router.push('/auth/login')
        return
      }
      
      const payload: any = { 
        ...transferDetails,
        receiptImage: receiptImageUrl, // Include receipt URL
        amount: calculateFinalPrice(),
        currency: item?.currency || 'SAR'
      }

      // Add coupon if applied
      if (appliedCoupon) {
        payload.couponCode = appliedCoupon.code
      }

      if (itemType === 'course') {
        payload.courseId = item?._id
      } else {
        payload.consultationBookingId = searchParams.get('bookingId')
      }
      
      console.log('Bank transfer payload being sent:', {
        ...payload,
        receiptImageUrl: receiptImageUrl,
        hasReceiptImage: !!receiptImageUrl,
        receiptImageLength: receiptImageUrl?.length
      })

      const response = await axios.post(
        `${API_BASE_URL}/payment/bank-transfer/create-order`,
        payload,
        { 
          withCredentials: true,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.data.success && response.data.order) {
        toast.success('تم إرسال طلب التحويل البنكي بنجاح. سيتم مراجعته قريباً')
        // Redirect to profile orders page
        router.push('/profile/orders?status=pending')
      } else {
        throw new Error('فشل في إنشاء طلب التحويل البنكي')
      }
    } catch (error: any) {
      console.error('Bank transfer error:', error)
      const errorMessage = error.response?.data?.arabic || error.response?.data?.message || 'فشل في إنشاء طلب التحويل البنكي'
      toast.error(errorMessage)
    } finally {
      setProcessing(false)
    }
  }

  const handleReceiptImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

      setReceiptImage(file)
    
    // Show preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setReceiptPreview(reader.result as string)
      }
      reader.readAsDataURL(file)

    // Auto-upload the image
    await uploadReceiptImage(file)
  }

  const uploadReceiptImage = async (file: File) => {
    try {
      setUploadingReceipt(true)
      console.log('Starting receipt upload...', { 
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type 
      })
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('يرجى اختيار صورة فقط (JPG, PNG, إلخ)')
        setReceiptImage(null)
        setReceiptPreview(null)
        return
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('حجم الصورة كبير جداً. الحد الأقصى 10MB')
        setReceiptImage(null)
        setReceiptPreview(null)
        return
      }
      
      // Get token from cookies
      const token = Cookies.get('token')
      if (!token) {
        toast.error('يرجى تسجيل الدخول أولاً')
        router.push('/auth/login')
        return
      }
      
      // Create FormData for image upload
      const formData = new FormData()
      formData.append('file', file)
      
      console.log('Uploading image to server...', {
        backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5050'
      })
      
      // Upload image to Cloudinary
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5050'
      const uploadResponse = await axios.post(
        `${backendUrl}/api/upload/single`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          },
          timeout: 60000
        }
      )
      
      console.log('Upload response:', uploadResponse.data)
      
      if (!uploadResponse.data.success) {
        const errorMsg = uploadResponse.data.arabic || uploadResponse.data.error || uploadResponse.data.message || 'فشل في رفع الصورة'
        throw new Error(errorMsg)
      }

      const uploadedFile = uploadResponse.data.data?.file
      const imageUrl = uploadedFile?.url || uploadedFile?.secure_url
      
      if (!imageUrl) {
        console.error('No image URL in response:', uploadResponse.data)
        throw new Error('لم يتم الحصول على رابط الصورة')
      }

      setReceiptImageUrl(imageUrl)
      toast.success('تم رفع صورة الإيصال بنجاح')
      console.log('Image uploaded successfully:', imageUrl)
    } catch (error: any) {
      console.error('Receipt upload error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        code: error.code
      })
      
      // Clear the image on error
      setReceiptImage(null)
      setReceiptPreview(null)
      setReceiptImageUrl(null)
      
      let errorMessage = 'فشل في رفع صورة الإيصال'
      
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'انتهت مهلة رفع الصورة. يرجى المحاولة مرة أخرى'
      } else if (error.response) {
        const status = error.response.status
        if (status === 401) {
          errorMessage = 'يرجى تسجيل الدخول مرة أخرى'
        } else if (status === 413) {
          errorMessage = 'حجم الصورة كبير جداً'
        } else if (status === 500) {
          errorMessage = 'خطأ في الخادم. يرجى التحقق من إعدادات Cloudinary'
        } else {
          errorMessage = error.response.data?.arabic || error.response.data?.error || error.response.data?.message || errorMessage
        }
        console.error('Server error response:', error.response.data)
      } else if (error.request) {
        errorMessage = 'لا يوجد اتصال بالخادم. تحقق من تشغيل الـ backend'
        console.error('No response received:', error.request)
      } else {
        errorMessage = error.message || errorMessage
      }
      
      toast.error(errorMessage)
    } finally {
      setUploadingReceipt(false)
    }
  }

  // Old handleUploadReceipt function removed - now uploads automatically when image is selected

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('الرجاء إدخال كود الخصم')
      return
    }

    try {
      setApplyingCoupon(true)
      setCouponError(null)

      const token = Cookies.get('token')
      if (!token) {
        toast.error('يرجى تسجيل الدخول أولاً')
        return
      }

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5050'
      const response = await axios.post(
        `${backendUrl}/api/coupons/validate`,
        {
          code: couponCode.trim().toUpperCase(),
          courseId: itemType === 'course' ? item?._id : null,
          consultationId: itemType === 'consultation' ? item?._id : null,
          purchaseAmount: item?.price || 0
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.data.success && response.data.coupon) {
        setAppliedCoupon(response.data.coupon)
        toast.success(`تم تطبيق كود الخصم! خصم ${response.data.coupon.discountType === 'percentage' ? response.data.coupon.discountValue + '%' : response.data.coupon.discountValue + ' ' + item?.currency}`)
      } else {
        throw new Error('كود الخصم غير صالح')
      }
    } catch (error: any) {
      console.error('Apply coupon error:', error)
      
      let errorMsg = 'كود الخصم غير صالح أو منتهي الصلاحية'
      
      if (error.response) {
        // Check status code
        if (error.response.status === 404) {
          errorMsg = 'كود الخصم غير موجود'
        } else if (error.response.status === 400) {
          errorMsg = error.response.data?.arabic || 'كود الخصم غير صالح لهذا المنتج'
        } else {
          errorMsg = error.response.data?.arabic || error.response.data?.message || errorMsg
        }
      } else if (error.request) {
        errorMsg = 'فشل الاتصال بالخادم'
      }
      
      setCouponError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setApplyingCoupon(false)
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponCode('')
    setCouponError(null)
    toast.success('تم إزالة كود الخصم')
  }

  const calculateDiscount = () => {
    if (!appliedCoupon || !item) return 0

    if (appliedCoupon.discountType === 'percentage') {
      return (item.price * appliedCoupon.discountValue) / 100
    } else {
      return appliedCoupon.discountValue
    }
  }

  const calculateFinalPrice = () => {
    if (!item) return 0
    const discount = calculateDiscount()
    const finalPrice = item.price - discount
    return Math.max(finalPrice, 0) // Ensure price doesn't go negative
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
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#41ADE1]/30 border-t-[#41ADE1] mx-auto mb-6"></div>
            <p className="text-gray-700 text-lg font-medium">جاري تحميل معلومات الدفع...</p>
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
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="text-center bg-white rounded-2xl shadow-lg p-12 border border-gray-200">
            <svg className="w-20 h-20 mx-auto mb-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-600 text-2xl font-bold mb-2">لم يتم العثور على العنصر</p>
            <p className="text-gray-600 mb-6">عذراً، لا يمكن العثور على المنتج المطلوب</p>
            <button
              onClick={() => window.history.back()}
              className="bg-gradient-to-r from-[#41ADE1] to-indigo-600 hover:from-[#3399CC] hover:to-indigo-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl"
            >
              العودة
            </button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  const price = item.price
  const currency = item.currency === 'USD' ? '$' : item.currency === 'SAR' ? 'ر.س' : 'ج.م'

  return (
    <div className="min-h-screen">
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center">
            <svg className="w-10 h-10 ml-3 text-[#41ADE1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            إتمام عملية الدفع
          </h1>
          <p className="text-gray-600 text-lg mr-13">أكمل معلومات الدفع لتفعيل طلبك</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
        {/* Payment Method Selection */}
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <div className="w-2 h-8 bg-gradient-to-b from-[#41ADE1] to-indigo-600 rounded-full ml-3"></div>
                  اختر طريقة الدفع
                </h2>
            
            <div className="space-y-4">
              {/* PayPal */}
              <button
                onClick={() => setSelectedMethod('paypal')}
                    className={`w-full p-6 rounded-xl border-2 transition-all duration-200 hover:shadow-md ${
                  selectedMethod === 'paypal'
                        ? 'border-[#41ADE1] bg-[#41ADE1] shadow-md'
                        : 'border-gray-200 hover:border-[#41ADE1]/50 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                        <div className="w-20 h-16 bg-gradient-to-br from-[#41ADE1]/20 to-[#41ADE1]/30 rounded-xl flex items-center justify-center shadow-sm p-3 border border-[#41ADE1]/30">
                          <div className="relative w-full h-full">
                            <Image
                              src="/payment logos/paypal.png"
                              alt="PayPal"
                              fill
                              className="object-contain"
                            />
                          </div>
                    </div>
                    <div className="text-right">
                          <h3 className={`font-bold text-lg ${selectedMethod === 'paypal' ? 'text-white' : 'text-gray-900'}`}>PayPal</h3>
                          <p className={`text-sm ${selectedMethod === 'paypal' ? 'text-[#41ADE1]/40' : 'text-gray-600'}`}>دفع فوري وآمن عبر PayPal</p>
                    </div>
                  </div>
                      <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                    selectedMethod === 'paypal'
                      ? 'border-white bg-[#41ADE1]'
                          : 'border-white'
                  }`}>
                    {selectedMethod === 'paypal' && (
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
              </button>

              {/* Stripe */}
              <button
                onClick={() => setSelectedMethod('stripe')}
                    className={`w-full p-6 rounded-xl border-2 transition-all duration-200 hover:shadow-md ${
                  selectedMethod === 'stripe'
                        ? 'border-purple-500 bg-purple-500 shadow-md'
                        : 'border-gray-200 hover:border-purple-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                        <div className="w-20 h-16 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl flex items-center justify-center shadow-sm p-3 border border-purple-200">
                          <div className="relative w-full h-full">
                            <Image
                              src="/payment logos/stripe.png"
                              alt="Stripe"
                              fill
                              className="object-contain"
                            />
                          </div>
                    </div>
                    <div className="text-right">
                          <h3 className={`font-bold text-lg ${selectedMethod === 'stripe' ? 'text-white' : 'text-gray-900'}`}>Stripe</h3>
                          <p className={`text-sm ${selectedMethod === 'stripe' ? 'text-purple-100' : 'text-gray-600'}`}>بطاقة ائتمان أو خصم</p>
                    </div>
                  </div>
                      <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                    selectedMethod === 'stripe'
                      ? 'border-white bg-purple-500'
                          : 'border-white'
                  }`}>
                    {selectedMethod === 'stripe' && (
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
              </button>

              {/* Bank Transfer */}
              <button
                onClick={() => setSelectedMethod('bank_transfer')}
                    className={`w-full p-6 rounded-xl border-2 transition-all duration-200 hover:shadow-md ${
                  selectedMethod === 'bank_transfer'
                        ? 'border-green-500 bg-green-500 shadow-md'
                        : 'border-gray-200 hover:border-green-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                        <div className="w-20 h-16 bg-gradient-to-br from-green-50 to-green-100 rounded-xl flex items-center justify-center shadow-sm p-3 border border-green-200">
                          <div className="relative w-full h-full">
                            <Image
                              src="/payment logos/bank.png"
                              alt="Bank Transfer"
                              fill
                              className="object-contain"
                            />
                          </div>
                    </div>
                    <div className="text-right">
                          <h3 className={`font-bold text-lg ${selectedMethod === 'bank_transfer' ? 'text-white' : 'text-gray-900'}`}>تحويل بنكي</h3>
                          <p className={`text-sm ${selectedMethod === 'bank_transfer' ? 'text-green-100' : 'text-gray-600'}`}>تحويل مباشر إلى حسابنا البنكي</p>
                    </div>
                  </div>
                      <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                    selectedMethod === 'bank_transfer'
                      ? 'border-white bg-green-500'
                          : 'border-white'
                  }`}>
                    {selectedMethod === 'bank_transfer' && (
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
              </button>
            </div>

            {/* Bank Transfer Details */}
            {selectedMethod === 'bank_transfer' && (
                  <div className="mt-6 p-6 bg-[#11192a] rounded-xl">
                    <div className="flex items-center mb-5">
                      <svg className="w-6 h-6 ml-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <h3 className="text-gray-900 font-bold text-lg">معلومات التحويل البنكي</h3>
                  </div>
                    
                    <div className="bg-white rounded-xl p-5 mb-5 shadow-sm">
                      <div className="grid grid-cols-1 gap-4">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                          <span className="text-gray-600 font-medium">اسم البنك:</span>
                          <span className="text-gray-900 font-bold">البنك الأهلي السعودي</span>
                  </div>
                        <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                          <span className="text-gray-600 font-medium">رقم الحساب:</span>
                          <span className="text-gray-900 font-bold font-mono">SA1234567890123456</span>
                  </div>
                        <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                          <span className="text-gray-600 font-medium">اسم المستفيد:</span>
                          <span className="text-gray-900 font-bold">طه الصباغ</span>
                  </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 font-medium">IBAN:</span>
                          <span className="text-gray-900 font-bold font-mono">SA1234567890123456</span>
                  </div>
                  </div>
                </div>

                <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          اسم البنك *
                        </label>
                  <input
                    type="text"
                          placeholder="مثال: البنك الأهلي السعودي"
                    value={transferDetails.bankName}
                    onChange={(e) => setTransferDetails({ ...transferDetails, bankName: e.target.value })}
                          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                          required
                  />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          اسم صاحب الحساب *
                        </label>
                  <input
                    type="text"
                          placeholder="الاسم كما يظهر في الإيصال"
                    value={transferDetails.accountHolderName}
                    onChange={(e) => setTransferDetails({ ...transferDetails, accountHolderName: e.target.value })}
                          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                          required
                  />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          رقم مرجع التحويل
                        </label>
                  <input
                    type="text"
                          placeholder="أدخل رقم مرجع التحويل"
                    value={transferDetails.transferReference}
                    onChange={(e) => setTransferDetails({ ...transferDetails, transferReference: e.target.value })}
                          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                          required
                  />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          تاريخ التحويل *
                        </label>
                  <input
                    type="date"
                    value={transferDetails.transferDate}
                    onChange={(e) => setTransferDetails({ ...transferDetails, transferDate: e.target.value })}
                          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                          required
                  />
                </div>
                    </div>

                    {/* Receipt Upload */}
                    <div className="mt-6">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        رفع صورة الإيصال *
                      </label>
                      
                      {!receiptPreview ? (
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleReceiptImageChange}
                            className="hidden"
                            id="receipt-upload"
                            disabled={uploadingReceipt}
                          />
                          <label
                            htmlFor="receipt-upload"
                            className={`flex flex-col items-center justify-center w-full h-48 px-4 transition bg-white border-2 border-dashed rounded-xl appearance-none cursor-pointer hover:border-green-400 focus:outline-none group ${
                              uploadingReceipt ? 'border-[#41ADE1]/80 bg-[#41ADE1]/20' : 'border-gray-300'
                            }`}
                          >
                            {uploadingReceipt ? (
                              <div className="flex flex-col items-center justify-center">
                                <svg className="animate-spin h-12 w-12 text-[#41ADE1] mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <p className="text-lg font-semibold text-[#3399CC]">جاري رفع الصورة...</p>
                                <p className="text-sm text-[#41ADE1] mt-1">يرجى الانتظار</p>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <svg className="w-12 h-12 mb-3 text-gray-400 group-hover:text-green-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                <p className="mb-2 text-base font-semibold text-gray-700">
                                  اضغط لاختيار صورة الإيصال
                                </p>
                                <p className="text-xs text-gray-500">PNG, JPG أو JPEG (الحد الأقصى 10MB)</p>
                              </div>
                            )}
                          </label>
                        </div>
                      ) : (
                        <div className="relative">
                          <div className="relative rounded-xl overflow-hidden border-2 border-green-500 shadow-md">
                            <img
                              src={receiptPreview}
                              alt="Receipt preview"
                              className="w-full h-auto"
                            />
                            {receiptImageUrl && (
                              <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                تم الرفع بنجاح
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => {
                              setReceiptImage(null);
                              setReceiptPreview(null);
                              setReceiptImageUrl(null);
                            }}
                            className="mt-3 w-full bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            حذف الصورة واختيار أخرى
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="mt-5 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                      <div className="flex items-start">
                        <svg className="w-5 h-5 text-amber-600 ml-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <p className="text-sm text-amber-800 leading-relaxed">
                          يرجى رفع صورة واضحة لإيصال التحويل البنكي. سيتم مراجعة طلبك خلال 24-48 ساعة.
                        </p>
                      </div>
                </div>
              </div>
            )}

            {/* Proceed Button */}
            <button
              onClick={handleProceed}
              disabled={!selectedMethod || processing}
                  className="w-full mt-6 bg-gradient-to-r from-[#41ADE1] to-indigo-600 hover:from-[#3399CC] hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
                >
                  {processing ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin ml-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      جاري المعالجة...
                    </span>
                  ) : (
                    'متابعة الدفع'
                  )}
            </button>
          </div>

        {/* Receipt Upload Section (Bank Transfer) - REMOVED, now integrated in bank transfer form */}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 sticky top-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <div className="w-2 h-6 bg-gradient-to-b from-[#41ADE1] to-indigo-600 rounded-full ml-3"></div>
                ملخص الطلب
              </h2>
            
            <div className="mb-6">
                {'thumbnail' in item && (
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-48 object-cover rounded-xl mb-4 shadow-sm"
                  />
                )}
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                {'duration' in item && (
                  <p className="text-gray-600 flex items-center">
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {item.duration}
                  </p>
                )}
            </div>

              {/* Coupon Code Section */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  كود الخصم (اختياري)
                </label>
                {!appliedCoupon ? (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => {
                          setCouponCode(e.target.value.toUpperCase())
                          setCouponError(null)
                        }}
                        placeholder="أدخل كود الخصم"
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-[#41ADE1] focus:border-transparent transition-all uppercase"
                        disabled={applyingCoupon}
                      />
                      <button
                        onClick={handleApplyCoupon}
                        disabled={applyingCoupon || !couponCode.trim()}
                        className="px-6 py-3 bg-gradient-to-r from-[#41ADE1] to-indigo-600 hover:from-[#3399CC] hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all shadow-md hover:shadow-lg whitespace-nowrap"
                      >
                        {applyingCoupon ? 'جاري التحقق...' : 'تطبيق'}
                      </button>
                    </div>
                    {couponError && (
                      <p className="text-sm text-red-600 flex items-center">
                        <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {couponError}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-green-600 ml-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="font-bold text-green-900">{appliedCoupon.code}</span>
                      </div>
                      <button
                        onClick={handleRemoveCoupon}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        إزالة
                      </button>
                    </div>
                    <p className="text-sm text-green-700">
                      {appliedCoupon.discountType === 'percentage' 
                        ? `خصم ${appliedCoupon.discountValue}%` 
                        : `خصم ${appliedCoupon.discountValue} ${currency}`
                      }
                    </p>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200 pt-4 mb-6 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">السعر الأصلي:</span>
                  <span className={`text-xl font-bold ${appliedCoupon ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                    {price}{currency}
                  </span>
                </div>
                
                {appliedCoupon && (
                  <div className="flex justify-between items-center text-green-600">
                    <span className="font-medium">الخصم:</span>
                    <span className="text-lg font-bold">
                      - {calculateDiscount()}{currency}
                    </span>
              </div>
            )}

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">الضريبة:</span>
                  <span className="text-gray-900 font-medium">متضمنة</span>
                </div>
              </div>
              
              <div className="bg-[#11192a] rounded-xl p-4 border border-[#41ADE1]/30">
                <div className="flex justify-between items-center">
                  <span className="text-white font-bold text-lg">المجموع:</span>
                  <span className="text-3xl font-bold bg-gradient-to-r from-[#41ADE1] to-indigo-400 bg-clip-text text-transparent">
                    {calculateFinalPrice()}{currency}
                  </span>
                </div>
                {appliedCoupon && (
                  <div className="mt-2 text-center">
                    <span className="text-xs text-green-400 font-medium">
                      وفرت {calculateDiscount()}{currency}! 🎉
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-green-600 ml-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div className="text-sm text-green-800">
                    <p className="font-semibold mb-1">دفع آمن ومضمون</p>
                    <p className="leading-relaxed">جميع المعاملات محمية ومشفرة</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen">
        <Header />
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#41ADE1]/30 border-t-[#41ADE1] mx-auto mb-6"></div>
            <p className="text-gray-700 text-lg font-medium">جاري تحميل معلومات الدفع...</p>
          </div>
        </div>
        <Footer />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  )
}

