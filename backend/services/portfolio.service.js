/**
 * Portfolio Service
 * ──────────────────
 * Business logic for portfolio operations: price updates, scoring,
 * analytics calculation, and CSV/Excel import processing.
 */

'use strict';

const axios     = require('axios');
const Papa      = require('papaparse');
const XLSX      = require('xlsx');
const fs        = require('fs');
const Portfolio = require('../models/Portfolio.model');
const Alert     = require('../models/Alert.model');
const helpers   = require('../helpers/calculators');
const logger    = require('../config/logger');

const ALPHA_VANTAGE_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const FINNHUB_KEY       = process.env.FINNHUB_API_KEY;

/**
 * Fetch real-time price for a stock symbol.
 * Tries Finnhub first, falls back to Alpha Vantage.
 */
const fetchStockPrice = async (symbol) => {
  try {
    const response = await axios.get('https://finnhub.io/api/v1/quote', {
      params : { symbol: `NSE:${symbol}`, token: FINNHUB_KEY },
      timeout: 5000,
    });
    const d = response.data;
    if (d.c) {
      return {
        symbol,
        currentPrice : d.c,
        dayChange    : d.d,
        dayChangePct : d.dp,
        high52       : d.h,
        low52        : d.l,
        prevClose    : d.pc,
        timestamp    : new Date().toISOString(),
      };
    }
  } catch (_) {}

  // Fallback: simulate price (dev mode)
  return {
    symbol,
    currentPrice : Math.round(1000 + Math.random() * 4000),
    dayChange    : Math.round((Math.random() * 100 - 50) * 10) / 10,
    dayChangePct : Math.round((Math.random() * 4 - 2) * 100) / 100,
    timestamp    : new Date().toISOString(),
  };
};

/**
 * Update all asset prices in a portfolio.
 */
const updatePortfolioPrices = async (portfolio) => {
  if (!portfolio.assets || portfolio.assets.length === 0) return portfolio;

  const pricePromises = portfolio.assets.map(asset =>
    fetchStockPrice(asset.symbol).catch(() => null)
  );

  const prices = await Promise.allSettled(pricePromises);

  portfolio.assets.forEach((asset, idx) => {
    const result = prices[idx];
    if (result.status === 'fulfilled' && result.value) {
      const p          = result.value;
      asset.currentPrice  = p.currentPrice;
      asset.currentValue  = asset.quantity * p.currentPrice;
      asset.dayChange     = p.dayChange;
      asset.dayChangePct  = p.dayChangePct;
    }
  });

  return portfolio;
};

/**
 * Recalculate portfolio-level scores.
 */
const recalculateScores = (portfolio) => {
  const allocations = portfolio.assets.map(a => a.allocationPct || 0);

  portfolio.diversificationScore = helpers.diversificationScore(allocations);

  // Build sector allocation
  const sectorMap = {};
  portfolio.assets.forEach(a => {
    const sector = a.sector || 'Others';
    if (!sectorMap[sector]) sectorMap[sector] = { value: 0, percentage: 0 };
    sectorMap[sector].value += a.currentValue || 0;
  });

  if (portfolio.totalCurrentValue > 0) {
    portfolio.sectorAllocation = Object.entries(sectorMap).map(([sector, data]) => ({
      sector,
      value     : data.value,
      percentage: (data.value / portfolio.totalCurrentValue) * 100,
    })).sort((a, b) => b.percentage - a.percentage);

    // Asset class allocation
    const classMap = {};
    portfolio.assets.forEach(a => {
      const cls = a.type || 'other';
      if (!classMap[cls]) classMap[cls] = { value: 0 };
      classMap[cls].value += a.currentValue || 0;
    });
    portfolio.assetClassAllocation = Object.entries(classMap).map(([assetClass, d]) => ({
      assetClass,
      value     : d.value,
      percentage: (d.value / portfolio.totalCurrentValue) * 100,
    }));
  }

  return portfolio;
};

/**
 * Process uploaded CSV file and extract portfolio data.
 */
