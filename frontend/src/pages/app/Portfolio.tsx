import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import {
  Plus, Upload, Brain, Search, RefreshCw, Download, Loader2,
  Trash2, Edit2, X, Check, TrendingUp, TrendingDown, AlertTriangle, FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePortfolioStore, type Asset } from '@/store/portfolioStore';
import { aiApi } from '@/api/market.api';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const COLORS = ['#667eea','#10b981','#f59e0b','#06b6d4','#8b5cf6','#f43f5e','#ec4899'];

const recColors: Record<string, string> = {
  strong_buy: 'chip-strong-buy', buy: 'chip-buy', hold: 'chip-hold',
  sell: 'chip-sell', strong_sell: 'chip-strong-sell',
  BUY: 'chip-buy', HOLD: 'chip-hold', SELL: 'chip-sell',
  'STRONG BUY': 'chip-strong-buy', 'STRONG SELL': 'chip-strong-sell',
};
const typeColors: Record<string, string> = {
  stock: 'bg-brand-500/15 text-brand-400', etf: 'bg-cyan-500/15 text-cyan-400',
  ppf: 'bg-emerald-500/15 text-emerald-400', crypto: 'bg-amber-500/15 text-amber-400',
  mutual_fund: 'bg-violet-500/15 text-violet-400', gold: 'bg-yellow-500/15 text-yellow-400',
  fd: 'bg-blue-500/15 text-blue-400', bond: 'bg-slate-500/15 text-slate-400',
};

const fmt   = (n: number) => (n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });
const fmtL  = (n: number) => `₹${((n || 0) / 100000).toFixed(2)}L`;

