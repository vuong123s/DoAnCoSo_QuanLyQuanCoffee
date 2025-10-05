const { sequelize } = require('../config/database');
const { QueryTypes } = require('sequelize');
const autoCancelJob = require('../jobs/autoCancelJob');

/**
 * Controller cho tự động hủy đơn đặt bàn quá hạn
 */

// Chạy thủ công hủy đơn đặt bàn quá hạn
const manualCancelExpiredReservations = async (req, res) => {
  try {
    console.log('🔄 Bắt đầu hủy đơn đặt bàn quá hạn...');

    // Gọi stored procedure TuDongHuyDonDatBanQuaHan
    const results = await sequelize.query(
      'CALL TuDongHuyDonDatBanQuaHan()',
      { type: QueryTypes.SELECT }
    );

    const result = results[0];

    console.log(`✅ Đã hủy ${result.SoDonDaHuy} đơn đặt bàn quá hạn`);

    res.json({
      success: true,
      message: result.ThongBao,
      data: {
        cancelled_count: result.SoDonDaHuy,
        execution_time: result.ThoiGianThucHien,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Lỗi khi hủy đơn đặt bàn quá hạn:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi hủy đơn đặt bàn quá hạn',
      error: error.message
    });
  }
};

// Kiểm tra đơn đặt bàn sắp hết hạn
const checkExpiringReservations = async (req, res) => {
  try {
    const { minutes = 15 } = req.query;

    console.log(`🔍 Kiểm tra đơn đặt bàn sắp hết hạn trong ${minutes} phút...`);

    // Gọi stored procedure KiemTraDonSapHetHan
    const results = await sequelize.query(
      'CALL KiemTraDonSapHetHan(?)',
      {
        replacements: [parseInt(minutes)],
        type: QueryTypes.SELECT
      }
    );

    res.json({
      success: true,
      message: `Tìm thấy ${results.length} đơn đặt bàn sắp hết hạn`,
      data: {
        warning_minutes: parseInt(minutes),
        expiring_reservations: results,
        count: results.length,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Lỗi khi kiểm tra đơn sắp hết hạn:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi kiểm tra đơn sắp hết hạn',
      error: error.message
    });
  }
};

// Lấy báo cáo đơn đặt bàn bị hủy
const getCancelledReservationsReport = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin: start_date, end_date'
      });
    }

    console.log(`📊 Lấy báo cáo đơn bị hủy từ ${start_date} đến ${end_date}...`);

    // Gọi stored procedure BaoCaoDonDatBanBiHuy
    const results = await sequelize.query(
      'CALL BaoCaoDonDatBanBiHuy(?, ?)',
      {
        replacements: [start_date, end_date],
        type: QueryTypes.SELECT
      }
    );

    // Tính tổng thống kê
    const totalStats = results.reduce((acc, day) => {
      acc.total_cancelled += day.TongSoDonHuy || 0;
      acc.auto_cancelled += day.SoDonHuyTuDong || 0;
      acc.manual_cancelled += day.SoDonHuyThucCong || 0;
      acc.total_guests_affected += day.TongSoKhachBiHuy || 0;
      return acc;
    }, {
      total_cancelled: 0,
      auto_cancelled: 0,
      manual_cancelled: 0,
      total_guests_affected: 0
    });

    res.json({
      success: true,
      message: `Báo cáo đơn bị hủy từ ${start_date} đến ${end_date}`,
      data: {
        period: {
          start_date,
          end_date,
          total_days: results.length
        },
        daily_reports: results,
        summary: {
          ...totalStats,
          auto_cancel_rate: totalStats.total_cancelled > 0 
            ? ((totalStats.auto_cancelled / totalStats.total_cancelled) * 100).toFixed(1) + '%' 
            : '0%',
          average_cancelled_per_day: results.length > 0 
            ? (totalStats.total_cancelled / results.length).toFixed(1) 
            : 0
        },
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Lỗi khi lấy báo cáo đơn bị hủy:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy báo cáo đơn bị hủy',
      error: error.message
    });
  }
};

// Tính thời gian còn lại đến giờ đặt bàn
const calculateTimeRemaining = async (req, res) => {
  try {
    const { date, time } = req.query;

    if (!date || !time) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin: date, time'
      });
    }

    // Gọi function TinhThoiGianConLai
    const [result] = await sequelize.query(
      'SELECT TinhThoiGianConLai(?, ?) as ThoiGianConLai',
      {
        replacements: [date, time],
        type: QueryTypes.SELECT
      }
    );

    res.json({
      success: true,
      data: {
        reservation_date: date,
        reservation_time: time,
        time_remaining: result.ThoiGianConLai,
        current_time: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Lỗi khi tính thời gian còn lại:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tính thời gian còn lại',
      error: error.message
    });
  }
};

// Lấy log hệ thống tự động hủy
const getAutoCancelLogs = async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    console.log(`📋 Lấy ${limit} log gần nhất của tự động hủy đơn...`);

    const logs = await sequelize.query(
      `SELECT * FROM LogHeThong 
       WHERE HanhDong = 'AUTO_CANCEL_RESERVATIONS' 
       ORDER BY ThoiGian DESC 
       LIMIT ?`,
      {
        replacements: [parseInt(limit)],
        type: QueryTypes.SELECT
      }
    );

    res.json({
      success: true,
      message: `Lấy được ${logs.length} log tự động hủy đơn`,
      data: {
        logs,
        count: logs.length,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Lỗi khi lấy log tự động hủy:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy log tự động hủy',
      error: error.message
    });
  }
};

