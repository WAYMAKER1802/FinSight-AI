import React from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Sparkles, TrendingUp, ShieldCheck, AlertCircle, Play } from 'lucide-react';

const COLORS = {
  Stocks: '#3b82f6', // blue
  ETFs:   '#8b5cf6', // purple
  Bonds:  '#10b981', // emerald
  Gold:   '#f59e0b', // amber
  Cash:   '#64748b'  // slate
};

export default function Recommendation() {
  const { user } = useAuthStore();
  
  const risk = user?.riskProfile || 'moderate';
  const horizon = user?.investmentHorizon || 'medium_term';
  
  // Dynamic Allocation Logic
  let allocation = [
    { name: 'Stocks', value: 40 },
    { name: 'ETFs',   value: 20 },
    { name: 'Bonds',  value: 25 },
    { name: 'Gold',   value: 10 },
    { name: 'Cash',   value: 5  }
  ];
  
  if (risk === 'conservative') {
    allocation = [
      { name: 'Stocks', value: 15 },
      { name: 'ETFs',   value: 15 },
      { name: 'Bonds',  value: 50 },
      { name: 'Gold',   value: 10 },
      { name: 'Cash',   value: 10 }
    ];
  } else if (risk === 'moderately_aggressive' || risk === 'aggressive') {
    allocation = [
      { name: 'Stocks', value: 60 },
      { name: 'ETFs',   value: 20 },
      { name: 'Bonds',  value: 10 },
      { name: 'Gold',   value: 5  },
      { name: 'Cash',   value: 5  }
    ];
  } else if (risk === 'very_aggressive') {
    allocation = [
      { name: 'Stocks', value: 75 },
      { name: 'ETFs',   value: 15 },
      { name: 'Bonds',  value: 5  },
      { name: 'Gold',   value: 2  },
      { name: 'Cash',   value: 3  }
    ];
  }

  // Adjust for horizon
  if (horizon === 'short_term') {
    const stocks = allocation.find(a => a.name === 'Stocks');
    const bonds = allocation.find(a => a.name === 'Bonds');
    if (stocks && bonds) {
      const shift = Math.floor(stocks.value * 0.3); // shift 30% of stocks to bonds
      stocks.value -= shift;
      bonds.value += shift;
    }
  }

  // Generate Insights based on Profile
  const generateInsights = () => {
    const insights = [];
    if (risk.includes('aggressive')) {
      insights.push('Focus on high-growth equities and sector-specific ETFs to maximize long-term compounding.');
      insights.push('Maintain emotional discipline during market volatility; high-beta assets will swing significantly.');
    } else if (risk === 'conservative') {
      insights.push('Prioritize capital preservation through high-grade corporate bonds and government securities.');
      insights.push('Limit equity exposure strictly to large-cap blue-chip companies with consistent dividend yields.');
    } else {
      insights.push('Maintain a balanced portfolio to weather market fluctuations while capturing steady growth.');
    }
    
    if (horizon === 'short_term') {
      insights.push('Given your short investment horizon, liquidity is paramount. Avoid locking funds in illiquid assets.');
    } else if (horizon === 'long_term') {
      insights.push('Take advantage of your long time horizon by investing consistently every month (SIP) to benefit from Rupee Cost Averaging.');
    }
    
    insights.push('Ensure a 6-month emergency fund is fully capitalized in liquid assets before expanding equity exposure.');
    insights.push('Review and rebalance your portfolio semi-annually to match these target risk parameters.');
    
    return insights;
  };

  const insights = generateInsights();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black font-display text-white flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-brand-400" />
          AI Portfolio Recommendation
        </h1>
        <p className="text-slate-400 text-sm mt-0.5">
          This optimal allocation has been uniquely generated using your active risk profile (<span className="text-brand-300 font-semibold capitalize">{risk.replace('_', ' ')}</span>) and horizon (<span className="text-brand-300 font-semibold capitalize">{horizon.replace('_', ' ')}</span>).
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        
        {/* Asset Allocation Progress Bars */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="card-static p-6 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-brand-400" />
            <h2 className="text-lg font-bold text-white font-display">Asset Allocation Target</h2>
          </div>
          
          <div className="space-y-5 flex-1 flex flex-col justify-center">
            {allocation.map((asset, i) => (
              <div key={asset.name}>
                <div className="flex justify-between text-xs font-semibold mb-2">
                  <span className="text-slate-300">{asset.name}</span>
                  <span className="text-white">{asset.value}%</span>
                </div>
                <div className="h-2 w-full bg-dark-800 rounded-full overflow-hidden border border-white/5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${asset.value}%` }}
                    transition={{ duration: 1, delay: i * 0.1, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: Object.values(COLORS)[i] }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Portfolio Distribution Pie Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
          className="card-static p-6 flex flex-col items-center justify-center">
          <h2 className="text-lg font-bold text-white font-display mb-6 self-start">Portfolio Distribution</h2>
          
          <div className="w-full h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Pie
                  data={allocation}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {allocation.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={Object.values(COLORS)[index]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {allocation.map((asset, i) => (
              <div key={asset.name} className="flex items-center gap-1.5 text-xs text-slate-300">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: Object.values(COLORS)[i] }} />
                {asset.name}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* AI Investment Insights */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
        className="card-static p-6 bg-gradient-to-br from-dark-900 to-brand-900/10">
        <div className="flex items-center gap-2 mb-6">
          <ShieldCheck className="w-5 h-5 text-brand-400" />
          <h2 className="text-lg font-bold text-white font-display">AI Investment Insights</h2>
        </div>
        
        <div className="space-y-4">
          {insights.map((insight, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + (i * 0.1) }}
              className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-brand-500/30 transition-colors"
            >
              <Play className="w-4 h-4 text-brand-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-slate-300 leading-relaxed">{insight}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
      
      {/* Disclaimer */}
      <div className="flex items-start gap-2 p-4 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-300/80 text-xs">
        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <p>
          <strong>FinSight AI Disclaimer:</strong> These allocations are AI-generated recommendations based on Modern Portfolio Theory and your active risk profile. They do not constitute formal financial advice. Market conditions change; consult a registered financial advisor before executing significant rebalancing.
        </p>
      </div>
    </div>
  );
}
