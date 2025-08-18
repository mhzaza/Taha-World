'use client';

import { useState, useMemo } from 'react';
import { TimeSlot } from '@/types/booking';
import { ChevronRightIcon, ChevronLeftIcon } from '@heroicons/react/24/outline';

interface BookingCalendarProps {
  timeSlots: TimeSlot[];
  onSelectTimeSlot: (timeSlot: TimeSlot) => void;
  selectedTimeSlot: TimeSlot | null;
}

export default function BookingCalendar({ timeSlots, onSelectTimeSlot, selectedTimeSlot }: BookingCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Group time slots by date
  const timeSlotsByDate = useMemo(() => {
    const grouped: Record<string, TimeSlot[]> = {};
    
    timeSlots.forEach(slot => {
      const dateKey = slot.startTime.toISOString().split('T')[0];
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(slot);
    });
    
    return grouped;
  }, [timeSlots]);
  
  // Get all dates with available time slots
  const availableDates = useMemo(() => {
    return Object.keys(timeSlotsByDate).map(dateStr => new Date(dateStr));
  }, [timeSlotsByDate]);
  
  // Get days in month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  // Get day of week for first day of month (0 = Sunday, 6 = Saturday)
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };
  
  // Navigate to previous month
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };
  
  // Navigate to next month
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };
  
  // Check if a date has available time slots
  const hasTimeSlots = (date: Date) => {
    const dateKey = date.toISOString().split('T')[0];
    return !!timeSlotsByDate[dateKey];
  };
  
  // Format date for display
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ar-SA', { day: 'numeric' }).format(date);
  };
  
  // Format month for display
  const formatMonth = (date: Date) => {
    return new Intl.DateTimeFormat('ar-SA', { month: 'long', year: 'numeric' }).format(date);
  };
  
  // Format time for display
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('ar-SA', { hour: '2-digit', minute: '2-digit' }).format(date);
  };
  
  // Handle date selection
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  const handleDateClick = (date: Date) => {
    if (hasTimeSlots(date)) {
      setSelectedDate(date);
    }
  };
  
  // Get time slots for selected date
  const timeSlotsForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    
    const dateKey = selectedDate.toISOString().split('T')[0];
    return timeSlotsByDate[dateKey] || [];
  }, [selectedDate, timeSlotsByDate]);
  
  // Render calendar
  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);
    
    const days = [];
    
    // Add empty cells for days before first day of month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-10"></div>);
    }
    
    // Add days of month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateKey = date.toISOString().split('T')[0];
      const isToday = new Date().toISOString().split('T')[0] === dateKey;
      const isSelected = selectedDate?.toISOString().split('T')[0] === dateKey;
      const hasSlots = hasTimeSlots(date);
      const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
      
      days.push(
        <div 
          key={day} 
          className={`h-10 flex items-center justify-center rounded-full cursor-pointer ${isSelected ? 'bg-primary text-white' : ''} ${isToday && !isSelected ? 'border border-primary text-primary' : ''} ${!hasSlots || isPast ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
          onClick={() => !isPast && hasSlots && handleDateClick(date)}
        >
          <span>{formatDate(date)}</span>
          {hasSlots && <span className="w-1 h-1 bg-primary rounded-full absolute bottom-1"></span>}
        </div>
      );
    }
    
    return days;
  };
  
  // Day names in Arabic
  const dayNames = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  
  return (
    <div>
      {/* Calendar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <button 
            onClick={prevMonth}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
          <h4 className="font-semibold">{formatMonth(currentMonth)}</h4>
          <button 
            onClick={nextMonth}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
        </div>
        
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map((day, index) => (
            <div key={index} className="text-center text-xs font-medium text-gray-500">
              {day.substring(0, 1)}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {renderCalendar()}
        </div>
      </div>
      
      {/* Time slots */}
      {selectedDate && (
        <div>
          <h4 className="font-semibold mb-3">المواعيد المتاحة:</h4>
          <div className="grid grid-cols-2 gap-2">
            {timeSlotsForSelectedDate.length > 0 ? (
              timeSlotsForSelectedDate.map((slot) => (
                <button
                  key={slot.id}
                  className={`py-2 px-3 border rounded-md text-sm ${selectedTimeSlot?.id === slot.id ? 'bg-primary text-white border-primary' : 'border-gray-300 hover:border-primary'}`}
                  onClick={() => onSelectTimeSlot(slot)}
                >
                  {formatTime(slot.startTime)}
                </button>
              ))
            ) : (
              <p className="col-span-2 text-center text-gray-500 py-4">لا توجد مواعيد متاحة في هذا اليوم</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}