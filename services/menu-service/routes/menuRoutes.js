const express = require('express');
const router = express.Router();
const {
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  softDeleteMenuItem,
  toggleAvailability,
  getFeaturedItems,
  getDashboardStats
} = require('../controllers/menuController');

// Test route for debugging
router.get('/test', async (req, res) => {
  try {
    const { Mon, LoaiMon } = require('../models');
    const count = await Mon.count();
    const availableCount = await Mon.count({ where: { TrangThai: 'Có sẵn' } });
    const categoryCount = await LoaiMon.count();
    
    const items = await Mon.findAll({
      where: {
        TrangThai: 'Có sẵn'
      },
      order: [['TenMon', 'ASC']],
      limit: 5
    });
    
    res.json({
      success: true,
      message: 'Menu service is working!',
      database_stats: {
        total_items: count,
        available_items: availableCount,
        categories: categoryCount
      },
      sample_items: items,
      menus: items,
      menu_items: items
    });
  } catch (error) {
    console.error('Menu test error:', error);
    res.status(500).json({
      error: 'Database error',
      message: error.message,
      details: 'Check if database QuanLyCafe exists and Mon table has data'
    });
  }
});

// Get dashboard stats
router.get('/stats/dashboard', getDashboardStats);

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

// Soft delete menu item (mark as unavailable)
router.patch('/:id/soft-delete', softDeleteMenuItem);

// Delete menu item
router.delete('/:id', deleteMenuItem);

module.exports = router;
