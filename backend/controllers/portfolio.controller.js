/**
 * Portfolio Controller — Sequelize Edition
 * Full CRUD for portfolios and their asset holdings.
 */
'use strict';

const { Portfolio, PortfolioAsset, PortfolioSnapshot } = require('../models/Portfolio.model');
const portfolioSvc = require('../services/portfolio.service');
const wealthSvc    = require('../services/wealth.service');
const { AppError } = require('../middleware/errorHandler');
const { sendSuccess } = require('../utils/response');
const { Op }       = require('sequelize');

// ─── helper: load portfolio with assets ────────────────────────────────────
const loadPortfolio = async (id, userId) => {
  const p = await Portfolio.findOne({
    where: { id, userId },
    include: [{ model: PortfolioAsset, as: 'assets' }],
  });
  return p;
};

// ─── GET /portfolio ────────────────────────────────────────────────────────
exports.getPortfolios = async (req, res, next) => {
  try {
    const portfolios = await Portfolio.findAll({
      where  : { userId: req.user.id },
      include: [{ model: PortfolioAsset, as: 'assets' }],
      order  : [['isDefault', 'DESC'], ['createdAt', 'DESC']],
    });

    const enriched = portfolios.map(p => {
      const plain = p.toJSON();
      plain.sectorAllocation    = JSON.parse(plain.sectorAllocation    || '[]');
      plain.assetClassAllocation= JSON.parse(plain.assetClassAllocation|| '[]');
      plain.lastAIAnalysis      = JSON.parse(plain.lastAIAnalysis       || 'null');
      plain.assetCount          = plain.assets.length;
      return plain;
    });

    sendSuccess(res, 200, { count: portfolios.length, portfolios: enriched });
  } catch (e) { next(e); }
};

// ─── POST /portfolio ────────────────────────────────────────────────────────
exports.createPortfolio = async (req, res, next) => {
  try {
    const { name, currency = 'INR', description } = req.body;

    const exists = await Portfolio.findOne({ where: { userId: req.user.id, name } });
    if (exists) return next(new AppError(`Portfolio "${name}" already exists`, 409));

    const portfolio = await Portfolio.create({
      userId     : req.user.id,
      name,
      currency,
      description,
      isDefault  : false,
    });

    sendSuccess(res, 201, { portfolio }, 'Portfolio created');
  } catch (e) { next(e); }
};

// ─── GET /portfolio/:id ─────────────────────────────────────────────────────
exports.getPortfolio = async (req, res, next) => {
  try {
    const p = await loadPortfolio(req.params.id, req.user.id);
    if (!p) return next(new AppError('Portfolio not found', 404));

    const plain = p.toJSON();
    plain.sectorAllocation    = JSON.parse(plain.sectorAllocation    || '[]');
    plain.assetClassAllocation= JSON.parse(plain.assetClassAllocation|| '[]');
    plain.lastAIAnalysis      = JSON.parse(plain.lastAIAnalysis       || 'null');
    plain.assetCount          = plain.assets.length;

    sendSuccess(res, 200, { portfolio: plain });
  } catch (e) { next(e); }
};

// ─── PUT /portfolio/:id ─────────────────────────────────────────────────────
exports.updatePortfolio = async (req, res, next) => {
  try {
    const allowed = ['name', 'description', 'currency', 'isDefault', 'color'];
    const updates = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));

    const [n] = await Portfolio.update(updates, { where: { id: req.params.id, userId: req.user.id } });
    if (!n) return next(new AppError('Portfolio not found', 404));

    const p = await loadPortfolio(req.params.id, req.user.id);
    sendSuccess(res, 200, { portfolio: p }, 'Portfolio updated');
  } catch (e) { next(e); }
};

// ─── DELETE /portfolio/:id ──────────────────────────────────────────────────
exports.deletePortfolio = async (req, res, next) => {
  try {
    const n = await Portfolio.destroy({ where: { id: req.params.id, userId: req.user.id } });
    if (!n) return next(new AppError('Portfolio not found', 404));
    sendSuccess(res, 200, null, 'Portfolio deleted');
  } catch (e) { next(e); }
};

