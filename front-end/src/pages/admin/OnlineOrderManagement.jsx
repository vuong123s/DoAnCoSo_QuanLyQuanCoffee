import React, { useState, useEffect } from 'react';
import { onlineOrderAPI } from '../../shared/services/api';
import LoadingSpinner from '../../components/common/ui/LoadingSpinner';
import { 
  FiSearch, 
  FiEye, 
  FiEdit, 
  FiPackage, 
  FiTruck, 
  FiCheckCircle, 
  FiClock,
  FiMapPin,
  FiPhone,
  FiUser,
  FiDownload,
  FiXCircle,
  FiTrash2
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const OnlineOrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchQuery, statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await onlineOrderAPI.getOnlineOrders();
      
      // API trả về { data: [...], onlineOrders: [...], pagination: {...} }
      const ordersData = response.data?.data || response.data?.onlineOrders || [];
      
      console.log('Fetched orders:', ordersData.length);
      setOrders(ordersData);
      
    } catch (error) {
      console.error('Fetch orders error:', error);
      toast.error('Không thể tải danh sách đơn hàng');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];
    
    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(order =>
        order.MaDHOnline?.toString().includes(searchQuery) ||
        order.TenKhach?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.SDTKhach?.includes(searchQuery)
      );
    }

    // Status filter
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

    setFilteredOrders(filtered);
  };

  const handleViewDetails = async (orderId) => {
    try {
      const response = await onlineOrderAPI.getOnlineOrder(orderId);
      const orderData = response.data?.data || response.data?.order || response.data;
      
      console.log('Order details:', orderData);
      setSelectedOrder(orderData);
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
        order.MaDHOnline === orderId ? { ...order, TrangThai: newStatus } : order
      ));
      
      if (selectedOrder?.MaDHOnline === orderId) {
        setSelectedOrder({ ...selectedOrder, TrangThai: newStatus });
      }
      
      toast.success('Cập nhật trạng thái thành công');
      
    } catch (error) {
      console.error('Update status error:', error);
      toast.error('Không thể cập nhật trạng thái');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa đơn hàng này? Hành động này không thể hoàn tác.')) {
      return;
    }

    try {
      setUpdating(true);
      await onlineOrderAPI.deleteOnlineOrder(orderId);
      
      // Remove from local state
      setOrders(orders.filter(order => order.MaDHOnline !== orderId));
      
      // Close modal if this order is being viewed
      if (selectedOrder?.MaDHOnline === orderId) {
        setShowDetails(false);
        setSelectedOrder(null);
      }
      
      toast.success('Xóa đơn hàng thành công');
      
    } catch (error) {
      console.error('Delete order error:', error);
      toast.error('Không thể xóa đơn hàng');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Chờ xác nhận': 'bg-yellow-100 text-yellow-800',
      'Đã xác nhận': 'bg-blue-100 text-blue-800',
      'Đang chuẩn bị': 'bg-orange-100 text-orange-800',
      'Đang giao hàng': 'bg-purple-100 text-purple-800',
      'Hoàn thành': 'bg-green-100 text-green-800',
      'Đã hủy': 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'Chờ xác nhận': <FiClock className="w-4 h-4" />,
      'Đã xác nhận': <FiCheckCircle className="w-4 h-4" />,
      'Đang chuẩn bị': <FiPackage className="w-4 h-4" />,
      'Đang giao hàng': <FiTruck className="w-4 h-4" />,
      'Hoàn thành': <FiCheckCircle className="w-4 h-4" />,
      'Đã hủy': <FiXCircle className="w-4 h-4" />,
    };
    return icons[status] || <FiClock className="w-4 h-4" />;
  };

  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      'Chờ xác nhận': 'Đã xác nhận',
      'Đã xác nhận': 'Đang chuẩn bị',
      'Đang chuẩn bị': 'Đang giao hàng',
      'Đang giao hàng': 'Hoàn thành',
    };
    return statusFlow[currentStatus] || null;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(parseFloat(amount) || 0);
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const exportOrders = () => {
    const csvContent = [
      ['Mã ĐH', 'Khách hàng', 'SĐT', 'Loại', 'Trạng thái', 'Tổng tiền', 'Ngày đặt'],
      ...filteredOrders.map(order => [
        order.MaDHOnline,
        order.TenKhach,
        order.SDTKhach,
        order.LoaiDonHang,
        order.TrangThai,
        order.ThanhTien || order.TongTien,
        formatDateTime(order.NgayDat)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `don-hang-online-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
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
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Quản lý đơn hàng online</h1>
              <p className="text-sm text-gray-500 mt-1">Tổng: {filteredOrders.length} đơn hàng</p>
            </div>
            <button
              onClick={exportOrders}
              disabled={filteredOrders.length === 0}
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              <FiDownload className="w-4 h-4" />
              <span>Xuất CSV</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative md:col-span-2">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Tìm theo mã đơn, tên khách hàng, SĐT..."
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
          </div>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">Không có đơn hàng nào</div>
              <p className="text-gray-400 mt-2">Thử thay đổi bộ lọc hoặc tải lại trang</p>
              <button
                onClick={fetchOrders}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Tải lại
              </button>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã ĐH</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Khách hàng</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loại</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tổng tiền</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày đặt</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.MaDHOnline} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(order.TrangThai)}
                        <span className="ml-2 text-sm font-medium text-gray-900">#{order.MaDHOnline}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{order.TenKhach}</div>
                      <div className="text-sm text-gray-500">{order.SDTKhach}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.LoaiDonHang}
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
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleViewDetails(order.MaDHOnline)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Xem chi tiết"
                        >
                          <FiEye className="w-5 h-5" />
                        </button>
                        {getNextStatus(order.TrangThai) && (
                          <button
                            onClick={() => handleUpdateStatus(order.MaDHOnline, getNextStatus(order.TrangThai))}
                            disabled={updating}
                            className="text-green-600 hover:text-green-900 disabled:opacity-50"
                            title={`Chuyển: ${getNextStatus(order.TrangThai)}`}
                          >
                            <FiEdit className="w-5 h-5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteOrder(order.MaDHOnline)}
                          disabled={updating}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50"
                          title="Xóa đơn hàng"
                        >
                          <FiTrash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {showDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Chi tiết đơn hàng #{selectedOrder.MaDHOnline}</h2>
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
              {/* Order & Customer Info */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Order Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3">Thông tin đơn hàng</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Trạng thái:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.TrangThai)}`}>
                        {selectedOrder.TrangThai}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Loại:</span>
                      <span className="font-medium">{selectedOrder.LoaiDonHang}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ngày đặt:</span>
                      <span>{formatDateTime(selectedOrder.NgayDat)}</span>
                    </div>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3">Thông tin khách hàng</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <FiUser className="w-4 h-4 text-gray-400" />
                      <span>{selectedOrder.TenKhach}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FiPhone className="w-4 h-4 text-gray-400" />
                      <span>{selectedOrder.SDTKhach}</span>
                    </div>
                    {selectedOrder.DiaChiGiaoHang && (
                      <div className="flex items-start space-x-2">
                        <FiMapPin className="w-4 h-4 text-gray-400 mt-1" />
                        <span className="text-sm">{selectedOrder.DiaChiGiaoHang}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Chi tiết món ăn</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Món</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Đơn giá</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SL</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {(selectedOrder.chitiet || []).map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3">
                            <div className="flex items-center space-x-3">
                              <div className="flex-shrink-0 w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                                <FiPackage className="w-5 h-5 text-gray-400" />
                              </div>
                              <div className="text-sm font-medium text-gray-900">
                                {item.Mon?.TenMon || item.TenMon || 'Món ăn'}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm">{formatCurrency(item.DonGia)}</td>
                          <td className="px-4 py-3 text-sm">{item.SoLuong}</td>
                          <td className="px-4 py-3 text-sm font-medium">
                            {formatCurrency((item.DonGia || 0) * (item.SoLuong || 0))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Order Summary */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Tổng cộng:</span>
                  <span className="text-green-600">
                    {formatCurrency(selectedOrder.ThanhTien || selectedOrder.TongTien)}
                  </span>
                </div>
              </div>

              {/* Status Update */}
              {getNextStatus(selectedOrder.TrangThai) && (
                <div className="mt-6 pt-6 border-t">
                  <button
                    onClick={() => handleUpdateStatus(selectedOrder.MaDHOnline, getNextStatus(selectedOrder.TrangThai))}
                    disabled={updating}
                    className="w-full bg-blue-600 text-white px-4 py-3 rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium"
                  >
                    {updating ? 'Đang cập nhật...' : `Chuyển sang: ${getNextStatus(selectedOrder.TrangThai)}`}
                  </button>
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
