const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// Generate refresh token
const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d',
  });
};

// Verify JWT token
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

// Verify refresh token
const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};

// Authentication middleware
const authenticate = async (req, res, next) => {
  try {
    let token;

    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        error: 'Access denied. No token provided.',
        arabic: 'تم رفض الوصول. لم يتم توفير رمز المصادقة.'
      });
    }

    try {
      // Verify token
      const decoded = verifyToken(token);
      
      // Get user from database
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user) {
        return res.status(401).json({
          error: 'Token is not valid. User not found.',
          arabic: 'رمز المصادقة غير صالح. المستخدم غير موجود.'
        });
      }

      if (!user.isActive) {
        return res.status(401).json({
          error: 'Account is deactivated.',
          arabic: 'الحساب معطل.'
        });
      }

      // Add user to request object
      req.user = user;
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          error: 'Token has expired.',
          arabic: 'انتهت صلاحية رمز المصادقة.'
        });
      } else if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          error: 'Invalid token.',
          arabic: 'رمز مصادقة غير صالح.'
        });
      } else {
        return res.status(401).json({
          error: 'Token verification failed.',
          arabic: 'فشل في التحقق من رمز المصادقة.'
        });
      }
    }
  } catch (error) {
    console.error('Authentication middleware error:', error);
    return res.status(500).json({
      error: 'Internal server error during authentication.',
      arabic: 'خطأ داخلي في الخادم أثناء المصادقة.'
    });
  }
};

// Admin authentication middleware
const authenticateAdmin = async (req, res, next) => {
  try {
    let token;

    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        error: 'Access denied. No token provided.',
        arabic: 'تم رفض الوصول. لم يتم توفير رمز المصادقة.'
      });
    }

    try {
      // Verify token
      const decoded = verifyToken(token);
      
      // Get user from database
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user) {
        return res.status(401).json({
          error: 'Token is not valid. User not found.',
          arabic: 'رمز المصادقة غير صالح. المستخدم غير موجود.'
        });
      }

      if (!user.isActive) {
        return res.status(401).json({
          error: 'Account is deactivated.',
          arabic: 'الحساب معطل.'
        });
      }

      // Check if user is admin
      if (!user.isAdmin && !user.adminRole) {
        return res.status(403).json({
          error: 'Access denied. Admin privileges required.',
          arabic: 'تم رفض الوصول. صلاحيات المدير مطلوبة.'
        });
      }

      // Add user to request object
      req.user = user;
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          error: 'Token has expired.',
          arabic: 'انتهت صلاحية رمز المصادقة.'
        });
      } else if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          error: 'Invalid token.',
          arabic: 'رمز مصادقة غير صالح.'
        });
      } else {
        return res.status(401).json({
          error: 'Token verification failed.',
          arabic: 'فشل في التحقق من رمز المصادقة.'
        });
      }
    }
  } catch (error) {
    console.error('Admin authentication middleware error:', error);
    return res.status(500).json({
      error: 'Internal server error during admin authentication.',
      arabic: 'خطأ داخلي في الخادم أثناء مصادقة المدير.'
    });
  }
};

// Optional authentication middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = verifyToken(token);
        const user = await User.findById(decoded.userId).select('-password');
        
        if (user && user.isActive) {
          req.user = user;
        }
      } catch (error) {
        // Token is invalid, but we don't fail the request
        console.log('Invalid token in optional auth:', error.message);
      }
    }

    next();
  } catch (error) {
    console.error('Optional authentication middleware error:', error);
    next(); // Continue even if there's an error
  }
};

// Permission-based middleware factory
const requirePermission = (permission) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Authentication required.',
          arabic: 'المصادقة مطلوبة.'
        });
      }

      if (!req.user.hasPermission(permission)) {
        return res.status(403).json({
          error: `Access denied. Permission '${permission}' required.`,
          arabic: `تم رفض الوصول. الصلاحية '${permission}' مطلوبة.`
        });
      }

      next();
    } catch (error) {
      console.error('Permission middleware error:', error);
      return res.status(500).json({
        error: 'Internal server error during permission check.',
        arabic: 'خطأ داخلي في الخادم أثناء فحص الصلاحيات.'
      });
    }
  };
};

// Role-based middleware factory
const requireRole = (roles) => {
  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Authentication required.',
          arabic: 'المصادقة مطلوبة.'
        });
      }

      if (!allowedRoles.includes(req.user.adminRole)) {
        return res.status(403).json({
          error: `Access denied. Role '${req.user.adminRole}' not authorized.`,
          arabic: `تم رفض الوصول. الدور '${req.user.adminRole}' غير مخول.`
        });
      }

      next();
    } catch (error) {
      console.error('Role middleware error:', error);
      return res.status(500).json({
        error: 'Internal server error during role check.',
        arabic: 'خطأ داخلي في الخادم أثناء فحص الدور.'
      });
    }
  };
};

// Rate limiting for authentication endpoints
const authRateLimit = {
  login: 5, // 5 attempts per window
  register: 3, // 3 attempts per window
  passwordReset: 3, // 3 attempts per window
  windowMs: 15 * 60 * 1000, // 15 minutes
};

// Middleware to check if user owns resource or is admin
const authorizeResource = (resourceParam = 'userId') => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Authentication required.',
          arabic: 'المصادقة مطلوبة.'
        });
      }

      const resourceUserId = req.params[resourceParam] || req.body[resourceParam];
      
      // Admin can access any resource
      if (req.user.isAdmin || req.user.adminRole) {
        return next();
      }

      // User can only access their own resources
      if (req.user._id.toString() !== resourceUserId) {
        return res.status(403).json({
          error: 'Access denied. You can only access your own resources.',
          arabic: 'تم رفض الوصول. يمكنك الوصول فقط إلى مواردك الخاصة.'
        });
      }

      next();
    } catch (error) {
      console.error('Resource authorization middleware error:', error);
      return res.status(500).json({
        error: 'Internal server error during resource authorization.',
        arabic: 'خطأ داخلي في الخادم أثناء تفويض المورد.'
      });
    }
  };
};

module.exports = {
  generateToken,
  generateRefreshToken,
  verifyToken,
  verifyRefreshToken,
  authenticate,
  authenticateAdmin,
  optionalAuth,
  requirePermission,
  requireRole,
  authorizeResource,
  authRateLimit
};
