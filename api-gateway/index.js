const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { createProxyMiddleware } = require('http-proxy-middleware');
const authMiddleware = require('./middleware/auth');
const serviceRegistry = require('./config/serviceRegistry');
const healthCheck = require('./routes/health');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Request logging
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.RATE_LIMIT_MAX || 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', limiter);

// Health check routes
app.use('/health', healthCheck);

// Service proxy configurations
const services = serviceRegistry.getServices();

// User Service Routes
app.use('/api/auth', createProxyMiddleware({
  target: services.userService.url,
  changeOrigin: true,
  pathRewrite: {
    '^/api/auth': '/api/auth'
  },
  onError: (err, req, res) => {
    console.error('User Service Proxy Error:', err.message);
    res.status(503).json({
      error: 'User service unavailable',
      message: 'Please try again later'
    });
  }
}));

app.use('/api/users', authMiddleware.authenticateToken, createProxyMiddleware({
  target: services.userService.url,
  changeOrigin: true,
  pathRewrite: {
    '^/api/users': '/api/users'
  },
  onProxyReq: (proxyReq, req, res) => {
    // Forward user information to the service
    if (req.user) {
      proxyReq.setHeader('X-User-Id', req.user.id);
      proxyReq.setHeader('X-User-Role', req.user.role);
    }
  },
  onError: (err, req, res) => {
    console.error('User Service Proxy Error:', err.message);
    res.status(503).json({
      error: 'User service unavailable',
      message: 'Please try again later'
    });
  }
}));

// Menu Service Routes
app.use('/api/menu', createProxyMiddleware({
  target: services.menuService.url,
  changeOrigin: true,
  pathRewrite: {
    '^/api/menu': '/api/menu'
  },
  onError: (err, req, res) => {
    console.error('Menu Service Proxy Error:', err.message);
    res.status(503).json({
      error: 'Menu service unavailable',
      message: 'Please try again later'
    });
  }
}));

app.use('/api/categories', createProxyMiddleware({
  target: services.menuService.url,
  changeOrigin: true,
  pathRewrite: {
    '^/api/categories': '/api/categories'
  },
  onError: (err, req, res) => {
    console.error('Menu Service Proxy Error:', err.message);
    res.status(503).json({
      error: 'Menu service unavailable',
      message: 'Please try again later'
    });
  }
}));

// Table Service Routes
app.use('/api/tables', createProxyMiddleware({
  target: services.tableService.url,
  changeOrigin: true,
  pathRewrite: {
    '^/api/tables': '/api/tables'
  },
  onError: (err, req, res) => {
    console.error('Table Service Proxy Error:', err.message);
    res.status(503).json({
      error: 'Table service unavailable',
      message: 'Please try again later'
    });
  }
}));

app.use('/api/reservations', createProxyMiddleware({
  target: services.tableService.url,
  changeOrigin: true,
  pathRewrite: {
    '^/api/reservations': '/api/reservations'
  },
  onError: (err, req, res) => {
    console.error('Table Service Proxy Error:', err.message);
    res.status(503).json({
      error: 'Table service unavailable',
      message: 'Please try again later'
    });
  }
}));

// Billing Service Routes
app.use('/api/billing', authMiddleware.requireStaff, createProxyMiddleware({
  target: services.billingService.url,
  changeOrigin: true,
  pathRewrite: {
    '^/api/billing': '/api/billing'
  },
  onProxyReq: (proxyReq, req, res) => {
    // Forward user information to the service
    if (req.user) {
      proxyReq.setHeader('X-User-Id', req.user.id);
      proxyReq.setHeader('X-User-Role', req.user.role);
    }
  },
  onError: (err, req, res) => {
    console.error('Billing Service Proxy Error:', err.message);
    res.status(503).json({
      error: 'Billing service unavailable',
      message: 'Please try again later'
    });
  }
}));

// API Documentation route
app.get('/api', (req, res) => {
  res.json({
    name: 'Coffee Shop API Gateway',
    version: '1.0.0',
    description: 'API Gateway for Coffee Shop Microservices',
    services: {
      userService: {
        baseUrl: '/api/auth, /api/users',
        description: 'User authentication and management'
      },
      menuService: {
        baseUrl: '/api/menu, /api/categories',
        description: 'Menu items and categories management'
      },
      tableService: {
        baseUrl: '/api/tables, /api/reservations',
        description: 'Table and reservation management'
      },
      billingService: {
        baseUrl: '/api/billing',
        description: 'Billing and payment management'
      }
    },
    endpoints: {
      health: '/health',
      documentation: '/api'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Gateway Error:', err.stack);
  res.status(500).json({
    error: 'Internal server error',
    message: 'Something went wrong in the API Gateway'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `The requested endpoint ${req.originalUrl} does not exist`
  });
});

// Start server
const startServer = async () => {
  try {
    // Check service health before starting
    await serviceRegistry.checkServicesHealth();
    
    app.listen(PORT, () => {
      console.log(`API Gateway is running on port ${PORT}`);
      console.log(`API Documentation available at http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('Failed to start API Gateway:', error);
    process.exit(1);
  }
};

startServer();
