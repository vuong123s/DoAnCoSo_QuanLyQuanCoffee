const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// DonHangOnline model for online orders (đơn hàng online)
const DonHangOnline = sequelize.define('DonHangOnline', {
  MaDHOnline: {
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
  TenKhach: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  SDTKhach: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  EmailKhach: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  DiaChiGiaoHang: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  LoaiDonHang: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'Giao hàng',
    comment: 'Giao hàng, Mang đi'
  },
  NgayDat: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  NgayGiaoMong: {
    type: DataTypes.DATE,
    allowNull: true
  },
  TongTien: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0
  },
  PhiGiaoHang: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0
  },
  TongThanhToan: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0
  },
  MaVC: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Voucher',
      key: 'MaVC'
    }
  },
  GiamGia: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0
  },
  TrangThai: {
    type: DataTypes.STRING(30),
    allowNull: false,
    defaultValue: 'Chờ xác nhận',
    comment: 'Chờ xác nhận, Đã xác nhận, Đang chuẩn bị, Đang giao, Hoàn thành, Đã hủy'
  },
  LyDoHuy: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  MaNVXuLy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'NhanVien',
      key: 'MaNV'
    }
  },
  GhiChu: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'DonHangOnline',
  timestamps: false
});

module.exports = DonHangOnline;
