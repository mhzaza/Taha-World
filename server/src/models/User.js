const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  displayName: {
    type: String,
    required: [true, 'Display name is required'],
    trim: true,
    maxlength: [50, 'Display name cannot exceed 50 characters']
  },
  avatar: {
    type: String,
    default: null
  },
  phone: {
    type: String,
    trim: true,
    default: null
  },
  location: {
    type: String,
    trim: true,
    default: null
  },
  birthDate: {
    type: Date,
    default: null
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters'],
    default: null
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    default: null
  },
  fitnessLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  goals: [{
    type: String,
    trim: true
  }],
  enrolledCourses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  completedLessons: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson'
  }],
  certificates: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Certificate'
  }],
  subscription: {
    type: {
      type: String,
      enum: ['free', 'premium', 'pro'],
      default: 'free'
    },
    expiresAt: {
      type: Date,
      default: null
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String,
    default: null
  },
  passwordResetToken: {
    type: String,
    default: null
  },
  passwordResetExpires: {
    type: Date,
    default: null
  },
  lastLoginAt: {
    type: Date,
    default: null
  },
  provider: {
    type: String,
    enum: ['email', 'google', 'facebook'],
    default: 'email'
  },
  providerId: {
    type: String,
    default: null
  },
  // Admin fields
  isAdmin: {
    type: Boolean,
    default: false
  },
  adminRole: {
    type: String,
    enum: ['super_admin', 'admin', 'moderator'],
    default: null
  },
  adminPermissions: [{
    type: String,
    enum: [
      'courses.create', 'courses.edit', 'courses.delete',
      'users.manage', 'orders.view', 'analytics.view'
    ]
  }],
  totalSpent: {
    type: Number,
    default: 0
  },
  notes: {
    type: String,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
userSchema.index({ email: 1 });
userSchema.index({ isAdmin: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ createdAt: -1 });

// Virtual for user's full profile completion
userSchema.virtual('profileCompletion').get(function() {
  let completion = 0;
  const fields = ['displayName', 'phone', 'location', 'birthDate', 'bio', 'gender', 'fitnessLevel'];
  fields.forEach(field => {
    if (this[field]) completion += 1;
  });
  return Math.round((completion / fields.length) * 100);
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to check if user is admin
userSchema.methods.isUserAdmin = function() {
  return this.isAdmin || this.adminRole;
};

// Instance method to check admin permissions
userSchema.methods.hasPermission = function(permission) {
  if (!this.isAdmin && !this.adminRole) return false;
  if (this.adminRole === 'super_admin') return true;
  return this.adminPermissions && this.adminPermissions.includes(permission);
};

// Static method to find admin users
userSchema.statics.findAdmins = function() {
  return this.find({ 
    $or: [
      { isAdmin: true },
      { adminRole: { $exists: true, $ne: null } }
    ]
  });
};

// Static method to get user statistics
userSchema.statics.getUserStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        activeUsers: { $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] } },
        verifiedUsers: { $sum: { $cond: [{ $eq: ['$emailVerified', true] }, 1, 0] } },
        totalRevenue: { $sum: '$totalSpent' }
      }
    }
  ]);
  
  return stats[0] || {
    totalUsers: 0,
    activeUsers: 0,
    verifiedUsers: 0,
    totalRevenue: 0
  };
};

module.exports = mongoose.model('User', userSchema);
