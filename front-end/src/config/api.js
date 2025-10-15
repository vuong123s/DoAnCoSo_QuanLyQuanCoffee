// API Configuration
const API_CONFIG = {
  // API Gateway URL
  GATEWAY_URL: process.env.REACT_APP_API_GATEWAY_URL || 'http://localhost:3000',
  
  // Service URLs (nếu cần gọi trực tiếp)
  SERVICES: {
    MENU: process.env.REACT_APP_MENU_SERVICE_URL || 'http://localhost:3001',
    AUTH: process.env.REACT_APP_AUTH_SERVICE_URL || 'http://localhost:3002',
    ORDER: process.env.REACT_APP_ORDER_SERVICE_URL || 'http://localhost:3003',
  },
  
  // API Endpoints
  ENDPOINTS: {
    // Media endpoints
    MEDIA_UPLOAD: '/api/media/upload',
    MEDIA_UPLOAD_MULTIPLE: '/api/media/upload-multiple',
    MEDIA_FILES: '/api/media/files',
    MEDIA_DELETE: '/api/media/files',
    MEDIA_INFO: '/api/media/info',
    
    // Menu endpoints
    MENU_ITEMS: '/api/menu',
    MENU_CATEGORIES: '/api/categories',
    
    // Auth endpoints
    AUTH_LOGIN: '/api/auth/login',
    AUTH_REGISTER: '/api/auth/register',
    AUTH_LOGOUT: '/api/auth/logout',
  }
};

// Helper functions
export const getApiUrl = (endpoint) => {
  return `${API_CONFIG.GATEWAY_URL}${endpoint}`;
};

export const getMediaUploadUrl = () => {
  return getApiUrl(API_CONFIG.ENDPOINTS.MEDIA_UPLOAD);
};

export const getMediaUrl = (filename) => {
  return `${API_CONFIG.GATEWAY_URL}/uploads/${filename}`;
};

export default API_CONFIG;
