const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// DatBan model matching SQL schema
const DatBan = sequelize.define('DatBan', {
  MaDat: {
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
  MaBan: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Ban',
      key: 'MaBan'
    }
  },
  NgayDat: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  GioDat: {
    type: DataTypes.TIME,
    allowNull: false,
    comment: 'Giờ bắt đầu đặt bàn'
  },
  GioKetThuc: {
    type: DataTypes.TIME,
    allowNull: false,
    comment: 'Giờ kết thúc đặt bàn'
  },
  SoNguoi: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  TrangThai: {
    type: DataTypes.STRING(20),
    allowNull: true,
    defaultValue: 'Đã đặt',
    comment: 'Đã đặt, Đã xác nhận, Đã hủy, Hoàn thành'
  },
  TenKhach: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Tên khách hàng đặt bàn'
  },
  SoDienThoai: {
    type: DataTypes.STRING(15),
    allowNull: false,
    comment: 'Số điện thoại khách hàng'
  },
  EmailKhach: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Email khách hàng'
  },
  GhiChu: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Ghi chú đặt bàn'
  },
  NgayTaoDat: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: DataTypes.NOW,
    comment: 'Thời gian tạo đặt bàn'
  },
  MaNVXuLy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'NhanVien',
      key: 'MaNV'
    },
    comment: 'Nhân viên xử lý đặt bàn'
  }
}, {
  tableName: 'DatBan',
  timestamps: false
});

module.exports = DatBan;
