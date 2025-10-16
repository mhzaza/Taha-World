const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for debugging
  console.error('Error Handler:', err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { message, statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field} already exists`;
    error = { message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { message, statusCode: 400 };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = { message, statusCode: 401 };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = { message, statusCode: 401 };
  }

  // Default error response
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  // Arabic error messages
  const arabicMessages = {
    'Resource not found': 'المورد غير موجود',
    'already exists': 'موجود بالفعل',
    'Invalid token': 'رمز مصادقة غير صالح',
    'Token expired': 'انتهت صلاحية رمز المصادقة',
    'Internal Server Error': 'خطأ داخلي في الخادم',
    'Access denied': 'تم رفض الوصول',
    'Authentication required': 'المصادقة مطلوبة',
    'Email is required': 'البريد الإلكتروني مطلوب',
    'Password is required': 'كلمة المرور مطلوبة',
    'Display name is required': 'اسم العرض مطلوب',
    'Course title is required': 'عنوان الدورة مطلوب',
    'Course description is required': 'وصف الدورة مطلوب'
  };

  const arabicMessage = arabicMessages[message] || 'حدث خطأ غير متوقع';

  res.status(statusCode).json({
    success: false,
    error: message,
    arabic: arabicMessage,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
