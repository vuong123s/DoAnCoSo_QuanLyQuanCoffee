import React, { useState, useEffect } from 'react';
import { 
  FiUpload, 
  FiImage, 
  FiVideo, 
  FiFolder,
  FiSearch,
  FiFilter,
  FiGrid,
  FiList,
  FiRefreshCw,
} from 'react-icons/fi';
import MediaUploader from '../../common/media/MediaUploader';
import MediaGallery from '../../common/media/MediaGallery';
import toast from 'react-hot-toast';

const MediaManager = () => {
  const [activeTab, setActiveTab] = useState('menu'); // 'menu' hoặc 'category'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' hoặc 'list'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPurpose, setSelectedPurpose] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showUploader, setShowUploader] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch menu items và categories
  useEffect(() => {
    fetchMenuItems();
    fetchCategories();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const response = await fetch('/api/menu');
      const result = await response.json();
      if (result.success) {
        setMenuItems(result.products || []);
      }
    } catch (error) {
      console.error('Error fetching menu items:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const result = await response.json();
      if (result.success) {
        setCategories(result.categories || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Lọc items dựa trên search term
  const getFilteredItems = () => {
    const items = activeTab === 'menu' ? menuItems : categories;
    if (!searchTerm) return items;
    
    return items.filter(item => 
      (item.TenMon || item.TenLoai).toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Handle upload success
  const handleUploadSuccess = (uploadResult) => {
    toast.success('Upload thành công!');
    setShowUploader(false);
    // Refresh media gallery nếu cần
  };

  // Handle upload error
  const handleUploadError = (error) => {
    toast.error(`Upload thất bại: ${error.message}`);
  };

  const purposeOptions = [
    { value: 'all', label: 'Tất cả' },
    { value: 'main', label: 'Ảnh chính' },
    { value: 'thumbnail', label: 'Thumbnail' },
    { value: 'gallery', label: 'Gallery' },
    { value: 'banner', label: 'Banner' }
  ];

  return (
    <div className="media-manager p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý Media</h1>
            <p className="text-gray-600">Quản lý ảnh và video cho món ăn và danh mục</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowUploader(!showUploader)}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FiUpload className="w-4 h-4" />
              <span>Upload Media</span>
            </button>
            
            <button
              onClick={() => {
                fetchMenuItems();
                fetchCategories();
              }}
              className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FiRefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-200 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('menu')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'menu'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FiImage className="w-4 h-4 inline mr-2" />
            Món ăn
          </button>
          <button
            onClick={() => setActiveTab('category')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'category'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FiFolder className="w-4 h-4 inline mr-2" />
            Danh mục
          </button>
        </div>
      </div>

      {/* Upload Section */}
      {showUploader && (
        <div className="mb-6 bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Upload Media</h2>
            <button
              onClick={() => setShowUploader(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
          
          <MediaUploader
            type={activeTab}
            itemId={selectedItem?.MaMon || selectedItem?.MaLoai}
            purpose="gallery"
            multiple={true}
            onUploadSuccess={handleUploadSuccess}
            onUploadError={handleUploadError}
          />
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="flex-1 min-w-64">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder={`Tìm kiếm ${activeTab === 'menu' ? 'món ăn' : 'danh mục'}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Purpose Filter */}
          <div className="flex items-center space-x-2">
            <FiFilter className="w-4 h-4 text-gray-400" />
            <select
              value={selectedPurpose}
              onChange={(e) => setSelectedPurpose(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {purposeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* View Mode */}
          <div className="flex items-center space-x-1 border border-gray-300 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded ${
                viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'
              }`}
            >
              <FiGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded ${
                viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'
              }`}
            >
              <FiList className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Items List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">
                {activeTab === 'menu' ? 'Món ăn' : 'Danh mục'}
              </h3>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {getFilteredItems().map((item) => (
                <button
                  key={item.MaMon || item.MaLoai}
                  onClick={() => setSelectedItem(item)}
                  className={`w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 transition-colors ${
                    selectedItem?.MaMon === item.MaMon || selectedItem?.MaLoai === item.MaLoai
                      ? 'bg-blue-50 border-l-4 border-l-blue-500'
                      : ''
                  }`}
                >
                  <div className="font-medium text-gray-900 truncate">
                    {item.TenMon || item.TenLoai}
                  </div>
                  {item.DonGia && (
                    <div className="text-sm text-gray-500">
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND'
                      }).format(item.DonGia)}
                    </div>
                  )}
                  <div className="text-xs text-gray-400 mt-1">
                    ID: {item.MaMon || item.MaLoai}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Media Gallery */}
        <div className="lg:col-span-3">
          {selectedItem ? (
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Media của: {selectedItem.TenMon || selectedItem.TenLoai}
                    </h3>
                    <p className="text-sm text-gray-500">
                      ID: {selectedItem.MaMon || selectedItem.MaLoai}
                    </p>
                  </div>
                  
                  <button
                    onClick={() => {
                      setShowUploader(true);
                    }}
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm"
                  >
                    <FiUpload className="w-4 h-4" />
                    <span>Thêm media</span>
                  </button>
                </div>
              </div>
              
              <div className="p-4">
                <MediaGallery
                  type={activeTab}
                  itemId={selectedItem.MaMon || selectedItem.MaLoai}
                  purpose={selectedPurpose === 'all' ? null : selectedPurpose}
                  editable={true}
                />
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="text-center text-gray-500">
                <FiImage className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">Chọn một item để xem media</p>
                <p className="text-sm">
                  Chọn một {activeTab === 'menu' ? 'món ăn' : 'danh mục'} từ danh sách bên trái để xem và quản lý media
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MediaManager;
