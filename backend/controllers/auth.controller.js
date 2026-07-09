/**
 * Authentication Controller
 * ──────────────────────────
 * Handles: register, login, logout, refresh token, forgot/reset password,
 * email verification, and get current user.
 *
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication & Authorization
 */

'use strict';

const crypto = require('crypto');
const User   = require('../models/User.model');
const { AppError }                             = require('../middleware/errorHandler');
const { signAccessToken, signRefreshToken, sendTokenResponse } = require('../middleware/auth.middleware');
const logger = require('../config/logger');
const jwt    = require('jsonwebtoken');
const emailService = require('../services/email.service');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || 'dummy-client-id');

// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:      { type: string, example: "Arjun Sharma" }
 *               email:     { type: string, example: "arjun@example.com" }
 *               password:  { type: string, example: "SecurePass@123" }
 *               riskProfile: { type: string, enum: [conservative, moderate, aggressive] }
 *     responses:
 *       201: { description: User registered successfully }
 *       409: { description: Email already exists }
 */
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, riskProfile, phone, investmentHorizon } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ where: { email: email.toLowerCase() } });
    if (existingUser) {
      return next(new AppError('An account with this email already exists.', 409));
    }

    const user = await User.create({
      name,
      email,
      password,
      riskProfile : riskProfile || 'moderate',
      phone,
      investmentHorizon: investmentHorizon || 'medium_term',
    });

    logger.info(`New user registered: ${user.email} [${user._id}]`);

    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login with email and password
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:    { type: string, example: "arjun@example.com" }
 *               password: { type: string, example: "SecurePass@123" }
 *     responses:
 *       200: { description: Login successful }
 *       401: { description: Invalid credentials }
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError('Email and password are required.', 400));
    }

    const user = await User.findOne({ where: { email: email.toLowerCase() } });
    if (!user || !(await user.comparePassword(password))) {
      return next(new AppError('Invalid email or password.', 401));
    }

    if (!user.isActive) {
      return next(new AppError('Your account has been deactivated. Please contact support.', 401));
    }

    if (user.mfaEnabled && user.mPin) {
      const tempToken = jwt.sign({ id: user.id, mfa: true }, process.env.JWT_SECRET || 'secret', { expiresIn: '15m' });
      return res.status(200).json({
        success: true,
        requiresMPin: true,
        tempToken,
      });
    }

    // Update login audit
    user.lastLogin  = new Date();
    user.loginCount = (user.loginCount || 0) + 1;
    await user.save();

    logger.info(`User logged in: ${user.email}`);

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /auth/verify-mpin:
 *   post:
 *     summary: Verify 4-digit mPIN
 *     tags: [Auth]
 *     security: []
 */
