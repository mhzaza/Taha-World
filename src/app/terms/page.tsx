import { Layout, Container } from '@/components/layout';
import {
  DocumentTextIcon,
  ScaleIcon,
  ExclamationTriangleIcon,
  CreditCardIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  ClockIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

const TermsPage = () => {
  const sections = [
    {
      id: 'introduction',
      title: 'مقدمة',
      icon: DocumentTextIcon
    },
    {
      id: 'acceptance',
      title: 'قبول الشروط',
      icon: ScaleIcon
    },
    {
      id: 'services',
      title: 'الخدمات',
      icon: GlobeAltIcon
    },
    {
      id: 'user-accounts',
      title: 'حسابات المستخدمين',
      icon: UserGroupIcon
    },
    {
      id: 'payment',
      title: 'الدفع والفوترة',
      icon: CreditCardIcon
    },
    {
      id: 'prohibited',
      title: 'الاستخدام المحظور',
      icon: ExclamationTriangleIcon
    },
    {
      id: 'liability',
      title: 'المسؤولية',
      icon: ShieldCheckIcon
    },
    {
      id: 'modifications',
      title: 'التعديلات',
      icon: ClockIcon
    }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-700 text-white py-20">
        <Container>
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-6">
              <ScaleIcon className="w-16 h-16 text-blue-300 ml-4" />
              <h1 className="text-4xl md:text-5xl font-bold">
                شروط الاستخدام
              </h1>
            </div>
            <p className="text-xl md:text-2xl text-blue-100 leading-relaxed mb-6">
              الشروط والأحكام التي تحكم استخدام منصتنا
            </p>
            <div className="bg-blue-800/50 rounded-lg p-4 inline-block">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {sections.map((section, index) => {
                const IconComponent = section.icon;
                return (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow border border-gray-200 hover:border-blue-300"
                  >
                    <div className="text-center">
                      <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-3">
                        <IconComponent className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="text-sm text-gray-500 mb-1">{index + 1}.</div>
                      <div className="font-medium text-gray-900 text-sm">{section.title}</div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </Container>
      </section>

      {/* Terms Content */}
      <section className="py-16 bg-white">
        <Container>
          <div className="max-w-4xl mx-auto prose prose-lg prose-gray max-w-none">
            
            {/* Introduction */}
            <div id="introduction" className="mb-16">
              <div className="flex items-center mb-6">
                <DocumentTextIcon className="w-8 h-8 text-blue-600 ml-3" />
                <h2 className="text-3xl font-bold text-gray-900 m-0">1. مقدمة</h2>
              </div>
              <div className="bg-blue-50 border-r-4 border-blue-600 p-6 rounded-lg mb-6">
                <p className="text-gray-700 leading-relaxed m-0">
                  مرحباً بك في منصة التدريب الرياضي. هذه الشروط والأحكام تحكم استخدامك لموقعنا الإلكتروني وخدماتنا. من خلال الوصول إلى منصتنا أو استخدامها، فإنك توافق على الالتزام بهذه الشروط.
                </p>
              </div>
              <p className="text-gray-700 leading-relaxed">
                تشكل هذه الشروط اتفاقية قانونية ملزمة بينك وبين منصة التدريب الرياضي. إذا كنت لا توافق على أي من هذه الشروط، يجب عليك عدم استخدام خدماتنا.
              </p>
              <p className="text-gray-700 leading-relaxed">
                نحتفظ بالحق في تعديل هذه الشروط في أي وقت، وسيتم إشعارك بأي تغييرات جوهرية.
              </p>
            </div>

            {/* Acceptance */}
            <div id="acceptance" className="mb-16">
              <div className="flex items-center mb-6">
                <ScaleIcon className="w-8 h-8 text-green-600 ml-3" />
                <h2 className="text-3xl font-bold text-gray-900 m-0">2. قبول الشروط</h2>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-4">2.1 الموافقة على الشروط</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                باستخدام منصتنا، فإنك تؤكد أنك:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
                <li>تبلغ من العمر 18 عاماً على الأقل أو لديك موافقة والديك/الوصي القانوني</li>
                <li>تمتلك الأهلية القانونية للدخول في هذه الاتفاقية</li>
                <li>قرأت وفهمت هذه الشروط والأحكام</li>
                <li>توافق على الالتزام بجميع القوانين واللوائح المعمول بها</li>
              </ul>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-4">2.2 استخدام القُصر</h3>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <p className="text-yellow-800 leading-relaxed m-0">
                  إذا كنت تحت سن 18 عاماً، يجب أن يشرف والدك أو الوصي القانوني على استخدامك للمنصة ويوافق على هذه الشروط نيابة عنك. نحن لا نجمع عمداً معلومات شخصية من الأطفال دون سن 13 عاماً.
                </p>
              </div>
            </div>

            {/* Services */}
            <div id="services" className="mb-16">
              <div className="flex items-center mb-6">
                <GlobeAltIcon className="w-8 h-8 text-purple-600 ml-3" />
                <h2 className="text-3xl font-bold text-gray-900 m-0">3. الخدمات</h2>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-4">3.1 وصف الخدمات</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                نقدم منصة تعليمية عبر الإنترنت تتضمن:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-purple-50 rounded-lg p-6">
                  <h4 className="font-semibold text-purple-900 mb-3">الدورات التدريبية:</h4>
                  <ul className="list-disc list-inside space-y-1 text-purple-800 text-sm">
                    <li>دورات رياضية متخصصة</li>
                    <li>محتوى فيديو عالي الجودة</li>
                    <li>مواد تعليمية تفاعلية</li>
                    <li>اختبارات وتقييمات</li>
                  </ul>
                </div>
                <div className="bg-purple-50 rounded-lg p-6">
                  <h4 className="font-semibold text-purple-900 mb-3">الميزات الإضافية:</h4>
                  <ul className="list-disc list-inside space-y-1 text-purple-800 text-sm">
                    <li>تتبع التقدم الشخصي</li>
                    <li>شهادات إتمام</li>
                    <li>منتديات المناقشة</li>
                    <li>دعم فني متخصص</li>
                  </ul>
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-4">3.2 توفر الخدمة</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                نسعى لضمان توفر خدماتنا على مدار الساعة، ولكن قد تحدث انقطاعات مؤقتة للصيانة أو التحديثات. نحتفظ بالحق في:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>تعديل أو إيقاف أي جزء من خدماتنا مؤقتاً أو دائماً</li>
                <li>تحديث المحتوى والميزات دون إشعار مسبق</li>
                <li>فرض قيود على الاستخدام لضمان الأداء الأمثل</li>
              </ul>
            </div>

            {/* User Accounts */}
            <div id="user-accounts" className="mb-16">
              <div className="flex items-center mb-6">
                <UserGroupIcon className="w-8 h-8 text-indigo-600 ml-3" />
                <h2 className="text-3xl font-bold text-gray-900 m-0">4. حسابات المستخدمين</h2>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-4">4.1 إنشاء الحساب</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                لاستخدام معظم ميزات منصتنا، يجب عليك إنشاء حساب. عند إنشاء حسابك، يجب عليك:
              </p>
              <div className="bg-indigo-50 rounded-lg p-6 mb-6">
                <ul className="list-disc list-inside space-y-2 text-indigo-800">
                  <li>تقديم معلومات دقيقة وكاملة ومحدثة</li>
                  <li>الحفاظ على أمان كلمة المرور الخاصة بك</li>
                  <li>إشعارنا فوراً بأي استخدام غير مصرح به لحسابك</li>
                  <li>تحديث معلوماتك عند الحاجة</li>
                </ul>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-4">4.2 مسؤولية الحساب</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                أنت مسؤول بالكامل عن:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
                <li>جميع الأنشطة التي تحدث تحت حسابك</li>
                <li>الحفاظ على سرية معلومات تسجيل الدخول</li>
                <li>إخطارنا فوراً بأي انتهاك أمني</li>
                <li>ضمان دقة المعلومات المقدمة</li>
              </ul>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-4">4.3 إنهاء الحساب</h3>
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <p className="text-red-800 leading-relaxed m-0">
                  نحتفظ بالحق في تعليق أو إنهاء حسابك في أي وقت إذا انتهكت هذه الشروط أو إذا اعتبرنا أن استخدامك للمنصة يضر بمصالحنا أو مصالح المستخدمين الآخرين.
                </p>
              </div>
            </div>

            {/* Payment */}
            <div id="payment" className="mb-16">
              <div className="flex items-center mb-6">
                <CreditCardIcon className="w-8 h-8 text-green-600 ml-3" />
                <h2 className="text-3xl font-bold text-gray-900 m-0">5. الدفع والفوترة</h2>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-4">5.1 الأسعار والرسوم</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                أسعار دوراتنا وخدماتنا محددة بوضوح على المنصة. جميع الأسعار:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
                <li>مذكورة بالريال السعودي ما لم يُذكر خلاف ذلك</li>
                <li>تشمل ضريبة القيمة المضافة حسب القانون</li>
                <li>قابلة للتغيير دون إشعار مسبق</li>
                <li>غير قابلة للاسترداد إلا في حالات محددة</li>
              </ul>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-4">5.2 طرق الدفع</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-green-50 rounded-lg p-6">
                  <h4 className="font-semibold text-green-900 mb-3">الطرق المقبولة:</h4>
                  <ul className="list-disc list-inside space-y-1 text-green-800 text-sm">
                    <li>بطاقات الائتمان (Visa, Mastercard)</li>
                    <li>بطاقات الخصم المباشر</li>
                    <li>التحويل البنكي</li>
                    <li>المحافظ الرقمية المعتمدة</li>
                  </ul>
                </div>
                <div className="bg-green-50 rounded-lg p-6">
                  <h4 className="font-semibold text-green-900 mb-3">شروط الدفع:</h4>
                  <ul className="list-disc list-inside space-y-1 text-green-800 text-sm">
                    <li>الدفع مطلوب قبل الوصول للمحتوى</li>
                    <li>معالجة فورية للمدفوعات</li>
                    <li>إيصالات إلكترونية تلقائية</li>
                    <li>حماية معلومات الدفع</li>
                  </ul>
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-4">5.3 سياسة الاسترداد</h3>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h4 className="font-semibold text-yellow-900 mb-3">شروط الاسترداد:</h4>
                <ul className="list-disc list-inside space-y-2 text-yellow-800">
                  <li>يمكن طلب الاسترداد خلال 14 يوماً من الشراء</li>
                  <li>يجب ألا يتجاوز استهلاك المحتوى 25% من إجمالي الدورة</li>
                  <li>لا يشمل الاسترداد الدورات المكتملة أو الشهادات الصادرة</li>
                  <li>معالجة طلبات الاسترداد خلال 5-10 أيام عمل</li>
                </ul>
              </div>
            </div>

            {/* Prohibited Use */}
            <div id="prohibited" className="mb-16">
              <div className="flex items-center mb-6">
                <ExclamationTriangleIcon className="w-8 h-8 text-red-600 ml-3" />
                <h2 className="text-3xl font-bold text-gray-900 m-0">6. الاستخدام المحظور</h2>
              </div>
              
              <div className="bg-red-50 border-r-4 border-red-600 p-6 rounded-lg mb-6">
                <p className="text-red-800 leading-relaxed m-0">
                  يُحظر عليك استخدام منصتنا لأي غرض غير قانوني أو محظور بموجب هذه الشروط. الانتهاكات قد تؤدي إلى إنهاء حسابك فوراً.
                </p>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-4">6.1 الأنشطة المحظورة</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-red-50 rounded-lg p-4">
                    <h4 className="font-semibold text-red-900 mb-2">انتهاك حقوق الملكية الفكرية:</h4>
                    <ul className="list-disc list-inside space-y-1 text-red-800 text-sm">
                      <li>نسخ أو توزيع المحتوى</li>
                      <li>إعادة بيع الدورات</li>
                      <li>مشاركة بيانات الدخول</li>
                    </ul>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4">
                    <h4 className="font-semibold text-red-900 mb-2">الأنشطة الضارة:</h4>
                    <ul className="list-disc list-inside space-y-1 text-red-800 text-sm">
                      <li>محاولة اختراق النظام</li>
                      <li>نشر فيروسات أو برامج ضارة</li>
                      <li>التلاعب بالمحتوى</li>
                    </ul>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-red-50 rounded-lg p-4">
                    <h4 className="font-semibold text-red-900 mb-2">السلوك غير المناسب:</h4>
                    <ul className="list-disc list-inside space-y-1 text-red-800 text-sm">
                      <li>التحرش أو التنمر</li>
                      <li>نشر محتوى مسيء</li>
                      <li>انتحال الشخصية</li>
                    </ul>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4">
                    <h4 className="font-semibold text-red-900 mb-2">الاستخدام التجاري غير المصرح:</h4>
                    <ul className="list-disc list-inside space-y-1 text-red-800 text-sm">
                      <li>استخدام المحتوى لأغراض تجارية</li>
                      <li>إنشاء منصات منافسة</li>
                      <li>جمع بيانات المستخدمين</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Liability */}
            <div id="liability" className="mb-16">
              <div className="flex items-center mb-6">
                <ShieldCheckIcon className="w-8 h-8 text-blue-600 ml-3" />
                <h2 className="text-3xl font-bold text-gray-900 m-0">7. المسؤولية والضمانات</h2>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-4">7.1 إخلاء المسؤولية</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <p className="text-blue-800 leading-relaxed mb-3">
                  خدماتنا مقدمة "كما هي" و"حسب التوفر". لا نقدم أي ضمانات صريحة أو ضمنية بشأن:
                </p>
                <ul className="list-disc list-inside space-y-1 text-blue-800 text-sm">
                  <li>دقة أو اكتمال المحتوى</li>
                  <li>توفر الخدمة دون انقطاع</li>
                  <li>خلو الخدمة من الأخطاء</li>
                  <li>تحقيق نتائج محددة</li>
                </ul>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-4">7.2 حدود المسؤولية</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                في أقصى حد يسمح به القانون، لن نكون مسؤولين عن:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
                <li>أي أضرار غير مباشرة أو عرضية أو خاصة</li>
                <li>فقدان الأرباح أو البيانات أو الفرص</li>
                <li>انقطاع الأعمال أو الخدمات</li>
                <li>أي أضرار تتجاوز المبلغ المدفوع لنا</li>
              </ul>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-4">7.3 التعويض</h3>
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-gray-700 leading-relaxed m-0">
                  توافق على تعويضنا وحمايتنا من أي مطالبات أو أضرار أو خسائر تنشأ عن استخدامك للمنصة أو انتهاكك لهذه الشروط أو انتهاكك لحقوق أي طرف ثالث.
                </p>
              </div>
            </div>

            {/* Modifications */}
            <div id="modifications" className="mb-16">
              <div className="flex items-center mb-6">
                <ClockIcon className="w-8 h-8 text-orange-600 ml-3" />
                <h2 className="text-3xl font-bold text-gray-900 m-0">8. التعديلات والتحديثات</h2>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-4">8.1 تعديل الشروط</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                نحتفظ بالحق في تعديل هذه الشروط في أي وقت. عند إجراء تغييرات جوهرية:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
                <li>سنرسل إشعاراً عبر البريد الإلكتروني</li>
                <li>سننشر إشعاراً على المنصة</li>
                <li>سنحدث تاريخ "آخر تحديث"</li>
                <li>ستدخل التغييرات حيز التنفيذ بعد 30 يوماً</li>
              </ul>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-4">8.2 تعديل الخدمات</h3>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                <p className="text-orange-800 leading-relaxed m-0">
                  قد نقوم بتعديل أو إيقاف أي جزء من خدماتنا في أي وقت. سنبذل قصارى جهدنا لإشعارك مسبقاً بأي تغييرات جوهرية تؤثر على وصولك للمحتوى المدفوع.
                </p>
              </div>
            </div>

            {/* Legal Information */}
            <div className="bg-gray-50 rounded-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">معلومات قانونية</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">القانون الحاكم</h3>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    تخضع هذه الشروط وتفسر وفقاً لقوانين المملكة العربية السعودية. أي نزاعات ستخضع للاختصاص الحصري للمحاكم السعودية.
                  </p>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">قابلية الفصل</h3>
                  <p className="text-gray-700 leading-relaxed">
                    إذا تبين أن أي بند من هذه الشروط غير قابل للتنفيذ، فإن باقي البنود تبقى سارية المفعول.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">تواصل معنا</h3>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    إذا كان لديك أي أسئلة حول هذه الشروط:
                  </p>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">البريد الإلكتروني:</span> legal@sportsplatform.com</p>
                    <p><span className="font-medium">الهاتف:</span> +966 11 123 4567</p>
                    <p><span className="font-medium">العنوان:</span> شارع الملك فهد، الرياض، المملكة العربية السعودية</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </Layout>
  );
};

export default TermsPage;