const { sequelize } = require('../config/database');
const { DatBan, Ban } = require('../models');
const { QueryTypes } = require('sequelize');

/**
 * Script test hệ thống tự động hủy đơn đặt bàn
 */

async function createTestExpiredReservations() {
  try {
    console.log('🧪 Tạo dữ liệu test cho đơn đặt bàn quá hạn...');

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const testReservations = [
      // Đơn đặt bàn hôm qua (quá hạn)
      {
        MaBan: 1,
        NgayDat: yesterday.toISOString().split('T')[0],
        GioDat: '19:00:00',
        GioKetThuc: '21:00:00',
        SoNguoi: 4,
        TrangThai: 'Đã đặt',
        TenKhach: 'Test Customer 1',
        SoDienThoai: '0123456789',
        GhiChu: 'Test reservation - should be auto cancelled'
      },
      // Đơn đặt bàn hôm nay nhưng đã quá giờ + 30 phút
      {
        MaBan: 2,
        NgayDat: today.toISOString().split('T')[0],
        GioDat: '10:00:00',
        GioKetThuc: '12:00:00',
        SoNguoi: 2,
        TrangThai: 'Đã xác nhận',
        TenKhach: 'Test Customer 2',
        SoDienThoai: '0987654321',
        GhiChu: 'Test reservation - should be auto cancelled'
      },
      // Đơn đặt bàn hôm nay, sắp đến giờ (không hủy)
      {
        MaBan: 3,
        NgayDat: today.toISOString().split('T')[0],
        GioDat: '20:00:00',
        GioKetThuc: '22:00:00',
        SoNguoi: 6,
        TrangThai: 'Đã đặt',
        TenKhach: 'Test Customer 3',
        SoDienThoai: '0111222333',
        GhiChu: 'Test reservation - should NOT be cancelled'
      }
    ];

    for (const reservation of testReservations) {
      await DatBan.create(reservation);
      console.log(`✅ Tạo đơn test: ${reservation.TenKhach} - ${reservation.NgayDat} ${reservation.GioDat}`);
    }

    console.log('🎉 Tạo dữ liệu test thành công!');
    return testReservations.length;

  } catch (error) {
    console.error('❌ Lỗi khi tạo dữ liệu test:', error);
    throw error;
  }
}

async function testAutoCancelProcedure() {
  try {
    console.log('\n🔄 Test stored procedure TuDongHuyDonDatBanQuaHan...');

    // Gọi stored procedure
    const results = await sequelize.query(
      'CALL TuDongHuyDonDatBanQuaHan()',
      { type: QueryTypes.SELECT }
    );

    const result = results[0];
    console.log(`📊 Kết quả: Đã hủy ${result.SoDonDaHuy} đơn đặt bàn`);
    console.log(`⏰ Thời gian thực hiện: ${result.ThoiGianThucHien}`);
    console.log(`💬 Thông báo: ${result.ThongBao}`);

    return result;

  } catch (error) {
    console.error('❌ Lỗi khi test auto cancel procedure:', error);
    throw error;
  }
}

async function testExpiringReservationsCheck() {
  try {
    console.log('\n🔍 Test kiểm tra đơn sắp hết hạn...');

    // Kiểm tra đơn sắp hết hạn trong 60 phút
    const results = await sequelize.query(
      'CALL KiemTraDonSapHetHan(60)',
      { type: QueryTypes.SELECT }
    );

    console.log(`📋 Tìm thấy ${results.length} đơn sắp hết hạn:`);
    results.forEach(reservation => {
      console.log(`  - ${reservation.TenKhach}: ${reservation.TenBan} - ${reservation.GioDat} (${reservation.ThoiGianConLaiText})`);
    });

    return results;

  } catch (error) {
    console.error('❌ Lỗi khi test expiring check:', error);
    throw error;
  }
}

