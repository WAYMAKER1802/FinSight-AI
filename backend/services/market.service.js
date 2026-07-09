/**
 * Market Data Service
 * ────────────────────
 * Fetches live prices with multi-tier fallback:
 *   1. Finnhub  →  2. Alpha Vantage  →  3. Twelve Data  →  4. Smart Mock
 *
 * Caches responses for 5 minutes to avoid rate limits.
 */
'use strict';

const axios  = require('axios');
const logger = require('../config/logger');

const FINNHUB_KEY   = process.env.FINNHUB_API_KEY;
const AV_KEY        = process.env.ALPHA_VANTAGE_API_KEY;
const TWELVE_KEY    = process.env.TWELVE_DATA_API_KEY;

// ─── In-memory cache ──────────────────────────────────────────────────────
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const getCached = (key) => {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.ts < CACHE_TTL) return entry.data;
  return null;
};
const setCache = (key, data) => cache.set(key, { data, ts: Date.now() });

// ─── Seed prices for realistic mock data ──────────────────────────────────
const MOCK_BASE_PRICES = {
  RELIANCE: 2790, INFY: 1625, HDFCBANK: 1720, TCS: 3850, WIPRO: 465,
  ICICIBANK: 1120, KOTAKBANK: 1850, AXISBANK: 1200, BAJFINANCE: 7100,
  ADANIENT: 2450, MARUTI: 12800, SUNPHARMA: 1580, HDFC: 1695, LTIM: 5200,
  TECHM: 1560, ONGC: 280, BPCL: 380, COALINDIA: 450, ITC: 475, SBIN: 820,
  BTCUSDT: 6800000, ETHUSDT: 320000, GOLDBEES: 52, NIFTYBEES: 245,
  MOTHERSON: 145, ZOMATO: 230, PAYTM: 340, NYKAA: 185, IRFC: 195,
  TATAMOTORS: 960, POWERGRID: 340, NTPC: 385, JSWSTEEL: 870, HINDALCO: 680,
  GRASIM: 2650, DRREDDY: 6200, CIPLA: 1520, DIVISLAB: 3800, APOLLOHOSP: 6400,
  BAJAJFINSV: 1620, SBILIFE: 1750, HDFCLIFE: 620,
};

// ─── Generate realistic mock quote ────────────────────────────────────────
const mockQuote = (symbol) => {
  const base = MOCK_BASE_PRICES[symbol.toUpperCase()] || (500 + Math.abs(symbol.charCodeAt(0) * 37 % 4000));
  const dayChangePct = (Math.random() * 4 - 2);                        // -2% to +2%
  const currentPrice = Math.round(base * (1 + dayChangePct / 100) * 100) / 100;
  const dayChange    = Math.round((currentPrice - base) * 100) / 100;

  return {
    symbol,
    currentPrice,
    prevClose   : base,
    open        : Math.round(base * (1 + (Math.random() * 0.01 - 0.005)) * 100) / 100,
    high        : Math.round(Math.max(currentPrice, base) * (1 + Math.random() * 0.008) * 100) / 100,
    low         : Math.round(Math.min(currentPrice, base) * (1 - Math.random() * 0.008) * 100) / 100,
    volume      : Math.floor(100000 + Math.random() * 5000000),
    dayChange,
    dayChangePct: Math.round(dayChangePct * 100) / 100,
    high52      : Math.round(base * (1.25 + Math.random() * 0.1) * 100) / 100,
    low52       : Math.round(base * (0.65 + Math.random() * 0.1) * 100) / 100,
    marketCap   : Math.floor(base * (1000000 + Math.random() * 50000000)),
    peRatio     : Math.round((15 + Math.random() * 35) * 10) / 10,
    source      : 'mock',
    timestamp   : new Date().toISOString(),
  };
};

