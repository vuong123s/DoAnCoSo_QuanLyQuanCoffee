const Ban = require('./Table');
const DatBan = require('./TableReservation');
const KhuVuc = require('./KhuVuc');

// Define associations
DatBan.belongsTo(Ban, {
  foreignKey: 'MaBan',
  as: 'ban'
});

Ban.hasMany(DatBan, {
  foreignKey: 'MaBan',
  as: 'datban'
});

// KhuVuc associations
Ban.belongsTo(KhuVuc, {
  foreignKey: 'MaKhuVuc',
  as: 'khuVuc'
});

KhuVuc.hasMany(Ban, {
  foreignKey: 'MaKhuVuc',
  as: 'tables'
});

module.exports = {
  Ban,
  DatBan,
  KhuVuc
};
