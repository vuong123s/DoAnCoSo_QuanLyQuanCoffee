const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const GioHang = sequelize.define('GioHang', {
  MaGioHang: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  MaKH: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Mã khách hàng (null nếu khách vãng lai)'
  },
  SessionId: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Session ID cho khách vãng lai'
  },
  MaMon: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Mã món ăn'
  },
  SoLuong: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: 1
    }
  },
  DonGia: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Đơn giá tại thời điểm thêm vào giỏ'
  },
  GhiChu: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Ghi chú đặc biệt cho món ăn'
  },
  NgayThem: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'GioHang',
  timestamps: false,
  indexes: [
    {
      fields: ['MaKH']
    },
    {
      fields: ['SessionId']
    },
    {
      fields: ['MaMon']
    }
  ]
});

module.exports = GioHang;
