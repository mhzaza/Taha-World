const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Course = require('../models/Course');
const Order = require('../models/Order');
const Progress = require('../models/Progress');
const { authenticate, authorizeResource } = require('../middleware/auth');

const router = express.Router();

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
router.get('/profile', authenticate, async (req, res) => {
  try {
    console.log('Getting profile for user:', req.user._id);
    
    // First try without populate to see if basic query works
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        arabic: 'المستخدم غير موجود'
      });
    }

    console.log('User found:', user.email);

    // Try to populate enrolled courses if they exist
    let userWithPopulated = user;
    if (user.enrolledCourses && user.enrolledCourses.length > 0) {
      try {
        userWithPopulated = await User.findById(req.user._id)
          .populate('enrolledCourses', 'title thumbnail price level category');
      } catch (populateError) {
        console.error('Populate error:', populateError);
        // Use user without populate if populate fails
        userWithPopulated = user;
      }
    }

    res.json({
      success: true,
      user: userWithPopulated
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: 'Internal server error',
      arabic: 'خطأ داخلي في الخادم',
      details: error.message
    });
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
router.put('/profile', authenticate, [
  body('displayName').optional().isLength({ min: 2, max: 50 }).withMessage('Display name must be between 2 and 50 characters'),
  body('phone').optional().isString().withMessage('Phone must be a string'),
  body('location').optional().isString().withMessage('Location must be a string'),
  body('bio').optional().isLength({ max: 500 }).withMessage('Bio cannot exceed 500 characters'),
  body('gender').optional().isIn(['male', 'female', 'other']).withMessage('Invalid gender'),
  body('fitnessLevel').optional().isIn(['beginner', 'intermediate', 'advanced']).withMessage('Invalid fitness level'),
  body('goals').optional().isArray().withMessage('Goals must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        arabic: 'فشل في التحقق من البيانات',
        details: errors.array()
      });
    }

    const allowedUpdates = ['displayName', 'phone', 'location', 'birthDate', 'bio', 'gender', 'fitnessLevel', 'goals'];
    const updates = {};

    // Filter allowed updates
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      arabic: 'تم تحديث الملف الشخصي بنجاح',
      user
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      error: 'Internal server error',
      arabic: 'خطأ داخلي في الخادم'
    });
  }
});

// @desc    Get user's enrolled courses
// @route   GET /api/users/courses
// @access  Private
router.get('/courses', authenticate, async (req, res) => {
  try {
    console.log('Getting courses for user:', req.user._id);
    
    const user = await User.findById(req.user._id).populate({
      path: 'enrolledCourses',
      populate: {
        path: 'instructor.id',
        select: 'displayName avatar'
      }
    });

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        arabic: 'المستخدم غير موجود'
      });
    }

    console.log('User found:', user.email);
    console.log('Enrolled courses:', user.enrolledCourses);

    // Check if user has enrolled courses
    const enrolledCourses = user.enrolledCourses || [];
    console.log('Enrolled courses count:', enrolledCourses.length);
    
    // Get progress for each course
    const coursesWithProgress = await Promise.all(
      enrolledCourses.map(async (course) => {
        try {
          const progress = await Progress.getCourseProgress(req.user._id, course._id);
          return {
            ...course.toObject(),
            progress
          };
        } catch (progressError) {
          console.error(`Error getting progress for course ${course._id}:`, progressError);
          // Return course without progress if there's an error
          return {
            ...course.toObject(),
            progress: {
              totalLessons: 0,
              completedLessons: 0,
              progressPercentage: 0,
              totalWatchTime: 0,
              totalDuration: 0,
              lessons: []
            }
          };
        }
      })
    );

    console.log('Courses with progress:', coursesWithProgress);
    
    res.json({
      success: true,
      courses: coursesWithProgress
    });

  } catch (error) {
    console.error('Get user courses error:', error);
    res.status(500).json({
      error: 'Internal server error',
      arabic: 'خطأ داخلي في الخادم'
    });
  }
});

// @desc    Get user's orders
// @route   GET /api/users/orders
// @access  Private
router.get('/orders', authenticate, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const orders = await Order.find({ userId: req.user._id })
      .populate('courseId', 'title thumbnail')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments({ userId: req.user._id });

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      orders,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit
      }
    });

  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({
      error: 'Internal server error',
      arabic: 'خطأ داخلي في الخادم'
    });
  }
});

