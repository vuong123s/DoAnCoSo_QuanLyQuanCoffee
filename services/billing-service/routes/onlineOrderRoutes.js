const express = require('express');
const router = express.Router();
const {
  createOnlineOrder,
  getOnlineOrders,
  getOnlineOrderById,
  updateOnlineOrderStatus,
  cancelOnlineOrder,
  deleteOnlineOrder,
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

// Update online order status (support both PUT and PATCH)
router.put('/:id/status', updateOnlineOrderStatus);
router.patch('/:id/status', updateOnlineOrderStatus);

// Cancel online order
router.patch('/:id/cancel', cancelOnlineOrder);

// Delete online order
router.delete('/:id', deleteOnlineOrder);

module.exports = router;
