import React, { useState, useEffect } from 'react';
import { FiDollarSign, FiShoppingCart, FiClock, FiTrendingUp } from 'react-icons/fi';
import { billingAPI } from '../shared/services/api';

const SalesStats = () => {
  const [stats, setStats] = useState({
    todayRevenue: 0,
    todayOrders: 0,
    activeOrders: 0,
    averageOrderValue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await billingAPI.getBills();
      const orders = response.data.donhangs || response.data.bills || response.data || [];
      
      const today = new Date().toISOString().split('T')[0];
      
      // Calculate today's orders
      const todayOrders = orders.filter(order => {
        const orderDate = new Date(order.NgayLap || order.createdAt).toISOString().split('T')[0];
        return orderDate === today;
      });
      
      // Calculate active orders
      const activeOrders = orders.filter(order => 
        order.TrangThai === 'Đang xử lý' || order.status === 'Đang xử lý'
      );
      
      // Calculate revenue
      const todayRevenue = todayOrders.reduce((sum, order) => 
        sum + (order.TongTien || order.total || 0), 0
      );
      
      // Calculate average order value
      const averageOrderValue = todayOrders.length > 0 ? todayRevenue / todayOrders.length : 0;
      
      setStats({
        todayRevenue,
        todayOrders: todayOrders.length,
        activeOrders: activeOrders.length,
        averageOrderValue
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Doanh thu hôm nay',
      value: stats.todayRevenue.toLocaleString('vi-VN') + ' đ',
      icon: FiDollarSign,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      title: 'Đơn hàng hôm nay',
      value: stats.todayOrders.toString(),
      icon: FiShoppingCart,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      title: 'Đơn hàng đang xử lý',
      value: stats.activeOrders.toString(),
      icon: FiClock,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600'
    },
    {
      title: 'Giá trị trung bình',
      value: stats.averageOrderValue.toLocaleString('vi-VN') + ' đ',
      icon: FiTrendingUp,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white rounded-lg shadow-sm border p-4 animate-pulse">
            <div className="flex items-center justify-between">
              <div>
                <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statCards.map((stat, index) => (
        <div key={index} className={`${stat.bgColor} rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
              <p className={`text-2xl font-bold ${stat.textColor}`}>{stat.value}</p>
            </div>
            <div className={`${stat.color} p-3 rounded-lg`}>
              <stat.icon className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SalesStats;
