/**
 * User Controller
 */
'use strict';

const User     = require('../models/User.model');
const { AppError } = require('../middleware/errorHandler');
const { sendSuccess } = require('../utils/response');
const bcrypt   = require('bcryptjs');

// GET /users/profile
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password', 'refreshTokenHash'] }
    });
    if (!user) return next(new AppError('User not found', 404));
    sendSuccess(res, 200, { user });
  } catch (e) { next(e); }
};

// PUT /users/profile
exports.updateProfile = async (req, res, next) => {
  try {
    const allowed = ['name', 'phone', 'riskProfile', 'investmentGoals', 'annualIncome',
                     'monthlyExpenses', 'investmentHorizon', 'notifications'];
    const updates = Object.fromEntries(
      Object.entries(req.body).filter(([k]) => allowed.includes(k))
    );

    const user = await User.findByPk(req.user.id);
    if (!user) return next(new AppError('User not found', 404));

    await user.update(updates);
    await user.reload({ attributes: { exclude: ['password', 'refreshTokenHash'] } });

    sendSuccess(res, 200, { user }, 'Profile updated successfully');
  } catch (e) { next(e); }
};

// POST /users/change-password
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return next(new AppError('Provide currentPassword and newPassword', 400));
    }

    const user = await User.findByPk(req.user.id);
    if (!user) return next(new AppError('User not found', 404));
    
    // For OAuth users who might not have a password set yet
    if (!user.password) {
      return next(new AppError('You logged in with Google. Use forgot password to set one.', 400));
    }

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return next(new AppError('Current password is incorrect', 401));

    user.password = newPassword; // beforeUpdate hook will hash it
    await user.save();

    sendSuccess(res, 200, null, 'Password changed successfully');
  } catch (e) { next(e); }
};

// POST /users/upload-avatar
exports.uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) return next(new AppError('No file provided', 400));

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const avatarUrl = `${baseUrl}/uploads/avatars/${req.file.filename}`;
    
    const user = await User.findByPk(req.user.id);
    if (!user) return next(new AppError('User not found', 404));
    
    await user.update({ avatar: avatarUrl });
    await user.reload({ attributes: { exclude: ['password', 'refreshTokenHash'] } });

    sendSuccess(res, 200, { avatar: avatarUrl, user }, 'Avatar updated');
  } catch (e) { next(e); }
};

// DELETE /users/account
exports.deleteAccount = async (req, res, next) => {
  try {
    const { password } = req.body;
    const user = await User.findByPk(req.user.id);
    if (!user) return next(new AppError('User not found', 404));
    
    // Require password unless it's a google auth user
    if (user.password) {
      if (!password) return next(new AppError('Confirm with your password', 400));
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) return next(new AppError('Incorrect password', 401));
    }

    await user.destroy();

    // Delete portfolios, goals, alerts (cascade)
    const { Portfolio } = require('../models/Portfolio.model');
    const Goal      = require('../models/Goal.model');
    const Alert     = require('../models/Alert.model');
    
    await Promise.all([
      Portfolio.destroy({ where: { userId: req.user.id } }),
      Goal.destroy({ where: { userId: req.user.id } }),
      Alert.destroy({ where: { userId: req.user.id } }),
    ]);

    res.clearCookie('refreshToken');
    sendSuccess(res, 200, null, 'Account permanently deleted');
  } catch (e) { next(e); }
};

// POST /users/mpin/setup
exports.setupMPin = async (req, res, next) => {
  try {
    const { pin } = req.body;
    if (!pin || pin.toString().length !== 4) return next(new AppError('A 4-digit PIN is required.', 400));

    const user = await User.findByPk(req.user.id);
    if (!user) return next(new AppError('User not found', 404));

    user.mPin = await bcrypt.hash(pin.toString(), 10);
    user.mfaEnabled = true;
    await user.save();

    sendSuccess(res, 200, null, 'mPIN setup successfully.');
  } catch (e) { next(e); }
};

// PUT /users/mpin/reset
exports.resetMPin = async (req, res, next) => {
  try {
    const { password, newPin } = req.body;
    if (!newPin || newPin.toString().length !== 4) return next(new AppError('A 4-digit PIN is required.', 400));

    const user = await User.findByPk(req.user.id);
    if (!user) return next(new AppError('User not found', 404));

    if (user.password) {
      if (!password) return next(new AppError('Please confirm with your password.', 400));
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) return next(new AppError('Incorrect password.', 401));
    }

    user.mPin = await bcrypt.hash(newPin.toString(), 10);
    user.mfaEnabled = true;
    await user.save();

    sendSuccess(res, 200, null, 'mPIN reset successfully.');
  } catch (e) { next(e); }
};

// PUT /users/mpin/disable
exports.disableMPin = async (req, res, next) => {
  try {
    const { password } = req.body;
    const user = await User.findByPk(req.user.id);
    if (!user) return next(new AppError('User not found', 404));

    if (user.password) {
      if (!password) return next(new AppError('Please confirm with your password.', 400));
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) return next(new AppError('Incorrect password.', 401));
    }

    user.mfaEnabled = false;
    user.mPin = null;
    await user.save();

    sendSuccess(res, 200, null, 'mPIN disabled successfully.');
  } catch (e) { next(e); }
};

// ── Admin Only ──────────────────────────────────────────────────────────────
// GET /users (admin)
exports.getAllUsers = async (req, res, next) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 20;

    const [users, total] = await Promise.all([
      User.findAll({
        attributes: { exclude: ['password', 'refreshTokenHash'] },
        order: [['createdAt', 'DESC']],
        offset: (page - 1) * limit,
        limit: limit
      }),
      User.count(),
    ]);

    sendSuccess(res, 200, { users, total, page, pages: Math.ceil(total / limit) });
  } catch (e) { next(e); }
};

// PATCH /users/:id/role (admin)
exports.updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['user', 'premium', 'admin'].includes(role)) {
      return next(new AppError('Invalid role', 400));
    }

    const user = await User.findByPk(req.params.id);
    if (!user) return next(new AppError('User not found', 404));

    await user.update({ role, isPremium: role === 'premium' || role === 'admin' });
    await user.reload({ attributes: { exclude: ['password', 'refreshTokenHash'] } });

    sendSuccess(res, 200, { user }, `Role updated to ${role}`);
  } catch (e) { next(e); }
};
