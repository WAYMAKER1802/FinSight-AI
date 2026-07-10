const { sequelize } = require('./config/database');
const User = require('./models/User.model');
const { Portfolio, PortfolioAsset, PortfolioSnapshot } = require('./models/Portfolio.model');

async function seedMySQL() {
  try {
    await sequelize.authenticate();
    console.log('Connected to MySQL.');

    const Watchlist = require('./models/Watchlist.model');
    await Watchlist.destroy({ where: {} });
    await PortfolioAsset.destroy({ where: {} });
    await Portfolio.destroy({ where: {} });
    await User.destroy({ where: {} });

    const user = await User.create({
      name: 'Arjun Sharma',
      email: 'arjun@demo.com',
      password: 'Demo@1234',
      role: 'premium',
      riskProfile: 'moderately_aggressive',
      annualIncome: 2400000,
      monthlyExpenses: 80000,
      investmentHorizon: 'long_term',
      emailVerified: true,
      wealthScore: 780,
      wealthLevel: 'Pro Investor'
    });

    console.log('User created:', user.email);

    const portfolio = await Portfolio.create({
      userId: user.id,
      name: 'Growth Portfolio',
      currency: 'INR',
      isDefault: true,
      healthScore: 78,
      riskScore: 5.5,
      diversificationScore: 65,
      totalInvested: 135800,
      totalCurrentValue: 153300,
      totalReturns: 17500,
      returnsPercent: 12.8,
      dayPnl: 1250,
      dayPnlPercent: 0.8
    });

    console.log('Portfolio created.');

    await PortfolioAsset.bulkCreate([
      { portfolioId: portfolio.id, userId: user.id, symbol: 'RELIANCE', name: 'Reliance Industries', type: 'stock', quantity: 25, avgBuyPrice: 2400, currentPrice: 2780, currentValue: 69500, sector: 'Energy', recommendation: 'hold', riskScore: 6 },
      { portfolioId: portfolio.id, userId: user.id, symbol: 'INFY', name: 'Infosys Ltd.', type: 'stock', quantity: 50, avgBuyPrice: 1450, currentPrice: 1620, currentValue: 81000, sector: 'IT', recommendation: 'buy', riskScore: 5 },
      { portfolioId: portfolio.id, userId: user.id, symbol: 'HDFCBANK', name: 'HDFC Bank Ltd.', type: 'stock', quantity: 40, avgBuyPrice: 1580, currentPrice: 1720, currentValue: 68800, sector: 'Banking', recommendation: 'buy', riskScore: 4 }
    ]);
    
    console.log('Assets created.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seedMySQL();
