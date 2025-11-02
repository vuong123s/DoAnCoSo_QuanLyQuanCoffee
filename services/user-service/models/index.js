const { NhanVien, KhachHang } = require('./User');
const LichLamViec = require('./LichLamViec');
const YeuCauNhanVien = require('./YeuCauNhanVien');

// Setup associations
if (LichLamViec.associate) {
  LichLamViec.associate({ NhanVien, LichLamViec, YeuCauNhanVien });
}

if (YeuCauNhanVien.associate) {
  YeuCauNhanVien.associate({ NhanVien, LichLamViec, YeuCauNhanVien });
}

module.exports = {
  NhanVien,
  KhachHang,
  LichLamViec,
  YeuCauNhanVien
};
