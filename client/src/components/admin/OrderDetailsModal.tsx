'use client';

import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import {
  XMarkIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ArrowPathIcon,
  CurrencyDollarIcon,
  UserIcon,
  AcademicCapIcon,
  CalendarIcon,
  CreditCardIcon,
  DocumentTextIcon,
  PencilIcon,
  PrinterIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';

// Extended Order interface for the modal
interface OrderDetails {
  _id?: string;
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  userPhone?: string;
  userInfo?: {
    _id: string;
    displayName: string;
    email: string;
  };
  courseId?: string;
  courseTitle?: string;
  courseThumbnail?: string;
  courseInfo?: {
    _id: string;
    title: string;
    thumbnail?: string;
  };
  consultationBookingId?: string;
  consultationTitle?: string;
  consultationBookingNumber?: string;
  consultationInfo?: {
    _id: string;
    consultationId: {
      title: string;
      _id: string;
    };
    bookingNumber: string;
  };
  orderType?: 'course' | 'consultation';
  amount: number;
  currency?: string;
  originalAmount?: number;
  discountAmount?: number;
  taxAmount?: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'processing';
  paymentMethod: string;
  paymentIntentId?: string;
  transactionId?: string;
  couponCode?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  refundedAt?: string;
  processingTime?: number;
  notes?: string;
  refundReason?: string;
  isNew?: boolean;
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
}

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderDetails | null;
  onUpdateStatus?: (orderId: string, status: string, notes?: string) => void;
  onVerifyBankTransfer?: (orderId: string, status: 'verified' | 'rejected', reason?: string) => void;
}

