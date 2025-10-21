'use client'

import { useState } from 'react'
import Link from 'next/link'
import { consultationTypes, consultationCategories } from '@/data/consultations'

export default function ConsultationsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all')

  const filteredConsultations = selectedCategory === 'all' 
    ? consultationTypes 
    : consultationTypes.filter(consultation => consultation.category === selectedCategory)

  return (
    <div className="min-h-screen py-12">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              الاستشارات الرياضية
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              احصل على استشارة متخصصة من الكابتن طه الصباغ وفريق الخبراء لتحقيق أهدافك الرياضية
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="#consultations" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                تصفح الاستشارات
              </Link>
              <Link 
                href="/consultations/book" 
                className="border border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                احجز الآن
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Filter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" id="consultations">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">اختر نوع الاستشارة</h2>
          <p className="text-gray-300">تصفح أنواع الاستشارات المختلفة واختر ما يناسب احتياجاتك</p>
        </div>

        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {consultationCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all ${
                selectedCategory === category.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <span className="text-lg">{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>

        {/* Consultations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredConsultations.map((consultation) => (
            <div key={consultation.id} className="bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
              <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 relative">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="absolute bottom-4 left-4">
                  <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
                    {consultation.duration}
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2">{consultation.title}</h3>
                <p className="text-gray-300 mb-4">{consultation.description}</p>
                
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-blue-400 mb-2">ما يشمله:</h4>
                  <ul className="space-y-1">
                    {consultation.features.map((feature, index) => (
                      <li key={index} className="text-sm text-gray-300 flex items-center gap-2">
                        <span className="text-green-400">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-blue-400">{consultation.price}</div>
                  <Link 
                    href={`/consultations/book?type=${consultation.id}`}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                  >
                    احجز الآن
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">لماذا تختار استشاراتنا؟</h2>
          <p className="text-gray-300">نقدم خدمات استشارية متميزة بأعلى معايير الجودة</p>
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
            <div key={index} className="text-center">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-300">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            ابدأ رحلتك نحو التميز الرياضي اليوم
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            احجز استشارتك الأولى واحصل على خصم 20% على الجلسة الثانية
          </p>
          <Link 
            href="/consultations/book"
            className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-bold text-lg transition-colors inline-block"
          >
            احجز استشارتك الآن
          </Link>
        </div>
      </div>
    </div>
  )
}