// ── Add Asset Modal ─────────────────────────────────────────────────────────
function AddAssetModal({ portfolioId, onClose, onAdd }: { portfolioId: number; onClose: () => void; onAdd: () => void }) {
  const { addAsset } = usePortfolioStore();
  const [form, setForm] = useState({
    symbol: '', name: '', type: 'stock', quantity: '', avgBuyPrice: '', sector: '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.symbol || !form.quantity || !form.avgBuyPrice) {
      toast.error('Symbol, Quantity, and Buy Price are required'); return;
    }
    setSaving(true);
    try {
      await addAsset(portfolioId, {
        symbol     : form.symbol.toUpperCase().trim(),
        name       : form.name || form.symbol.toUpperCase(),
        type       : form.type,
        quantity   : parseFloat(form.quantity),
        avgBuyPrice: parseFloat(form.avgBuyPrice),
        sector     : form.sector || 'Unknown',
      });
      toast.success(`${form.symbol.toUpperCase()} added!`);
      onAdd();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add asset');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        className="card-static p-6 w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X className="w-5 h-5" /></button>
        <h2 className="text-lg font-bold text-white font-display mb-5">Add Asset</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Symbol *</label>
              <input value={form.symbol} onChange={e => setForm(s => ({ ...s, symbol: e.target.value.toUpperCase() }))}
                placeholder="RELIANCE" className="input w-full uppercase" required />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Name</label>
              <input value={form.name} onChange={e => setForm(s => ({ ...s, name: e.target.value }))}
                placeholder="Reliance Industries" className="input w-full" />
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Asset Type *</label>
            <select value={form.type} onChange={e => setForm(s => ({ ...s, type: e.target.value }))} className="input w-full">
              {['stock','mutual_fund','etf','crypto','gold','bond','fd','ppf','real_estate','other'].map(t => (
                <option key={t} value={t}>{t.replace('_',' ').toUpperCase()}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Quantity *</label>
              <input type="number" step="any" min="0" value={form.quantity}
                onChange={e => setForm(s => ({ ...s, quantity: e.target.value }))}
                placeholder="10" className="input w-full" required />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Avg Buy Price (₹) *</label>
              <input type="number" step="any" min="0" value={form.avgBuyPrice}
                onChange={e => setForm(s => ({ ...s, avgBuyPrice: e.target.value }))}
                placeholder="2400" className="input w-full" required />
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Sector</label>
            <select value={form.sector} onChange={e => setForm(s => ({ ...s, sector: e.target.value }))} className="input w-full">
              {['Unknown','IT','Banking','Energy','Pharma','FMCG','Auto','Infrastructure','Real Estate','Gold','Crypto','Fixed Income','Others'].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          {form.quantity && form.avgBuyPrice && (
            <div className="p-3 rounded-xl bg-white/5 text-xs text-slate-400">
              Invested: <span className="text-white font-semibold">₹{fmt(parseFloat(form.quantity||'0') * parseFloat(form.avgBuyPrice||'0'))}</span>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {saving ? 'Adding…' : 'Add Asset'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ── Connect Broker Modal ────────────────────────────────────────────────────────
function ConnectBrokerModal({ onClose }: { onClose: () => void }) {
  const [connecting, setConnecting] = useState<string | null>(null);

  const handleConnect = (brokerName: string) => {
    setConnecting(brokerName);
    // Simulate connection delay then success
    setTimeout(() => {
      toast.success(`Successfully connected to ${brokerName}!`);
      setConnecting(null);
      onClose();
    }, 2000);
  };

  const brokers = [
    { name: 'Zerodha', icon: ' Kite', color: '#387ed1' },
    { name: 'Groww', icon: ' Groww', color: '#00d09c' },
    { name: 'Upstox', icon: ' Upstox', color: '#441476' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        className="card-static p-6 w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X className="w-5 h-5" /></button>
        <h2 className="text-xl font-bold text-white font-display mb-2">Connect Broker</h2>
        <p className="text-sm text-slate-400 mb-6">Import your entire portfolio in one click.</p>
        
        <div className="space-y-3 mb-6">
          {brokers.map((broker) => (
            <button key={broker.name} onClick={() => handleConnect(broker.name)} disabled={connecting !== null}
              className="w-full flex items-center justify-between p-4 rounded-xl border border-white/10 hover:border-white/20 transition-all bg-white/5 disabled:opacity-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold" style={{ backgroundColor: broker.color }}>
                  {broker.name[0]}
                </div>
                <div className="text-left">
                  <div className="text-sm font-bold text-white">{broker.name}</div>
                  <div className="text-xs text-slate-500">Auto-sync holdings & trades</div>
                </div>
              </div>
              {connecting === broker.name ? <Loader2 className="w-5 h-5 text-slate-400 animate-spin" /> : <TrendingUp className="w-5 h-5 text-slate-400" />}
            </button>
          ))}
        </div>

        <div className="text-center text-xs text-slate-500">
          Or <label className="text-brand-400 hover:underline cursor-pointer">upload a CSV file manually
            <input type="file" className="hidden" />
          </label>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Create Portfolio Modal ───────────────────────────────────────────────────
function CreatePortfolioModal({ onClose, onCreate }: { onClose: () => void; onCreate: () => void }) {
  const { createPortfolio } = usePortfolioStore();
  const [name, setName] = useState('My Portfolio');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createPortfolio({ name });
      toast.success('Portfolio created!');
      onCreate();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create portfolio');
    } finally { setSaving(false); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="card-static p-6 w-full max-w-sm relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X className="w-5 h-5" /></button>
        <h2 className="text-lg font-bold text-white font-display mb-5">Create Portfolio</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Portfolio Name</label>
            <input value={name} onChange={e => setName(e.target.value)} className="input w-full" required />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? 'Creating…' : 'Create'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ── Main Portfolio Page ──────────────────────────────────────────────────────
export default function Portfolio() {
  const {
    portfolios, activePortfolio, loading, priceRefreshing,
    fetchPortfolios, removeAsset, refreshPrices, importAssets, setActivePortfolio
  } = usePortfolioStore();

  const [search,     setSearch]     = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy,     setSortBy]     = useState<'currentValue'|'percentageReturn'|'riskScore'>('currentValue');
  const [showAdd,    setShowAdd]    = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showConnect,setShowConnect]= useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchPortfolios(); }, []);
  useEffect(() => {
    if (activePortfolio?.id && !priceRefreshing) {
      refreshPrices(activePortfolio.id).catch(() => {});
    }
  }, [activePortfolio?.id]);

  const p = activePortfolio;
  const assets = (p?.assets || [])
    .filter(a => (a.symbol.toLowerCase().includes(search.toLowerCase()) || a.name.toLowerCase().includes(search.toLowerCase())))
    .filter(a => typeFilter === 'all' || a.type === typeFilter)
    .sort((x: any, y: any) => (y[sortBy] || 0) - (x[sortBy] || 0));

  const handleRefresh = async () => {
    if (!p?.id) return;
    await refreshPrices(p.id);
    toast.success('Prices refreshed!');
  };

  const handleDelete = async (assetId: number) => {
    if (!p?.id) return;
    setDeletingId(assetId);
    try {
      await removeAsset(p.id, assetId);
      toast.success('Asset removed');
    } catch {
      toast.error('Failed to remove asset');
    } finally { setDeletingId(null); }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !p?.id) return;
    try {
      const result = await importAssets(p.id, file);
      toast.success(`${result.imported} assets imported!`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Import failed');
    }
    e.target.value = '';
  };

  const handleDownloadPDF = () => {
    if (!p?.assets?.length) return;
    
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(30, 64, 175); // Brand color
    doc.text('InvestIQ AI - Portfolio Intelligence Report', 14, 20);
    
    doc.setFontSize(12);
    doc.setTextColor(100, 116, 139); // Slate-500
    doc.text(`Portfolio: ${p.name}`, 14, 30);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 36);

    // Summary Section
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Executive Summary', 14, 50);
    
    doc.setFontSize(10);
    doc.text(`Total Invested: Rs ${fmt(p.totalInvested)}`, 14, 58);
    doc.text(`Current Value: Rs ${fmt(p.totalCurrentValue)}`, 14, 64);
    doc.text(`Total P&L: Rs ${fmt(p.totalReturns)} (${(p.returnsPercent||0).toFixed(2)}%)`, 14, 70);
    doc.text(`AI Risk Score: ${(p.riskScore||5).toFixed(1)}/10`, 14, 76);

    // Table
    const tableColumn = ["Symbol", "Type", "Qty", "Avg Price", "Current Price", "Value", "P&L", "AI Verdict"];
    const tableRows = p.assets.map(a => [
      a.symbol,
      a.type.replace('_',' '),
      a.quantity.toString(),
      `Rs ${fmt(a.avgBuyPrice)}`,
      `Rs ${fmt(a.currentPrice)}`,
      `Rs ${fmt(a.currentValue)}`,
      `${a.absoluteReturn >= 0 ? '+' : ''}Rs ${fmt(a.absoluteReturn)}`,
      a.recommendation.toUpperCase()
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 85,
      theme: 'grid',
      headStyles: { fillColor: [30, 64, 175] },
      styles: { fontSize: 8 },
    });

    doc.save(`${p.name}_InvestIQ_Report.pdf`);
    toast.success('AI Report Downloaded!');
  };

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto pb-10">
      
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black font-display text-white flex items-center gap-2">
            <PieChart className="w-6 h-6 text-brand-400" /> Holdings
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">Track and analyze your investments.</p>
        </div>
        <div className="flex gap-2">
          <input type="file" ref={fileRef} accept=".csv,.xlsx,.xls" className="hidden" onChange={handleImport} />
          {p && <>
            <button onClick={() => setShowConnect(true)} className="btn-secondary text-sm gap-2"><Upload className="w-4 h-4" /> Connect Broker</button>
            <button onClick={handleRefresh} disabled={priceRefreshing} className="btn-secondary text-sm gap-2 disabled:opacity-50">
              {priceRefreshing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Refresh
            </button>
            <button onClick={() => setShowAdd(true)} className="btn-primary text-sm gap-2">
              <Plus className="w-4 h-4" /> Add Asset
            </button>
          </>}
          {!p && (
            <button onClick={() => setShowCreate(true)} className="btn-primary text-sm gap-2">
              <Plus className="w-4 h-4" /> Create Portfolio
            </button>
          )}
        </div>
      </div>

      {/* Portfolio Switcher */}
      {portfolios.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {portfolios.map(port => (
            <button key={port.id}
              onClick={() => setActivePortfolio(port.id)}
              className={`text-xs px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                port.id === p?.id ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30' : 'text-slate-500 hover:text-white border border-white/10'
              }`}>
              {port.name}
            </button>
          ))}
        </div>
      )}

      {/* No Portfolio State */}
      {!loading && portfolios.length === 0 && (
        <div className="card-static p-12 text-center">
          <div className="text-5xl mb-4">📊</div>
          <h3 className="text-xl font-bold text-white mb-2">Create Your First Portfolio</h3>
          <p className="text-slate-400 text-sm mb-6">Start tracking your investments with real-time prices and AI insights.</p>
          <button onClick={() => setShowCreate(true)} className="btn-primary gap-2">
            <Plus className="w-4 h-4" /> Create Portfolio
          </button>
        </div>
      )}

      {p && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Invested',  value: fmtL(p.totalInvested) },
              { label: 'Current Value',   value: fmtL(p.totalCurrentValue), highlight: true },
              { label: 'Total P&L',       value: `${p.totalReturns >= 0 ? '+' : ''}${fmtL(p.totalReturns)}`, profit: p.totalReturns >= 0 },
              { label: 'Overall Return',  value: `${p.returnsPercent >= 0 ? '+' : ''}${(p.returnsPercent||0).toFixed(1)}%`, profit: p.returnsPercent >= 0 },
            ].map((c, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                className="stat-card">
                <p className="stat-label">{c.label}</p>
                {loading
                  ? <div className="h-8 bg-white/5 rounded-lg mt-1 animate-pulse" />
                  : <p className={`text-2xl font-bold font-display mt-1 ${c.profit !== undefined ? (c.profit ? 'text-emerald-400' : 'text-rose-400') : 'text-white'}`}>
                      {c.value}
                    </p>
                }
              </motion.div>
            ))}
          </div>

          {/* Advanced Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {[
              { label: 'CAGR',          value: `${(p.cagr||0).toFixed(1)}%` },
              { label: 'Sharpe Ratio',  value: (p.sharpeRatio||0).toFixed(2) },
              { label: 'Diversification',value: `${(p.diversificationScore||0).toFixed(0)}/100` },
              { label: 'Health Score',  value: `${(p.healthScore||0).toFixed(0)}/100` },
              { label: 'Risk Score',    value: `${(p.riskScore||5).toFixed(1)}/10` },
              { label: 'Wealth Score',  value: `${Math.round(p.wealthScore||0)}/1000` },
            ].map((m, i) => (
              <div key={i} className="stat-card py-3 px-4">
                <p className="stat-label text-2xs">{m.label}</p>
                <p className="text-lg font-bold text-white font-numeric mt-0.5">{m.value}</p>
              </div>
            ))}
          </div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Allocation Chart */}
            <div className="card-static p-5">
              <h3 className="text-sm font-bold text-white mb-4 font-display">Allocation</h3>
              {(p.assets || []).length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={p.assets.map(a => ({ name: a.symbol, value: a.currentValue }))}
                        cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" paddingAngle={2}>
                        {p.assets.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="transparent" />)}
                      </Pie>
                      <Tooltip formatter={(v: number) => [`₹${fmt(v)}`, 'Value']}
                        contentStyle={{ background: 'rgba(15,23,42,0.95)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-1.5 mt-2">
                    {p.assets.slice(0,7).map((a, i) => (
                      <div key={a.id} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                        <span className="text-2xs text-slate-400 flex-1">{a.symbol}</span>
                        <span className="text-2xs font-numeric font-semibold text-white">{(a.allocationPct||0).toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="h-40 flex items-center justify-center text-slate-600 text-xs">No assets</div>
              )}
            </div>

            {/* Holdings Table */}
            <div className="lg:col-span-3 card-static">
              {/* Controls */}
              <div className="flex flex-wrap items-center gap-3 p-4 border-b border-white/5">
                <div className="relative flex-1 min-w-40">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                  <input value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search…" className="input pl-9 py-2 text-xs" />
                </div>
                <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="input py-2 text-xs w-auto">
                  <option value="all">All Types</option>
                  {['stock','etf','mutual_fund','crypto','gold','ppf','fd','bond'].map(t => (
                    <option key={t} value={t}>{t.replace('_',' ').toUpperCase()}</option>
                  ))}
                </select>
                <select value={sortBy} onChange={e => setSortBy(e.target.value as any)} className="input py-2 text-xs w-auto">
                  <option value="currentValue">Sort: Value</option>
                  <option value="percentageReturn">Sort: Returns</option>
                  <option value="riskScore">Sort: Risk</option>
                </select>
                <button onClick={handleDownloadPDF} className="btn-primary text-xs gap-1.5 py-2">
                  <FileText className="w-3.5 h-3.5" /> Download AI Report
                </button>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="data-table min-w-[720px]">
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
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assets.map(a => (
                      <motion.tr key={a.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <td>
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-brand-400">
                              {a.symbol.slice(0,2)}
                            </div>
                            <div>
                              <div className="font-semibold text-white text-sm">{a.symbol}</div>
                              <span className={`text-2xs px-1.5 py-0.5 rounded-full ${typeColors[a.type] || 'bg-white/10 text-slate-400'}`}>
                                {a.type.replace('_',' ')}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="text-right font-numeric text-sm">{a.quantity}</td>
                        <td className="text-right">
                          <div className="text-xs text-slate-400">₹{fmt(a.avgBuyPrice)}</div>
                          <div className="text-xs font-semibold text-white">₹{fmt(a.currentPrice)}</div>
                          {(a.dayChangePct || 0) !== 0 && (
                            <div className={`text-2xs ${(a.dayChangePct||0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {(a.dayChangePct||0) >= 0 ? '▲' : '▼'} {Math.abs(a.dayChangePct||0).toFixed(2)}%
                            </div>
                          )}
                        </td>
                        <td className="text-right font-numeric text-sm">₹{fmt(a.investedAmount)}</td>
                        <td className="text-right font-numeric font-semibold text-sm">₹{fmt(a.currentValue)}</td>
                        <td className="text-right">
                          <div className={`text-sm font-bold font-numeric ${(a.absoluteReturn||0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {(a.absoluteReturn||0) >= 0 ? '+' : ''}₹{fmt(Math.abs(a.absoluteReturn||0))}
                          </div>
                          <div className={`text-2xs ${(a.percentageReturn||0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {(a.percentageReturn||0) >= 0 ? '+' : ''}{(a.percentageReturn||0).toFixed(1)}%
                          </div>
                        </td>
                        <td className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <div className="progress-bar w-12 h-1.5">
                              <div className="progress-fill h-full rounded-full" style={{
                                width: `${(a.riskScore||5) * 10}%`,
                                background: (a.riskScore||5) <= 3 ? '#10b981' : (a.riskScore||5) <= 6 ? '#f59e0b' : '#f43f5e'
                              }} />
                            </div>
                            <span className="text-xs font-numeric">{(a.riskScore||5).toFixed(0)}</span>
                          </div>
                        </td>
                        <td className="text-right">
                          <span className={recColors[a.recommendation] || 'chip-hold'}>
                            {(a.recommendation||'hold').replace('_',' ').toUpperCase()}
                          </span>
                        </td>
                        <td className="text-right">
                          <button onClick={() => handleDelete(a.id)} disabled={deletingId === a.id}
                            className="text-slate-500 hover:text-rose-400 transition-colors ml-2">
                            {deletingId === a.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
                {assets.length === 0 && (
                  <div className="p-10 text-center text-slate-500 text-sm">
                    {(p.assets||[]).length === 0
                      ? 'No assets yet — click "Add Asset" to get started!'
                      : 'No assets match your filter.'}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
                <span className="text-xs text-slate-500">{assets.length} asset{assets.length !== 1 ? 's' : ''}</span>
                <Link to="/app/ai-chat" className="btn-primary text-xs gap-1.5 py-2">
                  <Brain className="w-3.5 h-3.5" /> AI Analysis
                </Link>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modals */}
      <AnimatePresence>
        {showAdd && p && <AddAssetModal portfolioId={p.id} onClose={() => setShowAdd(false)} onAdd={fetchPortfolios} />}
        {showCreate && <CreatePortfolioModal onClose={() => setShowCreate(false)} onCreate={fetchPortfolios} />}
        {showConnect && <ConnectBrokerModal onClose={() => setShowConnect(false)} />}
      </AnimatePresence>
    </div>
  );
}
