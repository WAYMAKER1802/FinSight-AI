const yahooFinance = require('yahoo-finance2').default;

async function test() {
  try {
    const q1 = await yahooFinance.quote('ZOMATO.NS');
    console.log('ZOMATO.NS:', q1.regularMarketPrice);
  } catch (e) {
    console.log('ZOMATO.NS error:', e.message);
  }
}
test();
