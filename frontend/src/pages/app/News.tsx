import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Newspaper, ExternalLink, RefreshCw, Sparkles, Search, Loader2, Target, TrendingUp, TrendingDown, Clock, Activity, AlertCircle } from 'lucide-react';

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
  const [newsItems, setNewsItems] = useState<any[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);

  useEffect(() => {
    fetch('https://api.rss2json.com/v1/api.json?rss_url=https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms')
      .then(res => res.json())
      .then(data => {
        if (data.items) {
          const formattedNews = data.items.slice(0, 10).map((item: any, index: number) => {
            const sentiments = ['positive', 'negative', 'neutral'];
            const impacts = ['High', 'Medium', 'Low'];
            // Basic random sentiment assignment for UI demo
            const seed = item.title.length;
            
            return {
              id: index + 1,
              title: item.title,
              source: 'Economic Times',
              time: new Date(item.pubDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              sentiment: sentiments[seed % sentiments.length],
              impact: impacts[seed % impacts.length],
              summary: item.description.replace(/<[^>]+>/g, '').slice(0, 120) + '...',
              link: item.link,
              tags: []
            };
          });
          setNewsItems(formattedNews);
        }
      })
      .catch(console.error)
      .finally(() => setLoadingNews(false));
  }, []);
  
  // Scanner State
  const [searchQuery, setSearchQuery] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [reportCompany, setReportCompany] = useState<string | null>(null);

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsScanning(true);
    setReportCompany(null);
    
    // Simulate AI web scraping delay
    setTimeout(() => {
      setIsScanning(false);
      setReportCompany(searchQuery.trim().toUpperCase());
    }, 2500);
  };

  const clearReport = () => {
    setReportCompany(null);
    setSearchQuery('');
  };

  const getCompanyData = (companyName: string) => {
    // Generate mock AI data based on company name
    const isTech = companyName.includes('APPLE') || companyName.includes('TCS') || companyName.includes('INFY');
    const isBank = companyName.includes('HDFC') || companyName.includes('SBI');
    
    if (isTech) {
      return {
        verdict: 'BULLISH',
        sentiment: 82,
        trend: 'up',
        priceTarget: '+4.5%',
        timeline: [
          { time: '2 hours ago', event: 'Upgraded to "Strong Buy" by Morgan Stanley.' },
          { time: '14 hours ago', event: 'Announced massive $30B chip procurement deal.' },
          { time: '36 hours ago', event: 'Quarterly earnings leaked; margin expansion expected.' },
        ],
        impact: 'Highly positive for your portfolio. Consider adding to positions on minor dips.'
      };
    } else if (isBank) {
      return {
        verdict: 'BEARISH',
        sentiment: 34,
        trend: 'down',
        priceTarget: '-2.1%',
        timeline: [
          { time: '5 hours ago', event: 'RBI announces stricter norms for unsecured lending.' },
          { time: '22 hours ago', event: 'NIMs (Net Interest Margins) expected to compress in Q4.' },
          { time: '41 hours ago', event: 'Foreign institutional selling observed in block deals.' },
        ],
        impact: 'Near-term headwinds expected. Avoid fresh allocations until rate clarity emerges.'
      };
    }
    
    // Default fallback
    return {
      verdict: 'NEUTRAL',
      sentiment: 58,
      trend: 'flat',
      priceTarget: '+0.5%',
      timeline: [
        { time: '8 hours ago', event: 'Company announces routine management restructuring.' },
        { time: '24 hours ago', event: 'Sector peers report mixed Q3 earnings.' },
        { time: '48 hours ago', event: 'Promoter slightly increases stake by 0.1%.' },
      ],
      impact: 'Hold current positions. No significant catalysts in the immediate 48-hour horizon.'
    };
  };

  const filtered = filter === 'all' ? newsItems : newsItems.filter(n => n.sentiment === filter);

  return (
    <div className="space-y-8 max-w-5xl">
      
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black font-display text-white">Financial News & Intelligence</h1>
        <p className="text-slate-400 text-sm mt-0.5">Real-time market updates and AI-driven deep scans.</p>
      </div>

      {/* THE ULTIMATE 48-HOUR AI SCANNER */}
      <div className="card-static p-1 relative overflow-hidden">
        {/* Animated Background Gradient for that "AI" feel */}
        <div className="absolute inset-0 bg-gradient-to-r from-brand-900/20 via-accent-violet/20 to-brand-900/20 animate-pulse-slow" />
        
        <div className="relative bg-dark-900/90 rounded-2xl p-6 border border-brand-500/20 backdrop-blur-md">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center text-brand-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-display">48-Hour AI Company Scan</h2>
              <p className="text-xs text-brand-300">Scrape the web for deep insights on any company instantly.</p>
            </div>
          </div>

          <form onSubmit={handleScan} className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g., Apple, Reliance, HDFC Bank..."
                className="input pl-12 h-12 w-full text-lg"
                disabled={isScanning}
              />
            </div>
            <button type="submit" disabled={isScanning || !searchQuery.trim()} className="btn-primary h-12 px-8">
              {isScanning ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Scanning Web...
                </>
              ) : (
                'Deep Scan'
              )}
            </button>
          </form>

          {/* Report Results */}
          <AnimatePresence mode="wait">
            {reportCompany && !isScanning && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 pt-6 border-t border-white/10"
              >
                {(() => {
                  const data = getCompanyData(reportCompany);
                  return (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-black text-white font-display uppercase tracking-wider">{reportCompany}</h3>
                        <button onClick={clearReport} className="text-xs text-slate-400 hover:text-white transition-colors">Clear Report</button>
                      </div>

                      <div className="grid md:grid-cols-3 gap-4">
                        {/* Verdict Card */}
                        <div className={`p-4 rounded-xl border bg-opacity-10 flex flex-col justify-center items-center text-center ${
                          data.trend === 'up' ? 'border-emerald-500/30 bg-emerald-500' :
                          data.trend === 'down' ? 'border-rose-500/30 bg-rose-500' :
                          'border-slate-500/30 bg-slate-500'
                        }`}>
                          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">AI Verdict</div>
                          <div className={`text-2xl font-black flex items-center gap-2 ${
                            data.trend === 'up' ? 'text-emerald-400' :
                            data.trend === 'down' ? 'text-rose-400' :
                            'text-slate-300'
                          }`}>
                            {data.verdict}
                            {data.trend === 'up' ? <TrendingUp className="w-6 h-6" /> : 
                             data.trend === 'down' ? <TrendingDown className="w-6 h-6" /> : 
                             <Activity className="w-6 h-6" />}
                          </div>
                        </div>

                        {/* Sentiment Card */}
                        <div className="p-4 rounded-xl border border-white/5 bg-white/5 flex flex-col justify-center items-center text-center">
                          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Web Sentiment Score</div>
                          <div className="text-3xl font-black text-white">{data.sentiment}%</div>
                          <div className="w-full h-1.5 bg-dark-800 rounded-full mt-3 overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }} 
                              animate={{ width: `${data.sentiment}%` }} 
                              transition={{ duration: 1, ease: 'easeOut' }}
                              className={`h-full rounded-full ${
                                data.sentiment > 60 ? 'bg-emerald-500' :
                                data.sentiment < 40 ? 'bg-rose-500' : 'bg-brand-500'
                              }`} 
                            />
                          </div>
                        </div>

                        {/* Prediction Card */}
                        <div className="p-4 rounded-xl border border-white/5 bg-white/5 flex flex-col justify-center items-center text-center">
                          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">AI Price Target (1W)</div>
                          <div className={`text-3xl font-black ${
                            data.priceTarget.startsWith('+') ? 'text-emerald-400' :
                            data.priceTarget.startsWith('-') ? 'text-rose-400' : 'text-slate-300'
                          }`}>{data.priceTarget}</div>
                        </div>
                      </div>

                      {/* 48 Hour Timeline */}
                      <div>
                        <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                          <Clock className="w-4 h-4 text-brand-400" /> Key Events (Last 48 Hours)
                        </h4>
                        <div className="space-y-3">
                          {data.timeline.map((item, idx) => (
                            <motion.div 
                              key={idx}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.15 }}
                              className="flex gap-4 p-3 rounded-xl bg-white/5 border border-white/5"
                            >
                              <div className="w-24 flex-shrink-0 text-xs font-semibold text-brand-400 pt-0.5">{item.time}</div>
                              <div className="text-sm text-slate-300">{item.event}</div>
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      {/* Portfolio Impact */}
                      <div className="p-4 rounded-xl bg-brand-500/10 border border-brand-500/20 flex gap-3">
                        <Target className="w-5 h-5 text-brand-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="text-xs font-semibold text-brand-300 mb-1">Portfolio Impact Strategy</div>
                          <p className="text-sm text-slate-300">{data.impact}</p>
                        </div>
                      </div>
                      
                    </div>
                  );
                })()}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <hr className="border-white/5" />

      {/* Standard News Feed */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white font-display">General Market Headlines</h2>
          <div className="flex gap-2">
            {['all', 'positive', 'negative', 'neutral'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`text-xs px-3 py-1.5 rounded-full border capitalize transition-all ${
                  filter === f ? 'bg-brand-500/20 border-brand-500/40 text-brand-300' : 'border-white/10 text-slate-500 hover:border-white/20'
                }`}>
                {f === 'all' ? 'All' : f}
              </button>
            ))}
          </div>
        </div>

        {loadingNews ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
            <p>Fetching real-time global market news...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {filtered.map(news => (
              <div key={news.id} className="card-static p-6 flex flex-col group cursor-pointer hover:border-brand-500/30">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-slate-400">{news.source}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-700" />
                    <span className="text-sm text-slate-500 flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {news.time}</span>
                  </div>
                  <div className={`badge ${sentimentColors[news.sentiment]}`}>
                    {news.sentiment === 'positive' && <TrendingUp className="w-3 h-3 mr-1" />}
                    {news.sentiment === 'negative' && <TrendingDown className="w-3 h-3 mr-1" />}
                    {news.sentiment === 'neutral' && <Activity className="w-3 h-3 mr-1" />}
                    {news.sentiment}
                  </div>
                </div>
                
                <h3 className="text-lg font-bold text-white leading-snug mb-3 group-hover:text-brand-400 transition-colors">
                  {news.title}
                </h3>
                
                <p className="text-slate-400 text-sm leading-relaxed mb-6 flex-1">
                  {news.summary}
                </p>
                
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex gap-2">
                    {news.tags.map((tag: string) => (
                      <span key={tag} className="badge bg-white/5 text-slate-300 border-white/10 hover:bg-brand-500/10 hover:text-brand-400 hover:border-brand-500/30 transition-colors">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <a href={news.link} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-white/5 text-slate-400 group-hover:bg-brand-500 group-hover:text-white transition-all">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
