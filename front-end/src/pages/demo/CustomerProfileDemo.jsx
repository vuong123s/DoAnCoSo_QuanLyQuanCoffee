import React from 'react';
import { FiUser, FiMail, FiPhone, FiMapPin, FiCalendar, FiAward, FiEdit3 } from 'react-icons/fi';

const CustomerProfileDemo = () => {
  // Sample customer data from database
  const customerData = {
    id: 1,
    name: 'Phạm Văn Khách',
    email: 'khach1@email.com',
    phone: '0999888777',
    gender: 'Nam',
    dateOfBirth: '1985-03-15',
    address: '123 Nguyễn Huệ, Q1, TP.HCM',
    points: 150,
    registrationDate: '2024-01-01',
    status: 'Hoạt động'
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa cập nhật';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
                <FiUser className="w-8 h-8 text-amber-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Thông tin cá nhân</h1>
                <p className="text-gray-600">Quản lý thông tin tài khoản của bạn</p>
              </div>
            </div>
            <button className="flex items-center space-x-2 bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700 transition-colors">
              <FiEdit3 className="w-4 h-4" />
              <span>Chỉnh sửa</span>
            </button>
          </div>
        </div>

        {/* Customer Stats */}
        <div className="p-6 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <FiAward className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Điểm tích lũy</p>
                <p className="text-lg font-semibold text-gray-900">{customerData.points} điểm</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <FiCalendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Ngày đăng ký</p>
                <p className="text-lg font-semibold text-gray-900">{formatDate(customerData.registrationDate)}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <FiUser className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Trạng thái</p>
                <p className={`text-lg font-semibold ${customerData.status === 'Hoạt động' ? 'text-green-600' : 'text-red-600'}`}>
                  {customerData.status}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Information */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Họ và tên */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <FiUser className="w-4 h-4" />
                <span>Họ và tên</span>
              </label>
              <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                {customerData.name}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <FiMail className="w-4 h-4" />
                <span>Email</span>
              </label>
              <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                {customerData.email}
              </div>
            </div>

            {/* Số điện thoại */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <FiPhone className="w-4 h-4" />
                <span>Số điện thoại</span>
              </label>
              <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                {customerData.phone}
              </div>
            </div>

            {/* Giới tính */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <FiUser className="w-4 h-4" />
                <span>Giới tính</span>
              </label>
              <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                {customerData.gender}
              </div>
            </div>

            {/* Ngày sinh */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <FiCalendar className="w-4 h-4" />
                <span>Ngày sinh</span>
              </label>
              <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                {formatDate(customerData.dateOfBirth)}
              </div>
            </div>

            {/* Địa chỉ */}
            <div className="md:col-span-2">
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <FiMapPin className="w-4 h-4" />
                <span>Địa chỉ</span>
              </label>
              <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                {customerData.address}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Database Information */}
      <div className="mt-6 bg-blue-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Thông tin Database</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium mb-2">Bảng KhachHang:</h3>
            <ul className="text-sm space-y-1">
              <li><strong>MaKH:</strong> {customerData.id} (Primary Key)</li>
              <li><strong>HoTen:</strong> {customerData.name}</li>
              <li><strong>Email:</strong> {customerData.email}</li>
              <li><strong>SDT:</strong> {customerData.phone}</li>
              <li><strong>GioiTinh:</strong> {customerData.gender}</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2">Thông tin bổ sung:</h3>
            <ul className="text-sm space-y-1">
              <li><strong>NgaySinh:</strong> {customerData.dateOfBirth}</li>
              <li><strong>DiaChi:</strong> {customerData.address}</li>
              <li><strong>DiemTichLuy:</strong> {customerData.points}</li>
              <li><strong>NgayDangKy:</strong> {customerData.registrationDate}</li>
              <li><strong>TrangThai:</strong> {customerData.status}</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="mt-6 bg-green-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Tính năng đã triển khai</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium mb-2">✅ API Endpoints:</h3>
            <ul className="text-sm space-y-1">
              <li>GET /api/auth/profile - Lấy thông tin profile</li>
              <li>PUT /api/auth/profile - Cập nhật thông tin</li>
              <li>POST /api/auth/login - Đăng nhập</li>
              <li>POST /api/auth/register - Đăng ký</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2">✅ Frontend Features:</h3>
            <ul className="text-sm space-y-1">
              <li>Hiển thị thông tin từ database</li>
              <li>Form chỉnh sửa thông tin</li>
              <li>Validation dữ liệu</li>
              <li>UI responsive và đẹp mắt</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfileDemo;
