const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Course = require('../models/Course');
const Order = require('../models/Order');

// Sample data
const sampleUsers = [
  {
    email: 'admin@taha-world.com',
    password: 'admin123456',
    displayName: 'مدير النظام',
    isAdmin: true,
    adminRole: 'super_admin',
    emailVerified: true,
    phone: '+966501234567',
    location: 'الرياض، المملكة العربية السعودية'
  },
  {
    email: 'instructor@taha-world.com',
    password: 'instructor123',
    displayName: 'مدرب طه الصباغ',
    isAdmin: true,
    adminRole: 'admin',
    emailVerified: true,
    phone: '+966509876543',
    location: 'جدة، المملكة العربية السعودية',
    bio: 'مدرب لياقة بدنية محترف مع أكثر من 10 سنوات من الخبرة'
  },
  {
    email: 'user@example.com',
    password: 'user123456',
    displayName: 'أحمد محمد',
    emailVerified: true,
    phone: '+966501112233',
    location: 'الدمام، المملكة العربية السعودية',
    fitnessLevel: 'beginner',
    goals: ['فقدان الوزن', 'بناء العضلات']
  }
];

const sampleCourses = [
  {
    title: 'كورس تدريب كمال الأجسام المتقدم',
    titleEn: 'Advanced Bodybuilding Training Course',
    description: 'دورة شاملة لتدريب كمال الأجسام للمستوى المتقدم مع تقنيات متطورة',
    descriptionEn: 'Comprehensive bodybuilding training course for advanced level with advanced techniques',
    price: 299,
    originalPrice: 399,
    currency: 'USD',
    duration: 1800, // 30 hours in minutes
    level: 'advanced',
    category: 'كمال الأجسام',
    tags: ['كمال الأجسام', 'تدريب', 'متقدم', 'عضلات'],
    thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
    isPublished: true,
    isFeatured: true,
    language: 'ar',
    lessons: [
      {
        title: 'مقدمة في كمال الأجسام',
        description: 'تعلم الأساسيات والمبادئ المهمة',
        videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
        duration: 45,
        order: 1,
        isFree: true
      },
      {
        title: 'تمارين الصدر المتقدمة',
        description: 'تقنيات متطورة لتطوير عضلات الصدر',
        videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
        duration: 60,
        order: 2,
        isFree: false
      },
      {
        title: 'تمارين الظهر القوية',
        description: 'بناء عضلات ظهر قوية ومتناسقة',
        videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_5mb.mp4',
        duration: 55,
        order: 3,
        isFree: false
      }
    ],
    requirements: [
      'معرفة أساسية بالتمارين الرياضية',
      'إمكانية الوصول لصالة ألعاب رياضية',
      'التزام بالبرنامج التدريبي'
    ],
    whatYouWillLearn: [
      'تقنيات التمرين المتقدمة',
      'برمجة التدريب الفعال',
      'التغذية الرياضية المتخصصة',
      'منع الإصابات والراحة'
    ],
    rating: {
      average: 4.8,
      count: 156
    },
    enrollmentCount: 234
  },
  {
    title: 'كورس تدريب المصارعة للمبتدئين',
    titleEn: 'Wrestling Training Course for Beginners',
    description: 'تعلم أساسيات المصارعة والتقنيات الأساسية للمبتدئين',
    descriptionEn: 'Learn wrestling basics and fundamental techniques for beginners',
    price: 199,
    currency: 'USD',
    duration: 1200, // 20 hours in minutes
    level: 'beginner',
    category: 'مصارعة',
    tags: ['مصارعة', 'مبتدئ', 'تقنيات', 'أساسيات'],
    thumbnail: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=800',
    isPublished: true,
    isFeatured: false,
    language: 'ar',
    lessons: [
      {
        title: 'مقدمة في المصارعة',
        description: 'تاريخ المصارعة وقواعدها الأساسية',
        videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
        duration: 30,
        order: 1,
        isFree: true
      },
      {
        title: 'الوضعيات الأساسية',
        description: 'تعلم الوضعيات الصحيحة في المصارعة',
        videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
        duration: 40,
        order: 2,
        isFree: false
      }
    ],
    requirements: [
      'لياقة بدنية أساسية',
      'ملابس رياضية مريحة',
      'سجادة تدريب'
    ],
    whatYouWillLearn: [
      'أساسيات المصارعة',
      'تقنيات الأمان',
      'التوازن والتحكم',
      'اللياقة البدنية المطلوبة'
    ],
    rating: {
      average: 4.5,
      count: 89
    },
    enrollmentCount: 145
  },
  {
    title: 'كورس التغذية الرياضية',
    titleEn: 'Sports Nutrition Course',
    description: 'تعلم أساسيات التغذية الرياضية وتخطيط الوجبات',
    descriptionEn: 'Learn sports nutrition fundamentals and meal planning',
    price: 149,
    currency: 'USD',
    duration: 900, // 15 hours in minutes
    level: 'intermediate',
    category: 'تغذية رياضية',
    tags: ['تغذية', 'رياضة', 'وجبات', 'مكملات'],
    thumbnail: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800',
    isPublished: true,
    isFeatured: true,
    language: 'ar',
    lessons: [
      {
        title: 'مقدمة في التغذية الرياضية',
        description: 'أهمية التغذية في الأداء الرياضي',
        videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
        duration: 35,
        order: 1,
        isFree: true
      },
      {
        title: 'المغذيات الكبرى',
        description: 'الكربوهيدرات والبروتينات والدهون',
        videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
        duration: 50,
        order: 2,
        isFree: false
      }
    ],
    requirements: [
      'اهتمام بالتغذية والصحة',
      'رغبة في تحسين الأداء الرياضي'
    ],
    whatYouWillLearn: [
      'أساسيات التغذية الرياضية',
      'تخطيط الوجبات',
      'المكملات الغذائية',
      'التغذية حسب نوع الرياضة'
    ],
    rating: {
      average: 4.7,
      count: 203
    },
    enrollmentCount: 312
  }
];

