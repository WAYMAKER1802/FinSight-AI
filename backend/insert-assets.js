const { sequelize } = require('./config/database');
const { Portfolio, PortfolioAsset } = require('./models/Portfolio.model');

async function run() {
  try {
    const USER_ID = 6;
    let portfolio = await Portfolio.findOne({ where: { userId: USER_ID } });
    if (!portfolio) {
      portfolio = await Portfolio.create({
        userId: USER_ID,
        name: 'My Investments',
        currency: 'INR',
        isDefault: true,
        color: '#667eea',
        totalInvested: 0,
        totalCurrentValue: 0
      });
    }

    const companies = [
      { symbol: 'RELIANCE', name: 'Reliance Industries', price: 2954.20 },
      { symbol: 'TATASTEEL', name: 'Tata Steel', price: 142.50 },
      { symbol: 'ZOMATO', name: 'Zomato', price: 165.30 },
      { symbol: 'HDFCBANK', name: 'HDFC Bank', price: 1430.25 },
      { symbol: 'INFY', name: 'Infosys', price: 1482.00 },
      { symbol: 'ITC', name: 'ITC Ltd', price: 428.50 },
    ];

    const targetAmountPerCompany = 50000 / companies.length; // ~8333

    let totalInvested = 0;
    
    // Clear existing assets to ensure a clean slate for this request
    await PortfolioAsset.destroy({ where: { portfolioId: portfolio.id } });

    const assets = [];
    for (const company of companies) {
      // Calculate quantity to match target amount as closely as possible
      const quantity = Math.round(targetAmountPerCompany / company.price) || 1; 
      const investedAmount = quantity * company.price;
      totalInvested += investedAmount;

      assets.push({
        userId: USER_ID,
        portfolioId: portfolio.id,
        symbol: company.symbol,
        name: company.name,
        type: 'Stock',
        sector: 'Unknown',
        quantity: quantity,
        avgBuyPrice: company.price,
        investedAmount: investedAmount,
        currentPrice: company.price,
        currentValue: investedAmount, // Will update when live data is fetched
        absoluteReturn: 0,
        percentageReturn: 0,
        dayChange: 0,
        dayChangePct: 0,
        firstBuyDate: new Date(),
        lastBuyDate: new Date()
      });
    }

    await PortfolioAsset.bulkCreate(assets);

    // Update portfolio totals
    portfolio.totalInvested = totalInvested;
    portfolio.totalCurrentValue = totalInvested; // Initially same
    portfolio.totalReturns = 0;
    portfolio.returnsPercent = 0;
    portfolio.assetCount = assets.length;
    await portfolio.save();

    console.log('Successfully inserted 6 companies with ~50k invested.');
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

run();
