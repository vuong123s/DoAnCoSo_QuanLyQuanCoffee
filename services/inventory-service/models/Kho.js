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
    allowNull: false,
    comment: 'Tên nguyên liệu'
  },
  DonVi: {
    type: DataTypes.STRING(20),
    allowNull: false,
    comment: 'Đơn vị tính (kg, lít, gói, ...)'
  },
  SoLuong: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    comment: 'Số lượng tồn kho'
  },
  MucCanhBao: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Ngưỡng cảnh báo hết hàng'
  },
  DonGiaNhap: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
    comment: 'Đơn giá nhập kho'
  },
  NgayNhap: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'Ngày nhập gần nhất'
  },
  NgayHetHan: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'Ngày hết hạn (nếu có)'
  },
  TrangThai: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'Còn hàng',
    comment: 'Còn hàng, Hết hàng, Gần hết'
  }
}, {
  tableName: 'Kho',
  timestamps: false
});

module.exports = Kho;
