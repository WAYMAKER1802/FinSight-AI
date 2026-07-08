/**
 * Email Service
 */
'use strict';

const nodemailer = require('nodemailer');
const logger = require('../config/logger');

const sendEmail = async (options) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const message = {
      from: `${process.env.FROM_NAME || 'FinSight AI'} <${process.env.FROM_EMAIL || 'noreply@finsight.ai'}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html,
    };

    const info = await transporter.sendMail(message);
    logger.info(`Message sent: %s`, info.messageId);
    return info;
  } catch (error) {
    logger.error(`Error sending email: ${error.message}`);
    throw new Error('Email could not be sent');
  }
};

const sendPasswordReset = async (email, token) => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${token}`;
  const message = `You requested a password reset. Please go to this link to reset your password: \n\n ${resetUrl}`;
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #10b981;">FinSight AI</h2>
      <h3>Password Reset Request</h3>
      <p>You are receiving this email because you (or someone else) has requested a password reset for your account.</p>
      <p>Please click the button below to reset your password:</p>
      <div style="margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Reset Password</a>
      </div>
      <p style="font-size: 14px; color: #64748b;">If you did not request this, please ignore this email and your password will remain unchanged.</p>
    </div>
  `;

  return sendEmail({
    email,
    subject: 'FinSight AI - Password Reset Token',
    message,
    html,
  });
};

module.exports = {
  sendEmail,
  sendPasswordReset,
};
