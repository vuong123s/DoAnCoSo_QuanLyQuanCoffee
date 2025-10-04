const { KhuVuc, Ban } = require('../models');
const { sequelize } = require('../config/database');

// Sample area data with Vietnamese descriptions and media
const sampleAreas = [
  {
    TenKhuVuc: 'Tầng 1',
    MoTa: 'Khu vực chính với không gian rộng rãi, gần quầy bar và bếp. Phù hợp cho khách hàng muốn theo dõi hoạt động của quán.',
    HinhAnh: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    Video: 'https://www.youtube.com/watch?v=sample-tang1',
    TrangThai: 'Hoạt động'
  },
  {
    TenKhuVuc: 'Tầng 2',
    MoTa: 'Tầng trên yên tĩnh với các phòng riêng và ban công. Lý tưởng cho các cuộc họp kinh doanh và hẹn hò.',
    HinhAnh: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    Video: 'https://www.youtube.com/watch?v=sample-tang2',
    TrangThai: 'Hoạt động'
  },
  {
    TenKhuVuc: 'VIP',
    MoTa: 'Khu vực cao cấp với phòng riêng sang trọng và dịch vụ đặc biệt. Dành cho khách hàng VIP và sự kiện quan trọng.',
    HinhAnh: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    Video: 'https://www.youtube.com/watch?v=sample-vip',
    TrangThai: 'Hoạt động'
  },
  {
    TenKhuVuc: 'Sân thượng',
    MoTa: 'Không gian mở với tầm nhìn đẹp và không khí trong lành. Hoàn hảo cho những buổi tối lãng mạn và tiệc ngoài trời.',
    HinhAnh: 'https://images.unsplash.com/photo-1519947486511-46149fa0a254?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    Video: 'https://www.youtube.com/watch?v=sample-rooftop',
    TrangThai: 'Hoạt động'
  },
  {
    TenKhuVuc: 'Ngoài trời',
    MoTa: 'Sân vườn xanh mát với không gian tự nhiên thư giãn. Thích hợp cho gia đình và nhóm bạn thích không gian mở.',
    HinhAnh: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    Video: 'https://www.youtube.com/watch?v=sample-outdoor',
    TrangThai: 'Hoạt động'
  }
];

// Function to generate tables for each area
const generateTablesForArea = (areaId, areaName) => {
  const tables = [];
  let tableCount = 0;
  let capacities = [];
  let prefix = '';
  
  // Define table characteristics based on area
  switch (areaName) {
    case 'Tầng 1':
      tableCount = 12;
      capacities = [2, 2, 4, 4, 4, 4, 6, 6, 6, 8, 8, 10];
      prefix = 'T1';
      break;
    case 'Tầng 2':
      tableCount = 8;
      capacities = [2, 4, 4, 4, 6, 6, 8, 8];
      prefix = 'T2';
      break;
    case 'VIP':
      tableCount = 4;
      capacities = [4, 6, 8, 12];
      prefix = 'VIP';
      break;
    case 'Sân thượng':
      tableCount = 6;
      capacities = [2, 4, 4, 6, 6, 8];
      prefix = 'ST';
      break;
    case 'Ngoài trời':
      tableCount = 8;
      capacities = [4, 4, 4, 6, 6, 6, 8, 10];
      prefix = 'NT';
      break;
  }
  
  // Generate positions based on area type
  const positions = [
    'Góc trái', 'Góc phải', 'Giữa phòng', 'Gần cửa sổ', 'Gần cửa ra vào',
    'Khu vực yên tĩnh', 'Gần quầy bar', 'Ban công', 'Dưới bóng cây', 'Tầm nhìn đẹp'
  ];
  
  for (let i = 0; i < tableCount; i++) {
    const tableNumber = String(i + 1).padStart(2, '0');
    const capacity = capacities[i] || 4;
    const position = positions[i % positions.length];
    
    tables.push({
      TenBan: `${prefix}-${tableNumber}`,
      SoCho: capacity,
      MaKhuVuc: areaId,
      ViTri: position,
      TrangThai: 'Trống'
    });
  }
  
  return tables;
};

