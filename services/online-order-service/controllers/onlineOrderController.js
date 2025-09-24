const { DonHangOnline, CTDonHangOnline, TheoDoiDonHang, GioHang } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');

const onlineOrderController = {
  // Tạo đơn hàng online từ giỏ hàng
  async createOrder(req, res) {
    const transaction = await sequelize.transaction();
    
    try {
      const {
        customerId,
        sessionId,
        customerName,
        customerPhone,
        email,
        deliveryAddress,
        deliveryDate,
        paymentMethod,
        voucherCode,
        voucherDiscount,
        deliveryFee,
        notes,
        cartItems
      } = req.body;

      // Validation
      if (!customerName || !customerPhone || !deliveryAddress || !cartItems || cartItems.length === 0) {
        return res.status(400).json({
          error: 'Thiếu thông tin bắt buộc: tên khách hàng, số điện thoại, địa chỉ giao hàng và danh sách món'
        });
      }

      // Tính tổng tiền
      let totalAmount = 0;
      for (const item of cartItems) {
        totalAmount += parseFloat(item.price) * parseInt(item.quantity);
      }

      const finalAmount = totalAmount + (deliveryFee || 0) - (voucherDiscount || 0);

      // Tạo đơn hàng online
      const newOrder = await DonHangOnline.create({
        MaKH: customerId || null,
        TenKhach: customerName,
        SoDienThoai: customerPhone,
        Email: email || null,
        DiaChiGiaoHang: deliveryAddress,
        NgayGiaoHang: deliveryDate || null,
        TongTien: totalAmount,
        PhiGiaoHang: deliveryFee || 0,
        TongThanhToan: finalAmount,
        MaVoucher: voucherCode || null,
        GiamGiaVoucher: voucherDiscount || 0,
        PhuongThucThanhToan: paymentMethod || 'Tiền mặt',
        GhiChu: notes || null
      }, { transaction });

      // Tạo chi tiết đơn hàng
      const orderDetails = [];
      for (const item of cartItems) {
        const detail = await CTDonHangOnline.create({
          MaDonHangOnline: newOrder.MaDonHangOnline,
          MaMon: item.menuItemId,
          TenMon: item.name,
          SoLuong: item.quantity,
          DonGia: item.price,
          ThanhTien: parseFloat(item.price) * parseInt(item.quantity),
          GhiChuMon: item.notes || null
        }, { transaction });
        orderDetails.push(detail);
      }

      // Tạo bản ghi theo dõi đầu tiên
      await TheoDoiDonHang.create({
        MaDonHangOnline: newOrder.MaDonHangOnline,
        TrangThaiCu: null,
        TrangThaiMoi: 'Chờ xác nhận',
        GhiChu: 'Đơn hàng được tạo'
      }, { transaction });

      // Xóa giỏ hàng sau khi đặt hàng thành công
      if (customerId || sessionId) {
        const whereCondition = customerId 
          ? { MaKH: customerId }
          : { SessionId: sessionId };
        await GioHang.destroy({ where: whereCondition, transaction });
      }

      await transaction.commit();

      res.status(201).json({
        success: true,
        message: 'Đặt hàng thành công',
        data: {
          order: newOrder,
          orderDetails: orderDetails
        }
      });
    } catch (error) {
      await transaction.rollback();
      console.error('Error creating order:', error);
      res.status(500).json({
        error: 'Lỗi khi tạo đơn hàng',
        message: error.message
      });
    }
  },

  // Lấy danh sách đơn hàng
  async getOrders(req, res) {
    try {
      const { 
        customerId, 
        status, 
        paymentStatus, 
        page = 1, 
        limit = 10,
        startDate,
        endDate 
      } = req.query;

      const offset = (page - 1) * limit;
      let whereCondition = {};

      if (customerId) whereCondition.MaKH = customerId;
      if (status) whereCondition.TrangThaiDonHang = status;
      if (paymentStatus) whereCondition.TrangThaiThanhToan = paymentStatus;
      
      if (startDate && endDate) {
        whereCondition.NgayDatHang = {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        };
      }

      const { count, rows } = await DonHangOnline.findAndCountAll({
        where: whereCondition,
        include: [
          {
            model: CTDonHangOnline,
            as: 'ChiTietDonHang'
          }
        ],
        order: [['NgayDatHang', 'DESC']],
        limit: parseInt(limit),
        offset: offset
      });

      res.json({
        success: true,
        data: {
          orders: rows,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(count / limit),
            totalItems: count,
            itemsPerPage: parseInt(limit)
          }
        }
      });
    } catch (error) {
      console.error('Error getting orders:', error);
      res.status(500).json({
        error: 'Lỗi khi lấy danh sách đơn hàng',
        message: error.message
      });
    }
  },

  // Lấy chi tiết đơn hàng
  async getOrderById(req, res) {
    try {
      const { id } = req.params;

      const order = await DonHangOnline.findByPk(id, {
        include: [
          {
            model: CTDonHangOnline,
            as: 'ChiTietDonHang'
          },
          {
            model: TheoDoiDonHang,
            as: 'LichSuTheoDoi',
            order: [['NgayCapNhat', 'ASC']]
          }
        ]
      });

      if (!order) {
        return res.status(404).json({
          error: 'Không tìm thấy đơn hàng'
        });
      }

      res.json({
        success: true,
        data: order
      });
    } catch (error) {
      console.error('Error getting order:', error);
      res.status(500).json({
        error: 'Lỗi khi lấy thông tin đơn hàng',
        message: error.message
      });
    }
  },

  // Cập nhật trạng thái đơn hàng
  async updateOrderStatus(req, res) {
    const transaction = await sequelize.transaction();
    
    try {
      const { id } = req.params;
      const { status, staffId, notes, estimatedTime, currentLocation } = req.body;

      const order = await DonHangOnline.findByPk(id, { transaction });
      if (!order) {
        return res.status(404).json({
          error: 'Không tìm thấy đơn hàng'
        });
      }

      const oldStatus = order.TrangThaiDonHang;
      
      // Cập nhật trạng thái đơn hàng
      order.TrangThaiDonHang = status;
      if (staffId) order.MaNVXuLy = staffId;
      await order.save({ transaction });

      // Tạo bản ghi theo dõi
      await TheoDoiDonHang.create({
        MaDonHangOnline: id,
        TrangThaiCu: oldStatus,
        TrangThaiMoi: status,
        MaNVCapNhat: staffId || null,
        GhiChu: notes || null,
        ViTriHienTai: currentLocation || null,
        ThoiGianDuKien: estimatedTime || null
      }, { transaction });

      await transaction.commit();

      res.json({
        success: true,
        message: 'Đã cập nhật trạng thái đơn hàng',
        data: order
      });
    } catch (error) {
      await transaction.rollback();
      console.error('Error updating order status:', error);
      res.status(500).json({
        error: 'Lỗi khi cập nhật trạng thái đơn hàng',
        message: error.message
      });
    }
  },

  // Cập nhật trạng thái thanh toán
  async updatePaymentStatus(req, res) {
    try {
      const { id } = req.params;
      const { paymentStatus } = req.body;

      const order = await DonHangOnline.findByPk(id);
      if (!order) {
        return res.status(404).json({
          error: 'Không tìm thấy đơn hàng'
        });
      }

      order.TrangThaiThanhToan = paymentStatus;
      await order.save();

      res.json({
        success: true,
        message: 'Đã cập nhật trạng thái thanh toán',
        data: order
      });
    } catch (error) {
      console.error('Error updating payment status:', error);
      res.status(500).json({
        error: 'Lỗi khi cập nhật trạng thái thanh toán',
        message: error.message
      });
    }
  },

  // Hủy đơn hàng
  async cancelOrder(req, res) {
    const transaction = await sequelize.transaction();
    
    try {
      const { id } = req.params;
      const { reason, staffId } = req.body;

      const order = await DonHangOnline.findByPk(id, { transaction });
      if (!order) {
        return res.status(404).json({
          error: 'Không tìm thấy đơn hàng'
        });
      }

      if (order.TrangThaiDonHang === 'Đã hủy') {
        return res.status(400).json({
          error: 'Đơn hàng đã được hủy trước đó'
        });
      }

      if (order.TrangThaiDonHang === 'Đã giao hàng') {
        return res.status(400).json({
          error: 'Không thể hủy đơn hàng đã giao'
        });
      }

      const oldStatus = order.TrangThaiDonHang;
      
      // Cập nhật trạng thái đơn hàng
      order.TrangThaiDonHang = 'Đã hủy';
      await order.save({ transaction });

      // Tạo bản ghi theo dõi
      await TheoDoiDonHang.create({
        MaDonHangOnline: id,
        TrangThaiCu: oldStatus,
        TrangThaiMoi: 'Đã hủy',
        MaNVCapNhat: staffId || null,
        GhiChu: reason || 'Đơn hàng bị hủy'
      }, { transaction });

      await transaction.commit();

      res.json({
        success: true,
        message: 'Đã hủy đơn hàng',
        data: order
      });
    } catch (error) {
      await transaction.rollback();
      console.error('Error canceling order:', error);
      res.status(500).json({
        error: 'Lỗi khi hủy đơn hàng',
        message: error.message
      });
    }
  },

  // Thống kê đơn hàng online
  async getOrderStats(req, res) {
    try {
      const { startDate, endDate } = req.query;
      
      let whereCondition = {};
      if (startDate && endDate) {
        whereCondition.NgayDatHang = {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        };
      }

      const totalOrders = await DonHangOnline.count({ where: whereCondition });
      
      const statusStats = await DonHangOnline.findAll({
        where: whereCondition,
        attributes: [
          'TrangThaiDonHang',
          [sequelize.fn('COUNT', sequelize.col('MaDonHangOnline')), 'count'],
          [sequelize.fn('SUM', sequelize.col('TongThanhToan')), 'totalAmount']
        ],
        group: ['TrangThaiDonHang']
      });

      const totalRevenue = await DonHangOnline.sum('TongThanhToan', {
        where: {
          ...whereCondition,
          TrangThaiThanhToan: 'Đã thanh toán'
        }
      });

      res.json({
        success: true,
        data: {
          totalOrders,
          totalRevenue: totalRevenue || 0,
          statusBreakdown: statusStats
        }
      });
    } catch (error) {
      console.error('Error getting order stats:', error);
      res.status(500).json({
        error: 'Lỗi khi lấy thống kê đơn hàng',
        message: error.message
      });
    }
  }
};

module.exports = onlineOrderController;
