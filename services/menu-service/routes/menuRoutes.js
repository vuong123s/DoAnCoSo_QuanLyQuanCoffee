const express = require('express');
const router = express.Router();
const {
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleAvailability,
  getFeaturedItems
} = require('../controllers/menuController');

// Get featured menu items
router.get('/featured', getFeaturedItems);

// Get all menu items with filters
router.get('/', getMenuItems);

// Get menu item by ID
router.get('/:id', getMenuItemById);

// Create new menu item
router.post('/', createMenuItem);

// Update menu item
router.put('/:id', updateMenuItem);

// Toggle menu item availability
router.patch('/:id/toggle-availability', toggleAvailability);

// Delete menu item
router.delete('/:id', deleteMenuItem);

module.exports = router;
