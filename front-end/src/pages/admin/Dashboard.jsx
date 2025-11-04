import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { billingAPI, healthAPI, tableAPI, reservationAPI, menuAPI, analyticsAPI, onlineOrderAPI, userAPI, inventoryAPI } from '../../shared/services/api';
import { useAuthStore } from '../../app/stores/authStore';
import { FiTrendingUp, FiUsers, FiShoppingCart, FiDollarSign, FiCoffee, FiCalendar, FiActivity, FiAlertCircle, FiGrid, FiClock, FiStar, FiShoppingBag, FiPieChart, FiBarChart2 } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const { isAuthenticated, user, isLoading } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [dataFetched, setDataFetched] = useState(false);
  
  // Analytics state - default to 'week' to show 7 days chart
  const [dateRange, setDateRange] = useState('week');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [analytics, setAnalytics] = useState({
    revenue: { total: 0, growth: 0, chart: [] },
    orders: { total: 0, growth: 0, chart: [] },
    onlineOrders: { total: 0, growth: 0 },
    products: { topSelling: [], categories: [] },
    hourlyStats: []
  });
  const [revenueChartData, setRevenueChartData] = useState([]);
  
  // Default to 'all' to get all time data
  const [defaultDateRange] = useState('all');
  
  // Dashboard stats
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    averageOrderValue: 0
  });
  const [menuStats, setMenuStats] = useState({
    totalItems: 0,
    availableItems: 0,
    unavailableItems: 0,
    totalCategories: 0,
    avgPrice: 0
  });
  const [tableStats, setTableStats] = useState({
    total: 0,
    available: 0,
    occupied: 0,
    reserved: 0
  });
  const [reservationStats, setReservationStats] = useState({
    total: 0,
    today: 0,
    pending: 0,
    confirmed: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [systemHealth, setSystemHealth] = useState({});
  const [inventoryAlerts, setInventoryAlerts] = useState({
    lowStock: [],
    expiringSoon: [],
    expired: []
  });

  // Helper functions
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

  // Fetch analytics data
  const fetchAnalytics = async () => {
    try {
      let startDateStr, endDateStr;
      
      if (dateRange === 'custom') {
        if (!customStartDate || !customEndDate) {
          toast.error('Vui lòng chọn khoảng thời gian');
          return;
        }
        startDateStr = customStartDate;
        endDateStr = customEndDate;
      } else if (dateRange === 'all') {
        // Query all time data - no date filtering
        startDateStr = null;
        endDateStr = null;
      } else {
        const now = new Date();
        const endDateObj = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
        const startDateObj = new Date(endDateObj);
        if (dateRange === 'month') startDateObj.setUTCDate(startDateObj.getUTCDate() - 29);
        else startDateObj.setUTCDate(startDateObj.getUTCDate() - 6);
        const fmt = (d) => d.toISOString().slice(0, 10);
        startDateStr = fmt(startDateObj);
        endDateStr = fmt(endDateObj);
      }
      
      const [billingRes, topRes, catRes, chartDataRes] = await Promise.all([
        billingAPI.getBillingStats({ start_date: startDateStr, end_date: endDateStr }).catch(() => null),
        analyticsAPI.getTopSelling({ startDate: startDateStr, endDate: endDateStr, limit: 5 }).catch(() => null),
        analyticsAPI.getCategoryRevenue({ startDate: startDateStr, endDate: endDateStr }).catch(() => null),
        analyticsAPI.getRevenueChartData({ start_date: startDateStr, end_date: endDateStr }).catch(() => null),
      ]);

      const billStats = billingRes?.data?.stats || billingRes?.data || {};
      const revenueTotal = billStats.total_revenue ?? billStats.revenue?.total ?? 0;
      const ordersTotal = billStats.total_orders ?? billStats.orders?.total ?? 0;

      // Top selling products
      let topSelling = [];
      const arr = topRes?.data?.data || topRes?.data || [];
      topSelling = Array.isArray(arr)
        ? arr.slice(0, 5).map((r) => ({
            name: r.TenMon || r.name || 'Sản phẩm',
            sold: Number(r.TongSoLuongBan ?? r.SoLuongBan ?? r.SoLuong ?? r.sold ?? 0),
            revenue: Number(r.TongDoanhThu ?? r.DoanhThu ?? r.revenue ?? 0),
          }))
        : [];

      // Categories
      let categories = [];
      const catArr = catRes?.data?.data || catRes?.data || [];
      if (Array.isArray(catArr) && catArr.length) {
        const totalRev = catArr.reduce((s, r) => s + Number(r.TongDoanhThu ?? r.DoanhThu ?? r.revenue ?? 0), 0) || 1;
        categories = catArr.map((r) => {
          const rev = Number(r.TongDoanhThu ?? r.DoanhThu ?? r.revenue ?? 0);
          return {
            name: r.TenLoai || r.name || 'Danh mục',
            revenue: rev,
            percentage: Math.round((rev / totalRev) * 100),
          };
        });
      }

      // Xử lý dữ liệu biểu đồ từ stored procedure
      const chartData = chartDataRes?.data?.data || [];
      const formattedChartData = chartData.map(item => ({
        date: new Date(item.date).toLocaleDateString('vi-VN'),
        inStoreRevenue: parseFloat(item.inStoreRevenue || 0),
        onlineRevenue: parseFloat(item.onlineRevenue || 0),
        totalRevenue: parseFloat(item.totalRevenue || 0),
        inStoreOrders: parseInt(item.inStoreOrders || 0),
        onlineOrders: parseInt(item.onlineOrders || 0),
        totalOrders: parseInt(item.totalOrders || 0)
      }));
      
      console.log('📊 Chart Data from Stored Procedure:', {
        dateRange,
        startDate: startDateStr,
        endDate: endDateStr,
        chartDataPoints: formattedChartData.length,
        sample: formattedChartData.slice(0, 3)
      });
      
      setRevenueChartData(formattedChartData);

      setAnalytics({
        revenue: { total: revenueTotal, growth: 0, chart: [] },
        orders: { total: ordersTotal, growth: 0, chart: [] },
        onlineOrders: { total: 0, growth: 0 },
        products: {
          topSelling: topSelling.length ? topSelling : [],
          categories: categories.length ? categories : [],
        },
        hourlyStats: []
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  // Fetch analytics khi dateRange thay đổi
  useEffect(() => {
    if (!isLoading && isAuthenticated && user?.id) {
      fetchAnalytics();
    }
  }, [dateRange, customStartDate, customEndDate]);
  
  // Initial fetch
  useEffect(() => {
    if (!isLoading && isAuthenticated && user?.id && !dataFetched) {
      fetchAnalytics();
    }
  }, [isLoading, isAuthenticated, user?.id, dataFetched]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      // Wait for auth to be ready and avoid re-fetching
      if (isLoading || dataFetched) return;
      
      if (!isAuthenticated || !user?.id) {
        setLoading(false);
        return;
      }
      try {
        console.log('🔄 Fetching dashboard data...');
        
        const today = new Date().toISOString().slice(0, 10);
        const [billingResponse, tableStatsResponse, reservationStatsResponse, menuStatsResponse, revenueResponse] = await Promise.all([
          billingAPI.getBillingStats().catch((err) => {
            console.warn('❌ Billing API error:', err.message);
            return { data: { stats: { totalRevenue: 0, totalOrders: 0, totalCustomers: 0, averageOrderValue: 0 } } };
          }),
          tableAPI.getTableStats().catch((err) => {
            console.warn('❌ Table API error:', err.message);
            return { data: { stats: { total: 0, available: 0, occupied: 0, reserved: 0 } } };
          }),
          reservationAPI.getReservationStats().catch((err) => {
            console.warn('❌ Reservation API error:', err.message);
            return { data: { stats: { total: 0, today: 0, pending: 0, confirmed: 0 } } };
          }),
          menuAPI.getDashboardStats().catch((err) => {
            console.warn('❌ Menu API error:', err.message);
            return { data: { stats: { menu: { totalItems: 0, availableItems: 0, unavailableItems: 0, totalCategories: 0, avgPrice: 0 } } } };
          }),
          analyticsAPI.getTopSelling({ startDate: today, endDate: today, limit: 10 }).catch(() => null)
        ]);

        console.log('📊 API Responses:');
        console.log('- Billing:', billingResponse.data);
        console.log('- Table:', tableStatsResponse.data);
        console.log('- Reservation:', reservationStatsResponse.data);
        console.log('- Menu:', menuStatsResponse.data);
        
        // Test direct API call to confirm
        console.log('🧪 Testing direct menu API call...');
        try {
          const directTest = await fetch('http://localhost:3000/api/menu/stats/dashboard');
          const directData = await directTest.json();
          console.log('🎯 Direct API result:', directData);
        } catch (err) {
          console.log('❌ Direct API failed:', err.message);
        }

        // Always use real data from APIs - no fallback to mock data
        console.log('🔍 Processing API responses...');
        
        // Billing/Sales stats - use real data from analytics API or billing service
        const realStats = billingResponse.data?.stats || billingResponse.data;
        const todayData = revenueResponse?.data?.data || [];
        const todayRevenue = Array.isArray(todayData) ? todayData.reduce((sum, item) => sum + Number(item.TongDoanhThu || item.DoanhThu || 0), 0) : 0;
        const todayOrders = Array.isArray(todayData) ? todayData.reduce((sum, item) => sum + Number(item.SoDonHang || 0), 0) : 0;
        
        setStats({
          totalRevenue: todayRevenue || realStats?.totalRevenue || 0,
          totalOrders: todayOrders || realStats?.totalOrders || 0,
          totalCustomers: realStats?.totalCustomers || 0,
          averageOrderValue: todayOrders > 0 ? Math.round(todayRevenue / todayOrders) : (realStats?.averageOrderValue || 0)
        });
        console.log('💰 Sales stats set:', {
          totalRevenue: todayRevenue,
          totalOrders: todayOrders
        });

        // Table stats - parse from status_breakdown
        const realTableStats = tableStatsResponse.data?.stats;
        const statusBreakdown = realTableStats?.status_breakdown || [];
        const getStatusCount = (status) => {
          const item = statusBreakdown.find(s => s.status === status);
          return item ? item.count : 0;
        };
        setTableStats({
          total: realTableStats?.total_tables || 0,
          available: getStatusCount('Trống'),
          occupied: getStatusCount('Đang phục vụ'),
          reserved: getStatusCount('Đã đặt')
        });
        console.log('🪑 Table stats set:', {
          total: realTableStats?.total_tables,
          breakdown: statusBreakdown
        });

        // Reservation stats - fallback to direct count since API may not exist
        let reservationStatsData = {
          total: 0,
          today: 0,
          pending: 0,
          confirmed: 0
        };
        
        try {
          const reservationsResp = await reservationAPI.getReservations().catch(() => null);
          const reservations = reservationsResp?.data?.reservations || reservationsResp?.data || [];
          if (Array.isArray(reservations) && reservations.length > 0) {
            const todayStr = new Date().toISOString().slice(0, 10);
            const todayReservations = reservations.filter(r => {
              const resDate = r.NgayDat ? new Date(r.NgayDat).toISOString().slice(0, 10) : null;
              return resDate === todayStr;
            });
            reservationStatsData = {
              total: reservations.length,
              today: todayReservations.length,
              pending: todayReservations.filter(r => r.TrangThai === 'Đã đặt').length,
              confirmed: todayReservations.filter(r => r.TrangThai === 'Hoàn thành').length
            };
            console.log('📅 Reservation stats from direct count:', reservationStatsData);
          }
        } catch (err) {
          console.warn('Reservation count failed:', err);
        }
        
        setReservationStats(reservationStatsData);
        console.log('📅 Reservation stats set:', reservationStatsData);

        // Menu stats - always use real data from API
        const realMenuStats = menuStatsResponse.data?.stats?.menu || menuStatsResponse.data?.menu;
        setMenuStats({
          totalItems: realMenuStats?.totalItems || 0,
          availableItems: realMenuStats?.availableItems || 0,
          unavailableItems: realMenuStats?.unavailableItems || 0,
          totalCategories: realMenuStats?.totalCategories || 0,
          avgPrice: realMenuStats?.avgPrice || 0
        });
        console.log('🍽️ Menu stats set:', realMenuStats);

        // setSystemHealth(healthResponse.data || {});
        
        // Fetch inventory alerts
        try {
          const alertsResponse = await inventoryAPI.getAlerts();
          if (alertsResponse.data) {
            setInventoryAlerts({
              lowStock: alertsResponse.data.lowStock || [],
              expiringSoon: alertsResponse.data.expiringSoon || [],
              expired: alertsResponse.data.expired || []
            });
          }
        } catch (err) {
          console.warn('Failed to fetch inventory alerts:', err);
        }
        
        // Mock recent orders
        setRecentOrders([
          { id: 1, customer: 'Nguyễn Văn A', total: 125000, status: 'completed', time: '10:30' },
          { id: 2, customer: 'Trần Thị B', total: 89000, status: 'pending', time: '10:15' },
          { id: 3, customer: 'Lê Văn C', total: 234000, status: 'completed', time: '09:45' },
          { id: 4, customer: 'Phạm Thị D', total: 156000, status: 'processing', time: '09:30' },
          { id: 5, customer: 'Hoàng Văn E', total: 78000, status: 'completed', time: '09:15' }
        ]);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
        setDataFetched(true);
      }
    };

    fetchDashboardData();
  }, [isLoading, isAuthenticated, user?.id]); // Wait for auth state to be ready

  const statCards = [
    {
      title: 'Doanh thu hôm nay',
      value: (stats?.totalRevenue ? stats.totalRevenue.toLocaleString('vi-VN') + 'đ' : '0đ'),
      icon: FiDollarSign,
      color: 'bg-green-500',
      change: '+12.5%'
    },
    {
      title: 'Đơn hàng',
      value: (stats?.totalOrders ? stats.totalOrders.toString() : '0'),
      icon: FiShoppingCart,
      color: 'bg-blue-500',
      change: '+8.2%'
    },
    {
      title: 'Khách hàng',
      value: (stats?.totalCustomers ? stats.totalCustomers.toString() : '0'),
      icon: FiUsers,
      color: 'bg-purple-500',
      change: '+15.3%'
    },
    {
      title: 'Giá trị TB/đơn',
      value: (stats?.averageOrderValue ? stats.averageOrderValue.toLocaleString('vi-VN') + 'đ' : '0đ'),
      icon: FiTrendingUp,
      color: 'bg-amber-500',
      change: '+5.7%'
    }
  ];

  const tableStatCards = [
    {
      title: 'Tổng số bàn',
      value: (tableStats?.total || 0).toString(),
      icon: FiGrid,
      color: 'bg-indigo-500'
    },
    {
      title: 'Bàn trống',
      value: (tableStats?.available || 0).toString(),
      icon: FiGrid,
      color: 'bg-green-500'
    },
    {
      title: 'Bàn đã đặt',
      value: (tableStats?.reserved || 0).toString(),
      icon: FiGrid,
      color: 'bg-yellow-500'
    },
    {
      title: 'Đang phục vụ',
      value: (tableStats?.occupied || 0).toString(),
      icon: FiGrid,
      color: 'bg-red-500'
    }
  ];

  const reservationStatCards = [
    {
      title: 'Đặt bàn hôm nay',
      value: (reservationStats?.today || 0).toString(),
      icon: FiCalendar,
      color: 'bg-blue-500'
    },
    {
      title: 'Đã đặt',
      value: (reservationStats?.pending || 0).toString(),
      icon: FiClock,
      color: 'bg-yellow-500'
    },
    {
      title: 'Hoàn thành',
      value: (reservationStats?.confirmed || 0).toString(),
      icon: FiCalendar,
      color: 'bg-green-500'
    },
    {
      title: 'Tổng đặt bàn',
      value: (reservationStats?.total || 0).toString(),
      icon: FiCalendar,
      color: 'bg-purple-500'
    }
  ];

  const menuStatCards = [
    {
      title: 'Tổng số món',
      value: (menuStats?.totalItems || 0).toString(),
      icon: FiCoffee,
      color: 'bg-purple-500'
    },
    
    {
      title: 'Danh mục',
      value: (menuStats?.totalCategories || 0).toString(),
      icon: FiGrid,
      color: 'bg-blue-500'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Hoàn thành';
      case 'pending': return 'Chờ xử lý';
      case 'processing': return 'Đang xử lý';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow-sm animate-pulse">
              <div className="bg-gray-300 h-4 rounded mb-4"></div>
              <div className="bg-gray-300 h-8 rounded mb-2"></div>
              <div className="bg-gray-300 h-3 rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Chào mừng trở lại!</h1>
        <p className="opacity-90">Đây là tổng quan hoạt động của Coffee Shop hôm nay</p>
      </div>

      

      {/* Table & Reservation Stats - 2 columns layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Table Stats Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-indigo-100 rounded-lg mr-3">
              <FiGrid className="w-5 h-5 text-indigo-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Tình trạng bàn</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {tableStatCards.map((card, index) => (
              <div key={index} className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className={`p-2 rounded-lg ${card.color} mr-3`}>
                  <card.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">{card.title}</p>
                  <p className="text-xl font-bold text-gray-900">{card.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reservation Stats Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-blue-100 rounded-lg mr-3">
              <FiCalendar className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Thống kê đặt bàn</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {reservationStatCards.map((card, index) => (
              <div key={index} className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className={`p-2 rounded-lg ${card.color} mr-3`}>
                  <card.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">{card.title}</p>
                  <p className="text-xl font-bold text-gray-900">{card.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      
      

        

      

      {/* Inventory Alerts - Cảnh báo kho */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Cảnh báo kho</h2>
          {(inventoryAlerts.lowStock.length + inventoryAlerts.expired.length + inventoryAlerts.expiringSoon.length) > 0 && (
            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
              {inventoryAlerts.lowStock.length + inventoryAlerts.expired.length + inventoryAlerts.expiringSoon.length} cảnh báo
            </span>
          )}
        </div>
        <div className="space-y-3">
          {/* Nguyên liệu hết hạn */}
          {inventoryAlerts.expired.map((item, index) => (
            <div key={`expired-${index}`} className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg border border-red-200">
              <FiAlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">Đã hết hạn: {item.TenNL}</p>
                <p className="text-sm text-red-700">
                  Hết hạn: {new Date(item.NgayHetHan).toLocaleDateString('vi-VN')} | Còn {item.SoLuong} {item.DonVi}
                </p>
              </div>
            </div>
          ))}
          
          {/* Nguyên liệu gần hết hạn */}
          {inventoryAlerts.expiringSoon.map((item, index) => (
            <div key={`expiring-${index}`} className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
              <FiClock className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-orange-800">Gần hết hạn: {item.TenNL}</p>
                <p className="text-sm text-orange-700">
                  Hết hạn: {new Date(item.NgayHetHan).toLocaleDateString('vi-VN')} | Còn {item.SoLuong} {item.DonVi}
                </p>
              </div>
            </div>
          ))}
          
          {/* Nguyên liệu sắp hết/hết hàng */}
          {inventoryAlerts.lowStock.map((item, index) => (
            <div key={`low-${index}`} className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <FiAlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-800">
                  {item.TrangThai === 'Hết hàng' ? 'Hết hàng' : 'Sắp hết'}: {item.TenNL}
                </p>
                <p className="text-sm text-yellow-700">
                  Còn {item.SoLuong} {item.DonVi} | Mức cảnh báo: {item.MucCanhBao} {item.DonVi}
                </p>
              </div>
            </div>
          ))}
          
          {/* Không có cảnh báo */}
          {inventoryAlerts.lowStock.length === 0 && 
           inventoryAlerts.expiringSoon.length === 0 && 
           inventoryAlerts.expired.length === 0 && (
            <div className="flex items-center justify-center py-8 text-gray-500">
              <div className="text-center">
                <FiShoppingBag className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Không có cảnh báo kho</p>
                <p className="text-xs mt-1">Tất cả nguyên liệu đều ở trạng thái tốt</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Analytics Section */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg p-6 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold mb-2">Phân tích & Báo cáo</h2>
            <p className="opacity-90">Theo dõi hiệu suất kinh doanh và xu hướng bán hàng</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border border-white/30 bg-white/20 text-white rounded-lg focus:ring-2 focus:ring-white/50 focus:border-transparent backdrop-blur-sm"
            >
              <option value="all" className="text-gray-900">Tất cả thời gian</option>
              <option value="week" className="text-gray-900">7 ngày qua</option>
              <option value="month" className="text-gray-900">30 ngày qua</option>
              <option value="custom" className="text-gray-900">Tùy chỉnh</option>
            </select>
            {dateRange === 'custom' && (
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="px-3 py-2 border border-white/30 bg-white/20 text-white rounded-lg focus:ring-2 focus:ring-white/50 focus:border-transparent backdrop-blur-sm"
                  placeholder="Từ ngày"
                />
                <span className="text-white/70">-</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="px-3 py-2 border border-white/30 bg-white/20 text-white rounded-lg focus:ring-2 focus:ring-white/50 focus:border-transparent backdrop-blur-sm"
                  placeholder="Đến ngày"
                />
                <button
                  onClick={fetchAnalytics}
                  className="px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-white/90 transition-colors font-medium"
                >
                  Áp dụng
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Revenue Chart - Full Width */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <FiTrendingUp className="w-5 h-5 mr-2 text-green-600" />
              Biểu đồ doanh thu theo thời gian
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {dateRange === 'all' && 'Tất cả thời gian'}
              {dateRange === 'week' && '7 ngày qua'}
              {dateRange === 'month' && '30 ngày qua'}
              {dateRange === 'custom' && customStartDate && customEndDate && 
                `Từ ${new Date(customStartDate).toLocaleDateString('vi-VN')} - ${new Date(customEndDate).toLocaleDateString('vi-VN')}`
              }
            </p>
          </div>
          {revenueChartData.length > 0 && (
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">
                {new Intl.NumberFormat('vi-VN').format(
                  revenueChartData.reduce((sum, item) => sum + item.totalRevenue, 0)
                )}đ
              </p>
              <p className="text-xs text-gray-500">Tổng doanh thu</p>
            </div>
          )}
        </div>
        {revenueChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={revenueChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }} 
                stroke="#6b7280"
              />
              <YAxis 
                tick={{ fontSize: 12 }} 
                stroke="#6b7280"
                tickFormatter={(value) => new Intl.NumberFormat('vi-VN', { notation: 'compact' }).format(value)}
              />
              <Tooltip 
                formatter={(value) => new Intl.NumberFormat('vi-VN').format(value) + 'đ'}
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
              />
              <Line 
                type="monotone" 
                dataKey="inStoreRevenue" 
                stroke="#3b82f6" 
                name="Doanh thu tại chỗ" 
                strokeWidth={2}
                dot={{ fill: '#3b82f6', r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="onlineRevenue" 
                stroke="#f59e0b" 
                name="Doanh thu online" 
                strokeWidth={2}
                dot={{ fill: '#f59e0b', r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="totalRevenue" 
                stroke="#10b981" 
                name="Tổng doanh thu" 
                strokeWidth={3}
                dot={{ fill: '#10b981', r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[350px] text-gray-500">
            <div className="text-center">
              <FiBarChart2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Chưa có dữ liệu</p>
              <p className="text-xs mt-1">Chọn khoảng thời gian để xem biểu đồ</p>
            </div>
          </div>
        )}
      </div>

      {/* Product Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Products */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FiStar className="w-5 h-5 mr-2 text-amber-500" />
            Sản phẩm bán chạy
          </h3>
          {analytics.products.topSelling.length > 0 ? (
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
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FiBarChart2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Chưa có dữ liệu</p>
            </div>
          )}
        </div>

        {/* Category Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FiPieChart className="w-5 h-5 mr-2 text-indigo-600" />
            Phân bố theo danh mục
          </h3>
          {analytics.products.categories.length > 0 ? (
            <div className="space-y-4">
              {analytics.products.categories.map((category, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-900">{category.name}</span>
                    <span className="text-sm text-gray-600">{category.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${category.percentage}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatCurrency(category.revenue)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FiPieChart className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Chưa có dữ liệu</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
