/**
 * Rate Limiting Middleware
 * ─────────────────────────
 * Tiered rate limiting: general API, auth, and AI endpoints.
 */

'use strict';

const rateLimit = require('express-rate-limit');
const logger    = require('../config/logger');

const rateLimitMessage = (type) => ({
  success: false,
  message: `Too many ${type} requests. Please try again later.`,
  retryAfter: '15 minutes',
});

// ─── General API Limiter ───────────────────────────────────────────────────
const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
  max     : parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
  standardHeaders: true,
  legacyHeaders  : false,
  message: rateLimitMessage('API'),
  handler: (req, res, next, options) => {
    logger.warn(`Rate limit exceeded: ${req.ip} → ${req.originalUrl}`);
    res.status(options.statusCode).json(options.message);
  },
});

// ─── Auth Limiter (stricter) ───────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max     : 10,
  message : rateLimitMessage('authentication'),
  skipSuccessfulRequests: true,
});

// ─── AI Endpoint Limiter ───────────────────────────────────────────────────
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max     : parseInt(process.env.AI_RATE_LIMIT_MAX, 10) || 20,
  message : rateLimitMessage('AI'),
});

// ─── Strict Limiter (password reset, etc.) ────────────────────────────────
const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,   // 1 hour
  max     : 5,
  message : rateLimitMessage('sensitive'),
});

// ─── Upload Limiter ────────────────────────────────────────────────────────
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,   // 1 hour
  max     : 20,
  message : rateLimitMessage('upload'),
});

module.exports = { apiLimiter, authLimiter, aiLimiter, strictLimiter, uploadLimiter };
