/**
 * User Model
 * ──────────
 * Mongoose schema for system users with authentication, profile,
 * risk profiling, subscription management, and audit fields.
 */

'use strict';

const { DataTypes, Model } = require('sequelize');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { sequelize } = require('../config/database');

class User extends Model {
  async comparePassword(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
  }

  createPasswordResetToken() {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
    return resetToken;
  }

  createEmailVerificationToken() {
    const token = crypto.randomBytes(32).toString('hex');
    this.emailVerificationToken = crypto.createHash('sha256').update(token).digest('hex');
    return token;
  }

  toSafeObject() {
    const obj = this.toJSON();
    delete obj.password;
    delete obj.refreshToken;
    delete obj.passwordResetToken;
    delete obj.passwordResetExpires;
    delete obj.emailVerificationToken;
    return obj;
  }
}

User.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(80),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  avatar: DataTypes.STRING,
  phone: DataTypes.STRING,
  role: {
    type: DataTypes.ENUM('user', 'premium', 'admin'),
    defaultValue: 'user'
  },
  // Flattened Subscription
  subscription_plan: { type: DataTypes.ENUM('free', 'basic', 'pro', 'enterprise'), defaultValue: 'free' },
  subscription_startDate: DataTypes.DATE,
  subscription_endDate: DataTypes.DATE,
  subscription_isActive: { type: DataTypes.BOOLEAN, defaultValue: false },
  
  // Profile
  riskProfile: {
    type: DataTypes.ENUM('conservative', 'moderate', 'moderately_aggressive', 'aggressive', 'very_aggressive'),
    defaultValue: 'moderate'
  },
  annualIncome: DataTypes.FLOAT,
  monthlyExpenses: DataTypes.FLOAT,
  investmentHorizon: DataTypes.ENUM('short_term', 'medium_term', 'long_term'),
  
  // AI Settings
  ai_voiceEnabled: { type: DataTypes.BOOLEAN, defaultValue: false },
  ai_weeklyReportEnabled: { type: DataTypes.BOOLEAN, defaultValue: true },
  ai_smartAlertsEnabled: { type: DataTypes.BOOLEAN, defaultValue: true },
  ai_aiCoachEnabled: { type: DataTypes.BOOLEAN, defaultValue: true },
  ai_language: { type: DataTypes.STRING, defaultValue: 'en' },
  ai_currency: { type: DataTypes.ENUM('INR', 'USD', 'EUR', 'GBP'), defaultValue: 'INR' },
  
  // Notifications
  notif_email: { type: DataTypes.BOOLEAN, defaultValue: true },
  notif_push: { type: DataTypes.BOOLEAN, defaultValue: true },
  notif_sms: { type: DataTypes.BOOLEAN, defaultValue: false },
  notif_priceAlerts: { type: DataTypes.BOOLEAN, defaultValue: true },
  notif_newsAlerts: { type: DataTypes.BOOLEAN, defaultValue: true },
  notif_goalAlerts: { type: DataTypes.BOOLEAN, defaultValue: true },
  
  // Gamification
  wealthScore: { type: DataTypes.INTEGER, defaultValue: 0 },
  wealthLevel: { type: DataTypes.STRING, defaultValue: 'Beginner' },
  
  // Auth Tokens
  refreshToken: DataTypes.STRING,
  passwordResetToken: DataTypes.STRING,
  passwordResetExpires: DataTypes.DATE,
  emailVerificationToken: DataTypes.STRING,
  emailVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
  mfaEnabled: { type: DataTypes.BOOLEAN, defaultValue: false },
  mfaSecret: DataTypes.STRING,
  
  // Audit
  lastLogin: DataTypes.DATE,
  loginCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  deactivatedAt: DataTypes.DATE
}, {
  sequelize,
  modelName: 'User',
  hooks: {
    beforeSave: async (user) => {
      if (user.changed('password')) {
        const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 12;
        user.password = await bcrypt.hash(user.password, saltRounds);
      }
    }
  }
});

// Custom properties
Object.defineProperty(User.prototype, 'isPremium', {
  get: function() {
    return ['premium', 'admin'].includes(this.role) || this.subscription_isActive;
  }
});

module.exports = User;
