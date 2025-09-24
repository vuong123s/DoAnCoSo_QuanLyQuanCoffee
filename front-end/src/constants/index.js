// API Constants
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// App Constants
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Coffee Shop';

// Routes
export const ROUTES = {
  // Public Routes
  HOME: '/',
  MENU: '/menu',
  ABOUT: '/about',
  CONTACT: '/contact',
  RESERVATIONS: '/reservations',
  
  // Auth Routes
  LOGIN: '/login',
  REGISTER: '/register',
  
  // Customer Routes
  PROFILE: '/profile',
  CART: '/cart',
  ORDER_HISTORY: '/order-history',
  BOOK_TABLE: '/book-table',
  
  // Admin Routes
  ADMIN: '/admin',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_MENU: '/admin/menu',
  ADMIN_CATEGORIES: '/admin/categories',
  ADMIN_TABLES: '/admin/tables',
  ADMIN_RESERVATIONS: '/admin/reservations',
  ADMIN_ORDERS: '/admin/orders',
  ADMIN_USERS: '/admin/users',
  ADMIN_BILLING: '/admin/billing',
  ADMIN_ANALYTICS: '/admin/analytics',
};

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  STAFF: 'staff',
  CUSTOMER: 'customer',
};

// Order Status
export const ORDER_STATUS = {
  PENDING: 'Chờ xử lý',
  CONFIRMED: 'Đã xác nhận',
  PREPARING: 'Đang chuẩn bị',
  READY: 'Sẵn sàng',
  DELIVERED: 'Đã giao',
  CANCELLED: 'Đã hủy',
};

// Table Status
export const TABLE_STATUS = {
  AVAILABLE: 'Có sẵn',
  OCCUPIED: 'Đang sử dụng',
  RESERVED: 'Đã đặt',
  MAINTENANCE: 'Bảo trì',
};

// Reservation Status
export const RESERVATION_STATUS = {
  BOOKED: 'Đã đặt',
  CONFIRMED: 'Đã xác nhận',
  CANCELLED: 'Đã hủy',
  COMPLETED: 'Hoàn thành',
};

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: 'Chờ thanh toán',
  PAID: 'Đã thanh toán',
  FAILED: 'Thanh toán thất bại',
  REFUNDED: 'Đã hoàn tiền',
};

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  CART_DATA: 'cart_data',
  THEME: 'theme',
};
