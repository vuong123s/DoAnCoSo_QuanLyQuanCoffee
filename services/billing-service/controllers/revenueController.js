const { DonHang, Orders, DonHangOnline, CTDonHang, CTOrder, CTDonHangOnline } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');

// Get comprehensive revenue statistics
const getRevenueStats = async (req, res) => {
  try {
    const { 
      start_date, 
      end_date, 
      period = 'day' // day, week, month, year
    } = req.query;

    const whereClause = {};
    if (start_date || end_date) {
      whereClause.NgayLap = {};
      if (start_date) whereClause.NgayLap[Op.gte] = new Date(start_date);
      if (end_date) whereClause.NgayLap[Op.lte] = new Date(end_date);
    }

    const orderWhereClause = {};
    if (start_date || end_date) {
      orderWhereClause.NgayOrder = {};
      if (start_date) orderWhereClause.NgayOrder[Op.gte] = new Date(start_date);
      if (end_date) orderWhereClause.NgayOrder[Op.lte] = new Date(end_date);
    }

    const onlineWhereClause = {};
    if (start_date || end_date) {
      onlineWhereClause.NgayDat = {};
      if (start_date) onlineWhereClause.NgayDat[Op.gte] = new Date(start_date);
      if (end_date) onlineWhereClause.NgayDat[Op.lte] = new Date(end_date);
    }

    // DonHang statistics
    const donHangStats = await DonHang.findAll({
      where: { ...whereClause, TrangThai: 'Hoàn thành' },
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('MaDH')), 'count'],
        [sequelize.fn('SUM', sequelize.col('TongTien')), 'total_revenue'],
        [sequelize.fn('AVG', sequelize.col('TongTien')), 'avg_order_value']
      ]
    });

    // Orders statistics
    const ordersStats = await Orders.findAll({
      where: { ...orderWhereClause, TrangThai: 'Đã hoàn thành' },
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('MaOrder')), 'count'],
        [sequelize.fn('SUM', sequelize.col('TongTien')), 'total_revenue'],
        [sequelize.fn('AVG', sequelize.col('TongTien')), 'avg_order_value']
      ]
    });

    // Online orders statistics
    const onlineStats = await DonHangOnline.findAll({
      where: { ...onlineWhereClause, TrangThai: 'Hoàn thành' },
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('MaDHOnline')), 'count'],
        [sequelize.fn('SUM', sequelize.col('TongThanhToan')), 'total_revenue'],
        [sequelize.fn('AVG', sequelize.col('TongThanhToan')), 'avg_order_value']
      ]
    });

    // Calculate totals
    const donHangData = donHangStats[0]?.dataValues || { count: 0, total_revenue: 0, avg_order_value: 0 };
    const ordersData = ordersStats[0]?.dataValues || { count: 0, total_revenue: 0, avg_order_value: 0 };
    const onlineData = onlineStats[0]?.dataValues || { count: 0, total_revenue: 0, avg_order_value: 0 };

    const totalOrders = parseInt(donHangData.count) + parseInt(ordersData.count) + parseInt(onlineData.count);
    const totalRevenue = parseFloat(donHangData.total_revenue || 0) + 
                        parseFloat(ordersData.total_revenue || 0) + 
                        parseFloat(onlineData.total_revenue || 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    res.json({
      summary: {
        total_orders: totalOrders,
        total_revenue: totalRevenue,
        average_order_value: avgOrderValue
      },
      breakdown: {
        donhang: {
          orders: parseInt(donHangData.count),
          revenue: parseFloat(donHangData.total_revenue || 0),
          avg_value: parseFloat(donHangData.avg_order_value || 0)
        },
        in_store: {
          orders: parseInt(ordersData.count),
          revenue: parseFloat(ordersData.total_revenue || 0),
          avg_value: parseFloat(ordersData.avg_order_value || 0)
        },
        online: {
          orders: parseInt(onlineData.count),
          revenue: parseFloat(onlineData.total_revenue || 0),
          avg_value: parseFloat(onlineData.avg_order_value || 0)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching revenue stats:', error);
    res.status(500).json({
      error: 'Failed to fetch revenue statistics',
      message: error.message
    });
  }
};

// Get revenue by time period
const getRevenueByPeriod = async (req, res) => {
  try {
    const { 
      start_date, 
      end_date, 
      period = 'day' // day, week, month
    } = req.query;

    let dateFormat;
    switch (period) {
      case 'week':
        dateFormat = '%Y-%u'; // Year-Week
        break;
      case 'month':
        dateFormat = '%Y-%m'; // Year-Month
        break;
      case 'year':
        dateFormat = '%Y'; // Year
        break;
      default:
        dateFormat = '%Y-%m-%d'; // Year-Month-Day
    }

    const whereClause = {};
    if (start_date || end_date) {
      whereClause.NgayLap = {};
      if (start_date) whereClause.NgayLap[Op.gte] = new Date(start_date);
      if (end_date) whereClause.NgayLap[Op.lte] = new Date(end_date);
    }

    // DonHang by period
    const donHangByPeriod = await DonHang.findAll({
      where: { ...whereClause, TrangThai: 'Hoàn thành' },
      attributes: [
        [sequelize.fn('DATE_FORMAT', sequelize.col('NgayLap'), dateFormat), 'period'],
        [sequelize.fn('COUNT', sequelize.col('MaDH')), 'orders'],
        [sequelize.fn('SUM', sequelize.col('TongTien')), 'revenue']
      ],
      group: [sequelize.fn('DATE_FORMAT', sequelize.col('NgayLap'), dateFormat)],
      order: [[sequelize.fn('DATE_FORMAT', sequelize.col('NgayLap'), dateFormat), 'ASC']]
    });

    // Orders by period
    const ordersByPeriod = await Orders.findAll({
      where: { ...whereClause.NgayLap ? { NgayOrder: whereClause.NgayLap } : {}, TrangThai: 'Đã hoàn thành' },
      attributes: [
        [sequelize.fn('DATE_FORMAT', sequelize.col('NgayOrder'), dateFormat), 'period'],
        [sequelize.fn('COUNT', sequelize.col('MaOrder')), 'orders'],
        [sequelize.fn('SUM', sequelize.col('TongTien')), 'revenue']
      ],
      group: [sequelize.fn('DATE_FORMAT', sequelize.col('NgayOrder'), dateFormat)],
      order: [[sequelize.fn('DATE_FORMAT', sequelize.col('NgayOrder'), dateFormat), 'ASC']]
    });

    // Online orders by period
    const onlineByPeriod = await DonHangOnline.findAll({
      where: { ...whereClause.NgayLap ? { NgayDat: whereClause.NgayLap } : {}, TrangThai: 'Hoàn thành' },
      attributes: [
        [sequelize.fn('DATE_FORMAT', sequelize.col('NgayDat'), dateFormat), 'period'],
        [sequelize.fn('COUNT', sequelize.col('MaDHOnline')), 'orders'],
        [sequelize.fn('SUM', sequelize.col('TongThanhToan')), 'revenue']
      ],
      group: [sequelize.fn('DATE_FORMAT', sequelize.col('NgayDat'), dateFormat)],
      order: [[sequelize.fn('DATE_FORMAT', sequelize.col('NgayDat'), dateFormat), 'ASC']]
    });

    // Combine and format results
    const periodData = {};
    
    donHangByPeriod.forEach(item => {
      const period = item.dataValues.period;
      if (!periodData[period]) periodData[period] = { period, donhang: 0, in_store: 0, online: 0, total: 0 };
      periodData[period].donhang = parseFloat(item.dataValues.revenue || 0);
      periodData[period].total += periodData[period].donhang;
    });

    ordersByPeriod.forEach(item => {
      const period = item.dataValues.period;
      if (!periodData[period]) periodData[period] = { period, donhang: 0, in_store: 0, online: 0, total: 0 };
      periodData[period].in_store = parseFloat(item.dataValues.revenue || 0);
      periodData[period].total += periodData[period].in_store;
    });

    onlineByPeriod.forEach(item => {
      const period = item.dataValues.period;
      if (!periodData[period]) periodData[period] = { period, donhang: 0, in_store: 0, online: 0, total: 0 };
      periodData[period].online = parseFloat(item.dataValues.revenue || 0);
      periodData[period].total += periodData[period].online;
    });

    const result = Object.values(periodData).sort((a, b) => a.period.localeCompare(b.period));

    res.json({
      period_type: period,
      data: result
    });

  } catch (error) {
    console.error('Error fetching revenue by period:', error);
    res.status(500).json({
      error: 'Failed to fetch revenue by period',
      message: error.message
    });
  }
};

// Get top selling items
const getTopSellingItems = async (req, res) => {
  try {
    const { 
      start_date, 
      end_date, 
      limit = 10 
    } = req.query;

    const whereClause = {};
    if (start_date || end_date) {
      whereClause.NgayLap = {};
      if (start_date) whereClause.NgayLap[Op.gte] = new Date(start_date);
      if (end_date) whereClause.NgayLap[Op.lte] = new Date(end_date);
    }

    // Top items from DonHang
    const donHangItems = await CTDonHang.findAll({
      include: [{
        model: DonHang,
        as: 'donhang',
        where: { ...whereClause, TrangThai: 'Hoàn thành' },
        attributes: []
      }],
      attributes: [
        'MaMon',
        [sequelize.fn('SUM', sequelize.col('SoLuong')), 'total_quantity'],
        [sequelize.fn('SUM', sequelize.col('ThanhTien')), 'total_revenue']
      ],
      group: ['MaMon'],
      order: [[sequelize.fn('SUM', sequelize.col('SoLuong')), 'DESC']],
      limit: parseInt(limit)
    });

    // Top items from Orders
    const orderItems = await CTOrder.findAll({
      include: [{
        model: Orders,
        as: 'order',
        where: { 
          ...(whereClause.NgayLap ? { NgayOrder: whereClause.NgayLap } : {}), 
          TrangThai: 'Đã hoàn thành' 
        },
        attributes: []
      }],
      attributes: [
        'MaMon',
        [sequelize.fn('SUM', sequelize.col('SoLuong')), 'total_quantity'],
        [sequelize.fn('SUM', sequelize.col('ThanhTien')), 'total_revenue']
      ],
      group: ['MaMon'],
      order: [[sequelize.fn('SUM', sequelize.col('SoLuong')), 'DESC']],
      limit: parseInt(limit)
    });

    // Top items from Online Orders
    const onlineItems = await CTDonHangOnline.findAll({
      include: [{
        model: DonHangOnline,
        as: 'donhangonline',
        where: { 
          ...(whereClause.NgayLap ? { NgayDat: whereClause.NgayLap } : {}), 
          TrangThai: 'Hoàn thành' 
        },
        attributes: []
      }],
      attributes: [
        'MaMon',
        [sequelize.fn('SUM', sequelize.col('SoLuong')), 'total_quantity'],
        [sequelize.fn('SUM', sequelize.col('ThanhTien')), 'total_revenue']
      ],
      group: ['MaMon'],
      order: [[sequelize.fn('SUM', sequelize.col('SoLuong')), 'DESC']],
      limit: parseInt(limit)
    });

    // Combine results
    const itemStats = {};
    
    [...donHangItems, ...orderItems, ...onlineItems].forEach(item => {
      const maMon = item.MaMon;
      if (!itemStats[maMon]) {
        itemStats[maMon] = {
          MaMon: maMon,
          total_quantity: 0,
          total_revenue: 0
        };
      }
      itemStats[maMon].total_quantity += parseInt(item.dataValues.total_quantity || 0);
      itemStats[maMon].total_revenue += parseFloat(item.dataValues.total_revenue || 0);
    });

    const topItems = Object.values(itemStats)
      .sort((a, b) => b.total_quantity - a.total_quantity)
      .slice(0, parseInt(limit));

    res.json({
      top_selling_items: topItems
    });

  } catch (error) {
    console.error('Error fetching top selling items:', error);
    res.status(500).json({
      error: 'Failed to fetch top selling items',
      message: error.message
    });
  }
};

// Get daily revenue summary
const getDailyRevenueSummary = async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    // Today's DonHang
    const todayDonHang = await DonHang.findAll({
      where: {
        NgayLap: { [Op.between]: [startOfDay, endOfDay] },
        TrangThai: 'Hoàn thành'
      },
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('MaDH')), 'count'],
        [sequelize.fn('SUM', sequelize.col('TongTien')), 'revenue']
      ]
    });

    // Today's Orders
    const todayOrders = await Orders.findAll({
      where: {
        NgayOrder: { [Op.between]: [startOfDay, endOfDay] },
        TrangThai: 'Đã hoàn thành'
      },
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('MaOrder')), 'count'],
        [sequelize.fn('SUM', sequelize.col('TongTien')), 'revenue']
      ]
    });

    // Today's Online Orders
    const todayOnline = await DonHangOnline.findAll({
      where: {
        NgayDat: { [Op.between]: [startOfDay, endOfDay] },
        TrangThai: 'Hoàn thành'
      },
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('MaDHOnline')), 'count'],
        [sequelize.fn('SUM', sequelize.col('TongThanhToan')), 'revenue']
      ]
    });

    const donHangData = todayDonHang[0]?.dataValues || { count: 0, revenue: 0 };
    const ordersData = todayOrders[0]?.dataValues || { count: 0, revenue: 0 };
    const onlineData = todayOnline[0]?.dataValues || { count: 0, revenue: 0 };

    const totalOrders = parseInt(donHangData.count) + parseInt(ordersData.count) + parseInt(onlineData.count);
    const totalRevenue = parseFloat(donHangData.revenue || 0) + 
                        parseFloat(ordersData.revenue || 0) + 
                        parseFloat(onlineData.revenue || 0);

    res.json({
      date: today.toISOString().split('T')[0],
      summary: {
        total_orders: totalOrders,
        total_revenue: totalRevenue,
        average_order_value: totalOrders > 0 ? totalRevenue / totalOrders : 0
      },
      breakdown: {
        donhang: {
          orders: parseInt(donHangData.count),
          revenue: parseFloat(donHangData.revenue || 0)
        },
        in_store: {
          orders: parseInt(ordersData.count),
          revenue: parseFloat(ordersData.revenue || 0)
        },
        online: {
          orders: parseInt(onlineData.count),
          revenue: parseFloat(onlineData.revenue || 0)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching daily revenue summary:', error);
    res.status(500).json({
      error: 'Failed to fetch daily revenue summary',
      message: error.message
    });
  }
};

module.exports = {
  getRevenueStats,
  getRevenueByPeriod,
  getTopSellingItems,
  getDailyRevenueSummary
};
