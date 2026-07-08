/**
 * Portfolio Model
 * ───────────────
 * Comprehensive schema for financial portfolios including assets,
 * performance metrics, AI scores, and historical snapshots.
 */

'use strict';

const mongoose = require('mongoose');

// ─── Asset Sub-schema ──────────────────────────────────────────────────────
const assetSchema = new mongoose.Schema({
  symbol       : { type: String, required: true, uppercase: true, trim: true },
  name         : { type: String, required: true, trim: true },
  type         : {
    type    : String,
    required: true,
    enum    : ['stock', 'mutual_fund', 'etf', 'crypto', 'gold', 'bond', 'fd', 'ppf', 'nps', 'real_estate', 'other'],
  },
  sector       : { type: String, default: 'Unknown' },
  exchange     : { type: String, default: 'NSE' },

  // ── Position ──────────────────────────────────────────────────────────────
  quantity     : { type: Number, required: true, min: 0 },
  avgBuyPrice  : { type: Number, required: true, min: 0 },
  investedAmount: { type: Number },
  currentPrice : { type: Number, default: 0 },
  currentValue : { type: Number, default: 0 },
  allocationPct: { type: Number, default: 0 },

  // ── Performance ───────────────────────────────────────────────────────────
  absoluteReturn   : { type: Number, default: 0 },
  percentageReturn : { type: Number, default: 0 },
  dayChange        : { type: Number, default: 0 },
  dayChangePct     : { type: Number, default: 0 },
  weekChange       : { type: Number, default: 0 },
  monthChange      : { type: Number, default: 0 },
  yearChange       : { type: Number, default: 0 },

  // ── AI Fields ─────────────────────────────────────────────────────────────
  recommendation: {
    type   : String,
    enum   : ['strong_buy', 'buy', 'hold', 'sell', 'strong_sell'],
    default: 'hold',
  },
  confidenceScore  : { type: Number, min: 0, max: 100, default: 50 },
  sentimentScore   : { type: Number, min: -1, max: 1, default: 0 },
  technicalScore   : { type: Number, min: 0, max: 100 },
  fundamentalScore : { type: Number, min: 0, max: 100 },
  riskScore        : { type: Number, min: 0, max: 10 },

  // ── Buy Dates ─────────────────────────────────────────────────────────────
  firstBuyDate : { type: Date },
  lastBuyDate  : { type: Date },

  // ── Target Prices ─────────────────────────────────────────────────────────
  targetPrice  : { type: Number },
  stopLoss     : { type: Number },

  notes        : { type: String, maxlength: 500 },
  tags         : [{ type: String }],
}, { _id: true });

// ─── Portfolio Schema ──────────────────────────────────────────────────────
const portfolioSchema = new mongoose.Schema(
  {
    userId: {
      type    : mongoose.Schema.Types.ObjectId,
      ref     : 'User',
      required: true,
      index   : true,
    },
    name: {
      type     : String,
      required : [true, 'Portfolio name is required'],
      trim     : true,
      maxlength: [100, 'Portfolio name cannot exceed 100 characters'],
    },
    description: {
      type     : String,
      maxlength: 500,
    },
    currency: {
      type   : String,
      default: 'INR',
      enum   : ['INR', 'USD', 'EUR', 'GBP'],
    },
    isDefault: {
      type   : Boolean,
      default: false,
    },
    color: {
      type   : String,
      default: '#667eea',
    },

    // ── Assets ──────────────────────────────────────────────────────────────
    assets: [assetSchema],

    // ── Aggregate Metrics ────────────────────────────────────────────────────
    totalInvested   : { type: Number, default: 0 },
    totalCurrentValue: { type: Number, default: 0 },
    totalReturns    : { type: Number, default: 0 },
    returnsPercent  : { type: Number, default: 0 },
    dayPnl          : { type: Number, default: 0 },
    dayPnlPercent   : { type: Number, default: 0 },

    // ── XIRR / CAGR ──────────────────────────────────────────────────────────
    xirr  : { type: Number },
    cagr  : { type: Number },

    // ── AI Portfolio Scores ───────────────────────────────────────────────────
    healthScore        : { type: Number, min: 0, max: 100, default: 0 },
    riskScore          : { type: Number, min: 0, max: 10, default: 5 },
    diversificationScore: { type: Number, min: 0, max: 100, default: 0 },
    wealthScore        : { type: Number, min: 0, max: 1000, default: 0 },
    momentumScore      : { type: Number, min: 0, max: 100, default: 0 },

    // ── Diversification Breakdown ─────────────────────────────────────────────
    sectorAllocation: [{
      sector    : String,
      percentage: Number,
      value     : Number,
    }],
    assetClassAllocation: [{
      assetClass: String,
      percentage: Number,
      value     : Number,
    }],

    // ── AI Analysis ───────────────────────────────────────────────────────────
    lastAIAnalysis: {
      summary     : { type: String },
      insights    : [{ type: String }],
      warnings    : [{ type: String }],
      opportunities: [{ type: String }],
      analyzedAt  : { type: Date },
    },
    overallSentiment: {
      type   : String,
      enum   : ['very_bullish', 'bullish', 'neutral', 'bearish', 'very_bearish'],
      default: 'neutral',
    },

    // ── Historical Snapshots (for Portfolio Replay) ───────────────────────────
    snapshots: [{
      date       : { type: Date, required: true },
      totalValue : { type: Number, required: true },
      totalReturn: { type: Number },
      healthScore: { type: Number },
    }],

    // ── Sharing ───────────────────────────────────────────────────────────────
    isPublic   : { type: Boolean, default: false },
    shareToken : { type: String },
    sharedWith : [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    tags       : [{ type: String }],
  },
  {
    timestamps: true,
    toJSON    : { virtuals: true },
    toObject  : { virtuals: true },
  }
);

// ─── Indexes ────────────────────────────────────────────────────────────────
portfolioSchema.index({ userId: 1, isDefault: 1 });
portfolioSchema.index({ userId: 1, createdAt: -1 });
portfolioSchema.index({ 'assets.symbol': 1 });

// ─── Virtuals ───────────────────────────────────────────────────────────────
portfolioSchema.virtual('assetCount').get(function () {
  return this.assets?.length || 0;
});

portfolioSchema.virtual('profitLoss').get(function () {
  return (this.totalCurrentValue || 0) - (this.totalInvested || 0);
});

// ─── Pre-save: Recalculate Totals ────────────────────────────────────────────
portfolioSchema.pre('save', function (next) {
  if (this.assets && this.assets.length > 0) {
    this.totalInvested    = this.assets.reduce((s, a) => s + (a.quantity * a.avgBuyPrice), 0);
    this.totalCurrentValue= this.assets.reduce((s, a) => s + (a.currentValue || 0), 0);
    this.totalReturns     = this.totalCurrentValue - this.totalInvested;
    this.returnsPercent   = this.totalInvested > 0
      ? ((this.totalReturns / this.totalInvested) * 100)
      : 0;

    // Recalculate allocation percentages
    this.assets.forEach((asset) => {
      asset.investedAmount = asset.quantity * asset.avgBuyPrice;
      asset.allocationPct  = this.totalCurrentValue > 0
        ? ((asset.currentValue / this.totalCurrentValue) * 100)
        : 0;
      asset.absoluteReturn   = (asset.currentValue || 0) - asset.investedAmount;
      asset.percentageReturn = asset.investedAmount > 0
        ? ((asset.absoluteReturn / asset.investedAmount) * 100)
        : 0;
    });
  }
  next();
});

const Portfolio = mongoose.model('Portfolio', portfolioSchema);
module.exports = Portfolio;
