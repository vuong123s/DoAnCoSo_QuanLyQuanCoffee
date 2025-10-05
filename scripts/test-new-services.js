const axios = require('axios');

// Test configuration
const API_BASE = 'http://localhost:3000';
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  reset: '\x1b[0m'
};

// Helper function to log with colors
const log = (color, message) => console.log(`${colors[color]}${message}${colors.reset}`);

// Test functions
async function testHealthChecks() {
  log('blue', '\n=== Testing Health Checks ===');
  
  const services = [
    { name: 'API Gateway', url: 'http://localhost:3000/health', port: 3000 },
    { name: 'User Service', url: 'http://localhost:3001/health', port: 3001 },
    { name: 'Menu Service', url: 'http://localhost:3002/health', port: 3002 },
    { name: 'Table Service', url: 'http://localhost:3003/health', port: 3003 },
    { name: 'Billing Service', url: 'http://localhost:3004/health', port: 3004 },
    { name: 'Online Order Service', url: 'http://localhost:3005/health', port: 3005 },
    { name: 'Voucher Service', url: 'http://localhost:3006/health', port: 3006 },
    { name: 'Inventory Service', url: 'http://localhost:3007/health', port: 3007 }
  ];

  let healthyServices = 0;
  for (const service of services) {
    try {
      const response = await axios.get(service.url, { timeout: 5000 });
      log('green', `✓ ${service.name} (Port ${service.port}): ${response.data.status || 'OK'}`);
      healthyServices++;
    } catch (error) {
      log('red', `✗ ${service.name} (Port ${service.port}): ${error.message}`);
    }
  }
  
  log('cyan', `\n📊 Health Summary: ${healthyServices}/${services.length} services healthy`);
  return healthyServices === services.length;
}

async function testUserService() {
  log('blue', '\n=== Testing User Service ===');
  
  try {
    // Test public endpoints
    log('yellow', 'Testing authentication endpoints...');
    
    // Test registration endpoint (will fail without valid data, but tests endpoint)
    try {
      const registerData = {
        HoTen: 'Test User',
        Email: 'test@example.com',
        MatKhau: 'password123',
        SDT: '0123456789'
      };
      const registerResponse = await axios.post(`${API_BASE}/api/auth/register`, registerData);
      log('green', `✓ Register endpoint: ${registerResponse.status}`);
    } catch (error) {
      if (error.response?.status === 400 || error.response?.status === 409) {
        log('yellow', '⚠ Register: Validation error or user exists (expected for test)');
      } else {
        throw error;
      }
    }
    
    // Test login endpoint
    try {
      const loginData = {
        Email: 'admin@coffeeshop.com',
        MatKhau: 'admin123'
      };
      const loginResponse = await axios.post(`${API_BASE}/api/auth/login`, loginData);
      log('green', `✓ Login endpoint: ${loginResponse.status}`);
    } catch (error) {
      if (error.response?.status === 401) {
        log('yellow', '⚠ Login: Invalid credentials (expected without admin user)');
      } else {
        throw error;
      }
    }
    
  } catch (error) {
    log('red', `✗ User Service: ${error.response?.data?.error || error.message}`);
  }
}

async function testMenuService() {
  log('blue', '\n=== Testing Menu Service ===');
  
  try {
    log('yellow', 'Testing menu endpoints...');
    
    // Get menu items
    const menuResponse = await axios.get(`${API_BASE}/api/menu`);
    log('green', `✓ Get menu: ${menuResponse.status} (${menuResponse.data.length || 0} items)`);
    
    // Get categories
    const categoriesResponse = await axios.get(`${API_BASE}/api/categories`);
    log('green', `✓ Get categories: ${categoriesResponse.status} (${categoriesResponse.data.length || 0} categories)`);
    
  } catch (error) {
    log('red', `✗ Menu Service: ${error.response?.data?.error || error.message}`);
  }
}

async function testTableService() {
  log('blue', '\n=== Testing Table Service ===');
  
  try {
    log('yellow', 'Testing table and reservation endpoints...');
    
    // Get tables
    const tablesResponse = await axios.get(`${API_BASE}/api/tables`);
    log('green', `✓ Get tables: ${tablesResponse.status} (${tablesResponse.data.length || 0} tables)`);
    
    // Get reservations
    const reservationsResponse = await axios.get(`${API_BASE}/api/reservations`);
    log('green', `✓ Get reservations: ${reservationsResponse.status} (${reservationsResponse.data.length || 0} reservations)`);
    
    // Test available tables endpoint
    const availableTablesResponse = await axios.get(`${API_BASE}/api/reservations/available-tables?date=2025-01-22&time=19:00`);
    log('green', `✓ Get available tables: ${availableTablesResponse.status}`);
    
  } catch (error) {
    log('red', `✗ Table Service: ${error.response?.data?.error || error.message}`);
  }
}

