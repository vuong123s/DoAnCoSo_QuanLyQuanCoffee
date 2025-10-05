const LoaiMon = require('./Category');
const Mon = require('./MenuItem');

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
  Mon
};
