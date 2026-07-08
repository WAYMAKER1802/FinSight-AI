/**
 * Calculator Routes — all public (no auth required)
 */
'use strict';

const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/calculator.controller');
const { body } = require('express-validator');
const { validate } = require('../middleware/validator.middleware');

router.post('/sip',        [
  body('monthly').isFloat({ min: 1 }),
  body('annualReturn').isFloat({ min: 0, max: 100 }),
  body('years').isInt({ min: 1, max: 50 }),
  validate,
], ctrl.sipCalculator);

router.post('/emi',        [
  body('principal').isFloat({ min: 1 }),
  body('annualRate').isFloat({ min: 0.1, max: 50 }),
  body('tenureMonths').isInt({ min: 1, max: 360 }),
  validate,
], ctrl.emiCalculator);

router.post('/cagr',       [
  body('initialValue').isFloat({ min: 0.01 }),
  body('finalValue').isFloat({ min: 0.01 }),
  body('years').isFloat({ min: 0.1 }),
  validate,
], ctrl.cagrCalculator);

router.post('/inflation',  [
  body('currentCost').isFloat({ min: 1 }),
  body('inflationRate').isFloat({ min: 0, max: 30 }),
  body('years').isInt({ min: 1, max: 50 }),
  validate,
], ctrl.inflationCalculator);

router.post('/retirement', ctrl.retirementCalculator);
router.post('/goal',       ctrl.goalCalculator);
router.post('/lumpsum',    [
  body('principal').isFloat({ min: 1 }),
  body('annualReturn').isFloat({ min: 0, max: 100 }),
  body('years').isInt({ min: 1, max: 50 }),
  validate,
], ctrl.lumpsumCalculator);

module.exports = router;
