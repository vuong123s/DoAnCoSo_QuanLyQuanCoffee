const express = require('express');
const router = express.Router();
const {
  getRevenueStats,
  getRevenueByPeriod,
  getTopSellingItems,
  getDailyRevenueSummary
} = require('../controllers/revenueController');

// Revenue statistics routes
// Get comprehensive revenue statistics
router.get('/stats', getRevenueStats);

// Get revenue by time period (day, week, month)
router.get('/by-period', getRevenueByPeriod);

// Get top selling items
router.get('/top-items', getTopSellingItems);

// Get daily revenue summary
router.get('/daily', getDailyRevenueSummary);

module.exports = router;
