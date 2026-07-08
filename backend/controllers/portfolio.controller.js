/**
 * Portfolio Controller
 * Handles CRUD for portfolios and their asset holdings.
 */
'use strict';

const Portfolio    = require('../models/Portfolio.model');
const portfolioSvc = require('../services/portfolio.service');
const { AppError } = require('../middleware/errorHandler');
const { sendSuccess, sendError } = require('../utils/response');

// ── GET /portfolios ─────────────────────────────────────────────────────────
exports.getPortfolios = async (req, res, next) => {
  try {
    const portfolios = await Portfolio.find({ userId: req.user._id })
      .sort({ isDefault: -1, createdAt: -1 });

    sendSuccess(res, 200, {
      count     : portfolios.length,
      portfolios,
    });
  } catch (e) { next(e); }
};

// ── POST /portfolios ────────────────────────────────────────────────────────
exports.createPortfolio = async (req, res, next) => {
  try {
    const { name, currency = 'INR', description } = req.body;

    const exists = await Portfolio.findOne({ userId: req.user._id, name });
    if (exists) return next(new AppError(`Portfolio "${name}" already exists`, 409));

    const portfolio = await Portfolio.create({
      userId     : req.user._id,
      name,
      currency,
      description,
      isDefault  : false,
    });

    sendSuccess(res, 201, { portfolio }, 'Portfolio created successfully');
  } catch (e) { next(e); }
};

// ── GET /portfolios/:id ─────────────────────────────────────────────────────
exports.getPortfolio = async (req, res, next) => {
  try {
    const portfolio = await Portfolio.findOne({ _id: req.params.id, userId: req.user._id });
    if (!portfolio) return next(new AppError('Portfolio not found', 404));

    sendSuccess(res, 200, { portfolio });
  } catch (e) { next(e); }
};

// ── PUT /portfolios/:id ─────────────────────────────────────────────────────
exports.updatePortfolio = async (req, res, next) => {
  try {
    const allowed = ['name', 'description', 'currency', 'isDefault'];
    const updates = Object.fromEntries(
      Object.entries(req.body).filter(([k]) => allowed.includes(k))
    );

    const portfolio = await Portfolio.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      updates,
      { new: true, runValidators: true }
    );
    if (!portfolio) return next(new AppError('Portfolio not found', 404));

    sendSuccess(res, 200, { portfolio }, 'Portfolio updated');
  } catch (e) { next(e); }
};

// ── DELETE /portfolios/:id ──────────────────────────────────────────────────
exports.deletePortfolio = async (req, res, next) => {
  try {
    const portfolio = await Portfolio.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!portfolio) return next(new AppError('Portfolio not found', 404));

    sendSuccess(res, 200, null, 'Portfolio deleted');
  } catch (e) { next(e); }
};

// ── POST /portfolios/:id/assets ─────────────────────────────────────────────
exports.addAsset = async (req, res, next) => {
  try {
    const portfolio = await Portfolio.findOne({ _id: req.params.id, userId: req.user._id });
    if (!portfolio) return next(new AppError('Portfolio not found', 404));

    const { symbol, name, type, quantity, avgBuyPrice, sector, buyDate } = req.body;

    // Fetch live price
    let currentPrice = avgBuyPrice;
    try {
      currentPrice = await portfolioSvc.fetchStockPrice(symbol) || avgBuyPrice;
    } catch (_) {}

    const asset = {
      symbol,
      name,
      type,
      quantity,
      avgBuyPrice,
      currentPrice,
      currentValue : currentPrice * quantity,
      sector       : sector || 'Other',
      buyDate      : buyDate || new Date(),
    };

    portfolio.assets.push(asset);
    portfolioSvc.recalculateScores(portfolio);
    await portfolio.save();

    sendSuccess(res, 201, { portfolio }, `${symbol} added to portfolio`);
  } catch (e) { next(e); }
};

// ── PUT /portfolios/:id/assets/:assetId ─────────────────────────────────────
exports.updateAsset = async (req, res, next) => {
  try {
    const portfolio = await Portfolio.findOne({ _id: req.params.id, userId: req.user._id });
    if (!portfolio) return next(new AppError('Portfolio not found', 404));

    const asset = portfolio.assets.id(req.params.assetId);
    if (!asset) return next(new AppError('Asset not found', 404));

    const { quantity, avgBuyPrice, sector, notes } = req.body;
    if (quantity !== undefined) asset.quantity     = quantity;
    if (avgBuyPrice !== undefined) asset.avgBuyPrice = avgBuyPrice;
    if (sector !== undefined)   asset.sector       = sector;
    if (notes !== undefined)    asset.notes        = notes;

    asset.currentValue = (asset.currentPrice || asset.avgBuyPrice) * asset.quantity;
    portfolioSvc.recalculateScores(portfolio);
    await portfolio.save();

    sendSuccess(res, 200, { portfolio }, 'Asset updated');
  } catch (e) { next(e); }
};

// ── DELETE /portfolios/:id/assets/:assetId ───────────────────────────────────
exports.removeAsset = async (req, res, next) => {
  try {
    const portfolio = await Portfolio.findOne({ _id: req.params.id, userId: req.user._id });
    if (!portfolio) return next(new AppError('Portfolio not found', 404));

    const assetIdx = portfolio.assets.findIndex(a => a._id.toString() === req.params.assetId);
    if (assetIdx === -1) return next(new AppError('Asset not found', 404));

    portfolio.assets.splice(assetIdx, 1);
    portfolioSvc.recalculateScores(portfolio);
    await portfolio.save();

    sendSuccess(res, 200, null, 'Asset removed');
  } catch (e) { next(e); }
};

// ── POST /portfolios/:id/refresh-prices ─────────────────────────────────────
exports.refreshPrices = async (req, res, next) => {
  try {
    const portfolio = await Portfolio.findOne({ _id: req.params.id, userId: req.user._id });
    if (!portfolio) return next(new AppError('Portfolio not found', 404));

    await portfolioSvc.updatePortfolioPrices(portfolio);
    portfolioSvc.recalculateScores(portfolio);
    await portfolioSvc.checkAndCreateAlerts(portfolio, req.user._id);
    await portfolio.save();

    sendSuccess(res, 200, { portfolio }, 'Prices refreshed successfully');
  } catch (e) { next(e); }
};

// ── GET /portfolios/:id/performance ─────────────────────────────────────────
exports.getPerformance = async (req, res, next) => {
  try {
    const portfolio = await Portfolio.findOne({ _id: req.params.id, userId: req.user._id });
    if (!portfolio) return next(new AppError('Portfolio not found', 404));

    const { period = '1Y' } = req.query;
    const snapshots = portfolio.snapshots || [];

    // Filter snapshots by period
    const now    = new Date();
    const cutoff = new Date();
    const periodDays = { '1M': 30, '3M': 90, '6M': 180, '1Y': 365, '3Y': 1095, 'ALL': 99999 };
    cutoff.setDate(now.getDate() - (periodDays[period] || 365));

    const filtered = snapshots.filter(s => new Date(s.date) >= cutoff);

    sendSuccess(res, 200, {
      period,
      snapshots  : filtered,
      totalReturn: portfolio.totalReturns || 0,
      returnPct  : portfolio.returnsPercent || 0,
      cagr       : portfolio.cagr || 0,
    });
  } catch (e) { next(e); }
};
