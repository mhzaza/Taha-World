'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Layout, Container } from '@/components/layout';
import ImageCarousel from '@/components/ImageCarousel';

export default function Home() {
  const [isAtStart, setIsAtStart] = useState(true);
  const [isAtEnd, setIsAtEnd] = useState(false);

  useEffect(() => {
    const updateNavigationState = () => {
      const container = document.getElementById('testimonials-container');
      if (!container) return;

      const cards = Array.from(container.getElementsByClassName('testimonial-card'));
      if (cards.length === 0) return;

      const containerRect = container.getBoundingClientRect();
      const containerLeft = containerRect.left + 100;

      let currentIndex = 0;
      let minDistance = Infinity;

      cards.forEach((card, index) => {
        const cardRect = card.getBoundingClientRect();
        const distance = Math.abs(cardRect.left - containerLeft);
        if (distance < minDistance) {
          minDistance = distance;
          currentIndex = index;
        }
      });

      setIsAtStart(currentIndex === 0);
      setIsAtEnd(currentIndex === cards.length - 1);
    };

    const container = document.getElementById('testimonials-container');
    if (container) {
      updateNavigationState();
      container.addEventListener('scroll', updateNavigationState);
      return () => container.removeEventListener('scroll', updateNavigationState);
    }
  }, []);

  return (
    <Layout>
      {/* Limited Time Banner */}
      <div className="text-white py-4 overflow-hidden" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #1e40af 100%)' }}>
        <div className="flex animate-marquee">
          {/* Repeat the content multiple times for seamless loop */}
          {[...Array(20)].map((_, index) => (
            <div key={index} className="achievement-badge mx-8 flex-shrink-0 whitespace-nowrap">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
              </svg>
              تم اطلاق الموقع
            </div>
          ))}
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Unified Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"></div>
        
        {/* Elegant Pattern Overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, white 1px, transparent 1px),
                             radial-gradient(circle at 75% 75%, rgba(255,255,255,0.5) 0.5px, transparent 0.5px)`,
            backgroundSize: '80px 80px, 40px 40px'
          }}></div>
        </div>
        
        {/* Soft Light Elements */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-white/10 to-gray-300/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-gradient-to-tr from-gray-300/15 to-white/10 rounded-full blur-3xl"></div>
        
        {/* Additional Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/20 via-transparent to-gray-500/10"></div>
        
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
              
              <h1 className="text-display-1 md:text-display-2 font-black text-white mb-6 leading-none">
                طور مهاراتك الرياضية مع
                <span className="text-gradient-white block mt-2">الكابتن طه صباغ</span>
              </h1>
              
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                انضم إلى آلاف الرياضيين الذين طوروا مهاراتهم من خلال دوراتنا التدريبية المتخصصة. 
                تعلم من أفضل المدربين واحصل على شهادات معتمدة.
              </p>
              
              {/* Stats */}
               <div className="grid grid-cols-3 gap-6 mb-8">
                 <div className="stats-card bg-white/10 backdrop-blur-sm border border-white/20">
                   <div className="text-2xl font-bold text-white">5050+</div>
                   <div className="text-sm text-white/80">متدرب</div>
                 </div>
                 <div className="stats-card bg-white/10 backdrop-blur-sm border border-white/20">
                   <div className="text-2xl font-bold text-white">50+</div>
                   <div className="text-sm text-white/80">دورة تدريبية</div>
                 </div>
                 <div className="stats-card bg-white/10 backdrop-blur-sm border border-white/20">
                   <div className="text-2xl font-bold text-white">98%</div>
                   <div className="text-sm text-white/80">نسبة الرضا</div>
                 </div>
               </div>
              
              <div className="flex justify-center mt-6">
                <Link
                  href="/courses"
                  className="btn-primary bg-[#41ADE1] hover:bg-[#3399CC] inline-flex items-center gap-2 text-lg px-10 py-3 w-full sm:w-auto"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  ابدأ التدريب الآن
                </Link>
              </div>
            </div>
            <div className="relative animate-scale-in">
              {/* Highlighted Course Card */}
              <div className="card-modern bg-gradient-to-br from-gray-800 to-gray-700 p-8 shadow-xl border border-gray-600">
                <div className="text-center">
                  {/* Course Banner Image */}
                  <div className="relative mx-auto mb-6 w-full max-w-md">
                    <div className="h-44 sm:h-52 rounded-2xl overflow-hidden shadow-glow">
                      <img 
                        src="/بنر مصارعة الذراعين copy.jpg" 
                        alt="بانر دورة مصارعة الذراعين" 
                        className="w-full h-full object-cover"
                      />
                    </div>

                  </div>

                  <h3 className="text-2xl font-bold text-white mb-2">دورة مصارعة الذراعين</h3>

                  <div className="space-y-4 text-white/90 mb-10">
                    <p className="leading-relaxed">اكتشف أسرار القوة والتقنية في مصارعة الذراعين من خلال برنامج تدريبي مكثف يقوده خبراء البطولة.</p>
                    <p className="leading-relaxed">يشمل المنهج خطط قوة وتحمل، تمارين موجهة، واستراتيجيات للفوز في المنافسات الرسمية.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-[#41ADE1] to-[#3399CC] text-white font-extrabold text-3xl rounded-full px-8 py-3 shadow-xl inline-flex items-center gap-3 justify-center">
                      <span className="text-4xl font-bold">$</span>
                      <span>50 دولار فقط</span>
                    </div>

                    <Link
                      href="/courses/arm-wrestling"
                      className="btn-primary bg-[#41ADE1] hover:bg-[#3399CC] inline-flex items-center gap-2 text-lg px-6 py-3 shadow-lg hover:shadow-xl transition"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                      <span>اشترِ الدورة الآن</span>
                    </Link>
                  </div>

                  <p className="text-sm text-white/70 mt-4">سيتم تحويلك إلى صفحة الكورس لإتمام الدفع والتسجيل.</p>
                </div>
              </div>
              

            </div>
          </div>
        </Container>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative">
        {/* Elegant Pattern Overlay */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-black"></div>
          <div className="absolute inset-0 opacity-[0.05]" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, white 1px, transparent 1px),
                             radial-gradient(circle at 75% 75%, rgba(255,255,255,0.5) 0.5px, transparent 0.5px)`,
            backgroundSize: '80px 80px, 40px 40px'
          }}></div>
        </div>
        
        <Container className="relative z-10">
          <div className="text-center mb-20">
            <div className="achievement-badge bg-white/20 backdrop-blur-sm border border-white/30 text-white mb-6 mx-auto">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              مميزات استثنائية
            </div>
            <h2 className="text-hero font-black text-white mb-6">
              لماذا تختار منصتنا؟
            </h2>
            <p className="text-xl leading-relaxed text-white/90 max-w-3xl mx-auto">
              منصة الكابتن طه الصباغ ليست مجرد موقع تدريبي، بل رحلة لبناء البطل بداخلك. 
              نجمع بين الخبرة، القوة، والعلم لنقدّم تجربة تدريبية متكاملة تصنع منك نسخة أقوى في الجسد والعقل.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {/* Feature Card 1 */}
            <div className="card-modern group hover:shadow-glow transition-all duration-500 hover:-translate-y-2 animate-fade-in-up bg-gray-800/50 backdrop-blur-sm border border-gray-700">
              <div className="text-center p-8">
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>

                </div>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-yellow-400 transition-colors">تدريب مبني على خبرة الأبطال</h3>
                <p className="text-white/80 leading-relaxed">تعلّم من بطل الأردن والعالم العربي في مصارعة الذراعين، من واقع التجربة الميدانية وليس من الكتب فقط.</p>
                

              </div>
            </div>
            
            {/* Feature Card 2 */}
            <div className="card-modern group hover:shadow-glow transition-all duration-500 hover:-translate-y-2 animate-fade-in-up animation-delay-200 bg-gray-800/50 backdrop-blur-sm border border-gray-700">
              <div className="text-center p-8">
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-[#41ADE1]/20 to-[#41ADE1]/40 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-10 h-10 text-[#41ADE1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>

                </div>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#41ADE1] transition-colors">نتائج حقيقية ومتابعة شخصية</h3>
                <p className="text-white/80 leading-relaxed">احصل على خطة تدريبية ممنهجة، متابعة مستمرة، وتوجيه مباشر لتحقيق أفضل أداء بدني وذهني.</p>
                

              </div>
            </div>
            
            {/* Feature Card 3 */}
            <div className="card-modern group hover:shadow-glow transition-all duration-500 hover:-translate-y-2 animate-fade-in-up animation-delay-400 bg-gray-800/50 backdrop-blur-sm border border-gray-700">
              <div className="text-center p-8">
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>

                </div>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-purple-400 transition-colors">مجتمع القوة والتحدي</h3>
                <p className="text-white/80 leading-relaxed">انضم إلى مجتمع من الرياضيين الطموحين، تبادل معهم الخبرات، وشارك رحلتك نحو البطولة بخطوات واثقة.</p>
                

              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Captain Taha Al-Sabbagh Introduction Section */}
      <section className="py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, white 1px, transparent 1px),
                             radial-gradient(circle at 75% 75%, rgba(255,255,255,0.5) 0.5px, transparent 0.5px)`,
            backgroundSize: '80px 80px, 40px 40px'
          }}></div>
        </div>
        
        <Container className="relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
              من هو الكابتن 
              <span className="text-gradient bg-gradient-to-r from-primary-400 to-primary-300 bg-clip-text text-transparent"> طه الصباغ</span>؟
            </h2>
            
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              تعرف على رحلة المدرب الذي غيّر حياة آلاف الرياضيين حول العالم
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Content - Now on the left */}
            <div className="order-1 lg:order-1 animate-fade-in-up animation-delay-200 flex flex-col">
              <div className="space-y-6">
                <div className="bg-gray-900 rounded-2xl p-8 shadow-lg border border-gray-700">
                  <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    الخبرة والمؤهلات
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    الكابتن طه الصباغ بطل أردني وعربي في مصارعة الذراعين، يمتلك خبرة تتجاوز عشر سنوات في التدريب الرياضي وتطوير الذات. 
                    حاصل على شهادات معتمدة في الطب الصيني والسوجوك، ويجمع بين القوة البدنية والعلاج البديل في منظومة تدريبية متكاملة.
                  </p>
                </div>
                
                <div className="bg-gray-900 rounded-2xl p-8 shadow-lg border border-gray-700">
                  <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    الإنجازات والنجاحات
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    بطل الأردن لعام 2018 ووصيف البطولة العربية 2020. 
                    مؤسس رياضة مصارعة الذراعين في الأردن ومساهم في تأسيس الاتحاد العربي لها. 
                    درّب أكثر من 5000 متدرّب وساهم في إعداد أبطال محليين وعرب. 
                    مدرّب معتمد في فنون التواصل وتطوير الذات ومحاضر في عدة جامعات أردنية. 
                    اختير ضمن أكثر 100 شخصية مؤثرة عربيًا لعام 2020.
                  </p>
                </div>
                
                <div className="bg-gray-900 rounded-2xl p-8 shadow-lg border border-gray-700">
                  <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                    <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                    الرؤية والرسالة
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    يؤمن الكابتن طه بأن كل إنسان يحمل في داخله بطلاً ينتظر الإطلاق. 
                    رؤيته أن يكون المرجع العربي الأول في القوة البدنية وتطوير الذات، ورسالته تمكين الأفراد من تحقيق التوازن بين القوة الجسدية والنمو الشخصي ليصنعوا فرقًا في حياتهم ومجتمعهم.
                  </p>
                </div>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 mt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">10+</div>
                  <div className="text-sm text-gray-400">سنة خبرة</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">5000+</div>
                  <div className="text-sm text-gray-400">متدرب</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">2018</div>
                  <div className="text-sm text-gray-400">بطل الأردن</div>
                </div>
              </div>
              
              {/* CTA Button */}
              <div className="mt-8 text-center">
                <Link
                  href="/about"
                  className="btn-primary bg-[#41ADE1] hover:bg-[#3399CC] inline-block text-lg px-8 py-4 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                >
                  اقرأ المزيد عن الكابتن طه
                </Link>
              </div>
            </div>
            
            {/* Image Carousel - Now on the right */}
            <div className="order-2 lg:order-2 flex items-center justify-center lg:self-center mt-8 lg:mt-25">
              <div className="w-full max-w-lg">
                <div className="aspect-[9/16] w-full">
                  <ImageCarousel
                    images={[
                      '/taha1.jpg',
                      '/taha2.jpg',
                      '/taha3.jpg',
                      '/taha4.png',
                      '/taha5.png'
                    ]}
                    autoPlay={true}
                    autoPlayInterval={5000}
                    showDots={true}
                    className="animate-fade-in-up h-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>


      {/* Testimonials Section */}
      <section className="py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative">
        {/* Elegant Pattern Overlay */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-black"></div>
          <div className="absolute inset-0 opacity-[0.05]" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, white 1px, transparent 1px),
                             radial-gradient(circle at 75% 75%, rgba(255,255,255,0.5) 0.5px, transparent 0.5px)`,
            backgroundSize: '80px 80px, 40px 40px'
          }}></div>
        </div>
        
        <Container className="relative z-10">
          <div className="text-center mb-20">
            <div className="achievement-badge bg-gray-800/20 backdrop-blur-sm border border-gray-800/30 text-gray-800 mb-6 mx-auto">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              قصص النجاح
            </div>
            
            <h2 className="text-hero font-black text-white mb-6">
              ماذا يقول متدربونا عنا
            </h2>
            
            <p className="text-xl leading-relaxed text-white/90 max-w-3xl mx-auto">
              اكتشف تجارب المتدربين الذين حققوا أهدافهم وغيروا حياتهم من خلال برامجنا التدريبية
            </p>
          </div>
          
          {/* Navigation and Carousel Container */}
          <div className="relative mb-16">
            {/* Navigation Arrows */}
            <button 
              id="testimonials-prev"
              disabled={isAtStart}
              className={`absolute left-4 top-1/2 -translate-y-1/2 z-20 
                         rounded-full p-4 
                         transition-all duration-300 
                         border border-gray-600 backdrop-blur-sm
                         ${isAtStart 
                           ? 'bg-gray-700 cursor-not-allowed opacity-50' 
                           : 'bg-gray-800/90 hover:bg-gray-700 cursor-pointer hover:scale-110 active:scale-95 shadow-2xl'
                         }`}
              onClick={() => {
                if (isAtStart) return;
                
                const container = document.getElementById('testimonials-container');
                if (!container) return;
                
                const cards = Array.from(container.getElementsByClassName('testimonial-card'));
                if (cards.length === 0) return;
                
                // Find the currently visible card (the one most aligned with the container's left)
                const containerRect = container.getBoundingClientRect();
                const containerCenter = containerRect.left + 100; // Small offset for padding
                
                let closestIndex = 0;
                let closestDistance = Infinity;
                
                cards.forEach((card, index) => {
                  const cardRect = card.getBoundingClientRect();
                  const distance = Math.abs(cardRect.left - containerCenter);
                  if (distance < closestDistance) {
                    closestDistance = distance;
                    closestIndex = index;
                  }
                });
                
                // Scroll to previous card one by one
                if (closestIndex > 0) {
                  cards[closestIndex - 1].scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'nearest', 
                    inline: 'start' 
                  });
                }
              }}
              aria-label="الشهادات السابقة"
            >
              <svg className={`w-6 h-6 ${isAtStart ? 'text-gray-400' : 'text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button 
              id="testimonials-next"
              disabled={isAtEnd}
              className={`absolute right-4 top-1/2 -translate-y-1/2 z-20 
                         rounded-full p-4 
                         transition-all duration-300 
                         border border-gray-600 backdrop-blur-sm
                         ${isAtEnd 
                           ? 'bg-gray-700 cursor-not-allowed opacity-50' 
                           : 'bg-gray-800/90 hover:bg-gray-700 cursor-pointer hover:scale-110 active:scale-95 shadow-2xl'
                         }`}
              onClick={() => {
                if (isAtEnd) return;
                
                const container = document.getElementById('testimonials-container');
                if (!container) return;
                
                const cards = Array.from(container.getElementsByClassName('testimonial-card'));
                if (cards.length === 0) return;
                
                // Find the currently visible card (the one most aligned with the container's left)
                const containerRect = container.getBoundingClientRect();
                const containerLeft = containerRect.left + 100; // Small offset for padding
                
                let currentIndex = 0;
                let minDistance = Infinity;
                
                cards.forEach((card, index) => {
                  const cardRect = card.getBoundingClientRect();
                  const distance = Math.abs(cardRect.left - containerLeft);
                  if (distance < minDistance) {
                    minDistance = distance;
                    currentIndex = index;
                  }
                });
                
                // Scroll to next card one by one
                if (currentIndex < cards.length - 1) {
                  cards[currentIndex + 1].scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'nearest', 
                    inline: 'start' 
                  });
                }
              }}
              aria-label="الشهادات التالية"
            >
              <svg className={`w-6 h-6 ${isAtEnd ? 'text-gray-400' : 'text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Testimonials Carousel */}
            <div 
              id="testimonials-container"
              className="flex gap-6 overflow-x-auto scrollbar-hide px-12 py-4 scroll-smooth"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {/* Testimonial 1 - جمانة زرق */}
              <div className="testimonial-card card-modern group hover:shadow-glow transition-all duration-500 hover:-translate-y-2 flex-shrink-0 w-80 h-80 bg-gray-800/50 backdrop-blur-sm border border-gray-700">
                <div className="p-8 h-full flex flex-col">
                  <blockquote className="text-white/90 mb-6 leading-relaxed text-lg flex-1 overflow-hidden">
                <div className="line-clamp-4">
                  بشكرك كتير كابتن طه على هيدي الدورة كانت عن جد أكتر من رائعة، بالإضافة للمعلومات القيمة اللي قدمتها إلنا حبيت كتير هيدي المعلومات بأمانة لكل شخص متواجد معنا بالدورة.. الله يقويك ويعطيك ألف عافية يارب
                </div>
              </blockquote>
                  
                  <div className="flex items-center mt-auto">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                      ج
                    </div>
                    <div>
                      <div className="font-bold text-white">جمانة زرق</div>
                      <div className="text-white/70 text-sm">متدربة في دورة القيادة</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Testimonial 2 - حمزة العسكر */}
              <div className="testimonial-card card-modern group hover:shadow-glow transition-all duration-500 hover:-translate-y-2 flex-shrink-0 w-80 h-80">
                <div className="p-8 h-full flex flex-col">
                  <blockquote className="text-gray-200 mb-6 leading-relaxed text-lg flex-1 overflow-hidden">
                    <div className="line-clamp-4">
                      والله يا كابتن طه جزاك الله خير، أشي توب. بداية قوية لصقل الشخصية القيادية ورسم ملامحها الأولى وتشكيلها لاتخاذ القرارات الصائبة والحاسمة بدون تردد وأنه نقدر على التفكير الصحيح وقدرة الشخصية القيادية على التواصل والتأثير
                    </div>
                  </blockquote>
                  
                  <div className="flex items-center mt-auto">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#41ADE1] to-[#3399CC] rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                      ح
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">حمزة العسكر</div>
                      <div className="text-gray-600 text-sm">متدرب في تطوير القيادة</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Testimonial 3 - محمد الحبيب العراقي */}
              <div className="testimonial-card card-modern group hover:shadow-glow transition-all duration-500 hover:-translate-y-2 flex-shrink-0 w-80 h-80">
                <div className="p-8 h-full flex flex-col">
                  <blockquote className="text-gray-200 mb-6 leading-relaxed text-lg flex-1 overflow-hidden">
                    <div className="line-clamp-4">
                      كل الحب وتقدير كابتننا الراقي كيفيت ووفيت، دورة أكتر من روعة وما ندمان لأن حطيت من وقتي عليها. تحياتي لكل زملائي الطيبين أتمنالكم الموفقية والنجاح الدائم. كلام من القلب حفظكم الله بحفظه ودمتم سالمين
                    </div>
                  </blockquote>
                  
                  <div className="flex items-center mt-auto">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                      م
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">محمد الحبيب العراقي</div>
                      <div className="text-gray-600 text-sm">متدرب في التطوير الشخصي</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Testimonial 4 - رولا أنضوني */}
              <div className="testimonial-card card-modern group hover:shadow-glow transition-all duration-500 hover:-translate-y-2 flex-shrink-0 w-80 h-80">
                <div className="p-8 h-full flex flex-col">
                  <blockquote className="text-gray-200 mb-6 leading-relaxed text-lg flex-1 overflow-hidden">
                    <div className="line-clamp-4">
                      الله يعطيك العافية كابتن طه، أسلوبك بسيط وواضح وعندك قدرة عالية في إيصال المعلومة بشكل واضح ومنظم. لفت انتباهي إنك كتير بتحترم آراء المشاركين ولغة الحوار اللي استخدمتها راقية ومحفزة للنقاش وإن شاء الله رح نستمر معك في حضور باقي الدورات
                    </div>
                  </blockquote>
                  
                  <div className="flex items-center mt-auto">
                    <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                      ر
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">رولا أنضوني</div>
                      <div className="text-gray-600 text-sm">متدربة في مهارات التواصل</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Testimonial 5 - حنين عربيات */}
              <div className="testimonial-card card-modern group hover:shadow-glow transition-all duration-500 hover:-translate-y-2 flex-shrink-0 w-80 h-80">
                <div className="p-8 h-full flex flex-col">
                  <blockquote className="text-gray-200 mb-6 leading-relaxed text-lg flex-1 overflow-hidden">
                    <div className="line-clamp-4">
                      حابة أقدم شكر العظيم للدكتوش طه على المحاضرة الحلوة اللي انحقنا فيها (حول الحوار الراقي) كانت محاضرة كتير مثيرة فيها مفاهيم نحتاجها بحياتنا. بشكرك على أسلوبك الراقي اللي طرحتها مع خالص تقدير والاحترام
                    </div>
                  </blockquote>
                  
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                      ح
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">حنين عربيات</div>
                      <div className="text-gray-600 text-sm">متدربة في الحوار الراقي</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Testimonial 6 - دكتورة شيرين */}
              <div className="testimonial-card card-modern group hover:shadow-glow transition-all duration-500 hover:-translate-y-2 flex-shrink-0 w-80 h-80">
                <div className="p-8 h-full flex flex-col">
                  <blockquote className="text-gray-200 mb-6 leading-relaxed text-lg flex-1 overflow-hidden">
                    <div className="line-clamp-4">
                      ما شاء الله عليك كابتن، حضور جميل ولقاء ممتع ومعلومات غنية وإفادة كبيرة ورقي أخلاقي وتعاملي. بارك الله فيك ويعلمك ينتمي دايماً تعقد دورات مثل هيك
                    </div>
                  </blockquote>
                  
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                      د
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">دكتورة شيرين</div>
                      <div className="text-gray-600 text-sm">طبيبة ومتدربة</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Testimonial 7 - فرح الكسواني */}
              <div className="testimonial-card card-modern group hover:shadow-glow transition-all duration-500 hover:-translate-y-2 flex-shrink-0 w-80 h-80">
                <div className="p-8 h-full flex flex-col">
                  <blockquote className="text-gray-200 mb-6 leading-relaxed text-lg flex-1 overflow-hidden">
                    <div className="line-clamp-4">
                      كابتن طه جد شكرا كتير إلك حرفياً من أكتر المحاضرات المفيدة وبلي بتتأكد إنه كل دقيقة فيها نحطت بالمكان الصح فخورين جداً إنه في بلوقت الحالي شباب طموح ومفيد لغيره يعطيك العافية يا رب وشكراً لجهودك 🌸🌸
                    </div>
                  </blockquote>
                  
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-rose-400 to-rose-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                      ف
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">فرح الكسواني</div>
                      <div className="text-gray-600 text-sm">متدربة في التطوير الشخصي</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Testimonial 8 - مجد عوده */}
              <div className="testimonial-card card-modern group hover:shadow-glow transition-all duration-500 hover:-translate-y-2 flex-shrink-0 w-80 h-80">
                <div className="p-8 h-full flex flex-col">
                  <blockquote className="text-gray-200 mb-6 leading-relaxed text-lg flex-1 overflow-hidden">
                    <div className="line-clamp-4">
                      أحب أقدم شكري وتقديري للكوتش طه الصباغ على جهوده الطيبة في تقديم جلسة &ldquo;فن الحوار الراقي&rdquo; اللقاء كان فيه طاقة إيجابية واضحة وحسيت بصدق نيتك في التأثير الإيجابي ومساعدة الآخرين على تطوير أنفسهم ومميزة وشكراً على طاقتك الحلوة وحضورك الراقي كل الدعم إلك وبالتوفيق دايماً ❤️
                    </div>
                  </blockquote>
                  
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                      م
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">مجد عوده</div>
                      <div className="text-gray-600 text-sm">متدرب في فن الحوار الراقي</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Testimonial 9 - متدرب من فلسطين */}
              <div className="testimonial-card card-modern group hover:shadow-glow transition-all duration-500 hover:-translate-y-2 flex-shrink-0 w-80 h-80">
                <div className="p-8 h-full flex flex-col">
                  <blockquote className="text-gray-200 mb-6 leading-relaxed text-lg flex-1 overflow-hidden">
                    <div className="line-clamp-4">
                      الدورة كانت جداً مفيدة وكان فيه اهتمام أن الكل يتوصلوا المعلومة تماماً شكراً الك استاذ طه على اتقان في العمل قدماً وإلى الأمام ❤️
                    </div>
                  </blockquote>
                  
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                      م
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">متدرب من فلسطين</div>
                      <div className="text-gray-600 text-sm">متدرب في التطوير المهني</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Testimonial 10 - متدرب من العراق */}
              <div className="testimonial-card card-modern group hover:shadow-glow transition-all duration-500 hover:-translate-y-2 flex-shrink-0 w-80 h-80">
                <div className="p-8 h-full flex flex-col">
                  <blockquote className="text-gray-200 mb-6 leading-relaxed text-lg flex-1 overflow-hidden">
                    <div className="line-clamp-4">
                      الله يعطيك العافية كابتن طه استفدنا من حضورتك كتير بس كنت أتمنى لو كان المحتوى أكتر وفي أشخاص ماحسيت كانوا متفاعلين أو مركزين هالشي كان ياخد وقت أطول
                    </div>
                  </blockquote>
                  
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                      م
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">متدرب من العراق</div>
                      <div className="text-gray-600 text-sm">متدرب في التطوير الشخصي</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Testimonial 11 - متدرب من البحرين */}
              <div className="testimonial-card card-modern group hover:shadow-glow transition-all duration-500 hover:-translate-y-2 flex-shrink-0 w-80 h-80">
                <div className="p-8 h-full flex flex-col">
                  <blockquote className="text-gray-200 mb-6 leading-relaxed text-lg flex-1 overflow-hidden">
                    <div className="line-clamp-4">
                      الدورة كانت ممتعة ومفيدة ومعلومات جديدة ممكن الواحد يضيفها لحياته العملية والعلمية، حرصك واهتمامك لإيصال المعلومات للكل كان بشكل واضح، يعطيك العافية يا رب
                    </div>
                  </blockquote>
                  
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                      م
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">متدرب من البحرين</div>
                      <div className="text-gray-600 text-sm">متدرب في التطوير المهني</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Testimonial 12 - أسيل المومني */}
              <div className="testimonial-card card-modern group hover:shadow-glow transition-all duration-500 hover:-translate-y-2 flex-shrink-0 w-80 h-80">
                <div className="p-8 h-full flex flex-col">
                  <blockquote className="text-gray-200 mb-6 leading-relaxed text-lg flex-1 overflow-hidden">
                    <div className="line-clamp-4">
                      يعطيك العافية كانت الدورة لطيفة وممتعة وتنضيف فلنا كتير وطريقة إدارة الدورة كانت جميلة ما فيها ملل
                    </div>
                  </blockquote>
                  
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-violet-400 to-violet-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                      أ
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">أسيل المومني</div>
                      <div className="text-gray-600 text-sm">متدربة في التطوير الشخصي</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Testimonial 13 - بلال سمور */}
              <div className="testimonial-card card-modern group hover:shadow-glow transition-all duration-500 hover:-translate-y-2 flex-shrink-0 w-80 h-80">
                <div className="p-8 h-full flex flex-col">
                  <blockquote className="text-gray-200 mb-6 leading-relaxed text-lg flex-1 overflow-hidden">
                    <div className="line-clamp-4">
                      الله يعطيك العافية كابتن طه تعلمت منك معلومات أول مرة أعرفها وطريقتك بالشرح الدروس والمراجعة أكتر من رائع وانتشرف فيك ويمعرفتك كابتن طه
                    </div>
                  </blockquote>
                  
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-slate-400 to-slate-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                      ب
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">بلال سمور</div>
                      <div className="text-gray-600 text-sm">متدرب في التطوير التعليمي</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Testimonial 14 - عبد العزيز من عُمان */}
              <div className="testimonial-card card-modern group hover:shadow-glow transition-all duration-500 hover:-translate-y-2 flex-shrink-0 w-80 h-80">
                <div className="p-8 h-full flex flex-col">
                  <blockquote className="text-gray-200 mb-6 leading-relaxed text-lg flex-1 overflow-hidden">
                    <div className="line-clamp-4">
                      معلومات الدورة بحد ذاتها لا تساوي شيئاً بالنسبة لي فقد مرت على مراراً قبل هذه الدورة أما القيمة اللي نستحق 50-100$ هي في أسلوبك المحفز والأنشطة الجميلة وربط المعلومات بأمثلة عربية وقصص كانت هي ميزتك عن باقي المحاضرين في هذا الموضوع والله أنضحت لي أمور خفية كانت الشخصية القوية شيئاً من المجهول و أمست شيئاً من المعلوم السهل الوصول إليه جزاك الله خيراً ونفع الله بك وبارك في علمك يا كابتن كان لنا الشرف بالتعرف عليك و على الحضور الكريم
                    </div>
                  </blockquote>
                  
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                      ع
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">عبد العزيز من عُمان</div>
                      <div className="text-gray-600 text-sm">متدرب في بناء الشخصية القوية</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Testimonial 15 - دانا المحيسيري */}
              <div className="testimonial-card card-modern group hover:shadow-glow transition-all duration-500 hover:-translate-y-2 flex-shrink-0 w-80 h-80">
                <div className="p-8 h-full flex flex-col">
                  <blockquote className="text-gray-200 mb-6 leading-relaxed text-lg flex-1 overflow-hidden">
                    <div className="line-clamp-4">
                      كوتش طه ربي يعطيك ألف عافية ويجزيك عنا خير جزاء ❤️ كانت جلسة رائعة.. ممتعة.. مفيدة.. مسلية فعلياً مضى الوقت 3 ساعات وكأنها نص ساعة كنت بتمنى لو الوقت أطول كتير مصطلحات وكتير مفاهيم فهمتها اليوم بشكل أدق أشياء كنت مفكرة حالي بعرفها اكتشفت إنه معرفتي كانت ناقصة واليوم كملتها بالمعلومات يلي قدمتنا إياها كانت جلسة حوارية جداً مفيدة بعنوان &ldquo;فن الحوار الراقي&rdquo; ربي يقدرنا عالتطبيق ويشكرك جداً من قلبي على رقيك بالتعامل وأسلوبك فعلياً لا يمل.. شكراً كتير كوتش طه ❤️
                    </div>
                  </blockquote>
                  
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-fuchsia-400 to-fuchsia-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                      د
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">دانا المحيسيري</div>
                      <div className="text-gray-600 text-sm">متدربة في فن الحوار الراقي</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Testimonial 16 - غادة أبو سمرة */}
              <div className="testimonial-card card-modern group hover:shadow-glow transition-all duration-500 hover:-translate-y-2 flex-shrink-0 w-80 h-80">
                <div className="p-8 h-full flex flex-col">
                  <blockquote className="text-gray-200 mb-6 leading-relaxed text-lg flex-1 overflow-hidden">
                    <div className="line-clamp-4">
                      ماشاءالله عنك ياكوتش ويعطيك العافية على المحاضرة الحلوة كانت أكتر من مجرد دوره ... كانت ورشة فن الحوار) فيها وعي ومعلومات قيمة جداً وأسلوبك وطلاقتك إبداعية وطريقتك بتطوير وتوصيل المعلومة جداً رائعة 💥 وإن شاء الله رح أستمر معك في حضور باقي دورات 🌹🌹
                    </div>
                  </blockquote>
                  
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-lime-400 to-lime-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                      غ
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">غادة أبو سمرة</div>
                      <div className="text-gray-600 text-sm">متدربة في ورشة فن الحوار</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Success Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="stats-card mb-4">
                <div className="text-4xl font-black text-[#41ADE1] mb-2">98%</div>
                <div className="text-white/80 font-medium">معدل الرضا</div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="stats-card mb-4">
                <div className="text-4xl font-black text-[#41ADE1] mb-2">5050+</div>
                <div className="text-white/80 font-medium">متدرب ناجح</div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="stats-card mb-4">
                <div className="text-4xl font-black text-[#41ADE1] mb-2">15+</div>
                <div className="text-white/80 font-medium">سنة خبرة</div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="stats-card mb-4">
                <div className="text-4xl font-black text-[#41ADE1] mb-2">50+</div>
                <div className="text-white/80 font-medium">دورة تدريبية</div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        {/* Elegant Background Pattern */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/30 via-transparent to-white/5"></div>
          <div className="absolute inset-0 opacity-[0.08]" style={{
            backgroundImage: `radial-gradient(circle at 20% 80%, white 1px, transparent 1px),
                             radial-gradient(circle at 80% 20%, white 1px, transparent 1px),
                             radial-gradient(circle at 40% 40%, white 0.5px, transparent 0.5px)`,
            backgroundSize: '100px 100px, 100px 100px, 50px 50px'
          }}></div>
        </div>
        
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
            
            <p className="text-xl leading-relaxed mb-10 opacity-90 max-w-2xl mx-auto animate-fade-in-up animation-delay-200">
              انضم إلى آلاف المتدربين واحصل على أفضل التدريبات الرياضية مع أحدث التقنيات والأساليب المتطورة
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up animation-delay-400">
              <Link
                href="/courses"
                className="btn-primary bg-[#41ADE1] text-white hover:bg-[#3399CC] shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 inline-flex items-center gap-2 text-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                استكشف الدورات
              </Link>
              
              <Link
                href="/about"
                className="btn-secondary bg-transparent text-white border-2 border-[#41ADE1]/50 hover:bg-[#41ADE1]/20 hover:border-[#41ADE1]/70 inline-flex items-center gap-2 text-lg"
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