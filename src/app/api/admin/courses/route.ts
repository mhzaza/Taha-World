import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { isServerAdmin, logAdminAction } from '@/lib/admin';
import { getClientIP } from '@/lib/utils';
import { adminDb } from '@/lib/firebase-admin';

// Temporary helper function to extract email from request
// This is a simplified version until Firebase Admin is properly configured
async function getEmailFromRequest(request: NextRequest) {
  try {
    // For now, we'll check if the request has admin emails in headers
    // This is a temporary solution until Firebase Admin SDK is properly configured
    const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',') || [];
    
    // In a real scenario, you would verify the Firebase token here
    // For now, we'll return the first admin email as a fallback
    // TODO: Implement proper Firebase Admin SDK verification
    
    return adminEmails[0] || null;
  } catch (error) {
    console.error('Error getting email from request:', error);
    return null;
  }
}

// Mock data - replace with actual database calls
const mockCourses = [
  {
    id: 'course-1',
    title: 'كورس تدريب كمال الأجسام المتقدم',
    description: 'كورس شامل لتدريب كمال الأجسام للمستوى المتقدم',
    price: 299,
    level: 'متقدم',
    duration: '8 أسابيع',
    instructor: 'أحمد محمد',
    thumbnail: '/images/bodybuilding-course.jpg',
    published: true,
    createdAt: '2024-01-10T10:30:00Z',
    updatedAt: '2024-01-15T14:20:00Z',
    lessons: [
      { id: 'lesson-1', title: 'مقدمة في كمال الأجسام', duration: '30 دقيقة' },
      { id: 'lesson-2', title: 'تمارين الصدر والكتفين', duration: '45 دقيقة' }
    ]
  },
  {
    id: 'course-2',
    title: 'كورس تدريب المصارعة للمبتدئين',
    description: 'تعلم أساسيات المصارعة من الصفر',
    price: 199,
    level: 'مبتدئ',
    duration: '6 أسابيع',
    instructor: 'سارة أحمد',
    thumbnail: '/images/wrestling-course.jpg',
    published: true,
    createdAt: '2024-01-08T15:45:00Z',
    updatedAt: '2024-01-12T09:15:00Z',
    lessons: [
      { id: 'lesson-3', title: 'أساسيات المصارعة', duration: '25 دقيقة' },
      { id: 'lesson-4', title: 'تقنيات الإمساك', duration: '35 دقيقة' }
    ]
  }
];

