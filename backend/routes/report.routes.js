/**
 * Report Routes
 */
'use strict';

const express  = require('express');
const router   = express.Router();
const ctrl     = require('../controllers/report.controller');
const { protect, premiumGuard } = require('../middleware/auth.middleware');

router.use(protect);

router.get ('/',                              ctrl.getReports);
router.post('/generate/:portfolioId',  premiumGuard, ctrl.generateReport);
router.get ('/:id',                           ctrl.getReport);
router.get ('/:id/download',                  ctrl.downloadReport);
router.delete('/:id',                         ctrl.deleteReport);

module.exports = router;
