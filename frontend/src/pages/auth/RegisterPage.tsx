import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

const schema = z.object({
  name    : z.string().min(2, 'Name must be at least 2 characters'),
  email   : z.string().email('Enter a valid email'),
  password: z.string()
    .min(8, 'Minimum 8 characters')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[0-9]/, 'Must contain a number'),
  riskProfile: z.enum(['conservative', 'moderate', 'moderately_aggressive', 'aggressive']).optional(),
});

type FormData = z.infer<typeof schema>;

const riskProfiles = [
  { value: 'conservative',          label: '🛡️ Conservative', desc: 'Low risk, steady returns' },
  { value: 'moderate',              label: '⚖️ Moderate',      desc: 'Balanced risk & returns' },
  { value: 'moderately_aggressive', label: '📈 Growth',        desc: 'Higher risk for growth' },
  { value: 'aggressive',            label: '🚀 Aggressive',    desc: 'Maximum growth potential' },
];

export default function RegisterPage() {
  const [showPass,  setShowPass]  = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [step,      setStep]      = useState<1 | 2>(1);
  const navigate    = useNavigate();
  const { register: registerUser } = useAuthStore();

  const { register, handleSubmit, watch, formState: { errors }, trigger } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { riskProfile: 'moderate' },
  });

  const goToStep2 = async () => {
    const valid = await trigger(['name', 'email', 'password']);
    if (valid) setStep(2);
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await registerUser(data);
      toast.success('Welcome to FinSight AI! 🎉');
      navigate('/app/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  const password = watch('password', '');
  const strength = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <div className="mb-8">
        <h1 className="text-3xl font-black font-display text-white mb-2">Create your account</h1>
        <p className="text-slate-400 text-sm">Start your AI-powered investing journey</p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-3 mb-8">
        {[1, 2].map(s => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              s < step ? 'bg-emerald-500 text-white' :
              s === step ? 'bg-brand-500 text-white' :
              'bg-white/10 text-slate-500'
            }`}>
              {s < step ? <CheckCircle2 className="w-4 h-4" /> : s}
            </div>
            <span className={`text-xs ${s === step ? 'text-white font-medium' : 'text-slate-500'}`}>
              {s === 1 ? 'Basic Info' : 'Risk Profile'}
            </span>
            {s < 2 && <div className="w-8 h-px bg-white/10" />}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
            {/* Name */}
            <div>
              <label className="label">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input {...register('name')} type="text" id="name" placeholder="Arjun Sharma"
                  className={`input pl-10 ${errors.name ? 'border-rose-500/60' : ''}`} />
              </div>
              {errors.name && <p className="text-xs text-rose-400 mt-1">{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input {...register('email')} type="email" id="email" placeholder="you@example.com"
                  className={`input pl-10 ${errors.email ? 'border-rose-500/60' : ''}`} />
              </div>
              {errors.email && <p className="text-xs text-rose-400 mt-1">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input {...register('password')} type={showPass ? 'text' : 'password'} id="password"
                  placeholder="Min. 8 chars, 1 uppercase, 1 number"
                  className={`input pl-10 pr-10 ${errors.password ? 'border-rose-500/60' : ''}`} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* Strength meter */}
              {password && (
                <div className="mt-2 space-y-1.5">
                  <div className="flex gap-1">
                    {[1,2,3,4].map(i => (
                      <div key={i} className={`flex-1 h-1 rounded-full transition-all ${
                        i <= strength
                          ? strength <= 1 ? 'bg-rose-500'
                          : strength <= 2 ? 'bg-amber-500'
                          : strength <= 3 ? 'bg-yellow-400'
                          : 'bg-emerald-500'
                          : 'bg-white/10'
                      }`} />
                    ))}
                  </div>
                  <p className="text-2xs text-slate-500">
                    {strength <= 1 ? 'Weak' : strength <= 2 ? 'Fair' : strength <= 3 ? 'Good' : 'Strong'} password
                  </p>
                </div>
              )}
              {errors.password && <p className="text-xs text-rose-400 mt-1">{errors.password.message}</p>}
            </div>

            <button type="button" onClick={goToStep2} id="next-step-btn" className="btn-primary w-full py-3 text-sm">
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <p className="text-sm text-slate-400 mb-6">
              What best describes your investment style? This helps us personalize your experience.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {riskProfiles.map(p => (
                <label key={p.value}
                  className={`relative flex flex-col p-4 rounded-xl border cursor-pointer transition-all ${
                    watch('riskProfile') === p.value
                      ? 'border-brand-500/60 bg-brand-500/10'
                      : 'border-white/10 hover:border-white/20 bg-white/5'
                  }`}>
                  <input {...register('riskProfile')} type="radio" value={p.value} className="sr-only" />
                  <span className="text-lg mb-1">{p.label.split(' ')[0]}</span>
                  <span className="text-xs font-semibold text-white">{p.label.split(' ').slice(1).join(' ')}</span>
                  <span className="text-2xs text-slate-500 mt-0.5">{p.desc}</span>
                  {watch('riskProfile') === p.value && (
                    <CheckCircle2 className="absolute top-2 right-2 w-4 h-4 text-brand-400" />
                  )}
                </label>
              ))}
            </div>

            <div className="flex gap-3 mt-6">
              <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1 py-3 text-sm">
                Back
              </button>
              <button type="submit" id="register-btn" disabled={loading} className="btn-primary flex-1 py-3 text-sm">
                {loading ? 'Creating...' : 'Create Account 🎉'}
              </button>
            </div>
          </motion.div>
        )}
      </form>

      <p className="text-center text-sm text-slate-500 mt-6">
        Already have an account?{' '}
        <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium">Sign in</Link>
      </p>
    </motion.div>
  );
}