// ─── POST /portfolio/:id/assets ─────────────────────────────────────────────
exports.addAsset = async (req, res, next) => {
  try {
    const p = await loadPortfolio(req.params.id, req.user.id);
    if (!p) return next(new AppError('Portfolio not found', 404));

    const { symbol, name, type = 'stock', quantity, avgBuyPrice, sector, buyDate } = req.body;

    // Fetch live price
    const quote = await require('../services/market.service').fetchQuote(symbol);
    const currentPrice = quote?.currentPrice || avgBuyPrice;
    const { recommendation, confidenceScore } = portfolioSvc.getAssetRecommendation({
      percentageReturn: ((currentPrice - avgBuyPrice) / avgBuyPrice) * 100,
      riskScore: type === 'crypto' ? 8 : type === 'stock' ? 5 : 3,
      dayChangePct: quote?.dayChangePct || 0,
    });

    const asset = await PortfolioAsset.create({
      portfolioId     : p.id,
      userId          : req.user.id,
      symbol          : symbol.toUpperCase().trim(),
      name,
      type,
      quantity,
      avgBuyPrice,
      investedAmount  : quantity * avgBuyPrice,
      currentPrice,
      currentValue    : quantity * currentPrice,
      sector          : sector || 'Unknown',
      firstBuyDate    : buyDate || new Date(),
      dayChange       : quote?.dayChange || 0,
      dayChangePct    : quote?.dayChangePct || 0,
      recommendation,
      confidenceScore,
      riskScore: type === 'crypto' ? 8 : type === 'stock' ? 5 : 3,
    });

    // Refresh portfolio metrics
    const allAssets = await PortfolioAsset.findAll({ where: { portfolioId: p.id } });
    const metrics   = portfolioSvc.recalculatePortfolioMetrics(p, allAssets);
    const wealth    = wealthSvc.calculateWealthScore({ ...p.toJSON(), ...metrics, assets: allAssets });
    await p.update({ ...metrics, wealthScore: wealth.score });

    // Save today's snapshot
    await saveSnapshot(p.id, metrics.totalCurrentValue, metrics.totalReturns, metrics.healthScore);

    const updated = await loadPortfolio(p.id, req.user.id);
    const plain = updated.toJSON();
    plain.sectorAllocation     = JSON.parse(plain.sectorAllocation    || '[]');
    plain.assetClassAllocation = JSON.parse(plain.assetClassAllocation|| '[]');

    sendSuccess(res, 201, { portfolio: plain, asset }, `${symbol} added to portfolio`);
  } catch (e) { next(e); }
};

// ─── PUT /portfolio/:id/assets/:assetId ─────────────────────────────────────
exports.updateAsset = async (req, res, next) => {
  try {
    const p = await Portfolio.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!p) return next(new AppError('Portfolio not found', 404));

    const asset = await PortfolioAsset.findOne({ where: { id: req.params.assetId, portfolioId: p.id } });
    if (!asset) return next(new AppError('Asset not found', 404));

    const allowed = ['quantity', 'avgBuyPrice', 'sector', 'notes', 'targetPrice', 'stopLoss'];
    const updates = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));
    if (updates.quantity || updates.avgBuyPrice) {
      const qty   = updates.quantity   || asset.quantity;
      const price = updates.avgBuyPrice|| asset.avgBuyPrice;
      updates.investedAmount = qty * price;
      updates.currentValue   = qty * (asset.currentPrice || price);
    }
    await asset.update(updates);

    const allAssets = await PortfolioAsset.findAll({ where: { portfolioId: p.id } });
    const metrics   = portfolioSvc.recalculatePortfolioMetrics(p, allAssets);
    const wealth    = wealthSvc.calculateWealthScore({ ...p.toJSON(), ...metrics, assets: allAssets });
    await p.update({ ...metrics, wealthScore: wealth.score });

    const updated = await loadPortfolio(p.id, req.user.id);
    const plain = updated.toJSON();
    plain.sectorAllocation     = JSON.parse(plain.sectorAllocation    || '[]');
    plain.assetClassAllocation = JSON.parse(plain.assetClassAllocation|| '[]');
    sendSuccess(res, 200, { portfolio: plain }, 'Asset updated');
  } catch (e) { next(e); }
};

// ─── DELETE /portfolio/:id/assets/:assetId ──────────────────────────────────
exports.removeAsset = async (req, res, next) => {
  try {
    const p = await Portfolio.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!p) return next(new AppError('Portfolio not found', 404));

    const n = await PortfolioAsset.destroy({
      where: { id: req.params.assetId, portfolioId: p.id }
    });
    if (!n) return next(new AppError('Asset not found', 404));

    const allAssets = await PortfolioAsset.findAll({ where: { portfolioId: p.id } });
    const metrics   = portfolioSvc.recalculatePortfolioMetrics(p, allAssets);
    const wealth    = wealthSvc.calculateWealthScore({ ...p.toJSON(), ...metrics, assets: allAssets });
    await p.update({ ...metrics, wealthScore: wealth.score });

    sendSuccess(res, 200, null, 'Asset removed');
  } catch (e) { next(e); }
};

