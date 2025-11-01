'use client';

import { Course } from '@/types';
import { StarIcon, ClockIcon, UserGroupIcon, PlayIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

interface CourseHeaderProps {
  course: Course;
  isEnrolled: boolean;
  progress: number;
}

export default function CourseHeader({ course, isEnrolled, progress }: CourseHeaderProps) {
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <StarIcon key={i} className="w-4 h-4 text-yellow-400" />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative w-4 h-4">
            <StarOutlineIcon className="w-4 h-4 text-yellow-400 absolute" />
            <StarIcon className="w-4 h-4 text-yellow-400 absolute" style={{ clipPath: 'inset(0 50% 0 0)' }} />
          </div>
        );
      } else {
        stars.push(
          <StarOutlineIcon key={i} className="w-4 h-4 text-gray-300" />
        );
      }
    }
    return stars;
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
      return `${hours} ساعة${remainingMinutes > 0 ? ` و ${remainingMinutes} دقيقة` : ''}`;
    }
    return `${remainingMinutes} دقيقة`;
  };

  const translateLevel = (level: string) => {
    switch (level.toLowerCase()) {
      case 'beginner':
        return 'مبتدئ';
      case 'intermediate':
        return 'متوسط';
      case 'advanced':
        return 'متقدم';
      default:
        return level; // Return as-is if already in Arabic or unknown
    }
  };

  const translateCategory = (category: string) => {
    switch (category.toLowerCase()) {
      case 'fitness':
        return 'اللياقة البدنية';
      case 'bodybuilding':
        return 'كمال الأجسام';
      case 'cardio':
        return 'التمارين القلبية';
      case 'yoga':
        return 'اليوجا';
      case 'pilates':
        return 'البيلاتس';
      case 'martial arts':
        return 'الرياضات القتالية';
      case 'swimming':
        return 'السباحة';
      case 'running':
        return 'الجري';
      case 'cycling':
        return 'ركوب الدراجات';
      case 'dance':
        return 'الرقص';
      case 'sports':
        return 'الرياضة';
      case 'nutrition':
        return 'التغذية';
      case 'weight loss':
        return 'فقدان الوزن';
      case 'muscle building':
        return 'بناء العضلات';
      case 'flexibility':
        return 'المرونة';
      case 'strength training':
        return 'تدريب القوة';
      case 'endurance':
        return 'التحمل';
      case 'rehabilitation':
        return 'إعادة التأهيل';
      case 'sports medicine':
        return 'الطب الرياضي';
      case 'coaching':
        return 'التدريب';
      default:
        return category; // Return as-is if already in Arabic or unknown
    }
  };

  const getLevelColor = (level: string) => {
    const arabicLevel = translateLevel(level);
    switch (arabicLevel) {
      case 'مبتدئ':
        return 'bg-green-400 text-green-700';
      case 'متوسط':
        return 'bg-yellow-400 text-yellow-700';
      case 'متقدم':
        return 'bg-red-400 text-red-700';
      default:
        return 'bg-gray-400 text-black';
    }
  };

  return (
    <div className="bg-gradient-to-r from-[#41ADE1] to-[#3399CC] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          {/* Course Info */}
          <div className="lg:col-span-2">
            {/* Breadcrumb */}
            <nav className="mb-4">
              <div className="flex items-center space-x-2 text-sm text-[#41ADE1]/60">
                <a href="/" className="hover:text-white transition-colors">الرئيسية</a>
                <span>/</span>
                <a href="/courses" className="hover:text-white transition-colors">الكورسات</a>
                <span>/</span>
                <span className="text-white">{course.title}</span>
              </div>
            </nav>

            {/* Course Title */}
            <h1 className="text-3xl lg:text-4xl font-bold mb-4 leading-tight">
              {course.title}
            </h1>

            {/* Course Description */}
            <p className="text-lg text-[#41ADE1]/40 mb-6 leading-relaxed">
              {course.description}
            </p>

            {/* Course Meta */}
            <div className="flex flex-wrap items-center gap-6 mb-6">
              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {renderStars(course.rating?.average || 0)}
                </div>
                <span className="text-sm font-medium">{course.rating?.average || 0}</span>
                <span className="text-sm text-[#41ADE1]/60">({course.rating?.count || 0} طالب)</span>
              </div>

              {/* Level */}
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getLevelColor(course.level)}`}>
                {translateLevel(course.level)}
              </span>

              {/* Duration */}
              <div className="flex items-center gap-1 text-sm text-[#41ADE1]/60">
                <ClockIcon className="w-4 h-4" />
                <span>{formatDuration(course.duration)}</span>
              </div>

            {/* Students Count */}
<div className="flex items-center gap-1 text-sm text-[#41ADE1]/60">
  <UserGroupIcon className="w-4 h-4" />
  <span>{(course.enrollmentCount || 0).toLocaleString()} طالب</span>
</div>
            </div>

          {/* Instructor */}
<div className="flex items-center gap-3 mb-6">
  <div className="w-10 h-10 bg-[#3399CC] rounded-full flex items-center justify-center">
    {/* Use instructor's name to get the first character */}
    <span className="text-sm font-bold">{(course.instructor?.name || 'م').charAt(0)}</span>
  </div>
  <div>
    <p className="text-sm text-[#41ADE1]/60">المدرب</p>
    {/* Display the instructor's name */}
    <p className="font-medium">{course.instructor?.name || 'غير محدد'}</p>
  </div>
</div>

            {/* Progress Bar (if enrolled) */}
            {isEnrolled && (
              <div className="mb-6">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span>تقدمك في الكورس</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-[#3399CC] rounded-full h-2">
                  <div 
                    className="bg-green-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4">
              {isEnrolled ? (
                <button className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2">
                  <PlayIcon className="w-5 h-5" />
                  {progress > 0 ? 'متابعة التعلم' : 'بدء التعلم'}
                </button>
              ) : (
                <>
                  <button className="border border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-white hover:text-[#41ADE1] transition-colors">
                    معاينة مجانية
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Course Thumbnail */}
          <div className="lg:col-span-1">
            <div className="relative aspect-video rounded-lg overflow-hidden shadow-2xl">
              {course.thumbnail ? (
                <Image
                  src={course.thumbnail}
                  alt={course.title}
                  fill
                  className="object-cover"
                  priority
                  onError={(e) => {
                    console.error('Failed to load course thumbnail:', course.thumbnail);
                    // Hide the image and show fallback
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const fallback = target.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
              ) : null}
              <div 
                className="w-full h-full bg-gradient-to-br from-[#41ADE1] to-[#3399CC] flex items-center justify-center"
                style={{ display: course.thumbnail ? 'none' : 'flex' }}
              >
                <div className="text-center">
                  <PlayIcon className="w-16 h-16 text-white mx-auto mb-4 opacity-80" />
                  <p className="text-white font-medium">معاينة الكورس</p>
                </div>
              </div>
              
              {/* Play Button Overlay - Only show if course has preview video */}
              {course.previewVideo && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-20 transition-all cursor-pointer group">
                  <div className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <PlayIcon className="w-8 h-8 text-[#41ADE1] mr-1" />
                  </div>
                </div>
              )}
            </div>

            {/* Course Stats Card */}
            <div className="mt-6 bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="font-semibold mb-4">تفاصيل الكورس</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#41ADE1]/60">عدد الدروس</span>
                  <span className="font-medium">{course.lessons.length} درس</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#41ADE1]/60">المدة الإجمالية</span>
                  <span className="font-medium">{formatDuration(course.duration)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#41ADE1]/60">المستوى</span>
                  <span className="font-medium">{translateLevel(course.level)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#41ADE1]/60">التصنيف</span>
                  <span className="font-medium">{translateCategory(course.category)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#41ADE1]/60">اللغة</span>
                  <span className="font-medium">العربية</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#41ADE1]/60">شهادة إتمام</span>
                  <span className="font-medium">متاحة</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}