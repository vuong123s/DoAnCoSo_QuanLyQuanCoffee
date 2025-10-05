const express = require('express');
const router = express.Router();
const {
  register,
  login,
  refreshToken,
  getProfile,
  updateProfile,
  changePassword,
  logout,
  getAllUsers,
  promoteToEmployee,
  updateUserRole,
  deleteUser
} = require('../controllers/authController');
const { authenticateToken, optionalAuth, requireManager } = require('../middleware/auth');

// Public routes
router.post('/register', optionalAuth, register);
router.post('/login', login);
router.post('/refresh-token', refreshToken);

// Protected routes
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);
router.post('/change-password', authenticateToken, changePassword);
router.post('/logout', authenticateToken, logout);

// Admin routes for user management (require manager or admin role)
router.get('/users', authenticateToken, requireManager, getAllUsers);
router.post('/promote/:customerId', authenticateToken, requireManager, promoteToEmployee);
router.put('/role/:employeeId', authenticateToken, requireManager, updateUserRole);
router.delete('/:userType/:userId', authenticateToken, requireManager, deleteUser);

module.exports = router;
