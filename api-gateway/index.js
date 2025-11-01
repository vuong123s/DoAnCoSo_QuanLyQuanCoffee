const express = require('express');
const cors = require('cors');
const axios = require('axios');
const helmet = require('helmet');
const { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config();
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');

const serviceRegistry = require('./config/serviceRegistry');
const healthCheck = require('./routes/health');
const authMiddleware = require('./middleware/auth');
const mediaRoutes = require('./routes/media');
const analyticsRoutes = require('./routes/analytics');

const app = express();
const PORT = process.env.PORT || 3000;

// Disable all security middleware for development
// app.use(helmet({
//   contentSecurityPolicy: false,
//   crossOriginEmbedderPolicy: false
// }));

// Simple CORS configuration - Allow everything for development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Request logging
app.use(morgan('dev'));

// Debug middleware - log all requests
app.use((req, res, next) => {
  console.log(`\n📥 [REQUEST] ${req.method} ${req.originalUrl}`);
  console.log(`   Headers: ${JSON.stringify(req.headers, null, 2)}`);
  next();
});

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check routes (before rate limiting)
app.use('/health', healthCheck);

// Media routes (static file serving và upload)
app.use('/uploads', express.static('uploads')); // Serve static files

app.use('/api/media', mediaRoutes);

// Analytics routes (phân tích doanh thu)
app.use('/api/analytics', analyticsRoutes);

// Rate limiting (after health check)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});

// Apply rate limiting only to specific routes, not all /api
app.use('/api/auth', limiter);
app.use('/api/users', limiter);

// Get services
const services = serviceRegistry.getServices();

// Optimized proxy function
const createServiceProxy = (serviceName, port, requireAuth = false) => {
  return async (req, res, next) => {
    console.log(`🎯 ${serviceName} route matched: ${req.method} ${req.originalUrl}`);
    
    try {
      const axios = require('axios');
      // Remove /api prefix for service routing
      const servicePath = req.originalUrl.replace(/^\/api/, '');
      const targetUrl = `http://localhost:${port}/api${servicePath}`;
      console.log(`🔄 [${serviceName}] Proxy: ${req.method} ${targetUrl}`);
      
      const headers = { 
        ...req.headers,
        host: `localhost:${port}`
      };
      
      // Add user context for authenticated routes
      if (requireAuth && req.user) {
        headers['X-User-Id'] = req.user.id;
        headers['X-User-Role'] = req.user.role;
      }
      
      const response = await axios({
        method: req.method,
        url: targetUrl,
        data: req.body,
        params: req.query,
        headers,
        timeout: 10000
      });
      
      console.log(`✅ [${serviceName}] Response: ${response.status}`);
      res.status(response.status).json(response.data);
    } catch (error) {
      console.error(`❌ [${serviceName}] Error:`, error.message);
      if (error.response) {
        res.status(error.response.status).json(error.response.data);
      } else {
        res.status(503).json({ 
          error: `${serviceName} unavailable`,
          message: `Không thể kết nối đến dịch vụ ${serviceName.toLowerCase()}`
        });
      }
    }
  };
};

// Authentication middleware shortcuts
const { authenticateToken, requireStaff, requireAdmin, requireManager } = authMiddleware;

// ======================= PROXY ROUTES =======================

console.log('🔧 Setting up proxy routes...');

// Menu Service
console.log('🔧 Setting up Menu Service proxy...');
app.use('/api/menu', createServiceProxy('Menu Service', 3002));
app.use('/api/categories', createServiceProxy('Menu Service', 3002));

// User Service
console.log('🔧 Setting up User Service proxy...');
app.use('/api/auth', createServiceProxy('User Service', 3001)); // Auth routes (login/register) - no auth required

// Temporary bypass for testing - REMOVE IN PRODUCTION
app.get('/api/users-test/test', async (req, res) => {
  try {
    const axios = require('axios');
    const response = await axios.get('http://localhost:3001/api/users/test');
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users', message: error.message });
  }
});

app.get('/api/users-test/test-stats', async (req, res) => {
  try {
    const axios = require('axios');
    const response = await axios.get('http://localhost:3001/api/users/test-stats');
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user stats', message: error.message });
  }
});

app.use('/api/users', ...requireStaff, createServiceProxy('User Service', 3001, true)); // User management requires staff auth

// Table Service
console.log('🔧 Setting up Table Service proxy...');
app.use('/api/tables', createServiceProxy('Table Service', 3003));
app.use('/api/ban', createServiceProxy('Table Service', 3003)); // Vietnamese route
app.use('/api/reservations', createServiceProxy('Table Service', 3003));
app.use('/api/dat-ban', createServiceProxy('Table Service', 3003)); // Vietnamese route
app.use('/api/group-reservations', createServiceProxy('Table Service', 3003)); // Group reservations
app.use('/api/areas', createServiceProxy('Table Service', 3003));
app.use('/api/khu-vuc', createServiceProxy('Table Service', 3003)); // Vietnamese route

// Billing Service (staff access required)
console.log('Setting up Billing Service proxy...');

// Temporary test routes without auth (REMOVE IN PRODUCTION)
app.get('/api/billing-test', (req, res) => {
  res.json({
    success: true,
    message: 'Billing test route working!',
    note: 'This bypasses authentication for testing',
    timestamp: new Date()
  });
});


app.use('/api/billing', ...requireStaff, createServiceProxy('Billing Service', 3004, true));
app.use('/api/revenue', ...requireStaff, createServiceProxy('Billing Service', 3004, true)); // Revenue analytics

// Online Order Service (handled by Billing Service)
console.log('🔧 Setting up Online Order Service proxy...');
app.use('/api/online-orders', createServiceProxy('Billing Service', 3004));

// Voucher Service (now handled by Billing Service)
console.log('🔧 Setting up Voucher Service proxy...');
app.use('/api/vouchers', createServiceProxy('Billing Service', 3004));

// Inventory Service (staff access required)
console.log('🔧 Setting up Inventory Service proxy...');
app.use('/api/inventory', ...requireStaff, createServiceProxy('Inventory Service', 3007, true));

console.log('✅ All proxy routes configured!');

// ======================= OTHER ROUTES =======================

// Test route
app.get('/test', (req, res) => {
  res.json({ 
    message: 'API Gateway is working!', 
    timestamp: new Date(),
    services: Object.keys(services).map(key => ({
      name: services[key].name,
      url: services[key].url
    }))
  });
});

// Test auth route
app.get('/test-auth', authenticateToken, (req, res) => {
  res.json({
    message: 'Authentication working!',
    user: req.user,
    timestamp: new Date()
  });
});

// Test staff auth route
app.get('/test-staff', ...requireStaff, (req, res) => {
  res.json({
    message: 'Staff authentication working!',
    user: req.user,
    timestamp: new Date()
  });
});


// API Documentation
app.get('/api', (req, res) => {
  res.json({
    name: 'Coffee Shop API Gateway',
    version: '1.0.0',
    services: {
      userService: { 
        url: services.userService.url, 
        routes: ['/api/auth', '/api/users (staff auth required)'] 
      },
      menuService: { 
        url: services.menuService.url, 
        routes: ['/api/menu', '/api/categories'] 
      },
      tableService: { 
        url: services.tableService.url, 
        routes: ['/api/tables', '/api/ban', '/api/reservations', '/api/dat-ban', '/api/group-reservations', '/api/dat-ban-nhom', '/api/areas', '/api/khu-vuc'] 
      },
      billingService: { 
        url: services.billingService.url, 
        routes: ['/api/billing (staff auth)', '/api/revenue (staff auth)', '/api/online-orders'] 
      },
      voucherService: { 
        url: services.voucherService.url, 
        routes: ['/api/vouchers'] 
      },
      inventoryService: { 
        url: services.inventoryService.url, 
        routes: ['/api/inventory (staff auth required)'] 
      }
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Gateway Error:', err.stack);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// 404 handler - MUST BE LAST
app.use((req, res) => {
  console.log(`❌ 404: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    error: 'Route not found',
    message: `The requested endpoint ${req.originalUrl} does not exist`
  });
});

// Start server
const startServer = async () => {
  try {
    console.log('🚀 Starting API Gateway...');
    
    app.listen(PORT, () => {
      console.log(`✅ API Gateway running on port ${PORT}`);
      console.log(`📖 Documentation: http://localhost:${PORT}/api`);
      console.log(`🔍 Test endpoint: http://localhost:${PORT}/test`);
      console.log(`💚 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start API Gateway:', error);
    process.exit(1);
  }
};

startServer();
