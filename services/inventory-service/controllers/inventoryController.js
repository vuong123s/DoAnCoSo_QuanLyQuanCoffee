const { Kho } = require('../models');
const { Op } = require('sequelize');

const inventoryController = {
  // Lấy danh sách nguyên liệu trong kho
  async getInventoryItems(req, res) {
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

      // Tìm kiếm theo tên
      if (search) {
        whereCondition.TenNL = {
          [Op.like]: `%${search}%`
        };
      }

      const { count, rows } = await Kho.findAndCountAll({
        where: whereCondition,
        order: [['MaNL', 'DESC']],
        limit: parseInt(limit),
        offset: offset
      });

      res.json({
        success: true,
        data: {
          items: rows,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(count / limit),
            totalItems: count,
            itemsPerPage: parseInt(limit)
          }
        }
      });
    } catch (error) {
      console.error('Error getting inventory items:', error);
      res.status(500).json({
        error: 'Lỗi khi lấy danh sách nguyên liệu',
        message: error.message
      });
    }
  },

  // Lấy chi tiết nguyên liệu
  async getInventoryItemById(req, res) {
    try {
      const { id } = req.params;
      const item = await Kho.findByPk(id);

      if (!item) {
        return res.status(404).json({
          error: 'Không tìm thấy nguyên liệu'
        });
      }

      res.json({
        success: true,
        data: item
      });
    } catch (error) {
      console.error('Error getting inventory item:', error);
      res.status(500).json({
        error: 'Lỗi khi lấy thông tin nguyên liệu',
        message: error.message
      });
    }
  },

  // Tạo nguyên liệu mới
  async createInventoryItem(req, res) {
    try {
      const {
        TenNL,
        DonVi,
        SoLuong = 0,
        MucCanhBao = 10,
        DonGiaNhap,
        NgayNhap,
        NgayHetHan,
        TrangThai = 'Còn hàng'
      } = req.body;

      const newItem = await Kho.create({
        TenNL,
        DonVi,
        SoLuong,
        MucCanhBao,
        DonGiaNhap,
        NgayNhap,
        NgayHetHan,
        TrangThai
      });

      res.status(201).json({
        success: true,
        message: 'Tạo nguyên liệu thành công',
        data: newItem
      });
    } catch (error) {
      console.error('Error creating inventory item:', error);
      res.status(500).json({
        error: 'Lỗi khi tạo nguyên liệu',
        message: error.message
      });
    }
  },

  // Cập nhật nguyên liệu
  async updateInventoryItem(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const item = await Kho.findByPk(id);
      if (!item) {
        return res.status(404).json({
          error: 'Không tìm thấy nguyên liệu'
        });
      }

      await item.update(updateData);

      res.json({
        success: true,
        message: 'Cập nhật nguyên liệu thành công',
        data: item
      });
    } catch (error) {
      console.error('Error updating inventory item:', error);
      res.status(500).json({
        error: 'Lỗi khi cập nhật nguyên liệu',
        message: error.message
      });
    }
  },

  // Xóa nguyên liệu
  async deleteInventoryItem(req, res) {
    try {
      const { id } = req.params;

      const item = await Kho.findByPk(id);
      if (!item) {
        return res.status(404).json({
          error: 'Không tìm thấy nguyên liệu'
        });
      }

      await item.destroy();

      res.json({
        success: true,
        message: 'Xóa nguyên liệu thành công'
      });
    } catch (error) {
      console.error('Error deleting inventory item:', error);
      res.status(500).json({
        error: 'Lỗi khi xóa nguyên liệu',
        message: error.message
      });
    }
  },

  // Lấy thống kê kho
  async getInventoryStats(req, res) {
    try {
      const totalItems = await Kho.count();
      const lowStockItems = await Kho.count({
        where: {
          [Op.where]: sequelize.literal('SoLuong <= MucCanhBao')
        }
      });
      const outOfStockItems = await Kho.count({
        where: { TrangThai: 'Hết hàng' }
      });

      res.json({
        success: true,
        data: {
          totalItems,
          lowStockItems,
          outOfStockItems,
          availableItems: totalItems - outOfStockItems
        }
      });
    } catch (error) {
      console.error('Error getting inventory stats:', error);
      res.status(500).json({
        error: 'Lỗi khi lấy thống kê kho',
        message: error.message
      });
    }
  }
};

module.exports = inventoryController;
