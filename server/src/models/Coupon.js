const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
    maxUses: {
      type: Number,
      default: null, // null means unlimited
      min: 1,
    },
    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    usedBy: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        usedAt: {
          type: Date,
          default: Date.now,
        },
        orderId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Order',
        },
      },
    ],
    validFrom: {
      type: Date,
      default: Date.now,
    },
    validUntil: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    applicableTo: {
      type: String,
      enum: ['all', 'courses', 'consultations', 'specific'],
      default: 'all',
    },
    specificCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
      },
    ],
    specificConsultations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Consultation',
      },
    ],
    minPurchaseAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
couponSchema.index({ code: 1, isActive: 1 });
couponSchema.index({ validFrom: 1, validUntil: 1 });

// Virtual for checking if coupon is expired
couponSchema.virtual('isExpired').get(function () {
  return new Date() > this.validUntil;
});

// Virtual for checking if coupon is within valid date range
couponSchema.virtual('isValidDate').get(function () {
  const now = new Date();
  return now >= this.validFrom && now <= this.validUntil;
});

// Virtual for checking if coupon has reached max uses
couponSchema.virtual('isMaxedOut').get(function () {
  if (!this.maxUses) return false;
  return this.usedCount >= this.maxUses;
});

// Method to check if user has already used this coupon
couponSchema.methods.hasUserUsed = function (userId) {
  return this.usedBy.some((usage) => usage.userId.toString() === userId.toString());
};

// Method to check if coupon is valid (active, not expired, not maxed out)
couponSchema.methods.isValid = function () {
  const now = new Date();
  const isDateValid = now >= this.validFrom && now <= this.validUntil;
  const isNotMaxedOut = !this.maxUses || this.usedCount < this.maxUses;
  
  return this.isActive && isDateValid && isNotMaxedOut;
};

// Method to increment usage count
couponSchema.methods.incrementUsage = async function (userId, orderId) {
  this.usedCount += 1;
  this.usedBy.push({
    userId,
    orderId,
    usedAt: new Date(),
  });
  await this.save();
};

// Method to calculate discount for a given amount
couponSchema.methods.calculateDiscount = function (amount) {
  if (this.discountType === 'percentage') {
    return (amount * this.discountValue) / 100;
  } else {
    return Math.min(this.discountValue, amount); // Don't discount more than the total
  }
};

// Static method to find valid coupon by code
couponSchema.statics.findValidCoupon = async function (code) {
  const coupon = await this.findOne({
    code: code.toUpperCase(),
    isActive: true,
  });

  if (!coupon) return null;
  if (!coupon.isValid()) return null;

  return coupon;
};

// Pre-save middleware to ensure discount value is valid
couponSchema.pre('save', function (next) {
  if (this.discountType === 'percentage' && this.discountValue > 100) {
    this.discountValue = 100;
  }
  if (this.discountValue < 0) {
    this.discountValue = 0;
  }
  next();
});

// Ensure virtuals are included when converting to JSON
couponSchema.set('toJSON', { virtuals: true });
couponSchema.set('toObject', { virtuals: true });

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon;
