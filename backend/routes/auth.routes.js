/**
 * Authentication Routes
 * ──────────────────────
 */

'use strict';

const express = require('express');
const router  = express.Router();

const authController = require('../controllers/auth.controller');
const { protect }    = require('../middleware/auth.middleware');
const { authLimiter, strictLimiter } = require('../middleware/rateLimiter');

router.post('/register',         authLimiter,   authController.register);
router.post('/login',            authLimiter,   authController.login);
router.post('/logout',           protect,       authController.logout);
router.post('/refresh',                         authController.refreshToken);
router.get ('/me',               protect,       authController.getMe);
router.post('/forgot-password',  strictLimiter, authController.forgotPassword);
router.patch('/reset-password/:token', strictLimiter, authController.resetPassword);
router.patch('/change-password', protect,       authController.changePassword);

module.exports = router;
