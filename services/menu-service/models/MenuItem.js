const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Mon model matching SQL schema
const Mon = sequelize.define('Mon', {
  MaMon: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  TenMon: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  DonGia: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  HinhAnh: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  MoTa: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  MaLoai: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'LoaiMon',
      key: 'MaLoai'
    }
  },
  TrangThai: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Còn bán, Hết hàng'
  }
}, {
  tableName: 'Mon',
  timestamps: false
});

module.exports = Mon;
