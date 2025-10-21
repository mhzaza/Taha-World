const express = require('express');
const router = express.Router();
const { body, validationResult, query } = require('express-validator');
const Consultation = require('../models/Consultation');
const ConsultationBooking = require('../models/ConsultationBooking');
const User = require('../models/User');
const Order = require('../models/Order');
const { authenticate } = require('../middleware/auth');

// @desc    Get all active consultations
// @route   GET /api/consultations
// @access  Public
router.get('/', [
  query('category').optional().isIn(['sports', 'life_coaching', 'group', 'vip', 'nutrition', 'general'])
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

    const { category } = req.query;
    
    const consultations = category
      ? await Consultation.getByCategory(category)
      : await Consultation.getActive();

    res.json({
      success: true,
      consultations,
      count: consultations.length
    });

  } catch (error) {
    console.error('Get consultations error:', error);
    res.status(500).json({
      error: 'Failed to fetch consultations',
      arabic: 'فشل في تحميل الاستشارات'
    });
  }
});

// @desc    Get specific consultation
// @route   GET /api/consultations/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const consultation = await Consultation.findById(req.params.id);

    if (!consultation) {
      return res.status(404).json({
        error: 'Consultation not found',
        arabic: 'الاستشارة غير موجودة'
      });
    }

    res.json({
      success: true,
      consultation
    });

  } catch (error) {
    console.error('Get consultation error:', error);
    res.status(500).json({
      error: 'Failed to fetch consultation',
      arabic: 'فشل في تحميل الاستشارة'
    });
  }
});

// @desc    Create new consultation booking
// @route   POST /api/consultations/book
// @access  Private
router.post('/book', authenticate, [
  body('consultationId').isMongoId().withMessage('Valid consultation ID is required'),
  body('preferredDate').isISO8601().withMessage('Valid preferred date is required'),
  body('preferredTime').matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Valid time format required (HH:MM)'),
  body('alternativeDate').optional().isISO8601(),
  body('alternativeTime').optional().matches(/^([01]\d|2[0-3]):([0-5]\d)$/),
  body('meetingType').isIn(['online', 'in_person']).withMessage('Meeting type must be online or in_person'),
  body('userDetails').optional().isObject(),
  body('userDetails.age').optional().isInt({ min: 1, max: 150 }),
  body('userDetails.weight').optional().isFloat({ min: 0 }),
  body('userDetails.height').optional().isFloat({ min: 0 }),
  body('userDetails.gender').optional().isIn(['male', 'female', 'other']),
  body('userDetails.fitnessLevel').optional().isIn(['beginner', 'intermediate', 'advanced'])
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
      consultationId,
      preferredDate,
      preferredTime,
      alternativeDate,
      alternativeTime,
      meetingType,
      userDetails
    } = req.body;

    const user = req.user;

    // Validate user has phone number
    if (!user.phone) {
      return res.status(400).json({
        error: 'Phone number is required for consultations. Please update your profile.',
        arabic: 'رقم الهاتف مطلوب للاستشارات. يرجى تحديث الملف الشخصي.'
      });
    }

    // Find the consultation
    const consultation = await Consultation.findById(consultationId);
    if (!consultation) {
      return res.status(404).json({
        error: 'Consultation not found',
        arabic: 'الاستشارة غير موجودة'
      });
    }

    if (!consultation.isActive) {
      return res.status(400).json({
        error: 'This consultation is not currently available',
        arabic: 'هذه الاستشارة غير متاحة حالياً'
      });
    }

    // Check if consultation type matches meeting type
    if (consultation.consultationType !== 'both' && 
        consultation.consultationType !== meetingType) {
      return res.status(400).json({
        error: `This consultation is only available for ${consultation.consultationType}`,
        arabic: `هذه الاستشارة متاحة فقط لـ ${consultation.consultationType === 'online' ? 'الجلسات عبر الإنترنت' : 'الجلسات الحضورية'}`
      });
    }

    // Check availability on preferred date
    const preferredDateObj = new Date(preferredDate);
    if (!consultation.isAvailableOn(preferredDateObj)) {
      return res.status(400).json({
        error: 'Consultation not available on selected day',
        arabic: 'الاستشارة غير متاحة في اليوم المحدد'
      });
    }

    // Check if user already has a pending or confirmed booking for same consultation
    const existingBooking = await ConsultationBooking.findOne({
      userId: user._id,
      consultationId,
      status: { $in: ['pending_payment', 'pending_confirmation', 'confirmed'] }
    });

    if (existingBooking) {
      return res.status(400).json({
        error: 'You already have an active booking for this consultation',
        arabic: 'لديك بالفعل حجز نشط لهذه الاستشارة'
      });
    }

    // Check if this is user's first booking
    const userBookingsCount = await ConsultationBooking.countDocuments({ userId: user._id });
    const isFirstBooking = userBookingsCount === 0;

    // Create consultation booking
    const booking = new ConsultationBooking({
      userId: user._id,
      userEmail: user.email,
      userName: user.displayName,
      userPhone: user.phone,
      consultationId,
      consultationType: consultation.consultationType,
      consultationTitle: consultation.title,
      consultationCategory: consultation.category,
      preferredDate: new Date(preferredDate),
      preferredTime,
      alternativeDate: alternativeDate ? new Date(alternativeDate) : null,
      alternativeTime: alternativeTime || null,
      duration: consultation.durationMinutes,
      meetingType,
      userDetails: userDetails || {},
      amount: consultation.price,
      currency: consultation.currency,
      status: 'pending_payment',
      paymentStatus: 'pending',
      isFirstBooking,
      source: 'web',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    await booking.save();

    // Create order record
    const order = new Order({
      userId: user._id,
      userEmail: user.email,
      userName: user.displayName,
      orderType: 'consultation',
      consultationBookingId: booking._id,
      amount: consultation.price,
      originalAmount: consultation.originalPrice || consultation.price,
      currency: consultation.currency,
      status: 'pending',
      paymentMethod: 'paypal' // Will be updated based on actual payment method
    });

    await order.save();

    // Update booking with order ID
    booking.orderId = order._id;
    await booking.save();

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      arabic: 'تم إنشاء الحجز بنجاح',
      booking: {
        _id: booking._id,
        bookingNumber: booking.bookingNumber,
        consultationTitle: booking.consultationTitle,
        preferredDate: booking.preferredDate,
        preferredTime: booking.preferredTime,
        amount: booking.amount,
        currency: booking.currency,
        status: booking.status,
        paymentStatus: booking.paymentStatus
      },
      order: {
        _id: order._id,
        amount: order.amount,
        currency: order.currency
      },
      nextStep: 'payment',
      paymentRequired: true
    });

  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      error: 'Failed to create booking',
      arabic: 'فشل في إنشاء الحجز'
    });
  }
});

