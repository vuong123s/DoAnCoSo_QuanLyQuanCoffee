import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI } from '../../shared/services/api';
import { 
  normalizeRole, 
  hasRole, 
  hasPermission, 
  isAdmin, 
  isManager, 
  isStaff,
  getRoleDisplayName 
} from '../../shared/utils/roles';
import toast from 'react-hot-toast';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: true, // Start with true until rehydration completes
      isAuthenticated: false,


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
          return { success: true, user };
        } catch (error) {
          set({ isLoading: false });
          const message = error.response?.data?.error || error.response?.data?.message || 'Đăng nhập thất bại';
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
          return { success: true, user };
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

      // Get user role (normalized)
      getRole: () => {
        const { user } = get();
        if (!user) return null;
        const role = user.ChucVu || user.role || user.chucVu;
        return normalizeRole(role);
      },

      // Get role display name
      getRoleDisplay: () => {
        const { user } = get();
        if (!user) return 'Chưa đăng nhập';
        const role = user.ChucVu || user.role || user.chucVu;
        return getRoleDisplayName(role);
      },

      // Check if user has required role (supports both Vietnamese and English)
      hasRole: (requiredRoles) => {
        const { user } = get();
        if (!user) return false;
        const userRole = user.ChucVu || user.role || user.chucVu;
        return hasRole(userRole, requiredRoles);
      },

      // Check if user has permission
      hasPermission: (permission) => {
        const { user } = get();
        if (!user) return false;
        const userRole = user.ChucVu || user.role || user.chucVu;
        return hasPermission(userRole, permission);
      },

      // Check if user is staff or higher
      isStaff: () => {
        const { user } = get();
        if (!user) return false;
        const userRole = user.ChucVu || user.role || user.chucVu;
        return isStaff(userRole);
      },

      // Check if user is manager or higher
      isManager: () => {
        const { user } = get();
        if (!user) return false;
        const userRole = user.ChucVu || user.role || user.chucVu;
        return isManager(userRole);
      },

      // Check if user is admin
      isAdmin: () => {
        const { user } = get();
        if (!user) return false;
        const userRole = user.ChucVu || user.role || user.chucVu;
        return isAdmin(userRole);
      },

      // Check token validity and refresh user data
      validateToken: async () => {
        const { token } = get();
        if (!token) {
          set({ user: null, isAuthenticated: false });
          return false;
        }

        try {
          const response = await authAPI.getProfile();
          if (response.data.success && response.data.user) {
            set({ user: response.data.user, isAuthenticated: true });
            return true;
          }
        } catch (error) {
          console.log('Token validation failed:', error.response?.status);
          if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token');
            set({ user: null, token: null, isAuthenticated: false });
          }
          return false;
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        console.log('🔄 Zustand rehydrating:', state ? {
          hasUser: !!state.user,
          hasToken: !!state.token,
          isAuthenticated: state.isAuthenticated,
          userName: state.user?.name
        } : 'No state');
        
        if (state && state.user && state.token) {
          // Auto-authenticate from localStorage
          console.log('✅ Auto-authenticating from localStorage');
          state.isAuthenticated = true;
          state.isLoading = false; // Rehydration complete
          localStorage.setItem('token', state.token);
        } else {
          console.log('❌ No valid auth data in localStorage');
          if (state) {
            state.isLoading = false; // Rehydration complete, no auth data
          }
        }
      },
    }
  )
);
