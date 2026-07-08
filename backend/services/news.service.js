/**
 * News Service
 * ─────────────
 * Fetches and processes financial news from NewsAPI, Finnhub, and fallback sources.
 */

'use strict';

const axios  = require('axios');
const logger = require('../config/logger');

const NEWS_API_KEY  = process.env.NEWS_API_KEY;
const FINNHUB_KEY   = process.env.FINNHUB_API_KEY;

/**
 * Fetch top financial news from NewsAPI.
 */
const fetchFinancialNews = async (query = 'stock market India', pageSize = 20) => {
  try {
    const response = await axios.get('https://newsapi.org/v2/everything', {
      params: {
        q          : query,
        language   : 'en',
        sortBy     : 'publishedAt',
        pageSize,
        apiKey     : NEWS_API_KEY,
      },
      timeout: 8000,
    });

    return response.data.articles.map(article => ({
      title      : article.title,
      description: article.description,
      content    : article.content,
      url        : article.url,
      source     : article.source?.name,
      publishedAt: article.publishedAt,
      urlToImage : article.urlToImage,
      sentiment  : null, // To be filled by AI
    }));
  } catch (error) {
    logger.warn(`NewsAPI error: ${error.message} — returning mock data`);
    return getMockNews();
  }
};

/**
 * Fetch company news from Finnhub.
 */
const fetchCompanyNews = async (symbol, from, to) => {
  try {
    const response = await axios.get('https://finnhub.io/api/v1/company-news', {
      params: { symbol, from, to, token: FINNHUB_KEY },
      timeout: 8000,
    });

    return response.data.slice(0, 10).map(item => ({
      title      : item.headline,
      description: item.summary,
      url        : item.url,
      source     : item.source,
      publishedAt: new Date(item.datetime * 1000).toISOString(),
      symbol,
    }));
  } catch (error) {
    logger.warn(`Finnhub company news error: ${error.message}`);
    return [];
  }
};

/**
 * Fetch market sentiment data (Fear & Greed) from alternative sources.
 */
const fetchMarketSentiment = async () => {
  // Simulated data — integrate with CNN Fear & Greed or similar
  return {
    fearGreedIndex: Math.round(45 + Math.random() * 30),
    classification: ['Fear', 'Neutral', 'Greed'][Math.floor(Math.random() * 3)],
    previousClose : 52,
    lastWeek      : 48,
    lastMonth     : 61,
    lastYear      : 43,
    timestamp     : new Date().toISOString(),
  };
};

/**
 * Fetch market overview data.
 */
const fetchMarketOverview = async () => {
  // In production, integrate with Alpha Vantage or Polygon.io
  return {
    nifty50   : { value: 22000 + Math.random() * 1000, change: (Math.random() * 2 - 1).toFixed(2) },
    sensex    : { value: 72000 + Math.random() * 3000, change: (Math.random() * 2 - 1).toFixed(2) },
    bankNifty : { value: 46000 + Math.random() * 2000, change: (Math.random() * 3 - 1.5).toFixed(2) },
    niftyIT   : { value: 35000 + Math.random() * 1000, change: (Math.random() * 2 - 1).toFixed(2) },
    vix       : (12 + Math.random() * 6).toFixed(2),
    fiiNet    : Math.round((Math.random() * 4000 - 2000)),
    diiNet    : Math.round((Math.random() * 3000 - 500)),
    advancers : Math.round(800 + Math.random() * 600),
    decliners : Math.round(400 + Math.random() * 400),
    unchanged : Math.round(50 + Math.random() * 100),
    timestamp : new Date().toISOString(),
  };
};

/**
 * Mock news for development/fallback.
 */
const getMockNews = () => [
  {
    title      : 'RBI Holds Repo Rate at 6.5% — Markets React Positively',
    description: 'The Reserve Bank of India maintained its benchmark interest rate, signaling a pause in the rate hike cycle.',
    source     : 'Economic Times',
    publishedAt: new Date().toISOString(),
    sentiment  : 'positive',
    impact     : 'high',
  },
  {
    title      : 'Nifty 50 Hits Fresh All-Time High as FII Inflows Surge',
    description: 'Foreign institutional investors poured in ₹8,500 crore into Indian equities this week.',
    source     : 'Moneycontrol',
    publishedAt: new Date(Date.now() - 3600000).toISOString(),
    sentiment  : 'positive',
    impact     : 'medium',
  },
  {
    title      : 'Reliance Industries Reports Record Q4 Profit, Beats Estimates',
    description: 'Reliance Industries posted a net profit of ₹21,243 crore, up 18% YoY.',
    source     : 'Business Standard',
    publishedAt: new Date(Date.now() - 7200000).toISOString(),
    sentiment  : 'positive',
    impact     : 'high',
  },
  {
    title      : 'IT Sector Under Pressure Amid US Recession Fears',
    description: 'Top IT companies face headwinds as US clients cut discretionary tech spending.',
    source     : 'Financial Express',
    publishedAt: new Date(Date.now() - 10800000).toISOString(),
    sentiment  : 'negative',
    impact     : 'medium',
  },
  {
    title      : 'Gold Prices Rally 2% on Global Uncertainty',
    description: 'Geopolitical tensions and a weaker dollar push gold above ₹65,000 per 10g.',
    source     : 'Mint',
    publishedAt: new Date(Date.now() - 14400000).toISOString(),
    sentiment  : 'neutral',
    impact     : 'low',
  },
];

module.exports = {
  fetchFinancialNews,
  fetchCompanyNews,
  fetchMarketSentiment,
  fetchMarketOverview,
  getMockNews,
};
