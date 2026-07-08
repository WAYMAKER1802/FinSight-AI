import { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, Plus, Brain, CheckCircle2, Clock, TrendingUp, Edit3, Trash2, AlertTriangle } from 'lucide-react';

const goals = [
  {
    id: '1', name: 'Early Retirement', type: 'retirement', icon: '🏖️',
    targetAmount: 50000000, currentAmount: 3450000, targetDate: '2045-01-01',
    monthlySIP: 25000, expectedReturns: 12, priority: 'high', status: 'on_track',
    color: '#667eea',
  },
  {
    id: '2', name: 'Dream Home Purchase', type: 'home', icon: '🏠',
    targetAmount: 10000000, currentAmount: 2000000, targetDate: '2028-06-01',
    monthlySIP: 40000, expectedReturns: 10, priority: 'high', status: 'on_track',
    color: '#10b981',
  },
  {
    id: '3', name: 'International Vacation', type: 'vacation', icon: '✈️',
    targetAmount: 500000, currentAmount: 180000, targetDate: '2025-12-01',
    monthlySIP: 15000, expectedReturns: 7, priority: 'medium', status: 'at_risk',
    color: '#f59e0b',
  },
  {
    id: '4', name: 'Child Education Fund', type: 'education', icon: '🎓',
    targetAmount: 5000000, currentAmount: 800000, targetDate: '2032-06-01',
    monthlySIP: 20000, expectedReturns: 11, priority: 'high', status: 'on_track',
    color: '#06b6d4',
  },
];

const GoalCard = ({ goal }: { goal: typeof goals[0] }) => {
  const progress  = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
  const yearsLeft = Math.max(0, new Date(goal.targetDate).getFullYear() - new Date().getFullYear());
  const shortfall = goal.targetAmount - goal.currentAmount;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="card p-5 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{goal.icon}</span>
          <div>
            <h3 className="text-sm font-bold text-white">{goal.name}</h3>
            <span className={`badge text-2xs ${
              goal.status === 'on_track' ? 'badge-profit' : 'badge-loss'
            }`}>
              {goal.status === 'on_track' ? '✓ On Track' : '⚠ At Risk'}
            </span>
          </div>
        </div>
        <div className="flex gap-1">
          <button className="btn-icon p-1.5"><Edit3 className="w-3.5 h-3.5" /></button>
          <button className="btn-icon p-1.5"><Trash2 className="w-3.5 h-3.5 text-rose-400" /></button>
        </div>
      </div>

      {/* Progress */}
      <div>
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-slate-400">₹{(goal.currentAmount / 100000).toFixed(1)}L saved</span>
          <span className="text-white font-semibold">₹{(goal.targetAmount / 100000).toFixed(0)}L target</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%`, background: goal.color }} />
        </div>
        <div className="flex justify-between text-2xs mt-1 text-slate-500">
          <span>{progress.toFixed(1)}% complete</span>
          <span>{yearsLeft} years left</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Monthly SIP', value: `₹${goal.monthlySIP.toLocaleString('en-IN')}` },
          { label: 'Expected',    value: `${goal.expectedReturns}% p.a.` },
          { label: 'Shortfall',   value: `₹${(shortfall / 100000).toFixed(0)}L` },
        ].map(s => (
          <div key={s.label} className="text-center p-2 rounded-lg bg-white/5">
            <div className="text-xs font-semibold text-white">{s.value}</div>
            <div className="text-2xs text-slate-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <button className="btn-secondary w-full text-xs gap-2 py-2">
        <Brain className="w-3.5 h-3.5 text-brand-400" /> Get AI Plan
      </button>
    </motion.div>
  );
};

export default function GoalPlanner() {
  const [showForm, setShowForm] = useState(false);

  const totalGoalValue = goals.reduce((s, g) => s + g.targetAmount, 0);
  const totalSaved     = goals.reduce((s, g) => s + g.currentAmount, 0);
  const monthlySIP     = goals.reduce((s, g) => s + g.monthlySIP, 0);

  return (
    <div className="space-y-6 max-w-screen-xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black font-display text-white">Goal Planner</h1>
          <p className="text-slate-400 text-sm mt-0.5">AI-powered financial goal tracking</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm gap-2">
          <Plus className="w-4 h-4" /> Add Goal
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Goal Value', value: `₹${(totalGoalValue / 10000000).toFixed(1)}Cr` },
          { label: 'Total Saved',      value: `₹${(totalSaved / 100000).toFixed(1)}L` },
          { label: 'Monthly SIP',      value: `₹${monthlySIP.toLocaleString('en-IN')}` },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <p className="stat-label">{s.label}</p>
            <p className="stat-value">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Goals Grid */}
      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5">
        {goals.map(g => <GoalCard key={g.id} goal={g} />)}
      </div>
    </div>
  );
}
