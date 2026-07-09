/**
 * AI Prompt Templates — InvestIQ AI
 * ===================================
 * Centralized repository of all AI prompt templates used across
 * the application. Follows the system/user/assistant pattern for
 * OpenAI-compatible APIs.
 *
 * Usage:
 *   const { buildPortfolioAnalysisPrompt } = require('./prompts');
 *   const messages = buildPortfolioAnalysisPrompt(portfolioData, userProfile);
 */

'use strict';

// ─── System Personas ────────────────────────────────────────────────────────

const FINANCIAL_ADVISOR_PERSONA = `You are InvestIQ AI, an elite AI-powered financial portfolio advisor with 20+ years of experience in Indian and global financial markets. You combine the expertise of a Chartered Financial Analyst (CFA), SEBI Registered Investment Advisor (RIA), and behavioral finance specialist.

Your core capabilities:
- Deep understanding of Indian equity markets (NSE/BSE), mutual funds, ETFs, gold, bonds, and alternative investments
- Mastery of fundamental and technical analysis
- Expertise in portfolio optimization, risk management, and asset allocation
- Knowledge of Indian tax laws (LTCG, STCG, Section 80C, ELSS)
- Behavioral finance and investor psychology
- Global macroeconomic analysis

Personality traits:
- Professional yet approachable, like a trusted personal advisor
- Data-driven with actionable insights
- Proactively spots risks and opportunities
- Always explains the "why" behind recommendations
- Uses clear, jargon-free language with specific numbers

Response guidelines:
- Always provide specific, actionable recommendations (not generic advice)
- Support every recommendation with data and reasoning
- Quantify risks and expected returns where possible
- Consider the user's risk profile, goals, and time horizon
- Flag regulatory/tax implications when relevant
- Be honest about uncertainty — use confidence scores
- Format responses with clear sections, bullet points, and emoji for readability`;

const MARKET_ANALYST_PERSONA = `You are InvestIQ AI's Market Intelligence Engine — an advanced AI that processes and synthesizes financial news, market data, and sentiment signals to deliver actionable market intelligence.

Your expertise:
- Real-time market sentiment analysis using NLP
- News impact assessment on individual stocks and sectors
- Macroeconomic event analysis (RBI policy, Union Budget, global events)
- Fear & Greed index calculations
- Technical market breadth analysis
- Sector rotation detection`;

const RISK_ANALYST_PERSONA = `You are InvestIQ AI's Risk Assessment Engine — a quantitative risk specialist with expertise in:
- Portfolio-level risk metrics (VaR, CVaR, Sharpe Ratio, Beta, Alpha)
- Concentration risk, correlation analysis
- Drawdown analysis and stress testing
- Liquidity risk assessment
- Behavioral risk factors (overconfidence, recency bias, herding)
- Black swan event modeling
- Risk-adjusted return optimization`;

// ─── Portfolio Analysis Prompt ───────────────────────────────────────────────

const buildPortfolioAnalysisPrompt = (portfolioData, userProfile) => {
  const {
    name, totalInvested, totalCurrentValue, totalReturns, returnsPercent,
    cagr, assets, sectorAllocation, assetClassAllocation,
  } = portfolioData;

  const { riskProfile, investmentGoals, investmentHorizon, annualIncome } = userProfile;

  return [
    {
      role   : 'system',
      content: FINANCIAL_ADVISOR_PERSONA,
    },
    {
      role   : 'user',
      content: `
Perform a COMPREHENSIVE PORTFOLIO ANALYSIS for the following portfolio:

## Portfolio Overview
- Name: ${name}
- Total Invested: ₹${totalInvested?.toLocaleString('en-IN')}
- Current Value: ₹${totalCurrentValue?.toLocaleString('en-IN')}
- Total Returns: ₹${totalReturns?.toLocaleString('en-IN')} (${returnsPercent?.toFixed(2)}%)
- CAGR: ${cagr?.toFixed(2)}%

## Investor Profile
- Risk Tolerance: ${riskProfile}
- Investment Goals: ${investmentGoals?.join(', ')}
- Time Horizon: ${investmentHorizon}
- Annual Income: ₹${annualIncome?.toLocaleString('en-IN')}

## Holdings
${assets?.map(a => `- ${a.name} (${a.symbol}) | ${a.type} | ₹${a.currentValue?.toLocaleString('en-IN')} | ${a.allocationPct?.toFixed(1)}% | Returns: ${a.percentageReturn?.toFixed(2)}%`).join('\n')}

## Sector Allocation
${sectorAllocation?.map(s => `- ${s.sector}: ${s.percentage?.toFixed(1)}%`).join('\n')}

## Asset Class Allocation
${assetClassAllocation?.map(a => `- ${a.assetClass}: ${a.percentage?.toFixed(1)}%`).join('\n')}

Please provide:
1. **Portfolio Health Score** (0–100) with detailed breakdown
2. **Strengths** — What's working well
3. **Weaknesses** — Areas of concern
4. **Opportunities** — Specific actions to improve returns
5. **Threats** — Risks that could impact the portfolio
6. **Diversification Analysis** — Is the portfolio well-diversified?
7. **Risk Assessment** — Overall risk level with specific risk factors
8. **Rebalancing Recommendations** — Specific allocation targets
9. **Top 3 Action Items** — Immediate steps to take
10. **AI Confidence Score** — Your confidence in this analysis (0–100%)

Format your response as a structured JSON object.`,
    },
  ];
};

