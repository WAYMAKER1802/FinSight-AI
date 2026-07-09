/**
 * Upload Routes — CSV/Excel Portfolio Import
 */
'use strict';

const express    = require('express');
const router     = express.Router();
const path       = require('path');
const { protect } = require('../middleware/auth.middleware');
const { uploadPortfolio } = require('../middleware/upload.middleware');
const { uploadLimiter }   = require('../middleware/rateLimiter');
const Portfolio  = require('../models/Portfolio.model');
const portfolioSvc = require('../services/portfolio.service');
const { AppError } = require('../middleware/errorHandler');

router.use(protect, uploadLimiter);

// POST /upload/portfolio — Import portfolio from CSV/Excel
router.post('/portfolio', uploadPortfolio, async (req, res, next) => {
  try {
    if (!req.file) return next(new AppError('No file uploaded', 400));

    const ext = path.extname(req.file.originalname).toLowerCase();
    let assets;

    if (ext === '.csv') {
      assets = await portfolioSvc.processCSVUpload(req.file.path);
    } else {
      assets = portfolioSvc.processExcelUpload(req.file.path);
    }

    if (assets.length === 0) {
      return next(new AppError('No valid assets found in file. Check that columns match the template.', 400));
    }

    // Create or update portfolio
    const portfolioName = req.body.name || `Imported Portfolio ${new Date().toLocaleDateString('en-IN')}`;
    const portfolio = await Portfolio.create({
      userId: req.user._id,
      name  : portfolioName,
      assets,
    });

    // Trigger price update
    await portfolioSvc.updatePortfolioPrices(portfolio);
    portfolioSvc.recalculateScores(portfolio);
    await portfolio.save();

    res.status(201).json({
      success: true,
      message: `Successfully imported ${assets.length} assets into "${portfolioName}"`,
      data   : { portfolio, assetCount: assets.length },
    });
  } catch (e) {
    next(e);
  }
});

// GET /upload/template — Download CSV template
router.get('/template', (req, res) => {
  const csv = `Symbol,Name,Type,Quantity,Avg Buy Price,Sector,Buy Date
RELIANCE,Reliance Industries Ltd,stock,10,2400,Energy,2023-01-15
INFY,Infosys Ltd,stock,25,1500,IT,2022-06-10
HDFCBANK,HDFC Bank Ltd,stock,20,1650,Banking,2022-03-20
GOLDBEES,Nippon India ETF Gold BeES,etf,50,45,Commodities,2023-04-01
AXIS_BLUECHIP,Axis Bluechip Fund,mutual_fund,1000,35.5,Mutual Fund,2021-01-01`;

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="investiq-portfolio-template.csv"');
  res.send(csv);
});

module.exports = router;
