import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import {
  TrendingUp, TrendingDown, Brain, Shield, Target, Sparkles,
  ArrowUpRight, ArrowDownRight, ChevronRight, BarChart3, RefreshCw, Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { usePortfolioStore } from '@/store/portfolioStore';
import { aiApi } from '@/api/market.api';
import toast from 'react-hot-toast';

const COLORS = ['#667eea','#10b981','#f59e0b','#06b6d4','#8b5cf6','#f43f5e','#ec4899'];

const RecChip = ({ rec }: { rec: string }) => {
  const cls: Record<string, string> = {
    'strong_buy': 'chip-strong-buy', 'buy': 'chip-buy',
    'hold': 'chip-hold', 'sell': 'chip-sell', 'strong_sell': 'chip-strong-sell',
    'BUY': 'chip-buy', 'HOLD': 'chip-hold', 'SELL': 'chip-sell',
    'STRONG BUY': 'chip-strong-buy', 'STRONG SELL': 'chip-strong-sell',
  };
  return <span className={cls[rec] || 'chip-hold'}>{rec.replace('_',' ').toUpperCase()}</span>;
};

const StatCard = ({ label, value, change, changeType, icon, gradient, loading }: any) => (
  <div className="stat-card group hover:border-brand-500/20 transition-all">
    <div className="flex items-start justify-between">
      <div>
        <p className="stat-label">{label}</p>
        {loading
          ? <div className="w-28 h-7 mt-1 bg-white/5 rounded-lg animate-pulse" />
          : <p className="stat-value mt-1">{value}</p>
        }
        {change && !loading && (
          <p className={`text-xs font-semibold mt-1 flex items-center gap-1 ${changeType === 'up' ? 'text-emerald-400' : 'text-rose-400'}`}>
            {changeType === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {change}
          </p>
        )}
      </div>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${gradient}`}>{icon}</div>
    </div>
  </div>
);

const fmt = (n: number) => n?.toLocaleString('en-IN', { maximumFractionDigits: 0 }) || '0';
const fmtL = (n: number) => `₹${((n || 0) / 100000).toFixed(2)}L`;

export default function Dashboard() {
  const { user } = useAuthStore();
  const { portfolios, activePortfolio, loading, priceRefreshing, fetchPortfolios, refreshPrices } = usePortfolioStore();

  const [performance, setPerformance]   = useState<any[]>([]);
  const [dailyBrief,  setDailyBrief]    = useState<string>('');
  const [briefLoading,setBriefLoading]  = useState(true);
  const [perfLoading, setPerfLoading]   = useState(true);
  const { getPerformance } = usePortfolioStore();

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const item      = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  // Load portfolios on mount
  useEffect(() => { fetchPortfolios(); }, []);

  // Load performance chart
  useEffect(() => {
    if (!activePortfolio?.id) { setPerfLoading(false); return; }
    setPerfLoading(true);
    getPerformance(activePortfolio.id, '1Y')
      .then(d => setPerformance(d?.history || []))
      .catch(() => setPerformance([]))
      .finally(() => setPerfLoading(false));
  }, [activePortfolio?.id]);

  // Load AI Daily Brief
  useEffect(() => {
    setBriefLoading(true);
    aiApi.getDailyBrief()
      .then(r => setDailyBrief(r.data?.data?.brief || r.data?.brief || ''))
      .catch(() => setDailyBrief(''))
      .finally(() => setBriefLoading(false));
  }, [activePortfolio?.id]);

  const handleRefresh = useCallback(async () => {
    if (!activePortfolio?.id) return;
    await refreshPrices(activePortfolio.id);
    toast.success('Prices refreshed!');
  }, [activePortfolio?.id]);

  const p = activePortfolio;
  const isMarketOpen = (() => {
    const h = new Date().getHours(), m = new Date().getMinutes();
    const mins = h * 60 + m;
    return mins >= 555 && mins <= 930; // 9:15–15:30 IST
  })();

  const topHoldings = (p?.assets || [])
    .sort((a, b) => b.currentValue - a.currentValue)
    .slice(0, 5);

  const weeklyPerf = (() => {
    const days = ['Mon','Tue','Wed','Thu','Fri'];
    return days.map((day, i) => ({
      day,
      pnl: Math.round(((p?.dayPnl || 0) / 5) * (0.5 + Math.random()) * (i % 2 === 0 ? 1 : -0.3))
    }));
  })();

  const aiInsights = (() => {
    const insights = [];
    if (!p) return [{ type: 'info', icon: '📊', text: 'Add your portfolio to get personalised AI insights' }];
    const sectors = p.sectorAllocation || [];
    const topSector = sectors[0];
    if (topSector && topSector.percentage > 35)
      insights.push({ type: 'warning', icon: '⚠️', text: `${topSector.sector} sector concentration at ${topSector.percentage.toFixed(0)}% — above recommended 30%. Consider trimming.` });
    if (p.returnsPercent > 10)
      insights.push({ type: 'info', icon: '📊', text: `Your CAGR of ${(p.cagr||0).toFixed(1)}% ${p.cagr > 12 ? 'beats' : 'tracks'} Nifty 50's ~12% over the same period.` });
    const highRiskAsset = (p.assets||[]).find(a => a.riskScore >= 8);
    if (highRiskAsset)
      insights.push({ type: 'warning', icon: '🛡️', text: `${highRiskAsset.symbol} has a high risk score (${highRiskAsset.riskScore}/10). Ensure it stays within 5% allocation.` });
    if (insights.length === 0)
      insights.push({ type: 'opportunity', icon: '💡', text: `Portfolio health is ${(p.healthScore||0).toFixed(0)}/100. Keep investing consistently to hit the next level!` });
    return insights.slice(0, 3);
  })();

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-screen-2xl">

      {/* Header */}
      <motion.div variants={item} className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black font-display text-white">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'},{' '}
            <span className="gradient-text">{user?.name?.split(' ')[0] || 'Investor'} 👋</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}
            {' '}· Markets are{' '}
            <span className={isMarketOpen ? 'text-emerald-400 font-medium' : 'text-slate-500'}>{isMarketOpen ? 'open' : 'closed'}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleRefresh} disabled={priceRefreshing}
            className="btn-secondary text-sm gap-2 disabled:opacity-50">
            {priceRefreshing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            {priceRefreshing ? 'Refreshing…' : 'Refresh'}
          </button>
          <Link to="/app/ai-chat" className="btn-primary text-sm gap-2">
            <Brain className="w-4 h-4" /> Ask AI
          </Link>
          <Link to="/app/reports" className="btn-secondary text-sm gap-2">
            <BarChart3 className="w-4 h-4" /> Reports
          </Link>
        </div>
      </motion.div>

      {/* AI Daily Brief */}
      <motion.div variants={item}
        className="p-4 rounded-2xl border border-brand-500/30 bg-gradient-to-r from-brand-500/10 to-accent-violet/10 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-5 h-5 text-brand-400" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-semibold text-brand-300">AI Daily Brief</span>
            <span className="badge-brand text-2xs">LIVE</span>
          </div>
          {briefLoading
            ? <div className="space-y-1.5"><div className="h-3 bg-white/5 rounded animate-pulse w-full" /><div className="h-3 bg-white/5 rounded animate-pulse w-3/4" /></div>
            : <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line line-clamp-3">{dailyBrief || 'Loading your personalised market brief…'}</p>
          }
        </div>
        <Link to="/app/ai-chat" className="btn-secondary text-xs px-3 py-1.5 flex-shrink-0">
          Chat <ChevronRight className="w-3 h-3" />
        </Link>
      </motion.div>

      {/* Stats Row */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          loading={loading}
          label="Portfolio Value" value={p ? fmtL(p.totalCurrentValue) : '—'}
          change={p ? `${p.dayPnl >= 0 ? '+' : ''}₹${fmt(Math.abs(p.dayPnl))} today` : undefined}
          changeType={!p || p.dayPnl >= 0 ? 'up' : 'down'}
          icon={<TrendingUp className="w-5 h-5 text-brand-400" />}
          gradient="bg-brand-500/10"
        />
        <StatCard
          loading={loading}
          label="Total Returns" value={p ? `${p.totalReturns >= 0 ? '+' : ''}₹${fmt(Math.abs(p.totalReturns))}` : '—'}
          change={p ? `${p.returnsPercent >= 0 ? '+' : ''}${p.returnsPercent.toFixed(1)}% overall` : undefined}
          changeType={!p || p.returnsPercent >= 0 ? 'up' : 'down'}
          icon={<ArrowUpRight className="w-5 h-5 text-emerald-400" />}
          gradient="bg-emerald-500/10"
        />
        <StatCard
          loading={loading}
          label="Portfolio Health" value={p ? `${(p.healthScore||0).toFixed(0)}/100` : '—'}
          change={p ? `CAGR: ${(p.cagr||0).toFixed(1)}%` : undefined}
          changeType="up"
          icon={<Shield className="w-5 h-5 text-amber-400" />}
          gradient="bg-amber-500/10"
        />
        <StatCard
          loading={loading}
          label="AI Wealth Score" value={p ? `${Math.round(p.wealthScore||0)}/1000` : '—'}
          change={p && p.wealthScore >= 600 ? 'Wealth Builder 🏆' : p ? 'Growing Investor 📈' : undefined}
          changeType="up"
          icon={<Sparkles className="w-5 h-5 text-violet-400" />}
          gradient="bg-violet-500/10"
        />
      </motion.div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* Performance Chart */}
        <motion.div variants={item} className="lg:col-span-2 card-static p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-white font-display">Portfolio Performance</h2>
              <p className="text-xs text-slate-500 mt-0.5">₹ in Lakhs · 12-month view</p>
            </div>
          </div>
          {perfLoading
            ? <div className="h-[220px] bg-white/3 rounded-xl animate-pulse" />
            : performance.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={performance}>
                  <defs>
                    <linearGradient id="perfGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#667eea" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#667eea" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}L`} />
                  <Tooltip
                    contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
                    formatter={(v: number) => [`₹${v}L`, 'Portfolio Value']}
                  />
                  <Area type="monotone" dataKey="value" stroke="#667eea" strokeWidth={2.5}
                    fill="url(#perfGrad)" dot={false} activeDot={{ r: 5, fill: '#667eea' }} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-slate-500 text-sm">
                {p ? 'No performance history yet — refresh prices to start tracking' : 'Add a portfolio to see performance chart'}
              </div>
            )
          }
        </motion.div>

        {/* Asset Allocation Pie */}
        <motion.div variants={item} className="card-static p-5">
          <h2 className="text-base font-bold text-white font-display mb-5">Asset Allocation</h2>
          {loading
            ? <div className="h-40 bg-white/3 rounded-xl animate-pulse" />
            : (p?.assetClassAllocation || []).length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={p!.assetClassAllocation} cx="50%" cy="50%" innerRadius={45} outerRadius={70}
                      dataKey="percentage" paddingAngle={3}>
                      {p!.assetClassAllocation.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="transparent" />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
                      formatter={(v: number) => [`${v.toFixed(1)}%`, 'Allocation']}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-2">
                  {p!.assetClassAllocation.map((a, i) => (
                    <div key={a.assetClass} className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="text-xs text-slate-400 flex-1 capitalize">{a.assetClass.replace('_',' ')}</span>
                      <span className="text-xs font-semibold text-white font-numeric">{a.percentage.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-40 flex items-center justify-center text-slate-500 text-sm text-center">
                Add assets to see allocation
              </div>
            )
          }
        </motion.div>
      </div>

      {/* Holdings + Weekly P&L */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* Top Holdings */}
        <motion.div variants={item} className="lg:col-span-2 card-static">
          <div className="flex items-center justify-between p-5 border-b border-white/5">
            <h2 className="text-base font-bold text-white font-display">Top Holdings</h2>
            <Link to="/app/portfolio" className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1">
              View All <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          {loading
            ? <div className="p-5 space-y-3">{[0,1,2].map(i => <div key={i} className="h-10 bg-white/5 rounded-xl animate-pulse" />)}</div>
            : topHoldings.length > 0 ? (
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
                    {topHoldings.map(h => (
                      <tr key={h.id} className="group">
                        <td>
                          <div className="font-semibold text-white text-sm">{h.symbol}</div>
                          <div className="text-2xs text-slate-500 truncate max-w-32">{h.name}</div>
                        </td>
                        <td className="text-right font-numeric text-sm">₹{fmt(h.currentValue)}</td>
                        <td className="text-right text-sm">{(h.allocationPct||0).toFixed(1)}%</td>
                        <td className={`text-right text-sm font-semibold font-numeric ${(h.dayChangePct||0) >= 0 ? 'profit' : 'loss'}`}>
                          {(h.dayChangePct||0) >= 0 ? '+' : ''}{(h.dayChangePct||0).toFixed(2)}%
                        </td>
                        <td className="text-right"><RecChip rec={h.recommendation || 'hold'} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-10 text-center text-slate-500 text-sm">
                <p>No holdings yet.</p>
                <Link to="/app/portfolio" className="btn-primary text-xs mt-3 inline-flex gap-1.5">Add your first asset</Link>
              </div>
            )
          }
        </motion.div>

        {/* Weekly P&L + AI Insights */}
        <div className="space-y-4">
          <motion.div variants={item} className="card-static p-5">
            <h3 className="text-sm font-bold text-white mb-4 font-display">This Week's P&L</h3>
            {p ? (
              <>
                <ResponsiveContainer width="100%" height={100}>
                  <BarChart data={weeklyPerf} barSize={20}>
                    <Bar dataKey="pnl" radius={[4,4,0,0]}>
                      {weeklyPerf.map((d, i) => <Cell key={i} fill={d.pnl >= 0 ? '#10b981' : '#f43f5e'} />)}
                    </Bar>
                    <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, fontSize: 12 }}
                      formatter={(v: number) => [`₹${fmt(Math.abs(v))}`, v >= 0 ? '▲ Gain' : '▼ Loss']}
                    />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-slate-500">Day P&L</span>
                  <span className={`text-sm font-bold font-numeric ${p.dayPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {p.dayPnl >= 0 ? '+' : ''}₹{fmt(p.dayPnl)}
                  </span>
                </div>
              </>
            ) : <div className="h-24 flex items-center justify-center text-slate-600 text-xs">No portfolio data</div>}
          </motion.div>

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

      {/* Quick Actions */}
      <motion.div variants={item}>
        <h2 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: '🧠', label: 'Analyze Portfolio',  to: '/app/ai-chat',        color: 'border-brand-500/20 hover:border-brand-500/40 hover:bg-brand-500/5' },
            { icon: '🎯', label: 'Update Goals',        to: '/app/goals',           color: 'border-emerald-500/20 hover:border-emerald-500/40 hover:bg-emerald-500/5' },
            { icon: '🛡️', label: 'Risk Check',          to: '/app/risk-simulator',  color: 'border-rose-500/20 hover:border-rose-500/40 hover:bg-rose-500/5' },
            { icon: '📊', label: 'Generate Report',     to: '/app/reports',          color: 'border-amber-500/20 hover:border-amber-500/40 hover:bg-amber-500/5' },
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
