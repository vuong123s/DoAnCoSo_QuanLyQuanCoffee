const { GioHang } = require('../models');
const { Op } = require('sequelize');

const cartController = {
  // Lấy giỏ hàng theo khách hàng hoặc session
  async getCart(req, res) {
    try {
      const { customerId, sessionId } = req.query;
      
      if (!customerId && !sessionId) {
        return res.status(400).json({
          error: 'Cần cung cấp customerId hoặc sessionId'
        });
      }

      const whereCondition = customerId 
        ? { MaKH: customerId }
        : { SessionId: sessionId };

      const cartItems = await GioHang.findAll({
        where: whereCondition,
        order: [['NgayThem', 'DESC']]
      });

      const totalAmount = cartItems.reduce((sum, item) => {
        return sum + (parseFloat(item.DonGia) * item.SoLuong);
      }, 0);

      res.json({
        success: true,
        data: {
          items: cartItems,
          totalItems: cartItems.length,
          totalAmount: totalAmount.toFixed(2)
        }
      });
    } catch (error) {
      console.error('Error getting cart:', error);
      res.status(500).json({
        error: 'Lỗi khi lấy giỏ hàng',
        message: error.message
      });
    }
  },

  // Thêm món vào giỏ hàng
  async addToCart(req, res) {
    try {
      const { customerId, sessionId, menuItemId, quantity, price, notes } = req.body;

      if (!customerId && !sessionId) {
        return res.status(400).json({
          error: 'Cần cung cấp customerId hoặc sessionId'
        });
      }

      if (!menuItemId || !quantity || !price) {
        return res.status(400).json({
          error: 'Thiếu thông tin bắt buộc: menuItemId, quantity, price'
        });
      }

      // Kiểm tra xem món đã có trong giỏ hàng chưa
      const whereCondition = {
        MaMon: menuItemId,
        ...(customerId ? { MaKH: customerId } : { SessionId: sessionId })
      };

      const existingItem = await GioHang.findOne({ where: whereCondition });

      if (existingItem) {
        // Cập nhật số lượng nếu món đã có
        existingItem.SoLuong += parseInt(quantity);
        existingItem.DonGia = price; // Cập nhật giá mới nhất
        if (notes) existingItem.GhiChu = notes;
        await existingItem.save();

        res.json({
          success: true,
          message: 'Đã cập nhật số lượng món trong giỏ hàng',
          data: existingItem
        });
      } else {
        // Thêm món mới vào giỏ hàng
        const newCartItem = await GioHang.create({
          MaKH: customerId || null,
          SessionId: sessionId || null,
          MaMon: menuItemId,
          SoLuong: quantity,
          DonGia: price,
          GhiChu: notes || null
        });

        res.status(201).json({
          success: true,
          message: 'Đã thêm món vào giỏ hàng',
          data: newCartItem
        });
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      res.status(500).json({
        error: 'Lỗi khi thêm vào giỏ hàng',
        message: error.message
      });
    }
  },

  // Cập nhật số lượng món trong giỏ hàng
  async updateCartItem(req, res) {
    try {
      const { id } = req.params;
      const { quantity, notes } = req.body;

      if (!quantity || quantity < 1) {
        return res.status(400).json({
          error: 'Số lượng phải lớn hơn 0'
        });
      }

      const cartItem = await GioHang.findByPk(id);
      if (!cartItem) {
        return res.status(404).json({
          error: 'Không tìm thấy món trong giỏ hàng'
        });
      }

      cartItem.SoLuong = quantity;
      if (notes !== undefined) cartItem.GhiChu = notes;
      await cartItem.save();

      res.json({
        success: true,
        message: 'Đã cập nhật giỏ hàng',
        data: cartItem
      });
    } catch (error) {
      console.error('Error updating cart item:', error);
      res.status(500).json({
        error: 'Lỗi khi cập nhật giỏ hàng',
        message: error.message
      });
    }
  },

  // Xóa món khỏi giỏ hàng
  async removeFromCart(req, res) {
    try {
      const { id } = req.params;

      const cartItem = await GioHang.findByPk(id);
      if (!cartItem) {
        return res.status(404).json({
          error: 'Không tìm thấy món trong giỏ hàng'
        });
      }

      await cartItem.destroy();

      res.json({
        success: true,
        message: 'Đã xóa món khỏi giỏ hàng'
      });
    } catch (error) {
      console.error('Error removing from cart:', error);
      res.status(500).json({
        error: 'Lỗi khi xóa khỏi giỏ hàng',
        message: error.message
      });
    }
  },

  // Xóa toàn bộ giỏ hàng
  async clearCart(req, res) {
    try {
      const { customerId, sessionId } = req.body;

      if (!customerId && !sessionId) {
        return res.status(400).json({
          error: 'Cần cung cấp customerId hoặc sessionId'
        });
      }

      const whereCondition = customerId 
        ? { MaKH: customerId }
        : { SessionId: sessionId };

      await GioHang.destroy({ where: whereCondition });

      res.json({
        success: true,
        message: 'Đã xóa toàn bộ giỏ hàng'
      });
    } catch (error) {
      console.error('Error clearing cart:', error);
      res.status(500).json({
        error: 'Lỗi khi xóa giỏ hàng',
        message: error.message
      });
    }
  }
};

module.exports = cartController;
