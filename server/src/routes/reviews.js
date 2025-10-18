const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Review = require('../models/Review');
const Course = require('../models/Course');
const User = require('../models/User');
const { authenticate, optionalAuth, authenticateAdmin } = require('../middleware/auth');

const router = express.Router();

// @desc    Get course reviews
// @route   GET /api/reviews/course/:courseId
// @access  Public
router.get('/course/:courseId', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  query('sortBy').optional().isIn(['createdAt', 'rating', 'helpfulVotes']).withMessage('Invalid sort field'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc')
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

    const { courseId } = req.params;
    const {
      page = 1,
      limit = 10,
      rating,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        error: 'Course not found',
        arabic: 'الدورة غير موجودة'
      });
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      sortOrder,
      rating: rating ? parseInt(rating) : null,
      isVisible: true
    };

    const result = await Review.getCourseReviews(courseId, options);
    const ratingStats = await Review.getCourseRatingStats(courseId);

    res.json({
      success: true,
      reviews: result.reviews,
      pagination: {
        currentPage: result.page,
        totalPages: result.totalPages,
        totalItems: result.total,
        itemsPerPage: parseInt(limit),
        hasNextPage: result.hasNextPage,
        hasPrevPage: result.hasPrevPage
      },
      ratingStats
    });

  } catch (error) {
    console.error('Get course reviews error:', error);
    res.status(500).json({
      error: 'Internal server error',
      arabic: 'خطأ داخلي في الخادم'
    });
  }
});

// @desc    Add a review
// @route   POST /api/reviews
// @access  Private
router.post('/', authenticate, [
  body('courseId').isMongoId().withMessage('Valid course ID is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('title').isLength({ min: 5, max: 100 }).withMessage('Title must be between 5 and 100 characters'),
  body('comment').isLength({ min: 10, max: 1000 }).withMessage('Comment must be between 10 and 1000 characters')
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

    const { courseId, rating, title, comment } = req.body;

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        error: 'Course not found',
        arabic: 'الدورة غير موجودة'
      });
    }

    // Check if user already reviewed this course
    const existingReview = await Review.findOne({ userId: req.user._id, courseId });
    if (existingReview) {
      return res.status(400).json({
        error: 'You have already reviewed this course',
        arabic: 'لقد قمت بتقييم هذه الدورة من قبل'
      });
    }

    // Create new review
    const review = new Review({
      courseId,
      userId: req.user._id,
      rating,
      title,
      comment,
      isVerified: false // Will be true if user is enrolled
    });

    // Check if user is enrolled to mark as verified
    const user = await User.findById(req.user._id);
    if (user.enrolledCourses.includes(courseId)) {
      review.isVerified = true;
    }

    await review.save();

    // Populate user info
    await review.populate('userId', 'displayName avatar email');

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      arabic: 'تم إضافة التقييم بنجاح',
      review
    });

  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({
      error: 'Internal server error',
      arabic: 'خطأ داخلي في الخادم'
    });
  }
});

// @desc    Update a review
// @route   PUT /api/reviews/:reviewId
// @access  Private
router.put('/:reviewId', authenticate, [
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('title').optional().isLength({ min: 5, max: 100 }).withMessage('Title must be between 5 and 100 characters'),
  body('comment').optional().isLength({ min: 10, max: 1000 }).withMessage('Comment must be between 10 and 1000 characters')
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

    const { reviewId } = req.params;
    const updateData = req.body;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        error: 'Review not found',
        arabic: 'التقييم غير موجود'
      });
    }

    // Check if user owns the review
    if (review.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'You can only update your own reviews',
        arabic: 'يمكنك تحديث تقييماتك فقط'
      });
    }

    // Update review
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        review[key] = updateData[key];
      }
    });

    await review.save();
    await review.populate('userId', 'displayName avatar email');

    res.json({
      success: true,
      message: 'Review updated successfully',
      arabic: 'تم تحديث التقييم بنجاح',
      review
    });

  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({
      error: 'Internal server error',
      arabic: 'خطأ داخلي في الخادم'
    });
  }
});

