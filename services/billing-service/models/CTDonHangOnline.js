const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// CTDonHangOnline model for online order details (chi tiết đơn hàng online)
const CTDonHangOnline = sequelize.define('CTDonHangOnline', {
  MaDHOnline: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: 'DonHangOnline',
      key: 'MaDHOnline'
    }
  },
  MaMon: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: 'Mon',
      key: 'MaMon'
    }
  },
  SoLuong: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  DonGia: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    comment: 'Giá tại thời điểm đặt hàng'
  },
  ThanhTien: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    comment: 'SoLuong * DonGia'
  },
  GhiChu: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Ghi chú đặc biệt cho món ăn'
  }
}, {
  tableName: 'CTDonHangOnline',
  timestamps: false
});

module.exports = CTDonHangOnline;
