const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TheoDoiDonHang = sequelize.define('TheoDoiDonHang', {
  MaTheoDoi: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  MaDonHangOnline: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Mã đơn hàng online'
  },
  TrangThaiCu: {
    type: DataTypes.ENUM('Chờ xác nhận', 'Đã xác nhận', 'Đang chuẩn bị', 'Đang giao hàng', 'Đã giao hàng', 'Đã hủy'),
    allowNull: true,
    comment: 'Trạng thái trước khi thay đổi'
  },
  TrangThaiMoi: {
    type: DataTypes.ENUM('Chờ xác nhận', 'Đã xác nhận', 'Đang chuẩn bị', 'Đang giao hàng', 'Đã giao hàng', 'Đã hủy'),
    allowNull: false,
    comment: 'Trạng thái sau khi thay đổi'
  },
  NgayCapNhat: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  MaNVCapNhat: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Mã nhân viên thực hiện cập nhật'
  },
  GhiChu: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Ghi chú về việc thay đổi trạng thái'
  },
  ViTriHienTai: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Vị trí hiện tại của đơn hàng (dành cho giao hàng)'
  },
  ThoiGianDuKien: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Thời gian dự kiến hoàn thành bước tiếp theo'
  }
}, {
  tableName: 'TheoDoiDonHang',
  timestamps: false,
  indexes: [
    {
      fields: ['MaDonHangOnline']
    },
    {
      fields: ['TrangThaiMoi']
    },
    {
      fields: ['NgayCapNhat']
    }
  ]
});

module.exports = TheoDoiDonHang;
