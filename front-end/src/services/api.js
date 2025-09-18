import axios from 'axios';

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      // Avoid redirect loop if already on auth pages
      if (!currentPath.startsWith('/auth')) {
        localStorage.removeItem('token');
        // No automatic redirect - let user stay on current page
        console.log('Token expired, but staying on current page');
      }
    }
    return Promise.reject(error);
  }
);


// Auth API
export const authAPI = {
  login: (credentials) => api.post('/api/auth/login', credentials),
  register: (userData) => api.post('/api/auth/register', userData),
  getProfile: () => api.get('/api/auth/profile'),
  updateProfile: (profileData) => api.put('/api/auth/profile', profileData),
  changePassword: (passwordData) => api.put('/api/auth/change-password', passwordData),
  refreshToken: () => api.post('/api/auth/refresh'),
};

// Menu API
export const menuAPI = {
  getCategories: () => api.get('/api/categories'),
  createCategory: (categoryData) => api.post('/api/categories', categoryData),
  updateCategory: (id, categoryData) => api.put(`/api/categories/${id}`, categoryData),
  deleteCategory: (id) => api.delete(`/api/categories/${id}`),
  
  getMenuItems: (params) => api.get('/api/menu', { params }),
  getMenuItem: (id) => api.get(`/api/menu/${id}`),
  createMenuItem: (itemData) => api.post('/api/menu', itemData),
  updateMenuItem: (id, itemData) => api.put(`/api/menu/${id}`, itemData),
  deleteMenuItem: (id) => api.delete(`/api/menu/${id}`),
  // Fallback featured items using filters (aligns with Vietnamese schema)
  getFeaturedItems: () => api.get('/api/menu', { params: { is_available: true, limit: 8 } }),
};

// Table API - Using Vietnamese schema
export const tableAPI = {
  getTables: () => api.get('/api/ban'),
  getTable: (id) => api.get(`/api/ban/${id}`),
  createTable: (tableData) => api.post('/api/ban', tableData),
  updateTable: (id, tableData) => api.put(`/api/ban/${id}`, tableData),
  deleteTable: (id) => api.delete(`/api/ban/${id}`),
  checkAvailability: (params) => api.get('/api/ban/kiem-tra', { params }),
};

// Reservation API - Using Vietnamese schema
export const reservationAPI = {
  getReservations: (params) => api.get('/api/dat-ban', { params }),
  getReservation: (id) => api.get(`/api/dat-ban/${id}`),
  createReservation: (reservationData) => api.post('/api/dat-ban', reservationData),
  updateReservation: (id, reservationData) => api.put(`/api/dat-ban/${id}`, reservationData),
  updateReservationStatus: (id, statusData) => api.put(`/api/dat-ban/${id}/trang-thai`, statusData),
  cancelReservation: (id) => api.delete(`/api/dat-ban/${id}`),
  getAvailableTables: (params) => api.get('/api/dat-ban/ban-trong', { params }),
  getTodayReservations: (params) => api.get('/api/dat-ban/hom-nay', { params }),
  getReservationStats: (params) => api.get('/api/dat-ban/thong-ke', { params }),
};

// User API
export const userAPI = {
  getUsers: () => api.get('/api/auth/users'),
  promoteToEmployee: (customerId, data) => api.post(`/api/auth/promote/${customerId}`, data),
  updateUserRole: (employeeId, data) => api.put(`/api/auth/role/${employeeId}`, data),
  deleteUser: (userType, userId) => api.delete(`/api/auth/${userType}/${userId}`),
};

// Billing API
export const billingAPI = {
  getBills: (params) => api.get('/api/billing', { params }),
  getBill: (id) => api.get(`/api/billing/${id}`),
  createBill: (billData) => api.post('/api/billing', billData),
  updateBill: (id, billData) => api.put(`/api/billing/${id}`, billData),
  deleteBill: (id) => api.delete(`/api/billing/${id}`),
  updatePaymentStatus: (id, paymentData) => api.put(`/api/billing/${id}/payment`, paymentData),
  getBillingStats: () => api.get('/api/billing/stats'),
};

// Health API
export const healthAPI = {
  getGatewayHealth: () => api.get('/health'),
  getServicesHealth: () => api.get('/health/services'),
  getServiceHealth: (serviceName) => api.get(`/health/services/${serviceName}`),
};

export default api;
