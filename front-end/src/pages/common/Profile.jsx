import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuthStore } from '../../app/stores/authStore';
import { FiUser, FiCalendar, FiClock, FiEdit2, FiSave, FiX, FiShoppingCart, FiPackage, FiPlus, FiEye } from 'react-icons/fi';

const Profile = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('info');
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [editForm, setEditForm] = useState({});
  
  // For employee/manager
  const [schedules, setSchedules] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showCreateScheduleModal, setShowCreateScheduleModal] = useState(false);
  const [employees, setEmployees] = useState([]);
  
  // For customer
  const [orders, setOrders] = useState([]);
  const [onlineOrders, setOnlineOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState([]);
  const [showOrderModal, setShowOrderModal] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
      
      if (isEmployee()) {
        fetchSchedules();
        if (isManager()) {
          fetchEmployees();
        }
      } else if (isCustomer()) {
        fetchOrders();
        fetchOnlineOrders();
      }
    }
  }, [user, selectedMonth, selectedYear]);

  const isEmployee = () => {
    return user && ['staff', 'manager', 'admin', 'Nhân viên', 'Quản lý', 'Admin'].includes(user.role);
  };

  const isManager = () => {
    return user && ['manager', 'admin', 'Quản lý', 'Admin'].includes(user.role);
  };

  const isCustomer = () => {
    return user && user.role === 'customer';
  };

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const endpoint = isEmployee() 
        ? `http://localhost:3000/api/employees/${user.id}`
        : `http://localhost:3000/api/auth/profile`;
      
      const response = await fetch(endpoint, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (isEmployee()) {
        setProfile(data.employee);
        setEditForm(data.employee);
      } else {
        setProfile(data.user || data.profile);
        setEditForm(data.user || data.profile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Lỗi khi tải thông tin');
    }
  };

  const fetchSchedules = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:3000/api/employees/${user.id}/schedules?month=${selectedMonth}&year=${selectedYear}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      const data = await response.json();
      setSchedules(data.schedules || []);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    }
  };

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
    }
  };

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/billing?customerId=${user.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setOrders(data.bills || data.donhangs || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchOnlineOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/online-orders?customerId=${user.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setOnlineOrders(data.orders || []);
    } catch (error) {
      console.error('Error fetching online orders:', error);
    }
  };

  const fetchOrderDetails = async (orderId, isOnline = false) => {
    try {
      const token = localStorage.getItem('token');
      const endpoint = isOnline 
        ? `http://localhost:3000/api/online-orders/${orderId}`
        : `http://localhost:3000/api/billing/${orderId}`;
      
      const response = await fetch(endpoint, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (isOnline) {
        setOrderDetails(data.order?.items || data.order?.CTDonHangOnlines || []);
        setSelectedOrder(data.order);
      } else {
        setOrderDetails(data.bill?.items || data.donhang?.CTDonHangs || []);
        setSelectedOrder(data.bill || data.donhang);
      }
      setShowOrderModal(true);
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error('Lỗi khi tải chi tiết đơn hàng');
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const endpoint = isEmployee()
        ? `http://localhost:3000/api/employees/${user.id}`
        : `http://localhost:3000/api/auth/profile`;
      
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          SDT: editForm.SDT || editForm.phone,
          Email: editForm.Email || editForm.email,
          DiaChi: editForm.DiaChi || editForm.address
        })
      });

      if (response.ok) {
        toast.success('Cập nhật thông tin thành công');
        setIsEditing(false);
        fetchProfile();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Lỗi khi cập nhật thông tin');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Lỗi khi cập nhật thông tin');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center">
                <span className="text-white text-2xl font-bold">
                  {(profile.HoTen || profile.name)?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{profile.HoTen || profile.name}</h1>
                <p className="text-gray-600">
                  {isEmployee() ? (profile.ChucVu || 'Nhân viên') : 'Khách hàng'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('info')}
                className={`py-4 px-6 text-sm font-medium ${
                  activeTab === 'info'
                    ? 'border-b-2 border-indigo-500 text-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <FiUser className="inline mr-2" />
                Thông tin cá nhân
              </button>
              
              {isEmployee() && (
                <button
                  onClick={() => setActiveTab('schedule')}
                  className={`py-4 px-6 text-sm font-medium ${
                    activeTab === 'schedule'
                      ? 'border-b-2 border-indigo-500 text-indigo-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <FiCalendar className="inline mr-2" />
                  Lịch làm việc
                </button>
              )}
              
              {isCustomer() && (
                <>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className={`py-4 px-6 text-sm font-medium ${
                      activeTab === 'orders'
                        ? 'border-b-2 border-indigo-500 text-indigo-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <FiShoppingCart className="inline mr-2" />
                    Đơn hàng
                  </button>
                  <button
                    onClick={() => setActiveTab('online-orders')}
                    className={`py-4 px-6 text-sm font-medium ${
                      activeTab === 'online-orders'
                        ? 'border-b-2 border-indigo-500 text-indigo-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <FiPackage className="inline mr-2" />
                    Đơn hàng online
                  </button>
                </>
              )}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Thông tin cá nhân */}
            {activeTab === 'info' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Thông tin cá nhân</h2>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                      <FiEdit2 className="mr-2" />
                      Chỉnh sửa
                    </button>
                  ) : (
                    <div className="space-x-2">
                      <button
                        onClick={handleUpdateProfile}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        <FiSave className="inline mr-2" />
                        Lưu
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setEditForm(profile);
                        }}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                      >
                        <FiX className="inline mr-2" />
                        Hủy
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên</label>
                    <input
                      type="text"
                      value={profile.HoTen || profile.name}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={isEditing ? (editForm.Email || editForm.email) : (profile.Email || profile.email)}
                      onChange={(e) => setEditForm({ ...editForm, Email: e.target.value, email: e.target.value })}
                      disabled={!isEditing}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${!isEditing ? 'bg-gray-100' : ''}`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                    <input
                      type="text"
                      value={isEditing ? (editForm.SDT || editForm.phone) : (profile.SDT || profile.phone)}
                      onChange={(e) => setEditForm({ ...editForm, SDT: e.target.value, phone: e.target.value })}
                      disabled={!isEditing}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${!isEditing ? 'bg-gray-100' : ''}`}
                    />
                  </div>
                  {isEmployee() && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Chức vụ</label>
                        <input
                          type="text"
                          value={profile.ChucVu}
                          disabled
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ngày vào làm</label>
                        <input
                          type="text"
                          value={formatDate(profile.NgayVaoLam)}
                          disabled
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                        />
                      </div>
                    </>
                  )}
                  {isCustomer() && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                        <input
                          type="text"
                          value={isEditing ? (editForm.DiaChi || editForm.address || '') : (profile.DiaChi || profile.address || '')}
                          onChange={(e) => setEditForm({ ...editForm, DiaChi: e.target.value, address: e.target.value })}
                          disabled={!isEditing}
                          placeholder="Nhập địa chỉ của bạn"
                          className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${!isEditing ? 'bg-gray-100' : ''}`}
                        />
                      </div>
                      {profile.DiemTichLuy !== undefined && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Điểm tích lũy</label>
                          <input
                            type="text"
                            value={profile.DiemTichLuy}
                            disabled
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                          />
                        </div>
                      )}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ngày tạo tài khoản</label>
                        <input
                          type="text"
                          value={formatDate(profile.NgayTaoTaiKhoan || profile.createdAt)}
                          disabled
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Lịch làm việc (Employee/Manager) */}
            {activeTab === 'schedule' && isEmployee() && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Lịch làm việc</h2>
                  <div className="flex space-x-2">
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                      className="px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      {[...Array(12)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>
                      ))}
                    </select>
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                      className="px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      {[2024, 2025, 2026].map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                    {isManager() && (
                      <button
                        onClick={() => setShowCreateScheduleModal(true)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                      >
                        <FiPlus className="inline mr-2" />
                        Tạo lịch
                      </button>
                    )}
                  </div>
                </div>

                {schedules.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ca làm</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ghi chú</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {schedules.map((schedule) => (
                          <tr key={schedule.MaLich} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {formatDate(schedule.NgayLam)}
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(schedule.NgayLam).toLocaleDateString('vi-VN', { weekday: 'long' })}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm font-medium text-gray-900">{schedule.CaLam}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                                schedule.TrangThai === 'Hoàn thành' ? 'bg-green-100 text-green-800' :
                                schedule.TrangThai === 'Vắng mặt' ? 'bg-red-100 text-red-800' :
                                schedule.TrangThai === 'Đã xếp lịch' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {schedule.TrangThai}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {schedule.GhiChu || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FiCalendar className="text-6xl text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Không có lịch làm việc trong tháng này</p>
                  </div>
                )}
              </div>
            )}

            {/* Đơn hàng (Customer) */}
            {activeTab === 'orders' && isCustomer() && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Đơn hàng tại quán</h2>
                {orders.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã đơn</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tổng tiền</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {orders.map((order) => (
                          <tr key={order.MaDH || order.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap font-medium">#{order.MaDH || order.id}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{formatDate(order.NgayLap || order.createdAt)}</td>
                            <td className="px-6 py-4 whitespace-nowrap font-semibold text-indigo-600">{formatCurrency(order.TongTien || order.total)}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                (order.TrangThai || order.status) === 'Hoàn thành' ? 'bg-green-100 text-green-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {order.TrangThai || order.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <button
                                onClick={() => fetchOrderDetails(order.MaDH || order.id, false)}
                                className="text-indigo-600 hover:text-indigo-900 font-medium"
                              >
                                <FiEye className="inline mr-1" />
                                Xem chi tiết
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FiShoppingCart className="text-6xl text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Bạn chưa có đơn hàng nào</p>
                  </div>
                )}
              </div>
            )}

            {/* Đơn hàng online (Customer) */}
            {activeTab === 'online-orders' && isCustomer() && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Đơn hàng online</h2>
                {onlineOrders.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã đơn</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Địa chỉ</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tổng tiền</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {onlineOrders.map((order) => (
                          <tr key={order.MaDHOnline || order.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap font-medium">#{order.MaDHOnline || order.id}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{formatDate(order.NgayDat || order.createdAt)}</td>
                            <td className="px-6 py-4">{order.DiaChiGiaoHang || order.address}</td>
                            <td className="px-6 py-4 whitespace-nowrap font-semibold text-indigo-600">{formatCurrency(order.TongTien || order.total)}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                (order.TrangThai || order.status) === 'Đã giao' ? 'bg-green-100 text-green-800' :
                                (order.TrangThai || order.status) === 'Đang giao' ? 'bg-blue-100 text-blue-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {order.TrangThai || order.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <button
                                onClick={() => fetchOrderDetails(order.MaDHOnline || order.id, true)}
                                className="text-indigo-600 hover:text-indigo-900 font-medium"
                              >
                                <FiEye className="inline mr-1" />
                                Xem chi tiết
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FiPackage className="text-6xl text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Bạn chưa có đơn hàng online nào</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal chi tiết đơn hàng */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  Chi tiết đơn hàng #{selectedOrder.MaDH || selectedOrder.MaDHOnline || selectedOrder.id}
                </h3>
                <button
                  onClick={() => {
                    setShowOrderModal(false);
                    setSelectedOrder(null);
                    setOrderDetails([]);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX className="text-2xl" />
                </button>
              </div>

              {/* Thông tin đơn hàng */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Ngày đặt</p>
                    <p className="font-medium">{formatDate(selectedOrder.NgayLap || selectedOrder.NgayDat || selectedOrder.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Trạng thái</p>
                    <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                      selectedOrder.TrangThai === 'Hoàn thành' || selectedOrder.TrangThai === 'Đã giao' 
                        ? 'bg-green-100 text-green-800' 
                        : selectedOrder.TrangThai === 'Đang giao' 
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {selectedOrder.TrangThai || selectedOrder.status}
                    </span>
                  </div>
                  {selectedOrder.DiaChiGiaoHang && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-600">Địa chỉ giao hàng</p>
                      <p className="font-medium">{selectedOrder.DiaChiGiaoHang}</p>
                    </div>
                  )}
                  {selectedOrder.GhiChu && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-600">Ghi chú</p>
                      <p className="font-medium">{selectedOrder.GhiChu}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Danh sách món */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold mb-4">Danh sách món</h4>
                <div className="space-y-3">
                  {orderDetails.length > 0 ? (
                    orderDetails.map((item, index) => (
                      <div key={index} className="flex justify-between items-center border-b pb-3">
                        <div className="flex-1">
                          <p className="font-medium">{item.Mon?.TenMon || item.TenMon || 'Món ăn'}</p>
                          {item.GhiChu && (
                            <p className="text-sm text-gray-500 italic">Ghi chú: {item.GhiChu}</p>
                          )}
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-sm text-gray-600">x{item.SoLuong}</p>
                          <p className="font-semibold text-indigo-600">
                            {formatCurrency(item.ThanhTien || (item.DonGia * item.SoLuong))}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-4">Không có chi tiết món</p>
                  )}
                </div>
              </div>

              {/* Tổng tiền */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Tổng cộng</span>
                  <span className="text-indigo-600">
                    {formatCurrency(selectedOrder.TongTien || selectedOrder.total)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
