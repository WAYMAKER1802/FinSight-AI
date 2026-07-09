import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, ExternalLink, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { watchlistApi } from '@/api/watchlist.api';

// --- Dummy Data ---
const mostTraded = [
  { symbol: 'CUPID', name: 'Cupid', price: '210.01', change: '+13.03', percent: '+6.61%', up: true },
  { symbol: 'ITDC', name: 'ITDC', price: '728.10', change: '+4.70', percent: '+0.65%', up: true },
  { symbol: 'PCJEWELLER', name: 'PC Jeweller', price: '9.83', change: '+0.21', percent: '+2.18%', up: true },
  { symbol: 'JINDRILL', name: 'Jindal Drilling', price: '620.75', change: '+19.70', percent: '+3.28%', up: true },
];

const topGainers = [
  { symbol: 'RELIANCE', name: 'Reliance Ind', price: '2,954.20', percent: '+2.45%', up: true },
  { symbol: 'ZOMATO', name: 'Zomato', price: '165.30', percent: '+4.12%', up: true },
  { symbol: 'TATASTEEL', name: 'Tata Steel', price: '142.50', percent: '+1.80%', up: true },
];

const topLosers = [
  { symbol: 'INFY', name: 'Infosys', price: '1,482.00', percent: '-1.25%', up: false },
  { symbol: 'HDFCBANK', name: 'HDFC Bank', price: '1,430.25', percent: '-0.85%', up: false },
  { symbol: 'WIPRO', name: 'Wipro', price: '475.60', percent: '-2.10%', up: false },
];

export default function LiveMarket() {
  const [activeTab, setActiveTab] = useState('Gainers');
  const navigate = useNavigate();

  const handleAddToWatchlist = async (symbol: string, name: string) => {
    try {
      await watchlistApi.addToWatchlist(symbol, name, 'Stock');
      toast.success(`${symbol} added to Watchlist`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add to watchlist');
    }
  };

  return (
    <div className="space-y-8 max-w-[1200px] mx-auto pb-10">
      
      {/* Most Traded Stocks */}
      <div>
        <h2 className="text-xl font-bold text-white font-display mb-4">Most traded stocks on InvestIQ</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {mostTraded.map(stock => (
            <motion.div 
              whileHover={{ y: -4 }} 
              key={stock.symbol} 
              onClick={() => navigate(`/app/stock/${stock.symbol}`)}
              className="card-static p-4 cursor-pointer relative group"
            >
              <button 
                onClick={(e) => { e.stopPropagation(); handleAddToWatchlist(stock.symbol, stock.name); }}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-brand-500 hover:text-white"
                title="Add to Watchlist"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold mb-4">
                {stock.name[0]}
              </div>
              <div className="text-sm font-semibold text-slate-300 mb-2">{stock.name}</div>
              <div className="text-lg font-bold text-white font-numeric">₹{stock.price}</div>
              <div className={`text-xs font-semibold ${stock.up ? 'text-emerald-400' : 'text-rose-400'}`}>
                {stock.change} ({stock.percent})
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left Column (Top Movers) */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-white font-display">Top movers today</h2>
          <div className="flex items-center gap-2 mb-4">
            {['Gainers', 'Losers', 'Volume shockers'].map(tab => (
              <button 
                key={tab} 
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                  activeTab === tab ? 'bg-brand-500 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="card-static overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-xs text-slate-400 uppercase tracking-wider">
                  <th className="p-4 font-semibold">Company</th>
                  <th className="p-4 font-semibold text-right">Market Price</th>
                  <th className="p-4 font-semibold text-right">Watchlist</th>
                </tr>
              </thead>
              <tbody>
                {(activeTab === 'Gainers' ? topGainers : topLosers).map((stock, i) => (
                  <tr 
                    key={stock.symbol} 
                    onClick={() => navigate(`/app/stock/${stock.symbol}`)}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer group"
                  >
                    <td className="p-4">
                      <div className="text-sm font-bold text-white">{stock.name}</div>
                      <div className="text-xs text-slate-500">{stock.symbol}</div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="text-sm font-bold text-white font-numeric">₹{stock.price}</div>
                      <div className={`text-xs font-semibold ${stock.up ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {stock.percent}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleAddToWatchlist(stock.symbol, stock.name); }}
                        className="p-2 rounded-lg bg-white/5 hover:bg-brand-500 hover:text-white transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column (Investments & Tools) */}
        <div className="space-y-6">
          
          {/* Your Investments Mini-Card */}
          <div>
            <h2 className="text-xl font-bold text-white font-display mb-4">Your investments</h2>
            <div className="card-static p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <TrendingUp className="w-16 h-16" />
              </div>
              <div className="text-sm text-slate-400 mb-1">Current Value</div>
              <div className="text-3xl font-black text-white font-numeric mb-6">₹1,24,500</div>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">1D returns</span>
                  <span className="text-emerald-400 font-semibold font-numeric">+₹1,240 (1.01%)</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Total returns</span>
                  <span className="text-emerald-400 font-semibold font-numeric">+₹14,500 (13.18%)</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Invested</span>
                  <span className="text-white font-semibold font-numeric">₹1,10,000</span>
                </div>
              </div>
            </div>
          </div>

          {/* Products & Tools */}
          <div>
            <h2 className="text-xl font-bold text-white font-display mb-4">Products & Tools</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="card-static p-4 hover:border-brand-500/30 cursor-pointer transition-colors flex flex-col items-center justify-center text-center">
                <div className="w-10 h-10 rounded-full bg-brand-500/10 flex items-center justify-center mb-2">
                  <ExternalLink className="w-5 h-5 text-brand-400" />
                </div>
                <div className="text-sm font-semibold text-white">IPO</div>
                <div className="text-xs text-emerald-400 mt-1">4 open</div>
              </div>
              <div className="card-static p-4 hover:border-brand-500/30 cursor-pointer transition-colors flex flex-col items-center justify-center text-center">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center mb-2">
                  <TrendingUp className="w-5 h-5 text-amber-400" />
                </div>
                <div className="text-sm font-semibold text-white">Bonds</div>
              </div>
              <div className="card-static p-4 hover:border-brand-500/30 cursor-pointer transition-colors flex flex-col items-center justify-center text-center">
                <div className="w-10 h-10 rounded-full bg-violet-500/10 flex items-center justify-center mb-2">
                  <TrendingDown className="w-5 h-5 text-violet-400" />
                </div>
                <div className="text-sm font-semibold text-white">ETFs</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
