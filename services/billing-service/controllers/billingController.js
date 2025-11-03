const { DonHang, CTDonHang } = require('../models');
const { Op } = require('sequelize');
const { processOrderPoints } = require('../utils/loyaltyPoints');

// Create a new order (DonHang schema)
const createOrder = async (req, res) => {
  try {
    const { 
      MaBan, 
      MaNV,
      MaKH, // Customer ID for loyalty points
      TrangThai = 'Đang xử lý',
      TongTien = 0,
      GhiChu,
      items = [] // Optional: Array of items [{MaMon, SoLuong, DonGia, GhiChu}]
    } = req.body;

    if (!MaBan) {
      return res.status(400).json({
        error: 'Missing required field: MaBan'
      });
    }

    // Calculate total amount from items if provided
    let totalAmount = parseFloat(TongTien);
    if (items.length > 0) {
      totalAmount = items.reduce((sum, item) => {
        return sum + (item.SoLuong * item.DonGia);
      }, 0);
    }

    // Create DonHang record
    const donHang = await DonHang.create({
      MaBan: parseInt(MaBan),
      MaNV: MaNV ? parseInt(MaNV) : null,
      MaKH: MaKH ? parseInt(MaKH) : null,
      TongTien: totalAmount,
      TrangThai: TrangThai
    });

    // Add items to order if provided
    if (items.length > 0) {
      const orderItems = items.map(item => ({
        MaDH: donHang.MaDH,
        MaMon: parseInt(item.MaMon),
        SoLuong: parseInt(item.SoLuong),
        DonGia: parseFloat(item.DonGia),
        ThanhTien: parseInt(item.SoLuong) * parseFloat(item.DonGia),
        GhiChu: item.GhiChu || null
      }));

      await CTDonHang.bulkCreate(orderItems);
    }

    // Fetch complete order with items
    const completeOrder = await DonHang.findByPk(donHang.MaDH, {
      include: [{
        model: CTDonHang,
        as: 'chitiet'
      }]
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: completeOrder,
      MaDH: donHang.MaDH,
      orderId: donHang.MaDH
    });

  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      error: 'Failed to create order',
      message: error.message
    });
  }
};

// Get all orders (DonHang schema)
const getBills = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      MaBan,
      MaNV,
      TrangThai,
      start_date,
      end_date
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {};

    // Apply filters
    if (MaBan) whereClause.MaBan = parseInt(MaBan);
    if (MaNV) whereClause.MaNV = parseInt(MaNV);
    if (TrangThai) whereClause.TrangThai = TrangThai;
    
    if (start_date || end_date) {
      whereClause.NgayLap = {};
      if (start_date) whereClause.NgayLap[Op.gte] = new Date(start_date);
      if (end_date) whereClause.NgayLap[Op.lte] = new Date(end_date);
    }

    const { count, rows } = await DonHang.findAndCountAll({
      where: whereClause,
      include: [{
        model: CTDonHang,
        as: 'chitiet'
      }],
      order: [['NgayLap', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      donhangs: rows,
      bills: rows, // Alias for compatibility
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(count / limit),
        total_items: count,
        items_per_page: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      error: 'Failed to fetch orders',
      message: error.message
    });
  }
};

// Get orders by customer ID
const getOrdersByCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { limit = 100 } = req.query;

    if (!customerId) {
      return res.status(400).json({
        error: 'Customer ID is required',
        message: 'Vui lòng cung cấp mã khách hàng'
      });
    }

    console.log(`👥 Fetching orders for customer #${customerId}`);

    const orders = await DonHang.findAll({
      where: { MaKH: parseInt(customerId) },
      include: [{
        model: CTDonHang,
        as: 'chitiet'
      }],
      order: [['NgayLap', 'DESC']],
      limit: parseInt(limit)
    });

    console.log(`✅ Found ${orders.length} orders for customer #${customerId}`);

    res.json({
      success: true,
      orders: orders,
      bills: orders, // Alias for compatibility
      donhangs: orders,
      count: orders.length
    });

  } catch (error) {
    console.error('Error fetching orders by customer:', error);
    res.status(500).json({
      error: 'Failed to fetch orders',
      message: error.message
    });
  }
};