async function testBillingService() {
  log('blue', '\n=== Testing Billing Service (requires staff auth) ===');
  
  try {
    // This will fail without authentication, but tests the endpoint
    const billingResponse = await axios.get(`${API_BASE}/api/billing`);
    log('green', `✓ Get billing: ${billingResponse.status}`);
    
  } catch (error) {
    if (error.response?.status === 401 || error.response?.status === 403) {
      log('yellow', '⚠ Billing Service: Authentication required (expected)');
    } else {
      log('red', `✗ Billing Service: ${error.response?.data?.error || error.message}`);
    }
  }
}

async function testOnlineOrderService() {
  log('blue', '\n=== Testing Online Order Service ===');
  
  try {
    log('yellow', 'Testing cart endpoints...');
    
    // Get empty cart
    const cartResponse = await axios.get(`${API_BASE}/api/cart?sessionId=test-session-${Date.now()}`);
    log('green', `✓ Get cart: ${cartResponse.status}`);
    
    // Test online orders endpoint
    const ordersResponse = await axios.get(`${API_BASE}/api/online-orders`);
    log('green', `✓ Get online orders: ${ordersResponse.status} (${ordersResponse.data.length || 0} orders)`);
    
    // Add item to cart (mock data)
    try {
      const addToCartData = {
        sessionId: `test-session-${Date.now()}`,
        menuItemId: 1,
        quantity: 2,
        unitPrice: 45000,
        notes: 'Test order'
      };
      
      const addResponse = await axios.post(`${API_BASE}/api/cart/add`, addToCartData);
      log('green', `✓ Add to cart: ${addResponse.status}`);
    } catch (error) {
      if (error.response?.status === 404) {
        log('yellow', '⚠ Add to cart: Menu item not found (expected without menu data)');
      } else {
        throw error;
      }
    }
    
  } catch (error) {
    log('red', `✗ Online Order Service: ${error.response?.data?.error || error.message}`);
  }
}

async function testVoucherService() {
  log('blue', '\n=== Testing Voucher Service ===');
  
  try {
    log('yellow', 'Testing voucher endpoints...');
    
    // Get all vouchers
    const vouchersResponse = await axios.get(`${API_BASE}/api/vouchers`);
    log('green', `✓ Get vouchers: ${vouchersResponse.status} (${vouchersResponse.data.length || 0} vouchers)`);
    
    // Get available vouchers
    const availableVouchersResponse = await axios.get(`${API_BASE}/api/vouchers/available`);
    log('green', `✓ Get available vouchers: ${availableVouchersResponse.status}`);
    
    // Test voucher validation (this will fail without a real voucher, but tests the endpoint)
    try {
      const validateResponse = await axios.post(`${API_BASE}/api/vouchers/WELCOME10/validate`, {
        orderValue: 100000,
        customerType: 'Thành viên'
      });
      log('green', `✓ Validate voucher: ${validateResponse.status}`);
    } catch (error) {
      if (error.response?.status === 404) {
        log('yellow', '⚠ Voucher validation: Voucher not found (expected for test)');
      } else {
        throw error;
      }
    }
    
  } catch (error) {
    log('red', `✗ Voucher Service: ${error.response?.data?.error || error.message}`);
  }
}

async function testInventoryService() {
  log('blue', '\n=== Testing Inventory Service (requires staff auth) ===');
  
  try {
    // This will fail without authentication, but tests the endpoint
    const inventoryResponse = await axios.get(`${API_BASE}/api/inventory`);
    log('green', `✓ Get inventory: ${inventoryResponse.status} (${inventoryResponse.data.length || 0} items)`);
    
    // Test inventory alerts
    const alertsResponse = await axios.get(`${API_BASE}/api/inventory/alerts`);
    log('green', `✓ Get inventory alerts: ${alertsResponse.status}`);
    
  } catch (error) {
    if (error.response?.status === 401 || error.response?.status === 403) {
      log('yellow', '⚠ Inventory Service: Authentication required (expected)');
    } else {
      log('red', `✗ Inventory Service: ${error.response?.data?.error || error.message}`);
    }
  }
}

