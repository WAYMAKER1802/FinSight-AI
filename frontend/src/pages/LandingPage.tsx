import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, Brain, Shield, Target, BarChart3, Zap, Star, ArrowRight,
  ChevronRight, Sparkles, Bot, LineChart, PieChart, Bell, FileText,
  CheckCircle2, Play, Globe, Users, Award, DollarSign
} from 'lucide-react';

// ── Feature Data ────────────────────────────────────────────────────────────
const features = [
  {
    icon : <Brain className="w-6 h-6" />,
    title: 'AI Portfolio Analysis',
    desc : 'Get a complete 360° health check of your portfolio powered by GPT-4. Uncover hidden risks, opportunities, and actionable insights in seconds.',
    color: 'from-violet-500/20 to-purple-600/10',
    border: 'border-violet-500/20',
    iconBg: 'bg-violet-500/10 text-violet-400',
  },
  {
    icon : <TrendingUp className="w-6 h-6" />,
    title: 'Buy / Hold / Sell Engine',
    desc : 'AI-powered recommendations for every stock in your portfolio, backed by fundamental analysis, technical indicators, and real-time sentiment.',
    color: 'from-emerald-500/20 to-teal-600/10',
    border: 'border-emerald-500/20',
    iconBg: 'bg-emerald-500/10 text-emerald-400',
  },
  {
    icon : <Shield className="w-6 h-6" />,
    title: 'AI Risk Assessment',
    desc : 'Know exactly how risky your portfolio is. Stress-test against market crashes, measure VaR, and get a one-click risk reduction plan.',
    color: 'from-rose-500/20 to-orange-600/10',
    border: 'border-rose-500/20',
    iconBg: 'bg-rose-500/10 text-rose-400',
  },
  {
    icon : <Target className="w-6 h-6" />,
    title: 'Goal-Based Planning',
    desc : 'Set financial goals — retirement, education, home — and get a personalized SIP plan with milestone tracking and AI-driven course corrections.',
    color: 'from-amber-500/20 to-yellow-600/10',
    border: 'border-amber-500/20',
    iconBg: 'bg-amber-500/10 text-amber-400',
  },
  {
    icon : <Bot className="w-6 h-6" />,
    title: 'AI Financial Coach',
    desc : 'Chat with your 24/7 AI financial advisor. Get expert answers to "Should I invest in gold?" or "How do I beat inflation?" — tailored to your portfolio.',
    color: 'from-cyan-500/20 to-blue-600/10',
    border: 'border-cyan-500/20',
    iconBg: 'bg-cyan-500/10 text-cyan-400',
  },
  {
    icon : <FileText className="w-6 h-6" />,
    title: 'AI Weekly Reports',
    desc : 'Receive automatically generated PDF reports every week — performance analysis, market digest, and next-week action items, all in one beautiful document.',
    color: 'from-indigo-500/20 to-violet-600/10',
    border: 'border-indigo-500/20',
    iconBg: 'bg-indigo-500/10 text-indigo-400',
  },
];

const stats = [
  { label: 'Portfolios Analyzed', value: '50,000+', icon: <PieChart className="w-5 h-5" /> },
  { label: 'AI Recommendations', value: '2.5M+',   icon: <Brain className="w-5 h-5" /> },
  { label: 'Avg Return Boost',    value: '+18%',    icon: <TrendingUp className="w-5 h-5" /> },
  { label: 'Happy Investors',     value: '12,000+', icon: <Users className="w-5 h-5" /> },
];

const testimonials = [
  {
    name  : 'Priya Sharma',
    role  : 'Software Engineer',
    image : 'PS',
    rating: 5,
    text  : 'FinSight AI completely transformed how I manage my portfolio. The AI chat advisor is like having a personal financial planner available 24/7. My returns improved by 22% in 6 months!',
  },
  {
    name  : 'Rahul Verma',
    role  : 'Startup Founder',
    image : 'RV',
    rating: 5,
    text  : 'The risk analysis feature is incredible. It caught a dangerous concentration in my portfolio that I completely missed. The one-click risk reduction plan saved me from a significant loss.',
  },
  {
    name  : 'Anita Patel',
    role  : 'Doctor & Investor',
    image : 'AP',
    rating: 5,
    text  : 'As a busy professional, I needed something that could give me expert advice without spending hours on research. FinSight AI delivers exactly that — intelligent insights in seconds.',
  },
];

const navItems = [
  { label: 'Features',    href: '#features'    },
  { label: 'How it Works', href: '#how-it-works' },
  { label: 'Pricing',     href: '#pricing'      },
  { label: 'About',       href: '#about'        },
];

// ── Animated Counter ─────────────────────────────────────────────────────────
const CountUp = ({ target, suffix = '' }: { target: string; suffix?: string }) => {
  return <span className="font-bold font-display">{target}{suffix}</span>;
};

