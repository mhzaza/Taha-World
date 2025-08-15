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

// GET /api/admin/courses - List all courses
export async function GET(request: NextRequest) {
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
        target: 'admin_courses_list',
        details: { ip: request.ip, userAgent: request.headers.get('user-agent') },
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
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Filter courses
    let filteredCourses = mockCourses.filter(course => {
      const searchMatch = search === '' || 
        course.title.toLowerCase().includes(search.toLowerCase()) ||
        course.instructor.toLowerCase().includes(search.toLowerCase());
      
      const statusMatch = status === 'all' || 
        (status === 'published' && course.published) ||
        (status === 'draft' && !course.published);
      
      return searchMatch && statusMatch;
    });

    // Sort courses
    filteredCourses.sort((a: any, b: any) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    // Paginate
    const startIndex = (page - 1) * limit;
    const paginatedCourses = filteredCourses.slice(startIndex, startIndex + limit);
    const totalPages = Math.ceil(filteredCourses.length / limit);

    // Log admin action
    await logAdminAction({
      adminEmail: session.user.email,
      action: 'VIEW_COURSES_LIST',
      target: 'admin_courses',
      details: { 
        filters: { search, status, page, limit, sortBy, sortOrder },
        resultCount: paginatedCourses.length
      },
      timestamp: new Date()
    });

    return NextResponse.json({
      courses: paginatedCourses,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: filteredCourses.length,
        itemsPerPage: limit
      }
    });

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
        target: 'admin_courses_create',
        details: { ip: request.ip, userAgent: request.headers.get('user-agent') },
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
      instructor: instructor.trim(),
      thumbnail: thumbnail || '',
      lessons: lessons || [],
      published,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // In a real app, save to database
    // await db.courses.create(newCourse);
    
    // Log admin action
    await logAdminAction({
      adminEmail: session.user.email,
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