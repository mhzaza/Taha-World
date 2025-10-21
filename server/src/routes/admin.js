const express = require('express');
const { body, validationResult, query } = require('express-validator');
const User = require('../models/User');
const Course = require('../models/Course');
const Order = require('../models/Order');
const AuditLog = require('../models/AuditLog');
const Progress = require('../models/Progress');
const { authenticateAdmin, requirePermission } = require('../middleware/auth');

const router = express.Router();

// Apply admin authentication to all routes
router.use(authenticateAdmin);

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
router.get('/dashboard', async (req, res) => {
  try {
    // Get user statistics
    const userStats = await User.getUserStats();
    
    // Get course statistics
    const courseStats = await Course.getCourseStats();
    
    // Get order statistics
    const orderStats = await Order.getRevenueStats();
    
    // Get audit log statistics
    const auditStats = await AuditLog.getAuditStats();
    
    // Get recent activities
    const recentUsers = await User.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('displayName email createdAt');

    const recentOrders = await Order.find({ status: 'completed' })
      .populate('userId', 'displayName')
      .populate('courseId', 'title')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get monthly revenue for chart
    const currentYear = new Date().getFullYear();
    const monthlyRevenue = await Order.getMonthlyRevenue(currentYear);

    res.json({
      success: true,
      data: {
        dashboard: {
          users: userStats,
          courses: courseStats,
          orders: orderStats,
          audit: auditStats,
          recentUsers,
          recentOrders,
          monthlyRevenue
        }
      }
    });

  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({
      error: 'Internal server error',
      arabic: 'خطأ داخلي في الخادم'
    });
  }
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
router.get('/users', requirePermission('users.manage'), [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('search').optional().isString().withMessage('Search must be a string'),
  query('status').optional().isIn(['active', 'inactive']).withMessage('Invalid status'),
  query('emailVerified').optional().isBoolean().withMessage('Email verified must be boolean')
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
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};
    
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filter.$or = [
        { email: searchRegex },
        { displayName: searchRegex }
      ];
    }

    if (req.query.status) {
      filter.isActive = req.query.status === 'active';
    }

    if (req.query.emailVerified !== undefined) {
      filter.emailVerified = req.query.emailVerified === 'true';
    }

    // Get users with pagination
    const users = await User.find(filter)
      .populate('enrolledCourses', 'title')
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

    // Calculate statistics
    const stats = await User.getUserStats();

    // Log admin action
    await AuditLog.create({
      adminEmail: req.user.email,
      adminId: req.user._id,
      action: 'users.list',
      target: 'admin_users',
      details: {
        filters: req.query,
        resultCount: users.length
      },
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit
        }
      },
      stats
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      error: 'Internal server error',
      arabic: 'خطأ داخلي في الخادم'
    });
  }
});

// @desc    Get single user
// @route   GET /api/admin/users/:id
// @access  Private (Admin)
router.get('/users/:id', requirePermission('users.manage'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('enrolledCourses', 'title thumbnail price level')
      .populate('certificates', 'courseTitle issuedAt')
      .select('-password');

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        arabic: 'المستخدم غير موجود'
      });
    }

    // Get user's order history
    const orders = await Order.find({ userId: user._id })
      .populate('courseId', 'title thumbnail')
      .sort({ createdAt: -1 })
      .limit(10);

    // Get user's learning progress
    const progress = await Progress.getUserProgress(user._id);

    res.json({
      success: true,
      user: {
        ...user.toObject(),
        recentOrders: orders,
        learningProgress: progress
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      error: 'Internal server error',
      arabic: 'خطأ داخلي في الخادم'
    });
  }
});

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private (Admin)
router.put('/users/:id', requirePermission('users.manage'), [
  body('isActive').optional().isBoolean().withMessage('isActive must be boolean'),
  body('isAdmin').optional().isBoolean().withMessage('isAdmin must be boolean'),
  body('adminRole').optional().isIn(['super_admin', 'admin', 'moderator']).withMessage('Invalid admin role'),
  body('totalSpent').optional().isNumeric().withMessage('Total spent must be a number'),
  body('notes').optional().isString().withMessage('Notes must be a string')
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

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        arabic: 'المستخدم غير موجود'
      });
    }

    const allowedUpdates = ['isActive', 'isAdmin', 'adminRole', 'adminPermissions', 'totalSpent', 'notes'];
    const updates = {};

    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    // Log admin action
    await AuditLog.create({
      adminEmail: req.user.email,
      adminId: req.user._id,
      action: 'user.update',
      target: 'user',
      targetId: req.params.id,
      details: {
        updates,
        userEmail: user.email,
        userName: user.displayName
      },
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'User updated successfully',
      arabic: 'تم تحديث المستخدم بنجاح',
      user: updatedUser
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      error: 'Internal server error',
      arabic: 'خطأ داخلي في الخادم'
    });
  }
});

