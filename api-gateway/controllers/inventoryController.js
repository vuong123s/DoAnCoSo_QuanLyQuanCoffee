const Kho = require('../models/Kho');
const { Op } = require('sequelize');

// Lấy danh sách nguyên liệu
exports.getInventory = async (req, res) => {
  try {
    const { search, status } = req.query;
    
    let whereClause = {};
    
    if (search) {
      whereClause.TenNL = { [Op.like]: `%${search}%` };
    }
    
    if (status) {
      whereClause.TrangThai = status;
    }
    
    const items = await Kho.findAll({
      where: whereClause,
      order: [['TenNL', 'ASC']]
    });
    
    res.json({ items });
  } catch (error) {
    console.error('Get inventory error:', error);
    res.status(500).json({ error: 'Lỗi khi lấy danh sách nguyên liệu' });
  }
};

// Lấy chi tiết nguyên liệu
exports.getInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;
    
    const item = await Kho.findByPk(id);
    
    if (!item) {
      return res.status(404).json({ error: 'Không tìm thấy nguyên liệu' });
    }
    
    res.json({ item });
  } catch (error) {
    console.error('Get inventory item error:', error);
    res.status(500).json({ error: 'Lỗi khi lấy thông tin nguyên liệu' });
  }
};

// Thêm nguyên liệu mới
exports.createInventoryItem = async (req, res) => {
  try {
    const { TenNL, DonVi, SoLuong, MucCanhBao, DonGiaNhap, NgayNhap, NgayHetHan } = req.body;
    
    // Validate required fields
    if (!TenNL || !DonVi || !MucCanhBao) {
      return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
    }
    
    // Auto-set trạng thái based on số lượng
    let TrangThai = 'Còn hàng';
    if (SoLuong === 0) {
      TrangThai = 'Hết hàng';
    } else if (SoLuong <= MucCanhBao) {
      TrangThai = 'Gần hết';
    }
    
    const item = await Kho.create({
      TenNL,
      DonVi,
      SoLuong: SoLuong || 0,
      MucCanhBao,
      DonGiaNhap,
      NgayNhap: NgayNhap || new Date(),
      NgayHetHan,
      TrangThai
    });
    
    res.status(201).json({ 
      message: 'Thêm nguyên liệu thành công',
      item 
    });
  } catch (error) {
    console.error('Create inventory item error:', error);
    res.status(500).json({ error: 'Lỗi khi thêm nguyên liệu' });
  }
};

// Cập nhật thông tin nguyên liệu
exports.updateInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { TenNL, DonVi, MucCanhBao, DonGiaNhap, NgayHetHan } = req.body;
    
    const item = await Kho.findByPk(id);
    if (!item) {
      return res.status(404).json({ error: 'Không tìm thấy nguyên liệu' });
    }
    
    await item.update({
      TenNL: TenNL || item.TenNL,
      DonVi: DonVi || item.DonVi,
      MucCanhBao: MucCanhBao !== undefined ? MucCanhBao : item.MucCanhBao,
      DonGiaNhap: DonGiaNhap !== undefined ? DonGiaNhap : item.DonGiaNhap,
      NgayHetHan: NgayHetHan !== undefined ? NgayHetHan : item.NgayHetHan
    });
    
    // Auto-update trạng thái
    await updateItemStatus(item);
    
    res.json({ 
      message: 'Cập nhật thông tin thành công',
      item: await Kho.findByPk(id)
    });
  } catch (error) {
    console.error('Update inventory item error:', error);
    res.status(500).json({ error: 'Lỗi khi cập nhật thông tin' });
  }
};

// Nhập kho (thêm số lượng)
exports.importInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const { SoLuongNhap, DonGiaNhap, NgayHetHan } = req.body;
    
    if (!SoLuongNhap || SoLuongNhap <= 0) {
      return res.status(400).json({ error: 'Số lượng nhập phải lớn hơn 0' });
    }
    
    const item = await Kho.findByPk(id);
    if (!item) {
      return res.status(404).json({ error: 'Không tìm thấy nguyên liệu' });
    }
    
    // Cập nhật số lượng
    const newQuantity = parseFloat(item.SoLuong) + parseFloat(SoLuongNhap);
    
    await item.update({
      SoLuong: newQuantity,
      NgayNhap: new Date(),
      DonGiaNhap: DonGiaNhap || item.DonGiaNhap,
      NgayHetHan: NgayHetHan || item.NgayHetHan
    });
    
    // Auto-update trạng thái
    await updateItemStatus(item);
    
    res.json({ 
      message: `Nhập kho thành công ${SoLuongNhap} ${item.DonVi}`,
      item: await Kho.findByPk(id)
    });
  } catch (error) {
    console.error('Import inventory error:', error);
    res.status(500).json({ error: 'Lỗi khi nhập kho' });
  }
};

