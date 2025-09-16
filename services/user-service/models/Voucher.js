const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Voucher model matching SQL schema
const Voucher = sequelize.define('Voucher', {
  MaVC: {
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
    },
    comment: 'Có thể gắn cho KH cụ thể'
  },
  MaCode: {
    type: DataTypes.STRING(50),
    allowNull: true,
    unique: true
  },
  GiaTri: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true
  },
  NgayBD: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  NgayKT: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  TrangThai: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Còn hạn, Hết hạn, Đã dùng'
  }
}, {
  tableName: 'Voucher',
  timestamps: false
});

module.exports = Voucher;
