import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../../app/stores/authStore';
import { hasRole, getRoleDisplayName, getRoleBadgeColor } from '../../../shared/utils/roles';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children, allowedRoles = [], requireAuth = true }) => {
  const { isAuthenticated, user, isLoading } = useAuthStore();
  const location = useLocation();

  // Wait for auth initialization
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Check authentication if required
  if (requireAuth) {
    const hasUser = isAuthenticated && user && (user.MaNV || user.MaKH || user.id);
    
    if (!hasUser) {
      return <Navigate to="/auth/login" state={{ from: location }} replace />;
    }
  }

  // Check role permissions if required
  if (allowedRoles.length > 0 && user) {
    const userRole = user.ChucVu || user.role || user.chucVu;
    
    if (!hasRole(userRole, allowedRoles)) {
      const roleColors = getRoleBadgeColor(userRole);
      
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 mb-3">403</h1>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Truy cập bị từ chối</h2>
            <p className="text-gray-600 mb-6">Bạn không có quyền truy cập trang này</p>
            
            <div className="mb-6">
              <p className="text-sm text-gray-500 mb-2">Chức vụ hiện tại của bạn:</p>
              <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${roleColors.bg} ${roleColors.text} ${roleColors.border}`}>
                {getRoleDisplayName(userRole)}
              </span>
            </div>
            
            <div className="space-y-3">
              <a 
                href="/" 
                className="block w-full bg-amber-600 text-white px-6 py-3 rounded-xl hover:bg-amber-700 transition-colors font-medium"
              >
                Về trang chủ
              </a>
              <a 
                href="/profile" 
                className="block w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-200 transition-colors font-medium"
              >
                Xem hồ sơ
              </a>
            </div>
          </div>
        </div>
      );
    }
  }

  // All checks passed, render children
  return children;
};

export default ProtectedRoute;