// ─── Stock Recommendation Prompt ─────────────────────────────────────────────

const buildStockRecommendationPrompt = (stockData, marketData, userProfile) => {
  const { symbol, name, sector, currentPrice, fundamentals, technicals, recentNews } = stockData;

  return [
    {
      role   : 'system',
      content: FINANCIAL_ADVISOR_PERSONA,
    },
    {
      role   : 'user',
      content: `
Generate a detailed BUY / HOLD / SELL recommendation for:

## Stock: ${name} (${symbol})
- Sector: ${sector}
- Current Price: ₹${currentPrice}

## Fundamental Data
- P/E Ratio: ${fundamentals?.pe}
- P/B Ratio: ${fundamentals?.pb}
- Revenue Growth (YoY): ${fundamentals?.revenueGrowth}%
- PAT Growth (YoY): ${fundamentals?.patGrowth}%
- Debt-to-Equity: ${fundamentals?.debtToEquity}
- ROE: ${fundamentals?.roe}%
- Dividend Yield: ${fundamentals?.dividendYield}%
- Market Cap: ₹${fundamentals?.marketCap?.toLocaleString('en-IN')}
- 52-Week High/Low: ₹${fundamentals?.weekHigh52} / ₹${fundamentals?.weekLow52}

## Technical Indicators
- RSI (14): ${technicals?.rsi}
- MACD Signal: ${technicals?.macdSignal}
- 50 DMA: ₹${technicals?.ma50}
- 200 DMA: ₹${technicals?.ma200}
- Trend: ${technicals?.trend}
- Volume Trend: ${technicals?.volumeTrend}

## Recent News Sentiment
${recentNews?.map(n => `- ${n.headline} [${n.sentiment}]`).join('\n')}

## Investor Profile
- Risk Tolerance: ${userProfile?.riskProfile}
- Horizon: ${userProfile?.investmentHorizon}

Provide:
1. **Recommendation**: STRONG BUY / BUY / HOLD / SELL / STRONG SELL
2. **Conviction Level**: High / Medium / Low
3. **Target Price** (12-month): ₹X
4. **Stop Loss**: ₹X
5. **Upside/Downside Potential**: X%
6. **Key Bull Case** (3 points)
7. **Key Bear Case** (3 points)
8. **Fundamental Score** (0–100)
9. **Technical Score** (0–100)
10. **Sentiment Score** (-1 to +1)
11. **Risk Score** (1–10, higher = riskier)
12. **Recommended Action**: Specific steps (buy X shares, add on dips, trim on rallies, etc.)
13. **AI Confidence**: X%

Return as structured JSON.`,
    },
  ];
};

// ─── Market Sentiment Analysis Prompt ────────────────────────────────────────

