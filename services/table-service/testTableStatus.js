const { DatBan, Ban } = require('./models');
const { Op } = require('sequelize');
const { sequelize } = require('./config/database');

// Test script để kiểm tra logic cập nhật trạng thái bàn
const testTableStatusLogic = async () => {
  try {
    console.log('🔄 Testing table status update logic...');
    
    // Kết nối database
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Test case 1: Tạo đặt bàn mới
    console.log('\n📋 Test Case 1: Tạo đặt bàn mới');
    const today = new Date().toISOString().split('T')[0];
    
    // Tìm bàn đầu tiên
    const table = await Ban.findOne();
    if (!table) {
      console.log('❌ Không tìm thấy bàn nào');
      return;
    }
    
    console.log(`📍 Testing với bàn ${table.MaBan} - Trạng thái hiện tại: ${table.TrangThai}`);
    
    // Tạo đặt bàn test
    const testReservation = await DatBan.create({
      MaBan: table.MaBan,
      NgayDat: today,
      GioDat: '14:00:00',
      SoNguoi: 4,
      TrangThai: 'Đã đặt',
      TenKhach: 'Test Customer',
      SoDienThoai: '0123456789'
    });
    
    console.log(`✅ Tạo đặt bàn test ID: ${testReservation.MaDat}`);
    
    // Kiểm tra trạng thái bàn sau khi tạo đặt bàn
    await table.reload();
    console.log(`📊 Trạng thái bàn sau khi tạo đặt bàn: ${table.TrangThai}`);
    
    // Test case 2: Cập nhật trạng thái đặt bàn
    console.log('\n📋 Test Case 2: Cập nhật trạng thái đặt bàn');
    
    // Cập nhật thành "Đã xác nhận"
    await testReservation.update({ TrangThai: 'Đã xác nhận' });
    await table.reload();
    console.log(`📊 Trạng thái bàn sau khi xác nhận: ${table.TrangThai}`);
    
    // Test case 3: Hủy đặt bàn
    console.log('\n📋 Test Case 3: Hủy đặt bàn');
    await testReservation.update({ TrangThai: 'Đã hủy' });
    
    // Kiểm tra xem có đặt bàn active nào khác không
    const activeReservations = await DatBan.findAll({
      where: {
        MaBan: table.MaBan,
        NgayDat: today,
        TrangThai: ['Đã đặt', 'Đã xác nhận']
      }
    });
    
    console.log(`📊 Số đặt bàn active còn lại: ${activeReservations.length}`);
    await table.reload();
    console.log(`📊 Trạng thái bàn sau khi hủy: ${table.TrangThai}`);
    
    // Test case 4: Tạo nhiều đặt bàn cho cùng một bàn
    console.log('\n📋 Test Case 4: Nhiều đặt bàn cho cùng bàn');
    
    const reservation2 = await DatBan.create({
      MaBan: table.MaBan,
      NgayDat: today,
      GioDat: '16:00:00',
      SoNguoi: 2,
      TrangThai: 'Đã đặt',
      TenKhach: 'Test Customer 2',
      SoDienThoai: '0987654321'
    });
    
    const reservation3 = await DatBan.create({
      MaBan: table.MaBan,
      NgayDat: today,
      GioDat: '18:00:00',
      SoNguoi: 6,
      TrangThai: 'Đã xác nhận',
      TenKhach: 'Test Customer 3',
      SoDienThoai: '0111222333'
    });
    
    await table.reload();
    console.log(`📊 Trạng thái bàn với 2 đặt bàn active: ${table.TrangThai}`);
    
    // Hủy một đặt bàn
    await reservation2.update({ TrangThai: 'Đã hủy' });
    await table.reload();
    console.log(`📊 Trạng thái bàn sau khi hủy 1 trong 2 đặt bàn: ${table.TrangThai}`);
    
    // Hoàn thành đặt bàn cuối cùng
    await reservation3.update({ TrangThai: 'Hoàn thành' });
    await table.reload();
    console.log(`📊 Trạng thái bàn sau khi hoàn thành tất cả: ${table.TrangThai}`);
    
    // Cleanup - xóa test data
    console.log('\n🧹 Cleaning up test data...');
    await testReservation.destroy();
    await reservation2.destroy();
    await reservation3.destroy();
    
    console.log('✅ Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await sequelize.close();
  }
};

// Chạy test
testTableStatusLogic();
