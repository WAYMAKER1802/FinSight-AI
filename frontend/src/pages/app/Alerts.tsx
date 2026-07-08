import { motion } from 'framer-motion';
import { Bell, BellOff, CheckCheck, Trash2, AlertTriangle, TrendingUp, Brain, Info } from 'lucide-react';

const alerts = [
  { id: '1', type: 'ai_recommendation', icon: '🧠', title: 'AI Alert: INFY upgraded to BUY', message: 'AI analysis shows strong fundamentals after Q4 results beat estimates by 14%. Consider increasing allocation.', severity: 'info', time: '2h ago', read: false, symbol: 'INFY' },
  { id: '2', type: 'portfolio_rise',    icon: '📈', title: 'Portfolio up 2.3% today!',       message: 'Your Growth Portfolio gained ₹8,050 today, driven by HDFC Bank (+3.2%) and Reliance (+1.8%).', severity: 'success', time: '5h ago', read: false, symbol: null },
  { id: '3', type: 'rebalance',         icon: '⚖️', title: 'Rebalancing Recommended',       message: 'IT sector now at 44% of portfolio (recommended: <30%). Consider trimming TCS or INFY to reduce concentration risk.', severity: 'warning', time: '1d ago', read: false, symbol: 'TCS' },
  { id: '4', type: 'stop_loss',         icon: '🚨', title: 'Stop Loss Alert: WIPRO',        message: 'WIPRO dropped to ₹420, hitting your stop loss of ₹425. Position has been flagged for review.', severity: 'critical', time: '2d ago', read: true, symbol: 'WIPRO' },
  { id: '5', type: 'news',              icon: '📰', title: 'Breaking: RBI Rate Decision',   message: 'RBI maintains repo rate at 6.5%. This is bullish for banking stocks in your portfolio.', severity: 'info', time: '3d ago', read: true, symbol: null },
  { id: '6', type: 'dividend',          icon: '💰', title: 'Dividend Received: RELIANCE',   message: 'Reliance Industries paid ₹9/share dividend. ₹225 credited to your portfolio.', severity: 'success', time: '5d ago', read: true, symbol: 'RELIANCE' },
];

const severityStyles: Record<string, string> = {
  critical: 'border-l-4 border-l-rose-500 bg-rose-500/5',
  warning : 'border-l-4 border-l-amber-500 bg-amber-500/5',
  success : 'border-l-4 border-l-emerald-500 bg-emerald-500/5',
  info    : 'border-l-4 border-l-brand-500 bg-brand-500/5',
};

export default function Alerts() {
  const unreadCount = alerts.filter(a => !a.read).length;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black font-display text-white flex items-center gap-3">
            Smart Alerts
            {unreadCount > 0 && (
              <span className="text-sm badge-loss px-2 py-0.5">{unreadCount} unread</span>
            )}
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">AI-powered portfolio notifications</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary text-xs gap-1.5 py-2"><CheckCheck className="w-4 h-4" /> Mark All Read</button>
          <button className="btn-secondary text-xs gap-1.5 py-2"><Trash2 className="w-4 h-4 text-rose-400" /> Clear Read</button>
        </div>
      </div>

      <div className="space-y-3">
        {alerts.map((alert, i) => (
          <motion.div key={alert.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`rounded-xl p-4 flex gap-4 ${severityStyles[alert.severity]} ${!alert.read ? '' : 'opacity-60'}`}>
            <span className="text-xl flex-shrink-0">{alert.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h3 className={`text-sm font-semibold ${alert.read ? 'text-slate-300' : 'text-white'}`}>
                  {alert.title}
                </h3>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {!alert.read && <span className="w-2 h-2 rounded-full bg-brand-400 flex-shrink-0" />}
                  <span className="text-2xs text-slate-500">{alert.time}</span>
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">{alert.message}</p>
              {alert.symbol && (
                <span className="badge-brand text-2xs mt-2 inline-block">{alert.symbol}</span>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
