'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { consultationsAPI } from '@/lib/api';
import toast from 'react-hot-toast';

interface User {
  _id: string;
  email: string;
  displayName: string;
  phone?: string;
  gender?: 'male' | 'female' | 'other';
  fitnessLevel?: 'beginner' | 'intermediate' | 'advanced';
  goals?: string[];
}

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
}

interface ConsultationBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  consultation: Consultation;
  user: User;
  onBookingComplete: (bookingId: string) => void;
}

interface BookingFormData {
  preferredDate: string;
  preferredTime: string;
  alternativeDate: string;
  alternativeTime: string;
  meetingType: 'online' | 'in_person';
  userDetails: {
    age: number | '';
    gender: string;
    weight: number | '';
    height: number | '';
    fitnessLevel: string;
    medicalConditions: string;
    currentActivity: string;
    goals: string[];
    dietaryRestrictions: string;
    injuries: string;
    medications: string;
    additionalNotes: string;
  };
}

export default function ConsultationBookingModal({
  isOpen,
  onClose,
  consultation,
  user,
  onBookingComplete
}: ConsultationBookingModalProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<BookingFormData>({
    preferredDate: '',
    preferredTime: '',
    alternativeDate: '',
    alternativeTime: '',
    meetingType: consultation.consultationType === 'both' ? 'online' : consultation.consultationType as any,
    userDetails: {
      age: '',
      gender: user.gender || '',
      weight: '',
      height: '',
      fitnessLevel: user.fitnessLevel || '',
      medicalConditions: '',
      currentActivity: '',
      goals: user.goals || [],
      dietaryRestrictions: '',
      injuries: '',
      medications: '',
      additionalNotes: ''
    }
  });

  // Get minimum date (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUserDetailsChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      userDetails: {
        ...prev.userDetails,
        [field]: value
      }
    }));
  };

  const handleGoalsChange = (goal: string) => {
    const currentGoals = formData.userDetails.goals;
    const newGoals = currentGoals.includes(goal)
      ? currentGoals.filter(g => g !== goal)
      : [...currentGoals, goal];
    
    handleUserDetailsChange('goals', newGoals);
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        const missingFields: string[] = [];
        
        if (!formData.preferredDate) {
          missingFields.push('التاريخ المفضل');
        }
        if (!formData.preferredTime) {
          missingFields.push('الوقت المفضل');
        }
        
        if (missingFields.length > 0) {
          toast.error(`يرجى ملء: ${missingFields.join('، ')}`);
          return false;
        }
        return true;
      case 2:
        if (!formData.meetingType) {
          toast.error('يرجى اختيار نوع الجلسة (عبر الإنترنت أو حضورية)');
          return false;
        }
        return true;
      case 3:
        return true; // Optional fields
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    try {
      setLoading(true);

      const bookingData = {
        consultationId: consultation._id,
        preferredDate: formData.preferredDate,
        preferredTime: formData.preferredTime,
        alternativeDate: formData.alternativeDate || undefined,
        alternativeTime: formData.alternativeTime || undefined,
        meetingType: formData.meetingType,
        userDetails: {
          age: formData.userDetails.age || undefined,
          gender: formData.userDetails.gender || undefined,
          weight: formData.userDetails.weight || undefined,
          height: formData.userDetails.height || undefined,
          fitnessLevel: formData.userDetails.fitnessLevel || undefined,
          medicalConditions: formData.userDetails.medicalConditions || undefined,
          currentActivity: formData.userDetails.currentActivity || undefined,
          goals: formData.userDetails.goals.length > 0 ? formData.userDetails.goals : undefined,
          dietaryRestrictions: formData.userDetails.dietaryRestrictions || undefined,
          injuries: formData.userDetails.injuries || undefined,
          medications: formData.userDetails.medications || undefined,
          additionalNotes: formData.userDetails.additionalNotes || undefined
        }
      };

      const response = await consultationsAPI.createBooking(bookingData);
      
      if (response.data.success && response.data.booking) {
        const booking = response.data.booking as any;
        toast.success('تم إنشاء الحجز بنجاح!');
        onBookingComplete(booking._id);

        // If payment is required, redirect to checkout
        if (response.data.paymentRequired) {
          router.push(`/checkout?bookingId=${booking._id}&consultationId=${consultation._id}`);
        } else {
          // No payment required, go to booking details
          router.push(`/consultations/my-bookings`);
        }
      }
    } catch (error: any) {
      console.error('Booking error:', error);
      
      // Check for specific error messages from backend
      let errorMessage = 'فشل في إنشاء الحجز';
      
      if (error?.response?.data) {
        const data = error.response.data;
        
        // Check for phone number error
        if (data.error && data.error.includes('Phone number is required')) {
          errorMessage = 'رقم الهاتف مطلوب. يرجى تحديث ملفك الشخصي وإضافة رقم هاتف';
          toast.error(errorMessage, { duration: 5000 });
          setTimeout(() => {
            router.push('/profile');
          }, 2000);
          return;
        }
        
        // Check for other validation errors
        if (data.errors) {
          const validationErrors = Object.values(data.errors).map((err: any) => err.message).join('، ');
          errorMessage = `خطأ في البيانات: ${validationErrors}`;
        } else if (data.arabic) {
          errorMessage = data.arabic;
        } else if (data.error) {
          errorMessage = data.error;
        }
        
        // Show details if available in development
        if (data.details && process.env.NODE_ENV === 'development') {
          console.error('Error details:', data.details);
        }
      }
      
      toast.error(errorMessage, { duration: 4000 });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const steps = [
    { number: 1, title: 'التاريخ والوقت' },
    { number: 2, title: 'نوع الجلسة' },
    { number: 3, title: 'التفاصيل الصحية' },
    { number: 4, title: 'المراجعة' }
  ];

  const commonGoals = [
    'بناء العضلات',
    'خسارة الوزن',
    'زيادة القوة',
    'تحسين اللياقة',
    'المرونة',
    'التحمل',
    'الأداء الرياضي',
    'الصحة العامة'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-gray-900 rounded-2xl max-w-3xl w-full mx-auto shadow-2xl transform transition-all my-8">
        {/* Header */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">{consultation.title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
              disabled={loading}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Steps Progress */}
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <React.Fragment key={step.number}>
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    currentStep >= step.number 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-700 text-gray-400'
                  }`}>
                    {step.number}
                  </div>
                  <span className={`text-xs mt-2 ${
                    currentStep >= step.number ? 'text-blue-400' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-2 ${
                    currentStep > step.number ? 'bg-blue-600' : 'bg-gray-700'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* Step 1: Date & Time */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">اختر التاريخ والوقت المفضل</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      التاريخ المفضل <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.preferredDate}
                      onChange={(e) => handleInputChange('preferredDate', e.target.value)}
                      min={getMinDate()}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      الوقت المفضل <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      value={formData.preferredTime}
                      onChange={(e) => handleInputChange('preferredTime', e.target.value)}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="bg-gray-800 p-4 rounded-lg mb-4">
                  <p className="text-sm text-gray-400">
                    💡 <strong>نصيحة:</strong> اختر وقتاً مناسباً لك. سيتم تأكيد الموعد النهائي من قبل الإدارة.
                  </p>
                </div>

                <h4 className="text-md font-semibold text-white mb-3">موعد بديل (اختياري)</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      التاريخ البديل
                    </label>
                    <input
                      type="date"
                      value={formData.alternativeDate}
                      onChange={(e) => handleInputChange('alternativeDate', e.target.value)}
                      min={getMinDate()}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      الوقت البديل
                    </label>
                    <input
                      type="time"
                      value={formData.alternativeTime}
                      onChange={(e) => handleInputChange('alternativeTime', e.target.value)}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Meeting Type */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">
                  نوع الجلسة <span className="text-red-500">*</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(consultation.consultationType === 'both' || consultation.consultationType === 'online') && (
                    <button
                      onClick={() => handleInputChange('meetingType', 'online')}
                      className={`p-6 rounded-xl border-2 transition-all ${
                        formData.meetingType === 'online'
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      <div className="text-4xl mb-3">💻</div>
                      <h4 className="text-lg font-semibold text-white mb-2">جلسة عبر الإنترنت</h4>
                      <p className="text-sm text-gray-400">
                        جلسة عبر Zoom أو Google Meet من أي مكان
                      </p>
                    </button>
                  )}

                  {(consultation.consultationType === 'both' || consultation.consultationType === 'in_person') && (
                    <button
                      onClick={() => handleInputChange('meetingType', 'in_person')}
                      className={`p-6 rounded-xl border-2 transition-all ${
                        formData.meetingType === 'in_person'
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      <div className="text-4xl mb-3">🏢</div>
                      <h4 className="text-lg font-semibold text-white mb-2">جلسة حضورية</h4>
                      <p className="text-sm text-gray-400">
                        جلسة وجهاً لوجه في الموقع المحدد
                      </p>
                    </button>
                  )}
                </div>

                {/* Personal Info Display */}
                <div className="mt-6 bg-gray-800 p-6 rounded-xl">
                  <h4 className="text-md font-semibold text-white mb-4 flex items-center">
                    <svg className="w-5 h-5 ml-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    معلوماتك الشخصية (مملوءة تلقائياً)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">الاسم:</span>
                      <p className="text-white font-medium">{user.displayName}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">البريد الإلكتروني:</span>
                      <p className="text-white font-medium">{user.email}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">رقم الهاتف:</span>
                      <p className="text-white font-medium">{user.phone}</p>
                    </div>
                    {user.gender && (
                      <div>
                        <span className="text-gray-400">الجنس:</span>
                        <p className="text-white font-medium">
                          {user.gender === 'male' ? 'ذكر' : user.gender === 'female' ? 'أنثى' : 'آخر'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Health Details */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">التفاصيل الصحية والرياضية (اختياري)</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">العمر</label>
                    <input
                      type="number"
                      value={formData.userDetails.age}
                      onChange={(e) => handleUserDetailsChange('age', e.target.value ? parseInt(e.target.value) : '')}
                      placeholder="مثال: 28"
                      min="1"
                      max="150"
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">الجنس</label>
                    <select
                      value={formData.userDetails.gender}
                      onChange={(e) => handleUserDetailsChange('gender', e.target.value)}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    >
                      <option value="">اختر</option>
                      <option value="male">ذكر</option>
                      <option value="female">أنثى</option>
                      <option value="other">آخر</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">الوزن (كجم)</label>
                    <input
                      type="number"
                      value={formData.userDetails.weight}
                      onChange={(e) => handleUserDetailsChange('weight', e.target.value ? parseFloat(e.target.value) : '')}
                      placeholder="مثال: 75"
                      min="1"
                      step="0.1"
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">الطول (سم)</label>
                    <input
                      type="number"
                      value={formData.userDetails.height}
                      onChange={(e) => handleUserDetailsChange('height', e.target.value ? parseFloat(e.target.value) : '')}
                      placeholder="مثال: 175"
                      min="1"
                      step="0.1"
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">المستوى الرياضي</label>
                  <select
                    value={formData.userDetails.fitnessLevel}
                    onChange={(e) => handleUserDetailsChange('fitnessLevel', e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">اختر المستوى</option>
                    <option value="beginner">مبتدئ</option>
                    <option value="intermediate">متوسط</option>
                    <option value="advanced">متقدم</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-3">الأهداف الرياضية</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {commonGoals.map(goal => (
                      <button
                        key={goal}
                        type="button"
                        onClick={() => handleGoalsChange(goal)}
                        className={`px-3 py-2 rounded-lg text-sm transition-all ${
                          formData.userDetails.goals.includes(goal)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }`}
                      >
                        {goal}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">النشاط الرياضي الحالي</label>
                  <input
                    type="text"
                    value={formData.userDetails.currentActivity}
                    onChange={(e) => handleUserDetailsChange('currentActivity', e.target.value)}
                    placeholder="مثال: الجيم 3 مرات في الأسبوع"
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">الحالة الصحية / الأمراض المزمنة</label>
                  <textarea
                    value={formData.userDetails.medicalConditions}
                    onChange={(e) => handleUserDetailsChange('medicalConditions', e.target.value)}
                    placeholder="مثال: السكري، الضغط، إلخ..."
                    rows={2}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">الإصابات السابقة</label>
                  <textarea
                    value={formData.userDetails.injuries}
                    onChange={(e) => handleUserDetailsChange('injuries', e.target.value)}
                    placeholder="مثال: إصابة في الكتف، الركبة، إلخ..."
                    rows={2}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">ملاحظات إضافية</label>
                  <textarea
                    value={formData.userDetails.additionalNotes}
                    onChange={(e) => handleUserDetailsChange('additionalNotes', e.target.value)}
                    placeholder="أي ملاحظات أو أسئلة تريد مناقشتها..."
                    rows={3}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">مراجعة الحجز</h3>
                
                <div className="bg-gray-800 p-6 rounded-xl space-y-4">
                  <div>
                    <h4 className="text-sm text-gray-400 mb-1">الاستشارة</h4>
                    <p className="text-white font-medium">{consultation.title}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm text-gray-400 mb-1">المدة</h4>
                      <p className="text-white">{consultation.duration}</p>
                    </div>
                    <div>
                      <h4 className="text-sm text-gray-400 mb-1">السعر</h4>
                      <p className="text-white font-bold text-xl">
                        {consultation.price} {consultation.currency === 'USD' ? '$' : consultation.currency}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-gray-700 pt-4">
                    <h4 className="text-sm text-gray-400 mb-1">التاريخ والوقت المفضل</h4>
                    <p className="text-white">
                      {new Date(formData.preferredDate).toLocaleDateString('ar-EG', { calendar: 'gregory' })} - {formData.preferredTime}
                    </p>
                  </div>

                  {formData.alternativeDate && (
                    <div>
                      <h4 className="text-sm text-gray-400 mb-1">موعد بديل</h4>
                      <p className="text-white">
                        {new Date(formData.alternativeDate).toLocaleDateString('ar-EG', { calendar: 'gregory' })} - {formData.alternativeTime}
                      </p>
                    </div>
                  )}

                  <div>
                    <h4 className="text-sm text-gray-400 mb-1">نوع الجلسة</h4>
                    <p className="text-white">
                      {formData.meetingType === 'online' ? '💻 جلسة عبر الإنترنت' : '🏢 جلسة حضورية'}
                    </p>
                  </div>

                  {formData.userDetails.goals.length > 0 && (
                    <div>
                      <h4 className="text-sm text-gray-400 mb-1">الأهداف</h4>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.userDetails.goals.map(goal => (
                          <span key={goal} className="bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full text-sm">
                            {goal}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-lg mt-4">
                  <p className="text-sm text-blue-300">
                    📝 <strong>ملاحظة:</strong> بعد إتمام الدفع، سيتم مراجعة الحجز وتأكيد الموعد النهائي من قبل الإدارة.
                    ستصلك رسالة تأكيد عبر البريد الإلكتروني.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-800 flex justify-between">
          <button
            onClick={currentStep === 1 ? onClose : handleBack}
            className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
            disabled={loading}
          >
            {currentStep === 1 ? 'إلغاء' : 'رجوع'}
          </button>

          {currentStep < 4 ? (
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              disabled={loading}
            >
              التالي
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="px-8 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  جاري الحجز...
                </>
              ) : (
                <>
                  تأكيد الحجز ومتابعة الدفع
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

