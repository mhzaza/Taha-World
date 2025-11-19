const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Course = require('../src/models/Course');
const User = require('../src/models/User');

async function addArmWrestlingCourse() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find admin user to set as instructor
    const adminUser = await User.findOne({ isAdmin: true });
    if (!adminUser) {
      console.log('❌ No admin user found!');
      process.exit(1);
    }

    // Create the arm wrestling course
    const courseData = {
      title: 'كورس مصارعة الذراعين – من الصفر إلى الاحتراف',
      description: `اكتشف أسرار القوة والتقنية في مصارعة الذراعين مع الكابتن **طه الصباغ**، بطل الأردن والعالم العربي.
يأخذك هذا الكورس في رحلة تدريبية متكاملة تبدأ من الأساسيات وصولًا إلى استراتيجيات الفوز في المنافسات الرسمية.
ستتعلم كيفية بناء قوة التحمل، تحسين ردّ الفعل، إتقان القبضة، والسيطرة على خصمك بثقة.
مناسب للمبتدئين والمحترفين الذين يسعون لصقل مهاراتهم وتحقيق أداء بطولي في البطولات المحلية والعربية.`,
      price: 49,
      originalPrice: 99,
      currency: 'USD',
      duration: 240, // 4 hours in minutes
      level: 'beginner', // Using enum value
      category: 'تدريب رياضي',
      language: 'ar', // Using enum value
      thumbnail: '/بنر مصارعة الذراعين copy.jpg',
      instructor: {
        id: adminUser._id, // Required field
        name: 'الكابتن طه الصباغ',
        bio: `بطل الأردن والعالم العربي في مصارعة الذراعين، ومدرب محترف بخبرة تفوق عشر سنوات في التدريب الرياضي وتطوير الذات.
درّب أكثر من 5000 رياضي، وأسّس رياضة مصارعة الذراعين في الأردن، وهو من أبرز المؤثرين في مجال القوة البدنية في العالم العربي.`,
        credentials: [
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
      whatYouWillLearn: [
        'الأساسيات الصحيحة لمصارعة الذراعين',
        'تمارين متقدمة لتقوية القبضة والساعد',
        'استراتيجيات الفوز في المنافسات',
        'تطوير التوازن الذهني أثناء المواجهة',
        'منهجيات تدريب الأبطال المحترفين'
      ],
      isPublished: true,
      isFeatured: true,
      slug: 'arm-wrestling-zero-to-pro',
      lessons: [
        {
          title: 'مقدمة عن مصارعة الذراعين - درس مجاني',
          description: 'تعرف على تاريخ وأساسيات مصارعة الذراعين - درس مجاني للجميع',
          videoUrl: 'https://example.com/lesson1.mp4', // Placeholder URL
          duration: 30, // in minutes
          order: 1,
          isFree: true // Make this lesson free
        },
        {
          title: 'الوضعية الصحيحة والقبضة',
          description: 'تعلم الوضعية المثالية وأنواع القبضات',
          videoUrl: 'https://example.com/lesson2.mp4', // Placeholder URL
          duration: 45, // in minutes
          order: 2
        },
        {
          title: 'تمارين تقوية الساعد والقبضة',
          description: 'تمارين متخصصة لبناء القوة المطلوبة',
          videoUrl: 'https://example.com/lesson3.mp4', // Placeholder URL
          duration: 60, // in minutes
          order: 3
        },
        {
          title: 'استراتيجيات المنافسة',
          description: 'تكتيكات الفوز في البطولات الرسمية',
          videoUrl: 'https://example.com/lesson4.mp4', // Placeholder URL
          duration: 45, // in minutes
          order: 4
        },
        {
          title: 'التدريب الذهني والتركيز',
          description: 'تطوير القوة الذهنية والثقة بالنفس',
          videoUrl: 'https://example.com/lesson5.mp4', // Placeholder URL
          duration: 30, // in minutes
          order: 5
        },
        {
          title: 'تطبيق عملي ونصائح الأبطال',
          description: 'ممارسة عملية ونصائح من خبرة البطولات',
          videoUrl: 'https://example.com/lesson6.mp4', // Placeholder URL
          duration: 30, // in minutes
          order: 6
        }
      ]
    };

    // Check if course already exists
    const existingCourse = await Course.findOne({ slug: courseData.slug });
    if (existingCourse) {
      console.log('⚠️ Course already exists, updating...');
      await Course.findByIdAndUpdate(existingCourse._id, courseData);
      console.log('✅ Course updated successfully!');
    } else {
      const newCourse = new Course(courseData);
      await newCourse.save();
      console.log('✅ Arm Wrestling Course added successfully!');
    }

    console.log('📋 Course Details:');
    console.log(`   Title: ${courseData.title}`);
    console.log(`   Price: $${courseData.price} (was $${courseData.originalPrice})`);
    console.log(`   Duration: ${courseData.duration}`);
    console.log(`   Level: ${courseData.level}`);
    console.log(`   Lessons: ${courseData.totalLessons}`);
    console.log(`   Published: ${courseData.isPublished ? 'Yes' : 'No'}`);
    console.log(`   Featured: ${courseData.isFeatured ? 'Yes' : 'No'}`);
    
  } catch (error) {
    console.error('❌ Error adding course:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the script
addArmWrestlingCourse();
