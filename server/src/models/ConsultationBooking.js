const mongoose = require('mongoose');

const consultationBookingSchema = new mongoose.Schema({
  // Booking Reference
  bookingNumber: {
    type: String,
    unique: true,
    required: [true, 'Booking number is required'],
    index: true
    // Format: CB-YYYYMMDD-XXXX (CB = Consultation Booking)
  },
  
  // User Information (from User DB)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  userEmail: {
    type: String,
    required: [true, 'User email is required'],
    lowercase: true,
    trim: true,
    index: true
  },
  userName: {
    type: String,
    required: [true, 'User name is required'],
    trim: true
  },
  userPhone: {
    type: String,
    required: [true, 'User phone is required for consultations'],
    trim: true
  },
  
  // Consultation Details
  consultationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Consultation',
    required: [true, 'Consultation ID is required'],
    index: true
  },
  consultationType: {
    type: String,
    required: [true, 'Consultation type is required']
  },
  consultationTitle: {
    type: String,
    required: [true, 'Consultation title is required']
  },
  consultationCategory: {
    type: String,
    required: [true, 'Consultation category is required'],
    index: true
  },
  
  // Scheduling Information
  preferredDate: {
    type: Date,
    required: [true, 'Preferred date is required'],
    index: true
  },
  preferredTime: {
    type: String,
    required: [true, 'Preferred time is required']
    // Format: "HH:MM" (24-hour format)
  },
  alternativeDate: {
    type: Date
  },
  alternativeTime: {
    type: String
  },
  confirmedDateTime: {
    type: Date,
    index: true
  },
  timezone: {
    type: String,
    default: 'Asia/Riyadh'
  },
  duration: {
    type: Number,
    required: [true, 'Duration is required'],
    min: [15, 'Duration must be at least 15 minutes']
  },
  
  // Meeting Details
  meetingType: {
    type: String,
    enum: ['online', 'in_person'],
    required: [true, 'Meeting type is required']
  },
  meetingLink: {
    type: String
  },
  meetingPassword: {
    type: String
  },
  meetingId: {
    type: String
  },
  location: {
    address: String,
    city: String,
    state: String,
    country: String,
    mapLink: String,
    notes: String
  },
  
  // User's Specific Information for Consultation
  userDetails: {
    age: {
      type: Number,
      min: [1, 'Age must be at least 1'],
      max: [150, 'Age cannot exceed 150']
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other']
    },
    weight: {
      type: Number,
      min: [0, 'Weight cannot be negative']
    },
    height: {
      type: Number,
      min: [0, 'Height cannot be negative']
    },
    fitnessLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced']
    },
    medicalConditions: String,
    currentActivity: String,
    goals: [String],
    dietaryRestrictions: String,
    injuries: String,
    medications: String,
    additionalNotes: String
  },
  
  // Payment Information
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    index: true
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative'],
    validate: {
      validator: function(value) {
        // Allow up to 2 decimal places
        return Number.isFinite(value) && /^\d+(\.\d{1,2})?$/.test(value.toFixed(2));
      },
      message: 'Amount must be a valid number with up to 2 decimal places'
    }
  },
  currency: {
    type: String,
    enum: ['USD', 'SAR', 'EGP'],
    default: 'USD'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending',
    index: true
  },
  paymentMethod: {
    type: String,
    enum: ['paypal', 'stripe', 'bank_transfer', 'cash', 'manual']
  },
  transactionId: {
    type: String
  },
  
  // Booking Status
  status: {
    type: String,
    enum: [
      'pending_payment',      // Waiting for payment
      'pending_confirmation', // Payment completed, waiting for admin confirmation
      'confirmed',            // Admin confirmed the booking
      'rescheduled',         // Booking was rescheduled
      'completed',           // Consultation completed
      'cancelled',           // Cancelled by user or admin
      'no_show'              // User didn't show up
    ],
    default: 'pending_payment',
    index: true
  },
  
  // Status Timestamps
  paymentCompletedAt: {
    type: Date
  },
  confirmedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  cancelledAt: {
    type: Date
  },
  
  // Cancellation/Rescheduling
  cancellationReason: {
    type: String,
    maxlength: [500, 'Cancellation reason cannot exceed 500 characters']
  },
  cancelledBy: {
    type: String,
    enum: ['user', 'admin', 'system']
  },
  refundAmount: {
    type: Number,
    default: 0
  },
  refundedAt: {
    type: Date
  },
  rescheduledFrom: {
    date: Date,
    time: String,
    reason: String
  },
  rescheduledReason: {
    type: String,
    maxlength: [500, 'Reschedule reason cannot exceed 500 characters']
  },
  rescheduledCount: {
    type: Number,
    default: 0
  },
  
  // Admin Notes and Actions
  adminNotes: {
    type: String,
    maxlength: [2000, 'Admin notes cannot exceed 2000 characters']
  },
  internalNotes: {
    type: String,
    maxlength: [2000, 'Internal notes cannot exceed 2000 characters']
  },
  assignedTo: {
    type: String,
    default: 'الكابتن طه الصباغ'
  },
  assignedToId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Communication
  remindersSent: [{
    type: {
      type: String,
      enum: ['email', 'sms', 'whatsapp', 'notification']
    },
    sentAt: Date,
    purpose: String,  // '24h_before', '1h_before', 'confirmation', 'feedback'
    success: {
      type: Boolean,
      default: true
    },
    errorMessage: String
  }],
  emailsSent: [{
    type: String,
    sentAt: Date,
    subject: String
  }],
  
  // Follow-up
  followUpRequired: {
    type: Boolean,
    default: false
  },
  followUpNotes: {
    type: String,
    maxlength: [1000, 'Follow-up notes cannot exceed 1000 characters']
  },
  followUpDate: {
    type: Date
  },
  followUpCompleted: {
    type: Boolean,
    default: false
  },
  
  // Review and Feedback
  userFeedback: {
    rating: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5']
    },
    comment: {
      type: String,
      maxlength: [1000, 'Feedback comment cannot exceed 1000 characters']
    },
    submittedAt: Date,
    isPublic: {
      type: Boolean,
      default: false
    }
  },
  consultantNotes: {
    type: String,
    maxlength: [2000, 'Consultant notes cannot exceed 2000 characters']
  },
  
  // Metadata
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  source: {
    type: String,
    enum: ['web', 'mobile', 'admin', 'api'],
    default: 'web'
  },
  referralSource: {
    type: String
  },
  
  // Attachments and documents
  attachments: [{
    name: String,
    url: String,
    type: String,
    uploadedAt: Date,
    uploadedBy: String
  }],
  
  // Additional flags
  isPriority: {
    type: Boolean,
    default: false
  },
  isFirstBooking: {
    type: Boolean,
    default: false
  },
  tags: [String]
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
consultationBookingSchema.index({ bookingNumber: 1 });
consultationBookingSchema.index({ userId: 1, status: 1 });
consultationBookingSchema.index({ userId: 1, createdAt: -1 });
consultationBookingSchema.index({ consultationId: 1, status: 1 });
consultationBookingSchema.index({ preferredDate: 1, status: 1 });
consultationBookingSchema.index({ confirmedDateTime: 1 });
consultationBookingSchema.index({ createdAt: -1 });
consultationBookingSchema.index({ paymentStatus: 1, status: 1 });
consultationBookingSchema.index({ status: 1, confirmedDateTime: 1 });
consultationBookingSchema.index({ userEmail: 1 });

