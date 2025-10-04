/**
 * Utility functions for handling authentication redirects
 */

/**
 * Alternative redirect method using window.location.replace for immediate redirect
 * @param {Object} user - User object with role property
 * @param {Object} options - Additional options
 */
export const immediateRedirectAfterAuth = (user, options = {}) => {
  const { from = null } = options;
  
  if (!user || !user.role) {
    console.warn('No user or role found, redirecting to home');
    window.location.replace('/');
    return;
  }

  console.log('Immediate redirecting user based on role:', user.role);

  let targetPath = '/';

  // If there's a specific "from" location and user has access, redirect there
  if (from && isAuthorizedForPath(user.role, from)) {
    targetPath = from;
    console.log(`Redirecting to original destination: ${from}`);
  } else {
    // Default role-based redirects
    switch (user.role) {
      case 'customer':
        targetPath = '/';
        console.log('Customer redirected to home page');
        break;
      
      case 'admin':
      case 'manager':
      case 'staff':
        targetPath = '/admin';
        console.log(`${user.role} redirected to admin dashboard`);
        break;
      
      default:
        console.warn('Unknown role:', user.role, 'redirecting to home');
        targetPath = '/';
        break;
    }
  }

  console.log('🚀 Immediate redirect to:', targetPath);
  window.location.replace(targetPath);
};

/**
 * Redirect user based on their role after successful authentication
 * @param {Object} user - User object with role property
 * @param {Function} navigate - React Router navigate function (optional)
 * @param {Object} options - Additional options
 */
export const redirectAfterAuth = (user, navigate = null, options = {}) => {
  const { replace = true, from = null, forceReload = true } = options;
  
  if (!user || !user.role) {
    console.warn('No user or role found, redirecting to home');
    if (forceReload) {
      window.location.href = '/';
    } else if (navigate) {
      navigate('/', { replace });
    }
    return;
  }

  console.log('Redirecting user based on role:', user.role);

  let targetPath = '/';

  // If there's a specific "from" location and user has access, redirect there
  if (from && isAuthorizedForPath(user.role, from)) {
    targetPath = from;
    console.log(`Redirecting to original destination: ${from}`);
  } else {
    // Default role-based redirects
    switch (user.role) {
      case 'customer':
        targetPath = '/';
        console.log('Customer redirected to home page');
        break;
      
      case 'admin':
      case 'manager':
      case 'staff':
        targetPath = '/admin';
        console.log(`${user.role} redirected to admin dashboard`);
        break;
      
      default:
        console.warn('Unknown role:', user.role, 'redirecting to home');
        targetPath = '/';
        break;
    }
  }

  // Use window.location for reliable redirect
  if (forceReload) {
    console.log('🔄 Force redirecting to:', targetPath);
    // Small delay to ensure auth state is updated
    setTimeout(() => {
      window.location.href = targetPath;
    }, 100);
  } else if (navigate) {
    console.log('🔄 Navigate redirecting to:', targetPath);
    // Small delay for React state updates
    setTimeout(() => {
      navigate(targetPath, { replace });
    }, 100);
  }
};

/**
 * Check if user role is authorized for a specific path
 * @param {string} role - User role
 * @param {string} path - Path to check
 * @returns {boolean} - Whether user is authorized
 */
export const isAuthorizedForPath = (role, path) => {
  // Admin paths require staff+ roles
  if (path.startsWith('/admin')) {
    return ['admin', 'manager', 'staff'].includes(role);
  }
  
  // Customer paths are accessible to all
  if (path.startsWith('/menu') || path === '/') {
    return true;
  }
  
  // Default: allow access
  return true;
};

/**
 * Get default route for user role
 * @param {string} role - User role
 * @returns {string} - Default route path
 */
export const getDefaultRouteForRole = (role) => {
  switch (role) {
    case 'customer':
      return '/';
    case 'admin':
    case 'manager':
    case 'staff':
      return '/admin';
    default:
      return '/';
  }
};

/**
 * Check if user should be redirected from current path
 * @param {Object} user - User object
 * @param {string} currentPath - Current path
 * @returns {string|null} - Redirect path or null if no redirect needed
 */
export const shouldRedirectFromPath = (user, currentPath) => {
  if (!user) return null;
  
  // If customer is on admin pages, redirect to home
  if (user.role === 'customer' && currentPath.startsWith('/admin')) {
    return '/';
  }
  
  // If staff+ is on auth pages while authenticated, redirect to admin
  if (['admin', 'manager', 'staff'].includes(user.role) && currentPath.startsWith('/auth')) {
    return '/admin';
  }
  
  // If customer is on auth pages while authenticated, redirect to home
  if (user.role === 'customer' && currentPath.startsWith('/auth')) {
    return '/';
  }
  
  return null;
};