exports.verifyMPin = async (req, res, next) => {
  try {
    const { tempToken, pin } = req.body;
    if (!tempToken || !pin) return next(new AppError('Token and PIN are required.', 400));

    const decoded = jwt.verify(tempToken, process.env.JWT_SECRET || 'secret');
    if (!decoded.mfa) return next(new AppError('Invalid token for MFA.', 401));

    const user = await User.findByPk(decoded.id);
    if (!user || !user.isActive) return next(new AppError('Invalid token.', 401));

    const isMatch = await user.compareMPin(pin.toString());
    if (!isMatch) return next(new AppError('Incorrect PIN.', 401));

    user.lastLogin = new Date();
    user.loginCount = (user.loginCount || 0) + 1;
    await user.save();

    logger.info(`User logged in with mPIN: ${user.email}`);
    sendTokenResponse(user, 200, res);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Session expired. Please log in again.', 401));
    }
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /auth/google:
 *   post:
 *     summary: Login or register with Google OAuth
 *     tags: [Auth]
 *     security: []
 */
exports.googleSignIn = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) return next(new AppError('Google token is required.', 400));

    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID || 'dummy-client-id',
      });
      payload = ticket.getPayload();
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        payload = jwt.decode(token);
      } else {
        return next(new AppError('Invalid Google token.', 401));
      }
    }

    if (!payload || !payload.email) return next(new AppError('Invalid Google token payload.', 401));

    const { email, name, sub: googleId, picture: avatar } = payload;

    let user = await User.findOne({ where: { email: email.toLowerCase() } });

    if (user) {
      if (!user.googleId) {
        user.googleId = googleId;
        user.emailVerified = true;
        if (avatar && !user.avatar) user.avatar = avatar;
        await user.save();
      }
      if (!user.isActive) return next(new AppError('Your account has been deactivated.', 401));
      
      user.lastLogin = new Date();
      user.loginCount = (user.loginCount || 0) + 1;
      await user.save();
    } else {
      user = await User.create({
        name,
        email: email.toLowerCase(),
        googleId,
        avatar,
        emailVerified: true,
        riskProfile: 'moderate',
      });
      logger.info(`New user registered via Google: ${user.email}`);
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout current user
 *     tags: [Auth]
 *     responses:
 *       200: { description: Logged out successfully }
 */
exports.logout = async (req, res, next) => {
  try {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    res.status(200).json({
      success: true,
      message: 'Logged out successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh access token using refresh token
 *     tags: [Auth]
 *     security: []
 */
exports.refreshToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!refreshToken) {
      return next(new AppError('Refresh token not provided.', 401));
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user    = await User.findByPk(decoded.id);

    if (!user || !user.isActive) {
      return next(new AppError('Invalid refresh token.', 401));
    }

    const newAccessToken  = signAccessToken(user.id);
    const newRefreshToken = signRefreshToken(user.id);

    const cookieOptions = {
      httpOnly: true,
      secure  : process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    };

    res.cookie('accessToken',  newAccessToken,  { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.cookie('refreshToken', newRefreshToken, { ...cookieOptions, maxAge: 30 * 24 * 60 * 60 * 1000 });

    res.status(200).json({
      success     : true,
      accessToken : newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Refresh token expired. Please log in again.', 401));
    }
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current authenticated user
 *     tags: [Auth]
 */
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id); // Populate removed for demo

    res.status(200).json({
      success  : true,
      data     : { user: user.toSafeObject() },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Request a password reset email
 *     tags: [Auth]
 *     security: []
 */
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email: email?.toLowerCase() } });

    // Always respond with same message to prevent email enumeration
    const successMessage = 'If that email exists, a reset link has been sent.';

    if (!user) {
      return res.status(200).json({ success: true, message: successMessage });
    }

    const resetToken = user.createPasswordResetToken();
    await user.save();

    try {
      await emailService.sendPasswordReset(user.email, resetToken);
    } catch (err) {
      user.passwordResetToken = null;
      user.passwordResetExpires = null;
      await user.save();
      return next(new AppError('There was an error sending the email. Try again later!', 500));
    }

    logger.info(`Password reset requested for: ${user.email}`);

    res.status(200).json({
      success  : true,
      message  : successMessage,
      // Dev only — remove in production:
      ...(process.env.NODE_ENV === 'development' && { resetToken }),
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /auth/reset-password/{token}:
 *   patch:
 *     summary: Reset password using reset token
 *     tags: [Auth]
 *     security: []
 */
exports.resetPassword = async (req, res, next) => {
  try {
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      where: {
        passwordResetToken  : hashedToken
      }
    });

    if (!user) {
      return next(new AppError('Password reset token is invalid or has expired.', 400));
    }

    user.password            = req.body.password;
    user.passwordResetToken  = null;
    user.passwordResetExpires= null;
    await user.save();

    logger.info(`Password reset successful for: ${user.email}`);

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /auth/change-password:
 *   patch:
 *     summary: Change password for authenticated user
 *     tags: [Auth]
 */
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findByPk(req.user.id);
    if (!(await user.comparePassword(currentPassword))) {
      return next(new AppError('Current password is incorrect.', 401));
    }

    user.password = newPassword;
    await user.save();

    logger.info(`Password changed for user: ${user.email}`);

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};
