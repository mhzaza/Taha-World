const axios = require('axios');
require('dotenv').config();

// Course data
const courseData = {
  title: 'كورس مصارعة الذراعين – من الصفر إلى الاحتراف',
  titleEnglish: 'Arm Wrestling Course – From Zero to Pro',
  description: `اكتشف أسرار القوة والتقنية في مصارعة الذراعين مع الكابتن **طه الصباغ**، بطل الأردن والعالم العربي.
يأخذك هذا الكورس في رحلة تدريبية متكاملة تبدأ من الأساسيات وصولًا إلى استراتيجيات الفوز في المنافسات الرسمية.
ستتعلم كيفية بناء قوة التحمل، تحسين ردّ الفعل، إتقان القبضة، والسيطرة على خصمك بثقة.
مناسب للمبتدئين والمحترفين الذين يسعون لصقل مهاراتهم وتحقيق أداء بطولي في البطولات المحلية والعربية.`,
  descriptionEnglish: `Discover the secrets of power and technique in Arm Wrestling with **Coach Taha Al Sabbagh**, the Jordanian and Arab Champion.
This course takes you step-by-step from the fundamentals to advanced competition strategies.
Learn endurance building, grip control, reaction speed, and mental focus to dominate your opponent.
Perfect for both beginners and athletes seeking to reach a professional level.`,
  price: 49,
  originalPrice: 99,
  currency: 'USD',
  duration: '4 ساعات',
  level: 'مبتدئ → متقدم',
  category: 'تدريب رياضي',
  language: 'العربية',
  thumbnail: '/بنر مصارعة الذراعين copy.jpg',
  instructor: {
    name: 'الكابتن طه الصباغ',
    bio: `بطل الأردن والعالم العربي في مصارعة الذراعين، ومدرب محترف بخبرة تفوق عشر سنوات في التدريب الرياضي وتطوير الذات.
درّب أكثر من 5000 رياضي، وأسّس رياضة مصارعة الذراعين في الأردن، وهو من أبرز المؤثرين في مجال القوة البدنية في العالم العربي.`,
    qualifications: [
      'بطل الأردن في مصارعة الذراعين 2018',
      'وصيف البطولة العربية 2020',
      'مؤسس رياضة مصارعة الذراعين في الأردن',
      'مدرب معتمد في فنون التواصل والتطوير الذاتي',
      'مصنف ضمن أكثر 100 شخصية مؤثرة عربيًا لعام 2020'
    ]
  },
  tags: [
    'مصارعة الذراعين',
    'تدريب رياضي',
    'قوة بدنية',
    'بطولة',
    'كابتن طه الصباغ',
    'كورسات رياضية',
    'تدريب الأبطال'
  ],
  requirements: [
    'رغبة قوية في تطوير القوة البدنية',
    'معرفة أساسية بالتمارين الرياضية',
    'مساحة كافية للتدريب العملي في المنزل أو النادي'
  ],
  learningOutcomes: [
    'الأساسيات الصحيحة لمصارعة الذراعين',
    'تمارين متقدمة لتقوية القبضة والساعد',
    'استراتيجيات الفوز في المنافسات',
    'تطوير التوازن الذهني أثناء المواجهة',
    'منهجيات تدريب الأبطال المحترفين'
  ],
  isPublished: true,
  isFeatured: true,
  lessons: [
    {
      title: 'مقدمة عن مصارعة الذراعين',
      description: 'تعرف على تاريخ وأساسيات مصارعة الذراعين',
      duration: '30 دقيقة',
      order: 1,
      isPublished: true
    },
    {
      title: 'الوضعية الصحيحة والقبضة',
      description: 'تعلم الوضعية المثالية وأنواع القبضات',
      duration: '45 دقيقة',
      order: 2,
      isPublished: true
    },
    {
      title: 'تمارين تقوية الساعد والقبضة',
      description: 'تمارين متخصصة لبناء القوة المطلوبة',
      duration: '60 دقيقة',
      order: 3,
      isPublished: true
    },
    {
      title: 'استراتيجيات المنافسة',
      description: 'تكتيكات الفوز في البطولات الرسمية',
      duration: '45 دقيقة',
      order: 4,
      isPublished: true
    },
    {
      title: 'التدريب الذهني والتركيز',
      description: 'تطوير القوة الذهنية والثقة بالنفس',
      duration: '30 دقيقة',
      order: 5,
      isPublished: true
    },
    {
      title: 'تطبيق عملي ونصائح الأبطال',
      description: 'ممارسة عملية ونصائح من خبرة البطولات',
      duration: '30 دقيقة',
      order: 6,
      isPublished: true
    }
  ]
};

async function addCourseViaAPI() {
  try {
    console.log('🚀 Adding Arm Wrestling Course via API...');
    
    // You'll need to get an admin token first
    // For now, let's just log the course data structure
    console.log('📋 Course Data Structure:');
    console.log(JSON.stringify(courseData, null, 2));
    
    console.log('\n✅ Course data prepared successfully!');
    console.log('📝 To add this course:');
    console.log('1. Go to your admin panel');
    console.log('2. Navigate to "Add New Course"');
    console.log('3. Fill in the form with the data above');
    console.log('4. Upload the image: /Users/macbook/Documents/GitHub/Taha-World/client/public/بنر مصارعة الذراعين copy.jpg');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

addCourseViaAPI();
