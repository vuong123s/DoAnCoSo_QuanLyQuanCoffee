const axios = require('axios');

async function testOnlineOrdersWithMon() {
  console.log('🧪 Testing Online Orders API with Mon details...\n');
  
  const baseUrl = 'http://localhost:3004';
  
  try {
    console.log('📦 Test: GET /api/online-orders (should include Mon data)');
    const response = await axios.get(`${baseUrl}/api/online-orders`);
    
    console.log('✅ Response structure:');
    console.log('   Keys:', Object.keys(response.data));
    console.log('   Total orders:', response.data.data.length);
    
    if (response.data.data.length > 0) {
      const order = response.data.data[0];
      console.log('\n📋 Sample Order:');
      console.log('   MaDHOnline:', order.MaDHOnline);
      console.log('   TenKhach:', order.TenKhach);
      console.log('   TrangThai:', order.TrangThai);
      console.log('   Items count:', order.chitiet?.length || 0);
      
      if (order.chitiet && order.chitiet.length > 0) {
        console.log('\n🍴 Sample Item:');
        const item = order.chitiet[0];
        console.log('   MaMon:', item.MaMon);
        console.log('   SoLuong:', item.SoLuong);
        console.log('   DonGia:', item.DonGia);
        
        if (item.Mon) {
          console.log('   ✅ Mon object:', {
            MaMon: item.Mon.MaMon,
            TenMon: item.Mon.TenMon,
            DonGia: item.Mon.DonGia
          });
        } else {
          console.log('   ❌ Mon object: NOT FOUND');
        }
      }
    }
    
    console.log('\n✅ Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

testOnlineOrdersWithMon();
