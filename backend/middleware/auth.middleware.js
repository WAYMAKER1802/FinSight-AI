/**
 * Authentication Middleware
 * ─────────────────────────
 * JWT verification, token refresh handling, and role-based access control.
 */

'use strict';

const jwt    = require('jsonwebtoken');
const User   = require('../models/User.model');
const { AppError } = require('./errorHandler');
const logger = require('../config/logger');

/**
 * Verify JWT access token and attach user to request.
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Extract token from Authorization header or cookie
    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return next(new AppError('Access denied. No token provided.', 401));
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user (check if still exists and is active)
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return next(new AppError('User associated with this token no longer exists.', 401));
    }

    if (!user.isActive) {
      return next(new AppError('Your account has been deactivated. Contact support.', 401));
    }

    // Check if password was changed after token was issued
    if (user.passwordChangedAt) {
      const changedTimestamp = parseInt(user.passwordChangedAt.getTime() / 1000, 10);
      if (decoded.iat < changedTimestamp) {
        return next(new AppError('Password was recently changed. Please log in again.', 401));
      }
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid token. Please log in again.', 401));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Token expired. Please refresh your session.', 401));
    }
    logger.error(`Auth middleware error: ${error.message}`);
    return next(new AppError('Authentication failed.', 401));
  }
};

/**
 * Optional authentication — attaches user if token is valid, but doesn't block.
 */
const optionalAuth = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user    = await User.findByPk(decoded.id);
      if (user && user.isActive) req.user = user;
    }
  } catch (_) {
    // Silently ignore token errors for optional auth
  }
  next();
};

/**
 * Role-based access control middleware factory.
 * @param {...string} roles - Allowed roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('You must be logged in to access this resource.', 401));
    }
    if (!roles.includes(req.user.role)) {
      return next(new AppError(
        `Your role '${req.user.role}' does not have permission to perform this action.`, 403
      ));
    }
    next();
  };
};

/**
 * Premium plan guard — requires user to have an active subscription or admin role.
 */
const requirePremium = (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Authentication required.', 401));
  }
  if (req.user.role === 'admin' || req.user.isPremium) {
    return next();
  }
  return next(new AppError(
    'This feature requires a Premium subscription. Upgrade at investiq.ai/upgrade', 403
  ));
};

/**
 * Generate signed JWT access token.
 * @param {string} userId
 */
const signAccessToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'default_jwt_secret_investiq_2026', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * Generate signed JWT refresh token.
 * @param {string} userId
 */
const signRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET || 'default_refresh_secret_investiq_2026', {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  });
};

/**
 * Send tokens via cookie + response body.
 */
const sendTokenResponse = (user, statusCode, res) => {
  const accessToken  = signAccessToken(user.id);
  const refreshToken = signRefreshToken(user.id);

  const cookieOptions = {
    expires  : new Date(Date.now() + parseInt(process.env.JWT_COOKIE_EXPIRES_IN || 7) * 24 * 60 * 60 * 1000),
    httpOnly : true,
    secure   : process.env.NODE_ENV === 'production',
    sameSite : 'strict',
  };

  res.cookie('accessToken',  accessToken,  cookieOptions);
  res.cookie('refreshToken', refreshToken, { ...cookieOptions, expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) });

  res.status(statusCode).json({
    success      : true,
    accessToken,
    refreshToken,
    expiresIn    : process.env.JWT_EXPIRES_IN || '7d',
    user         : user.toSafeObject(),
  });
};

module.exports = {
  protect,
  optionalAuth,
  authorize,
  requirePremium,
  premiumGuard: requirePremium,   // alias used in routes
  signAccessToken,
  signRefreshToken,
  sendTokenResponse,
};
