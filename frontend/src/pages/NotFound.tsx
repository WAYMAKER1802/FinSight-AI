import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, TrendingUp } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-950 px-6">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-brand-600/10 blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-accent-violet/10 blur-3xl animate-pulse-slow" />
      </div>

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        className="relative text-center max-w-md">
        <div className="text-9xl font-black font-display gradient-text mb-4">404</div>
        <h1 className="text-2xl font-bold text-white mb-3">Page not found</h1>
        <p className="text-slate-400 text-sm mb-8 leading-relaxed">
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => window.history.back()} className="btn-secondary gap-2 text-sm">
            <ArrowLeft className="w-4 h-4" /> Go Back
          </button>
          <Link to="/app/dashboard" className="btn-primary gap-2 text-sm">
            <Home className="w-4 h-4" /> Dashboard
          </Link>
        </div>
        <div className="mt-8 flex items-center justify-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-accent-violet flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold font-display gradient-text">FinSight AI</span>
        </div>
      </motion.div>
    </div>
  );
}
