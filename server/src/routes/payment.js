const express = require('express');
const { body, validationResult } = require('express-validator');
const Course = require('../models/Course');
const Order = require('../models/Order');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Mock PayPal configuration for testing
const isPayPalEnabled = process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET;

// @desc    Create PayPal order
// @route   POST /api/payment/paypal/create-order
// @access  Private
router.post('/paypal/create-order', authenticate, [
  body('courseId').isMongoId().withMessage('Valid course ID is required'),
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

    const { courseId, couponCode } = req.body;
    const userId = req.user._id;

    // Find the course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        error: 'Course not found',
        arabic: 'الكورس غير موجود'
      });
    }

    // Check if user is already enrolled
    const user = await User.findById(userId);
    if (user.enrolledCourses.includes(courseId)) {
      return res.status(400).json({
        error: 'Already enrolled in this course',
        arabic: 'أنت مسجل بالفعل في هذا الكورس'
      });
    }

    // Calculate amount (with potential discount)
    let amount = course.price;
    let discountAmount = 0;
    
    // TODO: Implement coupon validation logic here
    if (couponCode) {
      // For now, just a placeholder
      // In real implementation, validate coupon and calculate discount
    }

    // For now, create a mock order ID for testing
    const mockOrderId = `mock_order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // In a real implementation, this would create a PayPal order
    // For testing purposes, we'll simulate the order creation
    const order = {
      id: mockOrderId,
      links: [{
        rel: 'approve',
        href: `${process.env.CLIENT_URL}/payment/success?paymentId=${mockOrderId}&PayerID=mock_payer`
      }]
    };

    // Create order record in database
    const orderRecord = new Order({
      userId,
      userEmail: req.user.email,
      userName: req.user.displayName,
      courseId,
      courseTitle: course.title,
      amount,
      originalAmount: course.originalPrice || course.price,
      currency: course.currency,
      status: 'pending',
      paymentMethod: 'paypal',
      paymentIntentId: order.id,
      couponCode: couponCode || null,
      discountAmount,
      taxAmount: 0
    });

    await orderRecord.save();

    res.json({
      success: true,
      orderId: order.id,
      approvalUrl: order.links.find(link => link.rel === 'approve').href
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

    // For testing, simulate a successful capture
    // In a real implementation, this would capture the PayPal order
    const capture = {
      status: 'COMPLETED',
      id: `capture_${orderId}`
    };

    if (capture.status === 'COMPLETED') {
      // Update order status
      orderRecord.status = 'completed';
      orderRecord.completedAt = new Date();
      orderRecord.transactionId = capture.id;
      await orderRecord.save();

      // Enroll user in course
      const user = await User.findById(req.user._id);
      if (!user.enrolledCourses.includes(orderRecord.courseId)) {
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

      res.json({
        success: true,
        message: 'Payment completed successfully',
        arabic: 'تم إتمام الدفع بنجاح',
        order: orderRecord,
        course: course
      });
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

module.exports = router;
