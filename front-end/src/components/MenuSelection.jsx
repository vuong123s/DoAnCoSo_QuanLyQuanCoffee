import React, { useState, useEffect } from 'react';
import { FiPlus, FiMinus, FiShoppingCart, FiX } from 'react-icons/fi';
import { menuAPI } from '../shared/services/api';
import { toast } from 'react-hot-toast';

const MenuSelection = ({ onOrderChange, initialOrder = [] }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [order, setOrder] = useState(initialOrder);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMenuData();
  }, []);

  useEffect(() => {
    onOrderChange(order);
  }, [order, onOrderChange]);

  const fetchMenuData = async () => {
    try {
      setLoading(true);
      const [menuResponse, categoriesResponse] = await Promise.all([
        menuAPI.getMenuItems(),
        menuAPI.getCategories()
      ]);

      const menuData = menuResponse.data.menus || menuResponse.data.menu_items || [];
      const categoryData = categoriesResponse.data.categories || categoriesResponse.data.loaimons || [];

      setMenuItems(menuData.filter(item => item.TrangThai === 'Còn bán'));
      setCategories(categoryData);
    } catch (error) {
      console.error('Error fetching menu data:', error);
      toast.error('Không thể tải menu');
    } finally {
      setLoading(false);
    }
  };

  const filteredMenuItems = selectedCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.MaLoai === selectedCategory);

  const addToOrder = (item) => {
    const existingItem = order.find(orderItem => orderItem.MaMon === item.MaMon);
    
    if (existingItem) {
      setOrder(order.map(orderItem => 
        orderItem.MaMon === item.MaMon 
          ? { ...orderItem, SoLuong: orderItem.SoLuong + 1 }
          : orderItem
      ));
    } else {
      setOrder([...order, {
        MaMon: item.MaMon,
        TenMon: item.TenMon,
        DonGia: item.DonGia,
        SoLuong: 1,
        GhiChu: ''
      }]);
    }
    toast.success(`Đã thêm ${item.TenMon}`);
  };

  const updateQuantity = (MaMon, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromOrder(MaMon);
      return;
    }
    
    setOrder(order.map(item => 
      item.MaMon === MaMon 
        ? { ...item, SoLuong: newQuantity }
        : item
    ));
  };

  const removeFromOrder = (MaMon) => {
    setOrder(order.filter(item => item.MaMon !== MaMon));
  };

  const updateNote = (MaMon, note) => {
    setOrder(order.map(item => 
      item.MaMon === MaMon 
        ? { ...item, GhiChu: note }
        : item
    ));
  };

  const getTotalAmount = () => {
    return order.reduce((total, item) => total + (item.DonGia * item.SoLuong), 0);
  };

  const getTotalItems = () => {
    return order.reduce((total, item) => total + item.SoLuong, 0);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Đang tải menu...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Chọn món ăn (tùy chọn)</h3>
        {order.length > 0 && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <FiShoppingCart className="h-4 w-4" />
            <span>{getTotalItems()} món - {getTotalAmount().toLocaleString('vi-VN')}đ</span>
          </div>
        )}
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            selectedCategory === 'all'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Tất cả
        </button>
        {categories.map(category => (
          <button
            key={category.MaLoai}
            onClick={() => setSelectedCategory(category.MaLoai)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === category.MaLoai
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {category.TenLoai}
          </button>
        ))}
      </div>

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMenuItems.map(item => {
          const orderItem = order.find(orderItem => orderItem.MaMon === item.MaMon);
          const quantity = orderItem ? orderItem.SoLuong : 0;

          return (
            <div key={item.MaMon} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              {/* Item Image */}
              {item.HinhAnh && (
                <img
                  src={item.HinhAnh}
                  alt={item.TenMon}
                  className="w-full h-32 object-cover rounded-md mb-3"
                />
              )}

              {/* Item Info */}
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">{item.TenMon}</h4>
                {item.MoTa && (
                  <p className="text-sm text-gray-600 line-clamp-2">{item.MoTa}</p>
                )}
                <p className="text-lg font-semibold text-blue-600">
                  {item.DonGia.toLocaleString('vi-VN')}đ
                </p>

                {/* Add to Order Button */}
                {quantity === 0 ? (
                  <button
                    onClick={() => addToOrder(item)}
                    className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <FiPlus className="h-4 w-4" />
                    <span>Thêm</span>
                  </button>
                ) : (
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => updateQuantity(item.MaMon, quantity - 1)}
                      className="flex items-center justify-center w-8 h-8 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300"
                    >
                      <FiMinus className="h-4 w-4" />
                    </button>
                    <span className="font-medium">{quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.MaMon, quantity + 1)}
                      className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full hover:bg-blue-700"
                    >
                      <FiPlus className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Items Summary */}
      {order.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Món đã chọn ({order.length})</h4>
          <div className="space-y-3">
            {order.map(item => (
              <div key={item.MaMon} className="flex items-start justify-between bg-white p-3 rounded-md">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h5 className="font-medium text-gray-900">{item.TenMon}</h5>
                    <button
                      onClick={() => removeFromOrder(item.MaMon)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FiX className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-600">
                    {item.DonGia.toLocaleString('vi-VN')}đ x {item.SoLuong} = {(item.DonGia * item.SoLuong).toLocaleString('vi-VN')}đ
                  </p>
                  
                  {/* Note Input */}
                  <input
                    type="text"
                    placeholder="Ghi chú (ít đá, không đường...)"
                    value={item.GhiChu}
                    onChange={(e) => updateNote(item.MaMon, e.target.value)}
                    className="mt-2 w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            ))}
          </div>
          
          {/* Total */}
          <div className="mt-4 pt-3 border-t border-gray-200">
            <div className="flex justify-between items-center font-semibold text-lg">
              <span>Tổng cộng:</span>
              <span className="text-blue-600">{getTotalAmount().toLocaleString('vi-VN')}đ</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuSelection;