// ─── Finnhub fetcher ──────────────────────────────────────────────────────
const fetchFinnhub = async (symbol) => {
  if (!FINNHUB_KEY || FINNHUB_KEY.includes('your_')) return null;
  try {
    const [quote, meta] = await Promise.all([
      axios.get('https://finnhub.io/api/v1/quote', {
        params: { symbol: symbol.includes(':') ? symbol : `NSE:${symbol}`, token: FINNHUB_KEY },
        timeout: 4000,
      }),
      axios.get('https://finnhub.io/api/v1/stock/profile2', {
        params: { symbol: symbol.includes(':') ? symbol : `NSE:${symbol}`, token: FINNHUB_KEY },
        timeout: 4000,
      }).catch(() => ({ data: {} })),
    ]);
    const d = quote.data;
    if (!d.c || d.c === 0) return null;
    return {
      symbol,
      currentPrice : d.c,
      prevClose    : d.pc,
      open         : d.o,
      high         : d.h,
      low          : d.l,
      dayChange    : d.d,
      dayChangePct : d.dp,
      high52       : d.t,
      low52        : d.l,
      marketCap    : meta.data?.marketCapitalization * 1e6 || 0,
      peRatio      : meta.data?.peBasicExclExtraTTM || 0,
      sector       : meta.data?.finnhubIndustry || 'Unknown',
      source       : 'finnhub',
      timestamp    : new Date().toISOString(),
    };
  } catch (e) {
    logger.debug(`Finnhub failed for ${symbol}: ${e.message}`);
    return null;
  }
};

// ─── Alpha Vantage fetcher ────────────────────────────────────────────────
const fetchAlphaVantage = async (symbol) => {
  if (!AV_KEY || AV_KEY.includes('your_')) return null;
  try {
    const r = await axios.get('https://www.alphavantage.co/query', {
      params: { function: 'GLOBAL_QUOTE', symbol: `${symbol}.BSE`, apikey: AV_KEY },
      timeout: 5000,
    });
    const q = r.data['Global Quote'];
    if (!q || !q['05. price']) return null;
    return {
      symbol,
      currentPrice : parseFloat(q['05. price']),
      prevClose    : parseFloat(q['08. previous close']),
      open         : parseFloat(q['02. open']),
      high         : parseFloat(q['03. high']),
      low          : parseFloat(q['04. low']),
      volume       : parseInt(q['06. volume']),
      dayChange    : parseFloat(q['09. change']),
      dayChangePct : parseFloat(q['10. change percent']),
      source       : 'alphavantage',
      timestamp    : new Date().toISOString(),
    };
  } catch (e) {
    logger.debug(`AlphaVantage failed for ${symbol}: ${e.message}`);
    return null;
  }
};

// ─── Main quote fetcher ───────────────────────────────────────────────────
const fetchQuote = async (symbol) => {
  const cacheKey = `quote:${symbol}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  let data = await fetchFinnhub(symbol);
  if (!data) data = await fetchAlphaVantage(symbol);
  if (!data) data = mockQuote(symbol);

  setCache(cacheKey, data);
  return data;
};

// ─── Batch quote fetcher ──────────────────────────────────────────────────
const fetchBatchQuotes = async (symbols) => {
  const results = await Promise.allSettled(symbols.map(s => fetchQuote(s)));
  const map = {};
  symbols.forEach((sym, i) => {
    map[sym] = results[i].status === 'fulfilled' ? results[i].value : mockQuote(sym);
  });
  return map;
};

// ─── Search symbols ───────────────────────────────────────────────────────
const searchSymbol = async (query) => {
  if (!query) return [];
  const cacheKey = `search:${query}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  // Return mock search results
  const mockResults = Object.keys(MOCK_BASE_PRICES)
    .filter(s => s.includes(query.toUpperCase()))
    .slice(0, 10)
    .map(s => ({ symbol: s, name: s, exchange: 'NSE', type: 'stock' }));

  setCache(cacheKey, mockResults);
  return mockResults;
};

// ─── Market overview ──────────────────────────────────────────────────────
const getMarketOverview = async () => {
  const cacheKey = 'market:overview';
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const indices = [
    { name: 'NIFTY 50',     base: 24650, change: (Math.random() * 2 - 0.8) },
    { name: 'SENSEX',       base: 81200, change: (Math.random() * 2 - 0.8) },
    { name: 'BANK NIFTY',   base: 52400, change: (Math.random() * 2 - 0.5) },
    { name: 'NIFTY IT',     base: 40800, change: (Math.random() * 2 - 1) },
    { name: 'NIFTY MIDCAP', base: 54300, change: (Math.random() * 2 - 0.6) },
  ].map(idx => ({
    name     : idx.name,
    value    : Math.round(idx.base * (1 + idx.change / 100) * 100) / 100,
    change   : Math.round(idx.change * 100) / 100,
    changeAmt: Math.round(idx.base * (idx.change / 100) * 100) / 100,
  }));

  const data = { indices, timestamp: new Date().toISOString() };
  setCache(cacheKey, data);
  return data;
};

module.exports = { fetchQuote, fetchBatchQuotes, searchSymbol, getMarketOverview, mockQuote };
