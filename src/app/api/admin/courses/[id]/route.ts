import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { adminDb } from '@/lib/firebase-admin';
import { isServerAdmin, logAdminAction } from '@/lib/admin';
import { getClientIP } from '@/lib/utils';
import { Timestamp } from 'firebase-admin/firestore';



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
    console.log('GET request for course ID:', params.id);
    
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      console.log('Authentication failed: No session or email');
      return NextResponse.json(
        { error: 'غير مصرح بالوصول - يجب تسجيل الدخول' },
        { status: 401 }
      );
    }

    // Check admin permissions
    const isAdmin = await isServerAdmin(session.user.email);
    if (!isAdmin) {
      console.log('Authorization failed: User is not admin', session.user.email);
      await logAdminAction({
        adminEmail: session.user.email,
        action: 'UNAUTHORIZED_ACCESS_ATTEMPT',
        target: `admin_course_${params.id}`,
        details: { ip: getClientIP(request), userAgent: request.headers.get('user-agent') },
        timestamp: Timestamp.fromDate(new Date())
      });
      
      return NextResponse.json(
        { error: 'غير مصرح بالوصول - صلاحيات المدير مطلوبة' },
        { status: 403 }
      );
    }
    
    console.log('Authentication and authorization successful');

    // Find course in Firestore
    try {
      console.log('Fetching course with ID:', params.id);
      
      // Try to get all courses first to debug
      console.log('Listing all courses for debugging:');
      const allCoursesSnapshot = await adminDb.collection('courses').get();
      console.log(`Found ${allCoursesSnapshot.size} courses in total`);
      
      // Log the first few courses
      allCoursesSnapshot.docs.slice(0, 5).forEach((doc, index) => {
        console.log(`Course ${index + 1}:`, { id: doc.id, ...doc.data() });
      });
      
      // Try to get the course directly
      console.log('Attempting to fetch course directly with ID:', params.id);
      const courseDoc = await adminDb.collection('courses').doc(params.id).get();
      
      if (!courseDoc.exists) {
        console.log('Course not found with direct ID, trying to query by ID');
        
        // Try with numeric ID
        let numericId = params.id;
        if (!isNaN(Number(params.id))) {
          numericId = Number(params.id).toString();
          console.log('Converting to numeric ID:', numericId);
        }
        
        // If not found, try to query by ID field in case the ID is stored differently
        console.log('Querying by ID field with value:', numericId);
        const coursesQuery = await adminDb.collection('courses')
          .where('id', '==', numericId)
          .limit(1)
          .get();
        
        console.log('Query results:', coursesQuery.size);
        
        if (coursesQuery.empty) {
          console.log('Course not found in query either, trying with string ID');
          
          // Try with string ID
          const stringQuery = await adminDb.collection('courses')
            .where('id', '==', params.id.toString())
            .limit(1)
            .get();
            
          console.log('String query results:', stringQuery.size);
          
          if (stringQuery.empty) {
            console.log('Course not found with any ID format');
            return NextResponse.json(
              { error: 'الكورس غير موجود' },
              { status: 404 }
            );
          }
          
          // Use the first matching document from string query
          const stringDoc = stringQuery.docs[0];
          const stringCourse = {
            id: stringDoc.id,
            ...stringDoc.data()
          };
          
          console.log('Course found via string query:', stringCourse.id);
          
          // Log admin action
          await logAdminAction({
            adminEmail: session.user.email,
            action: 'VIEW_COURSE_DETAILS',
            target: stringCourse.id,
            details: { courseTitle: (stringCourse as any).title },
            timestamp: new Date()
          });
          
          return NextResponse.json({ course: stringCourse });
        }
        
        // Use the first matching document
        const queryDoc = coursesQuery.docs[0];
        const course = {
          id: queryDoc.id,
          ...queryDoc.data()
        };
        
        console.log('Course found via numeric query:', course.id);
        
        // Log admin action
        await logAdminAction({
          adminEmail: session.user.email,
          action: 'VIEW_COURSE_DETAILS',
          target: course.id,
          details: { courseTitle: course.title },
          timestamp: new Date()
        });
        
        return NextResponse.json({ course });
      }
      
      // If found directly
      const course = {
        id: courseDoc.id,
        ...courseDoc.data()
      };
      
      console.log('Course found directly:', course.id);

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
      console.error('Error fetching course from Firestore:', error);
      return NextResponse.json(
        { error: 'خطأ في جلب بيانات الكورس' },
        { status: 500 }
      );
    }

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
        details: { ip: getClientIP(request), userAgent: request.headers.get('user-agent') },
        timestamp: new Date()
      });
      
      return NextResponse.json(
        { error: 'غير مصرح بالوصول - صلاحيات المدير مطلوبة' },
        { status: 403 }
      );
    }

    // Check if course exists in Firestore
    const courseRef = adminDb.collection('courses').doc(params.id);
    const courseDoc = await courseRef.get();
    
    if (!courseDoc.exists) {
      return NextResponse.json(
        { error: 'الكورس غير موجود' },
        { status: 404 }
      );
    }

    const existingCourse = {
      id: courseDoc.id,
      ...courseDoc.data()
    };

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

    // Update in Firestore
    await courseRef.update(updatedCourse);

    // Get the updated document for response
    const updatedDoc = await courseRef.get();
    const updatedCourseData = {
      id: updatedDoc.id,
      ...updatedDoc.data()
    };

    // Log admin action
    await logAdminAction({
      adminEmail: session.user.email,
      action: 'UPDATE_COURSE',
      target: params.id,
      details: { 
        courseTitle: updatedCourseData.title,
        changes
      },
      timestamp: new Date()
    });

    return NextResponse.json({
      message: 'تم تحديث الكورس بنجاح',
      course: updatedCourseData
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
        details: { ip: getClientIP(request), userAgent: request.headers.get('user-agent') },
        timestamp: new Date()
      });
      
      return NextResponse.json(
        { error: 'غير مصرح بالوصول - صلاحيات المدير مطلوبة' },
        { status: 403 }
      );
    }

    // Check if course exists in Firestore
    const courseRef = adminDb.collection('courses').doc(params.id);
    const courseDoc = await courseRef.get();
    
    if (!courseDoc.exists) {
      return NextResponse.json(
        { error: 'الكورس غير موجود' },
        { status: 404 }
      );
    }

    const courseToDelete = {
      id: courseDoc.id,
      ...courseDoc.data()
    };

    // Check if course has enrolled students (optional)
    // You can implement this check if needed

    // Delete course from Firestore
    await courseRef.delete();

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