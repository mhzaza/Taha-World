const serverless = require('serverless-http');
const { app, connectDB } = require('./app');

let dbReady = false;

async function ensureDB() {
  if (!dbReady) {
    await connectDB();
    dbReady = true;
  }
}

module.exports = async (req, res) => {
  await ensureDB();
  const handler = serverless(app);
  return handler(req, res);
};