// ── Particle Background ───────────────────────────────────────────────────────
const ParticleField = () => {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id  : i,
    x   : Math.random() * 100,
    y   : Math.random() * 100,
    size: Math.random() * 3 + 1,
    delay: Math.random() * 5,
    dur : Math.random() * 10 + 10,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-brand-400/20"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
          animate={{ y: [0, -30, 0], opacity: [0.2, 0.8, 0.2] }}
          transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
};

// ── Main Landing Page ─────────────────────────────────────────────────────────
export default function LandingPage() {
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-dark-950 overflow-x-hidden">

      {/* ── Navbar ────────────────────────────────────────────────────────── */}
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'glass-dark border-b border-white/5 shadow-lg' : 'bg-transparent'
        }`}
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-accent-violet flex items-center justify-center shadow-glow group-hover:shadow-glow transition-all">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold font-display gradient-text">FinSight AI</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <a key={item.label} href={item.href}
                className="text-sm text-slate-400 hover:text-white transition-colors font-medium">
                {item.label}
              </a>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login" className="btn-secondary text-sm px-4 py-2">Sign In</Link>
            <Link to="/register" className="btn-primary text-sm px-4 py-2">
              Get Started Free <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <button className="md:hidden btn-icon" onClick={() => setMenuOpen(!menuOpen)}>
            <div className="space-y-1.5">
              <span className={`block h-0.5 w-5 bg-slate-300 transition-all ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block h-0.5 w-5 bg-slate-300 transition-all ${menuOpen ? 'opacity-0' : ''}`} />
              <span className={`block h-0.5 w-5 bg-slate-300 transition-all ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden glass-dark border-t border-white/5 px-6 py-4 space-y-3"
            >
              {navItems.map((item) => (
                <a key={item.label} href={item.href}
                  className="block text-sm text-slate-400 py-2" onClick={() => setMenuOpen(false)}>
                  {item.label}
                </a>
              ))}
              <div className="pt-2 space-y-2">
                <Link to="/login"    className="btn-secondary w-full justify-center text-sm">Sign In</Link>
                <Link to="/register" className="btn-primary w-full justify-center text-sm">Get Started Free</Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* ── Hero Section ──────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 pb-16 px-6">
        <ParticleField />

        {/* Background Gradients */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 rounded-full bg-brand-600/10 blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-20 right-1/4 w-80 h-80 rounded-full bg-accent-violet/10 blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-brand-500/5 blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand-500/30 bg-brand-500/10 text-brand-400 text-sm font-medium mb-8"
          >
            <Sparkles className="w-4 h-4" />
            Powered by GPT-4 · Real-time Market Intelligence
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl md:text-7xl font-black font-display leading-[1.05] mb-6"
          >
            Your{' '}
            <span className="gradient-text">AI Co-Pilot</span>
            <br />
            for Smart{' '}
            <span className="gradient-text-gold">Investing</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            FinSight AI analyzes your portfolio, delivers Buy/Hold/Sell signals, assesses risk,
            plans your goals, and chats with you like an expert wealth manager.
            <span className="text-slate-300"> All powered by AI.</span>
          </motion.p>

          {/* CTA Row */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
          >
            <Link to="/register" className="btn-primary text-base px-8 py-3.5 gap-2.5 shadow-glow">
              <Sparkles className="w-5 h-5" />
              Start Free — No Credit Card
            </Link>
            <button className="btn-secondary text-base px-8 py-3.5 gap-2">
              <Play className="w-4 h-4 fill-current" />
              Watch Demo
            </button>
          </motion.div>

          {/* Trust Row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap gap-6 justify-center items-center text-xs text-slate-500"
          >
            {['256-bit Encryption', 'SEBI Compliant', '99.9% Uptime', 'SOC 2 Certified'].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                {t}
              </span>
            ))}
          </motion.div>

          {/* Hero Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.4 }}
            className="mt-16 relative max-w-5xl mx-auto"
          >
            {/* Glow Effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-brand-600/20 to-accent-violet/20 blur-2xl rounded-3xl" />

            {/* Dashboard Preview Card */}
            <div className="relative glass-card rounded-3xl p-6 border border-white/10 overflow-hidden">
              {/* Simulated Dashboard Header */}
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-rose-500" />
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <div className="flex-1 mx-4 h-6 rounded-lg bg-white/5 flex items-center px-3">
                  <span className="text-xs text-slate-500">app.finsight.ai/dashboard</span>
                </div>
              </div>

              {/* Simulated Stats Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                  { label: 'Portfolio Value', value: '₹24,85,320', change: '+12.4%', up: true },
                  { label: 'Today\'s P&L',    value: '+₹15,240',   change: '+0.61%', up: true },
                  { label: 'Health Score',    value: '84/100',      change: '+5 pts',  up: true },
                  { label: 'Risk Level',      value: 'Moderate',    change: 'Optimal', up: true },
                ].map((stat, i) => (
                  <div key={i} className="rounded-xl bg-white/5 border border-white/5 p-4">
                    <div className="text-xs text-slate-500 mb-1.5">{stat.label}</div>
                    <div className="text-lg font-bold text-white font-display">{stat.value}</div>
                    <div className={`text-xs mt-1 ${stat.up ? 'text-emerald-400' : 'text-rose-400'}`}>{stat.change}</div>
                  </div>
                ))}
              </div>

              {/* Simulated Chart Area */}
              <div className="h-32 rounded-xl bg-gradient-to-r from-brand-600/10 to-accent-violet/10 border border-white/5 flex items-end px-4 pb-4 gap-1">
                {[40, 55, 45, 70, 60, 80, 75, 90, 85, 95, 88, 100].map((h, i) => (
                  <motion.div
                    key={i}
                    className="flex-1 rounded-t-sm bg-gradient-to-t from-brand-500 to-brand-400"
                    style={{ height: `${h}%` }}
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ delay: 0.6 + i * 0.05, duration: 0.4, ease: 'easeOut' }}
                  />
                ))}
              </div>

              {/* AI Insight Banner */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2 }}
                className="absolute bottom-6 right-6 glass-card rounded-xl p-3 border border-brand-500/30 max-w-xs"
              >
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-lg bg-brand-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Brain className="w-3.5 h-3.5 text-brand-400" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-brand-400 mb-0.5">AI Insight</div>
                    <div className="text-xs text-slate-300">HDFC Bank is 12% undervalued. Consider increasing allocation by 5%.</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Stats Banner ──────────────────────────────────────────────────── */}
      <section className="py-12 border-y border-white/5" style={{ background: 'rgba(15,23,42,0.6)' }}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="flex justify-center mb-3 text-brand-400">{stat.icon}</div>
                <div className="text-3xl font-black font-display gradient-text mb-1">{stat.value}</div>
                <div className="text-xs text-slate-500 uppercase tracking-wider">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Section ──────────────────────────────────────────────── */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-500/30 bg-brand-500/10 text-brand-400 text-sm mb-5"
            >
              <Zap className="w-3.5 h-3.5" /> Powerful Features
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-black font-display mb-4"
            >
              Everything you need to{' '}
              <span className="gradient-text">invest smarter</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-slate-400 text-lg max-w-2xl mx-auto"
            >
              FinSight AI packs 25+ powerful features that used to require a team of analysts,
              into one intelligent platform.
            </motion.p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`card p-6 bg-gradient-to-br ${feature.color} border ${feature.border} group`}
              >
                <div className={`w-12 h-12 rounded-xl ${feature.iconBg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-3 font-display">{feature.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{feature.desc}</p>
                <div className="mt-4 flex items-center gap-1 text-xs text-slate-500 group-hover:text-brand-400 transition-colors">
                  Learn more <ChevronRight className="w-3 h-3" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black font-display mb-4">
              Loved by{' '}
              <span className="gradient-text-gold">12,000+</span> investors
            </h2>
            <p className="text-slate-400">Real results from real people.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="card-static p-6 space-y-4"
              >
                {/* Stars */}
                <div className="flex gap-1">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-300 leading-relaxed italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-accent-violet flex items-center justify-center text-xs font-bold text-white">
                    {t.image}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{t.name}</div>
                    <div className="text-xs text-slate-500">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-3xl overflow-hidden p-12 text-center"
            style={{ background: 'linear-gradient(135deg, rgba(102,126,234,0.15) 0%, rgba(118,75,162,0.1) 100%)', border: '1px solid rgba(102,126,234,0.2)' }}
          >
            <div className="absolute inset-0 bg-gradient-radial from-brand-500/5 to-transparent" />
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-violet flex items-center justify-center mx-auto mb-6 shadow-glow">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-4xl md:text-5xl font-black font-display mb-4">
                Start investing{' '}
                <span className="gradient-text">smarter today</span>
              </h2>
              <p className="text-slate-400 text-lg mb-8 max-w-xl mx-auto">
                Join 12,000+ investors who trust FinSight AI to grow their wealth.
                Free to start, no credit card required.
              </p>
              <Link to="/register" className="btn-primary text-lg px-10 py-4 shadow-glow inline-flex">
                <Sparkles className="w-5 h-5" />
                Create Free Account
                <ArrowRight className="w-5 h-5" />
              </Link>
              <p className="text-xs text-slate-500 mt-4">
                14-day free trial · No credit card · Cancel anytime
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-accent-violet flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold font-display gradient-text">FinSight AI</span>
            </div>
            <div className="text-xs text-slate-600 text-center">
              © 2025 FinSight AI. All rights reserved. · Built with ❤️ for investors everywhere
            </div>
            <div className="flex gap-6 text-xs text-slate-600">
              {['Privacy', 'Terms', 'Security', 'Contact'].map((l) => (
                <a key={l} href="#" className="hover:text-slate-400 transition-colors">{l}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
