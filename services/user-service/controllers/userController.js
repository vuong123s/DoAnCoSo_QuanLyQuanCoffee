const { NhanVien, KhachHang } = require('../models/User');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');
const validator = require('validator');

// Get all users with optional filters (Admin/Manager only)
const getUsers = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      role,
      search 
    } = req.query;

    // Get employees (NhanVien)
    const employeeWhereClause = {};
    if (role && role !== 'customer' && role !== 'Khách hàng') {
      employeeWhereClause.ChucVu = role;
    }
    
    if (search) {
      employeeWhereClause[Op.or] = [
        { HoTen: { [Op.like]: `%${search}%` } },
        { Email: { [Op.like]: `%${search}%` } },
        { SDT: { [Op.like]: `%${search}%` } },
        { ChucVu: { [Op.like]: `%${search}%` } }
      ];
    }

    // Get customers (KhachHang)
    const customerWhereClause = {};
    if (search) {
      customerWhereClause[Op.or] = [
        { HoTen: { [Op.like]: `%${search}%` } },
        { Email: { [Op.like]: `%${search}%` } },
        { SDT: { [Op.like]: `%${search}%` } }
      ];
    }

    let employees = [];
    let customers = [];

    // Only get employees if not filtering for customers only
    if (!role || (role !== 'customer' && role !== 'Khách hàng')) {
      employees = await NhanVien.findAll({
        where: employeeWhereClause,
        order: [['MaNV', 'DESC']],
        limit: parseInt(limit)
      });
    }

    // Only get customers if not filtering for employees only
    if (!role || role === 'customer' || role === 'Khách hàng') {
      customers = await KhachHang.findAll({
        where: customerWhereClause,
        order: [['MaKH', 'DESC']],
        limit: parseInt(limit)
      });
    }

    res.json({
      success: true,
      nhanviens: employees,
      khachhangs: customers,
      employees: employees, // For backward compatibility
      customers: customers, // For backward compatibility
      total_employees: employees.length,
      total_customers: customers.length,
      total_users: employees.length + customers.length
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
    const { type } = req.query; // 'employee' or 'customer'

    let user = null;
    
    if (type === 'employee') {
      user = await NhanVien.findByPk(id);
    } else if (type === 'customer') {
      user = await KhachHang.findByPk(id);
    } else {
      // Try both tables
      user = await NhanVien.findByPk(id);
      if (!user) {
        user = await KhachHang.findByPk(id);
      }
    }

    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    res.json({ 
      success: true,
      user: user,
      type: user.MaNV ? 'employee' : 'customer'
    });

  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      error: 'Failed to fetch user',
      message: error.message
    });
  }
};

// Create new employee (Admin only)
const createEmployee = async (req, res) => {
  try {
    const {
      HoTen,
      GioiTinh,
      NgaySinh,
      SDT,
      Email,
      ChucVu = 'Nhân viên',
      MatKhau,
      Luong,
      NgayVaoLam
    } = req.body;

    // Validate required fields
    if (!HoTen || !MatKhau) {
      return res.status(400).json({
        error: 'Missing required fields: HoTen, MatKhau'
      });
    }

    // Validate email format if provided
    if (Email && !validator.isEmail(Email)) {
      return res.status(400).json({
        error: 'Invalid email format'
      });
    }

    // Check if employee already exists
    const existingEmployee = await NhanVien.findOne({
      where: {
        [Op.or]: [
          ...(SDT ? [{ SDT }] : []),
          ...(Email ? [{ Email }] : [])
        ]
      }
    });

    if (existingEmployee) {
      return res.status(400).json({
        error: 'Employee with this phone or email already exists'
      });
    }

    const newEmployee = await NhanVien.create({
      HoTen,
      GioiTinh,
      NgaySinh,
      SDT,
      Email,
      ChucVu,
      MatKhau,
      Luong,
      NgayVaoLam: NgayVaoLam || new Date()
    });

    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      employee: newEmployee
    });

  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({
      error: 'Failed to create employee',
      message: error.message
    });
  }
};

// Create new customer (Public)
const createCustomer = async (req, res) => {
  try {
    const {
      HoTen,
      GioiTinh,
      NgaySinh,
      SDT,
      Email,
      MatKhau,
      DiaChi
    } = req.body;

    // Validate required fields
    if (!HoTen || !SDT || !MatKhau) {
      return res.status(400).json({
        error: 'Missing required fields: HoTen, SDT, MatKhau'
      });
    }

    // Validate email format if provided
    if (Email && !validator.isEmail(Email)) {
      return res.status(400).json({
        error: 'Invalid email format'
      });
    }

    // Check if customer already exists
    const existingCustomer = await KhachHang.findOne({
      where: {
        [Op.or]: [
          { SDT },
          ...(Email ? [{ Email }] : [])
        ]
      }
    });

    if (existingCustomer) {
      return res.status(400).json({
        error: 'Customer with this phone or email already exists'
      });
    }

    const newCustomer = await KhachHang.create({
      HoTen,
      GioiTinh,
      NgaySinh,
      SDT,
      Email,
      MatKhau,
      DiaChi,
      DiemTichLuy: 0,
      NgayDangKy: new Date(),
      TrangThai: 'Hoạt động'
    });

    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      customer: newCustomer
    });

  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({
      error: 'Failed to create customer',
      message: error.message
    });
  }
};

