import { motion } from 'framer-motion';
import { Trophy, Star, Shield, Target, TrendingUp, Brain, Zap, Award } from 'lucide-react';

const score  = 612;
const level  = 'Wealth Builder';
const badges = ['🏆 First Portfolio', '📈 10% Returns', '🎯 Goal Setter', '🛡️ Risk Manager', '💬 AI Advisor User', '🌟 Premium Investor'];

const breakdown = [
  { label: 'Portfolio Size',      score: 185, max: 300, icon: '💰', color: '#667eea' },
  { label: 'Health Score',        score: 336, max: 400, icon: '❤️', color: '#10b981' },
  { label: 'Diversification',     score: 91,  max: 300, icon: '🎯', color: '#f59e0b' },
];

const levels = [
  { name: 'Beginner',     range: '0–199',   icon: '🌱', color: 'text-slate-400' },
  { name: 'Learner',      range: '200–399',  icon: '📚', color: 'text-blue-400'  },
  { name: 'Investor',     range: '400–599',  icon: '📈', color: 'text-emerald-400' },
  { name: 'Wealth Builder', range: '600–799', icon: '🏆', color: 'text-amber-400', active: true },
  { name: 'Elite Investor', range: '800–1000', icon: '💎', color: 'text-violet-400' },
];

export default function WealthScore() {
  const nextLevel = 800;
  const progress  = ((score - 600) / 200) * 100;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-black font-display text-white">Wealth Score</h1>
        <p className="text-slate-400 text-sm mt-0.5">Your AI-powered financial health rating</p>
      </div>

      {/* Score Display */}
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="card-static p-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 to-accent-violet/5" />
        <div className="relative">
          {/* Circular score */}
          <div className="relative w-40 h-40 mx-auto mb-6">
            <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90">
              <circle cx="80" cy="80" r="64" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
              <motion.circle cx="80" cy="80" r="64" fill="none"
                stroke="url(#scoreGrad)" strokeWidth="12" strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 64}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 64 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 64 * (1 - score / 1000) }}
                transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
              />
              <defs>
                <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#667eea" />
                  <stop offset="100%" stopColor="#f59e0b" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-4xl font-black font-display gradient-text-gold">{score}</div>
              <div className="text-xs text-slate-400">/ 1000</div>
            </div>
          </div>

          <div className="text-2xl font-bold text-amber-400 mb-1">🏆 {level}</div>
          <p className="text-sm text-slate-400 mb-4">
            You're in the <strong className="text-white">top 28%</strong> of FinSight AI investors
          </p>

          {/* Progress to next level */}
          <div className="text-xs text-slate-500 mb-2">Progress to Elite Investor ({nextLevel} pts)</div>
          <div className="progress-bar h-2.5 max-w-xs mx-auto">
            <motion.div className="progress-fill" style={{ background: 'linear-gradient(90deg, #f59e0b, #667eea)' }}
              initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ delay: 0.5, duration: 1 }} />
          </div>
          <div className="text-xs text-slate-500 mt-1">{nextLevel - score} points to next level</div>
        </div>
      </motion.div>

      {/* Score Breakdown */}
      <div className="card-static p-5">
        <h3 className="text-sm font-bold text-white mb-4 font-display">Score Breakdown</h3>
        <div className="space-y-4">
          {breakdown.map(b => (
            <div key={b.label}>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-400">{b.icon} {b.label}</span>
                <span className="font-bold font-numeric" style={{ color: b.color }}>{b.score} / {b.max}</span>
              </div>
              <div className="progress-bar">
                <motion.div className="h-full rounded-full"
                  style={{ background: b.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${(b.score / b.max) * 100}%` }}
                  transition={{ duration: 1, delay: 0.3 }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Badges */}
      <div className="card-static p-5">
        <h3 className="text-sm font-bold text-white mb-4 font-display">Achievement Badges</h3>
        <div className="grid grid-cols-3 gap-3">
          {badges.map(badge => (
            <div key={badge} className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/8">
              <span className="text-lg">{badge.split(' ')[0]}</span>
              <span className="text-xs text-slate-300 font-medium">{badge.split(' ').slice(1).join(' ')}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Level Ladder */}
      <div className="card-static p-5">
        <h3 className="text-sm font-bold text-white mb-4 font-display">Investor Levels</h3>
        <div className="space-y-2">
          {levels.map(l => (
            <div key={l.name} className={`flex items-center gap-3 p-3 rounded-xl ${l.active ? 'bg-amber-500/10 border border-amber-500/20' : 'opacity-50'}`}>
              <span className="text-xl">{l.icon}</span>
              <div className="flex-1">
                <div className={`text-sm font-semibold ${l.color}`}>{l.name}</div>
                <div className="text-2xs text-slate-500">{l.range} points</div>
              </div>
              {l.active && <span className="badge-gold text-2xs">Current</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
