const express = require('express');
const router = express.Router();
const {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus,
  getMenuItemsByCategory
} = require('../controllers/categoryController');

// Get all categories
router.get('/', getCategories);

// Get category by ID
router.get('/:id', getCategoryById);

// Get menu items by category
router.get('/:id/menu-items', getMenuItemsByCategory);

// Create new category
router.post('/', createCategory);

// Update category
router.put('/:id', updateCategory);

// Toggle category status
router.patch('/:id/toggle-status', toggleCategoryStatus);

// Delete category
router.delete('/:id', deleteCategory);

module.exports = router;
