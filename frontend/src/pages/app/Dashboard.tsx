import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import {
  TrendingUp, TrendingDown, Brain, Shield, Target, Bell,
  ArrowUpRight, ArrowDownRight, Sparkles, Zap, ChevronRight,
  BarChart3, Eye, AlertTriangle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

// ── Mock data ──────────────────────────────────────────────────────────────
const portfolioHistory = [
  { month: 'Jan', value: 18.5 }, { month: 'Feb', value: 19.2 }, { month: 'Mar', value: 17.8 },
  { month: 'Apr', value: 20.4 }, { month: 'May', value: 21.1 }, { month: 'Jun', value: 22.8 },
  { month: 'Jul', value: 21.5 }, { month: 'Aug', value: 23.4 }, { month: 'Sep', value: 24.1 },
  { month: 'Oct', value: 22.9 }, { month: 'Nov', value: 25.6 }, { month: 'Dec', value: 24.85 },
];

const assetAllocation = [
  { name: 'Equities',     value: 55, color: '#667eea' },
  { name: 'Mutual Funds', value: 20, color: '#10b981' },
  { name: 'Gold/ETFs',    value: 12, color: '#f59e0b' },
  { name: 'Fixed Income', value: 8,  color: '#06b6d4' },
  { name: 'Crypto',       value: 5,  color: '#8b5cf6' },
];

const topHoldings = [
  { symbol: 'RELIANCE',  name: 'Reliance Industries',  value: 69500,  alloc: 22.4, change: +1.8,  rec: 'HOLD'  },
  { symbol: 'INFY',      name: 'Infosys Ltd.',         value: 81000,  alloc: 26.1, change: +2.3,  rec: 'BUY'   },
  { symbol: 'HDFCBANK',  name: 'HDFC Bank',            value: 68800,  alloc: 22.2, change: +3.2,  rec: 'BUY'   },
  { symbol: 'TCS',       name: 'Tata Consultancy',     value: 57750,  alloc: 18.6, change: -0.4,  rec: 'HOLD'  },
  { symbol: 'GOLDBEES',  name: 'Nippon Gold ETF',      value: 10400,  alloc: 3.4,  change: +0.8,  rec: 'HOLD'  },
];

const aiInsights = [
  { type: 'opportunity', icon: '💡', text: 'HDFC Bank is technically oversold — RSI at 28. Consider adding 2–3% allocation.' },
  { type: 'warning',     icon: '⚠️', text: 'IT sector concentration at 44% is above recommended 30%. Consider trimming INFY.' },
  { type: 'info',        icon: '📊', text: 'Your CAGR of 14.2% beats Nifty 50\'s 11.8% over the same period. Keep it up!' },
];

const weeklyPerf = [
  { day: 'Mon', pnl: 3240 }, { day: 'Tue', pnl: -1820 }, { day: 'Wed', pnl: 5100 },
  { day: 'Thu', pnl: 2300 }, { day: 'Fri', pnl: 8050 },
];

// ── Sub-components ──────────────────────────────────────────────────────────
const StatCard = ({ label, value, change, changeType, icon, gradient }: any) => (
  <div className="stat-card group hover:border-brand-500/20 transition-all">
    <div className="flex items-start justify-between">
      <div>
        <p className="stat-label">{label}</p>
        <p className="stat-value mt-1">{value}</p>
        {change && (
          <p className={`text-xs font-semibold mt-1 flex items-center gap-1 ${changeType === 'up' ? 'text-emerald-400' : 'text-rose-400'}`}>
            {changeType === 'up'
              ? <ArrowUpRight className="w-3 h-3" />
              : <ArrowDownRight className="w-3 h-3" />}
            {change}
          </p>
        )}
      </div>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${gradient}`}>
        {icon}
      </div>
    </div>
  </div>
);

const RecChip = ({ rec }: { rec: string }) => {
  const map: Record<string, string> = {
    'BUY'        : 'chip-buy',
    'STRONG BUY' : 'chip-strong-buy',
    'HOLD'       : 'chip-hold',
    'SELL'       : 'chip-sell',
    'STRONG SELL': 'chip-strong-sell',
  };
  return <span className={map[rec] || 'chip-hold'}>{rec}</span>;
};

// ── Dashboard Page ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user } = useAuthStore();

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const item      = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-screen-2xl">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <motion.div variants={item} className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black font-display text-white">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'},{' '}
            <span className="gradient-text">{user?.name?.split(' ')[0] || 'Investor'} 👋</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}
            {' '}· Markets are{' '}
            <span className="text-emerald-400 font-medium">open</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/app/ai-chat" className="btn-primary text-sm gap-2">
            <Brain className="w-4 h-4" /> Ask AI
          </Link>
          <Link to="/app/reports" className="btn-secondary text-sm gap-2">
            <BarChart3 className="w-4 h-4" /> Reports
          </Link>
        </div>
      </motion.div>

      {/* ── AI Insights Banner ───────────────────────────────────────────── */}
      <motion.div variants={item}
        className="p-4 rounded-2xl border border-brand-500/30 bg-gradient-to-r from-brand-500/10 to-accent-violet/10 flex items-start gap-4"
      >
        <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-5 h-5 text-brand-400" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-semibold text-brand-300">AI Daily Brief</span>
            <span className="badge-brand text-2xs">LIVE</span>
          </div>
          <p className="text-sm text-slate-300">
            Markets are positive today — Nifty up 0.62%. Your portfolio has outperformed by 18 bps.
            <span className="text-brand-400 font-medium"> HDFC Bank shows a strong BUY signal</span> based on Q4 results and RSI divergence.
            Consider reviewing your IT exposure — now at 44% vs. recommended 30%.
          </p>
        </div>
        <Link to="/app/ai-chat" className="btn-secondary text-xs px-3 py-1.5 flex-shrink-0">
          Chat <ChevronRight className="w-3 h-3" />
        </Link>
      </motion.div>

      {/* ── Stats Row ────────────────────────────────────────────────────── */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Portfolio Value" value="₹24,85,320"
          change="+₹15,240 today" changeType="up"
          icon={<TrendingUp className="w-5 h-5 text-brand-400" />}
          gradient="bg-brand-500/10"
        />
        <StatCard
          label="Total Returns" value="+₹4,85,320"
          change="+24.2% overall" changeType="up"
          icon={<ArrowUpRight className="w-5 h-5 text-emerald-400" />}
          gradient="bg-emerald-500/10"
        />
        <StatCard
          label="Portfolio Health" value="84/100"
          change="+5 pts this week" changeType="up"
          icon={<Shield className="w-5 h-5 text-amber-400" />}
          gradient="bg-amber-500/10"
        />
        <StatCard
          label="AI Wealth Score" value="612/1000"
          change="Wealth Builder 🏆" changeType="up"
          icon={<Sparkles className="w-5 h-5 text-violet-400" />}
          gradient="bg-violet-500/10"
        />
      </motion.div>

      {/* ── Main Grid ────────────────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* Portfolio Performance Chart */}
        <motion.div variants={item} className="lg:col-span-2 card-static p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-white font-display">Portfolio Performance</h2>
              <p className="text-xs text-slate-500 mt-0.5">₹ in Lakhs · 12-month view</p>
            </div>
            <div className="flex gap-2">
              {['1M', '3M', '6M', '1Y', 'All'].map(t => (
                <button key={t} className={`text-xs px-2.5 py-1 rounded-lg transition-all ${
                  t === '1Y' ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30' : 'text-slate-500 hover:text-white'
                }`}>{t}</button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={portfolioHistory}>
              <defs>
                <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#667eea" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#667eea" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}L`} />
              <Tooltip
                contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
                labelStyle={{ color: '#f1f5f9', fontSize: 12 }}
                formatter={(v: number) => [`₹${v}L`, 'Portfolio Value']}
              />
              <Area type="monotone" dataKey="value" stroke="#667eea" strokeWidth={2.5}
                fill="url(#portfolioGradient)" dot={false} activeDot={{ r: 5, fill: '#667eea' }} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Asset Allocation */}
        <motion.div variants={item} className="card-static p-5">
          <h2 className="text-base font-bold text-white font-display mb-5">Asset Allocation</h2>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={assetAllocation} cx="50%" cy="50%" innerRadius={45} outerRadius={70}
                dataKey="value" paddingAngle={3}>
                {assetAllocation.map((entry, i) => (
                  <Cell key={i} fill={entry.color} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
                formatter={(v: number) => [`${v}%`, 'Allocation']}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {assetAllocation.map((a) => (
              <div key={a.name} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: a.color }} />
                <span className="text-xs text-slate-400 flex-1">{a.name}</span>
                <span className="text-xs font-semibold text-white font-numeric">{a.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Holdings + Weekly P&L ─────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* Top Holdings */}
        <motion.div variants={item} className="lg:col-span-2 card-static">
          <div className="flex items-center justify-between p-5 border-b border-white/5">
            <h2 className="text-base font-bold text-white font-display">Top Holdings</h2>
            <Link to="/app/portfolio" className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1">
              View All <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Stock</th>
                  <th className="text-right">Value</th>
                  <th className="text-right">Alloc.</th>
                  <th className="text-right">Day Change</th>
                  <th className="text-right">Signal</th>
                </tr>
              </thead>
              <tbody>
                {topHoldings.map((h) => (
                  <tr key={h.symbol} className="group">
                    <td>
                      <div>
                        <div className="font-semibold text-white text-sm">{h.symbol}</div>
                        <div className="text-2xs text-slate-500 truncate max-w-32">{h.name}</div>
                      </div>
                    </td>
                    <td className="text-right font-numeric text-sm">₹{h.value.toLocaleString('en-IN')}</td>
                    <td className="text-right text-sm">{h.alloc}%</td>
                    <td className={`text-right text-sm font-semibold font-numeric ${h.change >= 0 ? 'profit' : 'loss'}`}>
                      {h.change >= 0 ? '+' : ''}{h.change}%
                    </td>
                    <td className="text-right"><RecChip rec={h.rec} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Weekly P&L + AI Insights */}
        <div className="space-y-4">
          {/* Weekly P&L */}
          <motion.div variants={item} className="card-static p-5">
            <h3 className="text-sm font-bold text-white mb-4 font-display">This Week's P&L</h3>
            <ResponsiveContainer width="100%" height={100}>
              <BarChart data={weeklyPerf} barSize={20}>
                <Bar dataKey="pnl" radius={[4, 4, 0, 0]} fill="#667eea"
                  label={false}
                  style={{ cursor: 'pointer' }}>
                  {weeklyPerf.map((d, i) => (
                    <Cell key={i} fill={d.pnl >= 0 ? '#10b981' : '#f43f5e'} />
                  ))}
                </Bar>
                <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, fontSize: 12 }}
                  formatter={(v: number) => [`₹${Math.abs(v).toLocaleString('en-IN')}`, v >= 0 ? '▲ Gain' : '▼ Loss']}
                />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-slate-500">Week Total</span>
              <span className="text-sm font-bold text-emerald-400 font-numeric">+₹16,870</span>
            </div>
          </motion.div>

          {/* AI Insights */}
          <motion.div variants={item} className="card-static p-5">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-4 h-4 text-brand-400" />
              <h3 className="text-sm font-bold text-white font-display">AI Insights</h3>
            </div>
            <div className="space-y-3">
              {aiInsights.map((insight, i) => (
                <div key={i} className="flex gap-2.5 p-2.5 rounded-xl bg-white/5">
                  <span className="text-base flex-shrink-0">{insight.icon}</span>
                  <p className="text-xs text-slate-300 leading-relaxed">{insight.text}</p>
                </div>
              ))}
            </div>
            <Link to="/app/ai-chat" className="btn-primary w-full justify-center text-xs mt-4 py-2">
              <Sparkles className="w-3.5 h-3.5" /> Get Full Analysis
            </Link>
          </motion.div>
        </div>
      </div>

      {/* ── Quick Actions ─────────────────────────────────────────────────── */}
      <motion.div variants={item}>
        <h2 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: '🧠', label: 'Analyze Portfolio',  to: '/app/ai-chat',     color: 'border-brand-500/20 hover:border-brand-500/40 hover:bg-brand-500/5' },
            { icon: '🎯', label: 'Update Goals',       to: '/app/goals',        color: 'border-emerald-500/20 hover:border-emerald-500/40 hover:bg-emerald-500/5' },
            { icon: '🛡️', label: 'Risk Check',        to: '/app/risk-simulator', color: 'border-rose-500/20 hover:border-rose-500/40 hover:bg-rose-500/5' },
            { icon: '📊', label: 'Generate Report',   to: '/app/reports',       color: 'border-amber-500/20 hover:border-amber-500/40 hover:bg-amber-500/5' },
          ].map(a => (
            <Link key={a.label} to={a.to}
              className={`card-static p-4 flex flex-col items-center gap-2 text-center border ${a.color} transition-all cursor-pointer`}>
              <span className="text-2xl">{a.icon}</span>
              <span className="text-xs font-medium text-slate-300">{a.label}</span>
            </Link>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
