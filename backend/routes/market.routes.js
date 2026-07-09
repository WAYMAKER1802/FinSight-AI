'use strict';
const express    = require('express');
const router     = express.Router();
const ctrl       = require('../controllers/market.controller');
const { protect }= require('../middleware/auth.middleware');

router.use(protect);
router.get('/overview',         ctrl.getMarketOverview);
router.get('/search',           ctrl.searchSymbol);
router.get('/quote/:symbol',    ctrl.getQuote);
router.post('/quotes',          ctrl.getBatchQuotes);

module.exports = router;
