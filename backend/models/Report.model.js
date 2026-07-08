/**
 * Report Model — AI-generated PDF Reports
 * ─────────────────────────────────────────
 */

'use strict';

const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
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
    title   : { type: String, required: true },
    type    : {
      type: String,
      enum: ['portfolio_analysis', 'weekly_summary', 'monthly_report', 'tax_statement', 'goal_review', 'custom'],
      default: 'portfolio_analysis',
    },
    status  : { type: String, enum: ['generating', 'ready', 'failed'], default: 'generating' },

    // ── Content ────────────────────────────────────────────────────────────
    summary     : { type: String },
    insights    : [{ type: String }],
    recommendations: [{ type: String }],

    // ── File ───────────────────────────────────────────────────────────────
    filePath    : { type: String },
    fileSize    : { type: Number },   // bytes
    downloadCount: { type: Number, default: 0 },

    // ── AI Metadata ────────────────────────────────────────────────────────
    aiModel     : { type: String, default: 'gpt-4-turbo-preview' },
    tokensUsed  : { type: Number },
    generationMs: { type: Number },

    expiresAt   : { type: Date, default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
  },
  { timestamps: true }
);

reportSchema.index({ userId: 1, createdAt: -1 });
reportSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Report = mongoose.model('Report', reportSchema);
module.exports = Report;