export default function OrderDetailsModal({ 
  isOpen, 
  onClose, 
  order, 
  onUpdateStatus,
  onVerifyBankTransfer 
}: OrderDetailsModalProps) {
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState<string>('');
  const [statusNotes, setStatusNotes] = useState('');
  const [showStatusUpdate, setShowStatusUpdate] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  if (!order) return null;

  // Ensure order data is properly structured (no nested objects)
  const sanitizedOrder = {
    ...order,
    userId: order.userId,
    courseId: order.courseId,
    consultationBookingId: order.consultationBookingId,
    userEmail: order.userEmail || order.userInfo?.email || '',
    userName: order.userName || order.userInfo?.displayName || '',
    courseTitle: order.courseTitle || order.courseInfo?.title || '',
    courseThumbnail: order.courseThumbnail || order.courseInfo?.thumbnail || '',
    consultationTitle: order.consultationTitle || order.consultationInfo?.consultationId?.title || '',
    consultationBookingNumber: order.consultationBookingNumber || order.consultationInfo?.bookingNumber || '',
    orderType: order.orderType || (order.courseId ? 'course' as const : order.consultationBookingId ? 'consultation' as const : undefined)
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'refunded':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'مكتمل';
      case 'pending':
        return 'معلق';
      case 'processing':
        return 'قيد المعالجة';
      case 'failed':
        return 'فاشل';
      case 'refunded':
        return 'مسترد';
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5" />;
      case 'pending':
        return <ClockIcon className="h-5 w-5" />;
      case 'processing':
        return <ArrowPathIcon className="h-5 w-5 animate-spin" />;
      case 'failed':
        return <XCircleIcon className="h-5 w-5" />;
      case 'refunded':
        return <ExclamationTriangleIcon className="h-5 w-5" />;
      default:
        return <ClockIcon className="h-5 w-5" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      calendar: 'gregory',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const handleStatusUpdate = async () => {
    if (!newStatus || !onUpdateStatus) return;
    
    setIsUpdatingStatus(true);
    try {
      await onUpdateStatus(sanitizedOrder.id, newStatus, statusNotes);
      setShowStatusUpdate(false);
      setNewStatus('');
      setStatusNotes('');
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportOrder = () => {
    const orderData = {
      orderId: sanitizedOrder.id,
      customer: sanitizedOrder.userName,
      email: sanitizedOrder.userEmail,
      course: sanitizedOrder.courseTitle,
      amount: sanitizedOrder.amount,
      status: sanitizedOrder.status,
      paymentMethod: sanitizedOrder.paymentMethod,
      createdAt: sanitizedOrder.createdAt,
      transactionId: sanitizedOrder.transactionId
    };
    
    const dataStr = JSON.stringify(orderData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `order-${sanitizedOrder.id}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleVerifyBankTransfer = async (verificationStatus: 'verified' | 'rejected') => {
    if (!onVerifyBankTransfer) return;
    
    if (verificationStatus === 'rejected' && !rejectionReason) {
      alert('يرجى إدخال سبب الرفض');
      return;
    }

    setIsVerifying(true);
    try {
      await onVerifyBankTransfer(sanitizedOrder._id || sanitizedOrder.id, verificationStatus, rejectionReason);
      setRejectionReason('');
    } catch (error) {
      console.error('Error verifying bank transfer:', error);
    } finally {
      setIsVerifying(false);
    }
  };

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
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white text-right shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={handlePrint}
                      className="inline-flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <PrinterIcon className="h-4 w-4 ml-2" />
                      طباعة
                    </button>
                    <button
                      onClick={handleExportOrder}
                      className="inline-flex items-center px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      <ArrowTopRightOnSquareIcon className="h-4 w-4 ml-2" />
                      تصدير
                    </button>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div>
                      <Dialog.Title className="text-xl font-bold text-gray-900">
                        تفاصيل الطلب {sanitizedOrder.id}
                      </Dialog.Title>
                      <p className="text-sm text-gray-500 mt-1">
                        تم الإنشاء في {formatDate(sanitizedOrder.createdAt)}
                      </p>
                    </div>
                    {sanitizedOrder.isNew && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        جديد
                      </span>
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
                <div className="p-6 space-y-8">
                  {/* Order Status */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">حالة الطلب</h3>
                      <button
                        onClick={() => setShowStatusUpdate(!showStatusUpdate)}
                        className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <PencilIcon className="h-4 w-4 ml-2" />
                        تحديث الحالة
                      </button>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(sanitizedOrder.status)}`}>
                        {getStatusIcon(sanitizedOrder.status)}
                        <span className="mr-2">{getStatusText(sanitizedOrder.status)}</span>
                      </div>
                      
                      {sanitizedOrder.processingTime && (
                        <span className="text-sm text-gray-500">
                          وقت المعالجة: {sanitizedOrder.processingTime} دقيقة
                        </span>
                      )}
                    </div>

                    {/* Status Update Form */}
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
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="">اختر الحالة</option>
                              <option value="pending">معلق</option>
                              <option value="processing">قيد المعالجة</option>
                              <option value="completed">مكتمل</option>
                              <option value="failed">فاشل</option>
                              <option value="refunded">مسترد</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              ملاحظات (اختياري)
                            </label>
                            <input
                              type="text"
                              value={statusNotes}
                              onChange={(e) => setStatusNotes(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="أضف ملاحظة..."
                            />
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-end space-x-3 mt-4">
                          <button
                            onClick={() => setShowStatusUpdate(false)}
                            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                          >
                            إلغاء
                          </button>
                          <button
                            onClick={handleStatusUpdate}
                            disabled={!newStatus || isUpdatingStatus}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {isUpdatingStatus ? 'جاري التحديث...' : 'تحديث'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Customer Information */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center mb-4">
                        <UserIcon className="h-5 w-5 text-gray-400 ml-2" />
                        <h3 className="text-lg font-semibold text-gray-900">معلومات العميل</h3>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-500">الاسم</label>
                          <p className="text-gray-900">{sanitizedOrder.userName}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">البريد الإلكتروني</label>
                          <p className="text-gray-900">{sanitizedOrder.userEmail}</p>
                        </div>
                        {sanitizedOrder.userPhone && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">رقم الهاتف</label>
                            <p className="text-gray-900">{sanitizedOrder.userPhone}</p>
                          </div>
                        )}
                        <div>
                          <label className="text-sm font-medium text-gray-500">معرف المستخدم</label>
                          <p className="text-gray-900 font-mono text-sm">{sanitizedOrder.userId}</p>
                        </div>
                      </div>
                    </div>

                    {/* Course/Consultation Information */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center mb-4">
                        {sanitizedOrder.orderType === 'course' ? (
                          <>
                            <AcademicCapIcon className="h-5 w-5 text-gray-400 ml-2" />
                            <h3 className="text-lg font-semibold text-gray-900">معلومات الدورة</h3>
                          </>
                        ) : (
                          <>
                            <ClockIcon className="h-5 w-5 text-gray-400 ml-2" />
                            <h3 className="text-lg font-semibold text-gray-900">معلومات الاستشارة</h3>
                          </>
                        )}
                      </div>
                      
                      <div className="space-y-3">
                        {sanitizedOrder.orderType === 'course' ? (
                          <>
                            {sanitizedOrder.courseThumbnail && (
                              <div className="w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
                                <img 
                                  src={sanitizedOrder.courseThumbnail} 
                                  alt={sanitizedOrder.courseTitle}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <div>
                              <label className="text-sm font-medium text-gray-500">عنوان الدورة</label>
                              <p className="text-gray-900">{sanitizedOrder.courseTitle}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-500">معرف الدورة</label>
                              <p className="text-gray-900 font-mono text-sm">{sanitizedOrder.courseId}</p>
                            </div>
                          </>
                        ) : (
                          <>
                            <div>
                              <label className="text-sm font-medium text-gray-500">عنوان الاستشارة</label>
                              <p className="text-gray-900">{sanitizedOrder.consultationTitle}</p>
                            </div>
                            {sanitizedOrder.consultationBookingNumber && (
                              <div>
                                <label className="text-sm font-medium text-gray-500">رقم الحجز</label>
                                <p className="text-gray-900 font-mono text-sm">{sanitizedOrder.consultationBookingNumber}</p>
                              </div>
                            )}
                            <div>
                              <label className="text-sm font-medium text-gray-500">معرف الحجز</label>
                              <p className="text-gray-900 font-mono text-sm">{sanitizedOrder.consultationBookingId}</p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Payment Information */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center mb-4">
                      <CurrencyDollarIcon className="h-5 w-5 text-gray-400 ml-2" />
                      <h3 className="text-lg font-semibold text-gray-900">معلومات الدفع</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-500">المبلغ الإجمالي</label>
                          <p className="text-2xl font-bold text-gray-900">{formatCurrency(sanitizedOrder.amount)}</p>
                        </div>
                        
                        {sanitizedOrder.originalAmount && sanitizedOrder.originalAmount !== sanitizedOrder.amount && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">المبلغ الأصلي</label>
                            <p className="text-gray-500 line-through">{formatCurrency(sanitizedOrder.originalAmount)}</p>
                          </div>
                        )}
                        
                        {sanitizedOrder.discountAmount && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">مبلغ الخصم</label>
                            <p className="text-green-600">-{formatCurrency(sanitizedOrder.discountAmount)}</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-500">طريقة الدفع</label>
                          <p className="text-gray-900 capitalize">{sanitizedOrder.paymentMethod}</p>
                        </div>
                        
                        {sanitizedOrder.transactionId && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">رقم المعاملة</label>
                            <p className="text-gray-900 font-mono text-sm">{sanitizedOrder.transactionId}</p>
                          </div>
                        )}
                        
                        {sanitizedOrder.paymentIntentId && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">معرف الدفع</label>
                            <p className="text-gray-900 font-mono text-sm">{sanitizedOrder.paymentIntentId}</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-3">
                        {sanitizedOrder.couponCode && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">كود الخصم</label>
                            <p className="text-gray-900 font-mono">{sanitizedOrder.couponCode}</p>
                          </div>
                        )}
                        
                        {sanitizedOrder.taxAmount && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">الضرائب</label>
                            <p className="text-gray-900">{formatCurrency(sanitizedOrder.taxAmount)}</p>
                          </div>
                        )}
                        
                        <div>
                          <label className="text-sm font-medium text-gray-500">العملة</label>
                          <p className="text-gray-900">{sanitizedOrder.currency || 'USD'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center mb-4">
                      <CalendarIcon className="h-5 w-5 text-gray-400 ml-2" />
                      <h3 className="text-lg font-semibold text-gray-900">الجدول الزمني</h3>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">تم إنشاء الطلب</p>
                          <p className="text-xs text-gray-500">{formatDate(sanitizedOrder.createdAt)}</p>
                        </div>
                      </div>
                      
                      {sanitizedOrder.updatedAt !== sanitizedOrder.createdAt && (
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">آخر تحديث</p>
                            <p className="text-xs text-gray-500">{formatDate(sanitizedOrder.updatedAt)}</p>
                          </div>
                        </div>
                      )}
                      
                      {sanitizedOrder.completedAt && (
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">تم إكمال الطلب</p>
                            <p className="text-xs text-gray-500">{formatDate(sanitizedOrder.completedAt)}</p>
                          </div>
                        </div>
                      )}
                      
                      {sanitizedOrder.refundedAt && (
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">تم استرداد الطلب</p>
                            <p className="text-xs text-gray-500">{formatDate(sanitizedOrder.refundedAt)}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bank Transfer Details */}
                  {sanitizedOrder.paymentMethod === 'bank_transfer' && sanitizedOrder.bankTransfer && (
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <CreditCardIcon className="h-5 w-5 text-gray-400 ml-2" />
                          <h3 className="text-lg font-semibold text-gray-900">تفاصيل التحويل البنكي</h3>
                        </div>
                        {sanitizedOrder.bankTransfer.verificationStatus === 'pending' && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                            <ClockIcon className="h-4 w-4 ml-1" />
                            في انتظار التحقق
                          </span>
                        )}
                        {sanitizedOrder.bankTransfer.verificationStatus === 'verified' && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                            <CheckCircleIcon className="h-4 w-4 ml-1" />
                            تم التحقق
                          </span>
                        )}
                        {sanitizedOrder.bankTransfer.verificationStatus === 'rejected' && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                            <XCircleIcon className="h-4 w-4 ml-1" />
                            مرفوض
                          </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        {sanitizedOrder.bankTransfer.transferReference && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">رقم مرجع التحويل</label>
                            <p className="text-gray-900 font-mono">{sanitizedOrder.bankTransfer.transferReference}</p>
                          </div>
                        )}
                        
                        {sanitizedOrder.bankTransfer.bankName && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">اسم البنك</label>
                            <p className="text-gray-900">{sanitizedOrder.bankTransfer.bankName}</p>
                          </div>
                        )}
                        
                        {sanitizedOrder.bankTransfer.accountHolderName && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">اسم صاحب الحساب</label>
                            <p className="text-gray-900">{sanitizedOrder.bankTransfer.accountHolderName}</p>
                          </div>
                        )}
                        
                        {sanitizedOrder.bankTransfer.transferDate && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">تاريخ التحويل</label>
                            <p className="text-gray-900">{formatDate(sanitizedOrder.bankTransfer.transferDate)}</p>
                          </div>
                        )}
                      </div>

                      {/* Receipt Image */}
                      <div className="mb-6">
                        <label className="text-sm font-medium text-gray-500 block mb-2">صورة الإيصال</label>
                        {sanitizedOrder.bankTransfer.receiptImage ? (
                          <div className="relative border-2 border-gray-300 rounded-lg overflow-hidden">
                            <img 
                              src={sanitizedOrder.bankTransfer.receiptImage} 
                              alt="Receipt"
                              className="w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() => setShowReceiptModal(true)}
                              onError={(e) => {
                                console.error('Failed to load receipt image:', sanitizedOrder.bankTransfer?.receiptImage);
                                e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"%3E%3Crect width="400" height="300" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="%236b7280"%3Eفشل تحميل الصورة%3C/text%3E%3C/svg%3E';
                              }}
                            />
                            <button
                              onClick={() => setShowReceiptModal(true)}
                              className="absolute top-2 right-2 bg-white/90 hover:bg-white p-2 rounded-lg shadow-md transition-colors"
                            >
                              <ArrowTopRightOnSquareIcon className="h-5 w-5 text-gray-700" />
                            </button>
                          </div>
                        ) : (
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="mt-2 text-sm text-gray-500">لم يتم رفع صورة الإيصال</p>
                            <p className="mt-1 text-xs text-red-600">
                              تحذير: لا يمكن التحقق من التحويل بدون صورة إيصال
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Verification Actions */}
                      {sanitizedOrder.bankTransfer.verificationStatus === 'pending' && onVerifyBankTransfer && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="text-sm font-semibold text-gray-900 mb-3">إجراءات التحقق</h4>
                          
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              سبب الرفض (في حالة الرفض)
                            </label>
                            <input
                              type="text"
                              value={rejectionReason}
                              onChange={(e) => setRejectionReason(e.target.value)}
                              placeholder="اختياري - أدخل سبب الرفض"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => handleVerifyBankTransfer('verified')}
                              disabled={isVerifying}
                              className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              <CheckCircleIcon className="h-5 w-5 ml-2" />
                              {isVerifying ? 'جاري التحقق...' : 'الموافقة والتفعيل'}
                            </button>
                            <button
                              onClick={() => handleVerifyBankTransfer('rejected')}
                              disabled={isVerifying}
                              className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              <XCircleIcon className="h-5 w-5 ml-2" />
                              {isVerifying ? 'جاري الرفض...' : 'رفض'}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Verification Info */}
                      {sanitizedOrder.bankTransfer.verificationStatus !== 'pending' && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="space-y-2">
                            {sanitizedOrder.bankTransfer.verifiedAt && (
                              <div>
                                <label className="text-sm font-medium text-gray-500">تاريخ التحقق</label>
                                <p className="text-gray-900">{formatDate(sanitizedOrder.bankTransfer.verifiedAt)}</p>
                              </div>
                            )}
                            {sanitizedOrder.bankTransfer.rejectionReason && (
                              <div>
                                <label className="text-sm font-medium text-gray-500">سبب الرفض</label>
                                <p className="text-red-700 bg-red-50 p-3 rounded-lg">{sanitizedOrder.bankTransfer.rejectionReason}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Notes */}
                  {(sanitizedOrder.notes || sanitizedOrder.refundReason) && (
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center mb-4">
                        <DocumentTextIcon className="h-5 w-5 text-gray-400 ml-2" />
                        <h3 className="text-lg font-semibold text-gray-900">ملاحظات</h3>
                      </div>
                      
                      <div className="space-y-3">
                        {sanitizedOrder.notes && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">ملاحظات عامة</label>
                            <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{sanitizedOrder.notes}</p>
                          </div>
                        )}
                        
                        {sanitizedOrder.refundReason && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">سبب الاسترداد</label>
                            <p className="text-gray-900 bg-red-50 p-3 rounded-lg">{sanitizedOrder.refundReason}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
                  <button
                    onClick={onClose}
                    className="px-6 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-500 transition-colors"
                  >
                    إغلاق
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>

        {/* Receipt Modal */}
        {showReceiptModal && sanitizedOrder.bankTransfer?.receiptImage && (
          <Transition appear show={showReceiptModal} as={Fragment}>
            <Dialog as="div" className="relative z-[60]" onClose={() => setShowReceiptModal(false)}>
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="fixed inset-0 bg-black bg-opacity-75" />
              </Transition.Child>

              <div className="fixed inset-0 overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4">
                  <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0 scale-95"
                    enterTo="opacity-100 scale-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100 scale-100"
                    leaveTo="opacity-0 scale-95"
                  >
                    <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-lg bg-white shadow-xl transition-all">
                      <div className="flex items-center justify-between p-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">صورة الإيصال</h3>
                        <button
                          onClick={() => setShowReceiptModal(false)}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <XMarkIcon className="h-6 w-6" />
                        </button>
                      </div>
                      <div className="p-4">
                        <img 
                          src={sanitizedOrder.bankTransfer.receiptImage} 
                          alt="Receipt Full View"
                          className="w-full h-auto"
                        />
                      </div>
                      <div className="flex items-center justify-end space-x-3 p-4 border-t border-gray-200 bg-gray-50">
                        <a
                          href={sanitizedOrder.bankTransfer.receiptImage}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          تحميل الصورة
                        </a>
                        <button
                          onClick={() => setShowReceiptModal(false)}
                          className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-500 transition-colors"
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
        )}
      </Dialog>
    </Transition>
  );
}
