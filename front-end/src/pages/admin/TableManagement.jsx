import React, { useState, useEffect } from 'react';
import { tableAPI, areaAPI } from '../../shared/services/api';
import TablesByArea from '../../components/tables/TablesByArea';
import { FiPlus, FiEdit, FiTrash2, FiList, FiMapPin, FiUsers, FiBarChart2, FiGrid, FiImage, FiVideo, FiSettings, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

const TableManagement = () => {
  const [tables, setTables] = useState([]);
  const [areas, setAreas] = useState([]);
  const [filteredTables, setFilteredTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('area'); // 'area', 'list', 'area-management'
  const [showModal, setShowModal] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  const [showAreaModal, setShowAreaModal] = useState(false);
  const [editingArea, setEditingArea] = useState(null);
  const [filters, setFilters] = useState({
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

  const [areaFormData, setAreaFormData] = useState({
    TenKhuVuc: '',
    MoTa: '',
    HinhAnh: '',
    Video: ''
  });

  const [selectedFiles, setSelectedFiles] = useState({
    image: null,
    video: null
  });

  const [uploadPreviews, setUploadPreviews] = useState({
    image: null,
    video: null
  });

  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterTables();
  }, [tables, filters]);

  const fetchData = async () => {
    try {
      // Try multiple approaches to get all tables
      let tablesResponse;
      try {
        // First try with high limit and all parameter
        tablesResponse = await tableAPI.getTables({ limit: 1000, page: 1, all: true });
      } catch (error) {
        console.log('First attempt failed, trying without parameters:', error);
        // Fallback to no parameters
        tablesResponse = await tableAPI.getTables();
      }
      
      const [areasResponse, statsResponse] = await Promise.all([
        areaAPI.getAreas(),
        tableAPI.getTableStats()
      ]);

      console.log('=== FETCH DATA DEBUG ===');
      console.log('Tables Response:', tablesResponse);
      console.log('Tables Response Data:', tablesResponse.data);
      console.log('Areas Response:', areasResponse);
      console.log('Areas Response Data:', areasResponse.data);
      console.log('Stats Response:', statsResponse);

      if (tablesResponse.data.success) {
        const tables = tablesResponse.data.tables;
        console.log('Tables from success path:', tables);
        console.log('Number of tables loaded:', tables?.length || 0);
        setTables(tables);
        setFilteredTables(tables);
        calculateStats(tables);
      } else {
        console.log('No success flag, checking direct data...');
        console.log('Direct tablesResponse.data:', tablesResponse.data);
        
        // Try direct array or tables property
        let tables = null;
        if (Array.isArray(tablesResponse.data)) {
          tables = tablesResponse.data;
          console.log('Using direct array:', tables);
        } else if (tablesResponse.data.tables) {
          tables = tablesResponse.data.tables;
          console.log('Using data.tables:', tables);
        }
        
        if (tables) {
          console.log('Number of tables loaded:', tables?.length || 0);
          
          // If we have very few tables, it might be a pagination issue
          // Let's ensure we show all available tables
          if (tables.length < 20) {
            console.log('Warning: Only', tables.length, 'tables loaded. This might be due to pagination.');
          }
          
          setTables(tables);
          setFilteredTables(tables);
          calculateStats(tables);
        }
      }
      
      // Handle areas data - API returns different structure
      let areas = null;
      if (areasResponse.data.success && areasResponse.data.areas) {
        areas = areasResponse.data.areas;
      } else if (areasResponse.data.areas) {
        areas = areasResponse.data.areas;
      } else if (Array.isArray(areasResponse.data)) {
        areas = areasResponse.data;
      }
      
      if (areas) {
        console.log('Raw areas data:', areas);
        
        // Transform areas data to match frontend expectations
        const transformedAreas = areas.map(area => {
          // Handle different API response formats
          if (area.MaKhuVuc && area.TenKhuVuc) {
            // Already in correct format
            return area;
          } else if (area.name) {
            // Legacy format with name/table_count
            return {
              MaKhuVuc: area.name,
              TenKhuVuc: area.TenKhuVuc || `Khu vực ${area.name}`,
              table_count: area.table_count
            };
          } else {
            // Fallback
            return {
              MaKhuVuc: area.id || area.MaKhuVuc || 1,
              TenKhuVuc: area.TenKhuVuc || area.name || 'Khu vực',
              table_count: area.table_count || 0
            };
          }
        });
        
        console.log('Transformed areas:', transformedAreas);
        setAreas(transformedAreas);
      } else {
        console.log('No areas data found, using fallback');
        // Fallback areas if API fails
        setAreas([
          { MaKhuVuc: 1, TenKhuVuc: 'Khu vực 1' },
          { MaKhuVuc: 2, TenKhuVuc: 'Khu vực 2' },
          { MaKhuVuc: 3, TenKhuVuc: 'Khu vực 3' }
        ]);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Lỗi khi tải dữ liệu: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const filterTables = () => {
    let filtered = tables;

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
    calculateStats(filtered);
  };

  const calculateStats = (tablesToCalculate = tables) => {
    const stats = {
      total: tablesToCalculate.length,
      available: tablesToCalculate.filter(t => t.TrangThai === 'Trống').length,
      occupied: tablesToCalculate.filter(t => t.TrangThai === 'Đang phục vụ').length,
      reserved: tablesToCalculate.filter(t => t.TrangThai === 'Đã đặt').length,
      maintenance: tablesToCalculate.filter(t => t.TrangThai === 'Bảo trì').length
    };
    setStats(stats);
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
      console.error('Form submission error:', error);
      console.error('Error response:', error.response?.data);
      
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Có lỗi xảy ra';
      toast.error(errorMessage);
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
      // API returns message on success
      if (response.data.message) {
        toast.success('Xóa bàn thành công');
        fetchData();
      }
    } catch (error) {
      console.error('Delete table error:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Có lỗi xảy ra';
      const suggestion = error.response?.data?.suggestion;
      
      // Handle specific error cases
      if (error.response?.status === 404) {
        toast.error('Bàn không tồn tại hoặc đã bị xóa. Đang làm mới danh sách...');
        fetchData(); // Refresh the list to remove stale data
      } else if (error.response?.status === 400 && suggestion) {
        // Table has active reservations - offer alternative
        const changeToMaintenance = window.confirm(
          `${errorMessage}\n\n${suggestion}\n\nBạn có muốn đánh dấu bàn này là "Bảo trì" thay vì xóa không?`
        );
        
        if (changeToMaintenance) {
          try {
            await tableAPI.updateTableStatus(table.MaBan, { TrangThai: 'Bảo trì' });
            toast.success('Đã đánh dấu bàn là "Bảo trì"');
            fetchData();
          } catch (statusError) {
            toast.error('Lỗi khi cập nhật trạng thái bàn');
          }
        }
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const handleStatusChange = async (table, newStatus) => {
    try {
      const response = await tableAPI.updateTableStatus(table.MaBan, { TrangThai: newStatus });
      // API returns message on success
      if (response.data.message) {
        toast.success('Cập nhật trạng thái thành công');
        fetchData();
      }
    } catch (error) {
      console.error('Status update error:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Có lỗi xảy ra';
      toast.error(errorMessage);
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

  const resetAreaForm = () => {
    setAreaFormData({
      TenKhuVuc: '',
      MoTa: '',
      HinhAnh: '',
      Video: ''
    });
    setSelectedFiles({ image: null, video: null });
    setUploadPreviews({ image: null, video: null });
  };

  // File upload functions
  const handleFileSelect = (type, file) => {
    if (!file) return;
    
    setSelectedFiles(prev => ({ ...prev, [type]: file }));
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadPreviews(prev => ({ ...prev, [type]: e.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const uploadFile = async (file, type) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'area');
    formData.append('purpose', type === 'image' ? 'main' : 'video');
    formData.append('description', `${type} cho khu vực`);

    try {
      const response = await fetch('http://localhost:3000/api/media/upload', {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      if (result.success) {
        return result.data.url;
      } else {
        throw new Error(result.error || 'Upload thất bại');
      }
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  // Area Management Functions
  const handleAreaSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setUploading(true);

    try {
      let finalAreaData = { ...areaFormData };
      
      // Upload files if selected
      if (selectedFiles.image) {
        toast.loading('Đang upload hình ảnh...', { id: 'upload-image' });
        const imageUrl = await uploadFile(selectedFiles.image, 'image');
        finalAreaData.HinhAnh = imageUrl;
        toast.success('Upload hình ảnh thành công!', { id: 'upload-image' });
      }
      
      if (selectedFiles.video) {
        toast.loading('Đang upload video...', { id: 'upload-video' });
        const videoUrl = await uploadFile(selectedFiles.video, 'video');
        finalAreaData.Video = videoUrl;
        toast.success('Upload video thành công!', { id: 'upload-video' });
      }

      // Submit area data (always set TrangThai to 'Hoạt động' by default)
      finalAreaData.TrangThai = 'Hoạt động';
      
      if (editingArea) {
        const response = await areaAPI.updateArea(editingArea.MaKhuVuc, finalAreaData);
        if (response.data.success) {
          toast.success('Cập nhật khu vực thành công');
        }
      } else {
        const response = await areaAPI.createArea(finalAreaData);
        if (response.data.success) {
          toast.success('Thêm khu vực thành công');
        }
      }
      
      setShowAreaModal(false);
      setEditingArea(null);
      resetAreaForm();
      fetchData();
    } catch (error) {
      console.error('Area form submission error:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Có lỗi xảy ra';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  const handleAreaEdit = (area) => {
    setEditingArea(area);
    setAreaFormData({
      TenKhuVuc: area.TenKhuVuc,
      MoTa: area.MoTa || '',
      HinhAnh: area.HinhAnh || '',
      Video: area.Video || ''
    });
    // Set existing images as previews
    setUploadPreviews({
      image: area.HinhAnh || null,
      video: area.Video || null
    });
    setSelectedFiles({ image: null, video: null });
    setShowAreaModal(true);
  };

  const handleAreaDelete = async (area) => {
    if (!window.confirm(`Bạn có chắc muốn xóa khu vực "${area.TenKhuVuc}"?`)) return;

    try {
      const response = await areaAPI.deleteArea(area.MaKhuVuc);
      if (response.data.success) {
        toast.success('Xóa khu vực thành công');
        fetchData();
      }
    } catch (error) {
      console.error('Delete area error:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Có lỗi xảy ra';
      
      if (error.response?.status === 400 && error.response?.data?.table_count > 0) {
        toast.error(`Không thể xóa khu vực có ${error.response.data.table_count} bàn. Vui lòng xóa tất cả bàn trong khu vực trước.`);
      } else {
        toast.error(errorMessage);
      }
    }
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
            onClick={() => setViewMode(viewMode === 'area-management' ? 'area' : 'area-management')}
            className={`p-2 rounded-lg ${viewMode === 'area-management' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100 hover:text-blue-600'} transition-colors`}
            title="Quản lý khu vực"
          >
            <FiSettings className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('area')}
            className={`p-2 rounded-lg ${viewMode === 'area' ? 'bg-amber-100 text-amber-600' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <FiMapPin className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-amber-100 text-amber-600' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <FiList className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setShowAreaModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
          >
            <FiGrid className="w-4 h-4 mr-2" />
            Thêm khu vực
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors flex items-center"
          >
            <FiPlus className="w-4 h-4 mr-2" />
            Thêm bàn
          </button>
        </div>
      </div>
    </div>
  );


  const renderAreaManagementView = () => (
    <div className="space-y-6">
      {/* Area Management Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Quản lý khu vực</h2>
          <button
            onClick={() => setShowAreaModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
          >
            <FiPlus className="w-4 h-4 mr-2" />
            Thêm khu vực
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {areas.map(area => (
            <div key={area.MaKhuVuc} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{area.TenKhuVuc}</h3>
                  <p className="text-sm text-gray-600 mt-1">{area.MoTa || 'Không có mô tả'}</p>
                </div>
                <div className="flex space-x-1 ml-2">
                  <button
                    onClick={() => handleAreaEdit(area)}
                    className="text-blue-600 hover:text-blue-800 p-1"
                    title="Chỉnh sửa khu vực"
                  >
                    <FiEdit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleAreaDelete(area)}
                    className="text-red-600 hover:text-red-800 p-1"
                    title="Xóa khu vực"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm mb-3">
                <span className="text-gray-600">
                  {area.table_count || 0} bàn
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  area.TrangThai === 'Hoạt động' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {area.TrangThai}
                </span>
              </div>
              
              {area.HinhAnh && (
                <div className="mb-3">
                  <img 
                    src={area.HinhAnh} 
                    alt={area.TenKhuVuc}
                    className="w-full h-32 object-cover rounded"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
              )}
              
              {/* Video and Image indicators */}
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                {area.HinhAnh && (
                  <div className="flex items-center">
                    <FiImage className="w-3 h-3 mr-1" />
                    <span>Có hình ảnh</span>
                  </div>
                )}
                {area.Video && (
                  <div className="flex items-center">
                    <FiVideo className="w-3 h-3 mr-1" />
                    <span>Có video</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {areas.length === 0 && (
          <div className="text-center py-12">
            <FiGrid className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg">Chưa có khu vực nào</p>
            <p className="text-gray-400 text-sm mt-2">Nhấn "Thêm khu vực" để tạo khu vực đầu tiên</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderAreaView = () => (
    <div className="space-y-6">
      {/* Tables by Area Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Bàn theo khu vực</h2>
        <TablesByArea showReservations={true} />
      </div>
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
      {viewMode === 'area-management' && renderAreaManagementView()}
      {viewMode === 'list' && renderListView()}


      {/* Table Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-6 text-gray-900">
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

      {/* Area Modal */}
      {showAreaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-6 text-gray-900">
              {editingArea ? 'Chỉnh sửa khu vực' : 'Thêm khu vực mới'}
            </h2>
            
            <form onSubmit={handleAreaSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên khu vực *</label>
                <input
                  type="text"
                  value={areaFormData.TenKhuVuc}
                  onChange={(e) => setAreaFormData(prev => ({ ...prev, TenKhuVuc: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Ví dụ: Tầng 1 - Khu A"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                <textarea
                  value={areaFormData.MoTa}
                  onChange={(e) => setAreaFormData(prev => ({ ...prev, MoTa: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Mô tả chi tiết về khu vực"
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FiImage className="inline w-4 h-4 mr-1" />
                  Hình ảnh
                </label>
                <div className="space-y-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileSelect('image', e.target.files[0])}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                  />
                  {uploadPreviews.image && (
                    <div className="relative">
                      <img 
                        src={uploadPreviews.image} 
                        alt="Preview" 
                        className="w-full h-32 object-cover rounded border"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setUploadPreviews(prev => ({ ...prev, image: null }));
                          setSelectedFiles(prev => ({ ...prev, image: null }));
                          if (!editingArea) setAreaFormData(prev => ({ ...prev, HinhAnh: '' }));
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <FiTrash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FiVideo className="inline w-4 h-4 mr-1" />
                  Video
                </label>
                <div className="space-y-3">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => handleFileSelect('video', e.target.files[0])}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                  />
                  {uploadPreviews.video && (
                    <div className="relative">
                      {selectedFiles.video ? (
                        <video 
                          src={uploadPreviews.video} 
                          className="w-full h-32 object-cover rounded border"
                          controls
                        />
                      ) : (
                        <div className="w-full h-32 bg-gray-100 rounded border flex items-center justify-center">
                          <div className="text-center">
                            <FiVideo className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                            <p className="text-sm text-gray-500">Video hiện tại</p>
                          </div>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setUploadPreviews(prev => ({ ...prev, video: null }));
                          setSelectedFiles(prev => ({ ...prev, video: null }));
                          if (!editingArea) setAreaFormData(prev => ({ ...prev, Video: '' }));
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <FiTrash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAreaModal(false);
                    setEditingArea(null);
                    resetAreaForm();
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loading || uploading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Đang upload...
                    </>
                  ) : loading ? (
                    'Đang xử lý...'
                  ) : (
                    editingArea ? 'Cập nhật' : 'Thêm'
                  )}
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
