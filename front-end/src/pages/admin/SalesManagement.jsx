import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { FiSearch, FiPlus, FiRefreshCw, FiClock, FiMapPin, FiTrash2, FiMinus, FiEdit3 } from 'react-icons/fi';
import { billingAPI, menuAPI, tableAPI } from '../../shared/services/api';
import LoadingSpinner from '../../components/common/ui/LoadingSpinner';
import { useAuthStore } from '../../app/stores/authStore';

// Sales Management Component - Updated with 3-column layout
const SalesManagement = () => {
  const { user } = useAuthStore(); // Get current user from auth store
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tables, setTables] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [currentOrder, setCurrentOrder] = useState({ items: [], total: 0 });
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  
  // Filter states for menu
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredMenuItems, setFilteredMenuItems] = useState([]);
  
  // Filter states for orders
  const [orderStatusFilter, setOrderStatusFilter] = useState(''); // All, Đang xử lý, Hoàn thành, Đã hủy
  const [orderDateFilter, setOrderDateFilter] = useState(''); // Today, Yesterday, This week, etc.
  const [orderEmployeeFilter, setOrderEmployeeFilter] = useState(''); // Filter by employee
  const [filteredOrders, setFilteredOrders] = useState([]);
  
  const [newOrder, setNewOrder] = useState({
    MaBan: '',
    MaNV: user?.MaNV || user?.id || 1, // Get employee ID from logged-in user
    TrangThai: 'Đang xử lý',
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

  // Update employee ID when user changes
  useEffect(() => {
    if (user) {
      setNewOrder(prev => ({
        ...prev,
        MaNV: user.MaNV || user.id || 1
      }));
    }
  }, [user]);


  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch orders from billing service
      const ordersResponse = await billingAPI.getBills();
      
      // Fetch real data from APIs
      let menuResponse, categoriesResponse, tablesResponse;
      
      menuResponse = await menuAPI.getMenuItems({ TrangThai: 'Còn hàng' });
      
      categoriesResponse = await menuAPI.getCategories();
      
      tablesResponse = await tableAPI.getTables();

      // Get all orders from API
      const allOrders = ordersResponse.data.donhangs || ordersResponse.data.bills || [];
      console.log('All orders from API:', allOrders);
      
      // Show all orders (not filtering by status)
      setOrders(allOrders);
      
      // Set menu items
      const items = menuResponse.data.menus || menuResponse.data.menu_items || [];
      setMenuItems(items);
      setFilteredMenuItems(items);
      
      // Set categories
      setCategories(categoriesResponse.data.categories || []);
      
      // Set tables
      setTables(tablesResponse.data.tables || []);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Lỗi khi tải dữ liệu: ' + (error.message || 'Không thể kết nối đến server'));
      
      // Set empty data on error
      setMenuItems([]);
      setFilteredMenuItems([]);
      setCategories([]);
      setTables([]);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter menu items
  useEffect(() => {
    let filtered = menuItems;
    
    if (selectedCategory) {
      filtered = filtered.filter(item => (item.MaLoai || item.MaDM || item.category_id) == selectedCategory);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(item => 
        (item.TenMon || item.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.MoTa || item.description || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredMenuItems(filtered);
  }, [menuItems, selectedCategory, searchTerm]);

  // Filter orders
  useEffect(() => {
    let filtered = orders;
    
    // Filter by status
    if (orderStatusFilter) {
      filtered = filtered.filter(order => order.TrangThai === orderStatusFilter);
    }
    
    // Filter by date
    if (orderDateFilter) {
      const today = new Date();
      
      switch (orderDateFilter) {
        case 'today':
          filtered = filtered.filter(order => {
            const orderDate = new Date(order.NgayLap || order.createdAt);
            return orderDate.toDateString() === today.toDateString();
          });
          break;
        case 'yesterday':
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          filtered = filtered.filter(order => {
            const orderDate = new Date(order.NgayLap || order.createdAt);
            return orderDate.toDateString() === yesterday.toDateString();
          });
          break;
        case 'thisweek':
          const weekStart = new Date(today);
          weekStart.setDate(today.getDate() - today.getDay());
          filtered = filtered.filter(order => {
            const orderDate = new Date(order.NgayLap || order.createdAt);
            return orderDate >= weekStart;
          });
          break;
        case 'thismonth':
          const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
          filtered = filtered.filter(order => {
            const orderDate = new Date(order.NgayLap || order.createdAt);
            return orderDate >= monthStart;
          });
          break;
      }
    }
    
    // Filter by employee
    if (orderEmployeeFilter) {
      filtered = filtered.filter(order => (order.MaNV || order.employeeId) == orderEmployeeFilter);
    }
    
    setFilteredOrders(filtered);
  }, [orders, orderStatusFilter, orderDateFilter, orderEmployeeFilter]);

  // Calculate total when items change
  useEffect(() => {
    const total = currentOrder.items.reduce((sum, item) => 
      sum + (item.DonGia * item.SoLuong), 0
    );
    setCurrentOrder(prev => ({ ...prev, total }));
  }, [currentOrder.items]);

  // Add item to current order
  const addToCurrentOrder = (menuItem) => {
    const existingItem = currentOrder.items.find(item => item.MaMon === (menuItem.MaMon || menuItem.id));
    
    if (existingItem) {
      setCurrentOrder(prev => ({
        ...prev,
        items: prev.items.map(item => 
          item.MaMon === (menuItem.MaMon || menuItem.id)
            ? { ...item, SoLuong: item.SoLuong + 1 }
            : item
        )
      }));
    } else {
      setCurrentOrder(prev => ({
        ...prev,
        items: [...prev.items, {
          MaMon: menuItem.MaMon || menuItem.id,
          TenMon: menuItem.TenMon || menuItem.name,
          DonGia: menuItem.DonGia || menuItem.price,
          SoLuong: 1,
          GhiChu: ''
        }]
      }));
    }
    
    toast.success(`Đã thêm ${menuItem.TenMon || menuItem.name}`);
  };

  // Remove item from current order
  const removeFromCurrentOrder = (maMon) => {
    setCurrentOrder(prev => ({
      ...prev,
      items: prev.items.filter(item => item.MaMon !== maMon)
    }));
  };

  // Update item quantity
  const updateItemQuantity = (maMon, quantity) => {
    if (quantity <= 0) {
      removeFromCurrentOrder(maMon);
      return;
    }
    
    setCurrentOrder(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.MaMon === maMon 
          ? { ...item, SoLuong: quantity }
          : item
      )
    }));
  };

  // Update item note
  const updateItemNote = (maMon, note) => {
    setCurrentOrder(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.MaMon === maMon 
          ? { ...item, GhiChu: note }
          : item
      )
    }));
  };

  // Create new order
  const createOrder = async () => {
    if (!newOrder.MaBan || currentOrder.items.length === 0) {
      toast.error('Vui lòng chọn bàn và thêm món');
      return;
    }

    try {
      // Step 1: Create the order first
      const orderData = {
        ...newOrder,
        TongTien: currentOrder.total
      };
      
      const orderResponse = await billingAPI.createOrder(orderData);
      console.log('Order response:', orderResponse.data); // Debug log
      
      // Try multiple possible response formats
      const createdOrderId = orderResponse.data.orderId || 
                           orderResponse.data.MaDH || 
                           orderResponse.data.id || 
                           orderResponse.data.order?.MaDH ||
                           orderResponse.data.order?.id ||
                           orderResponse.data.bill?.MaDH ||
                           orderResponse.data.bill?.id;
      
      if (!createdOrderId) {
        console.error('Full response:', orderResponse);
        console.log('Trying fallback approach - creating order with items included');
        
        // Fallback: Try creating order with items included in one request
        try {
          const fallbackOrderData = {
            ...newOrder,
            TongTien: currentOrder.total,
            items: currentOrder.items // Include items in the main request
          };
          
          await billingAPI.createOrder(fallbackOrderData);
          toast.success(`Tạo đơn hàng thành công với ${currentOrder.items.length} món (fallback)`);
          
          // Reset form and refresh data
          setCurrentOrder({ items: [], total: 0 });
          setNewOrder({
            MaBan: '',
            MaNV: user?.MaNV || user?.id || 1,
            TrangThai: 'Đang xử lý',
            GhiChu: ''
          });
          await fetchData();
          return;
          
        } catch (fallbackError) {
          console.error('Fallback also failed:', fallbackError);
          throw new Error('Không thể tạo đơn hàng. Vui lòng thử lại.');
        }
      }
      
      // Step 2: Add each item to the order details
      let successfulItems = 0;
      for (const item of currentOrder.items) {
        try {
          const itemData = {
            MaDH: createdOrderId,
            MaMon: item.MaMon,
            SoLuong: item.SoLuong,
            DonGia: item.DonGia,
            ThanhTien: item.DonGia * item.SoLuong,
            GhiChu: item.GhiChu || ''
          };
          
          await billingAPI.addItemToOrder(createdOrderId, itemData);
          successfulItems++;
        } catch (itemError) {
          console.error(`Error adding item ${item.MaMon}:`, itemError);
          // Continue with other items even if one fails
        }
      }
      
      if (successfulItems === currentOrder.items.length) {
        toast.success(`Tạo đơn hàng thành công với ${successfulItems} món`);
      } else {
        toast.success(`Tạo đơn hàng thành công. Thêm được ${successfulItems}/${currentOrder.items.length} món`);
      }
      
      // Reset form
      setCurrentOrder({ items: [], total: 0 });
      setNewOrder({
        MaBan: '',
        MaNV: user?.MaNV || user?.id || 1,
        TrangThai: 'Đang xử lý',
        GhiChu: ''
      });
      
      // Refresh data to show the new order
      await fetchData();
      
      // Auto-select the newly created order to show details
      try {
        const newOrderData = {
          MaDH: createdOrderId,
          id: createdOrderId,
          MaBan: orderData.MaBan,
          MaNV: orderData.MaNV,
          TrangThai: orderData.TrangThai,
          TongTien: orderData.TongTien,
          NgayLap: new Date().toISOString()
        };
        setSelectedOrder(newOrderData);
        await fetchOrderItems(createdOrderId);
      } catch (selectError) {
        console.log('Could not auto-select order:', selectError);
        // This is not critical, so we don't show error to user
      }
      
    } catch (error) {
      console.error('Error creating order:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Lỗi khi tạo đơn hàng';
      toast.error(errorMessage);
    }
  };

  const fetchOrderItems = async (orderId) => {
    try {
      const response = await billingAPI.getOrderItems(orderId);
      setOrderItems(response.data.items || response.data.order?.chitiet || []);
    } catch (error) {
      console.error('Error fetching order items:', error);
      toast.error('Lỗi khi tải chi tiết đơn hàng');
    }
  };

  const handleSelectOrder = async (order) => {
    setSelectedOrder(order);
    // Use chitiet from order data if available, otherwise fetch from API
    if (order.chitiet && order.chitiet.length > 0) {
      setOrderItems(order.chitiet);
    } else {
      await fetchOrderItems(order.MaDH || order.id);
    }
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    try {
      await billingAPI.createOrder(newOrder);
      toast.success('Tạo đơn hàng thành công');
      setShowOrderModal(false);
      setNewOrder({ MaBan: '', MaNV: user?.MaNV || user?.id || 1, TrangThai: 'Đang xử lý', GhiChu: '' });
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
      const orderId = selectedOrder.MaDH || selectedOrder.id;
      await billingAPI.addItemToOrder(orderId, newItem);
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
      const orderId = selectedOrder.MaDH || selectedOrder.id;
      await billingAPI.updateOrderItem(orderId, itemId, updates);
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
        const orderId = selectedOrder.MaDH || selectedOrder.id;
        await billingAPI.removeOrderItem(orderId, itemId);
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

  // Update order status
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await billingAPI.updatePaymentStatus(orderId, { TrangThai: newStatus });
      toast.success(`Cập nhật trạng thái thành công: ${newStatus}`);
      
      // Update selected order status locally
      setSelectedOrder(prev => ({
        ...prev,
        TrangThai: newStatus
      }));
      
      // Refresh data
      fetchData();
    } catch (error) {
      console.error('Error updating order status:', error);
      const errorMessage = error.response?.data?.message || 'Lỗi khi cập nhật trạng thái';
      toast.error(errorMessage);
    }
  };

  const handleCompleteOrder = async () => {
    if (!selectedOrder) return;

    if (window.confirm('Bạn có chắc chắn muốn hoàn thành đơn hàng này?')) {
      try {
        const orderId = selectedOrder.MaDH || selectedOrder.id;
        await billingAPI.updateOrderStatus(orderId, { TrangThai: 'Hoàn thành' });
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

  const getTotalQuantity = (chitiet) => {
    if (!chitiet || !Array.isArray(chitiet)) return 0;
    return chitiet.reduce((total, item) => total + (item.SoLuong || 0), 0);
  };

  if (loading) {
    return <LoadingSpinner text="Đang tải dữ liệu bán hàng..." />;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Giao diện bán hàng</h1>
          <p className="text-gray-600">Quản lý đơn hàng và bán hàng tại quầy</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Menu Section */}
          <div className="border-r border-gray-200 pr-6">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                Menu ({filteredMenuItems.length} món)
              </h2>
            
              {/* Search */}
              <div className="mt-3 relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm món..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Tất cả danh mục</option>
                {categories.map(category => (
                  <option key={category.MaLoai || category.id} value={category.MaLoai || category.id}>
                    {category.TenLoai || category.name}
                  </option>
                ))}
              </select>
            </div>
              
            <div className="mt-4">
              {filteredMenuItems.map(item => (
                <div key={item.MaMon || item.id} className="flex items-center p-3 border rounded-lg mb-3 hover:bg-gray-50 transition-colors">
                  {/* Menu Item Image */}
                  <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0 mr-3">
                    {(item.HinhAnh || item.image) ? (
                      <img
                        src={item.HinhAnh || item.image}
                        alt={item.TenMon || item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div 
                      className={`w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center ${(item.HinhAnh || item.image) ? 'hidden' : 'flex'}`}
                    >
                      <span className="text-blue-600 font-bold text-lg">
                        {(item.TenMon || item.name)?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  
                  {/* Menu Item Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">{item.TenMon || item.name}</h3>
                    <p className="text-sm text-gray-500 mt-1" style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>{item.MoTa || item.description}</p>
                    <p className="text-lg font-bold text-blue-600 mt-2">
                      {(item.DonGia || item.Gia || item.price)?.toLocaleString('vi-VN')} đ
                    </p>
                  </div>
                  
                  {/* Add Button */}
                  <button
                    onClick={() => addToCurrentOrder(item)}
                    className="ml-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex-shrink-0"
                  >
                    Thêm
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Orders Section */}
          <div className="border-r border-gray-200 pr-6 pl-6">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-900">
                  Đơn hàng ({filteredOrders.length}/{orders.length})
                </h2>
                <button
                  onClick={fetchData}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  <FiRefreshCw className="w-4 h-4" />
                </button>
              </div>
              
              {/* Order Filters */}
              <div className="space-y-2">
                {/* Status Filter */}
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="">Tất cả trạng thái</option>
                  <option value="Đang xử lý">Đang xử lý</option>
                  <option value="Hoàn thành">Hoàn thành</option>
                  <option value="Đã hủy">Đã hủy</option>
                  <option value="Đang phục vụ">Đang phục vụ</option>
                </select>
                
                {/* Date Filter */}
                <select
                  value={orderDateFilter}
                  onChange={(e) => setOrderDateFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="">Tất cả ngày</option>
                  <option value="today">Hôm nay</option>
                  <option value="yesterday">Hôm qua</option>
                  <option value="thisweek">Tuần này</option>
                  <option value="thismonth">Tháng này</option>
                </select>
                
                {/* Employee Filter */}
                <select
                  value={orderEmployeeFilter}
                  onChange={(e) => setOrderEmployeeFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="">Tất cả nhân viên</option>
                  <option value="1">NV 1</option>
                  <option value="2">NV 2</option>
                  <option value="3">NV 3</option>
                  <option value="4">NV 4</option>
                  <option value="5">NV 5</option>
                </select>
                
                {/* Reset Filters Button */}
                {(orderStatusFilter || orderDateFilter || orderEmployeeFilter) && (
                  <button
                    onClick={() => {
                      setOrderStatusFilter('');
                      setOrderDateFilter('');
                      setOrderEmployeeFilter('');
                    }}
                    className="w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm"
                  >
                    Xóa bộ lọc
                  </button>
                )}
              </div>
            </div>
            <div>
            {filteredOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FiClock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Không có đơn hàng phù hợp</p>
                <p className="text-sm">Thử thay đổi bộ lọc để xem thêm đơn hàng</p>
              </div>
            ) : (
              filteredOrders.map(order => (
                <div
                  key={order.MaDH || order.id}
                  onClick={() => handleSelectOrder(order)}
                  className={`p-3 border rounded-lg mb-2 cursor-pointer transition-colors ${
                    selectedOrder && (selectedOrder.MaDH || selectedOrder.id) === (order.MaDH || order.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        Đơn hàng #{order.MaDH || order.id}
                      </h3>
                      <p className="text-sm text-gray-500 flex items-center">
                        <FiMapPin className="w-3 h-3 mr-1" />
                        Bàn {order.MaBan || order.tableId}
                      </p>
                      <p className="text-sm text-gray-500 flex items-center">
                        <FiClock className="w-3 h-3 mr-1" />
                        {new Date(order.NgayLap || order.createdAt).toLocaleTimeString('vi-VN')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-blue-600">
                        {(order.TongTien || order.total || 0).toLocaleString('vi-VN')} đ
                      </p>
                      <span className="inline-block px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                        {order.TrangThai || order.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
            </div>
          </div>

          {/* Create Order Section */}
          <div className="pl-6">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {selectedOrder ? `Chi tiết đơn #${selectedOrder.MaDH || selectedOrder.id}` : 'Tạo đơn hàng mới'}
              </h2>
            </div>
              
            <div>
            {!selectedOrder ? (
              /* Create New Order */
              <div>
                {/* Table Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chọn bàn * ({tables.filter(table => table.TrangThai === 'Trống').length} bàn trống)
                  </label>
                  <select
                    value={newOrder.MaBan}
                    onChange={(e) => setNewOrder({ ...newOrder, MaBan: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">-- Chọn bàn --</option>
                    {tables.filter(table => table.TrangThai === 'Trống').map((table) => (
                      <option key={table.MaBan || table.id} value={table.MaBan || table.id}>
                        Bàn {table.TenBan || table.name} ({table.SoChoNgoi || table.capacity} chỗ)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Order Items */}
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Món đã chọn ({currentOrder.items.length})
                  </h3>
                  <div>
                    {currentOrder.items.length === 0 ? (
                      <p className="text-gray-500 text-center py-4 text-sm">
                        Chưa có món nào. Click vào menu để thêm món.
                      </p>
                    ) : (
                      currentOrder.items.map((item, index) => (
                        <div key={index} className="p-3 border rounded-lg mb-3 bg-gray-50">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-sm">{item.TenMon}</span>
                                <button
                                  onClick={() => removeFromCurrentOrder(item.MaMon)}
                                  className="text-red-500 hover:text-red-700 p-1"
                                  title="Xóa món"
                                >
                                  <FiTrash2 className="w-3 h-3" />
                                </button>
                              </div>
                              <div className="flex items-center justify-between mt-2">
                                <div className="flex items-center">
                                  <button
                                    onClick={() => updateItemQuantity(item.MaMon, item.SoLuong - 1)}
                                    className="w-7 h-7 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm hover:bg-red-200 transition-colors"
                                  >
                                    -
                                  </button>
                                  <span className="mx-3 text-lg font-bold">{item.SoLuong}</span>
                                  <button
                                    onClick={() => updateItemQuantity(item.MaMon, item.SoLuong + 1)}
                                    className="w-7 h-7 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm hover:bg-green-200 transition-colors"
                                  >
                                    +
                                  </button>
                                </div>
                                <span className="text-lg font-bold text-blue-600">
                                  {(item.DonGia * item.SoLuong).toLocaleString('vi-VN')} đ
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Note Input */}
                          <div className="mt-3 pt-2 border-t border-gray-200">
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              📝 Ghi chú món ăn:
                            </label>
                            <input
                              type="text"
                              placeholder="VD: ít đá, thêm đường, không đá..."
                              value={item.GhiChu || ''}
                              onChange={(e) => updateItemNote(item.MaMon, e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white placeholder-gray-400"
                            />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Total */}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold">Tổng cộng:</span>
                    <span className="text-xl font-bold text-blue-600">
                      {currentOrder.total.toLocaleString('vi-VN')} đ
                    </span>
                  </div>

                  <button
                    onClick={createOrder}
                    disabled={!newOrder.MaBan || currentOrder.items.length === 0}
                    className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                  >
                    <FiPlus className="w-4 h-4 mr-2" />
                    Tạo đơn hàng ({currentOrder.items.length} món)
                  </button>
                </div>
              </div>
            ) : (
              /* Order Details */
              <div>
                {/* Order Header */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg mb-6 border border-blue-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Đơn hàng #{selectedOrder.MaDH || selectedOrder.id}
                    </h3>
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                      (selectedOrder.TrangThai || selectedOrder.status) === 'Đang xử lý' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                      (selectedOrder.TrangThai || selectedOrder.status) === 'Hoàn thành' ? 'bg-green-100 text-green-700 border border-green-200' :
                      (selectedOrder.TrangThai || selectedOrder.status) === 'Đã hủy' ? 'bg-red-100 text-red-700 border border-red-200' :
                      'bg-blue-100 text-blue-700 border border-blue-200'
                    }`}>
                      {selectedOrder.TrangThai || selectedOrder.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-white p-3 rounded-md">
                      <div className="text-xs text-gray-500 uppercase tracking-wide">Bàn</div>
                      <div className="text-sm font-medium text-gray-900 mt-1">{getTableName(selectedOrder.MaBan)}</div>
                    </div>
                    <div className="bg-white p-3 rounded-md">
                      <div className="text-xs text-gray-500 uppercase tracking-wide">Nhân viên</div>
                      <div className="text-sm font-medium text-gray-900 mt-1">
                        {selectedOrder.MaNV === (user?.MaNV || user?.id) ? 
                          `${user?.TenNV || user?.name || 'Bạn'} (NV ${selectedOrder.MaNV})` : 
                          `NV ${selectedOrder.MaNV}`
                        }
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 rounded-md mb-4">
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Ngày tạo</div>
                    <div className="text-sm font-medium text-gray-900 mt-1">
                      {selectedOrder.NgayLap ? new Date(selectedOrder.NgayLap).toLocaleString('vi-VN') : 'Chưa có'}
                    </div>
                  </div>
                  
                  {/* Total Amount - Prominent */}
                  <div className="bg-white p-4 rounded-md border-2 border-blue-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Tổng tiền</span>
                      <span className="text-2xl font-bold text-blue-600">
                        {(selectedOrder.TongTien || selectedOrder.total || 0).toLocaleString('vi-VN')} đ
                      </span>
                    </div>
                  </div>
                  
                  {/* Order Notes */}
                  {(selectedOrder.GhiChu || selectedOrder.notes) && (
                    <div className="mt-4 bg-yellow-50 p-3 rounded-md border border-yellow-200">
                      <div className="text-xs text-yellow-700 uppercase tracking-wide font-medium">Ghi chú</div>
                      <p className="mt-1 text-sm text-yellow-800">{selectedOrder.GhiChu || selectedOrder.notes}</p>
                    </div>
                  )}
                </div>
                
                {/* Order Items */}
                <div className="bg-white rounded-lg border border-gray-200">
                  <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                    <h4 className="font-medium text-gray-900">Danh sách món ({orderItems.length})</h4>
                  </div>
                  
                  <div className="divide-y divide-gray-100">
                    {orderItems.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <div className="text-4xl mb-2">🍽️</div>
                        <p>Chưa có món nào trong đơn hàng</p>
                      </div>
                    ) : (
                      orderItems.map((item, index) => (
                        <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium text-sm">
                                  {index + 1}
                                </div>
                                <div>
                                  <h5 className="font-medium text-gray-900">{getMenuItemName(item.MaMon)}</h5>
                                  <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                                    <span className="flex items-center">
                                      <span className="w-4 h-4 mr-1">🍽️</span>
                                      {item.SoLuong || item.quantity}
                                    </span>
                                    <span className="flex items-center">
                                      <span className="w-4 h-4 mr-1">💰</span>
                                      {(item.DonGia || item.price).toLocaleString('vi-VN')}đ
                                    </span>
                                  </div>
                                  {(item.GhiChu || item.notes) && (
                                    <div className="mt-2 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded inline-block">
                                      📝 {item.GhiChu || item.notes}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="text-right ml-4">
                              <div className="text-lg font-bold text-blue-600">
                                {((item.DonGia || item.price) * (item.SoLuong || item.quantity)).toLocaleString('vi-VN')}đ
                              </div>
                              <div className="text-xs text-gray-400 mt-1">
                                {item.SoLuong || item.quantity} x {(item.DonGia || item.price).toLocaleString('vi-VN')}đ
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                
                {/* Order Actions */}
                <div className="mt-6 space-y-4">
                  {/* Order Status Update */}
                  {(selectedOrder.TrangThai || selectedOrder.status) === 'Đang xử lý' && (
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <h5 className="text-sm font-medium text-gray-700 mb-3">Cập nhật trạng thái đơn hàng</h5>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => handleUpdateOrderStatus(selectedOrder.MaDH || selectedOrder.id, 'Hoàn thành')}
                          className="flex items-center justify-center py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 shadow-sm hover:shadow-md text-sm font-medium"
                        >
                          <span className="mr-2">✓</span>
                          Hoàn thành
                        </button>
                        <button
                          onClick={() => handleUpdateOrderStatus(selectedOrder.MaDH || selectedOrder.id, 'Đã hủy')}
                          className="flex items-center justify-center py-3 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 shadow-sm hover:shadow-md text-sm font-medium"
                        >
                          <span className="mr-2">✗</span>
                          Hủy đơn
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Back Button */}
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 border border-gray-300 font-medium"
                  >
                    <span className="mr-2">←</span>
                    Quay lại danh sách đơn hàng
                  </button>
                </div>
              </div>
            )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesManagement;
