/**
 * User Model
 * ──────────
 * Mongoose schema for system users with authentication, profile,
 * risk profiling, subscription management, and audit fields.
 */

'use strict';

const mongoose  = require('mongoose');
const bcrypt    = require('bcryptjs');
const crypto    = require('crypto');

const userSchema = new mongoose.Schema(
  {
    // ── Identity ───────────────────────────────────────────────────────────
    name: {
      type     : String,
      required : [true, 'Name is required'],
      trim     : true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [80, 'Name cannot exceed 80 characters'],
    },
    email: {
      type      : String,
      required  : [true, 'Email is required'],
      unique    : true,
      lowercase : true,
      trim      : true,
      match     : [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    password: {
      type     : String,
      required : [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select   : false,
    },
    avatar: {
      type   : String,
      default: null,
    },
    phone: {
      type : String,
      match: [/^[+]?[\d\s\-().]{7,20}$/, 'Please enter a valid phone number'],
    },

    // ── Role & Subscription ────────────────────────────────────────────────
    role: {
      type   : String,
      enum   : ['user', 'premium', 'admin'],
      default: 'user',
    },
    subscription: {
      plan     : { type: String, enum: ['free', 'basic', 'pro', 'enterprise'], default: 'free' },
      startDate: { type: Date },
      endDate  : { type: Date },
      isActive : { type: Boolean, default: false },
    },

    // ── Investment Profile ─────────────────────────────────────────────────
    riskProfile: {
      type   : String,
      enum   : ['conservative', 'moderate', 'moderately_aggressive', 'aggressive', 'very_aggressive'],
      default: 'moderate',
    },
    investmentGoals: [{
      type: String,
      enum: ['wealth_creation', 'retirement', 'education', 'home', 'emergency', 'tax_saving', 'income'],
    }],
    annualIncome: {
      type: Number,
      min : 0,
    },
    monthlyExpenses: {
      type: Number,
      min : 0,
    },
    investmentHorizon: {
      type: String,
      enum: ['short_term', 'medium_term', 'long_term'],
    },

    // ── AI Preferences ─────────────────────────────────────────────────────
    aiSettings: {
      voiceEnabled          : { type: Boolean, default: false },
      weeklyReportEnabled   : { type: Boolean, default: true },
      smartAlertsEnabled    : { type: Boolean, default: true },
      aiCoachEnabled        : { type: Boolean, default: true },
      language              : { type: String, default: 'en' },
      currency              : { type: String, default: 'INR', enum: ['INR', 'USD', 'EUR', 'GBP'] },
    },

    // ── Notification Preferences ───────────────────────────────────────────
    notifications: {
      email        : { type: Boolean, default: true },
      push         : { type: Boolean, default: true },
      sms          : { type: Boolean, default: false },
      priceAlerts  : { type: Boolean, default: true },
      newsAlerts   : { type: Boolean, default: true },
      goalAlerts   : { type: Boolean, default: true },
    },

    // ── Gamification ───────────────────────────────────────────────────────
    wealthScore: {
      score      : { type: Number, default: 0, min: 0, max: 1000 },
      level      : { type: String, default: 'Beginner' },
      badges     : [{ type: String }],
      lastUpdated: { type: Date },
    },

    // ── Authentication Tokens ──────────────────────────────────────────────
    refreshToken: {
      type  : String,
      select: false,
    },
    passwordResetToken: {
      type  : String,
      select: false,
    },
    passwordResetExpires: {
      type  : Date,
      select: false,
    },
    emailVerificationToken: {
      type  : String,
      select: false,
    },
    emailVerified: {
      type   : Boolean,
      default: false,
    },
    mfaEnabled: {
      type   : Boolean,
      default: false,
    },
    mfaSecret: {
      type  : String,
      select: false,
    },

    // ── Audit ──────────────────────────────────────────────────────────────
    lastLogin: {
      type: Date,
    },
    loginCount: {
      type   : Number,
      default: 0,
    },
    isActive: {
      type   : Boolean,
      default: true,
    },
    deactivatedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON    : { virtuals: true },
    toObject  : { virtuals: true },
  }
);

// ─── Indexes ───────────────────────────────────────────────────────────────
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ 'subscription.plan': 1, 'subscription.isActive': 1 });

// ─── Virtuals ──────────────────────────────────────────────────────────────
userSchema.virtual('portfolios', {
  ref         : 'Portfolio',
  localField  : '_id',
  foreignField: 'userId',
});

userSchema.virtual('isPremium').get(function () {
  return ['premium', 'admin'].includes(this.role) || this.subscription?.isActive;
});

// ─── Pre-save Hooks ────────────────────────────────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 12;
  this.password    = await bcrypt.hash(this.password, saltRounds);
  next();
});

// ─── Instance Methods ──────────────────────────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken             = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken      = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.passwordResetExpires    = Date.now() + 10 * 60 * 1000; // 10 minutes
  return resetToken;
};

userSchema.methods.createEmailVerificationToken = function () {
  const token                    = crypto.randomBytes(32).toString('hex');
  this.emailVerificationToken    = crypto.createHash('sha256').update(token).digest('hex');
  return token;
};

userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshToken;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;
  delete obj.emailVerificationToken;
  return obj;
};

// ─── Static Methods ────────────────────────────────────────────────────────
userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() });
};

const User = mongoose.model('User', userSchema);
module.exports = User;
