import { Course } from '@/types';

export const dummyCourses: Course[] = [
  {
    id: '1',
    title: 'كورس مصارعة الذراعين للمبتدئين',
    description: 'تعلم أساسيات مصارعة الذراعين من الصفر حتى الاحتراف',
    instructor: {
      id: 'instructor-1',
      name: 'طه الصباغ',
      avatar: '/images/instructors/taha-sabag.jpg',
      bio: 'مدرب محترف في مصارعة الذراعين والقوة البدنية',
      credentials: ['مدرب معتمد', 'بطل عالمي سابق']
    },
    duration: 120,
    price: 99,
    currency: 'USD',
    category: 'arm-wrestling',
    level: 'beginner',
    enrollmentCount: 150,
    rating: {
      average: 4.8,
      count: 45
    },
    thumbnail: '/images/courses/arm-wrestling-basics.jpg',
    tags: ['مصارعة الذراعين', 'مبتدئين', 'قوة', 'تدريب'],
    whatYouWillLearn: [
      'أساسيات مصارعة الذراعين',
      'الوضعية الصحيحة',
      'تقنيات الفوز',
      'تمارين القوة المناسبة'
    ],
    isPublished: true,
    isFeatured: true,
    language: 'ar',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    lessons: [
      {
        id: '1-1',
        courseId: '1',
        title: 'مقدمة في مصارعة الذراعين',
        duration: 900, // 15 minutes in seconds
        videoUrl: '/videos/lesson-1-1.mp4',
        order: 1,
        isPreview: true,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
      },
      {
        id: '1-2',
        courseId: '1',
        title: 'الوضعية الصحيحة',
        duration: 1200, // 20 minutes in seconds
        videoUrl: '/videos/lesson-1-2.mp4',
        order: 2,
        isPreview: false,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
      }
    ]
  },
  {
    id: '2',
    title: 'تدريب القوة الأساسي',
    description: 'برنامج تدريبي شامل لبناء القوة الأساسية',
    instructor: {
      id: 'instructor-1',
      name: 'طه الصباغ',
      avatar: '/images/instructors/taha-sabag.jpg',
      bio: 'مدرب محترف في مصارعة الذراعين والقوة البدنية',
      credentials: ['مدرب معتمد', 'بطل عالمي سابق']
    },
    duration: 180,
    price: 149,
    currency: 'USD',
    category: 'strength-training',
    level: 'intermediate',
    enrollmentCount: 89,
    rating: {
      average: 4.6,
      count: 32
    },
    thumbnail: '/images/courses/strength-training.jpg',
    tags: ['تدريب القوة', 'متوسط', 'لياقة', 'عضلات'],
    whatYouWillLearn: [
      'أساسيات تدريب القوة',
      'تمارين مركبة',
      'برمجة التدريب',
      'التغذية الرياضية'
    ],
    isPublished: true,
    isFeatured: false,
    language: 'ar',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01'),
    lessons: [
      {
        id: '2-1',
        courseId: '2',
        title: 'أساسيات تدريب القوة',
        duration: 1500, // 25 minutes in seconds
        videoUrl: '/videos/lesson-2-1.mp4',
        order: 1,
        isPreview: true,
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-02-01')
      }
    ]
  },
  {
    id: '3',
    title: 'فنون القتال المختلطة',
    description: 'تعلم تقنيات فنون القتال المختلطة',
    instructor: {
      id: 'instructor-1',
      name: 'طه الصباغ',
      avatar: '/images/instructors/taha-sabag.jpg',
      bio: 'مدرب محترف في مصارعة الذراعين والقوة البدنية',
      credentials: ['مدرب معتمد', 'بطل عالمي سابق']
    },
    duration: 240,
    price: 199,
    currency: 'USD',
    category: 'mma',
    level: 'advanced',
    enrollmentCount: 67,
    rating: {
      average: 4.9,
      count: 28
    },
    thumbnail: '/images/courses/mma-basics.jpg',
    tags: ['فنون قتالية', 'متقدم', 'قتال', 'دفاع عن النفس'],
    whatYouWillLearn: [
      'تقنيات الضرب',
      'تقنيات المصارعة',
      'الدفاع عن النفس',
      'استراتيجيات القتال'
    ],
    isPublished: true,
    isFeatured: true,
    language: 'ar',
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-03-01'),
    lessons: [
      {
        id: '3-1',
        courseId: '3',
        title: 'مقدمة في فنون القتال المختلطة',
        duration: 1800, // 30 minutes in seconds
        videoUrl: '/videos/lesson-3-1.mp4',
        order: 1,
        isPreview: true,
        createdAt: new Date('2024-03-01'),
        updatedAt: new Date('2024-03-01')
      }
    ]
  }
];