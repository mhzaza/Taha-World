const express = require('express');
const { body, validationResult } = require('express-validator');
const Course = require('../models/Course');
const Order = require('../models/Order');
const User = require('../models/User');
const ConsultationBooking = require('../models/ConsultationBooking');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// PayPal SDK configuration - DISABLED (using stub/mock mode only)
// const paypal = require('@paypal/paypal-server-sdk');
const isPayPalEnabled = false; // Disabled - using mock mode only
const paypalClient = null;

console.log('⚠️  PayPal integration disabled. Running in mock/stub mode only.');

// @desc    Create PayPal order (for courses or consultations)
// @route   POST /api/payment/paypal/create-order
// @access  Private
router.post('/paypal/create-order', authenticate, [
  body('courseId').optional().isMongoId().withMessage('Valid course ID required'),
  body('consultationBookingId').optional().isMongoId().withMessage('Valid booking ID required'),
  body('couponCode').optional().isString()
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

    const { courseId, consultationBookingId, couponCode } = req.body;
    const userId = req.user._id;

    // Check if either courseId or consultationBookingId is provided
    if (!courseId && !consultationBookingId) {
      return res.status(400).json({
        error: 'Either courseId or consultationBookingId is required',
        arabic: 'يجب توفير معرف الكورس أو معرف حجز الاستشارة'
      });
    }

    let orderType, amount, discountAmount = 0, currency, title;

    // Handle consultation booking payment
    if (consultationBookingId) {
      const booking = await ConsultationBooking.findById(consultationBookingId);
      if (!booking) {
        return res.status(404).json({
          error: 'Consultation booking not found',
          arabic: 'حجز الاستشارة غير موجود'
        });
      }

      // Verify booking belongs to user
      if (booking.userId.toString() !== userId.toString()) {
        return res.status(403).json({
          error: 'Access denied',
          arabic: 'غير مصرح لك بالوصول'
        });
      }

      // Check if payment already completed
      if (booking.paymentStatus === 'completed') {
        return res.status(400).json({
          error: 'Payment already completed for this booking',
          arabic: 'تم الدفع مسبقاً لهذا الحجز'
        });
      }

      orderType = 'consultation';
      amount = booking.amount;
      currency = booking.currency;
      title = booking.consultationTitle;
    } 
    // Handle course enrollment payment
    else {
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({
          error: 'Course not found',
          arabic: 'الكورس غير موجود'
        });
      }

      // Check if user is already enrolled
      const user = await User.findById(userId);
      const isAlreadyEnrolled = user.enrolledCourses.some(enrolledCourseId => 
        enrolledCourseId.toString() === courseId
      );
      if (isAlreadyEnrolled) {
        return res.status(400).json({
          error: 'Already enrolled in this course',
          arabic: 'أنت مسجل بالفعل في هذا الكورس'
        });
      }

      orderType = 'course';
      amount = course.price;
      currency = course.currency;
      title = course.title;
    }
    
    // TODO: Implement coupon validation logic here
    if (couponCode) {
      // For now, just a placeholder
      // In real implementation, validate coupon and calculate discount
    }

    // Mock mode for testing without PayPal credentials
    const mockOrderId = `mock_order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const order = {
      id: mockOrderId,
      links: [{
        rel: 'approve',
        href: `${process.env.CLIENT_URL}/payment/success?paymentId=${mockOrderId}&PayerID=mock_payer`
      }]
    };
    console.log(`⚠️  Mock PayPal order created for ${orderType}:`, mockOrderId);

    // Create order record in database
    const orderData = {
      userId,
      userEmail: req.user.email,
      userName: req.user.displayName,
      orderType,
      amount,
      currency,
      status: 'pending',
      paymentMethod: 'paypal',
      paymentIntentId: order.id,
      couponCode: couponCode || null,
      discountAmount,
      taxAmount: 0
    };

    // Add type-specific fields
    if (orderType === 'course') {
      orderData.courseId = courseId;
      orderData.courseTitle = title;
      orderData.originalAmount = amount; // TODO: Handle course originalPrice
    } else if (orderType === 'consultation') {
      orderData.consultationBookingId = consultationBookingId;
    }

    const orderRecord = new Order(orderData);
    await orderRecord.save();

    // Update consultation booking with order ID if consultation
    if (orderType === 'consultation') {
      await ConsultationBooking.findByIdAndUpdate(consultationBookingId, {
        orderId: orderRecord._id
      });
    }

    res.json({
      success: true,
      orderId: order.id,
      approvalUrl: order.links.find(link => link.rel === 'approve').href,
      orderType
    });

  } catch (error) {
    console.error('PayPal create order error:', error);
    res.status(500).json({
      error: 'Failed to create payment order',
      arabic: 'فشل في إنشاء طلب الدفع'
    });
  }
});

// @desc    Capture PayPal payment
// @route   POST /api/payment/paypal/capture
// @access  Private
router.post('/paypal/capture', authenticate, [
  body('orderId').notEmpty().withMessage('Order ID is required')
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

    const { orderId } = req.body;

    // Find the order in our database
    const orderRecord = await Order.findOne({ 
      paymentIntentId: orderId,
      userId: req.user._id,
      status: 'pending'
    });

    if (!orderRecord) {
      return res.status(404).json({
        error: 'Order not found',
        arabic: 'الطلب غير موجود'
      });
    }

    // Mock mode
    const capture = {
      status: 'COMPLETED',
      id: `capture_${orderId}`
    };
    console.log('⚠️  Mock PayPal capture:', capture.id);

    if (capture.status === 'COMPLETED') {
      // Update order status
      orderRecord.status = 'completed';
      orderRecord.completedAt = new Date();
      orderRecord.transactionId = capture.id;
      await orderRecord.save();

      const user = await User.findById(req.user._id);
      let responseData = {
        success: true,
        message: 'Payment completed successfully',
        arabic: 'تم إتمام الدفع بنجاح',
        order: orderRecord
      };

      // Handle based on order type
      if (orderRecord.orderType === 'course') {
        // Enroll user in course
        const isAlreadyEnrolled = user.enrolledCourses.some(enrolledCourseId => 
          enrolledCourseId.toString() === orderRecord.courseId.toString()
        );
        if (!isAlreadyEnrolled) {
          user.enrolledCourses.push(orderRecord.courseId);
          user.totalSpent = (user.totalSpent || 0) + orderRecord.amount;
          await user.save();
        }

        // Update course enrollment count
        const course = await Course.findById(orderRecord.courseId);
        if (course) {
          course.enrollmentCount += 1;
          await course.save();
        }
        responseData.course = course;
      } 
      else if (orderRecord.orderType === 'consultation') {
        // Update consultation booking
        const booking = await ConsultationBooking.findById(orderRecord.consultationBookingId)
          .populate('consultationId');
        
        if (booking) {
          booking.paymentStatus = 'completed';
          booking.paymentCompletedAt = new Date();
          booking.paymentMethod = 'paypal';
          booking.transactionId = capture.id;
          
          // Update status based on whether approval is required
          if (booking.consultationId && booking.consultationId.requiresApproval) {
            booking.status = 'pending_confirmation';
          } else {
            booking.status = 'confirmed';
            booking.confirmedAt = new Date();
            // Set confirmed date/time (use preferred date for now)
            booking.confirmedDateTime = new Date(booking.preferredDate);
            booking.confirmedDateTime.setHours(
              parseInt(booking.preferredTime.split(':')[0]),
              parseInt(booking.preferredTime.split(':')[1])
            );
          }
          
          await booking.save();

          // Update user
          if (!user.consultationBookings.includes(booking._id)) {
            user.consultationBookings.push(booking._id);
          }
          user.totalConsultations = (user.totalConsultations || 0) + 1;
          user.totalSpent = (user.totalSpent || 0) + orderRecord.amount;
          await user.save();

          // Update consultation statistics
          if (booking.consultationId) {
            await booking.consultationId.incrementBooking(orderRecord.amount, false);
          }

          responseData.booking = booking;
          responseData.message = booking.status === 'confirmed' 
            ? 'Payment completed and consultation confirmed!'
            : 'Payment completed! Waiting for admin confirmation.';
          responseData.arabic = booking.status === 'confirmed'
            ? 'تم إتمام الدفع وتأكيد الاستشارة!'
            : 'تم إتمام الدفع! في انتظار تأكيد الإدارة.';
        }
      }

      res.json(responseData);
    } else {
      // Payment failed
      orderRecord.status = 'failed';
      orderRecord.failureReason = 'PayPal capture failed';
      await orderRecord.save();

      res.status(400).json({
        error: 'Payment capture failed',
        arabic: 'فشل في إتمام الدفع'
      });
    }

  } catch (error) {
    console.error('PayPal capture error:', error);
    res.status(500).json({
      error: 'Failed to capture payment',
      arabic: 'فشل في إتمام الدفع'
    });
  }
});

// @desc    Get payment status
// @route   GET /api/payment/status/:orderId
// @access  Private
router.get('/status/:orderId', authenticate, async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({ 
      paymentIntentId: orderId,
      userId: req.user._id
    }).populate('courseId', 'title thumbnail');

    if (!order) {
      return res.status(404).json({
        error: 'Order not found',
        arabic: 'الطلب غير موجود'
      });
    }

    res.json({
      success: true,
      order
    });

  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({
      error: 'Internal server error',
      arabic: 'خطأ داخلي في الخادم'
    });
  }
});

// @desc    Create Bank Transfer order
// @route   POST /api/payment/bank-transfer/create-order
// @access  Private
router.post('/bank-transfer/create-order', authenticate, [
  body('courseId').optional().isMongoId().withMessage('Valid course ID required'),
  body('consultationBookingId').optional().isMongoId().withMessage('Valid booking ID required'),
  body('transferReference').optional().isString().trim(),
  body('bankName').optional().isString().trim(),
  body('accountHolderName').optional().isString().trim(),
  body('transferDate').optional().isISO8601(),
  body('receiptImage').optional().isString().trim(),
  body('couponCode').optional().isString().trim()
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

    const { courseId, consultationBookingId, transferReference, bankName, accountHolderName, transferDate, receiptImage, couponCode } = req.body;
    const userId = req.user._id;
    
    console.log('Bank transfer order data received:', {
      transferReference,
      bankName,
      accountHolderName,
      transferDate,
      receiptImage: receiptImage ? receiptImage.substring(0, 100) + '...' : 'Missing',
      receiptImageLength: receiptImage?.length,
      hasReceiptImage: !!receiptImage,
      couponCode
    });

    // Validate receipt image is provided
    if (!receiptImage || !receiptImage.trim()) {
      return res.status(400).json({
        error: 'Receipt image is required for bank transfer',
        arabic: 'صورة الإيصال مطلوبة للتحويل البنكي'
      });
    }

    // Validate receipt image URL format (should be from Cloudinary or valid URL)
    if (!receiptImage.startsWith('http://') && !receiptImage.startsWith('https://')) {
      return res.status(400).json({
        error: 'Invalid receipt image URL format',
        arabic: 'تنسيق رابط صورة الإيصال غير صالح'
      });
    }

    // Check if either courseId or consultationBookingId is provided
    if (!courseId && !consultationBookingId) {
      return res.status(400).json({
        error: 'Either courseId or consultationBookingId is required',
        arabic: 'يجب توفير معرف الكورس أو معرف حجز الاستشارة'
      });
    }

    let orderType, amount, currency, title, bookingNumber;

    // Handle consultation booking payment
    if (consultationBookingId) {
      const booking = await ConsultationBooking.findById(consultationBookingId);
      if (!booking) {
        return res.status(404).json({
          error: 'Consultation booking not found',
          arabic: 'حجز الاستشارة غير موجود'
        });
      }

      // Verify booking belongs to user
      if (booking.userId.toString() !== userId.toString()) {
        return res.status(403).json({
          error: 'Access denied',
          arabic: 'غير مصرح لك بالوصول'
        });
      }

      // Check if payment already completed
      if (booking.paymentStatus === 'completed') {
        return res.status(400).json({
          error: 'Payment already completed for this booking',
          arabic: 'تم الدفع مسبقاً لهذا الحجز'
        });
      }

      orderType = 'consultation';
      amount = booking.amount;
      currency = booking.currency;
      title = booking.consultationTitle;
      bookingNumber = booking.bookingNumber;
    } 
    // Handle course enrollment payment
    else {
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({
          error: 'Course not found',
          arabic: 'الكورس غير موجود'
        });
      }

      // Check if user is already enrolled
      const user = await User.findById(userId);
      const isAlreadyEnrolled = user.enrolledCourses.some(enrolledCourseId => 
        enrolledCourseId.toString() === courseId
      );
      if (isAlreadyEnrolled) {
        return res.status(400).json({
          error: 'Already enrolled in this course',
          arabic: 'أنت مسجل بالفعل في هذا الكورس'
        });
      }

      orderType = 'course';
      amount = course.price;
      currency = course.currency;
      title = course.title;
    }

    // Apply coupon discount if provided
    let originalAmount = amount;
    let discountAmount = 0;
    
    if (couponCode) {
      try {
        const Coupon = require('../models/Coupon');
        const coupon = await Coupon.findOne({ 
          code: couponCode.toUpperCase(),
          isActive: true 
        });
        
        if (coupon && coupon.isValid(orderType, courseId || consultationBookingId)) {
          discountAmount = coupon.calculateDiscount(amount);
          amount = Math.max(0, amount - discountAmount);
          
          console.log('Coupon applied:', {
            code: couponCode,
            originalAmount,
            discountAmount,
            finalAmount: amount
          });
        }
      } catch (couponError) {
        console.error('Error applying coupon:', couponError);
        // Continue without coupon if there's an error
      }
    }

    // Create order record in database
    const orderData = {
      userId,
      userEmail: req.user.email,
      userName: req.user.displayName,
      orderType,
      amount,
      originalAmount: originalAmount,
      discountAmount: discountAmount,
      currency,
      status: 'pending',
      paymentMethod: 'bank_transfer',
      couponCode: couponCode || null,
      bankTransfer: {
        receiptImage: receiptImage || null, // Save receipt image URL
        transferReference: transferReference || null,
        bankName: bankName || null,
        accountHolderName: accountHolderName || null,
        transferDate: transferDate ? new Date(transferDate) : null,
        verificationStatus: 'pending'
      }
    };

    // Add type-specific fields
    if (orderType === 'course') {
      orderData.courseId = courseId;
      orderData.courseTitle = title;
    } else if (orderType === 'consultation') {
      orderData.consultationBookingId = consultationBookingId;
      orderData.consultationTitle = title;
      orderData.consultationBookingNumber = bookingNumber;
    }

    const orderRecord = new Order(orderData);
    await orderRecord.save();
    
    // Verify the image was saved to database by re-fetching the order
    const savedOrder = await Order.findById(orderRecord._id);
    
    console.log('Bank transfer order created successfully:', {
      orderId: orderRecord._id,
      orderType,
      amount,
      currency,
      receiptImageProvided: !!receiptImage,
      receiptImageSavedInMemory: orderRecord.bankTransfer?.receiptImage ? 'YES' : 'NO',
      receiptImageInDB: savedOrder?.bankTransfer?.receiptImage ? 'YES' : 'NO',
      receiptImageUrlInDB: savedOrder?.bankTransfer?.receiptImage?.substring(0, 100),
      bankTransferData: {
        hasReceiptImage: !!savedOrder?.bankTransfer?.receiptImage,
        transferReference: savedOrder?.bankTransfer?.transferReference,
        bankName: savedOrder?.bankTransfer?.bankName,
        verificationStatus: savedOrder?.bankTransfer?.verificationStatus
      }
    });

    // Critical check: Ensure receipt image was saved
    if (!savedOrder?.bankTransfer?.receiptImage) {
      console.error('CRITICAL ERROR: Receipt image was not saved to database!', {
        orderId: orderRecord._id,
        receiptImageProvided: receiptImage,
        orderData: orderData.bankTransfer
      });
    }

    // Update consultation booking with order ID if consultation
    if (orderType === 'consultation') {
      await ConsultationBooking.findByIdAndUpdate(consultationBookingId, {
        orderId: orderRecord._id,
        paymentMethod: 'bank_transfer'
      });
    }

    res.json({
      success: true,
      message: 'Order created successfully with receipt image.',
      arabic: 'تم إنشاء الطلب بنجاح مع صورة الإيصال.',
      order: orderRecord,
      orderType
    });

  } catch (error) {
    console.error('Bank transfer create order error:', error);
    res.status(500).json({
      error: 'Failed to create bank transfer order',
      arabic: 'فشل في إنشاء طلب التحويل البنكي'
    });
  }
});

// @desc    Upload Bank Transfer Receipt
// @route   POST /api/payment/bank-transfer/upload-receipt/:orderId
// @access  Private
router.post('/bank-transfer/upload-receipt/:orderId', authenticate, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { receiptImage, receiptImagePublicId } = req.body;

    if (!receiptImage) {
      return res.status(400).json({
        error: 'Receipt image is required',
        arabic: 'صورة الإيصال مطلوبة'
      });
    }

    // Find the order
    const order = await Order.findOne({ 
      _id: orderId,
      userId: req.user._id,
      paymentMethod: 'bank_transfer'
    });

    if (!order) {
      return res.status(404).json({
        error: 'Order not found',
        arabic: 'الطلب غير موجود'
      });
    }

    // Update order with receipt image
    order.bankTransfer.receiptImage = receiptImage;
    order.bankTransfer.receiptImagePublicId = receiptImagePublicId || null;
    order.bankTransfer.verificationStatus = 'pending';
    await order.save();

    res.json({
      success: true,
      message: 'Receipt uploaded successfully. Waiting for admin verification.',
      arabic: 'تم رفع الإيصال بنجاح. في انتظار التحقق من الإدارة.',
      order
    });

  } catch (error) {
    console.error('Upload receipt error:', error);
    res.status(500).json({
      error: 'Failed to upload receipt',
      arabic: 'فشل في رفع الإيصال'
    });
  }
});

// @desc    Verify Bank Transfer (Admin only)
// @route   PUT /api/payment/bank-transfer/verify/:orderId
// @access  Private (Admin)
router.put('/bank-transfer/verify/:orderId', authenticate, [
  body('status').isIn(['verified', 'rejected']).withMessage('Status must be verified or rejected'),
  body('rejectionReason').optional().isString().trim()
], async (req, res) => {
  try {
    console.log('Bank transfer verification request:', {
      orderId: req.params.orderId,
      status: req.body.status,
      adminId: req.user?._id,
      isAdmin: req.user?.isAdmin
    });

    // Check if user is admin
    if (!req.user.isAdmin) {
      console.log('Access denied - user is not admin');
      return res.status(403).json({
        error: 'Access denied. Admin only.',
        arabic: 'غير مصرح لك. للإدارة فقط.'
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({
        error: 'Validation failed',
        arabic: 'فشل في التحقق من البيانات',
        details: errors.array()
      });
    }

    const { orderId } = req.params;
    const { status, rejectionReason } = req.body;

    // Find the order
    const order = await Order.findOne({ 
      _id: orderId,
      paymentMethod: 'bank_transfer'
    });

    if (!order) {
      console.log('Order not found:', orderId);
      return res.status(404).json({
        error: 'Order not found',
        arabic: 'الطلب غير موجود'
      });
    }

    console.log('Order found:', {
      orderId: order._id,
      status: order.status,
      hasBankTransfer: !!order.bankTransfer,
      currentVerificationStatus: order.bankTransfer?.verificationStatus
    });

    // Ensure bankTransfer object exists
    if (!order.bankTransfer) {
      order.bankTransfer = {};
    }

    // Update verification status
    order.bankTransfer.verificationStatus = status;
    order.bankTransfer.verifiedBy = req.user._id;
    order.bankTransfer.verifiedAt = new Date();

    if (status === 'verified') {
      // Mark order as completed
      order.status = 'completed';
      order.completedAt = new Date();

      const user = await User.findById(order.userId);

      // Handle based on order type
      if (order.orderType === 'course') {
        // Enroll user in course
        const isAlreadyEnrolled = user.enrolledCourses.some(enrolledCourseId => 
          enrolledCourseId.toString() === order.courseId.toString()
        );
        if (!isAlreadyEnrolled) {
          user.enrolledCourses.push(order.courseId);
          user.totalSpent = (user.totalSpent || 0) + order.amount;
          await user.save();
        }

        // Update course enrollment count
        const course = await Course.findById(order.courseId);
        if (course) {
          course.enrollmentCount += 1;
          await course.save();
        }
      } 
      else if (order.orderType === 'consultation') {
        // Update consultation booking
        const booking = await ConsultationBooking.findById(order.consultationBookingId)
          .populate('consultationId');
        
        if (booking) {
          booking.paymentStatus = 'completed';
          booking.paymentCompletedAt = new Date();
          booking.paymentMethod = 'bank_transfer';
          
          // Update status based on whether approval is required
          if (booking.consultationId && booking.consultationId.requiresApproval) {
            booking.status = 'pending_confirmation';
          } else {
            booking.status = 'confirmed';
            booking.confirmedAt = new Date();
            // Set confirmed date/time
            booking.confirmedDateTime = new Date(booking.preferredDate);
            booking.confirmedDateTime.setHours(
              parseInt(booking.preferredTime.split(':')[0]),
              parseInt(booking.preferredTime.split(':')[1])
            );
          }
          
          await booking.save();

          // Update user
          if (!user.consultationBookings || !user.consultationBookings.includes(booking._id)) {
            if (!user.consultationBookings) user.consultationBookings = [];
            user.consultationBookings.push(booking._id);
          }
          user.totalConsultations = (user.totalConsultations || 0) + 1;
          user.totalSpent = (user.totalSpent || 0) + order.amount;
          await user.save();

          // Update consultation statistics
          if (booking.consultationId) {
            await booking.consultationId.incrementBooking(order.amount, false);
          }
        }
      }
    } else if (status === 'rejected') {
      order.status = 'failed';
      order.failureReason = rejectionReason || 'Bank transfer verification rejected';
      order.bankTransfer.rejectionReason = rejectionReason;
    }

    await order.save();

    res.json({
      success: true,
      message: status === 'verified' ? 'Payment verified successfully' : 'Payment rejected',
      arabic: status === 'verified' ? 'تم التحقق من الدفع بنجاح' : 'تم رفض الدفع',
      order
    });

  } catch (error) {
    console.error('Verify bank transfer error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      error: 'Failed to verify bank transfer',
      arabic: 'فشل في التحقق من التحويل البنكي',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Create Stripe Checkout Session
// @route   POST /api/payment/stripe/create-session
// @access  Private
router.post('/stripe/create-session', authenticate, [
  body('courseId').optional().isMongoId().withMessage('Valid course ID required'),
  body('consultationBookingId').optional().isMongoId().withMessage('Valid booking ID required')
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

    const { courseId, consultationBookingId } = req.body;
    const userId = req.user._id;

    // Check if either courseId or consultationBookingId is provided
    if (!courseId && !consultationBookingId) {
      return res.status(400).json({
        error: 'Either courseId or consultationBookingId is required',
        arabic: 'يجب توفير معرف الكورس أو معرف حجز الاستشارة'
      });
    }

    let orderType, amount, currency, title;

    // Handle consultation booking payment
    if (consultationBookingId) {
      const booking = await ConsultationBooking.findById(consultationBookingId);
      if (!booking) {
        return res.status(404).json({
          error: 'Consultation booking not found',
          arabic: 'حجز الاستشارة غير موجود'
        });
      }

      if (booking.userId.toString() !== userId.toString()) {
        return res.status(403).json({
          error: 'Access denied',
          arabic: 'غير مصرح لك بالوصول'
        });
      }

      if (booking.paymentStatus === 'completed') {
        return res.status(400).json({
          error: 'Payment already completed for this booking',
          arabic: 'تم الدفع مسبقاً لهذا الحجز'
        });
      }

      orderType = 'consultation';
      amount = booking.amount;
      currency = booking.currency;
      title = booking.consultationTitle;
    } 
    else {
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({
          error: 'Course not found',
          arabic: 'الكورس غير موجود'
        });
      }

      const user = await User.findById(userId);
      const isAlreadyEnrolled = user.enrolledCourses.some(enrolledCourseId => 
        enrolledCourseId.toString() === courseId
      );
      if (isAlreadyEnrolled) {
        return res.status(400).json({
          error: 'Already enrolled in this course',
          arabic: 'أنت مسجل بالفعل في هذا الكورس'
        });
      }

      orderType = 'course';
      amount = course.price;
      currency = course.currency;
      title = course.title;
    }

    // Create order record in database
    const orderData = {
      userId,
      userEmail: req.user.email,
      userName: req.user.displayName,
      orderType,
      amount,
      currency,
      status: 'pending',
      paymentMethod: 'stripe'
    };

    if (orderType === 'course') {
      orderData.courseId = courseId;
      orderData.courseTitle = title;
      orderData.originalAmount = amount;
    } else if (orderType === 'consultation') {
      orderData.consultationBookingId = consultationBookingId;
    }

    const orderRecord = new Order(orderData);
    await orderRecord.save();

    // Update consultation booking with order ID if consultation
    if (orderType === 'consultation') {
      await ConsultationBooking.findByIdAndUpdate(consultationBookingId, {
        orderId: orderRecord._id,
        paymentMethod: 'stripe'
      });
    }

    // For now, return a mock Stripe session URL
    // TODO: Implement actual Stripe integration
    const mockSessionId = `stripe_session_${Date.now()}`;
    const stripeCheckoutUrl = `https://checkout.stripe.com/pay/${mockSessionId}`;

    orderRecord.paymentIntentId = mockSessionId;
    await orderRecord.save();

    res.json({
      success: true,
      message: 'Stripe session created successfully',
      arabic: 'تم إنشاء جلسة Stripe بنجاح',
      sessionId: mockSessionId,
      checkoutUrl: stripeCheckoutUrl,
      order: orderRecord,
      orderType
    });

  } catch (error) {
    console.error('Stripe create session error:', error);
    res.status(500).json({
      error: 'Failed to create Stripe session',
      arabic: 'فشل في إنشاء جلسة Stripe'
    });
  }
});

module.exports = router;
