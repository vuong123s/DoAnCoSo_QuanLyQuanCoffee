import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { billingAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

const OrderHistory = () => {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchOrderHistory();
  }, []);

  const fetchOrderHistory = async () => {
    try {
      setLoading(true);
      const response = await billingAPI.getBills({ customerId: user.MaKH });
      setOrders(response.data || []);
    } catch (error) {
      console.error('Fetch order history error:', error);
      toast.error('Không thể tải lịch sử đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Chờ xử lý':
        return 'bg-yellow-100 text-yellow-800';
      case 'Đang chuẩn bị':
        return 'bg-blue-100 text-blue-800';
      case 'Hoàn thành':
        return 'bg-green-100 text-green-800';
      case 'Đã hủy':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  const handleViewDetails = async (orderId) => {
    try {
      const response = await billingAPI.getBill(orderId);
      setSelectedOrder(response.data);
      setShowDetails(true);
    } catch (error) {
      console.error('Fetch order details error:', error);
      toast.error('Không thể tải chi tiết đơn hàng');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Lịch sử đơn hàng</h1>
        </div>

        <div className="p-6">
          {orders.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500 text-lg">Bạn chưa có đơn hàng nào</div>
              <p className="text-gray-400 mt-2">Hãy đặt món để xem lịch sử đơn hàng tại đây</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.MaDonHang} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <h3 className="font-semibold text-lg">Đơn hàng #{order.MaDonHang}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.TrangThai)}`}>
                          {order.TrangThai}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Ngày đặt:</span>
                          <div>{formatDate(order.NgayDat)}</div>
                        </div>
                        <div>
                          <span className="font-medium">Bàn:</span>
                          <div>Bàn {order.MaBan}</div>
                        </div>
                        <div>
                          <span className="font-medium">Tổng tiền:</span>
                          <div className="font-semibold text-green-600">{formatCurrency(order.TongTien)}</div>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleViewDetails(order.MaDonHang)}
                      className="ml-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Xem chi tiết
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {showDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Chi tiết đơn hàng #{selectedOrder.MaDonHang}</h2>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Trạng thái:</span>
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.TrangThai)}`}>
                      {selectedOrder.TrangThai}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Ngày đặt:</span>
                    <span className="ml-2">{formatDate(selectedOrder.NgayDat)}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Bàn:</span>
                    <span className="ml-2">Bàn {selectedOrder.MaBan}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Ghi chú:</span>
                    <span className="ml-2">{selectedOrder.GhiChu || 'Không có'}</span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3">Chi tiết món ăn</h3>
                  <div className="space-y-2">
                    {selectedOrder.items?.map((item, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                        <div className="flex-1">
                          <div className="font-medium">{item.TenMon}</div>
                          <div className="text-sm text-gray-600">Số lượng: {item.SoLuong}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(item.DonGia * item.SoLuong)}</div>
                          <div className="text-sm text-gray-600">{formatCurrency(item.DonGia)}/món</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Tổng cộng:</span>
                    <span className="text-green-600">{formatCurrency(selectedOrder.TongTien)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
