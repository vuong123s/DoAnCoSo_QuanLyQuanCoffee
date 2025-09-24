const { TheoDoiDonHang, DonHangOnline } = require('../models');
const { Op } = require('sequelize');

const orderTrackingController = {
  // Lấy lịch sử theo dõi đơn hàng
  async getOrderTracking(req, res) {
    try {
      const { orderId } = req.params;

      const trackingHistory = await TheoDoiDonHang.findAll({
        where: { MaDonHangOnline: orderId },
        include: [
          {
            model: DonHangOnline,
            as: 'DonHang',
            attributes: ['MaDonHangOnline', 'TenKhach', 'SoDienThoai', 'TrangThaiDonHang']
          }
        ],
        order: [['NgayCapNhat', 'ASC']]
      });

      if (trackingHistory.length === 0) {
        return res.status(404).json({
          error: 'Không tìm thấy lịch sử theo dõi cho đơn hàng này'
        });
      }

      res.json({
        success: true,
        data: trackingHistory
      });
    } catch (error) {
      console.error('Error getting order tracking:', error);
      res.status(500).json({
        error: 'Lỗi khi lấy lịch sử theo dõi đơn hàng',
        message: error.message
      });
    }
  },

  // Thêm cập nhật theo dõi đơn hàng
  async addTrackingUpdate(req, res) {
    try {
      const { orderId } = req.params;
      const { 
        newStatus, 
        staffId, 
        notes, 
        currentLocation, 
        estimatedTime 
      } = req.body;

      // Kiểm tra đơn hàng có tồn tại không
      const order = await DonHangOnline.findByPk(orderId);
      if (!order) {
        return res.status(404).json({
          error: 'Không tìm thấy đơn hàng'
        });
      }

      const oldStatus = order.TrangThaiDonHang;

      // Tạo bản ghi theo dõi mới
      const trackingUpdate = await TheoDoiDonHang.create({
        MaDonHangOnline: orderId,
        TrangThaiCu: oldStatus,
        TrangThaiMoi: newStatus,
        MaNVCapNhat: staffId || null,
        GhiChu: notes || null,
        ViTriHienTai: currentLocation || null,
        ThoiGianDuKien: estimatedTime || null
      });

      // Cập nhật trạng thái đơn hàng
      order.TrangThaiDonHang = newStatus;
      await order.save();

      res.status(201).json({
        success: true,
        message: 'Đã thêm cập nhật theo dõi đơn hàng',
        data: trackingUpdate
      });
    } catch (error) {
      console.error('Error adding tracking update:', error);
      res.status(500).json({
        error: 'Lỗi khi thêm cập nhật theo dõi',
        message: error.message
      });
    }
  },

  // Lấy vị trí hiện tại của đơn hàng
  async getCurrentLocation(req, res) {
    try {
      const { orderId } = req.params;

      const latestTracking = await TheoDoiDonHang.findOne({
        where: { 
          MaDonHangOnline: orderId,
          ViTriHienTai: { [Op.not]: null }
        },
        order: [['NgayCapNhat', 'DESC']]
      });

      if (!latestTracking) {
        return res.status(404).json({
          error: 'Không có thông tin vị trí cho đơn hàng này'
        });
      }

      res.json({
        success: true,
        data: {
          currentLocation: latestTracking.ViTriHienTai,
          lastUpdate: latestTracking.NgayCapNhat,
          status: latestTracking.TrangThaiMoi,
          estimatedTime: latestTracking.ThoiGianDuKien
        }
      });
    } catch (error) {
      console.error('Error getting current location:', error);
      res.status(500).json({
        error: 'Lỗi khi lấy vị trí hiện tại',
        message: error.message
      });
    }
  },

  // Lấy danh sách đơn hàng theo trạng thái
  async getOrdersByStatus(req, res) {
    try {
      const { status } = req.params;
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const { count, rows } = await DonHangOnline.findAndCountAll({
        where: { TrangThaiDonHang: status },
        include: [
          {
            model: TheoDoiDonHang,
            as: 'LichSuTheoDoi',
            limit: 1,
            order: [['NgayCapNhat', 'DESC']]
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
      console.error('Error getting orders by status:', error);
      res.status(500).json({
        error: 'Lỗi khi lấy đơn hàng theo trạng thái',
        message: error.message
      });
    }
  },

  // Cập nhật vị trí giao hàng
  async updateDeliveryLocation(req, res) {
    try {
      const { orderId } = req.params;
      const { location, estimatedTime, notes } = req.body;

      // Kiểm tra đơn hàng có đang trong trạng thái giao hàng không
      const order = await DonHangOnline.findByPk(orderId);
      if (!order) {
        return res.status(404).json({
          error: 'Không tìm thấy đơn hàng'
        });
      }

      if (order.TrangThaiDonHang !== 'Đang giao hàng') {
        return res.status(400).json({
          error: 'Chỉ có thể cập nhật vị trí cho đơn hàng đang giao'
        });
      }

      // Tạo bản ghi theo dõi với vị trí mới
      const trackingUpdate = await TheoDoiDonHang.create({
        MaDonHangOnline: orderId,
        TrangThaiCu: 'Đang giao hàng',
        TrangThaiMoi: 'Đang giao hàng',
        ViTriHienTai: location,
        ThoiGianDuKien: estimatedTime || null,
        GhiChu: notes || 'Cập nhật vị trí giao hàng'
      });

      res.json({
        success: true,
        message: 'Đã cập nhật vị trí giao hàng',
        data: trackingUpdate
      });
    } catch (error) {
      console.error('Error updating delivery location:', error);
      res.status(500).json({
        error: 'Lỗi khi cập nhật vị trí giao hàng',
        message: error.message
      });
    }
  },

  // Lấy thống kê theo dõi đơn hàng
  async getTrackingStats(req, res) {
    try {
      const { startDate, endDate } = req.query;
      
      let whereCondition = {};
      if (startDate && endDate) {
        whereCondition.NgayCapNhat = {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        };
      }

      // Thống kê theo trạng thái
      const statusStats = await TheoDoiDonHang.findAll({
        where: whereCondition,
        attributes: [
          'TrangThaiMoi',
          [TheoDoiDonHang.sequelize.fn('COUNT', TheoDoiDonHang.sequelize.col('MaTheoDoi')), 'count']
        ],
        group: ['TrangThaiMoi']
      });

      // Thống kê thời gian xử lý trung bình
      const avgProcessingTime = await TheoDoiDonHang.findAll({
        where: whereCondition,
        attributes: [
          'MaDonHangOnline',
          [TheoDoiDonHang.sequelize.fn('MIN', TheoDoiDonHang.sequelize.col('NgayCapNhat')), 'startTime'],
          [TheoDoiDonHang.sequelize.fn('MAX', TheoDoiDonHang.sequelize.col('NgayCapNhat')), 'endTime']
        ],
        group: ['MaDonHangOnline'],
        having: TheoDoiDonHang.sequelize.where(
          TheoDoiDonHang.sequelize.fn('COUNT', TheoDoiDonHang.sequelize.col('MaTheoDoi')), 
          '>', 1
        )
      });

      res.json({
        success: true,
        data: {
          statusBreakdown: statusStats,
          processingTimeData: avgProcessingTime
        }
      });
    } catch (error) {
      console.error('Error getting tracking stats:', error);
      res.status(500).json({
        error: 'Lỗi khi lấy thống kê theo dõi',
        message: error.message
      });
    }
  }
};

module.exports = orderTrackingController;
