'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-hot-toast';
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
  TicketIcon,
  CheckCircleIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

interface Coupon {
  _id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  maxUses: number | null;
  usedCount: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  applicableTo: 'all' | 'courses' | 'consultations' | 'specific';
  specificCourses: any[];
  specificConsultations: any[];
  minPurchaseAmount: number;
  createdBy: any;
  createdAt: string;
  updatedAt: string;
}

interface CouponFormData {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  maxUses: string;
  validUntil: string;
  applicableTo: 'all' | 'courses' | 'consultations' | 'specific';
  minPurchaseAmount: number;
  isActive: boolean;
}

export default function CouponsManagementPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'expired'>('all');
  const [stats, setStats] = useState({
    totalCoupons: 0,
    activeCoupons: 0,
    expiredCoupons: 0,
  });

  const [formData, setFormData] = useState<CouponFormData>({
    code: '',
    discountType: 'percentage',
    discountValue: 0,
    maxUses: '',
    validUntil: '',
    applicableTo: 'all',
    minPurchaseAmount: 0,
    isActive: true,
  });

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5050';

  useEffect(() => {
    fetchCoupons();
    fetchStats();
  }, []);

  const fetchCoupons = async () => {
    try {
      const token = Cookies.get('token');
      if (!token) {
        toast.error('يرجى تسجيل الدخول');
        return;
      }

      const response = await axios.get(`${backendUrl}/api/coupons`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setCoupons(response.data.coupons);
      }
    } catch (error: any) {
      console.error('Error fetching coupons:', error);
      toast.error(error.response?.data?.arabic || 'فشل في تحميل أكواد الخصم');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = Cookies.get('token');
      if (!token) return;

      const response = await axios.get(`${backendUrl}/api/coupons/stats/overview`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = Cookies.get('token');
      if (!token) {
        toast.error('يرجى تسجيل الدخول');
        return;
      }

      const payload = {
        ...formData,
        code: formData.code.toUpperCase(),
        maxUses: formData.maxUses ? parseInt(formData.maxUses) : null,
      };

      const response = await axios.post(`${backendUrl}/api/coupons`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.data.success) {
        toast.success(response.data.arabic || 'تم إنشاء كود الخصم بنجاح');
        setShowCreateModal(false);
        resetForm();
        fetchCoupons();
        fetchStats();
      }
    } catch (error: any) {
      console.error('Error creating coupon:', error);
      toast.error(error.response?.data?.arabic || 'فشل في إنشاء كود الخصم');
    }
  };

  const handleUpdateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCoupon) return;

    try {
      const token = Cookies.get('token');
      if (!token) {
        toast.error('يرجى تسجيل الدخول');
        return;
      }

      const payload = {
        ...formData,
        maxUses: formData.maxUses ? parseInt(formData.maxUses) : null,
      };

      const response = await axios.put(
        `${backendUrl}/api/coupons/${editingCoupon._id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        toast.success(response.data.arabic || 'تم تحديث كود الخصم بنجاح');
        setEditingCoupon(null);
        resetForm();
        fetchCoupons();
        fetchStats();
      }
    } catch (error: any) {
      console.error('Error updating coupon:', error);
      toast.error(error.response?.data?.arabic || 'فشل في تحديث كود الخصم');
    }
  };

  const handleDeleteCoupon = async (couponId: string) => {
    if (!confirm('هل أنت متأكد من حذف كود الخصم؟')) return;

    try {
      const token = Cookies.get('token');
      if (!token) {
        toast.error('يرجى تسجيل الدخول');
        return;
      }

      const response = await axios.delete(`${backendUrl}/api/coupons/${couponId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        toast.success(response.data.arabic || 'تم حذف كود الخصم بنجاح');
        fetchCoupons();
        fetchStats();
      }
    } catch (error: any) {
      console.error('Error deleting coupon:', error);
      toast.error(error.response?.data?.arabic || 'فشل في حذف كود الخصم');
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      discountType: 'percentage',
      discountValue: 0,
      maxUses: '',
      validUntil: '',
      applicableTo: 'all',
      minPurchaseAmount: 0,
      isActive: true,
    });
  };

  const startEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      maxUses: coupon.maxUses ? coupon.maxUses.toString() : '',
      validUntil: new Date(coupon.validUntil).toISOString().split('T')[0],
      applicableTo: coupon.applicableTo,
      minPurchaseAmount: coupon.minPurchaseAmount,
      isActive: coupon.isActive,
    });
  };

  const filteredCoupons = coupons.filter((coupon) => {
    const matchesSearch = coupon.code.toLowerCase().includes(searchTerm.toLowerCase());
    const now = new Date();
    const isExpired = new Date(coupon.validUntil) < now;

    if (filterStatus === 'active') return matchesSearch && coupon.isActive && !isExpired;
    if (filterStatus === 'expired') return matchesSearch && (isExpired || !coupon.isActive);
    return matchesSearch;
  });

  const isCouponExpired = (validUntil: string) => {
    return new Date(validUntil) < new Date();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">إدارة أكواد الخصم</h1>
          <p className="mt-2 text-sm text-gray-600">
            إنشاء وإدارة أكواد الخصم للدورات والاستشارات
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <PlusIcon className="w-5 h-5" />
          إنشاء كود جديد
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <TicketIcon className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">إجمالي الأكواد</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCoupons}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-50 rounded-lg">
              <CheckCircleIcon className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">الأكواد النشطة</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeCoupons}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-50 rounded-lg">
              <XCircleIcon className="w-8 h-8 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">الأكواد المنتهية</p>
              <p className="text-2xl font-bold text-gray-900">{stats.expiredCoupons}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="البحث عن كود..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">جميع الأكواد</option>
            <option value="active">النشطة فقط</option>
            <option value="expired">المنتهية فقط</option>
          </select>
        </div>
      </div>

      {/* Coupons Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الكود
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الخصم
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الاستخدام
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ينتهي في
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الحالة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredCoupons.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <TicketIcon className="w-12 h-12 text-gray-300" />
                      <p className="text-gray-500">لا توجد أكواد خصم</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCoupons.map((coupon) => (
                  <tr key={coupon._id} className="hover:bg-gray-500 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">
                          {coupon.code}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {coupon.discountType === 'percentage'
                          ? `${coupon.discountValue}%`
                          : `${coupon.discountValue} ر.س`}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">
                        {coupon.usedCount} / {coupon.maxUses || '∞'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">
                        {new Date(coupon.validUntil).toLocaleDateString('ar-EG')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {coupon.isActive && !isCouponExpired(coupon.validUntil) ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                          <CheckCircleIcon className="w-4 h-4" />
                          نشط
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-700 text-xs font-medium rounded-full">
                          <XCircleIcon className="w-4 h-4" />
                          منتهي
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => startEdit(coupon)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="تعديل"
                        >
                          <PencilSquareIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteCoupon(coupon._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="حذف"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingCoupon) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editingCoupon ? 'تعديل كود الخصم' : 'إنشاء كود خصم جديد'}
              </h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingCoupon(null);
                  resetForm();
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <form
              onSubmit={editingCoupon ? handleUpdateCoupon : handleCreateCoupon}
              className="p-6 space-y-6"
            >
              {/* Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  كود الخصم *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value.toUpperCase() })
                  }
                  placeholder="SUMMER2025"
                  disabled={!!editingCoupon}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono disabled:bg-gray-100"
                  required
                />
              </div>

              {/* Discount Type and Value */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    نوع الخصم *
                  </label>
                  <select
                    value={formData.discountType}
                    onChange={(e) =>
                      setFormData({ ...formData, discountType: e.target.value as any })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="percentage">نسبة مئوية (%)</option>
                    <option value="fixed">قيمة ثابتة (ر.س)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    قيمة الخصم *
                  </label>
                  <input
                    type="number"
                    value={formData.discountValue}
                    onChange={(e) =>
                      setFormData({ ...formData, discountValue: parseFloat(e.target.value) })
                    }
                    min="0"
                    max={formData.discountType === 'percentage' ? 100 : undefined}
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Max Uses */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الحد الأقصى للاستخدام (اتركه فارغًا للاستخدام غير المحدود)
                </label>
                <input
                  type="number"
                  value={formData.maxUses}
                  onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Valid Until */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  تاريخ الانتهاء *
                </label>
                <input
                  type="date"
                  value={formData.validUntil}
                  onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Applicable To */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ينطبق على *
                </label>
                <select
                  value={formData.applicableTo}
                  onChange={(e) =>
                    setFormData({ ...formData, applicableTo: e.target.value as any })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">جميع الدورات والاستشارات</option>
                  <option value="courses">الدورات فقط</option>
                  <option value="consultations">الاستشارات فقط</option>
                </select>
              </div>

              {/* Min Purchase Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الحد الأدنى للشراء ($)
                </label>
                <input
                  type="number"
                  value={formData.minPurchaseAmount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      minPurchaseAmount: parseFloat(e.target.value),
                    })
                  }
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              {/* Is Active */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  تفعيل الكود
                </label>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium"
                >
                  {editingCoupon ? 'تحديث' : 'إنشاء'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingCoupon(null);
                    resetForm();
                  }}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


