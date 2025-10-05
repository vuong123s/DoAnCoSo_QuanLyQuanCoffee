const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Ban model matching SQL schema with area support
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
  },
  MaKhuVuc: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'KhuVuc',
      key: 'MaKhuVuc'
    },
    comment: 'Mã khu vực của bàn'
  },
  ViTri: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Vị trí cụ thể của bàn trong khu vực'
  }
}, {
  tableName: 'Ban',
  timestamps: false
});

module.exports = Ban;
