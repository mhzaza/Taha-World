import Link from 'next/link';
import { Layout, Container } from '@/components/layout';

export default function Home() {
  return (
    <Layout>
      {/* Limited Time Banner */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-500 text-white py-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-hero-pattern opacity-10"></div>
        <Container>
          <div className="text-center relative z-10">
            <div className="achievement-badge mx-auto">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
              </svg>
              عرض محدود: خصم 30% على جميع الدورات التدريبية - ينتهي خلال 7 أيام!
            </div>
          </div>
        </Container>
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center bg-gradient-to-br from-primary-50 via-white to-primary-100 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-hero-pattern opacity-5"></div>
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 left-10 w-72 h-72 bg-primary-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-primary-100 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
        
        <Container className="relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="text-center lg:text-right animate-fade-in-up">
              {/* Achievement Badge */}
              <div className="achievement-badge mb-6 mx-auto lg:mx-0">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                المدرب الأول في المنطقة
              </div>
              
              <h1 className="text-display-1 md:text-display-2 font-black text-gray-900 mb-6 leading-none">
                طور مهاراتك الرياضية مع
                <span className="text-gradient block mt-2">طه صباغ</span>
              </h1>
              
              <p className="text-subtitle text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0">
                انضم إلى آلاف الرياضيين الذين طوروا مهاراتهم من خلال دوراتنا التدريبية المتخصصة. 
                تعلم من أفضل المدربين واحصل على شهادات معتمدة.
              </p>
              
              {/* Stats */}
               <div className="grid grid-cols-3 gap-6 mb-8">
                 <div className="stats-card">
                   <div className="text-2xl font-bold text-primary-600">5050+</div>
                   <div className="text-sm text-gray-600">متدرب</div>
                 </div>
                 <div className="stats-card">
                   <div className="text-2xl font-bold text-primary-600">50+</div>
                   <div className="text-sm text-gray-600">دورة تدريبية</div>
                 </div>
                 <div className="stats-card">
                   <div className="text-2xl font-bold text-primary-600">98%</div>
                   <div className="text-sm text-gray-600">نسبة الرضا</div>
                 </div>
               </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  href="/courses"
                  className="btn-primary inline-flex items-center gap-2 text-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  ابدأ التدريب الآن
                </Link>
                <Link
                  href="/about"
                  className="btn-secondary inline-flex items-center gap-2 text-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.01M15 10h1.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  تعرف علينا أكثر
                </Link>
              </div>
            </div>
            <div className="relative animate-scale-in">
              {/* Main Trainer Card */}
               <div className="card-modern bg-gradient-to-br from-white to-primary-50 p-8 shadow-xl border border-primary-100">
                 <div className="text-center">
                   {/* Profile Image Placeholder */}
                   <div className="relative mx-auto mb-6">
                     <div className="w-32 h-32 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center mx-auto shadow-glow">
                       <span className="text-white text-4xl font-bold">ط</span>
                     </div>
                    {/* Achievement Ring */}
                    <div className="absolute -top-2 -right-2">
                      <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                        <svg className="w-6 h-6 text-yellow-800" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">طه صباغ</h3>
                   <p className="text-primary-600 font-semibold mb-4">مدرب رياضي معتمد دولياً</p>
                  
                  {/* Rating */}
                  <div className="flex justify-center items-center gap-2 mb-6">
                    <div className="flex space-x-1 space-x-reverse">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-sm text-gray-600 font-medium">(4.9 من 5)</span>
                  </div>
                  
                  {/* Certifications */}
                  <div className="space-y-3">
                    <div className="achievement-badge text-sm">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      شهادة معتمدة دولياً
                    </div>
                    <div className="achievement-badge text-sm">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                      </svg>
                      +15 سنة خبرة
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating Elements */}
               <div className="absolute -top-4 -left-4 w-8 h-8 bg-yellow-400 rounded-full animate-bounce"></div>
               <div className="absolute -bottom-4 -right-4 w-6 h-6 bg-primary-400 rounded-full animate-pulse"></div>
            </div>
          </div>
        </Container>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-hero-pattern opacity-5"></div>
        
        <Container className="relative z-10">
          <div className="text-center mb-20">
            <div className="achievement-badge mb-6 mx-auto">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              مميزات استثنائية
            </div>
            <h2 className="text-hero font-black text-gray-900 mb-6">
              لماذا تختار منصتنا؟
            </h2>
            <p className="text-subtitle text-gray-600 max-w-3xl mx-auto">
              نقدم تجربة تعليمية متميزة تجمع بين الخبرة العملية والتقنيات الحديثة
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {/* Feature Card 1 */}
            <div className="card-modern group hover:shadow-glow transition-all duration-500 hover:-translate-y-2 animate-fade-in-up">
              <div className="text-center p-8">
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-10 h-10 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary-400 rounded-full animate-pulse"></div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">محتوى عالي الجودة</h3>
                <p className="text-gray-600 leading-relaxed">دورات مصممة بعناية من قبل خبراء في المجال الرياضي مع أحدث التقنيات التعليمية</p>
                
                {/* Progress Indicator */}
                <div className="mt-6">
                  <div className="progress-ring mx-auto">
                    <div className="text-xs font-semibold text-primary-600">100%</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Feature Card 2 */}
            <div className="card-modern group hover:shadow-glow transition-all duration-500 hover:-translate-y-2 animate-fade-in-up animation-delay-200">
              <div className="text-center p-8">
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full animate-pulse"></div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-green-600 transition-colors">شهادات معتمدة</h3>
                <p className="text-gray-600 leading-relaxed">احصل على شهادات معتمدة دولياً تعزز من مسيرتك المهنية وتفتح آفاق جديدة</p>
                
                {/* Achievement Badge */}
                <div className="mt-6">
                  <div className="achievement-badge text-sm">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    معتمد دولياً
                  </div>
                </div>
              </div>
            </div>
            
            {/* Feature Card 3 */}
            <div className="card-modern group hover:shadow-glow transition-all duration-500 hover:-translate-y-2 animate-fade-in-up animation-delay-400">
              <div className="text-center p-8">
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-pulse"></div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-yellow-600 transition-colors">مجتمع تفاعلي</h3>
                <p className="text-gray-600 leading-relaxed">انضم إلى مجتمع من الرياضيين والمدربين المحترفين وتبادل الخبرات والتجارب</p>
                
                {/* Stats Card */}
                <div className="mt-6">
                  <div className="stats-card">
                    <div className="text-lg font-bold text-yellow-600">5050+</div>
                    <div className="text-xs text-gray-600">عضو نشط</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Featured Courses Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-hero-pattern opacity-5"></div>
        
        <Container className="relative z-10">
          <div className="text-center mb-20">
            <div className="achievement-badge mb-6 mx-auto">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M12 14l9-5-9-5-9 5 9 5z" />
                <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
              الدورات المميزة
            </div>
            
            <h2 className="text-hero font-black text-gray-900 mb-6">
              دوراتنا الأكثر شعبية
            </h2>
            
            <p className="text-subtitle text-gray-600 max-w-3xl mx-auto">
              اكتشف الدورات التدريبية الأكثر طلباً والتي حققت أعلى معدلات النجاح والرضا بين المتدربين
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {/* Course Card 1 */}
            <div className="card-modern group hover:shadow-glow transition-all duration-500 hover:-translate-y-2 animate-fade-in-up">
              <div className="relative">
                <div className="h-48 bg-gradient-to-br from-primary-100 to-primary-200 rounded-t-3xl flex items-center justify-center">
                  <div className="w-20 h-20 bg-primary-500 rounded-2xl flex items-center justify-center">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
                <div className="absolute top-4 right-4">
                  <div className="achievement-badge text-xs bg-yellow-100 text-yellow-700 border-yellow-200">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    الأكثر مبيعاً
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">
                  أساسيات التدريب الرياضي
                </h3>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  تعلم الأسس العلمية للتدريب الرياضي وكيفية بناء برامج تدريبية فعالة ومتوازنة
                </p>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">(4.9)</span>
                  </div>
                  <div className="text-primary-600 font-bold text-lg">299 ر.س</div>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>1,250 متدرب</span>
                  <span>12 ساعة</span>
                </div>
                
                <Link
                  href="/courses/1"
                  className="btn-primary w-full justify-center group-hover:shadow-lg transition-all duration-300"
                >
                  عرض التفاصيل
                </Link>
              </div>
            </div>
            
            {/* Course Card 2 */}
            <div className="card-modern group hover:shadow-glow transition-all duration-500 hover:-translate-y-2 animate-fade-in-up animation-delay-200">
              <div className="relative">
                <div className="h-48 bg-gradient-to-br from-green-100 to-green-200 rounded-t-3xl flex items-center justify-center">
                  <div className="w-20 h-20 bg-green-500 rounded-2xl flex items-center justify-center">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
                <div className="absolute top-4 right-4">
                  <div className="achievement-badge text-xs bg-green-100 text-green-700 border-green-200">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    معتمد
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-green-600 transition-colors">
                  التدريب الشخصي المتقدم
                </h3>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  احترف فن التدريب الشخصي وتعلم كيفية تصميم برامج مخصصة لكل عميل
                </p>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">(4.8)</span>
                  </div>
                  <div className="text-green-600 font-bold text-lg">499 ر.س</div>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>890 متدرب</span>
                  <span>18 ساعة</span>
                </div>
                
                <Link
                  href="/courses/2"
                  className="btn-primary w-full justify-center group-hover:shadow-lg transition-all duration-300"
                >
                  عرض التفاصيل
                </Link>
              </div>
            </div>
            
            {/* Course Card 3 */}
            <div className="card-modern group hover:shadow-glow transition-all duration-500 hover:-translate-y-2 animate-fade-in-up animation-delay-400">
              <div className="relative">
                <div className="h-48 bg-gradient-to-br from-purple-100 to-purple-200 rounded-t-3xl flex items-center justify-center">
                  <div className="w-20 h-20 bg-purple-500 rounded-2xl flex items-center justify-center">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
                <div className="absolute top-4 right-4">
                  <div className="achievement-badge text-xs bg-purple-100 text-purple-700 border-purple-200">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                      <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                    </svg>
                    جديد
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors">
                  علم التغذية الرياضية
                </h3>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  فهم أساسيات التغذية الرياضية وكيفية تحسين الأداء من خلال النظام الغذائي
                </p>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">(4.7)</span>
                  </div>
                  <div className="text-purple-600 font-bold text-lg">399 ر.س</div>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>650 متدرب</span>
                  <span>15 ساعة</span>
                </div>
                
                <Link
                  href="/courses/3"
                  className="btn-primary w-full justify-center group-hover:shadow-lg transition-all duration-300"
                >
                  عرض التفاصيل
                </Link>
              </div>
            </div>
          </div>
          
          {/* View All Courses Button */}
          <div className="text-center">
            <Link
              href="/courses"
              className="btn-secondary inline-flex items-center gap-2 text-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0l-4-4m4 4l-4 4" />
              </svg>
              عرض جميع الدورات
            </Link>
          </div>
        </Container>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-hero-pattern opacity-5"></div>
        <div className="absolute top-10 left-10 w-32 h-32 bg-primary-200 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-green-200 rounded-full blur-3xl opacity-30"></div>
        
        <Container className="relative z-10">
          <div className="text-center mb-20">
            <div className="achievement-badge mb-6 mx-auto">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              قصص النجاح
            </div>
            
            <h2 className="text-hero font-black text-gray-900 mb-6">
              ماذا يقول متدربونا عنا
            </h2>
            
            <p className="text-subtitle text-gray-600 max-w-3xl mx-auto">
              اكتشف تجارب المتدربين الذين حققوا أهدافهم وغيروا حياتهم من خلال برامجنا التدريبية
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {/* Testimonial 1 */}
            <div className="card-modern group hover:shadow-glow transition-all duration-500 hover:-translate-y-2 animate-fade-in-up">
              <div className="p-8">
                <div className="flex items-center mb-6">
                  <div className="flex text-yellow-400 mr-4">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <div className="achievement-badge text-xs bg-green-100 text-green-700 border-green-200">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    متدرب معتمد
                  </div>
                </div>
                
                <blockquote className="text-gray-700 mb-6 leading-relaxed text-lg">
                  "تغيرت حياتي بالكامل بعد انضمامي لدورة أساسيات التدريب الرياضي. المحتوى ممتاز والمدرب محترف جداً. أصبحت الآن مدرب شخصي معتمد وأعمل في أفضل النوادي الرياضية."
                </blockquote>
                
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                    أ
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">أحمد محمد</div>
                    <div className="text-gray-600 text-sm">مدرب شخصي معتمد</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Testimonial 2 */}
            <div className="card-modern group hover:shadow-glow transition-all duration-500 hover:-translate-y-2 animate-fade-in-up animation-delay-200">
              <div className="p-8">
                <div className="flex items-center mb-6">
                  <div className="flex text-yellow-400 mr-4">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <div className="achievement-badge text-xs bg-purple-100 text-purple-700 border-purple-200">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    خسارة 25 كيلو
                  </div>
                </div>
                
                <blockquote className="text-gray-700 mb-6 leading-relaxed text-lg">
                  "دورة التغذية الرياضية كانت نقطة تحول في رحلتي. تعلمت كيفية التغذية الصحيحة وخسرت 25 كيلو في 6 أشهر. الآن أشعر بثقة أكبر وصحة أفضل من أي وقت مضى."
                </blockquote>
                
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                    س
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">سارة أحمد</div>
                    <div className="text-gray-600 text-sm">أخصائية تغذية</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Testimonial 3 */}
            <div className="card-modern group hover:shadow-glow transition-all duration-500 hover:-translate-y-2 animate-fade-in-up animation-delay-400">
              <div className="p-8">
                <div className="flex items-center mb-6">
                  <div className="flex text-yellow-400 mr-4">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <div className="achievement-badge text-xs bg-blue-100 text-blue-700 border-blue-200">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                      <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                    </svg>
                    مدرب محترف
                  </div>
                </div>
                
                <blockquote className="text-gray-700 mb-6 leading-relaxed text-lg">
                  "دورة التدريب الشخصي المتقدم أعطتني المهارات والثقة لبدء مشروعي الخاص. الآن لدي استوديو تدريب شخصي ناجح وأساعد العشرات من العملاء في تحقيق أهدافهم."
                </blockquote>
                
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                    م
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">محمد علي</div>
                    <div className="text-gray-600 text-sm">صاحب استوديو تدريب</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Success Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="stats-card mb-4">
                <div className="text-4xl font-black text-primary-600 mb-2">98%</div>
                <div className="text-gray-600 font-medium">معدل الرضا</div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="stats-card mb-4">
                <div className="text-4xl font-black text-green-600 mb-2">5050+</div>
                <div className="text-gray-600 font-medium">متدرب ناجح</div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="stats-card mb-4">
                <div className="text-4xl font-black text-purple-600 mb-2">15+</div>
                <div className="text-gray-600 font-medium">سنة خبرة</div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="stats-card mb-4">
                <div className="text-4xl font-black text-blue-600 mb-2">50+</div>
                <div className="text-gray-600 font-medium">دورة تدريبية</div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-hero-pattern opacity-10"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-transparent via-primary-500/20 to-primary-900/30"></div>
        
        {/* Floating Elements */}
        <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-blob"></div>
        <div className="absolute bottom-10 left-10 w-24 h-24 bg-white/5 rounded-full blur-xl animate-blob animation-delay-2000"></div>
        
        <Container className="relative z-10">
          <div className="text-center text-white">
            <div className="achievement-badge mb-6 mx-auto bg-white/20 text-white border-white/30">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
              </svg>
              انضم إلى النخبة
            </div>
            
            <h2 className="text-hero font-black mb-6 animate-fade-in-up">
              ابدأ رحلتك التدريبية اليوم
            </h2>
            
            <p className="text-subtitle mb-10 opacity-90 max-w-2xl mx-auto animate-fade-in-up animation-delay-200">
              انضم إلى آلاف المتدربين واحصل على أفضل التدريبات الرياضية مع أحدث التقنيات والأساليب المتطورة
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up animation-delay-400">
              <Link
                href="/courses"
                className="btn-primary bg-white text-primary-600 hover:bg-gray-100 hover:text-primary-700 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 inline-flex items-center gap-2 text-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                استكشف الدورات
              </Link>
              
              <Link
                href="/about"
                className="btn-secondary bg-transparent text-white border-2 border-white/30 hover:bg-white/10 hover:border-white/50 inline-flex items-center gap-2 text-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.01M15 10h1.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                تعرف على المدرب
              </Link>
            </div>
            
            {/* Trust Indicators */}
            <div className="mt-12 grid grid-cols-3 gap-8 max-w-md mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold mb-1">5050+</div>
                <div className="text-sm opacity-80">متدرب راضٍ</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold mb-1">98%</div>
                <div className="text-sm opacity-80">نسبة النجاح</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold mb-1">15+</div>
                <div className="text-sm opacity-80">سنة خبرة</div>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </Layout>
  );
}
