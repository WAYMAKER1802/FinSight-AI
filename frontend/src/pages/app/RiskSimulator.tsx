import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, TrendingDown, Zap, RefreshCw, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { usePortfolioStore } from '@/store/portfolioStore';
import { aiApi } from '@/api/market.api';

const scenarios = [
  { name: '2008 Crisis', color: '#f43f5e' },
  { name: '2020 COVID', color: '#fb923c' },
  { name: '2016 Demonet.', color: '#f59e0b' },
  { name: 'IT Correction', color: '#eab308' },
  { name: 'Rate Hike +2%', color: '#84cc16' },
  { name: 'Mild Correction', color: '#10b981' },
];

export default function RiskSimulator() {
  const { activePortfolio, loading: portfolioLoading } = usePortfolioStore();
  const [selectedScenario, setSelectedScenario] = useState(scenarios[1]);
  
  const [simulation, setSimulation] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!activePortfolio?.id) return;
    
    let isMounted = true;
    const fetchSimulation = async () => {
      setLoading(true);
      try {
        const { data } = await aiApi.simulateCrash(activePortfolio.id, selectedScenario);
        if (isMounted) setSimulation(data.simulation);
      } catch (e) {
        console.error('Simulation failed', e);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    
    fetchSimulation();
    
    return () => { isMounted = false; };
  }, [activePortfolio?.id, selectedScenario.name]);

  if (portfolioLoading || !activePortfolio) {
    return (
      <div className="flex h-64 items-center justify-center space-x-2">
        <Loader2 className="h-6 w-6 animate-spin text-brand-400" />
        <span className="text-slate-400">Loading risk metrics...</span>
      </div>
    );
  }

  const p = activePortfolio;
  const portfolioValue = p.totalCurrentValue || 0;
  
  // Dynamic Risk Metrics
  const riskMetrics = [
    { label: 'Overall Risk Score', value: `${(p.riskScore || 5).toFixed(1)} / 10`, color: 'text-amber-400', bar: (p.riskScore || 5) * 10 },
    { label: 'Asset Count',        value: `${p.assets?.length || 0}`,              color: 'text-white',     bar: Math.min(100, (p.assets?.length || 0) * 10) },
    { label: 'Diversification',    value: `${(p.diversificationScore || 50).toFixed(1)}%`, color: 'text-amber-400', bar: p.diversificationScore || 50 },
    { label: 'Health Score',       value: `${(p.healthScore || 50).toFixed(0)} / 100`, color: 'text-emerald-400', bar: p.healthScore || 50 },
  ];

  // Dynamic Sector Risk
  const sectors = p.sectorAllocation || [];
  const riskBreakdown = sectors.map((s: any) => ({
    sector: s.sector,
    risk: s.percentage > 30 ? 8 : s.percentage > 15 ? 5 : 3,
    weight: s.percentage,
  }));

  const impactAmount = portfolioValue * ((simulation?.portfolioDrop || 0) / 100);

  return (
    <div className="space-y-6 max-w-screen-xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black font-display text-white">AI What-If Simulator</h1>
          <p className="text-slate-400 text-sm mt-0.5">Stress-test your live portfolio against historical crashes</p>
        </div>
        <div className={`text-sm px-3 py-1.5 rounded-full ${p.riskScore > 7 ? 'badge-loss' : p.riskScore > 4 ? 'badge-warn' : 'badge-profit'}`}>
          Risk Score: {(p.riskScore || 5).toFixed(1)} / 10
        </div>
      </div>

      {/* Scenario Selector */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {scenarios.map(s => (
          <button key={s.name} onClick={() => setSelectedScenario(s)} disabled={loading}
            className={`p-3 rounded-xl border text-left transition-all ${
              selectedScenario.name === s.name
                ? 'border-brand-500/50 bg-brand-500/10 scale-[1.02]'
                : 'border-white/10 bg-white/5 hover:border-white/20'
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <div className="text-xs font-semibold text-white mb-1">{s.name}</div>
            <div className="text-2xs text-slate-500">Select Scenario</div>
          </button>
        ))}
      </div>

      {/* Impact Display */}
      {loading ? (
        <div className="h-[250px] flex items-center justify-center p-6 rounded-2xl border-glow-red bg-rose-500/5">
          <Loader2 className="w-8 h-8 animate-spin text-rose-400" />
        </div>
      ) : simulation ? (
        <motion.div key={simulation.scenarioName} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
          className="p-6 rounded-2xl border-glow-red bg-rose-500/5">
          <div className="flex items-center gap-3 mb-5">
            <AlertTriangle className="w-6 h-6 text-rose-400" />
            <div>
              <h2 className="text-lg font-bold text-white font-display">{simulation.scenarioName} Scenario</h2>
              <p className="text-sm text-slate-400">If this crash happened to your portfolio today:</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Market Drop',    value: `${simulation.marketDrop}%`,     color: 'text-rose-400' },
              { label: 'Portfolio Drop', value: `${simulation.portfolioDrop}%`, color: 'text-rose-400' },
              { label: 'Value at Risk',  value: `₹${Math.abs(impactAmount / 100000).toFixed(1)}L`, color: 'text-rose-400' },
              { label: 'Recovery Time',  value: simulation.recoveryTime,        color: 'text-amber-400' },
            ].map(s => (
              <div key={s.label} className="text-center p-4 rounded-xl bg-white/5 shadow-inner">
                <div className={`text-2xl font-black font-display ${s.color}`}>{s.value}</div>
                <div className="text-xs text-slate-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-sm text-amber-300 flex items-start gap-3">
             <Zap className="w-5 h-5 flex-shrink-0 mt-0.5" />
             <p><strong>AI Insight:</strong> {simulation.insight}</p>
          </div>
        </motion.div>
      ) : null}

      {/* Risk Metrics + Breakdown */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Risk Metrics */}
        <div className="card-static p-5">
          <h3 className="text-sm font-bold text-white mb-4 font-display">Risk Metrics Dashboard</h3>
          <div className="space-y-4">
            {riskMetrics.map(m => (
              <div key={m.label}>
                <div className="flex justify-between text-xs mb-1.5">
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
          {riskBreakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={riskBreakdown} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                <XAxis type="number" domain={[0, 10]} tick={{ fill: '#64748b', fontSize: 10 }} />
                <YAxis type="category" dataKey="sector" tick={{ fill: '#94a3b8', fontSize: 11 }} width={80} />
                <Tooltip formatter={(v: number) => [`${v}/10`, 'Risk Score']}
                  contentStyle={{ background: 'rgba(15,23,42,0.95)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', fontSize: 12 }} />
                <Bar dataKey="risk" radius={[0, 4, 4, 0]}>
                  {riskBreakdown.map((d, i) => (
                    <Cell key={i} fill={d.risk >= 7 ? '#f43f5e' : d.risk >= 5 ? '#f59e0b' : '#10b981'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-slate-500 text-sm">
              Add assets to your portfolio to view sector risk.
            </div>
          )}
        </div>
      </div>
      
      {/* Individual Asset Impact Table */}
      {simulation?.assetImpacts?.length > 0 && (
        <div className="card-static">
          <div className="p-5 border-b border-white/5">
            <h3 className="text-sm font-bold text-white font-display">Simulated Impact by Asset</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Sector</th>
                  <th className="text-right">Current Value</th>
                  <th className="text-right">Simulated Drop</th>
                  <th className="text-right">Crash Value</th>
                </tr>
              </thead>
              <tbody>
                {simulation.assetImpacts.sort((a: any, b: any) => a.simulatedDropPct - b.simulatedDropPct).map((asset: any) => (
                  <tr key={asset.symbol}>
                    <td className="font-semibold text-white">{asset.symbol}</td>
                    <td className="text-slate-400 text-xs capitalize">{asset.sector.replace('_', ' ')}</td>
                    <td className="text-right font-numeric text-sm">₹{asset.currentValue.toLocaleString('en-IN')}</td>
                    <td className="text-right font-numeric text-sm font-bold text-rose-400">{asset.simulatedDropPct.toFixed(2)}%</td>
                    <td className="text-right font-numeric text-sm">₹{asset.simulatedValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
