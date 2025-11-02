const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Kho = sequelize.define('Kho', {
  MaNL: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  TenNL: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  DonVi: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  SoLuong: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  MucCanhBao: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  DonGiaNhap: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true
  },
  NgayNhap: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  NgayHetHan: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  TrangThai: {
    type: DataTypes.STRING(20),
    defaultValue: 'Còn hàng'
  }
}, {
  tableName: 'Kho',
  timestamps: false
});

module.exports = Kho;
