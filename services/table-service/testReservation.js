const axios = require('axios');

const BASE_URL = 'http://localhost:3003/api';

// Test data
const testReservation = {
  MaBan: 1,
  NgayDat: '2024-12-20',
  GioDat: '14:00',
  SoNguoi: 4,
  TenKhach: 'Nguyễn Văn A',
  SoDienThoai: '0123456789',
  GhiChu: 'Yêu cầu bàn gần cửa sổ'
};

const testReservationAPI = async () => {
  console.log('🧪 Testing Reservation API Endpoints...\n');

  try {
    // 1. Test get available tables
    console.log('1️⃣ Testing GET /reservations/available-tables');
    try {
      const availableResponse = await axios.get(`${BASE_URL}/reservations/available-tables`, {
        params: {
          NgayDat: '2024-12-20',
          GioDat: '14:00',
          SoNguoi: 4
        }
      });
      console.log('✅ Available tables:', availableResponse.data);
    } catch (error) {
      console.log('❌ Available tables error:', error.response?.data || error.message);
    }

    // 2. Test create reservation
    console.log('\n2️⃣ Testing POST /reservations');
    let createdReservationId;
    try {
      const createResponse = await axios.post(`${BASE_URL}/reservations`, testReservation);
      console.log('✅ Create reservation:', createResponse.data);
      createdReservationId = createResponse.data.data?.reservation?.MaDat;
    } catch (error) {
      console.log('❌ Create reservation error:', error.response?.data || error.message);
    }

    // 3. Test get all reservations
    console.log('\n3️⃣ Testing GET /reservations');
    try {
      const allResponse = await axios.get(`${BASE_URL}/reservations`);
      console.log('✅ All reservations:', allResponse.data);
    } catch (error) {
      console.log('❌ Get all reservations error:', error.response?.data || error.message);
    }

    // 4. Test get reservation by ID
    if (createdReservationId) {
      console.log('\n4️⃣ Testing GET /reservations/:id');
      try {
        const getByIdResponse = await axios.get(`${BASE_URL}/reservations/${createdReservationId}`);
        console.log('✅ Get reservation by ID:', getByIdResponse.data);
      } catch (error) {
        console.log('❌ Get reservation by ID error:', error.response?.data || error.message);
      }

      // 5. Test update reservation status
      console.log('\n5️⃣ Testing PUT /reservations/:id/status');
      try {
        const updateStatusResponse = await axios.put(`${BASE_URL}/reservations/${createdReservationId}/status`, {
          TrangThai: 'Đã xác nhận',
          GhiChu: 'Đã xác nhận qua điện thoại'
        });
        console.log('✅ Update reservation status:', updateStatusResponse.data);
      } catch (error) {
        console.log('❌ Update reservation status error:', error.response?.data || error.message);
      }
    }

    // 6. Test get today's reservations
    console.log('\n6️⃣ Testing GET /reservations/today');
    try {
      const todayResponse = await axios.get(`${BASE_URL}/reservations/today`);
      console.log('✅ Today reservations:', todayResponse.data);
    } catch (error) {
      console.log('❌ Today reservations error:', error.response?.data || error.message);
    }

    // 7. Test get reservation stats
    console.log('\n7️⃣ Testing GET /reservations/stats');
    try {
      const statsResponse = await axios.get(`${BASE_URL}/reservations/stats`);
      console.log('✅ Reservation stats:', statsResponse.data);
    } catch (error) {
      console.log('❌ Reservation stats error:', error.response?.data || error.message);
    }

    // 8. Test cancel reservation
    if (createdReservationId) {
      console.log('\n8️⃣ Testing PATCH /reservations/:id/cancel');
      try {
        const cancelResponse = await axios.patch(`${BASE_URL}/reservations/${createdReservationId}/cancel`, {
          GhiChu: 'Khách hàng hủy do có việc đột xuất'
        });
        console.log('✅ Cancel reservation:', cancelResponse.data);
      } catch (error) {
        console.log('❌ Cancel reservation error:', error.response?.data || error.message);
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }

  console.log('\n🏁 Test completed!');
};

// Run tests if this file is executed directly
if (require.main === module) {
  testReservationAPI();
}

module.exports = testReservationAPI;
