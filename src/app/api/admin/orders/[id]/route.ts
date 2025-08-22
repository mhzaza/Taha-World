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
  }
];

// GET /api/admin/orders/[id] - Get specific order
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
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
        target: `admin_order_${params.id}`,
        details: { ip: getClientIP(request), userAgent: request.headers.get('user-agent') },
        timestamp: new Date()
      });
      
      return NextResponse.json(
        { error: 'غير مصرح بالوصول - صلاحيات المدير مطلوبة' },
        { status: 403 }
      );
    }

    // Find order
    const order = mockOrders.find(o => o.id === params.id);
    if (!order) {
      return NextResponse.json(
        { error: 'الطلب غير موجود' },
        { status: 404 }
      );
    }

    // Log admin action
    await logAdminAction({
      adminEmail: session.user.email,
      action: 'VIEW_ORDER_DETAILS',
      target: params.id,
      details: { 
        userEmail: order.userEmail,
        courseTitle: order.courseTitle,
        amount: order.amount,
        status: order.status
      },
      timestamp: new Date()
    });

    return NextResponse.json({ order });

  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'خطأ في الخادم الداخلي' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/orders/[id] - Update order
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
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
        target: `admin_order_update_${params.id}`,
        details: { ip: getClientIP(request), userAgent: request.headers.get('user-agent') },
        timestamp: new Date()
      });
      
      return NextResponse.json(
        { error: 'غير مصرح بالوصول - صلاحيات المدير مطلوبة' },
        { status: 403 }
      );
    }

    // Find order
    const orderIndex = mockOrders.findIndex(o => o.id === params.id);
    if (orderIndex === -1) {
      return NextResponse.json(
        { error: 'الطلب غير موجود' },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { status, notes, refundReason, cancellationReason } = body;

    // Validate status
    const validStatuses = ['pending', 'completed', 'failed', 'refunded', 'cancelled'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'حالة الطلب غير صحيحة' },
        { status: 400 }
      );
    }

    const currentOrder = mockOrders[orderIndex];
    const oldStatus = currentOrder.status;
    
    // Update order
    const updatedOrder = {
      ...currentOrder,
      ...(status && { status }),
      ...(notes && { notes }),
      updatedAt: new Date().toISOString(),
      ...(status === 'completed' && !currentOrder.completedAt && { 
        completedAt: new Date().toISOString() 
      }),
      ...(status === 'refunded' && { 
        refundedAt: new Date().toISOString(),
        ...(refundReason && { refundReason })
      }),
      ...(status === 'cancelled' && { 
        cancelledAt: new Date().toISOString(),
        ...(cancellationReason && { cancellationReason })
      })
    };

    // In a real app, update in database
    // await db.orders.update(params.id, updatedOrder);
    mockOrders[orderIndex] = updatedOrder;

    // Log admin action
    await logAdminAction({
      adminEmail: session.user.email,
      action: 'UPDATE_ORDER',
      target: params.id,
      details: { 
        oldStatus,
        newStatus: status,
        userEmail: updatedOrder.userEmail,
        courseTitle: updatedOrder.courseTitle,
        amount: updatedOrder.amount,
        changes: body
      },
      timestamp: new Date()
    });

    return NextResponse.json({
      message: 'تم تحديث الطلب بنجاح',
      order: updatedOrder
    });

  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'خطأ في الخادم الداخلي' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/orders/[id] - Delete order (admin only, use with caution)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
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
        target: `admin_order_delete_${params.id}`,
        details: { ip: getClientIP(request), userAgent: request.headers.get('user-agent') },
        timestamp: new Date()
      });
      
      return NextResponse.json(
        { error: 'غير مصرح بالوصول - صلاحيات المدير مطلوبة' },
        { status: 403 }
      );
    }

    // Find order
    const orderIndex = mockOrders.findIndex(o => o.id === params.id);
    if (orderIndex === -1) {
      return NextResponse.json(
        { error: 'الطلب غير موجود' },
        { status: 404 }
      );
    }

    const orderToDelete = mockOrders[orderIndex];

    // Check if order can be deleted (business logic)
    if (orderToDelete.status === 'completed') {
      return NextResponse.json(
        { error: 'لا يمكن حذف طلب مكتمل. يرجى إلغاؤه أو استرداده بدلاً من ذلك' },
        { status: 400 }
      );
    }

    // In a real app, soft delete or move to archive
    // await db.orders.softDelete(params.id);
    mockOrders.splice(orderIndex, 1);

    // Log admin action
    await logAdminAction({
      adminEmail: session.user.email,
      action: 'DELETE_ORDER',
      target: params.id,
      details: { 
        userEmail: orderToDelete.userEmail,
        courseTitle: orderToDelete.courseTitle,
        amount: orderToDelete.amount,
        status: orderToDelete.status,
        deletedOrder: orderToDelete
      },
      timestamp: new Date()
    });

    return NextResponse.json({
      message: 'تم حذف الطلب بنجاح'
    });

  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json(
      { error: 'خطأ في الخادم الداخلي' },
      { status: 500 }
    );
  }
}