const sampleOrders = [
  {
    userEmail: 'user@example.com',
    userName: 'أحمد محمد',
    courseTitle: 'كورس تدريب كمال الأجسام المتقدم',
    amount: 299,
    currency: 'USD',
    status: 'completed',
    paymentMethod: 'stripe',
    paymentId: 'pi_sample_123456',
    transactionId: 'txn_sample_123456',
    completedAt: new Date('2024-01-15T10:30:00Z'),
    createdAt: new Date('2024-01-15T10:00:00Z'),
    updatedAt: new Date('2024-01-15T10:30:00Z')
  },
  {
    userEmail: 'user@example.com',
    userName: 'أحمد محمد',
    courseTitle: 'كورس التغذية الرياضية',
    amount: 149,
    currency: 'USD',
    status: 'completed',
    paymentMethod: 'paypal',
    paymentId: 'pp_sample_789012',
    transactionId: 'txn_sample_789012',
    completedAt: new Date('2024-01-20T14:15:00Z'),
    createdAt: new Date('2024-01-20T14:00:00Z'),
    updatedAt: new Date('2024-01-20T14:15:00Z')
  }
];

async function seedDatabase() {
  try {
    // Validate environment variables
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    console.log('🔗 Connecting to MongoDB Atlas...');
    console.log('📊 Database URI:', process.env.MONGODB_URI.replace(/\/\/.*@/, '//***:***@')); // Hide credentials in logs
    
    // Connect to MongoDB with proper database name
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://minasame3_db_user:ILJU2TPH8Bb77n4F@cluster0.znfhlb6.mongodb.net/taha_world?retryWrites=true&w=majority';
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB Atlas successfully');
    console.log('🏷️ Database Name:', mongoose.connection.db.databaseName);

    // Test database connection
    await mongoose.connection.db.admin().ping();
    console.log('🏓 Database ping successful');

    // Clear existing data
    console.log('🗑️ Clearing existing data...');
    await User.deleteMany({});
    await Course.deleteMany({});
    await Order.deleteMany({});
    console.log('✅ Existing data cleared');

    // Create users
    console.log('👥 Creating users...');
    const createdUsers = [];
    
    for (const userData of sampleUsers) {
      const user = new User(userData);
      await user.save();
      createdUsers.push(user);
      console.log(`✅ Created user: ${user.email}`);
    }

    // Create courses
    console.log('📚 Creating courses...');
    const createdCourses = [];
    
    for (const courseData of sampleCourses) {
      // Set instructor to the instructor user
      const instructor = createdUsers.find(u => u.email === 'instructor@taha-world.com');
      courseData.instructor = {
        id: instructor._id,
        name: instructor.displayName,
        avatar: instructor.avatar,
        bio: instructor.bio
      };

      const course = new Course(courseData);
      await course.save();
      createdCourses.push(course);
      console.log(`✅ Created course: ${course.title}`);
    }

    // Create orders
    console.log('🛒 Creating orders...');
    
    for (const orderData of sampleOrders) {
      const user = createdUsers.find(u => u.email === orderData.userEmail);
      const course = createdCourses.find(c => c.title === orderData.courseTitle);
      
      if (user && course) {
        const order = new Order({
          ...orderData,
          userId: user._id,
          courseId: course._id
        });
        await order.save();
        console.log(`✅ Created order: ${orderData.courseTitle} for ${orderData.userEmail}`);
      }
    }

    // Update user enrolled courses
    console.log('🔄 Updating user enrolled courses...');
    const user = createdUsers.find(u => u.email === 'user@example.com');
    if (user) {
      user.enrolledCourses = createdCourses.map(c => c._id);
      user.totalSpent = sampleOrders.reduce((sum, order) => sum + order.amount, 0);
      await user.save();
      console.log(`✅ Updated user enrolled courses`);
    }

    console.log('🎉 Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Users created: ${createdUsers.length}`);
    console.log(`- Courses created: ${createdCourses.length}`);
    console.log(`- Orders created: ${sampleOrders.length}`);
    
    console.log('\n🔑 Test Accounts:');
    console.log('Admin: admin@taha-world.com / admin123456');
    console.log('Instructor: instructor@taha-world.com / instructor123');
    console.log('User: user@example.com / user123456');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

// Run the seed function
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
