import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, RefreshCw } from 'lucide-react';
import { usePortfolioStore } from '@/store/portfolioStore';
import { aiApi } from '@/api/market.api';
import toast from 'react-hot-toast';

const LEVELS = [
  { name: 'Beginner',      range: '0–199',   icon: '🌱', color: 'text-slate-400',   min: 0   },
  { name: 'Learner',       range: '200–399',  icon: '📚', color: 'text-blue-400',    min: 200 },
  { name: 'Investor',      range: '400–599',  icon: '📈', color: 'text-emerald-400', min: 400 },
  { name: 'Wealth Builder',range: '600–799',  icon: '🏆', color: 'text-amber-400',   min: 600 },
  { name: 'Elite Investor',range: '800–1000', icon: '💎', color: 'text-violet-400',  min: 800 },
];

const getLevelInfo = (score: number) =>
  LEVELS.find((l, i) => score >= l.min && (i === LEVELS.length - 1 || score < LEVELS[i+1].min)) || LEVELS[0];

const getNextLevel = (score: number) => {
  const idx = LEVELS.findIndex((l, i) => score >= l.min && (i === LEVELS.length - 1 || score < LEVELS[i+1].min));
  return idx < LEVELS.length - 1 ? LEVELS[idx + 1] : LEVELS[LEVELS.length - 1];
};

