import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { isServerAdmin, logAdminAction } from '@/lib/admin';
import { getClientIP } from '@/lib/utils';

// Mock data - replace with actual database calls
const mockUsers = [
  {
    id: 'user-1',
    email: 'ahmed@example.com',
    name: 'أحمد محمد',
    image: null,
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    lastLoginAt: '2024-01-15T09:00:00Z',
    status: 'active',
    emailVerified: true,
    enrolledCourses: ['course-1', 'course-3'],
    completedCourses: ['course-3'],
    totalSpent: 448,
    notes: 'عضو نشط ومتفاعل',
    provider: 'google'
  },
  {
    id: 'user-2',
    email: 'sara@example.com',
    name: 'سارة أحمد',
    image: null,
    createdAt: '2024-01-08T14:20:00Z',
    updatedAt: '2024-01-14T15:45:00Z',
    lastLoginAt: '2024-01-14T15:00:00Z',
    status: 'active',
    emailVerified: true,
    enrolledCourses: ['course-2'],
    completedCourses: [],
    totalSpent: 199,
    notes: null,
    provider: 'email'
  }
];

const mockCourses = [
  { id: 'course-1', title: 'كورس تدريب كمال الأجسام المتقدم', price: 299 },
  { id: 'course-2', title: 'كورس تدريب المصارعة للمبتدئين', price: 199 },
  { id: 'course-3', title: 'كورس التغذية الرياضية', price: 149 },
  { id: 'course-4', title: 'كورس تدريب الملاكمة', price: 249 }
];

