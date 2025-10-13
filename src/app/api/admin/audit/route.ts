import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { isServerAdmin, logAdminAction } from '@/lib/admin';
import { getClientIP } from '@/lib/utils';

// Mock audit log data - replace with actual database calls
const mockAuditLogs = [
  {
    id: 'audit-1',
    adminEmail: 'admin@example.com',
    action: 'CREATE_COURSE',
    target: 'course-5',
    details: {
      courseTitle: 'كورس جديد للتدريب',
      price: 199,
      level: 'beginner'
    },
    timestamp: '2024-01-15T10:30:00Z',
    ip: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  },
  {
    id: 'audit-2',
    adminEmail: 'admin@example.com',
    action: 'UPDATE_USER',
    target: 'user-1',
    details: {
      userEmail: 'ahmed@example.com',
      changes: {
        status: { from: 'active', to: 'suspended' },
        notes: { from: null, to: 'تم إيقاف الحساب مؤقتاً' }
      }
    },
    timestamp: '2024-01-15T09:45:00Z',
    ip: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  },
  {
    id: 'audit-3',
    adminEmail: 'admin@example.com',
    action: 'DELETE_ORDER',
    target: 'order-10',
    details: {
      userEmail: 'test@example.com',
      courseTitle: 'كورس تجريبي',
      amount: 99,
      status: 'pending',
      reason: 'طلب تجريبي خاطئ'
    },
    timestamp: '2024-01-15T08:20:00Z',
    ip: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  },
  {
    id: 'audit-4',
    adminEmail: 'admin@example.com',
    action: 'VIEW_USERS_LIST',
    target: 'admin_users',
    details: {
      filters: {
        search: '',
        status: 'all',
        page: 1,
        limit: 50
      },
      resultCount: 25
    },
    timestamp: '2024-01-15T07:15:00Z',
    ip: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  },
  {
    id: 'audit-5',
    adminEmail: 'admin@example.com',
    action: 'UNAUTHORIZED_ACCESS_ATTEMPT',
    target: 'admin_courses_create',
    details: {
      attemptedBy: 'user@example.com',
      reason: 'Non-admin user tried to access admin endpoint'
    },
    timestamp: '2024-01-14T16:30:00Z',
    ip: '192.168.1.200',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
  }
];

// GET /api/admin/audit - Get audit logs
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
        target: 'admin_audit_logs',
        details: { ip: getClientIP(request), userAgent: request.headers.get('user-agent') }
      });
      
      return NextResponse.json(
        { error: 'غير مصرح بالوصول - صلاحيات المدير مطلوبة' },
        { status: 403 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const action = searchParams.get('action') || 'all';
    const adminEmail = searchParams.get('adminEmail') || 'all';
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Filter audit logs
    let filteredLogs = mockAuditLogs.filter(log => {
      // Search filter (search in action, target, admin email)
      const searchMatch = search === '' || 
        log.action.toLowerCase().includes(search.toLowerCase()) ||
        log.target.toLowerCase().includes(search.toLowerCase()) ||
        log.adminEmail.toLowerCase().includes(search.toLowerCase()) ||
        JSON.stringify(log.details).toLowerCase().includes(search.toLowerCase());
      
      // Action filter
      const actionMatch = action === 'all' || log.action === action;
      
      // Admin email filter
      const adminEmailMatch = adminEmail === 'all' || log.adminEmail === adminEmail;
      
      // Date range filter
      let dateMatch = true;
      if (dateFrom || dateTo) {
        const logDate = new Date(log.timestamp);
        if (dateFrom) {
          dateMatch = dateMatch && logDate >= new Date(dateFrom);
        }
        if (dateTo) {
          dateMatch = dateMatch && logDate <= new Date(dateTo + 'T23:59:59.999Z');
        }
      }
      
      return searchMatch && actionMatch && adminEmailMatch && dateMatch;
    });

    // Sort logs by timestamp
    filteredLogs.sort((a, b) => {
      const aTime = new Date(a.timestamp).getTime();
      const bTime = new Date(b.timestamp).getTime();
      
      if (sortOrder === 'asc') {
        return aTime - bTime;
      } else {
        return bTime - aTime;
      }
    });

    // Paginate
    const startIndex = (page - 1) * limit;
    const paginatedLogs = filteredLogs.slice(startIndex, startIndex + limit);
    const totalPages = Math.ceil(filteredLogs.length / limit);

    // Calculate statistics
    const stats = {
      totalLogs: filteredLogs.length,
      uniqueAdmins: [...new Set(filteredLogs.map(log => log.adminEmail))].length,
      actionCounts: filteredLogs.reduce((acc: any, log) => {
        acc[log.action] = (acc[log.action] || 0) + 1;
        return acc;
      }, {}),
      recentActivity: filteredLogs.slice(0, 10).map(log => ({
        action: log.action,
        target: log.target,
        timestamp: log.timestamp,
        adminEmail: log.adminEmail
      }))
    };

    // Log this audit log access
    await logAdminAction({
      adminEmail: session.user.email,
      action: 'VIEW_AUDIT_LOGS',
      target: 'admin_audit',
      details: { 
        filters: { search, action, adminEmail, dateFrom, dateTo, page, limit, sortOrder },
        resultCount: paginatedLogs.length
      }
    });

    return NextResponse.json({
      logs: paginatedLogs,
      stats,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: filteredLogs.length,
        itemsPerPage: limit
      }
    });

  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json(
      { error: 'خطأ في الخادم الداخلي' },
      { status: 500 }
    );
  }
}