// Compound indexes for common queries
consultationBookingSchema.index({ status: 1, confirmedDateTime: 1, assignedTo: 1 });
consultationBookingSchema.index({ userId: 1, status: 1, preferredDate: -1 });

// Virtual: Is upcoming
consultationBookingSchema.virtual('isUpcoming').get(function() {
  if (!this.confirmedDateTime) return false;
  return this.confirmedDateTime > new Date() && 
         (this.status === 'confirmed' || this.status === 'pending_confirmation');
});

// Virtual: Is past
consultationBookingSchema.virtual('isPast').get(function() {
  const dateTime = this.confirmedDateTime || this.preferredDate;
  return dateTime < new Date();
});

// Virtual: Full meeting details
consultationBookingSchema.virtual('fullSchedule').get(function() {
  const date = this.confirmedDateTime || this.preferredDate;
  const time = this.preferredTime;
  return { 
    date, 
    time, 
    duration: this.duration,
    formattedDate: date ? date.toLocaleDateString('ar-SA') : null
  };
});

// Virtual: Days until consultation
consultationBookingSchema.virtual('daysUntil').get(function() {
  if (!this.confirmedDateTime) return null;
  const now = new Date();
  const diff = this.confirmedDateTime - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

// Virtual: Hours until consultation
consultationBookingSchema.virtual('hoursUntil').get(function() {
  if (!this.confirmedDateTime) return null;
  const now = new Date();
  const diff = this.confirmedDateTime - now;
  return Math.ceil(diff / (1000 * 60 * 60));
});

// Pre-save middleware to generate booking number
consultationBookingSchema.pre('save', async function(next) {
  if (this.isNew && !this.bookingNumber) {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    
    // Find the last booking number for today
    const lastBooking = await this.constructor.findOne({
      bookingNumber: new RegExp(`^CB-${dateStr}-`)
    }).sort({ bookingNumber: -1 });
    
    let sequence = 1;
    if (lastBooking && lastBooking.bookingNumber) {
      const lastSequence = parseInt(lastBooking.bookingNumber.split('-').pop());
      sequence = lastSequence + 1;
    }
    
    this.bookingNumber = `CB-${dateStr}-${String(sequence).padStart(4, '0')}`;
  }
  
  // Update timestamps based on status changes
  if (this.isModified('status')) {
    const now = new Date();
    switch (this.status) {
      case 'confirmed':
        if (!this.confirmedAt) this.confirmedAt = now;
        break;
      case 'completed':
        if (!this.completedAt) this.completedAt = now;
        break;
      case 'cancelled':
        if (!this.cancelledAt) this.cancelledAt = now;
        break;
    }
  }
  
  if (this.isModified('paymentStatus') && this.paymentStatus === 'completed') {
    if (!this.paymentCompletedAt) this.paymentCompletedAt = new Date();
  }
  
  next();
});

// Static method to get bookings by user
consultationBookingSchema.statics.getByUser = function(userId, filters = {}) {
  const query = { userId, ...filters };
  return this.find(query)
    .populate('consultationId', 'title duration price category')
    .populate('orderId', 'amount status transactionId')
    .sort({ preferredDate: -1, createdAt: -1 });
};

// Static method to get upcoming bookings
consultationBookingSchema.statics.getUpcoming = function(filters = {}) {
  const now = new Date();
  return this.find({
    confirmedDateTime: { $gte: now },
    status: { $in: ['confirmed', 'pending_confirmation'] },
    ...filters
  })
    .populate('userId', 'displayName email phone')
    .populate('consultationId', 'title duration')
    .sort({ confirmedDateTime: 1 });
};

// Static method to get today's bookings
consultationBookingSchema.statics.getToday = function() {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);
  
  return this.find({
    confirmedDateTime: { $gte: startOfDay, $lte: endOfDay },
    status: { $in: ['confirmed', 'pending_confirmation'] }
  })
    .populate('userId', 'displayName email phone')
    .populate('consultationId', 'title duration')
    .sort({ confirmedDateTime: 1 });
};

// Static method to get pending confirmations
consultationBookingSchema.statics.getPendingConfirmations = function() {
  return this.find({ status: 'pending_confirmation' })
    .populate('userId', 'displayName email phone')
    .populate('consultationId', 'title duration price')
    .sort({ paymentCompletedAt: -1 });
};

// Static method to get revenue statistics
consultationBookingSchema.statics.getRevenueStats = async function(startDate, endDate) {
  const matchStage = { 
    status: { $in: ['completed', 'confirmed'] },
    paymentStatus: 'completed'
  };
  
  if (startDate && endDate) {
    matchStage.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }
  
  const stats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalBookings: { $sum: 1 },
        totalRevenue: { $sum: '$amount' },
        averageAmount: { $avg: '$amount' }
      }
    }
  ]);
  
  return stats[0] || {
    totalBookings: 0,
    totalRevenue: 0,
    averageAmount: 0
  };
};

