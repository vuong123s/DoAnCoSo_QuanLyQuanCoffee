const axios = require('axios');

async function testOnlineOrders() {
  console.log('🧪 Testing Online Orders API for Admin...\n');
  
  const baseUrl = 'http://localhost:3004';
  
  try {
    // Test: Get all online orders (staff endpoint)
    console.log('📦 Test: GET /api/online-orders');
    const response = await axios.get(`${baseUrl}/api/online-orders`);
    console.log('✅ Response structure:');
    console.log('   Keys:', Object.keys(response.data));
    console.log('   Data type:', typeof response.data);
    
    if (response.data.orders) {
      console.log(`   orders: array with ${response.data.orders.length} items`);
      if (response.data.orders.length > 0) {
        console.log('   Sample order:', {
          MaDHOnline: response.data.orders[0].MaDHOnline,
          TenKhach: response.data.orders[0].TenKhach,
          TrangThai: response.data.orders[0].TrangThai,
          TongTien: response.data.orders[0].TongTien,
          chitiet_count: response.data.orders[0].chitiet?.length
        });
      }
    } else if (response.data.data) {
      console.log(`   data: array with ${response.data.data.length} items`);
    } else if (Array.isArray(response.data)) {
      console.log(`   Direct array with ${response.data.length} items`);
    } else {
      console.log('   ⚠️ Unexpected response structure');
      console.log('   Response:', JSON.stringify(response.data, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

testOnlineOrders();
