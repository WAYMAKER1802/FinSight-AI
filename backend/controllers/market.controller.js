/**
 * Market Controller
 * ─────────────────
 * Live prices, symbol search, market overview.
 */
'use strict';

const marketSvc = require('../services/market.service');
const { sendSuccess } = require('../utils/response');

// GET /market/quote/:symbol
exports.getQuote = async (req, res, next) => {
  try {
    const data = await marketSvc.fetchQuote(req.params.symbol.toUpperCase());
    sendSuccess(res, 200, { quote: data });
  } catch (e) { next(e); }
};

// POST /market/quotes  { symbols: ['RELIANCE','INFY'] }
exports.getBatchQuotes = async (req, res, next) => {
  try {
    const { symbols } = req.body;
    if (!Array.isArray(symbols) || symbols.length === 0) {
      return res.status(400).json({ success: false, message: 'symbols array required' });
    }
    const quotes = await marketSvc.fetchBatchQuotes(symbols.map(s => s.toUpperCase()));
    sendSuccess(res, 200, { quotes });
  } catch (e) { next(e); }
};

// GET /market/search?q=HDFC
exports.searchSymbol = async (req, res, next) => {
  try {
    const { q = '' } = req.query;
    const results = await marketSvc.searchSymbol(q);
    sendSuccess(res, 200, { results });
  } catch (e) { next(e); }
};

// GET /market/overview
exports.getMarketOverview = async (req, res, next) => {
  try {
    const data = await marketSvc.getMarketOverview();
    sendSuccess(res, 200, data);
  } catch (e) { next(e); }
};
