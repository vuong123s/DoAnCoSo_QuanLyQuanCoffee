const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// DatBan model matching SQL schema
const DatBan = sequelize.define('DatBan', {
  MaDat: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  MaKH: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'KhachHang',
      key: 'MaKH'
    }
  },
  MaBan: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Ban',
      key: 'MaBan'
    }
  },
  NgayDat: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  GioDat: {
    type: DataTypes.TIME,
    allowNull: true
  },
  SoNguoi: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  TrangThai: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Đã đặt, Đã hủy, Hoàn thành'
  }
}, {
  tableName: 'DatBan',
  timestamps: false
});

module.exports = DatBan;
