/**
 * Financial Calculation Helpers
 * ──────────────────────────────
 * Pure functions for all financial math used across the app.
 */

'use strict';

/**
 * Calculate future value of SIP investments.
 * @param {number} monthlyAmount - Monthly SIP amount (₹)
 * @param {number} annualReturn  - Expected annual return (%)
 * @param {number} years         - Investment duration in years
 */
const sipFutureValue = (monthlyAmount, annualReturn, years) => {
  const r  = annualReturn / 100 / 12;
  const n  = years * 12;
  if (r === 0) return monthlyAmount * n;
  const fv = monthlyAmount * (((Math.pow(1 + r, n) - 1) / r) * (1 + r));
  return Math.round(fv * 100) / 100;
};

/**
 * Calculate Compound Annual Growth Rate (CAGR).
 */
const cagr = (beginValue, endValue, years) => {
  if (beginValue <= 0 || years <= 0) return 0;
  return ((Math.pow(endValue / beginValue, 1 / years) - 1) * 100);
};

/**
 * Calculate inflation-adjusted future value.
 */
const inflationAdjusted = (currentAmount, inflationRate, years) => {
  return currentAmount * Math.pow(1 + inflationRate / 100, years);
};

/**
 * Calculate EMI for a loan.
 */
const emiCalculator = (principal, annualRate, tenureMonths) => {
  const r   = annualRate / 100 / 12;
  if (r === 0) return principal / tenureMonths;
  return (principal * r * Math.pow(1 + r, tenureMonths)) / (Math.pow(1 + r, tenureMonths) - 1);
};

/**
 * Calculate retirement corpus needed.
 */
const retirementCorpus = (monthlyExpenses, yearsInRetirement, returnRate, inflationRate) => {
  const realReturn = (returnRate - inflationRate) / 100 / 12;
  const n          = yearsInRetirement * 12;
  if (realReturn === 0) return monthlyExpenses * n;
  return monthlyExpenses * ((1 - Math.pow(1 + realReturn, -n)) / realReturn);
};

/**
 * Calculate portfolio diversification score (0–100).
 * Based on Herfindahl-Hirschman Index (HHI).
 */
const diversificationScore = (allocations) => {
  if (!allocations || allocations.length === 0) return 0;
  const hhi     = allocations.reduce((sum, pct) => sum + Math.pow(pct / 100, 2), 0);
  const minHHI  = 1 / allocations.length;
  const score   = (1 - (hhi - minHHI) / (1 - minHHI)) * 100;
  return Math.max(0, Math.min(100, Math.round(score)));
};

/**
 * Calculate portfolio health score (0–100).
 */
const portfolioHealthScore = ({ diversificationScore: ds, returnsVsBenchmark, riskScore, goalAlignment }) => {
  const weights = { diversification: 0.3, returns: 0.35, risk: 0.2, goalAlignment: 0.15 };
  const score   =
    ds                           * weights.diversification +
    Math.min(100, returnsVsBenchmark * 100) * weights.returns +
    (10 - riskScore) * 10        * weights.risk +
    (goalAlignment || 50)        * weights.goalAlignment;
  return Math.max(0, Math.min(100, Math.round(score)));
};

/**
 * Calculate Sharpe Ratio.
 */
const sharpeRatio = (portfolioReturn, riskFreeRate, stdDeviation) => {
  if (stdDeviation === 0) return 0;
  return (portfolioReturn - riskFreeRate) / stdDeviation;
};

/**
 * Format Indian currency.
 */
const formatINR = (amount) => {
  if (amount === undefined || amount === null) return '₹0';
  return '₹' + Number(amount).toLocaleString('en-IN', { maximumFractionDigits: 2 });
};

/**
 * Format percentage with sign.
 */
const formatPercent = (value, decimals = 2) => {
  if (value === undefined || value === null) return '0%';
  const sign = value >= 0 ? '+' : '';
  return `${sign}${Number(value).toFixed(decimals)}%`;
};

/**
 * Get paginate options from request query.
 */
const getPagination = (query) => {
  const page  = Math.max(1, parseInt(query.page,  10) || 1);
  const limit = Math.min(100, parseInt(query.limit, 10) || 20);
  const skip  = (page - 1) * limit;
  const sort  = query.sort || '-createdAt';
  return { page, limit, skip, sort };
};

module.exports = {
  sipFutureValue,
  cagr,
  calculateCAGR     : cagr,       // alias used by analytics.controller & calculator.controller
  inflationAdjusted,
  emiCalculator,
  calculateEMI      : emiCalculator, // alias used by calculator.controller
  retirementCorpus,
  diversificationScore,
  portfolioHealthScore,
  sharpeRatio,
  formatINR,
  formatPercent,
  getPagination,
};
