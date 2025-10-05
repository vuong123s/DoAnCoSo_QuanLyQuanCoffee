const express = require('express');
const router = express.Router();
const {
  getAreas,
  getAreaById,
  getTablesByArea,
  createArea,
  updateArea,
  deleteArea
} = require('../controllers/khuVucController');

// Get all areas with statistics
router.get('/', getAreas);

// Get area by ID with detailed information
router.get('/:id', getAreaById);

// Get tables by area with real-time availability
router.get('/:id/tables', getTablesByArea);

// Create new area
router.post('/', createArea);

// Update area
router.put('/:id', updateArea);

// Delete area
router.delete('/:id', deleteArea);

module.exports = router;