// POST /api/admin/audit - Create audit log entry (internal use)
export async function POST(request: NextRequest) {
  try {
    // This endpoint is for internal use by the logAdminAction function
    // In a real app, this would be protected by internal API keys or service-to-service auth
    
    const body = await request.json();
    const {
      adminEmail,
      action,
      target,
      details,
      timestamp
    } = body;

    // Validate required fields
    if (!adminEmail || !action || !target) {
      return NextResponse.json(
        { error: 'الحقول المطلوبة مفقودة' },
        { status: 400 }
      );
    }

    // Create audit log entry
    const auditLog = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      adminEmail,
      action,
      target,
      details: details || {},
      timestamp: timestamp || new Date().toISOString(),
      ip: getClientIP(request),
      userAgent: request.headers.get('user-agent') || 'unknown'
    };

    // In a real app, save to database
    // await db.auditLogs.create(auditLog);
    mockAuditLogs.unshift(auditLog); // Add to beginning for latest first

    return NextResponse.json(
      { 
        message: 'تم إنشاء سجل التدقيق بنجاح',
        auditLog
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error creating audit log:', error);
    return NextResponse.json(
      { error: 'خطأ في الخادم الداخلي' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/audit - Clear old audit logs (admin only)
export async function DELETE(request: NextRequest) {
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
        action: 'EXPORT_AUDIT_LOG',
        target: 'audit_logs',
        details: { count: mockAuditLogs.length }
      });
      return NextResponse.json(
        { error: 'غير مصرح بالوصول - صلاحيات المدير مطلوبة' },
        { status: 403 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const olderThanDays = parseInt(searchParams.get('olderThanDays') || '90');
    
    // Calculate cutoff date
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
    
    // Count logs to be deleted
    const logsToDelete = mockAuditLogs.filter(log => 
      new Date(log.timestamp) < cutoffDate
    );
    
    // In a real app, delete from database
    // await db.auditLogs.deleteMany({ timestamp: { $lt: cutoffDate } });
    
    // For mock data, remove old logs
    const remainingLogs = mockAuditLogs.filter(log => 
      new Date(log.timestamp) >= cutoffDate
    );
    
    // Update mock data
    mockAuditLogs.length = 0;
    mockAuditLogs.push(...remainingLogs);

    // Log this cleanup action
    await logAdminAction({
      adminEmail: session.user.email,
      action: 'CLEANUP_AUDIT_LOGS',
      target: 'admin_audit_cleanup',
      details: { 
        olderThanDays,
        deletedCount: logsToDelete.length,
        cutoffDate: cutoffDate.toISOString()
      }
    });

    return NextResponse.json({
      message: `تم حذف ${logsToDelete.length} سجل تدقيق أقدم من ${olderThanDays} يوم`,
      deletedCount: logsToDelete.length,
      remainingCount: remainingLogs.length
    });

  } catch (error) {
    console.error('Error cleaning up audit logs:', error);
    return NextResponse.json(
      { error: 'خطأ في الخادم الداخلي' },
      { status: 500 }
    );
  }
}