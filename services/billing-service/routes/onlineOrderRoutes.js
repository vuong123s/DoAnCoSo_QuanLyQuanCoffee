const express = require('express');
const router = express.Router();
const {
  createOnlineOrder,
  getOnlineOrders,
  getOnlineOrderById,
  updateOnlineOrderStatus,
  cancelOnlineOrder,
  getOnlineOrderStats
} = require('../controllers/onlineOrderController');

// Online order management routes
// Create a new online order
router.post('/', createOnlineOrder);

// Get all online orders with optional filters
router.get('/', getOnlineOrders);

// Get online order statistics
router.get('/stats', getOnlineOrderStats);

// Get online order by ID
router.get('/:id', getOnlineOrderById);

// Update online order status
router.patch('/:id/status', updateOnlineOrderStatus);

// Cancel online order
router.patch('/:id/cancel', cancelOnlineOrder);

module.exports = router;
