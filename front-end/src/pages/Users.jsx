import { useState } from "react";
import { 
  FiPlus, 
  FiSearch, 
  FiFilter, 
  FiEdit, 
  FiTrash2, 
  FiEye,
  FiUser,
  FiUserCheck,
  FiUserX,
  FiShield,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCalendar,
  FiClock,
  FiCheck,
  FiX,
  FiMoreVertical
} from "react-icons/fi";

function Users() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Mock data - trong thực tế sẽ fetch từ API
  const users = [
    {
      id: 1,
      name: "Nguyễn Văn Admin",
      email: "admin@coffee.com",
      phone: "0123456789",
      role: "admin",
      status: "active",
      joinDate: "2024-01-01",
      lastLogin: "2024-01-15 10:30",
      avatar: null,
      address: "123 Đường ABC, Quận 1, TP.HCM",
      permissions: ["all"]
    },
    {
      id: 2,
      name: "Trần Thị Manager",
      email: "manager@coffee.com",
      phone: "0987654321",
      role: "manager",
      status: "active",
      joinDate: "2024-01-05",
      lastLogin: "2024-01-15 09:15",
      avatar: null,
      address: "456 Đường XYZ, Quận 2, TP.HCM",
      permissions: ["products", "orders", "inventory"]
    },
    {
      id: 3,
      name: "Lê Văn Staff",
      email: "staff@coffee.com",
      phone: "0369852147",
      role: "staff",
      status: "active",
      joinDate: "2024-01-10",
      lastLogin: "2024-01-15 08:45",
      avatar: null,
      address: "789 Đường DEF, Quận 3, TP.HCM",
      permissions: ["orders"]
    },
    {
      id: 4,
      name: "Phạm Thị Cashier",
      email: "cashier@coffee.com",
      phone: "0741852963",
      role: "cashier",
      status: "inactive",
      joinDate: "2024-01-12",
      lastLogin: "2024-01-14 17:30",
      avatar: null,
      address: "321 Đường GHI, Quận 4, TP.HCM",
      permissions: ["orders"]
    },
    {
      id: 5,
      name: "Hoàng Văn Barista",
      email: "barista@coffee.com",
      phone: "0527419638",
      role: "barista",
      status: "active",
      joinDate: "2024-01-08",
      lastLogin: "2024-01-15 07:20",
      avatar: null,
      address: "654 Đường JKL, Quận 5, TP.HCM",
      permissions: ["products", "inventory"]
    }
  ];

  const roles = [
    { value: "all", label: "Tất cả" },
    { value: "admin", label: "Quản trị viên" },
    { value: "manager", label: "Quản lý" },
    { value: "staff", label: "Nhân viên" },
    { value: "cashier", label: "Thu ngân" },
    { value: "barista", label: "Pha chế" }
  ];

  const statusOptions = [
    { value: "all", label: "Tất cả" },
    { value: "active", label: "Hoạt động" },
    { value: "inactive", label: "Không hoạt động" },
    { value: "suspended", label: "Tạm khóa" }
  ];

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.phone.includes(searchTerm);
    const matchesRole = selectedRole === "all" || user.role === selectedRole;
    const matchesStatus = selectedStatus === "all" || user.status === selectedStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'text-red-600 bg-red-100';
      case 'manager': return 'text-purple-600 bg-purple-100';
      case 'staff': return 'text-blue-600 bg-blue-100';
      case 'cashier': return 'text-green-600 bg-green-100';
      case 'barista': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRoleText = (role) => {
    switch (role) {
      case 'admin': return 'Quản trị viên';
      case 'manager': return 'Quản lý';
      case 'staff': return 'Nhân viên';
      case 'cashier': return 'Thu ngân';
      case 'barista': return 'Pha chế';
      default: return 'Không xác định';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'inactive': return 'text-gray-600 bg-gray-100';
      case 'suspended': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Hoạt động';
      case 'inactive': return 'Không hoạt động';
      case 'suspended': return 'Tạm khóa';
      default: return 'Không xác định';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <FiUserCheck className="w-4 h-4" />;
      case 'inactive': return <FiUserX className="w-4 h-4" />;
      case 'suspended': return <FiX className="w-4 h-4" />;
      default: return <FiUser className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý nhân viên</h1>
          <p className="text-gray-600 mt-1">Quản lý nhân viên quán cà phê</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
        >
          <FiPlus className="w-5 h-5 mr-2" />
          Thêm nhân viên
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng nhân viên</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FiUser className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Đang hoạt động</p>
              <p className="text-2xl font-bold text-green-600">{users.filter(u => u.status === 'active').length}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <FiUserCheck className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Không hoạt động</p>
              <p className="text-2xl font-bold text-gray-600">{users.filter(u => u.status === 'inactive').length}</p>
            </div>
            <div className="p-3 bg-gray-100 rounded-lg">
              <FiUserX className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Quản lý</p>
              <p className="text-2xl font-bold text-purple-600">{users.filter(u => u.role === 'manager' || u.role === 'admin').length}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <FiShield className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm kiếm nhân viên..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            >
              {roles.map(role => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            >
              {statusOptions.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
            <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <FiFilter className="w-5 h-5 mr-2" />
              Bộ lọc
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Nhân viên</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Vai trò</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Liên hệ</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Trạng thái</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Tham gia</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Đăng nhập cuối</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {user.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">ID: {user.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                      {getRoleText(user.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm text-gray-900">{user.email}</p>
                      <p className="text-sm text-gray-500">{user.phone}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                      {getStatusIcon(user.status)}
                      <span className="ml-1">{getStatusText(user.status)}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-900">{formatDate(user.joinDate)}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-900">{formatDateTime(user.lastLogin)}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                        <FiEye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setEditingUser(user)}
                        className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg"
                      >
                        <FiEdit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-700">
          Hiển thị <span className="font-medium">1</span> đến <span className="font-medium">{filteredUsers.length}</span> trong tổng số <span className="font-medium">{users.length}</span> nhân viên
        </p>
        <div className="flex items-center space-x-2">
          <button className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            Trước
          </button>
          <button className="px-3 py-2 text-sm font-medium text-white bg-amber-600 border border-amber-600 rounded-lg">
            1
          </button>
          <button className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            2
          </button>
          <button className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            Sau
          </button>
        </div>
      </div>

      {/* Add/Edit User Modal */}
      {(showAddModal || editingUser) && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => {setShowAddModal(false); setEditingUser(null);}}></div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {editingUser ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên mới'}
                </h3>
                
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                    <input
                      type="text"
                      defaultValue={editingUser?.name || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      defaultValue={editingUser?.email || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                    <input
                      type="tel"
                      defaultValue={editingUser?.phone || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500">
                      <option value="admin">Quản trị viên</option>
                      <option value="manager">Quản lý</option>
                      <option value="staff">Nhân viên</option>
                      <option value="cashier">Thu ngân</option>
                      <option value="barista">Pha chế</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500">
                      <option value="active">Hoạt động</option>
                      <option value="inactive">Không hoạt động</option>
                      <option value="suspended">Tạm khóa</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                    <textarea
                      rows={3}
                      defaultValue={editingUser?.address || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>
                  
                  {!editingUser && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
                      <input
                        type="password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      />
                    </div>
                  )}
                </form>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-amber-600 text-base font-medium text-white hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  {editingUser ? 'Cập nhật' : 'Thêm nhân viên'}
                </button>
                <button
                  type="button"
                  onClick={() => {setShowAddModal(false); setEditingUser(null);}}
                  className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Users;


