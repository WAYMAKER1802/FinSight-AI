/**
 * AI Controller
 * ─────────────
 * REST endpoints for all AI-powered features: portfolio analysis,
 * stock recommendations, sentiment, coaching, reports, and more.
 */

'use strict';

const aiService   = require('../services/ai.service');
const Portfolio   = require('../models/Portfolio.model');
const Report      = require('../models/Report.model');
const { AppError }= require('../middleware/errorHandler');
const logger      = require('../config/logger');

/**
 * @swagger
 * /ai/analyze-portfolio/{portfolioId}:
 *   post:
 *     summary: Run full AI analysis on a portfolio
 *     tags: [AI]
 *     parameters:
 *       - in: path
 *         name: portfolioId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: AI analysis result }
 */
exports.analyzePortfolio = async (req, res, next) => {
  try {
    const portfolio = await Portfolio.findOne({
      _id   : req.params.portfolioId,
      userId: req.user._id,
    });

    if (!portfolio) return next(new AppError('Portfolio not found.', 404));

    const { data, usage, elapsed } = await aiService.analyzePortfolio(
      portfolio.toObject(),
      req.user.toSafeObject()
    );

    // Update portfolio with AI results
    if (data.healthScore !== undefined) {
      portfolio.healthScore     = data.healthScore;
      portfolio.lastAIAnalysis  = {
        summary     : data.summary || '',
        insights    : data.insights || [],
        warnings    : data.warnings || [],
        opportunities: data.opportunities || [],
        analyzedAt  : new Date(),
      };
      portfolio.overallSentiment = data.overallSentiment || 'neutral';
      await portfolio.save({ validateBeforeSave: false });
    }

    logger.info(`Portfolio analysis for ${portfolio.name} | ${elapsed}ms | ${usage?.total_tokens} tokens`);

    res.status(200).json({
      success    : true,
      message    : 'AI portfolio analysis complete',
      data       : { analysis: data },
      meta       : { tokensUsed: usage?.total_tokens, processingMs: elapsed },
      timestamp  : new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /ai/stock-recommendation:
 *   post:
 *     summary: Get AI Buy/Hold/Sell recommendation for a stock
 *     tags: [AI]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               symbol: { type: string, example: "RELIANCE" }
 *               currentPrice: { type: number, example: 2780 }
 */
exports.getStockRecommendation = async (req, res, next) => {
  try {
    const { stockData, marketData } = req.body;

    if (!stockData?.symbol) {
      return next(new AppError('Stock symbol is required.', 400));
    }

    const { data, usage, elapsed } = await aiService.getStockRecommendation(
      stockData,
      marketData || {},
      req.user.toSafeObject()
    );

    res.status(200).json({
      success  : true,
      message  : 'Stock recommendation generated',
      data     : { recommendation: data },
      meta     : { tokensUsed: usage?.total_tokens, processingMs: elapsed },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /ai/sentiment:
 *   post:
 *     summary: Analyze market sentiment from news and market data
 *     tags: [AI]
 */
exports.analyzeSentiment = async (req, res, next) => {
  try {
    const { newsItems, marketData } = req.body;

    const { data, usage, elapsed } = await aiService.analyzeSentiment(
      newsItems || [],
      marketData || {}
    );

    res.status(200).json({
      success  : true,
      message  : 'Market sentiment analysis complete',
      data     : { sentiment: data },
      meta     : { tokensUsed: usage?.total_tokens, processingMs: elapsed },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /ai/chat:
 *   post:
 *     summary: Chat with AI Financial Coach
 *     tags: [AI]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [message]
 *             properties:
 *               message: { type: string, example: "Should I invest in gold right now?" }
 *               conversationHistory: { type: array }
 */
exports.chat = async (req, res, next) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message?.trim()) {
      return next(new AppError('Message cannot be empty.', 400));
    }

    const userContext = {
      riskProfile   : req.user.riskProfile,
      portfolioValue: null, // Could be fetched from DB
      experience    : 'intermediate',
      age           : null,
    };

    const { data, usage, elapsed } = await aiService.coachUser(
      message,
      userContext,
      conversationHistory
    );

    res.status(200).json({
      success  : true,
      data     : {
        reply    : data,
        sessionId: req.body.sessionId || null,
      },
      meta     : { tokensUsed: usage?.total_tokens, processingMs: elapsed },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /ai/risk-analysis/{portfolioId}:
 *   post:
 *     summary: Perform deep risk analysis on a portfolio
 *     tags: [AI]
 */
exports.analyzeRisk = async (req, res, next) => {
  try {
    const portfolio = await Portfolio.findOne({
      _id   : req.params.portfolioId,
      userId: req.user._id,
    });

    if (!portfolio) return next(new AppError('Portfolio not found.', 404));

    const { data, usage, elapsed } = await aiService.analyzeRisk(
      portfolio.toObject(),
      req.body.marketData || {},
      req.user.toSafeObject()
    );

    // Update risk score
    if (data.overallRiskScore !== undefined) {
      portfolio.riskScore = data.overallRiskScore;
      await portfolio.save({ validateBeforeSave: false });
    }

    res.status(200).json({
      success  : true,
      message  : 'Risk analysis complete',
      data     : { riskAnalysis: data },
      meta     : { tokensUsed: usage?.total_tokens, processingMs: elapsed },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /ai/optimize/{portfolioId}:
 *   post:
 *     summary: Get AI portfolio optimization recommendations
 *     tags: [AI]
 */
exports.optimizePortfolio = async (req, res, next) => {
  try {
    const portfolio = await Portfolio.findOne({
      _id   : req.params.portfolioId,
      userId: req.user._id,
    });

    if (!portfolio) return next(new AppError('Portfolio not found.', 404));

    const constraints = {
      riskTolerance   : req.user.riskProfile,
      horizon         : req.user.investmentHorizon || 'long_term',
      taxConsideration: req.body.taxConsideration !== false,
      maxSingleStock  : req.body.maxSingleStock || 20,
      minEquity       : req.body.minEquity || 30,
    };

    const { data, usage, elapsed } = await aiService.optimizePortfolio(
      portfolio.toObject(),
      constraints
    );

    res.status(200).json({
      success  : true,
      message  : 'Portfolio optimization complete',
      data     : { optimization: data },
      meta     : { tokensUsed: usage?.total_tokens, processingMs: elapsed },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /ai/personality-test:
 *   post:
 *     summary: Analyze investor personality from questionnaire
 *     tags: [AI]
 */
exports.analyzePersonality = async (req, res, next) => {
  try {
    const { answers } = req.body;

    if (!answers || Object.keys(answers).length === 0) {
      return next(new AppError('Questionnaire answers are required.', 400));
    }

    const { data, usage, elapsed } = await aiService.analyzePersonality(answers);

    // Update user risk profile based on AI analysis
    if (data.riskProfile) {
      req.user.riskProfile = data.riskProfile.toLowerCase().replace(' ', '_');
      await req.user.save({ validateBeforeSave: false });
    }

    res.status(200).json({
      success  : true,
      message  : 'Investment personality analysis complete',
      data     : { personality: data },
      meta     : { tokensUsed: usage?.total_tokens, processingMs: elapsed },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /ai/weekly-report/{portfolioId}:
 *   post:
 *     summary: Generate AI weekly portfolio report
 *     tags: [AI]
 */
exports.generateWeeklyReport = async (req, res, next) => {
  try {
    const portfolio = await Portfolio.findOne({
      _id   : req.params.portfolioId,
      userId: req.user._id,
    });

    if (!portfolio) return next(new AppError('Portfolio not found.', 404));

    const weeklyData = req.body.weeklyData || {
      weekPnl    : portfolio.dayPnl * 5,
      weekPnlPct : portfolio.dayPnlPercent * 5,
      bestPerformer : portfolio.assets[0],
      worstPerformer: portfolio.assets[portfolio.assets.length - 1],
    };

    const { data, usage, elapsed } = await aiService.generateWeeklyReport(
      portfolio.toObject(),
      weeklyData,
      req.body.marketData || {}
    );

    // Save report to DB
    const report = await Report.create({
      userId     : req.user._id,
      portfolioId: portfolio._id,
      title      : `Weekly Report — ${portfolio.name} — ${new Date().toLocaleDateString('en-IN')}`,
      type       : 'weekly_summary',
      status     : 'ready',
      summary    : typeof data === 'string' ? data.substring(0, 500) : JSON.stringify(data).substring(0, 500),
      aiModel    : process.env.OPENAI_MODEL,
      tokensUsed : usage?.total_tokens,
      generationMs: elapsed,
    });

    res.status(200).json({
      success  : true,
      message  : 'Weekly report generated',
      data     : { report: data, reportId: report._id },
      meta     : { tokensUsed: usage?.total_tokens, processingMs: elapsed },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};
