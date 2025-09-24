const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CTDonHangOnline = sequelize.define('CTDonHangOnline', {
  MaCTDonHangOnline: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  MaDonHangOnline: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Mã đơn hàng online'
  },
  MaMon: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Mã món ăn'
  },
  TenMon: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Tên món ăn tại thời điểm đặt hàng'
  },
  SoLuong: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  DonGia: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Đơn giá tại thời điểm đặt hàng'
  },
  ThanhTien: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Thành tiền = SoLuong * DonGia'
  },
  GhiChuMon: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Ghi chú đặc biệt cho món ăn'
  },
  TrangThaiMon: {
    type: DataTypes.ENUM('Chờ xử lý', 'Đang chuẩn bị', 'Hoàn thành', 'Đã hủy'),
    allowNull: false,
    defaultValue: 'Chờ xử lý'
  }
}, {
  tableName: 'CTDonHangOnline',
  timestamps: false,
  indexes: [
    {
      fields: ['MaDonHangOnline']
    },
    {
      fields: ['MaMon']
    },
    {
      fields: ['TrangThaiMon']
    }
  ]
});

module.exports = CTDonHangOnline;
