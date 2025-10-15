const { DonHangOnline, CTDonHangOnline } = require('../models');
const { Op } = require('sequelize');

// Create a new online order
const createOnlineOrder = async (req, res) => {
  try {
    const { 
      MaKH,
      TenKhach, 
      SDTKhach,
      EmailKhach,
      DiaChiGiaoHang,
      LoaiDonHang = 'Giao hàng',
      NgayGiaoMong,
      TongTien = 0,
      PhiGiaoHang = 0,
      MaVC,
      GiamGia = 0,
      GhiChu,
      items = []
    } = req.body;

    if (!TenKhach || !SDTKhach || !DiaChiGiaoHang) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Thiếu thông tin: TenKhach, SDTKhach, DiaChiGiaoHang là bắt buộc'
      });
    }

    // Calculate TongThanhToan
    const tongThanhToan = parseFloat(TongTien) + parseFloat(PhiGiaoHang) - parseFloat(GiamGia);

    // Create online order
    const onlineOrder = await DonHangOnline.create({
      MaKH: MaKH ? parseInt(MaKH) : null,
      TenKhach: TenKhach.trim(),
      SDTKhach: SDTKhach.trim(),
      EmailKhach: EmailKhach ? EmailKhach.trim() : null,
      DiaChiGiaoHang: DiaChiGiaoHang.trim(),
      LoaiDonHang: LoaiDonHang,
      NgayGiaoMong: NgayGiaoMong ? new Date(NgayGiaoMong) : null,
      TongTien: parseFloat(TongTien),
      PhiGiaoHang: parseFloat(PhiGiaoHang),
      TongThanhToan: tongThanhToan,
      MaVC: MaVC ? parseInt(MaVC) : null,
      GiamGia: parseFloat(GiamGia),
      GhiChu: GhiChu
    });

    // Add items if provided
    if (items && items.length > 0) {
      for (const item of items) {
        const thanhTien = parseFloat(item.DonGia) * parseInt(item.SoLuong);
        await CTDonHangOnline.create({
          MaDHOnline: onlineOrder.MaDHOnline,
          MaMon: parseInt(item.MaMon),
          SoLuong: parseInt(item.SoLuong),
          DonGia: parseFloat(item.DonGia),
          ThanhTien: thanhTien,
          GhiChu: item.GhiChu || item.GhiChuMon || null
        });
      }
    }

    // Get complete order with items
    const completeOrder = await DonHangOnline.findByPk(onlineOrder.MaDHOnline, {
      include: [{
        model: CTDonHangOnline,
        as: 'chitiet'
      }]
    });

    res.status(201).json({
      message: 'Online order created successfully',
      order: completeOrder
    });

  } catch (error) {
    console.error('Error creating online order:', error);
    res.status(500).json({
      error: 'Failed to create online order',
      message: error.message
    });
  }
};

// Get all online orders with filters
const getOnlineOrders = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      MaKH,
      TrangThai,
      LoaiDonHang,
      start_date,
      end_date,
      search
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {};

    // Apply filters
    if (MaKH) whereClause.MaKH = parseInt(MaKH);
    if (TrangThai) whereClause.TrangThai = TrangThai;
    if (LoaiDonHang) whereClause.LoaiDonHang = LoaiDonHang;
    
    if (start_date || end_date) {
      whereClause.NgayDat = {};
      if (start_date) whereClause.NgayDat[Op.gte] = new Date(start_date);
      if (end_date) whereClause.NgayDat[Op.lte] = new Date(end_date);
    }

    // Search by customer name or phone
    if (search) {
      whereClause[Op.or] = [
        { TenKhach: { [Op.like]: `%${search}%` } },
        { SDTKhach: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows } = await DonHangOnline.findAndCountAll({
      where: whereClause,
      include: [{
        model: CTDonHangOnline,
        as: 'chitiet'
      }],
      order: [['NgayDat', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      data: rows,
      onlineOrders: rows,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(count / limit),
        total_items: count,
        items_per_page: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Error fetching online orders:', error);
    res.status(500).json({
      error: 'Failed to fetch online orders',
      message: error.message
    });
  }
};

// Get online order by ID
const getOnlineOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await DonHangOnline.findByPk(id, {
      include: [{
        model: CTDonHangOnline,
        as: 'chitiet'
      }]
    });

    if (!order) {
      return res.status(404).json({
        error: 'Online order not found',
        message: 'Không tìm thấy đơn hàng online'
      });
    }

    res.json({ 
      data: order,
      order: order 
    });

  } catch (error) {
    console.error('Error fetching online order:', error);
    res.status(500).json({
      error: 'Failed to fetch online order',
      message: error.message
    });
  }
};

// Update online order status
const updateOnlineOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { TrangThai, LyDoHuy, MaNVXuLy } = req.body;

    if (!TrangThai) {
      return res.status(400).json({
        error: 'Status is required',
        message: 'Trạng thái là bắt buộc'
      });
    }

    const validStatuses = ['Chờ xác nhận', 'Đã xác nhận', 'Đang chuẩn bị', 'Đang giao', 'Hoàn thành', 'Đã hủy'];
    if (!validStatuses.includes(TrangThai)) {
      return res.status(400).json({
        error: 'Invalid status',
        message: 'Trạng thái không hợp lệ. Chỉ chấp nhận: Chờ xác nhận, Đã xác nhận, Đang chuẩn bị, Đang giao, Hoàn thành, Đã hủy'
      });
    }

    const order = await DonHangOnline.findByPk(id);
    if (!order) {
      return res.status(404).json({
        error: 'Online order not found',
        message: 'Không tìm thấy đơn hàng online'
      });
    }

    const updateData = { TrangThai };
    if (LyDoHuy !== undefined) updateData.LyDoHuy = LyDoHuy;
    if (MaNVXuLy !== undefined) updateData.MaNVXuLy = parseInt(MaNVXuLy);

    await order.update(updateData);

    const updatedOrder = await DonHangOnline.findByPk(id, {
      include: [{
        model: CTDonHangOnline,
        as: 'chitiet'
      }]
    });

    res.json({
      message: 'Online order status updated successfully',
      order: updatedOrder
    });

  } catch (error) {
    console.error('Error updating online order status:', error);
    res.status(500).json({
      error: 'Failed to update online order status',
      message: error.message
    });
  }
};

