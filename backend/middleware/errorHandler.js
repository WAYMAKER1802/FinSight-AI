/**
 * Centralized Error Handler
 * ──────────────────────────
 * Converts all errors (Mongoose, JWT, Validation, AppError) into
 * a consistent JSON response format.
 */

'use strict';

const logger = require('../config/logger');

/**
 * Custom operational error class.
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode  = statusCode;
    this.status      = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// ─── Specific Error Handlers ───────────────────────────────────────────────
const handleCastErrorDB = (err) =>
  new AppError(`Invalid ${err.path}: ${err.value}.`, 400);

const handleDuplicateFieldsDB = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  return new AppError(`The ${field} '${value}' is already in use. Please use a different value.`, 409);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  return new AppError(`Validation failed: ${errors.join('. ')}`, 400);
};

const handleJWTError = () =>
  new AppError('Invalid token. Please log in again.', 401);

const handleJWTExpiredError = () =>
  new AppError('Your session has expired. Please log in again.', 401);

// ─── Response Senders ──────────────────────────────────────────────────────
const sendErrorDev = (err, req, res) => {
  logger.error(`${err.statusCode} | ${err.message} | ${req.method} ${req.originalUrl}`);
  res.status(err.statusCode).json({
    success : false,
    status  : err.status,
    message : err.message,
    stack   : err.stack,
    error   : err,
  });
};

const sendErrorProd = (err, req, res) => {
  // Operational: send safe message to client
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success : false,
      status  : err.status,
      message : err.message,
    });
  }
  // Programming or unknown error: don't leak details
  logger.error(`UNHANDLED ERROR: ${err.message}`, { stack: err.stack });
  return res.status(500).json({
    success : false,
    status  : 'error',
    message : 'Something went wrong. Please try again later.',
  });
};

// ─── Global Error Handler Middleware ──────────────────────────────────────
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status     = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    return sendErrorDev(err, req, res);
  }

  let error = { ...err, message: err.message };

  if (err.name === 'CastError')           error = handleCastErrorDB(error);
  if (err.code === 11000)                 error = handleDuplicateFieldsDB(error);
  if (err.name === 'ValidationError')     error = handleValidationErrorDB(error);
  if (err.name === 'JsonWebTokenError')   error = handleJWTError();
  if (err.name === 'TokenExpiredError')   error = handleJWTExpiredError();

  return sendErrorProd(error, req, res);
};

// ─── 404 Not Found ─────────────────────────────────────────────────────────
const notFound = (req, res, next) => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
};

module.exports = { AppError, errorHandler, notFound };
