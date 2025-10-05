const { DatBan, Ban } = require('./models');
const { Op } = require('sequelize');
const { sequelize } = require('./config/database');

// Script để cập nhật trạng thái tất cả bàn dựa trên đặt bàn hiện tại
const updateAllTableStatus = async () => {
  try {
    console.log('🔄 Updating all table statuses based on current reservations...');
    
    // Kết nối database
    await sequelize.authenticate();
    console.log('✅ Database connected');

    const today = new Date().toISOString().split('T')[0];
    console.log(`📅 Processing for date: ${today}`);

    // Lấy tất cả bàn
    const allTables = await Ban.findAll({
      where: {
        TrangThai: { [Op.ne]: 'Bảo trì' } // Không cập nhật bàn đang bảo trì
      }
    });

    console.log(`📊 Found ${allTables.length} tables to process`);

    let updatedCount = 0;
    let unchangedCount = 0;

    for (const table of allTables) {
      // Tìm tất cả đặt bàn active cho bàn này trong ngày hôm nay
      const activeReservations = await DatBan.findAll({
        where: {
          MaBan: table.MaBan,
          NgayDat: today,
          TrangThai: ['Đã đặt', 'Đã xác nhận']
        }
      });

      let newStatus;
      if (activeReservations.length > 0) {
        newStatus = 'Đã đặt';
      } else {
        newStatus = 'Trống';
      }

      // Cập nhật trạng thái nếu khác với trạng thái hiện tại
      if (table.TrangThai !== newStatus) {
        await table.update({ TrangThai: newStatus });
        console.log(`📋 Updated table ${table.MaBan}: ${table.TrangThai} → ${newStatus} (${activeReservations.length} active reservations)`);
        updatedCount++;
      } else {
        console.log(`✅ Table ${table.MaBan}: ${table.TrangThai} (unchanged, ${activeReservations.length} active reservations)`);
        unchangedCount++;
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   - Updated: ${updatedCount} tables`);
    console.log(`   - Unchanged: ${unchangedCount} tables`);
    console.log(`   - Total processed: ${allTables.length} tables`);
    
    console.log('✅ All table statuses updated successfully!');
    
  } catch (error) {
    console.error('❌ Error updating table statuses:', error);
  } finally {
    await sequelize.close();
  }
};

// Chạy script nếu được gọi trực tiếp
if (require.main === module) {
  updateAllTableStatus();
}

module.exports = { updateAllTableStatus };
