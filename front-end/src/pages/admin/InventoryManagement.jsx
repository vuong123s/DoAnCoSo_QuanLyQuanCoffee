import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiPlus, FiEdit2, FiTrash2, FiPackage, FiAlertTriangle, FiTrendingUp, FiTrendingDown, FiSearch } from 'react-icons/fi';

const InventoryManagement = () => {
  const [inventory, setInventory] = useState([]);
  const [alerts, setAlerts] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('create');
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showAlerts, setShowAlerts] = useState(false);

  const [formData, setFormData] = useState({
    TenNL: '',
    DonVi: '',
    SoLuong: 0,
    MucCanhBao: 0,
    DonGiaNhap: 0,
    NgayNhap: '',
    NgayHetHan: '',
    SoLuongNhap: 0,
    SoLuongXuat: 0
  });

  useEffect(() => {
    fetchInventory();
    fetchAlerts();
    fetchStatistics();
  }, [searchTerm, statusFilter]);

  const fetchInventory = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);

      const response = await fetch(`http://localhost:3000/api/inventory?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setInventory(data.items || []);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      toast.error('Lỗi khi tải danh sách nguyên liệu');
    } finally {
      setLoading(false);
    }
  };

  const fetchAlerts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/inventory/alerts', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setAlerts(data);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  const fetchStatistics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/inventory/statistics', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setStatistics(data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const handleOpenModal = (type, item = null) => {
    setModalType(type);
    setSelectedItem(item);
    
    if (type === 'edit' && item) {
      setFormData({
        TenNL: item.TenNL,
        DonVi: item.DonVi,
        SoLuong: item.SoLuong,
        MucCanhBao: item.MucCanhBao,
        DonGiaNhap: item.DonGiaNhap || 0,
        NgayNhap: item.NgayNhap || '',
        NgayHetHan: item.NgayHetHan || '',
        SoLuongNhap: 0,
        SoLuongXuat: 0
      });
    } else if (type === 'import' && item) {
      setFormData({
        ...formData,
        SoLuongNhap: 0,
        DonGiaNhap: item.DonGiaNhap || 0,
        NgayHetHan: item.NgayHetHan || ''
      });
    } else if (type === 'export' && item) {
      setFormData({
        ...formData,
        SoLuongXuat: 0
      });
    } else {
      setFormData({
        TenNL: '',
        DonVi: '',
        SoLuong: 0,
        MucCanhBao: 0,
        DonGiaNhap: 0,
        NgayNhap: new Date().toISOString().split('T')[0],
        NgayHetHan: '',
        SoLuongNhap: 0,
        SoLuongXuat: 0
      });
    }
    
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedItem(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const token = localStorage.getItem('token');
    
    try {
      let response;
      
      if (modalType === 'create') {
        response = await fetch('http://localhost:3000/api/inventory', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        });
      } else if (modalType === 'edit') {
        response = await fetch(`http://localhost:3000/api/inventory/${selectedItem.MaNL}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        });
      } else if (modalType === 'import') {
        response = await fetch(`http://localhost:3000/api/inventory/${selectedItem.MaNL}/import`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            SoLuongNhap: formData.SoLuongNhap,
            DonGiaNhap: formData.DonGiaNhap,
            NgayHetHan: formData.NgayHetHan
          })
        });
      } else if (modalType === 'export') {
        response = await fetch(`http://localhost:3000/api/inventory/${selectedItem.MaNL}/export`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            SoLuongXuat: formData.SoLuongXuat
          })
        });
      }
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success(data.message);
        handleCloseModal();
        fetchInventory();
        fetchAlerts();
        fetchStatistics();
      } else {
        toast.error(data.error || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Lỗi khi thực hiện thao tác');
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Bạn có chắc muốn xóa nguyên liệu "${item.TenNL}"?`)) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/inventory/${item.MaNL}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success(data.message);
        fetchInventory();
        fetchStatistics();
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Lỗi khi xóa nguyên liệu');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Còn hàng':
        return 'bg-green-100 text-green-800';
      case 'Gần hết':
        return 'bg-yellow-100 text-yellow-800';
      case 'Hết hàng':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const formatCurrency = (amount) => {
    if (!amount) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Quản lý kho</h1>
        <p className="text-gray-600 mt-2">Quản lý nguyên liệu và theo dõi tồn kho</p>
      </div>

      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tổng nguyên liệu</p>
                <p className="text-3xl font-bold text-gray-900">{statistics.totalItems}</p>
              </div>
              <FiPackage className="text-4xl text-indigo-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Còn hàng</p>
                <p className="text-3xl font-bold text-green-600">{statistics.stats.inStock}</p>
              </div>
              <FiPackage className="text-4xl text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Gần hết</p>
                <p className="text-3xl font-bold text-yellow-600">{statistics.stats.lowStock}</p>
              </div>
              <FiAlertTriangle className="text-4xl text-yellow-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Hết hàng</p>
                <p className="text-3xl font-bold text-red-600">{statistics.stats.outOfStock}</p>
              </div>
              <FiAlertTriangle className="text-4xl text-red-600" />
            </div>
          </div>
        </div>
      )}

      {alerts && (alerts.summary.lowStockCount > 0 || alerts.summary.expiringSoonCount > 0 || alerts.summary.expiredCount > 0) && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FiAlertTriangle className="text-yellow-400 text-xl mr-3" />
              <div>
                <p className="font-medium text-yellow-800">Cảnh báo kho</p>
                <p className="text-sm text-yellow-700">
                  {alerts.summary.lowStockCount} sắp hết • {alerts.summary.expiringSoonCount} sắp hết hạn • {alerts.summary.expiredCount} đã hết hạn
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowAlerts(!showAlerts)}
              className="text-yellow-800 hover:text-yellow-900 font-medium"
            >
              {showAlerts ? 'Ẩn' : 'Xem chi tiết'}
            </button>
          </div>
          
          {showAlerts && (
            <div className="mt-4 space-y-2">
              {alerts.lowStock.length > 0 && (
                <div>
                  <p className="font-medium text-yellow-800 mb-2">Nguyên liệu sắp hết:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {alerts.lowStock.map(item => (
                      <li key={item.MaNL} className="text-sm text-yellow-700">
                        {item.TenNL}: {item.SoLuong} {item.DonVi} (Cảnh báo: {item.MucCanhBao} {item.DonVi})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex gap-4 flex-1 w-full md:w-auto">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm nguyên liệu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="Còn hàng">Còn hàng</option>
              <option value="Gần hết">Gần hết</option>
              <option value="Hết hàng">Hết hàng</option>
            </select>
          </div>
          
          <button
            onClick={() => handleOpenModal('create')}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <FiPlus className="mr-2" />
            Thêm nguyên liệu
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nguyên liệu</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số lượng</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Đơn giá</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày nhập</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hết hạn</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {inventory.length > 0 ? (
                inventory.map((item) => (
                  <tr key={item.MaNL} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{item.TenNL}</div>
                      <div className="text-xs text-gray-500">Đơn vị: {item.DonVi}</div>
                      <div className="text-xs text-gray-500">Cảnh báo: {item.MucCanhBao} {item.DonVi}</div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {item.SoLuong} {item.DonVi}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{formatCurrency(item.DonGiaNhap)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatDate(item.NgayNhap)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatDate(item.NgayHetHan)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.TrangThai)}`}>
                        {item.TrangThai}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm space-x-2">
                      <button onClick={() => handleOpenModal('import', item)} className="text-green-600 hover:text-green-900" title="Nhập kho">
                        <FiTrendingUp className="inline" />
                      </button>
                      <button onClick={() => handleOpenModal('export', item)} className="text-orange-600 hover:text-orange-900" title="Xuất kho">
                        <FiTrendingDown className="inline" />
                      </button>
                      <button onClick={() => handleOpenModal('edit', item)} className="text-indigo-600 hover:text-indigo-900" title="Chỉnh sửa">
                        <FiEdit2 className="inline" />
                      </button>
                      <button onClick={() => handleDelete(item)} className="text-red-600 hover:text-red-900" title="Xóa">
                        <FiTrash2 className="inline" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    <FiPackage className="text-6xl text-gray-300 mx-auto mb-4" />
                    <p>Không có nguyên liệu nào</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-4">
                {modalType === 'create' && 'Thêm nguyên liệu mới'}
                {modalType === 'edit' && 'Chỉnh sửa nguyên liệu'}
                {modalType === 'import' && `Nhập kho: ${selectedItem?.TenNL}`}
                {modalType === 'export' && `Xuất kho: ${selectedItem?.TenNL}`}
              </h3>

              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  {(modalType === 'create' || modalType === 'edit') && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tên nguyên liệu *</label>
                        <input
                          type="text"
                          value={formData.TenNL}
                          onChange={(e) => setFormData({ ...formData, TenNL: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Đơn vị *</label>
                        <input
                          type="text"
                          value={formData.DonVi}
                          onChange={(e) => setFormData({ ...formData, DonVi: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg"
                          required
                        />
                      </div>
                      {modalType === 'create' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng ban đầu</label>
                          <input
                            type="number"
                            step="0.01"
                            value={formData.SoLuong}
                            onChange={(e) => setFormData({ ...formData, SoLuong: parseFloat(e.target.value) })}
                            className="w-full px-3 py-2 border rounded-lg"
                          />
                        </div>
                      )}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mức cảnh báo *</label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.MucCanhBao}
                          onChange={(e) => setFormData({ ...formData, MucCanhBao: parseFloat(e.target.value) })}
                          className="w-full px-3 py-2 border rounded-lg"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Đơn giá nhập</label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.DonGiaNhap}
                          onChange={(e) => setFormData({ ...formData, DonGiaNhap: parseFloat(e.target.value) })}
                          className="w-full px-3 py-2 border rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ngày hết hạn</label>
                        <input
                          type="date"
                          value={formData.NgayHetHan}
                          onChange={(e) => setFormData({ ...formData, NgayHetHan: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg"
                        />
                      </div>
                    </>
                  )}

                  {modalType === 'import' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng nhập * ({selectedItem?.DonVi})</label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.SoLuongNhap}
                          onChange={(e) => setFormData({ ...formData, SoLuongNhap: parseFloat(e.target.value) })}
                          className="w-full px-3 py-2 border rounded-lg"
                          required
                          min="0.01"
                        />
                        <p className="text-xs text-gray-500 mt-1">Tồn kho hiện tại: {selectedItem?.SoLuong} {selectedItem?.DonVi}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Đơn giá nhập</label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.DonGiaNhap}
                          onChange={(e) => setFormData({ ...formData, DonGiaNhap: parseFloat(e.target.value) })}
                          className="w-full px-3 py-2 border rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ngày hết hạn</label>
                        <input
                          type="date"
                          value={formData.NgayHetHan}
                          onChange={(e) => setFormData({ ...formData, NgayHetHan: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg"
                        />
                      </div>
                    </>
                  )}

                  {modalType === 'export' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng xuất * ({selectedItem?.DonVi})</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.SoLuongXuat}
                        onChange={(e) => setFormData({ ...formData, SoLuongXuat: parseFloat(e.target.value) })}
                        className="w-full px-3 py-2 border rounded-lg"
                        required
                        min="0.01"
                        max={selectedItem?.SoLuong}
                      />
                      <p className="text-xs text-gray-500 mt-1">Tồn kho hiện tại: {selectedItem?.SoLuong} {selectedItem?.DonVi}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-6">
                  <button type="submit" className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                    {modalType === 'create' && 'Tạo mới'}
                    {modalType === 'edit' && 'Cập nhật'}
                    {modalType === 'import' && 'Nhập kho'}
                    {modalType === 'export' && 'Xuất kho'}
                  </button>
                  <button type="button" onClick={handleCloseModal} className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400">
                    Hủy
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

export default InventoryManagement;