// Main seeding function
const seedAreasAndTables = async () => {
  try {
    console.log('🌱 Starting to seed areas and tables...');
    
    // Start transaction
    const transaction = await sequelize.transaction();
    
    try {
      // Clear existing data
      console.log('🧹 Clearing existing data...');
      await Ban.destroy({ where: {}, transaction });
      await KhuVuc.destroy({ where: {}, transaction });
      
      // Create areas
      console.log('📍 Creating areas...');
      const createdAreas = await KhuVuc.bulkCreate(sampleAreas, { 
        transaction,
        returning: true 
      });
      
      console.log(`✅ Created ${createdAreas.length} areas`);
      
      // Create tables for each area
      console.log('🪑 Creating tables...');
      let allTables = [];
      
      for (const area of createdAreas) {
        const tables = generateTablesForArea(area.MaKhuVuc, area.TenKhuVuc);
        allTables = allTables.concat(tables);
        console.log(`  📋 Generated ${tables.length} tables for ${area.TenKhuVuc}`);
      }
      
      await Ban.bulkCreate(allTables, { transaction });
      console.log(`✅ Created ${allTables.length} tables total`);
      
      // Commit transaction
      await transaction.commit();
      
      // Display summary
      console.log('\n📊 SEEDING SUMMARY');
      console.log('=' .repeat(50));
      
      for (const area of createdAreas) {
        const tableCount = allTables.filter(t => t.MaKhuVuc === area.MaKhuVuc).length;
        const capacityRange = allTables
          .filter(t => t.MaKhuVuc === area.MaKhuVuc)
          .map(t => t.SoCho);
        const minCapacity = Math.min(...capacityRange);
        const maxCapacity = Math.max(...capacityRange);
        const totalCapacity = capacityRange.reduce((sum, cap) => sum + cap, 0);
        
        console.log(`🏢 ${area.TenKhuVuc}:`);
        console.log(`   Tables: ${tableCount}`);
        console.log(`   Capacity: ${minCapacity}-${maxCapacity} seats per table`);
        console.log(`   Total capacity: ${totalCapacity} seats`);
        console.log(`   Status: ${area.TrangThai}`);
        console.log('');
      }
      
      const totalTables = allTables.length;
      const totalCapacity = allTables.reduce((sum, table) => sum + table.SoCho, 0);
      
      console.log(`🎯 OVERALL STATISTICS:`);
      console.log(`   Total Areas: ${createdAreas.length}`);
      console.log(`   Total Tables: ${totalTables}`);
      console.log(`   Total Seating Capacity: ${totalCapacity} people`);
      console.log(`   Average Table Size: ${(totalCapacity / totalTables).toFixed(1)} seats`);
      
      console.log('\n🎉 Seeding completed successfully!');
      
      // Test data integrity
      console.log('\n🔍 Verifying data integrity...');
      const areaCount = await KhuVuc.count();
      const tableCount = await Ban.count();
      
      console.log(`✅ Areas in database: ${areaCount}`);
      console.log(`✅ Tables in database: ${tableCount}`);
      
      if (areaCount === sampleAreas.length && tableCount === totalTables) {
        console.log('✅ Data integrity verified!');
      } else {
        console.log('⚠️ Data integrity check failed!');
      }
      
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
    
  } catch (error) {
    console.error('💥 Seeding failed:', error);
    throw error;
  }
};

// Function to display current data
const displayCurrentData = async () => {
  try {
    console.log('\n📋 CURRENT DATABASE STATE');
    console.log('=' .repeat(50));
    
    const areas = await KhuVuc.findAll({
      include: [{
        model: Ban,
        as: 'tables',
        attributes: ['MaBan', 'TenBan', 'SoCho', 'ViTri', 'TrangThai']
      }],
      order: [['MaKhuVuc', 'ASC']]
    });
    
    if (areas.length === 0) {
      console.log('📭 No areas found in database');
      return;
    }
    
    for (const area of areas) {
      console.log(`\n🏢 ${area.TenKhuVuc} (ID: ${area.MaKhuVuc})`);
      console.log(`   📝 Description: ${area.MoTa}`);
      console.log(`   🖼️ Image: ${area.HinhAnh ? 'Yes' : 'No'}`);
      console.log(`   🎥 Video: ${area.Video ? 'Yes' : 'No'}`);
      console.log(`   📊 Status: ${area.TrangThai}`);
      
      if (area.tables && area.tables.length > 0) {
        console.log(`   🪑 Tables (${area.tables.length}):`);
        area.tables.forEach(table => {
          console.log(`      ${table.TenBan}: ${table.SoCho} seats, ${table.ViTri}, ${table.TrangThai}`);
        });
        
        const totalCapacity = area.tables.reduce((sum, table) => sum + table.SoCho, 0);
        console.log(`   🎯 Total capacity: ${totalCapacity} seats`);
      } else {
        console.log('   🪑 No tables');
      }
    }
    
  } catch (error) {
    console.error('💥 Failed to display current data:', error);
  }
};

// Command line interface
const main = async () => {
  const command = process.argv[2];
  
  try {
    switch (command) {
      case 'seed':
        await seedAreasAndTables();
        break;
      case 'display':
        await displayCurrentData();
        break;
      case 'reset':
        await seedAreasAndTables();
        await displayCurrentData();
        break;
      default:
        console.log('📖 Usage:');
        console.log('  node seedAreasAndTables.js seed    - Seed database with sample data');
        console.log('  node seedAreasAndTables.js display - Display current database state');
        console.log('  node seedAreasAndTables.js reset   - Reset and seed database');
        break;
    }
  } catch (error) {
    console.error('💥 Command failed:', error);
    process.exit(1);
  }
  
  process.exit(0);
};

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  seedAreasAndTables,
  displayCurrentData,
  sampleAreas
};
