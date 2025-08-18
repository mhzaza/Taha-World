import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { isServerAdmin, logAdminAction } from '@/lib/admin';
import { getClientIP } from '@/lib/utils';

// Mock data - replace with actual database calls
const mockOrders = [
  {
    id: 'order-1',
    userId: 'user-1',
    userEmail: 'ahmed@example.com',
    userName: 'أحمد محمد',
    courseId: 'course-1',
    courseTitle: 'كورس تدريب كمال الأجسام المتقدم',
    amount: 299,
    currency: 'USD',
    status: 'completed',
    paymentMethod: 'paypal',
    paymentId: 'PAYID-123456',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:35:00Z',
    completedAt: '2024-01-15T10:35:00Z'
  },
  {
    id: 'order-2',
    userId: 'user-2',
    userEmail: 'sara@example.com',
    userName: 'سارة أحمد',
    courseId: 'course-2',
    courseTitle: 'كورس تدريب المصارعة للمبتدئين',
    amount: 199,
    currency: 'USD',
    status: 'pending',
    paymentMethod: 'paypal',
    paymentId: 'PAYID-789012',
    createdAt: '2024-01-14T15:45:00Z',
    updatedAt: '2024-01-14T15:45:00Z'
  },
  {
    id: 'order-3',
    userId: 'user-3',
    userEmail: 'omar@example.com',
    userName: 'عمر خالد',
    courseId: 'course-3',
    courseTitle: 'كورس التغذية الرياضية',
    amount: 149,
    currency: 'USD',
    status: 'failed',
    paymentMethod: 'paypal',
    paymentId: 'PAYID-345678',
    createdAt: '2024-01-13T12:00:00Z',
    updatedAt: '2024-01-13T12:05:00Z',
    failureReason: 'Payment declined by bank'
  },
  {
    id: 'order-4',
    userId: 'user-4',
    userEmail: 'fatima@example.com',
    userName: 'فاطمة علي',
    courseId: 'course-4',
    courseTitle: 'كورس تدريب الملاكمة',
    amount: 249,
    currency: 'USD',
    status: 'refunded',
    paymentMethod: 'paypal',
    paymentId: 'PAYID-901234',
    createdAt: '2024-01-12T08:20:00Z',
    updatedAt: '2024-01-12T16:30:00Z',
    completedAt: '2024-01-12T08:25:00Z',
    refundedAt: '2024-01-12T16:30:00Z',
    refundReason: 'Customer request'
  },
  {
    id: 'order-5',
    userId: 'user-5',
    userEmail: 'hassan@example.com',
    userName: 'حسن محمود',
    courseId: 'course-1',
    courseTitle: 'كورس تدريب كمال الأجسام المتقدم',
    amount: 299,
    currency: 'USD',
    status: 'cancelled',
    paymentMethod: 'paypal',
    paymentId: 'PAYID-567890',
    createdAt: '2024-01-11T14:10:00Z',
    updatedAt: '2024-01-11T14:15:00Z',
    cancelledAt: '2024-01-11T14:15:00Z',
    cancellationReason: 'User cancelled'
  }
];

// GET /api/admin/orders - List all orders
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
        target: 'admin_orders_list',
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
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Filter orders
    let filteredOrders = mockOrders.filter(order => {
      // Search filter
      const searchMatch = search === '' || 
        order.userEmail.toLowerCase().includes(search.toLowerCase()) ||
        order.userName.toLowerCase().includes(search.toLowerCase()) ||
        order.courseTitle.toLowerCase().includes(search.toLowerCase()) ||
        order.id.toLowerCase().includes(search.toLowerCase());
      
      // Status filter
      const statusMatch = status === 'all' || order.status === status;
      
      // Date range filter
      let dateMatch = true;
      if (dateFrom || dateTo) {
        const orderDate = new Date(order.createdAt);
        if (dateFrom) {
          dateMatch = dateMatch && orderDate >= new Date(dateFrom);
        }
        if (dateTo) {
          dateMatch = dateMatch && orderDate <= new Date(dateTo + 'T23:59:59.999Z');
        }
      }
      
      return searchMatch && statusMatch && dateMatch;
    });

    // Sort orders
    filteredOrders.sort((a: any, b: any) => {
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
    const paginatedOrders = filteredOrders.slice(startIndex, startIndex + limit);
    const totalPages = Math.ceil(filteredOrders.length / limit);

    // Calculate statistics
    const stats = {
      totalOrders: filteredOrders.length,
      totalRevenue: filteredOrders
        .filter(order => order.status === 'completed')
        .reduce((sum, order) => sum + order.amount, 0),
      completedOrders: filteredOrders.filter(order => order.status === 'completed').length,
      pendingOrders: filteredOrders.filter(order => order.status === 'pending').length,
      failedOrders: filteredOrders.filter(order => order.status === 'failed').length,
      refundedOrders: filteredOrders.filter(order => order.status === 'refunded').length,
      cancelledOrders: filteredOrders.filter(order => order.status === 'cancelled').length
    };

    // Log admin action
    await logAdminAction({
      adminEmail: session.user.email,
      action: 'VIEW_ORDERS_LIST',
      target: 'admin_orders',
      details: { 
        filters: { search, status, dateFrom, dateTo, page, limit, sortBy, sortOrder },
        resultCount: paginatedOrders.length
      },
      timestamp: new Date()
    });

    return NextResponse.json({
      orders: paginatedOrders,
      stats,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: filteredOrders.length,
        itemsPerPage: limit
      }
    });

  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'خطأ في الخادم الداخلي' },
      { status: 500 }
    );
  }
}

// POST /api/admin/orders - Create manual order (admin only)
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
        target: 'admin_orders_create',
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
      userId,
      userEmail,
      userName,
      courseId,
      courseTitle,
      amount,
      currency = 'USD',
      status = 'completed',
      paymentMethod = 'manual',
      notes
    } = body;

    // Validate required fields
    if (!userId || !userEmail || !userName || !courseId || !courseTitle || !amount) {
      return NextResponse.json(
        { error: 'الحقول المطلوبة مفقودة' },
        { status: 400 }
      );
    }

    // Validate amount
    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'المبلغ يجب أن يكون رقم موجب' },
        { status: 400 }
      );
    }

    // Create new order
    const newOrder = {
      id: `order-${Date.now()}`,
      userId,
      userEmail,
      userName,
      courseId,
      courseTitle,
      amount,
      currency,
      status,
      paymentMethod,
      paymentId: `MANUAL-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...(status === 'completed' && { completedAt: new Date().toISOString() }),
      ...(notes && { notes })
    };

    // In a real app, save to database
    // await db.orders.create(newOrder);
    
    // Log admin action
    await logAdminAction({
      adminEmail: session.user.email,
      action: 'CREATE_MANUAL_ORDER',
      target: newOrder.id,
      details: { 
        userEmail: newOrder.userEmail,
        courseTitle: newOrder.courseTitle,
        amount: newOrder.amount,
        status: newOrder.status
      },
      timestamp: new Date()
    });

    return NextResponse.json(
      { 
        message: 'تم إنشاء الطلب بنجاح',
        order: newOrder
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'خطأ في الخادم الداخلي' },
      { status: 500 }
    );
  }
}