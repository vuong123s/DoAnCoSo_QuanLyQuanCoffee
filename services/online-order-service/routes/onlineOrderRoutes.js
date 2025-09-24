const express = require('express');
const router = express.Router();
const onlineOrderController = require('../controllers/onlineOrderController');

// Tạo đơn hàng online
router.post('/', onlineOrderController.createOrder);

// Lấy danh sách đơn hàng
router.get('/', onlineOrderController.getOrders);

// Lấy chi tiết đơn hàng
router.get('/:id', onlineOrderController.getOrderById);

// Cập nhật trạng thái đơn hàng
router.put('/:id/status', onlineOrderController.updateOrderStatus);

// Cập nhật trạng thái thanh toán
router.put('/:id/payment-status', onlineOrderController.updatePaymentStatus);

// Hủy đơn hàng
router.patch('/:id/cancel', onlineOrderController.cancelOrder);

// Thống kê đơn hàng
router.get('/stats/overview', onlineOrderController.getOrderStats);

module.exports = router;
