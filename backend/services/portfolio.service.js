/**
 * Portfolio Service — Sequelize Edition
 * ──────────────────────────────────────
 * Business logic: price updates, metrics calculation, CSV/Excel import,
 * diversification, health scoring, and alert generation.
 */
'use strict';

const axios     = require('axios');
const Papa      = require('papaparse');
const XLSX      = require('xlsx');
const fs        = require('fs');
const logger    = require('../config/logger');
const helpers   = require('../helpers/calculators');
const marketSvc = require('./market.service');
const wealthSvc = require('./wealth.service');

// ─── Recalculate all portfolio metrics from its assets ────────────────────
const recalculatePortfolioMetrics = (portfolio, assets) => {
  if (!assets || assets.length === 0) {
    return {
      totalInvested    : 0, totalCurrentValue: 0, totalReturns: 0,
      returnsPercent   : 0, dayPnl: 0, dayPnlPercent: 0,
      healthScore      : 0, riskScore: 5, diversificationScore: 0,
      sectorAllocation : JSON.stringify([]),
      assetClassAllocation: JSON.stringify([]),
    };
  }

  const totalInvested    = assets.reduce((s, a) => s + (a.quantity * a.avgBuyPrice), 0);
  const totalCurrentValue= assets.reduce((s, a) => s + (a.currentValue || a.quantity * a.avgBuyPrice), 0);
  const totalReturns     = totalCurrentValue - totalInvested;
  const returnsPercent   = totalInvested > 0 ? (totalReturns / totalInvested) * 100 : 0;

  // Day P&L
  const dayPnl = assets.reduce((s, a) => {
    const prevValue = a.currentValue / (1 + (a.dayChangePct || 0) / 100);
    return s + (a.currentValue - prevValue);
  }, 0);
  const dayPnlPercent = totalCurrentValue > 0 ? (dayPnl / totalCurrentValue) * 100 : 0;

  // Allocation percentages
  if (totalCurrentValue > 0) {
    assets.forEach(a => {
      a.allocationPct   = (a.currentValue / totalCurrentValue) * 100;
      a.investedAmount  = a.quantity * a.avgBuyPrice;
      a.absoluteReturn  = a.currentValue - a.investedAmount;
      a.percentageReturn= a.investedAmount > 0 ? (a.absoluteReturn / a.investedAmount) * 100 : 0;
    });
  }

  // Sector allocation
  const sectorMap = {};
  assets.forEach(a => {
    const s = a.sector || 'Others';
    if (!sectorMap[s]) sectorMap[s] = 0;
    sectorMap[s] += a.currentValue || 0;
  });
  const sectorAllocation = Object.entries(sectorMap)
    .map(([sector, value]) => ({
      sector,
      value     : Math.round(value),
      percentage: totalCurrentValue > 0 ? Math.round((value / totalCurrentValue) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.percentage - a.percentage);

  // Asset class allocation
  const classMap = {};
  assets.forEach(a => {
    const c = a.type || 'other';
    if (!classMap[c]) classMap[c] = 0;
    classMap[c] += a.currentValue || 0;
  });
  const assetClassAllocation = Object.entries(classMap)
    .map(([assetClass, value]) => ({
      assetClass,
      value     : Math.round(value),
      percentage: totalCurrentValue > 0 ? Math.round((value / totalCurrentValue) * 1000) / 10 : 0,
    }));

  // Diversification score
  const allocations = assets.map(a => a.allocationPct || 0);
  const diversificationScore = helpers.diversificationScore(allocations);

  // Risk score (avg of asset risk scores)
  const riskScore = assets.length > 0
    ? Math.round(assets.reduce((s, a) => s + (a.riskScore || 5), 0) / assets.length * 10) / 10
    : 5;

  // Health score
  const healthScore = helpers.portfolioHealthScore({
    diversificationScore,
    returnsVsBenchmark: Math.max(0, returnsPercent / 100),
    riskScore,
    goalAlignment     : 60,
  });

  // CAGR (approximate — use months from first buy)
  const firstBuyDates = assets.map(a => a.firstBuyDate).filter(Boolean).sort();
  let cagr = 0;
  if (firstBuyDates.length > 0) {
    const years = (Date.now() - new Date(firstBuyDates[0])) / (365.25 * 24 * 3600 * 1000);
    if (years > 0.08 && totalInvested > 0) {
      cagr = Math.round(helpers.cagr(totalInvested, totalCurrentValue, years) * 100) / 100;
    }
  }

  // Sharpe (rough estimate)
  const annualReturn = returnsPercent;
  const riskFreeRate = 6.5; // RBI 10Y bond approx
  const volatility   = 18 + riskScore * 2; // estimated
  const sharpeRatio  = Math.round((annualReturn - riskFreeRate) / volatility * 100) / 100;

  return {
    totalInvested    : Math.round(totalInvested * 100) / 100,
    totalCurrentValue: Math.round(totalCurrentValue * 100) / 100,
    totalReturns     : Math.round(totalReturns * 100) / 100,
    returnsPercent   : Math.round(returnsPercent * 100) / 100,
    dayPnl           : Math.round(dayPnl * 100) / 100,
    dayPnlPercent    : Math.round(dayPnlPercent * 100) / 100,
    healthScore,
    riskScore,
    diversificationScore,
    cagr,
    sharpeRatio,
    sectorAllocation    : JSON.stringify(sectorAllocation),
    assetClassAllocation: JSON.stringify(assetClassAllocation),
  };
};

// ─── Update live prices for all assets ────────────────────────────────────
const updatePortfolioPrices = async (assets) => {
  if (!assets || assets.length === 0) return assets;

  const symbols = [...new Set(assets.map(a => a.symbol))];
  const prices  = await marketSvc.fetchBatchQuotes(symbols);

  for (const asset of assets) {
    const q = prices[asset.symbol];
    if (q) {
      asset.currentPrice  = q.currentPrice;
      asset.currentValue  = Math.round(q.currentPrice * asset.quantity * 100) / 100;
      asset.dayChange     = q.dayChange;
      asset.dayChangePct  = q.dayChangePct;
    }
  }
  return assets;
};

// ─── Generate AI recommendation per asset ─────────────────────────────────
const getAssetRecommendation = (asset) => {
  const pnlPct = asset.percentageReturn || 0;
  const risk   = asset.riskScore || 5;
  const day    = asset.dayChangePct || 0;

  // Simple rule-based recommendation
  if (pnlPct > 30 && risk > 7) return { recommendation: 'sell',      confidenceScore: 72 };
  if (pnlPct > 20 && day > 1)  return { recommendation: 'hold',      confidenceScore: 65 };
  if (pnlPct < -15)             return { recommendation: 'sell',      confidenceScore: 68 };
  if (pnlPct < -5 && day < -1) return { recommendation: 'hold',      confidenceScore: 55 };
  if (pnlPct < 5 && risk <= 4) return { recommendation: 'buy',       confidenceScore: 70 };
  if (day < -2 && risk <= 3)   return { recommendation: 'strong_buy',confidenceScore: 75 };

  return { recommendation: 'hold', confidenceScore: 60 };
};

// ─── Process CSV upload ───────────────────────────────────────────────────
const processCSVUpload = (filePath) => {
  return new Promise((resolve, reject) => {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      Papa.parse(content, {
        header        : true,
        skipEmptyLines: true,
        transformHeader: h => h.trim().toLowerCase().replace(/\s+/g, '_'),
        complete: (results) => {
          const assets = results.data
            .filter(r => r.symbol || r.stock_symbol)
            .map(r => ({
              symbol      : (r.symbol || r.stock_symbol || '').toUpperCase().trim(),
              name        : r.name || r.company_name || r.symbol || 'Unknown',
              type        : (r.type || r.asset_type || 'stock').toLowerCase(),
              quantity    : parseFloat(r.quantity || r.qty || 0),
              avgBuyPrice : parseFloat(r.avg_buy_price || r.average_price || r.buy_price || 0),
              sector      : r.sector || 'Unknown',
              firstBuyDate: r.buy_date ? new Date(r.buy_date) : new Date(),
            }))
            .filter(a => a.symbol && a.quantity > 0 && a.avgBuyPrice > 0);
          resolve(assets);
          fs.unlink(filePath, () => {});
        },
        error: reject,
      });
    } catch (e) { reject(e); }
  });
};

// ─── Process Excel upload ─────────────────────────────────────────────────
const processExcelUpload = (filePath) => {
  try {
    const wb    = XLSX.readFile(filePath);
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const data  = XLSX.utils.sheet_to_json(sheet, { defval: '' });

    const assets = data
      .filter(r => r.Symbol || r.symbol)
      .map(r => ({
        symbol      : String(r.Symbol || r.symbol).toUpperCase().trim(),
        name        : String(r.Name || r.Company || r.Symbol),
        type        : String(r.Type || r.type || 'stock').toLowerCase(),
        quantity    : parseFloat(r.Quantity || r.Qty || 0),
        avgBuyPrice : parseFloat(r['Avg Price'] || r.AvgPrice || r.BuyPrice || 0),
        sector      : String(r.Sector || 'Unknown'),
      }))
      .filter(a => a.symbol && a.quantity > 0 && a.avgBuyPrice > 0);

    fs.unlink(filePath, () => {});
    return assets;
  } catch (e) {
    logger.error(`Excel processing: ${e.message}`);
    throw e;
  }
};

module.exports = {
  recalculatePortfolioMetrics,
  updatePortfolioPrices,
  getAssetRecommendation,
  processCSVUpload,
  processExcelUpload,
};
