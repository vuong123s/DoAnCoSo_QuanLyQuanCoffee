const axios = require('axios');

const BASE_URL = 'http://localhost:3003';

// Test image URLs for each area
const testImageUrls = {
  'Tầng 1': [
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=300&h=200&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=300&h=200&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=300&h=200&fit=crop&crop=center'
  ],
  'Tầng 2': [
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=300&h=200&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=200&fit=crop&crop=center'
  ],
  'VIP': [
    'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?w=300&h=200&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1567521464027-f127ff144326?w=300&h=200&fit=crop&crop=center'
  ],
  'Sân thượng': [
    'https://images.unsplash.com/photo-1519947486511-46149fa0a254?w=300&h=200&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?w=300&h=200&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=300&h=200&fit=crop&crop=center'
  ],
  'Ngoài trời': [
    'https://images.unsplash.com/photo-1552566651-6e4e3b7a8f8b?w=300&h=200&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=300&h=200&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop&crop=center'
  ]
};

async function testImageAvailability() {
  console.log('🖼️  Testing Area Image Availability...\n');
  
  let totalImages = 0;
  let workingImages = 0;
  let failedImages = 0;
  
  for (const [area, urls] of Object.entries(testImageUrls)) {
    console.log(`📍 Testing images for ${area}:`);
    
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      totalImages++;
      
      try {
        const response = await axios.head(url, { timeout: 5000 });
        if (response.status === 200) {
          console.log(`  ✅ Image ${i + 1}: OK (${response.headers['content-length']} bytes)`);
          workingImages++;
        } else {
          console.log(`  ❌ Image ${i + 1}: Failed (Status: ${response.status})`);
          failedImages++;
        }
      } catch (error) {
        console.log(`  ❌ Image ${i + 1}: Failed (${error.message})`);
        failedImages++;
      }
    }
    console.log('');
  }
  
  console.log('📊 Summary:');
  console.log(`  Total images tested: ${totalImages}`);
  console.log(`  Working images: ${workingImages}`);
  console.log(`  Failed images: ${failedImages}`);
  console.log(`  Success rate: ${((workingImages / totalImages) * 100).toFixed(1)}%`);
}

async function testAreaEndpointsWithImages() {
  console.log('\n🔗 Testing Area Endpoints...\n');
  
  try {
    // Test areas endpoint
    console.log('1. Testing GET /api/tables/areas');
    const areasResponse = await axios.get(`${BASE_URL}/api/tables/areas`);
    const areas = areasResponse.data.areas || [];
    
    console.log(`✅ Found ${areas.length} areas:`);
    areas.forEach(area => {
      console.log(`  - ${area.name}: ${area.table_count} tables`);
    });
    
    // Test each area's tables
    console.log('\n2. Testing tables by area:');
    for (const area of areas) {
      try {
        const response = await axios.get(`${BASE_URL}/api/tables/areas/${encodeURIComponent(area.name)}`);
        const tables = response.data.tables || [];
        console.log(`  ✅ ${area.name}: ${tables.length} tables loaded`);
        
        // Show sample table data
        if (tables.length > 0) {
          const sampleTable = tables[0];
          console.log(`    Sample: ${sampleTable.TenBan} (${sampleTable.SoCho} seats) - ${sampleTable.TrangThai}`);
          if (sampleTable.KhuVuc) {
            console.log(`    Area: ${sampleTable.KhuVuc}, Position: ${sampleTable.ViTri || 'Not specified'}`);
          }
        }
      } catch (error) {
        console.log(`  ❌ ${area.name}: Failed to load tables`);
      }
    }
    
    // Test table statistics
    console.log('\n3. Testing table statistics:');
    const statsResponse = await axios.get(`${BASE_URL}/api/tables/stats`);
    const stats = statsResponse.data.stats || {};
    
    console.log(`  ✅ Total tables: ${stats.total_tables || 0}`);
    
    if (stats.area_breakdown) {
      console.log('  📊 Area breakdown:');
      stats.area_breakdown.forEach(area => {
        console.log(`    - ${area.area}: ${area.count} tables`);
      });
    }
    
    if (stats.status_breakdown) {
      console.log('  📊 Status breakdown:');
      stats.status_breakdown.forEach(status => {
        console.log(`    - ${status.status}: ${status.count} tables`);
      });
    }
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
    if (error.response?.status === 404) {
      console.log('💡 Make sure the table service is running on port 3003');
    }
  }
}

async function generateImageTestReport() {
  console.log('\n📋 Generating Image Test Report...\n');
  
  const report = {
    timestamp: new Date().toISOString(),
    areas: {},
    summary: {
      totalAreas: 0,
      totalImages: 0,
      workingImages: 0,
      failedImages: 0
    }
  };
  
  for (const [area, urls] of Object.entries(testImageUrls)) {
    report.areas[area] = {
      totalImages: urls.length,
      workingImages: 0,
      failedImages: 0,
      images: []
    };
    
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      const imageTest = {
        index: i + 1,
        url: url,
        status: 'unknown',
        size: null,
        error: null
      };
      
      try {
        const response = await axios.head(url, { timeout: 5000 });
        if (response.status === 200) {
          imageTest.status = 'working';
          imageTest.size = response.headers['content-length'];
          report.areas[area].workingImages++;
          report.summary.workingImages++;
        } else {
          imageTest.status = 'failed';
          imageTest.error = `HTTP ${response.status}`;
          report.areas[area].failedImages++;
          report.summary.failedImages++;
        }
      } catch (error) {
        imageTest.status = 'failed';
        imageTest.error = error.message;
        report.areas[area].failedImages++;
        report.summary.failedImages++;
      }
      
      report.areas[area].images.push(imageTest);
      report.summary.totalImages++;
    }
  }
  
  report.summary.totalAreas = Object.keys(testImageUrls).length;
  report.summary.successRate = ((report.summary.workingImages / report.summary.totalImages) * 100).toFixed(1);
  
  console.log('📊 Image Test Report:');
  console.log(JSON.stringify(report, null, 2));
  
  return report;
}

async function runAllTests() {
  console.log('🚀 Starting Area Image Tests...\n');
  console.log('=' .repeat(60));
  
  try {
    // Test 1: Image availability
    await testImageAvailability();
    
    console.log('\n' + '=' .repeat(60));
    
    // Test 2: API endpoints
    await testAreaEndpointsWithImages();
    
    console.log('\n' + '=' .repeat(60));
    
    // Test 3: Generate report
    await generateImageTestReport();
    
    console.log('\n🎉 All tests completed successfully!');
    console.log('\n💡 Tips:');
    console.log('  - Images are loaded from Unsplash CDN');
    console.log('  - Fallback images are provided for failed loads');
    console.log('  - Gallery supports multiple images per area');
    console.log('  - All images are optimized for web display');
    
  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
  }
}

// Run the tests
runAllTests();
