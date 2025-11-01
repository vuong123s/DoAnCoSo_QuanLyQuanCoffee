const { DonHangOnline, CTDonHangOnline, Voucher, ThanhToan } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');

// Create a new online order
const createOnlineOrder = async (req, res) => {
  try {
    console.log('📦 Creating online order with data:', JSON.stringify(req.body, null, 2));
    
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

    console.log('📋 Extracted fields:', { TenKhach, SDTKhach, DiaChiGiaoHang, LoaiDonHang, TongTien, MaVC, items: items.length });

    if (!TenKhach || !SDTKhach || !DiaChiGiaoHang) {
      console.log('❌ Missing required fields:', { TenKhach: !!TenKhach, SDTKhach: !!SDTKhach, DiaChiGiaoHang: !!DiaChiGiaoHang });
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Thiếu thông tin: TenKhach, SDTKhach, DiaChiGiaoHang là bắt buộc'
      });
    }

    // Lookup voucher ID if voucher code is provided
    let voucherID = null;
    if (MaVC) {
      console.log('🎫 Looking up voucher:', MaVC);
      // Check if MaVC is already an ID (number) or a code (string)
      if (typeof MaVC === 'string' && isNaN(MaVC)) {
        // It's a voucher code, lookup the ID
        const voucher = await Voucher.findOne({ where: { MaCode: MaVC } });
        if (voucher) {
          voucherID = voucher.MaVC;
          console.log('✅ Found voucher ID:', voucherID);
        } else {
          console.log('⚠️  Voucher code not found:', MaVC);
        }
      } else {
        // It's already an ID
        voucherID = parseInt(MaVC);
      }
    }

    // Calculate TongThanhToan
    const tongThanhToan = parseFloat(TongTien) + parseFloat(PhiGiaoHang) - parseFloat(GiamGia);
    console.log('💰 Calculated total:', { TongTien, PhiGiaoHang, GiamGia, tongThanhToan, voucherID });

    // Create online order
    console.log('📝 Creating order in database...');
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
      MaVC: voucherID,
      GiamGia: parseFloat(GiamGia),
      GhiChu: GhiChu
    });
    console.log('✅ Order created with ID:', onlineOrder.MaDHOnline);

    // Add items if provided
    if (items && items.length > 0) {
      console.log(`📦 Adding ${items.length} items to order...`);
      for (const item of items) {
        try {
          const thanhTien = parseFloat(item.DonGia) * parseInt(item.SoLuong);
          console.log(`  - Item: MaMon=${item.MaMon}, SoLuong=${item.SoLuong}, DonGia=${item.DonGia}`);
          
          const itemData = {
            MaDHOnline: onlineOrder.MaDHOnline,
            MaMon: parseInt(item.MaMon),
            SoLuong: parseInt(item.SoLuong),
            DonGia: parseFloat(item.DonGia),
            ThanhTien: thanhTien,
            GhiChu: item.GhiChu || item.GhiChuMon || null
          };
          
          console.log('  - Creating item with data:', itemData);
          await CTDonHangOnline.create(itemData);
          console.log('  ✅ Item added successfully');
        } catch (itemError) {
          console.error(`  ❌ Error adding item MaMon=${item.MaMon}:`, itemError.message);
          // Continue with other items even if one fails
        }
      }
      console.log('✅ All items processed');
    }

    // Get complete order with items
    console.log('📋 Fetching complete order with items...');
    const completeOrder = await DonHangOnline.findByPk(onlineOrder.MaDHOnline, {
      include: [{
        model: CTDonHangOnline,
        as: 'chitiet'
      }]
    });

    console.log('✅ Order creation completed successfully!');
    console.log('📦 Response:', { MaDHOnline: completeOrder.MaDHOnline, items: completeOrder.chitiet?.length || 0 });

    res.status(201).json({
      message: 'Online order created successfully',
      order: completeOrder,
      MaDHOnline: completeOrder.MaDHOnline // Add for easier access
    });

  } catch (error) {
    console.error('❌ Error creating online order:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({
      error: 'Failed to create online order',
      message: error.message,
      details: error.toString()
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
    console.log('📝 Updating order status:', { id, body: req.body });
    
    const { TrangThai, LyDoHuy, MaNVXuLy } = req.body;

    if (!TrangThai) {
      console.log('❌ Missing TrangThai field');
      return res.status(400).json({
        error: 'Status is required',
        message: 'Trạng thái là bắt buộc',
        received: req.body
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

// Delete online order
const deleteOnlineOrder = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('🗑️ Deleting online order:', id);
    
    const order = await DonHangOnline.findByPk(id);
    
    if (!order) {
      return res.status(404).json({
        error: 'Online order not found',
        message: 'Không tìm thấy đơn hàng online'
      });
    }
    
    // Allow deleting any order (removed status restriction)
    // Note: Be careful when deleting completed orders as it may affect reports
    console.log('⚠️ Deleting order with status:', order.TrangThai);
    
    // Delete related records in correct order (due to foreign key constraints)
    
    // 1. Delete order tracking records (TheoDoiDonHang) if exists
    try {
      await sequelize.query(
        'DELETE FROM TheoDoiDonHang WHERE MaDHOnline = ?',
        { replacements: [id], type: sequelize.QueryTypes.DELETE }
      );
      console.log('✅ Deleted tracking records for order:', id);
    } catch (err) {
      console.log('⚠️ No tracking records or table not exists:', err.message);
    }
    
    // 2. Delete any bills (ThanhToan) referencing this online order
    await ThanhToan.destroy({
      where: { MaDHOnline: id }
    });
    console.log('✅ Deleted related bills for order:', id);
    
    // 3. Delete order items (CTDonHangOnline)
    await CTDonHangOnline.destroy({
      where: { MaDHOnline: id }
    });
    console.log('✅ Deleted order items for order:', id);
    
    // 4. Delete the order itself
    await order.destroy();
    
    console.log('✅ Online order deleted:', id);
    
    res.json({
      success: true,
      message: 'Xóa đơn hàng thành công'
    });
    
  } catch (error) {
    console.error('❌ Error deleting online order:', error);
    res.status(500).json({
      error: 'Failed to delete online order',
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
  deleteOnlineOrder,
  getOnlineOrderStats
};
