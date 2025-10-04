const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const KhuVuc = sequelize.define('KhuVuc', {
  MaKhuVuc: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  TenKhuVuc: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Tên khu vực (Tầng 1, Tầng 2, VIP, Sân thượng, Ngoài trời)'
  },
  MoTa: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Mô tả chi tiết về khu vực'
  },
  HinhAnh: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Đường dẫn hình ảnh minh họa khu vực'
  },
  Video: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Đường dẫn video giới thiệu khu vực'
  },
  TrangThai: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'Hoạt động',
    comment: 'Trạng thái khu vực: Hoạt động, Tạm đóng'
  }
}, {
  tableName: 'KhuVuc',
  timestamps: false,
  charset: 'utf8mb4',
  collate: 'utf8mb4_unicode_ci'
});

module.exports = KhuVuc;
