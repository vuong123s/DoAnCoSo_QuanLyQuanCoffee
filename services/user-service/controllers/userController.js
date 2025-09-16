const { User } = require('../models');
const { Op, sequelize } = require('sequelize');
const validator = require('validator');

// Get all users with optional filters (Admin/Manager only)
const getUsers = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      role,
      is_active,
      is_verified,
      search 
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {};

    // Apply filters
    if (role) whereClause.role = role;
    if (is_active !== undefined) whereClause.is_active = is_active === 'true';
    if (is_verified !== undefined) whereClause.is_verified = is_verified === 'true';
    
    if (search) {
      whereClause[Op.or] = [
        { username: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { full_name: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows } = await User.findAndCountAll({
      where: whereClause,
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      users: rows,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(count / limit),
        total_items: count,
        items_per_page: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      error: 'Failed to fetch users',
      message: error.message
    });
  }
};

// Get user by ID (Admin/Manager only)
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    res.json({ user });

  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      error: 'Failed to fetch user',
      message: error.message
    });
  }
};

// Create new user (Admin only)
const createUser = async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      full_name,
      phone,
      date_of_birth,
      gender,
      address,
      role = 'customer',
      is_verified = false
    } = req.body;

    // Validate required fields
    if (!username || !email || !password || !full_name) {
      return res.status(400).json({
        error: 'Missing required fields: username, email, password, full_name'
      });
    }

    // Validate email format
    if (!validator.isEmail(email)) {
      return res.status(400).json({
        error: 'Invalid email format'
      });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({
        error: 'Password must be at least 6 characters long'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          { username: username.trim() },
          { email: email.toLowerCase().trim() }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({
        error: 'Username or email already exists'
      });
    }

    // Validate phone if provided
    if (phone && !validator.isMobilePhone(phone, 'vi-VN')) {
      return res.status(400).json({
        error: 'Invalid phone number format'
      });
    }

    // Create user
    const user = await User.create({
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password,
      full_name: full_name.trim(),
      phone: phone ? phone.trim() : null,
      date_of_birth,
      gender,
      address: address ? address.trim() : null,
      role,
      is_verified
    });

    res.status(201).json({
      message: 'User created successfully',
      user
    });

  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      error: 'Failed to create user',
      message: error.message
    });
  }
};

// Update user (Admin/Manager only, or own profile)
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // Check permissions
    const isOwnProfile = req.user.id === parseInt(id);
    const canEditOthers = ['admin', 'manager'].includes(req.user.role);

    if (!isOwnProfile && !canEditOthers) {
      return res.status(403).json({
        error: 'You can only edit your own profile'
      });
    }

    // Restrict what regular users can update
    if (isOwnProfile && !canEditOthers) {
      const allowedFields = ['full_name', 'phone', 'date_of_birth', 'gender', 'address', 'avatar_url', 'preferences'];
      const restrictedFields = Object.keys(updateData).filter(field => !allowedFields.includes(field));
      
      if (restrictedFields.length > 0) {
        return res.status(403).json({
          error: 'You cannot update these fields',
          restricted_fields: restrictedFields
        });
      }
    }

    // Only admin can change roles
    if (updateData.role && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Only admin can change user roles'
      });
    }

    // Validate email if being updated
    if (updateData.email) {
      if (!validator.isEmail(updateData.email)) {
        return res.status(400).json({
          error: 'Invalid email format'
        });
      }

      // Check if email already exists
      const existingUser = await User.findOne({
        where: { 
          email: updateData.email.toLowerCase().trim(),
          id: { [Op.ne]: id }
        }
      });

      if (existingUser) {
        return res.status(400).json({
          error: 'Email already exists'
        });
      }

      updateData.email = updateData.email.toLowerCase().trim();
    }

    // Validate username if being updated
    if (updateData.username) {
      const existingUser = await User.findOne({
        where: { 
          username: updateData.username.trim(),
          id: { [Op.ne]: id }
        }
      });

      if (existingUser) {
        return res.status(400).json({
          error: 'Username already exists'
        });
      }

      updateData.username = updateData.username.trim();
    }

    // Validate phone if being updated
    if (updateData.phone && !validator.isMobilePhone(updateData.phone, 'vi-VN')) {
      return res.status(400).json({
        error: 'Invalid phone number format'
      });
    }

    // Handle preferences JSON field
    if (updateData.preferences && typeof updateData.preferences !== 'string') {
      updateData.preferences = JSON.stringify(updateData.preferences);
    }

    await user.update(updateData);

    res.json({
      message: 'User updated successfully',
      user
    });

  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      error: 'Failed to update user',
      message: error.message
    });
  }
};

