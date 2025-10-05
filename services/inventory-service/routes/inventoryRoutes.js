const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');

// Routes cho quản lý kho
router.get('/', inventoryController.getInventoryItems);
router.get('/stats', inventoryController.getInventoryStats);
router.get('/:id', inventoryController.getInventoryItemById);
router.post('/', inventoryController.createInventoryItem);
router.put('/:id', inventoryController.updateInventoryItem);
router.delete('/:id', inventoryController.deleteInventoryItem);

module.exports = router;
