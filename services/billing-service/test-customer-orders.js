const axios = require('axios');

async function testCustomerOrders() {
  console.log('🧪 Testing Customer Orders API...\n');
  
  const customerId = 1; // Test with customer ID 1
  const baseUrl = 'http://localhost:3004';
  
  try {
    // Test 1: Get orders by customer
    console.log(`📦 Test 1: GET /api/billing/customer/${customerId}`);
    const response1 = await axios.get(`${baseUrl}/api/billing/customer/${customerId}`);
    console.log('✅ Response:', JSON.stringify(response1.data, null, 2));
    console.log(`   Found ${response1.data.orders?.length || 0} orders\n`);
    
    // Test 2: Get order details
    if (response1.data.orders && response1.data.orders.length > 0) {
      const orderId = response1.data.orders[0].MaDH;
      console.log(`📝 Test 2: GET /api/billing/${orderId}`);
      const response2 = await axios.get(`${baseUrl}/api/billing/${orderId}`);
      console.log('✅ Response:', JSON.stringify(response2.data, null, 2));
      console.log(`   Order has ${response2.data.order?.chitiet?.length || 0} items\n`);
      
      // Check if items have Mon data
      if (response2.data.order?.chitiet?.length > 0) {
        const firstItem = response2.data.order.chitiet[0];
        console.log('📋 First item:', {
          MaMon: firstItem.MaMon,
          TenMon: firstItem.Mon?.TenMon,
          SoLuong: firstItem.SoLuong,
          DonGia: firstItem.DonGia,
          ThanhTien: firstItem.ThanhTien
        });
      }
    } else {
      console.log('⚠️ No orders found for customer. Need to check database.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

testCustomerOrders();
