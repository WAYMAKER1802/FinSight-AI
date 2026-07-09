/**
 * Database Configuration
 * ─────────────────────
 * MySQL connection with Sequelize, auto-sync, and connection management.
 */

'use strict';

const { Sequelize } = require('sequelize');
const logger = require('./logger');

const sequelize = new Sequelize('investiq_ai', 'root', 'Varnika#02', {
  host: '127.0.0.1',
  port: 3306,
  dialect: 'mysql',
  logging: (msg) => logger.debug(msg),
});

/**
 * Connect to MySQL and synchronize models.
 */
const connectDB = async () => {
  try {
    // Create DB if not exists
    const mysql = require('mysql2/promise');
    const connection = await mysql.createConnection({ host: '127.0.0.1', port: 3306, user: 'root', password: 'Varnika#02' });
    await connection.query('CREATE DATABASE IF NOT EXISTS investiq_ai;');
    await connection.end();

    await sequelize.authenticate();
    logger.info('✅ MySQL connected successfully via Sequelize');

    // Import all models so they register with sequelize before sync
    require('../models/User.model');
    require('../models/Portfolio.model');   // registers Portfolio, PortfolioAsset, PortfolioSnapshot
    require('../models/Watchlist.model');

    // Sync all models
    await sequelize.sync({ alter: true });
    logger.info('✅ MySQL models synchronized (Users, Portfolios, PortfolioAssets, PortfolioSnapshots)');
    
    return sequelize;
  } catch (error) {
    logger.error('❌ MySQL connection failed: ' + error.message);
    process.exit(1);
  }
};

/**
 * Gracefully disconnect from MySQL.
 */
const disconnectDB = async () => {
  try {
    await sequelize.close();
    logger.info('MySQL connection closed gracefully.');
  } catch (error) {
    logger.error(`Error closing MySQL: ${error.message}`);
  }
};

module.exports = { sequelize, connectDB, disconnectDB };
