const cron = require('node-cron');
const { sequelize } = require('../config/database');
const { QueryTypes } = require('sequelize');

/**
 * Cron job để tự động hủy đơn đặt bàn quá hạn
 * Chạy mỗi 30 phút
 */

class AutoCancelJob {
  constructor() {
    this.isRunning = false;
    this.lastRun = null;
    this.totalCancelled = 0;
  }

  async executeCancelExpiredReservations() {
    if (this.isRunning) {
      console.log('⚠️ Auto cancel job đang chạy, bỏ qua lần này');
      return;
    }

    this.isRunning = true;
    const startTime = new Date();

    try {
      console.log(`🔄 [${startTime.toISOString()}] Bắt đầu tự động hủy đơn đặt bàn quá hạn...`);

      // Gọi stored procedure (nếu có)
      let result;
      try {
        const results = await sequelize.query(
          'CALL TuDongHuyDonDatBanQuaHan()',
          { type: QueryTypes.SELECT }
        );
        result = results[0];
      } catch (procError) {
        console.log('⚠️ Stored procedure không khả dụng, sử dụng logic JavaScript...');
        result = await this.executeJavaScriptLogic();
      }

      const endTime = new Date();
      const duration = endTime - startTime;

      this.lastRun = endTime;
      this.totalCancelled += result.SoDonDaHuy || 0;

      console.log(`✅ [${endTime.toISOString()}] Hoàn thành tự động hủy đơn:`);
      console.log(`   - Số đơn đã hủy: ${result.SoDonDaHuy || 0}`);
      console.log(`   - Thời gian thực hiện: ${duration}ms`);
      console.log(`   - Tổng đã hủy từ khi khởi động: ${this.totalCancelled}`);

      // Gửi thông báo nếu có đơn bị hủy
      if (result.SoDonDaHuy > 0) {
        await this.notifyExpiredReservations(result.SoDonDaHuy);
      }

      return result;

    } catch (error) {
      console.error('❌ Lỗi trong auto cancel job:', error);
      throw error;
    } finally {
      this.isRunning = false;
    }
  }

  async executeJavaScriptLogic() {
    try {
      const { DatBan, Ban } = require('../models');
      const { Op } = require('sequelize');

      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const currentTime = now.toTimeString().split(' ')[0];

      // Tìm các đơn đặt bàn quá hạn
      const expiredReservations = await DatBan.findAll({
        where: {
          TrangThai: ['Đã đặt', 'Đã xác nhận'],
          [Op.or]: [
            // Ngày đặt đã qua
            { NgayDat: { [Op.lt]: today } },
            // Ngày đặt hôm nay nhưng đã quá giờ + 30 phút
            {
              NgayDat: today,
              GioDat: { [Op.lt]: sequelize.literal(`SUBTIME('${currentTime}', '00:30:00')`) }
            }
          ]
        }
      });

      if (expiredReservations.length === 0) {
        return { SoDonDaHuy: 0, ThongBao: 'Không có đơn nào quá hạn' };
      }

      // Cập nhật trạng thái các đơn quá hạn
      const updatedCount = await DatBan.update(
        {
          TrangThai: 'Đã hủy',
          GhiChu: sequelize.literal(`CONCAT(IFNULL(GhiChu, ''), ' [Tự động hủy do quá hạn - ${now.toISOString()}]')`)
        },
        {
          where: {
            MaDat: expiredReservations.map(r => r.MaDat)
          }
        }
      );

      // Cập nhật trạng thái bàn về "Trống" nếu không còn đặt bàn active
      const tableIds = [...new Set(expiredReservations.map(r => r.MaBan))];
      
      for (const tableId of tableIds) {
        const activeReservations = await DatBan.count({
          where: {
            MaBan: tableId,
            TrangThai: ['Đã đặt', 'Đã xác nhận'],
            [Op.or]: [
              { NgayDat: { [Op.gt]: today } },
              {
                NgayDat: today,
                GioDat: { [Op.gt]: currentTime }
              }
            ]
          }
        });

        if (activeReservations === 0) {
          await Ban.update(
            { TrangThai: 'Trống' },
            { where: { MaBan: tableId } }
          );
        }
      }

      return {
        SoDonDaHuy: updatedCount[0] || 0,
        ThongBao: `Đã hủy ${updatedCount[0] || 0} đơn đặt bàn quá hạn`
      };

    } catch (error) {
      console.error('❌ Lỗi trong JavaScript logic:', error);
      throw error;
    }
  }

  async notifyExpiredReservations(count) {
    try {
      // Có thể tích hợp với hệ thống thông báo (email, SMS, webhook, etc.)
      console.log(`📧 Thông báo: Đã tự động hủy ${count} đơn đặt bàn quá hạn`);
      
      // Ví dụ: Gửi webhook notification
      // await this.sendWebhookNotification(count);
      
    } catch (error) {
      console.error('❌ Lỗi khi gửi thông báo:', error);
    }
  }

  async sendWebhookNotification(count) {
    // Placeholder cho webhook notification
    // const axios = require('axios');
    // await axios.post('YOUR_WEBHOOK_URL', {
    //   message: `Auto cancelled ${count} expired reservations`,
    //   timestamp: new Date().toISOString(),
    //   service: 'table-service'
    // });
  }

