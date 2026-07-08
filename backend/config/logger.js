/**
 * Winston Logger Configuration
 * ─────────────────────────────
 * Structured logging with file rotation, colorized console output,
 * and separate error/combined log files.
 */

'use strict';

const winston      = require('winston');
const path         = require('path');
const { createLogger, format, transports } = winston;
const { combine, timestamp, printf, colorize, errors, json } = format;

// ─── Log Directory ─────────────────────────────────────────────────────────
const LOG_DIR   = path.join(__dirname, '../logs');
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

// ─── Custom Format ─────────────────────────────────────────────────────────
const consoleFormat = printf(({ level, message, timestamp, stack }) => {
  return stack
    ? `${timestamp} [${level}]: ${message}\n${stack}`
    : `${timestamp} [${level}]: ${message}`;
});

// ─── Logger Instance ───────────────────────────────────────────────────────
const logger = createLogger({
  level      : LOG_LEVEL,
  format     : combine(
    errors({ stack: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    json()
  ),
  defaultMeta: { service: 'finsight-api' },
  transports : [
    // Error-only log
    new transports.File({
      filename : path.join(LOG_DIR, 'error.log'),
      level    : 'error',
      maxsize  : 20 * 1024 * 1024,  // 20 MB
      maxFiles : 5,
    }),
    // Combined log
    new transports.File({
      filename : path.join(LOG_DIR, 'app.log'),
      maxsize  : 20 * 1024 * 1024,
      maxFiles : 14,
    }),
    // AI-specific log
    new transports.File({
      filename : path.join(LOG_DIR, 'ai.log'),
      level    : 'debug',
      maxsize  : 10 * 1024 * 1024,
      maxFiles : 7,
    }),
  ],
});

// ─── Console Transport (Dev Only) ──────────────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  logger.add(new transports.Console({
    format: combine(
      colorize({ all: true }),
      timestamp({ format: 'HH:mm:ss' }),
      consoleFormat
    ),
  }));
}

// ─── Stream for Morgan HTTP Logger ─────────────────────────────────────────
logger.stream = {
  write: (message) => logger.http(message.trim()),
};

module.exports = logger;
