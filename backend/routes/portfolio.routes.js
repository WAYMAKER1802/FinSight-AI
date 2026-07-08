/**
 * Portfolio Routes — wired to dedicated controller
 */
'use strict';

const express    = require('express');
const router     = express.Router();
const ctrl       = require('../controllers/portfolio.controller');
const { protect }  = require('../middleware/auth.middleware');
const { body, param } = require('express-validator');
const { validate } = require('../middleware/validator.middleware');

router.use(protect);

// ── Collection Routes ──────────────────────────────────────────────────────
router.get ('/',    ctrl.getPortfolios);
router.post('/',    [
  body('name').trim().notEmpty().withMessage('Portfolio name is required').isLength({ max: 100 }),
  body('currency').optional().isIn(['INR', 'USD', 'EUR', 'GBP']),
  validate,
], ctrl.createPortfolio);

// ── Single Portfolio ───────────────────────────────────────────────────────
router.get   ('/:id', ctrl.getPortfolio);
router.put   ('/:id', ctrl.updatePortfolio);
router.delete('/:id', ctrl.deletePortfolio);

// ── Asset Management ───────────────────────────────────────────────────────
router.post  ('/:id/assets',            [
  body('symbol').trim().toUpperCase().notEmpty().isLength({ max: 20 }),
  body('name').trim().notEmpty(),
  body('type').isIn(['stock', 'etf', 'mutual_fund', 'bond', 'crypto', 'ppf', 'fd', 'gold', 'real_estate', 'other']),
  body('quantity').isFloat({ min: 0.001 }),
  body('avgBuyPrice').isFloat({ min: 0.01 }),
  validate,
], ctrl.addAsset);
router.put   ('/:id/assets/:assetId',   ctrl.updateAsset);
router.delete('/:id/assets/:assetId',   ctrl.removeAsset);

// ── Utility Routes ─────────────────────────────────────────────────────────
router.post('/:id/refresh-prices',  ctrl.refreshPrices);
router.get ('/:id/performance',     ctrl.getPerformance);

// ── Snapshot ───────────────────────────────────────────────────────────────
const Portfolio = require('../models/Portfolio.model');
const { AppError } = require('../middleware/errorHandler');
router.post('/:id/snapshot', async (req, res, next) => {
  try {
    const portfolio = await Portfolio.findOne({ _id: req.params.id, userId: req.user._id });
    if (!portfolio) return next(new AppError('Portfolio not found', 404));
    portfolio.snapshots.push({
      date      : new Date(),
      totalValue: portfolio.totalCurrentValue,
      totalReturn: portfolio.returnsPercent,
      healthScore: portfolio.healthScore,
    });
    if (portfolio.snapshots.length > 365) portfolio.snapshots = portfolio.snapshots.slice(-365);
    await portfolio.save({ validateBeforeSave: false });
    res.json({ success: true, message: 'Snapshot saved' });
  } catch (e) { next(e); }
});

module.exports = router;
