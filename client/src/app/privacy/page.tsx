import { Layout, Container } from '@/components/layout';
import {
  ShieldCheckIcon,
  EyeIcon,
  LockClosedIcon,
  UserIcon,
  DocumentTextIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const PrivacyPage = () => {
  const sections = [
    {
      id: 'introduction',
      title: 'مقدمة',
      icon: DocumentTextIcon
    },
    {
      id: 'data-collection',
      title: 'جمع البيانات',
      icon: UserIcon
    },
    {
      id: 'data-usage',
      title: 'استخدام البيانات',
      icon: EyeIcon
    },
    {
      id: 'data-protection',
      title: 'حماية البيانات',
      icon: LockClosedIcon
    },
    {
      id: 'user-rights',
      title: 'حقوق المستخدم',
      icon: ShieldCheckIcon
    },
    {
      id: 'updates',
      title: 'التحديثات',
      icon: ClockIcon
    }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 text-white py-20">
        <Container>
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-6">
              <ShieldCheckIcon className="w-16 h-16 text-blue-400 ml-4" />
              <h1 className="text-4xl md:text-5xl font-bold">
                سياسة الخصوصية
              </h1>
            </div>
            <p className="text-xl md:text-2xl text-gray-300 leading-relaxed mb-6">
              نحن ملتزمون بحماية خصوصيتك وبياناتك الشخصية
            </p>
            <div className="bg-blue-900/30 rounded-lg p-4 inline-block">
              <p className="text-blue-200">
                آخر تحديث: 15 يناير 2024
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Table of Contents */}
      <section className="py-12 bg-gray-50">
        <Container>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">المحتويات</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sections.map((section, index) => {
                const IconComponent = section.icon;
                return (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="bg-gray-800 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow border border-gray-600 hover:border-blue-300"
                  >
                    <div className="flex items-center">
                      <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg ml-3">
                        <IconComponent className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-500 mb-1">{index + 1}.</div>
                        <div className="font-medium text-gray-900">{section.title}</div>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </Container>
      </section>

      {/* Privacy Policy Content */}
      <section className="py-16 bg-gray-800">
        <Container>
          <div className="max-w-4xl mx-auto prose prose-lg prose-gray max-w-none">
            
            {/* Introduction */}
            <div id="introduction" className="mb-16">
              <div className="flex items-center mb-6">
                <DocumentTextIcon className="w-8 h-8 text-blue-600 ml-3" />
                <h2 className="text-3xl font-bold text-gray-900 m-0">1. مقدمة</h2>
              </div>
              <div className="bg-blue-50 border-r-4 border-blue-600 p-6 rounded-lg mb-6">
                <p className="text-gray-200 leading-relaxed m-0">
                  مرحباً بك في منصة التدريب الرياضي. نحن نقدر ثقتك بنا ونلتزم بحماية خصوصيتك وبياناتك الشخصية. تشرح هذه السياسة كيفية جمعنا واستخدامنا وحمايتنا لمعلوماتك الشخصية عند استخدام خدماتنا.
                </p>
              </div>
              <p className="text-gray-200 leading-relaxed">
                من خلال استخدام منصتنا، فإنك توافق على جمع واستخدام المعلومات وفقاً لهذه السياسة. إذا كان لديك أي أسئلة أو مخاوف بشأن سياسة الخصوصية هذه، يرجى التواصل معنا.
              </p>
              <p className="text-gray-200 leading-relaxed">
                تنطبق هذه السياسة على جميع المستخدمين لموقعنا الإلكتروني وتطبيقاتنا المحمولة وخدماتنا ذات الصلة.
              </p>
            </div>

            {/* Data Collection */}
            <div id="data-collection" className="mb-16">
              <div className="flex items-center mb-6">
                <UserIcon className="w-8 h-8 text-green-600 ml-3" />
                <h2 className="text-3xl font-bold text-gray-900 m-0">2. جمع البيانات</h2>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-4">2.1 المعلومات التي نجمعها</h3>
              <p className="text-gray-200 leading-relaxed mb-4">
                نجمع أنواعاً مختلفة من المعلومات لتقديم وتحسين خدماتنا:
              </p>
              
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">المعلومات الشخصية:</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-200">
                  <li>الاسم الكامل وتاريخ الميلاد</li>
                  <li>عنوان البريد الإلكتروني</li>
                  <li>رقم الهاتف</li>
                  <li>العنوان والموقع الجغرافي</li>
                  <li>معلومات الدفع والفوترة</li>
                </ul>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">معلومات الاستخدام:</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-200">
                  <li>سجل تصفح الموقع والتطبيق</li>
                  <li>تقدم الدورات والإنجازات</li>
                  <li>تفضيلات التعلم والاهتمامات</li>
                  <li>معلومات الجهاز ونوع المتصفح</li>
                  <li>عنوان IP وبيانات الموقع</li>
                </ul>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-4">2.2 كيفية جمع البيانات</h3>
              <p className="text-gray-200 leading-relaxed">
                نجمع المعلومات بطرق مختلفة: عند التسجيل في الحساب، شراء الدورات، التفاعل مع المحتوى، استخدام ملفات تعريف الارتباط، والتواصل مع خدمة العملاء.
              </p>
            </div>

            {/* Data Usage */}
            <div id="data-usage" className="mb-16">
              <div className="flex items-center mb-6">
                <EyeIcon className="w-8 h-8 text-purple-600 ml-3" />
                <h2 className="text-3xl font-bold text-gray-900 m-0">3. استخدام البيانات</h2>
              </div>
              
              <p className="text-gray-200 leading-relaxed mb-6">
                نستخدم المعلومات التي نجمعها للأغراض التالية:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-purple-50 rounded-lg p-6">
                  <h4 className="font-semibold text-purple-900 mb-3">تقديم الخدمات:</h4>
                  <ul className="list-disc list-inside space-y-1 text-purple-800 text-sm">
                    <li>إنشاء وإدارة حسابك</li>
                    <li>تقديم الدورات والمحتوى</li>
                    <li>معالجة المدفوعات</li>
                    <li>تتبع التقدم والإنجازات</li>
                  </ul>
                </div>
                <div className="bg-purple-50 rounded-lg p-6">
                  <h4 className="font-semibold text-purple-900 mb-3">التحسين والتطوير:</h4>
                  <ul className="list-disc list-inside space-y-1 text-purple-800 text-sm">
                    <li>تحليل استخدام المنصة</li>
                    <li>تطوير ميزات جديدة</li>
                    <li>تخصيص المحتوى</li>
                    <li>تحسين تجربة المستخدم</li>
                  </ul>
                </div>
                <div className="bg-purple-50 rounded-lg p-6">
                  <h4 className="font-semibold text-purple-900 mb-3">التواصل:</h4>
                  <ul className="list-disc list-inside space-y-1 text-purple-800 text-sm">
                    <li>إرسال التحديثات والإشعارات</li>
                    <li>الرد على الاستفسارات</li>
                    <li>إرسال العروض والترويجات</li>
                    <li>تقديم الدعم الفني</li>
                  </ul>
                </div>
                <div className="bg-purple-50 rounded-lg p-6">
                  <h4 className="font-semibold text-purple-900 mb-3">الأمان والامتثال:</h4>
                  <ul className="list-disc list-inside space-y-1 text-purple-800 text-sm">
                    <li>منع الاحتيال والانتهاكات</li>
                    <li>ضمان أمان المنصة</li>
                    <li>الامتثال للقوانين</li>
                    <li>حل النزاعات</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Data Protection */}
            <div id="data-protection" className="mb-16">
              <div className="flex items-center mb-6">
                <LockClosedIcon className="w-8 h-8 text-red-600 ml-3" />
                <h2 className="text-3xl font-bold text-gray-900 m-0">4. حماية البيانات</h2>
              </div>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
                <h4 className="font-semibold text-red-900 mb-3">التزامنا بالأمان:</h4>
                <p className="text-red-800 leading-relaxed">
                  نتخذ إجراءات أمنية صارمة لحماية معلوماتك الشخصية من الوصول غير المصرح به أو التغيير أو الكشف أو التدمير.
                </p>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-4">4.1 الإجراءات الأمنية</h3>
              <div className="space-y-4 mb-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mt-1 ml-3">
                    <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">التشفير</h4>
                    <p className="text-gray-600 text-sm">جميع البيانات الحساسة مشفرة أثناء النقل والتخزين باستخدام معايير التشفير المتقدمة</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mt-1 ml-3">
                    <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">التحكم في الوصول</h4>
                    <p className="text-gray-600 text-sm">الوصول إلى البيانات مقيد على الموظفين المصرح لهم فقط وفقاً لمبدأ الحد الأدنى من الامتيازات</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mt-1 ml-3">
                    <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">المراقبة المستمرة</h4>
                    <p className="text-gray-600 text-sm">نراقب أنظمتنا باستمرار للكشف عن أي أنشطة مشبوهة أو محاولات اختراق</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mt-1 ml-3">
                    <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">النسخ الاحتياطي</h4>
                    <p className="text-gray-600 text-sm">نقوم بعمل نسخ احتياطية منتظمة ومشفرة لضمان استمرارية الخدمة واسترداد البيانات</p>
                  </div>
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-4">4.2 مشاركة البيانات</h3>
              <p className="text-gray-200 leading-relaxed mb-4">
                لا نبيع أو نؤجر أو نشارك معلوماتك الشخصية مع أطراف ثالثة إلا في الحالات التالية:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-200 mb-6">
                <li>بموافقتك الصريحة</li>
                <li>مع مقدمي الخدمات الموثوقين الذين يساعدوننا في تشغيل المنصة</li>
                <li>عند الطلب من السلطات القانونية المختصة</li>
                <li>لحماية حقوقنا أو حقوق المستخدمين الآخرين</li>
              </ul>
            </div>

            {/* User Rights */}
            <div id="user-rights" className="mb-16">
              <div className="flex items-center mb-6">
                <ShieldCheckIcon className="w-8 h-8 text-blue-600 ml-3" />
                <h2 className="text-3xl font-bold text-gray-900 m-0">5. حقوق المستخدم</h2>
              </div>
              
              <p className="text-gray-200 leading-relaxed mb-6">
                لديك حقوق معينة فيما يتعلق ببياناتك الشخصية. يمكنك ممارسة هذه الحقوق من خلال التواصل معنا:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 rounded-lg p-6">
                  <h4 className="font-semibold text-blue-900 mb-3">الحق في الوصول</h4>
                  <p className="text-blue-800 text-sm leading-relaxed">
                    يمكنك طلب نسخة من جميع البيانات الشخصية التي نحتفظ بها عنك
                  </p>
                </div>
                <div className="bg-blue-50 rounded-lg p-6">
                  <h4 className="font-semibold text-blue-900 mb-3">الحق في التصحيح</h4>
                  <p className="text-blue-800 text-sm leading-relaxed">
                    يمكنك طلب تصحيح أو تحديث أي معلومات غير دقيقة أو ناقصة
                  </p>
                </div>
                <div className="bg-blue-50 rounded-lg p-6">
                  <h4 className="font-semibold text-blue-900 mb-3">الحق في الحذف</h4>
                  <p className="text-blue-800 text-sm leading-relaxed">
                    يمكنك طلب حذف بياناتك الشخصية في ظروف معينة
                  </p>
                </div>
                <div className="bg-blue-50 rounded-lg p-6">
                  <h4 className="font-semibold text-blue-900 mb-3">الحق في النقل</h4>
                  <p className="text-blue-800 text-sm leading-relaxed">
                    يمكنك طلب نقل بياناتك إلى خدمة أخرى بتنسيق قابل للقراءة آلياً
                  </p>
                </div>
                <div className="bg-blue-50 rounded-lg p-6">
                  <h4 className="font-semibold text-blue-900 mb-3">الحق في الاعتراض</h4>
                  <p className="text-blue-800 text-sm leading-relaxed">
                    يمكنك الاعتراض على معالجة بياناتك لأغراض التسويق المباشر
                  </p>
                </div>
                <div className="bg-blue-50 rounded-lg p-6">
                  <h4 className="font-semibold text-blue-900 mb-3">الحق في التقييد</h4>
                  <p className="text-blue-800 text-sm leading-relaxed">
                    يمكنك طلب تقييد معالجة بياناتك في ظروف معينة
                  </p>
                </div>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-6">
                <h4 className="font-semibold text-yellow-900 mb-3">كيفية ممارسة حقوقك:</h4>
                <p className="text-yellow-800 leading-relaxed mb-3">
                  لممارسة أي من هذه الحقوق، يرجى التواصل معنا عبر البريد الإلكتروني أو نموذج الاتصال. سنرد على طلبك خلال 30 يوماً من تاريخ الاستلام.
                </p>
                <p className="text-yellow-800 text-sm">
                  قد نطلب منك التحقق من هويتك قبل معالجة طلبك لضمان أمان بياناتك.
                </p>
              </div>
            </div>

            {/* Updates */}
            <div id="updates" className="mb-16">
              <div className="flex items-center mb-6">
                <ClockIcon className="w-8 h-8 text-orange-600 ml-3" />
                <h2 className="text-3xl font-bold text-gray-900 m-0">6. التحديثات والتغييرات</h2>
              </div>
              
              <div className="bg-orange-50 border-r-4 border-orange-600 p-6 rounded-lg mb-6">
                <p className="text-orange-800 leading-relaxed m-0">
                  قد نقوم بتحديث سياسة الخصوصية هذه من وقت لآخر لتعكس التغييرات في ممارساتنا أو لأسباب تشغيلية أو قانونية أو تنظيمية أخرى.
                </p>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-4">6.1 إشعار التغييرات</h3>
              <p className="text-gray-200 leading-relaxed mb-4">
                عند إجراء تغييرات جوهرية على هذه السياسة، سنقوم بما يلي:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-200 mb-6">
                <li>نشر السياسة المحدثة على موقعنا الإلكتروني</li>
                <li>إرسال إشعار عبر البريد الإلكتروني للمستخدمين المسجلين</li>
                <li>عرض إشعار بارز على المنصة لفترة معقولة</li>
                <li>تحديث تاريخ "آخر تحديث" في أعلى هذه الصفحة</li>
              </ul>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-4">6.2 الموافقة على التغييرات</h3>
              <p className="text-gray-200 leading-relaxed">
                استمرارك في استخدام خدماتنا بعد نشر التغييرات يعني موافقتك على السياسة المحدثة. إذا كنت لا توافق على التغييرات، يمكنك إلغاء حسابك والتوقف عن استخدام خدماتنا.
              </p>
            </div>

            {/* Contact Information */}
            <div className="bg-gray-50 rounded-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">تواصل معنا</h2>
              <p className="text-gray-200 leading-relaxed mb-6 text-center">
                إذا كان لديك أي أسئلة أو مخاوف حول سياسة الخصوصية هذه أو ممارسات البيانات الخاصة بنا، يرجى التواصل معنا:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">البريد الإلكتروني</h4>
                  <p className="text-blue-600">privacy@sportsplatform.com</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">الهاتف</h4>
                  <p className="text-blue-600">+966 11 123 4567</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">العنوان</h4>
                  <p className="text-gray-600">شارع الملك فهد، الرياض<br />المملكة العربية السعودية</p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </Layout>
  );
};

export default PrivacyPage;
