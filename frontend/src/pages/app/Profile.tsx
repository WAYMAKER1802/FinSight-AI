import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Phone, Shield, TrendingUp, Edit3, Award, Camera, X, Loader2, Lock, ShieldCheck, Key } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { usePortfolioStore } from '@/store/portfolioStore';
import { userApi } from '@/api/user.api';
import toast from 'react-hot-toast';

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

const riskProfileMap: Record<string, string> = {
  conservative: 'Conservative',
  moderate: 'Moderate',
  moderately_aggressive: 'Moderately Aggressive',
  aggressive: 'Aggressive',
  very_aggressive: 'Very Aggressive'
};

const investmentHorizonMap: Record<string, string> = {
  short_term: 'Short-term (1-3 years)',
  medium_term: 'Medium-term (3-7 years)',
  long_term: 'Long-term (7+ years)'
};

export default function Profile() {
  const { user, updateUser } = useAuthStore();
  const { portfolios, fetchPortfolios } = usePortfolioStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchPortfolios();
  }, [fetchPortfolios]);

  // mPIN Modal States
  const [mpinModal, setMpinModal] = useState<'setup' | 'reset' | 'disable' | null>(null);
  const [mpinForm, setMpinForm] = useState({ pin: '', newPin: '', password: '' });

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    riskProfile: user?.riskProfile || 'moderate',
    investmentHorizon: user?.investmentHorizon || 'long_term',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleMpinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMpinForm({ ...mpinForm, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const { user: updatedUser } = await userApi.updateProfile(formData);
      updateUser(updatedUser);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleMpinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (mpinModal === 'setup') {
        await userApi.setupMPin({ pin: mpinForm.pin });
        updateUser({ mfaEnabled: true });
        toast.success('mPIN enabled securely.');
      } else if (mpinModal === 'reset') {
        await userApi.resetMPin({ password: mpinForm.password, newPin: mpinForm.newPin });
        toast.success('mPIN reset successfully.');
      } else if (mpinModal === 'disable') {
        await userApi.disableMPin({ password: mpinForm.password });
        updateUser({ mfaEnabled: false });
        toast.success('mPIN disabled.');
      }
      setMpinModal(null);
      setMpinForm({ pin: '', newPin: '', password: '' });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Action failed.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    setIsUploading(true);
    try {
      const { user: updatedUser } = await userApi.uploadAvatar(formData);
      updateUser(updatedUser);
      toast.success('Avatar updated successfully');
    } catch (error) {
      console.error('Failed to update avatar', error);
      toast.error('Failed to update avatar');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-black font-display text-white">My Profile</h1>
        <p className="text-slate-400 text-sm mt-0.5">Manage your personal information</p>
      </div>

      {/* Profile Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="card-static p-6 flex flex-col sm:flex-row items-start gap-6">
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-violet flex items-center justify-center text-3xl font-bold text-white shadow-glow">
            {user?.avatar ? (
               <img src={user.avatar} alt="Avatar" className="w-full h-full rounded-2xl object-cover" />
            ) : (
               user?.name?.[0]?.toUpperCase() || 'A'
            )}
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleAvatarChange} 
            accept="image/*" 
            className="hidden" 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-dark-800 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all z-10 cursor-pointer"
          >
            {isUploading ? <Loader2 className="w-3.5 h-3.5 text-slate-400 animate-spin" /> : <Camera className="w-3.5 h-3.5 text-slate-400" />}
          </button>
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-black font-display text-white">{user?.name || 'Investor'}</h2>
              <p className="text-slate-400 text-sm">{user?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="badge-gold">{user?.role || 'premium'} plan</span>
                <span className="badge-brand">🏆 Wealth Builder</span>
              </div>
            </div>
            <button onClick={() => setIsEditing(true)} className="btn-secondary text-xs gap-1.5 py-2">
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
          { icon: <User className="w-4 h-4" />, label: 'Full Name', value: user?.name || 'Not provided' },
          { icon: <Mail className="w-4 h-4" />, label: 'Email', value: user?.email || 'Not provided' },
          { icon: <Phone className="w-4 h-4" />, label: 'Phone', value: user?.phone || 'Not provided' },
          { icon: <Shield className="w-4 h-4" />, label: 'Risk Profile', value: riskProfileMap[user?.riskProfile || ''] || 'Moderate' },
          { icon: <TrendingUp className="w-4 h-4" />, label: 'Investment Horizon', value: investmentHorizonMap[user?.investmentHorizon || ''] || 'Not provided' },
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

      {/* Security Settings */}
      <div className="card-static p-5">
        <div className="flex items-center gap-2 mb-4">
          <Lock className="w-5 h-5 text-brand-400" />
          <h3 className="text-sm font-bold text-white font-display">Security Settings</h3>
        </div>
        
        <div className="flex items-center justify-between p-4 bg-dark-800 rounded-xl border border-white/5">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${user?.mfaEnabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-slate-400'}`}>
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">4-Digit mPIN Login</h4>
              <p className="text-xs text-slate-400 mt-0.5">Extra layer of security for your account</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {user?.mfaEnabled ? (
              <>
                <button onClick={() => setMpinModal('reset')} className="btn-secondary text-xs py-1.5 px-3 gap-1"><Key className="w-3.5 h-3.5"/> Reset PIN</button>
                <button onClick={() => setMpinModal('disable')} className="bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors">Disable</button>
              </>
            ) : (
              <button onClick={() => setMpinModal('setup')} className="btn-primary text-xs py-1.5 px-4">Enable mPIN</button>
            )}
          </div>
        </div>
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

      {/* Portfolios & Assets */}
      <div className="card-static p-5">
        <h3 className="text-sm font-bold text-white mb-4 font-display">My Portfolios & Assets</h3>
        {portfolios.length === 0 ? (
          <p className="text-sm text-slate-400">No portfolios found. Go to Holdings to create one.</p>
        ) : (
          <div className="space-y-6">
            {portfolios.map(p => (
              <div key={p.id} className="bg-dark-800 rounded-xl border border-white/5 p-4">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h4 className="text-lg font-bold text-white">{p.name}</h4>
                    <p className="text-xs text-slate-400">{p.assetCount || 0} Assets • Total Value: ₹{(p.totalCurrentValue || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                  </div>
                  <span className="badge-brand text-xs px-2 py-1 bg-brand-500/10 text-brand-400 rounded-md">
                    {p.currency}
                  </span>
                </div>
                
                {p.assets && p.assets.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-4">
                    {p.assets.map(asset => (
                      <div key={asset.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-white">{asset.symbol}</span>
                          <span className="text-xs text-slate-500 capitalize">{asset.type?.replace('_', ' ')}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-white">Qty: {asset.quantity}</div>
                          <div className="text-xs text-emerald-400 font-semibold font-numeric">
                            ₹{(asset.currentValue || 0).toLocaleString('en-IN')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 mt-2">No assets in this portfolio.</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsEditing(false)}
            />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-dark-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
              
              <div className="flex items-center justify-between p-5 border-b border-white/5">
                <h3 className="text-lg font-bold text-white font-display">Edit Profile</h3>
                <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Full Name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange}
                    className="w-full bg-dark-800 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500" required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Phone Number</label>
                  <input type="text" name="phone" value={formData.phone} onChange={handleChange}
                    className="w-full bg-dark-800 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Risk Profile</label>
                  <select name="riskProfile" value={formData.riskProfile} onChange={handleChange}
                    className="w-full bg-dark-800 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500">
                    <option value="conservative">Conservative</option>
                    <option value="moderate">Moderate</option>
                    <option value="moderately_aggressive">Moderately Aggressive</option>
                    <option value="aggressive">Aggressive</option>
                    <option value="very_aggressive">Very Aggressive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Investment Horizon</label>
                  <select name="investmentHorizon" value={formData.investmentHorizon} onChange={handleChange}
                    className="w-full bg-dark-800 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500">
                    <option value="short_term">Short-term (1-3 years)</option>
                    <option value="medium_term">Medium-term (3-7 years)</option>
                    <option value="long_term">Long-term (7+ years)</option>
                  </select>
                </div>

                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setIsEditing(false)}
                    className="flex-1 btn-secondary py-2.5">Cancel</button>
                  <button type="submit" disabled={isSaving}
                    className="flex-1 btn-primary py-2.5">
                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* mPIN Management Modal */}
      <AnimatePresence>
        {mpinModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => { setMpinModal(null); setMpinForm({pin:'', newPin:'', password:''}); }}
            />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-dark-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
              
              <div className="flex items-center justify-between p-5 border-b border-white/5">
                <h3 className="text-lg font-bold text-white font-display">
                  {mpinModal === 'setup' ? 'Setup 4-Digit mPIN' : mpinModal === 'reset' ? 'Reset mPIN' : 'Disable mPIN'}
                </h3>
                <button onClick={() => { setMpinModal(null); setMpinForm({pin:'', newPin:'', password:''}); }} className="text-slate-400 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleMpinSubmit} className="p-5 space-y-4">
                {(mpinModal === 'reset' || mpinModal === 'disable') && (
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Confirm Current Password</label>
                    <input type="password" name="password" maxLength={50} value={mpinForm.password} onChange={handleMpinChange}
                      className="w-full bg-dark-800 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500" required />
                  </div>
                )}

                {mpinModal === 'setup' && (
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Enter 4-Digit PIN</label>
                    <input type="password" name="pin" maxLength={4} minLength={4} pattern="\d{4}" value={mpinForm.pin} onChange={handleMpinChange}
                      className="w-full bg-dark-800 border border-white/10 rounded-xl px-4 py-2.5 text-2xl tracking-widest text-center text-white focus:outline-none focus:border-brand-500" required />
                  </div>
                )}

                {mpinModal === 'reset' && (
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Enter New 4-Digit PIN</label>
                    <input type="password" name="newPin" maxLength={4} minLength={4} pattern="\d{4}" value={mpinForm.newPin} onChange={handleMpinChange}
                      className="w-full bg-dark-800 border border-white/10 rounded-xl px-4 py-2.5 text-2xl tracking-widest text-center text-white focus:outline-none focus:border-brand-500" required />
                  </div>
                )}

                {mpinModal === 'disable' && (
                  <p className="text-sm text-rose-400">Are you sure you want to disable mPIN login? This will reduce the security of your account.</p>
                )}

                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => { setMpinModal(null); setMpinForm({pin:'', newPin:'', password:''}); }}
                    className="flex-1 btn-secondary py-2.5">Cancel</button>
                  <button type="submit" disabled={isSaving}
                    className={`flex-1 py-2.5 rounded-xl font-semibold transition-all ${mpinModal === 'disable' ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/20' : 'btn-primary'}`}>
                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Confirm'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
