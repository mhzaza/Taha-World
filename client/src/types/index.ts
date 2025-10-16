// Core data models for the Arabic Sports Training Platform

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  phone?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female';
  fitnessLevel?: 'beginner' | 'intermediate' | 'advanced';
  goals?: string[];
  enrolledCourses: string[]; // Course IDs
  completedLessons: string[]; // Lesson IDs
  certificates: Certificate[];
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  subscription?: {
    type: 'free' | 'premium' | 'pro';
    expiresAt?: Date;
  };
}

export interface Course {
  id: string;
  title: string;
  titleEn?: string;
  description: string;
  descriptionEn?: string;
  instructor: {
    id: string;
    name: string;
    avatar?: string;
    bio?: string;
    credentials?: string[];
  };
  thumbnail: string;
  price: number;
  originalPrice?: number;
  currency: 'USD' | 'SAR' | 'EGP';
  duration: number; // in minutes
  level: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  tags: string[];
  lessons: Lesson[];
  requirements?: string[];
  whatYouWillLearn: string[];
  rating: {
    average: number;
    count: number;
  };
  enrollmentCount: number;
  isPublished: boolean;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
  language: 'ar' | 'en';
  subtitles?: string[]; // Language codes
  certificateTemplate?: string;
  previewVideo?: string;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  titleEn?: string;
  description?: string;
  videoUrl: string;
  duration: number; // in seconds
  order: number;
  isPreview: boolean;
  resources?: LessonResource[];
  quiz?: Quiz;
  notes?: string;
  transcript?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LessonResource {
  id: string;
  title: string;
  type: 'pdf' | 'image' | 'video' | 'audio' | 'link';
  url: string;
  size?: number; // in bytes
  downloadable: boolean;
}

export interface Quiz {
  id: string;
  lessonId: string;
  title: string;
  questions: QuizQuestion[];
  passingScore: number; // percentage
  timeLimit?: number; // in minutes
  attempts: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
  options?: string[]; // for multiple choice
  correctAnswer: string | string[];
  explanation?: string;
  points: number;
}

export interface Order {
  id: string;
  userId: string;
  courseId: string;
  amount: number;
  currency: 'USD' | 'SAR' | 'EGP';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: 'stripe' | 'paypal' | 'bank_transfer';
  paymentIntentId?: string;
  transactionId?: string;
  couponCode?: string;
  discountAmount?: number;
  taxAmount?: number;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  refundedAt?: Date;
  notes?: string;
}

export interface Certificate {
  id: string;
  userId: string;
  courseId: string;
  courseName: string;
  studentName: string;
  instructorName: string;
  completionDate: Date;
  certificateUrl: string;
  verificationCode: string;
  isValid: boolean;
}

export interface Progress {
  userId: string;
  courseId: string;
  lessonId: string;
  completed: boolean;
  watchTime: number; // in seconds
  lastWatchedAt: Date;
  quizScore?: number;
  notes?: string;
}

export interface Review {
  id: string;
  userId: string;
  courseId: string;
  rating: number; // 1-5
  comment: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  helpful: number; // count of helpful votes
}

export interface Category {
  id: string;
  name: string;
  nameEn?: string;
  description?: string;
  icon?: string;
  color?: string;
  courseCount: number;
  isActive: boolean;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minAmount?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  validFrom: Date;
  validTo: Date;
  isActive: boolean;
  applicableCourses?: string[]; // Course IDs, empty means all courses
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form types
export interface CourseFilters {
  category?: string;
  level?: string;
  priceRange?: [number, number];
  rating?: number;
  language?: string;
  duration?: string;
  sortBy?: 'newest' | 'oldest' | 'price-low' | 'price-high' | 'rating' | 'popular';
}

export interface SearchParams {
  query?: string;
  filters?: CourseFilters;
  page?: number;
  limit?: number;
}