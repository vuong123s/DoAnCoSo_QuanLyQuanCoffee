import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiCalendar, FiPlus, FiTrash2, FiUsers, FiClock, FiCheckCircle } from 'react-icons/fi';

const ScheduleManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [requests, setRequests] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState('schedules'); // schedules, requests
  const [createForm, setCreateForm] = useState({
    MaNV: '',
    NgayLam: '',
    CaLam: 'Ca sáng',
    GhiChu: ''
  });

  useEffect(() => {
    fetchEmployees();
    fetchRequests();
    fetchSchedules();
  }, []);

  useEffect(() => {
    if (employees.length > 0) {
      fetchSchedules();
    }
  }, [selectedMonth, selectedYear, selectedEmployee]);

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/employees', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setEmployees(data.employees || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Lỗi khi tải danh sách nhân viên');
    }
  };

  const fetchSchedules = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        month: selectedMonth,
        year: selectedYear
      });
      
      if (selectedEmployee) {
        params.append('maNV', selectedEmployee);
      }

      console.log('Fetching schedules with params:', params.toString());
      const response = await fetch(`http://localhost:3000/api/schedules?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);
      
      setSchedules(data.schedules || []);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      toast.error('Lỗi khi tải lịch làm việc');
    }
  };

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/requests', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setRequests(data.requests || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  const handleCreateSchedule = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/schedules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(createForm)
      });

      const data = await response.json();
      
      if (response.ok) {
        toast.success('Tạo lịch làm việc thành công');
        setShowCreateModal(false);
        setCreateForm({
          MaNV: '',
          NgayLam: '',
          CaLam: 'Ca sáng',
          GioBatDau: '06:00',
          GioKetThuc: '14:00',
          GhiChu: ''
        });
        fetchSchedules();
      } else {
        toast.error(data.error || 'Lỗi khi tạo lịch làm việc');
      }
    } catch (error) {
      console.error('Error creating schedule:', error);
      toast.error('Lỗi khi tạo lịch làm việc');
    }
  };

  const handleDeleteSchedule = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa lịch làm việc này?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/schedules/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      
      if (response.ok) {
        toast.success('Xóa lịch làm việc thành công');
        fetchSchedules();
      } else {
        toast.error(data.error || 'Lỗi khi xóa lịch làm việc');
        if (data.suggestion) {
          toast.info(data.suggestion);
        }
      }
    } catch (error) {
      console.error('Error deleting schedule:', error);
      toast.error('Lỗi khi xóa lịch làm việc');
    }
  };

  const handleApproveRequest = async (id, status) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const ghiChu = status === 'Đã duyệt' ? 'Đã duyệt yêu cầu' : 'Yêu cầu bị từ chối';

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/requests/${id}/approve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          NguoiDuyet: user.id,
          TrangThai: status,
          GhiChuDuyet: ghiChu
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        toast.success(data.message);
        fetchRequests();
      } else {
        toast.error(data.error || 'Lỗi khi duyệt yêu cầu');
      }
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error('Lỗi khi duyệt yêu cầu');
    }
  };

  const handleMarkAttendance = async (scheduleId, status, note = '') => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/schedules/${scheduleId}/attendance`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          TrangThai: status,
          GhiChu: note
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        toast.success(data.message);
        fetchSchedules();
      } else {
        toast.error(data.error || 'Lỗi khi chấm công');
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
      toast.error('Lỗi khi chấm công');
    }
  };


  const getStatusColor = (status) => {
    const colors = {
      'Đã xếp lịch': 'bg-blue-100 text-blue-800',
      'Đã chấm công': 'bg-yellow-100 text-yellow-800',
      'Hoàn thành': 'bg-green-100 text-green-800',
      'Vắng mặt': 'bg-red-100 text-red-800',
      'Chờ duyệt': 'bg-yellow-100 text-yellow-800',
      'Đã duyệt': 'bg-green-100 text-green-800',
      'Từ chối': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString.substring(0, 5);
  };

  const pendingRequests = requests.filter(r => r.TrangThai === 'Chờ duyệt');

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Quản lý lịch làm việc</h1>
        <p className="text-gray-600 mt-2">Xếp lịch và quản lý ca làm việc cho nhân viên</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('schedules')}
          className={`pb-3 px-4 font-medium ${
            activeTab === 'schedules'
              ? 'border-b-2 border-indigo-600 text-indigo-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <FiCalendar className="inline mr-2" />
          Lịch làm việc
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`pb-3 px-4 font-medium relative ${
            activeTab === 'requests'
              ? 'border-b-2 border-indigo-600 text-indigo-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <FiCheckCircle className="inline mr-2" />
          Yêu cầu
          {pendingRequests.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {pendingRequests.length}
            </span>
          )}
        </button>
      </div>

      {/* Lịch làm việc Tab */}
      {activeTab === 'schedules' && (
        <>
          {/* Filters */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nhân viên</label>
                <select
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Tất cả nhân viên</option>
                  {employees.map(emp => (
                    <option key={emp.MaNV} value={emp.MaNV}>
                      {emp.HoTen} - {emp.ChucVu}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tháng</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                >
                  {[...Array(12)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Năm</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                >
                  {[2024, 2025, 2026].map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              <div className="mt-6">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  <FiPlus className="mr-2" />
                  Tạo lịch mới
                </button>
              </div>
            </div>
          </div>

          {/* Schedules Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nhân viên</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ca làm</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ghi chú</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Chấm công</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {schedules && schedules.length > 0 ? (
                    schedules.map((schedule) => (
                      <tr key={schedule.MaLich} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="font-medium text-gray-900">
                              {schedule.HoTen || schedule.nhanvien?.HoTen || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {schedule.ChucVu || schedule.nhanvien?.ChucVu || 'N/A'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{formatDate(schedule.NgayLam)}</td>
                        <td className="px-6 py-4 whitespace-nowrap font-medium">{schedule.CaLam}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(schedule.TrangThai)}`}>
                            {schedule.TrangThai}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {schedule.GhiChu || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-2">
                            {schedule.TrangThai === 'Đã xếp lịch' && (
                              <>
                                <button
                                  onClick={() => handleMarkAttendance(schedule.MaLich, 'Hoàn thành')}
                                  className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                                  title="Hoàn thành ca"
                                >
                                  Hoàn thành
                                </button>
                                <button
                                  onClick={() => handleMarkAttendance(schedule.MaLich, 'Vắng mặt', 'Không đến làm')}
                                  className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                                  title="Vắng mặt"
                                >
                                  Vắng
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => handleDeleteSchedule(schedule.MaLich)}
                              className="text-red-600 hover:text-red-800"
                              title="Xóa lịch"
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                        {schedules === null ? 'Đang tải...' : 'Không có lịch làm việc nào'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Yêu cầu Tab */}
      {activeTab === 'requests' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Yêu cầu từ nhân viên</h2>
          
          <div className="space-y-4">
            {requests.length > 0 ? (
              requests.map((request) => (
                <div key={request.MaYeuCau} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-medium text-gray-900">{request.HoTen}</span>
                        <span className="text-sm text-gray-500">({request.ChucVu})</span>
                        <span className="font-medium text-indigo-600">{request.LoaiYeuCau}</span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(request.TrangThai)}`}>
                          {request.TrangThai}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-1">
                        <span className="font-medium">Thời gian:</span> {formatDate(request.NgayBatDau)}
                        {request.NgayKetThuc && ` - ${formatDate(request.NgayKetThuc)}`}
                        {request.GioBatDau && ` (${formatTime(request.GioBatDau)} - ${formatTime(request.GioKetThuc)})`}
                      </p>
                      
                      <p className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">Lý do:</span> {request.LyDo}
                      </p>

                      {request.TenNguoiDuyet && (
                        <p className="text-sm text-gray-500">
                          <span className="font-medium">Người duyệt:</span> {request.TenNguoiDuyet} - {formatDate(request.NgayDuyet)}
                        </p>
                      )}

                      {request.GhiChuDuyet && (
                        <p className="text-sm text-gray-600 mt-2">
                          <span className="font-medium">Phản hồi:</span> {request.GhiChuDuyet}
                        </p>
                      )}
                    </div>

                    {request.TrangThai === 'Chờ duyệt' && (
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleApproveRequest(request.MaYeuCau, 'Đã duyệt')}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                        >
                          Duyệt
                        </button>
                        <button
                          onClick={() => handleApproveRequest(request.MaYeuCau, 'Từ chối')}
                          className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                        >
                          Từ chối
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">Không có yêu cầu nào</p>
            )}
          </div>
        </div>
      )}

      {/* Modal tạo lịch */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Tạo lịch làm việc mới</h3>
            <form onSubmit={handleCreateSchedule}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nhân viên *</label>
                  <select
                    value={createForm.MaNV}
                    onChange={(e) => setCreateForm({ ...createForm, MaNV: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  >
                    <option value="">Chọn nhân viên</option>
                    {employees.map(emp => (
                      <option key={emp.MaNV} value={emp.MaNV}>
                        {emp.HoTen} - {emp.ChucVu}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày làm *</label>
                  <input
                    type="date"
                    value={createForm.NgayLam}
                    onChange={(e) => setCreateForm({ ...createForm, NgayLam: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ca làm *</label>
                  <select
                    value={createForm.CaLam}
                    onChange={(e) => setCreateForm({ ...createForm, CaLam: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  >
                    <option value="Ca sáng">Ca sáng (6:00 - 14:00)</option>
                    <option value="Ca chiều">Ca chiều (14:00 - 22:00)</option>
                    <option value="Ca tối">Ca tối (18:00 - 02:00)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                  <textarea
                    value={createForm.GhiChu}
                    onChange={(e) => setCreateForm({ ...createForm, GhiChu: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    rows="2"
                    placeholder="Ghi chú về ca làm việc..."
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Tạo lịch
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleManagement;