const buildSentimentAnalysisPrompt = (newsItems, marketData) => {
  return [
    {
      role   : 'system',
      content: MARKET_ANALYST_PERSONA,
    },
    {
      role   : 'user',
      content: `
Analyze the overall market sentiment based on the following data:

## Market Indices
- Nifty 50: ${marketData?.nifty50?.value} (${marketData?.nifty50?.change}%)
- Sensex: ${marketData?.sensex?.value} (${marketData?.sensex?.change}%)
- Nifty Bank: ${marketData?.bankNifty?.value} (${marketData?.bankNifty?.change}%)
- India VIX: ${marketData?.vix}
- FII Net: ₹${marketData?.fiiNet?.toLocaleString('en-IN')} Cr
- DII Net: ₹${marketData?.diiNet?.toLocaleString('en-IN')} Cr

## Financial News Headlines (Last 24h)
${newsItems?.map((n, i) => `${i + 1}. ${n.headline} [Source: ${n.source}]`).join('\n')}

Analyze and return:
1. **Overall Sentiment**: Very Bullish / Bullish / Neutral / Bearish / Very Bearish
2. **Fear & Greed Index**: 0–100 (0=Extreme Fear, 100=Extreme Greed)
3. **Market Mood**: One-paragraph description
4. **Sector Sentiments**: Sentiment for each major sector
5. **Key Drivers**: Top 5 market-moving factors today
6. **Risk Events**: Upcoming events that could cause volatility
7. **Investor Advice**: What should retail investors do today?
8. **Confidence**: Your confidence in this sentiment reading (0–100%)

Return as structured JSON.`,
    },
  ];
};

// ─── Financial News Summarization Prompt ─────────────────────────────────────

const buildNewsSummaryPrompt = (articles, userHoldings) => {
  const holdingSymbols = userHoldings?.map(h => h.symbol).join(', ');

  return [
    {
      role   : 'system',
      content: MARKET_ANALYST_PERSONA,
    },
    {
      role   : 'user',
      content: `
Summarize the following financial news articles, with special attention to stocks in the user's portfolio.

## User's Portfolio Holdings
${holdingSymbols || 'Not provided'}

## News Articles
${articles?.map((a, i) => `
### Article ${i + 1}
**Headline**: ${a.title}
**Source**: ${a.source}
**Published**: ${a.publishedAt}
**Content**: ${a.content?.substring(0, 500)}...
`).join('\n')}

For each article, provide:
1. **One-line Summary**: Concise TL;DR
2. **Impact**: High / Medium / Low
3. **Affected Assets**: Which stocks/sectors are affected
4. **Sentiment**: Positive / Negative / Neutral
5. **Portfolio Relevance**: Does this affect the user's holdings? If yes, how?
6. **Recommended Action**: Any immediate action needed?

Also provide an overall **Daily Market Brief** (3–4 sentences summarizing the key themes of the day).

Return as structured JSON with individual article summaries and a daily brief.`,
    },
  ];
};

// ─── Risk Analysis Prompt ─────────────────────────────────────────────────────

const buildRiskAnalysisPrompt = (portfolioData, marketData, userProfile) => {
  return [
    {
      role   : 'system',
      content: RISK_ANALYST_PERSONA,
    },
    {
      role   : 'user',
      content: `
Perform a comprehensive RISK ANALYSIS for the following portfolio:

## Portfolio
- Total Value: ₹${portfolioData?.totalCurrentValue?.toLocaleString('en-IN')}
- Asset Count: ${portfolioData?.assets?.length}
- Diversification Score: ${portfolioData?.diversificationScore}
- Top Holding Concentration: ${portfolioData?.assets?.[0]?.allocationPct?.toFixed(1)}% (${portfolioData?.assets?.[0]?.symbol})
- Sector Concentration: ${portfolioData?.sectorAllocation?.[0]?.sector} at ${portfolioData?.sectorAllocation?.[0]?.percentage?.toFixed(1)}%

## Holdings Risk Profile
${portfolioData?.assets?.map(a => `- ${a.symbol}: Beta=${a.beta || 'N/A'}, Volatility=${a.volatility || 'N/A'}, Allocation=${a.allocationPct?.toFixed(1)}%`).join('\n')}

## Current Market Conditions
- India VIX: ${marketData?.vix}
- Market Trend: ${marketData?.trend}
- Interest Rate Environment: ${marketData?.rbiRate}%

## Investor Profile
- Risk Tolerance: ${userProfile?.riskProfile}
- Age: ${userProfile?.age}
- Investment Horizon: ${userProfile?.investmentHorizon}

Provide:
1. **Overall Risk Score**: 1–10 (1=Very Low, 10=Very High)
2. **Risk Level**: Very Low / Low / Moderate / High / Very High
3. **Portfolio Beta**: Estimated market sensitivity
4. **Concentration Risk**: Analysis of position and sector concentration
5. **Correlation Risk**: Are holdings moving together?
6. **Liquidity Risk**: Assessment of asset liquidity
7. **Market Risk**: Current macro/market risks
8. **Behavioral Risk**: Typical investor mistakes for this profile
9. **Stress Test Results**: Portfolio value in -10%, -20%, -30% market scenarios
10. **Risk Reduction Actions**: Top 5 specific steps to reduce risk
11. **One-click Risk Reduction Plan**: Specific rebalancing trades to immediately reduce risk
12. **Risk Score Breakdown**: Scores for each risk category

Return as structured JSON.`,
    },
  ];
};

