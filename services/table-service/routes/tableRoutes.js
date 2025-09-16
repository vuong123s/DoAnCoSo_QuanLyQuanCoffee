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
  getTableStats
} = require('../controllers/tableController');

// Get table statistics
router.get('/stats', getTableStats);

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