// Kiểm tra trạng thái Event Scheduler
const checkEventSchedulerStatus = async (req, res) => {
  try {
    console.log('🔍 Kiểm tra trạng thái Event Scheduler...');

    // Kiểm tra Event Scheduler có bật không
    const [schedulerStatus] = await sequelize.query(
      "SHOW VARIABLES LIKE 'event_scheduler'",
      { type: QueryTypes.SELECT }
    );

    // Kiểm tra event AutoCancelExpiredReservations
    const [eventStatus] = await sequelize.query(
      "SELECT * FROM information_schema.EVENTS WHERE EVENT_NAME = 'AutoCancelExpiredReservations'",
      { type: QueryTypes.SELECT }
    );

    res.json({
      success: true,
      data: {
        event_scheduler_enabled: schedulerStatus?.Value === 'ON',
        auto_cancel_event_exists: !!eventStatus,
        event_details: eventStatus || null,
        recommendations: schedulerStatus?.Value !== 'ON' 
          ? ['Bật Event Scheduler bằng lệnh: SET GLOBAL event_scheduler = ON;']
          : ['Event Scheduler đang hoạt động bình thường'],
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Lỗi khi kiểm tra Event Scheduler:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi kiểm tra Event Scheduler',
      error: error.message
    });
  }
};

// Lấy trạng thái cron job
const getJobStatus = async (req, res) => {
  try {
    const status = autoCancelJob.getStatus();
    
    res.json({
      success: true,
      message: 'Trạng thái Auto Cancel Job',
      data: {
        ...status,
        uptime: process.uptime(),
        memory_usage: process.memoryUsage(),
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Lỗi khi lấy trạng thái job:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy trạng thái job',
      error: error.message
    });
  }
};

// Chạy thủ công cron job
const runJobManually = async (req, res) => {
  try {
    console.log('🔧 Chạy thủ công Auto Cancel Job...');
    
    const result = await autoCancelJob.runManually();
    
    res.json({
      success: true,
      message: 'Đã chạy thủ công Auto Cancel Job',
      data: {
        cancelled_count: result.SoDonDaHuy || 0,
        message: result.ThongBao,
        execution_time: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Lỗi khi chạy thủ công job:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi chạy thủ công job',
      error: error.message
    });
  }
};

// Chạy thủ công reset bàn lúc 10h tối
const runResetTablesManually = async (req, res) => {
  try {
    console.log('🌙 Chạy thủ công Reset Tables Job...');
    
    const result = await autoCancelJob.runResetManually();
    
    res.json({
      success: true,
      message: 'Đã chạy thủ công Reset Tables Job',
      data: {
        reset_count: result.SoBanDaReset || 0,
        message: result.ThongBao,
        execution_time: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Lỗi khi chạy thủ công reset tables job:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi chạy thủ công reset tables job',
      error: error.message
    });
  }
};

// Lấy báo cáo reset bàn theo ngày
const getTableResetReport = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin: start_date, end_date'
      });
    }

    console.log(`📊 Lấy báo cáo reset bàn từ ${start_date} đến ${end_date}...`);

    // Gọi stored procedure BaoCaoResetBanTheoNgay
    const results = await sequelize.query(
      'CALL BaoCaoResetBanTheoNgay(?, ?)',
      {
        replacements: [start_date, end_date],
        type: QueryTypes.SELECT
      }
    );

    // Tính tổng thống kê
    const totalStats = results.reduce((acc, day) => {
      acc.total_reset_all += day.SoBanResetToanBo || 0;
      acc.total_reset_smart += day.SoBanResetThongMinh || 0;
      acc.total_reset += day.TongSoBanReset || 0;
      acc.total_executions += day.SoLanChay || 0;
      return acc;
    }, {
      total_reset_all: 0,
      total_reset_smart: 0,
      total_reset: 0,
      total_executions: 0
    });

    res.json({
      success: true,
      message: `Báo cáo reset bàn từ ${start_date} đến ${end_date}`,
      data: {
        period: {
          start_date,
          end_date,
          total_days: results.length
        },
        daily_reports: results,
        summary: {
          ...totalStats,
          average_reset_per_day: results.length > 0 
            ? (totalStats.total_reset / results.length).toFixed(1) 
            : 0,
          smart_reset_percentage: totalStats.total_reset > 0 
            ? ((totalStats.total_reset_smart / totalStats.total_reset) * 100).toFixed(1) + '%' 
            : '0%'
        },
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Lỗi khi lấy báo cáo reset bàn:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy báo cáo reset bàn',
      error: error.message
    });
  }
};

// Kiểm tra bàn có thể reset không
const checkTableCanReset = async (req, res) => {
  try {
    const { table_id } = req.params;

    if (!table_id) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin: table_id'
      });
    }

    // Gọi function KiemTraBanCoTheReset
    const [result] = await sequelize.query(
      'SELECT KiemTraBanCoTheReset(?) as CoTheReset',
      {
        replacements: [table_id],
        type: QueryTypes.SELECT
      }
    );

    res.json({
      success: true,
      data: {
        table_id: parseInt(table_id),
        can_reset: result.CoTheReset === 1,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Lỗi khi kiểm tra bàn có thể reset:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi kiểm tra bàn có thể reset',
      error: error.message
    });
  }
};

module.exports = {
  manualCancelExpiredReservations,
  checkExpiringReservations,
  getCancelledReservationsReport,
  calculateTimeRemaining,
  getAutoCancelLogs,
  checkEventSchedulerStatus,
  getJobStatus,
  runJobManually,
  runResetTablesManually,
  getTableResetReport,
  checkTableCanReset
};
