import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  LineChart, Line, Cell, ScatterChart, Scatter
} from 'recharts';
import { TrendingUp, BarChart3, Target, Activity } from 'lucide-react';

const monthlyReturns = [
  { month: 'Jan', portfolio: 3.2, nifty: 2.1 }, { month: 'Feb', portfolio: 4.1, nifty: 3.4 },
  { month: 'Mar', portfolio: -1.2, nifty: -2.3 }, { month: 'Apr', portfolio: 5.6, nifty: 3.8 },
  { month: 'May', portfolio: 2.8, nifty: 1.5 }, { month: 'Jun', portfolio: 6.3, nifty: 4.2 },
  { month: 'Jul', portfolio: -0.4, nifty: -1.2 }, { month: 'Aug', portfolio: 4.9, nifty: 3.1 },
  { month: 'Sep', portfolio: 3.7, nifty: 2.8 }, { month: 'Oct', portfolio: -1.8, nifty: -2.5 },
  { month: 'Nov', portfolio: 7.2, nifty: 5.1 }, { month: 'Dec', portfolio: 2.1, nifty: 1.8 },
];

const radarData = [
  { metric: 'Returns',      portfolio: 85, benchmark: 70 },
  { metric: 'Stability',    portfolio: 72, benchmark: 80 },
  { metric: 'Diversification', portfolio: 65, benchmark: 75 },
  { metric: 'Risk-Adj.',    portfolio: 78, benchmark: 68 },
  { metric: 'Liquidity',    portfolio: 90, benchmark: 85 },
  { metric: 'Goal Align.',  portfolio: 80, benchmark: 65 },
];

const sectorPerf = [
  { sector: 'IT', returns: 22.4, weight: 28 },
  { sector: 'Banking', returns: 18.3, weight: 22 },
  { sector: 'Energy', returns: 15.8, weight: 14 },
  { sector: 'Gold', returns: 12.1, weight: 8 },
  { sector: 'Fixed', returns: 7.1, weight: 10 },
  { sector: 'Crypto', returns: 16.7, weight: 10 },
];

const metrics = [
  { label: 'CAGR',           value: '14.2%',  vs: 'Nifty: 11.8%', good: true },
  { label: 'Sharpe Ratio',   value: '1.24',   vs: 'Benchmark: 0.92', good: true },
  { label: 'Max Drawdown',   value: '-12.3%', vs: 'Nifty: -14.8%',  good: true },
  { label: 'Volatility',     value: '18.6%',  vs: 'Nifty: 17.2%',   good: false },
  { label: 'Beta',           value: '1.08',   vs: 'Market: 1.0',    good: false },
  { label: 'Alpha',          value: '+2.4%',  vs: 'Positive ✓',     good: true },
  { label: 'Sortino Ratio',  value: '1.82',   vs: 'Benchmark: 1.21', good: true },
  { label: 'Win Rate',       value: '68%',    vs: 'Months positive', good: true },
];

export default function Analytics() {
  return (
    <div className="space-y-6 max-w-screen-2xl">
      <div>
        <h1 className="text-2xl font-black font-display text-white">Portfolio Analytics</h1>
        <p className="text-slate-400 text-sm mt-0.5">Deep performance analysis vs. benchmarks</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {metrics.map((m, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="stat-card">
            <p className="stat-label">{m.label}</p>
            <p className={`text-xl font-bold font-numeric mt-1 ${m.good ? 'text-emerald-400' : 'text-white'}`}>{m.value}</p>
            <p className="text-2xs text-slate-500 mt-1">{m.vs}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card-static p-5">
          <h3 className="text-sm font-bold text-white mb-4 font-display">Monthly Returns vs. Nifty 50</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyReturns} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
              <Tooltip
                contentStyle={{ background: 'rgba(15,23,42,0.95)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', fontSize: 12 }}
                formatter={(v: number, name: string) => [`${v}%`, name === 'portfolio' ? 'Your Portfolio' : 'Nifty 50']}
              />
              <Bar dataKey="portfolio" fill="#667eea" radius={[3, 3, 0, 0]} name="portfolio">
                {monthlyReturns.map((d, i) => <Cell key={i} fill={d.portfolio >= 0 ? '#667eea' : '#f43f5e'} />)}
              </Bar>
              <Bar dataKey="nifty" fill="#10b981" radius={[3, 3, 0, 0]} name="nifty">
                {monthlyReturns.map((d, i) => <Cell key={i} fill={d.nifty >= 0 ? '#10b981' : '#fb923c'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card-static p-5">
          <h3 className="text-sm font-bold text-white mb-4 font-display">Portfolio Scorecard vs. Benchmark</h3>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.05)" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: '#64748b', fontSize: 10 }} />
              <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
              <Radar name="Portfolio" dataKey="portfolio" stroke="#667eea" fill="#667eea" fillOpacity={0.25} strokeWidth={2} />
              <Radar name="Benchmark" dataKey="benchmark" stroke="#10b981" fill="#10b981" fillOpacity={0.1} strokeWidth={1.5} strokeDasharray="4 2" />
              <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.95)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', fontSize: 11 }} />
            </RadarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 justify-center mt-2">
            <div className="flex items-center gap-2 text-xs text-slate-400"><span className="w-3 h-0.5 bg-brand-500 rounded" />Your Portfolio</div>
            <div className="flex items-center gap-2 text-xs text-slate-400"><span className="w-3 h-0.5 bg-emerald-500 rounded" />Benchmark</div>
          </div>
        </div>
      </div>

      {/* Sector Performance */}
      <div className="card-static p-5">
        <h3 className="text-sm font-bold text-white mb-4 font-display">Sector Contribution Analysis</h3>
        <div className="space-y-3">
          {sectorPerf.map((s) => (
            <div key={s.sector} className="flex items-center gap-4">
              <div className="w-20 text-xs text-slate-400">{s.sector}</div>
              <div className="flex-1">
                <div className="progress-bar h-2">
                  <div className="progress-fill" style={{ width: `${(s.returns / 25) * 100}%`,
                    background: s.returns > 15 ? '#10b981' : s.returns > 10 ? '#f59e0b' : '#f43f5e' }} />
                </div>
              </div>
              <div className="w-16 text-right text-xs font-bold font-numeric text-emerald-400">+{s.returns}%</div>
              <div className="w-12 text-right text-xs text-slate-500">{s.weight}% wt.</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
