import axios from 'axios';

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
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
      localStorage.removeItem('token');
      window.location.href = '/auth/login';
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
  getFeaturedItems: () => api.get('/api/menu/featured'),
};

// Table API
export const tableAPI = {
  getTables: () => api.get('/api/tables'),
  getTable: (id) => api.get(`/api/tables/${id}`),
  createTable: (tableData) => api.post('/api/tables', tableData),
  updateTable: (id, tableData) => api.put(`/api/tables/${id}`, tableData),
  deleteTable: (id) => api.delete(`/api/tables/${id}`),
  checkAvailability: (params) => api.get('/api/tables/available', { params }),
};

// Reservation API
export const reservationAPI = {
  getReservations: (params) => api.get('/api/reservations', { params }),
  getReservation: (id) => api.get(`/api/reservations/${id}`),
  createReservation: (reservationData) => api.post('/api/reservations', reservationData),
  updateReservation: (id, reservationData) => api.put(`/api/reservations/${id}`, reservationData),
  cancelReservation: (id) => api.delete(`/api/reservations/${id}`),
};

// User API
export const userAPI = {
  getUsers: (params) => api.get('/api/users', { params }),
  getUser: (id) => api.get(`/api/users/${id}`),
  updateUser: (id, userData) => api.put(`/api/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/api/users/${id}`),
  toggleUserStatus: (id) => api.put(`/api/users/${id}/status`),
  resetPassword: (id) => api.post(`/api/users/${id}/reset-password`),
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
