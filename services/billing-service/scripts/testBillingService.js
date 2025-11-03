const axios = require('axios');

const BASE_URL = 'http://localhost:3004';

// Test configuration
const testConfig = {
  timeout: 10000,
  validateStatus: () => true // Accept all status codes for testing
};

// Test data
const testData = {
  donHang: {
    MaBan: 1,
    MaNV: 1,
    TrangThai: 'Đang xử lý',
    TongTien: 0,
    GhiChu: 'Test order'
  },
  onlineOrder: {
    TenKhach: 'Nguyễn Văn Test',
    SDTKhach: '0123456789',
    DiaChiGiaoHang: '123 Test Street, Test City',
    LoaiDonHang: 'Giao hàng',
    TongTien: 100000,
    PhiGiaoHang: 15000,
    DiemSuDung: 10, // Sử dụng 10 điểm = giảm 10,000đ
    GhiChu: 'Test online order',
    items: [
      {
        MaMon: 1,
        SoLuong: 2,
        DonGia: 35000,
        GhiChuMon: 'Ít đá'
      },
      {
        MaMon: 2,
        SoLuong: 1,
        DonGia: 30000,
        GhiChuMon: 'Không đường'
      }
    ]
  },
  orderItem: {
    MaMon: 1,
    SoLuong: 2,
    DonGia: 35000,
    GhiChu: 'Test item'
  }
};

// Helper functions
const logTest = (testName, status, message = '') => {
  const statusIcon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
  console.log(`${statusIcon} ${testName}: ${message}`);
};

const makeRequest = async (method, url, data = null) => {
  try {
    const config = { method, url: `${BASE_URL}${url}`, ...testConfig };
    if (data) config.data = data;
    
    const response = await axios(config);
    return response;
  } catch (error) {
    return error.response || { status: 500, data: { error: error.message } };
  }
};

// Test functions
const testHealthCheck = async () => {
  console.log('\n🏥 Testing Health Check...');
  
  const response = await makeRequest('GET', '/health');
  
  if (response.status === 200 && response.data.status === 'OK') {
    logTest('Health Check', 'PASS', 'Service is healthy');
    return true;
  } else {
    logTest('Health Check', 'FAIL', `Status: ${response.status}`);
    return false;
  }
};

const testDonHangOperations = async () => {
  console.log('\n📋 Testing DonHang Operations...');
  let createdOrderId = null;
  
  try {
    // Test create DonHang
    const createResponse = await makeRequest('POST', '/api/billing', testData.donHang);
    if (createResponse.status === 201 && createResponse.data.order) {
      createdOrderId = createResponse.data.order.MaDH;
      logTest('Create DonHang', 'PASS', `Created order ID: ${createdOrderId}`);
    } else {
      logTest('Create DonHang', 'FAIL', `Status: ${createResponse.status}`);
      return false;
    }

    // Test get all DonHang
    const getAllResponse = await makeRequest('GET', '/api/billing');
    if (getAllResponse.status === 200 && getAllResponse.data.donhangs) {
      logTest('Get All DonHang', 'PASS', `Found ${getAllResponse.data.donhangs.length} orders`);
    } else {
      logTest('Get All DonHang', 'FAIL', `Status: ${getAllResponse.status}`);
    }

    // Test get DonHang by ID
    const getByIdResponse = await makeRequest('GET', `/api/billing/${createdOrderId}`);
    if (getByIdResponse.status === 200 && getByIdResponse.data.order) {
      logTest('Get DonHang by ID', 'PASS', `Retrieved order ID: ${createdOrderId}`);
    } else {
      logTest('Get DonHang by ID', 'FAIL', `Status: ${getByIdResponse.status}`);
    }

    // Test add item to order
    const addItemResponse = await makeRequest('POST', `/api/billing/${createdOrderId}/items`, testData.orderItem);
    if (addItemResponse.status === 200) {
      logTest('Add Item to DonHang', 'PASS', 'Item added successfully');
    } else {
      logTest('Add Item to DonHang', 'FAIL', `Status: ${addItemResponse.status}`);
    }

    // Test update order status
    const updateStatusResponse = await makeRequest('PATCH', `/api/billing/${createdOrderId}/payment`, {
      TrangThai: 'Hoàn thành'
    });
    if (updateStatusResponse.status === 200) {
      logTest('Update DonHang Status', 'PASS', 'Status updated to Hoàn thành');
    } else {
      logTest('Update DonHang Status', 'FAIL', `Status: ${updateStatusResponse.status}`);
    }

    return true;
  } catch (error) {
    logTest('DonHang Operations', 'FAIL', error.message);
    return false;
  }
};


