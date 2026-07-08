/**
 * Redis Configuration
 */
'use strict';

const redis = require('redis');
const logger = require('./logger');

const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

redisClient.on('error', (err) => logger.error('Redis Client Error', err));
redisClient.on('connect', () => logger.info('Connected to Redis'));

const connectRedis = async () => {
  try {
    await redisClient.connect();
  } catch (error) {
    logger.error('Could not connect to Redis: ' + error.message);
  }
};

module.exports = {
  redisClient,
  connectRedis,
};