// @desc    Get all courses (admin view)
// @route   GET /api/admin/courses
// @access  Private (Admin)
router.get('/courses', requirePermission('courses.edit'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const courses = await Course.find({})
      .populate('instructor.id', 'displayName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Course.countDocuments({});

    res.json({
      success: true,
      data: courses,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      }
    });

  } catch (error) {
    console.error('Get admin courses error:', error);
    res.status(500).json({
      error: 'Internal server error',
      arabic: 'خطأ داخلي في الخادم'
    });
  }
});

// @desc    Get single course by ID (admin view)
// @route   GET /api/admin/courses/:id
// @access  Private (Admin)
router.get('/courses/:id', requirePermission('courses.edit'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({
        error: 'Course not found',
        arabic: 'الكورس غير موجود'
      });
    }

    res.json({
      success: true,
      data: course
    });

  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({
      error: 'Internal server error',
      arabic: 'خطأ داخلي في الخادم'
    });
  }
});

// @desc    Create new course
// @route   POST /api/admin/courses
// @access  Private (Admin)
router.post('/courses', requirePermission('courses.edit'), [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('currency').isIn(['USD', 'SAR', 'EUR']).withMessage('Invalid currency'),
  body('duration').isNumeric().withMessage('Duration must be a number'),
  body('level').isIn(['beginner', 'intermediate', 'advanced']).withMessage('Invalid level'),
  body('category').notEmpty().withMessage('Category is required'),
  body('language').isIn(['ar', 'en']).withMessage('Invalid language'),
  body('instructor.name').notEmpty().withMessage('Instructor name is required')
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
        id: req.user._id, // Admin creating the course
        name: req.body.instructor.name,
        bio: req.body.instructor.bio || '',
        credentials: req.body.instructor.credentials || []
      },
      isPublished: req.body.isPublished || false,
      isFeatured: req.body.isFeatured || false,
      enrollmentCount: 0,
      rating: { average: 0, count: 0 },
      views: 0,
      completionRate: 0
    };

    const course = new Course(courseData);
    await course.save();

    // Log admin action
    await AuditLog.create({
      adminEmail: req.user.email,
      adminId: req.user._id,
      action: 'course.create',
      target: 'course',
      targetId: course._id,
      details: {
        courseTitle: course.title,
        courseId: course._id,
        price: course.price,
        level: course.level,
        category: course.category
      },
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      arabic: 'تم إنشاء الكورس بنجاح',
      data: course
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
// @route   PUT /api/admin/courses/:id
// @access  Private (Admin)
router.put('/courses/:id', requirePermission('courses.edit'), [
  body('title').optional().notEmpty().withMessage('Title cannot be empty'),
  body('price').optional().isNumeric().withMessage('Price must be a number'),
  body('currency').optional().isIn(['USD', 'SAR', 'EUR']).withMessage('Invalid currency'),
  body('duration').optional().isNumeric().withMessage('Duration must be a number'),
  body('level').optional().isIn(['beginner', 'intermediate', 'advanced']).withMessage('Invalid level'),
  body('language').optional().isIn(['ar', 'en']).withMessage('Invalid language')
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
        arabic: 'الكورس غير موجود'
      });
    }

    const allowedUpdates = [
      'title', 'titleEn', 'description', 'descriptionEn', 'price', 'originalPrice',
      'currency', 'duration', 'level', 'category', 'tags', 'requirements',
      'whatYouWillLearn', 'language', 'subtitles', 'isPublished', 'isFeatured',
      'thumbnail', 'instructor'
    ];

    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('instructor.id', 'displayName email');

    // Log admin action
    await AuditLog.create({
      adminEmail: req.user.email,
      adminId: req.user._id,
      action: 'course.update',
      target: 'course',
      targetId: req.params.id,
      details: {
        courseTitle: updatedCourse.title,
        courseId: updatedCourse._id,
        updates: Object.keys(updates)
      },
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Course updated successfully',
      arabic: 'تم تحديث الكورس بنجاح',
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
// @route   DELETE /api/admin/courses/:id
// @access  Private (Admin)
router.delete('/courses/:id', requirePermission('courses.edit'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        error: 'Course not found',
        arabic: 'الكورس غير موجود'
      });
    }

    // Check if course has enrollments
    const enrollmentCount = await User.countDocuments({
      enrolledCourses: req.params.id
    });

    if (enrollmentCount > 0) {
      return res.status(400).json({
        error: 'Cannot delete course with active enrollments',
        arabic: 'لا يمكن حذف كورس له طلاب مسجلين'
      });
    }

    // Delete thumbnail from Cloudinary if exists
    if (course.thumbnail) {
      const { extractPublicId, deleteFromCloudinary } = require('../config/cloudinary');
      const publicId = extractPublicId(course.thumbnail);
      if (publicId) {
        try {
          await deleteFromCloudinary(publicId, 'image');
        } catch (error) {
          console.error('Error deleting thumbnail from Cloudinary:', error);
        }
      }
    }

    await Course.findByIdAndDelete(req.params.id);

    // Log admin action
    await AuditLog.create({
      adminEmail: req.user.email,
      adminId: req.user._id,
      action: 'course.delete',
      target: 'course',
      targetId: req.params.id,
      details: {
        courseTitle: course.title,
        courseId: course._id,
        price: course.price,
        level: course.level
      },
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Course deleted successfully',
      arabic: 'تم حذف الكورس بنجاح'
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
// @route   PATCH /api/admin/courses/:id/publish
// @access  Private (Admin)
router.patch('/courses/:id/publish', requirePermission('courses.edit'), [
  body('isPublished').isBoolean().withMessage('isPublished must be boolean')
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
        arabic: 'الكورس غير موجود'
      });
    }

    course.isPublished = req.body.isPublished;
    await course.save();

    // Log admin action
    await AuditLog.create({
      adminEmail: req.user.email,
      adminId: req.user._id,
      action: course.isPublished ? 'course.publish' : 'course.unpublish',
      target: 'course',
      targetId: req.params.id,
      details: {
        courseTitle: course.title,
        courseId: course._id,
        isPublished: course.isPublished
      },
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: course.isPublished ? 'Course published successfully' : 'Course unpublished successfully',
      arabic: course.isPublished ? 'تم نشر الكورس بنجاح' : 'تم إلغاء نشر الكورس بنجاح',
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

// @desc    Get all orders
// @route   GET /api/admin/orders
// @access  Private (Admin)
router.get('/orders', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};
    
    if (req.query.status && req.query.status !== 'all') {
      filter.status = req.query.status;
    }

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filter.$or = [
        { userEmail: searchRegex },
        { userName: searchRegex },
        { courseTitle: searchRegex }
      ];
    }

    if (req.query.dateFrom && req.query.dateTo) {
      filter.createdAt = {
        $gte: new Date(req.query.dateFrom),
        $lte: new Date(req.query.dateTo)
      };
    }

    console.log('Admin orders query filter:', filter);
    
    const orders = await Order.find(filter)
      .populate('userId', 'displayName email')
      .populate('courseId', 'title thumbnail')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments(filter);
    
    console.log('Found orders:', orders.length, 'Total:', total);

    // Transform the orders to ensure proper data structure
    const transformedOrders = orders.map(order => {
      const orderObj = order.toObject();
      
      // Preserve populated user data but also provide userId as string
      if (orderObj.userId && typeof orderObj.userId === 'object') {
        orderObj.userInfo = {
          _id: orderObj.userId._id || orderObj.userId.id,
          displayName: orderObj.userId.displayName,
          email: orderObj.userId.email
        };
        orderObj.userId = orderObj.userId._id || orderObj.userId.id;
      }
      
      // Preserve populated course data but also provide courseId as string
      if (orderObj.courseId && typeof orderObj.courseId === 'object') {
        orderObj.courseInfo = {
          _id: orderObj.courseId._id || orderObj.courseId.id,
          title: orderObj.courseId.title,
          thumbnail: orderObj.courseId.thumbnail
        };
        orderObj.courseId = orderObj.courseId._id || orderObj.courseId.id;
      }
      
      return orderObj;
    });

    // Get order statistics - handle case where stats might fail
    let stats;
    try {
      stats = await Order.getRevenueStats();
    } catch (statsError) {
      console.error('Error getting order stats:', statsError);
      stats = {
        totalRevenue: 0,
        totalOrders: total,
        completedOrders: 0,
        pendingOrders: 0,
        failedOrders: 0
      };
    }

    res.json({
      success: true,
      data: {
        orders: transformedOrders,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit
        },
        stats
      }
    });

  } catch (error) {
    console.error('Get admin orders error:', error);
    res.status(500).json({
      error: 'Internal server error',
      arabic: 'خطأ داخلي في الخادم'
    });
  }
});

