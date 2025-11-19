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
    { number: '5,000+', label: 'متدرّب' },
    { number: '8', label: 'جامعات' },
    { number: '15+', label: 'عام خبرة' },
    { number: '2020', label: 'ترتيب ضمن 100 شخصية مؤثرة' }
  ];

  const values = [
    {
      icon: TrophyIcon,
      title: 'الاحترافية',
      description: 'نلتزم بأعلى معايير الجودة في كل ما نقدمه من تدريب وتعليم'
    },
    {
      icon: HeartIcon,
      title: 'التمكين',
      description: 'نؤمن بقدرة كل فرد على التطور ونمنحه الأدوات اللازمة لتحقيق ذلك'
    },
    {
      icon: UserGroupIcon,
      title: 'المصداقية',
      description: 'كل محتوانا مبني على خبرة بطولية حقيقية ونتائج ملموسة'
    },
    {
      icon: StarIcon,
      title: 'التطوير المستمر',
      description: 'نسعى دائماً لتحديث معرفتنا ومهاراتنا لخدمة مجتمعنا بشكل أفضل'
    }
  ];

  const services = [
    {
      title: 'كورسات تدريبية احترافية',
      description: 'برامج تعليمية متكاملة في مصارعة الذراعين، القوة البدنية، رفع الأداء الرياضي، والوقاية من الإصابات بطريقة منظمة وسهلة التطبيق.'
    },
    {
      title: 'جلسات علاجية متخصصة',
      description: 'جلسات سوچوك وعلاج طبيعي موجّهة لعلاج آلام الرقبة، مشاكل الظهر والديسك، الصداع المزمن، والإجهاد العضلي.'
    },
    {
      title: 'استشارات شخصية وتطوير ذات',
      description: 'من خلال جلسات فردية تُساعدك على تعزيز الثقة، تطوير مهارات التواصل، إدارة العلاقات، وفهم الذات واتخاذ القرارات.'
    },
    {
      title: 'محتوى تدريبي مجاني',
      description: 'مقالات، فيديوهات، نصائح، وبرامج تعليمية تُساعدك على التطور باستمرار.'
    }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#41ADE1] via-[#3399CC] to-[#3399CC] text-white py-20">
        <Container>
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              من نحن
            </h1>
            <p className="text-xl md:text-2xl text-black leading-relaxed">
              مرحبًا بك في المنصة الرسمية للكابتن طه الصباغ؛ الوجهة الأولى في العالم العربي لتعلّم مصارعة الذراعين، تطوير القوة البدنية، وتنمية المهارات الشخصية
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
                <div className="text-3xl md:text-4xl font-bold text-[#41ADE1] mb-2">
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

      {/* Introduction Section */}
      <section className="py-20 bg-gray-50">
        <Container>
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">مقدمة عن المنصة</h2>
            <div className="max-w-4xl mx-auto space-y-6 text-black leading-relaxed">
              <p className="text-lg">
                مرحبًا بك في المنصة الرسمية للكابتن طه الصباغ؛ الوجهة الأولى في العالم العربي لتعلّم مصارعة الذراعين، تطوير القوة البدنية، وتنمية المهارات الشخصية.
              </p>
              <p className="text-lg">
                نحن نؤمن أن القوة ليست عضلية فقط، بل هي فكر، انضباط، وتطوير ذات — وهذا ما نقوم ببنائه هنا، خطوة بخطوة.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Captain Taha Section */}
      <section className="py-20 bg-white">
        <Container>
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">من هو الكابتن طه الصباغ؟</h2>
          </div>
          
          <div className="max-w-4xl mx-auto space-y-6 text-gray-200 leading-relaxed">
            <p className="text-lg">
              الكابتن طه الصباغ هو أحد أبرز الرياضيين العرب في مصارعة الذراعين، وصاحب خبرة تمتد لأكثر من عشر سنوات في التدريب الرياضي والعلاج البديل وتطوير الذات.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
              <div className="space-y-4">
                <div className="flex items-start">
                  <TrophyIcon className="w-6 h-6 text-[#41ADE1] ml-3 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">بطل الأردن لعام 2018</h4>
                    <p className="text-gray-600">في مصارعة الذراعين</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <TrophyIcon className="w-6 h-6 text-[#41ADE1] ml-3 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">وصيف البطولة العربية لعام 2020</h4>
                    <p className="text-gray-600">في مصارعة الذراعين</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <StarIcon className="w-6 h-6 text-[#41ADE1] ml-3 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">مؤسس رياضة مصارعة الذراعين في الأردن</h4>
                    <p className="text-gray-600">أول من أسس هذه الرياضة في المملكة</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <UserGroupIcon className="w-6 h-6 text-[#41ADE1] ml-3 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">مساهم في تأسيس الاتحاد العربي</h4>
                    <p className="text-gray-600">لمصارعة الذراعين والقوة البدنية</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <HeartIcon className="w-6 h-6 text-[#41ADE1] ml-3 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">درّب أكثر من 5000 متدرّب</h4>
                    <p className="text-gray-600">في مجالات القوة البدنية والاحتراف الرياضي</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <TrophyIcon className="w-6 h-6 text-[#41ADE1] ml-3 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">مصنف ضمن أكثر 100 شخصية مؤثرة</h4>
                    <p className="text-gray-600">في العالم العربي لعام 2020</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6 mt-8">
              <h4 className="font-semibold text-gray-900 mb-3">شهادات وخبرات إضافية</h4>
              <ul className="space-y-2 text-gray-600">
                <li>• مدرب معتمد في السوجوك والطب الصيني، وخبير في العلاج الآمن للرقبة، الظهر، والصداع</li>
                <li>• مدرب معتمد في فنون التواصل وتطوير المهارات الشخصية</li>
                <li>• محاضر في ثماني جامعات أردنية، وحاصل على تكريمات عديدة</li>
              </ul>
            </div>
          </div>
        </Container>
      </section>

      {/* Vision Section */}
      <section className="py-20 bg-gradient-to-br from-green-500 to-green-600 text-white">
        <Container>
          <div className="text-center max-w-4xl mx-auto">
            <EyeIcon className="w-16 h-16 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold mb-6">رؤيتنا</h2>
            <p className="text-xl leading-relaxed mb-8">
              نهدف إلى أن تكون منصتنا المرجع العربي الأول في قوة الجسد وتطوير الذات، وأن نصنع جيلًا من الرياضيين القادرين على التحكم بأجسادهم، عقلياتهم، وأدائهم داخل المنافسات وخارجها.
            </p>
            <div className="bg-white/10 rounded-xl p-6">
              <p className="text-lg font-medium">
                "نحن لا ندرّب أذرعًا فقط… نحن نبني أبطالًا."
              </p>
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
            <p className="text-xl text-orange-600 font-medium mb-8 max-w-3xl mx-auto">
              تمكين الشباب والرياضيين من تطوير قوتهم بشكل صحيح وآمن، عبر تعليم تقنيات احترافية مبنية على خبرة بطولية حقيقية، وأسلوب تدريبي شامل يجمع بين القوة البدنية والاتزان الذهني والمهارات الحياتية.
            </p>
          </div>
        </Container>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-white">
        <Container>
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">ماذا نقدم؟</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              نقدم منظومة متكاملة من الخدمات التي تجمع بين العلم، الخبرة، والعلاج الآمن
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-8 hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {service.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gray-50">
        <Container>
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">قيمنا</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              المبادئ التي نلتزم بها في كل ما نقدمه
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <div key={index} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mb-4 mx-auto">
                    <IconComponent className="w-6 h-6 text-orange-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Why Different Section */}
      <section className="py-20 bg-white">
        <Container>
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">لماذا نحن مختلفون؟</h2>
          </div>
          
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-start">
              <div className="w-8 h-8 bg-[#41ADE1] rounded-full flex items-center justify-center text-white font-bold text-sm ml-4 mt-1 flex-shrink-0">1</div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">لأن كل محتوى نقدّمه مبني على خبرة بطولية حقيقية</h4>
                <p className="text-gray-600">خبرة تمتد لأكثر من 15 عاماً في التدريب والمنافسات البطولية</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="w-8 h-8 bg-[#41ADE1] rounded-full flex items-center justify-center text-white font-bold text-sm ml-4 mt-1 flex-shrink-0">2</div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">لأن التدريب هنا لا يقتصر على "كيف تكون قويًا"</h4>
                <p className="text-gray-600">بل أيضًا "كيف تكون واعيًا ومسؤولًا ومؤثرًا"</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="w-8 h-8 bg-[#41ADE1] rounded-full flex items-center justify-center text-white font-bold text-sm ml-4 mt-1 flex-shrink-0">3</div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">لأننا نؤمن أن النجاح يحتاج منهجًا، متابعة، وتطويرًا مستمرًا</h4>
                <p className="text-gray-600">نقدم برامج متكاملة مع متابعة شخصية مستمرة</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="w-8 h-8 bg-[#41ADE1] rounded-full flex items-center justify-center text-white font-bold text-sm ml-4 mt-1 flex-shrink-0">4</div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">لأننا نقدّم منظومة تدريبية تجمع بين العلم، الخبرة، والعلاج الآمن</h4>
                <p className="text-gray-600">نظام متكامل يجمع بين التدريب الرياضي والعلاج البديل والتطوير الشخصي</p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#41ADE1] to-[#3399CC] text-white">
        <Container>
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">
              رحلتك معنا تبدأ من هنا
            </h2>
            <p className="text-xl text-black mb-8">
              سواء كنت مبتدئًا أو رياضيًا محترفًا، ستجد هنا ما يساعدك على تطوير أدائك، تقوية جسدك، وفهم قدراتك الحقيقية. هدفنا ليس أن نعلّمك فقط… بل أن نمضي معك في رحلة التحوّل.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-[#41ADE1] px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                ابدأ الآن
              </button>
              <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-[#41ADE1] transition-colors">
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