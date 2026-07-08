import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, TrendingUp, Home, Car, GraduationCap, DollarSign } from 'lucide-react';

// ── SIP Calculator ─────────────────────────────────────────────────────────
const SIPCalc = () => {
  const [monthly,  setMonthly]  = useState(10000);
  const [rate,     setRate]     = useState(12);
  const [years,    setYears]    = useState(10);

  const r  = rate / 100 / 12;
  const n  = years * 12;
  const fv = monthly * (((Math.pow(1 + r, n) - 1) / r) * (1 + r));
  const invested = monthly * n;
  const gains    = fv - invested;

  return (
    <div className="space-y-5">
      {[
        { label: 'Monthly SIP (₹)', value: monthly, setter: setMonthly, min: 500, max: 1000000, step: 500 },
        { label: 'Expected Return (% p.a.)', value: rate, setter: setRate, min: 1, max: 30, step: 0.5 },
        { label: 'Investment Period (Years)', value: years, setter: setYears, min: 1, max: 40, step: 1 },
      ].map(f => (
        <div key={f.label}>
          <div className="flex justify-between text-xs mb-2">
            <label className="text-slate-400">{f.label}</label>
            <span className="font-semibold text-white font-numeric">{f.label.includes('₹') ? `₹${f.value.toLocaleString('en-IN')}` : f.label.includes('%') ? `${f.value}%` : `${f.value} yrs`}</span>
          </div>
          <input type="range" min={f.min} max={f.max} step={f.step} value={f.value}
            onChange={e => f.setter(Number(e.target.value))}
            className="w-full accent-brand-500" style={{ accentColor: '#667eea' }} />
        </div>
      ))}

      <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/5">
        {[
          { label: 'Total Invested', value: `₹${(invested / 100000).toFixed(1)}L`,   color: 'text-white'  },
          { label: 'Estimated Gains', value: `₹${(gains / 100000).toFixed(1)}L`,     color: 'text-emerald-400' },
          { label: 'Corpus at End',   value: `₹${(fv / 100000).toFixed(1)}L`,        color: 'gradient-text' },
        ].map(r => (
          <div key={r.label} className="text-center p-3 rounded-xl bg-white/5">
            <div className={`text-lg font-black font-display ${r.color}`}>{r.value}</div>
            <div className="text-2xs text-slate-500 mt-1">{r.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── EMI Calculator ──────────────────────────────────────────────────────────
const EMICalc = () => {
  const [principal, setPrincipal] = useState(5000000);
  const [rate,      setRate]      = useState(8.5);
  const [tenure,    setTenure]    = useState(20);

  const r   = rate / 100 / 12;
  const n   = tenure * 12;
  const emi = r === 0 ? principal / n : (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  const totalAmt  = emi * n;
  const interest  = totalAmt - principal;

  return (
    <div className="space-y-5">
      {[
        { label: 'Loan Amount (₹)', value: principal, setter: setPrincipal, min: 100000, max: 50000000, step: 100000 },
        { label: 'Interest Rate (% p.a.)', value: rate, setter: setRate, min: 5, max: 20, step: 0.25 },
        { label: 'Loan Tenure (Years)', value: tenure, setter: setTenure, min: 1, max: 30, step: 1 },
      ].map(f => (
        <div key={f.label}>
          <div className="flex justify-between text-xs mb-2">
            <label className="text-slate-400">{f.label}</label>
            <span className="font-semibold text-white font-numeric">{f.label.includes('₹') ? `₹${f.value.toLocaleString('en-IN')}` : f.label.includes('%') ? `${f.value}%` : `${f.value} yrs`}</span>
          </div>
          <input type="range" min={f.min} max={f.max} step={f.step} value={f.value}
            onChange={e => f.setter(Number(e.target.value))} className="w-full" style={{ accentColor: '#667eea' }} />
        </div>
      ))}

      <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/5">
        {[
          { label: 'Monthly EMI',    value: `₹${Math.round(emi).toLocaleString('en-IN')}`,     color: 'gradient-text' },
          { label: 'Total Interest', value: `₹${(interest / 100000).toFixed(1)}L`,              color: 'text-rose-400' },
          { label: 'Total Payment',  value: `₹${(totalAmt / 100000).toFixed(1)}L`,              color: 'text-white' },
        ].map(r => (
          <div key={r.label} className="text-center p-3 rounded-xl bg-white/5">
            <div className={`text-lg font-black font-display ${r.color}`}>{r.value}</div>
            <div className="text-2xs text-slate-500 mt-1">{r.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── CAGR Calculator ─────────────────────────────────────────────────────────
const CAGRCalc = () => {
  const [beginVal, setBeginVal] = useState(100000);
  const [endVal,   setEndVal]   = useState(200000);
  const [years,    setYears]    = useState(5);

  const cagr    = years > 0 ? ((Math.pow(endVal / beginVal, 1 / years) - 1) * 100) : 0;
  const totalRet= ((endVal - beginVal) / beginVal) * 100;

  return (
    <div className="space-y-5">
      {[
        { label: 'Initial Investment (₹)', value: beginVal, setter: setBeginVal, min: 1000, max: 10000000, step: 1000 },
        { label: 'Final Value (₹)', value: endVal, setter: setEndVal, min: 1000, max: 50000000, step: 1000 },
        { label: 'Duration (Years)', value: years, setter: setYears, min: 1, max: 30, step: 1 },
      ].map(f => (
        <div key={f.label}>
          <div className="flex justify-between text-xs mb-2">
            <label className="text-slate-400">{f.label}</label>
            <span className="font-semibold text-white font-numeric">{f.label.includes('₹') ? `₹${f.value.toLocaleString('en-IN')}` : `${f.value} yrs`}</span>
          </div>
          <input type="range" min={f.min} max={f.max} step={f.step} value={f.value}
            onChange={e => f.setter(Number(e.target.value))} className="w-full" style={{ accentColor: '#667eea' }} />
        </div>
      ))}
      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/5">
        {[
          { label: 'CAGR',             value: `${cagr.toFixed(2)}%`, color: 'gradient-text' },
          { label: 'Absolute Returns', value: `${totalRet.toFixed(1)}%`, color: 'text-emerald-400' },
        ].map(r => (
          <div key={r.label} className="text-center p-4 rounded-xl bg-white/5">
            <div className={`text-2xl font-black font-display ${r.color}`}>{r.value}</div>
            <div className="text-xs text-slate-500 mt-1">{r.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Calculators Page ─────────────────────────────────────────────────────────
const tabs = [
  { id: 'sip',  label: '📈 SIP Calculator',  component: SIPCalc },
  { id: 'emi',  label: '🏠 EMI Calculator',  component: EMICalc },
  { id: 'cagr', label: '📊 CAGR Calculator', component: CAGRCalc },
];

export default function Calculators() {
  const [activeTab, setActiveTab] = useState('sip');
  const ActiveComponent = tabs.find(t => t.id === activeTab)?.component || SIPCalc;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-black font-display text-white">Financial Calculators</h1>
        <p className="text-slate-400 text-sm mt-0.5">Plan smarter with precision financial tools</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 rounded-xl bg-white/5 border border-white/10">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
              activeTab === t.id ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30' : 'text-slate-500 hover:text-white'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Calculator */}
      <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="card-static p-6">
        <ActiveComponent />
      </motion.div>

      {/* Disclaimer */}
      <p className="text-xs text-slate-600 text-center">
        Results are estimates based on assumed returns. Actual returns may vary. Not financial advice.
      </p>
    </div>
  );
}
