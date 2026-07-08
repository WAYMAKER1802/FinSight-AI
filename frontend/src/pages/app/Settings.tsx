import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Bell, Shield, Palette, Brain, Save, User, Globe, Moon, Sun, Key } from 'lucide-react';

const tabs = [
  { id: 'profile',        label: 'Profile',         icon: <User className="w-4 h-4" /> },
  { id: 'notifications',  label: 'Notifications',   icon: <Bell className="w-4 h-4" /> },
  { id: 'ai',             label: 'AI Preferences',  icon: <Brain className="w-4 h-4" /> },
  { id: 'security',       label: 'Security',        icon: <Shield className="w-4 h-4" /> },
  { id: 'appearance',     label: 'Appearance',      icon: <Palette className="w-4 h-4" /> },
];

const Toggle = ({ label, desc, enabled, onChange }: { label: string; desc: string; enabled: boolean; onChange: () => void }) => (
  <div className="flex items-center justify-between py-3">
    <div>
      <div className="text-sm font-medium text-white">{label}</div>
      <div className="text-xs text-slate-500 mt-0.5">{desc}</div>
    </div>
    <button onClick={onChange}
      className={`w-11 h-6 rounded-full transition-all duration-200 relative flex-shrink-0 ${enabled ? 'bg-brand-500' : 'bg-white/10'}`}>
      <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-200 ${enabled ? 'left-5.5' : 'left-0.5'}`} />
    </button>
  </div>
);

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const [notifications, setNotifications] = useState({
    emailAlerts: true, pushAlerts: true, priceAlerts: true, aiInsights: true,
    weeklyReport: true, newsDigest: false, marketOpen: true, goalUpdates: true,
  });
  const [aiPrefs, setAiPrefs] = useState({
    autoAnalysis: true, riskWarnings: true, newsIntegration: true, personalizedSuggestions: true,
  });

  const toggleNotif = (key: keyof typeof notifications) =>
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  const toggleAI = (key: keyof typeof aiPrefs) =>
    setAiPrefs(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black font-display text-white">Settings</h1>
        <p className="text-slate-400 text-sm mt-0.5">Manage your account preferences</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Tab Navigation */}
        <div className="card-static p-3 h-fit">
          <nav className="space-y-1">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={`sidebar-item w-full ${activeTab === t.id ? 'active' : ''}`}>
                {t.icon}
                <span>{t.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="lg:col-span-3 card-static p-6">
          {activeTab === 'profile' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
              <h2 className="text-base font-bold text-white font-display">Profile Settings</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {[{ label: 'Full Name', val: 'Arjun Sharma', type: 'text' },
                  { label: 'Email', val: 'arjun@demo.com', type: 'email' },
                  { label: 'Phone', val: '+91 98765 43210', type: 'tel' },
                  { label: 'Annual Income (₹)', val: '24,00,000', type: 'text' }].map(f => (
                  <div key={f.label}>
                    <label className="label">{f.label}</label>
                    <input type={f.type} defaultValue={f.val} className="input" />
                  </div>
                ))}
              </div>
              <div>
                <label className="label">Risk Profile</label>
                <select className="input">
                  <option value="moderate">Moderate</option>
                  <option value="conservative">Conservative</option>
                  <option value="moderately_aggressive">Moderately Aggressive</option>
                  <option value="aggressive">Aggressive</option>
                </select>
              </div>
              <div>
                <label className="label">Investment Goals</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {['Wealth Creation', 'Retirement', 'Child Education', 'Home Purchase'].map(g => (
                    <button key={g} className="badge-brand px-3 py-1.5 text-xs rounded-full cursor-pointer hover:bg-brand-500/25 transition-all">{g} ×</button>
                  ))}
                  <button className="badge-neutral px-3 py-1.5 text-xs rounded-full hover:bg-white/10">+ Add Goal</button>
                </div>
              </div>
              <button className="btn-primary text-sm gap-2"><Save className="w-4 h-4" /> Save Changes</button>
            </motion.div>
          )}

          {activeTab === 'notifications' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-1 divide-y divide-white/5">
              <h2 className="text-base font-bold text-white font-display mb-3">Notification Preferences</h2>
              <Toggle label="Email Alerts" desc="Receive alerts via email" enabled={notifications.emailAlerts} onChange={() => toggleNotif('emailAlerts')} />
              <Toggle label="Push Notifications" desc="Browser & mobile push notifications" enabled={notifications.pushAlerts} onChange={() => toggleNotif('pushAlerts')} />
              <Toggle label="Price Alerts" desc="Stock price target & stop loss alerts" enabled={notifications.priceAlerts} onChange={() => toggleNotif('priceAlerts')} />
              <Toggle label="AI Insights" desc="Daily AI analysis and recommendations" enabled={notifications.aiInsights} onChange={() => toggleNotif('aiInsights')} />
              <Toggle label="Weekly Report" desc="Auto-generated weekly portfolio report" enabled={notifications.weeklyReport} onChange={() => toggleNotif('weeklyReport')} />
              <Toggle label="News Digest" desc="Morning financial news summary" enabled={notifications.newsDigest} onChange={() => toggleNotif('newsDigest')} />
              <Toggle label="Market Open/Close" desc="Alert when markets open and close" enabled={notifications.marketOpen} onChange={() => toggleNotif('marketOpen')} />
              <Toggle label="Goal Updates" desc="Progress updates on your financial goals" enabled={notifications.goalUpdates} onChange={() => toggleNotif('goalUpdates')} />
            </motion.div>
          )}

          {activeTab === 'ai' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-1 divide-y divide-white/5">
              <h2 className="text-base font-bold text-white font-display mb-3">AI Preferences</h2>
              <Toggle label="Auto Portfolio Analysis" desc="AI analyzes your portfolio daily automatically" enabled={aiPrefs.autoAnalysis} onChange={() => toggleAI('autoAnalysis')} />
              <Toggle label="Risk Warnings" desc="AI warns you when portfolio risk increases" enabled={aiPrefs.riskWarnings} onChange={() => toggleAI('riskWarnings')} />
              <Toggle label="News Integration" desc="AI connects news to your holdings" enabled={aiPrefs.newsIntegration} onChange={() => toggleAI('newsIntegration')} />
              <Toggle label="Personalized Suggestions" desc="AI learns from your behavior to improve recommendations" enabled={aiPrefs.personalizedSuggestions} onChange={() => toggleAI('personalizedSuggestions')} />
              <div className="pt-3">
                <label className="label">AI Response Style</label>
                <select className="input mt-1">
                  <option>Detailed Explanations</option>
                  <option>Brief & Direct</option>
                  <option>Technical Analysis Focus</option>
                  <option>Layman Friendly</option>
                </select>
              </div>
            </motion.div>
          )}

          {activeTab === 'security' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
              <h2 className="text-base font-bold text-white font-display">Security Settings</h2>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3">
                  <Shield className="w-5 h-5 text-emerald-400" />
                  <div>
                    <div className="text-sm font-semibold text-emerald-400">Account is Secure</div>
                    <div className="text-xs text-slate-400">Last login: Today 9:45 AM · Mumbai, India</div>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white mb-3">Change Password</h3>
                  <div className="space-y-3">
                    <input type="password" placeholder="Current Password" className="input" />
                    <input type="password" placeholder="New Password (min 8 chars)" className="input" />
                    <input type="password" placeholder="Confirm New Password" className="input" />
                    <button className="btn-primary text-sm"><Key className="w-4 h-4" /> Update Password</button>
                  </div>
                </div>
                <div className="pt-3 border-t border-white/5">
                  <h3 className="text-sm font-semibold text-white mb-3">Two-Factor Authentication</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-slate-300">Authenticator App</div>
                      <div className="text-xs text-slate-500">Adds an extra layer of security</div>
                    </div>
                    <button className="btn-secondary text-xs">Enable 2FA</button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'appearance' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
              <h2 className="text-base font-bold text-white font-display">Appearance</h2>
              <div>
                <label className="label">Theme</label>
                <div className="grid grid-cols-3 gap-3 mt-2">
                  {[{ icon: <Moon className="w-4 h-4" />, label: 'Dark (Default)', active: true },
                    { icon: <Sun className="w-4 h-4" />, label: 'Light', active: false },
                    { icon: <Globe className="w-4 h-4" />, label: 'System', active: false }].map(t => (
                    <button key={t.label} className={`p-3 rounded-xl border text-center transition-all ${t.active ? 'border-brand-500/50 bg-brand-500/10 text-brand-300' : 'border-white/10 text-slate-400 hover:border-white/20'}`}>
                      <div className="flex justify-center mb-1">{t.icon}</div>
                      <div className="text-xs">{t.label}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label">Accent Color</label>
                <div className="flex gap-2 mt-2">
                  {['#667eea', '#10b981', '#f59e0b', '#f43f5e', '#06b6d4', '#8b5cf6'].map(c => (
                    <button key={c} className="w-7 h-7 rounded-full border-2 border-transparent hover:border-white/50 transition-all"
                      style={{ background: c }} />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
