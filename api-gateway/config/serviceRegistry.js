const axios = require('axios');

class ServiceRegistry {
  constructor() {
    this.services = {
      userService: {
        name: 'User Service',
        url: process.env.USER_SERVICE_URL || 'http://localhost:3001',
        healthPath: '/health'
      },
      menuService: {
        name: 'Menu Service',
        url: process.env.MENU_SERVICE_URL || 'http://localhost:3002',
        healthPath: '/health'
      },
      tableService: {
        name: 'Table Service',
        url: process.env.TABLE_SERVICE_URL || 'http://localhost:3003',
        healthPath: '/health'
      },
      billingService: {
        name: 'Billing Service',
        url: process.env.BILLING_SERVICE_URL || 'http://localhost:3004',
        healthPath: '/health'
      }
    };
  }

  getServices() {
    return this.services;
  }

  getService(serviceName) {
    return this.services[serviceName];
  }

  async checkServiceHealth(serviceName) {
    const service = this.services[serviceName];
    if (!service) {
      throw new Error(`Service ${serviceName} not found`);
    }

    try {
      const response = await axios.get(`${service.url}${service.healthPath}`, {
        timeout: 5000
      });
      
      return {
        name: service.name,
        status: 'healthy',
        url: service.url,
        responseTime: response.headers['x-response-time'] || 'N/A',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        name: service.name,
        status: 'unhealthy',
        url: service.url,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  async checkServicesHealth() {
    const healthChecks = [];
    
    for (const serviceName in this.services) {
      healthChecks.push(this.checkServiceHealth(serviceName));
    }

    const results = await Promise.allSettled(healthChecks);
    const healthStatus = {};

    results.forEach((result, index) => {
      const serviceName = Object.keys(this.services)[index];
      if (result.status === 'fulfilled') {
        healthStatus[serviceName] = result.value;
      } else {
        healthStatus[serviceName] = {
          name: this.services[serviceName].name,
          status: 'error',
          error: result.reason.message,
          timestamp: new Date().toISOString()
        };
      }
    });

    return healthStatus;
  }

  async getServiceUrl(serviceName) {
    const service = this.services[serviceName];
    if (!service) {
      throw new Error(`Service ${serviceName} not found`);
    }

    // In a production environment, this could implement service discovery
    // For now, we return the configured URL
    return service.url;
  }

  // Method to register a new service dynamically
  registerService(serviceName, config) {
    this.services[serviceName] = {
      name: config.name,
      url: config.url,
      healthPath: config.healthPath || '/health'
    };
  }

  // Method to unregister a service
  unregisterService(serviceName) {
    delete this.services[serviceName];
  }

  // Get all service names
  getServiceNames() {
    return Object.keys(this.services);
  }

  // Check if a service is registered
  isServiceRegistered(serviceName) {
    return serviceName in this.services;
  }
}

module.exports = new ServiceRegistry();