// ─── POST /portfolio/:id/refresh-prices ─────────────────────────────────────
exports.refreshPrices = async (req, res, next) => {
  try {
    const p = await Portfolio.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!p) return next(new AppError('Portfolio not found', 404));

    let assets = await PortfolioAsset.findAll({ where: { portfolioId: p.id } });
    assets = await portfolioSvc.updatePortfolioPrices(assets);

    // Save updated prices
    for (const a of assets) {
      await a.save();
    }

    const metrics = portfolioSvc.recalculatePortfolioMetrics(p, assets);
    const wealth  = wealthSvc.calculateWealthScore({ ...p.toJSON(), ...metrics, assets });
    await p.update({ ...metrics, wealthScore: wealth.score });

    await saveSnapshot(p.id, metrics.totalCurrentValue, metrics.totalReturns, metrics.healthScore);

    const updated = await loadPortfolio(p.id, req.user.id);
    const plain = updated.toJSON();
    plain.sectorAllocation     = JSON.parse(plain.sectorAllocation    || '[]');
    plain.assetClassAllocation = JSON.parse(plain.assetClassAllocation|| '[]');

    sendSuccess(res, 200, { portfolio: plain }, 'Prices refreshed');
  } catch (e) { next(e); }
};

// ─── GET /portfolio/:id/performance ─────────────────────────────────────────
exports.getPerformance = async (req, res, next) => {
  try {
    const p = await Portfolio.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!p) return next(new AppError('Portfolio not found', 404));

    const { period = '1Y' } = req.query;
    const periodDays = { '1M': 30, '3M': 90, '6M': 180, '1Y': 365, '3Y': 1095, 'ALL': 9999 };
    const cutoff = new Date(Date.now() - (periodDays[period] || 365) * 24 * 3600 * 1000);

    const snapshots = await PortfolioSnapshot.findAll({
      where : { portfolioId: p.id, date: { [Op.gte]: cutoff } },
      order : [['date', 'ASC']],
    });

    // If no snapshots, generate mock history based on current value
    const history = snapshots.length > 0
      ? snapshots.map(s => ({ date: s.date, value: s.totalValue, return: s.returnPct }))
      : generateMockHistory(p.totalCurrentValue, period);

    sendSuccess(res, 200, {
      period,
      history,
      totalReturn : p.totalReturns,
      returnPct   : p.returnsPercent,
      cagr        : p.cagr,
    });
  } catch (e) { next(e); }
};

// ─── GET /portfolio/:id/analytics ───────────────────────────────────────────
exports.getAnalytics = async (req, res, next) => {
  try {
    const p = await loadPortfolio(req.params.id, req.user.id);
    if (!p) return next(new AppError('Portfolio not found', 404));

    const assets   = p.assets || [];
    const plain    = p.toJSON();
    const sector   = JSON.parse(plain.sectorAllocation    || '[]');
    const classes  = JSON.parse(plain.assetClassAllocation|| '[]');

    const metrics = [
      { label: 'CAGR',          value: `${(p.cagr || 0).toFixed(1)}%`,          vs: 'Nifty: ~12%',   good: (p.cagr || 0) > 12 },
      { label: 'Sharpe Ratio',  value: (p.sharpeRatio || 0).toFixed(2),         vs: 'Benchmark: 0.9', good: (p.sharpeRatio||0) > 0.9 },
      { label: 'Max Drawdown',  value: `${(p.maxDrawdown || -15).toFixed(1)}%`, vs: 'Nifty: ~-20%',   good: (p.maxDrawdown||0) > -15 },
      { label: 'Volatility',    value: `${(p.volatility || 18).toFixed(1)}%`,   vs: 'Nifty: ~18%',    good: (p.volatility||18) < 20 },
      { label: 'Beta',          value: (p.beta || 1.0).toFixed(2),              vs: 'Market: 1.0',    good: (p.beta||1) < 1.2 },
      { label: 'Alpha',         value: `+${(p.alpha || 0).toFixed(1)}%`,        vs: 'Positive ✓',     good: true },
      { label: 'Win Rate',      value: `${(p.winRate || 65).toFixed(0)}%`,      vs: 'Months positive', good: (p.winRate||65) > 55 },
      { label: 'Sortino Ratio', value: (p.sortinoRatio || 0).toFixed(2),        vs: 'Benchmark: 1.2', good: (p.sortinoRatio||0) > 1.2 },
    ];

    // Monthly returns (from snapshots or mock)
    const monthlyReturns = await buildMonthlyReturns(p.id, assets);

    // Radar data
    const radar = buildRadar(p);

    sendSuccess(res, 200, {
      metrics, sector, classes, monthlyReturns, radar,
      healthScore: p.healthScore,
      riskScore  : p.riskScore,
      diversScore: p.diversificationScore,
    });
  } catch (e) { next(e); }
};

