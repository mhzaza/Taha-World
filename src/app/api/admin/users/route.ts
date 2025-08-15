import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { isServerAdmin, logAdminAction } from '@/lib/admin';

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
  },
  {
    id: 'user-3',
    email: 'omar@example.com',
    name: 'عمر خالد',
    image: null,
    createdAt: '2024-01-05T11:30:00Z',
    updatedAt: '2024-01-13T12:00:00Z',
    lastLoginAt: '2024-01-12T16:45:00Z',
    status: 'suspended',
    emailVerified: true,
    enrolledCourses: [],
    completedCourses: [],
    totalSpent: 0,
    notes: 'تم إيقاف الحساب بسبب انتهاك الشروط',
    provider: 'google'
  },
  {
    id: 'user-4',
    email: 'fatima@example.com',
    name: 'فاطمة علي',
    image: null,
    createdAt: '2024-01-03T09:15:00Z',
    updatedAt: '2024-01-12T16:30:00Z',
    lastLoginAt: '2024-01-11T20:00:00Z',
    status: 'active',
    emailVerified: false,
    enrolledCourses: ['course-4'],
    completedCourses: [],
    totalSpent: 249,
    notes: 'لم يتم تأكيد البريد الإلكتروني',
    provider: 'email'
  },
  {
    id: 'user-5',
    email: 'hassan@example.com',
    name: 'حسن محمود',
    image: null,
    createdAt: '2024-01-01T12:00:00Z',
    updatedAt: '2024-01-11T14:15:00Z',
    lastLoginAt: '2024-01-10T18:30:00Z',
    status: 'inactive',
    emailVerified: true,
    enrolledCourses: [],
    completedCourses: [],
    totalSpent: 0,
    notes: 'لم يسجل دخول منذ فترة طويلة',
    provider: 'google'
  }
];

const mockCourses = [
  { id: 'course-1', title: 'كورس تدريب كمال الأجسام المتقدم', price: 299 },
  { id: 'course-2', title: 'كورس تدريب المصارعة للمبتدئين', price: 199 },
  { id: 'course-3', title: 'كورس التغذية الرياضية', price: 149 },
  { id: 'course-4', title: 'كورس تدريب الملاكمة', price: 249 }
];

// GET /api/admin/users - List all users
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
        target: 'admin_users_list',
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
    const emailVerified = searchParams.get('emailVerified');
    const provider = searchParams.get('provider') || 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Filter users
    let filteredUsers = mockUsers.filter(user => {
      // Search filter
      const searchMatch = search === '' || 
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.id.toLowerCase().includes(search.toLowerCase());
      
      // Status filter
      const statusMatch = status === 'all' || user.status === status;
      
      // Email verified filter
      let emailVerifiedMatch = true;
      if (emailVerified === 'true') {
        emailVerifiedMatch = user.emailVerified === true;
      } else if (emailVerified === 'false') {
        emailVerifiedMatch = user.emailVerified === false;
      }
      
      // Provider filter
      const providerMatch = provider === 'all' || user.provider === provider;
      
      return searchMatch && statusMatch && emailVerifiedMatch && providerMatch;
    });

    // Sort users
    filteredUsers.sort((a: any, b: any) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'createdAt' || sortBy === 'updatedAt' || sortBy === 'lastLoginAt') {
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
    const paginatedUsers = filteredUsers.slice(startIndex, startIndex + limit);
    const totalPages = Math.ceil(filteredUsers.length / limit);

    // Calculate statistics
    const stats = {
      totalUsers: filteredUsers.length,
      activeUsers: filteredUsers.filter(user => user.status === 'active').length,
      suspendedUsers: filteredUsers.filter(user => user.status === 'suspended').length,
      inactiveUsers: filteredUsers.filter(user => user.status === 'inactive').length,
      verifiedUsers: filteredUsers.filter(user => user.emailVerified).length,
      unverifiedUsers: filteredUsers.filter(user => !user.emailVerified).length,
      totalRevenue: filteredUsers.reduce((sum, user) => sum + user.totalSpent, 0),
      averageSpent: filteredUsers.length > 0 
        ? filteredUsers.reduce((sum, user) => sum + user.totalSpent, 0) / filteredUsers.length 
        : 0
    };

    // Add course details to users
    const usersWithCourseDetails = paginatedUsers.map(user => ({
      ...user,
      enrolledCoursesDetails: user.enrolledCourses.map(courseId => 
        mockCourses.find(course => course.id === courseId)
      ).filter(Boolean),
      completedCoursesDetails: user.completedCourses.map(courseId => 
        mockCourses.find(course => course.id === courseId)
      ).filter(Boolean)
    }));

    // Log admin action
    await logAdminAction({
      adminEmail: session.user.email,
      action: 'VIEW_USERS_LIST',
      target: 'admin_users',
      details: { 
        filters: { search, status, emailVerified, provider, page, limit, sortBy, sortOrder },
        resultCount: paginatedUsers.length
      },
      timestamp: new Date()
    });

    return NextResponse.json({
      users: usersWithCourseDetails,
      stats,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: filteredUsers.length,
        itemsPerPage: limit
      }
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'خطأ في الخادم الداخلي' },
      { status: 500 }
    );
  }
}

// POST /api/admin/users - Create user (admin only)
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
        target: 'admin_users_create',
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
      email,
      name,
      status = 'active',
      emailVerified = false,
      provider = 'email',
      notes
    } = body;

    // Validate required fields
    if (!email || !name) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني والاسم مطلوبان' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'تنسيق البريد الإلكتروني غير صحيح' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = mockUsers.find(user => user.email === email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'المستخدم موجود بالفعل' },
        { status: 409 }
      );
    }

    // Create new user
    const newUser = {
      id: `user-${Date.now()}`,
      email,
      name,
      image: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLoginAt: null,
      status,
      emailVerified,
      enrolledCourses: [],
      completedCourses: [],
      totalSpent: 0,
      provider,
      ...(notes && { notes })
    };

    // In a real app, save to database
    // await db.users.create(newUser);
    mockUsers.push(newUser);
    
    // Log admin action
    await logAdminAction({
      adminEmail: session.user.email,
      action: 'CREATE_USER',
      target: newUser.id,
      details: { 
        userEmail: newUser.email,
        userName: newUser.name,
        status: newUser.status,
        provider: newUser.provider
      },
      timestamp: new Date()
    });

    return NextResponse.json(
      { 
        message: 'تم إنشاء المستخدم بنجاح',
        user: newUser
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'خطأ في الخادم الداخلي' },
      { status: 500 }
    );
  }
}