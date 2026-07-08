import { motion } from 'framer-motion';
import { User, Mail, Phone, Shield, TrendingUp, Edit3, Award, Camera } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const recentActivity = [
  { icon: '📊', text: 'Generated Portfolio Report', time: '2h ago' },
  { icon: '🧠', text: 'AI chat: "Analyze my portfolio"', time: '5h ago' },
  { icon: '📈', text: 'Added HDFCBANK to portfolio', time: '1d ago' },
  { icon: '🎯', text: 'Updated retirement goal SIP', time: '2d ago' },
  { icon: '⚠️', text: 'Acknowledged rebalancing alert', time: '3d ago' },
];

const stats = [
  { label: 'Portfolios',    value: '1' },
  { label: 'Total Assets',  value: '7' },
  { label: 'Goals Set',     value: '4' },
  { label: 'Days Active',   value: '142' },
];

export default function Profile() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-black font-display text-white">My Profile</h1>
        <p className="text-slate-400 text-sm mt-0.5">Manage your personal information</p>
      </div>

      {/* Profile Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="card-static p-6 flex flex-col sm:flex-row items-start gap-6">
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-violet flex items-center justify-center text-3xl font-bold text-white shadow-glow">
            {user?.name?.[0]?.toUpperCase() || 'A'}
          </div>
          <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-dark-800 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all">
            <Camera className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-black font-display text-white">{user?.name || 'Arjun Sharma'}</h2>
              <p className="text-slate-400 text-sm">{user?.email || 'arjun@demo.com'}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="badge-gold">{user?.role || 'premium'} plan</span>
                <span className="badge-brand">🏆 Wealth Builder</span>
              </div>
            </div>
            <button className="btn-secondary text-xs gap-1.5 py-2">
              <Edit3 className="w-3.5 h-3.5" /> Edit
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-3 mt-5">
            {stats.map(s => (
              <div key={s.label} className="text-center">
                <div className="text-xl font-black font-display gradient-text">{s.value}</div>
                <div className="text-2xs text-slate-500">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Profile Details */}
      <div className="grid md:grid-cols-2 gap-4">
        {[
          { icon: <User className="w-4 h-4" />, label: 'Full Name', value: user?.name || 'Arjun Sharma' },
          { icon: <Mail className="w-4 h-4" />, label: 'Email', value: user?.email || 'arjun@demo.com' },
          { icon: <Phone className="w-4 h-4" />, label: 'Phone', value: '+91 98765 43210' },
          { icon: <Shield className="w-4 h-4" />, label: 'Risk Profile', value: 'Moderately Aggressive' },
          { icon: <TrendingUp className="w-4 h-4" />, label: 'Investment Horizon', value: 'Long-term (7+ years)' },
          { icon: <Award className="w-4 h-4" />, label: 'Member Since', value: 'January 2025' },
        ].map(d => (
          <div key={d.label} className="card-static p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 flex-shrink-0">
              {d.icon}
            </div>
            <div>
              <div className="text-2xs text-slate-500">{d.label}</div>
              <div className="text-sm font-semibold text-white mt-0.5">{d.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="card-static p-5">
        <h3 className="text-sm font-bold text-white mb-4 font-display">Recent Activity</h3>
        <div className="space-y-3">
          {recentActivity.map((a, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-lg">{a.icon}</span>
              <span className="text-xs text-slate-300 flex-1">{a.text}</span>
              <span className="text-2xs text-slate-500 flex-shrink-0">{a.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