// @desc    Update order status
// @route   PUT /api/admin/orders/:id
// @access  Private (Admin)
router.put('/orders/:id', requirePermission('orders.view'), [
  body('status').isIn(['pending', 'completed', 'failed', 'refunded', 'cancelled']).withMessage('Invalid status'),
  body('notes').optional().isString().withMessage('Notes must be a string')
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

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        error: 'Order not found',
        arabic: 'الطلب غير موجود'
      });
    }

    const { status, notes } = req.body;
    const oldStatus = order.status;

    order.status = status;
    if (notes) order.notes = notes;

    // Set appropriate timestamps based on status
    const now = new Date();
    switch (status) {
      case 'completed':
        order.completedAt = now;
        break;
      case 'refunded':
        order.refundedAt = now;
        order.refundReason = notes || 'Admin refund';
        break;
      case 'cancelled':
        order.cancelledAt = now;
        order.cancellationReason = notes || 'Admin cancellation';
        break;
    }

    await order.save();

    // Log admin action
    await AuditLog.create({
      adminEmail: req.user.email,
      adminId: req.user._id,
      action: 'order.update',
      target: 'order',
      targetId: req.params.id,
      details: {
        oldStatus,
        newStatus: status,
        orderId: order.id,
        userEmail: order.userEmail,
        courseTitle: order.courseTitle,
        amount: order.amount
      },
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Order updated successfully',
      arabic: 'تم تحديث الطلب بنجاح',
      order
    });

  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({
      error: 'Internal server error',
      arabic: 'خطأ داخلي في الخادم'
    });
  }
});

