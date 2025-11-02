import React, { useState } from 'react';
import { FiSearch } from 'react-icons/fi';

const POSMenuSection = ({ menuItems, categories, onAddToCart }) => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMenu = menuItems.filter(item => {
    const matchCategory = !selectedCategory || (item.MaLoai || item.MaDM || item.category_id) == selectedCategory;
    const matchSearch = !searchTerm || (item.TenMon || item.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategory && matchSearch;
  });

  const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Menu ({filteredMenu.length})</h2>
      </div>

      <div className="mb-4 space-y-3">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm món..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Tất cả danh mục</option>
          {categories.map(cat => (
            <option key={cat.MaLoai || cat.id} value={cat.MaLoai || cat.id}>
              {cat.TenLoai || cat.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[600px] overflow-y-auto">
        {filteredMenu.map(item => (
          <button
            key={item.MaMon || item.id}
            onClick={() => onAddToCart(item)}
            className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition-all text-left"
          >
            <div className="w-full h-32 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
              {(item.HinhAnh || item.image) ? (
                <img
                  src={item.HinhAnh || item.image}
                  alt={item.TenMon || item.name}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : (
                <span className="text-4xl">🍽️</span>
              )}
            </div>
            <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">
              {item.TenMon || item.name}
            </h3>
            <p className="text-lg font-bold text-blue-600">
              {formatCurrency(item.DonGia || item.Gia || item.price)}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default POSMenuSection;
