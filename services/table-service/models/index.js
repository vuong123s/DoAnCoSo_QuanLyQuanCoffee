const Ban = require('./Table');
const DatBan = require('./TableReservation');

// Define associations
DatBan.belongsTo(Ban, {
  foreignKey: 'MaBan',
  as: 'ban'
});

Ban.hasMany(DatBan, {
  foreignKey: 'MaBan',
  as: 'datban'
});

module.exports = {
  Ban,
  DatBan
};
