const express = require('express');
const router = express.Router();
const {
  getReservations,
  getReservationById,
  createReservation,
  updateReservation,
  updateReservationStatus,
  cancelReservation,
  deleteReservation,
  getTodayReservations,
  getAvailableTables,
  getReservationStats
} = require('../controllers/reservationController');

const { validateReservation } = require('../middleware/reservationValidation');

// Migration endpoint to fix database schema
router.post('/migrate-database', async (req, res) => {
  try {
    const migrateDatBanTable = require('../migrateDatBan');
    await migrateDatBanTable();
    
    res.json({
      success: true,
      message: 'Database migration completed successfully'
    });
  } catch (error) {
    console.error('Migration error:', error);
    res.status(500).json({
      success: false,
      error: 'Migration failed',
      message: error.message
    });
  }
});

// Get reservation statistics
router.get('/stats', getReservationStats);
router.get('/thong-ke', getReservationStats); // Vietnamese route

// Get today's reservations
router.get('/today', getTodayReservations);
router.get('/hom-nay', getTodayReservations); // Vietnamese route

// Get available tables
router.get('/available-tables', getAvailableTables);
router.get('/ban-trong', getAvailableTables); // Vietnamese route

// Get all reservations with filters
router.get('/', getReservations);

// Get reservation by ID
router.get('/:id', getReservationById);

// Create new reservation
router.post('/', validateReservation, createReservation);

// Update reservation
router.put('/:id', updateReservation);

// Update reservation status
router.patch('/:id/status', updateReservationStatus);
router.put('/:id/trang-thai', updateReservationStatus); // Vietnamese route

// Cancel reservation
router.patch('/:id/cancel', cancelReservation);

// Delete reservation
router.delete('/:id', deleteReservation);

module.exports = router;
