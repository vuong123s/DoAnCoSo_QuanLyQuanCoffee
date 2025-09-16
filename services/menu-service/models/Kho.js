const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Kho model matching SQL schema
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
    allowNull: true
  },
  SoLuong: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  MucCanhBao: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Ngưỡng cảnh báo'
  }
}, {
  tableName: 'Kho',
  timestamps: false
});

module.exports = Kho;
