import { useState } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Plus, Upload, TrendingUp, TrendingDown, Brain, Filter, Search, RefreshCw, Download, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

const assets = [
  { symbol: 'RELIANCE',  name: 'Reliance Industries',  type: 'stock',  qty: 25,   avgPrice: 2400,  cmp: 2780,  invested: 60000,  value: 69500,  pnl: 9500,  pnlPct: 15.8,  rec: 'HOLD', riskScore: 6, sector: 'Energy'  },
  { symbol: 'INFY',      name: 'Infosys Ltd.',         type: 'stock',  qty: 50,   avgPrice: 1450,  cmp: 1620,  invested: 72500,  value: 81000,  pnl: 8500,  pnlPct: 11.7,  rec: 'BUY',  riskScore: 5, sector: 'IT'      },
  { symbol: 'HDFCBANK',  name: 'HDFC Bank Ltd.',       type: 'stock',  qty: 40,   avgPrice: 1580,  cmp: 1720,  invested: 63200,  value: 68800,  pnl: 5600,  pnlPct: 8.9,   rec: 'BUY',  riskScore: 4, sector: 'Banking' },
  { symbol: 'TCS',       name: 'Tata Consultancy',     type: 'stock',  qty: 15,   avgPrice: 3400,  cmp: 3850,  invested: 51000,  value: 57750,  pnl: 6750,  pnlPct: 13.2,  rec: 'HOLD', riskScore: 4, sector: 'IT'      },
  { symbol: 'GOLDBEES',  name: 'Nippon Gold ETF',      type: 'etf',    qty: 200,  avgPrice: 45,    cmp: 52,    invested: 9000,   value: 10400,  pnl: 1400,  pnlPct: 15.6,  rec: 'HOLD', riskScore: 2, sector: 'Gold'    },
  { symbol: 'PPFUS',     name: 'PPF Account',          type: 'ppf',    qty: 1,    avgPrice: 50000, cmp: 58000, invested: 50000,  value: 58000,  pnl: 8000,  pnlPct: 16.0,  rec: 'HOLD', riskScore: 1, sector: 'Fixed'   },
  { symbol: 'BTCUSDT',   name: 'Bitcoin',              type: 'crypto', qty: 0.05, avgPrice: 1200000, cmp: 1400000, invested: 60000, value: 70000, pnl: 10000, pnlPct: 16.7, rec: 'SELL', riskScore: 9, sector: 'Crypto'  },
];

const recColors: Record<string, string> = {
  'BUY'        : 'chip-buy',
  'STRONG BUY' : 'chip-strong-buy',
  'HOLD'       : 'chip-hold',
  'SELL'       : 'chip-sell',
  'STRONG SELL': 'chip-strong-sell',
};

const typeColors: Record<string, string> = {
  stock   : 'bg-brand-500/15 text-brand-400',
  etf     : 'bg-cyan-500/15 text-cyan-400',
  ppf     : 'bg-emerald-500/15 text-emerald-400',
  crypto  : 'bg-amber-500/15 text-amber-400',
  mutual_fund: 'bg-violet-500/15 text-violet-400',
};

const allocationData = assets.map(a => ({ name: a.symbol, value: a.value }));
const COLORS = ['#667eea','#10b981','#f59e0b','#06b6d4','#8b5cf6','#f43f5e','#ec4899'];

