/**
 * Alert Controller
 */
'use strict';

const Alert    = require('../models/Alert.model');
const { AppError } = require('../middleware/errorHandler');
const { sendSuccess } = require('../utils/response');

// GET /alerts
exports.getAlerts = async (req, res, next) => {
  try {
    const { unreadOnly, severity, type, portfolioId, limit = 50 } = req.query;
    const filter = { userId: req.user._id };

    if (unreadOnly === 'true') filter.isRead   = false;
    if (severity)              filter.severity  = severity;
    if (type)                  filter.type      = type;
    if (portfolioId)           filter.portfolioId = portfolioId;

    const alerts = await Alert.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    sendSuccess(res, 200, { count: alerts.length, alerts });
  } catch (e) { next(e); }
};

// GET /alerts/unread-count
exports.getUnreadCount = async (req, res, next) => {
  try {
    const count = await Alert.countDocuments({ userId: req.user._id, isRead: false });
    sendSuccess(res, 200, { count });
  } catch (e) { next(e); }
};

// POST /alerts
exports.createAlert = async (req, res, next) => {
  try {
    const { portfolioId, type, title, message, severity, symbol, targetPrice, channels } = req.body;

    const alert = await Alert.create({
      userId: req.user._id,
      portfolioId, type, title, message, severity, symbol, targetPrice,
      channels: channels || ['in_app'],
    });

    sendSuccess(res, 201, { alert }, 'Alert created');
  } catch (e) { next(e); }
};

// PATCH /alerts/:id/read
exports.markRead = async (req, res, next) => {
  try {
    const alert = await Alert.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isRead: true, readAt: new Date() },
      { new: true }
    );
    if (!alert) return next(new AppError('Alert not found', 404));
    sendSuccess(res, 200, { alert }, 'Marked as read');
  } catch (e) { next(e); }
};

// PATCH /alerts/mark-all-read
exports.markAllRead = async (req, res, next) => {
  try {
    const result = await Alert.updateMany(
      { userId: req.user._id, isRead: false },
      { isRead: true, readAt: new Date() }
    );
    sendSuccess(res, 200, { updated: result.modifiedCount }, 'All alerts marked as read');
  } catch (e) { next(e); }
};

// DELETE /alerts/:id
exports.deleteAlert = async (req, res, next) => {
  try {
    const alert = await Alert.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!alert) return next(new AppError('Alert not found', 404));
    sendSuccess(res, 200, null, 'Alert deleted');
  } catch (e) { next(e); }
};

// DELETE /alerts/clear-read
exports.clearRead = async (req, res, next) => {
  try {
    const result = await Alert.deleteMany({ userId: req.user._id, isRead: true });
    sendSuccess(res, 200, { deleted: result.deletedCount }, 'Read alerts cleared');
  } catch (e) { next(e); }
};