// @desc    Get audit logs
// @route   GET /api/admin/audit-logs
// @access  Private (Admin)
router.get('/audit-logs', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};

    if (req.query.action) {
      filter.action = req.query.action;
    }

    if (req.query.adminEmail) {
      filter.adminEmail = new RegExp(req.query.adminEmail, 'i');
    }

    if (req.query.severity) {
      filter.severity = req.query.severity;
    }

    if (req.query.dateFrom && req.query.dateTo) {
      filter.createdAt = {
        $gte: new Date(req.query.dateFrom),
        $lte: new Date(req.query.dateTo)
      };
    }

    const logs = await AuditLog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await AuditLog.countDocuments(filter);

    res.json({
      success: true,
      logs,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      }
    });

  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({
      error: 'Internal server error',
      arabic: 'خطأ داخلي في الخادم'
    });
  }
});

// @desc    Get analytics data
// @route   GET /api/admin/analytics
// @access  Private (Admin)
router.get('/analytics', requirePermission('analytics.view'), async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    // Calculate date range based on period
    const now = new Date();
    let startDate;
    
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get comprehensive analytics data
    const [
      userGrowth,
      revenueData,
      coursePopularity,
      adminActivity,
      weeklySalesData,
      monthlyGrowthData,
      courseCompletionData,
      deviceData,
      quickStats
    ] = await Promise.all([
      // User growth over time - daily aggregation
      User.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
      ]),

      // Revenue data
      Order.getRevenueStats(startDate, now),

      // Popular courses with revenue
      Order.aggregate([
        {
          $match: {
            status: 'completed',
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: '$courseId',
            revenue: { $sum: '$amount' },
            orders: { $sum: 1 }
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
        {
          $unwind: '$course'
        },
        {
          $project: {
            title: '$course.title',
            revenue: 1,
            orders: 1,
            enrollmentCount: '$course.enrollmentCount'
          }
        },
        { $sort: { revenue: -1 } },
        { $limit: 10 }
      ]),

      // Admin activity
      AuditLog.find({
        createdAt: { $gte: startDate }
      })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('action details createdAt'),

      // Weekly sales data
      Order.aggregate([
        {
          $match: {
            status: 'completed',
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: {
              week: { $week: '$createdAt' },
              year: { $year: '$createdAt' }
            },
            sales: { $sum: '$amount' },
            orders: { $sum: 1 },
            students: { $addToSet: '$userId' }
          }
        },
        {
          $project: {
            week: '$_id.week',
            sales: 1,
            orders: 1,
            students: { $size: '$students' }
          }
        },
        { $sort: { week: 1 } }
      ]),

      // Monthly growth data
      Order.aggregate([
        {
          $match: {
            status: 'completed',
            createdAt: { $gte: new Date(now.getTime() - 6 * 30 * 24 * 60 * 60 * 1000) }
          }
        },
        {
          $group: {
            _id: {
              month: { $month: '$createdAt' },
              year: { $year: '$createdAt' }
            },
            revenue: { $sum: '$amount' },
            orders: { $sum: 1 }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: 'createdAt',
            as: 'users'
          }
        },
        {
          $project: {
            month: '$_id.month',
            revenue: 1,
            orders: 1,
            students: { $size: '$users' }
          }
        },
        { $sort: { month: 1 } }
      ]),

      // Course completion rates
      Progress.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        },
        {
          $project: {
            status: '$_id',
            count: 1,
            percentage: { $multiply: [{ $divide: ['$count', { $sum: '$count' }] }, 100] }
          }
        }
      ]),

      // Device usage data (mock for now - can be enhanced with real tracking)
      Promise.resolve([
        { name: 'الهاتف المحمول', value: 52, color: '#3B82F6' },
        { name: 'سطح المكتب', value: 35, color: '#10B981' },
        { name: 'الجهاز اللوحي', value: 13, color: '#F59E0B' }
      ]),

      // Quick stats
      Promise.all([
        // Conversion rate
        Order.countDocuments({ status: 'completed' }).then(completed => 
          User.countDocuments().then(total => ({ conversionRate: total > 0 ? (completed / total * 100).toFixed(1) : 0 }))
        ),
        // Average session time (mock)
        Promise.resolve({ avgSessionTime: '24 دقيقة' }),
        // Bounce rate (mock)
        Promise.resolve({ bounceRate: '42%' }),
        // New vs returning visitors (mock)
        Promise.resolve({ newVisitors: '68%', returningVisitors: '32%' }),
        // Average order value
        Order.aggregate([
          { $match: { status: 'completed' } },
          { $group: { _id: null, avgOrderValue: { $avg: '$amount' } } }
        ]).then(result => ({ avgOrderValue: result[0]?.avgOrderValue || 0 }))
      ])
    ]);

    // Process the data for frontend consumption
    const processedAnalytics = {
        period,
        userGrowth,
        revenue: revenueData,
        popularCourses: coursePopularity,
      adminActivity,
      weeklySalesData: weeklySalesData.map((item, index) => ({
        week: `الأسبوع ${index + 1}`,
        sales: item.sales || 0,
        orders: item.orders || 0,
        students: item.students || 0
      })),
      monthlyGrowthData: monthlyGrowthData.map((item, index) => ({
        month: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'][index] || `الشهر ${item.month}`,
        revenue: item.revenue || 0,
        students: item.students || 0,
        courses: Math.floor(Math.random() * 5) + 3 // Mock course count
      })),
      courseCompletionData: courseCompletionData.length > 0 ? courseCompletionData.map(item => ({
        name: item.status === 'completed' ? 'مكتمل' : 
              item.status === 'in_progress' ? 'قيد التقدم' : 'لم يبدأ',
        value: Math.round(item.percentage || 0),
        color: item.status === 'completed' ? '#10B981' : 
               item.status === 'in_progress' ? '#F59E0B' : '#EF4444'
      })) : [
        { name: 'مكتمل', value: 68, color: '#10B981' },
        { name: 'قيد التقدم', value: 24, color: '#F59E0B' },
        { name: 'لم يبدأ', value: 8, color: '#EF4444' }
      ],
      deviceData,
      quickStats: {
        conversionRate: quickStats[0]?.conversionRate || '3.2',
        avgSessionTime: quickStats[1]?.avgSessionTime || '24 دقيقة',
        bounceRate: quickStats[2]?.bounceRate || '42%',
        newVisitors: quickStats[3]?.newVisitors || '68%',
        returningVisitors: quickStats[3]?.returningVisitors || '32%',
        avgOrderValue: quickStats[4]?.avgOrderValue || 224
      }
    };

    res.json({
      success: true,
      analytics: processedAnalytics
    });

  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      error: 'Internal server error',
      arabic: 'خطأ داخلي في الخادم'
    });
  }
});