export default function WealthScore() {
  const { activePortfolio, portfolios, loading, fetchPortfolios } = usePortfolioStore();
  const [analysis,    setAnalysis]    = useState<any>(null);
  const [analyzing,   setAnalyzing]   = useState(false);
  const [breakdown,   setBreakdown]   = useState<any[]>([]);
  const [badges,      setBadges]      = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => { if (portfolios.length === 0) fetchPortfolios(); }, []);

  const p     = activePortfolio;
  const score = Math.round(p?.wealthScore || 0);
  const level = getLevelInfo(score);
  const next  = getNextLevel(score);
  const progress = score >= level.min
    ? Math.round(((score - level.min) / ((next.min || 1000) - level.min)) * 100)
    : 0;

  // Build breakdown from real metrics
  useEffect(() => {
    if (!p) return;
    const ret = p.returnsPercent || 0;
    const div = p.diversificationScore || 0;
    const hlt = p.healthScore || 0;
    const shp = p.sharpeRatio || 0;
    const val = p.totalCurrentValue || 0;
    const cnt = p.assets?.length || 0;

    // Calculate sub-scores
    const retScore  = ret >= 20 ? 200 : ret >= 15 ? 170 : ret >= 10 ? 140 : ret >= 5 ? 100 : 60;
    const divScore  = Math.min(150, Math.round((div / 100) * 100 + Math.min(cnt * 5, 50)));
    const hlthScore = Math.round((hlt / 100) * 150);
    const riskAdj   = shp >= 2 ? 100 : shp >= 1.5 ? 80 : shp >= 1 ? 60 : shp >= 0.5 ? 40 : 20;
    const sizeScore = val >= 5000000 ? 100 : val >= 1000000 ? 80 : val >= 500000 ? 60 : val >= 100000 ? 40 : 20;

    setBreakdown([
      { label: 'Returns',               score: retScore,  max: 200, icon: '📈', color: '#10b981' },
      { label: 'Diversification',       score: divScore,  max: 150, icon: '🎯', color: '#667eea' },
      { label: 'Portfolio Health',       score: hlthScore, max: 150, icon: '❤️', color: '#f59e0b' },
      { label: 'Risk-Adjusted Returns',  score: riskAdj,   max: 100, icon: '🛡️', color: '#06b6d4' },
      { label: 'Portfolio Size',         score: sizeScore, max: 100, icon: '💰', color: '#a78bfa' },
    ]);

    // Badges
    const b: string[] = [];
    if (cnt >= 1)        b.push('🏆 First Portfolio');
    if (ret >= 10)       b.push('📈 10% Returns');
    if (cnt >= 5)        b.push('🌐 Diversified Investor');
    if (val >= 500000)   b.push('💰 Half Lakh Club');
    if (val >= 1000000)  b.push('🚀 Lakhpati');
    if (ret >= 20)       b.push('🔥 20% Returns Club');
    if (p.assets?.some((a: any) => a.type === 'crypto')) b.push('₿ Crypto Explorer');
    if (p.assets?.some((a: any) => a.type === 'gold' || a.symbol === 'GOLDBEES')) b.push('🥇 Gold Accumulator');
    setBadges(b.length > 0 ? b : ['🌱 Starting Journey']);

    // Suggestions
    const s: string[] = [];
    if (div < 50)  s.push('Add assets from different sectors to improve diversification');
    if (ret < 10)  s.push('Review underperforming holdings and rebalance to quality stocks');
    if (cnt < 5)   s.push('Add more assets to reduce single-stock concentration risk');
    if (shp < 1)   s.push('Consider lower-risk assets to improve risk-adjusted returns');
    s.push('Set up monthly SIPs to earn the "Consistent Investor" badge');
    setSuggestions(s.slice(0, 3));
  }, [p]);

  const handleAnalyze = async () => {
    if (!p?.id) return;
    setAnalyzing(true);
    try {
      const res = await aiApi.analyzePortfolio(p.id);
      setAnalysis(res.data?.data?.analysis || res.data?.analysis);
      toast.success('Portfolio analyzed!');
    } catch {
      toast.error('Analysis failed — try again');
    } finally { setAnalyzing(false); }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-black font-display text-white">Wealth Score</h1>
        <p className="text-slate-400 text-sm mt-0.5">Your AI-powered financial health rating — calculated from real portfolio data</p>
      </div>

      {/* Score Display */}
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="card-static p-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 to-accent-violet/5" />
        <div className="relative">
          {loading
            ? <div className="w-40 h-40 mx-auto rounded-full bg-white/5 animate-pulse mb-6" />
            : (
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
            )
          }
          {!loading && (
            <>
              <div className="text-2xl font-bold text-amber-400 mb-1">{level.icon} {level.name}</div>
              <p className="text-sm text-slate-400 mb-4">
                {p ? `Based on ${p.assets?.length || 0} holdings with ${(p.returnsPercent||0).toFixed(1)}% returns` : 'Add a portfolio to see your score'}
              </p>
              <div className="text-xs text-slate-500 mb-2">Progress to {next.name} ({next.min} pts)</div>
              <div className="progress-bar h-2.5 max-w-xs mx-auto">
                <motion.div className="progress-fill" style={{ background: 'linear-gradient(90deg, #f59e0b, #667eea)' }}
                  initial={{ width: 0 }} animate={{ width: `${Math.min(100, progress)}%` }} transition={{ delay: 0.5, duration: 1 }} />
              </div>
              <div className="text-xs text-slate-500 mt-1">{Math.max(0, next.min - score)} points to next level</div>
            </>
          )}
        </div>
      </motion.div>

      {/* Score Breakdown */}
      {breakdown.length > 0 && (
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
      )}

      {/* AI Portfolio Doctor Button */}
      <div className="card-static p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white font-display">🩺 AI Portfolio Doctor</h3>
            <p className="text-xs text-slate-400 mt-0.5">Get a comprehensive AI diagnosis of your portfolio</p>
          </div>
          <button onClick={handleAnalyze} disabled={analyzing || !p}
            className="btn-primary text-sm gap-2 disabled:opacity-50">
            {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : '🧠'}
            {analyzing ? 'Analyzing…' : 'Analyze Portfolio'}
          </button>
        </div>

        {analysis && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <p className="text-sm text-slate-300 leading-relaxed">{analysis.summary}</p>
            <div className="grid md:grid-cols-2 gap-4">
              {analysis.strengths?.length > 0 && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <h4 className="text-xs font-bold text-emerald-400 mb-2">✅ Strengths</h4>
                  <ul className="space-y-1">
                    {analysis.strengths.map((s: string, i: number) => <li key={i} className="text-xs text-slate-300">• {s}</li>)}
                  </ul>
                </div>
              )}
              {analysis.weaknesses?.length > 0 && (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
                  <h4 className="text-xs font-bold text-rose-400 mb-2">⚠️ Weaknesses</h4>
                  <ul className="space-y-1">
                    {analysis.weaknesses.map((w: string, i: number) => <li key={i} className="text-xs text-slate-300">• {w}</li>)}
                  </ul>
                </div>
              )}
            </div>
            {analysis.suggestions?.length > 0 && (
              <div className="p-4 rounded-xl bg-brand-500/10 border border-brand-500/20">
                <h4 className="text-xs font-bold text-brand-400 mb-2">💡 Suggested Improvements</h4>
                <div className="space-y-2">
                  {analysis.suggestions.map((s: any, i: number) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className={`text-2xs px-1.5 py-0.5 rounded-full font-bold flex-shrink-0 mt-0.5 ${
                        s.priority === 'High' ? 'bg-rose-500/20 text-rose-400' :
                        s.priority === 'Medium' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
                      }`}>{s.priority || 'Low'}</span>
                      <div>
                        <p className="text-xs text-white font-medium">{typeof s === 'string' ? s : s.action}</p>
                        {s.impact && <p className="text-2xs text-slate-400 mt-0.5">{s.impact}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {analysis.confidenceScore && (
              <div className="text-xs text-slate-500 text-right">AI Confidence: {analysis.confidenceScore}%</div>
            )}
          </motion.div>
        )}
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

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="card-static p-5">
          <h3 className="text-sm font-bold text-white mb-4 font-display">💡 How to Improve Your Score</h3>
          <div className="space-y-3">
            {suggestions.map((s, i) => (
              <div key={i} className="flex gap-3 p-3 rounded-xl bg-white/5">
                <span className="text-brand-400 font-bold text-sm">{i + 1}.</span>
                <p className="text-xs text-slate-300 leading-relaxed">{s}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Level Ladder */}
      <div className="card-static p-5">
        <h3 className="text-sm font-bold text-white mb-4 font-display">Investor Levels</h3>
        <div className="space-y-2">
          {LEVELS.map(l => {
            const isActive = l.name === level.name;
            return (
              <div key={l.name} className={`flex items-center gap-3 p-3 rounded-xl ${isActive ? 'bg-amber-500/10 border border-amber-500/20' : 'opacity-50'}`}>
                <span className="text-xl">{l.icon}</span>
                <div className="flex-1">
                  <div className={`text-sm font-semibold ${l.color}`}>{l.name}</div>
                  <div className="text-2xs text-slate-500">{l.range} points</div>
                </div>
                {isActive && <span className="badge-gold text-2xs">Current</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
