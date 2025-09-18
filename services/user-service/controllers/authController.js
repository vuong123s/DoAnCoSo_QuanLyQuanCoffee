const { NhanVien, KhachHang } = require('../models');
const { generateTokens, verifyToken } = require('../utils/jwt');
const validator = require('validator');
const { Op } = require('sequelize');

// Register new user (create customer account)
const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone
    } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        error: 'Missing required fields: name, email, password'
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

    // Check if email already exists in both tables
    const existingCustomer = await KhachHang.findOne({
      where: {
        Email: email.toLowerCase().trim()
      }
    });

    const existingEmployee = await NhanVien.findOne({
      where: {
        Email: email.toLowerCase().trim()
      }
    });

    if (existingCustomer || existingEmployee) {
      return res.status(400).json({
        error: 'Email already exists'
      });
    }

    // Create customer
    const customer = await KhachHang.create({
      HoTen: name.trim(),
      Email: email.toLowerCase().trim(),
      SDT: phone ? phone.trim() : null,
      MatKhau: password,
      DiemTichLuy: 0
    });

    // Generate tokens for customer
    const tokens = generateTokens(customer.MaKH, null);

    // Prepare user data for frontend
    const userData = {
      id: customer.MaKH,
      name: customer.HoTen,
      email: customer.Email,
      role: 'customer', // Tự động là khách hàng
      chucVu: null, // Khách hàng không có chức vụ
      phone: customer.SDT,
      points: customer.DiemTichLuy
    };

    res.status(201).json({
      message: 'Customer registered successfully',
      user: userData,
      token: tokens.accessToken
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Failed to register customer',
      message: error.message
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt:', { email, password: '***' });

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required'
      });
    }

    // Try to find employee first
    const nhanvien = await NhanVien.findOne({
      where: {
        Email: email.toLowerCase().trim()
      }
    });

    console.log('Found employee:', nhanvien ? 'Yes' : 'No');

    if (nhanvien) {
      console.log('Employee data:', { id: nhanvien.MaNV, email: nhanvien.Email, hasPassword: !!nhanvien.MatKhau });
      
      // Verify employee password
      const isPasswordValid = await nhanvien.comparePassword(password);
      console.log('Password valid:', isPasswordValid);
      
      if (!isPasswordValid) {
        console.log(`Login failed - Invalid password for employee: ${email}`);
        return res.status(401).json({
          error: 'Mật khẩu không đúng'
        });
      }

      // Generate tokens with ChucVu as role
      const tokens = generateTokens(nhanvien.MaNV, nhanvien.ChucVu);

      // Prepare user data for frontend
      const userData = {
        id: nhanvien.MaNV,
        name: nhanvien.HoTen,
        email: nhanvien.Email,
        role: nhanvien.ChucVu === 'Quản lý' ? 'admin' : nhanvien.ChucVu === 'Nhân viên' ? 'staff' : 'manager',
        chucVu: nhanvien.ChucVu,
        phone: nhanvien.SDT
      };

      return res.json({
        message: 'Login successful',
        user: userData,
        token: tokens.accessToken
      });
    }

    // Try to find customer
    const khachhang = await KhachHang.findOne({
      where: {
        Email: email.toLowerCase().trim()
      }
    });

    if (khachhang) {
      // Verify customer password
      const isPasswordValid = await khachhang.comparePassword(password);
      if (!isPasswordValid) {
        console.log(`Login failed - Invalid password for customer: ${email}`);
        return res.status(401).json({
          error: 'Mật khẩu không đúng'
        });
      }
      
      // Generate tokens for customer (no ChucVu)
      const tokens = generateTokens(khachhang.MaKH, null);

      // Prepare user data for frontend
      const userData = {
        id: khachhang.MaKH,
        name: khachhang.HoTen,
        email: khachhang.Email,
        role: 'customer', // Khách hàng
        chucVu: null, // Khách hàng không có chức vụ
        phone: khachhang.SDT,
        points: khachhang.DiemTichLuy
      };

      return res.json({
        message: 'Login successful',
        user: userData,
        token: tokens.accessToken
      });
    }

    // No user found
    console.log(`Login failed - No account found for email: ${email}`);
    return res.status(401).json({
      error: 'Không tìm thấy tài khoản với email này'
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Failed to login',
      message: error.message
    });
  }
};

