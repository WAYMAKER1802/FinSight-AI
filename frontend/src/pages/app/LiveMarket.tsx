import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Activity, BarChart2 } from 'lucide-react';

// --- Fear & Greed Logic ---
const fearGreedValue = 52;
const fearGreedLabel = fearGreedValue < 25 ? 'Extreme Fear' :
                       fearGreedValue < 45 ? 'Fear' :
                       fearGreedValue < 55 ? 'Neutral' :
                       fearGreedValue < 75 ? 'Greed' : 'Extreme Greed';

const fearGreedColor = fearGreedValue < 25 ? '#f43f5e' :
                       fearGreedValue < 45 ? '#fb923c' :
                       fearGreedValue < 55 ? '#f59e0b' :
                       fearGreedValue < 75 ? '#84cc16' : '#10b981';

// --- Market Movers Dummy Data ---
const topGainers = [
  { symbol: 'RELIANCE', price: '₹2,954.20', change: '+2.45%', up: true },
  { symbol: 'TATASTEEL', price: '₹142.50', change: '+1.80%', up: true },
  { symbol: 'ZOMATO', price: '₹165.30', change: '+4.12%', up: true },
  { symbol: 'SBIN', price: '₹752.10', change: '+1.15%', up: true },
];

const topLosers = [
  { symbol: 'INFY', price: '₹1,482.00', change: '-1.25%', up: false },
  { symbol: 'WIPRO', price: '₹475.60', change: '-2.10%', up: false },
  { symbol: 'HDFCBANK', price: '₹1,430.25', change: '-0.85%', up: false },
  { symbol: 'ITC', price: '₹410.80', change: '-0.45%', up: false },
];

export default function LiveMarket() {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;
    
    // Clear any existing chart
    chartContainerRef.current.innerHTML = '';
    
    // Create the container div that TradingView expects
    const div = document.createElement('div');
    div.id = 'tradingview_widget';
    div.style.height = '100%';
    div.style.width = '100%';
    chartContainerRef.current.appendChild(div);

    // Append script
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      if ((window as any).TradingView) {
        new (window as any).TradingView.widget({
          autosize: true,
          symbol: 'NSE:NIFTY',
          interval: 'D',
          timezone: 'Asia/Kolkata',
          theme: 'dark',
          style: '1',
          locale: 'en',
          enable_publishing: false,
          backgroundColor: '#0f172a', // dark-950
          gridColor: '#1e293b',       // dark-800
          hide_top_toolbar: false,
          hide_legend: false,
          save_image: false,
          container_id: 'tradingview_widget',
        });
      }
    };
    chartContainerRef.current.appendChild(script);
  }, []);

  // SVG Gauge Calculations
  const angle  = (fearGreedValue / 100) * 180 - 90;
  const needleX = 100 + 70 * Math.cos((angle * Math.PI) / 180);
  const needleY = 90  + 70 * Math.sin((angle * Math.PI) / 180);

  return (
    <div className="space-y-6 max-w-[1600px] h-full flex flex-col">
      <div>
        <h1 className="text-2xl font-black font-display text-white flex items-center gap-2">
          <Activity className="w-6 h-6 text-brand-400" /> Live Indian Market
        </h1>
        <p className="text-slate-400 text-sm mt-0.5">Real-time charting, movers, and sentiment analysis.</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6 flex-1 min-h-[600px]">
        
        {/* Main Chart Area (Spans 3 columns on large screens) */}
        <div className="lg:col-span-3 card-static overflow-hidden flex flex-col relative border-brand-500/20">
          <div className="p-4 border-b border-white/5 flex items-center justify-between bg-dark-900/50">
            <h2 className="text-sm font-bold text-white font-display flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-brand-400" /> NIFTY 50 Advanced Chart
            </h2>
            <div className="flex gap-2">
              <span className="badge-brand text-xs">Live</span>
              <span className="badge border border-white/10 text-slate-400 text-xs">NSE</span>
            </div>
          </div>
          
          <div className="flex-1 w-full relative" ref={chartContainerRef}>
            {/* TradingView widget will inject here */}
          </div>
        </div>

        {/* Sidebar (Spans 1 column) */}
        <div className="space-y-6 flex flex-col">
          
          {/* AI Fear & Greed */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="card-static p-6 flex flex-col items-center border-brand-500/10">
            <h3 className="text-sm font-bold text-white mb-4 font-display">AI Market Mood</h3>
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
              <div className="text-4xl font-black font-display" style={{ color: fearGreedColor }}>{fearGreedValue}</div>
              <div className="text-sm font-bold mt-1" style={{ color: fearGreedColor }}>{fearGreedLabel}</div>
            </div>
          </motion.div>

          {/* Top Gainers */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="card-static p-5 flex-1">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white font-display">Top Gainers</h3>
            </div>
            <div className="space-y-3">
              {topGainers.map(stock => (
                <div key={stock.symbol} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer border border-transparent hover:border-white/5">
                  <span className="text-sm font-semibold text-slate-200">{stock.symbol}</span>
                  <div className="text-right">
                    <div className="text-sm font-bold text-white font-numeric">{stock.price}</div>
                    <div className="text-xs font-semibold text-emerald-400">{stock.change}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Top Losers */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="card-static p-5 flex-1">
            <div className="flex items-center gap-2 mb-4">
              <TrendingDown className="w-4 h-4 text-rose-400" />
              <h3 className="text-sm font-bold text-white font-display">Top Losers</h3>
            </div>
            <div className="space-y-3">
              {topLosers.map(stock => (
                <div key={stock.symbol} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer border border-transparent hover:border-white/5">
                  <span className="text-sm font-semibold text-slate-200">{stock.symbol}</span>
                  <div className="text-right">
                    <div className="text-sm font-bold text-white font-numeric">{stock.price}</div>
                    <div className="text-xs font-semibold text-rose-400">{stock.change}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
