import { Layout, Container } from '@/components/layout';
import Link from 'next/link';
import {
  QuestionMarkCircleIcon,
  ChatBubbleLeftRightIcon,
  BookOpenIcon,
  PhoneIcon,
  EnvelopeIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

const HelpPage = () => {
  const helpCategories = [
    {
      title: 'الأسئلة الشائعة',
      description: 'إجابات سريعة على الأسئلة الأكثر شيوعاً',
      icon: QuestionMarkCircleIcon,
      link: '/faq',
      color: 'blue'
    },
    {
      title: 'تواصل معنا',
      description: 'احصل على مساعدة مباشرة من فريق الدعم',
      icon: ChatBubbleLeftRightIcon,
      link: '/contact',
      color: 'green'
    },
    {
      title: 'دليل المستخدم',
      description: 'تعلم كيفية استخدام جميع ميزات المنصة',
      icon: BookOpenIcon,
      link: '#user-guide',
      color: 'purple'
    },
    {
      title: 'الدعم الفني',
      description: 'حلول للمشاكل التقنية والفنية',
      icon: UserGroupIcon,
      link: '#technical-support',
      color: 'orange'
    }
  ];

  const quickActions = [
    {
      title: 'البحث في المساعدة',
      description: 'ابحث عن إجابات سريعة',
      icon: MagnifyingGlassIcon,
      action: 'search'
    },
    {
      title: 'اتصل بنا',
      description: '+966 11 123 4567',
      icon: PhoneIcon,
      action: 'call'
    },
    {
      title: 'راسلنا',
      description: 'support@sportsplatform.com',
      icon: EnvelopeIcon,
      action: 'email'
    },
    {
      title: 'ساعات العمل',
      description: 'الأحد - الخميس: 9ص - 6م',
      icon: ClockIcon,
      action: 'hours'
    }
  ];

  const commonTopics = [
    {
      title: 'كيفية التسجيل في الدورات',
      description: 'خطوات بسيطة للانضمام إلى الدورات التدريبية'
    },
    {
      title: 'إدارة الحساب والملف الشخصي',
      description: 'تحديث المعلومات وإعدادات الحساب'
    },
    {
      title: 'طرق الدفع والفوترة',
      description: 'معلومات حول الدفع والاشتراكات'
    },
    {
      title: 'تتبع التقدم والشهادات',
      description: 'كيفية مراقبة تقدمك والحصول على الشهادات'
    },
    {
      title: 'المشاكل التقنية',
      description: 'حلول للمشاكل الشائعة في التشغيل'
    },
    {
      title: 'سياسة الاسترداد',
      description: 'شروط وإجراءات استرداد الأموال'
    }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-700 text-white py-20">
        <Container>
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-6">
              <QuestionMarkCircleIcon className="w-16 h-16 text-blue-300 ml-4" />
              <h1 className="text-4xl md:text-5xl font-bold">
                مركز المساعدة
              </h1>
            </div>
            <p className="text-xl md:text-2xl text-blue-100 leading-relaxed mb-8">
              نحن هنا لمساعدتك في كل خطوة من رحلتك التعليمية
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="ابحث عن إجابة..."
                  className="w-full px-12 py-4 rounded-lg text-gray-900 text-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
                <button className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors">
                  بحث
                </button>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Quick Actions */}
      <section className="py-12 bg-gray-50">
        <Container>
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">إجراءات سريعة</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickActions.map((action, index) => {
                const IconComponent = action.icon;
                return (
                  <div
                    key={index}
                    className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-200 text-center cursor-pointer"
                  >
                    <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-4">
                      <IconComponent className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{action.title}</h3>
                    <p className="text-gray-600 text-sm">{action.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </Container>
      </section>

      {/* Help Categories */}
      <section className="py-16 bg-white">
        <Container>
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">كيف يمكننا مساعدتك؟</h2>
              <p className="text-xl text-gray-600">اختر الفئة التي تناسب احتياجاتك</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {helpCategories.map((category, index) => {
                const IconComponent = category.icon;
                const colorClasses: Record<string, string> = {
                  blue: 'bg-blue-50 border-blue-200 hover:border-blue-300',
                  green: 'bg-green-50 border-green-200 hover:border-green-300',
                  purple: 'bg-purple-50 border-purple-200 hover:border-purple-300',
                  orange: 'bg-orange-50 border-orange-200 hover:border-orange-300'
                };
                const iconClasses: Record<string, string> = {
                  blue: 'text-blue-600',
                  green: 'text-green-600',
                  purple: 'text-purple-600',
                  orange: 'text-orange-600'
                };
                
                return (
                  <Link
                    key={index}
                    href={category.link}
                    className={`block p-8 rounded-xl border-2 transition-all hover:shadow-lg ${colorClasses[category.color]}`}
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0 ml-6">
                        <IconComponent className={`w-12 h-12 ${iconClasses[category.color]}`} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">{category.title}</h3>
                        <p className="text-gray-600 leading-relaxed">{category.description}</p>
                        <div className="mt-4">
                          <span className={`inline-flex items-center text-sm font-medium ${iconClasses[category.color]} hover:underline`}>
                            تصفح الآن
                            <svg className="mr-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </Container>
      </section>

      {/* Common Topics */}
      <section className="py-16 bg-gray-50">
        <Container>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">المواضيع الشائعة</h2>
            <div className="space-y-4">
              {commonTopics.map((topic, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-200 cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">{topic.title}</h3>
                      <p className="text-gray-600 text-sm">{topic.description}</p>
                    </div>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* User Guide Section */}
      <section id="user-guide" className="py-16 bg-white">
        <Container>
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <BookOpenIcon className="w-16 h-16 text-purple-600 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gray-900 mb-4">دليل المستخدم</h2>
              <p className="text-xl text-gray-600">تعلم كيفية الاستفادة القصوى من منصتنا</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-purple-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-purple-900 mb-4">للمبتدئين</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-purple-200 rounded-full flex items-center justify-center mt-1 ml-3">
                      <span className="text-purple-800 text-xs font-bold">1</span>
                    </div>
                    <span className="text-purple-800">إنشاء حساب جديد</span>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-purple-200 rounded-full flex items-center justify-center mt-1 ml-3">
                      <span className="text-purple-800 text-xs font-bold">2</span>
                    </div>
                    <span className="text-purple-800">تصفح الدورات المتاحة</span>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-purple-200 rounded-full flex items-center justify-center mt-1 ml-3">
                      <span className="text-purple-800 text-xs font-bold">3</span>
                    </div>
                    <span className="text-purple-800">التسجيل في أول دورة</span>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-purple-200 rounded-full flex items-center justify-center mt-1 ml-3">
                      <span className="text-purple-800 text-xs font-bold">4</span>
                    </div>
                    <span className="text-purple-800">بدء التعلم وتتبع التقدم</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-purple-900 mb-4">للمستخدمين المتقدمين</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-purple-200 rounded-full flex items-center justify-center mt-1 ml-3">
                      <span className="text-purple-800 text-xs font-bold">1</span>
                    </div>
                    <span className="text-purple-800">تخصيص الملف الشخصي</span>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-purple-200 rounded-full flex items-center justify-center mt-1 ml-3">
                      <span className="text-purple-800 text-xs font-bold">2</span>
                    </div>
                    <span className="text-purple-800">إدارة الاشتراكات</span>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-purple-200 rounded-full flex items-center justify-center mt-1 ml-3">
                      <span className="text-purple-800 text-xs font-bold">3</span>
                    </div>
                    <span className="text-purple-800">تحميل الشهادات</span>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-purple-200 rounded-full flex items-center justify-center mt-1 ml-3">
                      <span className="text-purple-800 text-xs font-bold">4</span>
                    </div>
                    <span className="text-purple-800">استخدام الميزات المتقدمة</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Technical Support */}
      <section id="technical-support" className="py-16 bg-gray-50">
        <Container>
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <UserGroupIcon className="w-16 h-16 text-orange-600 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gray-900 mb-4">الدعم الفني</h2>
              <p className="text-xl text-gray-600">حلول سريعة للمشاكل التقنية الشائعة</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">مشاكل تشغيل الفيديو</h3>
                <ul className="space-y-2 text-gray-600 text-sm">
                  <li>• تحقق من سرعة الإنترنت</li>
                  <li>• امسح ذاكرة التخزين المؤقت</li>
                  <li>• جرب متصفح آخر</li>
                  <li>• تأكد من تحديث المتصفح</li>
                </ul>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">مشاكل تسجيل الدخول</h3>
                <ul className="space-y-2 text-gray-600 text-sm">
                  <li>• تحقق من البريد الإلكتروني وكلمة المرور</li>
                  <li>• استخدم خاصية "نسيت كلمة المرور"</li>
                  <li>• امسح ملفات تعريف الارتباط</li>
                  <li>• تواصل مع الدعم الفني</li>
                </ul>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">مشاكل الدفع</h3>
                <ul className="space-y-2 text-gray-600 text-sm">
                  <li>• تحقق من صحة بيانات البطاقة</li>
                  <li>• تأكد من وجود رصيد كافي</li>
                  <li>• جرب طريقة دفع أخرى</li>
                  <li>• تواصل مع البنك إذا لزم الأمر</li>
                </ul>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">مشاكل الشهادات</h3>
                <ul className="space-y-2 text-gray-600 text-sm">
                  <li>• تأكد من إكمال جميع الدروس</li>
                  <li>• اجتياز الاختبارات المطلوبة</li>
                  <li>• انتظر 24-48 ساعة للمعالجة</li>
                  <li>• تحقق من مجلد البريد المهمل</li>
                </ul>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Contact CTA */}
      <section className="py-16 bg-blue-900 text-white">
        <Container>
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">لم تجد ما تبحث عنه؟</h2>
            <p className="text-xl text-blue-100 mb-8">
              فريق الدعم لدينا متاح لمساعدتك في أي وقت
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="bg-white text-blue-900 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                تواصل معنا
              </Link>
              <Link
                href="/faq"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-900 transition-colors"
              >
                الأسئلة الشائعة
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </Layout>
  );
};

export default HelpPage;