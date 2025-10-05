const { Ban } = require('../models');
const { sequelize } = require('../config/database');

const sampleTables = [
  // Tầng 1 - Main dining area
  { TenBan: 'T1-01', SoCho: 2, TrangThai: 'Trống', KhuVuc: 'Tầng 1', ViTri: 'Gần cửa sổ' },
  { TenBan: 'T1-02', SoCho: 4, TrangThai: 'Trống', KhuVuc: 'Tầng 1', ViTri: 'Giữa phòng' },
  { TenBan: 'T1-03', SoCho: 2, TrangThai: 'Trống', KhuVuc: 'Tầng 1', ViTri: 'Góc phòng' },
  { TenBan: 'T1-04', SoCho: 6, TrangThai: 'Trống', KhuVuc: 'Tầng 1', ViTri: 'Trung tâm' },
  { TenBan: 'T1-05', SoCho: 4, TrangThai: 'Trống', KhuVuc: 'Tầng 1', ViTri: 'Gần quầy bar' },
  { TenBan: 'T1-06', SoCho: 2, TrangThai: 'Trống', KhuVuc: 'Tầng 1', ViTri: 'Gần cửa ra vào' },
  { TenBan: 'T1-07', SoCho: 8, TrangThai: 'Trống', KhuVuc: 'Tầng 1', ViTri: 'Bàn dài' },
  { TenBan: 'T1-08', SoCho: 4, TrangThai: 'Trống', KhuVuc: 'Tầng 1', ViTri: 'Gần bếp' },

  // Tầng 2 - Upper level
  { TenBan: 'T2-01', SoCho: 2, TrangThai: 'Trống', KhuVuc: 'Tầng 2', ViTri: 'Ban công' },
  { TenBan: 'T2-02', SoCho: 4, TrangThai: 'Trống', KhuVuc: 'Tầng 2', ViTri: 'Phòng riêng nhỏ' },
  { TenBan: 'T2-03', SoCho: 6, TrangThai: 'Trống', KhuVuc: 'Tầng 2', ViTri: 'Phòng riêng lớn' },
  { TenBan: 'T2-04', SoCho: 2, TrangThai: 'Trống', KhuVuc: 'Tầng 2', ViTri: 'Góc yên tĩnh' },
  { TenBan: 'T2-05', SoCho: 4, TrangThai: 'Trống', KhuVuc: 'Tầng 2', ViTri: 'Gần cầu thang' },
  { TenBan: 'T2-06', SoCho: 8, TrangThai: 'Trống', KhuVuc: 'Tầng 2', ViTri: 'Phòng họp' },

  // VIP Area
  { TenBan: 'VIP-01', SoCho: 4, TrangThai: 'Trống', KhuVuc: 'VIP', ViTri: 'Phòng VIP 1' },
  { TenBan: 'VIP-02', SoCho: 6, TrangThai: 'Trống', KhuVuc: 'VIP', ViTri: 'Phòng VIP 2' },
  { TenBan: 'VIP-03', SoCho: 8, TrangThai: 'Trống', KhuVuc: 'VIP', ViTri: 'Phòng VIP 3' },
  { TenBan: 'VIP-04', SoCho: 10, TrangThai: 'Trống', KhuVuc: 'VIP', ViTri: 'Phòng VIP lớn' },

  // Sân thượng - Rooftop
  { TenBan: 'ST-01', SoCho: 2, TrangThai: 'Trống', KhuVuc: 'Sân thượng', ViTri: 'Góc sân thượng' },
  { TenBan: 'ST-02', SoCho: 4, TrangThai: 'Trống', KhuVuc: 'Sân thượng', ViTri: 'Giữa sân thượng' },
  { TenBan: 'ST-03', SoCho: 6, TrangThai: 'Trống', KhuVuc: 'Sân thượng', ViTri: 'Gần lan can' },
  { TenBan: 'ST-04', SoCho: 2, TrangThai: 'Trống', KhuVuc: 'Sân thượng', ViTri: 'Dưới ô' },

  // Ngoài trời - Outdoor
  { TenBan: 'NT-01', SoCho: 4, TrangThai: 'Trống', KhuVuc: 'Ngoài trời', ViTri: 'Sân vườn' },
  { TenBan: 'NT-02', SoCho: 2, TrangThai: 'Trống', KhuVuc: 'Ngoài trời', ViTri: 'Dưới cây' },
  { TenBan: 'NT-03', SoCho: 6, TrangThai: 'Trống', KhuVuc: 'Ngoài trời', ViTri: 'Gần hồ nước' },
  { TenBan: 'NT-04', SoCho: 8, TrangThai: 'Trống', KhuVuc: 'Ngoài trời', ViTri: 'Sân hiên' }
];

async function seedTablesWithAreas() {
  try {
    console.log('Seeding tables with area information...');
    
    // Clear existing tables
    await Ban.destroy({ where: {} });
    console.log('Cleared existing tables');
    
    // Insert sample tables
    await Ban.bulkCreate(sampleTables);
    console.log(`Created ${sampleTables.length} sample tables with areas`);
    
    // Show summary by area
    const [results] = await sequelize.query(`
      SELECT KhuVuc, COUNT(*) as SoBan, 
             GROUP_CONCAT(TenBan ORDER BY TenBan) as DanhSachBan
      FROM Ban 
      GROUP BY KhuVuc 
      ORDER BY KhuVuc
    `);
    
    console.log('\nTables by area:');
    console.table(results);
    
    console.log('\nSeeding completed successfully!');
    
  } catch (error) {
    console.error('Error seeding tables:', error);
  } finally {
    await sequelize.close();
  }
}

// Run the seeding
seedTablesWithAreas();
