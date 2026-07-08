/**
 * Goal Model
 * ──────────
 * Investment goal tracking with progress calculation, SIP planning,
 * and AI-powered milestone suggestions.
 */

'use strict';

const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema({
  title      : { type: String, required: true },
  targetDate : { type: Date, required: true },
  targetAmount: { type: Number, required: true },
  achieved   : { type: Boolean, default: false },
  achievedAt : { type: Date },
}, { _id: true });

const goalSchema = new mongoose.Schema(
  {
    userId: {
      type    : mongoose.Schema.Types.ObjectId,
      ref     : 'User',
      required: true,
      index   : true,
    },
    portfolioId: {
      type: mongoose.Schema.Types.ObjectId,
      ref : 'Portfolio',
    },
    name: {
      type     : String,
      required : [true, 'Goal name is required'],
      trim     : true,
      maxlength: 100,
    },
    type: {
      type    : String,
      required: true,
      enum    : ['retirement', 'education', 'home', 'car', 'vacation', 'emergency_fund', 'wedding', 'business', 'wealth', 'custom'],
    },
    description : { type: String, maxlength: 500 },
    targetAmount: { type: Number, required: [true, 'Target amount is required'], min: 1 },
    currentAmount: { type: Number, default: 0 },
    targetDate  : { type: Date, required: [true, 'Target date is required'] },
    startDate   : { type: Date, default: Date.now },

    // ── SIP Planning ──────────────────────────────────────────────────────
    monthlySIP       : { type: Number, default: 0 },
    expectedReturns  : { type: Number, default: 12 }, // % per annum
    inflationRate    : { type: Number, default: 6 },   // % per annum
    inflationAdjusted: { type: Boolean, default: true },

    // ── Progress ──────────────────────────────────────────────────────────
    progressPercent : { type: Number, default: 0, min: 0, max: 100 },
    status          : {
      type   : String,
      enum   : ['active', 'paused', 'completed', 'at_risk', 'abandoned'],
      default: 'active',
    },
    onTrack         : { type: Boolean, default: true },
    projectedValue  : { type: Number, default: 0 },
    shortfall       : { type: Number, default: 0 },

    milestones      : [milestoneSchema],

    // ── AI Insights ───────────────────────────────────────────────────────
    aiSuggestions   : [{ type: String }],
    riskLevel       : { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },

    icon            : { type: String, default: '🎯' },
    color           : { type: String, default: '#667eea' },
    priority        : { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
    tags            : [{ type: String }],
    notes           : { type: String },
  },
  {
    timestamps: true,
    toJSON    : { virtuals: true },
    toObject  : { virtuals: true },
  }
);

// ─── Virtuals ─────────────────────────────────────────────────────────────
goalSchema.virtual('daysRemaining').get(function () {
  const now  = new Date();
  const diff = this.targetDate - now;
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
});

goalSchema.virtual('monthsRemaining').get(function () {
  const now    = new Date();
  const target = new Date(this.targetDate);
  return Math.max(0,
    (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth())
  );
});

// ─── Pre-save ─────────────────────────────────────────────────────────────
goalSchema.pre('save', function (next) {
  if (this.targetAmount > 0) {
    this.progressPercent = Math.min(100,
      ((this.currentAmount / this.targetAmount) * 100)
    );
    if (this.progressPercent >= 100) this.status = 'completed';
  }
  next();
});

goalSchema.index({ userId: 1, status: 1 });
goalSchema.index({ userId: 1, targetDate: 1 });

const Goal = mongoose.model('Goal', goalSchema);
module.exports = Goal;
