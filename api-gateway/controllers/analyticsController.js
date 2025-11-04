const { pool: db } = require('../config/database');

// Helper function để format ngày
const formatDate = (date) => {
  if (!date) return null;
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

// Helper function để tính khoảng thời gian
const getDateRange = (period) => {
  const today = new Date();
  let startDate, endDate;

  switch (period) {
    case 'today':
      startDate = endDate = formatDate(today);
      break;
    case 'yesterday':
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      startDate = endDate = formatDate(yesterday);
      break;
    case '7days':
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      startDate = formatDate(sevenDaysAgo);
      endDate = formatDate(today);
      break;
    case '30days':
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      startDate = formatDate(thirtyDaysAgo);
      endDate = formatDate(today);
      break;
    case 'thisMonth':
      startDate = formatDate(new Date(today.getFullYear(), today.getMonth(), 1));
      endDate = formatDate(today);
      break;
    case 'lastMonth':
      const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
      startDate = formatDate(lastMonth);
      endDate = formatDate(lastMonthEnd);
      break;
    default:
      startDate = endDate = formatDate(today);
  }

  return { startDate, endDate };
};

// 1. Tổng doanh thu
exports.getTongDoanhThu = async (req, res) => {
  try {
    const [results] = await db.query('CALL TinhTongDoanhThu()');
    
    res.json({
      success: true,
      data: results[0][0] || {
        TongDoanhThu: 0,
        TongDonHang: 0,
        SoNhanVienPhucVu: 0,
        DoanhThuTrungBinh: 0
      }
    });
  } catch (error) {
    console.error('Error in getTongDoanhThu:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi khi tính tổng doanh thu',
      message: error.message
    });
  }
};

// 2. Doanh thu theo khoảng thời gian
exports.getDoanhThuTheoNgay = async (req, res) => {
  try {
    let { startDate, endDate, period } = req.query;

    // Nếu có period, tính toán startDate và endDate
    if (period) {
      const range = getDateRange(period);
      startDate = range.startDate;
      endDate = range.endDate;
    }

    // Mặc định là 7 ngày qua nếu không có tham số
    if (!startDate || !endDate) {
      const range = getDateRange('7days');
      startDate = range.startDate;
      endDate = range.endDate;
    }

    const [results] = await db.query(
      'CALL DoanhThuTheoKhoangThoiGian(?, ?)',
      [startDate, endDate]
    );

    res.json({
      success: true,
      period: period || 'custom',
      startDate,
      endDate,
      data: results[0] || []
    });
  } catch (error) {
    console.error('Error in getDoanhThuTheoNgay:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi khi lấy doanh thu theo ngày',
      message: error.message
    });
  }
};

// 3. Doanh thu theo món
exports.getDoanhThuTheoMon = async (req, res) => {
  try {
    let { startDate, endDate, period } = req.query;

    if (period) {
      const range = getDateRange(period);
      startDate = range.startDate;
      endDate = range.endDate;
    }

    const [results] = await db.query(
      'CALL DoanhThuTheoMon(?, ?)',
      [startDate || null, endDate || null]
    );

    res.json({
      success: true,
      period: period || 'all',
      startDate: startDate || null,
      endDate: endDate || null,
      data: results[0] || []
    });
  } catch (error) {
    console.error('Error in getDoanhThuTheoMon:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi khi lấy doanh thu theo món',
      message: error.message
    });
  }
};

// 4. Xếp hạng món bán chạy
exports.getMonBanChay = async (req, res) => {
  try {
    let { startDate, endDate, period, limit } = req.query;
    const soLuong = parseInt(limit) || 10;

    if (period) {
      const range = getDateRange(period);
      startDate = range.startDate;
      endDate = range.endDate;
    }

    const [results] = await db.query(
      'CALL XepHangMonBanChay(?, ?, ?)',
      [startDate || null, endDate || null, soLuong]
    );

    res.json({
      success: true,
      period: period || 'all',
      startDate: startDate || null,
      endDate: endDate || null,
      limit: soLuong,
      data: results[0] || []
    });
  } catch (error) {
    console.error('Error in getMonBanChay:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi khi lấy danh sách món bán chạy',
      message: error.message
    });
  }
};