// Xuất kho (trừ số lượng)
exports.exportInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const { SoLuongXuat } = req.body;
    
    if (!SoLuongXuat || SoLuongXuat <= 0) {
      return res.status(400).json({ error: 'Số lượng xuất phải lớn hơn 0' });
    }
    
    const item = await Kho.findByPk(id);
    if (!item) {
      return res.status(404).json({ error: 'Không tìm thấy nguyên liệu' });
    }
    
    // Kiểm tra số lượng tồn kho
    if (parseFloat(item.SoLuong) < parseFloat(SoLuongXuat)) {
      return res.status(400).json({ 
        error: 'Số lượng xuất vượt quá tồn kho',
        available: item.SoLuong
      });
    }
    
    // Cập nhật số lượng
    const newQuantity = parseFloat(item.SoLuong) - parseFloat(SoLuongXuat);
    
    await item.update({
      SoLuong: newQuantity
    });
    
    // Auto-update trạng thái
    await updateItemStatus(item);
    
    res.json({ 
      message: `Xuất kho thành công ${SoLuongXuat} ${item.DonVi}`,
      item: await Kho.findByPk(id)
    });
  } catch (error) {
    console.error('Export inventory error:', error);
    res.status(500).json({ error: 'Lỗi khi xuất kho' });
  }
};

// Xóa nguyên liệu
exports.deleteInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;
    
    const item = await Kho.findByPk(id);
    if (!item) {
      return res.status(404).json({ error: 'Không tìm thấy nguyên liệu' });
    }
    
    await item.destroy();
    
    res.json({ message: 'Xóa nguyên liệu thành công' });
  } catch (error) {
    console.error('Delete inventory item error:', error);
    res.status(500).json({ error: 'Lỗi khi xóa nguyên liệu' });
  }
};

// Lấy cảnh báo (nguyên liệu gần hết hoặc hết hạn)
exports.getAlerts = async (req, res) => {
  try {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    
    // Nguyên liệu gần hết hoặc hết hàng
    const lowStock = await Kho.findAll({
      where: {
        [Op.or]: [
          { TrangThai: 'Gần hết' },
          { TrangThai: 'Hết hàng' }
        ]
      },
      order: [['SoLuong', 'ASC']]
    });
    
    // Nguyên liệu gần hết hạn (trong 7 ngày)
    const expiringSoon = await Kho.findAll({
      where: {
        NgayHetHan: {
          [Op.between]: [today, nextWeek]
        }
      },
      order: [['NgayHetHan', 'ASC']]
    });
    
    // Nguyên liệu đã hết hạn
    const expired = await Kho.findAll({
      where: {
        NgayHetHan: {
          [Op.lt]: today
        }
      },
      order: [['NgayHetHan', 'DESC']]
    });
    
    res.json({ 
      lowStock,
      expiringSoon,
      expired,
      summary: {
        lowStockCount: lowStock.length,
        expiringSoonCount: expiringSoon.length,
        expiredCount: expired.length
      }
    });
  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({ error: 'Lỗi khi lấy cảnh báo' });
  }
};

// Thống kê kho
exports.getStatistics = async (req, res) => {
  try {
    const totalItems = await Kho.count();
    
    const statusCounts = await Kho.findAll({
      attributes: [
        'TrangThai',
        [Kho.sequelize.fn('COUNT', '*'), 'count']
      ],
      group: ['TrangThai']
    });
    
    const totalValue = await Kho.sum('SoLuong', {
      where: {
        DonGiaNhap: { [Op.not]: null }
      }
    });
    
    res.json({
      totalItems,
      statusCounts,
      totalValue: totalValue || 0,
      stats: {
        inStock: statusCounts.find(s => s.TrangThai === 'Còn hàng')?.dataValues.count || 0,
        lowStock: statusCounts.find(s => s.TrangThai === 'Gần hết')?.dataValues.count || 0,
        outOfStock: statusCounts.find(s => s.TrangThai === 'Hết hàng')?.dataValues.count || 0
      }
    });
  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({ error: 'Lỗi khi lấy thống kê' });
  }
};

// Helper function: Tự động cập nhật trạng thái
async function updateItemStatus(item) {
  let newStatus = 'Còn hàng';
  
  if (parseFloat(item.SoLuong) === 0) {
    newStatus = 'Hết hàng';
  } else if (parseFloat(item.SoLuong) <= parseFloat(item.MucCanhBao)) {
    newStatus = 'Gần hết';
  }
  
  if (item.TrangThai !== newStatus) {
    await item.update({ TrangThai: newStatus });
  }
  
  return item;
}