// ─── Goal Planning Prompt ─────────────────────────────────────────────────────

const buildGoalPlanningPrompt = (goalData, userFinancials) => {
  const { name, type, targetAmount, targetDate, currentAmount, monthlySIP } = goalData;
  const { annualIncome, monthlyExpenses, currentSavings, existingInvestments } = userFinancials;

  const monthsRemaining = Math.max(0,
    (new Date(targetDate) - new Date()) / (1000 * 60 * 60 * 24 * 30)
  );

  return [
    {
      role   : 'system',
      content: FINANCIAL_ADVISOR_PERSONA,
    },
    {
      role   : 'user',
      content: `
Create a comprehensive GOAL-BASED INVESTMENT PLAN:

## Goal Details
- Goal: ${name} (${type})
- Target Amount: ₹${targetAmount?.toLocaleString('en-IN')}
- Target Date: ${new Date(targetDate).toLocaleDateString('en-IN')}
- Months Remaining: ${Math.round(monthsRemaining)}
- Current Savings for Goal: ₹${currentAmount?.toLocaleString('en-IN')}
- Current Monthly SIP: ₹${monthlySIP?.toLocaleString('en-IN')}

## Financial Profile
- Monthly Income: ₹${(annualIncome / 12)?.toLocaleString('en-IN')}
- Monthly Expenses: ₹${monthlyExpenses?.toLocaleString('en-IN')}
- Current Savings: ₹${currentSavings?.toLocaleString('en-IN')}
- Existing Investments: ₹${existingInvestments?.toLocaleString('en-IN')}

Provide:
1. **Feasibility Assessment**: Is the goal achievable? On-track / At-risk / Infeasible
2. **Required Monthly SIP**: Exact amount needed to reach the goal
3. **Investment Strategy**: Asset allocation recommendation (equity/debt/gold) with percentages
4. **Recommended Funds/Instruments**: Specific investment recommendations with expected returns
5. **Milestone Plan**: Quarterly milestones to track progress
6. **Tax Optimization**: Tax-saving opportunities related to this goal
7. **Inflation-Adjusted Target**: Real target amount accounting for 6% inflation
8. **Contingency Plan**: What if returns are lower than expected?
9. **Gamification Milestones**: 5 achievement milestones to celebrate progress
10. **AI Confidence**: Probability of achieving the goal given current trajectory

Return as structured JSON.`,
    },
  ];
};

// ─── Portfolio Optimization Prompt ───────────────────────────────────────────

const buildPortfolioOptimizationPrompt = (portfolioData, constraints) => {
  return [
    {
      role   : 'system',
      content: FINANCIAL_ADVISOR_PERSONA,
    },
    {
      role   : 'user',
      content: `
Generate a PORTFOLIO OPTIMIZATION PLAN using Modern Portfolio Theory and factor-based investing:

## Current Portfolio
${portfolioData?.assets?.map(a => `- ${a.symbol} (${a.type}): ${a.allocationPct?.toFixed(1)}% | Returns: ${a.percentageReturn?.toFixed(1)}% | Risk Score: ${a.riskScore}`).join('\n')}

## Current Metrics
- Portfolio Return: ${portfolioData?.returnsPercent?.toFixed(2)}%
- Portfolio Risk Score: ${portfolioData?.riskScore}
- Sharpe Ratio (estimated): ${portfolioData?.sharpeRatio || 'N/A'}
- Diversification Score: ${portfolioData?.diversificationScore}

## Optimization Constraints
- Risk Tolerance: ${constraints?.riskTolerance}
- Investment Horizon: ${constraints?.horizon}
- Tax Consideration: ${constraints?.taxConsideration ? 'Yes' : 'No'}
- Maximum Single Stock: ${constraints?.maxSingleStock}%
- Minimum Equity: ${constraints?.minEquity}%

Provide:
1. **Optimized Allocation**: Exact % allocation for each asset class
2. **Stocks to Add**: New positions to improve diversification/returns
3. **Stocks to Trim**: Positions to reduce
4. **Stocks to Exit**: Positions to close (with tax implications)
5. **Rebalancing Trades**: Specific buy/sell amounts in ₹
6. **Expected Improvement**: New expected return, risk score, Sharpe ratio
7. **Implementation Timeline**: When to make each trade
8. **Tax Impact**: Capital gains tax implications
9. **Total Transaction Costs**: Estimated brokerage + taxes
10. **Smart Diversification Score**: Before vs. after optimization

Return as structured JSON with a detailed trade plan.`,
    },
  ];
};

