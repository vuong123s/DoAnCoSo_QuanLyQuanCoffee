const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// LoaiMon model matching SQL schema
const LoaiMon = sequelize.define('LoaiMon', {
  MaLoai: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  TenLoai: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  HinhAnh: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Hình ảnh đại diện cho loại món'
  },
  MoTa: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Mô tả chi tiết về loại món'
  }
}, {
  tableName: 'LoaiMon',
  timestamps: false
});

module.exports = LoaiMon;
