import React, { useState, useEffect } from 'react';
import { onlineOrderAPI } from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { 
  FiSearch, 
  FiFilter, 
  FiEye, 
  FiEdit, 
  FiPackage, 
  FiTruck, 
  FiCheckCircle, 
  FiClock,
  FiMapPin,
  FiPhone,
  FiUser,
  FiDownload
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const OnlineOrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('today');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchQuery, statusFilter, dateFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await onlineOrderAPI.getOnlineOrders();
      setOrders(response.data || []);
    } catch (error) {
      console.error('Fetch orders error:', error);
      toast.error('Có lỗi khi tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = orders;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(order =>
        order.MaDonHang.toString().includes(searchQuery) ||
        order.TenKhach.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.SoDienThoai.includes(searchQuery)
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => {
        switch (statusFilter) {
          case 'pending':
            return ['Chờ xác nhận', 'Đã xác nhận'].includes(order.TrangThai);
          case 'preparing':
            return order.TrangThai === 'Đang chuẩn bị';
          case 'shipping':
            return order.TrangThai === 'Đang giao hàng';
          case 'completed':
            return order.TrangThai === 'Hoàn thành';
          case 'cancelled':
            return order.TrangThai === 'Đã hủy';
          default:
            return true;
        }
      });
    }

    // Filter by date
    if (dateFilter !== 'all') {
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0));
      
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.NgayDat);
        
        switch (dateFilter) {
          case 'today':
            return orderDate >= startOfDay;
          case 'week':
            const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            return orderDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            return orderDate >= monthAgo;
          default:
            return true;
        }
      });
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

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const handleViewDetails = async (orderId) => {
    try {
      const response = await onlineOrderAPI.getOnlineOrder(orderId);
      setSelectedOrder(response.data);
      setShowDetails(true);
    } catch (error) {
      console.error('Fetch order details error:', error);
      toast.error('Không thể tải chi tiết đơn hàng');
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      setUpdating(true);
      await onlineOrderAPI.updateOrderStatus(orderId, { TrangThai: newStatus });
      
      // Update local state
      setOrders(orders.map(order => 
        order.MaDonHang === orderId 
          ? { ...order, TrangThai: newStatus }
          : order
      ));
      
      if (selectedOrder && selectedOrder.MaDonHang === orderId) {
        setSelectedOrder({ ...selectedOrder, TrangThai: newStatus });
      }
      
      toast.success('Cập nhật trạng thái thành công');
    } catch (error) {
      console.error('Update status error:', error);
      toast.error('Có lỗi khi cập nhật trạng thái');
    } finally {
      setUpdating(false);
    }
  };

  const getNextStatus = (currentStatus) => {
    switch (currentStatus) {
      case 'Chờ xác nhận':
        return 'Đã xác nhận';
      case 'Đã xác nhận':
        return 'Đang chuẩn bị';
      case 'Đang chuẩn bị':
        return 'Đang giao hàng';
      case 'Đang giao hàng':
        return 'Hoàn thành';
      default:
        return null;
    }
  };

  const canUpdateStatus = (status) => {
    return !['Hoàn thành', 'Đã hủy'].includes(status);
  };

  const exportOrders = () => {
    // Simple CSV export
    const csvContent = [
      ['Mã đơn hàng', 'Khách hàng', 'SĐT', 'Loại đơn hàng', 'Trạng thái', 'Tổng tiền', 'Ngày đặt'],
      ...filteredOrders.map(order => [
        order.MaDonHang,
        order.TenKhach,
        order.SoDienThoai,
        order.LoaiDonHang,
        order.TrangThai,
        order.ThanhTien || order.TongTien,
        formatDateTime(order.NgayDat)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `don-hang-online-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-md">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Quản lý đơn hàng online</h1>
            <button
              onClick={exportOrders}
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            >
              <FiDownload className="w-4 h-4" />
              <span>Xuất Excel</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Tìm theo mã đơn hàng, tên, SĐT..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ xử lý</option>
              <option value="preparing">Đang chuẩn bị</option>
              <option value="shipping">Đang giao hàng</option>
              <option value="completed">Hoàn thành</option>
              <option value="cancelled">Đã hủy</option>
            </select>

            {/* Date Filter */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả thời gian</option>
              <option value="today">Hôm nay</option>
              <option value="week">7 ngày qua</option>
              <option value="month">30 ngày qua</option>
            </select>

            {/* Stats */}
            <div className="text-sm text-gray-600">
              Tổng: <span className="font-medium">{filteredOrders.length}</span> đơn hàng
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Đơn hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Khách hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Loại đơn hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tổng tiền
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày đặt
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.MaDonHang} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(order.TrangThai)}
                      <div className="ml-2">
                        <div className="text-sm font-medium text-gray-900">
                          #{order.MaDonHang}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{order.TenKhach}</div>
                      <div className="text-sm text-gray-500">{order.SoDienThoai}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{order.LoaiDonHang}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.TrangThai)}`}>
                      {order.TrangThai}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                    {formatCurrency(order.ThanhTien || order.TongTien)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDateTime(order.NgayDat)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewDetails(order.MaDonHang)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Xem chi tiết"
                      >
                        <FiEye className="w-4 h-4" />
                      </button>
                      {canUpdateStatus(order.TrangThai) && getNextStatus(order.TrangThai) && (
                        <button
                          onClick={() => handleUpdateStatus(order.MaDonHang, getNextStatus(order.TrangThai))}
                          disabled={updating}
                          className="text-green-600 hover:text-green-900 disabled:opacity-50"
                          title={`Chuyển sang: ${getNextStatus(order.TrangThai)}`}
                        >
                          <FiEdit className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredOrders.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">Không có đơn hàng nào</div>
              <p className="text-gray-400 mt-2">Thử thay đổi bộ lọc để xem đơn hàng khác</p>
            </div>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {showDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
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
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Order Info */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Thông tin đơn hàng</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Trạng thái:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.TrangThai)}`}>
                        {selectedOrder.TrangThai}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Loại đơn hàng:</span>
                      <span className="font-medium">{selectedOrder.LoaiDonHang}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ngày đặt:</span>
                      <span>{formatDateTime(selectedOrder.NgayDat)}</span>
                    </div>
                    {selectedOrder.GhiChu && (
                      <div>
                        <span className="text-gray-600">Ghi chú:</span>
                        <p className="mt-1 text-sm">{selectedOrder.GhiChu}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Customer Info */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Thông tin khách hàng</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <FiUser className="w-4 h-4 text-gray-400" />
                      <span>{selectedOrder.TenKhach}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FiPhone className="w-4 h-4 text-gray-400" />
                      <span>{selectedOrder.SoDienThoai}</span>
                    </div>
                    {selectedOrder.DiaChi && (
                      <div className="flex items-start space-x-2">
                        <FiMapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                        <span className="text-sm">{selectedOrder.DiaChi}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">Chi tiết món ăn</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Món</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Đơn giá</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">SL</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Thành tiền</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Ghi chú</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedOrder.items?.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 text-sm font-medium">{item.TenMon}</td>
                          <td className="px-4 py-2 text-sm">{formatCurrency(item.DonGia)}</td>
                          <td className="px-4 py-2 text-sm">{item.SoLuong}</td>
                          <td className="px-4 py-2 text-sm font-medium">{formatCurrency(item.DonGia * item.SoLuong)}</td>
                          <td className="px-4 py-2 text-sm text-gray-500">{item.GhiChu || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Order Summary */}
              <div className="mt-6 border-t pt-4">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>Tạm tính:</span>
                      <span>{formatCurrency(selectedOrder.TongTien)}</span>
                    </div>
                    {selectedOrder.TienGiam > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Giảm giá:</span>
                        <span>-{formatCurrency(selectedOrder.TienGiam)}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="border-t mt-2 pt-2">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Tổng cộng:</span>
                    <span className="text-green-600">{formatCurrency(selectedOrder.ThanhTien)}</span>
                  </div>
                </div>
              </div>

              {/* Status Update Actions */}
              {canUpdateStatus(selectedOrder.TrangThai) && (
                <div className="mt-6 border-t pt-4">
                  <h4 className="font-semibold mb-3">Cập nhật trạng thái</h4>
                  <div className="flex space-x-2">
                    {getNextStatus(selectedOrder.TrangThai) && (
                      <button
                        onClick={() => handleUpdateStatus(selectedOrder.MaDonHang, getNextStatus(selectedOrder.TrangThai))}
                        disabled={updating}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                      >
                        {updating ? 'Đang cập nhật...' : `Chuyển sang: ${getNextStatus(selectedOrder.TrangThai)}`}
                      </button>
                    )}
                    {selectedOrder.TrangThai === 'Chờ xác nhận' && (
                      <button
                        onClick={() => handleUpdateStatus(selectedOrder.MaDonHang, 'Đã hủy')}
                        disabled={updating}
                        className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
                      >
                        Hủy đơn hàng
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OnlineOrderManagement;
