const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  toggleUserStatus,
  resetPassword,
  unlockUser,
  getUserStats,
  deleteUser
} = require('../controllers/userController');
const { 
  authenticateToken, 
  requireAdmin, 
  requireManager 
} = require('../middleware/auth');

// Get user statistics (Admin/Manager only)
router.get('/stats', authenticateToken, requireManager, getUserStats);

// Get all users (Admin/Manager only)
router.get('/', authenticateToken, requireManager, getUsers);

// Get user by ID (Admin/Manager only)
router.get('/:id', authenticateToken, requireManager, getUserById);

// Create new user (Admin only)
router.post('/', authenticateToken, requireAdmin, createUser);

// Update user (Admin/Manager can edit others, users can edit own profile)
router.put('/:id', authenticateToken, updateUser);

// Toggle user status (Admin/Manager only)
router.patch('/:id/toggle-status', authenticateToken, requireManager, toggleUserStatus);

// Reset user password (Admin only)
router.patch('/:id/reset-password', authenticateToken, requireAdmin, resetPassword);

// Unlock user account (Admin/Manager only)
router.patch('/:id/unlock', authenticateToken, requireManager, unlockUser);

// Delete user (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, deleteUser);

module.exports = router;
