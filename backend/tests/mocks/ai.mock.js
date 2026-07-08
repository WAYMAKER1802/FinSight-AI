/**
 * AI Service Mocks
 */
'use strict';

// Mock responses for OpenAI API calls
const mockAIResponses = {
  analyzePortfolio: {
    healthScore: 85,
    riskLevel: 'moderate',
    suggestions: ['Increase debt allocation'],
  },
  stockRecommendation: {
    symbol: 'RELIANCE',
    action: 'BUY',
    reasoning: 'Strong fundamentals',
  },
};

module.exports = {
  mockAIResponses,
};
