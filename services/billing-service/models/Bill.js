const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// DonHang model matching SQL schema
const DonHang = sequelize.define('DonHang', {
  MaDH: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  MaBan: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Ban',
      key: 'MaBan'
    }
  },
  MaNV: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'NhanVien',
      key: 'MaNV'
    }
  },
  NgayLap: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  TongTien: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true
  },
  TrangThai: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Đang xử lý, Hoàn thành, Đã hủy'
  }
}, {
  tableName: 'DonHang',
  timestamps: false
});

// Orders model (additional table from SQL)
const Orders = sequelize.define('Orders', {
  MaOrder: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  MaBan: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Ban',
      key: 'MaBan'
    }
  },
  MaNV: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'NhanVien',
      key: 'MaNV'
    }
  },
  NgayOrder: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  TrangThai: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Đang phục vụ, Đã hoàn thành, Đã hủy'
  }
}, {
  tableName: 'Orders',
  timestamps: false
});

// ThanhToan model matching SQL schema
const ThanhToan = sequelize.define('ThanhToan', {
  MaTT: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  MaDH: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'DonHang',
      key: 'MaDH'
    }
  },
  HinhThuc: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Tiền mặt, Thẻ, Ví điện tử'
  },
  SoTien: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true
  },
  NgayTT: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'ThanhToan',
  timestamps: false
});

module.exports = { DonHang, Orders, ThanhToan };
