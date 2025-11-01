'use client';

import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import Cookies from 'js-cookie';
import {
  XMarkIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UserIcon,
  CalendarIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  HeartIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  VideoCameraIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';

interface ConsultationBookingDetails {
  _id: string;
  bookingNumber: string;
  userId: {
    _id: string;
    displayName: string;
    email: string;
    phone?: string;
  };
  userEmail: string;
  userName: string;
  userPhone: string;
  consultationId: {
    _id: string;
    title: string;
    description?: string;
    price: number;
    currency: string;
    duration: string;
    category: string;
  };
  consultationType: string;
  consultationTitle: string;
  consultationCategory: string;
  preferredDate: string;
  preferredTime: string;
  alternativeDate?: string;
  alternativeTime?: string;
  confirmedDateTime?: string;
  timezone: string;
  duration: number;
  meetingType: 'online' | 'in_person';
  meetingLink?: string;
  meetingPassword?: string;
  meetingId?: string;
  location?: {
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    mapLink?: string;
    notes?: string;
  };
  userDetails?: {
    age?: number;
    gender?: 'male' | 'female' | 'other';
    weight?: number;
    height?: number;
    fitnessLevel?: 'beginner' | 'intermediate' | 'advanced';
    medicalConditions?: string;
    currentActivity?: string;
    goals?: string[];
    dietaryRestrictions?: string;
    injuries?: string;
    medications?: string;
    additionalNotes?: string;
  };
  orderId?: {
    _id: string;
    amount: number;
    status: string;
    transactionId?: string;
    paymentMethod?: string;
    bankTransfer?: {
      receiptImage?: string;
      receiptImagePublicId?: string;
      transferDate?: string;
      transferReference?: string;
      bankName?: string;
      accountHolderName?: string;
      verificationStatus?: 'pending' | 'verified' | 'rejected';
      verifiedBy?: string;
      verifiedAt?: string;
      rejectionReason?: string;
    };
  };
  amount: number;
  currency: string;
  paymentStatus: string;
  paymentMethod?: string;
  transactionId?: string;
  status: string;
  paymentCompletedAt?: string;
  confirmedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  cancelledBy?: string;
  adminNotes?: string;
  internalNotes?: string;
  assignedTo?: string;
  remindersSent?: Array<{
    type: string;
    sentAt: string;
    purpose: string;
  }>;
  followUpRequired?: boolean;
  followUpNotes?: string;
  followUpDate?: string;
  userFeedback?: {
    rating?: number;
    comment?: string;
    submittedAt?: string;
  };
  consultantNotes?: string;
  isPriority?: boolean;
  isFirstBooking?: boolean;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

interface ConsultationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  consultationBookingId: string | null;
  onUpdateStatus?: (bookingId: string, status: string, notes?: string) => void;
  onVerifyBankTransfer?: (orderId: string, status: 'verified' | 'rejected', reason?: string) => void;
}

export default function ConsultationDetailsModal({
  isOpen,
  onClose,
  consultationBookingId,
  onUpdateStatus,
  onVerifyBankTransfer
}: ConsultationDetailsModalProps) {
  const [booking, setBooking] = useState<ConsultationBookingDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showStatusUpdate, setShowStatusUpdate] = useState(false);
  const [newStatus, setNewStatus] = useState<string>('');
  const [statusNotes, setStatusNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    if (isOpen && consultationBookingId) {
      fetchConsultationBooking();
    }
  }, [isOpen, consultationBookingId]);

  const fetchConsultationBooking = async () => {
    if (!consultationBookingId) return;

    try {
      setLoading(true);
      setError(null);
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050/api';
      
      const token = Cookies.get('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await axios.get(
        `${API_BASE_URL}/consultations/admin/bookings/${consultationBookingId}`,
        {
          withCredentials: true,
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setBooking(response.data.booking);
      } else {
        throw new Error(response.data.error || 'Failed to fetch consultation booking');
      }
    } catch (error) {
      console.error('Error fetching consultation booking:', error);
      setError('فشل في تحميل تفاصيل الحجز');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!newStatus || !booking || !onUpdateStatus) return;

    // Check if trying to complete booking without verified bank transfer
    if (newStatus === 'completed') {
      const isBankTransfer = booking.paymentMethod === 'bank_transfer' || booking.orderId?.paymentMethod === 'bank_transfer';
      const bankTransferStatus = booking.orderId?.bankTransfer?.verificationStatus;
      
      if (isBankTransfer && bankTransferStatus !== 'verified') {
        alert('⚠️ لا يمكن تغيير حالة الحجز إلى "مكتمل" إلا بعد التحقق من التحويل البنكي.\n\nيرجى التحقق من التحويل البنكي أولاً من خلال الموافقة عليه في قسم التحويل البنكي أدناه.');
        return;
      }
    }

    setIsUpdating(true);
    try {
      await onUpdateStatus(booking._id, newStatus, statusNotes);
      setShowStatusUpdate(false);
      setNewStatus('');
      setStatusNotes('');
      await fetchConsultationBooking(); // Refresh data
    } catch (error) {
      console.error('Error updating status:', error);
      // Error message is already handled by the parent component notification
      // Don't close the form so user can see the error and try again
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending_confirmation':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'pending_payment':
        return 'bg-[#41ADE1]/30 text-[#41ADE1] border-[#41ADE1]/40';
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'rescheduled':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'no_show':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'مؤكد';
      case 'pending_confirmation':
        return 'في انتظار التأكيد';
      case 'pending_payment':
        return 'في انتظار الدفع';
      case 'completed':
        return 'مكتمل';
      case 'cancelled':
        return 'ملغي';
      case 'rescheduled':
        return 'تم إعادة الجدولة';
      case 'no_show':
        return 'لم يحضر';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      calendar: 'gregory',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    const symbol = currency === 'USD' ? '$' : currency === 'SAR' ? 'ر.س' : 'ج.م';
    return `${amount}${symbol}`;
  };

  const getFitnessLevelText = (level?: string) => {
    switch (level) {
      case 'beginner':
        return 'مبتدئ';
      case 'intermediate':
        return 'متوسط';
      case 'advanced':
        return 'متقدم';
      default:
        return level || 'غير محدد';
    }
  };

  const getGenderText = (gender?: string) => {
    switch (gender) {
      case 'male':
        return 'ذكر';
      case 'female':
        return 'أنثى';
      case 'other':
        return 'آخر';
      default:
        return 'غير محدد';
    }
  };

  if (!isOpen) return null;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-6xl transform overflow-hidden rounded-xl bg-white text-right shadow-2xl transition-all">
                {/* Header - Clean & Professional */}
                <div className="bg-gradient-to-l from-purple-600 to-purple-700 text-white p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <Dialog.Title className="text-2xl font-bold mb-1">
                        تفاصيل حجز الاستشارة
                      </Dialog.Title>
                      {booking && (
                        <p className="text-purple-100 text-sm">
                          رقم الحجز: #{booking.bookingNumber} • {formatDate(booking.createdAt)}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={onClose}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Content - Clean Layout */}
                <div className="p-8 max-h-[calc(100vh-200px)] overflow-y-auto space-y-6">
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                      <p className="mr-4 text-gray-600">جاري التحميل...</p>
                    </div>
                  ) : error ? (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                      <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-3" />
                      <p className="text-red-800">{error}</p>
                      <button
                        onClick={fetchConsultationBooking}
                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        إعادة المحاولة
                      </button>
                    </div>
                  ) : booking ? (
                    <div className="space-y-6">
                      {/* Order Status Section */}
                      {booking.orderId && (
                        <div className="bg-[#41ADE1]/20 border-2 border-[#41ADE1]/40 rounded-lg p-6">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center">
                              <svg className="h-5 w-5 text-[#41ADE1] ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <h3 className="text-lg font-semibold text-[#41ADE1]">حالة الطلب المالي</h3>
                            </div>
                          </div>

                          <div className="mb-3 p-3 bg-[#41ADE1]/30 rounded-lg border border-[#41ADE1]/40">
                            <p className="text-xs text-[#41ADE1] font-medium mb-1">💡 ما هي حالة الطلب المالي؟</p>
                            <p className="text-xs text-[#3399CC]">
                              حالة الطلب المالي تشير إلى حالة الدفع والتحويل البنكي. إذا كان الطلب &quot;معلق&quot;، فهذا يعني أن التحويل البنكي لا يزال في انتظار التحقق من الإدارة.
                            </p>
                          </div>

                          <div className="flex items-center gap-4">
                            <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${
                              booking.orderId.status === 'completed' ? 'bg-green-100 text-green-800 border-green-200' :
                              booking.orderId.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                              booking.orderId.status === 'processing' ? 'bg-[#41ADE1]/30 text-[#41ADE1] border-[#41ADE1]/40' :
                              booking.orderId.status === 'failed' ? 'bg-red-100 text-red-800 border-red-200' :
                              booking.orderId.status === 'refunded' ? 'bg-gray-100 text-gray-800 border-gray-200' :
                              'bg-gray-100 text-gray-800 border-gray-200'
                            }`}>
                              {booking.orderId.status === 'completed' ? 'مكتمل' :
                               booking.orderId.status === 'pending' ? 'معلق' :
                               booking.orderId.status === 'processing' ? 'قيد المعالجة' :
                               booking.orderId.status === 'failed' ? 'فاشل' :
                               booking.orderId.status === 'refunded' ? 'مسترد' :
                               booking.orderId.status}
                            </span>
                            {booking.orderId.paymentMethod === 'bank_transfer' && booking.orderId.bankTransfer?.verificationStatus === 'pending' && (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
                                <ExclamationTriangleIcon className="h-4 w-4 ml-1" />
                                يحتاج موافقة
                              </span>
                            )}
                          </div>
                          {booking.orderId.status === 'pending' && booking.orderId.paymentMethod === 'bank_transfer' && (
                            <p className="mt-3 text-sm text-orange-700 bg-orange-50 p-2 rounded-lg">
                              ⚠️ الطلب معلق في انتظار التحقق من التحويل البنكي. يرجى مراجعة صورة الإيصال أدناه والتحقق من التحويل.
                            </p>
                          )}
                        </div>
                      )}

                      {/* Booking Status Section */}
                      <div className="bg-gray-50 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <ClockIcon className="h-5 w-5 text-purple-600 ml-2" />
                            <h3 className="text-lg font-semibold text-black">حالة الحجز/الاستشارة</h3>
                          </div>
                          <button
                            onClick={() => setShowStatusUpdate(!showStatusUpdate)}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                          >
                            تحديث الحالة
                          </button>
                        </div>

                        <div className="mb-3 p-3 bg-purple-100 rounded-lg border border-purple-200">
                          <p className="text-xs text-purple-800 font-medium mb-1">💡 ما هي حالة الحجز؟</p>
                          <p className="text-xs text-purple-700">
                            حالة الحجز تشير إلى حالة الاستشارة نفسها (مؤكد، في انتظار التأكيد، مكتمل، إلخ). 
                            {(() => {
                              const isBankTransfer = booking.paymentMethod === 'bank_transfer' || booking.orderId?.paymentMethod === 'bank_transfer';
                              if (isBankTransfer) {
                                return ' ⚠️ ملاحظة مهمة: في حالة الدفع بالتحويل البنكي، لا يمكن تغيير حالة الحجز إلى &quot;مكتمل&quot; إلا بعد التحقق من التحويل البنكي.';
                              }
                              return ' هذه الحالة مستقلة عن حالة الدفع وقد تكون &quot;مؤكد&quot; حتى لو كان الطلب المالي لا يزال معلقًا.';
                            })()}
                          </p>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(booking.status)}`}>
                            {getStatusText(booking.status)}
                          </span>
                          {booking.isPriority && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              أولوية عالية
                            </span>
                          )}
                          {booking.isFirstBooking && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#41ADE1]/30 text-[#41ADE1]">
                              حجز أول
                            </span>
                          )}
                        </div>

                        {showStatusUpdate && (() => {
                          const isBankTransfer = booking.paymentMethod === 'bank_transfer' || booking.orderId?.paymentMethod === 'bank_transfer';
                          const bankTransferStatus = booking.orderId?.bankTransfer?.verificationStatus;
                          const canComplete = !isBankTransfer || bankTransferStatus === 'verified';
                          
                          return (
                          <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                            {isBankTransfer && bankTransferStatus !== 'verified' && (
                              <div className="mb-4 p-3 bg-red-50 border-2 border-red-300 rounded-lg">
                                <div className="flex items-center gap-2">
                                  <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                                  <p className="text-sm font-semibold text-red-800">
                                    ⚠️ تحذير: لا يمكن تغيير حالة الحجز إلى &quot;مكتمل&quot; إلا بعد التحقق من التحويل البنكي
                                  </p>
                                </div>
                                <p className="text-xs text-red-700 mt-2">
                                  يجب الموافقة على التحويل البنكي أولاً من خلال قسم التحويل البنكي أدناه قبل تغيير الحالة إلى &quot;مكتمل&quot;.
                                </p>
                              </div>
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  الحالة الجديدة
                                </label>
                                <select
                                  value={newStatus}
                                  onChange={(e) => setNewStatus(e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                >
                                  <option value="">اختر الحالة</option>
                                  <option value="pending_payment">في انتظار الدفع</option>
                                  <option value="pending_confirmation">في انتظار التأكيد</option>
                                  <option value="confirmed">مؤكد</option>
                                  <option 
                                    value="completed"
                                    disabled={!canComplete}
                                    style={{ 
                                      color: canComplete ? 'inherit' : '#9ca3af',
                                      backgroundColor: canComplete ? 'inherit' : '#f3f4f6'
                                    }}
                                  >
                                    مكتمل{!canComplete ? ' (يحتاج التحقق من التحويل البنكي)' : ''}
                                  </option>
                                  <option value="cancelled">ملغي</option>
                                  <option value="no_show">لم يحضر</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  ملاحظات
                                </label>
                                <input
                                  type="text"
                                  value={statusNotes}
                                  onChange={(e) => setStatusNotes(e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                  placeholder="أضف ملاحظة..."
                                />
                              </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 mt-4">
                              <button
                                onClick={() => setShowStatusUpdate(false)}
                                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                              >
                                إلغاء
                              </button>
                              <button
                                onClick={handleStatusUpdate}
                                disabled={!newStatus || isUpdating || (newStatus === 'completed' && !canComplete)}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                title={newStatus === 'completed' && !canComplete ? 'يجب التحقق من التحويل البنكي أولاً' : ''}
                              >
                                {isUpdating ? 'جاري التحديث...' : 'تحديث'}
                              </button>
                            </div>
                          </div>
                          );
                        })()}
                      </div>

                      {/* Customer & Consultation Info */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Customer Information */}
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                          <div className="flex items-center mb-4">
                            <UserIcon className="h-5 w-5 text-purple-600 ml-2" />
                            <h3 className="text-lg font-semibold text-gray-900">معلومات العميل</h3>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <label className="text-sm font-medium text-gray-500">الاسم</label>
                              <p className="text-black font-medium">{booking.userName}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-500">البريد الإلكتروني</label>
                              <p className="text-black">{booking.userEmail}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-500">رقم الهاتف</label>
                              <p className="text-black font-mono">{booking.userPhone}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-500">معرف المستخدم</label>
                              <p className="text-gray-600 font-mono text-sm">{booking.userId._id}</p>
                            </div>
                          </div>
                        </div>

                        {/* Consultation Information */}
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                          <div className="flex items-center mb-4">
                            <ClockIcon className="h-5 w-5 text-purple-600 ml-2" />
                            <h3 className="text-lg font-semibold text-gray-900">معلومات الاستشارة</h3>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <label className="text-sm font-medium text-gray-500">عنوان الاستشارة</label>
                              <p className="text-black font-medium">{booking.consultationTitle}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-500">النوع</label>
                              <p className="text-black">{booking.consultationType}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-500">التصنيف</label>
                              <p className="text-black">{booking.consultationCategory}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-500">المدة</label>
                              <p className="text-black">{booking.duration} دقيقة</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-500">السعر</label>
                              <p className="!text-black font-bold text-lg">{formatCurrency(booking.amount, booking.currency)}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Scheduling Information */}
                      <div className="bg-gradient-to-r from-[#41ADE1]/20 to-purple-50 border border-[#41ADE1]/40 rounded-lg p-6">
                        <div className="flex items-center mb-4">
                          <CalendarIcon className="h-5 w-5 text-[#41ADE1] ml-2" />
                          <h3 className="text-lg font-semibold !text-black">معلومات الموعد</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="text-sm font-medium !text-black">التاريخ المفضل</label>
                            <p className="!text-black font-medium">{formatDate(booking.preferredDate)}</p>
                            <p className="!text-black">الوقت: {booking.preferredTime}</p>
                          </div>

                          {booking.alternativeDate && (
                            <div>
                              <label className="text-sm font-medium !text-black">التاريخ البديل</label>
                              <p className="!text-black">{formatDate(booking.alternativeDate)}</p>
                              {booking.alternativeTime && (
                                <p className="!text-black">الوقت: {booking.alternativeTime}</p>
                              )}
                            </div>
                          )}

                          {booking.confirmedDateTime && (
                            <div className="col-span-2 bg-white rounded-lg p-4 border-2 border-green-300">
                              <label className="text-sm font-medium text-green-700">الموعد المؤكد</label>
                              <p className="text-black font-bold text-lg">{formatDate(booking.confirmedDateTime)}</p>
                            </div>
                          )}

                          <div>
                            <label className="text-sm font-medium !text-black">المنطقة الزمنية</label>
                            <p className="!text-black">{booking.timezone}</p>
                          </div>

                          <div>
                            <label className="text-sm font-medium !text-black">نوع اللقاء</label>
                            <p className="!text-black flex items-center gap-2">
                              {booking.meetingType === 'online' ? (
                                <>
                                  <VideoCameraIcon className="h-5 w-5 text-[#41ADE1]" />
                                  اون لاين
                                </>
                              ) : (
                                <>
                                  <BuildingOfficeIcon className="h-5 w-5 text-gray-600" />
                                  حضوري
                                </>
                              )}
                            </p>
                          </div>

                          {booking.meetingType === 'online' && (
                            <>
                              {booking.meetingLink && (
                                <div className="col-span-2">
                                  <label className="text-sm font-medium text-gray-500">رابط الاجتماع</label>
                                  <a 
                                    href={booking.meetingLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[#41ADE1] hover:text-[#41ADE1] underline block break-all"
                                  >
                                    {booking.meetingLink}
                                  </a>
                                </div>
                              )}
                              {booking.meetingPassword && (
                                <div>
                                  <label className="text-sm font-medium text-gray-500">كلمة مرور الاجتماع</label>
                                  <p className="text-black font-mono">{booking.meetingPassword}</p>
                                </div>
                              )}
                              {booking.meetingId && (
                                <div>
                                  <label className="text-sm font-medium text-gray-500">معرف الاجتماع</label>
                                  <p className="text-black font-mono">{booking.meetingId}</p>
                                </div>
                              )}
                            </>
                          )}

                          {booking.meetingType === 'in_person' && booking.location && (
                            <div className="col-span-2 bg-white rounded-lg p-4">
                              <label className="text-sm font-medium text-gray-500 flex items-center gap-2 mb-2">
                                <MapPinIcon className="h-5 w-5" />
                                معلومات الموقع
                              </label>
                              {booking.location.address && <p className="text-black">{booking.location.address}</p>}
                              {booking.location.city && <p className="text-gray-600">{booking.location.city}, {booking.location.state}</p>}
                              {booking.location.mapLink && (
                                <a 
                                  href={booking.location.mapLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[#41ADE1] hover:text-[#41ADE1] underline mt-2 inline-block"
                                >
                                  عرض على الخريطة
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* User Health/Fitness Details */}
                      {booking.userDetails && (
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                          <div className="flex items-center mb-4">
                            <HeartIcon className="h-5 w-5 text-red-600 ml-2" />
                            <h3 className="text-lg font-semibold text-gray-900">المعلومات الصحية والبدنية</h3>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {booking.userDetails.age && (
                              <div>
                                <label className="text-sm font-medium text-gray-500">العمر</label>
                                <p className="text-black">{booking.userDetails.age} سنة</p>
                              </div>
                            )}

                            {booking.userDetails.gender && (
                              <div>
                                <label className="text-sm font-medium text-gray-500">الجنس</label>
                                <p className="text-black">{getGenderText(booking.userDetails.gender)}</p>
                              </div>
                            )}

                            {booking.userDetails.weight && (
                              <div>
                                <label className="text-sm font-medium text-gray-500">الوزن</label>
                                <p className="text-black">{booking.userDetails.weight} كجم</p>
                              </div>
                            )}

                            {booking.userDetails.height && (
                              <div>
                                <label className="text-sm font-medium text-gray-500">الطول</label>
                                <p className="text-black">{booking.userDetails.height} سم</p>
                              </div>
                            )}

                            {booking.userDetails.fitnessLevel && (
                              <div>
                                <label className="text-sm font-medium text-gray-500">مستوى اللياقة</label>
                                <p className="text-black">{getFitnessLevelText(booking.userDetails.fitnessLevel)}</p>
                              </div>
                            )}

                            {booking.userDetails.currentActivity && (
                              <div className="col-span-full">
                                <label className="text-sm font-medium text-gray-500">النشاط الحالي</label>
                                <p className="text-black">{booking.userDetails.currentActivity}</p>
                              </div>
                            )}

                            {booking.userDetails.goals && booking.userDetails.goals.length > 0 && (
                              <div className="col-span-full">
                                <label className="text-sm font-medium text-gray-500">الأهداف</label>
                                <div className="flex flex-wrap gap-2 mt-1">
                                  {booking.userDetails.goals.map((goal, index) => (
                                    <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-[#41ADE1]/30 text-[#41ADE1]">
                                      {goal}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {booking.userDetails.medicalConditions && (
                              <div className="col-span-full bg-yellow-50 p-4 rounded-lg">
                                <label className="text-sm font-medium text-yellow-800 flex items-center gap-2">
                                  <ExclamationTriangleIcon className="h-5 w-5" />
                                  الحالات الطبية
                                </label>
                                <p className="text-black mt-1 !text-black">{booking.userDetails.medicalConditions}</p>
                              </div>
                            )}

                            {booking.userDetails.injuries && (
                              <div className="col-span-full bg-red-50 p-4 rounded-lg">
                                <label className="text-sm font-medium text-red-800">الإصابات</label>
                                <p className="text-black mt-1 !text-black">{booking.userDetails.injuries}</p>
                              </div>
                            )}

                            {booking.userDetails.medications && (
                              <div className="col-span-full">
                                <label className="text-sm font-medium text-gray-500">الأدوية</label>
                                <p className="text-black">{booking.userDetails.medications}</p>
                              </div>
                            )}

                            {booking.userDetails.dietaryRestrictions && (
                              <div className="col-span-full">
                                <label className="text-sm font-medium text-gray-500">القيود الغذائية</label>
                                <p className="text-black">{booking.userDetails.dietaryRestrictions}</p>
                              </div>
                            )}

                            {booking.userDetails.additionalNotes && (
                              <div className="col-span-full">
                                <label className="text-sm font-medium text-gray-500">ملاحظات إضافية</label>
                                <p className="text-black bg-gray-50 p-3 rounded-lg">{booking.userDetails.additionalNotes}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Payment Information */}
                      <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center mb-4">
                          <svg className="h-5 w-5 text-green-600 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                          </svg>
                          <h3 className="text-lg font-semibold text-gray-900">معلومات الدفع</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div>
                            <label className="text-sm font-medium text-gray-500">المبلغ</label>
                            <p className="text-2xl font-bold text-green-600">{formatCurrency(booking.amount, booking.currency)}</p>
                          </div>

                          <div>
                            <label className="text-sm font-medium text-gray-500">حالة الدفع</label>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                              booking.paymentStatus === 'completed' ? 'bg-green-100 text-green-800' :
                              booking.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {booking.paymentStatus === 'completed' ? 'مكتمل' : booking.paymentStatus === 'pending' ? 'معلق' : 'فاشل'}
                            </span>
                          </div>

                          {booking.paymentMethod && (
                            <div>
                              <label className="text-sm font-medium text-gray-500">طريقة الدفع</label>
                              <p className="text-black capitalize">{booking.paymentMethod === 'bank_transfer' ? 'تحويل بنكي' : booking.paymentMethod}</p>
                            </div>
                          )}

                          {booking.transactionId && (
                            <div className="col-span-full">
                              <label className="text-sm font-medium text-gray-500">رقم المعاملة</label>
                              <p className="text-black font-mono text-sm">{booking.transactionId}</p>
                            </div>
                          )}
                        </div>

                        {/* Bank Transfer Details */}
                        {(booking.paymentMethod === 'bank_transfer' || booking.orderId?.paymentMethod === 'bank_transfer') && (
                          <div className="mt-6 pt-6 border-t border-gray-200">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center">
                                <svg className="h-5 w-5 text-[#41ADE1] ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                                <h4 className="text-lg font-semibold text-gray-900">تفاصيل التحويل البنكي</h4>
                              </div>
                              {booking.orderId?.bankTransfer?.verificationStatus === 'pending' && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                                  <ClockIcon className="h-4 w-4 ml-1" />
                                  في انتظار التحقق
                                </span>
                              )}
                              {booking.orderId?.bankTransfer?.verificationStatus === 'verified' && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                  <CheckCircleIcon className="h-4 w-4 ml-1" />
                                  تم التحقق
                                </span>
                              )}
                              {booking.orderId?.bankTransfer?.verificationStatus === 'rejected' && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                                  <XCircleIcon className="h-4 w-4 ml-1" />
                                  مرفوض
                                </span>
                              )}
                            </div>
                            
                            {booking.orderId?.bankTransfer && (
                              <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                  {booking.orderId.bankTransfer.transferReference && (
                                    <div>
                                      <label className="text-sm font-medium text-gray-500">رقم مرجع التحويل</label>
                                      <p className="text-black font-mono">{booking.orderId.bankTransfer.transferReference}</p>
                                    </div>
                                  )}
                                  
                                  {booking.orderId.bankTransfer.bankName && (
                                    <div>
                                      <label className="text-sm font-medium text-gray-500">اسم البنك</label>
                                      <p className="text-black">{booking.orderId.bankTransfer.bankName}</p>
                                    </div>
                                  )}
                                  
                                  {booking.orderId.bankTransfer.accountHolderName && (
                                    <div>
                                      <label className="text-sm font-medium text-gray-500">اسم صاحب الحساب</label>
                                      <p className="text-black">{booking.orderId.bankTransfer.accountHolderName}</p>
                                    </div>
                                  )}
                                  
                                  {booking.orderId.bankTransfer.transferDate && (
                                    <div>
                                      <label className="text-sm font-medium text-gray-500">تاريخ التحويل</label>
                                      <p className="text-black">{formatDate(booking.orderId.bankTransfer.transferDate)}</p>
                                    </div>
                                  )}
                                </div>
                              </>
                            )}

                            {/* Receipt Image - Always show this section for bank transfers */}
                            {(() => {
                              const receiptImage = booking.orderId?.bankTransfer?.receiptImage;
                              const hasImage = !!receiptImage && receiptImage.trim() !== '';
                              
                              return (
                              <div className="mb-6 bg-orange-50 border-2 border-orange-200 rounded-lg p-4">
                                <div className="mb-3 flex items-center gap-2">
                                  <svg className="h-5 w-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  <label className="text-base font-bold text-gray-900">صورة إيصال التحويل البنكي</label>
                                </div>
                                {hasImage ? (
                                  <div className="relative border-2 border-gray-300 rounded-lg overflow-hidden bg-white">
                                    <img 
                                      src={receiptImage} 
                                      alt="Receipt"
                                      className="w-full h-auto cursor-pointer hover:opacity-90 transition-opacity max-h-96 object-contain"
                                      onClick={() => {
                                        // Open image in new tab for full view
                                        window.open(receiptImage, '_blank');
                                      }}
                                      onError={(e) => {
                                        console.error('Failed to load receipt image:', receiptImage);
                                        // Show error message instead of broken image
                                        const parent = e.currentTarget.parentElement;
                                        if (parent) {
                                          parent.innerHTML = `
                                            <div class="border-2 border-dashed border-red-300 rounded-lg p-8 text-center bg-red-50">
                                              <svg class="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                              </svg>
                                              <p class="mt-2 text-sm font-bold text-red-700">فشل تحميل الصورة</p>
                                              <p class="mt-1 text-xs text-red-600">يرجى التحقق من رابط الصورة</p>
                                            </div>
                                          `;
                                        }
                                      }}
                                    />
                                    <button
                                      onClick={() => window.open(receiptImage, '_blank')}
                                      className="absolute top-2 right-2 bg-white/90 hover:bg-white p-2 rounded-lg shadow-md transition-colors"
                                      title="فتح الصورة في نافذة جديدة"
                                    >
                                      <svg className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                      </svg>
                                    </button>
                                  </div>
                                ) : (
                                  <div className="border-2 border-dashed border-red-300 rounded-lg p-8 text-center bg-red-50">
                                    <svg className="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    <p className="mt-2 text-sm font-bold text-red-700">لم يتم رفع صورة الإيصال</p>
                                    <p className="mt-1 text-xs text-red-600">
                                      ⚠️ تحذير: لا يمكن التحقق من التحويل بدون صورة إيصال
                                    </p>
                                  </div>
                                )}
                              </div>
                              );
                            })()}

                            {/* Verification Actions - Always show for bank transfers that need approval */}
                            {(() => {
                              const isBankTransfer = booking.paymentMethod === 'bank_transfer' || booking.orderId?.paymentMethod === 'bank_transfer';
                              const verificationStatus = booking.orderId?.bankTransfer?.verificationStatus;
                              const isPending = !verificationStatus || verificationStatus === 'pending';
                              const receiptImage = booking.orderId?.bankTransfer?.receiptImage;
                              const hasReceiptImage = !!receiptImage && receiptImage.trim() !== '';
                              
                              return isBankTransfer && isPending && onVerifyBankTransfer && booking.orderId?._id && (
                              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-lg p-6 shadow-lg">
                                <div className="flex items-center gap-3 mb-4">
                                  <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />
                                  <h4 className="text-lg font-bold !text-black">التحقق من التحويل البنكي</h4>
                                </div>
                                {hasReceiptImage ? (
                                  <p className="text-sm text-gray-700 mb-4 bg-white p-3 rounded-lg border border-yellow-200">
                                    يرجى مراجعة صورة الإيصال أعلاه والتحقق من صحة التحويل البنكي. يمكنك الموافقة على الطلب وتفعيله أو رفضه مع إضافة سبب الرفض.
                                  </p>
                                ) : (
                                  <div className="mb-4 p-4 bg-red-50 border-2 border-red-300 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                      <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                                      <p className="text-sm font-bold text-red-800">⚠️ تحذير: لم يتم رفع صورة الإيصال</p>
                                    </div>
                                    <p className="text-xs text-red-700">
                                      لا توجد صورة إيصال للتحويل البنكي. يمكنك رفض التحويل أو الانتظار حتى يتم رفع صورة الإيصال من قبل العميل.
                                    </p>
                                  </div>
                                )}
                                
                                <div className="mb-4">
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    سبب الرفض (في حالة الرفض فقط)
                                  </label>
                                  <textarea
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    placeholder="اختياري - أدخل سبب الرفض في حالة رفض التحويل..."
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#41ADE1] focus:border-transparent"
                                  />
                                </div>
                                
                                <div className="flex items-center gap-4">
                                  <button
                                    onClick={async () => {
                                      if (!onVerifyBankTransfer || !booking.orderId?._id) return;
                                      setIsVerifying(true);
                                      try {
                                        await onVerifyBankTransfer(booking.orderId._id, 'verified', rejectionReason);
                                        setRejectionReason('');
                                        await fetchConsultationBooking(); // Refresh data
                                      } catch (error) {
                                        console.error('Error verifying bank transfer:', error);
                                      } finally {
                                        setIsVerifying(false);
                                      }
                                    }}
                                    disabled={isVerifying || !hasReceiptImage}
                                    className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold shadow-md"
                                    title={!hasReceiptImage ? 'لا يمكن الموافقة بدون صورة إيصال' : ''}
                                  >
                                    <CheckCircleIcon className="h-5 w-5 ml-2" />
                                    {isVerifying ? 'جاري التحقق...' : '✓ الموافقة وتفعيل الطلب'}
                                  </button>
                                  <button
                                    onClick={async () => {
                                      if (!onVerifyBankTransfer || !booking.orderId?._id) return;
                                      setIsVerifying(true);
                                      try {
                                        await onVerifyBankTransfer(booking.orderId._id, 'rejected', rejectionReason || (hasReceiptImage ? 'تم رفض التحويل من قبل الإدارة' : 'لم يتم رفع صورة الإيصال'));
                                        setRejectionReason('');
                                        await fetchConsultationBooking(); // Refresh data
                                      } catch (error) {
                                        console.error('Error rejecting bank transfer:', error);
                                      } finally {
                                        setIsVerifying(false);
                                      }
                                    }}
                                    disabled={isVerifying}
                                    className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold shadow-md"
                                  >
                                    <XCircleIcon className="h-5 w-5 ml-2" />
                                    {isVerifying ? 'جاري الرفض...' : '✗ رفض التحويل'}
                                  </button>
                                </div>
                              </div>
                              );
                            })()}
                            
                            {/* Show info message if bank transfer is verified or rejected */}
                            {booking.orderId?.bankTransfer?.verificationStatus === 'verified' && (
                              <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 mt-4">
                                <div className="flex items-center gap-2">
                                  <CheckCircleIcon className="h-5 w-5 text-green-600" />
                                  <p className="!text-black font-semibold">تم التحقق من التحويل البنكي بنجاح وتم تفعيل الطلب</p>
                                </div>
                                {booking.orderId.bankTransfer.verifiedAt && (
                                  <p className="text-sm text-green-700 mt-2">
                                    تاريخ التحقق: {formatDate(booking.orderId.bankTransfer.verifiedAt)}
                                  </p>
                                )}
                              </div>
                            )}
                            
                            {booking.orderId?.bankTransfer?.verificationStatus === 'rejected' && (
                              <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 mt-4">
                                <div className="flex items-center gap-2">
                                  <XCircleIcon className="h-5 w-5 text-red-600" />
                                  <p className="text-red-800 font-semibold">تم رفض التحويل البنكي</p>
                                </div>
                                {booking.orderId.bankTransfer.rejectionReason && (
                                  <p className="text-sm text-red-700 mt-2 bg-white p-2 rounded border border-red-200">
                                    <span className="font-semibold">سبب الرفض:</span> {booking.orderId.bankTransfer.rejectionReason}
                                  </p>
                                )}
                              </div>
                            )}

                          </div>
                        )}
                      </div>

                      {/* Admin Notes */}
                      {(booking.adminNotes || booking.internalNotes || booking.consultantNotes) && (
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                          <div className="flex items-center mb-4">
                            <DocumentTextIcon className="h-5 w-5 text-gray-600 ml-2" />
                            <h3 className="text-lg font-semibold !text-black">ملاحظات</h3>
                          </div>

                          <div className="space-y-4">
                            {booking.adminNotes && (
                              <div>
                                <label className="text-sm font-medium text-gray-500">ملاحظات الإدارة</label>
                                <p className="text-black bg-[#41ADE1]/20 p-3 rounded-lg">{booking.adminNotes}</p>
                              </div>
                            )}

                            {booking.internalNotes && (
                              <div>
                                <label className="text-sm font-medium text-gray-500">ملاحظات داخلية</label>
                                <p className="text-black bg-gray-50 p-3 rounded-lg">{booking.internalNotes}</p>
                              </div>
                            )}

                            {booking.consultantNotes && (
                              <div>
                                <label className="text-sm font-medium text-gray-500">ملاحظات المستشار</label>
                                <p className="text-black bg-green-50 p-3 rounded-lg">{booking.consultantNotes}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* User Feedback */}
                      {booking.userFeedback && booking.userFeedback.rating && (
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                          <h3 className="text-lg font-semibold !text-black mb-4">تقييم العميل</h3>
                          
                          <div className="flex items-center gap-2 mb-3">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <svg
                                  key={star}
                                  className={`h-6 w-6 ${star <= (booking.userFeedback?.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                            <span className="text-lg font-medium !text-black">
                              {booking.userFeedback.rating}/5
                            </span>
                          </div>

                          {booking.userFeedback.comment && (
                            <p className="text-black bg-gray-50 p-4 rounded-lg">
                              {booking.userFeedback.comment}
                            </p>
                          )}

                          {booking.userFeedback.submittedAt && (
                            <p className="text-xs text-gray-500 mt-2">
                              تم التقديم: {formatDate(booking.userFeedback.submittedAt)}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Timeline */}
                      <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center mb-4">
                          <ClockIcon className="h-5 w-5 text-gray-600 ml-2" />
                          <h3 className="text-lg font-semibold text-gray-900">الجدول الزمني</h3>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-[#41ADE1] rounded-full"></div>
                            <div>
                              <p className="text-sm font-medium text-black">تم إنشاء الحجز</p>
                              <p className="text-xs text-gray-500">{formatDate(booking.createdAt)}</p>
                            </div>
                          </div>

                          {booking.paymentCompletedAt && (
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <div>
                                <p className="text-sm font-medium !text-black">تم الدفع</p>
                                <p className="text-xs text-gray-500">{formatDate(booking.paymentCompletedAt)}</p>
                              </div>
                            </div>
                          )}

                          {booking.confirmedAt && (
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <div>
                                <p className="text-sm font-medium">تم تأكيد الحجز</p>
                                <p className="text-xs text-gray-500">{formatDate(booking.confirmedAt)}</p>
                              </div>
                            </div>
                          )}

                          {booking.completedAt && (
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                              <div>
                                <p className="text-sm font-medium !text-black">تم إكمال الاستشارة</p>
                                <p className="text-xs text-gray-500">{formatDate(booking.completedAt)}</p>
                              </div>
                            </div>
                          )}

                          {booking.cancelledAt && (
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                              <div>
                                <p className="text-sm font-medium !text-black">تم إلغاء الحجز</p>
                                <p className="text-xs text-gray-500">{formatDate(booking.cancelledAt)}</p>
                                {booking.cancellationReason && (
                                  <p className="text-xs text-red-600 mt-1">السبب: {booking.cancellationReason}</p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
                  <button
                    onClick={onClose}
                    className="px-6 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    إغلاق
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

