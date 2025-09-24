const express = require('express');
const router = express.Router();
const voucherController = require('../controllers/voucherController');

// Routes cho quản lý voucher
router.get('/', voucherController.getVouchers);
router.get('/stats', voucherController.getVoucherStats);
router.get('/available', voucherController.getAvailableVouchers);
router.get('/:id', voucherController.getVoucherById);
router.post('/', voucherController.createVoucher);
router.post('/validate', voucherController.validateVoucher);
router.post('/use', voucherController.useVoucher);
router.put('/:id', voucherController.updateVoucher);
router.delete('/:id', voucherController.deleteVoucher);

module.exports = router;
