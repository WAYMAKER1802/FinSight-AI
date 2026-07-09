'use strict';

const express    = require('express');
const router     = express.Router();
const ctrl       = require('../controllers/portfolio.controller');
const { protect }= require('../middleware/auth.middleware');
const { body }   = require('express-validator');
const { validate }= require('../middleware/validator.middleware');
const multer     = require('multer');
const path       = require('path');

// File upload config for imports
const upload = multer({
  dest: 'uploads/imports/',
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    ['.csv','.xlsx','.xls'].includes(ext) ? cb(null, true) : cb(new Error('Only CSV/Excel allowed'));
  },
});

router.use(protect);

// Portfolios collection
router.get ('/', ctrl.getPortfolios);
router.post('/', [
  body('name').trim().notEmpty().withMessage('Name required').isLength({ max: 100 }),
  body('currency').optional().isIn(['INR','USD','EUR','GBP']),
  validate,
], ctrl.createPortfolio);

// Single portfolio
router.get   ('/:id', ctrl.getPortfolio);
router.put   ('/:id', ctrl.updatePortfolio);
router.delete('/:id', ctrl.deletePortfolio);

// Analytics
router.get('/:id/analytics',    ctrl.getAnalytics);
router.get('/:id/performance',  ctrl.getPerformance);

// Asset CRUD
router.post  ('/:id/assets', [
  body('symbol').trim().toUpperCase().notEmpty().isLength({ max: 20 }),
  body('name').trim().notEmpty(),
  body('type').isIn(['stock','etf','mutual_fund','bond','crypto','ppf','fd','gold','real_estate','other']),
  body('quantity').isFloat({ min: 0.001 }),
  body('avgBuyPrice').isFloat({ min: 0.01 }),
  validate,
], ctrl.addAsset);
router.put   ('/:id/assets/:assetId', ctrl.updateAsset);
router.delete('/:id/assets/:assetId', ctrl.removeAsset);

// Refresh live prices
router.post('/:id/refresh-prices', ctrl.refreshPrices);

// Import CSV / Excel
router.post('/:id/import', upload.single('file'), ctrl.importAssets);

module.exports = router;
