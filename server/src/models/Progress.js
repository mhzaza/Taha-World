const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  lessonId: {
    type: String,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  watchTime: {
    type: Number, // in seconds
    default: 0,
    min: [0, 'Watch time cannot be negative']
  },
  totalDuration: {
    type: Number, // in seconds - duration of the lesson
    required: true,
    min: [0, 'Duration cannot be negative']
  },
  lastWatchedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date,
    default: null
  },
  quizScore: {
    type: Number,
    min: [0, 'Quiz score cannot be negative'],
    max: [100, 'Quiz score cannot exceed 100%'],
    default: null
  },
  quizAttempts: [{
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    answers: [{
      questionIndex: Number,
      selectedAnswer: Number,
      isCorrect: Boolean
    }],
    completedAt: {
      type: Date,
      default: Date.now
    }
  }],
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    default: null
  },
  // Progress percentage (0-100)
  progressPercentage: {
    type: Number,
    default: 0,
    min: [0, 'Progress percentage cannot be negative'],
    max: [100, 'Progress percentage cannot exceed 100%']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound index for efficient queries
progressSchema.index({ userId: 1, courseId: 1 });
progressSchema.index({ userId: 1, lessonId: 1 });
progressSchema.index({ courseId: 1, completed: 1 });
progressSchema.index({ lastWatchedAt: -1 });

// Virtual for completion percentage based on watch time
progressSchema.virtual('completionPercentage').get(function() {
  if (this.totalDuration === 0) return 0;
  const percentage = (this.watchTime / this.totalDuration) * 100;
  return Math.min(percentage, 100);
});

// Virtual for is lesson completed based on watch time (80% watched = completed)
progressSchema.virtual('isLessonCompleted').get(function() {
  return this.completionPercentage >= 80 || this.completed;
});

// Pre-save middleware to update progress percentage and completion status
progressSchema.pre('save', function(next) {
  // Update progress percentage
  this.progressPercentage = this.completionPercentage;
  
  // Auto-complete lesson if 80% watched or manually marked complete
  if (this.completionPercentage >= 80 && !this.completed) {
    this.completed = true;
    if (!this.completedAt) {
      this.completedAt = new Date();
    }
  }
  
  next();
});

// Static method to get user's course progress
progressSchema.statics.getCourseProgress = async function(userId, courseId) {
  const progress = await this.find({ userId, courseId })
    .sort({ lastWatchedAt: -1 });
  
  // Get the actual course to get the correct total lesson count
  const Course = mongoose.model('Course');
  const course = await Course.findById(courseId).select('lessons');
  const actualTotalLessons = course?.lessons?.length || 0;
  
  // Count completed lessons from progress records
  const completedLessons = progress.filter(p => p.completed).length;
  const totalWatchTime = progress.reduce((sum, p) => sum + (p.watchTime || 0), 0);
  const totalDuration = progress.reduce((sum, p) => sum + (p.totalDuration || 0), 0);
  
  // Calculate percentage based on actual course lessons, not progress records
  const progressPercentage = actualTotalLessons > 0 ? Math.round((completedLessons / actualTotalLessons) * 100) : 0;
  
  return {
    totalLessons: actualTotalLessons,
    completedLessons,
    progressPercentage,
    totalWatchTime,
    totalDuration,
    lessons: progress
  };
};

// Static method to get user's overall progress
progressSchema.statics.getUserProgress = async function(userId) {
  const stats = await this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$courseId',
        totalLessons: { $sum: 1 },
        completedLessons: { $sum: { $cond: ['$completed', 1, 0] } },
        totalWatchTime: { $sum: '$watchTime' },
        totalDuration: { $sum: '$totalDuration' },
        lastWatchedAt: { $max: '$lastWatchedAt' }
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
    { $unwind: { path: '$course', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        courseId: '$_id',
        courseTitle: { $ifNull: ['$course.title', 'Unknown Course'] },
        courseThumbnail: { $ifNull: ['$course.thumbnail', ''] },
        totalLessons: { $size: { $ifNull: ['$course.lessons', []] } },
        completedLessons: 1,
        progressPercentage: {
          $cond: {
            if: { $gt: [{ $size: { $ifNull: ['$course.lessons', []] } }, 0] },
            then: {
              $round: [
                { 
                  $multiply: [
                    { $divide: ['$completedLessons', { $size: { $ifNull: ['$course.lessons', []] } }] }, 
                    100
                  ] 
                },
                2
              ]
            },
            else: 0
          }
        },
        totalWatchTime: 1,
        totalDuration: 1,
        lastWatchedAt: 1
      }
    },
    { $sort: { lastWatchedAt: -1 } }
  ]);
  
  return stats;
};