// 5. Doanh thu theo danh mục
exports.getDoanhThuTheoDanhMuc = async (req, res) => {
  try {
    let { startDate, endDate, period } = req.query;

    if (period) {
      const range = getDateRange(period);
      startDate = range.startDate;
      endDate = range.endDate;
    }

    const [results] = await db.query(
      'CALL DoanhThuTheoDanhMuc(?, ?)',
      [startDate || null, endDate || null]
    );

    res.json({
      success: true,
      period: period || 'all',
      startDate: startDate || null,
      endDate: endDate || null,
      data: results[0] || []
    });
  } catch (error) {
    console.error('Error in getDoanhThuTheoDanhMuc:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi khi lấy doanh thu theo danh mục',
      message: error.message
    });
  }
};

// 6. Doanh thu theo giờ
exports.getDoanhThuTheoGio = async (req, res) => {
  try {
    let { startDate, endDate, period } = req.query;

    if (period) {
      const range = getDateRange(period);
      startDate = range.startDate;
      endDate = range.endDate;
    }

    // Mặc định là hôm nay
    if (!startDate || !endDate) {
      const range = getDateRange('today');
      startDate = range.startDate;
      endDate = range.endDate;
    }

    const [results] = await db.query(
      'CALL DoanhThuTheoGio(?, ?)',
      [startDate, endDate]
    );

    res.json({
      success: true,
      period: period || 'today',
      startDate,
      endDate,
      data: results[0] || []
    });
  } catch (error) {
    console.error('Error in getDoanhThuTheoGio:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi khi lấy doanh thu theo giờ',
      message: error.message
    });
  }
};

// 7. Doanh thu theo nhân viên
exports.getDoanhThuTheoNhanVien = async (req, res) => {
  try {
    let { startDate, endDate, period } = req.query;

    if (period) {
      const range = getDateRange(period);
      startDate = range.startDate;
      endDate = range.endDate;
    }

    const [results] = await db.query(
      'CALL DoanhThuTheoNhanVien(?, ?)',
      [startDate || null, endDate || null]
    );

    res.json({
      success: true,
      period: period || 'all',
      startDate: startDate || null,
      endDate: endDate || null,
      data: results[0] || []
    });
  } catch (error) {
    console.error('Error in getDoanhThuTheoNhanVien:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi khi lấy doanh thu theo nhân viên',
      message: error.message
    });
  }
};

// 8. Doanh thu theo hình thức thanh toán
exports.getDoanhThuTheoHinhThuc = async (req, res) => {
  try {
    let { startDate, endDate, period } = req.query;

    if (period) {
      const range = getDateRange(period);
      startDate = range.startDate;
      endDate = range.endDate;
    }

    // Mặc định là tháng này
    if (!startDate || !endDate) {
      const range = getDateRange('thisMonth');
      startDate = range.startDate;
      endDate = range.endDate;
    }

    const [results] = await db.query(
      'CALL DoanhThuTheoHinhThucThanhToan(?, ?)',
      [startDate, endDate]
    );

    res.json({
      success: true,
      period: period || 'thisMonth',
      startDate,
      endDate,
      data: results[0] || []
    });
  } catch (error) {
    console.error('Error in getDoanhThuTheoHinhThuc:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi khi lấy doanh thu theo hình thức thanh toán',
      message: error.message
    });
  }
};

// 9. Dữ liệu biểu đồ doanh thu (cho Dashboard)
exports.getRevenueChartData = async (req, res) => {
  try {
    let { start_date, end_date, period } = req.query;

    if (period) {
      const range = getDateRange(period);
      start_date = range.startDate;
      end_date = range.endDate;
    }

    // Mặc định là 7 ngày qua
    if (!start_date || !end_date) {
      const range = getDateRange('7days');
      start_date = range.startDate;
      end_date = range.endDate;
    }

    const [results] = await db.query(
      'CALL SP_DoanhThuTheoNgay(?, ?)',
      [start_date, end_date]
    );

    const chartData = (results[0] || []).map(row => ({
      date: formatDate(row.Ngay),
      inStoreRevenue: parseFloat(row.DoanhThuTaiCho || 0),
      onlineRevenue: parseFloat(row.DoanhThuOnline || 0),
      totalRevenue: parseFloat(row.TongDoanhThu || 0),
      inStoreOrders: parseInt(row.SoDonTaiCho || 0),
      onlineOrders: parseInt(row.SoDonOnline || 0),
      totalOrders: parseInt(row.TongSoDon || 0)
    }));

    res.json({
      success: true,
      period: period || 'custom',
      startDate: start_date,
      endDate: end_date,
      data: chartData
    });
  } catch (error) {
    console.error('Error in getRevenueChartData:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi khi lấy dữ liệu biểu đồ doanh thu',
      message: error.message
    });
  }
};
