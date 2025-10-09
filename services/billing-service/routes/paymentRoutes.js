const express = require('express');
const router = express.Router();
const {
  processOrderPayment,
  getOrderPayments,
  getAllPayments,
  getPaymentStats
} = require('../controllers/paymentController');

// Payment processing routes

// Process payment for an order (convert Order to DonHang + create payment)
router.post('/orders/:orderId/pay', processOrderPayment);

// Get payment history for a specific order
router.get('/orders/:orderId/payments', getOrderPayments);

// Get all payments with filters
router.get('/', getAllPayments);

// Get payment statistics
router.get('/stats', getPaymentStats);

module.exports = router;
