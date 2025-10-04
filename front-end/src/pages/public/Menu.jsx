import React, { useEffect, useState } from 'react';
import { menuAPI } from '../../shared/services/api';
import useCartStore from '../../app/stores/cartStore';
import ProductCard from '../../components/common/product/ProductCard';
import { FiSearch, FiFilter, FiStar, FiShoppingCart, FiPlus } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Menu = () => {
  const { addToCart, getCartItemCount } = useCartStore();
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesResponse, menuResponse] = await Promise.all([
          menuAPI.getCategories(),
          menuAPI.getMenuItems()
        ]);
        
        // Handle Vietnamese schema response with proper array validation
        const categoriesData = Array.isArray(categoriesResponse.data?.categories) 
          ? categoriesResponse.data.categories 
          : Array.isArray(categoriesResponse.data) 
          ? categoriesResponse.data 
          : [];
          
        const menuData = Array.isArray(menuResponse.data?.items) 
          ? menuResponse.data.items 
          : Array.isArray(menuResponse.data) 
          ? menuResponse.data 
          : [];
        
        setCategories(categoriesData);
        setMenuItems(menuData);
        setFilteredItems(menuData);
      } catch (error) {
        console.error('Error fetching menu data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    // Ensure menuItems is always an array
    let filtered = Array.isArray(menuItems) ? menuItems : [];

    // Filter by category (support both English and Vietnamese schema)
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => {
        const categoryId = item.MaLoai || item.categoryId;
        return categoryId === parseInt(selectedCategory);
      });
    }

    // Filter by search query (support both English and Vietnamese schema)
    if (searchQuery) {
      filtered = filtered.filter(item => {
        const name = item.TenMon || item.name || '';
        const description = item.MoTa || item.description || '';
        return name.toLowerCase().includes(searchQuery.toLowerCase()) ||
               description.toLowerCase().includes(searchQuery.toLowerCase());
      });
    }

    setFilteredItems(filtered);
  }, [menuItems, selectedCategory, searchQuery]);

  const handleAddToCart = async (item) => {
    try {
      await addToCart(item, 1);
    } catch (error) {
      console.error('Add to cart error:', error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="bg-gray-300 h-8 w-48 rounded mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow-md p-6">
                  <div className="bg-gray-300 h-48 rounded-lg mb-4"></div>
                  <div className="bg-gray-300 h-4 rounded mb-2"></div>
                  <div className="bg-gray-300 h-3 rounded mb-4"></div>
                  <div className="bg-gray-300 h-6 rounded w-20"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Thực đơn</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Khám phá bộ sưu tập đồ uống và món ăn đa dạng của chúng tôi
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Tìm kiếm món ăn, đồ uống..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center space-x-2">
            <FiFilter className="text-gray-400 w-5 h-5" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="all">Tất cả danh mục</option>
              {categories.map((category) => (
                <option key={category.MaLoai || category.id} value={category.MaLoai || category.id}>
                  {category.TenLoai || category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Menu Items Grid */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <FiSearch className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Không tìm thấy sản phẩm
            </h3>
            <p className="text-gray-600">
              Thử thay đổi từ khóa tìm kiếm hoặc danh mục
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => {
              const itemId = item.MaMon || item.id;
              const itemName = item.TenMon || item.name;
              const itemDescription = item.MoTa || item.description;
              const itemPrice = item.DonGia || item.price;
              const itemImage = item.HinhAnh || item.image;
              const isAvailable = item.TrangThai === 'Có sẵn' || item.available !== false;
              const isFeatured = item.NoiBat || item.featured;
              const soldCount = item.DaBan || item.sold || 0;
              
              return (
                <ProductCard
                  key={itemId}
                  id={itemId}
                  img={itemImage}
                  title={itemName}
                  price={itemPrice}
                  sold={soldCount}
                  description={itemDescription}
                  onAddToCart={() => handleAddToCart(item)}
                  isAvailable={isAvailable}
                  featured={isFeatured}
                  formatPrice={formatCurrency}
                />
              );
            })}
          </div>
        )}

        {/* Categories Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Danh mục sản phẩm</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category) => {
              const categoryId = category.MaLoai || category.id;
              const categoryName = category.TenLoai || category.name;
              const categoryDescription = category.MoTa || category.description;
              
              return (
                <button
                  key={categoryId}
                  onClick={() => setSelectedCategory(categoryId.toString())}
                  className={`p-6 rounded-lg border-2 transition-all ${
                    selectedCategory === categoryId.toString()
                      ? 'border-amber-600 bg-amber-50'
                      : 'border-gray-200 hover:border-amber-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-amber-600 text-xl">☕</span>
                    </div>
                    <h3 className="font-medium text-gray-900">{categoryName}</h3>
                    <p className="text-sm text-gray-600 mt-1">{categoryDescription}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Menu;