// @desc    Get user's bookings
// @route   GET /api/consultations/my-bookings
// @access  Private
router.get('/my-bookings', authenticate, [
  query('status').optional().isIn(['pending_payment', 'pending_confirmation', 'confirmed', 'completed', 'cancelled', 'rescheduled', 'no_show']),
  query('upcoming').optional().isBoolean(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
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

    const { status, upcoming } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = { userId: req.user._id };
    
    if (status) {
      filter.status = status;
    }

    if (upcoming === 'true') {
      filter.confirmedDateTime = { $gte: new Date() };
      filter.status = { $in: ['confirmed', 'pending_confirmation'] };
    }

    const [bookings, total] = await Promise.all([
      ConsultationBooking.find(filter)
        .populate('consultationId', 'title duration price category image')
        .populate('orderId', 'amount status transactionId paymentMethod')
        .sort({ preferredDate: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      ConsultationBooking.countDocuments(filter)
    ]);

    res.json({
      success: true,
      bookings,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit
      }
    });

  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json({
      error: 'Failed to fetch bookings',
      arabic: 'فشل في تحميل الحجوزات'
    });
  }
});

// @desc    Get specific booking
// @route   GET /api/consultations/booking/:bookingId
// @access  Private
router.get('/booking/:bookingId', authenticate, async (req, res) => {
  try {
    const booking = await ConsultationBooking.findById(req.params.bookingId)
      .populate('consultationId')
      .populate('orderId')
      .populate('userId', 'displayName email phone avatar');

    if (!booking) {
      return res.status(404).json({
        error: 'Booking not found',
        arabic: 'الحجز غير موجود'
      });
    }

    // Check if user owns this booking or is admin
    if (booking.userId._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({
        error: 'Access denied',
        arabic: 'غير مصرح لك بالوصول'
      });
    }

    res.json({
      success: true,
      booking
    });

  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({
      error: 'Failed to fetch booking',
      arabic: 'فشل في تحميل الحجز'
    });
  }
});

// @desc    Cancel booking
// @route   DELETE /api/consultations/booking/:bookingId/cancel
// @access  Private
router.delete('/booking/:bookingId/cancel', authenticate, [
  body('reason').optional().isString().trim()
], async (req, res) => {
  try {
    const booking = await ConsultationBooking.findById(req.params.bookingId);

    if (!booking) {
      return res.status(404).json({
        error: 'Booking not found',
        arabic: 'الحجز غير موجود'
      });
    }

    // Check ownership
    if (booking.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Access denied',
        arabic: 'غير مصرح لك بالوصول'
      });
    }

    // Check if can be cancelled
    const canCancel = booking.canBeCancelled();
    if (!canCancel.allowed) {
      return res.status(400).json({
        error: canCancel.reason,
        arabic: 'لا يمكن إلغاء هذا الحجز'
      });
    }

    // Update booking
    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    booking.cancelledBy = 'user';
    booking.cancellationReason = req.body.reason || 'User cancelled';
    await booking.save();

    // Update order if exists
    if (booking.orderId) {
      const order = await Order.findById(booking.orderId);
      if (order && order.status !== 'refunded') {
        order.status = 'cancelled';
        order.cancelledAt = new Date();
        order.cancellationReason = booking.cancellationReason;
        await order.save();
      }
    }

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      arabic: 'تم إلغاء الحجز بنجاح',
      booking
    });

  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({
      error: 'Failed to cancel booking',
      arabic: 'فشل في إلغاء الحجز'
    });
  }
});

