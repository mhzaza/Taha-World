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

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'مبتدئ':
        return 'bg-green-100 text-green-700';
      case 'متوسط':
        return 'bg-yellow-100 text-yellow-700';
      case 'متقدم':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          {/* Course Info */}
          <div className="lg:col-span-2">
            {/* Breadcrumb */}
            <nav className="mb-4">
              <div className="flex items-center space-x-2 text-sm text-blue-200">
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
            <p className="text-lg text-blue-100 mb-6 leading-relaxed">
              {course.description}
            </p>

            {/* Course Meta */}
            <div className="flex flex-wrap items-center gap-6 mb-6">
              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {renderStars(course.rating.average)}
                </div>
                <span className="text-sm font-medium">{course.rating.average}</span>
                <span className="text-sm text-blue-200">({course.rating.count} طالب)</span>
              </div>

              {/* Level */}
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getLevelColor(course.level)}`}>
                {course.level}
              </span>

              {/* Duration */}
              <div className="flex items-center gap-1 text-sm text-blue-200">
                <ClockIcon className="w-4 h-4" />
                <span>{formatDuration(course.duration)}</span>
              </div>

            {/* Students Count */}
<div className="flex items-center gap-1 text-sm text-blue-200">
  <UserGroupIcon className="w-4 h-4" />
  <span>{course.enrollmentCount.toLocaleString()} طالب</span>
</div>
            </div>

          {/* Instructor */}
<div className="flex items-center gap-3 mb-6">
  <div className="w-10 h-10 bg-blue-700 rounded-full flex items-center justify-center">
    {/* Use instructor's name to get the first character */}
    <span className="text-sm font-bold">{course.instructor.name.charAt(0)}</span>
  </div>
  <div>
    <p className="text-sm text-blue-200">المدرب</p>
    {/* Display the instructor's name */}
    <p className="font-medium">{course.instructor.name}</p>
  </div>
</div>

            {/* Progress Bar (if enrolled) */}
            {isEnrolled && (
              <div className="mb-6">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span>تقدمك في الكورس</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-blue-800 rounded-full h-2">
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
                  <button className="bg-white text-blue-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                    شراء الكورس - ${course.price}
                  </button>
                  <button className="border border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-white hover:text-blue-900 transition-colors">
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
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
                  <div className="text-center">
                    <PlayIcon className="w-16 h-16 text-white mx-auto mb-4 opacity-80" />
                    <p className="text-white font-medium">معاينة الكورس</p>
                  </div>
                </div>
              )}
              
              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-20 transition-all cursor-pointer group">
                <div className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <PlayIcon className="w-8 h-8 text-blue-900 mr-1" />
                </div>
              </div>
            </div>

            {/* Course Stats Card */}
            <div className="mt-6 bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="font-semibold mb-4">تفاصيل الكورس</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-200">عدد الدروس</span>
                  <span className="font-medium">{course.lessons.length} درس</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-200">المدة الإجمالية</span>
                  <span className="font-medium">{formatDuration(course.duration)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-200">المستوى</span>
                  <span className="font-medium">{course.level}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-200">اللغة</span>
                  <span className="font-medium">العربية</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-200">شهادة إتمام</span>
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