// Static method to get course completion statistics
progressSchema.statics.getCourseStats = async function(courseId) {
  const stats = await this.aggregate([
    { $match: { courseId: new mongoose.Types.ObjectId(courseId) } },
    {
      $group: {
        _id: '$lessonId',
        totalStudents: { $addToSet: '$userId' },
        completedStudents: {
          $addToSet: {
            $cond: ['$completed', '$userId', null]
          }
        },
        averageWatchTime: { $avg: '$watchTime' },
        averageQuizScore: { $avg: '$quizScore' }
      }
    },
    {
      $project: {
        lessonId: '$_id',
        totalStudents: { $size: '$totalStudents' },
        completedStudents: {
          $size: {
            $filter: {
              input: '$completedStudents',
              cond: { $ne: ['$$this', null] }
            }
          }
        },
        completionRate: {
          $round: [
            {
              $multiply: [
                {
                  $divide: [
                    {
                      $size: {
                        $filter: {
                          input: '$completedStudents',
                          cond: { $ne: ['$$this', null] }
                        }
                      }
                    },
                    { $size: '$totalStudents' }
                  ]
                },
                100
              ]
            },
            2
          ]
        },
        averageWatchTime: { $round: ['$averageWatchTime', 2] },
        averageQuizScore: { $round: ['$averageQuizScore', 2] }
      }
    }
  ]);
  
  return stats;
};

// Static method to get lesson analytics
progressSchema.statics.getLessonAnalytics = async function(lessonId) {
  const analytics = await this.aggregate([
    { $match: { lessonId: new mongoose.Types.ObjectId(lessonId) } },
    {
      $group: {
        _id: null,
        totalViews: { $sum: 1 },
        uniqueStudents: { $addToSet: '$userId' },
        completedStudents: {
          $addToSet: {
            $cond: ['$completed', '$userId', null]
          }
        },
        averageWatchTime: { $avg: '$watchTime' },
        averageQuizScore: { $avg: '$quizScore' },
        totalWatchTime: { $sum: '$watchTime' }
      }
    },
    {
      $project: {
        totalViews: 1,
        uniqueStudents: { $size: '$uniqueStudents' },
        completedStudents: {
          $size: {
            $filter: {
              input: '$completedStudents',
              cond: { $ne: ['$$this', null] }
            }
          }
        },
        completionRate: {
          $round: [
            {
              $multiply: [
                {
                  $divide: [
                    {
                      $size: {
                        $filter: {
                          input: '$completedStudents',
                          cond: { $ne: ['$$this', null] }
                        }
                      }
                    },
                    { $size: '$uniqueStudents' }
                  ]
                },
                100
              ]
            },
            2
          ]
        },
        averageWatchTime: { $round: ['$averageWatchTime', 2] },
        averageQuizScore: { $round: ['$averageQuizScore', 2] },
        totalWatchTime: 1
      }
    }
  ]);
  
  return analytics[0] || {
    totalViews: 0,
    uniqueStudents: 0,
    completedStudents: 0,
    completionRate: 0,
    averageWatchTime: 0,
    averageQuizScore: 0,
    totalWatchTime: 0
  };
};

module.exports = mongoose.model('Progress', progressSchema);
