const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUserById,
  createUser,
  createEmployee,
  createCustomer,
  updateUser,
  updateEmployee,
  updateCustomer,
  deleteUser,
  deleteEmployee,
  deleteCustomer,
  toggleUserStatus,
  resetPassword,
  unlockUser,
  getUserStats
} = require('../controllers/userController');
const { 
  authenticateToken, 
  requireAdmin, 
  requireManager 
} = require('../middleware/auth');

// Test route without auth (REMOVE IN PRODUCTION)
router.get('/test-stats', getUserStats);
router.get('/test', getUsers);
router.get('/public-test', (req, res) => {
  res.json({
    success: true,
    message: 'User service is working!',
    timestamp: new Date()
  });
});

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

// Employee specific routes
router.get('/employees', authenticateToken, requireManager, getUsers);
router.post('/employees', authenticateToken, requireAdmin, createEmployee);
router.put('/employees/:id', authenticateToken, requireManager, updateEmployee);
router.delete('/employees/:id', authenticateToken, requireAdmin, deleteEmployee);

// Customer specific routes
router.get('/customers', authenticateToken, requireManager, getUsers);
router.post('/customers', createCustomer); // Public registration
router.put('/customers/:id', authenticateToken, updateCustomer);
router.delete('/customers/:id', authenticateToken, requireAdmin, deleteCustomer);

module.exports = router;