// ==================== LESSON MANAGEMENT ROUTES ====================

// @desc    Get lessons for a specific course
// @route   GET /api/admin/courses/:courseId/lessons
// @access  Private (Admin)
router.get('/courses/:courseId/lessons', requirePermission('courses.edit'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    
    if (!course) {
      return res.status(404).json({
        error: 'Course not found',
        arabic: 'الكورس غير موجود'
      });
    }

    res.json({
      success: true,
      lessons: course.lessons || []
    });

  } catch (error) {
    console.error('Get course lessons error:', error);
    res.status(500).json({
      error: 'Internal server error',
      arabic: 'خطأ داخلي في الخادم'
    });
  }
});

// @desc    Add a new lesson to a course
// @route   POST /api/admin/courses/:courseId/lessons
// @access  Private (Admin)
router.post('/courses/:courseId/lessons', requirePermission('courses.edit'), [
  body('title').notEmpty().withMessage('Lesson title is required'),
  body('description').optional().isString().withMessage('Description must be a string'),
  body('videoUrl').notEmpty().withMessage('Video URL is required'),
  body('duration').isInt({ min: 1 }).withMessage('Duration must be a positive integer'),
  body('order').isInt({ min: 1 }).withMessage('Order must be a positive integer'),
  body('isFree').optional().isBoolean().withMessage('isFree must be boolean'),
  body('resources').optional().isArray().withMessage('Resources must be an array'),
  body('quiz').optional().isObject().withMessage('Quiz must be an object')
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

    const course = await Course.findById(req.params.courseId);
    
    if (!course) {
      return res.status(404).json({
        error: 'Course not found',
        arabic: 'الكورس غير موجود'
      });
    }

    // Check if order already exists
    const existingLesson = course.lessons.find(lesson => lesson.order === req.body.order);
    if (existingLesson) {
      return res.status(400).json({
        error: 'A lesson with this order already exists',
        arabic: 'يوجد درس بنفس الترتيب بالفعل'
      });
    }

    // Create new lesson
    const newLesson = {
      title: req.body.title,
      description: req.body.description || '',
      videoUrl: req.body.videoUrl,
      duration: req.body.duration,
      order: req.body.order,
      isFree: req.body.isFree || false,
      resources: req.body.resources || [],
      quiz: req.body.quiz || { questions: [], passingScore: 70 }
    };

    course.lessons.push(newLesson);
    
    // Recalculate course duration
    const totalDuration = course.lessons.reduce((sum, lesson) => sum + lesson.duration, 0);
    course.duration = totalDuration;

    await course.save();

    // Log admin action
    await AuditLog.create({
      adminEmail: req.user.email,
      adminId: req.user._id,
      action: 'lesson.create',
      target: 'lesson',
      targetId: course.lessons[course.lessons.length - 1]._id,
      details: {
        courseId: course._id,
        courseTitle: course.title,
        lessonTitle: newLesson.title,
        lessonOrder: newLesson.order
      },
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Lesson added successfully',
      arabic: 'تم إضافة الدرس بنجاح',
      lesson: course.lessons[course.lessons.length - 1]
    });

  } catch (error) {
    console.error('Add lesson error:', error);
    res.status(500).json({
      error: 'Internal server error',
      arabic: 'خطأ داخلي في الخادم'
    });
  }
});