export default function Portfolio() {
  const [search,    setSearch]    = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy,    setSortBy]    = useState<'value' | 'pnlPct' | 'riskScore'>('value');
  const [showAdd,   setShowAdd]   = useState(false);

  const totalInvested = assets.reduce((s, a) => s + a.invested, 0);
  const totalValue    = assets.reduce((s, a) => s + a.value, 0);
  const totalPnL      = totalValue - totalInvested;
  const totalPct      = (totalPnL / totalInvested) * 100;

  const filtered = assets
    .filter(a => a.symbol.toLowerCase().includes(search.toLowerCase()) || a.name.toLowerCase().includes(search.toLowerCase()))
    .filter(a => typeFilter === 'all' || a.type === typeFilter)
    .sort((x, y) => y[sortBy] - x[sortBy]);

  return (
    <div className="space-y-6 max-w-screen-2xl">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black font-display text-white">My Portfolio</h1>
          <p className="text-slate-400 text-sm mt-0.5">Growth Portfolio · Last updated just now</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary text-sm gap-2"><Upload className="w-4 h-4" /> Import CSV</button>
          <button onClick={() => setShowAdd(true)} className="btn-primary text-sm gap-2">
            <Plus className="w-4 h-4" /> Add Asset
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Invested', value: `₹${(totalInvested/100000).toFixed(1)}L` },
          { label: 'Current Value',  value: `₹${(totalValue/100000).toFixed(2)}L`, highlight: true },
          { label: 'Total P&L',      value: `+₹${(totalPnL/100000).toFixed(2)}L`, profit: totalPnL > 0 },
          { label: 'Overall Return', value: `+${totalPct.toFixed(1)}%`, profit: totalPct > 0 },
        ].map((c, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="stat-card">
            <p className="stat-label">{c.label}</p>
            <p className={`text-2xl font-bold font-display mt-1 ${c.profit !== undefined ? (c.profit ? 'text-emerald-400' : 'text-rose-400') : 'text-white'}`}>
              {c.value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-4 gap-6">

        {/* Allocation Chart */}
        <div className="card-static p-5">
          <h3 className="text-sm font-bold text-white mb-4 font-display">Allocation</h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={allocationData} cx="50%" cy="50%" innerRadius={40} outerRadius={65}
                dataKey="value" paddingAngle={2}>
                {allocationData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => [`₹${v.toLocaleString('en-IN')}`, 'Value']}
                contentStyle={{ background: 'rgba(15,23,42,0.95)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {allocationData.map((a, i) => (
              <div key={a.name} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                <span className="text-2xs text-slate-400 flex-1">{a.name}</span>
                <span className="text-2xs font-numeric font-semibold text-white">{((a.value / totalValue) * 100).toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Holdings Table */}
        <div className="lg:col-span-3 card-static">
          {/* Table Controls */}
          <div className="flex flex-wrap items-center gap-3 p-4 border-b border-white/5">
            {/* Search */}
            <div className="relative flex-1 min-w-40">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search..." className="input pl-9 py-2 text-xs" />
            </div>

            {/* Type filter */}
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
              className="input py-2 text-xs w-auto">
              <option value="all">All Types</option>
              <option value="stock">Stocks</option>
              <option value="etf">ETFs</option>
              <option value="mutual_fund">Mutual Funds</option>
              <option value="crypto">Crypto</option>
              <option value="ppf">PPF</option>
            </select>

            {/* Sort */}
            <select value={sortBy} onChange={e => setSortBy(e.target.value as any)}
              className="input py-2 text-xs w-auto">
              <option value="value">Sort: Value</option>
              <option value="pnlPct">Sort: Returns</option>
              <option value="riskScore">Sort: Risk</option>
            </select>

            <button className="btn-secondary text-xs gap-1.5 py-2"><Download className="w-3.5 h-3.5" /> Export</button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="data-table min-w-[700px]">
              <thead>
                <tr>
                  <th>Asset</th>
                  <th className="text-right">Qty</th>
                  <th className="text-right">Avg / CMP</th>
                  <th className="text-right">Invested</th>
                  <th className="text-right">Value</th>
                  <th className="text-right">P&L</th>
                  <th className="text-right">Risk</th>
                  <th className="text-right">Signal</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => (
                  <motion.tr key={a.symbol} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-brand-400">
                          {a.symbol.slice(0, 2)}
                        </div>
                        <div>
                          <div className="font-semibold text-white text-sm">{a.symbol}</div>
                          <span className={`text-2xs px-1.5 py-0.5 rounded-full ${typeColors[a.type] || 'bg-white/10 text-slate-400'}`}>
                            {a.type.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="text-right font-numeric text-sm">{a.qty}</td>
                    <td className="text-right">
                      <div className="text-xs text-slate-400">₹{a.avgPrice.toLocaleString('en-IN')}</div>
                      <div className="text-xs font-semibold text-white">₹{a.cmp.toLocaleString('en-IN')}</div>
                    </td>
                    <td className="text-right font-numeric text-sm">₹{a.invested.toLocaleString('en-IN')}</td>
                    <td className="text-right font-numeric font-semibold text-sm">₹{a.value.toLocaleString('en-IN')}</td>
                    <td className="text-right">
                      <div className={`text-sm font-bold font-numeric ${a.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {a.pnl >= 0 ? '+' : ''}₹{a.pnl.toLocaleString('en-IN')}
                      </div>
                      <div className={`text-2xs ${a.pnlPct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {a.pnlPct >= 0 ? '+' : ''}{a.pnlPct.toFixed(1)}%
                      </div>
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <div className="progress-bar w-12 h-1.5">
                          <div className="progress-fill h-full rounded-full" style={{
                            width: `${a.riskScore * 10}%`,
                            background: a.riskScore <= 3 ? '#10b981' : a.riskScore <= 6 ? '#f59e0b' : '#f43f5e'
                          }} />
                        </div>
                        <span className="text-xs font-numeric">{a.riskScore}</span>
                      </div>
                    </td>
                    <td className="text-right">
                      <span className={recColors[a.rec] || 'chip-hold'}>{a.rec}</span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
            <span className="text-xs text-slate-500">{filtered.length} assets</span>
            <Link to="/app/ai-chat" className="btn-primary text-xs gap-1.5 py-2">
              <Brain className="w-3.5 h-3.5" /> AI Analysis
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
