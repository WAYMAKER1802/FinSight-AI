/**
 * Unit Tests — Calculator Helpers
 */

'use strict';

const {
  sipFutureValue,
  cagr,
  inflationAdjusted,
  emiCalculator,
  retirementCorpus,
  diversificationScore,
  formatINR,
  formatPercent,
} = require('../../helpers/calculators');

describe('sipFutureValue', () => {
  it('should calculate SIP future value correctly', () => {
    const result = sipFutureValue(10000, 12, 10);
    expect(result).toBeGreaterThan(2000000);
    expect(result).toBeLessThan(3000000);
  });

  it('should handle 0% return (simple multiplication)', () => {
    const result = sipFutureValue(1000, 0, 5);
    expect(result).toBe(60000);
  });
});

describe('cagr', () => {
  it('should calculate CAGR correctly', () => {
    const result = cagr(100000, 200000, 5);
    expect(result).toBeCloseTo(14.87, 1);
  });

  it('should return 0 for invalid inputs', () => {
    expect(cagr(0, 100, 5)).toBe(0);
    expect(cagr(100, 200, 0)).toBe(0);
  });
});

describe('inflationAdjusted', () => {
  it('should calculate inflation impact correctly', () => {
    const result = inflationAdjusted(100000, 6, 10);
    expect(result).toBeCloseTo(179084, -2);
  });
});

describe('emiCalculator', () => {
  it('should calculate EMI correctly', () => {
    const emi = emiCalculator(1000000, 10, 120); // 10L, 10%, 10yr
    expect(emi).toBeCloseTo(13215, -2);
  });
});

describe('diversificationScore', () => {
  it('should return 100 for perfectly diversified (equal allocations)', () => {
    const score = diversificationScore([25, 25, 25, 25]);
    expect(score).toBe(100);
  });

  it('should return low score for concentrated portfolio', () => {
    const score = diversificationScore([90, 5, 3, 2]);
    expect(score).toBeLessThan(30);
  });

  it('should return 0 for empty allocations', () => {
    expect(diversificationScore([])).toBe(0);
  });
});

describe('formatINR', () => {
  it('should format number in Indian currency format', () => {
    expect(formatINR(1000000)).toContain('₹');
    expect(formatINR(1000000)).toContain('10,00,000');
  });

  it('should handle null/undefined gracefully', () => {
    expect(formatINR(null)).toBe('₹0');
    expect(formatINR(undefined)).toBe('₹0');
  });
});

describe('formatPercent', () => {
  it('should add + sign for positive values', () => {
    expect(formatPercent(12.5)).toBe('+12.50%');
  });

  it('should keep - sign for negative values', () => {
    expect(formatPercent(-5.25)).toBe('-5.25%');
  });
});
