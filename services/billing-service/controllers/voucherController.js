const Voucher = require('../models/Voucher');
const { Op, fn, col } = require('sequelize');
const { sequelize } = require('../config/database');

// Get available vouchers for customers
const getAvailableVouchers = async (req, res) => {
  try {
    const { customerType = 'Tất cả' } = req.query;
    
    console.log('🎫 Fetching available vouchers for:', customerType);
    
    const now = new Date();
    
    const vouchers = await Voucher.findAll({
      where: {
        TrangThai: 'Còn hạn',
        NgayBD: { [Op.lte]: now },
        NgayKT: { [Op.gte]: now },
        SoLuongToiDa: { [Op.gt]: 0 },
        [Op.where]: sequelize.literal('SoLuongDaSuDung < SoLuongToiDa')
      },
      order: [['NgayTao', 'DESC']]
    });
    
    console.log(`✅ Found ${vouchers.length} available vouchers`);
    
    res.json({
      success: true,
      vouchers: vouchers,
      count: vouchers.length
    });
    
  } catch (error) {
    console.error('❌ Error fetching vouchers:', error);
    res.status(500).json({
      error: 'Failed to fetch vouchers',
      message: error.message
    });
  }
};

// Validate and apply voucher
const validateVoucher = async (req, res) => {
  try {
    const { code, orderTotal } = req.body;
    
    console.log('🔍 Validating voucher:', { code, orderTotal });
    
    if (!code || !orderTotal) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Vui lòng cung cấp mã voucher và tổng tiền đơn hàng'
      });
    }
    
    const voucher = await Voucher.findOne({
      where: { MaCode: code }
    });
    
    if (!voucher) {
      console.log('❌ Voucher not found:', code);
      return res.status(404).json({
        error: 'Voucher not found',
        message: 'Mã voucher không tồn tại'
      });
    }
    
    // Check status
    if (voucher.TrangThai !== 'Còn hạn') {
      return res.status(400).json({
        error: 'Voucher inactive',
        message: 'Voucher không còn hoạt động'
      });
    }
    
    // Check date range
    const now = new Date();
    if (now < voucher.NgayBD || now > voucher.NgayKT) {
      return res.status(400).json({
        error: 'Voucher expired',
        message: 'Voucher đã hết hạn hoặc chưa có hiệu lực'
      });
    }
    
    // Check quantity
    if (voucher.SoLuongDaSuDung >= voucher.SoLuongToiDa) {
      return res.status(400).json({
        error: 'Voucher out of stock',
        message: 'Voucher đã hết lượt sử dụng'
      });
    }
    
    // Check minimum order value
    if (parseFloat(orderTotal) < parseFloat(voucher.DonHangToiThieu)) {
      return res.status(400).json({
        error: 'Order value too low',
        message: `Đơn hàng tối thiểu ${voucher.DonHangToiThieu.toLocaleString('vi-VN')}đ để áp dụng voucher này`
      });
    }
    
    // Calculate discount
    let discount = 0;
    if (voucher.LoaiGiamGia === 'Phần trăm') {
      discount = (parseFloat(orderTotal) * parseFloat(voucher.GiaTri)) / 100;
      if (voucher.GiaTriToiDa && discount > parseFloat(voucher.GiaTriToiDa)) {
        discount = parseFloat(voucher.GiaTriToiDa);
      }
    } else {
      discount = parseFloat(voucher.GiaTri);
    }
    
    console.log('✅ Voucher valid:', { code, discount });
    
    res.json({
      success: true,
      valid: true,
      voucher: {
        MaVC: voucher.MaVC,
        MaCode: voucher.MaCode,
        TenVC: voucher.TenVC,
        MoTa: voucher.MoTa,
        LoaiGiamGia: voucher.LoaiGiamGia,
        GiaTri: voucher.GiaTri,
        discount: discount
      },
      discount: discount,
      message: 'Áp dụng voucher thành công'
    });
    
  } catch (error) {
    console.error('❌ Error validating voucher:', error);
    res.status(500).json({
      error: 'Failed to validate voucher',
      message: error.message
    });
  }
};

// Get all vouchers (admin)
const getAllVouchers = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const offset = (page - 1) * limit;
    const whereClause = {};
    
    if (status) {
      whereClause.TrangThai = status;
    }
    
    const { count, rows } = await Voucher.findAndCountAll({
      where: whereClause,
      order: [['NgayTao', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    res.json({
      success: true,
      vouchers: rows,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(count / limit),
        total_items: count,
        items_per_page: parseInt(limit)
      }
    });
    
  } catch (error) {
    console.error('❌ Error fetching all vouchers:', error);
    res.status(500).json({
      error: 'Failed to fetch vouchers',
      message: error.message
    });
  }
};

// Create voucher (admin)
const createVoucher = async (req, res) => {
  try {
    const voucherData = req.body;
    
    console.log('📝 Creating voucher:', voucherData);
    
    // Check if voucher code already exists
    const existing = await Voucher.findOne({
      where: { MaCode: voucherData.MaCode }
    });
    
    if (existing) {
      return res.status(400).json({
        error: 'Voucher code exists',
        message: 'Mã voucher đã tồn tại'
      });
    }
    
    const voucher = await Voucher.create(voucherData);
    
    console.log('✅ Voucher created:', voucher.MaVC);
    
    res.status(201).json({
      success: true,
      message: 'Tạo voucher thành công',
      voucher: voucher
    });
    
  } catch (error) {
    console.error('❌ Error creating voucher:', error);
    res.status(500).json({
      error: 'Failed to create voucher',
      message: error.message
    });
  }
};

// Update voucher (admin)
const updateVoucher = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    console.log('📝 Updating voucher:', id);
    
    const voucher = await Voucher.findByPk(id);
    
    if (!voucher) {
      return res.status(404).json({
        error: 'Voucher not found',
        message: 'Không tìm thấy voucher'
      });
    }
    
    await voucher.update(updateData);
    
    console.log('✅ Voucher updated:', id);
    
    res.json({
      success: true,
      message: 'Cập nhật voucher thành công',
      voucher: voucher
    });
    
  } catch (error) {
    console.error('❌ Error updating voucher:', error);
    res.status(500).json({
      error: 'Failed to update voucher',
      message: error.message
    });
  }
};

// Delete voucher (admin)
const deleteVoucher = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('🗑️ Deleting voucher:', id);
    
    const voucher = await Voucher.findByPk(id);
    
    if (!voucher) {
      return res.status(404).json({
        error: 'Voucher not found',
        message: 'Không tìm thấy voucher'
      });
    }
    
    await voucher.destroy();
    
    console.log('✅ Voucher deleted:', id);
    
    res.json({
      success: true,
      message: 'Xóa voucher thành công'
    });
    
  } catch (error) {
    console.error('❌ Error deleting voucher:', error);
    res.status(500).json({
      error: 'Failed to delete voucher',
      message: error.message
    });
  }
};

module.exports = {
  getAvailableVouchers,
  validateVoucher,
  getAllVouchers,
  createVoucher,
  updateVoucher,
  deleteVoucher
};
