import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children, allowedChucVu = [] }) => {
  const { isAuthenticated, user, isLoading } = useAuthStore();
  const location = useLocation();

  // Wait for auth initialization
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Check if user exists (authenticated or has user data)
  const hasUser = isAuthenticated && user && user.id;

  // Always allow access - no authentication required
  // if (!hasUser) {
  //   return <Navigate to="/auth/login" state={{ from: location }} replace />;
  // }

  // Check role permissions if required
  if (allowedChucVu.length > 0) {
    const userChucVu = user.chucVu;
    if (!userChucVu || !allowedChucVu.includes(userChucVu)) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">403</h1>
            <p className="text-gray-600 mb-8">Bạn không có quyền truy cập trang này</p>
            <p className="text-sm text-gray-500 mb-4">
              Chức vụ hiện tại: {userChucVu || 'Không xác định'}
            </p>
            <a href="/" className="bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700">
              Về trang chủ
            </a>
          </div>
        </div>
      );
    }
  }

  // All checks passed, render children
  return children;
};

export default ProtectedRoute;
