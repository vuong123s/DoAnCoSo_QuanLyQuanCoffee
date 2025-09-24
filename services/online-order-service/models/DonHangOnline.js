const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const DonHangOnline = sequelize.define('DonHangOnline', {
  MaDonHangOnline: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  MaKH: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Mã khách hàng (null nếu khách vãng lai)'
  },
  TenKhach: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Tên khách hàng'
  },
  SoDienThoai: {
    type: DataTypes.STRING(15),
    allowNull: false,
    comment: 'Số điện thoại khách hàng'
  },
  Email: {
    type: DataTypes.STRING(100),
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  DiaChiGiaoHang: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'Địa chỉ giao hàng'
  },
  NgayDatHang: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  NgayGiaoHang: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Ngày giao hàng dự kiến'
  },
  TongTien: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  PhiGiaoHang: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  TongThanhToan: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  MaVoucher: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Mã voucher áp dụng'
  },
  GiamGiaVoucher: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  PhuongThucThanhToan: {
    type: DataTypes.ENUM('Tiền mặt', 'Chuyển khoản', 'Ví điện tử', 'Thẻ tín dụng'),
    allowNull: false,
    defaultValue: 'Tiền mặt'
  },
  TrangThaiDonHang: {
    type: DataTypes.ENUM('Chờ xác nhận', 'Đã xác nhận', 'Đang chuẩn bị', 'Đang giao hàng', 'Đã giao hàng', 'Đã hủy'),
    allowNull: false,
    defaultValue: 'Chờ xác nhận'
  },
  TrangThaiThanhToan: {
    type: DataTypes.ENUM('Chưa thanh toán', 'Đã thanh toán', 'Đã hoàn tiền'),
    allowNull: false,
    defaultValue: 'Chưa thanh toán'
  },
  GhiChu: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Ghi chú đơn hàng'
  },
  MaNVXuLy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Mã nhân viên xử lý đơn hàng'
  }
}, {
  tableName: 'DonHangOnline',
  timestamps: false,
  indexes: [
    {
      fields: ['MaKH']
    },
    {
      fields: ['TrangThaiDonHang']
    },
    {
      fields: ['TrangThaiThanhToan']
    },
    {
      fields: ['NgayDatHang']
    },
    {
      fields: ['SoDienThoai']
    }
  ]
});

module.exports = DonHangOnline;
