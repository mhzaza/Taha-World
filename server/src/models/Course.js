const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Lesson title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  videoUrl: {
    type: String,
    required: [true, 'Video URL is required']
  },
  duration: {
    type: Number, // in minutes
    required: [true, 'Lesson duration is required'],
    min: [1, 'Duration must be at least 1 minute']
  },
  order: {
    type: Number,
    required: true,
    min: [1, 'Order must be at least 1']
  },
  isFree: {
    type: Boolean,
    default: false
  },
  resources: [{
    title: String,
    url: String,
    type: {
      type: String,
      enum: ['pdf', 'video', 'image', 'link', 'other']
    }
  }],
  quiz: {
    questions: [{
      question: String,
      options: [String],
      correctAnswer: Number,
      explanation: String,
      points: { type: Number, default: 1 }
    }],
    passingScore: { type: Number, default: 70 }
  }
}, {
  timestamps: true
});

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Course title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  titleEn: {
    type: String,
    trim: true,
    maxlength: [100, 'English title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Course description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  descriptionEn: {
    type: String,
    trim: true,
    maxlength: [1000, 'English description cannot exceed 1000 characters']
  },
  instructor: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    avatar: String,
    bio: String,
    credentials: [String]
  },
  thumbnail: {
    type: String,
    required: [true, 'Course thumbnail is required']
  },
  price: {
    type: Number,
    required: [true, 'Course price is required'],
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
    min: [0, 'Original price cannot be negative']
  },
  currency: {
    type: String,
    enum: ['USD', 'SAR', 'EGP'],
    default: 'USD'
  },
  duration: {
    type: Number, // total duration in minutes
    required: true,
    min: [1, 'Duration must be at least 1 minute']
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: [true, 'Course level is required']
  },
  category: {
    type: String,
    required: [true, 'Course category is required'],
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  lessons: [lessonSchema],
  requirements: [{
    type: String,
    trim: true
  }],
  whatYouWillLearn: [{
    type: String,
    trim: true
  }],
  rating: {
    average: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be negative'],
      max: [5, 'Rating cannot exceed 5']
    },
    count: {
      type: Number,
      default: 0,
      min: [0, 'Rating count cannot be negative']
    }
  },
  enrollmentCount: {
    type: Number,
    default: 0,
    min: [0, 'Enrollment count cannot be negative']
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  language: {
    type: String,
    enum: ['ar', 'en'],
    default: 'ar'
  },
  subtitles: [{
    type: String,
    enum: ['ar', 'en', 'fr', 'es']
  }],
  certificateTemplate: String,
  // SEO fields
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  metaTitle: String,
  metaDescription: String,
  // Analytics
  views: {
    type: Number,
    default: 0
  },
  completionRate: {
    type: Number,
    default: 0,
    min: [0, 'Completion rate cannot be negative'],
    max: [100, 'Completion rate cannot exceed 100%']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
courseSchema.index({ isPublished: 1, isFeatured: 1 });
courseSchema.index({ category: 1 });
courseSchema.index({ level: 1 });
courseSchema.index({ language: 1 });
courseSchema.index({ 'rating.average': -1 });
courseSchema.index({ enrollmentCount: -1 });
courseSchema.index({ createdAt: -1 });
courseSchema.index({ slug: 1 });

// Virtual for total lessons count
courseSchema.virtual('totalLessons').get(function() {
  return this.lessons ? this.lessons.length : 0;
});

// Virtual for free lessons count
courseSchema.virtual('freeLessons').get(function() {
  return this.lessons ? this.lessons.filter(lesson => lesson.isFree).length : 0;
});

// Virtual for paid lessons count
courseSchema.virtual('paidLessons').get(function() {
  return this.lessons ? this.lessons.filter(lesson => !lesson.isFree).length : 0;
});

// Pre-save middleware to generate slug
courseSchema.pre('save', function(next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\u0600-\u06FF\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  }
  next();
});

// Static method to get featured courses
courseSchema.statics.getFeatured = function() {
  return this.find({ 
    isPublished: true, 
    isFeatured: true 
  }).sort({ createdAt: -1 });
};

// Static method to get courses by category
courseSchema.statics.getByCategory = function(category) {
  return this.find({ 
    isPublished: true, 
    category: new RegExp(category, 'i') 
  }).sort({ createdAt: -1 });
};

// Static method to search courses
courseSchema.statics.search = function(query) {
  const searchRegex = new RegExp(query, 'i');
  return this.find({
    isPublished: true,
    $or: [
      { title: searchRegex },
      { description: searchRegex },
      { tags: { $in: [searchRegex] } },
      { category: searchRegex }
    ]
  }).sort({ 'rating.average': -1, enrollmentCount: -1 });
};

// Static method to get course statistics
courseSchema.statics.getCourseStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalCourses: { $sum: 1 },
        publishedCourses: { $sum: { $cond: [{ $eq: ['$isPublished', true] }, 1, 0] } },
        featuredCourses: { $sum: { $cond: [{ $eq: ['$isFeatured', true] }, 1, 0] } },
        totalEnrollments: { $sum: '$enrollmentCount' },
        averageRating: { $avg: '$rating.average' },
        totalRevenue: { $sum: { $multiply: ['$price', '$enrollmentCount'] } }
      }
    }
  ]);
  
  return stats[0] || {
    totalCourses: 0,
    publishedCourses: 0,
    featuredCourses: 0,
    totalEnrollments: 0,
    averageRating: 0,
    totalRevenue: 0
  };
};

module.exports = mongoose.model('Course', courseSchema);
