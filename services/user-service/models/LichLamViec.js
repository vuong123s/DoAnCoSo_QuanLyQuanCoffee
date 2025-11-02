const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const LichLamViec = sequelize.define('LichLamViec', {
  MaLich: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  MaNV: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  NgayLam: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  CaLam: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  TrangThai: {
    type: DataTypes.STRING(30),
    defaultValue: 'Đã xếp lịch'
  },
  GhiChu: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  NgayTao: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'LichLamViec',
  timestamps: false
});

// Define association
LichLamViec.associate = (models) => {
  LichLamViec.belongsTo(models.NhanVien, {
    foreignKey: 'MaNV',
    as: 'nhanvien'
  });
};

module.exports = LichLamViec;
