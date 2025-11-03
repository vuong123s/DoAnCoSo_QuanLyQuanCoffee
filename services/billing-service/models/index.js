const { DonHang, ThanhToan } = require('./Bill');
const { CTDonHang } = require('./BillItem');
const DonHangOnline = require('./DonHangOnline');
const CTDonHangOnline = require('./CTDonHangOnline');
const Voucher = require('./Voucher');

// Import Mon model from menu service models if available
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Define Mon model for association (readonly)
const Mon = sequelize.define('Mon', {
  MaMon: {
    type: DataTypes.INTEGER,
    primaryKey: true
  },
  TenMon: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  DonGia: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  }
}, {
  tableName: 'Mon',
  timestamps: false
});

// Define associations
CTDonHang.belongsTo(DonHang, {
  foreignKey: 'MaDH',
  as: 'donhang'
});

DonHang.hasMany(CTDonHang, {
  foreignKey: 'MaDH',
  as: 'chitiet'
});

// Association between CTDonHang and Mon
CTDonHang.belongsTo(Mon, {
  foreignKey: 'MaMon',
  as: 'Mon'
});

Mon.hasMany(CTDonHang, {
  foreignKey: 'MaMon',
  as: 'chitietdonhang'
});

ThanhToan.belongsTo(DonHang, {
  foreignKey: 'MaDH',
  as: 'donhang'
});

DonHang.hasMany(ThanhToan, {
  foreignKey: 'MaDH',
  as: 'thanhtoan'
});

// Online order associations
CTDonHangOnline.belongsTo(DonHangOnline, {
  foreignKey: 'MaDHOnline',
  as: 'donhangonline'
});

DonHangOnline.hasMany(CTDonHangOnline, {
  foreignKey: 'MaDHOnline',
  as: 'chitiet'
});

// Association between CTDonHangOnline and Mon
CTDonHangOnline.belongsTo(Mon, {
  foreignKey: 'MaMon',
  as: 'Mon'
});

Mon.hasMany(CTDonHangOnline, {
  foreignKey: 'MaMon',
  as: 'chitietdonhangonline'
});

module.exports = {
  DonHang,
  ThanhToan,
  CTDonHang,
  DonHangOnline,
  CTDonHangOnline,
  Voucher,
  Mon
};
