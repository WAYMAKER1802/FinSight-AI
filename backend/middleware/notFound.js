/**
 * 404 Not Found Handler — catches all unmatched routes
 */
'use strict';

const { AppError } = require('./errorHandler');

const notFound = (req, res, next) => {
  next(new AppError(`Route ${req.method} ${req.originalUrl} not found`, 404));
};

module.exports = { notFound };
