/**
 * Push Notification Service
 * ─────────────────────────
 * Stub for sending WebPush or Firebase notifications.
 */
'use strict';

const logger = require('../config/logger');

/**
 * Send a push notification to a user's device
 * @param {string} userId - Target user ID
 * @param {object} payload - Notification payload { title, body, url, icon }
 */
const sendPushNotification = async (userId, payload) => {
  try {
    // In a real implementation, this would use web-push or firebase-admin
    // e.g. webpush.sendNotification(subscription, JSON.stringify(payload))
    logger.info(`[Push Notification sent to ${userId}]: ${payload.title} - ${payload.body}`);
    return true;
  } catch (error) {
    logger.error(`Failed to send push notification: ${error.message}`);
    return false;
  }
};

module.exports = {
  sendPushNotification,
};
