const mongoose = require('mongoose');
require('dotenv').config();

async function testDatabaseConnection() {
  try {
    console.log('🔗 Testing MongoDB Atlas connection...');
    
    // Validate environment variables
    if (!process.env.MONGODB_URI) {
      throw new Error('❌ MONGODB_URI environment variable is not set');
    }

    console.log('📊 Database URI:', process.env.MONGODB_URI.replace(/\/\/.*@/, '//***:***@')); // Hide credentials
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB Atlas successfully');
    console.log('🏷️ Database Name:', mongoose.connection.db.databaseName);
    console.log('🌐 Host:', mongoose.connection.host);
    console.log('🔌 Port:', mongoose.connection.port);

    // Test database ping
    await mongoose.connection.db.admin().ping();
    console.log('🏓 Database ping successful');

    // Test basic operations
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📚 Collections in database:', collections.map(c => c.name));

    // Test write operation
    const testCollection = mongoose.connection.db.collection('test_connection');
    await testCollection.insertOne({ 
      test: true, 
      timestamp: new Date(),
      message: 'Connection test successful'
    });
    console.log('✏️ Write test successful');

    // Test read operation
    const result = await testCollection.findOne({ test: true });
    if (result) {
      console.log('📖 Read test successful');
    }

    // Clean up test data
    await testCollection.deleteMany({ test: true });
    console.log('🧹 Test data cleaned up');

    console.log('🎉 Database connection test PASSED!');
    
  } catch (error) {
    console.error('❌ Database connection test FAILED:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

// Run the test
if (require.main === module) {
  testDatabaseConnection();
}

module.exports = testDatabaseConnection;
