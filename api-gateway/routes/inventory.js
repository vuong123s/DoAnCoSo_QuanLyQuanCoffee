const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
// Note: Authentication is handled by requireStaff middleware in index.js

// GET routes
router.get('/', inventoryController.getInventory);
router.get('/alerts', inventoryController.getAlerts);
router.get('/statistics', inventoryController.getStatistics);
router.get('/:id', inventoryController.getInventoryItem);

// POST routes
router.post('/', inventoryController.createInventoryItem);
router.post('/:id/import', inventoryController.importInventory);
router.post('/:id/export', inventoryController.exportInventory);

// PUT/PATCH routes
router.put('/:id', inventoryController.updateInventoryItem);

// DELETE routes
router.delete('/:id', inventoryController.deleteInventoryItem);

module.exports = router;
