const GioHang = require('./GioHang');
const DonHangOnline = require('./DonHangOnline');
const CTDonHangOnline = require('./CTDonHangOnline');
const TheoDoiDonHang = require('./TheoDoiDonHang');

// Define associations
DonHangOnline.hasMany(CTDonHangOnline, {
  foreignKey: 'MaDonHangOnline',
  as: 'ChiTietDonHang'
});

CTDonHangOnline.belongsTo(DonHangOnline, {
  foreignKey: 'MaDonHangOnline',
  as: 'DonHang'
});

DonHangOnline.hasMany(TheoDoiDonHang, {
  foreignKey: 'MaDonHangOnline',
  as: 'LichSuTheoDoi'
});

TheoDoiDonHang.belongsTo(DonHangOnline, {
  foreignKey: 'MaDonHangOnline',
  as: 'DonHang'
});

module.exports = {
  GioHang,
  DonHangOnline,
  CTDonHangOnline,
  TheoDoiDonHang
};
