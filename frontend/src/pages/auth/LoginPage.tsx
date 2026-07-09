import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import { GoogleLogin } from '@react-oauth/google';

const schema = z.object({
  email   : z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [tempToken, setTempToken] = useState<string | null>(null);
  const [pin, setPin] = useState(['', '', '', '']);
  const pinRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];
  
  const navigate   = useNavigate();
  const { login, verifyMPin, googleLogin } = useAuthStore();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await login(data.email, data.password);
      if (res?.requiresMPin) {
        setTempToken(res.tempToken || null);
        setStep(2);
        toast.success('Please enter your 4-digit mPIN.');
      } else {
        toast.success('Welcome back! 👋');
        navigate('/app/dashboard');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handlePinChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);

    // Auto-focus next
    if (value && index < 3) {
      pinRefs[index + 1].current?.focus();
    }
  };

  const handlePinKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      pinRefs[index - 1].current?.focus();
    }
  };

  useEffect(() => {
    const submitPin = async () => {
      const fullPin = pin.join('');
      if (fullPin.length === 4 && tempToken) {
        setLoading(true);
        try {
          await verifyMPin(tempToken, fullPin);
          toast.success('Welcome back! 👋');
          navigate('/app/dashboard');
        } catch (err: any) {
          toast.error(err.response?.data?.message || 'Incorrect PIN.');
          setPin(['', '', '', '']);
          pinRefs[0].current?.focus();
        } finally {
          setLoading(false);
        }
      }
    };
    submitPin();
  }, [pin, tempToken, verifyMPin, navigate]);

  if (step === 2) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="mb-8 text-center">
          <div className="w-16 h-16 bg-brand-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-brand-500/30">
            <ShieldCheck className="w-8 h-8 text-brand-400" />
          </div>
          <h1 className="text-3xl font-black font-display text-white mb-2">Enter mPIN</h1>
          <p className="text-slate-400 text-sm">Enter your 4-digit security PIN to continue</p>
        </div>

        <div className="flex justify-center gap-4 mb-8">
          {pin.map((digit, i) => (
            <input
              key={i}
              ref={pinRefs[i]}
              type="password"
              maxLength={1}
              value={digit}
              onChange={(e) => handlePinChange(i, e.target.value)}
              onKeyDown={(e) => handlePinKeyDown(i, e)}
              className="w-14 h-14 text-center text-2xl font-bold bg-dark-800 border border-white/10 rounded-xl text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
            />
          ))}
        </div>

        <button
          type="button"
          disabled={loading}
          className="btn-primary w-full py-3 text-sm mb-4"
        >
          {loading ? (
            <><span className="spinner w-4 h-4 border-2" /> Verifying...</>
          ) : (
            <>Verify PIN</>
          )}
        </button>

        <button 
          onClick={() => { setStep(1); setPin(['','','','']); setTempToken(null); }}
          className="text-xs text-slate-400 hover:text-white w-full text-center transition-colors"
        >
          Back to Login
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-8">
        <h1 className="text-3xl font-black font-display text-white mb-2">Welcome back</h1>
        <p className="text-slate-400 text-sm">Sign in to your InvestIQ AI account</p>
      </div>

      {/* Demo credentials hint */}
      <div className="mb-6 p-3 rounded-xl border border-brand-500/30 bg-brand-500/10 text-xs text-brand-300">
        <span className="font-semibold">Demo: </span>arjun@demo.com / Demo@1234
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {/* Email */}
        <div>
          <label className="label">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              {...register('email')}
              type="email"
              id="email"
              placeholder="you@example.com"
              autoComplete="email"
              className={`input pl-10 ${errors.email ? 'border-rose-500/60' : ''}`}
            />
          </div>
          {errors.email && <p className="text-xs text-rose-400 mt-1">{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="label mb-0">Password</label>
            <Link to="/forgot-password" className="text-xs text-brand-400 hover:text-brand-300 transition-colors">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              {...register('password')}
              type={showPass ? 'text' : 'password'}
              id="password"
              placeholder="••••••••"
              autoComplete="current-password"
              className={`input pl-10 pr-10 ${errors.password ? 'border-rose-500/60' : ''}`}
            />
            <button type="button" onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-rose-400 mt-1">{errors.password.message}</p>}
        </div>

        {/* Submit */}
        <button
          type="submit"
          id="login-btn"
          disabled={loading}
          className="btn-primary w-full py-3 text-sm"
        >
          {loading ? (
            <><span className="spinner w-4 h-4 border-2" /> Signing in...</>
          ) : (
            <><Sparkles className="w-4 h-4" /> Sign In <ArrowRight className="w-4 h-4" /></>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="my-6 flex items-center gap-3">
        <div className="flex-1 divider" />
        <span className="text-xs text-slate-600">or continue with</span>
        <div className="flex-1 divider" />
      </div>

      {/* OAuth Integration */}
      <div className="flex justify-center w-full">
        <GoogleLogin
          onSuccess={async (credentialResponse) => {
            if (credentialResponse.credential) {
              setLoading(true);
              try {
                await googleLogin(credentialResponse.credential);
                toast.success('Google Sign-in successful! 👋');
                navigate('/app/dashboard');
              } catch (err: any) {
                toast.error(err.response?.data?.message || 'Google Sign-in failed.');
              } finally {
                setLoading(false);
              }
            }
          }}
          onError={() => {
            toast.error('Google Sign-in was unsuccessful or cancelled.');
          }}
          useOneTap
          theme="filled_black"
          shape="circle"
          width="100%"
          text="continue_with"
        />
      </div>

      {/* Sign up link */}
      <p className="text-center text-sm text-slate-500 mt-6">
        Don't have an account?{' '}
        <Link to="/register" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
          Create one free
        </Link>
      </p>
    </motion.div>
  );
}
