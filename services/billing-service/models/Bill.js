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
  MaOrder: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Orders',
      key: 'MaOrder'
    }
  },
  MaDHOnline: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'DonHangOnline',
      key: 'MaDHOnline'
    }
  },
  HinhThuc: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: 'Tiền mặt, Thẻ, Ví điện tử, Chuyển khoản'
  },
  SoTien: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  SoTienNhan: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
    comment: 'Số tiền nhận (cho tiền mặt)'
  },
  SoTienThua: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
    defaultValue: 0,
    comment: 'Số tiền thừa'
  },
  MaGiaoDich: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Mã giao dịch (cho thanh toán điện tử)'
  },
  TrangThai: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'Thành công',
    comment: 'Thành công, Thất bại, Chờ xử lý'
  },
  NgayTT: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  MaNVXuLy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'NhanVien',
      key: 'MaNV'
    },
    comment: 'Nhân viên xử lý thanh toán'
  },
  GhiChu: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Ghi chú thanh toán'
  }
}, {
  tableName: 'ThanhToan',
  timestamps: false
});

module.exports = { DonHang, Orders, ThanhToan };
