const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

// NhanVien model matching SQL schema
const NhanVien = sequelize.define('NhanVien', {
  MaNV: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  HoTen: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      len: [2, 100],
      notEmpty: true
    }
  },
  GioiTinh: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  NgaySinh: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  SDT: {
    type: DataTypes.STRING(20),
    allowNull: true,
    unique: true
  },
  Email: {
    type: DataTypes.STRING(100),
    allowNull: true,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  ChucVu: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Quản lý, nhân viên'
  },
  MatKhau: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      len: [6, 255],
      notEmpty: true
    }
  },
  Luong: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true
  },
  NgayVaoLam: {
    type: DataTypes.DATEONLY,
    allowNull: true
  }
}, {
  tableName: 'NhanVien',
  timestamps: false,
  hooks: {
    beforeCreate: async (nhanvien) => {
      if (nhanvien.MatKhau) {
        const salt = await bcrypt.genSalt(10);
        nhanvien.MatKhau = await bcrypt.hash(nhanvien.MatKhau, salt);
      }
    },
    beforeUpdate: async (nhanvien) => {
      if (nhanvien.changed('MatKhau')) {
        const salt = await bcrypt.genSalt(10);
        nhanvien.MatKhau = await bcrypt.hash(nhanvien.MatKhau, salt);
      }
    }
  }
});

// Instance methods
NhanVien.prototype.comparePassword = async function(candidatePassword) {
  if (!this.MatKhau) return false;
  return await bcrypt.compare(candidatePassword, this.MatKhau);
};

NhanVien.prototype.toJSON = function() {
  const values = Object.assign({}, this.get());
  delete values.MatKhau;
  return values;
};

// Also create KhachHang model for customers
const KhachHang = sequelize.define('KhachHang', {
  MaKH: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  HoTen: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  SDT: {
    type: DataTypes.STRING(20),
    allowNull: true,
    unique: true
  },
  Email: {
    type: DataTypes.STRING(100),
    allowNull: true,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  MatKhau: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  DiemTichLuy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  }
}, {
  tableName: 'KhachHang',
  timestamps: false,
  hooks: {
    beforeCreate: async (khachhang) => {
      if (khachhang.MatKhau) {
        const salt = await bcrypt.genSalt(10);
        khachhang.MatKhau = await bcrypt.hash(khachhang.MatKhau, salt);
      }
    },
    beforeUpdate: async (khachhang) => {
      if (khachhang.changed('MatKhau')) {
        const salt = await bcrypt.genSalt(10);
        khachhang.MatKhau = await bcrypt.hash(khachhang.MatKhau, salt);
      }
    }
  }
});

// Instance methods for KhachHang
KhachHang.prototype.comparePassword = async function(candidatePassword) {
  if (!this.MatKhau) return false;
  return await bcrypt.compare(candidatePassword, this.MatKhau);
};

KhachHang.prototype.toJSON = function() {
  const values = Object.assign({}, this.get());
  delete values.MatKhau;
  return values;
};

module.exports = { NhanVien, KhachHang };