const testOnlineOrderOperations = async () => {
  console.log('\n🌐 Testing Online Order Operations...');
  let createdOrderId = null;
  
  try {
    // Test create Online Order
    const createResponse = await makeRequest('POST', '/api/online-orders', testData.onlineOrder);
    if (createResponse.status === 201 && createResponse.data.order) {
      createdOrderId = createResponse.data.order.MaDHOnline;
      logTest('Create Online Order', 'PASS', `Created order ID: ${createdOrderId}`);
    } else {
      logTest('Create Online Order', 'FAIL', `Status: ${createResponse.status}, Message: ${createResponse.data?.message || 'Unknown error'}`);
      return false;
    }

    // Test get all Online Orders
    const getAllResponse = await makeRequest('GET', '/api/online-orders');
    if (getAllResponse.status === 200 && getAllResponse.data.onlineOrders) {
      logTest('Get All Online Orders', 'PASS', `Found ${getAllResponse.data.onlineOrders.length} orders`);
    } else {
      logTest('Get All Online Orders', 'FAIL', `Status: ${getAllResponse.status}`);
    }

    // Test update online order status
    const updateStatusResponse = await makeRequest('PATCH', `/api/online-orders/${createdOrderId}/status`, {
      TrangThai: 'Đã xác nhận',
      MaNVXuLy: 1
    });
    if (updateStatusResponse.status === 200) {
      logTest('Update Online Order Status', 'PASS', 'Status updated to Đã xác nhận');
    } else {
      logTest('Update Online Order Status', 'FAIL', `Status: ${updateStatusResponse.status}`);
    }

    // Test get online order statistics
    const statsResponse = await makeRequest('GET', '/api/online-orders/stats');
    if (statsResponse.status === 200 && statsResponse.data.stats) {
      logTest('Get Online Order Statistics', 'PASS', `Total orders: ${statsResponse.data.stats.total_orders}`);
    } else {
      logTest('Get Online Order Statistics', 'FAIL', `Status: ${statsResponse.status}`);
    }

    return true;
  } catch (error) {
    logTest('Online Order Operations', 'FAIL', error.message);
    return false;
  }
};

const testRevenueOperations = async () => {
  console.log('\n💰 Testing Revenue Operations...');
  
  try {
    // Test get revenue statistics
    const revenueStatsResponse = await makeRequest('GET', '/api/revenue/stats');
    if (revenueStatsResponse.status === 200 && revenueStatsResponse.data.summary) {
      logTest('Get Revenue Statistics', 'PASS', `Total revenue: ${revenueStatsResponse.data.summary.total_revenue}`);
    } else {
      logTest('Get Revenue Statistics', 'FAIL', `Status: ${revenueStatsResponse.status}`);
    }

    // Test get daily revenue summary
    const dailyRevenueResponse = await makeRequest('GET', '/api/revenue/daily');
    if (dailyRevenueResponse.status === 200 && dailyRevenueResponse.data.summary) {
      logTest('Get Daily Revenue Summary', 'PASS', `Today's revenue: ${dailyRevenueResponse.data.summary.total_revenue}`);
    } else {
      logTest('Get Daily Revenue Summary', 'FAIL', `Status: ${dailyRevenueResponse.status}`);
    }

    // Test get revenue by period
    const periodRevenueResponse = await makeRequest('GET', '/api/revenue/by-period?period=day');
    if (periodRevenueResponse.status === 200 && periodRevenueResponse.data.data) {
      logTest('Get Revenue by Period', 'PASS', `Found ${periodRevenueResponse.data.data.length} periods`);
    } else {
      logTest('Get Revenue by Period', 'FAIL', `Status: ${periodRevenueResponse.status}`);
    }

    // Test get top selling items
    const topItemsResponse = await makeRequest('GET', '/api/revenue/top-items?limit=5');
    if (topItemsResponse.status === 200 && topItemsResponse.data.top_selling_items) {
      logTest('Get Top Selling Items', 'PASS', `Found ${topItemsResponse.data.top_selling_items.length} items`);
    } else {
      logTest('Get Top Selling Items', 'FAIL', `Status: ${topItemsResponse.status}`);
    }

    return true;
  } catch (error) {
    logTest('Revenue Operations', 'FAIL', error.message);
    return false;
  }
};

// Main test runner
const runAllTests = async () => {
  console.log('🧪 Starting Billing Service Comprehensive Tests...');
  console.log('='.repeat(60));
  
  const testResults = {
    total: 0,
    passed: 0,
    failed: 0
  };

  const tests = [
    { name: 'Health Check', fn: testHealthCheck },
    { name: 'DonHang Operations', fn: testDonHangOperations },
    { name: 'Online Order Operations', fn: testOnlineOrderOperations },
    { name: 'Revenue Operations', fn: testRevenueOperations }
  ];

  for (const test of tests) {
    testResults.total++;
    try {
      const result = await test.fn();
      if (result) {
        testResults.passed++;
      } else {
        testResults.failed++;
      }
    } catch (error) {
      testResults.failed++;
      logTest(test.name, 'FAIL', `Unexpected error: ${error.message}`);
    }
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Test Summary:');
  console.log(`Total Tests: ${testResults.total}`);
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
  
  if (testResults.failed === 0) {
    console.log('\n🎉 All tests passed! Billing Service is working correctly.');
  } else {
    console.log('\n⚠️ Some tests failed. Please check the service configuration and database connection.');
  }
  
  console.log('='.repeat(60));
};

// Run tests if called directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  runAllTests,
  testHealthCheck,
  testDonHangOperations,
  testOnlineOrderOperations,
  testRevenueOperations
};
