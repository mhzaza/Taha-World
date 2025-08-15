import { Layout, Container } from '@/components/layout';
import {
  UserGroupIcon,
  EyeIcon,
  RocketLaunchIcon,
  TrophyIcon,
  HeartIcon,
  StarIcon
} from '@heroicons/react/24/outline';

const AboutPage = () => {
  const stats = [
    { number: '10,000+', label: 'طالب مسجل' },
    { number: '50+', label: 'دورة تدريبية' },
    { number: '15+', label: 'مدرب محترف' },
    { number: '95%', label: 'معدل الرضا' }
  ];

  const values = [
    {
      icon: TrophyIcon,
      title: 'التميز',
      description: 'نسعى لتقديم أعلى مستويات التدريب الرياضي والتطوير المهني لطلابنا'
    },
    {
      icon: HeartIcon,
      title: 'الشغف',
      description: 'نؤمن بأن الشغف هو المحرك الأساسي للنجاح في عالم الرياضة والتدريب'
    },
    {
      icon: UserGroupIcon,
      title: 'المجتمع',
      description: 'نبني مجتمعاً رياضياً متماسكاً يدعم بعضه البعض في رحلة التطوير'
    },
    {
      icon: StarIcon,
      title: 'الجودة',
      description: 'نلتزم بتقديم محتوى تعليمي عالي الجودة يواكب أحدث التطورات الرياضية'
    }
  ];

  const team = [
    {
      name: 'أحمد محمد',
      role: 'المؤسس والمدير التنفيذي',
      description: 'بطل عالمي سابق في مصارعة الذراعين مع خبرة 15 عاماً في التدريب',
      image: '/images/team/ahmed.jpg'
    },
    {
      name: 'سارة أحمد',
      role: 'مديرة التطوير التعليمي',
      description: 'خبيرة في علوم الرياضة والتغذية مع ماجستير في التدريب الرياضي',
      image: '/images/team/sara.jpg'
    },
    {
      name: 'محمد علي',
      role: 'مدرب كبير',
      description: 'مدرب معتمد دولياً في فنون القتال المختلطة وتدريب القوة',
      image: '/images/team/mohamed.jpg'
    }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white py-20">
        <Container>
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              من نحن
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 leading-relaxed">
              منصة رائدة في التدريب الرياضي عبر الإنترنت، نقدم دورات تدريبية متخصصة في مصارعة الذراعين وفنون القتال والتدريب البدني
            </p>
          </div>
        </Container>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <Container>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Who We Are Section */}
      <section className="py-20 bg-gray-50">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center mb-6">
                <UserGroupIcon className="w-8 h-8 text-blue-600 ml-3" />
                <h2 className="text-3xl font-bold text-gray-900">من نحن</h2>
              </div>
              <div className="space-y-6 text-gray-700 leading-relaxed">
                <p className="text-lg">
                  نحن فريق من المدربين المحترفين والخبراء في مجال الرياضة، نجمعنا رؤية واحدة: تقديم تعليم رياضي عالي الجودة يمكن الوصول إليه من أي مكان وفي أي وقت.
                </p>
                <p>
                  تأسست منصتنا على يد نخبة من الأبطال والمدربين المعتمدين دولياً، الذين يمتلكون خبرة واسعة في مختلف الرياضات القتالية وتدريب القوة. نؤمن بأن كل شخص يستحق الحصول على تدريب احترافي يساعده على تحقيق أهدافه الرياضية.
                </p>
                <p>
                  منذ انطلاقتنا، ساعدنا آلاف الطلاب على تطوير مهاراتهم الرياضية وتحقيق إنجازات مميزة في مختلف المسابقات المحلية والدولية.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="bg-blue-600 rounded-2xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-4">قصتنا</h3>
                <p className="leading-relaxed">
                  بدأت رحلتنا من شغف حقيقي بالرياضة ورغبة في نشر المعرفة الرياضية. اليوم، نفخر بكوننا واحدة من أكبر المنصات التعليمية الرياضية في المنطقة، مع مجتمع نشط من الرياضيين والمدربين.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Vision Section */}
      <section className="py-20 bg-white">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-8 text-white">
                <EyeIcon className="w-12 h-12 mb-4" />
                <h3 className="text-2xl font-bold mb-4">رؤيتنا للمستقبل</h3>
                <p className="leading-relaxed">
                  نتطلع إلى توسيع نطاق خدماتنا لتشمل المزيد من الرياضات والتخصصات، مع الاستفادة من أحدث التقنيات في التعليم الإلكتروني والواقع الافتراضي لتقديم تجربة تعليمية لا مثيل لها.
                </p>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="flex items-center mb-6">
                <EyeIcon className="w-8 h-8 text-green-600 ml-3" />
                <h2 className="text-3xl font-bold text-gray-900">رؤيتنا</h2>
              </div>
              <div className="space-y-6 text-gray-700 leading-relaxed">
                <p className="text-lg font-medium text-green-600">
                  "أن نكون المنصة الرائدة عالمياً في التعليم الرياضي الرقمي"
                </p>
                <p>
                  نسعى لبناء مستقبل يكون فيه التعليم الرياضي المتخصص متاحاً للجميع، بغض النظر عن الموقع الجغرافي أو الظروف الاقتصادية. نريد أن نكون الجسر الذي يربط بين الطلاب والمدربين المحترفين حول العالم.
                </p>
                <p>
                  رؤيتنا تتضمن إنشاء مجتمع رياضي عالمي متصل، حيث يمكن لكل فرد أن يجد المسار التدريبي المناسب له ويحقق أقصى إمكاناته الرياضية.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-gray-50">
        <Container>
          <div className="text-center mb-16">
            <div className="flex items-center justify-center mb-6">
              <RocketLaunchIcon className="w-8 h-8 text-orange-600 ml-3" />
              <h2 className="text-3xl font-bold text-gray-900">رسالتنا</h2>
            </div>
            <p className="text-xl text-orange-600 font-medium mb-8">
              "تمكين الأفراد من تحقيق أهدافهم الرياضية من خلال تعليم عالي الجودة ومجتمع داعم"
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <div key={index} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mb-4 mx-auto">
                    <IconComponent className="w-6 h-6 text-orange-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 text-center">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 text-center leading-relaxed">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-16 bg-white rounded-2xl p-8 shadow-sm">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">التزامنا</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl mb-4">🎯</div>
                <h4 className="font-semibold text-gray-900 mb-2">التركيز على النتائج</h4>
                <p className="text-gray-600">نضمن تحقيق أهداف ملموسة لكل طالب من خلال برامج مصممة خصيصاً</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">🤝</div>
                <h4 className="font-semibold text-gray-900 mb-2">الدعم المستمر</h4>
                <p className="text-gray-600">نقدم مساندة مستمرة ومتابعة شخصية لضمان تقدم كل طالب</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">🔄</div>
                <h4 className="font-semibold text-gray-900 mb-2">التطوير المستمر</h4>
                <p className="text-gray-600">نحدث محتوانا باستمرار لمواكبة أحدث التطورات في عالم الرياضة</p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-white">
        <Container>
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">فريق العمل</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              تعرف على الخبراء والمدربين المحترفين الذين يقفون خلف نجاح منصتنا
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6 text-center hover:shadow-lg transition-shadow">
                <div className="w-24 h-24 bg-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <UserGroupIcon className="w-12 h-12 text-gray-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {member.name}
                </h3>
                <p className="text-blue-600 font-medium mb-3">
                  {member.role}
                </p>
                <p className="text-gray-600 leading-relaxed">
                  {member.description}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <Container>
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">
              انضم إلى مجتمعنا الرياضي
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              ابدأ رحلتك التدريبية معنا اليوم واكتشف إمكاناتك الحقيقية
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                تصفح الدورات
              </button>
              <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
                تواصل معنا
              </button>
            </div>
          </div>
        </Container>
      </section>
    </Layout>
  );
};

export default AboutPage;