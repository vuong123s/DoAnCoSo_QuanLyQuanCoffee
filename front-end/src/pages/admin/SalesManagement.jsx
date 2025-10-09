import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { ordersAPI, menuAPI, tableAPI } from '../../shared/services/api';
import LoadingSpinner from '../../components/common/ui/LoadingSpinner';

const SalesManagement = () => {
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [tables, setTables] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  
  const [newOrder, setNewOrder] = useState({
    MaBan: '',
    MaNV: 1,
    TrangThai: 'Đang phục vụ',
    GhiChu: ''
  });
  
  const [newItem, setNewItem] = useState({
    MaMon: '',
    SoLuong: 1,
    GhiChu: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ordersResponse, menuResponse, tablesResponse] = await Promise.all([
        ordersAPI.getOrders({ TrangThai: 'Đang phục vụ' }),
        menuAPI.getMenuItems({ TrangThai: 'Còn hàng' }),
        tableAPI.getTables()
      ]);

      setOrders(ordersResponse.data.orders || []);
      setMenuItems(menuResponse.data.menus || menuResponse.data.menu_items || []);
      setTables(tablesResponse.data.tables || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderItems = async (orderId) => {
    try {
      const response = await ordersAPI.getOrderItems(orderId);
      setOrderItems(response.data.items || response.data.order?.chitiet || []);
    } catch (error) {
      console.error('Error fetching order items:', error);
      toast.error('Lỗi khi tải chi tiết đơn hàng');
    }
  };

  const handleSelectOrder = async (order) => {
    setSelectedOrder(order);
    await fetchOrderItems(order.MaOrder || order.id);
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    try {
      await ordersAPI.createOrder(newOrder);
      toast.success('Tạo đơn hàng thành công');
      setShowOrderModal(false);
      setNewOrder({ MaBan: '', MaNV: 1, TrangThai: 'Đang phục vụ', GhiChu: '' });
      fetchData();
    } catch (error) {
      console.error('Error creating order:', error);
      const errorMessage = error.response?.data?.message || 'Lỗi khi tạo đơn hàng';
      toast.error(errorMessage);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!selectedOrder) {
      toast.error('Vui lòng chọn đơn hàng');
      return;
    }

    try {
      const orderId = selectedOrder.MaOrder || selectedOrder.id;
      await ordersAPI.addItemToOrder(orderId, newItem);
      toast.success('Thêm món thành công');
      setShowAddItemModal(false);
      setNewItem({ MaMon: '', SoLuong: 1, GhiChu: '' });
      await fetchOrderItems(orderId);
      fetchData();
    } catch (error) {
      console.error('Error adding item:', error);
      const errorMessage = error.response?.data?.message || 'Lỗi khi thêm món';
      toast.error(errorMessage);
    }
  };

  const handleUpdateItem = async (itemId, updates) => {
    if (!selectedOrder) return;

    try {
      const orderId = selectedOrder.MaOrder || selectedOrder.id;
      await ordersAPI.updateOrderItem(orderId, itemId, updates);
      toast.success('Cập nhật món thành công');
      await fetchOrderItems(orderId);
      fetchData();
    } catch (error) {
      console.error('Error updating item:', error);
      const errorMessage = error.response?.data?.message || 'Lỗi khi cập nhật món';
      toast.error(errorMessage);
    }
  };

  const handleRemoveItem = async (itemId) => {
    if (!selectedOrder) return;

    if (window.confirm('Bạn có chắc chắn muốn xóa món này?')) {
      try {
        const orderId = selectedOrder.MaOrder || selectedOrder.id;
        await ordersAPI.removeOrderItem(orderId, itemId);
        toast.success('Xóa món thành công');
        await fetchOrderItems(orderId);
        fetchData();
      } catch (error) {
        console.error('Error removing item:', error);
        const errorMessage = error.response?.data?.message || 'Lỗi khi xóa món';
        toast.error(errorMessage);
      }
    }
  };

  const handleCompleteOrder = async () => {
    if (!selectedOrder) return;

    if (window.confirm('Bạn có chắc chắn muốn hoàn thành đơn hàng này?')) {
      try {
        const orderId = selectedOrder.MaOrder || selectedOrder.id;
        await ordersAPI.updateOrderStatus(orderId, { TrangThai: 'Đã hoàn thành' });
        toast.success('Hoàn thành đơn hàng thành công');
        setSelectedOrder(null);
        setOrderItems([]);
        fetchData();
      } catch (error) {
        console.error('Error completing order:', error);
        const errorMessage = error.response?.data?.message || 'Lỗi khi hoàn thành đơn hàng';
        toast.error(errorMessage);
      }
    }
  };

  const getTableName = (tableId) => {
    const table = tables.find(t => (t.MaBan || t.id) === tableId);
    return table ? `Bàn ${table.TenBan || table.name || tableId}` : `Bàn ${tableId}`;
  };

  const getMenuItemName = (itemId) => {
    const item = menuItems.find(m => (m.MaMon || m.id) === itemId);
    return item ? (item.TenMon || item.name) : `Món ${itemId}`;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount || 0);
  };

  if (loading) {
    return <LoadingSpinner text="Đang tải dữ liệu bán hàng..." />;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Quản lý bán hàng</h1>
          <p className="text-gray-600 mt-2">Quản lý đơn hàng tại chỗ (Orders)</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Menu Items Panel */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Menu ({menuItems.length} món)</h2>
            </div>
            <div className="p-4 max-h-96 overflow-y-auto">
              {menuItems.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Không có món nào</p>
              ) : (
                <div className="space-y-2">
                  {menuItems.map((item) => (
                    <div
                      key={item.MaMon || item.id}
                      onClick={() => {
                        if (selectedOrder) {
                          setNewItem({
                            MaMon: item.MaMon || item.id,
                            SoLuong: 1,
                            GhiChu: ''
                          });
                          setShowAddItemModal(true);
                        } else {
                          toast.error('Vui lòng chọn đơn hàng trước');
                        }
                      }}
                      className="p-3 border rounded-lg cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-colors"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-gray-900 text-sm">
                            {item.TenMon || item.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {item.MoTa || 'Không có mô tả'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600 text-sm">
                            {formatCurrency(item.DonGia || item.price)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Orders List */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">Đơn hàng ({orders.length})</h2>
              <button
                onClick={() => setShowOrderModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Tạo đơn hàng
              </button>
            </div>
            <div className="p-4 max-h-96 overflow-y-auto">
              {orders.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Không có đơn hàng nào</p>
              ) : (
                <div className="space-y-3">
                  {orders.map((order) => (
                    <div
                      key={order.MaOrder || order.id}
                      onClick={() => handleSelectOrder(order)}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedOrder?.MaOrder === order.MaOrder || selectedOrder?.id === order.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">
                            Đơn #{order.MaOrder || order.id}
                          </p>
                          <p className="text-sm text-gray-600">
                            {getTableName(order.MaBan)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(order.NgayOrder || order.createdAt).toLocaleString('vi-VN')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600">
                            {formatCurrency(order.TongTien)}
                          </p>
                          <span className="inline-block px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                            {order.TrangThai}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Order Details */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">
                {selectedOrder ? `Chi tiết đơn #${selectedOrder.MaOrder || selectedOrder.id}` : 'Chọn đơn hàng'}
              </h2>
              {selectedOrder && (
                <div className="space-x-2">
                  <button
                    onClick={() => setShowAddItemModal(true)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Thêm món
                  </button>
                  <button
                    onClick={handleCompleteOrder}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Hoàn thành
                  </button>
                </div>
              )}
            </div>
            <div className="p-4">
              {!selectedOrder ? (
                <p className="text-gray-500 text-center py-8">Vui lòng chọn một đơn hàng để xem chi tiết</p>
              ) : (
                <div>
                  {/* Order Info */}
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Bàn:</span> {getTableName(selectedOrder.MaBan)}
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Trạng thái:</span> {selectedOrder.TrangThai}
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Tổng tiền:</span> {formatCurrency(selectedOrder.TongTien)}
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Thời gian:</span> {new Date(selectedOrder.NgayOrder || selectedOrder.createdAt).toLocaleString('vi-VN')}
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-3">
                    <h3 className="font-medium text-gray-800">Món ăn trong đơn hàng:</h3>
                    {orderItems.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">Chưa có món ăn nào</p>
                    ) : (
                      orderItems.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              {getMenuItemName(item.MaMon)}
                            </p>
                            <div className="flex items-center space-x-4 mt-1">
                              <span className="text-sm text-gray-600">
                                SL: 
                                <input
                                  type="number"
                                  min="1"
                                  value={item.SoLuong}
                                  onChange={(e) => handleUpdateItem(item.MaMon, { SoLuong: parseInt(e.target.value) })}
                                  className="ml-1 w-16 px-1 py-0.5 border rounded text-center"
                                />
                              </span>
                              <span className="text-sm text-gray-600">
                                Trạng thái: {item.TrangThaiMon || 'Chờ xử lý'}
                              </span>
                            </div>
                            {item.GhiChu && (
                              <p className="text-xs text-gray-500 mt-1">Ghi chú: {item.GhiChu}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <button
                              onClick={() => handleRemoveItem(item.MaMon)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Xóa
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create Order Modal */}
      {showOrderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Tạo đơn hàng mới</h3>
            <form onSubmit={handleCreateOrder}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chọn bàn * ({tables.filter(table => table.TrangThai === 'Trống').length} bàn trống)
                </label>
                <select
                  value={newOrder.MaBan}
                  onChange={(e) => setNewOrder({ ...newOrder, MaBan: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">-- Chọn bàn trống --</option>
                  {tables.filter(table => table.TrangThai === 'Trống').map((table) => (
                    <option key={table.MaBan || table.id} value={table.MaBan || table.id}>
                      🪑 {getTableName(table.MaBan || table.id)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ghi chú
                </label>
                <textarea
                  value={newOrder.GhiChu}
                  onChange={(e) => setNewOrder({ ...newOrder, GhiChu: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows="3"
                  placeholder="Ghi chú cho đơn hàng..."
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowOrderModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Tạo đơn hàng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {showAddItemModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Thêm món vào đơn hàng</h3>
            <form onSubmit={handleAddItem}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chọn món *
                </label>
                <select
                  value={newItem.MaMon}
                  onChange={(e) => setNewItem({ ...newItem, MaMon: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">-- Chọn món --</option>
                  {menuItems.map((item) => (
                    <option key={item.MaMon || item.id} value={item.MaMon || item.id}>
                      🍽️ {item.TenMon || item.name} - {formatCurrency(item.DonGia || item.price)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số lượng *
                </label>
                <input
                  type="number"
                  min="1"
                  value={newItem.SoLuong}
                  onChange={(e) => setNewItem({ ...newItem, SoLuong: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ghi chú
                </label>
                <input
                  type="text"
                  value={newItem.GhiChu}
                  onChange={(e) => setNewItem({ ...newItem, GhiChu: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="VD: ít đá, thêm đường..."
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddItemModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Thêm món
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesManagement;
