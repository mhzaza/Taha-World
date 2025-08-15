import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { isServerAdmin, logAdminAction } from '@/lib/admin';

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

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/admin/courses/[id] - Get single course
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'غير مصرح بالوصول - يجب تسجيل الدخول' },
        { status: 401 }
      );
    }

    // Check admin permissions
    const isAdmin = await isServerAdmin(session.user.email);
    if (!isAdmin) {
      await logAdminAction({
        adminEmail: session.user.email,
        action: 'UNAUTHORIZED_ACCESS_ATTEMPT',
        target: `admin_course_${params.id}`,
        details: { ip: request.ip, userAgent: request.headers.get('user-agent') },
        timestamp: new Date()
      });
      
      return NextResponse.json(
        { error: 'غير مصرح بالوصول - صلاحيات المدير مطلوبة' },
        { status: 403 }
      );
    }

    // Find course
    const course = mockCourses.find(c => c.id === params.id);
    if (!course) {
      return NextResponse.json(
        { error: 'الكورس غير موجود' },
        { status: 404 }
      );
    }

    // Log admin action
    await logAdminAction({
      adminEmail: session.user.email,
      action: 'VIEW_COURSE_DETAILS',
      target: course.id,
      details: { courseTitle: course.title },
      timestamp: new Date()
    });

    return NextResponse.json({ course });

  } catch (error) {
    console.error('Error fetching course:', error);
    return NextResponse.json(
      { error: 'خطأ في الخادم الداخلي' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/courses/[id] - Update course
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'غير مصرح بالوصول - يجب تسجيل الدخول' },
        { status: 401 }
      );
    }

    // Check admin permissions
    const isAdmin = await isServerAdmin(session.user.email);
    if (!isAdmin) {
      await logAdminAction({
        adminEmail: session.user.email,
        action: 'UNAUTHORIZED_ACCESS_ATTEMPT',
        target: `admin_course_update_${params.id}`,
        details: { ip: request.ip, userAgent: request.headers.get('user-agent') },
        timestamp: new Date()
      });
      
      return NextResponse.json(
        { error: 'غير مصرح بالوصول - صلاحيات المدير مطلوبة' },
        { status: 403 }
      );
    }

    // Find course
    const courseIndex = mockCourses.findIndex(c => c.id === params.id);
    if (courseIndex === -1) {
      return NextResponse.json(
        { error: 'الكورس غير موجود' },
        { status: 404 }
      );
    }

    const existingCourse = mockCourses[courseIndex];

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
      published
    } = body;

    // Validate required fields
    if (!title || !description || price === undefined || !level || !instructor) {
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

    // Track changes for audit log
    const changes: any = {};
    if (existingCourse.title !== title) changes.title = { from: existingCourse.title, to: title };
    if (existingCourse.price !== price) changes.price = { from: existingCourse.price, to: price };
    if (existingCourse.published !== published) changes.published = { from: existingCourse.published, to: published };

    // Update course
    const updatedCourse = {
      ...existingCourse,
      title: title.trim(),
      description: description.trim(),
      price,
      level,
      duration,
      instructor: instructor.trim(),
      thumbnail: thumbnail || existingCourse.thumbnail,
      lessons: lessons || existingCourse.lessons,
      published: published !== undefined ? published : existingCourse.published,
      updatedAt: new Date().toISOString()
    };

    // In a real app, update in database
    // await db.courses.update(params.id, updatedCourse);
    mockCourses[courseIndex] = updatedCourse;

    // Log admin action
    await logAdminAction({
      adminEmail: session.user.email,
      action: 'UPDATE_COURSE',
      target: updatedCourse.id,
      details: { 
        courseTitle: updatedCourse.title,
        changes
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

// DELETE /api/admin/courses/[id] - Delete course
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'غير مصرح بالوصول - يجب تسجيل الدخول' },
        { status: 401 }
      );
    }

    // Check admin permissions
    const isAdmin = await isServerAdmin(session.user.email);
    if (!isAdmin) {
      await logAdminAction({
        adminEmail: session.user.email,
        action: 'UNAUTHORIZED_ACCESS_ATTEMPT',
        target: `admin_course_delete_${params.id}`,
        details: { ip: request.ip, userAgent: request.headers.get('user-agent') },
        timestamp: new Date()
      });
      
      return NextResponse.json(
        { error: 'غير مصرح بالوصول - صلاحيات المدير مطلوبة' },
        { status: 403 }
      );
    }

    // Find course
    const courseIndex = mockCourses.findIndex(c => c.id === params.id);
    if (courseIndex === -1) {
      return NextResponse.json(
        { error: 'الكورس غير موجود' },
        { status: 404 }
      );
    }

    const courseToDelete = mockCourses[courseIndex];

    // Check if course has enrolled students (in a real app)
    // const enrolledStudents = await db.enrollments.count({ courseId: params.id });
    // if (enrolledStudents > 0) {
    //   return NextResponse.json(
    //     { error: 'لا يمكن حذف كورس يحتوي على طلاب مسجلين' },
    //     { status: 400 }
    //   );
    // }

    // Delete course
    // In a real app, delete from database
    // await db.courses.delete(params.id);
    mockCourses.splice(courseIndex, 1);

    // Log admin action
    await logAdminAction({
      adminEmail: session.user.email,
      action: 'DELETE_COURSE',
      target: courseToDelete.id,
      details: { 
        courseTitle: courseToDelete.title,
        price: courseToDelete.price,
        wasPublished: courseToDelete.published
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