const { Orders, CTOrder } = require('../models');
const { Op } = require('sequelize');

// Create a new order (Orders table for in-store dining)
const createOrder = async (req, res) => {
  try {
    const { 
      MaBan, 
      MaNV,
      TrangThai = 'Đang phục vụ',
      TongTien = 0,
      GhiChu
    } = req.body;

    if (!MaBan || !MaNV) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Thiếu thông tin: MaBan và MaNV là bắt buộc'
      });
    }

    // Create Orders record
    const order = await Orders.create({
      MaBan: parseInt(MaBan),
      MaNV: parseInt(MaNV),
      TongTien: parseFloat(TongTien),
      TrangThai: TrangThai,
      GhiChu: GhiChu
    });

    res.status(201).json({
      message: 'Order created successfully',
      order: order
    });

  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      error: 'Failed to create order',
      message: error.message
    });
  }
};

// Get all orders with filters
const getOrders = async (req, res) => {
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
      whereClause.NgayOrder = {};
      if (start_date) whereClause.NgayOrder[Op.gte] = new Date(start_date);
      if (end_date) whereClause.NgayOrder[Op.lte] = new Date(end_date);
    }

    const { count, rows } = await Orders.findAndCountAll({
      where: whereClause,
      include: [{
        model: CTOrder,
        as: 'chitiet'
      }],
      order: [['NgayOrder', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      orders: rows,
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

// Get order by ID
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Orders.findByPk(id, {
      include: [{
        model: CTOrder,
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

// Update order status
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { TrangThai, GhiChu } = req.body;

    if (!TrangThai) {
      return res.status(400).json({
        error: 'Status is required',
        message: 'Trạng thái là bắt buộc'
      });
    }

    const validStatuses = ['Đang phục vụ', 'Đã hoàn thành', 'Đã hủy'];
    if (!validStatuses.includes(TrangThai)) {
      return res.status(400).json({
        error: 'Invalid status',
        message: 'Trạng thái không hợp lệ. Chỉ chấp nhận: Đang phục vụ, Đã hoàn thành, Đã hủy'
      });
    }

    const order = await Orders.findByPk(id);
    if (!order) {
      return res.status(404).json({
        error: 'Order not found',
        message: 'Không tìm thấy đơn hàng'
      });
    }

    const updateData = { TrangThai };
    if (GhiChu !== undefined) updateData.GhiChu = GhiChu;

    await order.update(updateData);

    const updatedOrder = await Orders.findByPk(id, {
      include: [{
        model: CTOrder,
        as: 'chitiet'
      }]
    });

    res.json({
      message: 'Order status updated successfully',
      order: updatedOrder
    });

  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      error: 'Failed to update order status',
      message: error.message
    });
  }
};

// Delete order (soft delete by updating status)
const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Orders.findByPk(id);
    if (!order) {
      return res.status(404).json({
        error: 'Order not found',
        message: 'Không tìm thấy đơn hàng'
      });
    }

    if (order.TrangThai === 'Đã hoàn thành') {
      return res.status(400).json({
        error: 'Cannot delete a completed order',
        message: 'Không thể xóa đơn hàng đã hoàn thành. Bạn có thể đánh dấu đơn hàng là "Đã hủy" thay vì xóa.',
        suggestion: 'Bạn có thể cập nhật trạng thái thành "Đã hủy" thay vì xóa đơn hàng.'
      });
    }

    await order.update({ TrangThai: 'Đã hủy' });

    res.json({
      message: 'Order cancelled successfully'
    });

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
    const { MaMon, SoLuong, DonGia, GhiChu, TrangThaiMon = 'Chờ xử lý' } = req.body;

    if (!MaMon || !SoLuong || !DonGia) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Thiếu thông tin: MaMon, SoLuong, DonGia'
      });
    }

    // Check if order exists
    const order = await Orders.findByPk(orderId);
    if (!order) {
      return res.status(404).json({
        error: 'Order not found',
        message: 'Không tìm thấy đơn hàng'
      });
    }

    if (order.TrangThai === 'Đã hoàn thành' || order.TrangThai === 'Đã hủy') {
      return res.status(400).json({
        error: 'Cannot modify completed or cancelled order',
        message: 'Không thể thêm món vào đơn hàng đã hoàn thành hoặc đã hủy'
      });
    }

    const thanhTien = parseFloat(DonGia) * parseInt(SoLuong);

    // Check if item already exists in order
    const existingItem = await CTOrder.findOne({
      where: { MaOrder: orderId, MaMon: MaMon }
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
        GhiChu: GhiChu || existingItem.GhiChu,
        TrangThaiMon: TrangThaiMon
      });
    } else {
      // Create new item
      orderItem = await CTOrder.create({
        MaOrder: orderId,
        MaMon: parseInt(MaMon),
        SoLuong: parseInt(SoLuong),
        DonGia: parseFloat(DonGia),
        ThanhTien: thanhTien,
        GhiChu: GhiChu,
        TrangThaiMon: TrangThaiMon
      });
    }

    // Update order total
    const orderItems = await CTOrder.findAll({
      where: { MaOrder: orderId }
    });
    
    const newTotal = orderItems.reduce((sum, item) => sum + parseFloat(item.ThanhTien), 0);
    await order.update({ TongTien: newTotal });

    // Get updated order with items
    const updatedOrder = await Orders.findByPk(orderId, {
      include: [{
        model: CTOrder,
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
    const { SoLuong, DonGia, GhiChu, TrangThaiMon } = req.body;

    // Check if order exists
    const order = await Orders.findByPk(orderId);
    if (!order) {
      return res.status(404).json({
        error: 'Order not found',
        message: 'Không tìm thấy đơn hàng'
      });
    }

    if (order.TrangThai === 'Đã hoàn thành' || order.TrangThai === 'Đã hủy') {
      return res.status(400).json({
        error: 'Cannot modify completed or cancelled order',
        message: 'Không thể sửa món trong đơn hàng đã hoàn thành hoặc đã hủy'
      });
    }

    // Find the item
    const orderItem = await CTOrder.findOne({
      where: { MaOrder: orderId, MaMon: itemId }
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
    if (TrangThaiMon !== undefined) {
      updateData.TrangThaiMon = TrangThaiMon;
    }
    
    // Calculate new ThanhTien
    const finalQuantity = updateData.SoLuong || orderItem.SoLuong;
    const finalPrice = updateData.DonGia || orderItem.DonGia;
    updateData.ThanhTien = finalQuantity * finalPrice;

    await orderItem.update(updateData);

    // Update order total
    const orderItems = await CTOrder.findAll({
      where: { MaOrder: orderId }
    });
    
    const newTotal = orderItems.reduce((sum, item) => sum + parseFloat(item.ThanhTien), 0);
    await order.update({ TongTien: newTotal });

    // Get updated order with items
    const updatedOrder = await Orders.findByPk(orderId, {
      include: [{
        model: CTOrder,
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
    const order = await Orders.findByPk(orderId);
    if (!order) {
      return res.status(404).json({
        error: 'Order not found',
        message: 'Không tìm thấy đơn hàng'
      });
    }

    if (order.TrangThai === 'Đã hoàn thành' || order.TrangThai === 'Đã hủy') {
      return res.status(400).json({
        error: 'Cannot modify completed or cancelled order',
        message: 'Không thể xóa món khỏi đơn hàng đã hoàn thành hoặc đã hủy'
      });
    }

    // Find and remove the item
    const orderItem = await CTOrder.findOne({
      where: { MaOrder: orderId, MaMon: itemId }
    });

    if (!orderItem) {
      return res.status(404).json({
        error: 'Item not found in order',
        message: 'Không tìm thấy món trong đơn hàng'
      });
    }

    await orderItem.destroy();

    // Update order total
    const orderItems = await CTOrder.findAll({
      where: { MaOrder: orderId }
    });
    
    const newTotal = orderItems.reduce((sum, item) => sum + parseFloat(item.ThanhTien), 0);
    await order.update({ TongTien: newTotal });

    // Get updated order with items
    const updatedOrder = await Orders.findByPk(orderId, {
      include: [{
        model: CTOrder,
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

    const order = await Orders.findByPk(orderId, {
      include: [{
        model: CTOrder,
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

// Get order statistics
const getOrderStats = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    const whereClause = {};

    if (start_date || end_date) {
      whereClause.NgayOrder = {};
      if (start_date) whereClause.NgayOrder[Op.gte] = new Date(start_date);
      if (end_date) whereClause.NgayOrder[Op.lte] = new Date(end_date);
    }

    const totalOrders = await Orders.count({ where: whereClause });
    
    const completedOrders = await Orders.count({
      where: { ...whereClause, TrangThai: 'Đã hoàn thành' }
    });

    const activeOrders = await Orders.count({
      where: { ...whereClause, TrangThai: 'Đang phục vụ' }
    });

    const cancelledOrders = await Orders.count({
      where: { ...whereClause, TrangThai: 'Đã hủy' }
    });

    const totalRevenue = await Orders.sum('TongTien', {
      where: { ...whereClause, TrangThai: 'Đã hoàn thành' }
    });

    const averageOrderAmount = await Orders.findAll({
      where: { ...whereClause, TrangThai: 'Đã hoàn thành' },
      attributes: [
        [require('sequelize').fn('AVG', require('sequelize').col('TongTien')), 'average']
      ]
    });

    res.json({
      stats: {
        total_orders: totalOrders,
        completed_orders: completedOrders,
        active_orders: activeOrders,
        cancelled_orders: cancelledOrders,
        total_revenue: totalRevenue || 0,
        average_order_amount: averageOrderAmount[0]?.dataValues?.average || 0
      }
    });

  } catch (error) {
    console.error('Error fetching order stats:', error);
    res.status(500).json({
      error: 'Failed to fetch order statistics',
      message: error.message
    });
  }
};

module.exports = {
  // Order management
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
  getOrderStats,
  // Order items management (bán hàng)
  addItemToOrder,
  updateOrderItem,
  removeOrderItem,
  getOrderItems
};