// Refresh token
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        error: 'Refresh token is required'
      });
    }

    // Verify refresh token
    const decoded = verifyToken(refreshToken);
    
    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        error: 'Invalid refresh token'
      });
    }

    // Get user
    const user = await User.findByPk(decoded.userId);
    if (!user) {
      return res.status(401).json({
        error: 'User not found'
      });
    }

    if (!user.is_active) {
      return res.status(401).json({
        error: 'Account is deactivated'
      });
    }

    // Generate new tokens
    const tokens = generateTokens(user.id, user.role);

    res.json({
      message: 'Token refreshed successfully',
      ...tokens
    });

  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Invalid or expired refresh token'
      });
    }

    console.error('Refresh token error:', error);
    res.status(500).json({
      error: 'Failed to refresh token',
      message: error.message
    });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const { userId, role } = req.user;

    if (role === 'customer') {
      // Get customer profile
      const khachhang = await KhachHang.findByPk(userId);
      
      if (!khachhang) {
        return res.status(404).json({
          error: 'Customer not found'
        });
      }

      const userData = {
        id: khachhang.MaKH,
        name: khachhang.HoTen,
        email: khachhang.Email,
        chucVu: null, // Khách hàng không có chức vụ
        phone: khachhang.SDT,
        points: khachhang.DiemTichLuy
      };

      return res.json({
        user: userData
      });
    } else {
      // Get employee profile
      const nhanvien = await NhanVien.findByPk(userId);
      
      if (!nhanvien) {
        return res.status(404).json({
          error: 'Employee not found'
        });
      }

      const userData = {
        id: nhanvien.MaNV,
        name: nhanvien.HoTen,
        email: nhanvien.Email,
        chucVu: nhanvien.ChucVu,
        phone: nhanvien.SDT
      };

      return res.json({
        user: userData
      });
    }
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: 'Failed to get profile',
      message: error.message
    });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const {
      full_name,
      phone,
      date_of_birth,
      gender,
      address,
      avatar_url,
      preferences
    } = req.body;

    const updateData = {};

    if (full_name) updateData.full_name = full_name.trim();
    if (phone) {
      if (!validator.isMobilePhone(phone, 'vi-VN')) {
        return res.status(400).json({
          error: 'Invalid phone number format'
        });
      }
      updateData.phone = phone.trim();
    }
    if (date_of_birth) updateData.date_of_birth = date_of_birth;
    if (gender) updateData.gender = gender;
    if (address) updateData.address = address.trim();
    if (avatar_url) updateData.avatar_url = avatar_url;
    if (preferences) {
      updateData.preferences = typeof preferences === 'string' ? preferences : JSON.stringify(preferences);
    }

    await req.user.update(updateData);

    res.json({
      message: 'Profile updated successfully',
      user: req.user
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      error: 'Failed to update profile',
      message: error.message
    });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({
        error: 'Current password and new password are required'
      });
    }

    if (new_password.length < 6) {
      return res.status(400).json({
        error: 'New password must be at least 6 characters long'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await req.user.comparePassword(current_password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        error: 'Current password is incorrect'
      });
    }

    // Update password
    await req.user.update({ password: new_password });

    res.json({
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      error: 'Failed to change password',
      message: error.message
    });
  }
};

// Logout (client-side token removal)
const logout = async (req, res) => {
  try {
    res.json({
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Failed to logout',
      message: error.message
    });
  }
};

// Admin functions for user management
const getAllUsers = async (req, res) => {
  try {
    // Get all employees
    const nhanvien = await NhanVien.findAll({
      attributes: ['MaNV', 'HoTen', 'Email', 'ChucVu', 'SDT', 'NgayVaoLam']
    });

    // Get all customers
    const khachhang = await KhachHang.findAll({
      attributes: ['MaKH', 'HoTen', 'Email', 'SDT', 'DiemTichLuy']
    });

    res.json({
      employees: nhanvien,
      customers: khachhang,
      total: {
        employees: nhanvien.length,
        customers: khachhang.length
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      error: 'Failed to get users',
      message: error.message
    });
  }
};

const promoteToEmployee = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { chucVu, luong } = req.body;

    // Find customer
    const customer = await KhachHang.findByPk(customerId);
    if (!customer) {
      return res.status(404).json({
        error: 'Customer not found'
      });
    }

    // Create employee record
    const employee = await NhanVien.create({
      HoTen: customer.HoTen,
      Email: customer.Email,
      SDT: customer.SDT,
      MatKhau: customer.MatKhau,
      ChucVu: chucVu || 'Nhân viên',
      Luong: luong || 8000000,
      NgayVaoLam: new Date(),
      GioiTinh: 'Nam' // Default, can be updated later
    });

    // Delete customer record
    await customer.destroy();

    res.json({
      message: 'Customer promoted to employee successfully',
      employee: {
        id: employee.MaNV,
        name: employee.HoTen,
        email: employee.Email,
        role: employee.ChucVu
      }
    });
  } catch (error) {
    console.error('Promote to employee error:', error);
    res.status(500).json({
      error: 'Failed to promote customer',
      message: error.message
    });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { chucVu, luong } = req.body;

    const employee = await NhanVien.findByPk(employeeId);
    if (!employee) {
      return res.status(404).json({
        error: 'Employee not found'
      });
    }

    await employee.update({
      ChucVu: chucVu,
      Luong: luong || employee.Luong
    });

    res.json({
      message: 'Employee role updated successfully',
      employee: {
        id: employee.MaNV,
        name: employee.HoTen,
        email: employee.Email,
        role: employee.ChucVu,
        salary: employee.Luong
      }
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      error: 'Failed to update user role',
      message: error.message
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { userType, userId } = req.params;

    if (userType === 'employee') {
      const employee = await NhanVien.findByPk(userId);
      if (!employee) {
        return res.status(404).json({
          error: 'Employee not found'
        });
      }
      await employee.destroy();
    } else if (userType === 'customer') {
      const customer = await KhachHang.findByPk(userId);
      if (!customer) {
        return res.status(404).json({
          error: 'Customer not found'
        });
      }
      await customer.destroy();
    } else {
      return res.status(400).json({
        error: 'Invalid user type'
      });
    }

    res.json({
      message: `${userType} deleted successfully`
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      error: 'Failed to delete user',
      message: error.message
    });
  }
};

module.exports = {
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
};
