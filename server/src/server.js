require('dotenv').config();
const { app, connectDB } = require('./app');

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB Atlas');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
      console.log(`📱 Client URL: ${process.env.CLIENT_URL}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
  // test
})();

module.exports = app;
