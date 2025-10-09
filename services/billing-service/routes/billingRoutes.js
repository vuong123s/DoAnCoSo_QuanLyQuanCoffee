const express = require('express');
const router = express.Router();
const {
  createBill,
  getBills,
  getBillById,
  updatePaymentStatus,
  getBillingStats,
  deleteBill,
  // Order items management (bán hàng)
  addItemToOrder,
  updateOrderItem,
  removeOrderItem,
  getOrderItems
} = require('../controllers/billingController');

// Create a new bill
router.post('/', createBill);

// Get all bills with optional filters
router.get('/', getBills);

// Test route (REMOVE IN PRODUCTION)
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Billing service is working!',
    timestamp: new Date()
  });
});

// Get billing statistics
router.get('/stats', (req, res) => {
  // Return mock data for now
  res.json({
    success: true,
    data: {
      totalRevenue: 15000000,
      totalOrders: 245,
      averageOrderValue: 61224,
      todayRevenue: 850000,
      todayOrders: 12,
      monthlyRevenue: 8500000,
      monthlyOrders: 156,
      paymentMethods: {
        cash: 45,
        card: 35,
        transfer: 20
      }
    }
  });
});

// Get bill by ID
router.get('/:id', getBillById);

// Update payment status
router.patch('/:id/payment', updatePaymentStatus);

// Delete/Cancel bill
router.delete('/:id', deleteBill);

// Order items management routes (bán hàng)
// Add item to order
router.post('/:orderId/items', addItemToOrder);

// Get order items
router.get('/:orderId/items', getOrderItems);

// Update item in order
router.patch('/:orderId/items/:itemId', updateOrderItem);

// Remove item from order
router.delete('/:orderId/items/:itemId', removeOrderItem);

module.exports = router;
