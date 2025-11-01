import React, { useState, useEffect } from 'react';
import { FiShoppingCart, FiX, FiPlus, FiMinus, FiSearch } from 'react-icons/fi';
import { menuAPI } from '../shared/services/api';
import toast from 'react-hot-toast';

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
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-amber-800 font-medium">
              Tổng cộng: {getTotalOrdersCount()} món - {getGrandTotal().toLocaleString('vi-VN')}đ
            </p>
            <p className="text-amber-600 text-sm">
              Chọn món riêng cho từng bàn hoặc bỏ qua nếu không muốn đặt món
            </p>
          </div>
        </div>
      </div>

      {/* Table Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tables.map((table) => {
            const tableId = table?.MaBan || table?.id;
            if (!tableId) return null;
            
            const orderCount = getTableOrder(tableId).length;
            const total = getTableTotal(tableId);
            
            return (
              <button
                key={tableId}
                onClick={() => setActiveTableId(tableId)}
                className={`py-2 px-4 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTableId === tableId
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="text-center">
                  <div>{getTableName(tableId)}</div>
                  <div className="text-xs">
                    {orderCount > 0 ? (
                      <span className="text-amber-600">
                        {orderCount} món - {total.toLocaleString('vi-VN')}đ
                      </span>
                    ) : (
                      <span className="text-gray-400">Chưa đặt món</span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {activeTableId && (
        <div className="space-y-6">
          {/* Menu Selection */}
          <div className="space-y-6">
            {/* Search and Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Tìm kiếm món ăn, đồ uống..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                />
              </div>
              
              {/* Category Filter Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Loại món:</span>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none bg-white"
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
              <button
                onClick={() => setSelectedCategory('')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === ''
                    ? 'bg-amber-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Tất cả
              </button>
              {categories && categories.slice(0, 6).map((category) => {
                if (!category?.MaDanhMuc) return null;
                return (
                  <button
                    key={category.MaDanhMuc}
                    onClick={() => setSelectedCategory(String(category.MaDanhMuc))}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedCategory === String(category.MaDanhMuc)
                        ? 'bg-amber-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category.TenDanhMuc}
                  </button>
                );
              })}
            </div>

            {/* Menu Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {getFilteredMenuItems().map((item) => {
                if (!item?.MaMon) return null;
                
                const currentOrder = getTableOrder(activeTableId);
                const orderItem = currentOrder.find(orderItem => orderItem?.MaMon === item.MaMon);
                const quantity = orderItem ? orderItem.SoLuong : 0;
                
                return (
                  <div key={item.MaMon} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
                    {/* Product Image */}
                    <div className="relative h-48 bg-gray-100">
                      {item.HinhAnh ? (
                        <img
                          src={item.HinhAnh}
                          alt={item.TenMon}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-100 to-amber-200">
                          <span className="text-amber-600 text-4xl">☕</span>
                        </div>
                      )}
                      
                      {/* Quantity Badge */}
                      {quantity > 0 && (
                        <div className="absolute top-2 right-2 bg-amber-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                          {quantity}
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 truncate">{item.TenMon}</h3>
                      
                      {item.MoTa && (
                        <p className="text-sm text-gray-600 mb-3 h-10 overflow-hidden">{item.MoTa}</p>
                      )}
                      
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xl font-bold text-amber-600">
                          {parseFloat(item.Gia || item.DonGia || 0).toLocaleString('vi-VN')}đ
                        </span>
                      </div>

                      {/* Add to Cart Button */}
                      {quantity === 0 ? (
                        <button
                          onClick={() => addItemToTable(activeTableId, item)}
                          className="w-full bg-amber-600 text-white py-2 px-4 rounded-lg hover:bg-amber-700 transition-colors duration-200 flex items-center justify-center font-medium"
                        >
                          <FiPlus className="w-4 h-4 mr-2" />
                          Thêm vào bàn
                        </button>
                      ) : (
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => updateItemQuantity(activeTableId, item.MaMon, quantity - 1)}
                            className="w-10 h-10 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-colors flex items-center justify-center"
                          >
                            <FiMinus className="w-4 h-4" />
                          </button>
                          
                          <span className="text-lg font-semibold text-gray-900 mx-4">{quantity}</span>
                          
                          <button
                            onClick={() => updateItemQuantity(activeTableId, item.MaMon, quantity + 1)}
                            className="w-10 h-10 bg-amber-600 text-white rounded-full hover:bg-amber-700 transition-colors flex items-center justify-center"
                          >
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

          {/* Current Table Order */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium text-gray-900">
                Món đã chọn - {getTableName(activeTableId)}
              </h3>
              {getTableOrder(activeTableId).length > 0 && (
                <button
                  onClick={() => clearTableOrder(activeTableId)}
                  className="text-red-600 hover:text-red-700 text-sm"
                >
                  Xóa tất cả
                </button>
              )}
            </div>

            {getTableOrder(activeTableId).length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Chưa có món nào được chọn cho bàn này
              </p>
            ) : (
              <div className="space-y-3">
                {getTableOrder(activeTableId).map((item) => {
                  if (!item?.MaMon) return null;
                  return (
                    <div key={item.MaMon} className="bg-white rounded-lg p-3 border border-gray-200">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{item.TenMon}</h4>
                          <p className="text-sm text-gray-600">
                            {parseFloat(item.DonGia || 0).toLocaleString('vi-VN')}đ
                          </p>
                        </div>
                        <button
                          onClick={() => removeItemFromTable(activeTableId, item.MaMon)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <FiX className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateItemQuantity(activeTableId, item.MaMon, item.SoLuong - 1)}
                            className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                          >
                            <FiMinus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center font-medium">{item.SoLuong}</span>
                          <button
                            onClick={() => updateItemQuantity(activeTableId, item.MaMon, item.SoLuong + 1)}
                            className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                          >
                            <FiPlus className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="font-medium text-amber-600">
                          {((item.SoLuong || 0) * parseFloat(item.DonGia || 0)).toLocaleString('vi-VN')}đ
                        </span>
                      </div>

                      <input
                        type="text"
                        placeholder="Ghi chú (ít đá, thêm đường...)"
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
                        className="w-full mt-2 px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  );
                })}

                <div className="border-t border-gray-300 pt-3 mt-4">
                  <div className="flex justify-between items-center font-semibold">
                    <span>Tổng cộng:</span>
                    <span className="text-amber-600">
                      {getTableTotal(activeTableId).toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiTableMenuSelection;
