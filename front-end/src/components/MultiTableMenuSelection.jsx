import React, { useState, useEffect } from 'react';
import { FiShoppingCart, FiX, FiPlus, FiMinus, FiSearch } from 'react-icons/fi';
import { menuAPI } from '../shared/services/api';
import toast from 'react-hot-toast';
import Product from '../components/common/product/Product';

const MultiTableMenuSelection = ({ tables, onOrdersChange, initialOrders = {} }) => {
  const [activeTableId, setActiveTableId] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [tableOrders, setTableOrders] = useState(initialOrders);

  useEffect(() => {
    fetchMenuData();
    // Set first table as active by default
    if (tables && tables.length > 0 && !activeTableId) {
      const firstTableId = tables[0]?.MaBan || tables[0]?.id;
      if (firstTableId) {
        setActiveTableId(firstTableId);
      }
    }
  }, [tables, activeTableId]);

  useEffect(() => {
    if (onOrdersChange) {
      onOrdersChange(tableOrders);
    }
  }, [tableOrders, onOrdersChange]);

  const fetchMenuData = async () => {
    try {
      setLoading(true);
      const [menuResponse, categoriesResponse] = await Promise.all([
        menuAPI.getMenuItems({ limit: 100 }),
        menuAPI.getCategories()
      ]);

      if (menuResponse?.data?.menus) {
        setMenuItems(menuResponse.data.menus);
      }
      if (categoriesResponse?.data?.categories) {
        setCategories(categoriesResponse.data.categories);
      }
    } catch (error) {
      console.error('Error fetching menu data:', error);
      toast.error('Không thể tải menu');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredMenuItems = () => {
    let filtered = menuItems || [];
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item?.TenMon?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item?.MoTa?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by category
    if (selectedCategory) {
      const categoryId = parseInt(selectedCategory);
      filtered = filtered.filter(item => item?.MaDanhMuc === categoryId);
    }
    
    return filtered;
  };

  const getTableOrder = (tableId) => {
    return tableOrders[tableId] || [];
  };

  const addItemToTable = (tableId, menuItem) => {
    if (!menuItem || !tableId) return;
    
    const currentOrder = getTableOrder(tableId);
    const existingItem = currentOrder.find(item => item?.MaMon === menuItem.MaMon);

    if (existingItem) {
      updateItemQuantity(tableId, menuItem.MaMon, existingItem.SoLuong + 1);
    } else {
      const newItem = {
        MaMon: menuItem.MaMon,
        TenMon: menuItem.TenMon,
        DonGia: menuItem.Gia || menuItem.DonGia,
        SoLuong: 1,
        GhiChu: ''
      };

      setTableOrders(prev => ({
        ...prev,
        [tableId]: [...currentOrder, newItem]
      }));

      toast.success(`Đã thêm ${menuItem.TenMon} vào bàn ${getTableName(tableId)}`);
    }
  };

  const updateItemQuantity = (tableId, itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeItemFromTable(tableId, itemId);
      return;
    }

    setTableOrders(prev => ({
      ...prev,
      [tableId]: (prev[tableId] || []).map(item =>
        item?.MaMon === itemId ? { ...item, SoLuong: newQuantity } : item
      )
    }));
  };

  const removeItemFromTable = (tableId, itemId) => {
    setTableOrders(prev => ({
      ...prev,
      [tableId]: (prev[tableId] || []).filter(item => item?.MaMon !== itemId)
    }));

    const item = getTableOrder(tableId).find(item => item?.MaMon === itemId);
    if (item) {
      toast.success(`Đã xóa ${item.TenMon} khỏi bàn ${getTableName(tableId)}`);
    }
  };

  const getTableName = (tableId) => {
    if (!tables || !tableId) return `Bàn ${tableId}`;
    const table = tables.find(t => (t?.MaBan || t?.id) === tableId);
    return table ? (table.TenBan || `Bàn ${tableId}`) : `Bàn ${tableId}`;
  };

  const getTableTotal = (tableId) => {
    const order = getTableOrder(tableId);
    return order.reduce((total, item) => {
      const price = parseFloat(item?.DonGia || 0);
      const itemTotal = (item?.SoLuong || 0) * price;
      return total + itemTotal;
    }, 0);
  };

  const getTotalOrdersCount = () => {
    return Object.values(tableOrders).reduce((total, order) => {
      return total + (order ? order.length : 0);
    }, 0);
  };

  const getGrandTotal = () => {
    return Object.keys(tableOrders).reduce((total, tableId) => {
      return total + getTableTotal(tableId);
    }, 0);
  };

  const clearTableOrder = (tableId) => {
    setTableOrders(prev => ({
      ...prev,
      [tableId]: []
    }));
    toast.success(`Đã xóa tất cả món của bàn ${getTableName(tableId)}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (!tables || tables.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Không có bàn nào được chọn</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="bg-amber-50 border border-amber-300 rounded-lg p-3">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-amber-800 font-semibold text-sm">
              Tổng cộng: {getTotalOrdersCount()} món - {getGrandTotal().toLocaleString('vi-VN')}đ
            </p>
            <p className="text-amber-700 text-xs">
              Chọn món riêng cho từng bàn hoặc bỏ qua nếu không muốn đặt món
            </p>
          </div>
        </div>
      </div>

      {/* Table Tabs - Enhanced */}
      <div className="bg-white rounded-xl shadow-sm p-2 mb-6">
        <nav className="flex space-x-4 overflow-x-auto pb-1 ">
          {tables.map((table) => {
            const tableId = table?.MaBan || table?.id;
            if (!tableId) return null;
            
            const orderCount = getTableOrder(tableId).length;
            const total = getTableTotal(tableId);
            const isActive = activeTableId === tableId;
            
            return (
              <button
                key={tableId}
                onClick={() => setActiveTableId(tableId)}
                className={`!mx-1 relative py-2.5 px-4 rounded-lg font-semibold text-xs whitespace-nowrap transition-all duration-300 ${
                  isActive
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-200 transform scale-105'
                    : 'bg-gray-50 text-gray-600 hover:bg-amber-50 hover:text-amber-700'
                }`}
              >
                <div className="flex flex-col items-center space-y-1">
                  <div className="flex items-center space-x-2">
                    <FiShoppingCart className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                    <span>{getTableName(tableId)}</span>
                  </div>
                  
                  {orderCount > 0 ? (
                    <div className={`flex items-center space-x-2 text-xs ${isActive ? 'text-amber-100' : 'text-amber-700'}`}>
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        isActive ? 'bg-white/20' : 'bg-amber-100'
                      }`}>
                        {orderCount} món
                      </span>
                      <span className="font-semibold text-[10px]">{total.toLocaleString('vi-VN')}đ</span>
                    </div>
                  ) : (
                    <span className={`text-[10px] ${isActive ? 'text-amber-100' : 'text-gray-400'}`}>
                      Chưa có món
                    </span>
                  )}
                </div>
                
                {/* Active Indicator */}
                {isActive && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-white rounded-full"></div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {activeTableId && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Menu Selection (2/3 width on large screens) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search and Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Tìm kiếm món ăn, đồ uống..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all shadow-sm hover:shadow-md"
                />
              </div>
              
              {/* Category Filter Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-700">Loại món:</span>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none bg-white font-medium text-gray-700 transition-all shadow-sm hover:shadow-md cursor-pointer"
                >
                  <option value="">Tất cả danh mục</option>
                  {categories && categories.map((category) => {
                    if (!category?.MaDanhMuc) return null;
                    return (
                      <option key={category.MaDanhMuc} value={String(category.MaDanhMuc)}>
                        {category.TenDanhMuc}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {/* Category Pills (Optional - for quick access) */}
            <div className="flex flex-wrap gap-2">
              {categories && categories.slice(0, 6).map((category) => {
                if (!category?.MaDanhMuc) return null;
                return (
                  <button
                    key={category.MaDanhMuc}
                    onClick={() => setSelectedCategory(String(category.MaDanhMuc))}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      selectedCategory === String(category.MaDanhMuc)
                        ? 'bg-amber-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-amber-50 hover:text-amber-700'
                    }`}
                  >
                    {category.TenDanhMuc}
                  </button>
                );
              })}
            </div>

            {/* Menu Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {getFilteredMenuItems().map((item) => {
                if (!item?.MaMon) return null;
                
                const currentOrder = getTableOrder(activeTableId);
                const orderItem = currentOrder.find(orderItem => orderItem?.MaMon === item.MaMon);
                const quantity = orderItem ? orderItem.SoLuong : 0;
                
                return (
                  <div key={item.MaMon} className="group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-gray-100 hover:border-amber-300 transform hover:-translate-y-2">
                    {/* Product Image */}
                    <div className="relative h-44 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                      {item.HinhAnh ? (
                        <>
                          <img
                            src={item.HinhAnh}
                            alt={item.TenMon}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-amber-100">
                          <span className="text-amber-700 text-4xl filter drop-shadow-lg">☕</span>
                        </div>
                      )}
                      
                      {/* Quantity Badge */}
                      {quantity > 0 && (
                        <div className="absolute top-2 right-2 bg-amber-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold shadow-lg">
                          <span className="text-sm">{quantity}</span>
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-4">
                      {/* Title & Price Row */}
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-base text-gray-900 line-clamp-1 flex-1 pr-2">
                          {item.TenMon}
                        </h3>
                        <div className="text-amber-700 font-bold text-lg whitespace-nowrap">
                          {parseFloat(item.Gia || item.DonGia || 0).toLocaleString('vi-VN')}đ
                        </div>
                      </div>
                      
                      {/* Description */}
                      {item.MoTa && (
                        <p className="text-xs text-gray-500 mb-4 h-8 line-clamp-2">
                          {item.MoTa}
                        </p>
                      )}
                      

                      {/* Add to Cart Button */}
                      {quantity === 0 ? (
                        <button
                          onClick={() => addItemToTable(activeTableId, item)}
                          className="group w-full bg-amber-600 hover:bg-amber-700 text-white py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-300 flex items-center justify-center shadow-md hover:shadow-xl hover:scale-105">
                          <FiShoppingCart className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                          Thêm vào bàn
                        </button>
                      ) : (
                        <div className="flex items-center justify-between bg-amber-50 rounded-lg p-2.5 border border-amber-200">
                          <button
                            onClick={() => updateItemQuantity(activeTableId, item.MaMon, quantity - 1)}
                            className="w-9 h-9 bg-white text-gray-600 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all flex items-center justify-center shadow-sm border border-gray-200">
                            <FiMinus className="w-4 h-4" />
                          </button>
                          
                          <span className="text-xl font-bold text-amber-700 mx-4 min-w-[2rem] text-center">{quantity}</span>
                          
                          <button
                            onClick={() => updateItemQuantity(activeTableId, item.MaMon, quantity + 1)}
                            className="w-9 h-9 bg-amber-600 text-white rounded-lg hover:bg-amber-700 hover:scale-110 transition-all flex items-center justify-center shadow-md">
                            <FiPlus className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          {/* End of Left Column */}

          {/* Right Column: Shopping Cart (Sticky) */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              {/* Cart Header */}
              <div className="bg-amber-600 px-4 py-2.5">
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center space-x-2">
                    <FiShoppingCart className="w-4 h-4" />
                    <h3 className="font-semibold text-sm">Giỏ hàng</h3>
                  </div>
                  <div className="px-2 py-0.5 rounded text-xs font-medium !mt-2">
                    {getTableOrder(activeTableId).length} món
                  </div>
                </div>
                <p className="text-amber-100 text-xs mt-0.5">{getTableName(activeTableId)}</p>
              </div>

              {/* Cart Content */}
              <div className="p-3 max-h-[600px] overflow-y-auto">
                {getTableOrder(activeTableId).length > 0 && (
                  <div className="flex justify-end mb-2">
                    <button
                      onClick={() => clearTableOrder(activeTableId)}
                      className="text-red-500 hover:text-red-600 text-xs font-medium flex items-center space-x-1"
                    >
                      <FiX className="w-3 h-3" />
                      <span>Xóa tất cả</span>
                    </button>
                  </div>
                )}

                {getTableOrder(activeTableId).length === 0 ? (
                  <p className="text-gray-400 text-center py-6 text-sm">
                    Chưa có món nào
                  </p>
                ) : (
                  <div className="space-y-2">
                    {getTableOrder(activeTableId).map((item) => {
                      if (!item?.MaMon) return null;
                      return (
                        <div key={item.MaMon} className="bg-white rounded-lg p-2 border border-gray-100 hover:border-amber-400 transition-all">
                          <div className="flex justify-between items-start mb-1.5">
                            <div className="flex-1">
                              <h4 className="font-medium text-sm text-gray-900">{item.TenMon}</h4>
                              <p className="text-xs text-gray-500">
                                {parseFloat(item.DonGia || 0).toLocaleString('vi-VN')}đ
                              </p>
                            </div>
                            <button
                              onClick={() => removeItemFromTable(activeTableId, item.MaMon)}
                              className="text-gray-400 hover:text-red-500"
                            >
                              <FiX className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-1.5">
                              <button
                                onClick={() => updateItemQuantity(activeTableId, item.MaMon, item.SoLuong - 1)}
                                className="w-6 h-6 rounded-md bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                              >
                                <FiMinus className="w-3 h-3 text-gray-600" />
                              </button>
                              <span className="w-8 text-center text-sm font-semibold text-gray-900">{item.SoLuong}</span>
                              <button
                                onClick={() => updateItemQuantity(activeTableId, item.MaMon, item.SoLuong + 1)}
                                className="w-6 h-6 rounded-md bg-amber-600 hover:bg-amber-700 flex items-center justify-center"
                              >
                                <FiPlus className="w-3 h-3 text-white" />
                              </button>
                            </div>
                            <span className="font-bold text-amber-700 text-sm">
                              {((item.SoLuong || 0) * parseFloat(item.DonGia || 0)).toLocaleString('vi-VN')}đ
                            </span>
                          </div>

                          <input
                            type="text"
                            placeholder="Ghi chú..."
                            value={item.GhiChu || ''}
                            onChange={(e) => {
                              setTableOrders(prev => ({
                                ...prev,
                                [activeTableId]: (prev[activeTableId] || []).map(orderItem =>
                                  orderItem?.MaMon === item.MaMon 
                                    ? { ...orderItem, GhiChu: e.target.value } 
                                    : orderItem
                                )
                              }));
                            }}
                            className="w-full !mt-3 px-2 py-1 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-amber-400 bg-gray-50"
                          />
                        </div>
                      );
                    })}

                    <div className="border-t border-gray-200 pt-2.5 mt-2.5 bg-amber-50 -mx-3 px-3 py-2 rounded-b-xl">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 font-semibold text-sm">Tổng cộng:</span>
                        <span className="text-amber-800 font-bold text-lg">
                          {getTableTotal(activeTableId).toLocaleString('vi-VN')}đ
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {/* End Cart Content (p-4) */}
            </div>
            {/* End Sticky Container */}
          </div>
          {/* End Right Column */}
        </div>
      )}
    </div>
  );
};

export default MultiTableMenuSelection;
