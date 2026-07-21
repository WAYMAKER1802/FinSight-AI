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
const YahooFinance = require('yahoo-finance2').default;
const yahooFinance = new YahooFinance();
const logger = require('../config/logger');

const FINNHUB_KEY   = process.env.FINNHUB_API_KEY;
const AV_KEY        = process.env.ALPHA_VANTAGE_API_KEY;
const TWELVE_KEY    = process.env.TWELVE_DATA_API_KEY;

// ─── In-memory cache ──────────────────────────────────────────────────────
const cache = new Map();
const CACHE_TTL = 5000; // 5 seconds for live fluctuating demo

const getCached = (key) => {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.ts < CACHE_TTL) return entry.data;
  return null;
};
const setCache = (key, data) => cache.set(key, { data, ts: Date.now() });

// ─── Seed prices for realistic mock data ──────────────────────────────────
const MOCK_BASE_PRICES = {
  RELIANCE: 1307.8, INFY: 1068, HDFCBANK: 824.95, TCS: 2069, WIPRO: 175.46,
  ICICIBANK: 1401.2, KOTAKBANK: 377.6, AXISBANK: 1323.7, BAJFINANCE: 1020.5,
  ADANIENT: 3157.3, MARUTI: 13854, SUNPHARMA: 1935.5, LTIM: 6200,
  TECHM: 1454.8, ONGC: 244.96, BPCL: 309.75, COALINDIA: 429.3, ITC: 281.75,
  SBIN: 1036, MOTHERSON: 143.19, ZOMATO: 230, PAYTM: 1341.8, NYKAA: 330.1,
  IRFC: 89.9, TATAMOTORS: 960, POWERGRID: 283.1, NTPC: 344.55,
  JSWSTEEL: 1245.4, HINDALCO: 967.45, GRASIM: 3213.6, DRREDDY: 1244.3,
  CIPLA: 1439.4, DIVISLAB: 6836, APOLLOHOSP: 8841, BAJAJFINSV: 1916,
  SBILIFE: 1862.9, HDFCLIFE: 567.7, CUPID: 212.24, ITDC: 716.8,
  PCJEWELLER: 9.99, JINDRILL: 603.05, TATASTEEL: 191.19
};

// ─── Generate realistic mock quote ────────────────────────────────────────
const mockQuote = (symbol) => {
  const base = MOCK_BASE_PRICES[symbol.toUpperCase()] || 150.0;
  
  // Use a deterministic but changing offset based on time (changes every 5 seconds)
  const timeStep = Math.floor(Date.now() / 5000);
  // Pseudo-random fluctuation between -1% and +1%
  const randomSeed = Math.sin(timeStep * base) * 10000;
  const fluctuationPct = (randomSeed - Math.floor(randomSeed)) * 2 - 1; // -1 to +1
  
  const currentPrice = Number((base + (base * fluctuationPct * 0.01)).toFixed(2));
  const dayChange = Number((currentPrice - base).toFixed(2));
  const dayChangePct = Number(((dayChange / base) * 100).toFixed(2));

  return {
    symbol,
    currentPrice,
    prevClose   : base,
    open        : base,
    high        : Number((base * 1.02).toFixed(2)),
    low         : Number((base * 0.98).toFixed(2)),
    volume      : 1000000 + Math.floor(Math.abs(fluctuationPct) * 500000),
    dayChange,
    dayChangePct,
    high52      : base * 1.25,
    low52       : base * 0.65,
    marketCap   : base * 10000000,
    peRatio     : 25,
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

// ─── Yahoo Finance fetcher ────────────────────────────────────────────────
const fetchYahooFinance = async (symbol) => {
  try {
    const formattedSymbol = symbol.endsWith('.NS') || symbol.endsWith('.BO') ? symbol : `${symbol}.NS`;
    const quote = await yahooFinance.quote(formattedSymbol);
    if (!quote || !quote.regularMarketPrice) return null;
    
    return {
      symbol,
      currentPrice : quote.regularMarketPrice,
      prevClose    : quote.regularMarketPreviousClose,
      open         : quote.regularMarketOpen,
      high         : quote.regularMarketDayHigh,
      low          : quote.regularMarketDayLow,
      volume       : quote.regularMarketVolume,
      dayChange    : quote.regularMarketChange,
      dayChangePct : quote.regularMarketChangePercent,
      high52       : quote.fiftyTwoWeekHigh,
      low52        : quote.fiftyTwoWeekLow,
      marketCap    : quote.marketCap,
      peRatio      : quote.trailingPE || quote.forwardPE,
      source       : 'yahoo-finance',
      timestamp    : new Date().toISOString(),
    };
  } catch (e) {
    logger.debug(`Yahoo Finance failed for ${symbol}: ${e.message}`);
    return null;
  }
};

// ─── Main quote fetcher ───────────────────────────────────────────────────
const fetchQuote = async (symbol) => {
  const cacheKey = `quote:${symbol}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  let data = await fetchYahooFinance(symbol);
  if (!data) data = await fetchFinnhub(symbol);
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
