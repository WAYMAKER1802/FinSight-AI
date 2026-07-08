/**
 * Redis Configuration
 */
'use strict';

const logger = require('./logger');

const redisClient = {
  get: async () => null,
  set: async () => null,
  setEx: async () => null,
  del: async () => null,
  connect: async () => {},
  quit: async () => {},
  on: () => {}
};

const connectRedis = async () => {
  logger.info('✅ Using mock Redis client');
};

module.exports = {
  redisClient,
  connectRedis,
};
