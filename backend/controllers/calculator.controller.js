/**
 * Calculator Controller — financial math endpoints
 */
'use strict';

const calc = require('../helpers/calculators');
const { sendSuccess } = require('../utils/response');
const { AppError }   = require('../middleware/errorHandler');

// POST /calculators/sip
exports.sipCalculator = (req, res, next) => {
  try {
    const { monthly, annualReturn, years } = req.body;
    if (!monthly || !annualReturn || !years) {
      return next(new AppError('Provide monthly, annualReturn, and years', 400));
    }
    const result = calc.sipFutureValue(Number(monthly), Number(annualReturn), Number(years));
    sendSuccess(res, 200, result);
  } catch (e) { next(e); }
};

// POST /calculators/emi
exports.emiCalculator = (req, res, next) => {
  try {
    const { principal, annualRate, tenureMonths } = req.body;
    if (!principal || !annualRate || !tenureMonths) {
      return next(new AppError('Provide principal, annualRate, and tenureMonths', 400));
    }
    const result = calc.calculateEMI(Number(principal), Number(annualRate), Number(tenureMonths));
    sendSuccess(res, 200, result);
  } catch (e) { next(e); }
};

// POST /calculators/cagr
exports.cagrCalculator = (req, res, next) => {
  try {
    const { initialValue, finalValue, years } = req.body;
    if (!initialValue || !finalValue || !years) {
      return next(new AppError('Provide initialValue, finalValue, and years', 400));
    }
    const cagr = calc.calculateCAGR(Number(initialValue), Number(finalValue), Number(years));
    sendSuccess(res, 200, {
      initialValue: Number(initialValue),
      finalValue  : Number(finalValue),
      years       : Number(years),
      cagr        : parseFloat(cagr.toFixed(2)),
      absoluteReturn: (((Number(finalValue) - Number(initialValue)) / Number(initialValue)) * 100).toFixed(2),
    });
  } catch (e) { next(e); }
};

// POST /calculators/inflation
exports.inflationCalculator = (req, res, next) => {
  try {
    const { currentCost, inflationRate, years } = req.body;
    if (!currentCost || !inflationRate || !years) {
      return next(new AppError('Provide currentCost, inflationRate, and years', 400));
    }
    const futureCost = Number(currentCost) * Math.pow(1 + Number(inflationRate) / 100, Number(years));
    sendSuccess(res, 200, {
      currentCost       : Number(currentCost),
      inflationRate     : Number(inflationRate),
      years             : Number(years),
      futureCost        : parseFloat(futureCost.toFixed(2)),
      purchasingPowerLoss: parseFloat((Number(currentCost) - (Number(currentCost) / Math.pow(1 + Number(inflationRate) / 100, Number(years)))).toFixed(2)),
    });
  } catch (e) { next(e); }
};

// POST /calculators/retirement
exports.retirementCalculator = (req, res, next) => {
  try {
    const { currentAge, retireAge, monthlyExp, inflation, returnRate, monthlySIP, currentCorpus } = req.body;
    const years = retireAge - currentAge;
    if (years <= 0) return next(new AppError('Retirement age must be greater than current age', 400));

    const inflatedMonthlyExp = monthlyExp * Math.pow(1 + inflation / 100, years);
    const lifeExpect  = 85;
    const retireYears = lifeExpect - retireAge;
    const realReturn  = (returnRate - inflation) / 100 / 12;
    const n           = retireYears * 12;

    const corpusNeeded = realReturn > 0
      ? inflatedMonthlyExp * ((1 - Math.pow(1 + realReturn, -n)) / realReturn)
      : inflatedMonthlyExp * n;

    const r   = returnRate / 100 / 12;
    const ns  = years * 12;
    const futureSIP    = ns > 0 && r > 0 ? monthlySIP * (((Math.pow(1 + r, ns) - 1) / r) * (1 + r)) : 0;
    const futureCorpus = (currentCorpus || 0) * Math.pow(1 + returnRate / 100, years) + futureSIP;
    const gap          = corpusNeeded - futureCorpus;

    sendSuccess(res, 200, {
      corpusNeeded        : Math.round(corpusNeeded),
      projectedCorpus     : Math.round(futureCorpus),
      gap                 : Math.round(gap),
      isOnTrack           : gap <= 0,
      inflatedMonthlyExp  : Math.round(inflatedMonthlyExp),
      yearsToRetire       : years,
    });
  } catch (e) { next(e); }
};

// POST /calculators/goal
exports.goalCalculator = (req, res, next) => {
  try {
    const { targetAmount, years, expectedReturn, currentSavings = 0 } = req.body;
    if (!targetAmount || !years || !expectedReturn) {
      return next(new AppError('Provide targetAmount, years, expectedReturn', 400));
    }

    const r  = Number(expectedReturn) / 100 / 12;
    const n  = Number(years) * 12;
    const fv = Number(currentSavings) * Math.pow(1 + Number(expectedReturn) / 100, Number(years));
    const remaining = Number(targetAmount) - fv;

    const requiredSIP = r > 0
      ? remaining * r / (Math.pow(1 + r, n) - 1) / (1 + r)
      : remaining / n;

    const totalInvested = requiredSIP * n + Number(currentSavings);
    const gains         = Number(targetAmount) - totalInvested;

    sendSuccess(res, 200, {
      targetAmount  : Number(targetAmount),
      years         : Number(years),
      expectedReturn: Number(expectedReturn),
      currentSavings: Number(currentSavings),
      requiredMonthlySIP: Math.max(0, Math.round(requiredSIP)),
      totalInvested : Math.round(totalInvested),
      estimatedGains: Math.round(gains),
    });
  } catch (e) { next(e); }
};

// POST /calculators/lumpsum
exports.lumpsumCalculator = (req, res, next) => {
  try {
    const { principal, annualReturn, years } = req.body;
    if (!principal || !annualReturn || !years) {
      return next(new AppError('Provide principal, annualReturn, and years', 400));
    }
    const maturityAmount = Number(principal) * Math.pow(1 + Number(annualReturn) / 100, Number(years));
    sendSuccess(res, 200, {
      principal       : Number(principal),
      annualReturn    : Number(annualReturn),
      years           : Number(years),
      maturityAmount  : Math.round(maturityAmount),
      estimatedGains  : Math.round(maturityAmount - Number(principal)),
      absoluteReturn  : parseFloat((((maturityAmount - Number(principal)) / Number(principal)) * 100).toFixed(2)),
    });
  } catch (e) { next(e); }
};
