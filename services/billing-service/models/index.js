const { DonHang, ThanhToan } = require('./Bill');
const { CTDonHang, CTOrder } = require('./BillItem');
const Orders = require('./Order');
const CTOrderModel = require('./CTOrder');
const DonHangOnline = require('./DonHangOnline');
const CTDonHangOnline = require('./CTDonHangOnline');

// Define associations
CTDonHang.belongsTo(DonHang, {
  foreignKey: 'MaDH',
  as: 'donhang'
});

DonHang.hasMany(CTDonHang, {
  foreignKey: 'MaDH',
  as: 'chitiet'
});

// Orders table associations
CTOrderModel.belongsTo(Orders, {
  foreignKey: 'MaOrder',
  as: 'order'
});

Orders.hasMany(CTOrderModel, {
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

// ThanhToan associations with Orders
ThanhToan.belongsTo(Orders, {
  foreignKey: 'MaOrder',
  as: 'order'
});

Orders.hasMany(ThanhToan, {
  foreignKey: 'MaOrder',
  as: 'thanhtoan'
});

// Online order associations
CTDonHangOnline.belongsTo(DonHangOnline, {
  foreignKey: 'MaDHOnline',
  as: 'donhangonline'
});

DonHangOnline.hasMany(CTDonHangOnline, {
  foreignKey: 'MaDHOnline',
  as: 'chitiet'
});

module.exports = {
  DonHang,
  Orders,
  ThanhToan,
  CTDonHang,
  CTOrder: CTOrderModel,
  DonHangOnline,
  CTDonHangOnline
};
