import React from 'react';
import { Link } from 'react-router-dom';
import { FiUser, FiDatabase, FiCheck, FiArrowRight } from 'react-icons/fi';

const ProfileGuide = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FiUser className="w-8 h-8 text-amber-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Trang Thông Tin Khách Hàng</h1>
        <p className="text-gray-600">Đọc dữ liệu thực từ database QuanLyCaFe.sql</p>
      </div>

      {/* Status */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <FiCheck className="w-6 h-6 text-green-600" />
          <h2 className="text-xl font-semibold text-green-800">✅ Hoàn thành</h2>
        </div>
        <p className="text-green-700">
          Trang Profile đã được tích hợp hoàn toàn với database và có thể hiển thị thông tin thực của khách hàng.
        </p>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-3 mb-4">
            <FiDatabase className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold">Database Integration</h3>
          </div>
          <ul className="space-y-2 text-sm">
            <li>• Đọc từ bảng <code className="bg-gray-100 px-1 rounded">KhachHang</code></li>
            <li>• Hiển thị đầy đủ thông tin cá nhân</li>
            <li>• Cập nhật thông tin real-time</li>
            <li>• Validation dữ liệu đầu vào</li>
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-3 mb-4">
            <FiUser className="w-6 h-6 text-amber-600" />
            <h3 className="text-lg font-semibold">User Experience</h3>
          </div>
          <ul className="space-y-2 text-sm">
            <li>• Giao diện đẹp và responsive</li>
            <li>• Form chỉnh sửa thông tin</li>
            <li>• Hiển thị điểm tích lũy</li>
            <li>• Thống kê tài khoản</li>
          </ul>
        </div>
      </div>

      {/* Demo Links */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4">🎯 Các trang demo có thể truy cập:</h3>
        <div className="space-y-4">
          <Link 
            to="/real-profile" 
            className="flex items-center justify-between p-4 border border-amber-200 rounded-lg hover:bg-amber-50 transition-colors"
          >
            <div>
              <h4 className="font-medium text-amber-800">Profile Thực Tế</h4>
              <p className="text-sm text-gray-600">Đăng nhập và xem thông tin thực từ database</p>
            </div>
            <FiArrowRight className="w-5 h-5 text-amber-600" />
          </Link>

          <Link 
            to="/customer/profile" 
            className="flex items-center justify-between p-4 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <div>
              <h4 className="font-medium text-blue-800">Profile Chính Thức</h4>
              <p className="text-sm text-gray-600">Trang profile chính (cần đăng nhập)</p>
            </div>
            <FiArrowRight className="w-5 h-5 text-blue-600" />
          </Link>

          <Link 
            to="/profile-demo" 
            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div>
              <h4 className="font-medium text-gray-800">Profile Demo</h4>
              <p className="text-sm text-gray-600">Xem giao diện với dữ liệu mẫu</p>
            </div>
            <FiArrowRight className="w-5 h-5 text-gray-600" />
          </Link>
        </div>
      </div>

      {/* Database Info */}
      <div className="bg-blue-50 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4">📊 Thông tin Database</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium mb-2">Bảng KhachHang:</h4>
            <ul className="text-sm space-y-1">
              <li>• <strong>MaKH:</strong> ID khách hàng (Primary Key)</li>
              <li>• <strong>HoTen:</strong> Họ và tên</li>
              <li>• <strong>Email:</strong> Địa chỉ email</li>
              <li>• <strong>SDT:</strong> Số điện thoại</li>
              <li>• <strong>GioiTinh:</strong> Giới tính</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Thông tin bổ sung:</h4>
            <ul className="text-sm space-y-1">
              <li>• <strong>NgaySinh:</strong> Ngày sinh</li>
              <li>• <strong>DiaChi:</strong> Địa chỉ</li>
              <li>• <strong>DiemTichLuy:</strong> Điểm tích lũy</li>
              <li>• <strong>NgayDangKy:</strong> Ngày đăng ký</li>
              <li>• <strong>TrangThai:</strong> Trạng thái tài khoản</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Test Accounts */}
      <div className="bg-yellow-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">🔑 Tài khoản test:</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded border">
            <h4 className="font-medium">Khách hàng 1</h4>
            <p className="text-sm text-gray-600 mt-1">
              <strong>Email:</strong> khach1@email.com<br/>
              <strong>Password:</strong> password<br/>
              <strong>Điểm:</strong> 150
            </p>
          </div>
          <div className="bg-white p-4 rounded border">
            <h4 className="font-medium">Khách hàng 2</h4>
            <p className="text-sm text-gray-600 mt-1">
              <strong>Email:</strong> khach2@email.com<br/>
              <strong>Password:</strong> password<br/>
              <strong>Điểm:</strong> 230
            </p>
          </div>
          <div className="bg-white p-4 rounded border">
            <h4 className="font-medium">Khách hàng 3</h4>
            <p className="text-sm text-gray-600 mt-1">
              <strong>Email:</strong> khach3@email.com<br/>
              <strong>Password:</strong> password<br/>
              <strong>Điểm:</strong> 80
            </p>
          </div>
        </div>
      </div>

      {/* Quick Start */}
      <div className="mt-8 text-center">
        <Link 
          to="/real-profile"
          className="inline-flex items-center space-x-2 bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition-colors"
        >
          <span>Bắt đầu test ngay</span>
          <FiArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
};

export default ProfileGuide;
