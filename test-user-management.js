// Test script for User Management functionality
const axios = require('axios');

const API_BASE = 'http://localhost:3000';

async function testUserManagement() {
  console.log('🧪 Testing User Management API...\n');

  try {
    // Test 1: Get users via test route
    console.log('1. Testing GET /api/users-test/test');
    const usersResponse = await axios.get(`${API_BASE}/api/users-test/test`);
    console.log('✅ Users fetched successfully');
    console.log(`   - Total employees: ${usersResponse.data.nhanviens?.length || 0}`);
    console.log(`   - Total customers: ${usersResponse.data.khachhangs?.length || 0}`);
    console.log(`   - Total users: ${usersResponse.data.total_users || 0}\n`);

    // Test 2: Get user statistics
    console.log('2. Testing GET /api/users-test/test-stats');
    const statsResponse = await axios.get(`${API_BASE}/api/users-test/test-stats`);
    console.log('✅ User statistics fetched successfully');
    console.log(`   - Total users: ${statsResponse.data.totalUsers}`);
    console.log(`   - Total employees: ${statsResponse.data.totalEmployees}`);
    console.log(`   - Total customers: ${statsResponse.data.totalCustomers}`);
    console.log(`   - Active users: ${statsResponse.data.activeUsers}\n`);

    // Test 3: Test API Gateway health
    console.log('3. Testing API Gateway health');
    const healthResponse = await axios.get(`${API_BASE}/health`);
    console.log('✅ API Gateway is healthy\n');

    // Test 4: Test User Service health
    console.log('4. Testing User Service health');
    const userServiceHealth = await axios.get('http://localhost:3001/health');
    console.log('✅ User Service is healthy\n');

    console.log('🎉 All tests passed! User Management should work now.');
    console.log('\n📋 Next steps:');
    console.log('1. Open http://localhost:5173 in your browser');
    console.log('2. Login with admin credentials');
    console.log('3. Navigate to User Management page');
    console.log('4. The page should load without 401/404 errors');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

// Run tests
testUserManagement();
