const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// CTDonHang model matching SQL schema
const CTDonHang = sequelize.define('CTDonHang', {
  MaDH: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: 'DonHang',
      key: 'MaDH'
    }
  },
  MaMon: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: 'Mon',
      key: 'MaMon'
    }
  },
  SoLuong: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  DonGia: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  ThanhTien: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  }
}, {
  tableName: 'CTDonHang',
  timestamps: false
});

// CTOrder model matching SQL schema
const CTOrder = sequelize.define('CTOrder', {
  MaOrder: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: 'Orders',
      key: 'MaOrder'
    }
  },
  MaMon: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: 'Mon',
      key: 'MaMon'
    }
  },
  SoLuong: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  GhiChu: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'VD: ít đá, thêm đường'
  }
}, {
  tableName: 'CTOrder',
  timestamps: false
});

module.exports = { CTDonHang, CTOrder };