// @desc    Update a lesson
// @route   PUT /api/admin/courses/:courseId/lessons/:lessonId
// @access  Private (Admin)
router.put('/courses/:courseId/lessons/:lessonId', requirePermission('courses.edit'), [
  body('title').optional().notEmpty().withMessage('Title cannot be empty'),
  body('description').optional().isString().withMessage('Description must be a string'),
  body('videoUrl').optional().notEmpty().withMessage('Video URL cannot be empty'),
  body('duration').optional().isInt({ min: 1 }).withMessage('Duration must be a positive integer'),
  body('order').optional().isInt({ min: 1 }).withMessage('Order must be a positive integer'),
  body('isFree').optional().isBoolean().withMessage('isFree must be boolean'),
  body('resources').optional().isArray().withMessage('Resources must be an array'),
  body('quiz').optional().isObject().withMessage('Quiz must be an object')
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

    const course = await Course.findById(req.params.courseId);
    
    if (!course) {
      return res.status(404).json({
        error: 'Course not found',
        arabic: 'الكورس غير موجود'
      });
    }

    const lesson = course.lessons.id(req.params.lessonId);
    
    if (!lesson) {
      return res.status(404).json({
        error: 'Lesson not found',
        arabic: 'الدرس غير موجود'
      });
    }

    // Check if new order conflicts with existing lessons
    if (req.body.order && req.body.order !== lesson.order) {
      const existingLesson = course.lessons.find(l => l.order === req.body.order && l._id.toString() !== req.params.lessonId);
      if (existingLesson) {
        return res.status(400).json({
          error: 'A lesson with this order already exists',
          arabic: 'يوجد درس بنفس الترتيب بالفعل'
        });
      }
    }

    // Update lesson fields
    const allowedUpdates = ['title', 'description', 'videoUrl', 'duration', 'order', 'isFree', 'resources', 'quiz'];
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        lesson[field] = req.body[field];
      }
    });

    // Recalculate course duration if lesson duration changed
    if (req.body.duration) {
      const totalDuration = course.lessons.reduce((sum, lesson) => sum + lesson.duration, 0);
      course.duration = totalDuration;
    }

    await course.save();

    // Log admin action
    await AuditLog.create({
      adminEmail: req.user.email,
      adminId: req.user._id,
      action: 'lesson.update',
      target: 'lesson',
      targetId: req.params.lessonId,
      details: {
        courseId: course._id,
        courseTitle: course.title,
        lessonTitle: lesson.title,
        updates: req.body
      },
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Lesson updated successfully',
      arabic: 'تم تحديث الدرس بنجاح',
      lesson: lesson
    });

  } catch (error) {
    console.error('Update lesson error:', error);
    res.status(500).json({
      error: 'Internal server error',
      arabic: 'خطأ داخلي في الخادم'
    });
  }
});

