'use client';

import { Course, Lesson } from '@/types';
import { CheckIcon, PlayIcon, LockClosedIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { CheckIcon as CheckIconSolid } from '@heroicons/react/24/solid';

interface LessonsListProps {
  course: Course;
  currentLessonId: string;
  onLessonSelect: (lessonId: string) => void;
  completedLessons: string[];
  isEnrolled: boolean;
  isOpen: boolean;
  onClose: () => void;
}

export default function LessonsList({
  course,
  currentLessonId,
  onLessonSelect,
  completedLessons,
  isEnrolled,
  isOpen,
  onClose
}: LessonsListProps) {
  const totalLessons = course.lessons.length;
  const completedCount = completedLessons.length;
  const progressPercentage = totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0;

  const handleLessonClick = (lesson: Lesson) => {
    if (isEnrolled) {
      onLessonSelect(lesson.id);
      onClose(); // Close sidebar on mobile after selection
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 right-0 z-50 lg:z-auto
        w-80 lg:w-full bg-gray-800 shadow-xl lg:shadow-lg rounded-lg
        transform transition-transform duration-300 ease-in-out lg:transform-none
        ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
      `}>
        {/* Header */}
        <div className="p-6 border-b border-gray-600">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">محتوى الكورس</h3>
            <button
              onClick={onClose}
              className="lg:hidden p-2 text-gray-300 hover:text-white"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm text-gray-300 mb-2">
              <span>التقدم</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-[#41ADE1] h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-gray-700 rounded-lg p-3">
              <div className="text-lg font-bold text-white">{completedCount}</div>
              <div className="text-xs text-gray-300">مكتمل</div>
            </div>
            <div className="bg-gray-700 rounded-lg p-3">
              <div className="text-lg font-bold text-white">{totalLessons}</div>
              <div className="text-xs text-gray-300">إجمالي</div>
            </div>
          </div>
        </div>

        {/* Lessons List */}
        <div className="flex-1 overflow-y-auto max-h-[calc(100vh-300px)] lg:max-h-[600px]">
          <div className="p-4 space-y-2">
            {course.lessons.map((lesson, index) => {
              const lessonKey = lesson.id || `lesson-${lesson.order ?? index}`;
              const isCompleted = completedLessons.includes(lesson.id);
              const isCurrent = lesson.id === currentLessonId;
              const isLocked = !isEnrolled;
              
              return (
                <div
                  key={lessonKey}
                  className={`
                    relative rounded-lg border transition-all duration-200 cursor-pointer
                    ${isCurrent 
                      ? 'border-[#41ADE1] bg-[#41ADE1]/20 shadow-md' 
                      : 'border-gray-700 bg-gray-800 hover:border-gray-600 hover:shadow-sm'
                    }
                    ${isLocked ? 'opacity-60' : ''}
                  `}
                  onClick={() => handleLessonClick(lesson)}
                >
                  <div className="p-4">
                    {/* Lesson Header */}
                    <div className="flex items-start gap-3">
                      {/* Status Icon */}
                      <div className="flex-shrink-0 mt-1">
                        {isLocked ? (
                          <div className="w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center">
                            <LockClosedIcon className="w-3 h-3 text-gray-300" />
                          </div>
                        ) : isCompleted ? (
                          <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                            <CheckIconSolid className="w-3 h-3 text-white" />
                          </div>
                        ) : isCurrent ? (
                          <div className="w-6 h-6 bg-[#41ADE1] rounded-full flex items-center justify-center">
                            <PlayIcon className="w-3 h-3 text-white" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-gray-300">{index + 1}</span>
                          </div>
                        )}
                      </div>

                      {/* Lesson Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className={`
                          text-sm font-medium leading-5 mb-1
                          ${isCurrent ? 'text-[#41ADE1]' : 'text-white'}
                        `}>
                          {lesson.title}
                        </h4>
                        
                        <div className="flex items-center gap-2 text-xs text-gray-300">
                          <span>الدرس {index + 1}</span>
                          <span>•</span>
                          <span>{Math.floor(lesson.duration / 60)} دقيقة</span>
                        </div>

                        {/* Lesson Description (if current) */}
                        {isCurrent && lesson.description && (
                          <p className="text-xs text-gray-300 mt-2 line-clamp-2">
                            {lesson.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Current Lesson Indicator */}
                    {isCurrent && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#41ADE1] rounded-r"></div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        {!isEnrolled && (
          <div className="p-4 border-t border-gray-700 bg-gray-800">
            <div className="text-center">
              <div className="mb-2">
                <LockClosedIcon className="w-8 h-8 text-gray-300 mx-auto" />
              </div>
              <p className="text-sm text-gray-300 mb-3">
                اشترك في الكورس للوصول إلى جميع الدروس
              </p>
              <button className="w-full bg-[#41ADE1] text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-[#3399CC] transition-colors">
                شراء الكورس - ${course.price}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// Utility component for lesson status badge
export const LessonStatusBadge = ({ 
  isCompleted, 
  isCurrent, 
  isLocked 
}: { 
  isCompleted: boolean; 
  isCurrent: boolean; 
  isLocked: boolean; 
}) => {
  if (isLocked) {
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
        <LockClosedIcon className="w-3 h-3 mr-1" />
        مقفل
      </span>
    );
  }
  
  if (isCompleted) {
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
        <CheckIcon className="w-3 h-3 mr-1" />
        مكتمل
      </span>
    );
  }
  
  if (isCurrent) {
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#41ADE1]/30 text-[#3399CC]">
        <PlayIcon className="w-3 h-3 mr-1" />
        الحالي
      </span>
    );
  }
  
  return (
    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
      غير مبدوء
    </span>
  );
};