// Cancel online order
const cancelOnlineOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { LyDoHuy } = req.body;

    const order = await DonHangOnline.findByPk(id);
    if (!order) {
      return res.status(404).json({
        error: 'Online order not found',
        message: 'Không tìm thấy đơn hàng online'
      });
    }

    if (order.TrangThai === 'Hoàn thành') {
      return res.status(400).json({
        error: 'Cannot cancel a completed order',
        message: 'Không thể hủy đơn hàng đã hoàn thành',
        suggestion: 'Đơn hàng đã hoàn thành không thể hủy'
      });
    }

    if (order.TrangThai === 'Đã hủy') {
      return res.status(400).json({
        error: 'Order already cancelled',
        message: 'Đơn hàng đã được hủy trước đó'
      });
    }

    await order.update({ 
      TrangThai: 'Đã hủy',
      LyDoHuy: LyDoHuy || 'Hủy bởi khách hàng'
    });

    res.json({
      message: 'Online order cancelled successfully'
    });

  } catch (error) {
    console.error('Error cancelling online order:', error);
    res.status(500).json({
      error: 'Failed to cancel online order',
      message: error.message
    });
  }
};

// Get online order statistics
const getOnlineOrderStats = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    const whereClause = {};

    if (start_date || end_date) {
      whereClause.NgayDat = {};
      if (start_date) whereClause.NgayDat[Op.gte] = new Date(start_date);
      if (end_date) whereClause.NgayDat[Op.lte] = new Date(end_date);
    }

    const totalOrders = await DonHangOnline.count({ where: whereClause });
    
    const completedOrders = await DonHangOnline.count({
      where: { ...whereClause, TrangThai: 'Hoàn thành' }
    });

    const pendingOrders = await DonHangOnline.count({
      where: { ...whereClause, TrangThai: 'Chờ xác nhận' }
    });

    const processingOrders = await DonHangOnline.count({
      where: { 
        ...whereClause, 
        TrangThai: { [Op.in]: ['Đã xác nhận', 'Đang chuẩn bị', 'Đang giao'] }
      }
    });

    const cancelledOrders = await DonHangOnline.count({
      where: { ...whereClause, TrangThai: 'Đã hủy' }
    });

    const totalRevenue = await DonHangOnline.sum('TongThanhToan', {
      where: { ...whereClause, TrangThai: 'Hoàn thành' }
    });

    const averageOrderAmount = await DonHangOnline.findAll({
      where: { ...whereClause, TrangThai: 'Hoàn thành' },
      attributes: [
        [require('sequelize').fn('AVG', require('sequelize').col('TongThanhToan')), 'average']
      ]
    });

    // Order type breakdown
    const deliveryOrders = await DonHangOnline.count({
      where: { ...whereClause, LoaiDonHang: 'Giao hàng' }
    });

    const pickupOrders = await DonHangOnline.count({
      where: { ...whereClause, LoaiDonHang: 'Mang đi' }
    });

    res.json({
      stats: {
        total_orders: totalOrders,
        completed_orders: completedOrders,
        pending_orders: pendingOrders,
        processing_orders: processingOrders,
        cancelled_orders: cancelledOrders,
        total_revenue: totalRevenue || 0,
        average_order_amount: averageOrderAmount[0]?.dataValues?.average || 0,
        order_types: {
          delivery: deliveryOrders,
          pickup: pickupOrders
        }
      }
    });

  } catch (error) {
    console.error('Error fetching online order stats:', error);
    res.status(500).json({
      error: 'Failed to fetch online order statistics',
      message: error.message
    });
  }
};

module.exports = {
  // Online order management
  createOnlineOrder,
  getOnlineOrders,
  getOnlineOrderById,
  updateOnlineOrderStatus,
  cancelOnlineOrder,
  getOnlineOrderStats
};