// Cancel order
const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { LyDoHuy } = req.body;

    const order = await DonHang.findByPk(id);
    
    if (!order) {
      return res.status(404).json({
        error: 'Order not found',
        message: 'Không tìm thấy đơn hàng'
      });
    }

    // Only allow canceling orders that are not completed or already canceled
    if (order.TrangThai === 'Hoàn thành' || order.TrangThai === 'Đã hủy') {
      return res.status(400).json({
        error: 'Cannot cancel order',
        message: `Không thể hủy đơn hàng đã ${order.TrangThai.toLowerCase()}`
      });
    }

    await order.update({
      TrangThai: 'Đã hủy',
      GhiChu: LyDoHuy || 'Đơn hàng đã bị hủy'
    });

    console.log(`🚫 Order ${id} canceled:`, LyDoHuy);

    res.json({
      success: true,
      message: 'Đơn hàng đã được hủy',
      order: order
    });

  } catch (error) {
    console.error('Error canceling order:', error);
    res.status(500).json({
      error: 'Failed to cancel order',
      message: error.message
    });
  }
};

// Get order by ID (DonHang schema)
const getBillById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await DonHang.findByPk(id, {
      include: [{
        model: CTDonHang,
        as: 'chitiet'
      }]
    });

    if (!order) {
      return res.status(404).json({
        error: 'Order not found',
        message: 'Không tìm thấy đơn hàng'
      });
    }

    res.json({ 
      bill: order, // For compatibility
      order: order 
    });

  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      error: 'Failed to fetch order',
      message: error.message
    });
  }
};

// Update order status (DonHang schema)
const updateOrderStatus = async (req, res) => {
  try {
    console.log('🔄 updateOrderStatus called with:', { id: req.params.id, body: req.body });
    const { id } = req.params;
    const { TrangThai, GhiChu } = req.body;

    if (!TrangThai) {
      return res.status(400).json({
        error: 'Status is required',
        message: 'Trạng thái là bắt buộc'
      });
    }

    const validStatuses = ['Đang xử lý', 'Hoàn thành', 'Đã hủy'];
    if (!validStatuses.includes(TrangThai)) {
      return res.status(400).json({
        error: 'Invalid status',
        message: 'Trạng thái không hợp lệ. Chỉ chấp nhận: Đang xử lý, Hoàn thành, Đã hủy'
      });
    }

    const order = await DonHang.findByPk(id);
    if (!order) {
      return res.status(404).json({
        error: 'Order not found',
        message: 'Không tìm thấy đơn hàng'
      });
    }

    const previousStatus = order.TrangThai;
    await order.update({ TrangThai });

    // Cộng điểm cho khách hàng khi đơn hàng hoàn thành
    if (TrangThai === 'Hoàn thành' && previousStatus !== 'Hoàn thành' && order.MaKH) {
      console.log(`🎁 Processing loyalty points for order #${id}, customer #${order.MaKH}`);
      const pointsResult = await processOrderPoints(
        order.MaKH,
        order.TongTien,
        'DonHang',
        order.MaDH
      );
      
      if (pointsResult.success) {
        console.log(`✅ Successfully added ${pointsResult.pointsAdded} points to customer ${order.MaKH}`);
      }
    }

    const updatedOrder = await DonHang.findByPk(id, {
      include: [{
        model: CTDonHang,
        as: 'chitiet'
      }]
    });

    res.json({
      message: 'Order status updated successfully',
      order: updatedOrder,
      bill: updatedOrder // For compatibility
    });

  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      error: 'Failed to update order status',
      message: error.message
    });
  }
};

