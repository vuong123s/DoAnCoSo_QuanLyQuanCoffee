import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { FiRefreshCw, FiShoppingCart, FiTrash2, FiEdit3, FiDollarSign, FiPackage, FiPlus, FiX, FiCheck, FiClock, FiPrinter, FiXCircle } from 'react-icons/fi';
import { billingAPI, menuAPI, tableAPI, userAPI } from '../../shared/services/api';
import LoadingSpinner from '../../components/common/ui/LoadingSpinner';
import { useAuthStore } from '../../app/stores/authStore';
import POSMenuSection from '../../components/pos/POSMenuSection';
import POSCartSection from '../../components/pos/POSCartSection';
import POSOrdersList from '../../components/pos/POSOrdersList';
import POSOrderDetails from '../../components/pos/POSOrderDetails';
import PrintReceipt from '../../components/pos/PrintReceipt';

const POSSystem = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tables, setTables] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [activeOrders, setActiveOrders] = useState([]);
  
  // Cart state
  const [selectedTable, setSelectedTable] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [cart, setCart] = useState([]);
  const [pointsUsed, setPointsUsed] = useState(0); // Points to use for discount
  
  // Editing state
  const [editingOrder, setEditingOrder] = useState(null);
  const [editingOrderItems, setEditingOrderItems] = useState([]);
  const [editingPointsUsed, setEditingPointsUsed] = useState(0);
  
  const [stats, setStats] = useState({
    todayOrders: 0,
    todayRevenue: 0
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ordersRes, menuRes, categoriesRes, tablesRes, customersRes] = await Promise.all([
        billingAPI.getBills({ TrangThai: 'Đang xử lý' }),
        menuAPI.getMenuItems({ TrangThai: 'Còn hàng' }),
        menuAPI.getCategories(),
        tableAPI.getTables(),
        userAPI.getCustomers().catch(() => ({ data: { customers: [] } }))
      ]);
      
      const orders = ordersRes.data.donhangs || ordersRes.data.bills || [];
      setActiveOrders(orders);
      setMenuItems(menuRes.data.menus || menuRes.data.menu_items || []);
      setCategories(categoriesRes.data.categories || []);
      setTables(tablesRes.data.tables || []);
      setCustomers(customersRes.data.customers || []);
      
      const today = new Date().toDateString();
      const todayOrders = orders.filter(o => new Date(o.NgayLap).toDateString() === today);
      setStats({
        todayOrders: todayOrders.length,
        todayRevenue: todayOrders.reduce((sum, o) => sum + ((o.TongTien || 0) - (o.DiemSuDung || 0) * 1000), 0)
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const cartSubtotal = cart.reduce((sum, item) => sum + (item.DonGia * item.SoLuong), 0);
  const pointsDiscount = pointsUsed * 1000; // 1 điểm = 1,000 VNĐ
  const cartTotal = Math.max(0, cartSubtotal - pointsDiscount);

  const handleCreateOrder = async () => {
    if (!selectedTable) { toast.error('Vui lòng chọn bàn'); return; }
    if (cart.length === 0) { toast.error('Vui lòng thêm món vào đơn hàng'); return; }
    
    // Validate points if customer selected
    if (pointsUsed > 0 && selectedCustomer) {
      const availablePoints = selectedCustomer.DiemTichLuy || 0;
      if (pointsUsed > availablePoints) {
        toast.error(`Khách chỉ có ${availablePoints} điểm!`);
        return;
      }
    }
    
    try {
      const response = await billingAPI.createOrder({
        MaBan: selectedTable.MaBan || selectedTable.id,
        MaNV: user?.MaNV || user?.id || 1,
        MaKH: selectedCustomer?.MaKH || selectedCustomer?.id || null,
        TrangThai: 'Đang xử lý',
        DiemSuDung: pointsUsed, // Save points used for discount
        items: cart.map(item => ({
          MaMon: item.MaMon,
          SoLuong: item.SoLuong,
          DonGia: item.DonGia,
          GhiChu: item.GhiChu
        }))
      });
      
      // Deduct points if used
      if (pointsUsed > 0 && selectedCustomer) {
        try {
          await userAPI.deductPoints(selectedCustomer.MaKH || selectedCustomer.id, pointsUsed);
          toast.success(`Đã dùng ${pointsUsed} điểm (-${pointsUsed * 1000} VNĐ)`);
        } catch (error) {
          console.error('Error deducting points:', error);
          toast.warning('Tạo đơn thành công nhưng không trừ được điểm');
        }
      }
      
      toast.success('Tạo đơn hàng thành công!');
      setCart([]);
      setSelectedTable(null);
      setSelectedCustomer(null);
      setPointsUsed(0);
      fetchData();
    } catch (error) {
      toast.error('Lỗi khi tạo đơn hàng: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEditOrder = async (order) => {
    try {
      setEditingOrder(order);
      const response = await billingAPI.getOrderItems(order.MaDH || order.id);
      const items = response.data.items || response.data.order?.chitiet || [];
      setEditingOrderItems(items);
    } catch (error) {
      toast.error('Lỗi khi tải chi tiết đơn hàng');
    }
  };

  const handleAddItemToOrder = async (item) => {
    if (!editingOrder) return;
    
    try {
      await billingAPI.addItemToOrder(editingOrder.MaDH || editingOrder.id, {
        MaMon: item.MaMon || item.id,
        SoLuong: 1,
        DonGia: item.DonGia || item.Gia || item.price,
        GhiChu: ''
      });
      
      toast.success(`Đã thêm ${item.TenMon || item.name}`);
      handleEditOrder(editingOrder); // Refresh order items
      fetchData(); // Refresh orders list
    } catch (error) {
      toast.error('Lỗi khi thêm món: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleUpdateOrderItem = async (itemId, updates) => {
    if (!editingOrder) return;
    
    try {
      await billingAPI.updateOrderItem(editingOrder.MaDH || editingOrder.id, itemId, updates);
      toast.success('Cập nhật thành công');
      handleEditOrder(editingOrder);
      fetchData();
    } catch (error) {
      toast.error('Lỗi khi cập nhật: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleUpdateOrderTable = async (newTableId) => {
    if (!editingOrder) return;
    
    try {
      await billingAPI.updatePaymentStatus(editingOrder.MaDH || editingOrder.id, {
        MaBan: newTableId
      });
      toast.success('Đã chuyển bàn');
      setEditingOrder({ ...editingOrder, MaBan: newTableId });
      fetchData();
    } catch (error) {
      toast.error('Lỗi khi chuyển bàn: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleUpdateOrderCustomer = async (newCustomerId) => {
    if (!editingOrder) return;
    
    try {
      await billingAPI.updatePaymentStatus(editingOrder.MaDH || editingOrder.id, {
        MaKH: newCustomerId || null
      });
      toast.success('Đã cập nhật khách hàng');
      setEditingOrder({ ...editingOrder, MaKH: newCustomerId });
      fetchData();
    } catch (error) {
      toast.error('Lỗi khi cập nhật khách hàng: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleRemoveOrderItem = async (itemId) => {
    if (!editingOrder) return;
    
    if (!window.confirm('Xóa món này khỏi đơn hàng?')) return;
    
    try {
      await billingAPI.removeOrderItem(editingOrder.MaDH || editingOrder.id, itemId);
      toast.success('Đã xóa món');
      handleEditOrder(editingOrder);
      fetchData();
    } catch (error) {
      toast.error('Lỗi khi xóa món: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleCancelOrder = async (orderId) => {
    const reason = window.prompt('Lý do hủy đơn:');
    if (!reason) return;
    
    try {
      await billingAPI.cancelOrder(orderId, reason);
      toast.success('Đã hủy đơn hàng');
      setEditingOrder(null);
      fetchData();
    } catch (error) {
      toast.error('Lỗi khi hủy đơn: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Xóa vĩnh viễn đơn hàng này? Hành động này không thể hoàn tác!')) return;
    
    try {
      await billingAPI.deleteOrder(orderId);
      toast.success('Đã xóa đơn hàng');
      setEditingOrder(null);
      fetchData();
    } catch (error) {
      toast.error('Lỗi khi xóa đơn: ' + (error.response?.data?.message || error.message));
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCompleteOrder = async (orderId) => {
    if (!window.confirm('Hoàn thành đơn hàng này?')) return;
    
    try {
      await billingAPI.updatePaymentStatus(orderId, { TrangThai: 'Hoàn thành' });
      toast.success('Đơn hàng đã hoàn thành');
      setEditingOrder(null);
      setEditingOrderItems([]);
      fetchData();
    } catch (error) {
      toast.error('Lỗi khi hoàn thành đơn: ' + (error.response?.data?.message || error.message));
    }
  };

  const getTableName = (tableId) => {
    const table = tables.find(t => (t.MaBan || t.id) === tableId);
    return table ? `Bàn ${table.TenBan || table.name || tableId}` : `Bàn ${tableId}`;
  };

  const getCustomerName = (customerId) => {
    if (!customerId) return 'Khách vãng lai';
    const customer = customers.find(c => (c.MaKH || c.id) === customerId);
    return customer ? `${customer.HoTen || customer.TenKH || customer.name} - ${customer.SDT || customer.phone || ''}` : `Khách #${customerId}`;
  };

  const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);

  if (loading) return <LoadingSpinner text="Đang tải hệ thống bán hàng..." />;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Hệ thống bán hàng (POS)</h1>
            <p className="text-gray-600 mt-1">Quản lý đơn hàng và bán hàng tại quầy</p>
          </div>
          <button onClick={fetchData} className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
            <FiRefreshCw className="w-4 h-4" />
            <span>Làm mới</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Đơn hàng hôm nay</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.todayOrders}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FiPackage className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Doanh thu hôm nay</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(stats.todayRevenue)}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FiDollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Menu Section - 5 columns */}
        <div className="lg:col-span-5">
          <POSMenuSection 
            menuItems={menuItems}
            categories={categories}
            onAddToCart={(item) => {
              if (editingOrder) {
                handleAddItemToOrder(item);
              } else {
                const existing = cart.find(i => i.MaMon === (item.MaMon || item.id));
                if (existing) {
                  setCart(cart.map(i => i.MaMon === (item.MaMon || item.id) ? { ...i, SoLuong: i.SoLuong + 1 } : i));
                } else {
                  setCart([...cart, { MaMon: item.MaMon || item.id, TenMon: item.TenMon || item.name, DonGia: item.DonGia || item.Gia || item.price, SoLuong: 1, GhiChu: '' }]);
                }
                toast.success(`Đã thêm ${item.TenMon || item.name}`);
              }
            }}
          />
        </div>

        {/* Cart/Order Editor - 4 columns */}
        <div className="lg:col-span-4">
          {editingOrder ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Sửa đơn #{editingOrder.MaDH}</h2>
                <button onClick={() => { setEditingOrder(null); setEditingOrderItems([]); }} className="text-gray-500 hover:text-gray-700">
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              {/* Order Info */}
              <div className="space-y-3 mb-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <label className="text-sm text-gray-600 block mb-2">Bàn *</label>
                  <select
                    value={editingOrder.MaBan}
                    onChange={(e) => handleUpdateOrderTable(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {tables.map(table => (
                      <option key={table.MaBan || table.id} value={table.MaBan || table.id}>
                        Bàn {table.TenBan || table.name} ({table.TrangThai})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <label className="text-sm text-gray-600 block mb-2">Khách hàng</label>
                  <select
                    value={editingOrder.MaKH || ''}
                    onChange={(e) => handleUpdateOrderCustomer(e.target.value ? parseInt(e.target.value) : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">-- Khách vãng lai --</option>
                    {customers.map(customer => (
                      <option key={customer.MaKH || customer.id} value={customer.MaKH || customer.id}>
                        {customer.HoTen || customer.TenKH || customer.name} - {customer.SDT || customer.phone || 'N/A'}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {editingOrder.MaKH ? getCustomerName(editingOrder.MaKH) : 'Không tích điểm'}
                  </p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">Nhân viên</p>
                  <p className="font-medium">NV #{editingOrder.MaNV}</p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">Thời gian tạo</p>
                  <p className="font-medium">{new Date(editingOrder.NgayLap).toLocaleString('vi-VN')}</p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">Trạng thái</p>
                  <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium mt-1">
                    {editingOrder.TrangThai}
                  </span>
                </div>
              </div>

              <div className="border-t pt-4 mb-4">
                <h3 className="font-medium text-gray-900 mb-3">Món trong đơn ({editingOrderItems.length})</h3>
              </div>

              <div className="space-y-3 mb-4 max-h-[300px] overflow-y-auto scrollbar-hide">
                {editingOrderItems.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900 flex-1">{item.Mon?.TenMon || item.TenMon || `Món #${item.MaMon}`}</h4>
                      <button onClick={() => handleRemoveOrderItem(item.MaCTDH || item.id)} className="text-red-500 hover:text-red-700 ml-2">
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <button onClick={() => handleUpdateOrderItem(item.MaCTDH || item.id, { SoLuong: item.SoLuong - 1 })} className="w-8 h-8 bg-red-100 text-red-600 rounded-full hover:bg-red-200 font-semibold">-</button>
                        <span className="font-medium w-8 text-center">{item.SoLuong}</span>
                        <button onClick={() => handleUpdateOrderItem(item.MaCTDH || item.id, { SoLuong: item.SoLuong + 1 })} className="w-8 h-8 bg-green-100 text-green-600 rounded-full hover:bg-green-200 font-semibold">+</button>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-blue-600">{formatCurrency(item.DonGia * item.SoLuong)}</div>
                        <div className="text-xs text-gray-500">{item.SoLuong} x {formatCurrency(item.DonGia)}</div>
                      </div>
                    </div>

                    <input
                      type="text"
                      placeholder="Ghi chú món (vd: ít đá, không đường...)"
                      value={item.GhiChu || ''}
                      onChange={(e) => {
                        setEditingOrderItems(editingOrderItems.map((it, idx) => 
                          idx === index ? { ...it, GhiChu: e.target.value } : it
                        ));
                      }}
                      onBlur={(e) => {
                        if (e.target.value !== item.GhiChu) {
                          handleUpdateOrderItem(item.MaCTDH || item.id, { GhiChu: e.target.value });
                        }
                      }}
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 mb-4">
                {/* Show discount if points were used */}
                {editingOrder.DiemSuDung > 0 && (
                  <>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Tạm tính:</span>
                      <span className="text-gray-900">{formatCurrency((editingOrder.TongTien || 0) + (editingOrder.DiemSuDung * 1000))}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-green-600">🎖️ Giảm giá ({editingOrder.DiemSuDung} điểm):</span>
                      <span className="text-green-600 font-semibold">-{formatCurrency(editingOrder.DiemSuDung * 1000)}</span>
                    </div>
                    <div className="border-t border-gray-200 my-2"></div>
                  </>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Tổng cộng:</span>
                  <span className="text-2xl font-bold text-blue-600">{formatCurrency(editingOrder.TongTien - editingOrder.DiemSuDung * 1000)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <button 
                  onClick={handlePrint}
                  className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center"
                >
                  <FiPrinter className="mr-2" />In hóa đơn
                </button>
                <button 
                  onClick={() => handleCompleteOrder(editingOrder.MaDH)} 
                  className="w-full py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center justify-center"
                >
                  <FiCheck className="mr-2" />Hoàn thành
                </button>
                <button 
                  onClick={() => handleCancelOrder(editingOrder.MaDH)} 
                  className="w-full py-2 px-4 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-medium flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={editingOrder.TrangThai === 'Hoàn thành' || editingOrder.TrangThai === 'Đã hủy'}
                >
                  <FiXCircle className="mr-2" />Hủy đơn
                </button>
                <button 
                  onClick={() => handleDeleteOrder(editingOrder.MaDH)} 
                  className="w-full py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium flex items-center justify-center"
                >
                  <FiTrash2 className="mr-2" />Xóa vĩnh viễn
                </button>
              </div>
            </div>
          ) : (
            <POSCartSection
              cart={cart}
              tables={tables}
              customers={customers}
              selectedTable={selectedTable}
              selectedCustomer={selectedCustomer}
              cartTotal={cartTotal}
              cartSubtotal={cartSubtotal}
              pointsUsed={pointsUsed}
              onPointsChange={setPointsUsed}
              onTableSelect={setSelectedTable}
              onCustomerSelect={(customer) => {
                setSelectedCustomer(customer);
                setPointsUsed(0); // Reset points when changing customer
              }}
              onUpdateQuantity={(maMon, qty) => {
                if (qty <= 0) setCart(cart.filter(i => i.MaMon !== maMon));
                else setCart(cart.map(i => i.MaMon === maMon ? { ...i, SoLuong: qty } : i));
              }}
              onUpdateNote={(maMon, note) => setCart(cart.map(i => i.MaMon === maMon ? { ...i, GhiChu: note } : i))}
              onRemove={(maMon) => setCart(cart.filter(i => i.MaMon !== maMon))}
              onClear={() => { setCart([]); setSelectedTable(null); setSelectedCustomer(null); setPointsUsed(0); }}
              onCreateOrder={handleCreateOrder}
              formatCurrency={formatCurrency}
            />
          )}
        </div>

        {/* Active Orders Sidebar - 3 columns */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sticky top-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Đơn đang xử lý ({activeOrders.length})</h2>
            <div className="space-y-2 max-h-[600px] overflow-y-auto scrollbar-hide">
              {activeOrders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FiPackage className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">Không có đơn</p>
                </div>
              ) : (
                activeOrders.map(order => (
                  <button key={order.MaDH || order.id} onClick={() => handleEditOrder(order)} className={`w-full text-left p-3 border-2 rounded-lg transition-all ${
                    editingOrder && (editingOrder.MaDH || editingOrder.id) === (order.MaDH || order.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-sm">#{order.MaDH}</h3>
                      <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">{order.TrangThai}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{getTableName(order.MaBan)}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        <FiClock className="inline w-3 h-3 mr-1" />
                        {new Date(order.NgayLap).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="font-bold text-sm text-blue-600">{formatCurrency(order.TongTien - (order.DiemSuDung || 0) * 1000)}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hidden print receipt component */}
      <div className="print-only-container">
        {editingOrder && (
          <PrintReceipt
            order={editingOrder}
            items={editingOrderItems}
            table={getTableName(editingOrder.MaBan)}
            customer={editingOrder.MaKH ? getCustomerName(editingOrder.MaKH) : null}
            formatCurrency={formatCurrency}
          />
        )}
      </div>
      
      <style>{`
        /* Hide on screen */
        @media screen {
          .print-only-container {
            position: absolute;
            left: -9999px;
            top: -9999px;
          }
        }
        
        /* Show only receipt when printing */
        @media print {
          /* Hide everything */
          body * {
            visibility: hidden;
          }
          
          /* Show only receipt container and its content */
          .print-only-container,
          .print-only-container * {
            visibility: visible;
          }
          
          /* Center receipt on page */
          .print-only-container {
            position: absolute;
            left: 50%;
            top: 0;
            transform: translateX(-50%);
          }
          
          /* Format for 120mm receipt printer */
          @page {
            size: 120mm auto;
            margin: 0;
          }
          
          html, body {
            width: 120mm;
            margin: 0;
            padding: 0;
          }
          
          .print-receipt {
            width: 120mm !important;
            max-width: 120mm !important;
            margin: 0 !important;
            padding: 10mm !important;
            background: white !important;
          }
          
          /* Ensure colors print */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
    </div>
  );
};

export default POSSystem;