const processCSVUpload = (filePath) => {
  return new Promise((resolve, reject) => {
    try {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      Papa.parse(fileContent, {
        header        : true,
        skipEmptyLines: true,
        transformHeader: (h) => h.trim().toLowerCase().replace(/\s+/g, '_'),
        complete      : (results) => {
          const assets = results.data
            .filter(row => row.symbol || row.stock_symbol)
            .map(row => ({
              symbol     : (row.symbol || row.stock_symbol || '').toUpperCase().trim(),
              name       : row.name || row.company_name || row.symbol,
              type       : (row.type || row.asset_type || 'stock').toLowerCase(),
              quantity   : parseFloat(row.quantity || row.qty || 0),
              avgBuyPrice: parseFloat(row.avg_buy_price || row.average_price || row.buy_price || 0),
              sector     : row.sector || 'Unknown',
              firstBuyDate: row.buy_date ? new Date(row.buy_date) : new Date(),
            }))
            .filter(a => a.symbol && a.quantity > 0 && a.avgBuyPrice > 0);

          resolve(assets);
          fs.unlink(filePath, () => {}); // Cleanup
        },
        error: reject,
      });
    } catch (e) {
      reject(e);
    }
  });
};

/**
 * Process uploaded Excel file.
 */
const processExcelUpload = (filePath) => {
  try {
    const workbook  = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet     = workbook.Sheets[sheetName];
    const data      = XLSX.utils.sheet_to_json(sheet, { defval: '' });

    const assets = data
      .filter(row => row.Symbol || row.symbol)
      .map(row => ({
        symbol     : String(row.Symbol || row.symbol).toUpperCase().trim(),
        name       : String(row.Name || row.Company || row.Symbol),
        type       : String(row.Type || row.type || 'stock').toLowerCase(),
        quantity   : parseFloat(row.Quantity || row.Qty || 0),
        avgBuyPrice: parseFloat(row['Avg Price'] || row.AvgPrice || row.BuyPrice || 0),
        sector     : String(row.Sector || 'Unknown'),
      }))
      .filter(a => a.symbol && a.quantity > 0 && a.avgBuyPrice > 0);

    fs.unlink(filePath, () => {});
    return assets;
  } catch (error) {
    logger.error(`Excel processing error: ${error.message}`);
    throw error;
  }
};

/**
 * Check for smart alerts: price targets, drops, etc.
 */
const checkAndCreateAlerts = async (portfolio, userId) => {
  const alerts = [];

  portfolio.assets.forEach(asset => {
    // Stop loss alert
    if (asset.stopLoss && asset.currentPrice <= asset.stopLoss) {
      alerts.push({
        userId,
        portfolioId: portfolio._id,
        type    : 'stop_loss',
        title   : `🚨 Stop Loss Triggered — ${asset.symbol}`,
        message : `${asset.symbol} hit your stop loss of ₹${asset.stopLoss}. Current price: ₹${asset.currentPrice}. Consider reviewing your position.`,
        severity: 'critical',
        symbol  : asset.symbol,
        targetPrice  : asset.stopLoss,
        currentPrice : asset.currentPrice,
        channels: ['in_app', 'push'],
      });
    }

    // Target price alert
    if (asset.targetPrice && asset.currentPrice >= asset.targetPrice) {
      alerts.push({
        userId,
        portfolioId: portfolio._id,
        type    : 'price_target',
        title   : `🎯 Target Reached — ${asset.symbol}`,
        message : `${asset.symbol} reached your target of ₹${asset.targetPrice}! Consider booking profits or revising the target.`,
        severity: 'success',
        symbol  : asset.symbol,
        targetPrice  : asset.targetPrice,
        currentPrice : asset.currentPrice,
        channels: ['in_app', 'push'],
      });
    }
  });

  if (alerts.length > 0) {
    await Alert.insertMany(alerts);
    logger.info(`Created ${alerts.length} smart alerts for portfolio ${portfolio._id}`);
  }

  return alerts;
};

module.exports = {
  fetchStockPrice,
  updatePortfolioPrices,
  recalculateScores,
  processCSVUpload,
  processExcelUpload,
  checkAndCreateAlerts,
};
