const express = require('express');
const router = express.Router();
const {
  getTables,
  getTableById,
  createTable,
  updateTable,
  updateTableStatus,
  deleteTable,
  getAvailableTables,
  getTableStats,
  getAreas,
  getTablesByArea
} = require('../controllers/tableController');

// Get table statistics
router.get('/stats', getTableStats);

// Get all areas
router.get('/areas', getAreas);

// Get tables by area
router.get('/areas/:area', getTablesByArea);

// Get available tables for specific date/time
router.get('/available', getAvailableTables);

// Get all tables with filters
router.get('/', getTables);

// Get table by ID
router.get('/:id', getTableById);

// Create new table
router.post('/', createTable);

// Update table
router.put('/:id', updateTable);

// Update table status
router.patch('/:id/status', updateTableStatus);

// Delete table
router.delete('/:id', deleteTable);

module.exports = router;
