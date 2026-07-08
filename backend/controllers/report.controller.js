/**
 * Report Controller — PDF generation and download
 */
'use strict';

const Report    = require('../models/Report.model');
const Portfolio = require('../models/Portfolio.model');
const reportSvc = require('../services/report.service');
const aiSvc     = require('../services/ai.service');
const { AppError } = require('../middleware/errorHandler');
const { sendSuccess } = require('../utils/response');
const path      = require('path');
const fs        = require('fs');

// GET /reports
exports.getReports = async (req, res, next) => {
  try {
    const reports = await Report.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    sendSuccess(res, 200, { count: reports.length, reports });
  } catch (e) { next(e); }
};

// POST /reports/generate/:portfolioId
exports.generateReport = async (req, res, next) => {
  try {
    const portfolio = await Portfolio.findOne({ _id: req.params.portfolioId, userId: req.user._id });
    if (!portfolio) return next(new AppError('Portfolio not found', 404));

    const { type = 'portfolio_analysis', title } = req.body;
    const reportTitle = title || `${portfolio.name} — ${new Date().toLocaleDateString('en-IN')} Report`;

    // Create report record (generating status)
    const report = await Report.create({
      userId     : req.user._id,
      portfolioId: portfolio._id,
      title      : reportTitle,
      type,
      status     : 'generating',
    });

    // Respond immediately (async generation)
    sendSuccess(res, 202, {
      reportId: report._id,
      status  : 'generating',
      message : 'Report generation started. Use GET /reports/:id to check status.',
    });

    // Generate in background
    setImmediate(async () => {
      try {
        let aiAnalysis = null;
        try {
          aiAnalysis = await aiSvc.analyzePortfolio(portfolio, req.user);
        } catch (_) {}

        const result = await reportSvc.generatePortfolioReport(portfolio, req.user, aiAnalysis);

        await Report.findByIdAndUpdate(report._id, {
          status  : 'ready',
          filePath: result.filePath,
          filename: result.filename,
          fileSize: result.fileSize,
        });
      } catch (err) {
        await Report.findByIdAndUpdate(report._id, { status: 'failed' });
      }
    });
  } catch (e) { next(e); }
};

// GET /reports/:id
exports.getReport = async (req, res, next) => {
  try {
    const report = await Report.findOne({ _id: req.params.id, userId: req.user._id });
    if (!report) return next(new AppError('Report not found', 404));
    sendSuccess(res, 200, { report });
  } catch (e) { next(e); }
};

// GET /reports/:id/download
exports.downloadReport = async (req, res, next) => {
  try {
    const report = await Report.findOne({ _id: req.params.id, userId: req.user._id });
    if (!report) return next(new AppError('Report not found', 404));
    if (report.status !== 'ready') return next(new AppError('Report is not ready yet', 400));

    const filePath = path.resolve(report.filePath);
    if (!fs.existsSync(filePath)) return next(new AppError('Report file not found', 404));

    // Increment download count
    await Report.findByIdAndUpdate(report._id, { $inc: { downloadCount: 1 } });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${report.filename}"`);
    fs.createReadStream(filePath).pipe(res);
  } catch (e) { next(e); }
};

// DELETE /reports/:id
exports.deleteReport = async (req, res, next) => {
  try {
    const report = await Report.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!report) return next(new AppError('Report not found', 404));

    // Delete physical file
    if (report.filePath) {
      const fp = path.resolve(report.filePath);
      if (fs.existsSync(fp)) fs.unlinkSync(fp);
    }
    sendSuccess(res, 200, null, 'Report deleted');
  } catch (e) { next(e); }
};
