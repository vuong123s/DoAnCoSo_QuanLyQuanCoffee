import React, { useState, useEffect } from 'react';
import { billingAPI, menuAPI, userAPI } from '../../shared/services/api';
import { FiTrendingUp, FiDollarSign, FiUsers, FiShoppingBag, FiCalendar, FiCoffee, FiStar, FiClock } from 'react-icons/fi';

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('week');
  const [analytics, setAnalytics] = useState({
    revenue: {
      total: 0,
      growth: 0,
      chart: []
    },
    orders: {
      total: 0,
      growth: 0,
      chart: []
    },
    customers: {
      total: 0,
      new: 0,
      returning: 0
    },
    products: {
      topSelling: [],
      categories: []
    },
    hourlyStats: []
  });

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Simulate API calls - replace with actual API endpoints
      const [revenueData, ordersData, customersData, productsData] = await Promise.all([
        billingAPI.getBillingStats(),
        billingAPI.getBillingStats(),
        userAPI.getUsers(),
        menuAPI.getMenuItems()
      ]);

      setAnalytics({
        revenue: {
          total: 15750000,
          growth: 12.5,
          chart: [
            { date: '2024-01-01', value: 2500000 },
            { date: '2024-01-02', value: 2800000 },
            { date: '2024-01-03', value: 2200000 },
            { date: '2024-01-04', value: 3100000 },
            { date: '2024-01-05', value: 2900000 },
            { date: '2024-01-06', value: 3200000 },
            { date: '2024-01-07', value: 2950000 }
          ]
        },
        orders: {
          total: 1247,
          growth: 8.3,
          chart: [
            { date: '2024-01-01', value: 180 },
            { date: '2024-01-02', value: 195 },
            { date: '2024-01-03', value: 165 },
            { date: '2024-01-04', value: 210 },
            { date: '2024-01-05', value: 185 },
            { date: '2024-01-06', value: 220 },
            { date: '2024-01-07', value: 192 }
          ]
        },
        customers: {
          total: 3420,
          new: 234,
          returning: 892
        },
        products: {
          topSelling: [
            { name: 'Cà phê đen đá', sold: 456, revenue: 4560000 },
            { name: 'Cappuccino', sold: 389, revenue: 5835000 },
            { name: 'Bánh croissant', sold: 234, revenue: 2340000 },
            { name: 'Trà sữa trân châu', sold: 198, revenue: 3960000 },
            { name: 'Bánh tiramisu', sold: 156, revenue: 2340000 }
          ],
          categories: [
            { name: 'Cà phê', percentage: 45, revenue: 7087500 },
            { name: 'Trà', percentage: 25, revenue: 3937500 },
            { name: 'Bánh ngọt', percentage: 20, revenue: 3150000 },
            { name: 'Đồ uống khác', percentage: 10, revenue: 1575000 }
          ]
        },
        hourlyStats: [
          { hour: '6:00', orders: 12, revenue: 180000 },
          { hour: '7:00', orders: 28, revenue: 420000 },
          { hour: '8:00', orders: 45, revenue: 675000 },
          { hour: '9:00', orders: 38, revenue: 570000 },
          { hour: '10:00', orders: 32, revenue: 480000 },
          { hour: '11:00', orders: 29, revenue: 435000 },
          { hour: '12:00', orders: 52, revenue: 780000 },
          { hour: '13:00', orders: 48, revenue: 720000 },
          { hour: '14:00', orders: 35, revenue: 525000 },
          { hour: '15:00', orders: 41, revenue: 615000 },
          { hour: '16:00', orders: 38, revenue: 570000 },
          { hour: '17:00', orders: 44, revenue: 660000 },
          { hour: '18:00', orders: 39, revenue: 585000 },
          { hour: '19:00', orders: 33, revenue: 495000 },
          { hour: '20:00', orders: 25, revenue: 375000 },
          { hour: '21:00', orders: 18, revenue: 270000 }
        ]
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getGrowthColor = (growth) => {
    return growth >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getGrowthIcon = (growth) => {
    return growth >= 0 ? '↗' : '↘';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm animate-pulse">
          <div className="bg-gray-300 h-8 w-48 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-300 h-24 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Phân tích & Báo cáo</h1>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
        >
          <option value="today">Hôm nay</option>
          <option value="week">7 ngày qua</option>
          <option value="month">30 ngày qua</option>
          <option value="quarter">3 tháng qua</option>
          <option value="year">1 năm qua</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng doanh thu</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(analytics.revenue.total)}
              </p>
              <p className={`text-sm ${getGrowthColor(analytics.revenue.growth)}`}>
                {getGrowthIcon(analytics.revenue.growth)} {Math.abs(analytics.revenue.growth)}% so với kỳ trước
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <FiDollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng đơn hàng</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.orders.total}</p>
              <p className={`text-sm ${getGrowthColor(analytics.orders.growth)}`}>
                {getGrowthIcon(analytics.orders.growth)} {Math.abs(analytics.orders.growth)}% so với kỳ trước
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <FiShoppingBag className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Khách hàng</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.customers.total}</p>
              <p className="text-sm text-gray-600">
                {analytics.customers.new} mới, {analytics.customers.returning} quay lại
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <FiUsers className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Doanh thu theo ngày</h3>
          <div className="h-64 flex items-end space-x-2">
            {analytics.revenue.chart.map((item, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-green-500 rounded-t"
                  style={{
                    height: `${(item.value / Math.max(...analytics.revenue.chart.map(d => d.value))) * 200}px`
                  }}
                ></div>
                <span className="text-xs text-gray-600 mt-2">
                  {new Date(item.date).toLocaleDateString('vi-VN', { weekday: 'short' })}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Orders Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Đơn hàng theo ngày</h3>
          <div className="h-64 flex items-end space-x-2">
            {analytics.orders.chart.map((item, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-blue-500 rounded-t"
                  style={{
                    height: `${(item.value / Math.max(...analytics.orders.chart.map(d => d.value))) * 200}px`
                  }}
                ></div>
                <span className="text-xs text-gray-600 mt-2">
                  {new Date(item.date).toLocaleDateString('vi-VN', { weekday: 'short' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Product Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Products */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FiStar className="w-5 h-5 mr-2 text-amber-500" />
            Sản phẩm bán chạy
          </h3>
          <div className="space-y-4">
            {analytics.products.topSelling.map((product, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="flex items-center justify-center w-8 h-8 bg-amber-100 text-amber-600 rounded-full text-sm font-medium">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.sold} đã bán</p>
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {formatCurrency(product.revenue)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FiCoffee className="w-5 h-5 mr-2 text-amber-600" />
            Phân bố theo danh mục
          </h3>
          <div className="space-y-4">
            {analytics.products.categories.map((category, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-900">{category.name}</span>
                  <span className="text-sm text-gray-600">{category.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-amber-500 h-2 rounded-full"
                    style={{ width: `${category.percentage}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500">
                  {formatCurrency(category.revenue)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hourly Stats */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <FiClock className="w-5 h-5 mr-2 text-blue-500" />
          Thống kê theo giờ
        </h3>
        <div className="overflow-x-auto">
          <div className="flex space-x-2 pb-4">
            {analytics.hourlyStats.map((stat, index) => (
              <div key={index} className="flex-shrink-0 w-16 text-center">
                <div className="space-y-2">
                  <div
                    className="w-full bg-blue-500 rounded-t"
                    style={{
                      height: `${(stat.orders / Math.max(...analytics.hourlyStats.map(s => s.orders))) * 100}px`
                    }}
                  ></div>
                  <div className="text-xs space-y-1">
                    <div className="font-medium text-gray-900">{stat.orders}</div>
                    <div className="text-gray-600">{stat.hour}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          <p>Số đơn hàng theo từng giờ trong ngày</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-green-400 to-green-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Doanh thu trung bình/ngày</p>
              <p className="text-2xl font-bold">
                {formatCurrency(analytics.revenue.total / 7)}
              </p>
            </div>
            <FiTrendingUp className="w-8 h-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-400 to-blue-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Đơn hàng trung bình/ngày</p>
              <p className="text-2xl font-bold">{Math.round(analytics.orders.total / 7)}</p>
            </div>
            <FiShoppingBag className="w-8 h-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-400 to-purple-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Giá trị đơn hàng TB</p>
              <p className="text-2xl font-bold">
                {formatCurrency(analytics.revenue.total / analytics.orders.total)}
              </p>
            </div>
            <FiDollarSign className="w-8 h-8 text-purple-200" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
