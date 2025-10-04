import React, { useState, useEffect } from 'react';
import { tableAPI } from '../../shared/services/api';
import TablesByArea from '../../components/tables/TablesByArea';
import { FiPlus, FiEdit, FiTrash2, FiGrid, FiList, FiMapPin, FiUsers, FiBarChart2 } from 'react-icons/fi';
import toast from 'react-hot-toast';

const TableManagement = () => {
  const [tables, setTables] = useState([]);
  const [areas, setAreas] = useState([]);
  const [filteredTables, setFilteredTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('area'); // 'area', 'grid', 'list'
  const [showModal, setShowModal] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  const [filters, setFilters] = useState({
    area: '',
    status: '',
    search: ''
  });
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    occupied: 0,
    reserved: 0,
    maintenance: 0
  });

  const [formData, setFormData] = useState({
    TenBan: '',
    SoCho: 2,
    MaKhuVuc: '',
    ViTri: '',
    TrangThai: 'Trống'
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterTables();
  }, [tables, filters]);

  const fetchData = async () => {
    try {
      const [tablesResponse, areasResponse, statsResponse] = await Promise.all([
        tableAPI.getTables(),
        tableAPI.getAreas(),
        tableAPI.getTableStats()
      ]);

      if (tablesResponse.data.success) {
        setTables(tablesResponse.data.tables);
      }
      
      if (areasResponse.data.success) {
        setAreas(areasResponse.data.areas);
      }
      
      if (statsResponse.data.success) {
        setStats(statsResponse.data.stats);
      }
    } catch (error) {
      toast.error('Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const filterTables = () => {
    let filtered = tables;

    if (filters.area) {
      filtered = filtered.filter(table => 
        table.KhuVuc?.TenKhuVuc === filters.area || table.MaKhuVuc == filters.area
      );
    }

    if (filters.status) {
      filtered = filtered.filter(table => table.TrangThai === filters.status);
    }

    if (filters.search) {
      filtered = filtered.filter(table =>
        table.TenBan.toLowerCase().includes(filters.search.toLowerCase()) ||
        table.ViTri?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    setFilteredTables(filtered);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingTable) {
        const response = await tableAPI.updateTable(editingTable.MaBan, formData);
        if (response.data.success) {
          toast.success('Cập nhật bàn thành công');
        }
      } else {
        const response = await tableAPI.createTable(formData);
        if (response.data.success) {
          toast.success('Thêm bàn thành công');
        }
      }
      
      setShowModal(false);
      setEditingTable(null);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (table) => {
    setEditingTable(table);
    setFormData({
      TenBan: table.TenBan,
      SoCho: table.SoCho,
      MaKhuVuc: table.MaKhuVuc,
      ViTri: table.ViTri || '',
      TrangThai: table.TrangThai
    });
    setShowModal(true);
  };

  const handleDelete = async (table) => {
    if (!window.confirm(`Bạn có chắc muốn xóa ${table.TenBan}?`)) return;

    try {
      const response = await tableAPI.deleteTable(table.MaBan);
      if (response.data.success) {
        toast.success('Xóa bàn thành công');
        fetchData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleStatusChange = async (table, newStatus) => {
    try {
      const response = await tableAPI.updateTableStatus(table.MaBan, { TrangThai: newStatus });
      if (response.data.success) {
        toast.success('Cập nhật trạng thái thành công');
        fetchData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const resetForm = () => {
    setFormData({
      TenBan: '',
      SoCho: 2,
      MaKhuVuc: '',
      ViTri: '',
      TrangThai: 'Trống'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Trống': return 'text-green-600 bg-green-100';
      case 'Đã đặt': return 'text-yellow-600 bg-yellow-100';
      case 'Đang phục vụ': return 'text-red-600 bg-red-100';
      case 'Bảo trì': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const renderStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FiBarChart2 className="w-5 h-5 text-blue-600" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-gray-600">Tổng bàn</p>
            <p className="text-lg font-semibold">{stats.total}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center">
          <div className="p-2 bg-green-100 rounded-lg">
            <div className="w-5 h-5 bg-green-500 rounded"></div>
          </div>
          <div className="ml-3">
            <p className="text-sm text-gray-600">Trống</p>
            <p className="text-lg font-semibold">{stats.available}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <div className="w-5 h-5 bg-yellow-500 rounded"></div>
          </div>
          <div className="ml-3">
            <p className="text-sm text-gray-600">Đã đặt</p>
            <p className="text-lg font-semibold">{stats.reserved}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center">
          <div className="p-2 bg-red-100 rounded-lg">
            <div className="w-5 h-5 bg-red-500 rounded"></div>
          </div>
          <div className="ml-3">
            <p className="text-sm text-gray-600">Đang phục vụ</p>
            <p className="text-lg font-semibold">{stats.occupied}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center">
          <div className="p-2 bg-gray-100 rounded-lg">
            <div className="w-5 h-5 bg-gray-500 rounded"></div>
          </div>
          <div className="ml-3">
            <p className="text-sm text-gray-600">Bảo trì</p>
            <p className="text-lg font-semibold">{stats.maintenance}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFilters = () => (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-64">
          <input
            type="text"
            placeholder="Tìm kiếm bàn..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
        </div>
        
        <select
          value={filters.area}
          onChange={(e) => setFilters(prev => ({ ...prev, area: e.target.value }))}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
        >
          <option value="">Tất cả khu vực</option>
          {areas.map(area => (
            <option key={area.MaKhuVuc} value={area.MaKhuVuc}>
              {area.TenKhuVuc}
            </option>
          ))}
        </select>
        
        <select
          value={filters.status}
          onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="Trống">Trống</option>
          <option value="Đã đặt">Đã đặt</option>
          <option value="Đang phục vụ">Đang phục vụ</option>
          <option value="Bảo trì">Bảo trì</option>
        </select>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('area')}
            className={`p-2 rounded-lg ${viewMode === 'area' ? 'bg-amber-100 text-amber-600' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <FiMapPin className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-amber-100 text-amber-600' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <FiGrid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-amber-100 text-amber-600' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <FiList className="w-5 h-5" />
          </button>
        </div>
        
        <button
          onClick={() => setShowModal(true)}
          className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors flex items-center"
        >
          <FiPlus className="w-4 h-4 mr-2" />
          Thêm bàn
        </button>
      </div>
    </div>
  );

  const renderAreaView = () => (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <TablesByArea showReservations={true} />
    </div>
  );

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {filteredTables.map(table => (
        <div key={table.MaBan} className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">{table.TenBan}</h3>
            <div className="flex space-x-1">
              <button
                onClick={() => handleEdit(table)}
                className="p-1 text-blue-600 hover:bg-blue-100 rounded"
              >
                <FiEdit className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(table)}
                className="p-1 text-red-600 hover:bg-red-100 rounded"
              >
                <FiTrash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center">
              <FiUsers className="w-4 h-4 mr-2 text-gray-500" />
              <span>{table.SoCho} chỗ</span>
            </div>
            {table.ViTri && (
              <div className="flex items-center">
                <FiMapPin className="w-4 h-4 mr-2 text-gray-500" />
                <span>{table.ViTri}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(table.TrangThai)}`}>
                {table.TrangThai}
              </span>
              <select
                value={table.TrangThai}
                onChange={(e) => handleStatusChange(table, e.target.value)}
                className="text-xs border border-gray-300 rounded px-2 py-1"
              >
                <option value="Trống">Trống</option>
                <option value="Đã đặt">Đã đặt</option>
                <option value="Đang phục vụ">Đang phục vụ</option>
                <option value="Bảo trì">Bảo trì</option>
              </select>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bàn</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khu vực</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sức chứa</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vị trí</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredTables.map(table => (
            <tr key={table.MaBan}>
              <td className="px-6 py-4 whitespace-nowrap font-medium">{table.TenBan}</td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                {table.KhuVuc?.TenKhuVuc || 'N/A'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">{table.SoCho} chỗ</td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-600">{table.ViTri || 'N/A'}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <select
                  value={table.TrangThai}
                  onChange={(e) => handleStatusChange(table, e.target.value)}
                  className={`px-2 py-1 rounded-full text-xs font-medium border-0 ${getStatusColor(table.TrangThai)}`}
                >
                  <option value="Trống">Trống</option>
                  <option value="Đã đặt">Đã đặt</option>
                  <option value="Đang phục vụ">Đang phục vụ</option>
                  <option value="Bảo trì">Bảo trì</option>
                </select>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(table)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <FiEdit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(table)}
                    className="text-red-600 hover:text-red-800"
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
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý bàn</h1>
      </div>

      {renderStats()}
      {renderFilters()}

      {viewMode === 'area' && renderAreaView()}
      {viewMode === 'grid' && renderGridView()}
      {viewMode === 'list' && renderListView()}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">
              {editingTable ? 'Chỉnh sửa bàn' : 'Thêm bàn mới'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên bàn</label>
                <input
                  type="text"
                  value={formData.TenBan}
                  onChange={(e) => setFormData(prev => ({ ...prev, TenBan: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sức chứa</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={formData.SoCho}
                  onChange={(e) => setFormData(prev => ({ ...prev, SoCho: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Khu vực</label>
                <select
                  value={formData.MaKhuVuc}
                  onChange={(e) => setFormData(prev => ({ ...prev, MaKhuVuc: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  required
                >
                  <option value="">Chọn khu vực</option>
                  {areas.map(area => (
                    <option key={area.MaKhuVuc} value={area.MaKhuVuc}>
                      {area.TenKhuVuc}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vị trí</label>
                <input
                  type="text"
                  value={formData.ViTri}
                  onChange={(e) => setFormData(prev => ({ ...prev, ViTri: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Mô tả vị trí bàn"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                <select
                  value={formData.TrangThai}
                  onChange={(e) => setFormData(prev => ({ ...prev, TrangThai: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  <option value="Trống">Trống</option>
                  <option value="Đã đặt">Đã đặt</option>
                  <option value="Đang phục vụ">Đang phục vụ</option>
                  <option value="Bảo trì">Bảo trì</option>
                </select>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingTable(null);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50"
                >
                  {loading ? 'Đang xử lý...' : (editingTable ? 'Cập nhật' : 'Thêm')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableManagement;
