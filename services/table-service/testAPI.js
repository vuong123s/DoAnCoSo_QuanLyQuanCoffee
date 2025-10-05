const axios = require('axios');

const API_BASE = 'http://localhost:3000'; // API Gateway
const TABLE_SERVICE = 'http://localhost:3003'; // Direct to table service

async function testEndpoints() {
  console.log('🧪 Testing API Endpoints...\n');

  const tests = [
    {
      name: 'GET /api/dat-ban (via Gateway)',
      url: `${API_BASE}/api/dat-ban`,
      method: 'GET'
    },
    {
      name: 'GET /api/dat-ban/ban-trong (via Gateway)',
      url: `${API_BASE}/api/dat-ban/ban-trong?NgayDat=2025-09-18&GioDat=12:00&SoNguoi=2`,
      method: 'GET'
    },
    {
      name: 'GET /api/reservations (Direct to service)',
      url: `${TABLE_SERVICE}/api/reservations`,
      method: 'GET'
    },
    {
      name: 'GET /api/dat-ban (Direct to service)',
      url: `${TABLE_SERVICE}/api/dat-ban`,
      method: 'GET'
    },
    {
      name: 'GET /api/dat-ban/ban-trong (Direct to service)',
      url: `${TABLE_SERVICE}/api/dat-ban/ban-trong?NgayDat=2025-09-18&GioDat=12:00&SoNguoi=2`,
      method: 'GET'
    },
    {
      name: 'GET /api/tables (via Gateway)',
      url: `${API_BASE}/api/tables`,
      method: 'GET'
    },
    {
      name: 'GET /api/ban (via Gateway)',
      url: `${API_BASE}/api/ban`,
      method: 'GET'
    }
  ];

  for (const test of tests) {
    try {
      console.log(`🔍 Testing: ${test.name}`);
      console.log(`   URL: ${test.url}`);
      
      const response = await axios({
        method: test.method,
        url: test.url,
        timeout: 5000
      });
      
      console.log(`   ✅ Status: ${response.status}`);
      console.log(`   📊 Data structure:`, typeof response.data);
      
      if (response.data) {
        const keys = Object.keys(response.data);
        console.log(`   🔑 Keys: [${keys.join(', ')}]`);
        
        // Check if it has reservations or tables data
        if (response.data.data && response.data.data.reservations) {
          console.log(`   📋 Reservations count: ${response.data.data.reservations.length}`);
        } else if (response.data.reservations) {
          console.log(`   📋 Reservations count: ${response.data.reservations.length}`);
        } else if (response.data.tables) {
          console.log(`   🪑 Tables count: ${response.data.tables.length}`);
        } else if (response.data.available_tables) {
          console.log(`   🆓 Available tables count: ${response.data.available_tables.length}`);
        }
      }
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.response?.status || error.code}`);
      console.log(`   💬 Message: ${error.response?.data?.error || error.message}`);
    }
    
    console.log(''); // Empty line for readability
  }
}

// Run tests
testEndpoints().catch(console.error);
