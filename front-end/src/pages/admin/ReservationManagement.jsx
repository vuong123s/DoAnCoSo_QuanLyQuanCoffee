import React, { useState, useEffect } from 'react';
import { reservationAPI, tableAPI } from '../../services/api';
import { useForm } from 'react-hook-form';
import { FiCalendar, FiClock, FiUser, FiPhone, FiEdit, FiTrash2, FiCheck, FiX, FiSearch, FiFilter } from 'react-icons/fi';
import toast from 'react-hot-toast';

const ReservationManagement = () => {
  const [reservations, setReservations] = useState([]);
  const [tables, setTables] = useState([]);
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingReservation, setEditingReservation] = useState(null);
  const [deletingReservation, setDeletingReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterReservations();
  }, [reservations, statusFilter, dateFilter]);

  const fetchData = async () => {
    try {
      const [reservationsResponse, tablesResponse] = await Promise.all([
        reservationAPI.getReservations(),
        tableAPI.getTables()
      ]);
      
      console.log('Reservations response:', reservationsResponse);
      console.log('Tables response:', tablesResponse);
      
      // Handle reservations data
      const reservationsData = reservationsResponse.data?.data?.reservations || 
                              reservationsResponse.data?.reservations || 
                              reservationsResponse.data || [];
      
      // Handle tables data  
      const tablesData = tablesResponse.data?.tables || 
                        tablesResponse.data || [];
      
      console.log('Processed reservations:', reservationsData);
      console.log('Processed tables:', tablesData);
      
      setReservations(Array.isArray(reservationsData) ? reservationsData : []);
      setTables(Array.isArray(tablesData) ? tablesData : []);
    } catch (error) {
      toast.error('Lỗi khi tải dữ liệu');
      console.error('Error fetching data:', error);
      setReservations([]);
      setTables([]);
    } finally {
      setLoading(false);
    }
  };

  const filterReservations = () => {
    // Ensure reservations is always an array
    const reservationsList = Array.isArray(reservations) ? reservations : [];
    let filtered = reservationsList;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(reservation => 
        (reservation.TrangThai || reservation.status) === statusFilter
      );
    }

    if (dateFilter) {
      filtered = filtered.filter(reservation => 
        (reservation.NgayDat || reservation.date) === dateFilter
      );
    }

    setFilteredReservations(filtered);
  };

  const handleEdit = (reservation) => {
    setEditingReservation(reservation);
    setValue('TenKhach', reservation.TenKhach || reservation.customerName);
    setValue('SoDienThoai', reservation.SoDienThoai || reservation.customerPhone);
    setValue('MaBan', reservation.MaBan || reservation.tableId);
    setValue('NgayDat', reservation.NgayDat || reservation.date);
    setValue('GioDat', reservation.GioDat || reservation.time);
    setValue('SoNguoi', reservation.SoNguoi || reservation.partySize);
    setValue('GhiChu', reservation.GhiChu || reservation.notes);
    setValue('TrangThai', reservation.TrangThai || reservation.status);
    setShowModal(true);
  };

  const handleDeleteClick = (reservation) => {
    setDeletingReservation(reservation);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!deletingReservation) return;
    
    setDeleting(true);
    try {
      await reservationAPI.deleteReservation(deletingReservation.MaDat || deletingReservation.id);
      toast.success('Xóa đặt bàn thành công');
      setShowDeleteModal(false);
      setDeletingReservation(null);
      fetchData();
    } catch (error) {
      toast.error('Lỗi khi xóa đặt bàn');
      console.error('Error deleting reservation:', error);
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setDeletingReservation(null);
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await reservationAPI.updateReservation(id, { TrangThai: newStatus });
      toast.success('Cập nhật trạng thái thành công');
      fetchData();
    } catch (error) {
      toast.error('Lỗi khi cập nhật trạng thái');
    }
  };

  const onSubmit = async (data) => {
    try {
      // Convert to Vietnamese schema
      const reservationData = {
        TenKhach: data.TenKhach,
        SoDienThoai: data.SoDienThoai,
        MaBan: parseInt(data.MaBan),
        NgayDat: data.NgayDat,
        GioDat: data.GioDat,
        SoNguoi: parseInt(data.SoNguoi),
        GhiChu: data.GhiChu || '',
        TrangThai: data.TrangThai
      };

      if (editingReservation) {
        await reservationAPI.updateReservation(editingReservation.MaDat || editingReservation.id, reservationData);
        toast.success('Cập nhật đặt bàn thành công');
      } else {
        await reservationAPI.createReservation(reservationData);
        toast.success('Thêm đặt bàn mới thành công');
      }
      setShowModal(false);
      setEditingReservation(null);
      reset();
      fetchData();
    } catch (error) {
      toast.error('Có lỗi xảy ra');
      console.error('Error submitting reservation:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
      case 'Đã đặt':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
      case 'Đã xác nhận':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
      case 'Đã hủy':
        return 'bg-red-100 text-red-800';
      case 'completed':
      case 'Hoàn thành':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
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
          <div className="bg-gray-300 h-10 w-full rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý Đặt bàn</h1>
        <button
          onClick={() => {
            setEditingReservation(null);
            reset();
            setShowModal(true);
          }}
          className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors flex items-center space-x-2"
        >
          <FiCalendar className="w-4 h-4" />
          <span>Thêm đặt bàn</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex items-center space-x-2">
            <FiFilter className="text-gray-400 w-5 h-5" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="Đã đặt">Đã đặt</option>
              <option value="Đã xác nhận">Đã xác nhận</option>
              <option value="Đã hủy">Đã hủy</option>
              <option value="Hoàn thành">Hoàn thành</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <FiCalendar className="text-gray-400 w-5 h-5" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Reservations Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Khách hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bàn
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày & Giờ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số người
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Array.isArray(filteredReservations) && filteredReservations.map((reservation) => (
                <tr key={reservation.MaDat || reservation.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="flex items-center">
                        <FiUser className="w-4 h-4 text-gray-400 mr-2" />
                        <div className="text-sm font-medium text-gray-900">{reservation.TenKhach || reservation.customerName}</div>
                      </div>
                      <div className="flex items-center mt-1">
                        <FiPhone className="w-4 h-4 text-gray-400 mr-2" />
                        <div className="text-sm text-gray-500">{reservation.SoDienThoai || reservation.customerPhone}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      Bàn {tables.find(table => (table.MaBan || table.id) === (reservation.MaBan || reservation.tableId))?.SoBan || tables.find(table => (table.MaBan || table.id) === (reservation.MaBan || reservation.tableId))?.number || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FiCalendar className="w-4 h-4 text-gray-400 mr-2" />
                      <div className="text-sm text-gray-900">
                        {new Date(reservation.NgayDat || reservation.date).toLocaleDateString('vi-VN')}
                      </div>
                    </div>
                    <div className="flex items-center mt-1">
                      <FiClock className="w-4 h-4 text-gray-400 mr-2" />
                      <div className="text-sm text-gray-500">{reservation.GioDat || reservation.time}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{reservation.SoNguoi || reservation.partySize} người</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(reservation.TrangThai || reservation.status)}`}>
                      {getStatusText(reservation.TrangThai || reservation.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {(reservation.TrangThai || reservation.status) === 'Đã đặt' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(reservation.MaDat || reservation.id, 'Đã xác nhận')}
                            className="text-green-600 hover:text-green-900 p-1 rounded-full hover:bg-green-50 transition-colors"
                            title="Xác nhận đặt bàn"
                          >
                            <FiCheck className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleStatusChange(reservation.MaDat || reservation.id, 'Đã hủy')}
                            className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50 transition-colors"
                            title="Hủy đặt bàn"
                          >
                            <FiX className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleEdit(reservation)}
                        className="text-amber-600 hover:text-amber-900 p-1 rounded-full hover:bg-amber-50 transition-colors"
                        title="Chỉnh sửa đặt bàn"
                      >
                        <FiEdit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(reservation)}
                        className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50 transition-colors"
                        title="Xóa đặt bàn"
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

        {Array.isArray(filteredReservations) && filteredReservations.length === 0 && (
          <div className="text-center py-12">
            <FiSearch className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy đặt bàn nào</h3>
            <p className="text-gray-600">Thử thay đổi bộ lọc hoặc thêm đặt bàn mới</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingReservation ? 'Chỉnh sửa đặt bàn' : 'Thêm đặt bàn mới'}
            </h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên khách hàng *
                </label>
                <input
                  {...register('customerName', { required: 'Tên khách hàng là bắt buộc' })}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
                {errors.customerName && (
                  <p className="mt-1 text-sm text-red-600">{errors.customerName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số điện thoại *
                </label>
                <input
                  {...register('customerPhone', { required: 'Số điện thoại là bắt buộc' })}
                  type="tel"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
                {errors.customerPhone && (
                  <p className="mt-1 text-sm text-red-600">{errors.customerPhone.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bàn *
                </label>
                <select
                  {...register('tableId', { required: 'Bàn là bắt buộc' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  <option value="">Chọn bàn</option>
                  {tables.filter(table => table.status === 'available').map((table) => (
                    <option key={table.id} value={table.id}>
                      Bàn {table.number} ({table.capacity} người)
                    </option>
                  ))}
                </select>
                {errors.tableId && (
                  <p className="mt-1 text-sm text-red-600">{errors.tableId.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ngày *
                  </label>
                  <input
                    {...register('date', { required: 'Ngày là bắt buộc' })}
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                  {errors.date && (
                    <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giờ *
                  </label>
                  <input
                    {...register('time', { required: 'Giờ là bắt buộc' })}
                    type="time"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                  {errors.time && (
                    <p className="mt-1 text-sm text-red-600">{errors.time.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số người *
                </label>
                <input
                  {...register('partySize', { 
                    required: 'Số người là bắt buộc',
                    min: { value: 1, message: 'Số người phải ít nhất 1' }
                  })}
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
                {errors.partySize && (
                  <p className="mt-1 text-sm text-red-600">{errors.partySize.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ghi chú
                </label>
                <textarea
                  {...register('notes')}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Yêu cầu đặc biệt..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trạng thái *
                </label>
                <select
                  {...register('status', { required: 'Trạng thái là bắt buộc' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  <option value="">Chọn trạng thái</option>
                  <option value="pending">Chờ xác nhận</option>
                  <option value="confirmed">Đã xác nhận</option>
                  <option value="cancelled">Đã hủy</option>
                  <option value="completed">Hoàn thành</option>
                </select>
                {errors.status && (
                  <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingReservation(null);
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
                  {isSubmitting ? 'Đang lưu...' : (editingReservation ? 'Cập nhật' : 'Thêm mới')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <div className="text-center">
              {/* Warning Icon */}
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                <FiTrash2 className="h-8 w-8 text-red-600" />
              </div>
              
              {/* Title */}
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Xác nhận xóa đặt bàn
              </h3>
              
              {/* Content */}
              <div className="mb-6">
                <p className="text-gray-600 mb-4">
                  Bạn có chắc chắn muốn xóa đặt bàn này không? Hành động này không thể hoàn tác.
                </p>
                
                {/* Reservation Details */}
                <div className="bg-gray-50 rounded-lg p-4 text-left">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Khách hàng:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {deletingReservation.TenKhach || deletingReservation.customerName}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Số điện thoại:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {deletingReservation.SoDienThoai || deletingReservation.customerPhone}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Bàn:</span>
                      <span className="text-sm font-medium text-gray-900">
                        Bàn {tables.find(table => (table.MaBan || table.id) === (deletingReservation.MaBan || deletingReservation.tableId))?.SoBan || 
                             tables.find(table => (table.MaBan || table.id) === (deletingReservation.MaBan || deletingReservation.tableId))?.number || 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Ngày giờ:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {new Date(deletingReservation.NgayDat || deletingReservation.date).toLocaleDateString('vi-VN')} - {deletingReservation.GioDat || deletingReservation.time}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Số người:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {deletingReservation.SoNguoi || deletingReservation.partySize} người
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Trạng thái:</span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(deletingReservation.TrangThai || deletingReservation.status)}`}>
                        {getStatusText(deletingReservation.TrangThai || deletingReservation.status)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={handleCancelDelete}
                  disabled={deleting}
                  className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 border border-gray-300 rounded-xl hover:bg-gray-200 transition-colors font-medium disabled:opacity-50"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {deleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Đang xóa...</span>
                    </>
                  ) : (
                    <>
                      <FiTrash2 className="w-4 h-4" />
                      <span>Xóa đặt bàn</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservationManagement;
