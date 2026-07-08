/**
 * Input Validation Middleware
 * ────────────────────────────
 * Reusable validators using express-validator for all routes.
 */

'use strict';

const { body, param, query, validationResult } = require('express-validator');

/**
 * Process validation results and return 422 if any fail.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors : errors.array().map(e => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// ── Auth Validators ─────────────────────────────────────────────────────────
const registerValidator = [
  body('name').trim().isLength({ min: 2, max: 80 }).withMessage('Name must be 2–80 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase, and a number'),
  body('riskProfile').optional().isIn(['conservative','moderate','moderately_aggressive','aggressive','very_aggressive']),
  validate,
];

const loginValidator = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password is required'),
  validate,
];

const changePasswordValidator = [
  body('currentPassword').notEmpty().withMessage('Current password required'),
  body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
  validate,
];

// ── Portfolio Validators ─────────────────────────────────────────────────────
const createPortfolioValidator = [
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Portfolio name required'),
  body('currency').optional().isIn(['INR','USD','EUR','GBP']),
  validate,
];

const addAssetValidator = [
  body('symbol').trim().notEmpty().withMessage('Asset symbol required').toUpperCase(),
  body('name').trim().notEmpty().withMessage('Asset name required'),
  body('type').isIn(['stock','mutual_fund','etf','crypto','gold','bond','fd','ppf','nps','real_estate','other'])
    .withMessage('Invalid asset type'),
  body('quantity').isFloat({ min: 0.001 }).withMessage('Quantity must be positive'),
  body('avgBuyPrice').isFloat({ min: 0.01 }).withMessage('Buy price must be positive'),
  validate,
];

// ── Goal Validators ──────────────────────────────────────────────────────────
const createGoalValidator = [
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Goal name required'),
  body('type').isIn(['retirement','education','home','car','vacation','emergency_fund','wedding','business','wealth','custom']),
  body('targetAmount').isFloat({ min: 1 }).withMessage('Target amount must be positive'),
  body('targetDate').isISO8601().withMessage('Valid target date required')
    .custom(val => { if (new Date(val) <= new Date()) throw new Error('Target date must be in the future'); return true; }),
  validate,
];

// ── Alert Validators ─────────────────────────────────────────────────────────
const createAlertValidator = [
  body('type').isIn(['price_target','stop_loss','portfolio_drop','portfolio_rise','goal_at_risk','rebalance','news','ai_recommendation','market_event','dividend','earnings','custom']),
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Alert title required'),
  body('message').trim().isLength({ min: 1, max: 1000 }).withMessage('Alert message required'),
  validate,
];

// ── Pagination Validator ─────────────────────────────────────────────────────
const paginationValidator = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('sort').optional().isString(),
  validate,
];

// ── MongoID Param Validator ──────────────────────────────────────────────────
const mongoIdValidator = (paramName = 'id') => [
  param(paramName).isMongoId().withMessage(`Invalid ${paramName}`),
  validate,
];

module.exports = {
  validate,
  registerValidator,
  loginValidator,
  changePasswordValidator,
  createPortfolioValidator,
  addAssetValidator,
  createGoalValidator,
  createAlertValidator,
  paginationValidator,
  mongoIdValidator,
};
