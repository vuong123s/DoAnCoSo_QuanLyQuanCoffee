const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Orders model for in-store dining (bán hàng tại quầy)
const Orders = sequelize.define('Orders', {
  MaOrder: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  MaBan: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Ban',
      key: 'MaBan'
    }
  },
  MaNV: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'NhanVien',
      key: 'MaNV'
    }
  },
  NgayOrder: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  TongTien: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0
  },
  TrangThai: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'Đang phục vụ',
    comment: 'Đang phục vụ, Đã hoàn thành, Đã hủy'
  },
  GhiChu: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'Orders',
  timestamps: false
});

module.exports = Orders;