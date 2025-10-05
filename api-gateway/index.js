const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');

const serviceRegistry = require('./config/serviceRegistry');
const healthCheck = require('./routes/health');
const authMiddleware = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware - disable CSP for development
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

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
        timeout: 10000,
        validateStatus: (status) => status >= 200 && status < 500
      });
      
      console.log(`✅ [${serviceName}] Response: ${response.status}`);
      
      // Handle 304 Not Modified
      if (response.status === 304) {
        return res.status(304).end();
      }
      
      // Forward response headers
      Object.keys(response.headers).forEach(key => {
        if (key !== 'content-encoding' && key !== 'transfer-encoding') {
          res.setHeader(key, response.headers[key]);
        }
      });
      
      res.status(response.status).json(response.data);
      
    } catch (error) {
      console.error(`❌ [${serviceName}] Error:`, error.message);
      if (error.response && error.response.status < 500) {
        res.status(error.response.status).json(error.response.data || { error: 'Client error' });
      } else {
        res.status(503).json({
          error: `${serviceName} unavailable`,
          message: error.message
        });
      }
    }
  };
};

// ======================= PROXY ROUTES =======================

console.log('🔧 Setting up proxy routes...');

// Menu Service
console.log('🔧 Setting up Menu Service proxy...');
app.use('/api/menu', createServiceProxy('Menu Service', 3002));
app.use('/api/categories', createServiceProxy('Menu Service', 3002));

// User Service
console.log('🔧 Setting up User Service proxy...');
app.use('/api/auth', createServiceProxy('User Service', 3001)); // Auth routes (login/register) - no auth required
app.use('/api/users', authMiddleware.authenticateToken, createServiceProxy('User Service', 3001, true));

// Table Service
console.log('🔧 Setting up Table Service proxy...');
app.use('/api/tables', createServiceProxy('Table Service', 3003));
app.use('/api/ban', createServiceProxy('Table Service', 3003)); // Vietnamese route
app.use('/api/reservations', createServiceProxy('Table Service', 3003));
app.use('/api/dat-ban', createServiceProxy('Table Service', 3003)); // Vietnamese route
app.use('/api/areas', createServiceProxy('Table Service', 3003));
app.use('/api/khu-vuc', createServiceProxy('Table Service', 3003)); // Vietnamese route
app.use('/api/auto-cancel', createServiceProxy('Table Service', 3003)); // Auto cancel expired reservations for areas

// Billing Service
console.log('🔧 Setting up Billing Service proxy...');
app.use('/api/billing', authMiddleware.requireStaff, createServiceProxy('Billing Service', 3004, true));
console.log('🔧 Setting up Online Order Service proxy...');
app.use('/api/cart', createServiceProxy('Online Order Service', 3005));
app.use('/api/online-orders', createServiceProxy('Online Order Service', 3005));
app.use('/api/order-tracking', createServiceProxy('Online Order Service', 3005));

// Voucher Service
console.log('🔧 Setting up Voucher Service proxy...');
app.use('/api/vouchers', createServiceProxy('Voucher Service', 3006));

// Inventory Service
console.log('🔧 Setting up Inventory Service proxy...');
app.use('/api/inventory', authMiddleware.requireStaff, createServiceProxy('Inventory Service', 3007, true));

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


// API Documentation
app.get('/api', (req, res) => {
  res.json({
    name: 'Coffee Shop API Gateway',
    version: '1.0.0',
    services: {
      userService: { 
        url: services.userService.url, 
        routes: ['/api/auth', '/api/users'] 
      },
      menuService: { 
        url: services.menuService.url, 
        routes: ['/api/menu', '/api/categories'] 
      },
      tableService: { 
        url: services.tableService.url, 
        routes: ['/api/tables', '/api/ban', '/api/reservations', '/api/dat-ban', '/api/areas', '/api/khu-vuc', '/api/auto-cancel'] 
      },
      billingService: { 
        url: services.billingService.url, 
        routes: ['/api/billing'] 
      },
      onlineOrderService: { 
        url: services.onlineOrderService.url, 
        routes: ['/api/cart', '/api/online-orders', '/api/order-tracking'] 
      },
      voucherService: { 
        url: services.voucherService.url, 
        routes: ['/api/vouchers'] 
      },
      inventoryService: { 
        url: services.inventoryService.url, 
        routes: ['/api/inventory'] 
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
