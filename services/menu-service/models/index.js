const LoaiMon = require('./Category');
const Mon = require('./MenuItem');
const Kho = require('./Kho');

// Define associations
Mon.belongsTo(LoaiMon, {
  foreignKey: 'MaLoai',
  as: 'loaimon'
});

LoaiMon.hasMany(Mon, {
  foreignKey: 'MaLoai',
  as: 'mon'
});

module.exports = {
  LoaiMon,
  Mon,
  Kho
};