// Get billing statistics (Vietnamese schema)
const getBillingStats = async (req, res) => {
  try {
    const { start_date, end_date, NgayBatDau, NgayKetThuc } = req.query;
    const whereClause = {};

    const startDate = NgayBatDau || start_date;
    const endDate = NgayKetThuc || end_date;

    if (startDate || endDate) {
      whereClause.NgayLap = {};
      if (startDate) whereClause.NgayLap[Op.gte] = new Date(startDate);
      if (endDate) whereClause.NgayLap[Op.lte] = new Date(endDate);
    }

    const totalBills = await DonHang.count({ where: whereClause });
    
    const paidBills = await DonHang.count({
      where: { ...whereClause, TrangThai: 'Hoàn thành' }
    });

    const pendingBills = await DonHang.count({
      where: { ...whereClause, TrangThai: 'Đang xử lý' }
    });

    const cancelledBills = await DonHang.count({
      where: { ...whereClause, TrangThai: 'Đã hủy' }
    });

    const totalRevenue = await DonHang.sum('TongTien', {
      where: { ...whereClause, TrangThai: 'Hoàn thành' }
    });

    const averageBillAmount = await DonHang.findAll({
      where: { ...whereClause, TrangThai: 'Hoàn thành' },
      attributes: [
        [require('sequelize').fn('AVG', require('sequelize').col('TongTien')), 'average']
      ]
    });

    res.json({
      stats: {
        total_bills: totalBills,
        paid_bills: paidBills,
        pending_bills: pendingBills,
        cancelled_bills: cancelledBills,
        total_revenue: totalRevenue || 0,
        average_bill_amount: averageBillAmount[0]?.dataValues?.average || 0
      }
    });

  } catch (error) {
    console.error('Error fetching billing stats:', error);
    res.status(500).json({
      error: 'Failed to fetch billing statistics',
      message: error.message
    });
  }
};

// Delete order - DonHang schema
const deleteOrder = async (req, res) => {
  try {
    console.log('🗑️ deleteOrder called with ID:', req.params.id);
    const { id } = req.params;
    const { force } = req.query; // ?force=true to permanently delete

    const order = await DonHang.findByPk(id);
    if (!order) {
      return res.status(404).json({
        error: 'Order not found',
        message: 'Không tìm thấy đơn hàng'
      });
    }

    if (force === 'true') {
      // Hard delete: Remove from database completely
      console.log('🗑️ Hard deleting order:', id);
      
      // Delete order items first (foreign key constraint)
      await CTDonHang.destroy({ where: { MaDH: id } });
      
      // Then delete the order
      await order.destroy();
      
      res.json({
        message: 'Order permanently deleted successfully',
        deleted: true
      });
    } else {
      // Soft delete: Update status to "Đã hủy" (works for all statuses)
      console.log('🗑️ Soft deleting order:', id, 'Current status:', order.TrangThai);
      
      await order.update({ TrangThai: 'Đã hủy' });
      
      res.json({
        message: 'Order cancelled successfully',
        cancelled: true,
        previousStatus: order.TrangThai
      });
    }

  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({
      error: 'Failed to delete order',
      message: error.message
    });
  }
};

// Add item to order (bán hàng)
const addItemToOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { MaMon, SoLuong, DonGia, GhiChu } = req.body;

    if (!MaMon || !SoLuong || !DonGia) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Thiếu thông tin: MaMon, SoLuong, DonGia'
      });
    }

    // Check if order exists
    const order = await DonHang.findByPk(orderId);
    if (!order) {
      return res.status(404).json({
        error: 'Order not found',
        message: 'Không tìm thấy đơn hàng'
      });
    }

    if (order.TrangThai === 'Hoàn thành' || order.TrangThai === 'Đã hủy') {
      return res.status(400).json({
        error: 'Cannot modify completed or cancelled order',
        message: 'Không thể thêm món vào đơn hàng đã hoàn thành hoặc đã hủy'
      });
    }

    const thanhTien = parseFloat(DonGia) * parseInt(SoLuong);

    // Check if item already exists in order
    const existingItem = await CTDonHang.findOne({
      where: { MaDH: orderId, MaMon: MaMon }
    });

    let orderItem;
    if (existingItem) {
      // Update existing item
      const newQuantity = existingItem.SoLuong + parseInt(SoLuong);
      const newTotal = parseFloat(DonGia) * newQuantity;
      
      orderItem = await existingItem.update({
        SoLuong: newQuantity,
        DonGia: parseFloat(DonGia),
        ThanhTien: newTotal,
        GhiChu: GhiChu || existingItem.GhiChu // Keep existing note if no new note provided
      });
    } else {
      // Create new item
      orderItem = await CTDonHang.create({
        MaDH: orderId,
        MaMon: parseInt(MaMon),
        SoLuong: parseInt(SoLuong),
        DonGia: parseFloat(DonGia),
        ThanhTien: thanhTien,
        GhiChu: GhiChu || null // Add GhiChu field
      });
    }

    // Update order total
    const orderItems = await CTDonHang.findAll({
      where: { MaDH: orderId }
    });
    
    const newTotal = orderItems.reduce((sum, item) => sum + parseFloat(item.ThanhTien), 0);
    await order.update({ TongTien: newTotal });

    // Get updated order with items
    const updatedOrder = await DonHang.findByPk(orderId, {
      include: [{
        model: CTDonHang,
        as: 'chitiet'
      }]
    });

    res.json({
      message: 'Item added to order successfully',
      order: updatedOrder,
      item: orderItem
    });

  } catch (error) {
    console.error('Error adding item to order:', error);
    res.status(500).json({
      error: 'Failed to add item to order',
      message: error.message
    });
  }
};

