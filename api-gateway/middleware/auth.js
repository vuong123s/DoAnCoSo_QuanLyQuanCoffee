const jwt = require('jsonwebtoken');
const axios = require('axios');
const serviceRegistry = require('../config/serviceRegistry');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Verify JWT token and get user info
const authenticateToken = async (req, res, next) => {
  try {
    // Check both lowercase and uppercase Authorization header
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    console.log('🔐 Auth middleware - Headers:', JSON.stringify(req.headers, null, 2));
    console.log('🔐 Auth header:', authHeader);
    console.log('🔐 Token:', token ? 'Present' : 'Missing');

    if (!token) {
      console.log('❌ No token found in request');
      return res.status(401).json({
        error: 'Access token required'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Get user details from user service
    try {
      const userServiceUrl = await serviceRegistry.getServiceUrl('userService');
      const response = await axios.get(`${userServiceUrl}/api/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        timeout: 5000
      });

      req.user = response.data.user;
      req.token = token;
      next();
    } catch (userServiceError) {
      console.log('User service error:', userServiceError.message);
      
      if (userServiceError.response && userServiceError.response.status === 401) {
        return res.status(401).json({
          error: 'Invalid or expired token'
        });
      }
      
      // If user service is down, use token data with fallback role mapping
      const fallbackRole = decoded.role || decoded.ChucVu || 'customer';
      req.user = {
        id: decoded.userId || decoded.MaNV || decoded.MaKH,
        role: fallbackRole,
        name: decoded.name || decoded.HoTen,
        email: decoded.email || decoded.Email
      };
      req.token = token;
      console.log('Using fallback user data:', req.user);
      next();
    }

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

// Middleware for different role requirements (supporting both English and Vietnamese roles)
const requireAdmin = [authenticateToken, requireRole(['admin', 'Admin'])];
const requireManager = [authenticateToken, requireRole(['admin', 'manager', 'Admin', 'Quản lý'])];
const requireStaff = [authenticateToken, requireRole(['admin', 'manager', 'staff', 'Admin', 'Quản lý', 'Nhân viên'])];

// Optional authentication - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);
      
      try {
        const userServiceUrl = await serviceRegistry.getServiceUrl('userService');
        const response = await axios.get(`${userServiceUrl}/api/auth/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          timeout: 3000
        });

        req.user = response.data.user;
        req.token = token;
      } catch (userServiceError) {
        // Continue without user if service is down or token is invalid
        req.user = null;
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
