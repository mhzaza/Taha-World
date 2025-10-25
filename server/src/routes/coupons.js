const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon');
const { authenticate, authenticateAdmin } = require('../middleware/auth');

// Simple isAdmin middleware (user must already be authenticated)
const isAdmin = (req, res, next) => {
  if (!req.user || (!req.user.isAdmin && !req.user.adminRole)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.',
      arabic: 'تم رفض الوصول. صلاحيات المدير مطلوبة.'
    });
  }
  next();
};

// Validate coupon code (for users during checkout)
router.post('/validate', authenticate, async (req, res) => {
  try {
    const { code, courseId, consultationId, purchaseAmount } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code is required',
        arabic: 'يرجى إدخال كود الخصم'
      });
    }

    if (!purchaseAmount || purchaseAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Purchase amount is required',
        arabic: 'مبلغ الشراء مطلوب'
      });
    }

    // Find coupon
    const coupon = await Coupon.findOne({ 
      code: code.toUpperCase() 
    }).populate('specificCourses specificConsultations');

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found',
        arabic: 'كود الخصم غير موجود'
      });
    }

    // Check if coupon is valid
    if (!coupon.isValid()) {
      return res.status(400).json({
        success: false,
        message: 'Coupon is expired or inactive',
        arabic: 'كود الخصم منتهي الصلاحية أو غير نشط'
      });
    }

    // Check if user has already used this coupon
    if (coupon.hasUserUsed(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'You have already used this coupon',
        arabic: 'لقد استخدمت هذا الكود من قبل'
      });
    }

    // Check minimum purchase amount
    if (coupon.minPurchaseAmount && purchaseAmount < coupon.minPurchaseAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum purchase amount is ${coupon.minPurchaseAmount}`,
        arabic: `الحد الأدنى للشراء هو ${coupon.minPurchaseAmount}`
      });
    }

    // Check applicability
    if (coupon.applicableTo === 'specific') {
      if (courseId && !coupon.specificCourses.some(c => c._id.toString() === courseId)) {
        return res.status(400).json({
          success: false,
          message: 'This coupon is not applicable to this course',
          arabic: 'هذا الكود غير قابل للتطبيق على هذه الدورة'
        });
      }
      if (consultationId && !coupon.specificConsultations.some(c => c._id.toString() === consultationId)) {
        return res.status(400).json({
          success: false,
          message: 'This coupon is not applicable to this consultation',
          arabic: 'هذا الكود غير قابل للتطبيق على هذه الاستشارة'
        });
      }
    } else if (coupon.applicableTo === 'courses' && consultationId) {
      return res.status(400).json({
        success: false,
        message: 'This coupon is only for courses',
        arabic: 'هذا الكود للدورات فقط'
      });
    } else if (coupon.applicableTo === 'consultations' && courseId) {
      return res.status(400).json({
        success: false,
        message: 'This coupon is only for consultations',
        arabic: 'هذا الكود للاستشارات فقط'
      });
    }

    res.json({
      success: true,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        minPurchaseAmount: coupon.minPurchaseAmount
      }
    });
  } catch (error) {
    console.error('Validate coupon error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      arabic: 'خطأ في الخادم'
    });
  }
});

// Create coupon (Admin only)
router.post('/', authenticate, isAdmin, async (req, res) => {
  try {
    const {
      code,
      discountType,
      discountValue,
      maxUses,
      validUntil,
      applicableTo,
      specificCourses,
      specificConsultations,
      minPurchaseAmount
    } = req.body;

    // Validation
    if (!code || !discountType || !discountValue || !validUntil) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        arabic: 'يرجى ملء جميع الحقول المطلوبة'
      });
    }

    // Check if coupon code already exists
    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code already exists',
        arabic: 'كود الخصم موجود بالفعل'
      });
    }

    const coupon = new Coupon({
      code: code.toUpperCase(),
      discountType,
      discountValue,
      maxUses: maxUses || null,
      validUntil,
      applicableTo: applicableTo || 'all',
      specificCourses: specificCourses || [],
      specificConsultations: specificConsultations || [],
      minPurchaseAmount: minPurchaseAmount || 0,
      createdBy: req.user._id
    });

    await coupon.save();

    res.status(201).json({
      success: true,
      message: 'Coupon created successfully',
      arabic: 'تم إنشاء كود الخصم بنجاح',
      coupon
    });
  } catch (error) {
    console.error('Create coupon error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      arabic: 'خطأ في الخادم'
    });
  }
});

// Get all coupons (Admin only)
router.get('/', authenticate, isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, active } = req.query;

    const query = {};
    if (active !== undefined) {
      query.isActive = active === 'true';
    }

    const coupons = await Coupon.find(query)
      .populate('createdBy', 'displayName email')
      .populate('specificCourses', 'title')
      .populate('specificConsultations', 'title')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Coupon.countDocuments(query);

    res.json({
      success: true,
      coupons,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get coupons error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get single coupon (Admin only)
router.get('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id)
      .populate('createdBy', 'displayName email')
      .populate('specificCourses', 'title')
      .populate('specificConsultations', 'title')
      .populate('usedBy.userId', 'displayName email');

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }

    res.json({
      success: true,
      coupon
    });
  } catch (error) {
    console.error('Get coupon error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Update coupon (Admin only)
router.put('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const {
      discountType,
      discountValue,
      maxUses,
      validUntil,
      isActive,
      applicableTo,
      specificCourses,
      specificConsultations,
      minPurchaseAmount
    } = req.body;

    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found',
        arabic: 'كود الخصم غير موجود'
      });
    }

    // Update fields
    if (discountType) coupon.discountType = discountType;
    if (discountValue !== undefined) coupon.discountValue = discountValue;
    if (maxUses !== undefined) coupon.maxUses = maxUses;
    if (validUntil) coupon.validUntil = validUntil;
    if (isActive !== undefined) coupon.isActive = isActive;
    if (applicableTo) coupon.applicableTo = applicableTo;
    if (specificCourses) coupon.specificCourses = specificCourses;
    if (specificConsultations) coupon.specificConsultations = specificConsultations;
    if (minPurchaseAmount !== undefined) coupon.minPurchaseAmount = minPurchaseAmount;

    await coupon.save();

    res.json({
      success: true,
      message: 'Coupon updated successfully',
      arabic: 'تم تحديث كود الخصم بنجاح',
      coupon
    });
  } catch (error) {
    console.error('Update coupon error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      arabic: 'خطأ في الخادم'
    });
  }
});

// Delete coupon (Admin only)
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found',
        arabic: 'كود الخصم غير موجود'
      });
    }

    res.json({
      success: true,
      message: 'Coupon deleted successfully',
      arabic: 'تم حذف كود الخصم بنجاح'
    });
  } catch (error) {
    console.error('Delete coupon error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      arabic: 'خطأ في الخادم'
    });
  }
});

// Get coupon statistics (Admin only)
router.get('/stats/overview', authenticate, isAdmin, async (req, res) => {
  try {
    const totalCoupons = await Coupon.countDocuments();
    const activeCoupons = await Coupon.countDocuments({ isActive: true });
    const expiredCoupons = await Coupon.countDocuments({ validUntil: { $lt: new Date() } });
    
    const mostUsedCoupons = await Coupon.find()
      .sort({ usedCount: -1 })
      .limit(5)
      .select('code usedCount discountType discountValue');

    res.json({
      success: true,
      stats: {
        totalCoupons,
        activeCoupons,
        expiredCoupons,
        mostUsedCoupons
      }
    });
  } catch (error) {
    console.error('Get coupon stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;

