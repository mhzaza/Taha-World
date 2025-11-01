'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { consultationCategories } from '@/data/consultations'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Container } from '@/components/layout'
import { consultationsAPI } from '@/lib/api'
import toast from 'react-hot-toast'

interface Consultation {
  _id: string
  consultationId: number
  title: string
  description: string
  duration: string
  durationMinutes: number
  price: number
  currency: string
  category: string
  features: string[]
  consultationType: string
  image?: string
  thumbnail?: string
  isActive: boolean
}

export default function ConsultationsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadConsultations()
  }, [])

  const loadConsultations = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await consultationsAPI.getAll()
      if (response.data && 'consultations' in response.data) {
        setConsultations((response.data as unknown as { consultations: Consultation[] }).consultations || [])
      }
    } catch (err) {
      console.error('Error loading consultations:', err)
      setError('فشل في تحميل الاستشارات')
      toast.error('فشل في تحميل الاستشارات')
    } finally {
      setLoading(false)
    }
  }

  const filteredConsultations = selectedCategory === 'all' 
    ? consultations 
    : consultations.filter(consultation => consultation.category === selectedCategory)

  // Calculate stats
  const stats = {
    totalConsultations: consultations.length,
    activeConsultations: consultations.filter(c => c.isActive).length,
    categories: [...new Set(consultations.map(c => c.category))].length,
    averagePrice: consultations.length > 0 
      ? Math.round(consultations.reduce((sum, c) => sum + c.price, 0) / consultations.length)
      : 0
  }

  return (
    <div className="min-h-screen">
      <Header />
      <div className="">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#41ADE1]/200 via-[#41ADE1] to-[#3399CC] py-16">
        <Container>
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              الاستشارات الرياضية
            </h1>
            <p className="text-xl text-[#41ADE1]/30 max-w-3xl mx-auto">
              احصل على استشارة متخصصة من الكابتن طه الصباغ وفريق الخبراء لتحقيق أهدافك الرياضية
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-3xl font-bold text-[#41ADE1] mb-2">
                {stats.totalConsultations}
              </div>
              <div className="text-gray-600">استشارة متاحة</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {stats.activeConsultations}
              </div>
              <div className="text-gray-600">استشارة نشطة</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-3xl font-bold text-yellow-600 mb-2">
                {stats.categories}
              </div>
              <div className="text-gray-600">فئة</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                ${stats.averagePrice}
              </div>
              <div className="text-gray-600">متوسط السعر</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="#consultations" 
              className="bg-[#41ADE1] hover:bg-[#3399CC] text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              تصفح الاستشارات
            </Link>
            <Link 
              href="/consultations/book" 
              className="border border-white text-white hover:bg-white hover:text-[#41ADE1] px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              احجز الآن
            </Link>
          </div>
        </Container>
      </section>

      {/* Categories Filter */}
      <section className="bg-gray-50 py-16" id="consultations">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">اختر نوع الاستشارة</h2>
            <p className="text-gray-600">تصفح أنواع الاستشارات المختلفة واختر ما يناسب احتياجاتك</p>
          </div>

        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {consultationCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all ${
                selectedCategory === category.id
                  ? 'bg-[#41ADE1] text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              <span className="text-lg">{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>

        {/* Consultations Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#41ADE1] mx-auto mb-4"></div>
            <p className="text-gray-600">جاري تحميل الاستشارات...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-500 mb-4">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xl font-semibold text-gray-900 mb-2">{error}</p>
              <button 
                onClick={loadConsultations}
                className="mt-4 bg-[#41ADE1] hover:bg-[#3399CC] text-white px-6 py-2 rounded-lg transition-colors"
              >
                إعادة المحاولة
              </button>
            </div>
          </div>
        ) : filteredConsultations.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-xl mb-4">
              {selectedCategory === 'all' 
                ? 'لا توجد استشارات متاحة حالياً'
                : 'لا توجد استشارات في هذه الفئة'}
            </p>
            {selectedCategory !== 'all' && (
              <button
                onClick={() => setSelectedCategory('all')}
                className="text-[#41ADE1] hover:text-[#3399CC] underline"
              >
                عرض جميع الاستشارات
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredConsultations.map((consultation) => (
              <div key={consultation._id} className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                <div className="h-48 relative overflow-hidden">
                  {consultation.thumbnail || consultation.image ? (
                    <img 
                      src={consultation.thumbnail || consultation.image} 
                      alt={consultation.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback to gradient if image fails to load
                        e.currentTarget.style.display = 'none';
                        if (e.currentTarget.parentElement) {
                          e.currentTarget.parentElement.className += ' bg-gradient-to-br from-[#41ADE1]/200 to-purple-600';
                        }
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#41ADE1]/200 to-purple-600"></div>
                  )}
                  <div className="absolute inset-0 bg-black/20"></div>
                  <div className="absolute bottom-4 left-4">
                    <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
                      {consultation.duration}
                    </span>
                  </div>
                  {consultation.category === 'vip' && (
                    <div className="absolute top-4 right-4">
                      <span className="bg-yellow-500 text-black px-3 py-1 rounded-full text-xs font-bold">
                        ⭐ VIP
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{consultation.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">{consultation.description}</p>
                  
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-[#41ADE1] mb-2">ما يشمله:</h4>
                    <ul className="space-y-1">
                      {consultation.features.slice(0, 3).map((feature, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                          <span className="text-green-600 mt-0.5">✓</span>
                          <span className="line-clamp-2">{feature}</span>
                        </li>
                      ))}
                      {consultation.features.length > 3 && (
                        <li className="text-sm text-[#41ADE1]">
                          + {consultation.features.length - 3} ميزة أخرى
                        </li>
                      )}
                    </ul>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-[#41ADE1]">
                      {consultation.price}{consultation.currency === 'USD' ? '$' : ' ' + consultation.currency}
                    </div>
                    <Link 
                      href={`/consultations/book?type=${consultation._id}`}
                      className="bg-[#41ADE1] hover:bg-[#3399CC] text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                    >
                      احجز الآن
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        </Container>
      </section>

      {/* Why Choose Us Section */}
      <section className="bg-gray-50 py-16">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">لماذا تختار استشاراتنا؟</h2>
            <p className="text-gray-600">نقدم خدمات استشارية متميزة بأعلى معايير الجودة</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: '🏆',
                title: 'خبرة متميزة',
                description: 'أكثر من 10 سنوات من الخبرة في التدريب والاستشارات الرياضية'
              },
              {
                icon: '👨‍⚕️',
                title: 'فريق متخصص',
                description: 'فريق من الخبراء والأطباء المتخصصين في الطب الرياضي'
              },
              {
                icon: '📊',
                title: 'نتائج مضمونة',
                description: 'برامج مثبتة علمياً مع متابعة دورية لضمان النتائج'
              },
              {
                icon: '🕐',
                title: 'مرونة في المواعيد',
                description: 'مواعيد مرنة تناسب جدولك اليومي مع إمكانية الاستشارة أونلاين'
              }
            ].map((feature, index) => (
              <div key={index} className="text-center bg-white rounded-lg shadow-md p-6">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-[#41ADE1] to-purple-600 py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            ابدأ رحلتك نحو التميز الرياضي اليوم
          </h2>
          <p className="text-xl text-[#41ADE1]/40 mb-8">
            احجز استشارتك الأولى واحصل على خصم 20% على الجلسة الثانية
          </p>
          <Link 
            href="/consultations/book"
            className="bg-white text-[#41ADE1] hover:bg-gray-100 px-8 py-3 rounded-lg font-bold text-lg transition-colors inline-block"
          >
            احجز استشارتك الآن
          </Link>
        </div>
      </div>
      </div>
      <Footer />
    </div>
  )
}