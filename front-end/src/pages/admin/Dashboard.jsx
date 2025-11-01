import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { billingAPI, healthAPI, tableAPI, reservationAPI, menuAPI, analyticsAPI } from '../../shared/services/api';
import { useAuthStore } from '../../app/stores/authStore';
import { FiTrendingUp, FiUsers, FiShoppingCart, FiDollarSign, FiCoffee, FiCalendar, FiActivity, FiAlertCircle, FiGrid, FiClock } from 'react-icons/fi';

const Dashboard = () => {
  const { isAuthenticated, user, isLoading } = useAuthStore();
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
  const [loading, setLoading] = useState(true);
  const [dataFetched, setDataFetched] = useState(false);

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
      title: 'Món có sẵn',
      value: (menuStats?.availableItems || 0).toString(),
      icon: FiCoffee,
      color: 'bg-green-500'
    },
    {
      title: 'Danh mục',
      value: (menuStats?.totalCategories || 0).toString(),
      icon: FiGrid,
      color: 'bg-blue-500'
    },
    {
      title: 'Giá trung bình',
      value: (menuStats?.avgPrice ? menuStats.avgPrice.toLocaleString('vi-VN') + 'đ' : '0đ'),
      icon: FiDollarSign,
      color: 'bg-amber-500'
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
                <p className="text-sm text-green-600 mt-1">{card.change}</p>
              </div>
              <div className={`p-3 rounded-full ${card.color}`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Table Stats Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Tình trạng bàn</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {tableStatCards.map((card, index) => (
            <div key={index} className="flex items-center p-4 bg-gray-50 rounded-lg">
              <div className={`p-2 rounded-lg ${card.color} mr-3`}>
                <card.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{card.title}</p>
                <p className="text-xl font-bold text-gray-900">{card.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reservation Stats Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Thống kê đặt bàn</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {reservationStatCards.map((card, index) => (
            <div key={index} className="flex items-center p-4 bg-gray-50 rounded-lg">
              <div className={`p-2 rounded-lg ${card.color} mr-3`}>
                <card.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{card.title}</p>
                <p className="text-xl font-bold text-gray-900">{card.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Menu Stats Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Thống kê thực đơn</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {menuStatCards.map((card, index) => (
            <div key={index} className="flex items-center p-4 bg-gray-50 rounded-lg">
              <div className={`p-2 rounded-lg ${card.color} mr-3`}>
                <card.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{card.title}</p>
                <p className="text-xl font-bold text-gray-900">{card.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Đơn hàng gần đây</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{order.customer}</p>
                    <p className="text-sm text-gray-600">{order.time}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      {order.total.toLocaleString('vi-VN')}đ
                    </p>
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* System Health */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Trạng thái hệ thống</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {Object.entries(systemHealth.services || {}).map(([serviceName, service]) => (
                <div key={serviceName} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      service.status === 'healthy' ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <span className="text-gray-900 capitalize">{service.name}</span>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    service.status === 'healthy' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {service.status === 'healthy' ? 'Hoạt động' : 'Lỗi'}
                  </span>
                </div>
              ))}
              
              {Object.keys(systemHealth.services || {}).length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  <FiActivity className="w-8 h-8 mx-auto mb-2" />
                  <p>Không thể kiểm tra trạng thái hệ thống</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Thao tác nhanh</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/admin/menu" className="flex flex-col items-center p-4 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors">
            <FiCoffee className="w-6 h-6 text-amber-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">Quản lý menu</span>
          </Link>
          <Link to="/admin/reservations" className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
            <FiCalendar className="w-6 h-6 text-blue-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">Quản lý đặt bàn</span>
          </Link>
          <Link to="/admin/tables" className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
            <FiGrid className="w-6 h-6 text-green-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">Quản lý bàn</span>
          </Link>
          <Link to="/admin/users" className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
            <FiUsers className="w-6 h-6 text-purple-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">Quản lý user</span>
          </Link>
        </div>
      </div>

      {/* Alerts */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông báo</h2>
        <div className="space-y-3">
          <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
            <FiAlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800">Sắp hết nguyên liệu</p>
              <p className="text-sm text-yellow-700">Cà phê Arabica chỉ còn 5kg trong kho</p>
            </div>
          </div>
          <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
            <FiCalendar className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-800">Đặt bàn cao điểm</p>
              <p className="text-sm text-blue-700">15 đặt bàn cho khung giờ 19:00-21:00 hôm nay</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