// @desc    Get user's certificates
// @route   GET /api/users/certificates
// @access  Private
router.get('/certificates', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('certificates', 'courseTitle issuedAt verificationCode');

    res.json({
      success: true,
      certificates: user.certificates
    });

  } catch (error) {
    console.error('Get user certificates error:', error);
    res.status(500).json({
      error: 'Internal server error',
      arabic: 'خطأ داخلي في الخادم'
    });
  }
});

// @desc    Get user's learning progress
// @route   GET /api/users/progress
// @access  Private
router.get('/progress', authenticate, async (req, res) => {
  try {
    const { courseId } = req.query;
    
    let progress;
    if (courseId) {
      // Get progress for a specific course
      progress = await Progress.find({ 
        userId: req.user._id, 
        courseId: courseId 
      });
    } else {
      // Get overall progress (aggregated by course)
      try {
        progress = await Progress.getUserProgress(req.user._id);
      } catch (progressError) {
        console.error('Error in getUserProgress:', progressError);
        // Fallback to basic progress query
        progress = await Progress.find({ userId: req.user._id })
          .populate('courseId', 'title thumbnail')
          .select('courseId completed watchTime totalDuration lastWatchedAt')
          .lean();
        
        // Group by courseId manually
        const groupedProgress = {};
        progress.forEach(p => {
          const courseId = p.courseId._id || p.courseId;
          if (!groupedProgress[courseId]) {
            groupedProgress[courseId] = {
              courseId: courseId,
              courseTitle: p.courseId.title || 'Unknown Course',
              courseThumbnail: p.courseId.thumbnail || '',
              totalLessons: 0,
              completedLessons: 0,
              totalWatchTime: 0,
              totalDuration: 0,
              progressPercentage: 0,
              lastWatchedAt: p.lastWatchedAt
            };
          }
          groupedProgress[courseId].totalLessons++;
          if (p.completed) groupedProgress[courseId].completedLessons++;
          groupedProgress[courseId].totalWatchTime += p.watchTime || 0;
          groupedProgress[courseId].totalDuration += p.totalDuration || 0;
        });
        
        // Calculate percentages
        Object.values(groupedProgress).forEach(group => {
          group.progressPercentage = group.totalLessons > 0 
            ? Math.round((group.completedLessons / group.totalLessons) * 100) 
            : 0;
        });
        
        progress = Object.values(groupedProgress);
      }
    }

    // Ensure progress is always an array
    if (!Array.isArray(progress)) {
      progress = [];
    }

    res.json({
      success: true,
      data: {
        progress
      }
    });

  } catch (error) {
    console.error('Get user progress error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      userId: req.user._id,
      courseId: req.query.courseId
    });
    
    // Return empty progress array instead of error to prevent frontend crashes
    res.json({
      success: true,
      data: {
        progress: []
      }
    });
  }
});

