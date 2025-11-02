const mysql = require('mysql2/promise');
const { Sequelize } = require('sequelize');
require('dotenv').config();

// Tạo connection pool (MySQL2)
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_NAME || 'QuanLyCafe',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true
});

// Tạo Sequelize instance
const sequelize = new Sequelize(
  process.env.DB_NAME || 'QuanLyCafe',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '123456',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Test connections
pool.getConnection()
  .then(connection => {
    console.log('✅ MySQL2 Pool connected successfully');
    connection.release();
  })
  .catch(err => {
    console.error('❌ MySQL2 connection failed:', err.message);
  });

sequelize.authenticate()
  .then(() => {
    console.log('✅ Sequelize connected successfully');
  })
  .catch(err => {
    console.error('❌ Sequelize connection failed:', err.message);
  });

module.exports = { pool, sequelize };
