/**
 * News Routes
 */
'use strict';

const express  = require('express');
const router   = express.Router();
const ctrl     = require('../controllers/news.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/',                      ctrl.getNews);
router.get('/market-sentiment',      ctrl.getMarketSentiment);
router.get('/market-overview',       ctrl.getMarketOverview);
router.get('/company/:symbol',       ctrl.getCompanyNews);

module.exports = router;
