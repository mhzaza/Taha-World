const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  userName: {
    type: String,
    required: true,
    trim: true
  },
  orderType: {
    type: String,
    enum: ['course', 'consultation', 'subscription'],
    default: 'course',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: function() {
      return this.orderType === 'course';
    }
  },
  courseTitle: {
    type: String,
    required: function() {
      return this.orderType === 'course';
    },
    trim: true
  },
  consultationBookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ConsultationBooking'
  },
  amount: {
    type: Number,
    required: [true, 'Order amount is required'],
    min: [0, 'Amount cannot be negative'],
    validate: {
      validator: function(value) {
        // Allow up to 2 decimal places
        return Number.isFinite(value) && /^\d+(\.\d{1,2})?$/.test(value.toFixed(2));
      },
      message: 'Amount must be a valid number with up to 2 decimal places'
    }
  },
  originalAmount: {
    type: Number,
    min: [0, 'Original amount cannot be negative']
  },
  currency: {
    type: String,
    enum: ['USD', 'SAR', 'EGP'],
    default: 'USD'
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['stripe', 'paypal', 'bank_transfer', 'manual'],
    required: true
  },
  paymentIntentId: {
    type: String,
    default: null
  },
  transactionId: {
    type: String,
    default: null
  },
  // Discount and coupon information
  couponCode: {
    type: String,
    default: null
  },
  discountAmount: {
    type: Number,
    default: 0,
    min: [0, 'Discount amount cannot be negative']
  },
  taxAmount: {
    type: Number,
    default: 0,
    min: [0, 'Tax amount cannot be negative']
  },
  // Timestamps for different status changes
  completedAt: {
    type: Date,
    default: null
  },
  refundedAt: {
    type: Date,
    default: null
  },
  refundReason: {
    type: String,
    default: null
  },
  cancelledAt: {
    type: Date,
    default: null
  },
  cancellationReason: {
    type: String,
    default: null
  },
  failureReason: {
    type: String,
    default: null
  },
  // Additional information
  notes: {
    type: String,
    default: null
  },
  // Payment provider specific data
  paymentData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  // Bank Transfer specific fields
  bankTransfer: {
    receiptImage: {
      type: String,
      default: null
    },
    receiptImagePublicId: {
      type: String,
      default: null
    },
    transferDate: {
      type: Date,
      default: null
    },
    transferReference: {
      type: String,
      default: null
    },
    bankName: {
      type: String,
      default: null
    },
    accountHolderName: {
      type: String,
      default: null
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending'
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    verifiedAt: {
      type: Date,
      default: null
    },
    rejectionReason: {
      type: String,
      default: null
    }
  },
  // Shipping information (if applicable)
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  // IP and user agent for security
  ipAddress: String,
  userAgent: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
orderSchema.index({ userId: 1 });
orderSchema.index({ courseId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentMethod: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ userEmail: 1 });
orderSchema.index({ transactionId: 1 });
orderSchema.index({ paymentIntentId: 1 });

// Virtual for total amount after discount
orderSchema.virtual('totalAmount').get(function() {
  return this.amount + (this.taxAmount || 0);
});

// Virtual for savings amount
orderSchema.virtual('savingsAmount').get(function() {
  return (this.originalAmount || this.amount) - this.amount;
});

// Virtual for order duration (time from creation to completion)
orderSchema.virtual('processingTime').get(function() {
  if (!this.completedAt) return null;
  return this.completedAt.getTime() - this.createdAt.getTime();
});

// Pre-save middleware to update timestamps based on status
orderSchema.pre('save', function(next) {
  const now = new Date();
  
  if (this.isModified('status')) {
    switch (this.status) {
      case 'completed':
        if (!this.completedAt) this.completedAt = now;
        break;
      case 'refunded':
        if (!this.refundedAt) this.refundedAt = now;
        break;
      case 'cancelled':
        if (!this.cancelledAt) this.cancelledAt = now;
        break;
    }
  }
  
  next();
});

// Static method to get orders by user
orderSchema.statics.getByUser = function(userId) {
  return this.find({ userId })
    .populate('courseId', 'title thumbnail price')
    .sort({ createdAt: -1 });
};

// Static method to get orders by status
orderSchema.statics.getByStatus = function(status) {
  return this.find({ status })
    .populate('userId', 'displayName email')
    .populate('courseId', 'title')
    .sort({ createdAt: -1 });
};

// Static method to get revenue statistics
orderSchema.statics.getRevenueStats = async function(startDate, endDate) {
  const matchStage = { status: 'completed' };
  
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
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$amount' },
        averageOrderValue: { $avg: '$amount' },
        totalTax: { $sum: '$taxAmount' },
        totalDiscount: { $sum: '$discountAmount' }
      }
    }
  ]);
  
  return stats[0] || {
    totalOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    totalTax: 0,
    totalDiscount: 0
  };
};

// Static method to get monthly revenue
orderSchema.statics.getMonthlyRevenue = async function(year) {
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year + 1, 0, 1);
  
  return this.aggregate([
    {
      $match: {
        status: 'completed',
        createdAt: { $gte: startDate, $lt: endDate }
      }
    },
    {
      $group: {
        _id: { $month: '$createdAt' },
        revenue: { $sum: '$amount' },
        orders: { $sum: 1 }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);
};

// Static method to get popular courses
orderSchema.statics.getPopularCourses = async function(limit = 10) {
  return this.aggregate([
    { $match: { status: 'completed' } },
    {
      $group: {
        _id: '$courseId',
        courseTitle: { $first: '$courseTitle' },
        orders: { $sum: 1 },
        revenue: { $sum: '$amount' }
      }
    },
    {
      $lookup: {
        from: 'courses',
        localField: '_id',
        foreignField: '_id',
        as: 'course'
      }
    },
    { $unwind: '$course' },
    {
      $project: {
        courseId: '$_id',
        courseTitle: 1,
        orders: 1,
        revenue: 1,
        thumbnail: '$course.thumbnail',
        rating: '$course.rating'
      }
    },
    { $sort: { orders: -1, revenue: -1 } },
    { $limit: limit }
  ]);
};

module.exports = mongoose.model('Order', orderSchema);