async function testTimeRemainingFunction() {
  try {
    console.log('\n⏱️ Test function tính thời gian còn lại...');

    const testCases = [
      { date: '2024-01-15', time: '19:00:00', description: 'Thời gian trong tương lai' },
      { date: '2023-01-15', time: '19:00:00', description: 'Thời gian trong quá khứ' },
      { date: new Date().toISOString().split('T')[0], time: new Date().toTimeString().split(' ')[0], description: 'Thời gian hiện tại' }
    ];

    for (const testCase of testCases) {
      const [result] = await sequelize.query(
        'SELECT TinhThoiGianConLai(?, ?) as ThoiGianConLai',
        {
          replacements: [testCase.date, testCase.time],
          type: QueryTypes.SELECT
        }
      );

      console.log(`  ${testCase.description}: ${testCase.date} ${testCase.time} → ${result.ThoiGianConLai}`);
    }

  } catch (error) {
    console.error('❌ Lỗi khi test time remaining function:', error);
    throw error;
  }
}

async function testCancelledReservationsReport() {
  try {
    console.log('\n📊 Test báo cáo đơn bị hủy...');

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7); // 7 ngày trước
    const endDate = new Date();

    const results = await sequelize.query(
      'CALL BaoCaoDonDatBanBiHuy(?, ?)',
      {
        replacements: [
          startDate.toISOString().split('T')[0],
          endDate.toISOString().split('T')[0]
        ],
        type: QueryTypes.SELECT
      }
    );

    console.log(`📈 Báo cáo đơn bị hủy (7 ngày qua):`);
    if (results.length === 0) {
      console.log('  Không có đơn nào bị hủy trong khoảng thời gian này');
    } else {
      results.forEach(day => {
        console.log(`  ${day.NgayTao}: ${day.TongSoDonHuy} đơn (${day.SoDonHuyTuDong} tự động, ${day.SoDonHuyThucCong} thủ công)`);
      });
    }

    return results;

  } catch (error) {
    console.error('❌ Lỗi khi test cancelled report:', error);
    throw error;
  }
}

async function checkEventSchedulerStatus() {
  try {
    console.log('\n🔧 Kiểm tra trạng thái Event Scheduler...');

    // Kiểm tra Event Scheduler
    const [schedulerStatus] = await sequelize.query(
      "SHOW VARIABLES LIKE 'event_scheduler'",
      { type: QueryTypes.SELECT }
    );

    console.log(`📋 Event Scheduler: ${schedulerStatus?.Value || 'Unknown'}`);

    // Kiểm tra event AutoCancelExpiredReservations
    const events = await sequelize.query(
      "SELECT EVENT_NAME, STATUS, INTERVAL_VALUE, INTERVAL_FIELD FROM information_schema.EVENTS WHERE EVENT_NAME = 'AutoCancelExpiredReservations'",
      { type: QueryTypes.SELECT }
    );

    if (events.length > 0) {
      const event = events[0];
      console.log(`🎯 Auto Cancel Event: ${event.STATUS} (chạy mỗi ${event.INTERVAL_VALUE} ${event.INTERVAL_FIELD})`);
    } else {
      console.log('⚠️ Auto Cancel Event chưa được tạo');
    }

    return { schedulerStatus, events };

  } catch (error) {
    console.error('❌ Lỗi khi kiểm tra Event Scheduler:', error);
    throw error;
  }
}

async function cleanupTestData() {
  try {
    console.log('\n🧹 Dọn dẹp dữ liệu test...');

    // Xóa các đơn đặt bàn test
    const deletedCount = await DatBan.destroy({
      where: {
        TenKhach: ['Test Customer 1', 'Test Customer 2', 'Test Customer 3']
      }
    });

    console.log(`✅ Đã xóa ${deletedCount} đơn đặt bàn test`);

    // Xóa log test
    await sequelize.query(
      "DELETE FROM LogHeThong WHERE MoTa LIKE '%test%'",
      { type: QueryTypes.DELETE }
    );

    console.log('✅ Đã xóa log test');

  } catch (error) {
    console.error('❌ Lỗi khi dọn dẹp:', error);
  }
}

async function createTestTablesInUse() {
  try {
    console.log('🧪 Tạo dữ liệu test cho bàn đang sử dụng...');

    const { Ban } = require('../models');

    // Tạo một số bàn ở trạng thái "Đang sử dụng"
    await Ban.update(
      { TrangThai: 'Đang sử dụng' },
      { where: { MaBan: [1, 2, 3] } }
    );

    console.log('✅ Đã tạo 3 bàn ở trạng thái "Đang sử dụng"');
    return 3;

  } catch (error) {
    console.error('❌ Lỗi khi tạo bàn test:', error);
    throw error;
  }
}

