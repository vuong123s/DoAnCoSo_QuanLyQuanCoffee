const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

// Tổng doanh thu
router.get('/tong-doanh-thu', analyticsController.getTongDoanhThu);

// Doanh thu theo khoảng thời gian
router.get('/doanh-thu-theo-ngay', analyticsController.getDoanhThuTheoNgay);

// Doanh thu theo món
router.get('/doanh-thu-theo-mon', analyticsController.getDoanhThuTheoMon);

// Xếp hạng món bán chạy
router.get('/mon-ban-chay', analyticsController.getMonBanChay);

// Doanh thu theo danh mục
router.get('/doanh-thu-theo-danh-muc', analyticsController.getDoanhThuTheoDanhMuc);

// Doanh thu theo giờ
router.get('/doanh-thu-theo-gio', analyticsController.getDoanhThuTheoGio);

// Doanh thu theo nhân viên
router.get('/doanh-thu-theo-nhan-vien', analyticsController.getDoanhThuTheoNhanVien);

// Doanh thu theo hình thức thanh toán
router.get('/doanh-thu-theo-hinh-thuc', analyticsController.getDoanhThuTheoHinhThuc);

module.exports = router;
