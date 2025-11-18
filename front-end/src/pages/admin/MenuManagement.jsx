import React, { useState, useEffect } from 'react';
import { menuAPI } from '../../shared/services/api';
import { useForm } from 'react-hook-form';
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiFilter, FiPackage } from 'react-icons/fi';
import MediaUploader from '../../components/common/media/MediaUploader';
import toast from 'react-hot-toast';

const MenuManagement = () => {
  const [activeTab, setActiveTab] = useState('menu'); // 'menu' or 'categories'
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');
  const [uploadedCategoryImageUrl, setUploadedCategoryImageUrl] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm();

  const {
    register: registerCategory,
    handleSubmit: handleSubmitCategory,
    reset: resetCategory,
    setValue: setValueCategory,
    formState: { errors: categoryErrors, isSubmitting: isCategorySubmitting },
  } = useForm();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterItems();
  }, [menuItems, selectedCategory, searchQuery]);

  const fetchData = async () => {
    try {
      const [itemsResponse, categoriesResponse] = await Promise.all([
        menuAPI.getMenuItems({ limit: 100 }), // Get all items
        menuAPI.getCategories()
      ]);
      
      
      // Handle menu items - check multiple formats
      let items = [];
      if (itemsResponse.data.menu_items) {
        items = itemsResponse.data.menu_items;
      } else if (itemsResponse.data.success && itemsResponse.data.items) {
        items = itemsResponse.data.items;
      } else if (Array.isArray(itemsResponse.data)) {
        items = itemsResponse.data;
      } else if (itemsResponse.data.items) {
        items = itemsResponse.data.items;
      } else if (itemsResponse.data.menuItems) {
        items = itemsResponse.data.menuItems;
      }
      
      // Handle categories - check multiple formats
      let categories = [];
      if (categoriesResponse.data.categories) {
        categories = categoriesResponse.data.categories;
      } else if (categoriesResponse.data.success && categoriesResponse.data.categories) {
        categories = categoriesResponse.data.categories;
      } else if (Array.isArray(categoriesResponse.data)) {
        categories = categoriesResponse.data;
      }
      
      setMenuItems(items);
      setCategories(categories);
    } catch (error) {
      console.error('Menu fetch error:', error);
      toast.error('Lỗi khi tải dữ liệu: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const filterItems = () => {
    let filtered = menuItems;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => 
        (item.MaLoai) === parseInt(selectedCategory)
      );
    }

    if (searchQuery) {
      filtered = filtered.filter(item =>
        (item.TenMon || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.MoTa || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredItems(filtered);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setValue('name', item.TenMon);
    setValue('description', item.MoTa);
    setValue('price', item.DonGia);
    setValue('categoryId', item.MaLoai);
    setValue('image', item.HinhAnh);
    setUploadedImageUrl(item.HinhAnh || '');
    setShowModal(true);
  };

  // Handle upload success
  const handleUploadSuccess = (uploadResult) => {
    if (uploadResult && uploadResult.url) {
      setUploadedImageUrl(uploadResult.url);
      setValue('image', uploadResult.url);
      toast.success('Upload ảnh thành công!');
    }
  };

  // Handle upload error
  const handleUploadError = (error) => {
    toast.error('Lỗi khi upload ảnh: ' + error.message);
  };

  // Handle category upload success
  const handleCategoryUploadSuccess = (uploadResult) => {
    if (uploadResult && uploadResult.url) {
      setUploadedCategoryImageUrl(uploadResult.url);
      setValueCategory('HinhAnh', uploadResult.url);
      toast.success('Upload ảnh danh mục thành công!');
    }
  };

  // Handle category upload error
  const handleCategoryUploadError = (error) => {
    toast.error('Lỗi khi upload ảnh danh mục: ' + error.message);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa món này?')) {
      try {
        await menuAPI.deleteMenuItem(id);
        toast.success('Xóa món thành công');
        fetchData();
      } catch (error) {
        console.error('Delete error:', error);
        const errorData = error.response?.data;
        
        // Handle case where item is referenced in orders
        if (errorData?.canSoftDelete && errorData?.references > 0) {
          const message = errorData.message || 'Món ăn này đã được sử dụng trong đơn hàng';
          const shouldSoftDelete = window.confirm(
            `${message}\n\nBạn có muốn đánh dấu món ăn là "Hết hàng" thay vì xóa không?`
          );
          
          if (shouldSoftDelete) {
            try {
              // Call soft delete API
              await menuAPI.softDeleteMenuItem(id);
              toast.success('Đã đánh dấu món ăn là "Hết hàng"');
              fetchData();
            } catch (softDeleteError) {
              console.error('Soft delete error:', softDeleteError);
              toast.error('Lỗi khi đánh dấu hết hàng');
            }
          }
        } else {
          // Handle other errors
          const errorMessage = errorData?.message || errorData?.error || 'Lỗi khi xóa món';
          toast.error(errorMessage);
        }
      }
    }
  };

  const onSubmit = async (data) => {
    try {
      // Map English form fields to Vietnamese schema
      const vietnameseData = {
        TenMon: data.name,
        MoTa: data.description,
        DonGia: parseFloat(data.price),
        MaLoai: parseInt(data.categoryId),
        HinhAnh: uploadedImageUrl || data.image || ''
      };

      if (editingItem) {
        await menuAPI.updateMenuItem(editingItem.MaMon, vietnameseData);
        toast.success('Cập nhật món thành công');
      } else {
        await menuAPI.createMenuItem(vietnameseData);
        toast.success('Thêm món mới thành công');
      }
      setShowModal(false);
      setEditingItem(null);
      setUploadedImageUrl('');
      reset();
      fetchData();
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Có lỗi xảy ra: ' + (error.response?.data?.message || error.message));
    }
  };


  // Category management functions
  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setValueCategory('TenLoai', category.TenLoai);
    setValueCategory('MoTa', category.MoTa);
    setValueCategory('HinhAnh', category.HinhAnh);
    setUploadedCategoryImageUrl(category.HinhAnh || '');
    setShowCategoryModal(true);
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
      try {
        await menuAPI.deleteCategory(id);
        toast.success('Xóa danh mục thành công');
        fetchData();
      } catch (error) {
        toast.error('Lỗi khi xóa danh mục');
      }
    }
  };

  const onSubmitCategory = async (data) => {
    try {
      // Update data with uploaded image URL
      const categoryData = {
        ...data,
        HinhAnh: uploadedCategoryImageUrl || data.HinhAnh || ''
      };

      if (editingCategory) {
        await menuAPI.updateCategory(editingCategory.MaLoai, categoryData);
        toast.success('Cập nhật danh mục thành công');
      } else {
        await menuAPI.createCategory(categoryData);
        toast.success('Thêm danh mục mới thành công');
      }
      setShowCategoryModal(false);
      setEditingCategory(null);
      setUploadedCategoryImageUrl('');
      resetCategory();
      fetchData();
    } catch (error) {
      toast.error('Có lỗi xảy ra');
    }
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
        <h1 className="text-2xl font-bold text-gray-900">Quản lý Menu & Danh mục</h1>
        <button
          onClick={() => {
            if (activeTab === 'menu') {
              setEditingItem(null);
              setUploadedImageUrl('');
              reset();
              setShowModal(true);
            } else {
              setEditingCategory(null);
              setUploadedCategoryImageUrl('');
              resetCategory();
              setShowCategoryModal(true);
            }
          }}
          className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors flex items-center space-x-2"
        >
          <FiPlus className="w-4 h-4" />
          <span>{activeTab === 'menu' ? 'Thêm món mới' : 'Thêm danh mục'}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('menu')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'menu'
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Món ăn & Thức uống
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'categories'
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Danh mục
            </button>
          </nav>
        </div>
      </div>

      {/* Menu Tab Content */}
      {activeTab === 'menu' && (
        <>
          {/* Filters */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm kiếm món ăn..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <FiFilter className="text-gray-400 w-5 h-5" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="all">Tất cả danh mục</option>
              {categories.map((category, index) => (
                <option key={category.MaLoai || index} value={category.MaLoai}>
                  {category.TenLoai}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Info */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-gray-600">
          Hiển thị <span className="font-medium">{filteredItems.length}</span> trong tổng số <span className="font-medium">{menuItems.length}</span> món
          {selectedCategory !== 'all' && (
            <span className="ml-2 text-amber-600">
              • Lọc theo: {categories.find(cat => cat.MaLoai === parseInt(selectedCategory))?.TenLoai}
            </span>
          )}
        </div>
        {(selectedCategory !== 'all' || searchQuery) && (
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
            }}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Xóa bộ lọc
          </button>
        )}
      </div>

      {/* Menu Items Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Món ăn
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Danh mục
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Giá
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mô tả
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredItems.map((item, index) => (
                <tr key={item.id || item.MaMon || index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        src={item.HinhAnh}
                        className="w-12 h-12 rounded-lg object-cover mr-4"
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{item.TenMon}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      {categories.find(cat => (cat.MaLoai) === (item.MaLoai))?.TenLoai}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">
                      {(item.DonGia)?.toLocaleString('vi-VN')}đ
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs">
                      <p 
                        className="overflow-hidden" 
                        style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          lineHeight: '1.4em',
                          maxHeight: '2.8em'
                        }}
                        title={item.MoTa}
                      >
                        {item.MoTa || 'Chưa có mô tả'}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="!mx-2 text-amber-600 hover:text-amber-900"
                      >
                        <FiEdit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.MaMon)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <FiSearch className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy món nào</h3>
            <p className="text-gray-600 mb-4">
              {selectedCategory !== 'all' || searchQuery 
                ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm' 
                : 'Thử thêm món mới vào menu'
              }
            </p>
            {(selectedCategory !== 'all' || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                }}
                className="text-amber-600 hover:text-amber-700 font-medium"
              >
                Xóa tất cả bộ lọc
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-auto max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingItem ? 'Chỉnh sửa món' : 'Thêm món mới'}
            </h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên món *
                </label>
                <input
                  {...register('name', { required: 'Tên món là bắt buộc' })}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả
                </label>
                <textarea
                  {...register('description')}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>

              {/* Giá và Danh mục - 2 cột */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giá *
                  </label>
                  <input
                    {...register('price', { 
                      required: 'Giá là bắt buộc',
                      min: { value: 0, message: 'Giá phải lớn hơn 0' }
                    })}
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="VD: 50000"
                  />
                  {errors.price && (
                    <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Danh mục *
                  </label>
                  <select
                    {...register('categoryId', { required: 'Danh mục là bắt buộc' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  >
                    <option value="">Chọn danh mục</option>
                    {categories.map((category, index) => (
                      <option key={category.MaLoai || index} value={category.MaLoai}>
                        {category.TenLoai}
                      </option>
                    ))}
                  </select>
                  {errors.categoryId && (
                    <p className="mt-1 text-sm text-red-600">{errors.categoryId.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hình ảnh món ăn
                </label>
                
                {/* Hidden input để lưu URL cho form */}
                <input
                  {...register('image')}
                  type="hidden"
                  value={uploadedImageUrl}
                />
                
                {/* Preview ảnh hiện tại */}
                {uploadedImageUrl && (
                  <div className="mb-3">
                    <p className="text-sm text-gray-600 mb-2">Ảnh hiện tại:</p>
                    <img 
                      src={uploadedImageUrl} 
                      alt="Preview" 
                      className="w-32 h-32 object-cover rounded-lg border shadow-sm"
                    />
                  </div>
                )}
                
                {/* MediaUploader component */}
                <MediaUploader
                  type="menu"
                  itemId={editingItem?.MaMon}
                  purpose="main"
                  multiple={false}
                  accept="image/*"
                  maxSize={10 * 1024 * 1024} // 10MB
                  onUploadSuccess={handleUploadSuccess}
                  onUploadError={handleUploadError}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-4"
                />
                
                <p className="text-xs text-gray-500 mt-2">
                  Chấp nhận: JPG, PNG, GIF, WebP. Kích thước tối đa: 10MB
                </p>
              </div>


              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingItem(null);
                    setUploadedImageUrl('');
                    reset();
                  }}
                  className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
                >
                  {isSubmitting && (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  <span>{isSubmitting ? 'Đang lưu...' : (editingItem ? 'Cập nhật' : 'Thêm mới')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
        </>
      )}

      {/* Categories Tab Content */}
      {activeTab === 'categories' && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hình ảnh
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tên danh mục
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mô tả
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Số món
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {categories.map((category) => (
                  <tr key={category.MaLoai || category.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                        {(category.HinhAnh || category.image) ? (
                          <img
                            src={category.HinhAnh || category.image}
                            alt={category.TenLoai || category.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <FiPackage className="w-6 h-6" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {category.TenLoai || category.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 max-w-xs truncate">
                        {category.MoTa || 'Chưa có mô tả'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                        {menuItems.filter(item => 
                          (item.MaLoai || item.categoryId) === (category.MaLoai || category.id)
                        ).length} món
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditCategory(category)}
                          className="!mx-2 text-blue-600 hover:text-blue-900"
                        >
                          <FiEdit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.MaLoai)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">
                {editingCategory ? 'Cập nhật danh mục' : 'Thêm danh mục mới'}
              </h2>
              
              <form onSubmit={handleSubmitCategory(onSubmitCategory)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên danh mục *
                  </label>
                  <input
                    {...registerCategory('TenLoai', { 
                      required: 'Tên danh mục là bắt buộc',
                      minLength: { value: 2, message: 'Tên danh mục phải có ít nhất 2 ký tự' }
                    })}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="Nhập tên danh mục"
                  />
                  {categoryErrors.TenLoai && (
                    <p className="text-red-500 text-sm mt-1">{categoryErrors.TenLoai.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hình ảnh danh mục
                  </label>
                  
                  {/* Hidden input để lưu URL cho form */}
                  <input
                    {...registerCategory('HinhAnh')}
                    type="hidden"
                    value={uploadedCategoryImageUrl}
                  />
                  
                  {/* Preview ảnh hiện tại */}
                  {uploadedCategoryImageUrl && (
                    <div className="mb-3">
                      <p className="text-sm text-gray-600 mb-2">Ảnh hiện tại:</p>
                      <img 
                        src={uploadedCategoryImageUrl} 
                        alt="Preview" 
                        className="w-32 h-32 object-cover rounded-lg border shadow-sm"
                      />
                    </div>
                  )}
                  
                  {/* MediaUploader component */}
                  <MediaUploader
                    type="category"
                    itemId={editingCategory?.MaLoai}
                    purpose="main"
                    multiple={false}
                    accept="image/*"
                    maxSize={10 * 1024 * 1024} // 10MB
                    onUploadSuccess={handleCategoryUploadSuccess}
                    onUploadError={handleCategoryUploadError}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-4"
                  />
                  
                  <p className="text-xs text-gray-500 mt-2">
                    Chấp nhận: JPG, PNG, GIF, WebP. Kích thước tối đa: 10MB
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mô tả
                  </label>
                  <textarea
                    {...registerCategory('MoTa')}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="Mô tả về danh mục này..."
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCategoryModal(false);
                      setEditingCategory(null);
                      setUploadedCategoryImageUrl('');
                      resetCategory();
                    }}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isCategorySubmitting}
                    className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50"
                  >
                    {isCategorySubmitting ? 'Đang lưu...' : (editingCategory ? 'Cập nhật' : 'Thêm mới')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuManagement;
