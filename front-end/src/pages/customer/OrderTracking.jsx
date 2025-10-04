import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { onlineOrderAPI } from '../../shared/services/api';
import LoadingSpinner from '../../components/common/ui/LoadingSpinner';
import { FiPackage, FiTruck, FiCheckCircle, FiClock, FiMapPin, FiPhone, FiUser } from 'react-icons/fi';
import toast from 'react-hot-toast';

const OrderTracking = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [tracking, setTracking] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
      fetchOrderTracking();
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const response = await onlineOrderAPI.getOnlineOrder(orderId);
      setOrder(response.data);
    } catch (error) {
      console.error('Fetch order error:', error);
      toast.error('Không thể tải thông tin đơn hàng');
    }
  };

  const fetchOrderTracking = async () => {
    try {
      const response = await onlineOrderAPI.getOrderTracking(orderId);
      setTracking(response.data || []);
    } catch (error) {
      console.error('Fetch tracking error:', error);
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

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Chờ xác nhận':
        return <FiClock className="w-5 h-5 text-yellow-500" />;
      case 'Đã xác nhận':
        return <FiCheckCircle className="w-5 h-5 text-blue-500" />;
      case 'Đang chuẩn bị':
        return <FiPackage className="w-5 h-5 text-orange-500" />;
      case 'Đang giao hàng':
        return <FiTruck className="w-5 h-5 text-purple-500" />;
      case 'Hoàn thành':
        return <FiCheckCircle className="w-5 h-5 text-green-500" />;
      case 'Đã hủy':
        return <FiCheckCircle className="w-5 h-5 text-red-500" />;
      default:
        return <FiClock className="w-5 h-5 text-gray-500" />;
    }
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

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy đơn hàng</h2>
          <p className="text-gray-600 mb-6">Đơn hàng không tồn tại hoặc đã bị xóa</p>
          <button
            onClick={() => navigate('/customer/orders')}
            className="bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700"
          >
            Xem tất cả đơn hàng
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <button
          onClick={() => navigate('/customer/orders')}
          className="text-amber-600 hover:text-amber-700 mb-4"
        >
          ← Quay lại danh sách đơn hàng
        </button>
        <h1 className="text-3xl font-bold text-gray-900">
          Theo dõi đơn hàng #{order.MaDonHang}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Status & Tracking */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Status */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Trạng thái đơn hàng</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.TrangThai)}`}>
                {order.TrangThai}
              </span>
            </div>
            
            <div className="flex items-center space-x-3 mb-4">
              {getStatusIcon(order.TrangThai)}
              <div>
                <p className="font-medium">{order.TrangThai}</p>
                <p className="text-sm text-gray-600">
                  Cập nhật lúc: {formatDateTime(order.NgayCapNhat || order.NgayDat)}
                </p>
              </div>
            </div>

            {order.LoaiDonHang === 'Giao hàng' && order.TrangThai === 'Đang giao hàng' && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <FiMapPin className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Vị trí hiện tại</span>
                </div>
                <p className="text-sm text-blue-700">
                  Shipper đang trên đường đến địa chỉ của bạn
                </p>
              </div>
            )}
          </div>

          {/* Tracking History */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Lịch sử đơn hàng</h2>
            
            <div className="space-y-4">
              {tracking.length > 0 ? (
                tracking.map((track, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      {getStatusIcon(track.TrangThai)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{track.TrangThai}</h3>
                        <span className="text-sm text-gray-500">
                          {formatDateTime(track.ThoiGian)}
                        </span>
                      </div>
                      {track.GhiChu && (
                        <p className="text-sm text-gray-600 mt-1">{track.GhiChu}</p>
                      )}
                      {track.ViTri && (
                        <p className="text-sm text-gray-500 mt-1">
                          <FiMapPin className="inline w-3 h-3 mr-1" />
                          {track.ViTri}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  Chưa có thông tin theo dõi
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Thông tin khách hàng</h2>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <FiUser className="w-4 h-4 text-gray-400" />
                <span className="text-sm">{order.TenKhach}</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <FiPhone className="w-4 h-4 text-gray-400" />
                <span className="text-sm">{order.SoDienThoai}</span>
              </div>
              
              {order.DiaChi && (
                <div className="flex items-start space-x-3">
                  <FiMapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                  <span className="text-sm">{order.DiaChi}</span>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Chi tiết đơn hàng</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Loại đơn hàng:</span>
                <span className="font-medium">{order.LoaiDonHang}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span>Ngày đặt:</span>
                <span>{formatDateTime(order.NgayDat)}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span>Tạm tính:</span>
                <span>{formatCurrency(order.TongTien)}</span>
              </div>
              
              {order.TienGiam > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Giảm giá:</span>
                  <span>-{formatCurrency(order.TienGiam)}</span>
                </div>
              )}
              
              <div className="border-t pt-3">
                <div className="flex justify-between font-semibold">
                  <span>Tổng cộng:</span>
                  <span className="text-green-600">{formatCurrency(order.ThanhTien)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Món đã đặt</h2>
            
            <div className="space-y-3">
              {order.items && order.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div className="flex-1">
                    <h3 className="font-medium text-sm">{item.TenMon}</h3>
                    <p className="text-xs text-gray-600">
                      {formatCurrency(item.DonGia)} x {item.SoLuong}
                    </p>
                    {item.GhiChu && (
                      <p className="text-xs text-gray-500 italic">Ghi chú: {item.GhiChu}</p>
                    )}
                  </div>
                  <span className="font-medium text-sm">
                    {formatCurrency(item.DonGia * item.SoLuong)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          {order.TrangThai === 'Chờ xác nhận' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">Thao tác</h2>
              <button
                onClick={() => {
                  // Handle cancel order
                  toast.success('Đã gửi yêu cầu hủy đơn hàng');
                }}
                className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
              >
                Hủy đơn hàng
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
