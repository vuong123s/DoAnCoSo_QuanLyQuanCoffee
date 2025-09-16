import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,

      // Initialize auth state
      initialize: async () => {
        const token = localStorage.getItem('token');
        if (token) {
          try {
            set({ isLoading: true });
            const response = await authAPI.getProfile();
            set({
              user: response.data.user,
              token,
              isAuthenticated: true,
              isLoading: false,
            });
          } catch (error) {
            localStorage.removeItem('token');
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false,
            });
          }
        }
      },

      // Login
      login: async (credentials) => {
        try {
          set({ isLoading: true });
          const response = await authAPI.login(credentials);
          const { user, token } = response.data;
          
          localStorage.setItem('token', token);
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
          
          toast.success(`Chào mừng ${user.name}!`);
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          const message = error.response?.data?.message || 'Đăng nhập thất bại';
          toast.error(message);
          return { success: false, error: message };
        }
      },

      // Register
      register: async (userData) => {
        try {
          set({ isLoading: true });
          const response = await authAPI.register(userData);
          const { user, token } = response.data;
          
          localStorage.setItem('token', token);
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
          
          toast.success('Đăng ký thành công!');
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          const message = error.response?.data?.message || 'Đăng ký thất bại';
          toast.error(message);
          return { success: false, error: message };
        }
      },

      // Logout
      logout: () => {
        localStorage.removeItem('token');
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
        toast.success('Đã đăng xuất');
      },

      // Update profile
      updateProfile: async (profileData) => {
        try {
          set({ isLoading: true });
          const response = await authAPI.updateProfile(profileData);
          set({
            user: response.data.user,
            isLoading: false,
          });
          toast.success('Cập nhật thông tin thành công');
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          const message = error.response?.data?.message || 'Cập nhật thất bại';
          toast.error(message);
          return { success: false, error: message };
        }
      },

      // Change password
      changePassword: async (passwordData) => {
        try {
          set({ isLoading: true });
          await authAPI.changePassword(passwordData);
          set({ isLoading: false });
          toast.success('Đổi mật khẩu thành công');
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          const message = error.response?.data?.message || 'Đổi mật khẩu thất bại';
          toast.error(message);
          return { success: false, error: message };
        }
      },

      // Check if user has required role
      hasRole: (requiredRoles) => {
        const { user } = get();
        if (!user) return false;
        return requiredRoles.includes(user.role);
      },

      // Check if user is staff or higher
      isStaff: () => {
        const { user } = get();
        return user && ['staff', 'manager', 'admin'].includes(user.role);
      },

      // Check if user is manager or higher
      isManager: () => {
        const { user } = get();
        return user && ['manager', 'admin'].includes(user.role);
      },

      // Check if user is admin
      isAdmin: () => {
        const { user } = get();
        return user && user.role === 'admin';
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
