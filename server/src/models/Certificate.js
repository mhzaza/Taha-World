const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  courseTitle: {
    type: String,
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  issuedAt: {
    type: Date,
    default: Date.now
  },
  verificationCode: {
    type: String,
    unique: true,
    required: true
  },
  certificateUrl: {
    type: String,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
certificateSchema.index({ userId: 1, courseId: 1 }, { unique: true });
certificateSchema.index({ verificationCode: 1 });

// Static method to generate verification code
certificateSchema.statics.generateVerificationCode = async function() {
  let code;
  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 10;

  while (!isUnique && attempts < maxAttempts) {
    // Generate a more robust verification code
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 10; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    // Check if this code already exists
    const existing = await this.findOne({ verificationCode: result });
    if (!existing) {
      code = result;
      isUnique = true;
    }
    attempts++;
  }

  if (!isUnique) {
    // Fallback: use timestamp-based code if we can't generate a unique one
    const timestamp = Date.now().toString(36).toUpperCase();
    const randomPart = Math.random().toString(36).substr(2, 5).toUpperCase();
    code = `CERT${timestamp}${randomPart}`;
  }

  return code;
};

module.exports = mongoose.model('Certificate', certificateSchema);
