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
}

export default function ConsultationDetailsModal({
  isOpen,
  onClose,
  consultationBookingId,
  onUpdateStatus
}: ConsultationDetailsModalProps) {
  const [booking, setBooking] = useState<ConsultationBookingDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showStatusUpdate, setShowStatusUpdate] = useState(false);
  const [newStatus, setNewStatus] = useState<string>('');
  const [statusNotes, setStatusNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

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

    setIsUpdating(true);
    try {
      await onUpdateStatus(booking._id, newStatus, statusNotes);
      setShowStatusUpdate(false);
      setNewStatus('');
      setStatusNotes('');
      await fetchConsultationBooking(); // Refresh data
    } catch (error) {
      console.error('Error updating status:', error);
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
        return 'bg-blue-100 text-blue-800 border-blue-200';
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
              <Dialog.Panel className="w-full max-w-6xl transform overflow-hidden rounded-2xl bg-white text-right shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
                  <div>
                    <Dialog.Title className="text-2xl font-bold text-gray-900">
                      تفاصيل حجز الاستشارة
                    </Dialog.Title>
                    {booking && (
                      <p className="text-sm text-gray-600 mt-1">
                        رقم الحجز: {booking.bookingNumber}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
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
                      {/* Status Section */}
                      <div className="bg-gray-50 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">حالة الحجز</h3>
                          <button
                            onClick={() => setShowStatusUpdate(!showStatusUpdate)}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                          >
                            تحديث الحالة
                          </button>
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
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              حجز أول
                            </span>
                          )}
                        </div>

                        {showStatusUpdate && (
                          <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
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
                                  <option value="completed">مكتمل</option>
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
                                disabled={!newStatus || isUpdating}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                              >
                                {isUpdating ? 'جاري التحديث...' : 'تحديث'}
                              </button>
                            </div>
                          </div>
                        )}
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
                              <p className="text-gray-900 font-medium">{booking.userName}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-500">البريد الإلكتروني</label>
                              <p className="text-gray-900">{booking.userEmail}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-500">رقم الهاتف</label>
                              <p className="text-gray-900 font-mono">{booking.userPhone}</p>
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
                              <p className="text-gray-900 font-medium">{booking.consultationTitle}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-500">النوع</label>
                              <p className="text-gray-900">{booking.consultationType}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-500">التصنيف</label>
                              <p className="text-gray-900">{booking.consultationCategory}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-500">المدة</label>
                              <p className="text-gray-900">{booking.duration} دقيقة</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-500">السعر</label>
                              <p className="text-gray-900 font-bold text-lg">{formatCurrency(booking.amount, booking.currency)}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Scheduling Information */}
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
                        <div className="flex items-center mb-4">
                          <CalendarIcon className="h-5 w-5 text-blue-600 ml-2" />
                          <h3 className="text-lg font-semibold text-gray-900">معلومات الموعد</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="text-sm font-medium text-gray-500">التاريخ المفضل</label>
                            <p className="text-gray-900 font-medium">{formatDate(booking.preferredDate)}</p>
                            <p className="text-gray-600">الوقت: {booking.preferredTime}</p>
                          </div>

                          {booking.alternativeDate && (
                            <div>
                              <label className="text-sm font-medium text-gray-500">التاريخ البديل</label>
                              <p className="text-gray-900">{formatDate(booking.alternativeDate)}</p>
                              {booking.alternativeTime && (
                                <p className="text-gray-600">الوقت: {booking.alternativeTime}</p>
                              )}
                            </div>
                          )}

                          {booking.confirmedDateTime && (
                            <div className="col-span-2 bg-white rounded-lg p-4 border-2 border-green-300">
                              <label className="text-sm font-medium text-green-700">الموعد المؤكد</label>
                              <p className="text-gray-900 font-bold text-lg">{formatDate(booking.confirmedDateTime)}</p>
                            </div>
                          )}

                          <div>
                            <label className="text-sm font-medium text-gray-500">المنطقة الزمنية</label>
                            <p className="text-gray-900">{booking.timezone}</p>
                          </div>

                          <div>
                            <label className="text-sm font-medium text-gray-500">نوع اللقاء</label>
                            <p className="text-gray-900 flex items-center gap-2">
                              {booking.meetingType === 'online' ? (
                                <>
                                  <VideoCameraIcon className="h-5 w-5 text-blue-600" />
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
                                    className="text-blue-600 hover:text-blue-800 underline block break-all"
                                  >
                                    {booking.meetingLink}
                                  </a>
                                </div>
                              )}
                              {booking.meetingPassword && (
                                <div>
                                  <label className="text-sm font-medium text-gray-500">كلمة مرور الاجتماع</label>
                                  <p className="text-gray-900 font-mono">{booking.meetingPassword}</p>
                                </div>
                              )}
                              {booking.meetingId && (
                                <div>
                                  <label className="text-sm font-medium text-gray-500">معرف الاجتماع</label>
                                  <p className="text-gray-900 font-mono">{booking.meetingId}</p>
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
                              {booking.location.address && <p className="text-gray-900">{booking.location.address}</p>}
                              {booking.location.city && <p className="text-gray-600">{booking.location.city}, {booking.location.state}</p>}
                              {booking.location.mapLink && (
                                <a 
                                  href={booking.location.mapLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 underline mt-2 inline-block"
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
                                <p className="text-gray-900">{booking.userDetails.age} سنة</p>
                              </div>
                            )}

                            {booking.userDetails.gender && (
                              <div>
                                <label className="text-sm font-medium text-gray-500">الجنس</label>
                                <p className="text-gray-900">{getGenderText(booking.userDetails.gender)}</p>
                              </div>
                            )}

                            {booking.userDetails.weight && (
                              <div>
                                <label className="text-sm font-medium text-gray-500">الوزن</label>
                                <p className="text-gray-900">{booking.userDetails.weight} كجم</p>
                              </div>
                            )}

                            {booking.userDetails.height && (
                              <div>
                                <label className="text-sm font-medium text-gray-500">الطول</label>
                                <p className="text-gray-900">{booking.userDetails.height} سم</p>
                              </div>
                            )}

                            {booking.userDetails.fitnessLevel && (
                              <div>
                                <label className="text-sm font-medium text-gray-500">مستوى اللياقة</label>
                                <p className="text-gray-900">{getFitnessLevelText(booking.userDetails.fitnessLevel)}</p>
                              </div>
                            )}

                            {booking.userDetails.currentActivity && (
                              <div className="col-span-full">
                                <label className="text-sm font-medium text-gray-500">النشاط الحالي</label>
                                <p className="text-gray-900">{booking.userDetails.currentActivity}</p>
                              </div>
                            )}

                            {booking.userDetails.goals && booking.userDetails.goals.length > 0 && (
                              <div className="col-span-full">
                                <label className="text-sm font-medium text-gray-500">الأهداف</label>
                                <div className="flex flex-wrap gap-2 mt-1">
                                  {booking.userDetails.goals.map((goal, index) => (
                                    <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
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
                                <p className="text-gray-900 mt-1">{booking.userDetails.medicalConditions}</p>
                              </div>
                            )}

                            {booking.userDetails.injuries && (
                              <div className="col-span-full bg-red-50 p-4 rounded-lg">
                                <label className="text-sm font-medium text-red-800">الإصابات</label>
                                <p className="text-gray-900 mt-1">{booking.userDetails.injuries}</p>
                              </div>
                            )}

                            {booking.userDetails.medications && (
                              <div className="col-span-full">
                                <label className="text-sm font-medium text-gray-500">الأدوية</label>
                                <p className="text-gray-900">{booking.userDetails.medications}</p>
                              </div>
                            )}

                            {booking.userDetails.dietaryRestrictions && (
                              <div className="col-span-full">
                                <label className="text-sm font-medium text-gray-500">القيود الغذائية</label>
                                <p className="text-gray-900">{booking.userDetails.dietaryRestrictions}</p>
                              </div>
                            )}

                            {booking.userDetails.additionalNotes && (
                              <div className="col-span-full">
                                <label className="text-sm font-medium text-gray-500">ملاحظات إضافية</label>
                                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{booking.userDetails.additionalNotes}</p>
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
                              <p className="text-gray-900 capitalize">{booking.paymentMethod}</p>
                            </div>
                          )}

                          {booking.transactionId && (
                            <div className="col-span-full">
                              <label className="text-sm font-medium text-gray-500">رقم المعاملة</label>
                              <p className="text-gray-900 font-mono text-sm">{booking.transactionId}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Admin Notes */}
                      {(booking.adminNotes || booking.internalNotes || booking.consultantNotes) && (
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                          <div className="flex items-center mb-4">
                            <DocumentTextIcon className="h-5 w-5 text-gray-600 ml-2" />
                            <h3 className="text-lg font-semibold text-gray-900">ملاحظات</h3>
                          </div>

                          <div className="space-y-4">
                            {booking.adminNotes && (
                              <div>
                                <label className="text-sm font-medium text-gray-500">ملاحظات الإدارة</label>
                                <p className="text-gray-900 bg-blue-50 p-3 rounded-lg">{booking.adminNotes}</p>
                              </div>
                            )}

                            {booking.internalNotes && (
                              <div>
                                <label className="text-sm font-medium text-gray-500">ملاحظات داخلية</label>
                                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{booking.internalNotes}</p>
                              </div>
                            )}

                            {booking.consultantNotes && (
                              <div>
                                <label className="text-sm font-medium text-gray-500">ملاحظات المستشار</label>
                                <p className="text-gray-900 bg-green-50 p-3 rounded-lg">{booking.consultantNotes}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* User Feedback */}
                      {booking.userFeedback && booking.userFeedback.rating && (
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">تقييم العميل</h3>
                          
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
                            <span className="text-lg font-medium text-gray-900">
                              {booking.userFeedback.rating}/5
                            </span>
                          </div>

                          {booking.userFeedback.comment && (
                            <p className="text-gray-900 bg-gray-50 p-4 rounded-lg">
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
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">تم إنشاء الحجز</p>
                              <p className="text-xs text-gray-500">{formatDate(booking.createdAt)}</p>
                            </div>
                          </div>

                          {booking.paymentCompletedAt && (
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">تم الدفع</p>
                                <p className="text-xs text-gray-500">{formatDate(booking.paymentCompletedAt)}</p>
                              </div>
                            </div>
                          )}

                          {booking.confirmedAt && (
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">تم تأكيد الحجز</p>
                                <p className="text-xs text-gray-500">{formatDate(booking.confirmedAt)}</p>
                              </div>
                            </div>
                          )}

                          {booking.completedAt && (
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">تم إكمال الاستشارة</p>
                                <p className="text-xs text-gray-500">{formatDate(booking.completedAt)}</p>
                              </div>
                            </div>
                          )}

                          {booking.cancelledAt && (
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">تم إلغاء الحجز</p>
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

