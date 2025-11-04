/**
 * Role-Based Access Control (RBAC) Utilities
 * Quản lý phân quyền người dùng
 */

// Vietnamese role names from database
export const ROLES_VI = {
  ADMIN: 'Admin',
  MANAGER: 'Quản lý',
  STAFF: 'Nhân viên',
  CUSTOMER: 'Khách hàng'
};

// English role names for compatibility
export const ROLES_EN = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  STAFF: 'staff',
  CUSTOMER: 'customer'
};

// Role hierarchy levels (higher = more permissions)
export const ROLE_LEVELS = {
  [ROLES_VI.CUSTOMER]: 1,
  [ROLES_EN.CUSTOMER]: 1,
  [ROLES_VI.STAFF]: 2,
  [ROLES_EN.STAFF]: 2,
  [ROLES_VI.MANAGER]: 3,
  [ROLES_EN.MANAGER]: 3,
  [ROLES_VI.ADMIN]: 4,
  [ROLES_EN.ADMIN]: 4
};

// All valid roles
export const ALL_ROLES = [
  ...Object.values(ROLES_VI),
  ...Object.values(ROLES_EN)
];

/**
 * Normalize role to Vietnamese format
 * @param {string} role - Role name in any format
 * @returns {string} Normalized Vietnamese role name
 */
export const normalizeRole = (role) => {
  if (!role) return null;
  
  const roleLower = role.toLowerCase();
  
  if (roleLower === 'admin') return ROLES_VI.ADMIN;
  if (roleLower === 'manager' || roleLower === 'quản lý') return ROLES_VI.MANAGER;
  if (roleLower === 'staff' || roleLower === 'nhân viên') return ROLES_VI.STAFF;
  if (roleLower === 'customer' || roleLower === 'khách hàng') return ROLES_VI.CUSTOMER;
  
  return role; // Return as-is if unknown
};

/**
 * Check if user has one of the allowed roles
 * @param {string} userRole - User's current role
 * @param {string[]} allowedRoles - Array of allowed role names (Vietnamese or English)
 * @returns {boolean}
 */
export const hasRole = (userRole, allowedRoles) => {
  if (!userRole || !allowedRoles || allowedRoles.length === 0) return false;
  
  const normalizedUserRole = normalizeRole(userRole);
  const normalizedAllowedRoles = allowedRoles.map(r => normalizeRole(r));
  
  return normalizedAllowedRoles.includes(normalizedUserRole);
};

/**
 * Check if user has minimum required role level
 * @param {string} userRole - User's current role
 * @param {string} minimumRole - Minimum required role
 * @returns {boolean}
 */
export const hasMinimumRole = (userRole, minimumRole) => {
  const userLevel = ROLE_LEVELS[normalizeRole(userRole)] || 0;
  const minimumLevel = ROLE_LEVELS[normalizeRole(minimumRole)] || 0;
  
  return userLevel >= minimumLevel;
};

/**
 * Check if user is admin
 * @param {string} role - User's role
 * @returns {boolean}
 */
export const isAdmin = (role) => {
  return normalizeRole(role) === ROLES_VI.ADMIN;
};

/**
 * Check if user is manager or higher
 * @param {string} role - User's role
 * @returns {boolean}
 */
export const isManager = (role) => {
  return hasMinimumRole(role, ROLES_VI.MANAGER);
};

/**
 * Check if user is staff or higher
 * @param {string} role - User's role
 * @returns {boolean}
 */
export const isStaff = (role) => {
  return hasMinimumRole(role, ROLES_VI.STAFF);
};

/**
 * Get user role display name in Vietnamese
 * @param {string} role - User's role
 * @returns {string}
 */
export const getRoleDisplayName = (role) => {
  const normalized = normalizeRole(role);
  return normalized || 'Không xác định';
};

/**
 * Get role badge color
 * @param {string} role - User's role
 * @returns {object} Tailwind CSS classes for badge
 */
export const getRoleBadgeColor = (role) => {
  const normalized = normalizeRole(role);
  
  switch (normalized) {
    case ROLES_VI.ADMIN:
      return { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' };
    case ROLES_VI.MANAGER:
      return { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300' };
    case ROLES_VI.STAFF:
      return { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' };
    case ROLES_VI.CUSTOMER:
      return { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' };
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-300' };
  }
};

// Permission presets for common features
export const PERMISSIONS = {
  // Dashboard
  VIEW_DASHBOARD: [ROLES_VI.ADMIN, ROLES_VI.MANAGER, ROLES_VI.STAFF],
  
  // Menu Management
  MANAGE_MENU: [ROLES_VI.ADMIN, ROLES_VI.MANAGER],
  VIEW_MENU: [ROLES_VI.ADMIN, ROLES_VI.MANAGER, ROLES_VI.STAFF],
  
  // Table Management
  MANAGE_TABLES: [ROLES_VI.ADMIN, ROLES_VI.MANAGER],
  VIEW_TABLES: [ROLES_VI.ADMIN, ROLES_VI.MANAGER, ROLES_VI.STAFF],
  
  // Reservations
  MANAGE_RESERVATIONS: [ROLES_VI.ADMIN, ROLES_VI.MANAGER, ROLES_VI.STAFF],
  
  // Orders
  MANAGE_ORDERS: [ROLES_VI.ADMIN, ROLES_VI.MANAGER, ROLES_VI.STAFF],
  VIEW_ALL_ORDERS: [ROLES_VI.ADMIN, ROLES_VI.MANAGER],
  
  // POS/Sales
  USE_POS: [ROLES_VI.ADMIN, ROLES_VI.MANAGER, ROLES_VI.STAFF],
  
  // Users
  MANAGE_USERS: [ROLES_VI.ADMIN],
  VIEW_USERS: [ROLES_VI.ADMIN, ROLES_VI.MANAGER],
  
  // Inventory
  MANAGE_INVENTORY: [ROLES_VI.ADMIN, ROLES_VI.MANAGER],
  VIEW_INVENTORY: [ROLES_VI.ADMIN, ROLES_VI.MANAGER, ROLES_VI.STAFF],
  
  // Schedules
  MANAGE_SCHEDULES: [ROLES_VI.ADMIN, ROLES_VI.MANAGER],
  VIEW_SCHEDULES: [ROLES_VI.ADMIN, ROLES_VI.MANAGER, ROLES_VI.STAFF],
  
  // Analytics
  VIEW_ANALYTICS: [ROLES_VI.ADMIN, ROLES_VI.MANAGER],
  
  // Online Orders
  MANAGE_ONLINE_ORDERS: [ROLES_VI.ADMIN, ROLES_VI.MANAGER, ROLES_VI.STAFF],
};

/**
 * Check if user has permission
 * @param {string} userRole - User's current role
 * @param {string} permission - Permission key from PERMISSIONS
 * @returns {boolean}
 */
export const hasPermission = (userRole, permission) => {
  const allowedRoles = PERMISSIONS[permission];
  if (!allowedRoles) return false;
  
  return hasRole(userRole, allowedRoles);
};
