/**
 * Reservation Order Controller
 * Xử lý chuyển đổi đặt bàn thành đơn hàng
 */

const { DonHang, CTDonHang } = require('../models');
const axios = require('axios');

/**
 * Chuyển đổi đặt bàn thành đơn hàng (khi khách đến)
 */
const convertReservationToOrder = async (req, res) => {
  try {
    const { MaDat } = req.body;
    const { MaNV, items = [] } = req.body;

    console.log('🔄 Converting reservation to order:', { MaDat, MaNV, items: items.length });

    if (!MaDat) {
      return res.status(400).json({
        error: 'Missing required field: MaDat',
        message: 'Mã đặt bàn là bắt buộc'
      });
    }

    // Lấy thông tin đặt bàn từ table-service
    let reservation;
    try {
      const response = await axios.get(
        `http://localhost:3003/api/reservations/${MaDat}`,
        { timeout: 5000 }
      );
      reservation = response.data.reservation || response.data;
      console.log('✅ Found reservation:', reservation);
    } catch (error) {
      console.error('❌ Error fetching reservation:', error.message);
      return res.status(404).json({
        error: 'Reservation not found',
        message: 'Không tìm thấy đơn đặt bàn'
      });
    }

    // Kiểm tra trạng thái đặt bàn
    if (reservation.TrangThai === 'Đã hủy') {
      return res.status(400).json({
        error: 'Cannot convert cancelled reservation',
        message: 'Không thể chuyển đổi đơn đặt bàn đã hủy'
      });
    }

    // Kiểm tra xem đã có đơn hàng cho đặt bàn này chưa
    const existingOrder = await DonHang.findOne({
      where: { MaDat: parseInt(MaDat) }
    });

    if (existingOrder) {
      console.log('⚠️ Order already exists for this reservation:', existingOrder.MaDH);
      return res.json({
        success: true,
        message: 'Đơn hàng đã tồn tại cho đặt bàn này',
        order: existingOrder,
        alreadyExists: true
      });
    }

    // Tạo đơn hàng mới
    const donHang = await DonHang.create({
      MaDat: parseInt(MaDat),
      MaKH: reservation.MaKH || null,
      MaBan: reservation.MaBan,
      MaNV: MaNV ? parseInt(MaNV) : null,
      TongTien: 0,
      TrangThai: 'Đang xử lý'
    });

    console.log('✅ Created order:', donHang.MaDH);

    // Thêm món ăn nếu có (món đã đặt trước)
    if (items && items.length > 0) {
      console.log(`📦 Adding ${items.length} pre-ordered items...`);
      let totalAmount = 0;

      for (const item of items) {
        const thanhTien = parseFloat(item.DonGia) * parseInt(item.SoLuong);
        
        await CTDonHang.create({
          MaDH: donHang.MaDH,
          MaMon: parseInt(item.MaMon),
          SoLuong: parseInt(item.SoLuong),
          DonGia: parseFloat(item.DonGia),
          ThanhTien: thanhTien,
          GhiChu: item.GhiChu || null
        });

        totalAmount += thanhTien;
      }

      // Cập nhật tổng tiền
      await donHang.update({ TongTien: totalAmount });
      console.log(`✅ Added items, total: ${totalAmount}`);
    }

    // Cập nhật trạng thái đặt bàn thành "Hoàn thành" (khách đã đến)
    try {
      await axios.patch(
        `http://localhost:3003/api/reservations/${MaDat}/status`,
        { TrangThai: 'Hoàn thành' },
        { timeout: 5000 }
      );
      console.log('✅ Updated reservation status to Hoàn thành');
    } catch (error) {
      console.warn('⚠️ Failed to update reservation status:', error.message);
      // Không fail toàn bộ request nếu cập nhật status thất bại
    }

    // Lấy đơn hàng với chi tiết
    const fullOrder = await DonHang.findByPk(donHang.MaDH, {
      include: [{
        model: CTDonHang,
        as: 'chitiet'
      }]
    });

    res.status(201).json({
      success: true,
      message: 'Chuyển đổi đặt bàn thành đơn hàng thành công',
      order: fullOrder,
      reservation: {
        MaDat: reservation.MaDat,
        MaBan: reservation.MaBan,
        TenKhach: reservation.TenKhach
      }
    });

  } catch (error) {
    console.error('Error converting reservation to order:', error);
    res.status(500).json({
      error: 'Failed to convert reservation to order',
      message: error.message
    });
  }
};

/**
 * Lấy đơn hàng từ đặt bàn
 */
const getOrderByReservation = async (req, res) => {
  try {
    const { id } = req.params; // MaDat

    const order = await DonHang.findOne({
      where: { MaDat: parseInt(id) },
      include: [{
        model: CTDonHang,
        as: 'chitiet'
      }]
    });

    if (!order) {
      return res.status(404).json({
        error: 'Order not found for this reservation',
        message: 'Chưa có đơn hàng cho đặt bàn này'
      });
    }

    res.json({
      success: true,
      order
    });

  } catch (error) {
    console.error('Error getting order by reservation:', error);
    res.status(500).json({
      error: 'Failed to get order',
      message: error.message
    });
  }
};

module.exports = {
  convertReservationToOrder,
  getOrderByReservation
};
