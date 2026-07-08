/**
 * News Controller
 */
'use strict';

const newsSvc = require('../services/news.service');
const { sendSuccess } = require('../utils/response');

// GET /news
exports.getNews = async (req, res, next) => {
  try {
    const { q = 'stock market India', pageSize = 20, category } = req.query;
    const articles = await newsSvc.fetchFinancialNews(q, parseInt(pageSize));
    sendSuccess(res, 200, { count: articles.length, articles });
  } catch (e) { next(e); }
};

// GET /news/company/:symbol
exports.getCompanyNews = async (req, res, next) => {
  try {
    const { symbol } = req.params;
    const { from, to } = req.query;
    const fromDate = from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const toDate   = to   || new Date().toISOString().split('T')[0];
    const articles = await newsSvc.fetchCompanyNews(symbol, fromDate, toDate);
    sendSuccess(res, 200, { symbol, count: articles.length, articles });
  } catch (e) { next(e); }
};

// GET /news/market-sentiment
exports.getMarketSentiment = async (req, res, next) => {
  try {
    const sentiment = await newsSvc.fetchMarketSentiment();
    sendSuccess(res, 200, { sentiment });
  } catch (e) { next(e); }
};

// GET /news/market-overview
exports.getMarketOverview = async (req, res, next) => {
  try {
    const overview = await newsSvc.fetchMarketOverview();
    sendSuccess(res, 200, { overview });
  } catch (e) { next(e); }
};
