const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// CTOrder model for order details (chi tiết đơn hàng tại quầy)
const CTOrder = sequelize.define('CTOrder', {
  MaOrder: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: 'Orders',
      key: 'MaOrder'
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
    comment: 'VD: ít đá, thêm đường'
  },
  TrangThaiMon: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'Chờ xử lý',
    comment: 'Chờ xử lý, Đang làm, Hoàn thành'
  }
}, {
  tableName: 'CTOrder',
  timestamps: false
});

module.exports = CTOrder;