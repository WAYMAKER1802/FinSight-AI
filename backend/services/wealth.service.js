/**
 * Wealth Score Engine
 * ────────────────────
 * Calculates a 0–1000 wealth score based on 9 portfolio dimensions.
 */
'use strict';

const LEVELS = [
  { name: 'Beginner',      min: 0,   max: 199,  icon: '🌱', badge: 'beginner' },
  { name: 'Learner',       min: 200, max: 399,  icon: '📚', badge: 'learner' },
  { name: 'Investor',      min: 400, max: 599,  icon: '📈', badge: 'investor' },
  { name: 'Wealth Builder',min: 600, max: 799,  icon: '🏆', badge: 'wealth_builder' },
  { name: 'Elite Investor',min: 800, max: 1000, icon: '💎', badge: 'elite' },
];

/**
 * calculateWealthScore
 * @param {Object} portfolio  - Portfolio with assets, metrics
 * @param {Object} user       - User profile (goals, riskProfile, etc.)
 * @returns {{ score, level, badge, breakdown, suggestions }}
 */
const calculateWealthScore = (portfolio, user = {}) => {
  const scores = {};

  // 1. Diversification (0–150)
  const assetCount = portfolio.assets?.length || 0;
  const diversScore = portfolio.diversificationScore || 0;
  scores.diversification = Math.min(150, Math.round(
    (diversScore / 100) * 100 + Math.min(assetCount * 5, 50)
  ));

  // 2. Returns vs Benchmark (0–200)
  const returns = portfolio.returnsPercent || 0;
  if (returns >= 20) scores.returns = 200;
  else if (returns >= 15) scores.returns = 170;
  else if (returns >= 10) scores.returns = 140;
  else if (returns >= 5)  scores.returns = 100;
  else if (returns >= 0)  scores.returns = 60;
  else                    scores.returns = 30;

  // 3. Portfolio Health (0–150)
  scores.health = Math.round((portfolio.healthScore || 50) / 100 * 150);

  // 4. Risk-Adjusted Returns (0–100)
  const sharpe = portfolio.sharpeRatio || 0;
  if (sharpe >= 2)     scores.riskAdjusted = 100;
  else if (sharpe >= 1.5) scores.riskAdjusted = 80;
  else if (sharpe >= 1)   scores.riskAdjusted = 60;
  else if (sharpe >= 0.5) scores.riskAdjusted = 40;
  else                    scores.riskAdjusted = 20;

  // 5. Goal Alignment (0–100)
  scores.goalAlignment = user.investmentGoals?.length > 0 ? 70 : 40;

  // 6. Investment Consistency (0–100) - based on asset count and portfolio age
  const portfolioAgeMonths = portfolio.createdAt
    ? Math.floor((Date.now() - new Date(portfolio.createdAt)) / (30 * 24 * 3600 * 1000))
    : 1;
  scores.consistency = Math.min(100, Math.round(portfolioAgeMonths * 5 + assetCount * 3));

  // 7. Cash Allocation / Emergency Fund (0–50)
  scores.emergencyFund = user.annualIncome > 0 ? 50 : 25;

  // 8. Debt Ratio (0–50)
  scores.debtRatio = 50; // Default until debt tracking is added

  // 9. Portfolio Size (0–100)
  const value = portfolio.totalCurrentValue || 0;
  if (value >= 5000000)     scores.portfolioSize = 100;
  else if (value >= 1000000) scores.portfolioSize = 80;
  else if (value >= 500000)  scores.portfolioSize = 60;
  else if (value >= 100000)  scores.portfolioSize = 40;
  else if (value >= 10000)   scores.portfolioSize = 20;
  else                       scores.portfolioSize = 10;

  const total = Object.values(scores).reduce((s, v) => s + v, 0);
  const score = Math.min(1000, Math.max(0, Math.round(total)));

  const level = LEVELS.find(l => score >= l.min && score <= l.max) || LEVELS[0];

  // Suggestions
  const suggestions = [];
  if (scores.diversification < 80)  suggestions.push('Add assets from different sectors to improve diversification');
  if (scores.returns < 100)         suggestions.push('Review underperforming holdings and consider rebalancing');
  if (scores.health < 80)           suggestions.push('Your portfolio health needs attention — check for overconcentration');
  if (scores.consistency < 50)      suggestions.push('Invest regularly through SIPs to boost your consistency score');
  if (!user.investmentGoals?.length) suggestions.push('Set specific investment goals to align your portfolio strategy');
  if (assetCount < 5)               suggestions.push('Add more assets to reduce single-stock risk');

  return {
    score,
    level       : level.name,
    levelIcon   : level.icon,
    badge       : level.badge,
    nextLevel   : LEVELS[Math.min(LEVELS.indexOf(level) + 1, LEVELS.length - 1)],
    progress    : Math.round(((score - level.min) / (level.max - level.min)) * 100),
    breakdown   : [
      { label: 'Diversification',       score: scores.diversification,  max: 150, icon: '🎯', color: '#667eea' },
      { label: 'Returns',               score: scores.returns,           max: 200, icon: '📈', color: '#10b981' },
      { label: 'Portfolio Health',       score: scores.health,            max: 150, icon: '❤️', color: '#f59e0b' },
      { label: 'Risk-Adjusted Returns',  score: scores.riskAdjusted,      max: 100, icon: '🛡️', color: '#06b6d4' },
      { label: 'Goal Alignment',         score: scores.goalAlignment,     max: 100, icon: '🎯', color: '#8b5cf6' },
      { label: 'Consistency',            score: scores.consistency,       max: 100, icon: '⚡', color: '#ec4899' },
      { label: 'Emergency Fund',         score: scores.emergencyFund,     max: 50,  icon: '🏦', color: '#f43f5e' },
      { label: 'Debt Ratio',             score: scores.debtRatio,         max: 50,  icon: '💳', color: '#64748b' },
      { label: 'Portfolio Size',         score: scores.portfolioSize,     max: 100, icon: '💰', color: '#a78bfa' },
    ],
    suggestions,
    levels: LEVELS,
  };
};

/**
 * earnedBadges — return badges based on milestones
 */
const earnedBadges = (portfolio, user) => {
  const badges = [];
  const assets = portfolio.assets || [];
  const value = portfolio.totalCurrentValue || 0;
  const returns = portfolio.returnsPercent || 0;

  if (assets.length >= 1)            badges.push('🏆 First Portfolio');
  if (returns >= 10)                  badges.push('📈 10% Returns');
  if (assets.length >= 5)             badges.push('🌐 Diversified Investor');
  if (user?.investmentGoals?.length)  badges.push('🎯 Goal Setter');
  if (value >= 500000)                badges.push('💰 Half Lakh Club');
  if (value >= 1000000)               badges.push('🚀 Lakhpati');
  if (returns >= 20)                  badges.push('🔥 20% Returns Club');
  if (assets.some(a => a.type === 'mutual_fund')) badges.push('📊 MF Investor');
  if (assets.some(a => a.type === 'crypto'))      badges.push('₿ Crypto Explorer');
  if (assets.some(a => a.type === 'gold' || a.symbol === 'GOLDBEES')) badges.push('🥇 Gold Accumulator');

  return badges;
};

module.exports = { calculateWealthScore, earnedBadges, LEVELS };
