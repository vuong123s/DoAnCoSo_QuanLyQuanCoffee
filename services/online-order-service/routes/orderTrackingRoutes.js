const express = require('express');
const router = express.Router();
const orderTrackingController = require('../controllers/orderTrackingController');

// Lấy lịch sử theo dõi đơn hàng
router.get('/:orderId', orderTrackingController.getOrderTracking);

// Thêm cập nhật theo dõi
router.post('/:orderId', orderTrackingController.addTrackingUpdate);

// Lấy vị trí hiện tại
router.get('/:orderId/location', orderTrackingController.getCurrentLocation);

// Cập nhật vị trí giao hàng
router.put('/:orderId/location', orderTrackingController.updateDeliveryLocation);

// Lấy đơn hàng theo trạng thái
router.get('/status/:status', orderTrackingController.getOrdersByStatus);

// Thống kê theo dõi
router.get('/stats/overview', orderTrackingController.getTrackingStats);

module.exports = router;
