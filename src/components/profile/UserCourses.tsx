'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AcademicCapIcon, PlayIcon, ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { Course, Progress } from '@/types';

interface UserCourse extends Course {
  progress?: any;
  enrolledAt?: Date;
}

export default function UserCourses() {
  const [courses, setCourses] = useState<UserCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchUserCourses = async () => {
      if (!user || !db) return;
      
      try {
        setLoading(true);
        
        // Fetch user enrollments
        const enrollmentsRef = collection(db, 'enrollments');
        const enrollmentsQuery = query(enrollmentsRef, where('userId', '==', user.uid));
        const enrollmentsSnapshot = await getDocs(enrollmentsQuery);
        
        const enrollments = enrollmentsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          enrolledAt: doc.data().enrolledAt?.toDate() || new Date(),
        })) as Array<{id: string; courseId: string; enrolledAt: Date; [key: string]: any}>;
        
        if (enrollments.length === 0) {
          setCourses([]);
          setLoading(false);
          return;
        }
        
        // Fetch course details for each enrollment
        const courseIds = enrollments.map(enrollment => enrollment.courseId);
        const coursesRef = collection(db, 'courses');
        const coursesQuery = query(coursesRef, where('id', 'in', courseIds));
        const coursesSnapshot = await getDocs(coursesQuery);
        
        const coursesData = coursesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Course[];
        
        // Fetch progress for each course
        const progressRef = collection(db, 'progress');
        const progressQuery = query(
          progressRef, 
          where('userId', '==', user.uid),
          where('courseId', 'in', courseIds)
        );
        const progressSnapshot = await getDocs(progressQuery);
        
        const progressData = progressSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Array<{id: string; courseId: string; [key: string]: any}>;
        
        // Combine course data with enrollment and progress data
        const userCourses = coursesData.map(course => {
          const enrollment = enrollments.find(e => e.courseId === course.id);
          const progress = progressData.find(p => p.courseId === course.id);
          
          return {
            ...course,
            enrolledAt: enrollment?.enrolledAt,
            progress,
          };
        });
        
        setCourses(userCourses);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching user courses:', err);
        setError('حدث خطأ أثناء تحميل الدورات. يرجى المحاولة مرة أخرى.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserCourses();
  }, [user]);

  // Format date for display
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  // Calculate progress percentage
  const calculateProgress = (course: UserCourse) => {
    if (!course.progress || !course.lessons || course.lessons.length === 0) {
      return 0;
    }
    
    const completedLessons = course.progress.completedLessons?.length || 0;
    const totalLessons = course.lessons.length;
    
    return Math.round((completedLessons / totalLessons) * 100);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-6">دوراتي التدريبية</h2>
      
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-8">
          <AcademicCapIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">لم تشترك في أي دورات بعد</h3>
          <p className="text-gray-600 mb-6">استكشف دوراتنا التدريبية واشترك فيها لتطوير مهاراتك</p>
          <Link 
            href="/courses"
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition duration-300"
          >
            استكشف الدورات
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => {
            const progressPercentage = calculateProgress(course);
            
            return (
              <div key={course.id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition duration-300">
                {course.thumbnail && (
                  <div className="relative h-40 overflow-hidden">
                    <img 
                      src={course.thumbnail} 
                      alt={course.title} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition duration-300">
                      <Link 
                        href={`/courses/${course.id}`}
                        className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition duration-300 flex items-center"
                      >
                        <PlayIcon className="h-5 w-5 ml-2" />
                        متابعة التعلم
                      </Link>
                    </div>
                  </div>
                )}
                
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-2">
                    <Link href={`/courses/${course.id}`} className="hover:text-primary transition duration-300">
                      {course.title}
                    </Link>
                  </h3>
                  
                  <div className="flex items-center text-sm text-gray-600 mb-4">
                    <ClockIcon className="h-4 w-4 ml-1" />
                    <span>{course.duration || '--'} ساعة</span>
                    
                    <span className="mx-2">•</span>
                    
                    <span>{course.lessons?.length || 0} درس</span>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">التقدم</span>
                      <span className="font-medium">{progressPercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-primary h-2.5 rounded-full" 
                        style={{ width: `${progressPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {course.enrolledAt && (
                    <div className="text-sm text-gray-600 mb-4">
                      <span>تاريخ الاشتراك: {formatDate(course.enrolledAt)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <Link
                      href={`/courses/${course.id}`}
                      className="text-primary hover:text-primary-dark transition duration-300 text-sm font-medium"
                    >
                      متابعة الدورة
                    </Link>
                    
                    {progressPercentage === 100 && (
                      <div className="flex items-center text-green-600 text-sm">
                        <CheckCircleIcon className="h-4 w-4 ml-1" />
                        مكتمل
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}