// ─── AI Financial Coach Prompt ────────────────────────────────────────────────

const buildFinancialCoachPrompt = (userQuery, userContext) => {
  return [
    {
      role   : 'system',
      content: `${FINANCIAL_ADVISOR_PERSONA}

In coaching mode, you are more conversational and educational. You:
- Ask clarifying questions when needed
- Use real Indian examples (Infosys IPO, 2008 crash, COVID recovery)
- Correct financial misconceptions gently but firmly
- Provide step-by-step explanations
- Celebrate good financial habits
- Use Indian financial context (SIP, ELSS, PPF, NPS, NSE/BSE)`,
    },
    {
      role   : 'user',
      content: `
User Context:
- Risk Profile: ${userContext?.riskProfile}
- Portfolio Value: ₹${userContext?.portfolioValue?.toLocaleString('en-IN')}
- Investment Experience: ${userContext?.experience || 'Unknown'}
- Age: ${userContext?.age || 'Not provided'}

User Question: ${userQuery}

Respond as a friendly, knowledgeable financial coach. Be specific, cite real data where possible, and end with a clear action item or follow-up question.`,
    },
  ];
};

// ─── Weekly Report Prompt ─────────────────────────────────────────────────────

const buildWeeklyReportPrompt = (portfolioData, weeklyData, marketData) => {
  return [
    {
      role   : 'system',
      content: FINANCIAL_ADVISOR_PERSONA,
    },
    {
      role   : 'user',
      content: `
Generate a comprehensive WEEKLY PORTFOLIO REPORT:

## This Week's Performance
- Portfolio Value: ₹${portfolioData?.totalCurrentValue?.toLocaleString('en-IN')}
- Week's P&L: ₹${weeklyData?.weekPnl?.toLocaleString('en-IN')} (${weeklyData?.weekPnlPct?.toFixed(2)}%)
- Best Performer: ${weeklyData?.bestPerformer?.symbol} (+${weeklyData?.bestPerformer?.return?.toFixed(2)}%)
- Worst Performer: ${weeklyData?.worstPerformer?.symbol} (${weeklyData?.worstPerformer?.return?.toFixed(2)}%)

## Market Context This Week
- Nifty 50 Weekly: ${marketData?.niftyWeekly?.toFixed(2)}%
- Key Events: ${marketData?.keyEvents?.join(', ')}
- FII Activity: ${marketData?.fiiWeekly > 0 ? 'Net Buyers' : 'Net Sellers'} — ₹${Math.abs(marketData?.fiiWeekly)?.toLocaleString('en-IN')} Cr

## Holdings Performance
${portfolioData?.assets?.map(a => `- ${a.symbol}: ${a.weekChange?.toFixed(2)}%`).join('\n')}

Generate a professional weekly report including:
1. **Executive Summary** (2–3 sentences)
2. **Performance vs Benchmark** (vs Nifty 50)
3. **Key Highlights** of the week
4. **Portfolio Changes** (if any)
5. **Market Insights**: What drove markets this week
6. **Top Stories** affecting the portfolio
7. **Next Week Outlook**: What to watch
8. **Action Items** for next week
9. **AI Insights**: 3 unique AI-generated observations
10. **Motivational Message**: Personalized encouragement

Format as a ready-to-display report with sections and emojis.`,
    },
  ];
};

// ─── Retirement Planner Prompt ────────────────────────────────────────────────

