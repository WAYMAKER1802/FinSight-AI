/**
 * Alert Model — Smart Financial Alerts
 * ──────────────────────────────────────
 */

'use strict';

const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema(
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
    type: {
      type    : String,
      required: true,
      enum    : [
        'price_target',    // Stock hit target price
        'stop_loss',       // Stop loss triggered
        'portfolio_drop',  // Portfolio dropped by X%
        'portfolio_rise',  // Portfolio rose by X%
        'goal_at_risk',    // Investment goal at risk
        'rebalance',       // Portfolio needs rebalancing
        'news',            // Important news about a holding
        'ai_recommendation',// AI changed recommendation
        'market_event',    // Market-wide event
        'dividend',        // Dividend declared
        'earnings',        // Earnings announcement
        'custom',          // User-defined
      ],
    },
    title       : { type: String, required: true, maxlength: 200 },
    message     : { type: String, required: true, maxlength: 1000 },
    severity    : { type: String, enum: ['info', 'warning', 'critical', 'success'], default: 'info' },

    // ── Target ─────────────────────────────────────────────────────────────
    symbol      : { type: String, uppercase: true },
    targetPrice : { type: Number },
    currentPrice: { type: Number },
    threshold   : { type: Number },

    // ── Status ─────────────────────────────────────────────────────────────
    isRead      : { type: Boolean, default: false, index: true },
    isTriggered : { type: Boolean, default: false },
    isActive    : { type: Boolean, default: true },
    triggeredAt : { type: Date },
    readAt      : { type: Date },

    // ── Notification Channels ──────────────────────────────────────────────
    channels    : [{
      type: String,
      enum: ['push', 'email', 'sms', 'in_app'],
    }],
    notifiedAt  : { type: Date },

    expiresAt   : { type: Date },
    metadata    : { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

alertSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
alertSchema.index({ userId: 1, symbol: 1, type: 1 });
alertSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

const Alert = mongoose.model('Alert', alertSchema);
module.exports = Alert;
