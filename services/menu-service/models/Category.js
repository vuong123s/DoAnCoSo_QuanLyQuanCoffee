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
  }
}, {
  tableName: 'LoaiMon',
  timestamps: false
});

module.exports = LoaiMon;
