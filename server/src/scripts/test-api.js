const axios = require('axios');

const API_BASE_URL = 'http://localhost:5050/api';
let authToken = '';

async function testAPI() {
  console.log('🧪 Starting API Tests...\n');

  try {
    // Test 1: Health Check
    await testHealthCheck();

    // Test 2: User Registration
    await testUserRegistration();

    // Test 3: User Login
    await testUserLogin();

    // Test 4: Get Current User
    await testGetCurrentUser();

    // Test 5: Get Courses
    await testGetCourses();

    // Test 6: Admin Login
    await testAdminLogin();

    // Test 7: Admin Dashboard
    await testAdminDashboard();

    console.log('\n🎉 All API tests PASSED!');

  } catch (error) {
    console.error('\n❌ API test FAILED:', error.message);
    process.exit(1);
  }
}

async function testHealthCheck() {
  console.log('1️⃣ Testing Health Check...');
  
  try {
    const response = await axios.get('http://localhost:5050/health');
    
    if (response.status === 200 && response.data.status === 'OK') {
      console.log('✅ Health check passed');
      return;
    }
    
    throw new Error('Health check response invalid');
  } catch (error) {
    throw new Error(`Health check failed: ${error.message}`);
  }
}

async function testUserRegistration() {
  console.log('2️⃣ Testing User Registration...');
  
  try {
    const userData = {
      email: 'testapi@example.com',
      password: 'test123456',
      displayName: 'Test API User',
      phone: '+966501234567'
    };

    const response = await axios.post(`${API_BASE_URL}/auth/register`, userData);
    
    if (response.status === 201 && response.data.success) {
      console.log('✅ User registration passed');
      authToken = response.data.token;
      return;
    }
    
    throw new Error('User registration response invalid');
  } catch (error) {
    if (error.response?.data?.error?.includes('already exists')) {
      console.log('✅ User registration passed (user already exists)');
      return;
    }
    throw new Error(`User registration failed: ${error.response?.data?.error || error.message}`);
  }
}

async function testUserLogin() {
  console.log('3️⃣ Testing User Login...');
  
  try {
    const loginData = {
      email: 'testapi@example.com',
      password: 'test123456'
    };

    const response = await axios.post(`${API_BASE_URL}/auth/login`, loginData);
    
    if (response.status === 200 && response.data.success && response.data.token) {
      console.log('✅ User login passed');
      authToken = response.data.token;
      return;
    }
    
    throw new Error('User login response invalid');
  } catch (error) {
    throw new Error(`User login failed: ${error.response?.data?.error || error.message}`);
  }
}

async function testGetCurrentUser() {
  console.log('4️⃣ Testing Get Current User...');
  
  try {
    const response = await axios.get(`${API_BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (response.status === 200 && response.data.success && response.data.user) {
      console.log('✅ Get current user passed');
      return;
    }
    
    throw new Error('Get current user response invalid');
  } catch (error) {
    throw new Error(`Get current user failed: ${error.response?.data?.error || error.message}`);
  }
}

async function testGetCourses() {
  console.log('5️⃣ Testing Get Courses...');
  
  try {
    const response = await axios.get(`${API_BASE_URL}/courses`);
    
    if (response.status === 200 && response.data.success) {
      console.log(`✅ Get courses passed (${response.data.courses?.length || 0} courses found)`);
      return;
    }
    
    throw new Error('Get courses response invalid');
  } catch (error) {
    throw new Error(`Get courses failed: ${error.response?.data?.error || error.message}`);
  }
}

async function testAdminLogin() {
  console.log('6️⃣ Testing Admin Login...');
  
  try {
    const adminData = {
      email: 'admin@taha-world.com',
      password: 'admin123456'
    };

    const response = await axios.post(`${API_BASE_URL}/auth/login`, adminData);
    
    if (response.status === 200 && response.data.success && response.data.user?.isAdmin) {
      console.log('✅ Admin login passed');
      authToken = response.data.token;
      return;
    }
    
    throw new Error('Admin login response invalid');
  } catch (error) {
    throw new Error(`Admin login failed: ${error.response?.data?.error || error.message}`);
  }
}

async function testAdminDashboard() {
  console.log('7️⃣ Testing Admin Dashboard...');
  
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (response.status === 200 && response.data.success && response.data.dashboard) {
      console.log('✅ Admin dashboard passed');
      return;
    }
    
    throw new Error('Admin dashboard response invalid');
  } catch (error) {
    throw new Error(`Admin dashboard failed: ${error.response?.data?.error || error.message}`);
  }
}

// Run the tests
if (require.main === module) {
  testAPI();
}

module.exports = testAPI;
