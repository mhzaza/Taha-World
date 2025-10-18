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
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  userPhone?: string;
  courseId: string;
  courseTitle: string;
  courseThumbnail?: string;
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
}

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderDetails | null;
  onUpdateStatus?: (orderId: string, status: string, notes?: string) => void;
}

export default function OrderDetailsModal({ 
  isOpen, 
  onClose, 
  order, 
  onUpdateStatus 
}: OrderDetailsModalProps) {
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState<string>('');
  const [statusNotes, setStatusNotes] = useState('');
  const [showStatusUpdate, setShowStatusUpdate] = useState(false);

  if (!order) return null;

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
    return new Date(dateString).toLocaleDateString('ar-SA', {
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
      await onUpdateStatus(order.id, newStatus, statusNotes);
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
      orderId: order.id,
      customer: order.userName,
      email: order.userEmail,
      course: order.courseTitle,
      amount: order.amount,
      status: order.status,
      paymentMethod: order.paymentMethod,
      createdAt: order.createdAt,
      transactionId: order.transactionId
    };
    
    const dataStr = JSON.stringify(orderData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `order-${order.id}.json`;
    link.click();
    URL.revokeObjectURL(url);
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
                        تفاصيل الطلب {order.id}
                      </Dialog.Title>
                      <p className="text-sm text-gray-500 mt-1">
                        تم الإنشاء في {formatDate(order.createdAt)}
                      </p>
                    </div>
                    {order.isNew && (
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
                      <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="mr-2">{getStatusText(order.status)}</span>
                      </div>
                      
                      {order.processingTime && (
                        <span className="text-sm text-gray-500">
                          وقت المعالجة: {order.processingTime} دقيقة
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
                          <p className="text-gray-900">{order.userName}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">البريد الإلكتروني</label>
                          <p className="text-gray-900">{order.userEmail}</p>
                        </div>
                        {order.userPhone && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">رقم الهاتف</label>
                            <p className="text-gray-900">{order.userPhone}</p>
                          </div>
                        )}
                        <div>
                          <label className="text-sm font-medium text-gray-500">معرف المستخدم</label>
                          <p className="text-gray-900 font-mono text-sm">{order.userId}</p>
                        </div>
                      </div>
                    </div>

                    {/* Course Information */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center mb-4">
                        <AcademicCapIcon className="h-5 w-5 text-gray-400 ml-2" />
                        <h3 className="text-lg font-semibold text-gray-900">معلومات الكورس</h3>
                      </div>
                      
                      <div className="space-y-3">
                        {order.courseThumbnail && (
                          <div className="w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
                            <img 
                              src={order.courseThumbnail} 
                              alt={order.courseTitle}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div>
                          <label className="text-sm font-medium text-gray-500">عنوان الكورس</label>
                          <p className="text-gray-900">{order.courseTitle}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">معرف الكورس</label>
                          <p className="text-gray-900 font-mono text-sm">{order.courseId}</p>
                        </div>
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
                          <p className="text-2xl font-bold text-gray-900">{formatCurrency(order.amount)}</p>
                        </div>
                        
                        {order.originalAmount && order.originalAmount !== order.amount && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">المبلغ الأصلي</label>
                            <p className="text-gray-500 line-through">{formatCurrency(order.originalAmount)}</p>
                          </div>
                        )}
                        
                        {order.discountAmount && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">مبلغ الخصم</label>
                            <p className="text-green-600">-{formatCurrency(order.discountAmount)}</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-500">طريقة الدفع</label>
                          <p className="text-gray-900 capitalize">{order.paymentMethod}</p>
                        </div>
                        
                        {order.transactionId && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">رقم المعاملة</label>
                            <p className="text-gray-900 font-mono text-sm">{order.transactionId}</p>
                          </div>
                        )}
                        
                        {order.paymentIntentId && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">معرف الدفع</label>
                            <p className="text-gray-900 font-mono text-sm">{order.paymentIntentId}</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-3">
                        {order.couponCode && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">كود الخصم</label>
                            <p className="text-gray-900 font-mono">{order.couponCode}</p>
                          </div>
                        )}
                        
                        {order.taxAmount && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">الضرائب</label>
                            <p className="text-gray-900">{formatCurrency(order.taxAmount)}</p>
                          </div>
                        )}
                        
                        <div>
                          <label className="text-sm font-medium text-gray-500">العملة</label>
                          <p className="text-gray-900">{order.currency || 'USD'}</p>
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
                          <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                        </div>
                      </div>
                      
                      {order.updatedAt !== order.createdAt && (
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">آخر تحديث</p>
                            <p className="text-xs text-gray-500">{formatDate(order.updatedAt)}</p>
                          </div>
                        </div>
                      )}
                      
                      {order.completedAt && (
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">تم إكمال الطلب</p>
                            <p className="text-xs text-gray-500">{formatDate(order.completedAt)}</p>
                          </div>
                        </div>
                      )}
                      
                      {order.refundedAt && (
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">تم استرداد الطلب</p>
                            <p className="text-xs text-gray-500">{formatDate(order.refundedAt)}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Notes */}
                  {(order.notes || order.refundReason) && (
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center mb-4">
                        <DocumentTextIcon className="h-5 w-5 text-gray-400 ml-2" />
                        <h3 className="text-lg font-semibold text-gray-900">ملاحظات</h3>
                      </div>
                      
                      <div className="space-y-3">
                        {order.notes && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">ملاحظات عامة</label>
                            <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{order.notes}</p>
                          </div>
                        )}
                        
                        {order.refundReason && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">سبب الاسترداد</label>
                            <p className="text-gray-900 bg-red-50 p-3 rounded-lg">{order.refundReason}</p>
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
                    className="px-6 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
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
