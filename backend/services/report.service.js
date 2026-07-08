/**
 * Report Service — PDF Generation
 * ──────────────────────────────────
 * Generates professional PDF reports using PDFKit.
 */

'use strict';

const PDFDocument = require('pdfkit');
const path        = require('path');
const fs          = require('fs');
const logger      = require('../config/logger');
const { formatINR, formatPercent } = require('../helpers/calculators');

const PDF_PATH = process.env.PDF_STORAGE_PATH || 'uploads/reports/';

// Ensure directory exists
if (!fs.existsSync(PDF_PATH)) fs.mkdirSync(PDF_PATH, { recursive: true });

/**
 * Generate a portfolio analysis PDF report.
 */
const generatePortfolioReport = async (portfolio, user, aiAnalysis = {}) => {
  return new Promise((resolve, reject) => {
    try {
      const filename = `report-${portfolio._id}-${Date.now()}.pdf`;
      const filePath = path.join(PDF_PATH, filename);
      const doc      = new PDFDocument({ margin: 50, size: 'A4', info: {
        Title   : `Portfolio Report — ${portfolio.name}`,
        Author  : 'FinSight AI',
        Subject : 'AI-Generated Portfolio Analysis',
        Creator : 'FinSight AI v1.0',
      }});

      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // ── Header ────────────────────────────────────────────────────────────
      doc.rect(0, 0, doc.page.width, 80).fill('#1a1f35');
      doc.fill('white').fontSize(22).font('Helvetica-Bold').text('FinSight AI', 50, 25);
      doc.fill('#8196f8').fontSize(10).text('AI-Powered Portfolio Analysis Report', 50, 52);
      doc.fill('white').fontSize(10).text(
        new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }),
        doc.page.width - 150, 35
      );

      doc.moveDown(3);

      // ── Portfolio Summary ─────────────────────────────────────────────────
      doc.fill('#1a1f35').fontSize(16).font('Helvetica-Bold').text('Portfolio Summary', 50, doc.y);
      doc.moveDown(0.5);

      const summaryItems = [
        ['Portfolio Name', portfolio.name],
        ['Investor',       user.name],
        ['Total Invested', formatINR(portfolio.totalInvested)],
        ['Current Value',  formatINR(portfolio.totalCurrentValue)],
        ['Total Returns',  `${formatINR(portfolio.totalReturns)} (${formatPercent(portfolio.returnsPercent)})`],
        ['CAGR',           formatPercent(portfolio.cagr)],
        ['Health Score',   `${portfolio.healthScore}/100`],
        ['Risk Score',     `${portfolio.riskScore}/10`],
        ['Assets',         String(portfolio.assets?.length || 0)],
      ];

      let yPos = doc.y;
      summaryItems.forEach(([label, value], i) => {
        const isEven = i % 2 === 0;
        if (isEven) doc.fill('#f8fafc').rect(50, yPos - 4, 500, 20).fill('#f8fafc');
        doc.fill('#64748b').fontSize(9).font('Helvetica').text(label + ':', 60, yPos);
        doc.fill('#0f172a').fontSize(9).font('Helvetica-Bold').text(value, 200, yPos);
        yPos += 22;
      });

      doc.moveDown(1);

      // ── Holdings Table ────────────────────────────────────────────────────
      doc.fill('#1a1f35').fontSize(14).font('Helvetica-Bold').text('Holdings', 50, doc.y);
      doc.moveDown(0.5);

      // Table header
      const tableY = doc.y;
      doc.fill('#1a1f35').rect(50, tableY, 500, 20).fill('#1a1f35');
      ['Symbol', 'Type', 'Value (₹)', 'Allocation', 'Returns', 'Signal'].forEach((col, i) => {
        const xPositions = [60, 130, 220, 310, 380, 460];
        doc.fill('white').fontSize(8).font('Helvetica-Bold').text(col, xPositions[i], tableY + 6);
      });

      let rowY = tableY + 22;
      (portfolio.assets || []).slice(0, 20).forEach((asset, i) => {
        if (i % 2 === 0) {
          doc.fill('#f8fafc').rect(50, rowY - 3, 500, 18).fill('#f8fafc');
        }
        const cols = [
          asset.symbol,
          asset.type,
          formatINR(asset.currentValue),
          `${asset.allocationPct?.toFixed(1)}%`,
          formatPercent(asset.percentageReturn),
          (asset.recommendation || 'hold').toUpperCase(),
        ];
        const xPositions = [60, 130, 220, 310, 380, 460];
        cols.forEach((col, ci) => {
          let color = '#0f172a';
          if (ci === 4) color = asset.percentageReturn >= 0 ? '#059669' : '#dc2626';
          if (ci === 5) color = ['strong_buy', 'buy'].includes(asset.recommendation) ? '#059669' :
                                ['strong_sell', 'sell'].includes(asset.recommendation) ? '#dc2626' : '#d97706';
          doc.fill(color).fontSize(8).font('Helvetica').text(col, xPositions[ci], rowY);
        });
        rowY += 18;
      });

      // ── AI Insights ───────────────────────────────────────────────────────
      if (aiAnalysis && Object.keys(aiAnalysis).length > 0) {
        doc.addPage();
        doc.fill('#1a1f35').fontSize(14).font('Helvetica-Bold').text('AI Analysis & Insights', 50, 50);
        doc.moveDown(0.5);

        if (aiAnalysis.insights?.length > 0) {
          doc.fill('#374151').fontSize(10).font('Helvetica-Bold').text('Key Insights:');
          aiAnalysis.insights.forEach(insight => {
            doc.fill('#4b5563').fontSize(9).font('Helvetica').text(`• ${insight}`, { indent: 10 });
          });
          doc.moveDown(0.5);
        }

        if (aiAnalysis.recommendations?.length > 0) {
          doc.fill('#374151').fontSize(10).font('Helvetica-Bold').text('Recommendations:');
          aiAnalysis.recommendations.forEach(rec => {
            doc.fill('#4b5563').fontSize(9).font('Helvetica').text(`• ${rec}`, { indent: 10 });
          });
        }
      }

      // ── Footer ────────────────────────────────────────────────────────────
      doc.on('pageAdded', () => {
        doc.fill('#94a3b8').fontSize(7).font('Helvetica')
          .text(
            'Generated by FinSight AI · This report is for informational purposes only and not financial advice.',
            50, doc.page.height - 30, { align: 'center' }
          );
      });

      doc.fill('#94a3b8').fontSize(7).font('Helvetica')
        .text(
          'Generated by FinSight AI · This report is for informational purposes only and not financial advice.',
          50, doc.page.height - 30, { align: 'center' }
        );

      doc.end();

      stream.on('finish', () => {
        logger.info(`PDF report generated: ${filename}`);
        const stats = fs.statSync(filePath);
        resolve({ filePath, filename, fileSize: stats.size });
      });
      stream.on('error', reject);
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { generatePortfolioReport };