// Instance method to send reminder
consultationBookingSchema.methods.addReminder = function(type, purpose, success = true, errorMessage = null) {
  this.remindersSent.push({
    type,
    sentAt: new Date(),
    purpose,
    success,
    errorMessage
  });
  return this.save();
};

// Instance method to check if can be cancelled
consultationBookingSchema.methods.canBeCancelled = function() {
  if (this.status === 'cancelled' || this.status === 'completed') {
    return { allowed: false, reason: 'Booking already cancelled or completed' };
  }
  
  // Check if within cancellation window (e.g., 24 hours before)
  if (this.confirmedDateTime) {
    const hoursUntil = (this.confirmedDateTime - new Date()) / (1000 * 60 * 60);
    if (hoursUntil < 24) {
      return { allowed: false, reason: 'Cannot cancel within 24 hours of consultation' };
    }
  }
  
  return { allowed: true };
};

// Instance method to check if can be rescheduled
consultationBookingSchema.methods.canBeRescheduled = function() {
  if (this.status === 'cancelled' || this.status === 'completed') {
    return { allowed: false, reason: 'Booking already cancelled or completed' };
  }
  
  if (this.rescheduledCount >= 2) {
    return { allowed: false, reason: 'Maximum reschedule limit reached (2)' };
  }
  
  return { allowed: true };
};

module.exports = mongoose.model('ConsultationBooking', consultationBookingSchema);

