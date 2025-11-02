const express = require('express');
const router = express.Router();
const {
  convertReservationToOrder,
  getOrderByReservation
} = require('../controllers/reservationOrderController');

/**
 * POST /api/reservation-orders/convert
 * Chuyển đổi đặt bàn thành đơn hàng (khi khách đến)
 */
router.post('/convert', convertReservationToOrder);

/**
 * GET /api/reservation-orders/by-reservation/:id
 * Lấy đơn hàng từ mã đặt bàn
 */
router.get('/by-reservation/:id', getOrderByReservation);

module.exports = router;
