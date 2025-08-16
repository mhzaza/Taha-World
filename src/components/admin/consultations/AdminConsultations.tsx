'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Tab } from '@headlessui/react';
import { 
  PlusIcon, 
  CalendarIcon, 
  ClockIcon, 
  UserIcon, 
  VideoCameraIcon,
  PhoneIcon,
  UserGroupIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { Consultation, Booking, TimeSlot } from '@/types/booking';
import { 
  getAllConsultations, 
  createConsultation, 
  updateConsultation, 
  deleteConsultation,
  getAllBookings,
  updateBookingStatus,
  getAllTimeSlots,
  createTimeSlot,
  deleteTimeSlot
} from '@/lib/services/bookingService';

export default function AdminConsultations() {
  const [activeTab, setActiveTab] = useState(0);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [bookings, setBookings] = useState<(Booking & { consultation?: Consultation })[]>([]);
  const [timeSlots, setTimeSlots] = useState<(TimeSlot & { consultation?: Consultation })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showConsultationForm, setShowConsultationForm] = useState(false);
  const [showTimeSlotForm, setShowTimeSlotForm] = useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  
  const router = useRouter();

  // Consultation form state
  const [consultationForm, setConsultationForm] = useState({
    title: '',
    description: '',
    type: 'video',
    duration: 30,
    price: 0,
    currency: 'SAR',
    isActive: true,
    maxBookingsPerDay: 5,
    tags: ''
  });

  // Time slot form state
  const [timeSlotForm, setTimeSlotForm] = useState({
    consultationId: '',
    startTime: '',
    endTime: '',
    isAvailable: true,
    date: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch consultations
      const consultationsData = await getAllConsultations();
      setConsultations(consultationsData);
      
      // Fetch bookings with consultation details
      const bookingsData = await getAllBookings();
      const bookingsWithDetails = await Promise.all(
        bookingsData.map(async (booking) => {
          try {
            const consultation = consultationsData.find(c => c.id === booking.consultationId);
            return { ...booking, consultation };
          } catch (err) {
            console.error(`Error processing booking ${booking.id}:`, err);
            return booking;
          }
        })
      );
      setBookings(bookingsWithDetails);
      
      // Fetch time slots with consultation details
      const timeSlotsData = await getAllTimeSlots();
      const timeSlotsWithDetails = timeSlotsData.map(timeSlot => {
        const consultation = consultationsData.find(c => c.id === timeSlot.consultationId);
        return { ...timeSlot, consultation };
      });
      setTimeSlots(timeSlotsWithDetails);
      
      setError(null);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError('حدث خطأ أثناء تحميل البيانات. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const handleConsultationInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setConsultationForm(prev => ({
        ...prev,
        [name]: checked
      }));
    } else if (name === 'price' || name === 'duration' || name === 'maxBookingsPerDay') {
      setConsultationForm(prev => ({
        ...prev,
        [name]: value === '' ? '' : Number(value)
      }));
    } else {
      setConsultationForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleTimeSlotInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setTimeSlotForm(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setTimeSlotForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleConsultationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const tagsArray = consultationForm.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag !== '');
      
      const consultationData: Partial<Consultation> = {
        title: consultationForm.title,
        description: consultationForm.description,
        type: consultationForm.type as 'video' | 'audio' | 'in-person',
        duration: consultationForm.duration,
        price: consultationForm.price,
        currency: consultationForm.currency,
        isActive: consultationForm.isActive,
        maxBookingsPerDay: consultationForm.maxBookingsPerDay,
        tags: tagsArray
      };
      
      if (selectedConsultation) {
        // Update existing consultation
        await updateConsultation(selectedConsultation.id, consultationData);
      } else {
        // Create new consultation
        await createConsultation(consultationData as Omit<Consultation, 'id' | 'createdAt' | 'updatedAt'>);
      }
      
      // Reset form and refresh data
      setConsultationForm({
        title: '',
        description: '',
        type: 'video',
        duration: 30,
        price: 0,
        currency: 'SAR',
        isActive: true,
        maxBookingsPerDay: 5,
        tags: ''
      });
      setSelectedConsultation(null);
      setShowConsultationForm(false);
      await fetchData();
    } catch (err: any) {
      console.error('Error saving consultation:', err);
      setError(err.message || 'حدث خطأ أثناء حفظ الاستشارة');
    } finally {
      setLoading(false);
    }
  };

  const handleTimeSlotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const startDateTime = new Date(`${timeSlotForm.date}T${timeSlotForm.startTime}`);
      const endDateTime = new Date(`${timeSlotForm.date}T${timeSlotForm.endTime}`);
      
      if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
        throw new Error('تاريخ أو وقت غير صالح');
      }
      
      if (endDateTime <= startDateTime) {
        throw new Error('يجب أن يكون وقت الانتهاء بعد وقت البدء');
      }
      
      const timeSlotData: Partial<TimeSlot> = {
        consultationId: timeSlotForm.consultationId,
        startTime: startDateTime,
        endTime: endDateTime,
        isAvailable: timeSlotForm.isAvailable
      };
      
      // Create new time slot (we don't support editing time slots for simplicity)
      await createTimeSlot(timeSlotData as Omit<TimeSlot, 'id' | 'createdAt'>);
      
      // Reset form and refresh data
      setTimeSlotForm({
        consultationId: '',
        startTime: '',
        endTime: '',
        isAvailable: true,
        date: ''
      });
      setShowTimeSlotForm(false);
      await fetchData();
    } catch (err: any) {
      console.error('Error saving time slot:', err);
      setError(err.message || 'حدث خطأ أثناء حفظ الموعد');
    } finally {
      setLoading(false);
    }
  };

  const handleEditConsultation = (consultation: Consultation) => {
    setSelectedConsultation(consultation);
    setConsultationForm({
      title: consultation.title,
      description: consultation.description,
      type: consultation.type,
      duration: consultation.duration,
      price: consultation.price,
      currency: consultation.currency,
      isActive: consultation.isActive,
      maxBookingsPerDay: consultation.maxBookingsPerDay,
      tags: consultation.tags.join(', ')
    });
    setShowConsultationForm(true);
  };

  const handleDeleteConsultation = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الاستشارة؟ سيتم حذف جميع المواعيد والحجوزات المرتبطة بها.')) {
      return;
    }
    
    try {
      setLoading(true);
      await deleteConsultation(id);
      await fetchData();
    } catch (err: any) {
      console.error('Error deleting consultation:', err);
      setError(err.message || 'حدث خطأ أثناء حذف الاستشارة');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTimeSlot = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الموعد؟')) {
      return;
    }
    
    try {
      setLoading(true);
      await deleteTimeSlot(id);
      await fetchData();
    } catch (err: any) {
      console.error('Error deleting time slot:', err);
      setError(err.message || 'حدث خطأ أثناء حذف الموعد');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBookingStatus = async (id: string, status: Booking['status']) => {
    try {
      setLoading(true);
      await updateBookingStatus(id, status);
      await fetchData();
    } catch (err: any) {
      console.error('Error updating booking status:', err);
      setError(err.message || 'حدث خطأ أثناء تحديث حالة الحجز');
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ar-SA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  // Format time for display
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('ar-SA', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // Format date for input fields
  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  // Format time for input fields
  const formatTimeForInput = (date: Date) => {
    return date.toTimeString().slice(0, 5);
  };

  // Helper function to format currency
  const formatCurrency = (price: number, currency: string) => {
    switch (currency) {
      case 'USD':
        return `$${price}`;
      case 'SAR':
        return `${price} ر.س`;
      case 'EGP':
        return `${price} ج.م`;
      default:
        return `${price}`;
    }
  };

  // Helper function to get consultation type icon
  const getConsultationTypeIcon = (type: Consultation['type']) => {
    switch (type) {
      case 'video':
        return <VideoCameraIcon className="h-5 w-5 text-blue-500" />;
      case 'audio':
        return <PhoneIcon className="h-5 w-5 text-green-500" />;
      case 'in-person':
        return <UserGroupIcon className="h-5 w-5 text-purple-500" />;
      default:
        return <VideoCameraIcon className="h-5 w-5 text-blue-500" />;
    }
  };

  // Helper function to get consultation type label in Arabic
  const getConsultationTypeLabel = (type: Consultation['type']) => {
    switch (type) {
      case 'video':
        return 'فيديو';
      case 'audio':
        return 'صوتي';
      case 'in-person':
        return 'حضوري';
      default:
        return type;
    }
  };

  // Helper function to get booking status label in Arabic
  const getBookingStatusLabel = (status: Booking['status']) => {
    switch (status) {
      case 'pending':
        return 'قيد الانتظار';
      case 'confirmed':
        return 'مؤكد';
      case 'cancelled':
        return 'ملغي';
      case 'completed':
        return 'مكتمل';
      default:
        return status;
    }
  };

  // Helper function to get booking status color
  const getBookingStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Helper function to get payment status label in Arabic
  const getPaymentStatusLabel = (status: Booking['paymentStatus']) => {
    switch (status) {
      case 'pending':
        return 'قيد الانتظار';
      case 'completed':
        return 'مدفوع';
      case 'failed':
        return 'فشل الدفع';
      case 'refunded':
        return 'مسترد';
      default:
        return status;
    }
  };

  // Helper function to get payment status color
  const getPaymentStatusColor = (status: Booking['paymentStatus']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <Tab.Group selectedIndex={activeTab} onChange={setActiveTab}>
        <Tab.List className="flex border-b">
          <Tab className={({ selected }) => `
            flex-1 py-4 px-6 text-center focus:outline-none
            ${selected ? 'border-b-2 border-primary text-primary font-medium' : 'text-gray-500 hover:text-gray-700'}
          `}>
            الاستشارات
          </Tab>
          <Tab className={({ selected }) => `
            flex-1 py-4 px-6 text-center focus:outline-none
            ${selected ? 'border-b-2 border-primary text-primary font-medium' : 'text-gray-500 hover:text-gray-700'}
          `}>
            المواعيد المتاحة
          </Tab>
          <Tab className={({ selected }) => `
            flex-1 py-4 px-6 text-center focus:outline-none
            ${selected ? 'border-b-2 border-primary text-primary font-medium' : 'text-gray-500 hover:text-gray-700'}
          `}>
            الحجوزات
          </Tab>
        </Tab.List>
        
        <Tab.Panels>
          {/* Consultations Panel */}
          <Tab.Panel className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">قائمة الاستشارات</h2>
              <button
                onClick={() => {
                  setSelectedConsultation(null);
                  setConsultationForm({
                    title: '',
                    description: '',
                    type: 'video',
                    duration: 30,
                    price: 0,
                    currency: 'SAR',
                    isActive: true,
                    maxBookingsPerDay: 5,
                    tags: ''
                  });
                  setShowConsultationForm(true);
                }}
                className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition duration-300 flex items-center"
              >
                <PlusIcon className="h-5 w-5 ml-2" />
                إضافة استشارة جديدة
              </button>
            </div>
            
            {loading && !showConsultationForm ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            ) : showConsultationForm ? (
              <div className="bg-gray-50 p-6 rounded-lg border">
                <h3 className="text-lg font-semibold mb-4">
                  {selectedConsultation ? 'تعديل استشارة' : 'إضافة استشارة جديدة'}
                </h3>
                
                <form onSubmit={handleConsultationSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Title */}
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                        العنوان *
                      </label>
                      <input
                        type="text"
                        id="title"
                        name="title"
                        value={consultationForm.title}
                        onChange={handleConsultationInputChange}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary text-right"
                        required
                      />
                    </div>
                    
                    {/* Type */}
                    <div>
                      <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                        نوع الاستشارة *
                      </label>
                      <select
                        id="type"
                        name="type"
                        value={consultationForm.type}
                        onChange={handleConsultationInputChange}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary text-right"
                        required
                      >
                        <option value="video">فيديو</option>
                        <option value="audio">صوتي</option>
                        <option value="in-person">حضوري</option>
                      </select>
                    </div>
                    
                    {/* Duration */}
                    <div>
                      <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                        المدة (بالدقائق) *
                      </label>
                      <input
                        type="number"
                        id="duration"
                        name="duration"
                        value={consultationForm.duration}
                        onChange={handleConsultationInputChange}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary text-right"
                        min="5"
                        step="5"
                        required
                      />
                    </div>
                    
                    {/* Price */}
                    <div>
                      <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                        السعر *
                      </label>
                      <div className="flex">
                        <input
                          type="number"
                          id="price"
                          name="price"
                          value={consultationForm.price}
                          onChange={handleConsultationInputChange}
                          className="block w-full border-gray-300 rounded-r-md shadow-sm focus:ring-primary focus:border-primary text-right"
                          min="0"
                          step="0.01"
                          required
                        />
                        <select
                          id="currency"
                          name="currency"
                          value={consultationForm.currency}
                          onChange={handleConsultationInputChange}
                          className="block border-gray-300 rounded-l-md shadow-sm focus:ring-primary focus:border-primary"
                        >
                          <option value="SAR">ر.س</option>
                          <option value="USD">$</option>
                          <option value="EGP">ج.م</option>
                        </select>
                      </div>
                    </div>
                    
                    {/* Max Bookings Per Day */}
                    <div>
                      <label htmlFor="maxBookingsPerDay" className="block text-sm font-medium text-gray-700 mb-1">
                        الحد الأقصى للحجوزات في اليوم
                      </label>
                      <input
                        type="number"
                        id="maxBookingsPerDay"
                        name="maxBookingsPerDay"
                        value={consultationForm.maxBookingsPerDay}
                        onChange={handleConsultationInputChange}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary text-right"
                        min="1"
                        required
                      />
                    </div>
                    
                    {/* Tags */}
                    <div>
                      <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                        الوسوم (مفصولة بفواصل)
                      </label>
                      <input
                        type="text"
                        id="tags"
                        name="tags"
                        value={consultationForm.tags}
                        onChange={handleConsultationInputChange}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary text-right"
                        placeholder="تدريب, استشارة, رياضة"
                      />
                    </div>
                    
                    {/* Is Active */}
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isActive"
                        name="isActive"
                        checked={consultationForm.isActive}
                        onChange={handleConsultationInputChange}
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                      <label htmlFor="isActive" className="mr-2 block text-sm text-gray-700">
                        نشط (متاح للحجز)
                      </label>
                    </div>
                  </div>
                  
                  {/* Description */}
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      الوصف *
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={consultationForm.description}
                      onChange={handleConsultationInputChange}
                      rows={4}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary text-right"
                      required
                    />
                  </div>
                  
                  {/* Form Actions */}
                  <div className="flex justify-end space-x-2 space-x-reverse">
                    <button
                      type="button"
                      onClick={() => setShowConsultationForm(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition duration-300"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'جاري الحفظ...' : selectedConsultation ? 'تحديث الاستشارة' : 'إضافة الاستشارة'}
                    </button>
                  </div>
                </form>
              </div>
            ) : consultations.length === 0 ? (
              <div className="text-center py-8">
                <VideoCameraIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">لا توجد استشارات</h3>
                <p className="text-gray-600 mb-6">قم بإضافة استشارات جديدة ليتمكن المستخدمون من حجزها</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        العنوان
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        النوع
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        المدة
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        السعر
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        الحالة
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        الإجراءات
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {consultations.map((consultation) => (
                      <tr key={consultation.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {consultation.title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <span className="mr-2">{getConsultationTypeIcon(consultation.type)}</span>
                            {getConsultationTypeLabel(consultation.type)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {consultation.duration} دقيقة
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatCurrency(consultation.price, consultation.currency)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${consultation.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {consultation.isActive ? 'نشط' : 'غير نشط'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex space-x-2 space-x-reverse">
                            <button
                              onClick={() => handleEditConsultation(consultation)}
                              className="text-blue-600 hover:text-blue-900 transition duration-300"
                            >
                              <PencilIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteConsultation(consultation.id)}
                              className="text-red-600 hover:text-red-900 transition duration-300"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Tab.Panel>
          
          {/* Time Slots Panel */}
          <Tab.Panel className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">المواعيد المتاحة</h2>
              <button
                onClick={() => {
                  setSelectedTimeSlot(null);
                  setTimeSlotForm({
                    consultationId: consultations.length > 0 ? consultations[0].id : '',
                    startTime: '',
                    endTime: '',
                    isAvailable: true,
                    date: ''
                  });
                  setShowTimeSlotForm(true);
                }}
                className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition duration-300 flex items-center"
                disabled={consultations.length === 0}
              >
                <PlusIcon className="h-5 w-5 ml-2" />
                إضافة موعد جديد
              </button>
            </div>
            
            {loading && !showTimeSlotForm ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            ) : showTimeSlotForm ? (
              <div className="bg-gray-50 p-6 rounded-lg border">
                <h3 className="text-lg font-semibold mb-4">إضافة موعد جديد</h3>
                
                <form onSubmit={handleTimeSlotSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Consultation */}
                    <div>
                      <label htmlFor="consultationId" className="block text-sm font-medium text-gray-700 mb-1">
                        الاستشارة *
                      </label>
                      <select
                        id="consultationId"
                        name="consultationId"
                        value={timeSlotForm.consultationId}
                        onChange={handleTimeSlotInputChange}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary text-right"
                        required
                      >
                        <option value="" disabled>اختر الاستشارة</option>
                        {consultations.map((consultation) => (
                          <option key={consultation.id} value={consultation.id}>
                            {consultation.title} ({getConsultationTypeLabel(consultation.type)})
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    {/* Date */}
                    <div>
                      <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                        التاريخ *
                      </label>
                      <input
                        type="date"
                        id="date"
                        name="date"
                        value={timeSlotForm.date}
                        onChange={handleTimeSlotInputChange}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary text-right"
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                    
                    {/* Start Time */}
                    <div>
                      <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
                        وقت البدء *
                      </label>
                      <input
                        type="time"
                        id="startTime"
                        name="startTime"
                        value={timeSlotForm.startTime}
                        onChange={handleTimeSlotInputChange}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary text-right"
                        required
                      />
                    </div>
                    
                    {/* End Time */}
                    <div>
                      <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
                        وقت الانتهاء *
                      </label>
                      <input
                        type="time"
                        id="endTime"
                        name="endTime"
                        value={timeSlotForm.endTime}
                        onChange={handleTimeSlotInputChange}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary text-right"
                        required
                      />
                    </div>
                    
                    {/* Is Available */}
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isAvailable"
                        name="isAvailable"
                        checked={timeSlotForm.isAvailable}
                        onChange={handleTimeSlotInputChange}
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                      <label htmlFor="isAvailable" className="mr-2 block text-sm text-gray-700">
                        متاح للحجز
                      </label>
                    </div>
                  </div>
                  
                  {/* Form Actions */}
                  <div className="flex justify-end space-x-2 space-x-reverse">
                    <button
                      type="button"
                      onClick={() => setShowTimeSlotForm(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition duration-300"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'جاري الحفظ...' : 'إضافة الموعد'}
                    </button>
                  </div>
                </form>
              </div>
            ) : timeSlots.length === 0 ? (
              <div className="text-center py-8">
                <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">لا توجد مواعيد متاحة</h3>
                <p className="text-gray-600 mb-6">قم بإضافة مواعيد جديدة ليتمكن المستخدمون من حجزها</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        الاستشارة
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        التاريخ
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        الوقت
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        الحالة
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        الإجراءات
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {timeSlots.map((timeSlot) => (
                      <tr key={timeSlot.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {timeSlot.consultation?.title || 'استشارة غير معروفة'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(timeSlot.startTime)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatTime(timeSlot.startTime)} - {formatTime(timeSlot.endTime)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${timeSlot.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {timeSlot.isAvailable ? 'متاح' : 'غير متاح'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button
                            onClick={() => handleDeleteTimeSlot(timeSlot.id)}
                            className="text-red-600 hover:text-red-900 transition duration-300"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Tab.Panel>
          
          {/* Bookings Panel */}
          <Tab.Panel className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">الحجوزات</h2>
            </div>
            
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-8">
                <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">لا توجد حجوزات</h3>
                <p className="text-gray-600">لم يقم أي مستخدم بحجز استشارات بعد</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        المستخدم
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        الاستشارة
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        التاريخ
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        المبلغ
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        حالة الحجز
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        حالة الدفع
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        الإجراءات
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {bookings.map((booking) => (
                      <tr key={booking.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          <div className="flex items-center">
                            <UserIcon className="h-5 w-5 text-gray-400 ml-2" />
                            {booking.userName || booking.userId}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {booking.consultation?.title || 'استشارة غير معروفة'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {booking.createdAt ? formatDate(booking.createdAt) : 'غير معروف'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatCurrency(booking.amount, booking.currency)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getBookingStatusColor(booking.status)}`}>
                            {getBookingStatusLabel(booking.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentStatusColor(booking.paymentStatus)}`}>
                            {getPaymentStatusLabel(booking.paymentStatus)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex space-x-2 space-x-reverse">
                            {booking.status === 'pending' && (
                              <button
                                onClick={() => handleUpdateBookingStatus(booking.id, 'confirmed')}
                                className="text-green-600 hover:text-green-900 transition duration-300"
                                title="تأكيد الحجز"
                              >
                                <CheckCircleIcon className="h-5 w-5" />
                              </button>
                            )}
                            {(booking.status === 'pending' || booking.status === 'confirmed') && (
                              <button
                                onClick={() => handleUpdateBookingStatus(booking.id, 'cancelled')}
                                className="text-red-600 hover:text-red-900 transition duration-300"
                                title="إلغاء الحجز"
                              >
                                <XCircleIcon className="h-5 w-5" />
                              </button>
                            )}
                            {booking.status === 'confirmed' && (
                              <button
                                onClick={() => handleUpdateBookingStatus(booking.id, 'completed')}
                                className="text-blue-600 hover:text-blue-900 transition duration-300"
                                title="تحديد كمكتمل"
                              >
                                <CheckCircleIcon className="h-5 w-5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
      
      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-b-lg" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
    </div>
  );
}