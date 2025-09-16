const { DonHang, Orders, ThanhToan } = require('./Bill');
const { CTDonHang, CTOrder } = require('./BillItem');

// Define associations
CTDonHang.belongsTo(DonHang, {
  foreignKey: 'MaDH',
  as: 'donhang'
});

DonHang.hasMany(CTDonHang, {
  foreignKey: 'MaDH',
  as: 'chitiet'
});

CTOrder.belongsTo(Orders, {
  foreignKey: 'MaOrder',
  as: 'order'
});

Orders.hasMany(CTOrder, {
  foreignKey: 'MaOrder',
  as: 'chitiet'
});

ThanhToan.belongsTo(DonHang, {
  foreignKey: 'MaDH',
  as: 'donhang'
});

DonHang.hasMany(ThanhToan, {
  foreignKey: 'MaDH',
  as: 'thanhtoan'
});

module.exports = {
  DonHang,
  Orders,
  ThanhToan,
  CTDonHang,
  CTOrder
};
