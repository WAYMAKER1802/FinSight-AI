import { useState } from 'react';
import { motion } from 'framer-motion';
import { Newspaper, TrendingUp, TrendingDown, ExternalLink, RefreshCw, Sparkles, Filter } from 'lucide-react';

const newsItems = [
  { id: 1, title: 'RBI Holds Repo Rate at 6.5% — Markets Cheer Stability', source: 'Economic Times', time: '2h ago', sentiment: 'positive', impact: 'High', category: 'Policy', summary: 'Reserve Bank of India maintains rates for third consecutive meeting, signaling end of rate hike cycle. Equity markets react positively with banking stocks leading gains.', tags: ['HDFCBANK', 'ICICIBANK', 'SBIN'] },
  { id: 2, title: 'Infosys Reports Record Q4 Revenue; Beats Street Estimates', source: 'Moneycontrol', time: '4h ago', sentiment: 'positive', impact: 'Medium', category: 'Earnings', summary: 'Infosys Q4 net profit rises 14.2% YoY to ₹7,975 crore, beating expectations of ₹7,500 crore. Management gives positive guidance for FY26.', tags: ['INFY', 'TCS', 'WIPRO'] },
  { id: 3, title: 'IT Sector Faces Headwinds as US Tech Spending Slows', source: 'Business Standard', time: '6h ago', sentiment: 'negative', impact: 'Medium', category: 'Sector', summary: 'Major US tech companies announce budget cuts for IT services. Indian IT majors could see 5-8% revenue impact in FY26 according to analysts.', tags: ['INFY', 'TCS', 'HCLTECH'] },
  { id: 4, title: 'Gold Hits ₹65,000 on Geopolitical Uncertainty', source: 'Mint', time: '8h ago', sentiment: 'neutral', impact: 'Low', category: 'Commodity', summary: 'Gold prices rally as investors seek safe-haven assets amid Middle East tensions. ETFs see strong inflows.', tags: ['GOLDBEES', 'GOLDSHARE'] },
  { id: 5, title: 'Reliance Jio IPO Plans Take Shape — Valuation at $100Bn', source: 'Bloomberg', time: '1d ago', sentiment: 'positive', impact: 'High', category: 'IPO', summary: 'Reports suggest Reliance Jio is planning an IPO in FY26 at a valuation of $100 billion. Would be India\'s largest IPO ever.', tags: ['RELIANCE'] },
  { id: 6, title: 'Nifty 50 Closes at Record High as FII Buying Surges', source: 'Financial Express', time: '1d ago', sentiment: 'positive', impact: 'Medium', category: 'Market', summary: 'Nifty 50 closes at a new all-time high of 22,750 as FII\'s pump in ₹8,500 crore in a single session.', tags: [] },
];

const sentimentColors: Record<string, string> = {
  positive : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  negative : 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  neutral  : 'text-slate-400 bg-white/5 border-white/10',
};

const impactColors: Record<string, string> = {
  High   : 'badge-gold',
  Medium : 'badge-brand',
  Low    : 'badge-neutral',
};

export default function News() {
  const [filter, setFilter] = useState('all');
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);

  const getAiSummary = () => {
    setLoadingSummary(true);
    setTimeout(() => {
      setAiSummary("📊 **Today's Market Digest**: Markets are broadly positive driven by RBI rate pause and strong earnings season. Your portfolio has direct exposure to IT and Banking sectors — the Infosys beat is a net positive for your INFY holding (consider holding). The RBI pause is bullish for HDFC Bank (BUY signal strengthened). **One caution**: IT sector headwinds from US spending cuts could impact your 44% IT allocation — keep a close watch on TCS/INFY guidance.");
      setLoadingSummary(false);
    }, 1500);
  };

  const filtered = filter === 'all' ? newsItems : newsItems.filter(n => n.sentiment === filter);

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black font-display text-white">Financial News</h1>
          <p className="text-slate-400 text-sm mt-0.5">Curated for your portfolio</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary text-sm gap-2"><RefreshCw className="w-4 h-4" /> Refresh</button>
          <button onClick={getAiSummary} disabled={loadingSummary} className="btn-primary text-sm gap-2">
            <Sparkles className="w-4 h-4" />
            {loadingSummary ? 'Analyzing...' : 'AI Digest'}
          </button>
        </div>
      </div>

      {/* AI Summary */}
      {aiSummary && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl border border-brand-500/30 bg-brand-500/5">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-brand-400" />
            <span className="text-sm font-semibold text-brand-300">AI Market Digest</span>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: aiSummary.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>') }} />
        </motion.div>
      )}

      {/* Filters */}
      <div className="flex gap-2">
        {['all', 'positive', 'negative', 'neutral'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`text-xs px-3 py-1.5 rounded-full border capitalize transition-all ${
              filter === f ? 'bg-brand-500/20 border-brand-500/40 text-brand-300' : 'border-white/10 text-slate-500 hover:border-white/20'
            }`}>
            {f === 'all' ? 'All News' : f === 'positive' ? '📈 Positive' : f === 'negative' ? '📉 Negative' : '➡️ Neutral'}
          </button>
        ))}
      </div>

      {/* News List */}
      <div className="space-y-4">
        {filtered.map((news, i) => (
          <motion.div key={news.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="card-static p-5 hover:border-white/15 transition-all">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-slate-500">{news.source}</span>
                    <span className="text-slate-700">·</span>
                    <span className="text-xs text-slate-500">{news.time}</span>
                    <span className={`badge border ${sentimentColors[news.sentiment]}`}>
                      {news.sentiment === 'positive' ? '▲' : news.sentiment === 'negative' ? '▼' : '→'} {news.sentiment}
                    </span>
                    <span className={impactColors[news.impact]}>{news.impact} Impact</span>
                  </div>
                  <a href="#" className="text-slate-600 hover:text-slate-400 flex-shrink-0">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                <h3 className="text-sm font-bold text-white mb-2 leading-snug hover:text-brand-300 cursor-pointer transition-colors">
                  {news.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">{news.summary}</p>

                {/* Tags */}
                {news.tags.length > 0 && (
                  <div className="flex gap-1.5 mt-3">
                    <span className="text-xs text-slate-600">Your stocks:</span>
                    {news.tags.map(tag => (
                      <span key={tag} className="badge-brand text-2xs">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
