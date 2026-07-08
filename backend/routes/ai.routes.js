/**
 * AI Routes
 * ──────────
 */

'use strict';

const express = require('express');
const router  = express.Router();

const aiController    = require('../controllers/ai.controller');
const { protect, requirePremium } = require('../middleware/auth.middleware');
const { aiLimiter }   = require('../middleware/rateLimiter');

// Apply auth + AI rate limiter to all AI routes
router.use(protect);
router.use(aiLimiter);

router.post('/analyze-portfolio/:portfolioId', aiController.analyzePortfolio);
router.post('/stock-recommendation',           aiController.getStockRecommendation);
router.post('/sentiment',                      aiController.analyzeSentiment);
router.post('/chat',                           aiController.chat);
router.post('/risk-analysis/:portfolioId',     aiController.analyzeRisk);
router.post('/optimize/:portfolioId',          requirePremium, aiController.optimizePortfolio);
router.post('/personality-test',               aiController.analyzePersonality);
router.post('/weekly-report/:portfolioId',     aiController.generateWeeklyReport);

module.exports = router;
