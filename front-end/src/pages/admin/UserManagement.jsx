import React, { useState, useEffect } from 'react';
import { userAPI } from '../../shared/services/api';
import { useForm } from 'react-hook-form';
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiFilter, FiUser, FiMail, FiPhone, FiShield, FiUsers, FiUserCheck, FiUserX, FiDownload } from 'react-icons/fi';
import toast from 'react-hot-toast';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEmployees: 0,
    totalCustomers: 0,
    activeUsers: 0
  });
  const [roleFilter, setRoleFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [updatingUser, setUpdatingUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm();

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, roleFilter, searchQuery]);

  const fetchUsers = async () => {
    try {
      const response = await userAPI.getUsers();
      
      // Handle Vietnamese schema response
      let allUsers = [];
      
      // Process employees (NhanVien)
      const employees = (response.data.nhanviens || response.data.employees || []).map(emp => ({
        id: emp.MaNV || emp.id,
        name: emp.HoTen || emp.name,
        email: emp.Email || emp.email,
        phone: emp.SDT || emp.phone,
        role: emp.ChucVu || emp.role || 'Nhân viên',
        type: 'employee',
        status: emp.TrangThai || 'Hoạt động',
        createdAt: emp.NgayVaoLam || emp.createdAt || new Date(),
        salary: emp.Luong || emp.salary,
        address: emp.DiaChi || emp.address,
        birthDate: emp.NgaySinh || emp.birthDate
      }));

      // Process customers (KhachHang)
      const customers = (response.data.khachhangs || response.data.customers || []).map(cust => ({
        id: cust.MaKH || cust.id,
        name: cust.HoTen || cust.name,
        email: cust.Email || cust.email,
        phone: cust.SDT || cust.phone,
        role: 'Khách hàng',
        type: 'customer',
        status: cust.TrangThai || 'Hoạt động',
        createdAt: cust.NgayDangKy || cust.createdAt || new Date(),
        points: cust.DiemTichLuy || cust.points || 0,
        address: cust.DiaChi || cust.address,
        birthDate: cust.NgaySinh || cust.birthDate,
        gender: cust.GioiTinh || cust.gender
      }));

      allUsers = [...employees, ...customers];
      setUsers(allUsers);
    } catch (error) {
      console.error('Fetch users error:', error);
      toast.error('Lỗi khi tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await userAPI.getUserStats();
      setStats(response.data || {
        totalUsers: 0,
        totalEmployees: 0,
        totalCustomers: 0,
        activeUsers: 0
      });
    } catch (error) {
      console.error('Fetch stats error:', error);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Filter by role
    if (roleFilter !== 'all') {
      if (roleFilter === 'employee') {
        filtered = filtered.filter(user => user.type === 'employee');
      } else if (roleFilter === 'customer') {
        filtered = filtered.filter(user => user.type === 'customer');
      } else {
        filtered = filtered.filter(user => user.role === roleFilter);
      }
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(user =>
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.role?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setValue('name', user.name);
    setValue('email', user.email);
    setValue('phone', user.phone);
    setValue('role', user.role);
    setValue('salary', user.salary);
    setShowModal(true);
  };

  const handleDelete = async (user) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa ${user.type === 'employee' ? 'nhân viên' : 'khách hàng'} "${user.name}"?`)) {
      try {
        if (user.type === 'employee') {
          await userAPI.deleteEmployee(user.id);
        } else {
          await userAPI.deleteCustomer(user.id);
        }
        toast.success(`Xóa ${user.type === 'employee' ? 'nhân viên' : 'khách hàng'} thành công`);
        fetchUsers();
        fetchStats();
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Lỗi khi xóa người dùng';
        toast.error(errorMessage);
      }
    }
  };

  const handlePromoteToEmployee = async (customer) => {
    const chucVu = prompt('Nhập chức vụ (Nhân viên, Quản lý, Admin):', 'Nhân viên');
    const luong = prompt('Nhập lương (VNĐ):', '8000000');
    
    if (chucVu && luong) {
      try {
        await userAPI.promoteToEmployee(customer.id, { 
          ChucVu: chucVu, 
          Luong: parseInt(luong),
          NgayVaoLam: new Date().toISOString().split('T')[0]
        });
        toast.success(`Đã thăng chức "${customer.name}" thành nhân viên`);
        fetchUsers();
        fetchStats();
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Lỗi khi thăng chức';
        toast.error(errorMessage);
      }
    }
  };

  const handleUpdateRole = async (employee) => {
    const chucVu = prompt('Nhập chức vụ mới:', employee.role || '');
    const luong = prompt('Nhập lương mới (VNĐ):', (employee.salary ? employee.salary.toString() : '8000000'));
    
    if (chucVu && luong) {
      try {
        await userAPI.updateUserRole(employee.id, { 
          ChucVu: chucVu, 
          Luong: parseInt(luong) 
        });
        toast.success(`Cập nhật vai trò cho "${employee.name}" thành công`);
        fetchUsers();
        fetchStats();
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Lỗi khi cập nhật vai trò';
        toast.error(errorMessage);
      }
    }
  };

  const handleUpdateUser = (user) => {
    setUpdatingUser(user);
    setShowUpdateModal(true);
  };

  const handleUpdateSubmit = async (data) => {
    try {
      const updateData = {
        HoTen: data.name,
        Email: data.email,
        SDT: data.phone,
        DiaChi: data.address,
        NgaySinh: data.birthDate,
        ...(updatingUser.type === 'customer' && {
          GioiTinh: data.gender
        }),
        ...(updatingUser.type === 'employee' && {
          ChucVu: data.role,
          Luong: parseInt(data.salary) || updatingUser.salary
        })
      };

      if (updatingUser.type === 'employee') {
        await userAPI.updateEmployee(updatingUser.id, updateData);
      } else {
        await userAPI.updateCustomer(updatingUser.id, updateData);
      }

      toast.success(`Cập nhật thông tin cho "${updatingUser.name}" thành công`);
      setShowUpdateModal(false);
      setUpdatingUser(null);
      fetchUsers();
      fetchStats();
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Lỗi khi cập nhật thông tin';
      toast.error(errorMessage);
    }
  };

  const onSubmit = async (data) => {
    try {
      // Convert form data to Vietnamese schema
      const userData = {
        HoTen: data.name,
        Email: data.email,
        SDT: data.phone,
        MatKhau: data.password,
        ...(data.role !== 'Khách hàng' && {
          ChucVu: data.role,
          Luong: data.salary || 8000000,
          NgayVaoLam: new Date().toISOString().split('T')[0]
        }),
        ...(data.role === 'Khách hàng' && {
          DiemTichLuy: 0,
          NgayDangKy: new Date().toISOString().split('T')[0]
        })
      };

      if (editingUser) {
        if (editingUser.type === 'employee') {
          await userAPI.updateEmployee(editingUser.id, userData);
        } else {
          await userAPI.updateCustomer(editingUser.id, userData);
        }
        toast.success('Cập nhật người dùng thành công');
      } else {
        if (data.role === 'Khách hàng') {
          await userAPI.createCustomer(userData);
        } else {
          await userAPI.createEmployee(userData);
        }
        toast.success('Thêm người dùng mới thành công');
      }
      setShowModal(false);
      setEditingUser(null);
      reset();
      fetchUsers();
      fetchStats();
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Có lỗi xảy ra';
      toast.error(errorMessage);
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'Admin':
        return 'bg-red-100 text-red-800';
      case 'Quản lý':
        return 'bg-purple-100 text-purple-800';
      case 'Nhân viên':
        return 'bg-blue-100 text-blue-800';
      case 'Khách hàng':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleText = (role) => {
    // Role is already in Vietnamese from backend
    return role || 'Chưa xác định';
  };

  const exportToCSV = () => {
    const csvData = filteredUsers.map(user => ({
      'ID': user.id,
      'Họ tên': user.name,
      'Email': user.email,
      'SĐT': user.phone || '',
      'Vai trò': user.role,
      'Loại': user.type === 'employee' ? 'Nhân viên' : 'Khách hàng',
      'Ngày tạo': new Date(user.createdAt).toLocaleDateString('vi-VN'),
      'Lương': user.salary ? user.salary.toLocaleString('vi-VN') + ' VNĐ' : '',
      'Điểm tích lũy': user.points || ''
    }));

    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `danh-sach-nguoi-dung-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Xuất file thành công');
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
        <h1 className="text-2xl font-bold text-gray-900">Quản lý Người dùng</h1>
        <div className="flex space-x-3">
          {/* <button
            onClick={exportToCSV}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <FiDownload className="w-4 h-4" />
            <span>Xuất CSV</span>
          </button> */}
          <button
            onClick={() => {
              setEditingUser(null);
              reset();
              setShowModal(true);
            }}
            className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors flex items-center space-x-2"
          >
            <FiPlus className="w-4 h-4" />
            <span>Thêm người dùng</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <FiUsers className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Tổng người dùng</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalUsers || users.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <FiUserCheck className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Nhân viên</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalEmployees || users.filter(u => u.type === 'employee').length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <FiUser className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Khách hàng</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalCustomers || users.filter(u => u.type === 'customer').length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                <FiUserCheck className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Đang hoạt động</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.activeUsers || users.filter(u => u.status === 'Hoạt động').length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên, email, số điện thoại, vai trò..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <FiFilter className="text-gray-400 w-5 h-5" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option key="filter-role-all" value="all">Tất cả vai trò</option>
                <option key="filter-role-employee" value="employee">Nhân viên</option>
                <option key="filter-role-customer" value="customer">Khách hàng</option>
                <option key="filter-role-admin" value="Admin">Quản trị viên</option>
                <option key="filter-role-manager" value="Quản lý">Quản lý</option>
                <option key="filter-role-staff" value="Nhân viên">Nhân viên</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Người dùng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Liên hệ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vai trò
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày tạo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user, index) => (
                <tr key={`user-${user.type}-${user.id}-${index}`} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                          <FiUser className="w-5 h-5 text-amber-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">
                          ID: {user.id} • {user.type === 'employee' ? 'Nhân viên' : 'Khách hàng'}
                          {user.salary && <span className="ml-2 text-blue-600">• {user.salary.toLocaleString('vi-VN')} VNĐ</span>}
                          {user.points !== undefined && <span className="ml-2 text-green-600">• {user.points} điểm</span>}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-gray-900">
                        <FiMail className="w-4 h-4 text-gray-400 mr-2" />
                        {user.email}
                      </div>
                      {user.phone && (
                        <div className="flex items-center text-sm text-gray-500">
                          <FiPhone className="w-4 h-4 text-gray-400 mr-2" />
                          {user.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                      <FiShield className="w-3 h-3 mr-1" />
                      {getRoleText(user.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        key={`update-${user.type}-${user.id}`}
                        onClick={() => handleUpdateUser(user)}
                        className="!mx-2 text-blue-600 hover:text-blue-900"
                        title="Cập nhật thông tin"
                      >
                        <FiEdit className="w-4 h-4" />
                      </button>
                      <button
                        key={`delete-${user.type}-${user.id}`}
                        onClick={() => handleDelete(user)}
                        className="text-red-600 hover:text-red-900"
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

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <FiUser className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy người dùng nào</h3>
            <p className="text-gray-600">Thử thay đổi bộ lọc hoặc thêm người dùng mới</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingUser ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
            </h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Họ tên *
                </label>
                <input
                  {...register('name', { required: 'Họ tên là bắt buộc' })}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  {...register('email', { 
                    required: 'Email là bắt buộc',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Email không hợp lệ'
                    }
                  })}
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số điện thoại
                </label>
                <input
                  {...register('phone')}
                  type="tel"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>

              {!editingUser && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mật khẩu *
                  </label>
                  <input
                    {...register('password', { 
                      required: 'Mật khẩu là bắt buộc',
                      minLength: { value: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' }
                    })}
                    type="password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vai trò *
                </label>
                <select
                  {...register('role', { required: 'Vai trò là bắt buộc' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  <option key="role-empty" value="">Chọn vai trò</option>
                  <option key="role-admin" value="Admin">Quản trị viên</option>
                  <option key="role-manager" value="Quản lý">Quản lý</option>
                  <option key="role-staff" value="Nhân viên">Nhân viên</option>
                  <option key="role-customer" value="Khách hàng">Khách hàng</option>
                </select>
                {errors.role && (
                  <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
                )}
              </div>

              {/* Salary field for employees */}
              {(register('role').value !== 'Khách hàng' && !editingUser) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lương (VNĐ)
                  </label>
                  <input
                    {...register('salary')}
                    type="number"
                    min="0"
                    step="100000"
                    placeholder="8000000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingUser(null);
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
                  {isSubmitting ? 'Đang lưu...' : (editingUser ? 'Cập nhật' : 'Thêm mới')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update User Modal */}
      {showUpdateModal && updatingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Cập nhật thông tin - {updatingUser.name}
            </h2>
            
            <form onSubmit={handleSubmit(handleUpdateSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Họ tên *
                </label>
                <input
                  type="text"
                  {...register('name', { required: 'Họ tên là bắt buộc' })}
                  defaultValue={updatingUser.name}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  {...register('email', { 
                    required: 'Email là bắt buộc',
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: 'Email không hợp lệ'
                    }
                  })}
                  defaultValue={updatingUser.email}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số điện thoại *
                </label>
                <input
                  type="tel"
                  {...register('phone', { required: 'Số điện thoại là bắt buộc' })}
                  defaultValue={updatingUser.phone}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Địa chỉ
                </label>
                <input
                  type="text"
                  {...register('address')}
                  defaultValue={updatingUser.address || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày sinh
                </label>
                <input
                  type="date"
                  {...register('birthDate')}
                  defaultValue={updatingUser.birthDate ? new Date(updatingUser.birthDate).toISOString().split('T')[0] : ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {updatingUser.type === 'customer' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giới tính
                  </label>
                  <select
                    {...register('gender')}
                    defaultValue={updatingUser.gender || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Chọn giới tính</option>
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>
              )}

              {updatingUser.type === 'employee' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Chức vụ
                    </label>
                    <input
                      type="text"
                      {...register('role')}
                      defaultValue={updatingUser.role || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lương (VNĐ)
                    </label>
                    <input
                      type="number"
                      {...register('salary')}
                      defaultValue={updatingUser.salary || ''}
                      min="0"
                      step="100000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowUpdateModal(false);
                    setUpdatingUser(null);
                    reset();
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
