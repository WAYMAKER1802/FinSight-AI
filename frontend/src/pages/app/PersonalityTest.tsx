import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, ChevronRight, CheckCircle2, ArrowRight } from 'lucide-react';

const questions = [
  {
    id: 1, question: 'What is your primary financial goal?',
    options: ['Capital preservation (protecting what I have)', 'Income generation (regular returns)', 'Capital growth (building wealth over time)', 'Aggressive growth (maximum returns, high risk)'],
  },
  {
    id: 2, question: 'If your portfolio dropped 20% in one month, what would you do?',
    options: ['Sell everything immediately', 'Sell some to reduce exposure', 'Hold and wait for recovery', 'Buy more — great buying opportunity!'],
  },
  {
    id: 3, question: 'What percentage of your monthly income do you invest?',
    options: ['Less than 10%', '10–20%', '20–40%', 'More than 40%'],
  },
  {
    id: 4, question: 'What is your investment time horizon?',
    options: ['Less than 1 year', '1–3 years', '3–7 years', '7+ years'],
  },
  {
    id: 5, question: 'How do you react to stock market news?',
    options: ['I check my portfolio every hour', 'I check daily', 'I check weekly', 'I rarely check — long-term approach'],
  },
];

const profiles = [
  { type: 'Conservative',            icon: '🛡️', desc: 'You prioritize safety over returns. FDs, bonds, and blue-chip stocks suit you.',    color: '#06b6d4', risk: 3  },
  { type: 'Moderate',                icon: '⚖️', desc: 'You seek a balance between stability and growth. A mix of debt and equity works.',     color: '#10b981', risk: 5  },
  { type: 'Moderately Aggressive',   icon: '📈', desc: 'You can handle some volatility for higher returns. Growth stocks and MFs are ideal.', color: '#f59e0b', risk: 7  },
  { type: 'Aggressive',              icon: '🚀', desc: 'You seek maximum growth and can handle high volatility. Equities, crypto, and small-caps suit you.', color: '#f43f5e', risk: 9 },
];

export default function PersonalityTest() {
  const [currentQ,  setCurrentQ]  = useState(0);
  const [answers,   setAnswers]   = useState<number[]>([]);
  const [completed, setCompleted] = useState(false);
  const [profile,   setProfile]   = useState<typeof profiles[0] | null>(null);

  const handleAnswer = (optionIdx: number) => {
    const newAnswers = [...answers, optionIdx];
    setAnswers(newAnswers);

    if (currentQ < questions.length - 1) {
      setTimeout(() => setCurrentQ(currentQ + 1), 400);
    } else {
      // Calculate profile
      const totalScore = newAnswers.reduce((s, a) => s + a, 0);
      const maxScore   = (questions.length - 1) * 3;
      const pct        = totalScore / maxScore;
      const profileIdx = pct < 0.25 ? 0 : pct < 0.5 ? 1 : pct < 0.75 ? 2 : 3;
      setProfile(profiles[profileIdx]);
      setCompleted(true);
    }
  };

  const reset = () => {
    setCurrentQ(0);
    setAnswers([]);
    setCompleted(false);
    setProfile(null);
  };

  if (completed && profile) {
    return (
      <div className="max-w-2xl space-y-6">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="card-static p-8 text-center">
          <div className="text-5xl mb-4">{profile.icon}</div>
          <h2 className="text-3xl font-black font-display text-white mb-2">
            You're a <span style={{ color: profile.color }}>{profile.type} Investor</span>
          </h2>
          <p className="text-slate-400 mb-6">{profile.desc}</p>
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="text-slate-400 text-sm">Risk Appetite:</span>
            <div className="progress-bar w-32 h-2">
              <div className="h-full rounded-full" style={{ width: `${profile.risk * 10}%`, background: profile.color }} />
            </div>
            <span className="font-bold text-sm" style={{ color: profile.color }}>{profile.risk}/10</span>
          </div>
          <div className="p-4 rounded-xl bg-brand-500/10 border border-brand-500/20 text-left mb-6">
            <div className="text-xs font-semibold text-brand-300 mb-2">🧠 AI Recommended Strategy:</div>
            <p className="text-xs text-slate-300">
              Based on your profile, we recommend allocating <strong>70% equities</strong> (large-cap + flexi-cap funds),
              <strong> 20% debt</strong> (liquid funds + short-term FDs), and <strong>10% alternatives</strong> (gold + REITs).
              Your ideal SIP horizon is <strong>7+ years</strong> for maximum compounding.
            </p>
          </div>
          <button onClick={reset} className="btn-secondary text-sm mr-3">Retake Test</button>
          <button className="btn-primary text-sm">Save My Profile</button>
        </motion.div>
      </div>
    );
  }

  const q = questions[currentQ];

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-black font-display text-white">Investor Personality Test</h1>
        <p className="text-slate-400 text-sm mt-0.5">Discover your risk profile in 5 questions</p>
      </div>

      {/* Progress */}
      <div>
        <div className="flex justify-between text-xs text-slate-500 mb-2">
          <span>Question {currentQ + 1} of {questions.length}</span>
          <span>{Math.round(((currentQ) / questions.length) * 100)}% complete</span>
        </div>
        <div className="progress-bar">
          <motion.div className="progress-fill" animate={{ width: `${(currentQ / questions.length) * 100}%` }} transition={{ duration: 0.4 }} />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={currentQ} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.3 }} className="card-static p-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-500/20 flex items-center justify-center text-sm font-bold text-brand-400 flex-shrink-0">
              {currentQ + 1}
            </div>
            <h2 className="text-lg font-bold text-white font-display leading-snug">{q.question}</h2>
          </div>

          <div className="space-y-2.5">
            {q.options.map((opt, i) => (
              <button key={i} onClick={() => handleAnswer(i)}
                className="w-full text-left p-3.5 rounded-xl border border-white/10 bg-white/5 hover:border-brand-500/40 hover:bg-brand-500/10 text-sm text-slate-300 hover:text-white transition-all flex items-center gap-3">
                <span className="w-5 h-5 rounded-full border border-white/20 flex-shrink-0 flex items-center justify-center text-xs text-slate-500">
                  {String.fromCharCode(65 + i)}
                </span>
                {opt}
                <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 text-brand-400" />
              </button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
