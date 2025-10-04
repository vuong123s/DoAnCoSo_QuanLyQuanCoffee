const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/autoCancelController');

/**
 * Routes cho tự động hủy đơn đặt bàn
 * Prefix: /api/auto-cancel
 */

// POST /api/auto-cancel/run
// Chạy thủ công hủy đơn đặt bàn quá hạn
router.post('/run', manualCancelExpiredReservations);

// GET /api/auto-cancel/expiring
// Kiểm tra đơn đặt bàn sắp hết hạn
router.get('/expiring', checkExpiringReservations);

// GET /api/auto-cancel/report
// Lấy báo cáo đơn đặt bàn bị hủy
router.get('/report', getCancelledReservationsReport);

// GET /api/auto-cancel/time-remaining
// Tính thời gian còn lại đến giờ đặt bàn
router.get('/time-remaining', calculateTimeRemaining);

// GET /api/auto-cancel/logs
// Lấy log hệ thống tự động hủy
router.get('/logs', getAutoCancelLogs);

// GET /api/auto-cancel/status
// Kiểm tra trạng thái Event Scheduler
router.get('/status', checkEventSchedulerStatus);

// GET /api/auto-cancel/job-status
// Lấy trạng thái cron job
router.get('/job-status', getJobStatus);

// POST /api/auto-cancel/run-job
// Chạy thủ công cron job
router.post('/run-job', runJobManually);

// POST /api/auto-cancel/reset-tables
// Chạy thủ công reset bàn lúc 10h tối
router.post('/reset-tables', runResetTablesManually);

// GET /api/auto-cancel/reset-report
// Lấy báo cáo reset bàn theo ngày
router.get('/reset-report', getTableResetReport);

// GET /api/auto-cancel/check-table/:table_id
// Kiểm tra bàn có thể reset không
router.get('/check-table/:table_id', checkTableCanReset);

module.exports = router;
