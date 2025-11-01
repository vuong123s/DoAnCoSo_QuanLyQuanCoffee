const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Voucher = sequelize.define('Voucher', {
  MaVC: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  MaKH: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Mã khách hàng (nếu voucher dành riêng)'
  },
  TenVC: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Tên voucher'
  },
  MaCode: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: 'Mã code voucher (VD: SUMMER2024)'
  },
  LoaiGiamGia: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'Tiền',
    comment: 'Loại giảm giá: Tiền hoặc Phần trăm'
  },
  GiaTri: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    comment: 'Giá trị giảm (% hoặc số tiền)'
  },
  GiaTriToiDa: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
    comment: 'Số tiền giảm tối đa (cho loại phần trăm)'
  },
  DonHangToiThieu: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0,
    comment: 'Giá trị đơn hàng tối thiểu để áp dụng'
  },
  SoLuongToiDa: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    comment: 'Số lượng voucher có thể sử dụng'
  },
  SoLuongDaSuDung: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Số lượng đã sử dụng'
  },
  NgayBD: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: 'Ngày bắt đầu hiệu lực'
  },
  NgayKT: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: 'Ngày kết thúc hiệu lực'
  },
  TrangThai: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'Còn hạn',
    comment: 'Trạng thái: Còn hạn, Hết hạn, Tạm dừng'
  },
  MoTa: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Mô tả chi tiết voucher'
  },
  NgayTao: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'Voucher',
  timestamps: false
});

module.exports = Voucher;