async function testAPIGatewayRoutes() {
  log('blue', '\n=== Testing API Gateway Routes ===');
  
  try {
    // Test API documentation
    const apiDocsResponse = await axios.get(`${API_BASE}/api`);
    log('green', `✓ API Documentation: ${apiDocsResponse.status}`);
    
    // Test service discovery
    const testResponse = await axios.get(`${API_BASE}/test`);
    log('green', `✓ Test endpoint: ${testResponse.status}`);
    
    log('cyan', '\n📋 Registered services:');
    if (testResponse.data.services) {
      testResponse.data.services.forEach(service => {
        log('cyan', `  - ${service.name}: ${service.url}`);
      });
    }
    
  } catch (error) {
    log('red', `✗ API Gateway: ${error.response?.data?.error || error.message}`);
  }
}

async function testCrossServiceIntegration() {
  log('blue', '\n=== Testing Cross-Service Integration ===');
  
  try {
    log('yellow', 'Testing service communication...');
    
    // Test menu availability for cart
    const menuResponse = await axios.get(`${API_BASE}/api/menu`);
    const vouchersResponse = await axios.get(`${API_BASE}/api/vouchers/available`);
    
    if (menuResponse.data.length > 0 && vouchersResponse.data.length > 0) {
      log('green', '✓ Menu and voucher data available for integration');
    } else {
      log('yellow', '⚠ Limited data available for integration testing');
    }
    
    // Test table availability for reservations
    const tablesResponse = await axios.get(`${API_BASE}/api/tables`);
    if (tablesResponse.data.length > 0) {
      log('green', '✓ Table data available for reservation integration');
    } else {
      log('yellow', '⚠ No table data available for reservation testing');
    }
    
  } catch (error) {
    log('red', `✗ Cross-Service Integration: ${error.response?.data?.error || error.message}`);
  }
}

// Performance test
async function testPerformance() {
  log('blue', '\n=== Testing Performance ===');
  
  const endpoints = [
    { name: 'Menu', url: `${API_BASE}/api/menu` },
    { name: 'Categories', url: `${API_BASE}/api/categories` },
    { name: 'Tables', url: `${API_BASE}/api/tables` },
    { name: 'Vouchers', url: `${API_BASE}/api/vouchers/available` }
  ];
  
  for (const endpoint of endpoints) {
    try {
      const startTime = Date.now();
      await axios.get(endpoint.url, { timeout: 10000 });
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      if (responseTime < 1000) {
        log('green', `✓ ${endpoint.name}: ${responseTime}ms (Good)`);
      } else if (responseTime < 3000) {
        log('yellow', `⚠ ${endpoint.name}: ${responseTime}ms (Acceptable)`);
      } else {
        log('red', `✗ ${endpoint.name}: ${responseTime}ms (Slow)`);
      }
    } catch (error) {
      log('red', `✗ ${endpoint.name}: Failed to respond`);
    }
  }
}

// Main test runner
async function runTests() {
  const startTime = Date.now();
  
  log('magenta', '☕ Coffee Shop Management System - Comprehensive Test Suite');
  log('magenta', '==============================================================');
  log('cyan', `🕐 Test started at: ${new Date().toLocaleString()}`);
  
  const allHealthy = await testHealthChecks();
  
  if (!allHealthy) {
    log('red', '\n❌ Some services are not healthy. Please start all services before running tests.');
    log('yellow', '\nTo start all services, run: ./scripts/start-all-services.bat');
    return;
  }
  
  await testAPIGatewayRoutes();
  await testUserService();
  await testMenuService();
  await testTableService();
  await testBillingService();
  await testOnlineOrderService();
  await testVoucherService();
  await testInventoryService();
  await testCrossServiceIntegration();
  await testPerformance();
  
  const endTime = Date.now();
  const totalTime = endTime - startTime;
  
  log('magenta', '\n==============================================================');
  log('green', '✅ Comprehensive test suite completed!');
  log('cyan', `⏱️  Total execution time: ${totalTime}ms`);
  log('cyan', `🕐 Test completed at: ${new Date().toLocaleString()}`);
  
  log('yellow', '\n📝 Notes:');
  log('yellow', '- Some tests may fail if services are not running');
  log('yellow', '- Authentication-required endpoints will show expected auth errors');
  log('yellow', '- Some operations require sample data in the database');
  log('yellow', '- Run database seeding script for complete testing');
  
  log('blue', '\n🚀 Next Steps:');
  log('blue', '1. Ensure all services are running (green checkmarks above)');
  log('blue', '2. Import sample data: mysql -u root -p QuanLyCafe < scripts/seed-sample-data.sql');
  log('blue', '3. Test frontend integration at http://localhost:5173');
  log('blue', '4. Create admin user: mysql -u root -p QuanLyCafe < create-admin-user.sql');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(error => {
    log('red', `\nTest suite failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { runTests };
