/**
 * User Controller
 */
'use strict';

const User     = require('../models/User.model');
const { AppError } = require('../middleware/errorHandler');
const { sendSuccess } = require('../utils/response');
const bcrypt   = require('bcryptjs');
const path     = require('path');

// GET /users/profile
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password -refreshTokenHash');
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

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true, runValidators: true,
    }).select('-password -refreshTokenHash');

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

    const user = await User.findById(req.user._id);
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return next(new AppError('Current password is incorrect', 401));

    user.password = newPassword; // pre-save hook hashes it
    await user.save();

    sendSuccess(res, 200, null, 'Password changed successfully');
  } catch (e) { next(e); }
};

// POST /users/upload-avatar
exports.uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) return next(new AppError('No file provided', 400));

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(
      req.user._id, { avatar: avatarUrl }, { new: true }
    ).select('-password');

    sendSuccess(res, 200, { avatar: avatarUrl, user }, 'Avatar updated');
  } catch (e) { next(e); }
};

// DELETE /users/account
exports.deleteAccount = async (req, res, next) => {
  try {
    const { password } = req.body;
    if (!password) return next(new AppError('Confirm with your password', 400));

    const user = await User.findById(req.user._id);
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return next(new AppError('Incorrect password', 401));

    await User.findByIdAndDelete(req.user._id);

    // Delete portfolios, goals, alerts (cascade)
    const Portfolio = require('../models/Portfolio.model');
    const Goal      = require('../models/Goal.model');
    const Alert     = require('../models/Alert.model');
    await Promise.all([
      Portfolio.deleteMany({ userId: req.user._id }),
      Goal.deleteMany({ userId: req.user._id }),
      Alert.deleteMany({ userId: req.user._id }),
    ]);

    res.clearCookie('refreshToken');
    sendSuccess(res, 200, null, 'Account permanently deleted');
  } catch (e) { next(e); }
};

// ── Admin Only ──────────────────────────────────────────────────────────────
// GET /users (admin)
exports.getAllUsers = async (req, res, next) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 20;

    const [users, total] = await Promise.all([
      User.find({}).select('-password -refreshTokenHash')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      User.countDocuments(),
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

    const user = await User.findByIdAndUpdate(
      req.params.id, { role, isPremium: role === 'premium' || role === 'admin' },
      { new: true }
    ).select('-password');

    if (!user) return next(new AppError('User not found', 404));
    sendSuccess(res, 200, { user }, `Role updated to ${role}`);
  } catch (e) { next(e); }
};
