// Utility Functions

// Format currency to Vietnamese Dong
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

// Format date to Vietnamese format
export const formatDate = (date) => {
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(date));
};

// Format datetime to Vietnamese format
export const formatDateTime = (date) => {
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

// Validate email
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone number (Vietnamese format)
export const isValidPhone = (phone) => {
  const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
  return phoneRegex.test(phone);
};

// Generate random ID
export const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

// Debounce function
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

// Capitalize first letter
export const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Truncate text
export const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength) + '...';
};

// Get status color
export const getStatusColor = (status) => {
  const statusColors = {
    // Order Status
    'Chờ xử lý': 'bg-yellow-100 text-yellow-800',
    'Đã xác nhận': 'bg-blue-100 text-blue-800',
    'Đang chuẩn bị': 'bg-orange-100 text-orange-800',
    'Sẵn sàng': 'bg-purple-100 text-purple-800',
    'Đã giao': 'bg-green-100 text-green-800',
    'Đã hủy': 'bg-red-100 text-red-800',
    
    // Table Status
    'Trống': 'bg-green-100 text-green-800',
    'Đang sử dụng': 'bg-red-100 text-red-800',
    'Đã đặt': 'bg-yellow-100 text-yellow-800',
    'Bảo trì': 'bg-gray-100 text-gray-800',
    
    // Payment Status
    'Chờ thanh toán': 'bg-yellow-100 text-yellow-800',
    'Đã thanh toán': 'bg-green-100 text-green-800',
    'Thanh toán thất bại': 'bg-red-100 text-red-800',
    'Đã hoàn tiền': 'bg-blue-100 text-blue-800',
  };
  
  return statusColors[status] || 'bg-gray-100 text-gray-800';
};

// Local Storage helpers
export const storage = {
  get: (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error getting from localStorage:', error);
      return null;
    }
  },
  
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error setting to localStorage:', error);
    }
  },
  
  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  },
  
  clear: () => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  },
};