// Deactivate/Activate user (Admin/Manager only)
const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // Prevent deactivating own account
    if (req.user.id === parseInt(id)) {
      return res.status(400).json({
        error: 'You cannot deactivate your own account'
      });
    }

    // Only admin can deactivate other admins
    if (user.role === 'admin' && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Only admin can deactivate other admin accounts'
      });
    }

    await user.update({
      is_active: !user.is_active
    });

    res.json({
      message: `User ${user.is_active ? 'activated' : 'deactivated'} successfully`,
      user
    });

  } catch (error) {
    console.error('Error toggling user status:', error);
    res.status(500).json({
      error: 'Failed to toggle user status',
      message: error.message
    });
  }
};

// Reset user password (Admin only)
const resetPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { new_password } = req.body;

    if (!new_password) {
      return res.status(400).json({
        error: 'New password is required'
      });
    }

    if (new_password.length < 6) {
      return res.status(400).json({
        error: 'Password must be at least 6 characters long'
      });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    await user.update({
      password: new_password,
      login_attempts: 0,
      locked_until: null
    });

    res.json({
      message: 'Password reset successfully'
    });

  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({
      error: 'Failed to reset password',
      message: error.message
    });
  }
};

// Unlock user account (Admin/Manager only)
const unlockUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    await user.update({
      login_attempts: 0,
      locked_until: null
    });

    res.json({
      message: 'User account unlocked successfully',
      user
    });

  } catch (error) {
    console.error('Error unlocking user:', error);
    res.status(500).json({
      error: 'Failed to unlock user',
      message: error.message
    });
  }
};

// Get user statistics (Admin/Manager only)
const getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.count();
    
    const roleStats = await User.findAll({
      attributes: [
        'role',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['role']
    });

    const statusStats = await User.findAll({
      attributes: [
        'is_active',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['is_active']
    });

    const verificationStats = await User.findAll({
      attributes: [
        'is_verified',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['is_verified']
    });

    const recentUsers = await User.count({
      where: {
        created_at: {
          [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      }
    });

    res.json({
      stats: {
        total_users: totalUsers,
        recent_users_30_days: recentUsers,
        role_breakdown: roleStats.map(r => ({
          role: r.role,
          count: parseInt(r.dataValues.count)
        })),
        status_breakdown: statusStats.map(s => ({
          is_active: s.is_active,
          count: parseInt(s.dataValues.count)
        })),
        verification_breakdown: verificationStats.map(v => ({
          is_verified: v.is_verified,
          count: parseInt(v.dataValues.count)
        }))
      }
    });

  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({
      error: 'Failed to fetch user statistics',
      message: error.message
    });
  }
};

// Delete user (Admin only)
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // Prevent deleting own account
    if (req.user.id === parseInt(id)) {
      return res.status(400).json({
        error: 'You cannot delete your own account'
      });
    }

    // Prevent deleting other admins (unless you're also admin)
    if (user.role === 'admin' && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Only admin can delete other admin accounts'
      });
    }

    await user.destroy();

    res.json({
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      error: 'Failed to delete user',
      message: error.message
    });
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  toggleUserStatus,
  resetPassword,
  unlockUser,
  getUserStats,
  deleteUser
};
