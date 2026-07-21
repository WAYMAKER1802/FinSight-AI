/**
 * Database Configuration
 * ─────────────────────
 * MySQL connection with Sequelize, auto-sync, and connection management.
 */

'use strict';

const { Sequelize } = require('sequelize');
const logger = require('./logger');

let sequelize;

// Automatically use SQLite in production (Render) for effortless deployment
if (process.env.NODE_ENV === 'production') {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'database.sqlite',
    logging: false
  });
} else {
  // Local MySQL for development
  sequelize = new Sequelize('investiq_ai', 'root', 'Varnika#02', {
    host: '127.0.0.1',
    port: 3306,
    dialect: 'mysql',
    logging: (msg) => logger.debug(msg),
  });
}

/**
 * Connect to DB and synchronize models.
 */
const connectDB = async () => {
  try {
    // Only try to create MySQL DB if in development
    if (process.env.NODE_ENV !== 'production') {
      const mysql = require('mysql2/promise');
      const connection = await mysql.createConnection({ host: '127.0.0.1', port: 3306, user: 'root', password: 'Varnika#02' });
      await connection.query('CREATE DATABASE IF NOT EXISTS investiq_ai;');
      await connection.end();
    }

    await sequelize.authenticate();
    logger.info(`✅ Database connected successfully via Sequelize (${process.env.NODE_ENV === 'production' ? 'SQLite' : 'MySQL'})`);

    // Import all models so they register with sequelize before sync
    require('../models/User.model');
    require('../models/Portfolio.model');   // registers Portfolio, PortfolioAsset, PortfolioSnapshot
    require('../models/Watchlist.model');

    // Sync all models without alter to prevent infinite index creation bug
    await sequelize.sync();
    logger.info('✅ Database models synchronized');
    
    // Auto-seed admin user if it doesn't exist (because Render wipes SQLite on sleep)
    const User = require('../models/User.model');
    const existingUser = await User.findOne({ where: { email: 'varnikaa.1802@gmail.com' } });
    if (!existingUser) {
      await User.create({
        name: 'Varnika Agarwal',
        email: 'varnikaa.1802@gmail.com',
        password: 'Varnika#0210',
        role: 'admin',
        riskProfile: 'moderate',
        emailVerified: true
      });
      logger.info('✅ Auto-seeded admin account varnikaa.1802@gmail.com');
    }
    
    return sequelize;
  } catch (error) {
    logger.error('❌ Database connection failed: ' + error.message);
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
