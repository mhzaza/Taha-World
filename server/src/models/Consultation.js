const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema({
  consultationId: {
    type: Number,
    required: true,
    unique: true,
    index: true
  },
  title: {
    type: String,
    required: [true, 'Consultation title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  titleEn: {
    type: String,
    trim: true,
    maxlength: [200, 'English title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  descriptionEn: {
    type: String,
    trim: true,
    maxlength: [1000, 'English description cannot exceed 1000 characters']
  },
  duration: {
    type: String,
    required: [true, 'Duration is required']
    // e.g., "60 دقيقة", "75 دقيقة", "90 دقيقة"
  },
  durationMinutes: {
    type: Number,
    required: [true, 'Duration in minutes is required'],
    min: [15, 'Duration must be at least 15 minutes'],
    max: [480, 'Duration cannot exceed 8 hours']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
    validate: {
      validator: function(value) {
        // Allow up to 2 decimal places
        return Number.isFinite(value) && /^\d+(\.\d{1,2})?$/.test(value.toFixed(2));
      },
      message: 'Price must be a valid number with up to 2 decimal places'
    }
  },
  originalPrice: {
    type: Number,
    min: [0, 'Original price cannot be negative'],
    validate: {
      validator: function(value) {
        if (value === null || value === undefined) return true;
        // Allow up to 2 decimal places
        return Number.isFinite(value) && /^\d+(\.\d{1,2})?$/.test(value.toFixed(2));
      },
      message: 'Original price must be a valid number with up to 2 decimal places'
    }
  },
  currency: {
    type: String,
    enum: ['USD', 'SAR', 'EGP'],
    default: 'USD'
  },
  category: {
    type: String,
    enum: ['sports', 'life_coaching', 'group', 'vip', 'nutrition', 'general'],
    required: [true, 'Category is required'],
    index: true
  },
  features: [{
    type: String,
    trim: true
  }],
  image: {
    type: String,
    default: null
  },
  thumbnail: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  maxBookingsPerDay: {
    type: Number,
    default: 5,
    min: [1, 'Must allow at least 1 booking per day']
  },
  requiresApproval: {
    type: Boolean,
    default: false
  },
  consultationType: {
    type: String,
    enum: ['online', 'in_person', 'both'],
    default: 'both'
  },
  // Availability settings
  availableDays: [{
    type: String,
    enum: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  }],
  availableTimeSlots: [{
    start: String,  // e.g., "09:00"
    end: String     // e.g., "17:00"
  }],
  // Statistics
  totalBookings: {
    type: Number,
    default: 0
  },
  completedBookings: {
    type: Number,
    default: 0
  },
  totalRevenue: {
    type: Number,
    default: 0
  },
  averageRating: {
    type: Number,
    default: 0,
    min: [0, 'Rating cannot be negative'],
    max: [5, 'Rating cannot exceed 5']
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  // SEO and metadata
  slug: {
    type: String,
    unique: true,
    sparse: true
  },
  metaDescription: {
    type: String,
    maxlength: [200, 'Meta description cannot exceed 200 characters']
  },
  tags: [{
    type: String,
    trim: true
  }],
  // Order/priority for display
  displayOrder: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
consultationSchema.index({ consultationId: 1 });
consultationSchema.index({ category: 1, isActive: 1 });
consultationSchema.index({ isActive: 1, displayOrder: 1 });
consultationSchema.index({ price: 1 });
consultationSchema.index({ slug: 1 });

// Virtual for formatted price
consultationSchema.virtual('formattedPrice').get(function() {
  const symbol = this.currency === 'USD' ? '$' : this.currency === 'SAR' ? 'ر.س' : 'ج.م';
  return `${this.price}${symbol}`;
});

// Virtual for discount percentage
consultationSchema.virtual('discountPercentage').get(function() {
  if (!this.originalPrice || this.originalPrice <= this.price) return 0;
  return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
});

// Virtual for savings
consultationSchema.virtual('savings').get(function() {
  if (!this.originalPrice || this.originalPrice <= this.price) return 0;
  return this.originalPrice - this.price;
});

// Pre-save middleware to generate slug
consultationSchema.pre('save', function(next) {
  if (this.isModified('title') && !this.slug) {
    // Generate slug from title (simplified, you might want to use a library like slugify)
    this.slug = this.title
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  }
  next();
});

// Static method to get active consultations
consultationSchema.statics.getActive = function(category = null) {
  const query = { isActive: true };
  if (category) query.category = category;
  
  return this.find(query)
    .sort({ displayOrder: 1, createdAt: -1 });
};

// Static method to get by category
consultationSchema.statics.getByCategory = function(category) {
  return this.find({ category, isActive: true })
    .sort({ displayOrder: 1, price: 1 });
};

// Static method to get popular consultations
consultationSchema.statics.getPopular = function(limit = 5) {
  return this.find({ isActive: true })
    .sort({ totalBookings: -1, averageRating: -1 })
    .limit(limit);
};

// Instance method to check availability on a specific date
consultationSchema.methods.isAvailableOn = function(date) {
  if (!this.availableDays || this.availableDays.length === 0) return true;
  
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayName = dayNames[date.getDay()];
  
  return this.availableDays.includes(dayName);
};

// Instance method to update statistics after booking
consultationSchema.methods.incrementBooking = async function(amount, isCompleted = false) {
  this.totalBookings += 1;
  if (isCompleted) {
    this.completedBookings += 1;
    this.totalRevenue += amount;
  }
  return this.save();
};

// Instance method to update rating
consultationSchema.methods.updateRating = async function(newRating) {
  const totalRating = this.averageRating * this.totalReviews;
  this.totalReviews += 1;
  this.averageRating = (totalRating + newRating) / this.totalReviews;
  return this.save();
};

module.exports = mongoose.model('Consultation', consultationSchema);