// @desc    Reschedule booking
// @route   PUT /api/consultations/booking/:bookingId/reschedule
// @access  Private
router.put('/booking/:bookingId/reschedule', authenticate, [
  body('newDate').isISO8601().withMessage('Valid date is required'),
  body('newTime').matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Valid time format required (HH:MM)'),
  body('reason').optional().isString().trim()
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

    const booking = await ConsultationBooking.findById(req.params.bookingId);

    if (!booking) {
      return res.status(404).json({
        error: 'Booking not found',
        arabic: 'الحجز غير موجود'
      });
    }

    // Check ownership
    if (booking.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Access denied',
        arabic: 'غير مصرح لك بالوصول'
      });
    }

    // Check if can be rescheduled
    const canReschedule = booking.canBeRescheduled();
    if (!canReschedule.allowed) {
      return res.status(400).json({
        error: canReschedule.reason,
        arabic: 'لا يمكن إعادة جدولة هذا الحجز'
      });
    }

    const { newDate, newTime, reason } = req.body;

    // Store old schedule
    booking.rescheduledFrom = {
      date: booking.confirmedDateTime || booking.preferredDate,
      time: booking.preferredTime,
      reason: reason || 'User requested reschedule'
    };

    // Update schedule
    booking.preferredDate = new Date(newDate);
    booking.preferredTime = newTime;
    booking.confirmedDateTime = null; // Reset confirmation
    booking.status = 'pending_confirmation'; // Needs admin re-confirmation
    booking.rescheduledReason = reason || 'User requested reschedule';
    booking.rescheduledCount = (booking.rescheduledCount || 0) + 1;

    await booking.save();

    res.json({
      success: true,
      message: 'Booking rescheduled successfully. Waiting for admin confirmation.',
      arabic: 'تم إعادة جدولة الحجز بنجاح. في انتظار تأكيد الإدارة.',
      booking
    });

  } catch (error) {
    console.error('Reschedule booking error:', error);
    res.status(500).json({
      error: 'Failed to reschedule booking',
      arabic: 'فشل في إعادة جدولة الحجز'
    });
  }
});

