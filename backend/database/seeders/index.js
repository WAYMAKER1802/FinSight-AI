/**
 * Database Seeder — Development Data
 * ─────────────────────────────────────
 * Seeds the database with sample users, portfolios, goals, and alerts.
 * Run: node database/seeders/index.js
 */

'use strict';

require('dotenv').config({ path: '../../.env' });
const mongoose  = require('mongoose');
const User      = require('../../models/User.model');
const Portfolio = require('../../models/Portfolio.model');
const Goal      = require('../../models/Goal.model');
const Alert     = require('../../models/Alert.model');
const logger    = require('../../config/logger');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/finsight_ai';

const seedUsers = [
  {
    name       : 'Arjun Sharma',
    email      : 'arjun@demo.com',
    password   : 'Demo@1234',
    role       : 'premium',
    riskProfile: 'moderately_aggressive',
    investmentGoals: ['wealth_creation', 'retirement'],
    annualIncome   : 2400000,
    monthlyExpenses: 80000,
    investmentHorizon: 'long_term',
    emailVerified: true,
  },
  {
    name       : 'Admin User',
    email      : 'admin@finsight.ai',
    password   : 'Admin@1234',
    role       : 'admin',
    riskProfile: 'aggressive',
    emailVerified: true,
  },
];

const seedPortfolios = (userId) => [
  {
    userId,
    name    : 'Growth Portfolio',
    currency: 'INR',
    isDefault: true,
    assets  : [
      { symbol: 'RELIANCE',  name: 'Reliance Industries',  type: 'stock',       quantity: 25,   avgBuyPrice: 2400, currentPrice: 2780, currentValue: 69500,  sector: 'Energy',   recommendation: 'hold',     riskScore: 6 },
      { symbol: 'INFY',      name: 'Infosys Ltd.',         type: 'stock',       quantity: 50,   avgBuyPrice: 1450, currentPrice: 1620, currentValue: 81000,  sector: 'IT',       recommendation: 'buy',      riskScore: 5 },
      { symbol: 'HDFCBANK',  name: 'HDFC Bank Ltd.',       type: 'stock',       quantity: 40,   avgBuyPrice: 1580, currentPrice: 1720, currentValue: 68800,  sector: 'Banking',  recommendation: 'buy',      riskScore: 4 },
      { symbol: 'TCS',       name: 'Tata Consultancy',     type: 'stock',       quantity: 15,   avgBuyPrice: 3400, currentPrice: 3850, currentValue: 57750,  sector: 'IT',       recommendation: 'hold',     riskScore: 4 },
      { symbol: 'GOLDBEES',  name: 'Nippon Gold ETF',      type: 'etf',         quantity: 200,  avgBuyPrice: 45,   currentPrice: 52,   currentValue: 10400,  sector: 'Gold',     recommendation: 'hold',     riskScore: 3 },
      { symbol: 'PPFUS',     name: 'PPF Account',          type: 'ppf',         quantity: 1,    avgBuyPrice: 50000, currentPrice: 58000, currentValue: 58000, sector: 'Fixed Income', recommendation: 'hold', riskScore: 1 },
    ],
    healthScore: 78,
    riskScore  : 5.5,
    diversificationScore: 65,
  },
];

const seedGoals = (userId, portfolioId) => [
  {
    userId,
    portfolioId,
    name         : 'Retirement Fund',
    type         : 'retirement',
    targetAmount : 50000000,
    currentAmount: 3450000,
    targetDate   : new Date('2045-01-01'),
    monthlySIP   : 25000,
    expectedReturns: 12,
    status       : 'active',
    icon         : '🏖️',
    color        : '#667eea',
    priority     : 'high',
  },
  {
    userId,
    name         : 'Home Purchase',
    type         : 'home',
    targetAmount : 10000000,
    currentAmount: 2000000,
    targetDate   : new Date('2028-06-01'),
    monthlySIP   : 40000,
    expectedReturns: 10,
    status       : 'active',
    icon         : '🏠',
    color        : '#10b981',
    priority     : 'high',
  },
];

const seedAlerts = (userId, portfolioId) => [
  {
    userId, portfolioId,
    type    : 'ai_recommendation',
    title   : '🧠 AI Alert: INFY upgraded to BUY',
    message : 'AI analysis shows strong fundamentals. Infosys Q4 results beat estimates. Consider adding position.',
    severity: 'info',
    symbol  : 'INFY',
    channels: ['in_app'],
  },
  {
    userId, portfolioId,
    type    : 'portfolio_rise',
    title   : '📈 Portfolio up 2.3% today!',
    message : 'Your Growth Portfolio gained ₹8,050 today, driven by HDFC Bank (+3.2%) and Reliance (+1.8%).',
    severity: 'success',
    channels: ['in_app', 'push'],
  },
  {
    userId, portfolioId,
    type    : 'rebalance',
    title   : '⚖️ Rebalancing Recommended',
    message : 'IT sector now at 42% of portfolio (recommended: <30%). Consider trimming TCS or INFY.',
    severity: 'warning',
    channels: ['in_app'],
  },
];

const runSeed = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    logger.info('🌱 Connected to MongoDB for seeding...');

    // Clear existing
    await Promise.all([
      User.deleteMany({}),
      Portfolio.deleteMany({}),
      Goal.deleteMany({}),
      Alert.deleteMany({}),
    ]);
    logger.info('🗑️  Cleared existing data');

    // Create users
    const users = await User.create(seedUsers);
    const demoUser = users[0];
    logger.info(`👤 Created ${users.length} users`);

    // Create portfolios
    const portfolioData = seedPortfolios(demoUser._id)[0];
    const portfolio     = await Portfolio.create(portfolioData);
    logger.info('📊 Created portfolio');

    // Create goals
    const goals = await Goal.create(seedGoals(demoUser._id, portfolio._id));
    logger.info(`🎯 Created ${goals.length} goals`);

    // Create alerts
    const alerts = await Alert.create(seedAlerts(demoUser._id, portfolio._id));
    logger.info(`🔔 Created ${alerts.length} alerts`);

    logger.info('✅ Seeding complete!');
    logger.info('');
    logger.info('📧 Demo credentials:');
    logger.info('   Email:    arjun@demo.com');
    logger.info('   Password: Demo@1234');
    logger.info('   Role:     premium');
    logger.info('');
    logger.info('🔑 Admin credentials:');
    logger.info('   Email:    admin@finsight.ai');
    logger.info('   Password: Admin@1234');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    logger.error(`Seeding failed: ${error.message}`);
    process.exit(1);
  }
};

runSeed();
