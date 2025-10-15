import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../app/stores/authStore';
import { authAPI } from '../../shared/services/api';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiPhone, FiMapPin, FiCalendar, FiAward, FiEdit3, FiSave, FiX } from 'react-icons/fi';

const Profile = () => {
  const { user, updateUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [formData, setFormData] = useState({
    HoTen: '',
    Email: '',
    SDT: '',
    DiaChi: '',
    GioiTinh: '',
    NgaySinh: ''
  });

  // Fetch profile data from database
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setProfileLoading(true);
        
        // Check if user is authenticated
        if (!user || !localStorage.getItem('token')) {
          toast.error('Vui lòng đăng nhập để xem thông tin cá nhân');
          setProfileLoading(false);
          return;
        }
        
        const response = await authAPI.getProfile();
        console.log('Profile response:', response.data);
        
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
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        
        // Handle token expiration
        if (error.response?.status === 401) {
          toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
          // Clear expired token
          localStorage.removeItem('token');
          // Optionally redirect to login
          // window.location.href = '/auth/login';
        } else {
          toast.error('Không thể tải thông tin cá nhân');
        }
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authAPI.updateProfile(formData);
      console.log('Update response:', response.data);
      
      if (response.data.success) {
        const updatedUser = response.data.user;
        setProfileData(updatedUser);
        updateUser(updatedUser); // Update auth store
        setIsEditing(false);
        toast.success('Cập nhật thông tin thành công!');
      }
    } catch (error) {
      console.error('Update profile error:', error);
      const errorMessage = error.response?.data?.error || 'Có lỗi xảy ra khi cập nhật thông tin';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (profileData) {
      setFormData({
        HoTen: profileData.name || '',
        Email: profileData.email || '',
        SDT: profileData.phone || '',
        DiaChi: profileData.address || '',
        GioiTinh: profileData.gender || '',
        NgaySinh: profileData.dateOfBirth ? profileData.dateOfBirth.split('T')[0] : ''
      });
    }
    setIsEditing(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa cập nhật';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  // Show login prompt if not authenticated
  if (!user || !localStorage.getItem('token')) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiUser className="w-8 h-8 text-amber-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Chưa đăng nhập</h2>
          <p className="text-gray-600 mb-6">Vui lòng đăng nhập để xem thông tin cá nhân của bạn.</p>
          <a
            href="/auth/login"
            className="inline-flex items-center space-x-2 bg-amber-600 text-white px-6 py-3 rounded-md hover:bg-amber-700 transition-colors"
          >
            <span>Đăng nhập ngay</span>
          </a>
        </div>
      </div>
    );
  }

  if (profileLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/3 mb-6"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-300 rounded w-1/4"></div>
              <div className="h-10 bg-gray-300 rounded"></div>
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
                <h1 className="text-2xl font-bold text-gray-900">Thông tin cá nhân</h1>
                <p className="text-gray-600">Quản lý thông tin tài khoản của bạn</p>
              </div>
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center space-x-2 bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700 transition-colors"
              >
                <FiEdit3 className="w-4 h-4" />
                <span>Chỉnh sửa</span>
              </button>
            )}
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
          <form onSubmit={handleSubmit} className="space-y-6">
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
                  onClick={handleCancel}
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <FiX className="w-4 h-4" />
                  <span>Hủy</span>
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center space-x-2 bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700 disabled:opacity-50 transition-colors"
                >
                  <FiSave className="w-4 h-4" />
                  <span>{loading ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
