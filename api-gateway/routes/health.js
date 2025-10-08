const express = require('express');
const router = express.Router();
const serviceRegistry = require('../config/serviceRegistry');

// Gateway health check
router.get('/', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'api-gateway',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Check all services health
router.get('/services', async (req, res) => {
  try {
    // Return mock healthy status for now
    const mockHealthStatus = {
      userService: { status: 'healthy', url: 'http://localhost:3001' },
      menuService: { status: 'healthy', url: 'http://localhost:3002' },
      tableService: { status: 'healthy', url: 'http://localhost:3003' },
      billingService: { status: 'healthy', url: 'http://localhost:3004' }
    };

    res.status(200).json({
      overall_status: 'healthy',
      gateway: {
        status: 'healthy',
        timestamp: new Date().toISOString()
      },
      services: mockHealthStatus
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      overall_status: 'error',
      error: 'Failed to check services health',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Check specific service health
router.get('/services/:serviceName', async (req, res) => {
  try {
    const { serviceName } = req.params;
    
    if (!serviceRegistry.isServiceRegistered(serviceName)) {
      return res.status(404).json({
        error: 'Service not found',
        available_services: serviceRegistry.getServiceNames()
      });
    }

    const healthStatus = await serviceRegistry.checkServiceHealth(serviceName);
    
    res.status(healthStatus.status === 'healthy' ? 200 : 503).json(healthStatus);
  } catch (error) {
    console.error(`Health check error for ${req.params.serviceName}:`, error);
    res.status(500).json({
      error: 'Failed to check service health',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Get service registry information
router.get('/registry', (req, res) => {
  const services = serviceRegistry.getServices();
  const serviceInfo = {};

  for (const [key, service] of Object.entries(services)) {
    serviceInfo[key] = {
      name: service.name,
      url: service.url,
      healthPath: service.healthPath
    };
  }

  res.json({
    services: serviceInfo,
    total_services: Object.keys(services).length,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
