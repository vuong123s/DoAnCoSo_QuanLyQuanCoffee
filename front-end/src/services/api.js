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
  getTables: () => api.get('/api/tables'),
  getTable: (id) => api.get(`/api/tables/${id}`),
  createTable: (tableData) => api.post('/api/tables', tableData),
  updateTable: (id, tableData) => api.put(`/api/tables/${id}`, tableData),
  deleteTable: (id) => api.delete(`/api/tables/${id}`),
  checkAvailability: (params) => api.get('/api/tables/availability', { params }),
};

// Reservation API - Using Vietnamese schema
export const reservationAPI = {
  getReservations: (params) => api.get('/api/reservations', { params }),
  getReservation: (id) => api.get(`/api/reservations/${id}`),
  createReservation: (reservationData) => api.post('/api/reservations', reservationData),
  updateReservation: (id, reservationData) => api.put(`/api/reservations/${id}`, reservationData),
  updateReservationStatus: (id, statusData) => api.put(`/api/reservations/${id}/status`, statusData),
  deleteReservation: (id) => api.delete(`/api/reservations/${id}`),
  cancelReservation: (id) => api.patch(`/api/reservations/${id}/cancel`),
  getAvailableTables: (params) => api.get('/api/reservations/available-tables', { params }),
  getTodayReservations: (params) => api.get('/api/reservations/today', { params }),
  getReservationStats: (params) => api.get('/api/reservations/stats', { params }),
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
