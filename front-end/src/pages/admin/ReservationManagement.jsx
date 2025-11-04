import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reservationAPI, tableAPI, billingAPI } from '../../shared/services/api';
import { FiCalendar, FiClock, FiUsers, FiPhone, FiMail, FiEdit, FiTrash2, FiEye, FiFilter, FiDownload, FiX, FiShoppingCart } from 'react-icons/fi';
import toast from 'react-hot-toast';

const ReservationManagement = () => {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    startDate: '',
    endDate: '',
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
  }, [reservations, filters]);

  const fetchData = async () => {
    try {
      const [reservationsResponse, tablesResponse, statsResponse] = await Promise.all([
        reservationAPI.getReservations().catch(err => ({ data: { success: false, reservations: [] } })),
        tableAPI.getTables().catch(err => ({ data: { success: false, tables: [] } })),
        reservationAPI.getReservationStats().catch(err => ({ data: { success: false, stats: null } }))
      ]);

      if (reservationsResponse.data.success) {
        setReservations(reservationsResponse.data.reservations || []);
      }
      
      if (tablesResponse.data.success) {
        setTables(tablesResponse.data.tables || []);
      }
      
      if (statsResponse.data.success && statsResponse.data.stats) {
        setStats(statsResponse.data.stats);
      } else {
        // Set default stats if API fails
        setStats({
          total: 0,
          confirmed: 0,
          pending: 0,
          cancelled: 0,
          completed: 0
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Lỗi khi tải dữ liệu');
      // Set default values on error
      setStats({
        total: 0,
        confirmed: 0,
        pending: 0,
        cancelled: 0,
        completed: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const filterReservations = () => {
    let filtered = reservations;

    if (filters.status) {
      filtered = filtered.filter(reservation => reservation.TrangThai === filters.status);
    }

    if (filters.startDate) {
      filtered = filtered.filter(reservation => reservation.NgayDat >= filters.startDate);
    }

    if (filters.endDate) {
      filtered = filtered.filter(reservation => reservation.NgayDat <= filters.endDate);
    }

    if (filters.search) {
      filtered = filtered.filter(reservation =>
        reservation.TenKhach.toLowerCase().includes(filters.search.toLowerCase()) ||
        reservation.SoDienThoai.includes(filters.search) ||
        reservation.EmailKhach?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    setFilteredReservations(filtered);
  };

  const handleStatusChange = async (reservationId, newStatus) => {
    try {
      const response = await reservationAPI.updateReservationStatus(reservationId, { TrangThai: newStatus });
      if (response.data.success) {
        toast.success('Cập nhật trạng thái thành công');
        fetchData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async (reservation) => {
    if (!window.confirm(`Bạn có chắc muốn xóa đặt bàn của ${reservation.TenKhach}?`)) return;

    try {
      const response = await reservationAPI.deleteReservation(reservation.MaDat);
      if (response.data.success) {
        toast.success('Xóa đặt bàn thành công');
        fetchData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleCancel = async (reservation) => {
    if (!window.confirm(`Bạn có chắc muốn hủy đặt bàn của ${reservation.TenKhach}?`)) return;

    try {
      const response = await reservationAPI.cancelReservation(reservation.MaDat);
      if (response.data.success) {
        toast.success('Hủy đặt bàn thành công');
        fetchData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleConvertToOrder = async (reservation) => {
    try {
      const loadingToast = toast.loading('Đang tìm đơn hàng...');

      // Tìm đơn hàng có MaDat tương ứng với đặt bàn này
      const ordersResponse = await billingAPI.getBills({ MaDat: reservation.MaDat });
      
      toast.dismiss(loadingToast);

      const orders = ordersResponse.data.donhangs || ordersResponse.data.bills || [];
      const order = orders.find(o => o.MaDat === reservation.MaDat);

      if (order) {
        // Đã có đơn hàng - chuyển sang trang bán hàng để xem/sửa
        toast.success('Đã tìm thấy đơn hàng!');
        navigate('/admin/sales', { 
          state: { 
            orderId: order.MaDH,
            fromReservation: true,
            reservationInfo: {
              TenKhach: reservation.TenKhach,
              SoDienThoai: reservation.SoDienThoai,
              MaBan: reservation.MaBan,
              MaDat: reservation.MaDat
            }
          } 
        });
      } else {
        // Chưa có đơn hàng - thông báo cho user
        toast.error('Chưa có đơn hàng cho đặt bàn này. Vui lòng tạo đơn hàng từ trang đặt bàn.');
      }
    } catch (error) {
      console.error('Error finding order for reservation:', error);
      toast.error(error.response?.data?.message || 'Có lỗi khi tìm đơn hàng');
    }
  };

  const exportReservations = () => {
    const csvContent = [
      ['Tên khách', 'Số điện thoại', 'Email', 'Ngày đặt', 'Giờ bắt đầu', 'Giờ kết thúc', 'Số người', 'Bàn', 'Trạng thái', 'Ghi chú'],
      ...filteredReservations.map(reservation => [
        reservation.TenKhach,
        reservation.SoDienThoai,
        reservation.EmailKhach || '',
        reservation.NgayDat,
        reservation.GioDat,
        reservation.GioKetThuc,
        reservation.SoNguoi,
        getTableName(reservation.MaBan),
        reservation.TrangThai,
        reservation.GhiChu || ''
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `reservations_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getTableName = (tableId) => {
    const table = tables.find(t => t.MaBan == tableId);
    return table ? table.TenBan : `Bàn ${tableId}`;
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
            <FiCalendar className="w-5 h-5 text-blue-600" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-gray-600">Tổng đặt bàn</p>
            <p className="text-lg font-semibold">{stats?.total || 0}</p>
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
            <p className="text-lg font-semibold">{stats?.pending || 0}</p>
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
            <p className="text-lg font-semibold">{stats?.confirmed || 0}</p>
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
            <p className="text-lg font-semibold">{stats?.completed || 0}</p>
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
            <p className="text-lg font-semibold">{stats?.cancelled || 0}</p>
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
            placeholder="Tìm kiếm theo tên, SĐT, email..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600 whitespace-nowrap">Từ ngày:</label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600 whitespace-nowrap">Đến ngày:</label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
        </div>
        
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
          onClick={() => setFilters({ status: '', startDate: '', endDate: '', search: '' })}
          className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center"
        >
          <FiX className="w-4 h-4 mr-2" />
          Xóa bộ lọc
        </button>
        
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
        <h1 className="text-2xl font-bold text-gray-900">Quản lý đặt bàn</h1>
      </div>

      {renderStats()}
      {renderFilters()}

      {/* Reservations Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khách hàng</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Liên hệ</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thời gian</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bàn</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số người</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredReservations.map(reservation => (
              <tr key={reservation.MaDat} className="hover:bg-gray-50">
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
                    {reservation.EmailKhach && (
                      <div className="flex items-center text-gray-500 mt-1">
                        <FiMail className="w-3 h-3 mr-1" />
                        {reservation.EmailKhach}
                      </div>
                    )}
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
                      {formatTime(reservation.GioDat)} - {formatTime(reservation.GioKetThuc)}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-medium">
                  {getTableName(reservation.MaBan)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <FiUsers className="w-4 h-4 mr-1 text-gray-500" />
                    {reservation.SoNguoi}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={reservation.TrangThai}
                    onChange={(e) => handleStatusChange(reservation.MaDat, e.target.value)}
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
                    {(reservation.TrangThai === 'Đã đặt' || reservation.TrangThai === 'Đã xác nhận') && (
                      <button
                        onClick={() => handleConvertToOrder(reservation)}
                        className="text-green-600 hover:text-green-800"
                        title="Chuyển sang bán hàng"
                      >
                        <FiShoppingCart className="w-4 h-4" />
                      </button>
                    )}
                    {reservation.TrangThai !== 'Đã hủy' && reservation.TrangThai !== 'Hoàn thành' && (
                      <button
                        onClick={() => handleCancel(reservation)}
                        className="text-yellow-600 hover:text-yellow-800"
                        title="Hủy đặt bàn"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(reservation)}
                      className="text-red-600 hover:text-red-800"
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

        {filteredReservations.length === 0 && (
          <div className="text-center py-12">
            <FiCalendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Không có đặt bàn nào</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Chi tiết đặt bàn</h2>
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
                  {selectedReservation.EmailKhach && (
                    <div><span className="text-gray-600">Email:</span> {selectedReservation.EmailKhach}</div>
                  )}
                  <div><span className="text-gray-600">Số người:</span> {selectedReservation.SoNguoi}</div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 border-b pb-2">Thông tin đặt bàn</h3>
                <div className="space-y-2 text-sm">
                  <div><span className="text-gray-600">Ngày:</span> {formatDate(selectedReservation.NgayDat)}</div>
                  <div><span className="text-gray-600">Giờ:</span> {formatTime(selectedReservation.GioDat)} - {formatTime(selectedReservation.GioKetThuc)}</div>
                  <div><span className="text-gray-600">Bàn:</span> {getTableName(selectedReservation.MaBan)}</div>
                  <div>
                    <span className="text-gray-600">Trạng thái:</span>
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedReservation.TrangThai)}`}>
                      {selectedReservation.TrangThai}
                    </span>
                  </div>
                  <div><span className="text-gray-600">Ngày tạo:</span> {new Date(selectedReservation.NgayTaoDat).toLocaleString('vi-VN')}</div>
                </div>
              </div>
            </div>
            
            {selectedReservation.GhiChu && (
              <div className="mt-6">
                <h3 className="font-medium text-gray-900 border-b pb-2 mb-2">Ghi chú</h3>
                <p className="text-sm text-gray-600">{selectedReservation.GhiChu}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservationManagement;
