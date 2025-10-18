const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Course = require('../models/Course');
const User = require('../models/User');
const Order = require('../models/Order');
const Progress = require('../models/Progress');
const { authenticate, optionalAuth, authenticateAdmin, requirePermission } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('category').optional().isString().withMessage('Category must be a string'),
  query('level').optional().isIn(['beginner', 'intermediate', 'advanced']).withMessage('Invalid level'),
  query('language').optional().isIn(['ar', 'en']).withMessage('Invalid language'),
  query('featured').optional().isBoolean().withMessage('Featured must be boolean'),
  query('search').optional().isString().withMessage('Search must be a string')
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

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = { isPublished: true };

    if (req.query.category) {
      filter.category = new RegExp(req.query.category, 'i');
    }

    if (req.query.level) {
      filter.level = req.query.level;
    }

    if (req.query.language) {
      filter.language = req.query.language;
    }

    if (req.query.featured === 'true') {
      filter.isFeatured = true;
    }

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filter.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { tags: { $in: [searchRegex] } }
      ];
    }

    // Get courses with pagination
    const courses = await Course.find(filter)
      .populate('instructor.id', 'displayName avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Course.countDocuments(filter);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.json({
      success: true,
      courses,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage,
        hasPrevPage
      }
    });

  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({
      error: 'Internal server error',
      arabic: 'خطأ داخلي في الخادم'
    });
  }
});

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor.id', 'displayName avatar bio credentials');

    if (!course) {
      return res.status(404).json({
        error: 'Course not found',
        arabic: 'الدورة غير موجودة'
      });
    }

    // Check if user is enrolled (if authenticated)
    let isEnrolled = false;
    if (req.user) {
      const user = await User.findById(req.user._id);
      isEnrolled = user.enrolledCourses.some(enrolledCourseId => 
        enrolledCourseId.toString() === course._id.toString()
      );
    }

    // Increment view count
    course.views += 1;
    await course.save();

    res.json({
      success: true,
      course: {
        ...course.toObject(),
        isEnrolled
      }
    });

  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({
      error: 'Internal server error',
      arabic: 'خطأ داخلي في الخادم'
    });
  }
});

// @desc    Get featured courses
// @route   GET /api/courses/featured
// @access  Public
router.get('/featured/list', async (req, res) => {
  try {
    const courses = await Course.getFeatured()
      .populate('instructor.id', 'displayName avatar')
      .limit(6);

    res.json({
      success: true,
      courses
    });

  } catch (error) {
    console.error('Get featured courses error:', error);
    res.status(500).json({
      error: 'Internal server error',
      arabic: 'خطأ داخلي في الخادم'
    });
  }
});

// @desc    Search courses
// @route   GET /api/courses/search
// @access  Public
router.get('/search/query', [
  query('q').notEmpty().withMessage('Search query is required'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
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

    const query = req.query.q;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const courses = await Course.search(query)
      .populate('instructor.id', 'displayName avatar')
      .skip(skip)
      .limit(limit);

    const total = await Course.countDocuments({
      isPublished: true,
      $or: [
        { title: new RegExp(query, 'i') },
        { description: new RegExp(query, 'i') },
        { tags: { $in: [new RegExp(query, 'i')] } }
      ]
    });

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      courses,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit
      },
      searchQuery: query
    });

  } catch (error) {
    console.error('Search courses error:', error);
    res.status(500).json({
      error: 'Internal server error',
      arabic: 'خطأ داخلي في الخادم'
    });
  }
});

