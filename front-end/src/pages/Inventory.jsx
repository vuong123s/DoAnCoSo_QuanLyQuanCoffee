import { useState } from "react";
import { 
  FiPlus, 
  FiSearch, 
  FiFilter, 
  FiEdit, 
  FiTrash2, 
  FiEye,
  FiPackage,
  FiTrendingUp,
  FiTrendingDown,
  FiAlertTriangle,
  FiCheckCircle,
  FiXCircle,
  FiDownload,
  FiUpload,
  FiBox,
  FiMinus,
  FiCalendar,
  FiUser
} from "react-icons/fi";

function Inventory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Mock data - trong thực tế sẽ fetch từ API
  const inventoryItems = [
    {
      id: 1,
      name: "Cà phê Arabica",
      category: "Nguyên liệu",
      currentStock: 15,
      minStock: 5,
      maxStock: 30,
      unit: "kg",
      cost: 120000,
      supplier: "Nhà cung cấp A",
      lastUpdated: "2024-01-15",
      status: "normal"
    },
    {
      id: 2,
      name: "Sữa tươi",
      category: "Nguyên liệu",
      currentStock: 3,
      minStock: 5,
      maxStock: 15,
      unit: "lít",
      cost: 25000,
      supplier: "Nhà cung cấp B",
      lastUpdated: "2024-01-14",
      status: "low"
    },
    {
      id: 3,
      name: "Đường",
      category: "Nguyên liệu",
      currentStock: 8,
      minStock: 3,
      maxStock: 15,
      unit: "kg",
      cost: 15000,
      supplier: "Nhà cung cấp C",
      lastUpdated: "2024-01-15",
      status: "normal"
    },
    {
      id: 4,
      name: "Ly giấy",
      category: "Vật tư",
      currentStock: 0,
      minStock: 50,
      maxStock: 200,
      unit: "cái",
      cost: 2000,
      supplier: "Nhà cung cấp D",
      lastUpdated: "2024-01-13",
      status: "out"
    },
    {
      id: 5,
      name: "Bánh mì",
      category: "Thực phẩm",
      currentStock: 12,
      minStock: 5,
      maxStock: 25,
      unit: "cái",
      cost: 8000,
      supplier: "Nhà cung cấp E",
      lastUpdated: "2024-01-15",
      status: "normal"
    }
  ];

  const categories = ["Tất cả", "Nguyên liệu", "Vật tư", "Thực phẩm", "Khác"];

  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'normal': return 'text-green-600 bg-green-100';
      case 'low': return 'text-yellow-600 bg-yellow-100';
      case 'out': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'normal': return 'Bình thường';
      case 'low': return 'Sắp hết';
      case 'out': return 'Hết hàng';
      default: return 'Không xác định';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'normal': return <FiCheckCircle className="w-4 h-4" />;
      case 'low': return <FiAlertTriangle className="w-4 h-4" />;
      case 'out': return <FiXCircle className="w-4 h-4" />;
      default: return <FiBox className="w-4 h-4" />;
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getStockPercentage = (current, max) => {
    return Math.round((current / max) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý nguyên liệu</h1>
          <p className="text-gray-600 mt-1">Theo dõi nguyên liệu làm cà phê</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <FiUpload className="w-5 h-5 mr-2" />
            Nhập kho
          </button>
          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FiDownload className="w-5 h-5 mr-2" />
            Xuất kho
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            <FiPlus className="w-5 h-5 mr-2" />
            Thêm mới
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng nguyên liệu</p>
              <p className="text-2xl font-bold text-gray-900">{inventoryItems.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FiPackage className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Bình thường</p>
              <p className="text-2xl font-bold text-green-600">{inventoryItems.filter(i => i.status === 'normal').length}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <FiCheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Sắp hết</p>
              <p className="text-2xl font-bold text-yellow-600">{inventoryItems.filter(i => i.status === 'low').length}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <FiAlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Hết hàng</p>
              <p className="text-2xl font-bold text-red-600">{inventoryItems.filter(i => i.status === 'out').length}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <FiXCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm kiếm nguyên liệu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            >
              {categories.map(category => (
                <option key={category} value={category === "Tất cả" ? "all" : category}>
                  {category}
                </option>
              ))}
            </select>
            <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <FiFilter className="w-5 h-5 mr-2" />
              Bộ lọc
            </button>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Nguyên liệu</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Danh mục</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Tồn kho</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Giá nhập</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Nhà cung cấp</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Trạng thái</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Cập nhật</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-500">ID: {item.id}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className={`font-medium ${
                          item.currentStock === 0 ? 'text-red-600' : 
                          item.currentStock <= item.minStock ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {item.currentStock} {item.unit}
                        </span>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              item.currentStock === 0 ? 'bg-red-500' : 
                              item.currentStock <= item.minStock ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${getStockPercentage(item.currentStock, item.maxStock)}%` }}
                          ></div>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Min: {item.minStock} | Max: {item.maxStock}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-900">{formatPrice(item.cost)} VNĐ</p>
                    <p className="text-sm text-gray-500">/{item.unit}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-900">{item.supplier}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                      {getStatusIcon(item.status)}
                      <span className="ml-1">{getStatusText(item.status)}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-900">{formatDate(item.lastUpdated)}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                        <FiEye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setEditingItem(item)}
                        className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg"
                      >
                        <FiEdit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg">
                        <FiPlus className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                        <FiMinus className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-700">
          Hiển thị <span className="font-medium">1</span> đến <span className="font-medium">{filteredItems.length}</span> trong tổng số <span className="font-medium">{inventoryItems.length}</span> nguyên liệu
        </p>
        <div className="flex items-center space-x-2">
          <button className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            Trước
          </button>
          <button className="px-3 py-2 text-sm font-medium text-white bg-amber-600 border border-amber-600 rounded-lg">
            1
          </button>
          <button className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            2
          </button>
          <button className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            Sau
          </button>
        </div>
      </div>

      {/* Add/Edit Item Modal */}
      {(showAddModal || editingItem) && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => {setShowAddModal(false); setEditingItem(null);}}></div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {editingItem ? 'Chỉnh sửa nguyên liệu' : 'Thêm nguyên liệu mới'}
                </h3>
                
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên nguyên liệu</label>
                    <input
                      type="text"
                      defaultValue={editingItem?.name || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500">
                      <option>Nguyên liệu</option>
                      <option>Vật tư</option>
                      <option>Thực phẩm</option>
                      <option>Khác</option>
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng hiện tại</label>
                      <input
                        type="number"
                        defaultValue={editingItem?.currentStock || ''}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Đơn vị</label>
                      <input
                        type="text"
                        defaultValue={editingItem?.unit || ''}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tồn kho tối thiểu</label>
                      <input
                        type="number"
                        defaultValue={editingItem?.minStock || ''}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tồn kho tối đa</label>
                      <input
                        type="number"
                        defaultValue={editingItem?.maxStock || ''}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Giá nhập</label>
                    <input
                      type="number"
                      defaultValue={editingItem?.cost || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nhà cung cấp</label>
                    <input
                      type="text"
                      defaultValue={editingItem?.supplier || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>
                </form>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-amber-600 text-base font-medium text-white hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  {editingItem ? 'Cập nhật' : 'Thêm nguyên liệu'}
                </button>
                <button
                  type="button"
                  onClick={() => {setShowAddModal(false); setEditingItem(null);}}
                  className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowImportModal(false)}></div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Nhập kho</h3>
                
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nguyên liệu</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500">
                      <option>Chọn nguyên liệu</option>
                      {inventoryItems.map(item => (
                        <option key={item.id} value={item.id}>{item.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng nhập</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Giá nhập mới</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                    <textarea
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>
                </form>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Nhập kho
                </button>
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowExportModal(false)}></div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Xuất kho</h3>
                
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nguyên liệu</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500">
                      <option>Chọn nguyên liệu</option>
                      {inventoryItems.map(item => (
                        <option key={item.id} value={item.id}>{item.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng xuất</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Lý do xuất</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500">
                      <option>Bán hàng</option>
                      <option>Hỏng hóc</option>
                      <option>Kiểm kê</option>
                      <option>Khác</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                    <textarea
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>
                </form>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Xuất kho
                </button>
                <button
                  type="button"
                  onClick={() => setShowExportModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Inventory;


