/**
 * Response Helper — Standardized API Response Builder
 * ─────────────────────────────────────────────────────
 * Exports both the original names (success, paginated, error) AND
 * the sendSuccess / sendError aliases used by all controllers.
 */

'use strict';

/**
 * Send a success response.
 * @param {Response} res
 * @param {number}   statusCode
 * @param {*}        data
 * @param {string}   message
 * @param {object}   meta
 */
const success = (res, statusCode = 200, data = null, message = 'Success', meta = {}) => {
  return res.status(statusCode).json({
    success  : true,
    message,
    data,
    ...(meta && Object.keys(meta).length > 0 && { meta }),
    timestamp: new Date().toISOString(),
  });
};

/**
 * Send a paginated response.
 */
const paginated = (res, data, total, page, limit, message = 'Data retrieved') => {
  const totalPages = Math.ceil(total / limit);
  return res.status(200).json({
    success : true,
    message,
    data,
    meta: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
    timestamp: new Date().toISOString(),
  });
};

/**
 * Send an error response (for use outside global handler).
 */
const error = (res, message = 'An error occurred', statusCode = 500, errors = []) => {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(errors && errors.length > 0 && { errors }),
    timestamp: new Date().toISOString(),
  });
};

// ── Aliases used by all controllers (sendSuccess / sendError / sendPaginated) ─
// Controllers call:  sendSuccess(res, 200, data, 'message')
// which maps to:     success(res, 200, data, 'message')
const sendSuccess   = success;
const sendError     = error;
const sendPaginated = paginated;

module.exports = {
  // Original names (for backward compat)
  success,
  paginated,
  error,
  // Aliases — used by controllers
  sendSuccess,
  sendError,
  sendPaginated,
};

