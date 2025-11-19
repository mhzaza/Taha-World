const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Course = require('../src/models/Course');

async function updateLessonWithHLS() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find the arm wrestling course
    const course = await Course.findOne({ slug: 'arm-wrestling-zero-to-pro' });
    
    if (!course) {
      console.log('❌ Arm wrestling course not found!');
      process.exit(1);
    }

    console.log(`📋 Found course: ${course.title}`);
    console.log(`📚 Current lessons: ${course.lessons.length}`);

    // Update the first lesson with your Bunny.net HLS URL
    if (course.lessons.length > 0) {
      const firstLesson = course.lessons[0];
      console.log(`🎯 Updating lesson: ${firstLesson.title}`);
      
      // Update with your HLS URL
      firstLesson.videoUrl = 'https://vz-f98cc31d-808.b-cdn.net/75931071-35e9-4c7e-aa1a-06823ac288ec/playlist.m3u8';
      
      await course.save();
      
      console.log('✅ Lesson updated successfully!');
      console.log(`🎬 New video URL: ${firstLesson.videoUrl}`);
      console.log('🔄 The video player now supports HLS streams from Bunny.net!');
    } else {
      console.log('❌ No lessons found in the course!');
    }

  } catch (error) {
    console.error('❌ Error updating lesson:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

updateLessonWithHLS();
