const axios = require('axios');

const BASE_URL = 'http://localhost:3003';

async function testAreaEndpoints() {
  console.log('Testing Table Area Endpoints...\n');
  
  try {
    // Test 1: Get all areas
    console.log('1. Testing GET /api/tables/areas');
    const areasResponse = await axios.get(`${BASE_URL}/api/tables/areas`);
    console.log('✅ Areas retrieved successfully:');
    console.table(areasResponse.data.areas);
    console.log('');
    
    // Test 2: Get tables by area
    const areas = areasResponse.data.areas;
    if (areas.length > 0) {
      const firstArea = areas[0].name;
      console.log(`2. Testing GET /api/tables/areas/${encodeURIComponent(firstArea)}`);
      const tablesByAreaResponse = await axios.get(`${BASE_URL}/api/tables/areas/${encodeURIComponent(firstArea)}`);
      console.log(`✅ Tables in ${firstArea}:`);
      console.log(`Total tables: ${tablesByAreaResponse.data.total_tables}`);
      tablesByAreaResponse.data.tables.forEach(table => {
        console.log(`  - ${table.TenBan} (${table.SoCho} chỗ) - ${table.TrangThai} - ${table.ViTri || 'No position'}`);
      });
      console.log('');
    }
    
    // Test 3: Get all tables with area filter
    console.log('3. Testing GET /api/tables?khu_vuc=Tầng 1');
    const filteredTablesResponse = await axios.get(`${BASE_URL}/api/tables?khu_vuc=Tầng 1`);
    console.log('✅ Tables filtered by area (Tầng 1):');
    console.log(`Total tables: ${filteredTablesResponse.data.tables.length}`);
    filteredTablesResponse.data.tables.forEach(table => {
      console.log(`  - ${table.TenBan} (${table.SoCho} chỗ) - ${table.KhuVuc} - ${table.TrangThai}`);
    });
    console.log('');
    
    // Test 4: Get table statistics with area breakdown
    console.log('4. Testing GET /api/tables/stats');
    const statsResponse = await axios.get(`${BASE_URL}/api/tables/stats`);
    console.log('✅ Table statistics:');
    console.log(`Total tables: ${statsResponse.data.stats.total_tables}`);
    console.log('\nStatus breakdown:');
    console.table(statsResponse.data.stats.status_breakdown);
    console.log('\nArea breakdown:');
    console.table(statsResponse.data.stats.area_breakdown);
    console.log('');
    
    // Test 5: Create a new table with area
    console.log('5. Testing POST /api/tables (create table with area)');
    const newTableData = {
      table_number: 'TEST-01',
      capacity: 4,
      area: 'Tầng 1',
      position: 'Test position'
    };
    
    const createResponse = await axios.post(`${BASE_URL}/api/tables`, newTableData);
    console.log('✅ New table created:');
    console.log(`  - ID: ${createResponse.data.table.MaBan}`);
    console.log(`  - Name: ${createResponse.data.table.TenBan}`);
    console.log(`  - Area: ${createResponse.data.table.KhuVuc}`);
    console.log(`  - Position: ${createResponse.data.table.ViTri}`);
    console.log('');
    
    // Test 6: Update table with new area
    const tableId = createResponse.data.table.MaBan;
    console.log(`6. Testing PUT /api/tables/${tableId} (update area)`);
    const updateData = {
      area: 'VIP',
      position: 'Updated VIP position'
    };
    
    const updateResponse = await axios.put(`${BASE_URL}/api/tables/${tableId}`, updateData);
    console.log('✅ Table updated:');
    console.log(`  - Area: ${updateResponse.data.table.KhuVuc}`);
    console.log(`  - Position: ${updateResponse.data.table.ViTri}`);
    console.log('');
    
    // Test 7: Clean up - delete test table
    console.log(`7. Cleaning up - DELETE /api/tables/${tableId}`);
    await axios.delete(`${BASE_URL}/api/tables/${tableId}`);
    console.log('✅ Test table deleted');
    
    console.log('\n🎉 All area endpoint tests passed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.status === 404) {
      console.log('💡 Make sure the table service is running on port 3003');
    }
  }
}

// Run the tests
testAreaEndpoints();
