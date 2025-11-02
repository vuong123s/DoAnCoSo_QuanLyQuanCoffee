const express = require('express');
const router = express.Router();
const {
  addPoints,
  deductPoints,
  getPointsHistory
} = require('../controllers/customerController');

// Routes cho quản lý điểm tích lũy khách hàng
// Không cần authentication vì được gọi nội bộ từ các service khác

/**
 * POST /api/customers/:id/add-points
 * Cộng điểm cho khách hàng (gọi từ billing-service khi đơn hoàn thành)
 */
router.post('/:id/add-points', addPoints);

/**
 * POST /api/customers/:id/deduct-points
 * Trừ điểm khi khách hàng sử dụng
 */
router.post('/:id/deduct-points', deductPoints);

/**
 * GET /api/customers/:id/points-history
 * Xem lịch sử điểm tích lũy
 */
router.get('/:id/points-history', getPointsHistory);

module.exports = router;
