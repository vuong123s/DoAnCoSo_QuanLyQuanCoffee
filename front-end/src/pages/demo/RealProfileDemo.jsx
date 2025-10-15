import React, { useState, useEffect } from 'react';
import { authAPI } from '../../shared/services/api';
import { FiUser, FiMail, FiPhone, FiMapPin, FiCalendar, FiAward, FiEdit3, FiSave, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

const RealProfileDemo = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [loginData, setLoginData] = useState({
    email: 'khach1@email.com',
    password: 'password'
  });
  const [formData, setFormData] = useState({
    HoTen: '',
    Email: '',
    SDT: '',
    DiaChi: '',
    GioiTinh: '',
    NgaySinh: ''
  });

  // Check if already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      fetchProfile();
    }
  }, []);

  const handleLogin = async () => {
    try {
      setLoading(true);
      console.log('🔑 Logging in with:', loginData);
      
      const response = await authAPI.login(loginData);
      console.log('✅ Login response:', response.data);
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        setIsLoggedIn(true);
        toast.success('Đăng nhập thành công!');
        await fetchProfile();
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      toast.error(error.response?.data?.error || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      setProfileLoading(true);
      console.log('👤 Fetching real profile from database...');
      
      const response = await authAPI.getProfile();
      console.log('✅ Profile response:', response.data);
      
      if (response.data.success && response.data.user) {
        const userData = response.data.user;
        setProfileData(userData);
        setFormData({
          HoTen: userData.name || '',
          Email: userData.email || '',
          SDT: userData.phone || '',
          DiaChi: userData.address || '',
          GioiTinh: userData.gender || '',
          NgaySinh: userData.dateOfBirth ? userData.dateOfBirth.split('T')[0] : ''
        });
        toast.success('Đã tải thông tin từ database');
      }
    } catch (error) {
      console.error('❌ Profile error:', error);
      toast.error('Không thể tải thông tin cá nhân');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      console.log('📝 Updating profile with:', formData);
      
      const response = await authAPI.updateProfile(formData);
      console.log('✅ Update response:', response.data);
      
      if (response.data.success) {
        const updatedUser = response.data.user;
        setProfileData(updatedUser);
        setIsEditing(false);
        toast.success('Cập nhật thông tin thành công!');
      }
    } catch (error) {
      console.error('❌ Update error:', error);
      toast.error(error.response?.data?.error || 'Cập nhật thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setProfileData(null);
    setFormData({
      HoTen: '',
      Email: '',
      SDT: '',
      DiaChi: '',
      GioiTinh: '',
      NgaySinh: ''
    });
    toast.success('Đã đăng xuất');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa cập nhật';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-center mb-6">Đăng nhập để xem Profile</h1>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email:</label>
              <input
                type="email"
                value={loginData.email}
                onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                className="w-full p-3 border rounded-md focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Mật khẩu:</label>
              <input
                type="password"
                value={loginData.password}
                onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                className="w-full p-3 border rounded-md focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-amber-600 text-white py-3 rounded-md hover:bg-amber-700 disabled:opacity-50"
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-md">
            <h3 className="font-medium mb-2">Tài khoản test:</h3>
            <ul className="text-sm space-y-1">
              <li><strong>Email:</strong> khach1@email.com</li>
              <li><strong>Password:</strong> password</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  if (profileLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/3 mb-6"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-300 rounded w-1/4"></div>
              <div className="h-10 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                <h1 className="text-2xl font-bold text-gray-900">Thông tin cá nhân (Thực tế)</h1>
                <p className="text-gray-600">Dữ liệu từ database KhachHang</p>
              </div>
            </div>
            <div className="flex space-x-2">
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-2 bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700"
                >
                  <FiEdit3 className="w-4 h-4" />
                  <span>Chỉnh sửa</span>
                </button>
              )}
              <button
                onClick={handleLogout}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>

        {/* Customer Stats */}
        {profileData && (
          <div className="p-6 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <FiAward className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Điểm tích lũy</p>
                  <p className="text-lg font-semibold text-gray-900">{profileData.points || 0} điểm</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <FiCalendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ngày đăng ký</p>
                  <p className="text-lg font-semibold text-gray-900">{formatDate(profileData.registrationDate)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <FiUser className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Trạng thái</p>
                  <p className={`text-lg font-semibold ${profileData.status === 'Hoạt động' ? 'text-green-600' : 'text-red-600'}`}>
                    {profileData.status || 'Hoạt động'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Profile Form */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6">
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Họ và tên */}
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                  <FiUser className="w-4 h-4" />
                  <span>Họ và tên</span>
                </label>
                <input
                  type="text"
                  name="HoTen"
                  value={formData.HoTen}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                    !isEditing ? 'bg-gray-50' : ''
                  }`}
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                  <FiMail className="w-4 h-4" />
                  <span>Email</span>
                </label>
                <input
                  type="email"
                  name="Email"
                  value={formData.Email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                    !isEditing ? 'bg-gray-50' : ''
                  }`}
                  required
                />
              </div>

              {/* Số điện thoại */}
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                  <FiPhone className="w-4 h-4" />
                  <span>Số điện thoại</span>
                </label>
                <input
                  type="tel"
                  name="SDT"
                  value={formData.SDT}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                    !isEditing ? 'bg-gray-50' : ''
                  }`}
                />
              </div>

              {/* Giới tính */}
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                  <FiUser className="w-4 h-4" />
                  <span>Giới tính</span>
                </label>
                <select
                  name="GioiTinh"
                  value={formData.GioiTinh}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                    !isEditing ? 'bg-gray-50' : ''
                  }`}
                >
                  <option value="">Chọn giới tính</option>
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>

              {/* Ngày sinh */}
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                  <FiCalendar className="w-4 h-4" />
                  <span>Ngày sinh</span>
                </label>
                <input
                  type="date"
                  name="NgaySinh"
                  value={formData.NgaySinh}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                    !isEditing ? 'bg-gray-50' : ''
                  }`}
                />
              </div>

              {/* Địa chỉ */}
              <div className="md:col-span-2">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                  <FiMapPin className="w-4 h-4" />
                  <span>Địa chỉ</span>
                </label>
                <textarea
                  name="DiaChi"
                  value={formData.DiaChi}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  rows={3}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                    !isEditing ? 'bg-gray-50' : ''
                  }`}
                  placeholder="Nhập địa chỉ của bạn"
                />
              </div>
            </div>

            {isEditing && (
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  <FiX className="w-4 h-4" />
                  <span>Hủy</span>
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center space-x-2 bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700 disabled:opacity-50"
                >
                  <FiSave className="w-4 h-4" />
                  <span>{loading ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
                </button>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Debug Info */}
      {profileData && (
        <div className="mt-6 bg-green-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">✅ Dữ liệu thực từ Database</h2>
          <pre className="bg-white p-4 rounded text-sm overflow-auto">
            {JSON.stringify(profileData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default RealProfileDemo;
