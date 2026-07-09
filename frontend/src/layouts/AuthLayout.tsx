import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, Shield, Brain, BarChart3 } from 'lucide-react';

const features = [
  { icon: Brain,    text: 'GPT-4 AI Financial Coach'         },
  { icon: BarChart3, text: 'Real-time Portfolio Analytics'   },
  { icon: Shield,   text: 'Enterprise-grade Security'        },
  { icon: TrendingUp, text: 'Smart Investment Recommendations' },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-dark-950">

      {/* Left Panel — Brand */}
      <div className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 via-dark-950 to-accent-violet/10" />
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-brand-600/10 blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-accent-violet/10 blur-3xl translate-x-1/4 translate-y-1/4" />

        <div className="relative">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-accent-violet flex items-center justify-center shadow-glow">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-lg font-black font-display gradient-text">InvestIQ AI</div>
              <div className="text-xs text-slate-500">AI-Driven Portfolio Advisor</div>
            </div>
          </div>

          {/* Hero text */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h1 className="text-4xl font-black font-display text-white leading-tight mb-4">
              Your AI-Powered<br />
              <span className="gradient-text">Financial Coach</span><br />
              is waiting.
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              Track portfolios, get GPT-4 investment insights, plan goals, and stress-test your wealth — all in one premium platform.
            </p>
          </motion.div>
        </div>

        {/* Features */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="relative space-y-3">
          {features.map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.1 }}
              className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand-500/20 flex items-center justify-center">
                <f.icon className="w-4 h-4 text-brand-400" />
              </div>
              <span className="text-sm text-slate-300">{f.text}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Footer */}
        <div className="relative text-xs text-slate-600">
          © 2025 InvestIQ AI · Built with ❤️ for smart investors
        </div>
      </div>

      {/* Right Panel — Auth Form */}
      <div className="flex items-center justify-center px-6 py-12 lg:px-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-accent-violet flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <span className="font-black font-display gradient-text">InvestIQ AI</span>
          </div>

          {children || <Outlet />}
        </div>
      </div>
    </div>
  );
}
