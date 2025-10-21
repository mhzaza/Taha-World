'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { consultationTypes } from '@/data/consultations'

export default function BookConsultationPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const consultationType = searchParams.get('type')

  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [selectedConsultation, setSelectedConsultation] = useState(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    experience: '',
    goals: '',
    medicalConditions: '',
    preferredLanguage: 'arabic'
  })

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'
  ]

  useEffect(() => {
    if (consultationType) {
      const consultation = consultationTypes.find(c => c.id === parseInt(consultationType))
      setSelectedConsultation(consultation)
    }
  }, [consultationType])

  const generateCalendarDays = () => {
    const today = new Date()
    const days = []
    
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      
      // Skip Fridays (5) for this example
      if (date.getDay() !== 5) {
        days.push({
          date: date.toISOString().split('T')[0],
          day: date.getDate(),
          month: date.toLocaleDateString('ar-SA', { month: 'short' }),
          weekday: date.toLocaleDateString('ar-SA', { weekday: 'short' })
        })
      }
    }
    
    return days.slice(0, 21) // Show 3 weeks
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Here you would typically send the data to your backend
    router.push(`/consultations/confirmation?date=${selectedDate}&time=${selectedTime}&type=${selectedConsultation?.id}`)
  }

  const isFormValid = () => {
    return formData.name && formData.email && formData.phone && selectedDate && selectedTime && selectedConsultation
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">حجز استشارة</h1>
          <p className="text-gray-300">اتبع الخطوات التالية لحجز استشارتك</p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  currentStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-600 text-gray-300'
                }`}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={`w-16 h-1 mx-2 ${
                    currentStep > step ? 'bg-blue-600' : 'bg-gray-600'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6">
          {/* Step 1: Select Consultation Type */}
          {currentStep === 1 && (
            <div>
              <h2 className="text-xl font-bold text-white mb-6">اختر نوع الاستشارة</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {consultationTypes.map((consultation) => (
                  <div
                    key={consultation.id}
                    onClick={() => setSelectedConsultation(consultation)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedConsultation?.id === consultation.id
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-gray-600 hover:border-gray-500'
                    }`}
                  >
                    <h3 className="font-semibold text-white mb-2">{consultation.title}</h3>
                    <p className="text-gray-300 text-sm mb-2">{consultation.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-blue-400 font-semibold">{consultation.price}</span>
                      <span className="text-gray-400 text-sm">{consultation.duration}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setCurrentStep(2)}
                  disabled={!selectedConsultation}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                >
                  التالي
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Select Date and Time */}
          {currentStep === 2 && (
            <div>
              <h2 className="text-xl font-bold text-white mb-6">اختر التاريخ والوقت</h2>
              
              {/* Calendar */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-4">اختر التاريخ</h3>
                <div className="grid grid-cols-7 gap-2">
                  {generateCalendarDays().map((day) => (
                    <button
                      key={day.date}
                      onClick={() => setSelectedDate(day.date)}
                      className={`p-3 rounded-lg text-center transition-all ${
                        selectedDate === day.date
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      <div className="text-xs">{day.weekday}</div>
                      <div className="font-semibold">{day.day}</div>
                      <div className="text-xs">{day.month}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Slots */}
              {selectedDate && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-4">اختر الوقت</h3>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                    {timeSlots.map((time) => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`p-2 rounded-lg text-center transition-all ${
                          selectedTime === time
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between mt-6">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                >
                  السابق
                </button>
                <button
                  onClick={() => setCurrentStep(3)}
                  disabled={!selectedDate || !selectedTime}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                >
                  التالي
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Personal Information */}
          {currentStep === 3 && (
            <div>
              <h2 className="text-xl font-bold text-white mb-6">المعلومات الشخصية</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white font-semibold mb-2">الاسم الكامل *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-white font-semibold mb-2">البريد الإلكتروني *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-white font-semibold mb-2">رقم الهاتف *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-white font-semibold mb-2">العمر</label>
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleInputChange}
                      className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white font-semibold mb-2">مستوى الخبرة الرياضية</label>
                  <select
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">اختر مستوى الخبرة</option>
                    <option value="beginner">مبتدئ</option>
                    <option value="intermediate">متوسط</option>
                    <option value="advanced">متقدم</option>
                    <option value="professional">محترف</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white font-semibold mb-2">أهدافك من الاستشارة</label>
                  <textarea
                    name="goals"
                    value={formData.goals}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                    placeholder="اكتب أهدافك وما تريد تحقيقه من الاستشارة..."
                  ></textarea>
                </div>

                <div>
                  <label className="block text-white font-semibold mb-2">الحالات الطبية أو الإصابات السابقة</label>
                  <textarea
                    name="medicalConditions"
                    value={formData.medicalConditions}
                    onChange={handleInputChange}
                    rows="2"
                    className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                    placeholder="اذكر أي حالات طبية أو إصابات سابقة (اختياري)..."
                  ></textarea>
                </div>

                <div>
                  <label className="block text-white font-semibold mb-2">لغة الاستشارة المفضلة</label>
                  <select
                    name="preferredLanguage"
                    value={formData.preferredLanguage}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="arabic">العربية</option>
                    <option value="english">الإنجليزية</option>
                  </select>
                </div>

                {/* Booking Summary */}
                <div className="bg-gray-700 p-4 rounded-lg mt-6">
                  <h3 className="text-lg font-semibold text-white mb-3">ملخص الحجز</h3>
                  <div className="space-y-2 text-gray-300">
                    <div className="flex justify-between">
                      <span>نوع الاستشارة:</span>
                      <span className="text-white">{selectedConsultation?.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>التاريخ:</span>
                      <span className="text-white">{selectedDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>الوقت:</span>
                      <span className="text-white">{selectedTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>المدة:</span>
                      <span className="text-white">{selectedConsultation?.duration}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg">
                      <span>السعر:</span>
                      <span className="text-blue-400">{selectedConsultation?.price}</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between mt-6">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                  >
                    السابق
                  </button>
                  <button
                    type="submit"
                    disabled={!isFormValid()}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                  >
                    تأكيد الحجز
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Back to Consultations */}
        <div className="text-center mt-8">
          <Link 
            href="/consultations"
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            ← العودة إلى صفحة الاستشارات
          </Link>
        </div>
      </div>
    </div>
  )
}