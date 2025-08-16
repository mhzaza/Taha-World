// Booking and Consultation data models for Coach Taha's services

export interface Consultation {
  id: string;
  title: string;
  description: string;
  duration: number; // in minutes
  price: number;
  currency: 'USD' | 'SAR' | 'EGP';
  isActive: boolean;
  type: 'video' | 'audio' | 'in-person';
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TimeSlot {
  id: string;
  consultationId: string;
  startTime: Date;
  endTime: Date;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Booking {
  id: string;
  userId: string;
  consultationId: string;
  timeSlotId: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  paymentId?: string;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod?: 'stripe' | 'paypal' | 'bank_transfer';
  amount: number;
  currency: 'USD' | 'SAR' | 'EGP';
  meetingUrl?: string;
  meetingPassword?: string;
  reminderSent: boolean;
  feedbackId?: string;
  createdAt: Date;
  updatedAt: Date;
  cancelledAt?: Date;
  completedAt?: Date;
}

export interface ConsultationFeedback {
  id: string;
  bookingId: string;
  userId: string;
  rating: number; // 1-5
  comment?: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConsultationResource {
  id: string;
  consultationId: string;
  title: string;
  description?: string;
  type: 'pdf' | 'image' | 'video' | 'audio' | 'link';
  url: string;
  isPublic: boolean; // If false, only available after booking
  createdAt: Date;
  updatedAt: Date;
}

export interface BookingNotification {
  id: string;
  bookingId: string;
  userId: string;
  type: 'confirmation' | 'reminder' | 'cancellation' | 'rescheduled';
  message: string;
  isRead: boolean;
  sentVia: 'email' | 'sms' | 'in-app';
  createdAt: Date;
}