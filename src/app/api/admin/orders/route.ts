// app/api/admin/orders/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { isServerAdmin, logAdminAction } from '@/lib/admin';
import { getClientIP } from '@/lib/utils';

export const dynamic = 'force-dynamic';

type OrderStatus = 'completed' | 'pending' | 'failed' | 'refunded' | 'cancelled';
interface Order {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  courseId: string;
  courseTitle: string;
  amount: number;
  currency: string;
  status: OrderStatus;
  paymentMethod: string;
  paymentId: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  refundedAt?: string;
  refundReason?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  failureReason?: string;
  notes?: string;
}

// Mock data
const mockOrders: Order[] = [
  // ... نفس البيانات كما أرسلتها سابقًا ...
];

// Allowed filters
const ALLOWED_STATUSES = new Set<('all' | OrderStatus)>(['all','completed','pending','failed','refunded','cancelled']);
const ALLOWED_SORT_KEYS = new Set<keyof Order>([
  'createdAt','updatedAt','amount','status','userName','userEmail','courseTitle','id'
]);

function safeNumber(input: string | null, fallback: number, { min, max }: { min?: number; max?: number } = {}) {
  let n = Number(input);
  if (!Number.isFinite(n)) n = fallback;
  n = Math.floor(n);
  if (min !== undefined) n = Math.max(min, n);
  if (max !== undefined) n = Math.min(max, n);
  return n;
}

function parseDateRange(dateFrom: string | null, dateTo: string | null) {
  const fromMs = dateFrom ? Date.parse(dateFrom) : null;
  const toMs = dateTo ? Date.parse(`${dateTo}T23:59:59.999Z`) : null;
  return {
    fromMs: Number.isFinite(fromMs as number) ? (fromMs as number) : null,
    toMs: Number.isFinite(toMs as number) ? (toMs as number) : null
  };
}

function buildComparator(sortBy: keyof Order, sortOrder: 'asc' | 'desc') {
  const isDate = sortBy === 'createdAt' || sortBy === 'updatedAt';
  return (a: Order, b: Order) => {
    let av: any = a[sortBy] as any;
    let bv: any = b[sortBy] as any;

    if (isDate) {
      av = Number(new Date(av)) || 0;
      bv = Number(new Date(bv)) || 0;
    } else {
      if (typeof av === 'string') av = av.toLowerCase();
      if (typeof bv === 'string') bv = bv.toLowerCase();
    }

    if (av === bv) return 0;
    const res = av > bv ? 1 : -1;
    return sortOrder === 'asc' ? res : -res;
  };
}

function computeStats(orders: Order[]) {
  const completed = orders.filter(o => o.status === 'completed');
  const refunded  = orders.filter(o => o.status === 'refunded');
  const pending   = orders.filter(o => o.status === 'pending');
  const failed    = orders.filter(o => o.status === 'failed');
  const cancelled = orders.filter(o => o.status === 'cancelled');

  const grossRevenue = completed.reduce((s,o)=> s + (o.amount || 0), 0);
  const netRevenue   = grossRevenue - refunded.reduce((s,o)=> s + (o.amount || 0), 0);

  return {
    totalOrders: orders.length,
    completedOrders: completed.length,
    pendingOrders: pending.length,
    failedOrders: failed.length,
    refundedOrders: refunded.length,
    cancelledOrders: cancelled.length,
    grossRevenue,
    netRevenue
  };
}

