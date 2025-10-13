// scripts/seed.js

const admin = require('firebase-admin');
// انتبه: تأكد من أن ملف serviceAccountKey.json موجود في المجلد الرئيسي للمشروع مؤقتاً
const serviceAccount = require('../serviceAccountKey.json');

// بيانات الدورة الحقيقية والكاملة
const realCourse = {
  title: 'كورس مصارعة الذراعين',
  price: 50,
  duration: 60,
  description: 'تعلم فن مصارعة الذراعين من الصفر حتى الاحتراف. كورس شامل يغطي جميع التقنيات والاستراتيجيات المطلوبة للفوز في المنافسات.',
  level: 'مبتدئ',
  category: 'قتال',
  thumbnail: '/images/arm-wrestling-course.jpg',
  language: 'ar',
  isPublished: true,
  isFeatured: true,
  enrollmentCount: 0,
  createdAt: new Date(), // تاريخ اليوم تلقائياً
  updatedAt: new Date(), // تاريخ اليوم تلقائياً
  instructor: {
    name: 'طه الصباغ',
    bio: 'مدرب رياضي معتمد مع خبرة 15 عام في مصارعة الذراعين وبطل عربي سابق.',
    avatar: '/images/taha-sabag.jpg',
  },
  rating: {
    average: 0,
    count: 0,
  },
  whatYouWillLearn: [
    'أساسيات مصارعة الذراعين والوقفة الصحيحة',
    'تقنيات الإمساك والتحكم بالخصم',
    'أهم التمارين لتقوية الذراع والرسغ',
    'استراتيجيات الفوز وتجنب الإصابات الشائعة',
  ],
  requirements: [
    'لا توجد متطلبات مسبقة',
    'الرغبة في التعلم والتطبيق',
  ],
  lessons: [
    {
      title: 'مقدمة في مصارعة الذراعين',
      duration: 900,
      order: 1,
      isPreview: true,
      videoUrl: 'jeoT4IE_R2I',
    },
    {
      title: 'تقنيات الإمساك والسيطرة',
      duration: 1200,
      order: 2,
      isPreview: false,
      videoUrl: 'y6120QOlsfU',
    },
    {
      title: 'تمارين القوة الأساسية',
      duration: 1500,
      order: 3,
      isPreview: false,
      videoUrl: 'kJQP7kiw5Fk',
    },
  ],
};


// --- لا تعدل أي شيء تحت هذا السطر ---
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const seedDatabase = async () => {
  // أولاً، احذف أي دورات قديمة لضمان بداية نظيفة
  console.log('يتم حذف الدورات القديمة...');
  const snapshot = await db.collection('courses').get();
  const deletePromises = [];
  snapshot.forEach(doc => {
    deletePromises.push(doc.ref.delete());
  });
  await Promise.all(deletePromises);
  console.log('تم حذف الدورات القديمة بنجاح.');

  // ثانياً، أضف الدورة الجديدة
  console.log('بدء عملية إضافة الدورة الجديدة...');
  await db.collection('courses').add(realCourse);
  console.log(`تمت إضافة دورة: ${realCourse.title} بنجاح!`);
  
  console.log('اكتملت العملية!');
  process.exit(0);
};

seedDatabase().catch((error) => {
  console.error('حدث خطأ:', error);
  process.exit(1);
});