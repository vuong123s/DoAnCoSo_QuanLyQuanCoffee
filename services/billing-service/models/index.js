const { DonHang, ThanhToan } = require('./Bill');
const { CTDonHang } = require('./BillItem');
const DonHangOnline = require('./DonHangOnline');
const CTDonHangOnline = require('./CTDonHangOnline');
const Voucher = require('./Voucher');

// Define associations
CTDonHang.belongsTo(DonHang, {
  foreignKey: 'MaDH',
  as: 'donhang'
});

DonHang.hasMany(CTDonHang, {
  foreignKey: 'MaDH',
  as: 'chitiet'
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

module.exports = {
  DonHang,
  ThanhToan,
  CTDonHang,
  DonHangOnline,
  CTDonHangOnline,
  Voucher
};
