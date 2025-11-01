const { sequelize } = require('../config/database');
const Voucher = require('../models/Voucher');

async function syncVoucherTable() {
  try {
    console.log('🔄 Syncing Voucher table...');
    
    // Check if table exists
    const [results] = await sequelize.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'QuanLyCafe' 
      AND table_name = 'Voucher'
    `);
    
    console.log('📊 Voucher table exists:', results[0].count > 0);
    
    if (results[0].count === 0) {
      console.log('⚠️  Table missing! Creating it...');
      await Voucher.sync({ force: false, alter: true });
      console.log('✅ Voucher table created successfully!');
    } else {
      console.log('✅ Voucher table already exists');
      await Voucher.sync({ force: false });
    }
    
    // Check if we have any vouchers
    const voucherCount = await Voucher.count();
    console.log(`📊 Current voucher count: ${voucherCount}`);
    
    if (voucherCount === 0) {
      console.log('📝 Creating sample vouchers...');
      
      const sampleVouchers = [
        {
          MaVoucher: 'WELCOME10',
          TenVC: 'Giảm 10% cho khách hàng mới',
          MoTa: 'Giảm 10% cho đơn hàng đầu tiên',
          LoaiGiamGia: 'Phần trăm',
          GiaTriGiam: 10,
          GiamToiDa: 50000,
          GiaTriDonHangToiThieu: 100000,
          SoLuong: 100,
          SoLuongDaSuDung: 0,
          NgayBatDau: new Date('2024-01-01'),
          NgayKetThuc: new Date('2025-12-31'),
          LoaiKhachHang: 'Khách hàng mới',
          TrangThai: 'Hoạt động'
        },
        {
          MaVoucher: 'FREESHIP',
          TenVC: 'Miễn phí giao hàng',
          MoTa: 'Miễn phí giao hàng cho đơn từ 200k',
          LoaiGiamGia: 'Số tiền',
          GiaTriGiam: 30000,
          GiamToiDa: null,
          GiaTriDonHangToiThieu: 200000,
          SoLuong: 50,
          SoLuongDaSuDung: 0,
          NgayBatDau: new Date('2024-01-01'),
          NgayKetThuc: new Date('2025-12-31'),
          LoaiKhachHang: 'Tất cả',
          TrangThai: 'Hoạt động'
        },
        {
          MaVoucher: 'SUMMER2024',
          TenVC: 'Giảm 20% mùa hè',
          MoTa: 'Giảm 20% cho mọi đơn hàng',
          LoaiGiamGia: 'Phần trăm',
          GiaTriGiam: 20,
          GiamToiDa: 100000,
          GiaTriDonHangToiThieu: 150000,
          SoLuong: 200,
          SoLuongDaSuDung: 0,
          NgayBatDau: new Date('2024-06-01'),
          NgayKetThuc: new Date('2024-08-31'),
          LoaiKhachHang: 'Tất cả',
          TrangThai: 'Hoạt động'
        }
      ];
      
      await Voucher.bulkCreate(sampleVouchers);
      console.log(`✅ Created ${sampleVouchers.length} sample vouchers`);
    }
    
    // List all vouchers
    const allVouchers = await Voucher.findAll();
    console.log('\n📋 Available vouchers:');
    allVouchers.forEach(v => {
      console.log(`  - ${v.MaVoucher}: ${v.TenVC} (${v.TrangThai})`);
    });
    
    console.log('\n✅ All checks passed!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

syncVoucherTable();
