import React from 'react';
import { useAuthStore } from '../../../app/stores/authStore';
import { hasRole, hasPermission, isAdmin, isManager, isStaff } from '../../../shared/utils/roles';

/**
 * RoleGuard Component
 * Conditionally render children based on user role/permission
 * 
 * Usage:
 * <RoleGuard allowedRoles={['Admin', 'Quản lý']}>
 *   <AdminButton />
 * </RoleGuard>
 * 
 * Or with permission:
 * <RoleGuard permission="MANAGE_USERS">
 *   <UserManagementSection />
 * </RoleGuard>
 */
const RoleGuard = ({ 
  children, 
  allowedRoles = [], 
  permission = null,
  requireAdmin = false,
  requireManager = false,
  requireStaff = false,
  fallback = null,
  invert = false // If true, show when user DOESN'T have permission
}) => {
  const { user } = useAuthStore();
  
  if (!user) {
    return invert ? children : fallback;
  }

  const userRole = user.ChucVu || user.role || user.chucVu;
  let hasAccess = false;

  // Check specific role requirements
  if (requireAdmin) {
    hasAccess = isAdmin(userRole);
  } else if (requireManager) {
    hasAccess = isManager(userRole);
  } else if (requireStaff) {
    hasAccess = isStaff(userRole);
  } 
  // Check permission if specified
  else if (permission) {
    hasAccess = hasPermission(userRole, permission);
  } 
  // Check allowed roles
  else if (allowedRoles.length > 0) {
    hasAccess = hasRole(userRole, allowedRoles);
  } 
  // Default to true if no restrictions specified
  else {
    hasAccess = true;
  }

  // Invert logic if specified
  if (invert) {
    hasAccess = !hasAccess;
  }

  return hasAccess ? children : fallback;
};

export default RoleGuard;
