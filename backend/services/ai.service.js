/**
 * AI Service
 * ──────────
 * Core service for interacting with OpenAI API.
 * Handles all AI operations: portfolio analysis, recommendations,
 * sentiment analysis, chat, and report generation.
 */

'use strict';

const OpenAI  = require('openai');
const logger  = require('../config/logger');
const prompts = require('../prompts');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const DEFAULT_MODEL       = process.env.OPENAI_MODEL       || 'gpt-4-turbo-preview';
const DEFAULT_MAX_TOKENS  = parseInt(process.env.OPENAI_MAX_TOKENS, 10)  || 2048;
const DEFAULT_TEMPERATURE = parseFloat(process.env.OPENAI_TEMPERATURE)   || 0.7;

/**
 * Core AI completion wrapper with retry logic and logging.
 */
const callAI = async (messages, options = {}) => {
  const {
    model       = DEFAULT_MODEL,
    maxTokens   = DEFAULT_MAX_TOKENS,
    temperature = DEFAULT_TEMPERATURE,
    jsonMode    = true,
  } = options;

  const startTime = Date.now();

  try {
    const completion = await openai.chat.completions.create({
      model,
      messages,
      max_tokens  : maxTokens,
      temperature,
      response_format: jsonMode ? { type: 'json_object' } : { type: 'text' },
    });

    const elapsed = Date.now() - startTime;
    const usage   = completion.usage;

    logger.info(`AI call completed in ${elapsed}ms | Tokens: ${usage?.total_tokens} | Model: ${model}`);

    const content = completion.choices[0]?.message?.content;

    if (jsonMode) {
      try {
        return { data: JSON.parse(content), usage, elapsed };
      } catch (parseError) {
        logger.warn('AI response was not valid JSON, returning raw text');
        return { data: { raw: content }, usage, elapsed };
      }
    }

    return { data: content, usage, elapsed };
  } catch (error) {
    logger.error(`AI API error: ${error.message}`, { model, error: error.type });
    throw error;
  }
};

/**
 * Analyze a full portfolio and return health score, insights, and recommendations.
 */
const analyzePortfolio = async (portfolioData, userProfile) => {
  const messages = prompts.buildPortfolioAnalysisPrompt(portfolioData, userProfile);
  return callAI(messages, { temperature: 0.5 });
};

/**
 * Generate Buy/Hold/Sell recommendation for a specific stock.
 */
const getStockRecommendation = async (stockData, marketData, userProfile) => {
  const messages = prompts.buildStockRecommendationPrompt(stockData, marketData, userProfile);
  return callAI(messages, { temperature: 0.4 });
};

/**
 * Analyze market sentiment from news and market data.
 */
const analyzeSentiment = async (newsItems, marketData) => {
  const messages = prompts.buildSentimentAnalysisPrompt(newsItems, marketData);
  return callAI(messages, { temperature: 0.3, maxTokens: 1500 });
};

/**
 * Summarize financial news articles with portfolio relevance.
 */
const summarizeNews = async (articles, userHoldings) => {
  const messages = prompts.buildNewsSummaryPrompt(articles, userHoldings);
  return callAI(messages, { temperature: 0.4, maxTokens: 2000 });
};

/**
 * Perform detailed portfolio risk analysis.
 */
const analyzeRisk = async (portfolioData, marketData, userProfile) => {
  const messages = prompts.buildRiskAnalysisPrompt(portfolioData, marketData, userProfile);
  return callAI(messages, { temperature: 0.3 });
};

/**
 * Create a goal-based investment plan.
 */
const planGoal = async (goalData, userFinancials) => {
  const messages = prompts.buildGoalPlanningPrompt(goalData, userFinancials);
  return callAI(messages, { temperature: 0.5 });
};

/**
 * Generate portfolio optimization recommendations.
 */
const optimizePortfolio = async (portfolioData, constraints) => {
  const messages = prompts.buildPortfolioOptimizationPrompt(portfolioData, constraints);
  return callAI(messages, { temperature: 0.4 });
};

/**
 * AI Financial Coach — conversational financial guidance.
 */
const coachUser = async (userQuery, userContext, conversationHistory = []) => {
  const systemMessages = prompts.buildFinancialCoachPrompt(userQuery, userContext);
  const messages = [
    systemMessages[0],
    ...conversationHistory,
    systemMessages[1],
  ];
  return callAI(messages, { jsonMode: false, temperature: 0.7, maxTokens: 1000 });
};

/**
 * Generate weekly portfolio report.
 */
const generateWeeklyReport = async (portfolioData, weeklyData, marketData) => {
  const messages = prompts.buildWeeklyReportPrompt(portfolioData, weeklyData, marketData);
  return callAI(messages, { jsonMode: false, temperature: 0.6, maxTokens: 3000 });
};

/**
 * Create a retirement plan.
 */
const planRetirement = async (retirementData) => {
  const messages = prompts.buildRetirementPlannerPrompt(retirementData);
  return callAI(messages, { temperature: 0.4 });
};

/**
 * Analyze investor personality from questionnaire answers.
 */
const analyzePersonality = async (answers) => {
  const messages = prompts.buildPersonalityAnalysisPrompt(answers);
  return callAI(messages, { temperature: 0.6 });
};

/**
 * Generate AI-powered portfolio health score explanation.
 */
const explainHealthScore = async (score, breakdown, userProfile) => {
  const messages = [
    { role: 'system', content: prompts.FINANCIAL_ADVISOR_PERSONA },
    {
      role   : 'user',
      content: `Explain in simple terms why this portfolio received a health score of ${score}/100.
      
Score Breakdown: ${JSON.stringify(breakdown)}
User Profile: Risk = ${userProfile?.riskProfile}, Horizon = ${userProfile?.investmentHorizon}

STRICT GUARDRAILS:
1. Explainability: Provide a clear, 1-sentence rationale for every recommendation or insight.
2. Anti-Hallucination: If data is missing to answer a question, explicitly state "Insufficient Data". Do NOT invent financial metrics, stock prices, or events.

Provide:
1. Simple explanation (2–3 sentences for a non-expert)
2. What the score means for this specific investor
3. The #1 thing they can do to improve it this week
4. Encouragement if score > 70, gentle warning if score < 50

Return as JSON with fields: explanation, meaning, topAction, message`,
    },
  ];
  return callAI(messages, { temperature: 0.6, maxTokens: 800 });
};

module.exports = {
  analyzePortfolio,
  getStockRecommendation,
  analyzeSentiment,
  summarizeNews,
  analyzeRisk,
  planGoal,
  optimizePortfolio,
  coachUser,
  generateWeeklyReport,
  planRetirement,
  analyzePersonality,
  explainHealthScore,
};
