const { sequelize } = require('./config/database');

const migrateDatBanTable = async () => {
  try {
    console.log('🔄 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connected successfully.');

    console.log('🔄 Adding missing columns to DatBan table...');
    
    // Add TenKhach column if it doesn't exist
    try {
      await sequelize.query(`
        ALTER TABLE DatBan 
        ADD COLUMN TenKhach VARCHAR(100) COMMENT 'Tên khách hàng đặt bàn'
      `);
      console.log('✅ Added TenKhach column');
    } catch (error) {
      if (error.original && error.original.code === 'ER_DUP_FIELDNAME') {
        console.log('⚠️  TenKhach column already exists');
      } else {
        throw error;
      }
    }

    // Add SoDienThoai column if it doesn't exist
    try {
      await sequelize.query(`
        ALTER TABLE DatBan 
        ADD COLUMN SoDienThoai VARCHAR(15) COMMENT 'Số điện thoại khách hàng'
      `);
      console.log('✅ Added SoDienThoai column');
    } catch (error) {
      if (error.original && error.original.code === 'ER_DUP_FIELDNAME') {
        console.log('⚠️  SoDienThoai column already exists');
      } else {
        throw error;
      }
    }

    // Add GhiChu column if it doesn't exist
    try {
      await sequelize.query(`
        ALTER TABLE DatBan 
        ADD COLUMN GhiChu TEXT COMMENT 'Ghi chú đặt bàn'
      `);
      console.log('✅ Added GhiChu column');
    } catch (error) {
      if (error.original && error.original.code === 'ER_DUP_FIELDNAME') {
        console.log('⚠️  GhiChu column already exists');
      } else {
        throw error;
      }
    }

    // Verify table structure
    console.log('\n📋 Verifying DatBan table structure...');
    const [results] = await sequelize.query('DESCRIBE DatBan');
    console.log('Current DatBan columns:');
    results.forEach(column => {
      console.log(`   - ${column.Field}: ${column.Type} ${column.Null === 'YES' ? '(nullable)' : '(not null)'}`);
    });

    console.log('\n🎉 DatBan table migration completed successfully!');

  } catch (error) {
    console.error('❌ Error migrating DatBan table:', error);
    console.error('Full error:', error.message);
  } finally {
    await sequelize.close();
    console.log('🔌 Database connection closed.');
  }
};

// Run the migration function if this file is executed directly
if (require.main === module) {
  migrateDatBanTable();
}

module.exports = migrateDatBanTable;
