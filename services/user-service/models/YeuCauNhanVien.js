const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const YeuCauNhanVien = sequelize.define('YeuCauNhanVien', {
  MaYeuCau: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  MaNV: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  LoaiYeuCau: {
    type: DataTypes.STRING(30),
    allowNull: false
  },
  NgayBatDau: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  NgayKetThuc: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  GioBatDau: {
    type: DataTypes.TIME,
    allowNull: true
  },
  GioKetThuc: {
    type: DataTypes.TIME,
    allowNull: true
  },
  LyDo: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  TrangThai: {
    type: DataTypes.STRING(30),
    defaultValue: 'Chờ duyệt'
  },
  NguoiDuyet: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  NgayDuyet: {
    type: DataTypes.DATE,
    allowNull: true
  },
  GhiChuDuyet: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  NgayTao: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'YeuCauNhanVien',
  timestamps: false
});

// Define association
YeuCauNhanVien.associate = (models) => {
  YeuCauNhanVien.belongsTo(models.NhanVien, {
    foreignKey: 'MaNV',
    as: 'nhanvien'
  });
  
  YeuCauNhanVien.belongsTo(models.NhanVien, {
    foreignKey: 'NguoiDuyet',
    as: 'nguoiduyet'
  });
};

module.exports = YeuCauNhanVien;
