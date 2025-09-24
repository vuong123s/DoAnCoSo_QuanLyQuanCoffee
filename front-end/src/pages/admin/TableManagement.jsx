import React, { useState, useEffect } from 'react';
import { tableAPI, reservationAPI } from '../../services/api';
import { useForm } from 'react-hook-form';
import TablesByArea from '../../components/TablesByArea';
import { 
  FiPlus, FiEdit, FiTrash2, FiUsers, FiMapPin, FiSearch, FiFilter, 
  FiGrid, FiList, FiRefreshCw, FiDownload, FiEye, FiSettings,
  FiCheckCircle, FiClock, FiAlertCircle, FiTool, FiX, FiCalendar, FiPhone
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const TableManagement = () => {
  const [tables, setTables] = useState([]);
  const [filteredTables, setFilteredTables] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);
  const [showReservationsModal, setShowReservationsModal] = useState(false);
  const [tableReservations, setTableReservations] = useState([]);
  const [loadingReservations, setLoadingReservations] = useState(false);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('area'); // 'area', 'grid' or 'list'
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [capacityFilter, setCapacityFilter] = useState('all');
  const [areaFilter, setAreaFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [areas, setAreas] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    occupied: 0,
    reserved: 0,
    maintenance: 0,
    areas: []
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm();

  useEffect(() => {
    fetchTables();
    fetchAreas();
    fetchStats();
  }, []);

  useEffect(() => {
    filterTables();
  }, [tables, searchTerm, statusFilter, capacityFilter, areaFilter]);

  const filterTables = () => {
    let filtered = tables;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(table => 
        (table.SoBan || table.number || '').toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
        (table.ViTri || table.location || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(table => 
        (table.TrangThai || table.status) === statusFilter
      );
    }

    // Capacity filter
    if (capacityFilter !== 'all') {
      const capacity = parseInt(capacityFilter);
      filtered = filtered.filter(table => 
        (table.SoCho || table.capacity) === capacity
      );
    }

    // Area filter
    if (areaFilter !== 'all') {
      filtered = filtered.filter(table => 
        (table.KhuVuc || table.area) === areaFilter
      );
    }

    setFilteredTables(filtered);
  };

  const calculateStats = (tableList) => {
    const stats = {
      total: tableList.length,
      available: 0,
      occupied: 0,
      reserved: 0,
      maintenance: 0
    };

    tableList.forEach(table => {
      const status = table.TrangThai || table.status;
      switch (status) {
        case 'Có sẵn':
        case 'available':
          stats.available++;
          break;
        case 'Đang sử dụng':
        case 'occupied':
          stats.occupied++;
          break;
        case 'Đã đặt':
        case 'reserved':
          stats.reserved++;
          break;
        case 'Bảo trì':
        case 'maintenance':
          stats.maintenance++;
          break;
      }
    });

    setStats(stats);
  };

  const fetchTables = async () => {
    try {
      const response = await tableAPI.getTables();
      const tableList = response.data.tables || [];
      setTables(tableList);
      calculateStats(tableList);
    } catch (error) {
      toast.error('Lỗi khi tải danh sách bàn');
    } finally {
      setLoading(false);
    }
  };

  const fetchAreas = async () => {
    try {
      const response = await tableAPI.getAreas();
      setAreas(response.data.areas || []);
    } catch (error) {
      console.error('Error fetching areas:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await tableAPI.getTableStats();
      setStats(response.data.stats || {});
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const exportTables = () => {
    const csvContent = [
      ['Số bàn', 'Sức chứa', 'Vị trí', 'Trạng thái'],
      ...filteredTables.map(table => [
        table.SoBan || table.number,
        table.SoChoNgoi || table.capacity,
        table.ViTri || table.location || '',
        getStatusText(table.TrangThai || table.status)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `tables_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Xuất file thành công');
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'available':
      case 'Có sẵn':
        return <FiCheckCircle className="w-4 h-4" />;
      case 'occupied':
      case 'Đang sử dụng':
        return <FiUsers className="w-4 h-4" />;
      case 'reserved':
      case 'Đã đặt':
        return <FiClock className="w-4 h-4" />;
      case 'maintenance':
      case 'Bảo trì':
        return <FiTool className="w-4 h-4" />;
      default:
        return <FiAlertCircle className="w-4 h-4" />;
    }
  };

  const handleEdit = (table) => {
    setEditingTable(table);
    setValue('SoBan', table.SoBan || table.number);
    setValue('SoChoNgoi', table.SoChoNgoi || table.capacity);
    setValue('KhuVuc', table.KhuVuc || table.area);
    setValue('ViTri', table.ViTri || table.location);
    setValue('TrangThai', table.TrangThai || table.status);
    setShowModal(true);
  };

  const handleTableClick = async (table) => {
    setSelectedTable(table);
    setLoadingReservations(true);
    setShowReservationsModal(true);
    
    try {
      // Fetch reservations for this table
      const response = await reservationAPI.getReservations({
        MaBan: table.MaBan || table.id
      });
      
      const reservations = response.data?.data?.reservations || response.data?.reservations || [];
      setTableReservations(Array.isArray(reservations) ? reservations : []);
    } catch (error) {
      console.error('Error fetching table reservations:', error);
      toast.error('Lỗi khi tải danh sách đặt bàn');
      setTableReservations([]);
    } finally {
      setLoadingReservations(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bàn này?')) {
      try {
        await tableAPI.deleteTable(id);
        toast.success('Xóa bàn thành công');
        fetchTables();
      } catch (error) {
        toast.error('Lỗi khi xóa bàn');
      }
    }
  };

  const onSubmit = async (data) => {
    try {
      // Convert to Vietnamese schema
      const tableData = {
        SoBan: data.SoBan,
        SoChoNgoi: parseInt(data.SoChoNgoi),
        KhuVuc: data.KhuVuc,
        ViTri: data.ViTri,
        TrangThai: data.TrangThai
      };

      if (editingTable) {
        await tableAPI.updateTable(editingTable.MaBan || editingTable.id, tableData);
        toast.success('Cập nhật bàn thành công');
      } else {
        await tableAPI.createTable(tableData);
        toast.success('Thêm bàn mới thành công');
      }
      setShowModal(false);
      setEditingTable(null);
      reset();
      fetchTables();
    } catch (error) {
      toast.error('Có lỗi xảy ra');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
      case 'Có sẵn':
        return 'bg-green-100 text-green-800';
      case 'occupied':
      case 'Đang sử dụng':
        return 'bg-red-100 text-red-800';
      case 'reserved':
      case 'Đã đặt':
        return 'bg-yellow-100 text-yellow-800';
      case 'maintenance':
      case 'Bảo trì':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'available':
        return 'Có sẵn';
      case 'occupied':
        return 'Đang sử dụng';
      case 'reserved':
        return 'Đã đặt';
      case 'maintenance':
        return 'Bảo trì';
      case 'Có sẵn':
      case 'Đang sử dụng':
      case 'Đã đặt':
      case 'Bảo trì':
        return status;
      default:
        return status || 'Không xác định';
    }
  };

  const getReservationStatusColor = (status) => {
    switch (status) {
      case 'Đã đặt':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Đã xác nhận':
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'Đã hủy':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'Hoàn thành':
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getReservationStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Đã đặt';
      case 'confirmed':
        return 'Đã xác nhận';
      case 'cancelled':
        return 'Đã hủy';
      case 'completed':
        return 'Hoàn thành';
      case 'Đã đặt':
      case 'Đã xác nhận':
      case 'Đã hủy':
      case 'Hoàn thành':
        return status;
      default:
        return status || 'Không xác định';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm animate-pulse">
          <div className="bg-gray-300 h-8 w-48 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-300 h-32 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý Bàn</h1>
            <p className="text-gray-600 mt-1">Quản lý thông tin bàn ăn trong nhà hàng</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center mx-2 space-x-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <FiFilter className="w-4 h-4" />
              <span>Bộ lọc</span>
            </button>
            <button
              onClick={exportTables}
              className="flex items-center mx-2 space-x-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <FiDownload className="w-4 h-4" />
              <span>Xuất file</span>
            </button>
            <button
              onClick={fetchTables}
              className="flex items-center mx-2 space-x-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <FiRefreshCw className="w-4 h-4" />
              <span>Làm mới</span>
            </button>
            <button
              onClick={() => {
                setEditingTable(null);
                reset();
                setShowModal(true);
              }}
              className="bg-amber-600 mx-2 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors flex items-center space-x-2"
            >
              <FiPlus className="w-4 h-4" />
              <span>Thêm bàn mới</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng số bàn</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total_tables || 0}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <FiUsers className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        {stats.status_breakdown?.map((statusStat, index) => {
          const colors = {
            'Trống': { bg: 'bg-green-100', text: 'text-green-600', icon: FiCheckCircle },
            'Đã đặt': { bg: 'bg-yellow-100', text: 'text-yellow-600', icon: FiClock },
            'Đang phục vụ': { bg: 'bg-red-100', text: 'text-red-600', icon: FiUsers },
          };
          const color = colors[statusStat.status] || { bg: 'bg-gray-100', text: 'text-gray-600', icon: FiAlertCircle };
          const IconComponent = color.icon;
          
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{statusStat.status}</p>
                  <p className={`text-2xl font-bold ${color.text}`}>{statusStat.count}</p>
                </div>
                <div className={`p-3 ${color.bg} rounded-full`}>
                  <IconComponent className={`w-6 h-6 ${color.text}`} />
                </div>
              </div>
            </div>
          );
        })}
        
        {stats.area_breakdown && stats.area_breakdown.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Khu vực</p>
                <p className="text-2xl font-bold text-purple-600">{stats.area_breakdown.length}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <FiMapPin className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* View Mode Selector */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Chế độ xem:</label>
            <div className="flex rounded-lg border border-gray-300 overflow-hidden">
              <button
                onClick={() => setViewMode('area')}
                className={`px-4 py-2 text-sm font-medium flex items-center space-x-2 ${
                  viewMode === 'area' 
                    ? 'bg-amber-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <FiMapPin className="w-4 h-4" />
                <span>Theo khu vực</span>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 text-sm font-medium flex items-center space-x-2 ${
                  viewMode === 'grid' 
                    ? 'bg-amber-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <FiGrid className="w-4 h-4" />
                <span>Lưới</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 text-sm font-medium flex items-center space-x-2 ${
                  viewMode === 'list' 
                    ? 'bg-amber-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <FiList className="w-4 h-4" />
                <span>Danh sách</span>
              </button>
            </div>
          </div>
          
          {viewMode !== 'area' && (
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <FiFilter className="w-4 h-4" />
              <span>Bộ lọc</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      {showFilters && viewMode !== 'area' && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tìm kiếm</label>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Tìm theo số bàn, vị trí..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Khu vực</label>
              <select
                value={areaFilter}
                onChange={(e) => setAreaFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="all">Tất cả khu vực</option>
                {areas.map((area) => (
                  <option key={area.name} value={area.name}>{area.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="Trống">Trống</option>
                <option value="Đã đặt">Đã đặt</option>
                <option value="Đang phục vụ">Đang phục vụ</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sức chứa</label>
              <select
                value={capacityFilter}
                onChange={(e) => setCapacityFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="all">Tất cả sức chứa</option>
                <option value="2">2 người</option>
                <option value="4">4 người</option>
                <option value="6">6 người</option>
                <option value="8">8 người</option>
                <option value="10">10 người</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setCapacityFilter('all');
                  setAreaFilter('all');
                }}
                className="w-full px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Xóa bộ lọc
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tables Display */}
      {viewMode === 'area' ? (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <TablesByArea 
            onTableSelect={setSelectedTable}
            selectedTableId={selectedTable?.MaBan}
            showReservations={true}
          />
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTables.map((table) => (
            <div 
              key={table.MaBan || table.id} 
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow border-l-4 border-amber-500 cursor-pointer"
              onClick={() => handleTableClick(table)}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{table.TenBan}</h3>
                  <div className="flex items-center text-gray-600 text-sm mt-1">
                    <FiUsers className="w-4 h-4 mr-1" />
                    <span>{table.SoCho} người</span>
                  </div>
                  {(table.ViTri || table.location) && (
                    <div className="flex items-center text-gray-600 text-sm mt-1">
                      <FiMapPin className="w-4 h-4 mr-1" />
                      <span>{table.ViTri || table.location}</span>
                    </div>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(table);
                    }}
                    className="text-amber-600 hover:text-amber-900 p-1 rounded-full hover:bg-amber-50"
                    title="Chỉnh sửa"
                  >
                    <FiEdit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(table.MaBan || table.id);
                    }}
                    className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50"
                    title="Xóa"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(table.TrangThai || table.status)}`}>
                  <span className="mr-1">{getStatusIcon(table.TrangThai || table.status)}</span>
                  {getStatusText(table.TrangThai || table.status)}
                </span>
                <span className="text-xs text-gray-500">
                  ID: {table.MaBan || table.id}
                </span>
              </div>
              
              <div className="mt-2 text-xs text-blue-600 flex items-center">
                <FiEye className="w-3 h-3 mr-1" />
                <span>Nhấn để xem đặt bàn</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bàn
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sức chứa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vị trí
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTables.map((table) => (
                <tr 
                  key={table.MaBan || table.id} 
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleTableClick(table)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-sm font-medium text-gray-900">
                        Bàn {table.SoBan || table.number}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <FiUsers className="w-4 h-4 mr-2 text-gray-400" />
                      {table.SoChoNgoi || table.capacity} người
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <FiMapPin className="w-4 h-4 mr-2 text-gray-400" />
                      {table.ViTri || table.location || 'Chưa xác định'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(table.TrangThai || table.status)}`}>
                      <span className="mr-1">{getStatusIcon(table.TrangThai || table.status)}</span>
                      {getStatusText(table.TrangThai || table.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTableClick(table);
                        }}
                        className="text-blue-600 hover:text-blue-900 p-2 rounded-full hover:bg-blue-50"
                        title="Xem đặt bàn"
                      >
                        <FiEye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(table);
                        }}
                        className="text-amber-600 hover:text-amber-900 p-2 rounded-full hover:bg-amber-50"
                        title="Chỉnh sửa"
                      >
                        <FiEdit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(table.MaBan || table.id);
                        }}
                        className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-50"
                        title="Xóa"
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
      )}

      {/* Empty States */}
      {tables.length === 0 && !loading && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <FiUsers className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có bàn nào</h3>
          <p className="text-gray-600 mb-4">Thêm bàn đầu tiên để bắt đầu quản lý</p>
          <button
            onClick={() => {
              setEditingTable(null);
              reset();
              setShowModal(true);
            }}
            className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors inline-flex items-center space-x-2"
          >
            <FiPlus className="w-4 h-4" />
            <span>Thêm bàn mới</span>
          </button>
        </div>
      )}

      {filteredTables.length === 0 && tables.length > 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <FiSearch className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy bàn nào</h3>
          <p className="text-gray-600 mb-4">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
              setCapacityFilter('all');
            }}
            className="text-amber-600 hover:text-amber-700 font-medium"
          >
            Xóa bộ lọc
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingTable ? 'Chỉnh sửa bàn' : 'Thêm bàn mới'}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingTable(null);
                    reset();
                  }}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-6 pt-0">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên bàn *
                </label>
                <input
                  {...register('SoBan', { required: 'Tên bàn là bắt buộc' })}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Ví dụ: 1, A1, VIP01..."
                />
                {errors.SoBan && (
                  <p className="mt-1 text-sm text-red-600">{errors.SoBan.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sức chứa *
                </label>
                <input
                  {...register('SoChoNgoi', { 
                    required: 'Sức chứa là bắt buộc',
                    min: { value: 1, message: 'Sức chứa phải ít nhất 1 người' }
                  })}
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Số người tối đa"
                />
                {errors.SoChoNgoi && (
                  <p className="mt-1 text-sm text-red-600">{errors.SoChoNgoi.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Khu vực *
                </label>
                <select
                  {...register('KhuVuc', { required: 'Khu vực là bắt buộc' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  <option value="">Chọn khu vực</option>
                  <option value="Tầng 1">Tầng 1</option>
                  <option value="Tầng 2">Tầng 2</option>
                  <option value="Sân thượng">Sân thượng</option>
                  <option value="VIP">VIP</option>
                  <option value="Ngoài trời">Ngoài trời</option>
                </select>
                {errors.KhuVuc && (
                  <p className="mt-1 text-sm text-red-600">{errors.KhuVuc.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vị trí
                </label>
                <input
                  {...register('ViTri')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Ví dụ: Gần cửa sổ, Góc phòng, Trung tâm..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trạng thái *
                </label>
                <select
                  {...register('TrangThai', { required: 'Trạng thái là bắt buộc' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  <option value="">Chọn trạng thái</option>
                  <option value="Có sẵn">Có sẵn</option>
                  <option value="Đang sử dụng">Đang sử dụng</option>
                  <option value="Đã đặt">Đã đặt</option>
                  <option value="Bảo trì">Bảo trì</option>
                </select>
                {errors.TrangThai && (
                  <p className="mt-1 text-sm text-red-600">{errors.TrangThai.message}</p>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingTable(null);
                    reset();
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Đang lưu...' : (editingTable ? 'Cập nhật' : 'Thêm mới')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table Reservations Modal */}
      {showReservationsModal && selectedTable && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Đặt bàn - {selectedTable.TenBan || `Bàn ${selectedTable.SoBan || selectedTable.number}`}
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {selectedTable.SoCho || selectedTable.capacity} người • {selectedTable.ViTri || selectedTable.location || 'Chưa xác định vị trí'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowReservationsModal(false);
                    setSelectedTable(null);
                    setTableReservations([]);
                  }}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {loadingReservations ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-600 border-t-transparent"></div>
                  <span className="ml-3 text-gray-600">Đang tải danh sách đặt bàn...</span>
                </div>
              ) : tableReservations.length === 0 ? (
                <div className="text-center py-12">
                  <FiCalendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có đặt bàn nào</h3>
                  <p className="text-gray-600">Bàn này chưa có lịch đặt bàn nào.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Danh sách đặt bàn ({tableReservations.length})
                    </h3>
                  </div>
                  
                  <div className="grid gap-4">
                    {tableReservations.map((reservation) => (
                      <div 
                        key={reservation.MaDat || reservation.id} 
                        className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-4 mb-2">
                              <div className="flex items-center text-gray-900">
                                <FiUsers className="w-4 h-4 mr-2 text-gray-500" />
                                <span className="font-medium">{reservation.TenKhach || reservation.customerName}</span>
                              </div>
                              <div className="flex items-center text-gray-600">
                                <FiPhone className="w-4 h-4 mr-2 text-gray-500" />
                                <span>{reservation.SoDienThoai || reservation.customerPhone}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-6 text-sm text-gray-600">
                              <div className="flex items-center">
                                <FiCalendar className="w-4 h-4 mr-2 text-gray-500" />
                                <span>
                                  {new Date(reservation.NgayDat || reservation.date).toLocaleDateString('vi-VN')}
                                </span>
                              </div>
                              <div className="flex items-center">
                                <FiClock className="w-4 h-4 mr-2 text-gray-500" />
                                <span>
                                  {reservation.GioDat || reservation.time}
                                  {(reservation.GioKetThuc || reservation.endTime) && (
                                    <span> - {reservation.GioKetThuc || reservation.endTime}</span>
                                  )}
                                </span>
                              </div>
                              <div className="flex items-center">
                                <FiUsers className="w-4 h-4 mr-2 text-gray-500" />
                                <span>{reservation.SoNguoi || reservation.partySize} người</span>
                              </div>
                            </div>
                            
                            {(reservation.GhiChu || reservation.notes) && (
                              <div className="mt-2 text-sm text-gray-600">
                                <span className="font-medium">Ghi chú:</span> {reservation.GhiChu || reservation.notes}
                              </div>
                            )}
                          </div>
                          
                          <div className="ml-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getReservationStatusColor(reservation.TrangThai || reservation.status)}`}>
                              {getReservationStatusText(reservation.TrangThai || reservation.status)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setShowReservationsModal(false);
                    setSelectedTable(null);
                    setTableReservations([]);
                  }}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableManagement;
