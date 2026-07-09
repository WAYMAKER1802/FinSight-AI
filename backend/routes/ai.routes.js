'use strict';
const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/ai.controller');
const { protect } = require('../middleware/auth.middleware');
const { aiLimiter } = require('../middleware/rateLimiter');

router.use(protect);
router.use(aiLimiter);

router.get ('/daily-brief',                          ctrl.getDailyBrief);
router.post('/analyze-portfolio/:portfolioId',       ctrl.analyzePortfolio);
router.get ('/recommendations/:portfolioId',         ctrl.getRecommendations);
router.get ('/stock/:symbol',                        ctrl.getStockRecommendation);
router.post('/chat',                                 ctrl.chat);
router.get ('/sentiment',                            ctrl.getSentiment);
router.post('/plan-goal',                            ctrl.planGoal);
router.post('/optimize/:portfolioId',                ctrl.optimizePortfolio);
router.post('/simulate-crash/:portfolioId',          ctrl.simulateCrash);

module.exports = router;
