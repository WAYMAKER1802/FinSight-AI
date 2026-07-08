/**
 * Analytics Controller — portfolio performance metrics & benchmarks
 */
'use strict';

const Portfolio = require('../models/Portfolio.model');
const { AppError } = require('../middleware/errorHandler');
const { sendSuccess } = require('../utils/response');
const { calculateCAGR } = require('../helpers/calculators');

// GET /analytics/portfolio-performance/:id
exports.getPortfolioPerformance = async (req, res, next) => {
  try {
    const portfolio = await Portfolio.findOne({ _id: req.params.id, userId: req.user._id });
    if (!portfolio) return next(new AppError('Portfolio not found', 404));

    const { period = '1Y' } = req.query;
    const periodDays = { '1M': 30, '3M': 90, '6M': 180, '1Y': 365, '3Y': 1095, 'ALL': 99999 };
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - (periodDays[period] || 365));

    const snapshots = (portfolio.snapshots || []).filter(s => new Date(s.date) >= cutoff);

    // Top performers & worst performers
    const sortedAssets = [...(portfolio.assets || [])].sort((a, b) => {
      const retA = ((a.currentPrice - a.avgBuyPrice) / a.avgBuyPrice) * 100;
      const retB = ((b.currentPrice - b.avgBuyPrice) / b.avgBuyPrice) * 100;
      return retB - retA;
    });

    sendSuccess(res, 200, {
      period,
      summary: {
        totalInvested   : portfolio.totalInvested || 0,
        currentValue    : portfolio.totalCurrentValue || 0,
        absoluteReturn  : portfolio.totalReturns || 0,
        returnPercent   : portfolio.returnsPercent || 0,
        cagr            : portfolio.cagr || 0,
        healthScore     : portfolio.healthScore || 0,
        riskScore       : portfolio.riskScore || 0,
        diversification : portfolio.diversificationScore || 0,
      },
      snapshots,
      topPerformers   : sortedAssets.slice(0, 3).map(a => ({
        symbol     : a.symbol,
        name       : a.name,
        returnPct  : (((a.currentPrice - a.avgBuyPrice) / a.avgBuyPrice) * 100).toFixed(2),
        currentValue: a.currentValue,
      })),
      worstPerformers : sortedAssets.slice(-3).reverse().map(a => ({
        symbol     : a.symbol,
        name       : a.name,
        returnPct  : (((a.currentPrice - a.avgBuyPrice) / a.avgBuyPrice) * 100).toFixed(2),
        currentValue: a.currentValue,
      })),
      sectorAllocation: portfolio.sectorAllocation || [],
    });
  } catch (e) { next(e); }
};

// GET /analytics/sector-breakdown
exports.getSectorBreakdown = async (req, res, next) => {
  try {
    const portfolios = await Portfolio.find({ userId: req.user._id });
    const sectorMap  = {};

    portfolios.forEach(p => {
      (p.assets || []).forEach(asset => {
        const sector = asset.sector || 'Other';
        if (!sectorMap[sector]) sectorMap[sector] = { value: 0, count: 0, assets: [] };
        sectorMap[sector].value += asset.currentValue || 0;
        sectorMap[sector].count++;
        sectorMap[sector].assets.push(asset.symbol);
      });
    });

    const totalValue = Object.values(sectorMap).reduce((s, v) => s + v.value, 0);
    const breakdown  = Object.entries(sectorMap).map(([sector, data]) => ({
      sector,
      value      : data.value,
      percentage : totalValue > 0 ? ((data.value / totalValue) * 100).toFixed(2) : 0,
      count      : data.count,
      assets     : data.assets,
    })).sort((a, b) => b.value - a.value);

    sendSuccess(res, 200, { breakdown, totalValue });
  } catch (e) { next(e); }
};

// GET /analytics/top-performers
exports.getTopPerformers = async (req, res, next) => {
  try {
    const portfolios = await Portfolio.find({ userId: req.user._id });
    const allAssets  = portfolios.flatMap(p => (p.assets || []).map(a => ({
      ...a.toObject(),
      portfolioName: p.name,
      portfolioId  : p._id,
    })));

    const withReturn = allAssets.map(a => ({
      ...a,
      returnPct: a.avgBuyPrice > 0
        ? (((a.currentPrice || a.avgBuyPrice) - a.avgBuyPrice) / a.avgBuyPrice) * 100
        : 0,
    }));

    withReturn.sort((a, b) => b.returnPct - a.returnPct);

    sendSuccess(res, 200, {
      topPerformers  : withReturn.slice(0, 5),
      worstPerformers: withReturn.slice(-5).reverse(),
    });
  } catch (e) { next(e); }
};

// GET /analytics/benchmark-comparison (premium)
exports.getBenchmarkComparison = async (req, res, next) => {
  try {
    const portfolios = await Portfolio.find({ userId: req.user._id });
    if (!portfolios.length) return next(new AppError('No portfolios found', 404));

    // Mock Nifty 50 benchmark data (in production: fetch from API)
    const benchmarks = {
      'Nifty 50'     : { cagr1Y: 12.4, cagr3Y: 15.2, cagr5Y: 13.8 },
      'Sensex'       : { cagr1Y: 11.9, cagr3Y: 14.8, cagr5Y: 13.2 },
      'Nifty Midcap' : { cagr1Y: 18.2, cagr3Y: 22.1, cagr5Y: 17.5 },
    };

    const portfolioData = portfolios.map(p => ({
      name     : p.name,
      cagr     : p.cagr || 0,
      returns  : p.returnsPercent || 0,
      invested : p.totalInvested || 0,
      value    : p.totalCurrentValue || 0,
    }));

    sendSuccess(res, 200, { portfolioData, benchmarks });
  } catch (e) { next(e); }
};

// GET /analytics/asset-class-breakdown
exports.getAssetClassBreakdown = async (req, res, next) => {
  try {
    const portfolios = await Portfolio.find({ userId: req.user._id });
    const classMap   = {};

    portfolios.forEach(p => {
      (p.assets || []).forEach(asset => {
        const cls = asset.type || 'stock';
        if (!classMap[cls]) classMap[cls] = { value: 0, count: 0 };
        classMap[cls].value += asset.currentValue || 0;
        classMap[cls].count++;
      });
    });

    const total     = Object.values(classMap).reduce((s, v) => s + v.value, 0);
    const breakdown = Object.entries(classMap).map(([type, data]) => ({
      type,
      value     : data.value,
      percentage: total > 0 ? ((data.value / total) * 100).toFixed(2) : 0,
      count     : data.count,
    }));

    sendSuccess(res, 200, { breakdown, total });
  } catch (e) { next(e); }
};
