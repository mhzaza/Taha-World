'use client';

import { useState } from 'react';
import { Layout, Container } from '@/components/layout';
import {
  QuestionMarkCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

const FAQPage = () => {
  const [openItems, setOpenItems] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const faqCategories = [
    {
      title: 'عام',
      questions: [
        {
          question: 'ما هي منصة التدريب الرياضي؟',
          answer: 'منصة التدريب الرياضي هي منصة تعليمية متخصصة تقدم دورات تدريبية عبر الإنترنت في مختلف الرياضات. نوفر محتوى عالي الجودة من خبراء ومدربين معتمدين لمساعدتك في تطوير مهاراتك الرياضية وتحقيق أهدافك التدريبية.'
        },
        {
          question: 'من يمكنه الاستفادة من هذه المنصة؟',
          answer: 'منصتنا مناسبة للجميع بغض النظر عن مستوى الخبرة - من المبتدئين الذين يريدون تعلم أساسيات الرياضة إلى الرياضيين المحترفين الذين يسعون لتطوير تقنياتهم. كما نقدم دورات للمدربين والحكام والمهتمين بعلوم الرياضة.'
        },
        {
          question: 'هل المحتوى متوفر باللغة العربية؟',
          answer: 'نعم، جميع دوراتنا ومحتوانا متوفر باللغة العربية مع ترجمة عالية الجودة للمصطلحات التقنية. كما نوفر محتوى بلغات أخرى حسب الطلب والتوفر.'
        }
      ]
    },
    {
      title: 'التسجيل والحساب',
      questions: [
        {
          question: 'كيف يمكنني إنشاء حساب جديد؟',
          answer: 'يمكنك إنشاء حساب جديد بسهولة من خلال النقر على زر "التسجيل" في أعلى الصفحة. ستحتاج إلى تقديم اسمك وبريدك الإلكتروني وكلمة مرور قوية. بعد التسجيل، ستتلقى رسالة تأكيد عبر البريد الإلكتروني لتفعيل حسابك.'
        },
        {
          question: 'نسيت كلمة المرور، ماذا أفعل؟',
          answer: 'لا تقلق! انقر على رابط "نسيت كلمة المرور" في صفحة تسجيل الدخول، وأدخل بريدك الإلكتروني. ستتلقى رسالة تحتوي على رابط لإعادة تعيين كلمة المرور. اتبع التعليمات في الرسالة لإنشاء كلمة مرور جديدة.'
        },
        {
          question: 'هل يمكنني تغيير معلومات حسابي؟',
          answer: 'بالطبع! يمكنك تحديث معلومات حسابك في أي وقت من خلال الذهاب إلى صفحة "الملف الشخصي" في حسابك. يمكنك تغيير اسمك، بريدك الإلكتروني، كلمة المرور، وإضافة صورة شخصية.'
        },
        {
          question: 'كيف يمكنني حذف حسابي؟',
          answer: 'إذا كنت ترغب في حذف حسابك، يرجى التواصل مع فريق الدعم عبر صفحة "اتصل بنا". سنقوم بمعالجة طلبك خلال 48 ساعة مع الحفاظ على خصوصية بياناتك وفقاً لسياسة الخصوصية الخاصة بنا.'
        }
      ]
    },
    {
      title: 'الدورات والمحتوى',
      questions: [
        {
          question: 'كيف يمكنني التسجيل في دورة؟',
          answer: 'للتسجيل في دورة، تصفح كتالوج الدورات واختر الدورة التي تهمك. انقر على "عرض التفاصيل" لمراجعة محتوى الدورة ومتطلباتها، ثم انقر على "التسجيل الآن". ستحتاج إلى إكمال عملية الدفع للوصول إلى محتوى الدورة.'
        },
        {
          question: 'هل يمكنني الوصول إلى الدورات في أي وقت؟',
          answer: 'نعم! بمجرد التسجيل في دورة، يمكنك الوصول إليها على مدار الساعة طوال أيام الأسبوع. يمكنك التعلم بالسرعة التي تناسبك ومراجعة المحتوى عدة مرات حسب الحاجة.'
        },
        {
          question: 'ما هي مدة صلاحية الدورة بعد الشراء؟',
          answer: 'معظم دوراتنا تأتي بوصول مدى الحياة، مما يعني أنه يمكنك الوصول إليها في أي وقت بعد الشراء. بعض الدورات المتخصصة قد تحتوي على فترة وصول محددة، وسيتم توضيح ذلك بوضوح في وصف الدورة.'
        },
        {
          question: 'هل تتوفر شهادات إتمام؟',
          answer: 'نعم! عند إكمال دورة بنجاح واجتياز جميع الاختبارات المطلوبة، ستحصل على شهادة إتمام رقمية معتمدة. يمكنك تحميل الشهادة بصيغة PDF ومشاركتها على منصات التواصل المهني مثل LinkedIn.'
        },
        {
          question: 'هل يمكنني تحميل المحتوى للمشاهدة دون اتصال؟',
          answer: 'حالياً، المحتوى متاح للمشاهدة عبر الإنترنت فقط لضمان حماية حقوق الملكية الفكرية. نعمل على تطوير تطبيق محمول سيتيح تحميل محدود للمحتوى للمشاهدة دون اتصال.'
        }
      ]
    },
    {
      title: 'الدفع والفوترة',
      questions: [
        {
          question: 'ما هي طرق الدفع المقبولة؟',
          answer: 'نقبل جميع بطاقات الائتمان الرئيسية (Visa, Mastercard, American Express)، بطاقات الخصم المباشر، التحويل البنكي، والمحافظ الرقمية مثل Apple Pay و Google Pay. جميع المعاملات آمنة ومشفرة.'
        },
        {
          question: 'هل يمكنني الحصول على فاتورة ضريبية؟',
          answer: 'نعم، نقدم فواتير ضريبية لجميع المشتريات. ستتلقى فاتورة إلكترونية تلقائياً بعد إتمام عملية الشراء. يمكنك أيضاً تحميل الفاتورة من حسابك في أي وقت.'
        },
        {
          question: 'ما هي سياسة الاسترداد؟',
          answer: 'نوفر ضمان استرداد الأموال خلال 14 يوماً من تاريخ الشراء إذا لم تكن راضياً عن الدورة، شريطة ألا تكون قد أكملت أكثر من 25% من محتوى الدورة. لطلب الاسترداد، تواصل مع فريق الدعم.'
        },
        {
          question: 'هل تتوفر خصومات أو عروض خاصة؟',
          answer: 'نعم! نقدم خصومات منتظمة للطلاب، خصومات للشراء بالجملة، وعروض موسمية خاصة. اشترك في نشرتنا البريدية لتكون أول من يعلم بالعروض الجديدة والخصومات الحصرية.'
        }
      ]
    },
    {
      title: 'الدعم التقني',
      questions: [
        {
          question: 'لا يعمل الفيديو بشكل صحيح، ماذا أفعل؟',
          answer: 'إذا واجهت مشاكل في تشغيل الفيديو، جرب الخطوات التالية: 1) تحقق من سرعة الإنترنت (نوصي بـ 5 Mbps على الأقل)، 2) امسح ذاكرة التخزين المؤقت للمتصفح، 3) جرب متصفح آخر، 4) تأكد من تحديث المتصفح. إذا استمرت المشكلة، تواصل مع الدعم التقني.'
        },
        {
          question: 'هل المنصة متوافقة مع الأجهزة المحمولة؟',
          answer: 'نعم! منصتنا مصممة لتعمل بسلاسة على جميع الأجهزة - أجهزة الكمبيوتر المكتبية، اللابتوب، الأجهزة اللوحية، والهواتف الذكية. نوصي باستخدام أحدث إصدارات المتصفحات للحصول على أفضل تجربة.'
        },
        {
          question: 'كيف يمكنني الإبلاغ عن مشكلة تقنية؟',
          answer: 'يمكنك الإبلاغ عن أي مشكلة تقنية من خلال: 1) نموذج "اتصل بنا" على الموقع، 2) البريد الإلكتروني: support@sportsplatform.com، 3) الدردشة المباشرة (متوفرة من 9 صباحاً إلى 6 مساءً). يرجى تضمين تفاصيل المشكلة ونوع الجهاز والمتصفح المستخدم.'
        }
      ]
    }
  ];

  const toggleItem = (categoryIndex: number, questionIndex: number) => {
    const itemId = categoryIndex * 1000 + questionIndex;
    setOpenItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const isOpen = (categoryIndex: number, questionIndex: number) => {
    const itemId = categoryIndex * 1000 + questionIndex;
    return openItems.includes(itemId);
  };

  const filteredCategories = faqCategories.map(category => ({
    ...category,
    questions: category.questions.filter(
      q => 
        q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-700 text-white py-20">
        <Container>
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-6">
              <QuestionMarkCircleIcon className="w-16 h-16 text-purple-300 ml-4" />
              <h1 className="text-4xl md:text-5xl font-bold">
                الأسئلة الشائعة
              </h1>
            </div>
            <p className="text-xl md:text-2xl text-purple-100 leading-relaxed mb-8">
              إجابات سريعة على الأسئلة الأكثر شيوعاً حول منصتنا
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="ابحث في الأسئلة الشائعة..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-12 py-4 rounded-lg text-gray-900 text-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
                />
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* FAQ Content */}
      <section className="py-16 bg-gray-50">
        <Container>
          <div className="max-w-4xl mx-auto">
            {filteredCategories.length === 0 ? (
              <div className="text-center py-12">
                <QuestionMarkCircleIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">لم نجد نتائج</h3>
                <p className="text-gray-500">جرب البحث بكلمات مختلفة أو تصفح الفئات أدناه</p>
              </div>
            ) : (
              filteredCategories.map((category, categoryIndex) => (
                <div key={categoryIndex} className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b-2 border-purple-200">
                    {category.title}
                  </h2>
                  <div className="space-y-4">
                    {category.questions.map((faq, questionIndex) => {
                      const isItemOpen = isOpen(categoryIndex, questionIndex);
                      return (
                        <div
                          key={questionIndex}
                          className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
                        >
                          <button
                            onClick={() => toggleItem(categoryIndex, questionIndex)}
                            className="w-full px-6 py-4 text-right focus:outline-none focus:ring-2 focus:ring-purple-300 hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900">
                                  {faq.question}
                                </h3>
                              </div>
                              <div className="flex-shrink-0 mr-4">
                                {isItemOpen ? (
                                  <ChevronUpIcon className="w-5 h-5 text-purple-600" />
                                ) : (
                                  <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                                )}
                              </div>
                            </div>
                          </button>
                          
                          {isItemOpen && (
                            <div className="px-6 pb-6">
                              <div className="border-t border-gray-100 pt-4">
                                <p className="text-gray-700 leading-relaxed">
                                  {faq.answer}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </Container>
      </section>

      {/* Quick Stats */}
      <section className="py-12 bg-white">
        <Container>
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="bg-purple-50 rounded-lg p-6">
                <div className="text-3xl font-bold text-purple-600 mb-2">24/7</div>
                <div className="text-gray-700">دعم متواصل</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-6">
                <div className="text-3xl font-bold text-purple-600 mb-2">< 2 ساعة</div>
                <div className="text-gray-700">متوسط وقت الاستجابة</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-6">
                <div className="text-3xl font-bold text-purple-600 mb-2">98%</div>
                <div className="text-gray-700">معدل رضا العملاء</div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Contact CTA */}
      <section className="py-16 bg-purple-900 text-white">
        <Container>
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">لم تجد إجابة لسؤالك؟</h2>
            <p className="text-xl text-purple-100 mb-8">
              فريق الدعم لدينا جاهز لمساعدتك في أي استفسار
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="bg-white text-purple-900 px-8 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
              >
                تواصل معنا
              </a>
              <a
                href="/help"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-purple-900 transition-colors"
              >
                مركز المساعدة
              </a>
            </div>
          </div>
        </Container>
      </section>
    </Layout>
  );
};

export default FAQPage;