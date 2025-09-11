import { useState } from "react";
import { 
  FiPlus, 
  FiSearch, 
  FiFilter, 
  FiEdit, 
  FiTrash2, 
  FiEye,
  FiMoreVertical,
  FiPackage,
  FiDollarSign,
  FiTrendingUp,
  FiTrendingDown,
  FiCheck,
  FiX
} from "react-icons/fi";

function Products() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Mock data - trong thực tế sẽ fetch từ API
  const products = [
    {
      id: 1,
      name: "Cà phê đen",
      category: "Cà phê",
      price: 15000,
      originalPrice: 18000,
      stock: 50,
      status: "active",
      image: "/src/assets/img/coffee_item3-300x300.jpg",
      description: "Cà phê đen truyền thống",
      sales: 25,
      rating: 4.8
    },
    {
      id: 2,
      name: "Cà phê sữa đá",
      category: "Cà phê",
      price: 25000,
      originalPrice: 30000,
      stock: 30,
      status: "active",
      image: "/src/assets/img/coffee_item3-300x300.jpg",
      description: "Cà phê sữa đá mát lạnh",
      sales: 18,
      rating: 4.9
    },
    {
      id: 3,
      name: "Cappuccino",
      category: "Cà phê",
      price: 30000,
      originalPrice: 35000,
      stock: 25,
      status: "active",
      image: "/src/assets/img/coffee_item3-300x300.jpg",
      description: "Cappuccino với lớp foam mịn",
      sales: 15,
      rating: 4.7
    },
    {
      id: 4,
      name: "Latte",
      category: "Cà phê",
      price: 30000,
      originalPrice: 35000,
      stock: 20,
      status: "active",
      image: "/src/assets/img/coffee_item3-300x300.jpg",
      description: "Latte với sữa tươi",
      sales: 12,
      rating: 4.6
    },
    {
      id: 5,
      name: "Espresso",
      category: "Cà phê",
      price: 20000,
      originalPrice: 25000,
      stock: 0,
      status: "out_of_stock",
      image: "/src/assets/img/coffee_item3-300x300.jpg",
      description: "Espresso đậm đà",
      sales: 8,
      rating: 4.5
    },
    {
      id: 6,
      name: "Bánh mì sandwich",
      category: "Đồ ăn",
      price: 25000,
      originalPrice: 30000,
      stock: 15,
      status: "active",
      image: "/src/assets/img/coffee_item3-300x300.jpg",
      description: "Bánh mì sandwich thịt nguội",
      sales: 10,
      rating: 4.3
    }
  ];

  const categories = ["Tất cả", "Cà phê", "Đồ ăn", "Nước uống"];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'out_of_stock': return 'text-red-600 bg-red-100';
      case 'inactive': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Đang bán';
      case 'out_of_stock': return 'Hết hàng';
      case 'inactive': return 'Ngừng bán';
      default: return 'Không xác định';
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý menu cà phê</h1>
          <p className="text-gray-600 mt-1">Quản lý các món cà phê và đồ ăn</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
        >
          <FiPlus className="w-5 h-5 mr-2" />
          Thêm món mới
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng món</p>
              <p className="text-2xl font-bold text-gray-900">{products.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FiPackage className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Đang bán</p>
              <p className="text-2xl font-bold text-green-600">{products.filter(p => p.status === 'active').length}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <FiCheck className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Hết hàng</p>
              <p className="text-2xl font-bold text-red-600">{products.filter(p => p.status === 'out_of_stock').length}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <FiX className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Doanh thu hôm nay</p>
              <p className="text-2xl font-bold text-gray-900">1.2M</p>
            </div>
            <div className="p-3 bg-amber-100 rounded-lg">
              <FiDollarSign className="w-6 h-6 text-amber-600" />
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
                placeholder="Tìm kiếm món cà phê..."
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

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Món</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Danh mục</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Giá</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Tồn kho</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Trạng thái</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Đã bán</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-500">{product.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-gray-900">{formatPrice(product.price)} VNĐ</p>
                      {product.originalPrice > product.price && (
                        <p className="text-sm text-gray-500 line-through">{formatPrice(product.originalPrice)} VNĐ</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`font-medium ${
                      product.stock === 0 ? 'text-red-600' : 
                      product.stock < 10 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                      {getStatusText(product.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {product.sales > 15 ? (
                        <FiTrendingUp className="w-4 h-4 text-green-500 mr-1" />
                      ) : (
                        <FiTrendingDown className="w-4 h-4 text-gray-400 mr-1" />
                      )}
                      <span className="text-sm text-gray-900">{product.sales} ly</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                        <FiEye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setEditingProduct(product)}
                        className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg"
                      >
                        <FiEdit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
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

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-700">
          Hiển thị <span className="font-medium">1</span> đến <span className="font-medium">{filteredProducts.length}</span> trong tổng số <span className="font-medium">{products.length}</span> món
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

      {/* Add/Edit Product Modal */}
      {(showAddModal || editingProduct) && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => {setShowAddModal(false); setEditingProduct(null);}}></div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {editingProduct ? 'Chỉnh sửa món' : 'Thêm món mới'}
                </h3>
                
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên món</label>
                    <input
                      type="text"
                      defaultValue={editingProduct?.name || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500">
                      <option>Cà phê</option>
                      <option>Đồ ăn</option>
                      <option>Nước uống</option>
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Giá bán</label>
                      <input
                        type="number"
                        defaultValue={editingProduct?.price || ''}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Giá gốc</label>
                      <input
                        type="number"
                        defaultValue={editingProduct?.originalPrice || ''}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng tồn kho</label>
                    <input
                      type="number"
                      defaultValue={editingProduct?.stock || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                    <textarea
                      rows={3}
                      defaultValue={editingProduct?.description || ''}
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
                  {editingProduct ? 'Cập nhật' : 'Thêm món'}
                </button>
                <button
                  type="button"
                  onClick={() => {setShowAddModal(false); setEditingProduct(null);}}
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

export default Products;


