import { useState, useEffect } from 'react';
import { adminAPI, apiUtils, type DashboardStats, type User, type Order, type PaginationInfo, type AnalyticsData, type AnalyticsResponse } from '@/lib/api';

// Admin Dashboard Hook
export const useAdminDashboard = () => {
  const [dashboard, setDashboard] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await adminAPI.getDashboard();
        setDashboard(response.data.data?.dashboard || null);
      } catch (err: unknown) {
        setError(apiUtils.handleApiError(err));
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  return { dashboard, loading, error };
};

// Admin Users Hook
export const useAdminUsers = (filters: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  emailVerified?: boolean;
} = {}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [stats, setStats] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await adminAPI.getUsers(filters);
        setUsers(response.data.data?.users || []);
        setPagination(response.data.data?.pagination || null);
        setStats(response.data.data?.stats || null);
      } catch (err: unknown) {
        setError(apiUtils.handleApiError(err));
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [JSON.stringify(filters)]);

  const updateUser = async (userId: string, userData: {
    isActive?: boolean;
    isAdmin?: boolean;
    adminRole?: string;
    adminPermissions?: string[];
    totalSpent?: number;
    notes?: string;
  }) => {
    try {
      const response = await adminAPI.updateUser(userId, userData);
      
      // Update local state
      setUsers(prev => prev.map(user => 
        user._id === userId ? { ...user, ...(response.data.data?.user || {}) } : user
      ));
      
      return response.data.data;
    } catch (err: unknown) {
      throw new Error(apiUtils.handleApiError(err));
    }
  };

  return { users, pagination, stats, loading, error, updateUser };
};

// Admin Orders Hook
export const useAdminOrders = (filters: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
} = {}) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [stats, setStats] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await adminAPI.getOrders(filters);
        setOrders(response.data.data?.orders || []);
        setPagination(response.data.data?.pagination || null);
        setStats(response.data.data?.stats || null);
      } catch (err: unknown) {
        setError(apiUtils.handleApiError(err));
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [JSON.stringify(filters)]);

  const updateOrder = async (orderId: string, orderData: { status: string; notes?: string }) => {
    try {
      const response = await adminAPI.updateOrder(orderId, orderData);
      
      // Update local state
      setOrders(prev => prev.map(order => 
        order._id === orderId ? { ...order, ...(response.data.data?.order || {}) } : order
      ));
      
      return response.data.data;
    } catch (err: unknown) {
      throw new Error(apiUtils.handleApiError(err));
    }
  };

  return { orders, pagination, stats, loading, error, updateOrder };
};

// Admin Audit Logs Hook
export const useAdminAuditLogs = (filters: {
  page?: number;
  limit?: number;
  action?: string;
  adminEmail?: string;
  severity?: string;
  dateFrom?: string;
  dateTo?: string;
} = {}) => {
  const [logs, setLogs] = useState<unknown[]>([]);
  const [pagination, setPagination] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await adminAPI.getAuditLogs(filters);
        setLogs(response.data.data || []);
        setPagination(response.data.pagination || null);
      } catch (err: unknown) {
        setError(apiUtils.handleApiError(err));
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [JSON.stringify(filters)]);

  return { logs, pagination, loading, error };
};

// Admin Analytics Hook
export const useAdminAnalytics = (period: string = '30d') => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await adminAPI.getAnalytics({ period });
        setAnalytics(response.data.analytics || null);
      } catch (err: unknown) {
        setError(apiUtils.handleApiError(err));
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [period]);

  return { analytics, loading, error };
};

// Utility functions for admin
export const adminUtils = {
  formatCurrency: (amount: number, currency: string = 'USD') => {
    const formatter = new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: currency,
    });
    return formatter.format(amount);
  },

  formatDate: (date: string) => {
    return new Date(date).toLocaleDateString('ar-EG', {
      calendar: 'gregory',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  },

  getStatusBadge: (status: string) => {
    const statusConfig: { [key: string]: { color: string; label: string } } = {
      active: { color: 'bg-green-100 text-green-800', label: 'نشط' },
      inactive: { color: 'bg-gray-100 text-gray-800', label: 'غير نشط' },
      suspended: { color: 'bg-red-100 text-red-800', label: 'معلق' },
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'في الانتظار' },
      completed: { color: 'bg-green-100 text-green-800', label: 'مكتمل' },
      failed: { color: 'bg-red-100 text-red-800', label: 'فشل' },
      refunded: { color: 'bg-orange-100 text-orange-800', label: 'مسترد' },
      cancelled: { color: 'bg-gray-100 text-gray-800', label: 'ملغي' },
    };

    return statusConfig[status] || { color: 'bg-gray-100 text-gray-800', label: status };
  },

  getSeverityBadge: (severity: string) => {
    const severityConfig: { [key: string]: { color: string; label: string } } = {
      low: { color: 'bg-[#41ADE1]/30 text-[#41ADE1]', label: 'منخفض' },
      medium: { color: 'bg-yellow-100 text-yellow-800', label: 'متوسط' },
      high: { color: 'bg-orange-100 text-orange-800', label: 'عالي' },
      critical: { color: 'bg-red-100 text-red-800', label: 'حرج' },
    };

    return severityConfig[severity] || { color: 'bg-gray-100 text-gray-800', label: severity };
  },

  getActionLabel: (action: string) => {
    const actionLabels: { [key: string]: string } = {
      'user.create': 'إنشاء مستخدم',
      'user.update': 'تحديث مستخدم',
      'user.delete': 'حذف مستخدم',
      'user.suspend': 'تعليق مستخدم',
      'user.activate': 'تفعيل مستخدم',
      'course.create': 'إنشاء دورة',
      'course.update': 'تحديث دورة',
      'course.delete': 'حذف دورة',
      'course.publish': 'نشر دورة',
      'course.unpublish': 'إلغاء نشر دورة',
      'order.create': 'إنشاء طلب',
      'order.update': 'تحديث طلب',
      'order.refund': 'استرداد طلب',
      'order.cancel': 'إلغاء طلب',
      'login': 'تسجيل دخول',
      'logout': 'تسجيل خروج',
      'password.reset': 'إعادة تعيين كلمة المرور',
      'settings.update': 'تحديث الإعدادات',
      'unauthorized_access_attempt': 'محاولة وصول غير مصرح',
      'permission_denied': 'رفض الصلاحية',
      'analytics.view': 'عرض التحليلات',
      'reports.generate': 'توليد تقرير',
    };

    return actionLabels[action] || action;
  },

  calculateGrowthPercentage: (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  },

  formatNumber: (num: number) => {
    return new Intl.NumberFormat('ar-SA').format(num);
  },

  formatPercentage: (num: number) => {
    return `${num.toFixed(1)}%`;
  },

  getTimeAgo: (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    if (diffInSeconds < 60) return 'منذ دقائق';
    if (diffInSeconds < 3600) return `منذ ${Math.floor(diffInSeconds / 60)} دقيقة`;
    if (diffInSeconds < 86400) return `منذ ${Math.floor(diffInSeconds / 3600)} ساعة`;
    if (diffInSeconds < 2592000) return `منذ ${Math.floor(diffInSeconds / 86400)} يوم`;
    if (diffInSeconds < 31536000) return `منذ ${Math.floor(diffInSeconds / 2592000)} شهر`;
    return `منذ ${Math.floor(diffInSeconds / 31536000)} سنة`;
  },
};

