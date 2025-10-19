const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userEmail: {
    type: String,
    required: false
  },
  userName: {
    type: String,
    required: false
  },
  userAvatar: {
    type: String,
    default: null
  },
  rating: {
    type: Number,
    required: true,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, 'Review title cannot exceed 100 characters']
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    maxlength: [1000, 'Review comment cannot exceed 1000 characters']
  },
  isVerified: {
    type: Boolean,
    default: false // Whether the user actually took the course
  },
  isVisible: {
    type: Boolean,
    default: true // Admin can hide reviews
  },
  helpfulVotes: {
    type: Number,
    default: 0
  },
  totalVotes: {
    type: Number,
    default: 0
  },
  reportedCount: {
    type: Number,
    default: 0
  },
  adminNotes: {
    type: String,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes
reviewSchema.index({ courseId: 1, createdAt: -1 });
reviewSchema.index({ userId: 1, courseId: 1 }, { unique: true }); // One review per user per course
reviewSchema.index({ rating: 1 });
reviewSchema.index({ isVisible: 1 });

// Virtual for helpful percentage
reviewSchema.virtual('helpfulPercentage').get(function() {
  if (this.totalVotes === 0) return 0;
  return Math.round((this.helpfulVotes / this.totalVotes) * 100);
});

// Static method to get course reviews
reviewSchema.statics.getCourseReviews = async function(courseId, options = {}) {
  const {
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    rating = null,
    isVisible = true
  } = options;

  const skip = (page - 1) * limit;
  const filter = { courseId, isVisible };

  if (rating) {
    filter.rating = rating;
  }

  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const reviews = await this.find(filter)
    .populate('userId', 'displayName avatar email')
    .sort(sort)
    .skip(skip)
    .limit(limit);

  const total = await this.countDocuments(filter);

  return {
    reviews,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    hasNextPage: page < Math.ceil(total / limit),
    hasPrevPage: page > 1
  };
};

// Static method to get course rating statistics
reviewSchema.statics.getCourseRatingStats = async function(courseId) {
  const stats = await this.aggregate([
    { $match: { courseId: new mongoose.Types.ObjectId(courseId), isVisible: true } },
    {
      $group: {
        _id: null,
        totalReviews: { $sum: 1 },
        averageRating: { $avg: '$rating' },
        ratingDistribution: {
          $push: '$rating'
        }
      }
    }
  ]);

  if (stats.length === 0) {
    return {
      totalReviews: 0,
      averageRating: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    };
  }

  const result = stats[0];
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  
  result.ratingDistribution.forEach(rating => {
    distribution[rating] = (distribution[rating] || 0) + 1;
  });

  return {
    totalReviews: result.totalReviews,
    averageRating: Math.round(result.averageRating * 10) / 10,
    ratingDistribution: distribution
  };
};

// Pre-save middleware to update user info
reviewSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      const User = mongoose.model('User');
      const user = await User.findById(this.userId).select('displayName avatar email');
      if (user) {
        this.userName = user.displayName;
        this.userEmail = user.email;
        this.userAvatar = user.avatar;
      }
    } catch (error) {
      console.error('Error updating review user info:', error);
    }
  }
  next();
});

module.exports = mongoose.model('Review', reviewSchema);
