const { DonHang, CTDonHang, ThanhToan } = require('../models');
const { sequelize } = require('../config/database');
const { Op } = require('sequelize');

// Process DonHang payment
const processOrderPayment = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { orderId } = req.params;
    const { 
      HinhThuc, 
      SoTienNhan, 
      MaGiaoDich, 
      MaNVXuLy,
      GhiChu 
    } = req.body;

    // Validate required fields
    if (!HinhThuc || !MaNVXuLy) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Thiếu thông tin: HinhThuc và MaNVXuLy là bắt buộc'
      });
    }

    // Get DonHang with details
    const donHang = await DonHang.findByPk(orderId, {
      include: [{ 
        model: CTDonHang, 
        as: 'chitiet' 
      }],
      transaction
    });

    if (!donHang) {
      await transaction.rollback();
      return res.status(404).json({
        error: 'Order not found',
        message: 'Không tìm thấy đơn hàng'
      });
    }

    if (donHang.TrangThai === 'Hoàn thành') {
      await transaction.rollback();
      return res.status(400).json({
        error: 'Order already completed',
        message: 'Đơn hàng đã được thanh toán'
      });
    }

    if (donHang.TrangThai === 'Đã hủy') {
      await transaction.rollback();
      return res.status(400).json({
        error: 'Order cancelled',
        message: 'Không thể thanh toán đơn hàng đã hủy'
      });
    }

    // Calculate payment amounts
    const soTien = parseFloat(donHang.TongTien);
    const soTienNhan = SoTienNhan ? parseFloat(SoTienNhan) : soTien;
    const soTienThua = Math.max(0, soTienNhan - soTien);

    // Create payment record
    const thanhToan = await ThanhToan.create({
      MaDH: donHang.MaDH,
      HinhThuc: HinhThuc,
      SoTien: soTien,
      SoTienNhan: soTienNhan,
      SoTienThua: soTienThua,
      MaGiaoDich: MaGiaoDich,
      TrangThai: 'Thành công',
      MaNVXuLy: parseInt(MaNVXuLy),
      GhiChu: GhiChu
    }, { transaction });

    // Update DonHang status
    await donHang.update({
      TrangThai: 'Đã hoàn thành'
    }, { transaction });

    await transaction.commit();

    res.status(200).json({
      message: 'Payment processed successfully',
      message_vi: 'Thanh toán thành công',
      data: {
        donHang: donHang,
        thanhToan: thanhToan
      }
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Error processing payment:', error);
    res.status(500).json({
      error: 'Failed to process payment',
      message: 'Lỗi xử lý thanh toán: ' + error.message
    });
  }
};

// Get payment history for an order
const getOrderPayments = async (req, res) => {
  try {
    const { orderId } = req.params;

    const payments = await ThanhToan.findAll({
      where: { MaDH: orderId },
      include: [
        {
          model: DonHang,
          as: 'donhang',
          include: [
            {
              model: CTDonHang,
              as: 'chitiet'
            }
          ]
        }
      ],
      order: [['NgayTT', 'DESC']]
    });

    res.status(200).json({
      message: 'Payment history retrieved successfully',
      payments: payments
    });

  } catch (error) {
    console.error('Error getting payment history:', error);
    res.status(500).json({
      error: 'Failed to get payment history',
      message: 'Lỗi lấy lịch sử thanh toán: ' + error.message
    });
  }
};

// Get all payments with filters
const getAllPayments = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      HinhThuc,
      TrangThai,
      MaNVXuLy,
      fromDate,
      toDate
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {};

    // Apply filters
    if (HinhThuc) whereClause.HinhThuc = HinhThuc;
    if (TrangThai) whereClause.TrangThai = TrangThai;
    if (MaNVXuLy) whereClause.MaNVXuLy = parseInt(MaNVXuLy);

    if (fromDate || toDate) {
      whereClause.NgayTT = {};
      if (fromDate) whereClause.NgayTT[Op.gte] = new Date(fromDate);
      if (toDate) whereClause.NgayTT[Op.lte] = new Date(toDate);
    }

    const { count, rows: payments } = await ThanhToan.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: DonHang,
          as: 'donhang'
        }
      ],
      order: [['NgayTT', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });

    res.status(200).json({
      message: 'Payments retrieved successfully',
      payments: payments,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });

  } catch (error) {
    console.error('Error getting payments:', error);
    res.status(500).json({
      error: 'Failed to get payments',
      message: 'Lỗi lấy danh sách thanh toán: ' + error.message
    });
  }
};

// Get payment statistics
const getPaymentStats = async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;
    const whereClause = { TrangThai: 'Thành công' };

    if (fromDate || toDate) {
      whereClause.NgayTT = {};
      if (fromDate) whereClause.NgayTT[Op.gte] = new Date(fromDate);
      if (toDate) whereClause.NgayTT[Op.lte] = new Date(toDate);
    }

    // Total payments
    const totalPayments = await ThanhToan.count({
      where: whereClause
    });

    // Total revenue
    const totalRevenue = await ThanhToan.sum('SoTien', {
      where: whereClause
    });

    // Payment methods breakdown
    const paymentMethods = await ThanhToan.findAll({
      where: whereClause,
      attributes: [
        'HinhThuc',
        [sequelize.fn('COUNT', sequelize.col('MaTT')), 'count'],
        [sequelize.fn('SUM', sequelize.col('SoTien')), 'total']
      ],
      group: ['HinhThuc']
    });

    // Daily revenue (last 7 days)
    const dailyRevenue = await ThanhToan.findAll({
      where: {
        ...whereClause,
        NgayTT: {
          [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      },
      attributes: [
        [sequelize.fn('DATE', sequelize.col('NgayTT')), 'date'],
        [sequelize.fn('COUNT', sequelize.col('MaTT')), 'transactions'],
        [sequelize.fn('SUM', sequelize.col('SoTien')), 'revenue']
      ],
      group: [sequelize.fn('DATE', sequelize.col('NgayTT'))],
      order: [[sequelize.fn('DATE', sequelize.col('NgayTT')), 'ASC']]
    });

    res.status(200).json({
      message: 'Payment statistics retrieved successfully',
      stats: {
        total_payments: totalPayments,
        total_revenue: totalRevenue || 0,
        payment_methods: paymentMethods,
        daily_revenue: dailyRevenue
      }
    });

  } catch (error) {
    console.error('Error getting payment stats:', error);
    res.status(500).json({
      error: 'Failed to get payment statistics',
      message: 'Lỗi lấy thống kê thanh toán: ' + error.message
    });
  }
};

module.exports = {
  processOrderPayment,
  getOrderPayments,
  getAllPayments,
  getPaymentStats
};
