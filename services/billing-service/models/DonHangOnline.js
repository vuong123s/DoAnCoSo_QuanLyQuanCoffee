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
  DiemSuDung: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Số điểm tích lũy đã sử dụng để giảm giá (1 điểm = 1,000 VNĐ)'
  },
  TongThanhToan: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0,
    comment: 'Tổng tiền sau khi trừ điểm: TongTien - (DiemSuDung * 1000)'
  },
  TrangThai: {
    type: DataTypes.STRING(30),
    allowNull: false,
    defaultValue: 'Chờ xác nhận',
    comment: 'Chờ xác nhận, Đã xác nhận, Đang chuẩn bị, Đang giao, Hoàn thành, Đã hủy'
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
  },
  // Virtual field for frontend compatibility
  MaDonHang: {
    type: DataTypes.VIRTUAL,
    get() {
      return this.MaDHOnline;
    }
  },
  // Virtual field for phone number compatibility
  SoDienThoai: {
    type: DataTypes.VIRTUAL,
    get() {
      return this.SDTKhach;
    }
  },
  // Virtual field for total amount compatibility
  ThanhTien: {
    type: DataTypes.VIRTUAL,
    get() {
      return this.TongThanhToan;
    }
  }
}, {
  tableName: 'DonHangOnline',
  timestamps: false
});

module.exports = DonHangOnline;