// @desc    Create course
// @route   POST /api/courses
// @access  Private (Admin/Instructor)
router.post('/', authenticateAdmin, [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('level').isIn(['beginner', 'intermediate', 'advanced']).withMessage('Invalid level'),
  body('category').notEmpty().withMessage('Category is required'),
  body('lessons').isArray().withMessage('Lessons must be an array')
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

    const courseData = {
      ...req.body,
      instructor: {
        id: req.user._id,
        name: req.user.displayName,
        avatar: req.user.avatar,
        bio: req.user.bio
      }
    };

    const course = await Course.create(courseData);

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      arabic: 'تم إنشاء الدورة بنجاح',
      course
    });

  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({
      error: 'Internal server error',
      arabic: 'خطأ داخلي في الخادم'
    });
  }
});

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private (Admin/Owner)
router.put('/:id', authenticate, [
  body('title').optional().notEmpty().withMessage('Title cannot be empty'),
  body('description').optional().notEmpty().withMessage('Description cannot be empty'),
  body('price').optional().isNumeric().withMessage('Price must be a number')
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

    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        error: 'Course not found',
        arabic: 'الدورة غير موجودة'
      });
    }

    // Check if user is owner or admin
    if (course.instructor.id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({
        error: 'Access denied. You can only update your own courses.',
        arabic: 'تم رفض الوصول. يمكنك تحديث دوراتك فقط.'
      });
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Course updated successfully',
      arabic: 'تم تحديث الدورة بنجاح',
      course: updatedCourse
    });

  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({
      error: 'Internal server error',
      arabic: 'خطأ داخلي في الخادم'
    });
  }
});

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private (Admin/Owner)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        error: 'Course not found',
        arabic: 'الدورة غير موجودة'
      });
    }

    // Check if user is owner or admin
    if (course.instructor.id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({
        error: 'Access denied. You can only delete your own courses.',
        arabic: 'تم رفض الوصول. يمكنك حذف دوراتك فقط.'
      });
    }

    await Course.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Course deleted successfully',
      arabic: 'تم حذف الدورة بنجاح'
    });

  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({
      error: 'Internal server error',
      arabic: 'خطأ داخلي في الخادم'
    });
  }
});

// @desc    Publish/Unpublish course
// @route   PATCH /api/courses/:id/publish
// @access  Private (Admin/Owner)
router.patch('/:id/publish', authenticate, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        error: 'Course not found',
        arabic: 'الدورة غير موجودة'
      });
    }

    // Check if user is owner or admin
    if (course.instructor.id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({
        error: 'Access denied. You can only publish your own courses.',
        arabic: 'تم رفض الوصول. يمكنك نشر دوراتك فقط.'
      });
    }

    const { isPublished } = req.body;

    course.isPublished = isPublished;
    await course.save();

    res.json({
      success: true,
      message: isPublished ? 'Course published successfully' : 'Course unpublished successfully',
      arabic: isPublished ? 'تم نشر الدورة بنجاح' : 'تم إلغاء نشر الدورة بنجاح',
      course
    });

  } catch (error) {
    console.error('Publish course error:', error);
    res.status(500).json({
      error: 'Internal server error',
      arabic: 'خطأ داخلي في الخادم'
    });
  }
});

// @desc    Get course statistics
// @route   GET /api/courses/:id/stats
// @access  Private (Admin/Owner)
router.get('/:id/stats', authenticate, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        error: 'Course not found',
        arabic: 'الدورة غير موجودة'
      });
    }

    // Check if user is owner or admin
    if (course.instructor.id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({
        error: 'Access denied. You can only view your own course stats.',
        arabic: 'تم رفض الوصول. يمكنك عرض إحصائيات دوراتك فقط.'
      });
    }

    const stats = await Progress.getCourseStats(course._id);
    const orderStats = await Order.aggregate([
      { $match: { courseId: course._id, status: 'completed' } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' },
          totalOrders: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      stats: {
        ...stats[0],
        revenue: orderStats[0]?.totalRevenue || 0,
        totalOrders: orderStats[0]?.totalOrders || 0,
        views: course.views,
        enrollmentCount: course.enrollmentCount
      }
    });

  } catch (error) {
    console.error('Get course stats error:', error);
    res.status(500).json({
      error: 'Internal server error',
      arabic: 'خطأ داخلي في الخادم'
    });
  }
});

// @desc    Get course categories
// @route   GET /api/courses/categories
// @access  Public
router.get('/categories/list', async (req, res) => {
  try {
    const categories = await Course.distinct('category', { isPublished: true });
    
    res.json({
      success: true,
      categories
    });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      error: 'Internal server error',
      arabic: 'خطأ داخلي في الخادم'
    });
  }
});

module.exports = router;
