const jwt = require('jsonwebtoken');
const { NhanVien, KhachHang } = require('../models');

// Verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: 'Access token required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Get user from database - check both employee and customer tables
    let user = null;
    let userType = null;

    if (decoded.userType === 'employee') {
      user = await NhanVien.findByPk(decoded.userId);
      userType = 'employee';
    } else if (decoded.userType === 'customer') {
      user = await KhachHang.findByPk(decoded.userId);
      userType = 'customer';
    }

    if (!user) {
      return res.status(401).json({
        error: 'Invalid token - user not found'
      });
    }

    // Add user info to request
    req.user = {
      id: decoded.userId,
      type: userType,
      role: decoded.role || (userType === 'employee' ? user.ChucVu : 'customer'),
      chucVu: userType === 'employee' ? user.ChucVu : null,
      email: user.Email,
      name: user.HoTen,
      data: user
    };
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Invalid token'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expired'
      });
    }
    
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      error: 'Authentication failed'
    });
  }
};

// Check if user has required role
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required'
      });
    }

    const userRole = req.user.role;
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        required_roles: allowedRoles,
        user_role: userRole
      });
    }

    next();
  };
};

// Check if user is admin
const requireAdmin = requireRole(['admin']);

// Check if user is admin or manager
const requireManager = requireRole(['admin', 'manager']);

// Check if user is staff (admin, manager, or staff)
const requireStaff = requireRole(['admin', 'manager', 'staff']);

// Optional authentication - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      
      let user = null;
      let userType = null;

      if (decoded.userType === 'employee') {
        user = await NhanVien.findByPk(decoded.userId);
        userType = 'employee';
      } else if (decoded.userType === 'customer') {
        user = await KhachHang.findByPk(decoded.userId);
        userType = 'customer';
      }
      
      if (user) {
        req.user = {
          id: decoded.userId,
          type: userType,
          role: decoded.role || (userType === 'employee' ? user.ChucVu : 'customer'),
          email: user.Email,
          name: user.HoTen,
          data: user
        };
      }
    }
    
    next();
  } catch (error) {
    // Continue without user if token is invalid
    next();
  }
};

module.exports = {
  authenticateToken,
  requireRole,
  requireAdmin,
  requireManager,
  requireStaff,
  optionalAuth
};