const buildRetirementPlannerPrompt = (retirementData) => {
  const {
    currentAge, retirementAge, monthlyExpenses, currentSavings,
    existingRetirementCorpus, inflationRate, expectedReturn,
  } = retirementData;

  return [
    {
      role   : 'system',
      content: FINANCIAL_ADVISOR_PERSONA,
    },
    {
      role   : 'user',
      content: `
Create a comprehensive RETIREMENT PLAN:

## Personal Details
- Current Age: ${currentAge}
- Target Retirement Age: ${retirementAge}
- Years to Retirement: ${retirementAge - currentAge}
- Life Expectancy: 85 years (assumed)

## Financial Situation
- Current Monthly Expenses: ₹${monthlyExpenses?.toLocaleString('en-IN')}
- Current Retirement Savings: ₹${currentSavings?.toLocaleString('en-IN')}
- Existing Corpus (PPF/NPS/EPF): ₹${existingRetirementCorpus?.toLocaleString('en-IN')}

## Assumptions
- Inflation Rate: ${inflationRate}% p.a.
- Expected Investment Return: ${expectedReturn}% p.a.

Calculate and provide:
1. **Retirement Corpus Required**: Exact amount needed at retirement
2. **Monthly Expenses at Retirement**: Inflation-adjusted
3. **Current Corpus Shortfall**: Gap between current savings and required
4. **Monthly SIP Required**: To bridge the gap
5. **Investment Strategy**: Asset allocation by age (glide path)
6. **NPS/PPF/ELSS Recommendations**: Tax-efficient instruments
7. **Milestone Corpus Targets**: At ages 35, 40, 45, 50, 55
8. **Safe Withdrawal Rate**: How much to withdraw monthly in retirement
9. **Healthcare Buffer**: Estimated medical expenses in retirement
10. **Retirement Readiness Score**: 0–100
11. **Phase-wise Strategy**: Accumulation → Pre-retirement → Distribution phases

Return as structured JSON with a detailed year-by-year projection table.`,
    },
  ];
};

// ─── Investment Personality Test Scoring Prompt ───────────────────────────────

const buildPersonalityAnalysisPrompt = (answers) => {
  return [
    {
      role   : 'system',
      content: `${FINANCIAL_ADVISOR_PERSONA}

You are also an expert in behavioral finance and investor psychology, certified in psychological assessment for financial planning.`,
    },
    {
      role   : 'user',
      content: `
Based on the following investment personality questionnaire answers, determine the user's investor profile:

## Questionnaire Answers
${Object.entries(answers).map(([q, a]) => `Q: ${q}\nA: ${a}`).join('\n\n')}

Analyze and provide:
1. **Investor Archetype**: (e.g., "The Cautious Saver", "The Growth Seeker", "The Balanced Investor", "The Bold Trader", "The Passive Indexer")
2. **Risk Tolerance Score**: 0–100
3. **Risk Profile**: Conservative / Moderate / Moderately Aggressive / Aggressive
4. **Behavioral Biases Detected**: List 3 likely biases with explanations
5. **Investment Strengths**: What this investor does well
6. **Investment Weaknesses**: Common pitfalls to avoid
7. **Recommended Asset Allocation**: Specific % for equity/debt/gold/alternatives
8. **Investment Style**: Value / Growth / Blend / Index / Momentum
9. **Recommended Instruments**: Specific mutual funds, stocks, ETFs that match the profile
10. **Personalized Advice**: 3 key pieces of advice for this specific personality
11. **Portfolio DNA**: A unique description of this investor's financial DNA

Return as structured JSON with a personalized narrative.`,
    },
  ];
};

// ─── Exports ──────────────────────────────────────────────────────────────────

module.exports = {
  buildPortfolioAnalysisPrompt,
  buildStockRecommendationPrompt,
  buildSentimentAnalysisPrompt,
  buildNewsSummaryPrompt,
  buildRiskAnalysisPrompt,
  buildGoalPlanningPrompt,
  buildPortfolioOptimizationPrompt,
  buildFinancialCoachPrompt,
  buildWeeklyReportPrompt,
  buildRetirementPlannerPrompt,
  buildPersonalityAnalysisPrompt,
  FINANCIAL_ADVISOR_PERSONA,
  MARKET_ANALYST_PERSONA,
  RISK_ANALYST_PERSONA,
};