// Update item in order
const updateOrderItem = async (req, res) => {
  try {
    const { orderId, itemId } = req.params;
    const { SoLuong, DonGia, GhiChu } = req.body;

    // Check if order exists
    const order = await DonHang.findByPk(orderId);
    if (!order) {
      return res.status(404).json({
        error: 'Order not found',
        message: 'Không tìm thấy đơn hàng'
      });
    }

    if (order.TrangThai === 'Hoàn thành' || order.TrangThai === 'Đã hủy') {
      return res.status(400).json({
        error: 'Cannot modify completed or cancelled order',
        message: 'Không thể sửa món trong đơn hàng đã hoàn thành hoặc đã hủy'
      });
    }

    // Find the item
    const orderItem = await CTDonHang.findOne({
      where: { MaDH: orderId, MaMon: itemId }
    });

    if (!orderItem) {
      return res.status(404).json({
        error: 'Item not found in order',
        message: 'Không tìm thấy món trong đơn hàng'
      });
    }

    const updateData = {};
    if (SoLuong !== undefined) {
      updateData.SoLuong = parseInt(SoLuong);
    }
    if (DonGia !== undefined) {
      updateData.DonGia = parseFloat(DonGia);
    }
    if (GhiChu !== undefined) {
      updateData.GhiChu = GhiChu;
    }
    
    // Calculate new ThanhTien
    const finalQuantity = updateData.SoLuong || orderItem.SoLuong;
    const finalPrice = updateData.DonGia || orderItem.DonGia;
    updateData.ThanhTien = finalQuantity * finalPrice;

    await orderItem.update(updateData);

    // Update order total
    const orderItems = await CTDonHang.findAll({
      where: { MaDH: orderId }
    });
    
    const newTotal = orderItems.reduce((sum, item) => sum + parseFloat(item.ThanhTien), 0);
    await order.update({ TongTien: newTotal });

    // Get updated order with items
    const updatedOrder = await DonHang.findByPk(orderId, {
      include: [{
        model: CTDonHang,
        as: 'chitiet'
      }]
    });

    res.json({
      message: 'Item updated successfully',
      order: updatedOrder
    });

  } catch (error) {
    console.error('Error updating order item:', error);
    res.status(500).json({
      error: 'Failed to update order item',
      message: error.message
    });
  }
};

