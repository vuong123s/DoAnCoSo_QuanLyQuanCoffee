const express = require('express');
const router = express.Router();
const {
  createBill,
  getBills,
  getBillById,
  updatePaymentStatus,
  getBillingStats,
  deleteBill
} = require('../controllers/billingController');

// Create a new bill
router.post('/', createBill);

// Get all bills with optional filters
router.get('/', getBills);

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

module.exports = router;
