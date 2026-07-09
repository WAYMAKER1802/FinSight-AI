/**
 * AI Controller — Dynamic Edition
 * ─────────────────────────────────
 * REST endpoints for AI features: portfolio doctor, daily brief,
 * recommendations, chat, and more. Uses mock fallback when OpenAI key absent.
 */
'use strict';

const aiService  = require('../services/ai.service');
const marketSvc  = require('../services/market.service');
const { Portfolio, PortfolioAsset } = require('../models/Portfolio.model');
const { AppError }= require('../middleware/errorHandler');
const { sendSuccess } = require('../utils/response');
const logger     = require('../config/logger');

// ─── GET /ai/daily-brief ─────────────────────────────────────────────────────
exports.getDailyBrief = async (req, res, next) => {
  try {
    const portfolios = await Portfolio.findAll({
      where  : { userId: req.user.id },
      include: [{ model: PortfolioAsset, as: 'assets' }],
      order  : [['isDefault', 'DESC']],
      limit  : 1,
    });
    const portfolio = portfolios[0];
    if (!portfolio) {
      return sendSuccess(res, 200, {
        brief: `Hello ${req.user.name?.split(' ')[0] || 'Investor'},\n\n📊 Welcome to InvestIQ AI! Add your first portfolio to get a personalized daily briefing with AI-powered insights.\n\n🎯 Get started: Click "My Portfolio" → "Add Asset" to add your first holding.`
      });
    }

    const marketOverview = await marketSvc.getMarketOverview();
    const plain = portfolio.toJSON();
    plain.sectorAllocation = JSON.parse(plain.sectorAllocation || '[]');

    const { data } = await aiService.generateDailyBrief(
      plain,
      req.user.name?.split(' ')[0] || 'Investor',
      marketOverview
    );

    sendSuccess(res, 200, { brief: data, marketOverview });
  } catch (e) { next(e); }
};

// ─── POST /ai/analyze-portfolio/:portfolioId ─────────────────────────────────
exports.analyzePortfolio = async (req, res, next) => {
  try {
    const p = await Portfolio.findOne({
      where  : { id: req.params.portfolioId, userId: req.user.id },
      include: [{ model: PortfolioAsset, as: 'assets' }],
    });
    if (!p) return next(new AppError('Portfolio not found', 404));

    const plain = p.toJSON();
    plain.sectorAllocation     = JSON.parse(plain.sectorAllocation    || '[]');
    plain.assetClassAllocation = JSON.parse(plain.assetClassAllocation|| '[]');

    const { data } = await aiService.analyzePortfolio(plain, { riskProfile: req.user.riskProfile });

    // Save AI analysis back to portfolio
    if (data) {
      await p.update({ lastAIAnalysis: JSON.stringify(data) });
    }

    logger.info(`Portfolio Doctor ran for ${p.name}`);
    sendSuccess(res, 200, { analysis: data });
  } catch (e) { next(e); }
};

// ─── GET /ai/recommendations/:portfolioId ────────────────────────────────────
exports.getRecommendations = async (req, res, next) => {
  try {
    const assets = await PortfolioAsset.findAll({
      where: { portfolioId: req.params.portfolioId, userId: req.user.id }
    });
    if (!assets.length) return sendSuccess(res, 200, { recommendations: [] });

    const recs = await Promise.all(
      assets.map(async a => {
        const { data } = await aiService.getStockRecommendation(a.toJSON(), {}, {});
        return { symbol: a.symbol, name: a.name, ...data };
      })
    );
    sendSuccess(res, 200, { recommendations: recs });
  } catch (e) { next(e); }
};

// ─── POST /ai/chat ────────────────────────────────────────────────────────────
exports.chat = async (req, res, next) => {
  try {
    const { message, conversationHistory = [] } = req.body;
    if (!message) return next(new AppError('Message is required', 400));

    const portfolios = await Portfolio.findAll({
      where: { userId: req.user.id },
      include: [{ model: PortfolioAsset, as: 'assets' }],
      limit: 1,
    });
    const portfolio = portfolios[0]?.toJSON() || {};
    portfolio.sectorAllocation = JSON.parse(portfolio.sectorAllocation || '[]');

    const context = {
      portfolioValue : portfolio.totalCurrentValue || 0,
      returns        : portfolio.returnsPercent || 0,
      healthScore    : portfolio.healthScore || 0,
      assetCount     : portfolio.assets?.length || 0,
      userName       : req.user.name,
    };

    const { data } = await aiService.coachUser(message, context, conversationHistory);

    sendSuccess(res, 200, {
      reply  : data || `As your AI financial coach, I'm analyzing your question about "${message}". Your portfolio has ${context.assetCount} assets with ${context.returns.toFixed(1)}% overall returns. What specific area would you like to explore?`,
      context: { portfolioLoaded: !!portfolio.id },
    });
  } catch (e) { next(e); }
};

// ─── POST /ai/sentiment ──────────────────────────────────────────────────────
exports.getSentiment = async (req, res, next) => {
  try {
    const marketData = await marketSvc.getMarketOverview();
    const { data } = await aiService.analyzeSentiment([], marketData);
    sendSuccess(res, 200, { sentiment: data, marketData });
  } catch (e) { next(e); }
};

// ─── POST /ai/plan-goal ──────────────────────────────────────────────────────
exports.planGoal = async (req, res, next) => {
  try {
    const { data } = await aiService.planGoal(req.body, { monthlyIncome: req.user.annualIncome / 12 || 50000 });
    sendSuccess(res, 200, { plan: data });
  } catch (e) { next(e); }
};

// ─── Stubs for other endpoints ────────────────────────────────────────────────
exports.getStockRecommendation = async (req, res, next) => {
  try {
    const quote = await marketSvc.fetchQuote(req.params.symbol);
    const { data } = await aiService.getStockRecommendation({ symbol: req.params.symbol, ...quote }, quote, {});
    sendSuccess(res, 200, { recommendation: data });
  } catch (e) { next(e); }
};

exports.optimizePortfolio = async (req, res, next) => {
  try {
    sendSuccess(res, 200, { message: 'Portfolio optimization coming soon with real market data.' });
  } catch (e) { next(e); }
};

// ─── POST /ai/simulate-crash/:portfolioId ────────────────────────────────────
exports.simulateCrash = async (req, res, next) => {
  try {
    const p = await Portfolio.findOne({
      where  : { id: req.params.portfolioId, userId: req.user.id },
      include: [{ model: PortfolioAsset, as: 'assets' }],
    });
    if (!p) return next(new AppError('Portfolio not found', 404));

    const plain = p.toJSON();
    plain.sectorAllocation = JSON.parse(plain.sectorAllocation || '[]');

    const { scenario } = req.body;
    if (!scenario || !scenario.name) return next(new AppError('Scenario details required', 400));

    const { data } = await aiService.simulateCrash(plain, scenario);
    
    sendSuccess(res, 200, { simulation: data });
  } catch (e) { next(e); }
};
