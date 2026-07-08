/**
 * Health Check Route
 */
'use strict';

const express   = require('express');
const router    = express.Router();
const mongoose  = require('mongoose');
const os        = require('os');

router.get('/', (req, res) => {
  const isMongoConnected = mongoose.connection.readyState === 1;
  const uptime = process.uptime();
  const memUsage = process.memoryUsage();

  const status = isMongoConnected ? 'healthy' : 'degraded';

  res.status(isMongoConnected ? 200 : 503).json({
    status,
    timestamp : new Date().toISOString(),
    version   : process.env.API_VERSION || 'v1',
    environment: process.env.NODE_ENV,
    services  : {
      api      : 'up',
      database : isMongoConnected ? 'up' : 'down',
    },
    system: {
      uptime      : `${Math.floor(uptime / 60)}m ${Math.floor(uptime % 60)}s`,
      memoryUsed  : `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
      memoryTotal : `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
      cpus        : os.cpus().length,
      nodeVersion : process.version,
    },
  });
});

router.get('/ping', (req, res) => res.json({ pong: true, ts: Date.now() }));

module.exports = router;
