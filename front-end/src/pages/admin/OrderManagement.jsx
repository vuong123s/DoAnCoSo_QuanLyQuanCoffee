import React, { useState, useEffect } from 'react';
import { billingAPI, menuAPI, tableAPI } from '../../shared/services/api';
import { useForm } from 'react-hook-form';
import { FiPlus, FiEdit, FiTrash2, FiEye, FiPrinter, FiClock, FiDollarSign, FiUser, FiMapPin } from 'react-icons/fi';
import toast from 'react-hot-toast';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [tables, setTables] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, statusFilter, dateFilter]);

  const fetchData = async () => {
    try {
      const [ordersResponse, menuResponse, tablesResponse] = await Promise.all([
        billingAPI.getBills(),
        menuAPI.getMenuItems(),
        tableAPI.getTables()
      ]);
      
      // Handle DonHang table only - simplified schema
      // DonHang: MaDH, MaBan, MaNV, NgayLap, TongTien, TrangThai
      setOrders(ordersResponse.data.donhangs || ordersResponse.data.bills || []);
      setMenuItems(menuResponse.data.menus || menuResponse.data.menu_items || menuResponse.data.items || []);
      setTables(tablesResponse.data.tables || tablesResponse.data.bans || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Lỗi khi tải dữ liệu';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = orders;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => {
        // Handle both English and Vietnamese status fields
        const status = order.TrangThai || order.status || order.payment_status;
        return status === statusFilter;
      });
    }

    if (dateFilter) {
      filtered = filtered.filter(order => {
        // Handle both English and Vietnamese date fields
        const dateField = order.NgayLap || order.NgayOrder || order.createdAt || order.created_at;
        if (!dateField) return false;
        const orderDate = new Date(dateField).toISOString().split('T')[0];
        return orderDate === dateFilter;
      });
    }

    setFilteredOrders(filtered);
  };

  const handleEdit = (order) => {
    setEditingOrder(order);
    // Handle DonHang schema fields
    setValue('tableId', order.MaBan || order.tableId || order.table_id);
    setValue('staffId', order.MaNV || ''); // DonHang MaNV field
    setValue('status', order.TrangThai || order.status || 'Đang xử lý');
    setValue('notes', order.GhiChu || order.notes || '');
    setShowModal(true);
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa đơn hàng này?')) {
      try {
        await billingAPI.deleteOrder(id);
        toast.success('Xóa đơn hàng thành công');
        fetchData();
      } catch (error) {
        console.error('Delete error:', error);
        
        // Handle different error scenarios
        if (error.response?.status === 404) {
          toast.error('Đơn hàng không tồn tại hoặc đã bị xóa. Đang làm mới danh sách...');
          fetchData(); // Auto-refresh to remove stale data
        } else if (error.response?.status === 400) {
          const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Không thể xóa đơn hàng này';
          toast.error(errorMessage);
        } else {
          const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Lỗi khi xóa đơn hàng';
          toast.error(errorMessage);
        }
      }
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      // Update DonHang status
      await billingAPI.updateOrderStatus(id, { TrangThai: newStatus });
      toast.success('Cập nhật trạng thái thành công');
      fetchData();
    } catch (error) {
      console.error('Status update error:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Lỗi khi cập nhật trạng thái';
      toast.error(errorMessage);
    }
  };

  const onSubmit = async (data) => {
    try {
      if (editingOrder) {
        // For updates, update DonHang status
        const orderId = editingOrder.MaDH || editingOrder.id;
        await billingAPI.updateOrderStatus(orderId, { 
          TrangThai: data.status,
          GhiChu: data.notes 
        });
        toast.success('Cập nhật đơn hàng thành công');
      } else {
        // For new orders, create DonHang with Vietnamese schema
        const orderData = {
          MaBan: data.tableId,
          MaNV: data.staffId || null,
          TrangThai: data.status || 'Đang xử lý',
          TongTien: 0, // Will be calculated when items are added
          GhiChu: data.notes
        };
        await billingAPI.createOrder(orderData);
        toast.success('Thêm đơn hàng mới thành công');
      }
      setShowModal(false);
      setEditingOrder(null);
      reset();
      fetchData();
    } catch (error) {
      console.error('Form submission error:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Có lỗi xảy ra';
      toast.error(errorMessage);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Đang xử lý':
        return 'bg-yellow-100 text-yellow-800';
      case 'Hoàn thành':
        return 'bg-green-100 text-green-800';
      case 'Đã hủy':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'Đang xử lý':
        return 'Đang xử lý';
      case 'Hoàn thành':
        return 'Hoàn thành';
      case 'Đã hủy':
        return 'Đã hủy';
      default:
        return status || 'Không xác định';
    }
  };

  const calculateTotal = (items, order) => {
    // If order has TongTien, use it directly
    if (order && (order.TongTien || order.TongThanhToan)) {
      return order.TongTien || order.TongThanhToan;
    }
    
    if (!items || !Array.isArray(items)) return 0;
    return items.reduce((total, item) => {
      // Handle Vietnamese schema fields from CTDonHang, CTOrder, CTDonHangOnline
      const price = item.DonGia || item.price || item.unit_price || 0;
      const quantity = item.SoLuong || item.quantity || 0;
      const subtotal = item.ThanhTien || (price * quantity) || 0;
      return total + subtotal;
    }, 0);
  };

  // Helper function to get order ID - DonHang table only
  const getOrderId = (order) => {
    return order.MaDH || order.id;
  };

  // Helper function to get table info
  const getTableInfo = (order) => {
    const tableId = order.MaBan || order.tableId || order.table_id;
    const table = tables.find(t => (t.MaBan || t.id) === tableId);
    return table ? (table.TenBan || table.number || `Bàn ${tableId}`) : 'N/A';
  };

  // Helper function to get staff name - DonHang.MaNV field
  const getStaffName = (order) => {
    const staffId = order.MaNV || order.staff_id;
    // You would typically look up staff name from a staff list
    // For now, just show the staff ID
    return staffId ? `NV${staffId}` : 'Chưa gán';
  };

  // Helper function to get order date - DonHang.NgayLap field
  const getOrderDate = (order) => {
    const dateField = order.NgayLap || order.createdAt || order.created_at;
    return dateField ? new Date(dateField).toLocaleString('vi-VN') : 'N/A';
  };

  // Helper function to get order status - DonHang.TrangThai field
  const getOrderStatus = (order) => {
    return order.TrangThai || order.status || 'Đang xử lý';
  };

  // Helper function to get order total - DonHang.TongTien field
  const getOrderTotal = (order) => {
    return order.TongTien || order.total || 0;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm animate-pulse">
          <div className="bg-gray-300 h-8 w-48 rounded mb-4"></div>
          <div className="bg-gray-300 h-10 w-full rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý Đơn hàng</h1>
        <button
          onClick={() => {
            setEditingOrder(null);
            reset();
            setShowModal(true);
          }}
          className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors flex items-center space-x-2"
        >
          <FiPlus className="w-4 h-4" />
          <span>Tạo đơn hàng</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex items-center space-x-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ xử lý</option>
              <option value="preparing">Đang chuẩn bị</option>
              <option value="ready">Sẵn sàng</option>
              <option value="served">Đã phục vụ</option>
              <option value="paid">Đã thanh toán</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Đơn hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bàn
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nhân viên
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tổng tiền
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => {
                const orderId = getOrderId(order);
                const orderStatus = getOrderStatus(order);
                return (
                <tr key={orderId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">#{orderId}</div>
                      <div className="flex items-center text-sm text-gray-500">
                        <FiClock className="w-4 h-4 mr-1" />
                        {getOrderDate(order)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FiMapPin className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">
                        {getTableInfo(order)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FiUser className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">{getStaffName(order)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FiDollarSign className="w-4 h-4 text-gray-400 mr-1" />
                      <span className="text-sm font-medium text-gray-900">
                        {getOrderTotal(order).toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={orderStatus}
                      onChange={(e) => handleStatusChange(orderId, e.target.value)}
                      className={`text-xs font-medium px-2.5 py-0.5 rounded-full border-0 ${getStatusColor(orderStatus)}`}
                    >
                      <option value="Đang xử lý">Đang xử lý</option>
                      <option value="Hoàn thành">Hoàn thành</option>
                      <option value="Đã hủy">Đã hủy</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewDetails(order)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Xem chi tiết"
                      >
                        <FiEye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(order)}
                        className="text-amber-600 hover:text-amber-900"
                        title="Chỉnh sửa"
                      >
                        <FiEdit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => window.print()}
                        className="text-green-600 hover:text-green-900"
                        title="In hóa đơn"
                      >
                        <FiPrinter className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(orderId)}
                        className="text-red-600 hover:text-red-900"
                        title="Xóa"
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
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <FiDollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Không có đơn hàng nào</h3>
            <p className="text-gray-600">Thử thay đổi bộ lọc hoặc tạo đơn hàng mới</p>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingOrder ? 'Chỉnh sửa đơn hàng' : 'Tạo đơn hàng mới'}
            </h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bàn *
                </label>
                <select
                  {...register('tableId', { required: 'Bàn là bắt buộc' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  <option value="">Chọn bàn</option>
                  {tables.map((table) => {
                    const tableId = table.MaBan || table.id;
                    const tableName = table.TenBan || table.number || `Bàn ${tableId}`;
                    return (
                      <option key={tableId} value={tableId}>
                        {tableName}
                      </option>
                    );
                  })}
                </select>
                {errors.tableId && (
                  <p className="mt-1 text-sm text-red-600">{errors.tableId.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nhân viên phục vụ
                </label>
                <input
                  type="text"
                  {...register('staffId')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Mã nhân viên"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trạng thái *
                </label>
                <select
                  {...register('status', { required: 'Trạng thái là bắt buộc' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  <option value="">Chọn trạng thái</option>
                  <option value="Đang xử lý">Đang xử lý</option>
                  <option value="Hoàn thành">Hoàn thành</option>
                  <option value="Đã hủy">Đã hủy</option>
                </select>
                {errors.status && (
                  <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ghi chú
                </label>
                <textarea
                  {...register('notes')}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Ghi chú đặc biệt..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingOrder(null);
                    reset();
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Đang lưu...' : (editingOrder ? 'Cập nhật' : 'Tạo mới')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Chi tiết đơn hàng #{getOrderId(selectedOrder)}</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiTrash2 className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Thông tin đơn hàng</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Mã đơn:</span> #{getOrderId(selectedOrder)}</p>
                    <p><span className="font-medium">Thời gian:</span> {getOrderDate(selectedOrder)}</p>
                    <p><span className="font-medium">Bàn:</span> {getTableInfo(selectedOrder)}</p>
                    <p><span className="font-medium">Nhân viên:</span> {getStaffName(selectedOrder)}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Trạng thái</h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(getOrderStatus(selectedOrder))}`}>
                    {getStatusText(getOrderStatus(selectedOrder))}
                  </span>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Món đã order</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Món</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Số lượng</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Đơn giá</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {(selectedOrder.chitiet || selectedOrder.items || selectedOrder.CTDonHang || []).map((item, index) => {
                        const itemName = item.TenMon || item.name || 'N/A';
                        const quantity = item.SoLuong || item.quantity || 0;
                        const price = item.DonGia || item.price || item.unit_price || 0;
                        const subtotal = item.ThanhTien || (price * quantity) || 0;
                        return (
                        <tr key={index}>
                          <td className="px-4 py-2 text-sm text-gray-900">{itemName}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{quantity}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{price.toLocaleString('vi-VN')}đ</td>
                          <td className="px-4 py-2 text-sm font-medium text-gray-900">
                            {subtotal.toLocaleString('vi-VN')}đ
                          </td>
                        </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 text-right">
                  <p className="text-lg font-bold text-gray-900">
                    Tổng cộng: {getOrderTotal(selectedOrder).toLocaleString('vi-VN')}đ
                  </p>
                </div>
              </div>

              {/* Notes */}
              {(selectedOrder.GhiChu || selectedOrder.notes) && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Ghi chú</h3>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedOrder.GhiChu || selectedOrder.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
