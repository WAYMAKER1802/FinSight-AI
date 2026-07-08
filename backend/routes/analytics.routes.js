/**
 * Analytics Routes
 */
'use strict';

const express  = require('express');
const router   = express.Router();
const ctrl     = require('../controllers/analytics.controller');
const { protect, premiumGuard } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/portfolio-performance/:id', ctrl.getPortfolioPerformance);
router.get('/sector-breakdown',          ctrl.getSectorBreakdown);
router.get('/asset-class-breakdown',     ctrl.getAssetClassBreakdown);
router.get('/top-performers',            ctrl.getTopPerformers);
router.get('/benchmark-comparison',      premiumGuard, ctrl.getBenchmarkComparison);

module.exports = router;