// Update employee (Admin/Manager only)
const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const employee = await NhanVien.findByPk(id);
    if (!employee) {
      return res.status(404).json({
        error: 'Employee not found'
      });
    }

    // Validate email if being updated
    if (updateData.Email && !validator.isEmail(updateData.Email)) {
      return res.status(400).json({
        error: 'Invalid email format'
      });
    }

    await employee.update(updateData);

    res.json({
      success: true,
      message: 'Employee updated successfully',
      employee: employee
    });

  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({
      error: 'Failed to update employee',
      message: error.message
    });
  }
};

// Update customer
const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const customer = await KhachHang.findByPk(id);
    if (!customer) {
      return res.status(404).json({
        error: 'Customer not found'
      });
    }

    // Validate email if being updated
    if (updateData.Email && !validator.isEmail(updateData.Email)) {
      return res.status(400).json({
        error: 'Invalid email format'
      });
    }

    await customer.update(updateData);

    res.json({
      success: true,
      message: 'Customer updated successfully',
      customer: customer
    });

  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({
      error: 'Failed to update customer',
      message: error.message
    });
  }
};

// Delete employee (Admin only)
const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await NhanVien.findByPk(id);
    if (!employee) {
      return res.status(404).json({
        error: 'Employee not found'
      });
    }

    await employee.destroy();

    res.json({
      success: true,
      message: 'Employee deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({
      error: 'Failed to delete employee',
      message: error.message
    });
  }
};

// Delete customer (Admin only)
const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    const customer = await KhachHang.findByPk(id);
    if (!customer) {
      return res.status(404).json({
        error: 'Customer not found'
      });
    }

    await customer.destroy();

    res.json({
      success: true,
      message: 'Customer deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({
      error: 'Failed to delete customer',
      message: error.message
    });
  }
};

// Get user statistics (Admin/Manager only)
const getUserStats = async (req, res) => {
  try {
    // Count employees and customers separately
    const totalEmployees = await NhanVien.count();
    const totalCustomers = await KhachHang.count();
    const totalUsers = totalEmployees + totalCustomers;
    
    // Get role breakdown for employees
    const roleStats = await NhanVien.findAll({
      attributes: [
        'ChucVu',
        [sequelize.fn('COUNT', sequelize.col('MaNV')), 'count']
      ],
      group: ['ChucVu']
    });

    // Count active customers
    const activeCustomers = await KhachHang.count({
      where: { TrangThai: 'Hoạt động' }
    });

    const activeUsers = totalEmployees + activeCustomers; // All employees + active customers

    res.json({
      success: true,
      totalUsers: totalUsers,
      totalEmployees: totalEmployees,
      totalCustomers: totalCustomers,
      activeUsers: activeUsers,
      stats: {
        total_users: totalUsers,
        total_employees: totalEmployees,
        total_customers: totalCustomers,
        active_users: activeUsers,
        role_breakdown: roleStats.map(r => ({
          role: r.ChucVu || 'Nhân viên',
          count: parseInt(r.dataValues.count)
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

// Generic create user function (for backward compatibility)
const createUser = async (req, res) => {
  try {
    const { role, ...userData } = req.body;
    
    if (role === 'Khách hàng' || role === 'customer') {
      return createCustomer(req, res);
    } else {
      return createEmployee(req, res);
    }
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      error: 'Failed to create user',
      message: error.message
    });
  }
};

// Generic update user function (for backward compatibility)
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.query;
    
    if (type === 'customer') {
      return updateCustomer(req, res);
    } else {
      return updateEmployee(req, res);
    }
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      error: 'Failed to update user',
      message: error.message
    });
  }
};

// Generic delete user function (for backward compatibility)
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.query;
    
    if (type === 'customer') {
      return deleteCustomer(req, res);
    } else {
      return deleteEmployee(req, res);
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      error: 'Failed to delete user',
      message: error.message
    });
  }
};

// Toggle user status (for customers)
const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.query;
    
    if (type === 'customer') {
      const customer = await KhachHang.findByPk(id);
      if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
      }
      
      const newStatus = customer.TrangThai === 'Hoạt động' ? 'Tạm khóa' : 'Hoạt động';
      await customer.update({ TrangThai: newStatus });
      
      res.json({
        success: true,
        message: 'Customer status updated successfully',
        customer: customer
      });
    } else {
      res.status(400).json({
        error: 'Status toggle only available for customers'
      });
    }
  } catch (error) {
    console.error('Error toggling user status:', error);
    res.status(500).json({
      error: 'Failed to toggle user status',
      message: error.message
    });
  }
};

// Reset password (Admin only)
const resetPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.query;
    const { newPassword } = req.body;
    
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        error: 'Password must be at least 6 characters long'
      });
    }
    
    let user = null;
    if (type === 'customer') {
      user = await KhachHang.findByPk(id);
    } else {
      user = await NhanVien.findByPk(id);
    }
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    await user.update({ MatKhau: newPassword });
    
    res.json({
      success: true,
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
    const { type } = req.query;
    
    if (type === 'customer') {
      const customer = await KhachHang.findByPk(id);
      if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
      }
      
      await customer.update({ TrangThai: 'Hoạt động' });
      
      res.json({
        success: true,
        message: 'Customer account unlocked successfully',
        customer: customer
      });
    } else {
      res.status(400).json({
        error: 'Account unlock only available for customers'
      });
    }
  } catch (error) {
    console.error('Error unlocking user:', error);
    res.status(500).json({
      error: 'Failed to unlock user',
      message: error.message
    });
  }
};

module.exports = {
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
};