// @desc    Delete a lesson
// @route   DELETE /api/admin/courses/:courseId/lessons/:lessonId
// @access  Private (Admin)
router.delete('/courses/:courseId/lessons/:lessonId', requirePermission('courses.edit'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    
    if (!course) {
      return res.status(404).json({
        error: 'Course not found',
        arabic: 'الكورس غير موجود'
      });
    }

    const lesson = course.lessons.id(req.params.lessonId);
    
    if (!lesson) {
      return res.status(404).json({
        error: 'Lesson not found',
        arabic: 'الدرس غير موجود'
      });
    }

    const lessonTitle = lesson.title;
    const lessonOrder = lesson.order;

    // Remove the lesson
    lesson.remove();

    // Recalculate course duration
    const totalDuration = course.lessons.reduce((sum, lesson) => sum + lesson.duration, 0);
    course.duration = totalDuration;

    await course.save();

    // Log admin action
    await AuditLog.create({
      adminEmail: req.user.email,
      adminId: req.user._id,
      action: 'lesson.delete',
      target: 'lesson',
      targetId: req.params.lessonId,
      details: {
        courseId: course._id,
        courseTitle: course.title,
        lessonTitle: lessonTitle,
        lessonOrder: lessonOrder
      },
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Lesson deleted successfully',
      arabic: 'تم حذف الدرس بنجاح'
    });

  } catch (error) {
    console.error('Delete lesson error:', error);
    res.status(500).json({
      error: 'Internal server error',
      arabic: 'خطأ داخلي في الخادم'
    });
  }
});

// @desc    Reorder lessons
// @route   PUT /api/admin/courses/:courseId/lessons/reorder
// @access  Private (Admin)
router.put('/courses/:courseId/lessons/reorder', requirePermission('courses.edit'), [
  body('lessonOrders').isArray().withMessage('lessonOrders must be an array'),
  body('lessonOrders.*.lessonId').isMongoId().withMessage('Invalid lesson ID'),
  body('lessonOrders.*.order').isInt({ min: 1 }).withMessage('Order must be a positive integer')
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

    const course = await Course.findById(req.params.courseId);
    
    if (!course) {
      return res.status(404).json({
        error: 'Course not found',
        arabic: 'الكورس غير موجود'
      });
    }

    const { lessonOrders } = req.body;

    // Update lesson orders
    lessonOrders.forEach(({ lessonId, order }) => {
      const lesson = course.lessons.id(lessonId);
      if (lesson) {
        lesson.order = order;
      }
    });

    // Sort lessons by order
    course.lessons.sort((a, b) => a.order - b.order);

    await course.save();

    // Log admin action
    await AuditLog.create({
      adminEmail: req.user.email,
      adminId: req.user._id,
      action: 'lesson.reorder',
      target: 'course',
      targetId: course._id,
      details: {
        courseTitle: course.title,
        lessonOrders: lessonOrders
      },
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Lessons reordered successfully',
      arabic: 'تم إعادة ترتيب الدروس بنجاح',
      lessons: course.lessons
    });

  } catch (error) {
    console.error('Reorder lessons error:', error);
    res.status(500).json({
      error: 'Internal server error',
      arabic: 'خطأ داخلي في الخادم'
    });
  }
});