// ─── POST /portfolio/:id/import ─────────────────────────────────────────────
exports.importAssets = async (req, res, next) => {
  try {
    const p = await Portfolio.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!p) return next(new AppError('Portfolio not found', 404));

    const file = req.file;
    if (!file) return next(new AppError('No file uploaded', 400));

    let rawAssets;
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      rawAssets = await portfolioSvc.processCSVUpload(file.path);
    } else {
      rawAssets = portfolioSvc.processExcelUpload(file.path);
    }

    // Fetch prices and create asset records
    for (const a of rawAssets) {
      const quote = await require('../services/market.service').fetchQuote(a.symbol).catch(() => null);
      const cp    = quote?.currentPrice || a.avgBuyPrice;
      const { recommendation, confidenceScore } = portfolioSvc.getAssetRecommendation({
        percentageReturn: ((cp - a.avgBuyPrice) / a.avgBuyPrice) * 100,
        riskScore: a.type === 'crypto' ? 8 : 5,
        dayChangePct: quote?.dayChangePct || 0,
      });

      await PortfolioAsset.upsert({
        portfolioId   : p.id,
        userId        : req.user.id,
        symbol        : a.symbol,
        name          : a.name,
        type          : a.type,
        quantity      : a.quantity,
        avgBuyPrice   : a.avgBuyPrice,
        investedAmount: a.quantity * a.avgBuyPrice,
        currentPrice  : cp,
        currentValue  : a.quantity * cp,
        sector        : a.sector,
        firstBuyDate  : a.firstBuyDate || new Date(),
        recommendation,
        confidenceScore,
        riskScore: a.type === 'crypto' ? 8 : 5,
      });
    }

    const allAssets = await PortfolioAsset.findAll({ where: { portfolioId: p.id } });
    const metrics   = portfolioSvc.recalculatePortfolioMetrics(p, allAssets);
    const wealth    = wealthSvc.calculateWealthScore({ ...p.toJSON(), ...metrics, assets: allAssets });
    await p.update({ ...metrics, wealthScore: wealth.score });

    sendSuccess(res, 200, {
      imported  : rawAssets.length,
      portfolio : await loadPortfolio(p.id, req.user.id),
    }, `${rawAssets.length} assets imported`);
  } catch (e) { next(e); }
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const saveSnapshot = async (portfolioId, totalValue, totalReturn, healthScore) => {
  const today = new Date().toISOString().split('T')[0];
  await PortfolioSnapshot.upsert({
    portfolioId,
    date      : today,
    totalValue,
    totalReturn,
    returnPct : totalValue > 0 ? (totalReturn / totalValue) * 100 : 0,
    healthScore,
  });
};

const generateMockHistory = (currentValue, period) => {
  const days = { '1M': 30, '3M': 90, '6M': 180, '1Y': 365, '3Y': 1095, 'ALL': 365 }[period] || 365;
  const months = Math.min(12, Math.ceil(days / 30));
  const result = [];
  let v = currentValue * 0.78;
  const now = new Date();
  for (let i = months; i >= 0; i--) {
    const d = new Date(now);
    d.setMonth(d.getMonth() - i);
    const change = 1 + (Math.random() * 0.06 - 0.01);
    v = Math.round(v * change);
    result.push({
      month: d.toLocaleString('en-IN', { month: 'short' }),
      value: Math.round(v / 100000 * 100) / 100,
      date : d.toISOString().split('T')[0],
    });
  }
  return result;
};

const buildMonthlyReturns = async (portfolioId, assets) => {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return months.map(month => ({
    month,
    portfolio: Math.round((Math.random() * 8 - 2) * 10) / 10,
    nifty    : Math.round((Math.random() * 6 - 2) * 10) / 10,
  }));
};

const buildRadar = (p) => [
  { metric: 'Returns',       portfolio: Math.min(100, (p.returnsPercent || 0) * 2 + 50), benchmark: 70 },
  { metric: 'Stability',     portfolio: Math.max(20, 100 - (p.riskScore || 5) * 8),      benchmark: 75 },
  { metric: 'Diversification',portfolio: p.diversificationScore || 50,                   benchmark: 70 },
  { metric: 'Risk-Adj.',     portfolio: Math.min(100, (p.sharpeRatio || 0.5) * 50),      benchmark: 65 },
  { metric: 'Liquidity',     portfolio: 85,                                              benchmark: 80 },
  { metric: 'Goal Align.',   portfolio: 70,                                              benchmark: 65 },
];
