const axios = require('axios');

const BASE_URL = 'http://localhost:3003';

// Test data
const testReservation1 = {
  MaBan: 1,
  NgayDat: '2024-01-20',
  GioDat: '12:00', // 12:00-14:00
  SoNguoi: 4,
  TenKhach: 'Nguyễn Văn Test 1',
  SoDienThoai: '0123456789',
  GhiChu: 'Test đặt bàn 12:00-14:00'
};

const conflictReservation = {
  MaBan: 1,
  NgayDat: '2024-01-20',
  GioDat: '13:00', // 13:00-15:00 (xung đột với 12:00-14:00)
  SoNguoi: 2,
  TenKhach: 'Trần Thị Conflict',
  SoDienThoai: '0987654321',
  GhiChu: 'Test xung đột thời gian'
};

const validReservation = {
  MaBan: 1,
  NgayDat: '2024-01-20',
  GioDat: '15:00', // 15:00-17:00 (không xung đột)
  SoNguoi: 3,
  TenKhach: 'Lê Văn Valid',
  SoDienThoai: '0111222333',
  GhiChu: 'Test đặt bàn hợp lệ'
};

const edgeCase1 = {
  MaBan: 1,
  NgayDat: '2024-01-20',
  GioDat: '14:00', // 14:00-16:00 (sát giờ kết thúc của reservation đầu)
  SoNguoi: 2,
  TenKhach: 'Test Edge Case 1',
  SoDienThoai: '0444555666',
  GhiChu: 'Test edge case'
};

const edgeCase2 = {
  MaBan: 1,
  NgayDat: '2024-01-20',
  GioDat: '10:00', // 10:00-12:00 (sát giờ bắt đầu của reservation đầu)
  SoNguoi: 2,
  TenKhach: 'Test Edge Case 2',
  SoDienThoai: '0777888999',
  GhiChu: 'Test edge case 2'
};

async function testTimeConflictLogic() {
  console.log('🧪 Testing Time Conflict Logic (2-hour duration)');
  console.log('=' .repeat(60));

  try {
    // Test 1: Tạo reservation đầu tiên (12:00-14:00)
    console.log('\n1️⃣ Test: Tạo reservation đầu tiên (12:00-14:00)');
    const response1 = await axios.post(`${BASE_URL}/api/reservations`, testReservation1);
    console.log('✅ Success:', response1.data.message);
    console.log('📋 Reservation ID:', response1.data.data.reservation.MaDat);

    // Test 2: Thử tạo reservation xung đột (13:00-15:00)
    console.log('\n2️⃣ Test: Thử tạo reservation xung đột (13:00-15:00)');
    try {
      await axios.post(`${BASE_URL}/api/reservations`, conflictReservation);
      console.log('❌ ERROR: Không nên tạo được reservation xung đột!');
    } catch (error) {
      console.log('✅ Success: Đã chặn được xung đột thời gian');
      console.log('📝 Error message:', error.response.data.error);
      if (error.response.data.conflicting_reservation) {
        console.log('🔍 Conflicting reservation:', error.response.data.conflicting_reservation);
      }
    }

    // Test 3: Tạo reservation hợp lệ (15:00-17:00)
    console.log('\n3️⃣ Test: Tạo reservation hợp lệ (15:00-17:00)');
    const response3 = await axios.post(`${BASE_URL}/api/reservations`, validReservation);
    console.log('✅ Success:', response3.data.message);
    console.log('📋 Reservation ID:', response3.data.data.reservation.MaDat);

    // Test 4: Edge case - đặt bàn sát giờ kết thúc (14:00-16:00)
    console.log('\n4️⃣ Test: Edge case - đặt bàn sát giờ kết thúc (14:00-16:00)');
    const response4 = await axios.post(`${BASE_URL}/api/reservations`, edgeCase1);
    console.log('✅ Success: Có thể đặt bàn sát giờ kết thúc');
    console.log('📋 Reservation ID:', response4.data.data.reservation.MaDat);

    // Test 5: Edge case - đặt bàn sát giờ bắt đầu (10:00-12:00)
    console.log('\n5️⃣ Test: Edge case - đặt bàn sát giờ bắt đầu (10:00-12:00)');
    const response5 = await axios.post(`${BASE_URL}/api/reservations`, edgeCase2);
    console.log('✅ Success: Có thể đặt bàn sát giờ bắt đầu');
    console.log('📋 Reservation ID:', response5.data.data.reservation.MaDat);

    // Test 6: Test getAvailableTables với thời gian xung đột
    console.log('\n6️⃣ Test: Lấy bàn trống trong thời gian xung đột (13:30)');
    const availableResponse = await axios.get(`${BASE_URL}/api/reservations/available-tables`, {
      params: {
        NgayDat: '2024-01-20',
        GioDat: '13:30',
        SoNguoi: 2
      }
    });
    console.log('📊 Available tables:', availableResponse.data.data.total_available);
    console.log('ℹ️ Bàn 1 should NOT be available (conflict with existing reservations)');

    // Test 7: Test getAvailableTables với thời gian không xung đột
    console.log('\n7️⃣ Test: Lấy bàn trống trong thời gian không xung đột (18:00)');
    const availableResponse2 = await axios.get(`${BASE_URL}/api/reservations/available-tables`, {
      params: {
        NgayDat: '2024-01-20',
        GioDat: '18:00',
        SoNguoi: 2
      }
    });
    console.log('📊 Available tables:', availableResponse2.data.data.total_available);
    console.log('ℹ️ More tables should be available at 18:00');

    console.log('\n🎉 All time conflict tests completed!');
    console.log('\n📋 Summary of created reservations:');
    console.log('- 12:00-14:00: Nguyễn Văn Test 1');
    console.log('- 15:00-17:00: Lê Văn Valid');
    console.log('- 14:00-16:00: Test Edge Case 1');
    console.log('- 10:00-12:00: Test Edge Case 2');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Chạy test
testTimeConflictLogic();
