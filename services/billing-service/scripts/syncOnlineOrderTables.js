const { sequelize } = require('../config/database');
const { DonHangOnline, CTDonHangOnline } = require('../models');

async function syncOnlineOrderTables() {
  try {
    console.log('🔄 Syncing online order tables...');
    
    // Check if tables exist
    const [donhangResults] = await sequelize.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'QuanLyCafe' 
      AND table_name = 'DonHangOnline'
    `);
    
    const [ctResults] = await sequelize.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'QuanLyCafe' 
      AND table_name = 'CTDonHangOnline'
    `);
    
    console.log('📊 DonHangOnline table exists:', donhangResults[0].count > 0);
    console.log('📊 CTDonHangOnline table exists:', ctResults[0].count > 0);
    
    if (donhangResults[0].count === 0 || ctResults[0].count === 0) {
      console.log('⚠️  Tables missing! Creating them...');
      
      // Force sync to create tables
      await DonHangOnline.sync({ force: false, alter: true });
      await CTDonHangOnline.sync({ force: false, alter: true });
      
      console.log('✅ Online order tables created successfully!');
    } else {
      console.log('✅ Online order tables already exist');
      
      // Just sync without altering
      await DonHangOnline.sync({ force: false });
      await CTDonHangOnline.sync({ force: false });
    }
    
    // Test insert
    console.log('\n🧪 Testing insert...');
    const testOrder = await DonHangOnline.create({
      TenKhach: 'Test Customer',
      SDTKhach: '0123456789',
      DiaChiGiaoHang: 'Test Address',
      LoaiDonHang: 'Giao hàng',
      TongTien: 100000,
      PhiGiaoHang: 0,
      TongThanhToan: 100000,
      GiamGia: 0
    });
    
    console.log('✅ Test order created:', testOrder.MaDHOnline);
    
    // Delete test order
    await testOrder.destroy();
    console.log('✅ Test order deleted');
    
    console.log('\n✅ All checks passed!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

syncOnlineOrderTables();