  async executeResetTablesAt10PM() {
    try {
      console.log(`🌙 [${new Date().toISOString()}] Bắt đầu reset bàn lúc 10h tối...`);

      // Gọi stored procedure (nếu có)
      let result;
      try {
        const results = await sequelize.query(
          'CALL TuDongResetBanThongMinh()',
          { type: QueryTypes.SELECT }
        );
        result = results[0];
      } catch (procError) {
        console.log('⚠️ Stored procedure không khả dụng, sử dụng logic JavaScript...');
        result = await this.executeResetTablesJavaScriptLogic();
      }

      console.log(`✅ Reset bàn hoàn thành: ${result.SoBanDaReset || 0} bàn đã được reset`);
      return result;

    } catch (error) {
      console.error('❌ Lỗi khi reset bàn lúc 10h tối:', error);
      throw error;
    }
  }

  async executeResetTablesJavaScriptLogic() {
    try {
      const { Ban, DatBan } = require('../models');
      const { Op } = require('sequelize');

      const now = new Date();
      const today = now.toISOString().split('T')[0];

      // Tìm các bàn "Đang sử dụng" không có đặt bàn active
      const tablesInUse = await Ban.findAll({
        where: { TrangThai: 'Đang sử dụng' }
      });

      let resetCount = 0;

      for (const table of tablesInUse) {
        // Kiểm tra có đặt bàn active không
        const activeReservations = await DatBan.count({
          where: {
            MaBan: table.MaBan,
            TrangThai: ['Đã đặt', 'Đã xác nhận'],
            [Op.or]: [
              // Có đặt bàn cho ngày mai hoặc sau đó
              { NgayDat: { [Op.gt]: today } },
              // Có đặt bàn hôm nay nhưng chưa đến giờ (sau 10h tối)
              {
                NgayDat: today,
                GioDat: { [Op.gt]: '22:00:00' }
              }
            ]
          }
        });

        // Nếu không có đặt bàn active thì reset
        if (activeReservations === 0) {
          await table.update({ TrangThai: 'Trống' });
          resetCount++;
        }
      }

      return {
        SoBanDaReset: resetCount,
        ThongBao: `Đã reset ${resetCount} bàn về trạng thái trống`
      };

    } catch (error) {
      console.error('❌ Lỗi trong JavaScript reset logic:', error);
      throw error;
    }
  }

  start() {
    console.log('🚀 Khởi động Auto Cancel Job...');
    
    // Job 1: Hủy đơn đặt bàn quá hạn - chạy mỗi 30 phút
    const cancelSchedule = process.env.AUTO_CANCEL_SCHEDULE || '0 */30 * * * *';
    
    this.cancelJob = cron.schedule(cancelSchedule, async () => {
      await this.executeCancelExpiredReservations();
    }, {
      scheduled: true,
      timezone: 'Asia/Ho_Chi_Minh'
    });

    // Job 2: Reset bàn lúc 10h tối mỗi ngày
    const resetSchedule = process.env.AUTO_RESET_SCHEDULE || '0 0 22 * * *';
    
    this.resetJob = cron.schedule(resetSchedule, async () => {
      await this.executeResetTablesAt10PM();
    }, {
      scheduled: true,
      timezone: 'Asia/Ho_Chi_Minh'
    });

    console.log(`✅ Auto Cancel Job đã được lên lịch: ${cancelSchedule}`);
    console.log(`✅ Auto Reset Tables Job đã được lên lịch: ${resetSchedule}`);
    console.log(`📅 Múi giờ: Asia/Ho_Chi_Minh`);
    
    // Chạy một lần ngay khi khởi động (optional)
    if (process.env.RUN_ON_STARTUP === 'true') {
      setTimeout(() => {
        this.executeCancelExpiredReservations();
      }, 5000); // Chờ 5 giây sau khi khởi động
    }
  }

  stop() {
    if (this.cancelJob) {
      this.cancelJob.stop();
      console.log('🛑 Auto Cancel Job đã dừng');
    }
    if (this.resetJob) {
      this.resetJob.stop();
      console.log('🛑 Auto Reset Tables Job đã dừng');
    }
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      lastRun: this.lastRun,
      totalCancelled: this.totalCancelled,
      cancelSchedule: process.env.AUTO_CANCEL_SCHEDULE || '0 */30 * * * *',
      resetSchedule: process.env.AUTO_RESET_SCHEDULE || '0 0 22 * * *',
      nextCancelRun: this.cancelJob ? this.cancelJob.nextDate() : null,
      nextResetRun: this.resetJob ? this.resetJob.nextDate() : null
    };
  }

  async runManually() {
    console.log('🔧 Chạy thủ công Auto Cancel Job...');
    return await this.executeCancelExpiredReservations();
  }

  async runResetManually() {
    console.log('🔧 Chạy thủ công Reset Tables Job...');
    return await this.executeResetTablesAt10PM();
  }
}

// Singleton instance
const autoCancelJob = new AutoCancelJob();

module.exports = autoCancelJob;