// @desc    Update lesson progress
// @route   POST /api/users/progress
// @access  Private
router.post('/progress', authenticate, [
  body('courseId').isMongoId().withMessage('Valid course ID is required'),
  body('lessonId').isMongoId().withMessage('Valid lesson ID is required'),
  body('watchTime').isNumeric().withMessage('Watch time must be a number'),
  body('totalDuration').isNumeric().withMessage('Total duration must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        arabic: 'فشل في التحقق من البيانات',
        details: errors.array()
      });
    }

    const { courseId, lessonId, watchTime, totalDuration, completed, quizScore, notes } = req.body;

    // Check if user is enrolled in the course
    const user = await User.findById(req.user._id);
    const isEnrolledInCourse = user.enrolledCourses.some(enrolledCourseId => 
      enrolledCourseId.toString() === courseId
    );
    if (!isEnrolledInCourse) {
      return res.status(403).json({
        error: 'You are not enrolled in this course',
        arabic: 'لست مسجلاً في هذه الدورة'
      });
    }

    // Update or create progress
    const progress = await Progress.findOneAndUpdate(
      { userId: req.user._id, courseId, lessonId },
      {
        userId: req.user._id,
        courseId,
        lessonId,
        watchTime,
        totalDuration,
        completed: completed || false,
        lastWatchedAt: new Date(),
        ...(quizScore && { quizScore }),
        ...(notes && { notes })
      },
      { upsert: true, new: true }
    );

    // If lesson is completed, check if course is completed
    if (completed) {
      const course = await Course.findById(courseId);
      const totalLessons = course.lessons.length;
      const completedLessons = await Progress.countDocuments({
        userId: req.user._id,
        courseId,
        completed: true
      });

      // If all lessons are completed, add certificate
      if (completedLessons >= totalLessons) {
        const certificate = {
          userId: req.user._id,
          courseId,
          courseTitle: course.title,
          issuedAt: new Date(),
          verificationCode: Math.random().toString(36).substr(2, 9).toUpperCase()
        };

        // Add certificate to user (you might want to create a Certificate model)
        user.certificates.push(certificate);
        await user.save();
      }
    }

    res.json({
      success: true,
      message: 'Progress updated successfully',
      arabic: 'تم تحديث التقدم بنجاح',
      progress
    });

  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({
      error: 'Internal server error',
      arabic: 'خطأ داخلي في الخادم'
    });
  }
});

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private
router.get('/stats', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    // Get learning statistics
    const progress = await Progress.getUserProgress(req.user._id);
    
    // Get order statistics
    const orderStats = await Order.aggregate([
      { $match: { userId: user._id, status: 'completed' } },
      {
        $group: {
          _id: null,
          totalSpent: { $sum: '$amount' },
          totalOrders: { $sum: 1 }
        }
      }
    ]);

    // Get completion statistics
    const completionStats = await Progress.aggregate([
      { $match: { userId: user._id, completed: true } },
      {
        $group: {
          _id: null,
          completedLessons: { $sum: 1 },
          totalWatchTime: { $sum: '$watchTime' }
        }
      }
    ]);

    const stats = {
      totalCourses: user.enrolledCourses.length,
      completedCourses: progress.filter(p => p.progressPercentage === 100).length,
      totalLessons: completionStats[0]?.completedLessons || 0,
      totalWatchTime: completionStats[0]?.totalWatchTime || 0,
      totalSpent: orderStats[0]?.totalSpent || 0,
      certificates: user.certificates.length,
      profileCompletion: user.profileCompletion
    };

    res.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      error: 'Internal server error',
      arabic: 'خطأ داخلي في الخادم'
    });
  }
});

// @desc    Change password
// @route   PUT /api/users/change-password
// @access  Private
router.put('/change-password', authenticate, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        arabic: 'فشل في التحقق من البيانات',
        details: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.user._id).select('+password');

    // Check current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        error: 'Current password is incorrect',
        arabic: 'كلمة المرور الحالية غير صحيحة'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully',
      arabic: 'تم تغيير كلمة المرور بنجاح'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      error: 'Internal server error',
      arabic: 'خطأ داخلي في الخادم'
    });
  }
});

// @desc    Delete account
// @route   DELETE /api/users/account
// @access  Private
router.delete('/account', authenticate, [
  body('password').notEmpty().withMessage('Password is required for account deletion')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        arabic: 'فشل في التحقق من البيانات',
        details: errors.array()
      });
    }

    const { password } = req.body;

    // Get user with password
    const user = await User.findById(req.user._id).select('+password');

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({
        error: 'Password is incorrect',
        arabic: 'كلمة المرور غير صحيحة'
      });
    }

    // Deactivate account instead of deleting (for data integrity)
    user.isActive = false;
    user.email = `deleted_${Date.now()}_${user.email}`;
    await user.save();

    res.json({
      success: true,
      message: 'Account deleted successfully',
      arabic: 'تم حذف الحساب بنجاح'
    });

  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      error: 'Internal server error',
      arabic: 'خطأ داخلي في الخادم'
    });
  }
});

// @desc    Check user enrollment in a specific course
// @route   GET /api/users/enrollment/:courseId
// @access  Private
router.get('/enrollment/:courseId', authenticate, async (req, res) => {
  try {
    const { courseId } = req.params;

    // Validate course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        error: 'Course not found',
        arabic: 'الدورة غير موجودة'
      });
    }

    // Check if user is enrolled
    const user = await User.findById(req.user._id);
    const isEnrolled = user.enrolledCourses.some(enrolledCourseId => 
      enrolledCourseId.toString() === courseId
    );

    res.json({
      success: true,
      isEnrolled,
      courseId,
      userId: req.user._id
    });

  } catch (error) {
    console.error('Check enrollment error:', error);
    res.status(500).json({
      error: 'Internal server error',
      arabic: 'خطأ داخلي في الخادم'
    });
  }
});

module.exports = router;
