import React, { useState, useEffect } from 'react';
import { 
  FiTrendingUp, 
  FiHeart, 
  FiUsers, 
  FiClock,
  FiStar,
  FiThumbsUp,
  FiCoffee,
  FiPieChart,
  FiBarChart3
} from 'react-icons/fi';

const CartInsights = ({ 
  cartItems = [], 
  cartTotal = 0,
  customerData = null,
  className = '' 
}) => {
  const [insights, setInsights] = useState([]);
  const [stats, setStats] = useState({});

  useEffect(() => {
    generateInsights();
    calculateStats();
  }, [cartItems, cartTotal]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const generateInsights = () => {
    const newInsights = [];

    // Popular items insight
    if (cartItems.length > 0) {
      const popularItems = cartItems.filter(item => 
        ['Cà phê đen', 'Cappuccino', 'Latte'].includes(item.TenMon)
      );
      
      if (popularItems.length > 0) {
        newInsights.push({
          id: 'popular',
          type: 'positive',
          icon: FiTrendingUp,
          title: 'Lựa chọn phổ biến',
          message: `Bạn đã chọn ${popularItems.length} món được yêu thích nhất`,
          color: 'green'
        });
      }
    }

    // High value order
    if (cartTotal > 300000) {
      newInsights.push({
        id: 'high-value',
        type: 'positive',
        icon: FiStar,
        title: 'Đơn hàng cao cấp',
        message: 'Bạn sẽ nhận được điểm thưởng VIP',
        color: 'purple'
      });
    }

    // Combo suggestion
    const hasCoffee = cartItems.some(item => 
      item.TenMon.toLowerCase().includes('cà phê') || 
      item.TenMon.toLowerCase().includes('coffee')
    );
    const hasDessert = cartItems.some(item => 
      item.TenMon.toLowerCase().includes('bánh') || 
      item.TenMon.toLowerCase().includes('cake')
    );

    if (hasCoffee && !hasDessert) {
      newInsights.push({
        id: 'combo',
        type: 'suggestion',
        icon: FiHeart,
        title: 'Combo hoàn hảo',
        message: 'Thêm bánh ngọt để có trải nghiệm tuyệt vời hơn',
        color: 'pink'
      });
    }

    // Rush hour warning
    const now = new Date();
    const hour = now.getHours();
    if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
      newInsights.push({
        id: 'rush-hour',
        type: 'warning',
        icon: FiClock,
        title: 'Giờ cao điểm',
        message: 'Thời gian chuẩn bị có thể lâu hơn 5-10 phút',
        color: 'orange'
      });
    }

    setInsights(newInsights.slice(0, 3)); // Show max 3 insights
  };

  const calculateStats = () => {
    if (cartItems.length === 0) {
      setStats({});
      return;
    }

    const totalItems = cartItems.reduce((sum, item) => sum + item.SoLuong, 0);
    const avgPrice = cartTotal / totalItems;
    const mostExpensive = Math.max(...cartItems.map(item => item.DonGia));
    const categories = [...new Set(cartItems.map(item => item.LoaiMon || 'Đồ uống'))];

    // Calculate savings (mock data)
    const originalTotal = cartTotal * 1.15; // Assume 15% discount
    const savings = originalTotal - cartTotal;

    setStats({
      totalItems,
      avgPrice,
      mostExpensive,
      categories: categories.length,
      savings
    });
  };

  const getInsightColor = (color) => {
    const colors = {
      green: 'bg-green-50 border-green-200 text-green-700',
      purple: 'bg-purple-50 border-purple-200 text-purple-700',
      pink: 'bg-pink-50 border-pink-200 text-pink-700',
      orange: 'bg-orange-50 border-orange-200 text-orange-700',
      blue: 'bg-blue-50 border-blue-200 text-blue-700'
    };
    return colors[color] || colors.blue;
  };

  const getInsightIcon = (color) => {
    const colors = {
      green: 'text-green-500',
      purple: 'text-purple-500',
      pink: 'text-pink-500',
      orange: 'text-orange-500',
      blue: 'text-blue-500'
    };
    return colors[color] || colors.blue;
  };

  if (cartItems.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Insights */}
      {insights.length > 0 && (
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <FiBarChart3 className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-gray-800">Thông tin thú vị</h3>
          </div>
          
          <div className="space-y-3">
            {insights.map((insight) => {
              const IconComponent = insight.icon;
              const colorClasses = getInsightColor(insight.color);
              const iconColor = getInsightIcon(insight.color);
              
              return (
                <div
                  key={insight.id}
                  className={`p-4 rounded-xl border ${colorClasses} transition-all hover:shadow-sm`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg bg-white ${iconColor}`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">
                        {insight.title}
                      </h4>
                      <p className="text-sm opacity-80">
                        {insight.message}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <FiPieChart className="w-5 h-5 text-purple-600" />
          <h3 className="font-bold text-gray-800">Thống kê đơn hàng</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          {/* Total Items */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <FiCoffee className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Tổng món</span>
            </div>
            <p className="text-2xl font-bold text-blue-700">{stats.totalItems}</p>
          </div>

          {/* Average Price */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <FiTrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">Giá TB</span>
            </div>
            <p className="text-lg font-bold text-green-700">
              {formatCurrency(stats.avgPrice || 0)}
            </p>
          </div>

          {/* Categories */}
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <FiPieChart className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-800">Danh mục</span>
            </div>
            <p className="text-2xl font-bold text-purple-700">{stats.categories}</p>
          </div>

          {/* Savings */}
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <FiThumbsUp className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-800">Tiết kiệm</span>
            </div>
            <p className="text-lg font-bold text-orange-700">
              {formatCurrency(stats.savings || 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Customer Insights */}
      {customerData && (
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <FiUsers className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-gray-800">Dành riêng cho bạn</h3>
          </div>
          
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-indigo-500 p-2 rounded-full">
                <FiHeart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-medium text-indigo-900 mb-1">
                  Chào {customerData.name || 'bạn'}!
                </h4>
                <p className="text-sm text-indigo-700">
                  Đây là đơn hàng thứ {customerData.orderCount || 1} của bạn. 
                  Cảm ơn bạn đã tin tưởng!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Environmental Impact */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
        <div className="flex items-center space-x-2 mb-3">
          <div className="bg-green-500 p-2 rounded-full">
            <span className="text-white text-xs font-bold">🌱</span>
          </div>
          <h4 className="font-medium text-green-800">Tác động môi trường</h4>
        </div>
        <p className="text-sm text-green-700 mb-2">
          Đơn hàng của bạn sử dụng {cartItems.length} ly/hộp có thể tái chế
        </p>
        <div className="flex items-center space-x-4 text-xs text-green-600">
          <span>♻️ 100% có thể tái chế</span>
          <span>🌿 Giảm 15% carbon footprint</span>
        </div>
      </div>
    </div>
  );
};

export default CartInsights;
