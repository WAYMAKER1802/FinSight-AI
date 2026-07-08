/**
 * Cache Service
 */
'use strict';

const { redisClient } = require('../config/redis');
const logger = require('../config/logger');

const get = async (key) => {
  try {
    if (!redisClient.isOpen) return null;
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    logger.error(`Cache Get Error for key ${key}: ${error.message}`);
    return null;
  }
};

const set = async (key, value, expInSeconds = 3600) => {
  try {
    if (!redisClient.isOpen) return;
    await redisClient.set(key, JSON.stringify(value), {
      EX: expInSeconds,
    });
  } catch (error) {
    logger.error(`Cache Set Error for key ${key}: ${error.message}`);
  }
};

const del = async (key) => {
  try {
    if (!redisClient.isOpen) return;
    await redisClient.del(key);
  } catch (error) {
    logger.error(`Cache Del Error for key ${key}: ${error.message}`);
  }
};

const flush = async () => {
  try {
    if (!redisClient.isOpen) return;
    await redisClient.flushDb();
  } catch (error) {
    logger.error(`Cache Flush Error: ${error.message}`);
  }
};

module.exports = {
  get,
  set,
  del,
  flush,
};