async function testResetTablesProcedure() {
  try {
    console.log('\n🌙 Test stored procedure TuDongResetBanThongMinh...');

    // Gọi stored procedure
    const results = await sequelize.query(
      'CALL TuDongResetBanThongMinh()',
      { type: QueryTypes.SELECT }
    );

    const result = results[0];
    console.log(`📊 Kết quả: Đã reset ${result.SoBanDaReset} bàn`);
    console.log(`⏰ Thời gian thực hiện: ${result.ThoiGianThucHien}`);
    console.log(`💬 Thông báo: ${result.ThongBao}`);

    return result;

  } catch (error) {
    console.error('❌ Lỗi khi test reset tables procedure:', error);
    throw error;
  }
}

async function testTableCanResetFunction() {
  try {
    console.log('\n🔍 Test function kiểm tra bàn có thể reset...');

    const testTableIds = [1, 2, 3];

    for (const tableId of testTableIds) {
      const [result] = await sequelize.query(
        'SELECT KiemTraBanCoTheReset(?) as CoTheReset',
        {
          replacements: [tableId],
          type: QueryTypes.SELECT
        }
      );

      console.log(`  Bàn ${tableId}: ${result.CoTheReset === 1 ? 'Có thể reset' : 'Không thể reset'}`);
    }

  } catch (error) {
    console.error('❌ Lỗi khi test table can reset function:', error);
    throw error;
  }
}

async function testResetTablesReport() {
  try {
    console.log('\n📊 Test báo cáo reset bàn...');

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7); // 7 ngày trước
    const endDate = new Date();

    const results = await sequelize.query(
      'CALL BaoCaoResetBanTheoNgay(?, ?)',
      {
        replacements: [
          startDate.toISOString().split('T')[0],
          endDate.toISOString().split('T')[0]
        ],
        type: QueryTypes.SELECT
      }
    );

    console.log(`📈 Báo cáo reset bàn (7 ngày qua):`);
    if (results.length === 0) {
      console.log('  Không có dữ liệu reset bàn trong khoảng thời gian này');
    } else {
      results.forEach(day => {
        console.log(`  ${day.NgayReset}: Tổng ${day.TongSoBanReset} bàn (${day.SoBanResetThongMinh} thông minh, ${day.SoBanResetToanBo} toàn bộ)`);
      });
    }

    return results;

  } catch (error) {
    console.error('❌ Lỗi khi test reset tables report:', error);
    throw error;
  }
}

async function runFullTest() {
  console.log('🚀 Bắt đầu test hệ thống tự động hủy đơn đặt bàn và reset bàn...\n');

  try {
    // 1. Tạo dữ liệu test cho đặt bàn
    await createTestExpiredReservations();

    // 2. Tạo dữ liệu test cho reset bàn
    await createTestTablesInUse();

    // 3. Test auto cancel procedure
    await testAutoCancelProcedure();

    // 4. Test reset tables procedure
    await testResetTablesProcedure();

    // 5. Test expiring reservations check
    await testExpiringReservationsCheck();

    // 6. Test table can reset function
    await testTableCanResetFunction();

    // 7. Test time remaining function
    await testTimeRemainingFunction();

    // 8. Test cancelled reservations report
    await testCancelledReservationsReport();

    // 9. Test reset tables report
    await testResetTablesReport();

    // 10. Check Event Scheduler status
    await checkEventSchedulerStatus();

    console.log('\n🎉 Tất cả test đã hoàn thành thành công!');

  } catch (error) {
    console.error('\n❌ Test thất bại:', error);
  } finally {
    // Cleanup
    await cleanupTestData();
    console.log('\n✅ Test hoàn tất và đã dọn dẹp dữ liệu');
  }
}

// Chạy test nếu file được gọi trực tiếp
if (require.main === module) {
  runFullTest()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = {
  createTestExpiredReservations,
  testAutoCancelProcedure,
  testExpiringReservationsCheck,
  testTimeRemainingFunction,
  testCancelledReservationsReport,
  checkEventSchedulerStatus,
  createTestTablesInUse,
  testResetTablesProcedure,
  testTableCanResetFunction,
  testResetTablesReport,
  cleanupTestData,
  runFullTest
};
