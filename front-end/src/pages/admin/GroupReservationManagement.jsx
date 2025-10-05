import React, { useState, useEffect } from 'react';
import { groupReservationAPI, tableAPI } from '../../shared/services/api';
import { FiCalendar, FiClock, FiUsers, FiPhone, FiMail, FiEdit, FiTrash2, FiEye, FiDownload, FiX, FiGrid } from 'react-icons/fi';
import toast from 'react-hot-toast';

const GroupReservationManagement = () => {
  const [groupReservations, setGroupReservations] = useState([]);
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    date: '',
    search: ''
  });
  const [stats, setStats] = useState({
    total: 0,
    confirmed: 0,
    pending: 0,
    cancelled: 0,
    completed: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterReservations();
  }, [groupReservations, filters]);

  const fetchData = async () => {
    try {
      const [reservationsResponse, tablesResponse, statsResponse] = await Promise.all([
        groupReservationAPI.getGroupReservations(),
        tableAPI.getTables(),
        groupReservationAPI.getGroupReservationStats()
      ]);

      if (reservationsResponse.data.success) {
        setGroupReservations(reservationsResponse.data.groupReservations || []);
      }
      
      if (tablesResponse.data.success) {
        setTables(tablesResponse.data.tables || []);
      }
      
      if (statsResponse.data.success) {
        setStats(statsResponse.data.stats || {});
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const filterReservations = () => {
    let filtered = groupReservations;

    if (filters.status) {
      filtered = filtered.filter(reservation => reservation.TrangThai === filters.status);
    }

    if (filters.date) {
      filtered = filtered.filter(reservation => reservation.NgayDat === filters.date);
    }

    if (filters.search) {
      filtered = filtered.filter(reservation =>
        reservation.TenKhach.toLowerCase().includes(filters.search.toLowerCase()) ||
        reservation.SoDienThoai.includes(filters.search)
      );
    }

    setFilteredReservations(filtered);
  };

  const handleStatusChange = async (reservationId, newStatus) => {
    try {
      const response = await groupReservationAPI.updateGroupReservationStatus(reservationId, { TrangThai: newStatus });
      if (response.data.success) {
        toast.success('Cập nhật trạng thái thành công');
        fetchData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleCancel = async (reservation) => {
    if (!window.confirm(`Bạn có chắc muốn hủy đặt bàn nhóm của ${reservation.TenKhach}?`)) return;

    try {
      const response = await groupReservationAPI.cancelGroupReservation(reservation.MaNhomDat);
      if (response.data.success) {
        toast.success('Hủy đặt bàn nhóm thành công');
        fetchData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const exportReservations = () => {
    const csvContent = [
      ['Tên khách', 'Số điện thoại', 'Ngày đặt', 'Giờ bắt đầu', 'Số bàn', 'Tổng số người', 'Trạng thái', 'Ghi chú'],
      ...filteredReservations.map(reservation => [
        reservation.TenKhach,
        reservation.SoDienThoai,
        reservation.NgayDat,
        reservation.GioDat,
        reservation.SoBan,
        reservation.TongSoNguoi,
        reservation.TrangThai,
        reservation.GhiChu || ''
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `group_reservations_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Đã đặt': return 'text-blue-600 bg-blue-100';
      case 'Đã xác nhận': return 'text-green-600 bg-green-100';
      case 'Đã hủy': return 'text-red-600 bg-red-100';
      case 'Hoàn thành': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatTime = (timeString) => {
    return timeString ? timeString.substring(0, 5) : '';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const renderStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FiGrid className="w-5 h-5 text-blue-600" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-gray-600">Tổng đặt nhóm</p>
            <p className="text-lg font-semibold">{stats.total}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <FiClock className="w-5 h-5 text-yellow-600" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-gray-600">Chờ xác nhận</p>
            <p className="text-lg font-semibold">{stats.pending}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center">
          <div className="p-2 bg-green-100 rounded-lg">
            <div className="w-5 h-5 bg-green-500 rounded"></div>
          </div>
          <div className="ml-3">
            <p className="text-sm text-gray-600">Đã xác nhận</p>
            <p className="text-lg font-semibold">{stats.confirmed}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center">
          <div className="p-2 bg-gray-100 rounded-lg">
            <div className="w-5 h-5 bg-gray-500 rounded"></div>
          </div>
          <div className="ml-3">
            <p className="text-sm text-gray-600">Hoàn thành</p>
            <p className="text-lg font-semibold">{stats.completed}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center">
          <div className="p-2 bg-red-100 rounded-lg">
            <div className="w-5 h-5 bg-red-500 rounded"></div>
          </div>
          <div className="ml-3">
            <p className="text-sm text-gray-600">Đã hủy</p>
            <p className="text-lg font-semibold">{stats.cancelled}</p>
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
            placeholder="Tìm kiếm theo tên, SĐT..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
        </div>
        
        <input
          type="date"
          value={filters.date}
          onChange={(e) => setFilters(prev => ({ ...prev, date: e.target.value }))}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
        />
        
        <select
          value={filters.status}
          onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="Đã đặt">Đã đặt</option>
          <option value="Đã xác nhận">Đã xác nhận</option>
          <option value="Đã hủy">Đã hủy</option>
          <option value="Hoàn thành">Hoàn thành</option>
        </select>
        
        <button
          onClick={exportReservations}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
        >
          <FiDownload className="w-4 h-4 mr-2" />
          Xuất CSV
        </button>
      </div>
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
        <h1 className="text-2xl font-bold text-gray-900">Quản lý đặt bàn nhóm</h1>
      </div>

      {renderStats()}
      {renderFilters()}

      {/* Group Reservations Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khách hàng</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Liên hệ</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thời gian</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số bàn</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng khách</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredReservations.map(reservation => (
              <tr key={reservation.MaNhomDat} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="font-medium text-gray-900">{reservation.TenKhach}</div>
                    {reservation.GhiChu && (
                      <div className="text-sm text-gray-500 truncate max-w-32">{reservation.GhiChu}</div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm">
                    <div className="flex items-center text-gray-900">
                      <FiPhone className="w-3 h-3 mr-1" />
                      {reservation.SoDienThoai}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm">
                    <div className="flex items-center text-gray-900">
                      <FiCalendar className="w-3 h-3 mr-1" />
                      {formatDate(reservation.NgayDat)}
                    </div>
                    <div className="flex items-center text-gray-500 mt-1">
                      <FiClock className="w-3 h-3 mr-1" />
                      {formatTime(reservation.GioDat)}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center font-medium">
                    <FiGrid className="w-4 h-4 mr-1 text-gray-500" />
                    {reservation.SoBan} bàn
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <FiUsers className="w-4 h-4 mr-1 text-gray-500" />
                    {reservation.TongSoNguoi} người
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={reservation.TrangThai}
                    onChange={(e) => handleStatusChange(reservation.MaNhomDat, e.target.value)}
                    className={`px-2 py-1 rounded-full text-xs font-medium border-0 ${getStatusColor(reservation.TrangThai)}`}
                  >
                    <option value="Đã đặt">Đã đặt</option>
                    <option value="Đã xác nhận">Đã xác nhận</option>
                    <option value="Đã hủy">Đã hủy</option>
                    <option value="Hoàn thành">Hoàn thành</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedReservation(reservation);
                        setShowDetailModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-800"
                      title="Xem chi tiết"
                    >
                      <FiEye className="w-4 h-4" />
                    </button>
                    {reservation.TrangThai !== 'Đã hủy' && reservation.TrangThai !== 'Hoàn thành' && (
                      <button
                        onClick={() => handleCancel(reservation)}
                        className="text-red-600 hover:text-red-800"
                        title="Hủy đặt bàn nhóm"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredReservations.length === 0 && (
          <div className="text-center py-12">
            <FiGrid className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Không có đặt bàn nhóm nào</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Chi tiết đặt bàn nhóm</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 border-b pb-2">Thông tin khách hàng</h3>
                <div className="space-y-2 text-sm">
                  <div><span className="text-gray-600">Tên:</span> {selectedReservation.TenKhach}</div>
                  <div><span className="text-gray-600">Số điện thoại:</span> {selectedReservation.SoDienThoai}</div>
                  <div><span className="text-gray-600">Tổng số người:</span> {selectedReservation.TongSoNguoi}</div>
                  <div><span className="text-gray-600">Số bàn:</span> {selectedReservation.SoBan}</div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 border-b pb-2">Thông tin đặt bàn</h3>
                <div className="space-y-2 text-sm">
                  <div><span className="text-gray-600">Ngày:</span> {formatDate(selectedReservation.NgayDat)}</div>
                  <div><span className="text-gray-600">Giờ:</span> {formatTime(selectedReservation.GioDat)}</div>
                  <div>
                    <span className="text-gray-600">Trạng thái:</span>
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedReservation.TrangThai)}`}>
                      {selectedReservation.TrangThai}
                    </span>
                  </div>
                  <div><span className="text-gray-600">Ngày tạo:</span> {new Date(selectedReservation.NgayTao).toLocaleString('vi-VN')}</div>
                </div>
              </div>
            </div>
            
            {selectedReservation.GhiChu && (
              <div className="mt-6">
                <h3 className="font-medium text-gray-900 border-b pb-2 mb-2">Ghi chú</h3>
                <p className="text-sm text-gray-600">{selectedReservation.GhiChu}</p>
              </div>
            )}

            {/* Individual Tables */}
            {selectedReservation.DatBans && selectedReservation.DatBans.length > 0 && (
              <div className="mt-6">
                <h3 className="font-medium text-gray-900 border-b pb-2 mb-4">Chi tiết các bàn</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedReservation.DatBans.map((table, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="font-medium">Bàn {table.MaBan}</div>
                      <div className="text-sm text-gray-600">Số người: {table.SoNguoi}</div>
                      <div className="text-sm text-gray-600">Trạng thái: {table.TrangThai}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupReservationManagement;
