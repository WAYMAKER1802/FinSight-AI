/**
 * Cache Middleware
 * ────────────────
 * Checks Redis cache for existing responses before hitting controllers.
 */
'use strict';

const { get, set } = require('../services/cache.service');
const logger = require('../config/logger');

const cacheResponse = (durationInSeconds = 900) => {
  return async (req, res, next) => {
    // Only cache GET requests or specific POST queries (like AI analysis)
    const key = `cache:${req.user._id}:${req.originalUrl}:${JSON.stringify(req.body)}`;
    
    try {
      const cachedData = await get(key);
      if (cachedData) {
        logger.info(`Cache HIT for ${key}`);
        return res.status(200).json(cachedData);
      }

      logger.info(`Cache MISS for ${key}`);

      // Overwrite res.json to intercept and cache the response
      const originalJson = res.json;
      res.json = function (body) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          set(key, body, durationInSeconds).catch(err => 
            logger.error(`Failed to set cache: ${err.message}`)
          );
        }
        return originalJson.call(this, body);
      };
      
      next();
    } catch (error) {
      logger.error(`Cache Middleware Error: ${error.message}`);
      next(); // Fail gracefully and proceed to controller
    }
  };
};

module.exports = {
  cacheResponse,
};
