const { Portfolio, PortfolioAsset } = require('./models/Portfolio.model');
const { connectDB } = require('./config/database');

async function test() {
  await connectDB();
  const portfolios = await Portfolio.findAll({
    include: [{ model: PortfolioAsset, as: 'assets' }]
  });
  console.log("Portfolios length:", portfolios.length);
  for (let p of portfolios) {
    console.log("ID:", p.id, "Name:", p.name, "User:", p.userId);
  }
  process.exit(0);
}
test();