// Remove item from order
const removeOrderItem = async (req, res) => {
  try {
    const { orderId, itemId } = req.params;

    // Check if order exists
    const order = await DonHang.findByPk(orderId);
    if (!order) {
      return res.status(404).json({
        error: 'Order not found',
        message: 'Không tìm thấy đơn hàng'
      });
    }

    if (order.TrangThai === 'Hoàn thành' || order.TrangThai === 'Đã hủy') {
      return res.status(400).json({
        error: 'Cannot modify completed or cancelled order',
        message: 'Không thể xóa món khỏi đơn hàng đã hoàn thành hoặc đã hủy'
      });
    }

    // Find and remove the item
    const orderItem = await CTDonHang.findOne({
      where: { MaDH: orderId, MaMon: itemId }
    });

    if (!orderItem) {
      return res.status(404).json({
        error: 'Item not found in order',
        message: 'Không tìm thấy món trong đơn hàng'
      });
    }

    await orderItem.destroy();

    // Update order total
    const orderItems = await CTDonHang.findAll({
      where: { MaDH: orderId }
    });
    
    const newTotal = orderItems.reduce((sum, item) => sum + parseFloat(item.ThanhTien), 0);
    await order.update({ TongTien: newTotal });

    // Get updated order with items
    const updatedOrder = await DonHang.findByPk(orderId, {
      include: [{
        model: CTDonHang,
        as: 'chitiet'
      }]
    });

    res.json({
      message: 'Item removed from order successfully',
      order: updatedOrder
    });

  } catch (error) {
    console.error('Error removing order item:', error);
    res.status(500).json({
      error: 'Failed to remove order item',
      message: error.message
    });
  }
};

// Get order items
const getOrderItems = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await DonHang.findByPk(orderId, {
      include: [{
        model: CTDonHang,
        as: 'chitiet'
      }]
    });

    if (!order) {
      return res.status(404).json({
        error: 'Order not found',
        message: 'Không tìm thấy đơn hàng'
      });
    }

    res.json({
      order: order,
      items: order.chitiet || []
    });

  } catch (error) {
    console.error('Error fetching order items:', error);
    res.status(500).json({
      error: 'Failed to fetch order items',
      message: error.message
    });
  }
};

// Create order with items (for table reservation with pre-order)
const createOrderWithItems = async (req, res) => {
  try {
    const { 
      MaBan, 
      MaNV,
      MaKH, // Customer ID for loyalty points
      TrangThai = 'Đang xử lý',
      items = [] // Array of items: [{MaMon, SoLuong, DonGia, GhiChu}]
    } = req.body;

    if (!MaBan) {
      return res.status(400).json({
        error: 'Missing required field: MaBan'
      });
    }

    // Calculate total amount from items
    let totalAmount = 0;
    if (items.length > 0) {
      totalAmount = items.reduce((sum, item) => {
        return sum + (item.SoLuong * item.DonGia);
      }, 0);
    }

    // Create DonHang record
    const donHang = await DonHang.create({
      MaBan: parseInt(MaBan),
      MaNV: MaNV ? parseInt(MaNV) : null,
      MaKH: MaKH ? parseInt(MaKH) : null,
      TongTien: totalAmount,
      TrangThai: TrangThai
    });

    // Add items to order if provided
    if (items.length > 0) {
      const orderItems = items.map(item => ({
        MaDH: donHang.MaDH,
        MaMon: parseInt(item.MaMon),
        SoLuong: parseInt(item.SoLuong),
        DonGia: parseFloat(item.DonGia),
        ThanhTien: parseInt(item.SoLuong) * parseFloat(item.DonGia),
        GhiChu: item.GhiChu || null
      }));

      await CTDonHang.bulkCreate(orderItems);
    }

    // Fetch complete order with items
    const completeOrder = await DonHang.findByPk(donHang.MaDH, {
      include: [{
        model: CTDonHang,
        as: 'items'
      }]
    });

    res.status(201).json({
      success: true,
      message: 'Order with items created successfully',
      order: completeOrder
    });

  } catch (error) {
    console.error('Error creating order with items:', error);
    res.status(500).json({
      error: 'Failed to create order with items',
      message: error.message
    });
  }
};

module.exports = {
  // New DonHang schema methods
  createOrder,
  getBills,
  getBillById,
  getOrdersByCustomer,
  updateOrderStatus,
  cancelOrder,
  deleteOrder,
  getBillingStats,
  // Order items management (bán hàng)
  addItemToOrder,
  updateOrderItem,
  removeOrderItem,
  getOrderItems,
  createOrderWithItems,
  // Legacy aliases for compatibility
  createBill: createOrder,
  updatePaymentStatus: updateOrderStatus,
  deleteBill: deleteOrder
};
