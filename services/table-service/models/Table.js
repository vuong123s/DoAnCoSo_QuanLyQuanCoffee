const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Ban model matching SQL schema
const Ban = sequelize.define('Ban', {
  MaBan: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  TenBan: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  SoCho: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  TrangThai: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Trống, Đã đặt, Đang phục vụ'
  }
}, {
  tableName: 'Ban',
  timestamps: false
});

module.exports = Ban;
