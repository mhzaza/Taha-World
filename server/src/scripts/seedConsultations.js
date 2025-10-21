const mongoose = require('mongoose');
const Consultation = require('../models/Consultation');
require('dotenv').config();

// Consultation data from client/src/data/consultations.ts
const consultationsData = [
  // Sports Consultations
  {
    consultationId: 1,
    title: 'الاستشارة الرياضية التأسيسية: بطل مصارعة الذراعين',
    titleEn: 'Foundational Sports Consultation: Arm Wrestling Champion',
    description: 'استشارة متخصصة للراغبين بدخول أو تطوير أدائهم في رياضة مصارعة الذراعين والقوة البدنية',
    duration: '75 دقيقة',
    durationMinutes: 75,
    price: 100,
    currency: 'USD',
    category: 'sports',
    features: [
      'تقييم مستوى القوة البدنية وتحليل تقنيات الذراعين الحالية',
      'وضع برنامج تدريبي مخصص يركز على نقاط الضعف الخاصة بمصارعة الذراعين',
      'استراتيجيات التغذية الأساسية لدعم زيادة القوة العضلية',
      'خطة عمل للمسار الاحترافي في مصارعة الذراعين'
    ],
    isActive: true,
    consultationType: 'both',
    displayOrder: 1
  },
  {
    consultationId: 2,
    title: 'استشارة التحضير للمنافسات والبطولات (رياضي/شخصي)',
    titleEn: 'Competition and Championship Preparation Consultation',
    description: 'إعداد شامل للرياضيين والمحترفين الذين يستعدون لمنافسة كبرى سواء كانت بطولة رياضية أو تحدي وظيفي/شخصي مهم',
    duration: '90 دقيقة',
    durationMinutes: 90,
    price: 75,
    currency: 'USD',
    category: 'sports',
    features: [
      'تحليل شامل لنقاط القوة والضعف (SWOT Analysis) في الأداء والموقف التنافسي',
      'برنامج تدريبي متقدم مُكثف ومُجدوَل لفترة ما قبل المنافسة',
      'استراتيجيات ذهنية متقدمة للتعامل مع ضغط البطولة واليوم الحاسم',
      'متابعة حتى يوم المنافسة (عبر الرسائل أو مكالمة سريعة واحدة)'
    ],
    isActive: true,
    consultationType: 'both',
    displayOrder: 2
  },
  {
    consultationId: 3,
    title: 'الاستشارة الجماعية للفرق والمؤسسات',
    titleEn: 'Group Consultation for Teams and Organizations',
    description: 'جلسة مخصصة للمجموعات الرياضية أو الفرق المؤسسية التي تسعى لبناء روح الفريق وتطوير مهارات القوة الجماعية والتواصل',
    duration: '120 دقيقة',
    durationMinutes: 120,
    price: 100,
    currency: 'USD',
    category: 'group',
    features: [
      'تدريب عملي جماعي على أسس القوة البدنية وتنسيق الحركة',
      'تمارين تفاعلية لتعزيز مهارات التواصل الفعّال داخل المجموعة',
      'تطوير استراتيجيات جماعية للوصول للأهداف المشتركة (رياضية أو وظيفية)',
      'مواد تدريبية إضافية لاستدامة التعلم والتطبيق'
    ],
    isActive: true,
    consultationType: 'both',
    requiresApproval: true,
    displayOrder: 3
  },
  // Life Coaching Consultations
  {
    consultationId: 4,
    title: 'استشارة "بوصلة الحياة وتحديد الأهداف"',
    titleEn: 'Life Compass and Goal Setting Consultation',
    description: 'مخصصة للأفراد الذين يشعرون بالتشتت ولا يملكون رؤية واضحة أو خطة عملية لتحقيق طموحاتهم',
    duration: '60 دقيقة',
    durationMinutes: 60,
    price: 50,
    currency: 'USD',
    category: 'life_coaching',
    features: [
      'تحديد وتقييم القيم الأساسية ومواءمتها مع الأهداف الشخصية',
      'تطبيق منهجيات فعالة لصياغة الأهداف الذكية (SMART) وتحديد أولوياتها',
      'تحليل معيقات التقدم وتطوير آليات التغلب على التسويف والمماطلة',
      'خطة متابعة قصيرة المدى لضمان الانطلاق القوي نحو الهدف'
    ],
    isActive: true,
    consultationType: 'online',
    displayOrder: 4
  },
  {
    consultationId: 5,
    title: 'استشارة "توازن العمل والحياة (Work-Life Balance)"',
    titleEn: 'Work-Life Balance Consultation',
    description: 'مخصصة لمن يواجهون تحديات في إدارة وقتهم وطاقتهم بين ضغوط العمل ومتطلبات الحياة الشخصية والعائلية',
    duration: '60 دقيقة',
    durationMinutes: 60,
    price: 50,
    currency: 'USD',
    category: 'life_coaching',
    features: [
      'تحليل شامل لجدول المهام اليومي وتحديد "مصارف الطاقة"',
      'استراتيجيات إدارة الحدود بين العمل والعائلة لتقليل الصراع',
      'تقنيات عملية لزيادة الإنتاجية في وقت أقل (بدلاً من العمل لساعات أطول)',
      'تصميم نظام روتيني يدعم الصحة النفسية والبدنية'
    ],
    isActive: true,
    consultationType: 'online',
    displayOrder: 5
  },
  {
    consultationId: 6,
    title: 'استشارة "مهارات التواصل والتأثير في العلاقات"',
    titleEn: 'Communication Skills and Relationship Influence Consultation',
    description: 'مخصصة لمن يعانون من سوء فهم أو صراعات متكررة في العلاقات العائلية، الزمالة، أو الاجتماعية، ويرغبون في زيادة تأثيرهم الإيجابي',
    duration: '60 دقيقة',
    durationMinutes: 60,
    price: 50,
    currency: 'USD',
    category: 'life_coaching',
    features: [
      'تحليل نمط التواصل الحالي (الاستماع الفعال والتعبير)',
      'تقنيات حل النزاعات العائلية والعملية بطرق إيجابية وبناءة',
      'تطوير مهارة التعاطف وكيفية بناء جسور الثقة مع الآخرين',
      'تمارين لزيادة الحضور والكاريزما في التفاعلات الاجتماعية والمهنية'
    ],
    isActive: true,
    consultationType: 'online',
    displayOrder: 6
  },
  // VIP Consultation
  {
    consultationId: 7,
    title: 'استشارة "المسار الحصري والتحولات النوعية" (VIP)',
    titleEn: 'Exclusive Path and Transformations Consultation (VIP)',
    description: 'جلسة سرية ومكثفة مخصصة لمناقشة التحديات المعقدة، القضايا شديدة الحساسية، أو التحولات المهنية/الشخصية التي تتطلب خصوصية تامة',
    duration: '90 دقيقة',
    durationMinutes: 90,
    price: 150,
    currency: 'USD',
    category: 'vip',
    features: [
      'جلسة تحليل عميق وشامل للتحدي الراهن أو المسألة الحساسة',
      'تطبيق أدوات تدريبية (كوتشينج) متقدمة وغير تقليدية للوصول إلى جذور المشكلة',
      'تطوير استراتيجيات مخصصة وحصرية للخروج من المأزق أو اتخاذ القرار الصعب',
      'وضع خطة عمل سرية بخطوات واضحة ومسار متابعة خاص',
      'متابعة خاصة لمدة شهر عبر رسائل حصرية لضمان تطبيق الاستراتيجية'
    ],
    isActive: true,
    consultationType: 'both',
    requiresApproval: true,
    displayOrder: 7
  }
];

async function seedConsultations() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Clear existing consultations
    const deleteResult = await Consultation.deleteMany({});
    console.log(`🗑️  Deleted ${deleteResult.deletedCount} existing consultations`);

    // Insert new consultations
    const consultations = await Consultation.insertMany(consultationsData);
    console.log(`✅ Successfully seeded ${consultations.length} consultations`);

    // Display seeded consultations
    consultations.forEach((consultation, index) => {
      console.log(`\n${index + 1}. ${consultation.title}`);
      console.log(`   - Category: ${consultation.category}`);
      console.log(`   - Price: ${consultation.price} ${consultation.currency}`);
      console.log(`   - Duration: ${consultation.duration}`);
      console.log(`   - Type: ${consultation.consultationType}`);
    });

    console.log('\n✨ Consultation seeding completed successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding consultations:', error);
    process.exit(1);
  }
}

// Run the seed function
seedConsultations();

