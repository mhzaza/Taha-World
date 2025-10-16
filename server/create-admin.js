const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Simple user schema for creating admin
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  displayName: String,
  isAdmin: Boolean,
  isActive: Boolean,
  emailVerified: Boolean,
  createdAt: Date
});

const User = mongoose.model('User', userSchema);

async function createAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb+srv://taha:123456789@cluster0.mongodb.net/taha-world?retryWrites=true&w=majority');
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@taha-world.com' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const adminUser = new User({
      email: 'admin@taha-world.com',
      password: hashedPassword,
      displayName: 'Admin User',
      isAdmin: true,
      isActive: true,
      emailVerified: true,
      createdAt: new Date()
    });

    await adminUser.save();
    console.log('Admin user created successfully:', adminUser.email);
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
}

createAdmin();
