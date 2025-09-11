import { 
  FiDollarSign, 
  FiShoppingCart, 
  FiCoffee, 
  FiUsers,
  FiTrendingUp,
  FiTrendingDown,
  FiClock,
  FiCheckCircle
} from "react-icons/fi";

function Dashboard() {
  // Mock data - trong thực tế sẽ fetch từ API
  const stats = [
    {
      title: "Doanh thu hôm nay",
      value: "1,250,000",
      unit: "VNĐ",
      change: "+8.5%",
      trend: "up",
      icon: FiDollarSign,
      color: "green"
    },
    {
      title: "Đơn hàng",
      value: "32",
      unit: "đơn",
      change: "+5.2%",
      trend: "up",
      icon: FiShoppingCart,
      color: "blue"
    },
    {
      title: "Cà phê bán",
      value: "89",
      unit: "ly",
      change: "+12.1%",
      trend: "up",
      icon: FiCoffee,
      color: "amber"
    },
    {
      title: "Khách hàng",
      value: "28",
      unit: "người",
      change: "+3.3%",
      trend: "up",
      icon: FiUsers,
      color: "purple"
    }
  ];

  const recentOrders = [
    { id: "#001", customer: "Nguyễn Văn A", items: "Cà phê đen + Bánh mì", amount: "45,000", status: "completed", time: "10:30" },
    { id: "#002", customer: "Trần Thị B", items: "Cappuccino + Latte", amount: "70,000", status: "pending", time: "10:25" },
    { id: "#003", customer: "Lê Văn C", items: "Cà phê sữa đá", amount: "25,000", status: "completed", time: "10:20" },
    { id: "#004", customer: "Phạm Thị D", items: "Espresso + Bánh ngọt", amount: "55,000", status: "processing", time: "10:15" },
    { id: "#005", customer: "Hoàng Văn E", items: "Mocha + Sandwich", amount: "80,000", status: "completed", time: "10:10" }
  ];

  const topProducts = [
    { name: "Cà phê đen", sales: 25, revenue: "375,000" },
    { name: "Cà phê sữa đá", sales: 18, revenue: "450,000" },
    { name: "Cappuccino", sales: 15, revenue: "450,000" },
    { name: "Latte", sales: 12, revenue: "360,000" },
    { name: "Espresso", sales: 10, revenue: "200,000" }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'processing': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Hoàn thành';
      case 'pending': return 'Chờ xử lý';
      case 'processing': return 'Đang xử lý';
      default: return 'Không xác định';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <FiCheckCircle className="w-4 h-4" />;
      case 'pending': return <FiClock className="w-4 h-4" />;
      case 'processing': return <FiEye className="w-4 h-4" />;
      default: return <FiXCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tổng quan quán cà phê</h1>
          <p className="text-gray-600 mt-1">Thống kê hoạt động hôm nay</p>
        </div>
        <div className="text-sm text-gray-500">
          {new Date().toLocaleDateString('vi-VN')}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <div className="flex items-baseline mt-2">
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <span className="text-sm text-gray-500 ml-1">{stat.unit}</span>
                </div>
              </div>
              <div className={`p-3 rounded-lg ${
                stat.color === 'green' ? 'bg-green-100' :
                stat.color === 'blue' ? 'bg-blue-100' :
                stat.color === 'purple' ? 'bg-purple-100' :
                'bg-amber-100'
              }`}>
                <stat.icon className={`w-6 h-6 ${
                  stat.color === 'green' ? 'text-green-600' :
                  stat.color === 'blue' ? 'text-blue-600' :
                  stat.color === 'purple' ? 'text-purple-600' :
                  'text-amber-600'
                }`} />
              </div>
            </div>
            <div className="flex items-center mt-4">
              {stat.trend === 'up' ? (
                <FiTrendingUp className="w-4 h-4 text-green-500 mr-1" />
              ) : (
                <FiTrendingDown className="w-4 h-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm font-medium ${
                stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.change}
              </span>
              <span className="text-sm text-gray-500 ml-1">so với hôm qua</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Đơn hàng gần đây</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentOrders.map((order, index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">{order.id}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{order.customer}</p>
                      <p className="text-sm text-gray-500">{order.items}</p>
                      <p className="text-xs text-gray-400">{order.time}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{order.amount} VNĐ</p>
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span className="ml-1">{getStatusText(order.status)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button className="w-full text-center text-sm font-medium text-amber-600 hover:text-amber-700">
                Xem tất cả đơn hàng
              </button>
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Cà phê bán chạy</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-500">{product.sales} ly bán</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{product.revenue} VNĐ</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button className="w-full text-center text-sm font-medium text-amber-600 hover:text-amber-700">
                Xem menu đầy đủ
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Thao tác nhanh</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-amber-500 hover:bg-amber-50 transition-colors">
            <FiCoffee className="w-6 h-6 text-gray-400 mr-3" />
            <span className="font-medium text-gray-700">Thêm món cà phê</span>
          </button>
          <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-amber-500 hover:bg-amber-50 transition-colors">
            <FiShoppingCart className="w-6 h-6 text-gray-400 mr-3" />
            <span className="font-medium text-gray-700">Tạo đơn hàng</span>
          </button>
          <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-amber-500 hover:bg-amber-50 transition-colors">
            <FiUsers className="w-6 h-6 text-gray-400 mr-3" />
            <span className="font-medium text-gray-700">Thêm nhân viên</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;