// @desc    Submit feedback for completed consultation
// @route   POST /api/consultations/booking/:bookingId/feedback
// @access  Private
router.post('/booking/:bookingId/feedback', authenticate, [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().isString().trim().isLength({ max: 1000 })
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

    const booking = await ConsultationBooking.findById(req.params.bookingId)
      .populate('consultationId');

    if (!booking) {
      return res.status(404).json({
        error: 'Booking not found',
        arabic: 'الحجز غير موجود'
      });
    }

    // Check ownership
    if (booking.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Access denied',
        arabic: 'غير مصرح لك بالوصول'
      });
    }

    // Check if consultation is completed
    if (booking.status !== 'completed') {
      return res.status(400).json({
        error: 'Can only submit feedback for completed consultations',
        arabic: 'يمكن تقديم التقييم فقط للاستشارات المكتملة'
      });
    }

    // Check if feedback already submitted
    if (booking.userFeedback && booking.userFeedback.rating) {
      return res.status(400).json({
        error: 'Feedback already submitted',
        arabic: 'تم تقديم التقييم مسبقاً'
      });
    }

    const { rating, comment } = req.body;

    // Update booking feedback
    booking.userFeedback = {
      rating,
      comment: comment || '',
      submittedAt: new Date(),
      isPublic: false // Can be updated later by admin
    };
    await booking.save();

    // Update consultation rating
    if (booking.consultationId) {
      await booking.consultationId.updateRating(rating);
    }

    res.json({
      success: true,
      message: 'Thank you for your feedback!',
      arabic: 'شكراً لك على تقييمك!',
      feedback: booking.userFeedback
    });

  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({
      error: 'Failed to submit feedback',
      arabic: 'فشل في تقديم التقييم'
    });
  }
});

// @desc    Get popular consultations
// @route   GET /api/consultations/popular
// @access  Public
router.get('/popular', [
  query('limit').optional().isInt({ min: 1, max: 20 })
], async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const consultations = await Consultation.getPopular(limit);

    res.json({
      success: true,
      consultations
    });

  } catch (error) {
    console.error('Get popular consultations error:', error);
    res.status(500).json({
      error: 'Failed to fetch popular consultations',
      arabic: 'فشل في تحميل الاستشارات الشائعة'
    });
  }
});

// @desc    Get all bookings (Admin)
// @route   GET /api/consultations/admin/bookings
// @access  Private (Admin)
router.get('/admin/bookings', authenticate, [
  query('status').optional().isIn(['pending_payment', 'pending_confirmation', 'confirmed', 'completed', 'cancelled', 'rescheduled', 'no_show']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({
        error: 'Access denied. Admin only.',
        arabic: 'غير مصرح لك. للإدارة فقط.'
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        arabic: 'فشل في التحقق من البيانات',
        details: errors.array()
      });
    }

    const { status } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const filter = {};
    if (status) {
      filter.status = status;
    }

    const [bookings, total] = await Promise.all([
      ConsultationBooking.find(filter)
        .populate('consultationId', 'title duration price category image')
        .populate('userId', 'displayName email phone avatar')
        .populate('orderId', 'amount status transactionId paymentMethod')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      ConsultationBooking.countDocuments(filter)
    ]);

    res.json({
      success: true,
      bookings,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit
      }
    });

  } catch (error) {
    console.error('Get admin bookings error:', error);
    res.status(500).json({
      error: 'Failed to fetch bookings',
      arabic: 'فشل في تحميل الحجوزات'
    });
  }
});

// @desc    Confirm consultation booking (Admin)
// @route   PUT /api/consultations/admin/booking/:bookingId/confirm
// @access  Private (Admin)
router.put('/admin/booking/:bookingId/confirm', authenticate, [
  body('confirmedDate').isISO8601().withMessage('Valid date is required'),
  body('confirmedTime').matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Valid time format required (HH:MM)'),
  body('notes').optional().isString().trim()
], async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({
        error: 'Access denied. Admin only.',
        arabic: 'غير مصرح لك. للإدارة فقط.'
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        arabic: 'فشل في التحقق من البيانات',
        details: errors.array()
      });
    }

    const { bookingId } = req.params;
    const { confirmedDate, confirmedTime, notes } = req.body;

    const booking = await ConsultationBooking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        error: 'Booking not found',
        arabic: 'الحجز غير موجود'
      });
    }

    // Update booking
    const confirmedDateTime = new Date(confirmedDate);
    confirmedDateTime.setHours(
      parseInt(confirmedTime.split(':')[0]),
      parseInt(confirmedTime.split(':')[1])
    );

    booking.status = 'confirmed';
    booking.confirmedDateTime = confirmedDateTime;
    booking.confirmedAt = new Date();
    booking.confirmedBy = req.user._id;
    if (notes) {
      booking.adminNotes = notes;
    }

    await booking.save();

    res.json({
      success: true,
      message: 'Booking confirmed successfully',
      arabic: 'تم تأكيد الحجز بنجاح',
      booking
    });

  } catch (error) {
    console.error('Confirm booking error:', error);
    res.status(500).json({
      error: 'Failed to confirm booking',
      arabic: 'فشل في تأكيد الحجز'
    });
  }
});

