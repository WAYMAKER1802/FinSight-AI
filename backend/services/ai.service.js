/**
 * AI Service — with Smart Mock Fallback
 * ──────────────────────────────────────
 * Tries OpenAI first; if key is absent or call fails, generates
 * deterministic AI-style responses from portfolio data.
 */
'use strict';

const logger  = require('../config/logger');
const prompts = require('../prompts');

let openai = null;
try {
  if (process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes('your_')) {
    const OpenAI = require('openai');
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
} catch (_) {}

const DEFAULT_MODEL       = process.env.OPENAI_MODEL    || 'gpt-4o-mini';
const DEFAULT_MAX_TOKENS  = parseInt(process.env.OPENAI_MAX_TOKENS, 10) || 2048;
const DEFAULT_TEMPERATURE = parseFloat(process.env.OPENAI_TEMPERATURE)  || 0.7;

/* ─── Core AI call with fallback ────────────────────────────────────────── */
const callAI = async (messages, options = {}) => {
  const { model = DEFAULT_MODEL, maxTokens = DEFAULT_MAX_TOKENS, temperature = DEFAULT_TEMPERATURE, jsonMode = true } = options;

  if (!openai) {
    logger.info('OpenAI not configured — using mock AI response');
    return { data: null, usage: null, elapsed: 0 };
  }

  const start = Date.now();
  try {
    const completion = await openai.chat.completions.create({
      model, messages,
      max_tokens  : maxTokens,
      temperature,
      response_format: jsonMode ? { type: 'json_object' } : { type: 'text' },
    });
    const elapsed = Date.now() - start;
    const content = completion.choices[0]?.message?.content;
    if (jsonMode) {
      try { return { data: JSON.parse(content), usage: completion.usage, elapsed }; }
      catch (_) { return { data: { raw: content }, usage: completion.usage, elapsed }; }
    }
    return { data: content, usage: completion.usage, elapsed };
  } catch (error) {
    logger.warn(`AI API error: ${error.message} — using mock fallback`);
    return { data: null, usage: null, elapsed: Date.now() - start };
  }
};

/* ─── Portfolio Doctor (AI + intelligent mock) ──────────────────────────── */
const analyzePortfolio = async (portfolioData, userProfile) => {
  const result = await callAI(prompts.buildPortfolioAnalysisPrompt?.(portfolioData, userProfile) || [], { temperature: 0.5 });
  if (result.data) return result;

  // Deterministic mock based on real portfolio metrics
  const assets     = portfolioData.assets || [];
  const totalValue = portfolioData.totalCurrentValue || 0;
  const returns    = portfolioData.returnsPercent    || 0;
  const health     = portfolioData.healthScore       || 50;
  const divScore   = portfolioData.diversificationScore || 50;
  const sectors    = typeof portfolioData.sectorAllocation === 'string' ? JSON.parse(portfolioData.sectorAllocation || '[]') : (portfolioData.sectorAllocation || []);
  const topSector  = sectors[0]?.sector || 'Unknown';
  const topPct     = sectors[0]?.percentage || 0;

  const strengths = [];
  const weaknesses= [];
  const suggestions = [];

  if (returns > 15) strengths.push(`Excellent returns of ${returns.toFixed(1)}% beating market benchmarks`);
  else if (returns > 8) strengths.push(`Good portfolio returns of ${returns.toFixed(1)}%`);
  if (divScore > 70)  strengths.push(`Well-diversified portfolio with ${assets.length} assets across multiple sectors`);
  if (assets.length >= 5) strengths.push('Good asset count reduces single-stock concentration risk');

  if (topPct > 40) weaknesses.push(`Over-concentration in ${topSector} sector (${topPct.toFixed(1)}% — recommended max 30%)`);
  if (divScore < 50) weaknesses.push('Low diversification — portfolio too concentrated in few assets');
  if (returns < 5)   weaknesses.push('Portfolio returns below inflation — real wealth erosion risk');
  if (assets.length < 5) weaknesses.push('Too few assets — add more positions to reduce single-stock risk');

  if (topPct > 35)  suggestions.push({ action: `Reduce ${topSector} allocation to below 30%`, impact: 'Reduces sector concentration risk by ~15%', priority: 'High' });
  if (returns < 10) suggestions.push({ action: 'Rebalance to high-conviction quality stocks', impact: 'Expected 3-5% improvement in annual returns', priority: 'Medium' });
  suggestions.push({ action: 'Set up SIPs in Nifty 50 Index Fund for core stability', impact: 'Adds market beta with minimal management', priority: 'Low' });

  return {
    data: {
      healthScore     : health,
      riskScore       : portfolioData.riskScore || 5,
      strengths,
      weaknesses,
      suggestions,
      summary         : `Your portfolio of ₹${(totalValue / 100000).toFixed(2)}L is ${returns >= 10 ? 'performing well' : 'underperforming'} with ${returns.toFixed(1)}% overall returns. ${weaknesses[0] || 'Keep investing consistently.'}`,
      expectedImprovement: returns < 15 ? `+${Math.round(15 - returns)}% potential annual return improvement` : 'Maintain current allocation',
      confidenceScore : 78,
      analyzedAt      : new Date().toISOString(),
    }
  };
};

/* ─── Daily Brief ───────────────────────────────────────────────────────── */
const generateDailyBrief = async (portfolioData, userName, marketOverview) => {
  const result = await callAI([], { jsonMode: false });
  if (result.data) return result;

  const assets   = portfolioData.assets || [];
  const dayPnl   = portfolioData.dayPnl || 0;
  const value    = portfolioData.totalCurrentValue || 0;
  const returns  = portfolioData.returnsPercent || 0;
  const sectors  = typeof portfolioData.sectorAllocation === 'string' ? JSON.parse(portfolioData.sectorAllocation || '[]') : (portfolioData.sectorAllocation || []);
  const indices  = marketOverview?.indices || [];
  const nifty    = indices[0];

  const topGainer = [...assets].sort((a,b) => (b.dayChangePct||0) - (a.dayChangePct||0))[0];
  const topLoser  = [...assets].sort((a,b) => (a.dayChangePct||0) - (b.dayChangePct||0))[0];
  const sentiment = nifty ? (nifty.change > 0 ? 'bullish' : 'bearish') : 'neutral';
  const overweight= sectors[0];

  const brief = `Hello ${userName},

${dayPnl >= 0 ? '📈' : '📉'} Your portfolio ${dayPnl >= 0 ? 'gained' : 'lost'} ₹${Math.abs(dayPnl).toLocaleString('en-IN')} today${nifty ? ` as ${nifty.name} moved ${nifty.change > 0 ? 'up' : 'down'} ${Math.abs(nifty.change)}%` : ''}.

${topGainer ? `✅ ${topGainer.symbol} rose ${(topGainer.dayChangePct||0).toFixed(1)}% — your best performer today.` : ''}
${topLoser && topLoser.dayChangePct < 0 ? `⚠️ ${topLoser.symbol} fell ${Math.abs(topLoser.dayChangePct||0).toFixed(1)}%.` : ''}

📊 Portfolio Standing: ₹${(value/100000).toFixed(2)}L total value · ${returns >= 0 ? '+' : ''}${returns.toFixed(1)}% overall returns.

${overweight && overweight.percentage > 35 ? `⚡ Alert: You are overweight in ${overweight.sector} sector (${overweight.percentage.toFixed(0)}%). Consider rebalancing.` : '✅ Your sector allocation looks balanced today.'}

🎯 AI Recommendation: ${sentiment === 'bullish' ? 'Market momentum is positive — hold quality positions and look for SIP opportunities.' : 'Exercise caution — consider booking partial profits on overperforming positions.'}`;

  return { data: brief };
};

/* ─── Stock Recommendation ──────────────────────────────────────────────── */
const getStockRecommendation = async (stockData, marketData, userProfile) => {
  const result = await callAI([], {});
  if (result.data) return result;

  const pnlPct = stockData.percentageReturn || 0;
  const rsk    = stockData.riskScore || 5;
  let rec      = 'HOLD';
  let reasoning= '';
  let confidence = 65;

  if (pnlPct > 35 && rsk > 6)   { rec = 'SELL';       reasoning = `${stockData.symbol} is up ${pnlPct.toFixed(0)}% from buy price. At current levels, consider booking partial profits especially given elevated risk score.`; confidence = 72; }
  else if (pnlPct < -15)         { rec = 'SELL';       reasoning = `${stockData.symbol} is down ${Math.abs(pnlPct).toFixed(0)}% — stop loss territory. Review fundamentals before averaging down.`; confidence = 68; }
  else if (pnlPct < -5 && rsk<=3){ rec = 'BUY';        reasoning = `${stockData.symbol} has dipped ${Math.abs(pnlPct).toFixed(0)}% but fundamentals remain strong. Good accumulation opportunity.`; confidence = 74; }
  else if (pnlPct > 15)          { rec = 'HOLD';       reasoning = `${stockData.symbol} is performing well at +${pnlPct.toFixed(0)}%. Hold with a trailing stop loss to protect gains.`; confidence = 70; }
  else                            { rec = 'HOLD';       reasoning = `${stockData.symbol} is within normal range. Monitor quarterly results for the next catalyst.`; confidence = 60; }

  return { data: { recommendation: rec, reasoning, confidenceScore: confidence, symbol: stockData.symbol } };
};

/* ─── Sentiment Analysis ────────────────────────────────────────────────── */
const analyzeSentiment = async (newsItems, marketData) => {
  const result = await callAI([], {});
  if (result.data) return result;
  const mood = (marketData?.indices?.[0]?.change || 0) > 0 ? 'bullish' : 'bearish';
  return { data: { overallSentiment: mood, score: mood === 'bullish' ? 0.6 : -0.4, summary: `Market sentiment is ${mood} today.` } };
};

/* ─── Goal Planning ─────────────────────────────────────────────────────── */
const planGoal = async (goalData, userFinancials) => {
  const result = await callAI([], {});
  if (result.data) return result;
  const { targetAmount, currentSavings, years, expectedReturn = 12 } = goalData;
  const helpers = require('../helpers/calculators');
  const monthlySIP = targetAmount / (helpers.sipFutureValue(1, expectedReturn, years));
  return {
    data: {
      requiredSIP       : Math.round(monthlySIP),
      projectedCorpus   : targetAmount,
      achievabilityScore: Math.min(95, Math.max(30, 100 - (monthlySIP / (userFinancials?.monthlyIncome || 50000)) * 100)),
      tips              : ['Increase SIP by 10% annually', 'Reinvest dividends', 'Review allocation annually'],
    }
  };
};

const coachUser = async (userQuery, userContext, conversationHistory = []) => {
  const result = await callAI([], { jsonMode: false });
  if (result.data) return result;
  return { data: `As your AI Financial Coach, I understand your question about "${userQuery}". Based on your portfolio, ${userContext?.returnsPercent >= 10 ? 'you are on a great track with solid returns' : 'there are opportunities to optimize your investment strategy'}. Let me help you explore this further. What specific aspect would you like to dive deeper into?` };
};

const analyzeRisk        = async (p, m, u) => callAI([], {});
const optimizePortfolio  = async (p, c)    => callAI([], {});
const summarizeNews      = async (a, h)    => callAI([], {});
const generateWeeklyReport= async (p,w,m) => callAI([], { jsonMode: false });
const planRetirement     = async (r)       => callAI([], {});
const analyzePersonality = async (a)       => callAI([], {});
const explainHealthScore = async (s,b,u)   => callAI([], {});

/* ─── Market Crash Simulator ────────────────────────────────────────────── */
const simulateCrash = async (portfolioData, scenario) => {
  const result = await callAI([], { jsonMode: false });
  if (result.data && typeof result.data !== 'string') return result; // If real AI hit

  const assets = portfolioData.assets || [];
  const totalValue = portfolioData.totalCurrentValue || 0;
  
  // Base scenario metrics
  const scenarios = {
    '2008 Crisis': { drop: -52, it: -45, bank: -65, auto: -50, def: -15, gold: 12, rec: '3.2 yrs' },
    '2020 COVID': { drop: -38, it: -10, bank: -45, auto: -40, def: -5, gold: 25, rec: '1.1 yrs' },
    '2016 Demonet.': { drop: -22, it: -5, bank: -15, auto: -25, def: -10, gold: 5, rec: '0.6 yrs' },
    'IT Correction': { drop: -30, it: -55, bank: -15, auto: -20, def: -10, gold: 2, rec: '1.8 yrs' },
    'Rate Hike +2%': { drop: -15, it: -25, bank: 5, auto: -15, def: -5, gold: -10, rec: '0.4 yrs' },
    'Mild Correction': { drop: -10, it: -12, bank: -12, auto: -12, def: -5, gold: 1, rec: '0.2 yrs' }
  };

  const s = scenarios[scenario.name] || scenarios['Mild Correction'];
  let simulatedDropValue = 0;
  let maxRiskAsset = null;
  let maxRiskDrop = 0;

  const assetImpacts = assets.map(a => {
    let dropPct = s.drop;
    const sec = a.sector.toLowerCase();
    
    // Sector-specific overrides
    if (sec.includes('it') || sec.includes('tech')) dropPct = s.it;
    else if (sec.includes('bank') || sec.includes('fin')) dropPct = s.bank;
    else if (sec.includes('auto')) dropPct = s.auto;
    else if (sec.includes('fmcg') || sec.includes('pharma') || sec.includes('defensive')) dropPct = s.def;
    else if (sec.includes('gold') || sec.includes('commodity')) dropPct = s.gold;
    
    // Adjust by risk score (higher risk = worse drop)
    const betaAdj = (a.riskScore || 5) / 5; 
    let finalDrop = dropPct > 0 ? dropPct / betaAdj : dropPct * betaAdj;
    
    const valueDrop = a.currentValue * (finalDrop / 100);
    simulatedDropValue += valueDrop;

    if (finalDrop < maxRiskDrop) {
      maxRiskDrop = finalDrop;
      maxRiskAsset = a.symbol;
    }

    return {
      symbol: a.symbol,
      sector: a.sector,
      currentValue: a.currentValue,
      simulatedDropPct: finalDrop,
      simulatedValue: a.currentValue + valueDrop
    };
  });

  const portfolioImpactPct = totalValue > 0 ? (simulatedDropValue / totalValue) * 100 : 0;
  
  let insight = `Based on your current allocation, your portfolio would drop by ${Math.abs(portfolioImpactPct).toFixed(1)}% during this scenario. `;
  
  if (portfolioImpactPct < s.drop) {
    insight += `Your portfolio underperforms the market drop of ${s.drop}% due to high beta exposure. `;
  } else {
    insight += `Your portfolio outperforms the broader market drop of ${s.drop}% thanks to your defensive allocation. `;
  }

  if (maxRiskAsset) {
    insight += `Consider trimming your position in ${maxRiskAsset} (projected ${Math.abs(maxRiskDrop).toFixed(0)}% drop) and rotating into Gold or FMCG to build resilience.`;
  }

  return {
    data: {
      scenarioName: scenario.name,
      marketDrop: s.drop,
      portfolioDrop: parseFloat(portfolioImpactPct.toFixed(1)),
      recoveryTime: s.rec,
      insight,
      assetImpacts
    }
  };
};

module.exports = {
  analyzePortfolio, getStockRecommendation, analyzeSentiment,
  summarizeNews, analyzeRisk, planGoal, optimizePortfolio,
  coachUser, generateWeeklyReport, planRetirement,
  analyzePersonality, explainHealthScore, generateDailyBrief,
  simulateCrash,
};
