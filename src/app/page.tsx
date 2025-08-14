import Link from 'next/link';
import { Layout, Container } from '@/components/layout';

export default function Home() {
  return (
    <Layout>
      {/* Limited Time Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-green-500 text-white py-3">
        <Container>
          <div className="text-center">
            <p className="text-sm font-medium">
              🔥 عرض محدود: خصم 30% على جميع الدورات التدريبية - ينتهي خلال 7 أيام!
            </p>
          </div>
        </Container>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-green-50 py-20">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-right">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                طور مهاراتك الرياضية مع
                <span className="text-blue-600 block">طه صباغ</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                انضم إلى آلاف الرياضيين الذين طوروا مهاراتهم من خلال دوراتنا التدريبية المتخصصة. 
                تعلم من أفضل المدربين واحصل على شهادات معتمدة.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  href="/courses"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors shadow-lg hover:shadow-xl"
                >
                  ابدأ التدريب الآن
                </Link>
                <Link
                  href="/about"
                  className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
                >
                  تعرف علينا أكثر
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-400 to-green-400 rounded-2xl p-8 shadow-2xl">
                <div className="bg-white rounded-xl p-6 text-center">
                  <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-3xl font-bold">ط</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">طه صباغ</h3>
                  <p className="text-gray-600">مدرب رياضي معتمد</p>
                  <div className="flex justify-center mt-4 space-x-1 space-x-reverse">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <Container>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              لماذا تختار منصتنا؟
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              نقدم تجربة تعليمية متميزة تجمع بين الخبرة العملية والتقنيات الحديثة
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">محتوى عالي الجودة</h3>
              <p className="text-gray-600">دورات مصممة بعناية من قبل خبراء في المجال الرياضي</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">شهادات معتمدة</h3>
              <p className="text-gray-600">احصل على شهادات معتمدة تعزز من مسيرتك المهنية</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">مجتمع تفاعلي</h3>
              <p className="text-gray-600">انضم إلى مجتمع من الرياضيين والمدربين المحترفين</p>
            </div>
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-green-500 py-20">
        <Container>
          <div className="text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              ابدأ رحلتك التدريبية اليوم
            </h2>
            <p className="text-xl mb-8 opacity-90">
              انضم إلى آلاف المتدربين واحصل على أفضل التدريبات الرياضية
            </p>
            <Link
              href="/courses"
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-lg text-lg font-semibold transition-colors shadow-lg hover:shadow-xl inline-block"
            >
              استكشف الدورات
            </Link>
          </div>
        </Container>
      </section>
    </Layout>
  );
}
