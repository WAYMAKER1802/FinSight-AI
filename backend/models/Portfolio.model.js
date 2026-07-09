/**
 * Portfolio Model — Sequelize (MySQL)
 * ─────────────────────────────────────
 * Two tables:
 *   1. Portfolios  — one per portfolio
 *   2. PortfolioAssets — one row per holding
 */
'use strict';

const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

/* ─── Portfolio ─────────────────────────────────────────────────────────── */
class Portfolio extends Model {}

Portfolio.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId:      { type: DataTypes.INTEGER, allowNull: false },
  name:        { type: DataTypes.STRING(100), allowNull: false },
  description: { type: DataTypes.STRING(500) },
  currency:    { type: DataTypes.ENUM('INR','USD','EUR','GBP'), defaultValue: 'INR' },
  isDefault:   { type: DataTypes.BOOLEAN, defaultValue: false },
  color:       { type: DataTypes.STRING, defaultValue: '#667eea' },

  // Aggregate Metrics
  totalInvested:    { type: DataTypes.FLOAT, defaultValue: 0 },
  totalCurrentValue:{ type: DataTypes.FLOAT, defaultValue: 0 },
  totalReturns:     { type: DataTypes.FLOAT, defaultValue: 0 },
  returnsPercent:   { type: DataTypes.FLOAT, defaultValue: 0 },
  dayPnl:           { type: DataTypes.FLOAT, defaultValue: 0 },
  dayPnlPercent:    { type: DataTypes.FLOAT, defaultValue: 0 },

  // Advanced metrics
  xirr:               { type: DataTypes.FLOAT },
  cagr:               { type: DataTypes.FLOAT },
  sharpeRatio:        { type: DataTypes.FLOAT },
  sortinoRatio:       { type: DataTypes.FLOAT },
  alpha:              { type: DataTypes.FLOAT },
  beta:               { type: DataTypes.FLOAT },
  volatility:         { type: DataTypes.FLOAT },
  maxDrawdown:        { type: DataTypes.FLOAT },
  winRate:            { type: DataTypes.FLOAT },

  // AI Scores
  healthScore:         { type: DataTypes.FLOAT, defaultValue: 0 },
  riskScore:           { type: DataTypes.FLOAT, defaultValue: 5 },
  diversificationScore:{ type: DataTypes.FLOAT, defaultValue: 0 },
  wealthScore:         { type: DataTypes.FLOAT, defaultValue: 0 },

  // Allocation JSON (stored as TEXT, parsed in JS)
  sectorAllocation:    { type: DataTypes.TEXT },
  assetClassAllocation:{ type: DataTypes.TEXT },

  // AI Analysis JSON
  lastAIAnalysis:      { type: DataTypes.TEXT },
  overallSentiment:    {
    type: DataTypes.ENUM('very_bullish','bullish','neutral','bearish','very_bearish'),
    defaultValue: 'neutral'
  },

  isPublic:  { type: DataTypes.BOOLEAN, defaultValue: false },
  shareToken:{ type: DataTypes.STRING },
  tags:      { type: DataTypes.STRING },   // comma-separated

}, {
  sequelize,
  modelName: 'Portfolio',
  tableName: 'Portfolios',
});

/* ─── PortfolioAsset ─────────────────────────────────────────────────────── */
class PortfolioAsset extends Model {}

PortfolioAsset.init({
  id:          { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  portfolioId: { type: DataTypes.INTEGER, allowNull: false },
  userId:      { type: DataTypes.INTEGER, allowNull: false },

  symbol:   { type: DataTypes.STRING(20), allowNull: false },
  name:     { type: DataTypes.STRING(200), allowNull: false },
  type:     {
    type: DataTypes.ENUM('stock','mutual_fund','etf','crypto','gold','bond','fd','ppf','nps','real_estate','other'),
    defaultValue: 'stock'
  },
  sector:   { type: DataTypes.STRING(100), defaultValue: 'Unknown' },
  exchange: { type: DataTypes.STRING(20), defaultValue: 'NSE' },

  // Position
  quantity:       { type: DataTypes.FLOAT, allowNull: false },
  avgBuyPrice:    { type: DataTypes.FLOAT, allowNull: false },
  investedAmount: { type: DataTypes.FLOAT, defaultValue: 0 },
  currentPrice:   { type: DataTypes.FLOAT, defaultValue: 0 },
  currentValue:   { type: DataTypes.FLOAT, defaultValue: 0 },
  allocationPct:  { type: DataTypes.FLOAT, defaultValue: 0 },

  // Performance
  absoluteReturn:   { type: DataTypes.FLOAT, defaultValue: 0 },
  percentageReturn: { type: DataTypes.FLOAT, defaultValue: 0 },
  dayChange:        { type: DataTypes.FLOAT, defaultValue: 0 },
  dayChangePct:     { type: DataTypes.FLOAT, defaultValue: 0 },

  // AI
  recommendation:  {
    type: DataTypes.ENUM('strong_buy','buy','hold','sell','strong_sell'),
    defaultValue: 'hold'
  },
  confidenceScore: { type: DataTypes.FLOAT, defaultValue: 50 },
  riskScore:       { type: DataTypes.FLOAT, defaultValue: 5 },
  technicalScore:  { type: DataTypes.FLOAT },
  fundamentalScore:{ type: DataTypes.FLOAT },
  sentimentScore:  { type: DataTypes.FLOAT, defaultValue: 0 },

  // Alerts
  targetPrice: { type: DataTypes.FLOAT },
  stopLoss:    { type: DataTypes.FLOAT },

  firstBuyDate: { type: DataTypes.DATE },
  lastBuyDate:  { type: DataTypes.DATE },
  notes:        { type: DataTypes.STRING(500) },
  tags:         { type: DataTypes.STRING },
}, {
  sequelize,
  modelName: 'PortfolioAsset',
  tableName: 'PortfolioAssets',
});

/* ─── PortfolioSnapshot ──────────────────────────────────────────────────── */
class PortfolioSnapshot extends Model {}

PortfolioSnapshot.init({
  id:          { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  portfolioId: { type: DataTypes.INTEGER, allowNull: false },
  date:        { type: DataTypes.DATEONLY, allowNull: false },
  totalValue:  { type: DataTypes.FLOAT, allowNull: false },
  totalReturn: { type: DataTypes.FLOAT },
  returnPct:   { type: DataTypes.FLOAT },
  healthScore: { type: DataTypes.FLOAT },
  dayPnl:      { type: DataTypes.FLOAT },
}, {
  sequelize,
  modelName: 'PortfolioSnapshot',
  tableName: 'PortfolioSnapshots',
});

/* ─── Associations ───────────────────────────────────────────────────────── */
Portfolio.hasMany(PortfolioAsset,    { foreignKey: 'portfolioId', as: 'assets', onDelete: 'CASCADE' });
PortfolioAsset.belongsTo(Portfolio,  { foreignKey: 'portfolioId', as: 'portfolio' });

Portfolio.hasMany(PortfolioSnapshot, { foreignKey: 'portfolioId', as: 'snapshots', onDelete: 'CASCADE' });
PortfolioSnapshot.belongsTo(Portfolio,{ foreignKey: 'portfolioId', as: 'portfolio' });

module.exports = { Portfolio, PortfolioAsset, PortfolioSnapshot };