// @desc    Create consultation (Admin)
// @route   POST /api/consultations/admin/create
// @access  Private (Admin)
router.post('/admin/create', authenticate, [
  body('consultationId').isInt({ min: 1 }).withMessage('Valid consultation ID is required'),
  body('title').trim().isLength({ min: 3, max: 200 }).withMessage('Title must be between 3 and 200 characters'),
  body('description').trim().isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),
  body('duration').trim().notEmpty().withMessage('Duration is required'),
  body('durationMinutes').isInt({ min: 15, max: 480 }).withMessage('Duration must be between 15 and 480 minutes'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('currency').isIn(['USD', 'SAR', 'EGP']).withMessage('Invalid currency'),
  body('category').isIn(['sports', 'life_coaching', 'group', 'vip', 'nutrition', 'general']).withMessage('Invalid category'),
  body('consultationType').isIn(['online', 'in_person', 'both']).withMessage('Invalid consultation type')
], async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({
        error: 'Access denied. Admin only.',
        arabic: 'غير مصرح لك. للإدارة فقط.'
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        arabic: 'فشل في التحقق من البيانات',
        details: errors.array()
      });
    }

    // Check if consultationId already exists
    const existingConsultation = await Consultation.findOne({ consultationId: req.body.consultationId });
    if (existingConsultation) {
      return res.status(400).json({
        error: 'Consultation ID already exists',
        arabic: 'رقم الاستشارة موجود بالفعل'
      });
    }

    const consultation = await Consultation.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Consultation created successfully',
      arabic: 'تم إنشاء الاستشارة بنجاح',
      consultation
    });

  } catch (error) {
    console.error('Create consultation error:', error);
    res.status(500).json({
      error: 'Failed to create consultation',
      arabic: 'فشل في إنشاء الاستشارة'
    });
  }
});

// @desc    Update consultation (Admin)
// @route   PUT /api/consultations/admin/:consultationId
// @access  Private (Admin)
router.put('/admin/:consultationId', authenticate, [
  body('title').optional().trim().isLength({ min: 3, max: 200 }).withMessage('Title must be between 3 and 200 characters'),
  body('description').optional().trim().isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),
  body('duration').optional().trim().notEmpty().withMessage('Duration cannot be empty'),
  body('durationMinutes').optional().isInt({ min: 15, max: 480 }).withMessage('Duration must be between 15 and 480 minutes'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('currency').optional().isIn(['USD', 'SAR', 'EGP']).withMessage('Invalid currency'),
  body('category').optional().isIn(['sports', 'life_coaching', 'group', 'vip', 'nutrition', 'general']).withMessage('Invalid category'),
  body('consultationType').optional().isIn(['online', 'in_person', 'both']).withMessage('Invalid consultation type')
], async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({
        error: 'Access denied. Admin only.',
        arabic: 'غير مصرح لك. للإدارة فقط.'
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        arabic: 'فشل في التحقق من البيانات',
        details: errors.array()
      });
    }

    const consultation = await Consultation.findByIdAndUpdate(
      req.params.consultationId,
      req.body,
      { new: true, runValidators: true }
    );

    if (!consultation) {
      return res.status(404).json({
        error: 'Consultation not found',
        arabic: 'الاستشارة غير موجودة'
      });
    }

    res.json({
      success: true,
      message: 'Consultation updated successfully',
      arabic: 'تم تحديث الاستشارة بنجاح',
      consultation
    });

  } catch (error) {
    console.error('Update consultation error:', error);
    res.status(500).json({
      error: 'Failed to update consultation',
      arabic: 'فشل في تحديث الاستشارة'
    });
  }
});

module.exports = router;

