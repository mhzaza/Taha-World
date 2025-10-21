'use client';

import { useState } from 'react';
import { Layout, Container } from '@/components/layout';
import {
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSubmitStatus('success');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const contactInfo = [
    {
      icon: PhoneIcon,
      title: 'الهاتف',
      details: ['+966 11 123 4567', '+966 50 987 6543'],
      description: 'متاح من السبت إلى الخميس'
    },
    {
      icon: EnvelopeIcon,
      title: 'البريد الإلكتروني',
      details: ['info@sportsplatform.com', 'support@sportsplatform.com'],
      description: 'نرد خلال 24 ساعة'
    },
    {
      icon: MapPinIcon,
      title: 'العنوان',
      details: ['شارع الملك فهد، الرياض', 'المملكة العربية السعودية'],
      description: 'مقرنا الرئيسي'
    },
    {
      icon: ClockIcon,
      title: 'ساعات العمل',
      details: ['السبت - الخميس: 9:00 ص - 6:00 م', 'الجمعة: مغلق'],
      description: 'التوقيت المحلي'
    }
  ];
  
  const subjects = [
    'استفسار عام',
    'الدعم الفني',
    'الفوترة والدفع',
    'اقتراح دورة جديدة',
    'شكوى أو مشكلة',
    'طلب شراكة',
    'أخرى'
  ];
  
  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white py-20">
        <Container>
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              تواصل معنا
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 leading-relaxed">
              نحن هنا لمساعدتك. تواصل معنا في أي وقت وسنكون سعداء للإجابة على استفساراتك
            </p>
          </div>
        </Container>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16 bg-gray-50">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info, index) => {
              const IconComponent = info.icon;
              return (
                <div key={index} className="bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4 mx-auto">
                    <IconComponent className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    {info.title}
                  </h3>
                  <div className="space-y-1 mb-3">
                    {info.details.map((detail, idx) => (
                      <p key={idx} className="text-gray-200 font-medium">
                        {detail}
                      </p>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500">
                    {info.description}
                  </p>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Contact Form Section */}
      <section className="py-20 bg-gray-800">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Form */}
            <div>
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  أرسل لنا رسالة
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  املأ النموذج أدناه وسنتواصل معك في أقرب وقت ممكن. جميع الحقول مطلوبة.
                </p>
              </div>
              
              {submitStatus === 'success' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="mr-3">
                      <p className="text-sm font-medium text-green-800">
                        تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {submitStatus === 'error' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="mr-3">
                      <p className="text-sm font-medium text-red-800">
                        حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة مرة أخرى.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-200 mb-2">
                      الاسم الكامل *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="أدخل اسمك الكامل"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-2">
                      البريد الإلكتروني *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-200 mb-2">
                      رقم الهاتف
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="+966 50 123 4567"
                    />
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-200 mb-2">
                      موضوع الرسالة *
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    >
                      <option value="">اختر موضوع الرسالة</option>
                      {subjects.map((subject, index) => (
                        <option key={index} value={subject}>
                          {subject}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-200 mb-2">
                    الرسالة *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                    placeholder="اكتب رسالتك هنا..."
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      جاري الإرسال...
                    </>
                  ) : (
                    <>
                      <PaperAirplaneIcon className="w-5 h-5 ml-2" />
                      إرسال الرسالة
                    </>
                  )}
                </button>
              </form>
            </div>
            
            {/* Additional Info */}
            <div>
              <div className="bg-gray-50 rounded-2xl p-8">
                <div className="flex items-center mb-6">
                  <ChatBubbleLeftRightIcon className="w-8 h-8 text-blue-600 ml-3" />
                  <h3 className="text-2xl font-bold text-gray-900">طرق أخرى للتواصل</h3>
                </div>
                
                <div className="space-y-6">
                  <div className="border-r-4 border-blue-600 pr-4">
                    <h4 className="font-semibold text-gray-900 mb-2">الدعم الفوري</h4>
                    <p className="text-gray-600 mb-3">
                      للحصول على مساعدة فورية، يمكنك التواصل معنا عبر الواتساب أو الاتصال المباشر.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm">
                        واتساب
                      </button>
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                        اتصال مباشر
                      </button>
                    </div>
                  </div>
                  
                  <div className="border-r-4 border-green-600 pr-4">
                    <h4 className="font-semibold text-gray-900 mb-2">الأسئلة الشائعة</h4>
                    <p className="text-gray-600 mb-3">
                      قد تجد إجابة سؤالك في قسم الأسئلة الشائعة قبل التواصل معنا.
                    </p>
                    <button className="text-green-600 hover:text-green-700 font-medium text-sm">
                      زيارة الأسئلة الشائعة ←
                    </button>
                  </div>
                  
                  <div className="border-r-4 border-orange-600 pr-4">
                    <h4 className="font-semibold text-gray-900 mb-2">مركز المساعدة</h4>
                    <p className="text-gray-600 mb-3">
                      تصفح مركز المساعدة للحصول على دلائل مفصلة وحلول للمشاكل الشائعة.
                    </p>
                    <button className="text-orange-600 hover:text-orange-700 font-medium text-sm">
                      زيارة مركز المساعدة ←
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Response Time Info */}
              <div className="mt-8 bg-blue-50 rounded-xl p-6">
                <h4 className="font-semibold text-blue-900 mb-3">أوقات الاستجابة</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700">البريد الإلكتروني:</span>
                    <span className="text-blue-900 font-medium">خلال 24 ساعة</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">الهاتف:</span>
                    <span className="text-blue-900 font-medium">فوري</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">واتساب:</span>
                    <span className="text-blue-900 font-medium">خلال ساعة</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Map Section (Placeholder) */}
      <section className="py-16 bg-gray-100">
        <Container>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">موقعنا</h2>
            <p className="text-gray-600">زرنا في مقرنا الرئيسي في الرياض</p>
          </div>
          <div className="bg-gray-300 rounded-xl h-96 flex items-center justify-center">
            <div className="text-center">
              <MapPinIcon className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">خريطة تفاعلية</p>
              <p className="text-sm text-gray-500">شارع الملك فهد، الرياض</p>
            </div>
          </div>
        </Container>
      </section>
    </Layout>
  );
};

export default ContactPage;
