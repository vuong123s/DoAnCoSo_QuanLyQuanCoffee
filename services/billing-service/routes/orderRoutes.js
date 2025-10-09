const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
  getOrderStats,
  // Order items management (bán hàng)
  addItemToOrder,
  updateOrderItem,
  removeOrderItem,
  getOrderItems
} = require('../controllers/orderController');

// Order management routes
// Create a new order
router.post('/', createOrder);

// Get all orders with optional filters
router.get('/', getOrders);

// Get order statistics
router.get('/stats', getOrderStats);

// Get order by ID
router.get('/:id', getOrderById);

// Update order status
router.patch('/:id/status', updateOrderStatus);

// Delete/Cancel order
router.delete('/:id', deleteOrder);

// Order items management routes (bán hàng tại quầy)
// Add item to order
router.post('/:orderId/items', addItemToOrder);

// Get order items
router.get('/:orderId/items', getOrderItems);

// Update item in order
router.patch('/:orderId/items/:itemId', updateOrderItem);

// Remove item from order
router.delete('/:orderId/items/:itemId', removeOrderItem);

module.exports = router;