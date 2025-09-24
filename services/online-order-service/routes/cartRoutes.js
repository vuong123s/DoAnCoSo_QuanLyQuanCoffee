const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

// Lấy giỏ hàng
router.get('/', cartController.getCart);

// Thêm món vào giỏ hàng
router.post('/add', cartController.addToCart);

// Cập nhật món trong giỏ hàng
router.put('/item/:id', cartController.updateCartItem);

// Xóa món khỏi giỏ hàng
router.delete('/item/:id', cartController.removeFromCart);

// Xóa toàn bộ giỏ hàng
router.delete('/clear', cartController.clearCart);

module.exports = router;
