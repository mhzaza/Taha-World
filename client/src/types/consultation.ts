// Consultation type definitions for the consultation booking system

export interface Consultation {
  _id: string;
  consultationId: number;
  title: string;
  titleEn?: string;
  description: string;
  descriptionEn?: string;
  duration: string;  // e.g., "60 دقيقة"
  durationMinutes: number;
  price: number;
  originalPrice?: number;
  currency: string;
  category: 'sports' | 'life_coaching' | 'group' | 'vip' | 'nutrition' | 'general';
  features: string[];
  image?: string;
  thumbnail?: string;
  isActive: boolean;
  maxBookingsPerDay?: number;
  requiresApproval?: boolean;
  consultationType: 'online' | 'in_person' | 'both';
  availableDays?: string[];
  availableTimeSlots?: {
    start: string;
    end: string;
  }[];
  totalBookings?: number;
  completedBookings?: number;
  totalRevenue?: number;
  averageRating?: number;
  totalReviews?: number;
  slug?: string;
  metaDescription?: string;
  tags?: string[];
  displayOrder?: number;
  createdAt: string;
  updatedAt: string;
  formattedPrice?: string;
  discountPercentage?: number;
  savings?: number;
}

export interface ConsultationBooking {
  _id: string;
  bookingNumber: string;
  userId: string;
  userEmail: string;
  userName: string;
  userPhone: string;
  consultationId: string | Consultation;
  consultationType: string;
  consultationTitle: string;
  consultationCategory: string;
  preferredDate: Date | string;
  preferredTime: string;
  alternativeDate?: Date | string;
  alternativeTime?: string;
  confirmedDateTime?: Date | string;
  timezone?: string;
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
  userDetails: {
    age?: number;
    gender?: 'male' | 'female';
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
  orderId?: string;
  amount: number;
  currency: string;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod?: string;
  transactionId?: string;
  status: 'pending_payment' | 'pending_confirmation' | 'confirmed' | 'rescheduled' | 'completed' | 'cancelled' | 'no_show';
  paymentCompletedAt?: Date | string;
  confirmedAt?: Date | string;
  completedAt?: Date | string;
  cancelledAt?: Date | string;
  cancellationReason?: string;
  cancelledBy?: 'user' | 'admin' | 'system';
  refundAmount?: number;
  refundedAt?: Date | string;
  rescheduledFrom?: {
    date: Date | string;
    time: string;
    reason?: string;
  };
  rescheduledReason?: string;
  rescheduledCount?: number;
  adminNotes?: string;
  internalNotes?: string;
  assignedTo?: string;
  assignedToId?: string;
  remindersSent?: {
    type: 'email' | 'sms' | 'whatsapp' | 'notification';
    sentAt: Date | string;
    purpose: string;
    success?: boolean;
    errorMessage?: string;
  }[];
  emailsSent?: {
    type: string;
    sentAt: Date | string;
    subject: string;
  }[];
  followUpRequired?: boolean;
  followUpNotes?: string;
  followUpDate?: Date | string;
  followUpCompleted?: boolean;
  userFeedback?: {
    rating?: number;
    comment?: string;
    submittedAt?: Date | string;
    isPublic?: boolean;
  };
  consultantNotes?: string;
  ipAddress?: string;
  userAgent?: string;
  source?: 'web' | 'mobile' | 'admin' | 'api';
  referralSource?: string;
  attachments?: {
    name: string;
    url: string;
    type: string;
    uploadedAt: Date | string;
    uploadedBy: string;
  }[];
  isPriority?: boolean;
  isFirstBooking?: boolean;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  isUpcoming?: boolean;
  isPast?: boolean;
  fullSchedule?: {
    date: Date | string;
    time: string;
    duration: number;
    formattedDate?: string;
  };
  daysUntil?: number;
  hoursUntil?: number;
}

export interface ConsultationBookingRequest {
  consultationId: string;
  preferredDate: string;
  preferredTime: string;
  alternativeDate?: string;
  alternativeTime?: string;
  meetingType: 'online' | 'in_person';
  userDetails: {
    age?: number;
    gender?: 'male' | 'female';
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
}

export interface ConsultationCategory {
  id: string;
  name: string;
  icon: string;
}

export interface ConsultationBookingResponse {
  success: boolean;
  message?: string;
  arabic?: string;
  booking?: ConsultationBooking;
  order?: {
    _id: string;
    amount: number;
    currency: string;
  };
  nextStep?: string;
  paymentRequired?: boolean;
  error?: string;
}

export interface MyBookingsResponse {
  success: boolean;
  bookings: ConsultationBooking[];
  pagination: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
}

export interface ConsultationFeedback {
  rating: number;
  comment?: string;
}

export interface RescheduleRequest {
  newDate: string;
  newTime: string;
  reason?: string;
}

export interface CancelBookingRequest {
  reason?: string;
}

