import { motion } from 'framer-motion';
import { Gauge, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const fearGreedValue = 52;
const fearGreedLabel = fearGreedValue < 25 ? 'Extreme Fear' :
                       fearGreedValue < 45 ? 'Fear' :
                       fearGreedValue < 55 ? 'Neutral' :
                       fearGreedValue < 75 ? 'Greed' : 'Extreme Greed';

const fearGreedColor = fearGreedValue < 25 ? '#f43f5e' :
                       fearGreedValue < 45 ? '#fb923c' :
                       fearGreedValue < 55 ? '#f59e0b' :
                       fearGreedValue < 75 ? '#84cc16' : '#10b981';

const indicators = [
  { name: 'Market Momentum', value: 62, label: 'Greed', trend: 'up' },
  { name: 'Stock Price Strength', value: 58, label: 'Greed', trend: 'up' },
  { name: 'Stock Price Breadth', value: 71, label: 'Greed', trend: 'up' },
  { name: 'Put/Call Ratio', value: 44, label: 'Fear', trend: 'down' },
  { name: 'Market Volatility (VIX)', value: 39, label: 'Fear', trend: 'down' },
  { name: 'Safe Haven Demand', value: 33, label: 'Fear', trend: 'down' },
  { name: 'Junk Bond Demand', value: 68, label: 'Greed', trend: 'up' },
];

const history = [
  { label: 'Previous Close', value: 50, label2: 'Neutral' },
  { label: 'Last Week', value: 48, label2: 'Neutral' },
  { label: 'Last Month', value: 61, label2: 'Greed' },
  { label: 'Last Year', value: 43, label2: 'Fear' },
];

const marketSummary = [
  { index: 'Nifty 50',     value: '22,456', change: '+0.62%', up: true },
  { index: 'Sensex',       value: '73,892', change: '+0.58%', up: true },
  { index: 'Bank Nifty',   value: '47,124', change: '+1.24%', up: true },
  { index: 'Nifty IT',     value: '34,850', change: '-0.32%', up: false },
  { index: 'India VIX',    value: '13.24',  change: '-2.14%', up: false },
  { index: 'FII Net Flow', value: '+₹3,842Cr', change: 'Buying', up: true },
];

export default function MarketMood() {
  // SVG Gauge
  const angle  = (fearGreedValue / 100) * 180 - 90;
  const needleX = 100 + 70 * Math.cos((angle * Math.PI) / 180);
  const needleY = 90  + 70 * Math.sin((angle * Math.PI) / 180);

  return (
    <div className="space-y-6 max-w-screen-xl">
      <div>
        <h1 className="text-2xl font-black font-display text-white">Market Mood</h1>
        <p className="text-slate-400 text-sm mt-0.5">Fear & Greed Index + Real-time Market Sentiment</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Fear & Greed Gauge */}
        <div className="card-static p-6 flex flex-col items-center">
          <h3 className="text-sm font-bold text-white mb-4 font-display">Fear & Greed Index</h3>
          {/* SVG Gauge */}
          <svg viewBox="0 0 200 110" className="w-48">
            <defs>
              <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%"   stopColor="#f43f5e" />
                <stop offset="25%"  stopColor="#fb923c" />
                <stop offset="50%"  stopColor="#f59e0b" />
                <stop offset="75%"  stopColor="#84cc16" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>
            <path d="M 20 90 A 80 80 0 0 1 180 90" fill="none" stroke="url(#gaugeGrad)" strokeWidth="16" strokeLinecap="round" />
            <line x1="100" y1="90" x2={needleX} y2={needleY} stroke="white" strokeWidth="3" strokeLinecap="round" />
            <circle cx="100" cy="90" r="5" fill="white" />
            {['0', '25', '50', '75', '100'].map((l, i) => {
              const a = (i * 45 - 90) * (Math.PI / 180);
              return (
                <text key={i} x={100 + 92 * Math.cos(a)} y={90 + 92 * Math.sin(a)}
                  textAnchor="middle" fill="#64748b" fontSize="8">{l}</text>
              );
            })}
          </svg>
          <div className="text-center mt-2">
            <div className="text-5xl font-black font-display" style={{ color: fearGreedColor }}>{fearGreedValue}</div>
            <div className="text-lg font-bold mt-1" style={{ color: fearGreedColor }}>{fearGreedLabel}</div>
            <div className="text-xs text-slate-500 mt-1">Updated: Today 3:30 PM</div>
          </div>
          {/* History */}
          <div className="w-full mt-4 space-y-2">
            {history.map(h => (
              <div key={h.label} className="flex justify-between text-xs">
                <span className="text-slate-500">{h.label}</span>
                <span className="font-semibold text-white">{h.value} — <span className="text-slate-400">{h.label2}</span></span>
              </div>
            ))}
          </div>
        </div>

        {/* Market Summary */}
        <div className="card-static p-5">
          <h3 className="text-sm font-bold text-white mb-4 font-display">Live Market Snapshot</h3>
          <div className="space-y-3">
            {marketSummary.map(m => (
              <div key={m.index} className="flex items-center justify-between">
                <span className="text-xs text-slate-400">{m.index}</span>
                <div className="text-right">
                  <div className="text-xs font-semibold text-white font-numeric">{m.value}</div>
                  <div className={`text-2xs font-semibold ${m.up ? 'text-emerald-400' : 'text-rose-400'}`}>{m.change}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 rounded-lg bg-brand-500/10 border border-brand-500/20 text-xs text-brand-300">
            <strong>AI Take:</strong> Market is in mild Greed territory. Momentum indicators are bullish but VIX near support — stay cautious. Your portfolio is well-positioned.
          </div>
        </div>

        {/* Indicator Breakdown */}
        <div className="card-static p-5">
          <h3 className="text-sm font-bold text-white mb-4 font-display">Indicator Breakdown</h3>
          <div className="space-y-3">
            {indicators.map(ind => (
              <div key={ind.name}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">{ind.name}</span>
                  <span className={ind.value >= 50 ? 'text-emerald-400' : 'text-rose-400'}>{ind.label}</span>
                </div>
                <div className="progress-bar">
                  <div className="h-full rounded-full" style={{
                    width: `${ind.value}%`,
                    background: ind.value >= 50 ? '#10b981' : '#f43f5e'
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
