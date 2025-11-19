const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('../src/models/User');
const Course = require('../src/models/Course');
const Review = require('../src/models/Review');
const Consultation = require('../src/models/Consultation');
const Coupon = require('../src/models/Coupon');
// Keep Order model but don't delete orders
// const Order = require('../src/models/Order');

async function cleanupDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find and preserve admin user
    const adminUser = await User.findOne({ isAdmin: true });
    if (!adminUser) {
      console.log('❌ No admin user found! Please create an admin user first.');
      process.exit(1);
    }

    console.log(`📋 Found admin user: ${adminUser.email}`);
    console.log('🧹 Starting database cleanup...');

    // Delete all non-admin users
    const deletedUsers = await User.deleteMany({ 
      _id: { $ne: adminUser._id },
      isAdmin: { $ne: true }
    });
    console.log(`🗑️  Deleted ${deletedUsers.deletedCount} regular users`);

    // Delete all courses
    const deletedCourses = await Course.deleteMany({});
    console.log(`🗑️  Deleted ${deletedCourses.deletedCount} courses`);

    // Delete all reviews
    const deletedReviews = await Review.deleteMany({});
    console.log(`🗑️  Deleted ${deletedReviews.deletedCount} reviews`);

    // Delete all consultations
    const deletedConsultations = await Consultation.deleteMany({});
    console.log(`🗑️  Deleted ${deletedConsultations.deletedCount} consultations`);

    // Delete all coupons
    const deletedCoupons = await Coupon.deleteMany({});
    console.log(`🗑️  Deleted ${deletedCoupons.deletedCount} coupons`);

    // Note: We're keeping orders and payment data intact as requested
    console.log('💰 Orders and payment data preserved');

    console.log('✅ Database cleanup completed successfully!');
    console.log(`👤 Admin user preserved: ${adminUser.email}`);
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the cleanup
cleanupDatabase();
