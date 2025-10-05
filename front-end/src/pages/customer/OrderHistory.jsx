import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../app/stores/authStore';
import { onlineOrderAPI } from '../../shared/services/api';
import LoadingSpinner from '../../components/common/ui/LoadingSpinner';
import { FiEye, FiPackage, FiClock, FiCheckCircle, FiTruck, FiFilter } from 'react-icons/fi';
import toast from 'react-hot-toast';

const OrderHistory = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchOrderHistory();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, filter]);

  const fetchOrderHistory = async () => {
    try {
      setLoading(true);
      const params = user?.MaKH ? { MaKH: user.MaKH } : {};
      const response = await onlineOrderAPI.getOnlineOrders(params);
      setOrders(response.data || []);
    } catch (error) {
      console.error('Fetch order history error:', error);
      toast.error('Có lỗi khi tải lịch sử đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = orders;
    
    switch (filter) {
      case 'pending':
        filtered = orders.filter(order => 
          ['Chờ xác nhận', 'Đã xác nhận', 'Đang chuẩn bị'].includes(order.TrangThai)
        );
        break;
      case 'shipping':
        filtered = orders.filter(order => order.TrangThai === 'Đang giao hàng');
        break;
      case 'completed':
        filtered = orders.filter(order => order.TrangThai === 'Hoàn thành');
        break;
      case 'cancelled':
        filtered = orders.filter(order => order.TrangThai === 'Đã hủy');
        break;
      default:
        filtered = orders;
    }
    
    setFilteredOrders(filtered);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Chờ xác nhận':
        return 'bg-yellow-100 text-yellow-800';
      case 'Đã xác nhận':
        return 'bg-blue-100 text-blue-800';
      case 'Đang chuẩn bị':
        return 'bg-orange-100 text-orange-800';
      case 'Đang giao hàng':
        return 'bg-purple-100 text-purple-800';
      case 'Hoàn thành':
        return 'bg-green-100 text-green-800';
      case 'Đã hủy':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Chờ xác nhận':
        return <FiClock className="w-4 h-4" />;
      case 'Đã xác nhận':
        return <FiCheckCircle className="w-4 h-4" />;
      case 'Đang chuẩn bị':
        return <FiPackage className="w-4 h-4" />;
      case 'Đang giao hàng':
        return <FiTruck className="w-4 h-4" />;
      case 'Hoàn thành':
        return <FiCheckCircle className="w-4 h-4" />;
      default:
        return <FiClock className="w-4 h-4" />;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const handleViewOrder = (orderId) => {
    navigate(`/customer/orders/${orderId}`);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Đơn hàng của tôi</h1>
            <div className="flex items-center space-x-2">
              <FiFilter className="w-4 h-4 text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="all">Tất cả</option>
                <option value="pending">Đang xử lý</option>
                <option value="shipping">Đang giao hàng</option>
                <option value="completed">Hoàn thành</option>
                <option value="cancelled">Đã hủy</option>
              </select>
            </div>
          </div>
        </div>

        <div className="p-6">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">
                {filter === 'all' ? 'Bạn chưa có đơn hàng nào' : 'Không có đơn hàng nào phù hợp'}
              </div>
              <p className="text-gray-400 mt-2">
                {filter === 'all' ? 'Hãy đặt món để xem lịch sử đơn hàng tại đây' : 'Thử thay đổi bộ lọc để xem đơn hàng khác'}
              </p>
              {filter === 'all' && (
                <button
                  onClick={() => navigate('/menu')}
                  className="mt-4 bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700"
                >
                  Đặt hàng ngay
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <div key={order.MaDonHang} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(order.TrangThai)}
                        <h3 className="font-semibold text-lg">Đơn hàng #{order.MaDonHang}</h3>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.TrangThai)}`}>
                        {order.TrangThai}
                      </span>
                    </div>

                    <button
                      onClick={() => handleViewOrder(order.MaDonHang)}
                      className="flex items-center space-x-2 bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700 transition-colors"
                    >
                      <FiEye className="w-4 h-4" />
                      <span>Xem chi tiết</span>
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Ngày đặt:</span>
                      <div className="text-gray-600">{formatDate(order.NgayDat)}</div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Loại đơn hàng:</span>
                      <div className="text-gray-600">{order.LoaiDonHang}</div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Khách hàng:</span>
                      <div className="text-gray-600">{order.TenKhach}</div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Tổng tiền:</span>
                      <div className="font-semibold text-green-600">{formatCurrency(order.ThanhTien || order.TongTien)}</div>
                    </div>
                  </div>

                  {order.DiaChi && (
                    <div className="mt-3 text-sm">
                      <span className="font-medium text-gray-700">Địa chỉ giao hàng:</span>
                      <div className="text-gray-600">{order.DiaChi}</div>
                    </div>
                  )}

                  {order.GhiChu && (
                    <div className="mt-3 text-sm">
                      <span className="font-medium text-gray-700">Ghi chú:</span>
                      <div className="text-gray-600">{order.GhiChu}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default OrderHistory;