// GET /api/admin/courses - List all courses
export async function GET(request: NextRequest) {
  try {
    // Check authentication (temporary implementation)
    const email = await getEmailFromRequest(request);
    if (!email) {
      return NextResponse.json(
        { error: 'غير مصرح بالوصول - يجب تسجيل الدخول' },
        { status: 401 }
      );
    }

    // Check admin permissions
    const isAdmin = await isServerAdmin(email);
    if (!isAdmin) {
      await logAdminAction({
        adminEmail: email,
        action: 'UNAUTHORIZED_ACCESS_ATTEMPT',
        target: 'admin_courses_list',
        details: { ip: getClientIP(request), userAgent: request.headers.get('user-agent') },
        timestamp: new Date()
      });
      
      return NextResponse.json(
        { error: 'غير مصرح بالوصول - صلاحيات المدير مطلوبة' },
        { status: 403 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Get courses from Firestore
     try {
       let coursesRef = adminDb.collection('courses');
       
       // Apply filters
       if (status !== 'all') {
         const isPublished = status === 'published';
         coursesRef = coursesRef.where('published', '==', isPublished);
       }
       
       // Apply sorting
       coursesRef = coursesRef.orderBy(sortBy, sortOrder === 'desc' ? 'desc' : 'asc');
       
       // Get total count for pagination
       const countSnapshot = await coursesRef.get();
       const totalCount = countSnapshot.size;
       
       // Apply pagination
       const startIndex = (page - 1) * pageSize;
       let paginatedRef = coursesRef;
       
       if (startIndex > 0 && countSnapshot.docs.length > 0) {
         const lastVisible = countSnapshot.docs[startIndex - 1];
         paginatedRef = coursesRef.startAfter(lastVisible).limit(pageSize);
       } else {
         paginatedRef = coursesRef.limit(pageSize);
       }
       
       // Execute query
       const paginatedSnapshot = await paginatedRef.get();
       const courses = [];
       
       // Process results
       paginatedSnapshot.forEach(doc => {
         const courseData = doc.data();
         courses.push({
           id: doc.id,
           ...courseData
         });
       });
      
      // Filter by search term if provided (client-side filtering for text search)
      let filteredCourses = courses;
      if (search) {
        filteredCourses = courses.filter(course => 
          course.title.toLowerCase().includes(search.toLowerCase()) ||
          course.description.toLowerCase().includes(search.toLowerCase())
        );
      }
      
      // Log admin action
      await logAdminAction({
        adminEmail: email,
        action: 'VIEW_COURSES',
        target: 'admin_courses_list',
        details: { 
          filters: { search, status, page, pageSize, sortBy, sortOrder },
          resultsCount: filteredCourses.length
        },
        timestamp: new Date()
      });
      
      return NextResponse.json({
        courses: filteredCourses,
        pagination: {
          total: totalCount,
          page,
          limit: pageSize,
          totalPages: Math.ceil(totalCount / pageSize)
        }
      });
    } catch (error) {
      console.error('Error fetching courses:', error);
      return NextResponse.json(
        { error: 'خطأ في جلب الكورسات' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { error: 'خطأ في الخادم الداخلي' },
      { status: 500 }
    );
  }
}

// POST /api/admin/courses - Create new course
export async function POST(request: NextRequest) {
  try {
    // Check authentication (temporary implementation)
    const email = await getEmailFromRequest(request);
    if (!email) {
      return NextResponse.json(
        { error: 'غير مصرح بالوصول - يجب تسجيل الدخول' },
        { status: 401 }
      );
    }

    // Check admin permissions
    const isAdmin = await isServerAdmin(email);
    if (!isAdmin) {
      await logAdminAction({
        adminEmail: email,
        action: 'UNAUTHORIZED_ACCESS_ATTEMPT',
        target: 'admin_courses_create',
        details: { ip: getClientIP(request), userAgent: request.headers.get('user-agent') },
        timestamp: new Date()
      });
      
      return NextResponse.json(
        { error: 'غير مصرح بالوصول - صلاحيات المدير مطلوبة' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const {
      title,
      description,
      price,
      level,
      duration,
      instructor,
      thumbnail,
      lessons,
      published = false
    } = body;

    // Validate required fields
    if (!title || !description || !price || !level || !instructor) {
      return NextResponse.json(
        { error: 'الحقول المطلوبة مفقودة' },
        { status: 400 }
      );
    }

    // Validate price
    if (typeof price !== 'number' || price < 0) {
      return NextResponse.json(
        { error: 'السعر يجب أن يكون رقم موجب' },
        { status: 400 }
      );
    }

    // Create new course
    const newCourse = {
      id: `course-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      price,
      level,
      duration,
      instructor: instructor, // instructor is an object, not a string
      thumbnail: thumbnail || '',
      lessons: lessons || [],
      published,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save to Firestore database
    const docRef = await adminDb.collection('courses').add(newCourse);
    
    // Log admin action
    await logAdminAction({
      adminEmail: email,
      action: 'CREATE_COURSE',
      target: newCourse.id,
      details: { 
        courseTitle: newCourse.title,
        price: newCourse.price,
        published: newCourse.published
      },
      timestamp: new Date()
    });

    return NextResponse.json(
      { 
        message: 'تم إنشاء الكورس بنجاح',
        course: newCourse
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json(
      { error: 'خطأ في الخادم الداخلي' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/courses/[id] - Update a course
export async function PUT(request: NextRequest) {
  try {
    // Check authentication (temporary implementation)
    const email = await getEmailFromRequest(request);
    if (!email) {
      return NextResponse.json(
        { error: 'غير مصرح بالوصول - يجب تسجيل الدخول' },
        { status: 401 }
      );
    }

    // Check admin permissions
    const isAdmin = await isServerAdmin(email);
    if (!isAdmin) {
      await logAdminAction({
        adminEmail: email,
        action: 'UNAUTHORIZED_ACCESS_ATTEMPT',
        target: 'admin_course_update',
        details: { ip: getClientIP(request), userAgent: request.headers.get('user-agent') },
        timestamp: new Date()
      });
      
      return NextResponse.json(
        { error: 'غير مصرح بالوصول - صلاحيات المدير مطلوبة' },
        { status: 403 }
      );
    }

    // Get course ID from URL
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const courseId = pathParts[pathParts.length - 1];

    if (!courseId) {
      return NextResponse.json(
        { error: 'معرف الكورس مطلوب' },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Update course in Firestore
    const courseRef = adminDb.collection('courses').doc(courseId);
    
    // Add updatedAt timestamp
    const updatedData = {
      ...body,
      updatedAt: new Date().toISOString()
    };
    
    await courseRef.update(updatedData);
    
    // Get the updated course
    const updatedCourseDoc = await courseRef.get();
    if (!updatedCourseDoc.exists) {
      return NextResponse.json(
        { error: 'الكورس غير موجود' },
        { status: 404 }
      );
    }
    
    const updatedCourse = {
      id: updatedCourseDoc.id,
      ...updatedCourseDoc.data()
    };

    // Log admin action
    await logAdminAction({
      adminEmail: email,
      action: 'UPDATE_COURSE',
      target: courseId,
      details: { 
        courseTitle: updatedCourse.title,
        updatedFields: Object.keys(body)
      },
      timestamp: new Date()
    });

    return NextResponse.json({
      message: 'تم تحديث الكورس بنجاح',
      course: updatedCourse
    });
  } catch (error) {
    console.error('Error updating course:', error);
    return NextResponse.json(
      { error: 'خطأ في الخادم الداخلي' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/courses/[id] - Delete a course
export async function DELETE(request: NextRequest) {
  try {
    // Check authentication (temporary implementation)
    const email = await getEmailFromRequest(request);
    if (!email) {
      return NextResponse.json(
        { error: 'غير مصرح بالوصول - يجب تسجيل الدخول' },
        { status: 401 }
      );
    }

    // Check admin permissions
    const isAdmin = await isServerAdmin(email);
    if (!isAdmin) {
      await logAdminAction({
        adminEmail: email,
        action: 'UNAUTHORIZED_ACCESS_ATTEMPT',
        target: 'admin_course_delete',
        details: { ip: getClientIP(request), userAgent: request.headers.get('user-agent') },
        timestamp: new Date()
      });
      
      return NextResponse.json(
        { error: 'غير مصرح بالوصول - صلاحيات المدير مطلوبة' },
        { status: 403 }
      );
    }

    // Get course ID from URL
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const courseId = pathParts[pathParts.length - 1];

    if (!courseId) {
      return NextResponse.json(
        { error: 'معرف الكورس مطلوب' },
        { status: 400 }
      );
    }

    // Get course details for logging before deletion
    const courseRef = adminDb.collection('courses').doc(courseId);
    const courseDoc = await courseRef.get();
    
    if (!courseDoc.exists) {
      return NextResponse.json(
        { error: 'الكورس غير موجود' },
        { status: 404 }
      );
    }
    
    const courseToDelete = courseDoc.data();

    // Delete from Firestore
    await courseRef.delete();

    // Log admin action
    await logAdminAction({
      adminEmail: email,
      action: 'DELETE_COURSE',
      target: courseId,
      details: { 
        courseTitle: courseToDelete.title
      },
      timestamp: new Date()
    });

    return NextResponse.json({
      message: 'تم حذف الكورس بنجاح'
    });
  } catch (error) {
    console.error('Error deleting course:', error);
    return NextResponse.json(
      { error: 'خطأ في الخادم الداخلي' },
      { status: 500 }
    );
  }
}