const express = require('express');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { generateToken, generateRefreshToken, authenticate, authRateLimit } = require('../middleware/auth');
const { sendEmail } = require('../utils/email');
const crypto = require('crypto');

const router = express.Router();

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: authRateLimit.windowMs,
  max: authRateLimit.login,
  message: {
    error: 'Too many login attempts, please try again later.',
    arabic: 'تم تجاوز عدد محاولات تسجيل الدخول المسموح، حاول مرة أخرى لاحقاً'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Validation rules
const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('displayName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Display name must be between 2 and 50 characters')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', authLimiter, registerValidation, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        arabic: 'فشل في التحقق من البيانات',
        details: errors.array()
      });
    }

    const { email, password, displayName, phone, location, birthDate, bio, gender, fitnessLevel, goals } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        error: 'User already exists with this email',
        arabic: 'يوجد مستخدم بالفعل بهذا البريد الإلكتروني'
      });
    }

    // Create user
    const user = await User.create({
      email,
      password,
      displayName,
      phone,
      location,
      birthDate,
      bio,
      gender,
      fitnessLevel,
      goals: goals || []
    });

    // Generate tokens
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Generate email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = emailVerificationToken;
    await user.save();

    // Send verification email
    try {
      const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${emailVerificationToken}`;
      await sendEmail({
        to: user.email,
        subject: 'تأكيد البريد الإلكتروني - عالم طه',
        html: `
          <h2>مرحباً ${user.displayName}!</h2>
          <p>شكراً لانضمامك إلى عالم طه. يرجى النقر على الرابط أدناه لتأكيد بريدك الإلكتروني:</p>
          <a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">تأكيد البريد الإلكتروني</a>
          <p>إذا لم تطلب هذا التأكيد، يمكنك تجاهل هذا البريد.</p>
        `
      });
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      // Don't fail registration if email sending fails
    }

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.emailVerificationToken;

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      arabic: 'تم تسجيل المستخدم بنجاح',
      token,
      refreshToken,
      user: userResponse
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Internal server error during registration',
      arabic: 'خطأ داخلي في الخادم أثناء التسجيل'
    });
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', authLimiter, loginValidation, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        arabic: 'فشل في التحقق من البيانات',
        details: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials',
        arabic: 'بيانات الاعتماد غير صحيحة'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        error: 'Account is deactivated',
        arabic: 'الحساب معطل'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid credentials',
        arabic: 'بيانات الاعتماد غير صحيحة'
      });
    }

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    // Generate tokens
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      success: true,
      message: 'Login successful',
      arabic: 'تم تسجيل الدخول بنجاح',
      token,
      refreshToken,
      user: userResponse
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Internal server error during login',
      arabic: 'خطأ داخلي في الخادم أثناء تسجيل الدخول'
    });
  }
});

// @desc    Refresh token
// @route   POST /api/auth/refresh
// @access  Public
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        error: 'Refresh token is required',
        arabic: 'رمز التحديث مطلوب'
      });
    }

    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      const user = await User.findById(decoded.userId);

      if (!user || !user.isActive) {
        return res.status(401).json({
          error: 'Invalid refresh token',
          arabic: 'رمز التحديث غير صالح'
        });
      }

      // Generate new tokens
      const newToken = generateToken(user._id);
      const newRefreshToken = generateRefreshToken(user._id);

      res.json({
        success: true,
        token: newToken,
        refreshToken: newRefreshToken
      });

    } catch (error) {
      return res.status(401).json({
        error: 'Invalid refresh token',
        arabic: 'رمز التحديث غير صالح'
      });
    }

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      error: 'Internal server error during token refresh',
      arabic: 'خطأ داخلي في الخادم أثناء تحديث الرمز'
    });
  }
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', authenticate, async (req, res) => {
  try {
    res.json({
      success: true,
      user: req.user
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      error: 'Internal server error',
      arabic: 'خطأ داخلي في الخادم'
    });
  }
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', authenticate, async (req, res) => {
  try {
    // In a stateless JWT system, logout is handled client-side
    // But we can log the logout action for audit purposes
    res.json({
      success: true,
      message: 'Logout successful',
      arabic: 'تم تسجيل الخروج بنجاح'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Internal server error during logout',
      arabic: 'خطأ داخلي في الخادم أثناء تسجيل الخروج'
    });
  }
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email')
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

    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user exists or not
      return res.json({
        success: true,
        message: 'If an account with that email exists, we have sent a password reset link',
        arabic: 'إذا كان هناك حساب بهذا البريد الإلكتروني، فقد أرسلنا رابط إعادة تعيين كلمة المرور'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // Send reset email
    try {
      const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
      await sendEmail({
        to: user.email,
        subject: 'إعادة تعيين كلمة المرور - عالم طه',
        html: `
          <h2>إعادة تعيين كلمة المرور</h2>
          <p>مرحباً ${user.displayName},</p>
          <p>لقد طلبت إعادة تعيين كلمة المرور لحسابك. يرجى النقر على الرابط أدناه لإعادة تعيين كلمة المرور:</p>
          <a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">إعادة تعيين كلمة المرور</a>
          <p>هذا الرابط صالح لمدة 10 دقائق فقط.</p>
          <p>إذا لم تطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذا البريد.</p>
        `
      });

      res.json({
        success: true,
        message: 'Password reset email sent',
        arabic: 'تم إرسال بريد إعادة تعيين كلمة المرور'
      });

    } catch (emailError) {
      console.error('Email sending error:', emailError);
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();

      res.status(500).json({
        error: 'Failed to send password reset email',
        arabic: 'فشل في إرسال بريد إعادة تعيين كلمة المرور'
      });
    }

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      error: 'Internal server error',
      arabic: 'خطأ داخلي في الخادم'
    });
  }
});

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
router.post('/reset-password', [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
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

    const { token, password } = req.body;

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        error: 'Invalid or expired reset token',
        arabic: 'رمز إعادة التعيين غير صالح أو منتهي الصلاحية'
      });
    }

    // Update password
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successful',
      arabic: 'تم إعادة تعيين كلمة المرور بنجاح'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      error: 'Internal server error',
      arabic: 'خطأ داخلي في الخادم'
    });
  }
});

// @desc    Verify email
// @route   POST /api/auth/verify-email
// @access  Public
router.post('/verify-email', [
  body('token').notEmpty().withMessage('Verification token is required')
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

    const { token } = req.body;

    const user = await User.findOne({ emailVerificationToken: token });

    if (!user) {
      return res.status(400).json({
        error: 'Invalid verification token',
        arabic: 'رمز التحقق غير صالح'
      });
    }

    // Verify email
    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Email verified successfully',
      arabic: 'تم تأكيد البريد الإلكتروني بنجاح'
    });

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      error: 'Internal server error',
      arabic: 'خطأ داخلي في الخادم'
    });
  }
});

module.exports = router;
