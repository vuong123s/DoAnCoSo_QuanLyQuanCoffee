const express = require('express');
const router = express.Router();
const {
  getAvailableVouchers,
  validateVoucher,
  getAllVouchers,
  createVoucher,
  updateVoucher,
  deleteVoucher
} = require('../controllers/voucherController');

// Customer routes
router.get('/available', getAvailableVouchers);
router.post('/validate', validateVoucher);

// Admin routes
router.get('/', getAllVouchers);
router.post('/', createVoucher);
router.put('/:id', updateVoucher);
router.delete('/:id', deleteVoucher);

module.exports = router;
