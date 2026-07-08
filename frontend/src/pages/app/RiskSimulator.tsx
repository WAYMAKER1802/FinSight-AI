import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, TrendingDown, Zap, RefreshCw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';

const scenarios = [
  { name: '2008 Crisis', drop: -52, portfolioImpact: -38.4, recover: '3.2 yrs', color: '#f43f5e' },
  { name: '2020 COVID', drop: -38, portfolioImpact: -26.8, recover: '1.1 yrs', color: '#fb923c' },
  { name: '2016 Demonet.', drop: -22, portfolioImpact: -15.2, recover: '0.6 yrs', color: '#f59e0b' },
  { name: 'IT Correction', drop: -30, portfolioImpact: -21.6, recover: '1.8 yrs', color: '#eab308' },
  { name: 'Rate Hike +2%', drop: -15, portfolioImpact: -10.4, recover: '0.4 yrs', color: '#84cc16' },
  { name: 'Mild Correction', drop: -10, portfolioImpact: -6.8, recover: '0.2 yrs', color: '#10b981' },
];

const riskMetrics = [
  { label: 'Overall Risk Score', value: '5.5 / 10', color: 'text-amber-400', bar: 55 },
  { label: 'Beta',               value: '1.08',     color: 'text-white',     bar: 54 },
  { label: 'Volatility (Ann.)',  value: '18.6%',    color: 'text-amber-400', bar: 62 },
  { label: 'Max Drawdown',       value: '-12.3%',   color: 'text-rose-400',  bar: 41 },
  { label: 'VaR (95%, 1-day)',   value: '-₹28,450', color: 'text-rose-400',  bar: 38 },
  { label: 'Concentration Risk', value: 'High',     color: 'text-rose-400',  bar: 70 },
];

const riskBreakdown = [
  { sector: 'IT',        risk: 8, weight: 28 },
  { sector: 'Banking',   risk: 4, weight: 22 },
  { sector: 'Energy',    risk: 5, weight: 14 },
  { sector: 'Crypto',    risk: 9, weight: 10 },
  { sector: 'Gold',      risk: 3, weight: 8  },
  { sector: 'Fixed Inc.', risk: 1, weight: 10 },
];

export default function RiskSimulator() {
  const [selectedScenario, setSelectedScenario] = useState(scenarios[1]);
  const portfolioValue = 2485320;
  const impactAmount   = portfolioValue * (selectedScenario.portfolioImpact / 100);

  return (
    <div className="space-y-6 max-w-screen-xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black font-display text-white">Risk Simulator</h1>
          <p className="text-slate-400 text-sm mt-0.5">Stress-test your portfolio against historical crashes</p>
        </div>
        <div className="badge-loss text-sm px-3 py-1.5">Risk Score: 5.5 / 10 — Moderate</div>
      </div>

      {/* Scenario Selector */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {scenarios.map(s => (
          <button key={s.name} onClick={() => setSelectedScenario(s)}
            className={`p-3 rounded-xl border text-left transition-all ${
              selectedScenario.name === s.name
                ? 'border-brand-500/50 bg-brand-500/10'
                : 'border-white/10 bg-white/5 hover:border-white/20'
            }`}>
            <div className="text-xs font-semibold text-white mb-1">{s.name}</div>
            <div className="text-lg font-bold" style={{ color: s.color }}>{s.drop}%</div>
            <div className="text-2xs text-slate-500">Market drop</div>
          </button>
        ))}
      </div>

      {/* Impact Display */}
      <motion.div key={selectedScenario.name} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
        className="p-6 rounded-2xl border-glow-red bg-rose-500/5">
        <div className="flex items-center gap-3 mb-5">
          <AlertTriangle className="w-6 h-6 text-rose-400" />
          <div>
            <h2 className="text-lg font-bold text-white font-display">{selectedScenario.name} Scenario</h2>
            <p className="text-sm text-slate-400">If this crash happened today:</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Market Drop',    value: `${selectedScenario.drop}%`,     color: 'text-rose-400' },
            { label: 'Portfolio Drop', value: `${selectedScenario.portfolioImpact}%`, color: 'text-rose-400' },
            { label: 'Value at Risk',  value: `₹${Math.abs(impactAmount / 100000).toFixed(1)}L`, color: 'text-rose-400' },
            { label: 'Recovery Time',  value: selectedScenario.recover,        color: 'text-amber-400' },
          ].map(s => (
            <div key={s.label} className="text-center p-4 rounded-xl bg-white/5">
              <div className={`text-2xl font-black font-display ${s.color}`}>{s.value}</div>
              <div className="text-xs text-slate-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
          <strong>AI Insight:</strong> Based on your current allocation, your IT-heavy portfolio (44%) would underperform during this scenario. Consider diversifying into defensive sectors like FMCG or Pharma to reduce downside by ~8%.
        </div>
      </motion.div>

      {/* Risk Metrics + Breakdown */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Risk Metrics */}
        <div className="card-static p-5">
          <h3 className="text-sm font-bold text-white mb-4 font-display">Risk Metrics Dashboard</h3>
          <div className="space-y-3">
            {riskMetrics.map(m => (
              <div key={m.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">{m.label}</span>
                  <span className={`font-semibold font-numeric ${m.color}`}>{m.value}</span>
                </div>
                <div className="progress-bar">
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${m.bar}%`, background: m.bar > 65 ? '#f43f5e' : m.bar > 45 ? '#f59e0b' : '#10b981' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Risk by Sector */}
        <div className="card-static p-5">
          <h3 className="text-sm font-bold text-white mb-4 font-display">Risk by Sector</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={riskBreakdown} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
              <XAxis type="number" domain={[0, 10]} tick={{ fill: '#64748b', fontSize: 10 }} />
              <YAxis type="category" dataKey="sector" tick={{ fill: '#94a3b8', fontSize: 11 }} width={60} />
              <Tooltip formatter={(v: number) => [`${v}/10`, 'Risk Score']}
                contentStyle={{ background: 'rgba(15,23,42,0.95)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', fontSize: 12 }} />
              <Bar dataKey="risk" radius={[0, 4, 4, 0]}>
                {riskBreakdown.map((d, i) => (
                  <Cell key={i} fill={d.risk >= 7 ? '#f43f5e' : d.risk >= 5 ? '#f59e0b' : '#10b981'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
