import React, { useState } from 'react';
import { authAPI } from '../../shared/services/api';

const ProfileDebug = () => {
  const [loginData, setLoginData] = useState({
    email: 'khach1@email.com',
    password: 'password'
  });
  const [token, setToken] = useState('');
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('🔑 Attempting login with:', loginData);
      const response = await authAPI.login(loginData);
      console.log('✅ Login response:', response.data);
      
      if (response.data.token) {
        setToken(response.data.token);
        localStorage.setItem('token', response.data.token);
        console.log('💾 Token saved:', response.data.token);
      }
      
    } catch (err) {
      console.error('❌ Login error:', err);
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGetProfile = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('👤 Fetching profile...');
      const response = await authAPI.getProfile();
      console.log('✅ Profile response:', response.data);
      
      setProfileData(response.data);
      
    } catch (err) {
      console.error('❌ Profile error:', err);
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setLoading(true);
      setError('');
      
      const updateData = {
        HoTen: 'Phạm Văn Khách (Updated)',
        DiaChi: '123 Nguyễn Huệ, Q1, TP.HCM (Updated)',
        GioiTinh: 'Nam',
        NgaySinh: '1985-03-15'
      };
      
      console.log('📝 Updating profile with:', updateData);
      const response = await authAPI.updateProfile(updateData);
      console.log('✅ Update response:', response.data);
      
      // Refresh profile data
      await handleGetProfile();
      
    } catch (err) {
      console.error('❌ Update error:', err);
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Profile API Debug</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {/* Login Section */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">1. Login Test</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email:</label>
            <input
              type="email"
              value={loginData.email}
              onChange={(e) => setLoginData({...loginData, email: e.target.value})}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Password:</label>
            <input
              type="password"
              value={loginData.password}
              onChange={(e) => setLoginData({...loginData, password: e.target.value})}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
        <button
          onClick={handleLogin}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
        
        {token && (
          <div className="mt-4 p-3 bg-green-100 rounded">
            <strong>Token:</strong> {token.substring(0, 50)}...
          </div>
        )}
      </div>
      
      {/* Profile Section */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">2. Get Profile Test</h2>
        <button
          onClick={handleGetProfile}
          disabled={loading || !token}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 mr-4"
        >
          {loading ? 'Loading...' : 'Get Profile'}
        </button>
        
        <button
          onClick={handleUpdateProfile}
          disabled={loading || !token}
          className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 disabled:opacity-50"
        >
          {loading ? 'Updating...' : 'Update Profile'}
        </button>
        
        {profileData && (
          <div className="mt-4">
            <h3 className="font-medium mb-2">Profile Data:</h3>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(profileData, null, 2)}
            </pre>
          </div>
        )}
      </div>
      
      {/* Instructions */}
      <div className="bg-blue-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Instructions:</h2>
        <ol className="list-decimal list-inside space-y-2">
          <li>First, click "Login" to authenticate with sample customer account</li>
          <li>Once logged in, click "Get Profile" to fetch customer data from database</li>
          <li>Click "Update Profile" to test the update functionality</li>
          <li>Check the console for detailed API responses</li>
        </ol>
        
        <div className="mt-4">
          <h3 className="font-medium mb-2">Sample Customer Accounts:</h3>
          <ul className="text-sm space-y-1">
            <li><strong>Email:</strong> khach1@email.com <strong>Password:</strong> password</li>
            <li><strong>Email:</strong> khach2@email.com <strong>Password:</strong> password</li>
            <li><strong>Email:</strong> khach3@email.com <strong>Password:</strong> password</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ProfileDebug;