// @desc    Enroll user in course
// @route   POST /api/admin/users/:userId/enroll/:courseId
// @access  Private (Admin)
router.post('/users/:userId/enroll/:courseId', requirePermission('users.manage'), async (req, res) => {
  try {
    const { userId, courseId } = req.params;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        arabic: 'المستخدم غير موجود'
      });
    }

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        error: 'Course not found',
        arabic: 'الكورس غير موجود'
      });
    }

    // Check if user is already enrolled
    const isAlreadyEnrolled = user.enrolledCourses.some(enrolledCourseId => 
      enrolledCourseId.toString() === courseId
    );
    if (isAlreadyEnrolled) {
      return res.status(400).json({
        error: 'User is already enrolled in this course',
        arabic: 'المستخدم مسجل بالفعل في هذا الكورس'
      });
    }

    // Enroll user
    user.enrolledCourses.push(courseId);
    await user.save();

    // Update course enrollment count
    course.enrollmentCount = (course.enrollmentCount || 0) + 1;
    await course.save();

    // Log admin action
    await AuditLog.create({
      adminEmail: req.user.email,
      adminId: req.user._id,
      action: 'user.enroll',
      target: 'user',
      targetId: userId,
      details: {
        courseId,
        courseTitle: course.title,
        userEmail: user.email,
        userName: user.displayName
      },
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'User enrolled successfully',
      arabic: 'تم تسجيل المستخدم في الكورس بنجاح'
    });

  } catch (error) {
    console.error('Enroll user error:', error);
    res.status(500).json({
      error: 'Internal server error',
      arabic: 'خطأ داخلي في الخادم'
    });
  }
});

// @desc    Unenroll user from course
// @route   DELETE /api/admin/users/:userId/enroll/:courseId
// @access  Private (Admin)
router.delete('/users/:userId/enroll/:courseId', requirePermission('users.manage'), async (req, res) => {
  try {
    const { userId, courseId } = req.params;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        arabic: 'المستخدم غير موجود'
      });
    }

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        error: 'Course not found',
        arabic: 'الكورس غير موجود'
      });
    }

    // Check if user is enrolled
    const isEnrolled = user.enrolledCourses.some(enrolledCourseId => 
      enrolledCourseId.toString() === courseId
    );
    if (!isEnrolled) {
      return res.status(400).json({
        error: 'User is not enrolled in this course',
        arabic: 'المستخدم غير مسجل في هذا الكورس'
      });
    }

    // Unenroll user
    user.enrolledCourses = user.enrolledCourses.filter(id => id.toString() !== courseId);
    await user.save();

    // Update course enrollment count
    course.enrollmentCount = Math.max(0, (course.enrollmentCount || 1) - 1);
    await course.save();

    // Remove user's progress for this course
    await Progress.deleteMany({ userId, courseId });

    // Log admin action
    await AuditLog.create({
      adminEmail: req.user.email,
      adminId: req.user._id,
      action: 'user.unenroll',
      target: 'user',
      targetId: userId,
      details: {
        courseId,
        courseTitle: course.title,
        userEmail: user.email,
        userName: user.displayName
      },
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'User unenrolled successfully',
      arabic: 'تم إلغاء تسجيل المستخدم من الكورس بنجاح'
    });

  } catch (error) {
    console.error('Unenroll user error:', error);
    res.status(500).json({
      error: 'Internal server error',
      arabic: 'خطأ داخلي في الخادم'
    });
  }
});

// @desc    Update user notes
// @route   PUT /api/admin/users/:userId/notes
// @access  Private (Admin)
router.put('/users/:userId/notes', requirePermission('users.manage'), [
  body('notes').isString().withMessage('Notes must be a string')
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

    const { userId } = req.params;
    const { notes } = req.body;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        arabic: 'المستخدم غير موجود'
      });
    }

    // Update user notes
    user.notes = notes;
    await user.save();

    // Log admin action
    await AuditLog.create({
      adminEmail: req.user.email,
      adminId: req.user._id,
      action: 'user.notes.update',
      target: 'user',
      targetId: userId,
      details: {
        userEmail: user.email,
        userName: user.displayName,
        notesLength: notes.length
      },
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'User notes updated successfully',
      arabic: 'تم تحديث ملاحظات المستخدم بنجاح'
    });

  } catch (error) {
    console.error('Update user notes error:', error);
    res.status(500).json({
      error: 'Internal server error',
      arabic: 'خطأ داخلي في الخادم'
    });
  }
});

module.exports = router;
