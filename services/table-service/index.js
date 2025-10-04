const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { sequelize } = require('./config/database');
const tableRoutes = require('./routes/tableRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const khuVucRoutes = require('./routes/khuVucRoutes');
const autoCancelRoutes = require('./routes/autoCancelRoutes');
const autoCancelJob = require('./jobs/autoCancelJob');

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'table-service',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: 'connected'
  });
});

// Routes
app.use('/api/tables', tableRoutes);
app.use('/api/ban', tableRoutes); // Vietnamese route for tables
app.use('/api/reservations', reservationRoutes);
app.use('/api/dat-ban', reservationRoutes); // Vietnamese route for reservations
app.use('/api/areas', khuVucRoutes);
app.use('/api/khu-vuc', khuVucRoutes); // Vietnamese route for areas
app.use('/api/auto-cancel', autoCancelRoutes); // Auto cancel expired reservations

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    await sequelize.sync({ alter: false });
    console.log('Database synchronized successfully.');
    
    // Khởi động Auto Cancel Job
    autoCancelJob.start();
    
    app.listen(PORT, () => {
      console.log(`Table Service is running on port ${PORT}`);
      console.log('🤖 Auto Cancel Job is active');
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
};

startServer();
