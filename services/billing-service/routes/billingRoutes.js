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
router.get('/stats', getBillingStats);

// Get bill by ID
router.get('/:id', getBillById);

// Update payment status
router.patch('/:id/payment', updatePaymentStatus);

// Delete/Cancel bill
router.delete('/:id', deleteBill);

module.exports = router;
