const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  adminEmail: {
    type: String,
    required: [true, 'Admin email is required'],
    lowercase: true,
    trim: true
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  action: {
    type: String,
    required: [true, 'Action is required'],
    trim: true,
    enum: [
      // User actions
      'user.create', 'user.update', 'user.delete', 'user.suspend', 'user.activate', 'users.list',
      // Course actions
      'course.create', 'course.update', 'course.delete', 'course.publish', 'course.unpublish',
      // Lesson actions
      'lesson.create', 'lesson.update', 'lesson.delete', 'lesson.reorder',
      // Order actions
      'order.create', 'order.update', 'order.refund', 'order.cancel',
      // System actions
      'login', 'logout', 'password.reset', 'settings.update',
      // Access control
      'unauthorized_access_attempt', 'permission_denied',
      // Analytics
      'analytics.view', 'reports.generate'
    ]
  },
  target: {
    type: String,
    required: [true, 'Target is required'],
    trim: true
  },
  targetId: {
    type: String,
    default: null,
    trim: true
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ip: {
    type: String,
    default: null
  },
  userAgent: {
    type: String,
    default: null
  },
  // Additional context
  resource: {
    type: String,
    enum: ['user', 'course', 'order', 'system', 'analytics'],
    default: 'system'
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'low'
  },
  // Location information (if available)
  location: {
    country: String,
    region: String,
    city: String
  },
  // Session information
  sessionId: {
    type: String,
    default: null
  },
  // Request information
  requestId: {
    type: String,
    default: null
  },
  method: {
    type: String,
    enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    default: null
  },
  endpoint: {
    type: String,
    default: null
  },
  statusCode: {
    type: Number,
    default: null
  },
  responseTime: {
    type: Number, // in milliseconds
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
auditLogSchema.index({ adminEmail: 1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ target: 1 });
auditLogSchema.index({ resource: 1 });
auditLogSchema.index({ severity: 1 });
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ ip: 1 });

// Compound indexes for common queries
auditLogSchema.index({ adminEmail: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ resource: 1, severity: 1 });

// Virtual for formatted timestamp
auditLogSchema.virtual('formattedTimestamp').get(function() {
  return this.createdAt.toISOString();
});

// Virtual for human-readable action
auditLogSchema.virtual('humanReadableAction').get(function() {
  const actionMap = {
    'user.create': 'Create User',
    'user.update': 'Update User',
    'user.delete': 'Delete User',
    'user.suspend': 'Suspend User',
    'user.activate': 'Activate User',
    'users.list': 'List Users',
    'course.create': 'Create Course',
    'course.update': 'Update Course',
    'course.delete': 'Delete Course',
    'course.publish': 'Publish Course',
    'course.unpublish': 'Unpublish Course',
    'lesson.create': 'Create Lesson',
    'lesson.update': 'Update Lesson',
    'lesson.delete': 'Delete Lesson',
    'lesson.reorder': 'Reorder Lessons',
    'order.create': 'Create Order',
    'order.update': 'Update Order',
    'order.refund': 'Refund Order',
    'order.cancel': 'Cancel Order',
    'login': 'Login',
    'logout': 'Logout',
    'password.reset': 'Password Reset',
    'settings.update': 'Update Settings',
    'unauthorized_access_attempt': 'Unauthorized Access Attempt',
    'permission_denied': 'Permission Denied',
    'analytics.view': 'View Analytics',
    'reports.generate': 'Generate Report'
  };
  
  return actionMap[this.action] || this.action;
});

// Pre-save middleware to set severity based on action
auditLogSchema.pre('save', function(next) {
  const highSeverityActions = [
    'user.delete', 'course.delete', 'unauthorized_access_attempt',
    'password.reset', 'settings.update'
  ];
  
  const mediumSeverityActions = [
    'user.suspend', 'user.activate', 'course.publish', 'course.unpublish',
    'order.refund', 'order.cancel'
  ];
  
  if (highSeverityActions.includes(this.action)) {
    this.severity = 'high';
  } else if (mediumSeverityActions.includes(this.action)) {
    this.severity = 'medium';
  }
  
  next();
});

// Static method to get audit logs by admin
auditLogSchema.statics.getByAdmin = function(adminEmail, limit = 50) {
  return this.find({ adminEmail })
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to get audit logs by action
auditLogSchema.statics.getByAction = function(action, limit = 50) {
  return this.find({ action })
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to get audit logs by date range
auditLogSchema.statics.getByDateRange = function(startDate, endDate) {
  return this.find({
    createdAt: {
      $gte: startDate,
      $lte: endDate
    }
  }).sort({ createdAt: -1 });
};

// Static method to get security-related logs
auditLogSchema.statics.getSecurityLogs = function(limit = 100) {
  return this.find({
    $or: [
      { action: 'unauthorized_access_attempt' },
      { action: 'permission_denied' },
      { severity: { $in: ['high', 'critical'] } }
    ]
  })
  .sort({ createdAt: -1 })
  .limit(limit);
};

// Static method to get audit statistics
auditLogSchema.statics.getAuditStats = async function(startDate, endDate) {
  const matchStage = {};
  
  if (startDate && endDate) {
    matchStage.createdAt = {
      $gte: startDate,
      $lte: endDate
    };
  }
  
  const stats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalActions: { $sum: 1 },
        uniqueAdmins: { $addToSet: '$adminEmail' },
        highSeverityActions: {
          $sum: { $cond: [{ $eq: ['$severity', 'high'] }, 1, 0] }
        },
        criticalActions: {
          $sum: { $cond: [{ $eq: ['$severity', 'critical'] }, 1, 0] }
        },
        unauthorizedAttempts: {
          $sum: { $cond: [{ $eq: ['$action', 'unauthorized_access_attempt'] }, 1, 0] }
        }
      }
    },
    {
      $project: {
        totalActions: 1,
        uniqueAdmins: { $size: '$uniqueAdmins' },
        highSeverityActions: 1,
        criticalActions: 1,
        unauthorizedAttempts: 1
      }
    }
  ]);
  
  return stats[0] || {
    totalActions: 0,
    uniqueAdmins: 0,
    highSeverityActions: 0,
    criticalActions: 0,
    unauthorizedAttempts: 0
  };
};

// Static method to get activity summary by admin
auditLogSchema.statics.getAdminActivity = async function(startDate, endDate) {
  const matchStage = {};
  
  if (startDate && endDate) {
    matchStage.createdAt = {
      $gte: startDate,
      $lte: endDate
    };
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$adminEmail',
        totalActions: { $sum: 1 },
        actions: { $push: '$action' },
        lastActivity: { $max: '$createdAt' },
        resources: { $addToSet: '$resource' },
        severityCount: {
          $push: {
            severity: '$severity',
            action: '$action'
          }
        }
      }
    },
    {
      $project: {
        adminEmail: '$_id',
        totalActions: 1,
        lastActivity: 1,
        resources: 1,
        uniqueActions: { $size: { $setUnion: '$actions' } },
        highSeverityCount: {
          $size: {
            $filter: {
              input: '$severityCount',
              cond: { $eq: ['$$this.severity', 'high'] }
            }
          }
        }
      }
    },
    { $sort: { totalActions: -1 } }
  ]);
};

module.exports = mongoose.model('AuditLog', auditLogSchema);
