/**
 * Database Configuration
 * ─────────────────────
 * MongoDB connection with Mongoose, retry logic, and event listeners.
 */

'use strict';

const mongoose = require('mongoose');
const logger   = require('./logger');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/finsight_ai';

const mongooseOptions = {
  useNewUrlParser    : true,
  useUnifiedTopology : true,
  maxPoolSize        : 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS    : 45000,
  family             : 4,
};

/**
 * Connect to MongoDB with automatic retry on failure.
 * @param {number} retries  - Number of connection retries (default: 5)
 * @param {number} delay    - Delay between retries in ms (default: 3000)
 */
const connectDB = async (retries = 5, delay = 3000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const conn = await mongoose.connect(MONGODB_URI, mongooseOptions);
      logger.info(`✅ MongoDB connected: ${conn.connection.host} [DB: ${conn.connection.name}]`);

      // ─── Connection Event Listeners ────────────────────────────────────
      mongoose.connection.on('error',        (err) => logger.error(`MongoDB error: ${err}`));
      mongoose.connection.on('disconnected', ()    => logger.warn('MongoDB disconnected'));
      mongoose.connection.on('reconnected',  ()    => logger.info('MongoDB reconnected'));

      return conn;
    } catch (error) {
      logger.error(`❌ MongoDB connection attempt ${attempt}/${retries} failed: ${error.message}`);
      if (attempt < retries) {
        logger.info(`⏳ Retrying in ${delay / 1000}s...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      } else {
        logger.error('💥 All MongoDB connection attempts exhausted. Exiting.');
        process.exit(1);
      }
    }
  }
};

/**
 * Gracefully disconnect from MongoDB.
 */
const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    logger.info('MongoDB connection closed gracefully.');
  } catch (error) {
    logger.error(`Error closing MongoDB: ${error.message}`);
  }
};

module.exports = { connectDB, disconnectDB };
