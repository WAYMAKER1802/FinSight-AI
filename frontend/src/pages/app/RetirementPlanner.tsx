import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sunset, Calculator, Target, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export default function RetirementPlanner() {
  const [currentAge,  setCurrentAge]  = useState(30);
  const [retireAge,   setRetireAge]   = useState(55);
  const [monthlyExp,  setMonthlyExp]  = useState(80000);
  const [inflation,   setInflation]   = useState(6);
  const [returnRate,  setReturnRate]  = useState(12);
  const [monthlySIP,  setMonthlySIP]  = useState(25000);
  const [currentCorpus, setCurrentCorpus] = useState(3450000);

  const yearsToRetire  = Math.max(0, retireAge - currentAge);
  const lifeExpectancy = 85;
  const yearsInRetire  = lifeExpectancy - retireAge;

  const inflatedMonthlyExp = monthlyExp * Math.pow(1 + inflation / 100, yearsToRetire);
  const realReturn    = (returnRate - inflation) / 100 / 12;
  const n             = yearsInRetire * 12;
  const corpusNeeded  = realReturn > 0
    ? inflatedMonthlyExp * ((1 - Math.pow(1 + realReturn, -n)) / realReturn)
    : inflatedMonthlyExp * n;

  const r  = returnRate / 100 / 12;
  const ns = yearsToRetire * 12;
  const futureSIP = monthlySIP * (((Math.pow(1 + r, ns) - 1) / r) * (1 + r));
  const futureCorpus = currentCorpus * Math.pow(1 + returnRate / 100, yearsToRetire) + futureSIP;
  const gap = corpusNeeded - futureCorpus;

  // Projection data
  const projectionData = Array.from({ length: yearsToRetire + 1 }, (_, i) => ({
    year   : currentAge + i,
    corpus : Math.round(currentCorpus * Math.pow(1 + returnRate / 100, i) +
      monthlySIP * 12 * (Math.pow(1 + returnRate / 100, i) - 1) / (returnRate / 100)),
    target : Math.round(corpusNeeded * (i / yearsToRetire)),
  }));

  const isOnTrack = gap <= 0;

  return (
    <div className="space-y-6 max-w-screen-xl">
      <div>
        <h1 className="text-2xl font-black font-display text-white">Retirement Planner</h1>
        <p className="text-slate-400 text-sm mt-0.5">AI-powered retirement corpus calculator</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Inputs */}
        <div className="card-static p-5 space-y-4">
          <h3 className="text-sm font-bold text-white font-display">Your Details</h3>
          {[
            { label: 'Current Age (yrs)',     value: currentAge,    setter: setCurrentAge,    min: 18, max: 60, step: 1 },
            { label: 'Retirement Age (yrs)',  value: retireAge,     setter: setRetireAge,     min: 40, max: 70, step: 1 },
            { label: 'Monthly Expenses (₹)',  value: monthlyExp,    setter: setMonthlyExp,    min: 20000, max: 500000, step: 5000 },
            { label: 'Expected Inflation (%)', value: inflation,    setter: setInflation,     min: 3, max: 12, step: 0.5 },
            { label: 'Expected Return (%)',   value: returnRate,    setter: setReturnRate,    min: 6, max: 20, step: 0.5 },
            { label: 'Monthly SIP (₹)',       value: monthlySIP,    setter: setMonthlySIP,    min: 1000, max: 500000, step: 1000 },
            { label: 'Current Corpus (₹)',    value: currentCorpus, setter: setCurrentCorpus, min: 0, max: 50000000, step: 50000 },
          ].map(f => (
            <div key={f.label}>
              <div className="flex justify-between text-xs mb-1">
                <label className="text-slate-400">{f.label}</label>
                <span className="font-semibold text-white font-numeric">
                  {f.label.includes('₹') ? `₹${f.value.toLocaleString('en-IN')}` :
                   f.label.includes('%') ? `${f.value}%` : `${f.value}`}
                </span>
              </div>
              <input type="range" min={f.min} max={f.max} step={f.step} value={f.value}
                onChange={e => f.setter(Number(e.target.value))} className="w-full" style={{ accentColor: '#667eea' }} />
            </div>
          ))}
        </div>

        {/* Results */}
        <div className="space-y-4">
          {/* Key Results */}
          {[
            { label: 'Corpus Required',   value: `₹${(corpusNeeded / 10000000).toFixed(2)} Cr`, icon: '🎯', color: 'text-white' },
            { label: 'Projected Corpus',  value: `₹${(futureCorpus / 10000000).toFixed(2)} Cr`, icon: '📈', color: 'text-emerald-400' },
            { label: gap > 0 ? 'Corpus Shortfall' : 'Surplus', value: `₹${(Math.abs(gap) / 10000000).toFixed(2)} Cr`, icon: gap > 0 ? '⚠️' : '🎉', color: gap > 0 ? 'text-rose-400' : 'text-emerald-400' },
            { label: 'Monthly Expense at Retirement', value: `₹${Math.round(inflatedMonthlyExp).toLocaleString('en-IN')}`, icon: '💸', color: 'text-amber-400' },
          ].map(r => (
            <div key={r.label} className="stat-card">
              <div className="flex items-center gap-2 mb-1">
                <span>{r.icon}</span>
                <p className="stat-label">{r.label}</p>
              </div>
              <p className={`text-2xl font-black font-display font-numeric ${r.color}`}>{r.value}</p>
            </div>
          ))}

          {/* Status */}
          <div className={`p-4 rounded-xl border ${isOnTrack ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-rose-500/30 bg-rose-500/10'}`}>
            <div className={`text-sm font-bold mb-1 ${isOnTrack ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isOnTrack ? '✅ You\'re on track!' : '⚠️ Action Needed'}
            </div>
            <p className="text-xs text-slate-400">
              {isOnTrack
                ? `Your current SIP of ₹${monthlySIP.toLocaleString('en-IN')}/month will build a surplus of ₹${(Math.abs(gap) / 100000).toFixed(0)}L over your corpus requirement.`
                : `Increase your SIP by ₹${Math.round(gap * (r / 100) / (Math.pow(1 + returnRate / 100 / 12, ns) - 1)).toLocaleString('en-IN')}/month to close the gap.`
              }
            </p>
          </div>
        </div>

        {/* Chart */}
        <div className="card-static p-5">
          <h3 className="text-sm font-bold text-white mb-4 font-display">Corpus Growth Projection</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={projectionData}>
              <defs>
                <linearGradient id="corpusGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#667eea" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#667eea" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="year" tick={{ fill: '#64748b', fontSize: 10 }} />
              <YAxis tickFormatter={v => `₹${(v / 10000000).toFixed(0)}Cr`} tick={{ fill: '#64748b', fontSize: 10 }} />
              <Tooltip formatter={(v: number) => [`₹${(v / 10000000).toFixed(2)} Cr`]}
                contentStyle={{ background: 'rgba(15,23,42,0.95)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', fontSize: 11 }} />
              <Area type="monotone" dataKey="corpus" stroke="#667eea" fill="url(#corpusGrad)" strokeWidth={2} name="Your Corpus" />
              <Area type="monotone" dataKey="target" stroke="#f59e0b" fill="transparent" strokeDasharray="4 2" strokeWidth={1.5} name="Target" />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-400"><span className="w-3 h-0.5 bg-brand-500 rounded" />Your Corpus</div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400"><span className="w-3 h-0.5 bg-amber-500 rounded border-dashed" />Target</div>
          </div>
        </div>
      </div>
    </div>
  );
}
