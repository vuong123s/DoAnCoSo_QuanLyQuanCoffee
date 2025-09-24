const { Voucher } = require('../models');
const { Op } = require('sequelize');

const voucherController = {
  // Lấy danh sách voucher
  async getVouchers(req, res) {
    try {
      const { 
        status, 
        search, 
        page = 1,
        limit = 20
      } = req.query;

      const offset = (page - 1) * limit;
      let whereCondition = {};

      // Lọc theo trạng thái
      if (status) {
        whereCondition.TrangThai = status;
      }

      // Tìm kiếm theo tên hoặc mã
      if (search) {
        whereCondition[Op.or] = [
          { TenVC: { [Op.like]: `%${search}%` } },
          { MaCode: { [Op.like]: `%${search}%` } }
        ];
      }

      const { count, rows } = await Voucher.findAndCountAll({
        where: whereCondition,
        order: [['NgayTao', 'DESC']],
        limit: parseInt(limit),
        offset: offset
      });

      res.json({
        success: true,
        data: {
          vouchers: rows,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(count / limit),
            totalItems: count,
            itemsPerPage: parseInt(limit)
          }
        }
      });
    } catch (error) {
      console.error('Error getting vouchers:', error);
      res.status(500).json({
        error: 'Lỗi khi lấy danh sách voucher',
        message: error.message
      });
    }
  },

  // Lấy chi tiết voucher
  async getVoucherById(req, res) {
    try {
      const { id } = req.params;
      const voucher = await Voucher.findByPk(id);

      if (!voucher) {
        return res.status(404).json({
          error: 'Không tìm thấy voucher'
        });
      }

      res.json({
        success: true,
        data: voucher
      });
    } catch (error) {
      console.error('Error getting voucher:', error);
      res.status(500).json({
        error: 'Lỗi khi lấy thông tin voucher',
        message: error.message
      });
    }
  },

  // Tạo voucher mới
  async createVoucher(req, res) {
    try {
      const {
        TenVC,
        MaCode,
        LoaiGiamGia = 'Tiền',
        GiaTri,
        GiaTriToiDa,
        DonHangToiThieu = 0,
        SoLuongToiDa = 1,
        NgayBD,
        NgayKT,
        TrangThai = 'Còn hạn',
        MoTa,
        MaKH
      } = req.body;

      // Kiểm tra mã voucher đã tồn tại
      const existingVoucher = await Voucher.findOne({ where: { MaCode } });
      if (existingVoucher) {
        return res.status(400).json({
          error: 'Mã voucher đã tồn tại'
        });
      }

      const newVoucher = await Voucher.create({
        TenVC,
        MaCode,
        LoaiGiamGia,
        GiaTri,
        GiaTriToiDa,
        DonHangToiThieu,
        SoLuongToiDa,
        NgayBD,
        NgayKT,
        TrangThai,
        MoTa,
        MaKH
      });

      res.status(201).json({
        success: true,
        message: 'Tạo voucher thành công',
        data: newVoucher
      });
    } catch (error) {
      console.error('Error creating voucher:', error);
      res.status(500).json({
        error: 'Lỗi khi tạo voucher',
        message: error.message
      });
    }
  },

  // Cập nhật voucher
  async updateVoucher(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const voucher = await Voucher.findByPk(id);
      if (!voucher) {
        return res.status(404).json({
          error: 'Không tìm thấy voucher'
        });
      }

      // Không cho phép cập nhật mã voucher
      delete updateData.MaCode;

      await voucher.update(updateData);

      res.json({
        success: true,
        message: 'Cập nhật voucher thành công',
        data: voucher
      });
    } catch (error) {
      console.error('Error updating voucher:', error);
      res.status(500).json({
        error: 'Lỗi khi cập nhật voucher',
        message: error.message
      });
    }
  },

  // Xóa voucher
  async deleteVoucher(req, res) {
    try {
      const { id } = req.params;

      const voucher = await Voucher.findByPk(id);
      if (!voucher) {
        return res.status(404).json({
          error: 'Không tìm thấy voucher'
        });
      }

      await voucher.destroy();

      res.json({
        success: true,
        message: 'Xóa voucher thành công'
      });
    } catch (error) {
      console.error('Error deleting voucher:', error);
      res.status(500).json({
        error: 'Lỗi khi xóa voucher',
        message: error.message
      });
    }
  },

  // Kiểm tra voucher có thể sử dụng
  async validateVoucher(req, res) {
    try {
      const { code, orderValue = 0 } = req.body;

      const voucher = await Voucher.findOne({ where: { MaCode: code } });
      if (!voucher) {
        return res.status(404).json({
          error: 'Voucher không tồn tại'
        });
      }

      const now = new Date();
      const validationResult = {
        isValid: true,
        errors: [],
        discountAmount: 0
      };

      // Kiểm tra trạng thái
      if (voucher.TrangThai !== 'Còn hạn') {
        validationResult.isValid = false;
        validationResult.errors.push('Voucher không hoạt động');
      }

      // Kiểm tra thời hạn
      if (now < voucher.NgayBD || now > voucher.NgayKT) {
        validationResult.isValid = false;
        validationResult.errors.push('Voucher đã hết hạn hoặc chưa có hiệu lực');
      }

      // Kiểm tra số lượng sử dụng
      if (voucher.SoLuongDaSuDung >= voucher.SoLuongToiDa) {
        validationResult.isValid = false;
        validationResult.errors.push('Voucher đã hết lượt sử dụng');
      }

      // Kiểm tra giá trị đơn hàng tối thiểu
      if (orderValue < voucher.DonHangToiThieu) {
        validationResult.isValid = false;
        validationResult.errors.push(`Đơn hàng tối thiểu ${voucher.DonHangToiThieu.toLocaleString()}đ`);
      }

      // Tính toán giá trị giảm
      if (validationResult.isValid) {
        if (voucher.LoaiGiamGia === 'Tiền') {
          validationResult.discountAmount = Math.min(voucher.GiaTri, orderValue);
        } else { // Phần trăm
          let discountAmount = (orderValue * voucher.GiaTri) / 100;
          if (voucher.GiaTriToiDa) {
            discountAmount = Math.min(discountAmount, voucher.GiaTriToiDa);
          }
          validationResult.discountAmount = Math.min(discountAmount, orderValue);
        }
      }

      res.json({
        success: true,
        data: {
          voucher: {
            code: voucher.MaCode,
            name: voucher.TenVC,
            description: voucher.MoTa,
            discountType: voucher.LoaiGiamGia,
            discountValue: voucher.GiaTri
          },
          validation: validationResult
        }
      });
    } catch (error) {
      console.error('Error validating voucher:', error);
      res.status(500).json({
        error: 'Lỗi khi kiểm tra voucher',
        message: error.message
      });
    }
  },

  // Sử dụng voucher
  async useVoucher(req, res) {
    try {
      const { code } = req.body;

      const voucher = await Voucher.findOne({ where: { MaCode: code } });
      if (!voucher) {
        return res.status(404).json({
          error: 'Voucher không tồn tại'
        });
      }

      // Tăng số lượng đã sử dụng
      voucher.SoLuongDaSuDung += 1;
      await voucher.save();

      res.json({
        success: true,
        message: 'Sử dụng voucher thành công',
        data: voucher
      });
    } catch (error) {
      console.error('Error using voucher:', error);
      res.status(500).json({
        error: 'Lỗi khi sử dụng voucher',
        message: error.message
      });
    }
  },

  // Lấy voucher có thể sử dụng
  async getAvailableVouchers(req, res) {
    try {
      const { orderValue = 0 } = req.query;
      const now = new Date();

      const vouchers = await Voucher.findAll({
        where: {
          TrangThai: 'Còn hạn',
          NgayBD: { [Op.lte]: now },
          NgayKT: { [Op.gte]: now },
          DonHangToiThieu: { [Op.lte]: orderValue }
        },
        order: [['GiaTri', 'DESC']]
      });

      res.json({
        success: true,
        data: vouchers
      });
    } catch (error) {
      console.error('Error getting available vouchers:', error);
      res.status(500).json({
        error: 'Lỗi khi lấy danh sách voucher khả dụng',
        message: error.message
      });
    }
  },

  // Thống kê voucher
  async getVoucherStats(req, res) {
    try {
      const totalVouchers = await Voucher.count();
      const activeVouchers = await Voucher.count({
        where: { TrangThai: 'Còn hạn' }
      });
      const expiredVouchers = await Voucher.count({
        where: { TrangThai: 'Hết hạn' }
      });
      const usedVouchers = await Voucher.sum('SoLuongDaSuDung') || 0;

      res.json({
        success: true,
        data: {
          totalVouchers,
          activeVouchers,
          expiredVouchers,
          usedVouchers
        }
      });
    } catch (error) {
      console.error('Error getting voucher stats:', error);
      res.status(500).json({
        error: 'Lỗi khi lấy thống kê voucher',
        message: error.message
      });
    }
  }
};

module.exports = voucherController;
