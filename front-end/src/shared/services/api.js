import axios from 'axios';

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Create different API instances for different services
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Billing service API (port 3004)
const billingApi = axios.create({
  baseURL: 'http://localhost:3004',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Menu service API (port 3002)
const menuApi = axios.create({
  baseURL: 'http://localhost:3002',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Table service API (port 3003)
const tableApi = axios.create({
  baseURL: 'http://localhost:3003',
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
  getMenuItems: (params) => menuApi.get('/api/menu', { params }),
  getMenuItem: (id) => menuApi.get(`/api/menu/${id}`),
  createMenuItem: (itemData) => menuApi.post('/api/menu', itemData),
  updateMenuItem: (id, itemData) => menuApi.put(`/api/menu/${id}`, itemData),
  deleteMenuItem: (id) => menuApi.delete(`/api/menu/${id}`),
  getCategories: () => menuApi.get('/api/categories'),
  createCategory: (categoryData) => menuApi.post('/api/categories', categoryData),
  updateCategory: (id, categoryData) => menuApi.put(`/api/categories/${id}`, categoryData),
  deleteCategory: (id) => menuApi.delete(`/api/categories/${id}`),
  getMenuStats: () => menuApi.get('/api/menu/stats'),
};

// Table API - Using Vietnamese schema
export const tableAPI = {
  getTables: (params) => tableApi.get('/api/tables', { params }),
  getTable: (id) => tableApi.get(`/api/tables/${id}`),
  createTable: (tableData) => tableApi.post('/api/tables', tableData),
  updateTable: (id, tableData) => tableApi.put(`/api/tables/${id}`, tableData),
  deleteTable: (id) => tableApi.delete(`/api/tables/${id}`),
  updateTableStatus: (id, statusData) => tableApi.patch(`/api/tables/${id}/status`, statusData),
  getTableStats: () => api.get('/api/tables/stats'),
  
  // Legacy area endpoints (for backward compatibility)
  getAreas: () => api.get('/api/tables/areas'),
  getTablesByArea: (area, params) => api.get(`/api/tables/areas/${encodeURIComponent(area)}`, { params }),
};

// Area API - New dedicated area management
export const areaAPI = {
  getAreas: (params) => api.get('/api/areas', { params }),
  getArea: (id) => api.get(`/api/areas/${id}`),
  createArea: (areaData) => api.post('/api/areas', areaData),
  updateArea: (id, areaData) => api.put(`/api/areas/${id}`, areaData),
  deleteArea: (id) => api.delete(`/api/areas/${id}`),
  getTablesByArea: (areaId, params) => api.get(`/api/areas/${areaId}/tables`, { params }),
};

// Reservation API - Using Vietnamese schema with time conflict checking
export const reservationAPI = {
  getReservations: (params) => api.get('/api/reservations', { params }),
  getReservation: (id) => api.get(`/api/reservations/${id}`),
  createReservation: (reservationData) => api.post('/api/reservations', reservationData),
  updateReservation: (id, reservationData) => api.put(`/api/reservations/${id}`, reservationData),
  updateReservationStatus: (id, statusData) => api.put(`/api/reservations/${id}/status`, statusData),
  deleteReservation: (id) => api.delete(`/api/reservations/${id}`),
  cancelReservation: (id) => api.patch(`/api/reservations/${id}/cancel`),
  checkTimeConflict: (tableId, date, startTime, endTime, excludeReservationId) => 
    api.post('/api/reservations/check-conflict', { 
      MaBan: tableId, 
      NgayDat: date, 
      GioDat: startTime, 
      GioKetThuc: endTime, 
      excludeId: excludeReservationId 
    }),
  createMultiTableReservation: (reservationData) => api.post('/api/reservations/multi-table', reservationData),
  getAvailableTables: (params) => api.get('/api/reservations/available-tables', { params }),
  getTodayReservations: (params) => api.get('/api/reservations/today', { params }),
  getReservationStats: (params) => api.get('/api/reservations/stats', { params }),
};

// User API - Enhanced for comprehensive user management
export const userAPI = {
  // Get all users (employees + customers) - using test route temporarily
  getUsers: (params) => api.get('/api/users-test/test', { params }),
  getUser: (id) => api.get(`/api/users/${id}`),
  
  // Employee management
  getEmployees: (params) => api.get('/api/users/employees', { params }),
  getEmployee: (id) => api.get(`/api/users/employees/${id}`),
  updateEmployee: (id, employeeData) => api.put(`/api/users/employees/${id}`, employeeData),
  deleteEmployee: (id) => api.delete(`/api/users/employees/${id}`),
  
  // Customer management
  getCustomers: (params) => api.get('/api/users/customers', { params }),
  getCustomer: (id) => api.get(`/api/users/customers/${id}`),
  createCustomer: (customerData) => api.post('/api/users/customers', customerData),
  updateCustomer: (id, customerData) => api.put(`/api/users/customers/${id}`, customerData),
  deleteCustomer: (id) => api.delete(`/api/users/customers/${id}`),
  
  // Role and promotion management
  promoteToEmployee: (customerId, data) => api.post(`/api/users/promote/${customerId}`, data),
  updateUserRole: (employeeId, data) => api.put(`/api/users/employees/${employeeId}/role`, data),
  updateUserStatus: (userType, userId, statusData) => api.patch(`/api/users/${userType}/${userId}/status`, statusData),
  
  // Statistics - using test route temporarily
  getUserStats: () => api.get('/api/users-test/test-stats'),
  
  // Generic user operations (backward compatibility)
  createUser: (userData) => api.post('/api/users', userData),
  updateUser: (id, userData) => api.put(`/api/users/${id}`, userData),
  deleteUser: (userType, userId) => api.delete(`/api/users/${userType}/${userId}`),
};

// Billing API
export const billingAPI = {
  getBills: (params) => billingApi.get('/api/billing/test-orders', { params }),
  getBill: (id) => billingApi.get(`/api/billing/${id}`),
  createBill: (billData) => billingApi.post('/api/billing', billData),
  updateBill: (id, billData) => billingApi.put(`/api/billing/${id}`, billData),
  deleteBill: (id) => billingApi.delete(`/api/billing/${id}`),
  updatePaymentStatus: (id, paymentData) => billingApi.put(`/api/billing/${id}/payment`, paymentData),
  getBillingStats: () => billingApi.get('/api/billing/stats'),
  
  // Order management (DonHang schema)
  createOrder: (orderData) => billingApi.post('/api/billing', orderData),
  updateOrderStatus: (id, statusData) => billingApi.put(`/api/billing/${id}/payment`, statusData),
  deleteOrder: (id) => billingApi.delete(`/api/billing/${id}`),
  
  // Order items management (bán hàng)
  addItemToOrder: (orderId, itemData) => billingApi.post(`/api/billing/${orderId}/items`, itemData),
  getOrderItems: (orderId) => billingApi.get(`/api/billing/${orderId}/items`),
  updateOrderItem: (orderId, itemId, itemData) => billingApi.patch(`/api/billing/${orderId}/items/${itemId}`, itemData),
  removeOrderItem: (orderId, itemId) => billingApi.delete(`/api/billing/${orderId}/items/${itemId}`),
};


// Online Order API
export const onlineOrderAPI = {
  // Cart management
  getCart: (sessionId) => api.get(`/api/cart${sessionId ? `?sessionId=${sessionId}` : ''}`),
  addToCart: (cartData) => api.post('/api/cart', cartData),
  updateCartItem: (id, cartData) => api.put(`/api/cart/${id}`, cartData),
  removeFromCart: (id) => api.delete(`/api/cart/${id}`),
  clearCart: (sessionId) => api.delete(`/api/cart/clear${sessionId ? `?sessionId=${sessionId}` : ''}`),
  
  // Online orders
  getOnlineOrders: (params) => api.get('/api/online-orders', { params }),
  getOnlineOrder: (id) => api.get(`/api/online-orders/${id}`),
  createOnlineOrder: (orderData) => api.post('/api/online-orders', orderData),
  updateOnlineOrder: (id, orderData) => api.put(`/api/online-orders/${id}`, orderData),
  updateOrderStatus: (id, statusData) => api.put(`/api/online-orders/${id}/status`, statusData),
  cancelOnlineOrder: (id) => api.patch(`/api/online-orders/${id}/cancel`),
  getOrderStats: () => api.get('/api/online-orders/stats'),
  
  // Order tracking
  getOrderTracking: (orderId) => api.get(`/api/order-tracking/${orderId}`),
  updateOrderLocation: (orderId, locationData) => api.put(`/api/order-tracking/${orderId}/location`, locationData),
  addTrackingUpdate: (orderId, updateData) => api.post(`/api/order-tracking/${orderId}/update`, updateData),
};

// Voucher API
export const voucherAPI = {
  getVouchers: (params) => api.get('/api/vouchers', { params }),
  getVoucher: (id) => api.get(`/api/vouchers/${id}`),
  createVoucher: (voucherData) => api.post('/api/vouchers', voucherData),
  updateVoucher: (id, voucherData) => api.put(`/api/vouchers/${id}`, voucherData),
  deleteVoucher: (id) => api.delete(`/api/vouchers/${id}`),
  validateVoucher: (code, orderData) => api.post('/api/vouchers/validate', { code, ...orderData }),
  getAvailableVouchers: (customerType) => api.get(`/api/vouchers/available${customerType ? `?customerType=${customerType}` : ''}`),
  getVoucherStats: () => api.get('/api/vouchers/stats'),
  getVoucherUsage: (id) => api.get(`/api/vouchers/${id}/usage`),
};

// Health API
export const healthAPI = {
  getGatewayHealth: () => api.get('/health'),
  getServicesHealth: () => api.get('/health/services'),
  getServiceHealth: (serviceName) => api.get(`/health/services/${serviceName}`),
};

export default api;