// GET /api/admin/users/[id] - Get specific user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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
        target: `admin_user_${id}`,
        details: { ip: getClientIP(request), userAgent: request.headers.get('user-agent') }
      });
      
      return NextResponse.json(
        { error: 'غير مصرح بالوصول - صلاحيات المدير مطلوبة' },
        { status: 403 }
      );
    }

    // Find user
    const user = mockUsers.find(u => u.id === id);
    if (!user) {
      return NextResponse.json(
        { error: 'المستخدم غير موجود' },
        { status: 404 }
      );
    }

    // Add course details
    const userWithCourseDetails = {
      ...user,
      enrolledCoursesDetails: user.enrolledCourses.map(courseId => 
        mockCourses.find(course => course.id === courseId)
      ).filter(Boolean),
      completedCoursesDetails: user.completedCourses.map(courseId => 
        mockCourses.find(course => course.id === courseId)
      ).filter(Boolean)
    };

    // Log admin action
    await logAdminAction({
      adminEmail: session.user.email,
      action: 'VIEW_USER_DETAILS',
      target: id,
      details: { 
        userEmail: user.email,
        userName: user.name,
        status: user.status,
        enrolledCoursesCount: user.enrolledCourses.length
      }
    });

    return NextResponse.json({ user: userWithCourseDetails });

  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'خطأ في الخادم الداخلي' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/users/[id] - Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
        target: `admin_user_update_${id}`,
        details: { ip: getClientIP(request), userAgent: request.headers.get('user-agent') }
      });
      
      return NextResponse.json(
        { error: 'غير مصرح بالوصول - صلاحيات المدير مطلوبة' },
        { status: 403 }
      );
    }

    // Find user
    const userIndex = mockUsers.findIndex(u => u.id === id);
    if (userIndex === -1) {
      return NextResponse.json(
        { error: 'المستخدم غير موجود' },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { 
      name, 
      status, 
      emailVerified, 
      notes, 
      enrollCourse, 
      unenrollCourse,
      completeCourse,
      uncompleteCourse
    } = body;

    const currentUser = mockUsers[userIndex];
    
    // Validate status
    if (status) {
      const validStatuses = ['active', 'suspended', 'inactive'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: 'حالة المستخدم غير صحيحة' },
          { status: 400 }
        );
      }
    }

    // Handle course enrollment/unenrollment
    let updatedEnrolledCourses = [...currentUser.enrolledCourses];
    let updatedCompletedCourses = [...currentUser.completedCourses];
    
    if (enrollCourse) {
      // Check if course exists
      const courseExists = mockCourses.find(course => course.id === enrollCourse);
      if (!courseExists) {
        return NextResponse.json(
          { error: 'الكورس غير موجود' },
          { status: 400 }
        );
      }
      
      // Add to enrolled courses if not already enrolled
      if (!updatedEnrolledCourses.includes(enrollCourse)) {
        updatedEnrolledCourses.push(enrollCourse);
      }
    }
    
    if (unenrollCourse) {
      // Remove from enrolled courses
      updatedEnrolledCourses = updatedEnrolledCourses.filter(id => id !== unenrollCourse);
      // Also remove from completed courses
      updatedCompletedCourses = updatedCompletedCourses.filter(id => id !== unenrollCourse);
    }
    
    if (completeCourse) {
      // Check if user is enrolled in the course
      if (!updatedEnrolledCourses.includes(completeCourse)) {
        return NextResponse.json(
          { error: 'المستخدم غير مسجل في هذا الكورس' },
          { status: 400 }
        );
      }
      
      // Add to completed courses if not already completed
      if (!updatedCompletedCourses.includes(completeCourse)) {
        updatedCompletedCourses.push(completeCourse);
      }
    }
    
    if (uncompleteCourse) {
      // Remove from completed courses
      updatedCompletedCourses = updatedCompletedCourses.filter(id => id !== uncompleteCourse);
    }

    // Update user
    const updatedUser = {
      ...currentUser,
      ...(name && { name }),
      ...(status && { status }),
      ...(typeof emailVerified === 'boolean' && { emailVerified }),
      ...(notes !== undefined && { notes }),
      enrolledCourses: updatedEnrolledCourses,
      completedCourses: updatedCompletedCourses,
      updatedAt: new Date().toISOString()
    };

    // In a real app, update in database
    // await db.users.update(id, updatedUser);
    mockUsers[userIndex] = updatedUser;

    // Log admin action
    const actionDetails: any = {
      userEmail: updatedUser.email,
      userName: updatedUser.name,
      changes: {}
    };
    
    if (name && name !== currentUser.name) actionDetails.changes.name = { from: currentUser.name, to: name };
    if (status && status !== currentUser.status) actionDetails.changes.status = { from: currentUser.status, to: status };
    if (typeof emailVerified === 'boolean' && emailVerified !== currentUser.emailVerified) {
      actionDetails.changes.emailVerified = { from: currentUser.emailVerified, to: emailVerified };
    }
    if (enrollCourse) actionDetails.changes.enrolledCourse = enrollCourse;
    if (unenrollCourse) actionDetails.changes.unenrolledCourse = unenrollCourse;
    if (completeCourse) actionDetails.changes.completedCourse = completeCourse;
    if (uncompleteCourse) actionDetails.changes.uncompletedCourse = uncompleteCourse;
    if (notes !== undefined) actionDetails.changes.notes = { from: currentUser.notes, to: notes };

    await logAdminAction({
      adminEmail: session.user.email,
      action: 'UPDATE_USER',
      target: id,
      details: actionDetails
    });

    // Add course details to response
    const userWithCourseDetails = {
      ...updatedUser,
      enrolledCoursesDetails: updatedUser.enrolledCourses.map((courseId: string) => 
        mockCourses.find(course => course.id === courseId)
      ).filter(Boolean),
      completedCoursesDetails: updatedUser.completedCourses.map((courseId: string) => 
        mockCourses.find(course => course.id === courseId)
      ).filter(Boolean)
    };

    return NextResponse.json({
      message: 'تم تحديث المستخدم بنجاح',
      user: userWithCourseDetails
    });

  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'خطأ في الخادم الداخلي' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/users/[id] - Delete user (admin only, use with caution)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
        target: `admin_user_delete_${id}`,
        details: { ip: getClientIP(request), userAgent: request.headers.get('user-agent') }
      });
      
      return NextResponse.json(
        { error: 'غير مصرح بالوصول - صلاحيات المدير مطلوبة' },
        { status: 403 }
      );
    }

    // Find user
    const userIndex = mockUsers.findIndex(u => u.id === id);
    if (userIndex === -1) {
      return NextResponse.json(
        { error: 'المستخدم غير موجود' },
        { status: 404 }
      );
    }

    const userToDelete = mockUsers[userIndex];

    // Check if user has active enrollments or purchases
    if (userToDelete.enrolledCourses.length > 0 || userToDelete.totalSpent > 0) {
      return NextResponse.json(
        { error: 'لا يمكن حذف مستخدم لديه كورسات مسجلة أو مشتريات. يرجى إيقاف الحساب بدلاً من ذلك' },
        { status: 400 }
      );
    }

    // In a real app, soft delete or anonymize user data
    // await db.users.softDelete(id);
    mockUsers.splice(userIndex, 1);

    // Log admin action
    await logAdminAction({
      adminEmail: session.user.email,
      action: 'DELETE_USER',
      target: id,
      details: { 
        userEmail: userToDelete.email,
        userName: userToDelete.name,
        status: userToDelete.status,
        enrolledCoursesCount: userToDelete.enrolledCourses.length,
        totalSpent: userToDelete.totalSpent,
        deletedUser: {
          id: userToDelete.id,
          email: userToDelete.email,
          name: userToDelete.name,
          createdAt: userToDelete.createdAt
        }
      }
    });

    return NextResponse.json({
      message: 'تم حذف المستخدم بنجاح'
    });

  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'خطأ في الخادم الداخلي' },
      { status: 500 }
    );
  }
}