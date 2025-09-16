const express = require('express');
const router = express.Router();
const {
  getReservations,
  getReservationById,
  createReservation,
  updateReservation,
  updateReservationStatus,
  cancelReservation,
  getTodayReservations,
  getReservationStats
} = require('../controllers/reservationController');

// Get reservation statistics
router.get('/stats', getReservationStats);

// Get today's reservations
router.get('/today', getTodayReservations);

// Get all reservations with filters
router.get('/', getReservations);

// Get reservation by ID
router.get('/:id', getReservationById);

// Create new reservation
router.post('/', createReservation);

// Update reservation
router.put('/:id', updateReservation);

// Update reservation status
router.patch('/:id/status', updateReservationStatus);

// Cancel reservation
router.patch('/:id/cancel', cancelReservation);

module.exports = router;
