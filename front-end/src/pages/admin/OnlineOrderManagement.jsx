import React, { useState, useEffect } from 'react';
import { onlineOrderAPI } from '../../shared/services/api';
import LoadingSpinner from '../../components/common/ui/LoadingSpinner';
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
  FiDownload,
  FiTrash2
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const OnlineOrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [serviceError, setServiceError] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    console.log('Orders state changed:', orders);
    filterOrders();
  }, [orders, searchQuery, statusFilter, dateFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setServiceError(null);
      const response = await onlineOrderAPI.getOnlineOrders();
      console.log('Full response:', response);
      
      // Try different possible response structures
      let ordersData = [];
      if (response.data && Array.isArray(response.data)) {
        ordersData = response.data;
      } else if (response.onlineOrders && Array.isArray(response.onlineOrders)) {
        ordersData = response.onlineOrders;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        ordersData = response.data.data;
      } else if (response.data && response.data.onlineOrders && Array.isArray(response.data.onlineOrders)) {
        ordersData = response.data.onlineOrders;
      }
      console.log('Orders data received:', ordersData);
      console.log('Orders data type:', typeof ordersData);
      console.log('Is array:', Array.isArray(ordersData));
      console.log('Sample order:', ordersData[0]);
      
      if (Array.isArray(ordersData) && ordersData.length > 0) {
        console.log('Setting orders:', ordersData);
        setOrders(ordersData);
      } else {
        console.log('No valid orders data, setting empty array');
        setOrders([]);
      }
    } catch (error) {
      console.error('Fetch orders error:', error);
      
      if (error.response?.status === 503) {
        setServiceError('Dịch vụ đơn hàng online tạm thời không khả dụng. Vui lòng thử lại sau.');
        toast.error('Dịch vụ đơn hàng online tạm thời không khả dụng');
      } else if (error.response?.status === 401) {
        setServiceError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      } else if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
        setServiceError('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
        toast.error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
      } else {
        setServiceError('Có lỗi khi tải danh sách đơn hàng: ' + (error.message || 'Lỗi không xác định'));
        toast.error('Có lỗi khi tải danh sách đơn hàng: ' + (error.message || 'Lỗi không xác định'));
      }
      
      // Set empty array on error
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    // Ensure orders is always an array
    const ordersArray = Array.isArray(orders) ? orders : [];
    let filtered = ordersArray;
    
    console.log('Filtering orders:', {
      totalOrders: ordersArray.length,
      searchQuery,
      statusFilter,
      dateFilter,
      ordersState: orders
    });
    
    // If no orders yet, don't filter
    if (ordersArray.length === 0) {
      setFilteredOrders([]);
      return;
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(order =>
        (order.MaDonHang || '').toString().includes(searchQuery) ||
        (order.TenKhach || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (order.SoDienThoai || '').includes(searchQuery)
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      console.log('Filtering by status:', statusFilter);
      const beforeStatusFilter = filtered.length;
      filtered = filtered.filter(order => {
        console.log('Order status:', order.TrangThai);
        switch (statusFilter) {
          case 'pending':
            return ['Chờ xác nhận', 'Đã xác nhận'].includes(order.TrangThai);
          case 'preparing':
            return order.TrangThai === 'Đang chuẩn bị';
          case 'shipping':
            return order.TrangThai === 'Đang giao hàng' || order.TrangThai === 'Đang giao';
          case 'completed':
            return order.TrangThai === 'Hoàn thành';
          case 'cancelled':
            return order.TrangThai === 'Đã hủy';
          default:
            return true;
        }
      });
      console.log(`Status filter: ${beforeStatusFilter} -> ${filtered.length}`);
    }

    // Filter by date
    if (dateFilter !== 'all') {
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0));
      
      filtered = filtered.filter(order => {
        if (!order.NgayDat) return false;
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

    console.log('Filtered orders result:', filtered.length);
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
    const numAmount = parseFloat(amount) || 0;
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(numAmount);
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Không có thông tin';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleString('vi-VN');
  };

  const handleViewDetails = async (orderId) => {
    try {
      console.log('Fetching order details for ID:', orderId, 'Type:', typeof orderId);
      const response = await onlineOrderAPI.getOnlineOrder(orderId);
      console.log('Order details response:', response);
      console.log('Order details data:', response.data);
      
      // Try different response structures
      let orderData = {};
      if (response.data && typeof response.data === 'object') {
        if (response.data.data) {
          orderData = response.data.data;
        } else if (response.data.order) {
          orderData = response.data.order;
        } else {
          orderData = response.data;
        }
      } else if (response.order) {
        orderData = response.order;
      }
      
      console.log('Final order data:', orderData);
      console.log('Order data keys:', Object.keys(orderData));
      console.log('Order items:', orderData.items || orderData.chitiet);
      if ((orderData.items || orderData.chitiet) && (orderData.items || orderData.chitiet).length > 0) {
        console.log('Sample item:', (orderData.items || orderData.chitiet)[0]);
        console.log('Sample item keys:', Object.keys((orderData.items || orderData.chitiet)[0]));
      }
      setSelectedOrder(orderData);
      setShowDetails(true);
    } catch (error) {
      console.error('Fetch order details error:', error);
      
      if (error.response?.status === 503) {
        toast.error('Dịch vụ đơn hàng online tạm thời không khả dụng');
      } else if (error.response?.status === 401) {
        toast.error('Không có quyền xem chi tiết đơn hàng');
      } else if (error.response?.status === 404) {
        toast.error('Không tìm thấy đơn hàng này');
      } else {
        toast.error('Không thể tải chi tiết đơn hàng: ' + (error.message || 'Lỗi không xác định'));
      }
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      console.log('Update status called with ID:', orderId, 'Type:', typeof orderId, 'New status:', newStatus);
      setUpdating(true);
      await onlineOrderAPI.updateOrderStatus(orderId, { TrangThai: newStatus });
      
      // Update local state
      setOrders(orders.map(order => {
        const id = order.MaDHOnline || order.MaDonHang;
        return id === orderId 
          ? { ...order, TrangThai: newStatus }
          : order;
      }));
      
      if (selectedOrder) {
        const selectedId = selectedOrder.MaDHOnline || selectedOrder.MaDonHang;
        if (selectedId === orderId) {
          setSelectedOrder({ ...selectedOrder, TrangThai: newStatus });
        }
      }
      
      toast.success('Cập nhật trạng thái thành công');
    } catch (error) {
      console.error('Update status error:', error);
      
      if (error.response?.status === 503) {
        toast.error('Dịch vụ đơn hàng online tạm thời không khả dụng');
      } else if (error.response?.status === 401) {
        toast.error('Không có quyền cập nhật trạng thái đơn hàng');
      } else if (error.response?.status === 404) {
        toast.error('Không tìm thấy đơn hàng này');
      } else {
        toast.error('Có lỗi khi cập nhật trạng thái: ' + (error.message || 'Lỗi không xác định'));
      }
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

  const handleDeleteOrder = async (orderId) => {
    console.log('Delete order called with ID:', orderId, 'Type:', typeof orderId);
    
    if (!window.confirm('Bạn có chắc chắn muốn xóa đơn hàng này? Hành động này không thể hoàn tác.')) {
      return;
    }

    try {
      setUpdating(true);
      console.log('Calling deleteOnlineOrder API with ID:', orderId);
      await onlineOrderAPI.deleteOnlineOrder(orderId);
      
      // Remove from local state
      setOrders(orders.filter(order => {
        const id = order.MaDHOnline || order.MaDonHang;
        return id !== orderId;
      }));
      
      // Close modal if this order is being viewed
      if (selectedOrder) {
        const selectedId = selectedOrder.MaDHOnline || selectedOrder.MaDonHang;
        if (selectedId === orderId) {
          setShowDetails(false);
          setSelectedOrder(null);
        }
      }
      
      toast.success('Xóa đơn hàng thành công');
    } catch (error) {
      console.error('Delete order error:', error);
      
      if (error.response?.status === 503) {
        toast.error('Dịch vụ đơn hàng online tạm thời không khả dụng');
      } else if (error.response?.status === 401) {
        toast.error('Không có quyền xóa đơn hàng');
      } else if (error.response?.status === 404) {
        toast.error('Không tìm thấy đơn hàng này');
      } else {
        toast.error('Có lỗi khi xóa đơn hàng: ' + (error.response?.data?.message || error.message || 'Lỗi không xác định'));
      }
    } finally {
      setUpdating(false);
    }
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
              {filteredOrders.map((order) => {
                const orderId = order.MaDHOnline || order.MaDonHang;
                return (
                <tr key={orderId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(order.TrangThai)}
                      <div className="ml-2">
                        <div className="text-sm font-medium text-gray-900">
                          #{orderId}
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
                        onClick={() => handleViewDetails(orderId)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Xem chi tiết"
                      >
                        <FiEye className="w-4 h-4" />
                      </button>
                      {canUpdateStatus(order.TrangThai) && getNextStatus(order.TrangThai) && (
                        <button
                          onClick={() => handleUpdateStatus(orderId, getNextStatus(order.TrangThai))}
                          disabled={updating}
                          className="text-green-600 hover:text-green-900 disabled:opacity-50"
                          title={`Chuyển sang: ${getNextStatus(order.TrangThai)}`}
                        >
                          <FiEdit className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteOrder(orderId)}
                        disabled={updating}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50"
                        title="Xóa đơn hàng"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>

          {serviceError ? (
            <div className="text-center py-12">
              <div className="text-red-500 text-lg mb-4">⚠️ Lỗi kết nối</div>
              <p className="text-gray-600 mb-4">{serviceError}</p>
              <button
                onClick={fetchOrders}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Thử lại
              </button>
            </div>
          ) : filteredOrders.length === 0 && !loading ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">Không có đơn hàng nào</div>
              <p className="text-gray-400 mt-2">Thử thay đổi bộ lọc để xem đơn hàng khác</p>
            </div>
          ) : null}
        </div>
      </div>

      {/* Order Details Modal */}
      {showDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Chi tiết đơn hàng #{selectedOrder.MaDHOnline || selectedOrder.MaDonHang}</h2>
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
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.TrangThai || 'Không xác định')}`}>
                        {selectedOrder.TrangThai || 'Không xác định'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Loại đơn hàng:</span>
                      <span className="font-medium">{selectedOrder.LoaiDonHang || 'Không xác định'}</span>
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
                      <span>{selectedOrder.TenKhach || 'Không có thông tin'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FiPhone className="w-4 h-4 text-gray-400" />
                      <span>{selectedOrder.SoDienThoai || selectedOrder.SDTKhach || 'Không có thông tin'}</span>
                    </div>
                    {(selectedOrder.DiaChi || selectedOrder.DiaChiGiaoHang) && (
                      <div className="flex items-start space-x-2">
                        <FiMapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                        <span className="text-sm">{selectedOrder.DiaChi || selectedOrder.DiaChiGiaoHang}</span>
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
                      {(selectedOrder.items || selectedOrder.chitiet || [])?.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2">
                            <div className="flex items-center space-x-3">
                              <div className="flex-shrink-0 w-12 h-12">
                                {item.HinhAnh || item.image ? (
                                  <img 
                                    src={item.HinhAnh || item.image} 
                                    alt={item.TenMon || item.name || 'Món ăn'}
                                    className="w-12 h-12 rounded-lg object-cover"
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                      e.target.nextSibling.style.display = 'flex';
                                    }}
                                  />
                                ) : null}
                                <div 
                                  className={`w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center ${item.HinhAnh || item.image ? 'hidden' : 'flex'}`}
                                  style={{ display: item.HinhAnh || item.image ? 'none' : 'flex' }}
                                >
                                  <FiPackage className="w-6 h-6 text-gray-400" />
                                </div>
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {item.TenMon || item.name || 'Không có tên'}
                                </div>
                                {item.MoTa && (
                                  <div className="text-xs text-gray-500 truncate max-w-xs">
                                    {item.MoTa}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-2 text-sm">{formatCurrency(item.DonGia)}</td>
                          <td className="px-4 py-2 text-sm">{item.SoLuong}</td>
                          <td className="px-4 py-2 text-sm font-medium">{formatCurrency((item.DonGia || 0) * (item.SoLuong || 0))}</td>
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
                      <span>{formatCurrency(selectedOrder.TongTien || 0)}</span>
                    </div>
                    {(selectedOrder.TienGiam || selectedOrder.GiamGia) > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Giảm giá:</span>
                        <span>-{formatCurrency(selectedOrder.TienGiam || selectedOrder.GiamGia || 0)}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="border-t mt-2 pt-2">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Tổng cộng:</span>
                    <span className="text-green-600">{formatCurrency(selectedOrder.ThanhTien || selectedOrder.TongThanhToan || selectedOrder.TongTien || 0)}</span>
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
                        onClick={() => handleUpdateStatus(selectedOrder.MaDHOnline || selectedOrder.MaDonHang, getNextStatus(selectedOrder.TrangThai))}
                        disabled={updating}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                      >
                        {updating ? 'Đang cập nhật...' : `Chuyển sang: ${getNextStatus(selectedOrder.TrangThai)}`}
                      </button>
                    )}
                    {selectedOrder.TrangThai === 'Chờ xác nhận' && (
                      <button
                        onClick={() => handleUpdateStatus(selectedOrder.MaDHOnline || selectedOrder.MaDonHang, 'Đã hủy')}
                        disabled={updating}
                        className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
                      >
                        Hủy đơn hàng
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteOrder(selectedOrder.MaDHOnline || selectedOrder.MaDonHang)}
                      disabled={updating}
                      className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 disabled:opacity-50"
                    >
                      Xóa đơn hàng
                    </button>
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
