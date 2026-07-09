/**
 * Notification Service
 * ────────────────────
 * Orchestrates notifications across Email, Push, and In-App channels.
 */
'use strict';

const { sendEmail } = require('./email.service');
const { sendPushNotification } = require('./push.service');
const Alert = require('../models/Alert.model');
const logger = require('../config/logger');

/**
 * Dispatch a notification via user's preferred channels
 * @param {object} user - Populated user object containing preferences
 * @param {object} content - { title, message, type, severity, link }
 */
const dispatchNotification = async (user, content) => {
  try {
    const prefs = user.notifications || {};
    const results = [];

    // 1. In-App Alert (Always created)
    const alert = await Alert.create({
      userId: user._id,
      title: content.title,
      message: content.message,
      type: content.type || 'system',
      severity: content.severity || 'info',
      link: content.link,
      isRead: false,
    });
    results.push({ channel: 'in-app', success: true });

    // 2. Email Notification
    if (prefs.email) {
      try {
        await sendEmail({
          email: user.email,
          subject: `InvestIQ AI: ${content.title}`,
          message: content.message,
          html: `<p>${content.message}</p><br/><a href="${content.link || '#'}">View Details</a>`,
        });
        results.push({ channel: 'email', success: true });
      } catch (e) {
        results.push({ channel: 'email', success: false, error: e.message });
      }
    }

    // 3. Push Notification
    if (prefs.push) {
      try {
        await sendPushNotification(user._id.toString(), {
          title: content.title,
          body: content.message,
          url: content.link,
        });
        results.push({ channel: 'push', success: true });
      } catch (e) {
        results.push({ channel: 'push', success: false, error: e.message });
      }
    }

    return { success: true, results, alertId: alert._id };
  } catch (error) {
    logger.error(`Failed to dispatch notification to ${user._id}: ${error.message}`);
    throw new Error('Notification dispatch failed');
  }
};

module.exports = {
  dispatchNotification,
};
