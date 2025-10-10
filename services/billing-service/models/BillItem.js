const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// CTDonHang model matching SQL schema with GhiChu field
const CTDonHang = sequelize.define('CTDonHang', {
  MaDH: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: 'DonHang',
      key: 'MaDH'
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
    allowNull: false
  },
  DonGia: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  ThanhTien: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  GhiChu: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Ghi chú đặc biệt cho món (VD: ít đá, thêm đường)'
  }
}, {
  tableName: 'CTDonHang',
  timestamps: false
});

module.exports = { CTDonHang };