// @desc    Delete a review
// @route   DELETE /api/reviews/:reviewId
// @access  Private
router.delete('/:reviewId', authenticate, async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        error: 'Review not found',
        arabic: 'التقييم غير موجود'
      });
    }

    // Check if user owns the review or is admin
    if (review.userId.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({
        error: 'You can only delete your own reviews',
        arabic: 'يمكنك حذف تقييماتك فقط'
      });
    }

    await Review.findByIdAndDelete(reviewId);

    res.json({
      success: true,
      message: 'Review deleted successfully',
      arabic: 'تم حذف التقييم بنجاح'
    });

  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      error: 'Internal server error',
      arabic: 'خطأ داخلي في الخادم'
    });
  }
});

// @desc    Vote on review helpfulness
// @route   POST /api/reviews/:reviewId/vote
// @access  Private
router.post('/:reviewId/vote', authenticate, [
  body('helpful').isBoolean().withMessage('Helpful must be a boolean value')
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

    const { reviewId } = req.params;
    const { helpful } = req.body;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        error: 'Review not found',
        arabic: 'التقييم غير موجود'
      });
    }

    // Check if user is trying to vote on their own review
    if (review.userId.toString() === req.user._id.toString()) {
      return res.status(400).json({
        error: 'You cannot vote on your own review',
        arabic: 'لا يمكنك التصويت على تقييمك الخاص'
      });
    }

    // For now, we'll just increment the vote counts
    // In a real app, you'd want to track individual votes to prevent multiple votes
    if (helpful) {
      review.helpfulVotes += 1;
    }
    review.totalVotes += 1;

    await review.save();

    res.json({
      success: true,
      message: 'Vote recorded successfully',
      arabic: 'تم تسجيل التصويت بنجاح',
      review: {
        helpfulVotes: review.helpfulVotes,
        totalVotes: review.totalVotes,
        helpfulPercentage: review.helpfulPercentage
      }
    });

  } catch (error) {
    console.error('Vote on review error:', error);
    res.status(500).json({
      error: 'Internal server error',
      arabic: 'خطأ داخلي في الخادم'
    });
  }
});

// @desc    Get all reviews (Admin only)
// @route   GET /api/reviews/admin
// @access  Private (Admin)
router.get('/admin', authenticateAdmin, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('courseId').optional().isMongoId().withMessage('Invalid course ID'),
  query('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  query('isVisible').optional().isBoolean().withMessage('isVisible must be boolean')
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

    const {
      page = 1,
      limit = 20,
      courseId,
      rating,
      isVisible
    } = req.query;

    const skip = (page - 1) * limit;
    const filter = {};

    if (courseId) filter.courseId = courseId;
    if (rating) filter.rating = parseInt(rating);
    if (isVisible !== undefined) filter.isVisible = isVisible === 'true';

    const reviews = await Review.find(filter)
      .populate('userId', 'displayName avatar email')
      .populate('courseId', 'title thumbnail')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Review.countDocuments(filter);

    res.json({
      success: true,
      reviews,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error('Get admin reviews error:', error);
    res.status(500).json({
      error: 'Internal server error',
      arabic: 'خطأ داخلي في الخادم'
    });
  }
});

// @desc    Toggle review visibility (Admin only)
// @route   PATCH /api/reviews/:reviewId/visibility
// @access  Private (Admin)
router.patch('/:reviewId/visibility', authenticateAdmin, async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        error: 'Review not found',
        arabic: 'التقييم غير موجود'
      });
    }

    review.isVisible = !review.isVisible;
    await review.save();

    res.json({
      success: true,
      message: `Review ${review.isVisible ? 'shown' : 'hidden'} successfully`,
      arabic: `تم ${review.isVisible ? 'إظهار' : 'إخفاء'} التقييم بنجاح`,
      review
    });

  } catch (error) {
    console.error('Toggle review visibility error:', error);
    res.status(500).json({
      error: 'Internal server error',
      arabic: 'خطأ داخلي في الخادم'
    });
  }
});

// @desc    Delete review (Admin only)
// @route   DELETE /api/reviews/admin/:reviewId
// @access  Private (Admin)
router.delete('/admin/:reviewId', authenticateAdmin, async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        error: 'Review not found',
        arabic: 'التقييم غير موجود'
      });
    }

    await Review.findByIdAndDelete(reviewId);

    res.json({
      success: true,
      message: 'Review deleted successfully',
      arabic: 'تم حذف التقييم بنجاح'
    });

  } catch (error) {
    console.error('Admin delete review error:', error);
    res.status(500).json({
      error: 'Internal server error',
      arabic: 'خطأ داخلي في الخادم'
    });
  }
});

module.exports = router;