// GET
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'غير مصرح بالوصول - يجب تسجيل الدخول' }, { status: 401 });
    }

    const isAdmin = await isServerAdmin(session.user.email);
    if (!isAdmin) {
      await logAdminAction({
        adminEmail: session.user.email,
        action: 'UNAUTHORIZED_ACCESS_ATTEMPT',
        target: 'admin_orders_list',
        details: { ip: getClientIP(request), userAgent: request.headers.get('user-agent') }
      });
      return NextResponse.json({ error: 'غير مصرح بالوصول - صلاحيات المدير مطلوبة' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = (searchParams.get('search') ?? '').trim();
    const rawStatus = (searchParams.get('status') ?? 'all').trim();
    const status = ALLOWED_STATUSES.has(rawStatus as any) ? (rawStatus as 'all' | OrderStatus) : 'all';

    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const { fromMs, toMs } = parseDateRange(dateFrom, dateTo);

    const page = safeNumber(searchParams.get('page'), 1, { min: 1 });
    const limit = safeNumber(searchParams.get('limit'), 50, { min: 1, max: 200 });

    const rawSortBy = searchParams.get('sortBy') as keyof Order | null;
    const sortBy: keyof Order = rawSortBy && ALLOWED_SORT_KEYS.has(rawSortBy) ? rawSortBy : 'createdAt';
    const sortOrder: 'asc' | 'desc' = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc';

    const q = search.toLowerCase();
    let filteredOrders = mockOrders.filter(order => {
      const searchMatch =
        q.length === 0 ||
        order.userEmail?.toLowerCase().includes(q) ||
        order.userName?.toLowerCase().includes(q) ||
        order.courseTitle?.toLowerCase().includes(q) ||
        order.id?.toLowerCase().includes(q);

      const statusMatch = status === 'all' || order.status === status;

      let dateMatch = true;
      if (fromMs || toMs) {
        const orderMs = Date.parse(order.createdAt);
        if (!Number.isFinite(orderMs)) return false;
        if (fromMs && orderMs < fromMs) dateMatch = false;
        if (toMs && orderMs > toMs) dateMatch = false;
      }

      return searchMatch && statusMatch && dateMatch;
    });

    filteredOrders.sort(buildComparator(sortBy, sortOrder));

    const startIndex = (page - 1) * limit;
    const paginatedOrders = filteredOrders.slice(startIndex, startIndex + limit);
    const totalPages = Math.ceil(filteredOrders.length / limit);

    const stats = computeStats(filteredOrders);

    await logAdminAction({
      adminEmail: session.user.email,
      action: 'VIEW_ORDERS_LIST',
      target: 'admin_orders',
      details: { filters: { search, status, dateFrom, dateTo, page, limit, sortBy, sortOrder }, resultCount: paginatedOrders.length }
    });

    return NextResponse.json({
      orders: paginatedOrders,
      stats,
      pagination: { currentPage: page, totalPages, totalItems: filteredOrders.length, itemsPerPage: limit },
      meta: { allowedStatuses: Array.from(ALLOWED_STATUSES), allowedSortKeys: Array.from(ALLOWED_SORT_KEYS), defaultSort: { sortBy: 'createdAt', sortOrder: 'desc' as const } }
    });

  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'خطأ في الخادم الداخلي' }, { status: 500 });
  }
}

// POST
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'غير مصرح بالوصول - يجب تسجيل الدخول' }, { status: 401 });
    }

    const isAdmin = await isServerAdmin(session.user.email);
    if (!isAdmin) {
      await logAdminAction({
        adminEmail: session.user.email,
        action: 'UNAUTHORIZED_ACCESS_ATTEMPT',
        target: 'admin_orders_create',
        details: { ip: getClientIP(request), userAgent: request.headers.get('user-agent') }
      });
      return NextResponse.json({ error: 'غير مصرح بالوصول - صلاحيات المدير مطلوبة' }, { status: 403 });
    }

    let body: Partial<Order> & { amount?: number; currency?: string; status?: OrderStatus; paymentMethod?: string; notes?: string; };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'صيغة الطلب غير صحيحة. تأكد من إرسال JSON صالح.' }, { status: 400 });
    }

    const { userId, userEmail, userName, courseId, courseTitle, amount, currency = 'USD', status = 'completed', paymentMethod = 'manual', notes } = body;

    if (!userId || !userEmail || !userName || !courseId || !courseTitle || amount === undefined) {
      return NextResponse.json({ error: 'الحقول المطلوبة مفقودة' }, { status: 400 });
    }
    if (typeof amount !== 'number' || !(amount > 0)) {
      return NextResponse.json({ error: 'المبلغ يجب أن يكون رقمًا موجبًا' }, { status: 400 });
    }
    if (!ALLOWED_STATUSES.has(status)) {
      return NextResponse.json({ error: 'حالة الطلب غير صالحة' }, { status: 400 });
    }

    const nowIso = new Date().toISOString();
    const idSuffix = Date.now();
    const newOrder: Order = {
      id: `order-${idSuffix}`,
      userId, userEmail, userName, courseId, courseTitle, amount,
      currency, status: status as OrderStatus, paymentMethod,
      paymentId: `MANUAL-${idSuffix}`,
      createdAt: nowIso, updatedAt: nowIso,
      ...(status === 'completed' && { completedAt: nowIso }),
      ...(status === 'refunded' && { refundedAt: nowIso, refundReason: notes || 'Manual refund' }),
      ...(status === 'cancelled' && { cancelledAt: nowIso, cancellationReason: notes || 'Manual cancellation' }),
      ...(notes && { notes })
    };

    mockOrders.unshift(newOrder);

    await logAdminAction({
      adminEmail: session.user.email,
      action: 'CREATE_MANUAL_ORDER',
      target: newOrder.id,
      details: { userEmail: newOrder.userEmail, courseTitle: newOrder.courseTitle, amount: newOrder.amount, status: newOrder.status }
    });

    return NextResponse.json({ message: 'تم إنشاء الطلب بنجاح', order: newOrder }, { status: 201 });

  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'خطأ في الخادم الداخلي' }, { status: 500 });
  }
}
