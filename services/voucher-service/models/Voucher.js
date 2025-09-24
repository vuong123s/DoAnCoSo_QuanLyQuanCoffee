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
    comment: 'Có thể gắn cho KH cụ thể'
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
    comment: 'Mã voucher'
  },
  LoaiGiamGia: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'Tiền',
    comment: 'Tiền, Phần trăm'
  },
  GiaTri: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    comment: 'Giá trị giảm giá'
  },
  GiaTriToiDa: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
    comment: 'Giá trị giảm tối đa (cho % discount)'
  },
  DonHangToiThieu: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0,
    comment: 'Đơn hàng tối thiểu để áp dụng'
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
    comment: 'Ngày bắt đầu'
  },
  NgayKT: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: 'Ngày kết thúc'
  },
  TrangThai: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'Còn hạn',
    comment: 'Còn hạn, Hết hạn, Tạm dừng'
  },
  MoTa: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Mô tả voucher'
  },
  NgayTao: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'Ngày tạo voucher'
  }
}, {
  tableName: 'Voucher',
  timestamps: false
});

module.exports = Voucher;
