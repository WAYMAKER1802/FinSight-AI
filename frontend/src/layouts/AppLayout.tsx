import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, PieChart, MessageSquare, BarChart3, Newspaper,
  Target, ShieldAlert, Calculator, FileText, Bell, Activity, Trophy,
  Brain, Sunset, Settings, User, TrendingUp, Menu, X,
  ChevronRight, LogOut, Sparkles
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import AnimatedBackground from '@/components/AnimatedBackground';

const navItems = [
  { group: 'Overview',
    items: [
      { to: '/app/dashboard',  icon: LayoutDashboard, label: 'Dashboard'   },
      { to: '/app/portfolio',  icon: PieChart,        label: 'Portfolio'   },
      { to: '/app/analytics',  icon: BarChart3,       label: 'Analytics'   },
    ]
  },
  { group: 'AI Features',
    items: [
      { to: '/app/ai-chat',         icon: MessageSquare, label: 'AI Coach',          badge: 'AI'      },
      { to: '/app/recommendation',  icon: Sparkles,      label: 'AI Recommendation', badge: 'New'     },
      { to: '/app/risk-simulator',  icon: ShieldAlert,   label: 'Risk Simulator'                      },
      { to: '/app/wealth-score',    icon: Trophy,        label: 'Wealth Score'                        },
      { to: '/app/personality-test', icon: Brain,        label: 'Investor Profile'                    },
    ]
  },
  { group: 'Planning',
    items: [
      { to: '/app/goals',              icon: Target,     label: 'Goal Planner'       },
      { to: '/app/retirement-planner', icon: Sunset,     label: 'Retirement'         },
      { to: '/app/calculators',        icon: Calculator, label: 'Calculators'        },
    ]
  },
  { group: 'Market',
    items: [
      { to: '/app/news',        icon: Newspaper,  label: 'News'          },
      { to: '/app/live-market', icon: Activity,   label: 'Live Market', badge: 'Live' },
      { to: '/app/alerts',      icon: Bell,       label: 'Alerts', badge: '3' },
    ]
  },
  { group: 'Account',
    items: [
      { to: '/app/reports',  icon: FileText,  label: 'Reports'  },
      { to: '/app/profile',  icon: User,      label: 'Profile'  },
      { to: '/app/settings', icon: Settings,  label: 'Settings' },
    ]
  },
];

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout }  = useAuthStore();
  const navigate          = useNavigate();
  const location          = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center gap-3 p-4 border-b border-white/5 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-accent-violet flex items-center justify-center shadow-glow flex-shrink-0">
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div>
            <div className="text-sm font-black font-display gradient-text">FinSight AI</div>
            <div className="text-2xs text-slate-500">Portfolio Advisor</div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 space-y-5 no-scrollbar px-2">
        {navItems.map(group => (
          <div key={group.group}>
            {!collapsed && (
              <div className="px-2 mb-1.5 text-2xs font-semibold text-slate-600 uppercase tracking-wider">
                {group.group}
              </div>
            )}
            <div className="space-y-0.5">
              {group.items.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `sidebar-item ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-2' : ''}`
                  }
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-sm">{item.label}</span>
                      {'badge' in item && item.badge && (
                        <span className={item.badge === 'AI' ? 'badge-brand text-2xs' : 'badge-loss text-2xs px-1.5 py-0.5 rounded-full min-w-4 text-center'}>
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User Footer */}
      <div className={`border-t border-white/5 p-3 ${collapsed ? 'flex justify-center' : ''}`}>
        {!collapsed ? (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-accent-violet flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
              {user?.name?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-white truncate">{user?.name || 'Demo User'}</div>
              <div className="text-2xs text-slate-500 truncate">{user?.role || 'premium'} plan</div>
            </div>
            <button onClick={handleLogout} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-500 hover:text-rose-400 transition-all" title="Logout">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button onClick={handleLogout} className="btn-icon p-2 text-slate-500 hover:text-rose-400" title="Logout">
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-transparent overflow-hidden relative">
      <AnimatedBackground />

      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 64 : 240 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="hidden md:flex flex-col bg-dark-900 border-r border-white/5 relative z-10 overflow-hidden flex-shrink-0"
      >
        <SidebarContent />
        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-dark-800 border border-white/10 flex items-center justify-center hover:border-brand-500/40 transition-all z-20"
        >
          <ChevronRight className={`w-3 h-3 text-slate-400 transition-transform ${collapsed ? '' : 'rotate-180'}`} />
        </button>
      </motion.aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 bg-black/60 z-30" onClick={() => setMobileOpen(false)} />
            <motion.aside initial={{ x: -240 }} animate={{ x: 0 }} exit={{ x: -240 }} transition={{ duration: 0.2 }}
              className="md:hidden fixed left-0 top-0 bottom-0 w-60 bg-dark-900 border-r border-white/5 z-40">
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-14 border-b border-white/5 bg-dark-900/50 backdrop-blur-sm flex items-center justify-between px-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="md:hidden btn-icon p-2">
              <Menu className="w-5 h-5" />
            </button>
            {/* Breadcrumb */}
            <div className="text-sm text-slate-400">
              {location.pathname.split('/').filter(Boolean).map((seg, i, arr) => (
                <span key={seg}>
                  <span className={i === arr.length - 1 ? 'text-white font-medium capitalize' : 'capitalize'}>
                    {seg.replace(/-/g, ' ')}
                  </span>
                  {i < arr.length - 1 && <span className="mx-1.5 text-slate-600">/</span>}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <NavLink to="/app/alerts" className="relative btn-icon p-2">
              <Bell className="w-4 h-4" />
              <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-rose-500 text-white text-2xs flex items-center justify-center font-bold">3</span>
            </NavLink>
            <NavLink to="/app/ai-chat" className="btn-primary text-xs gap-1.5 px-3 py-2">
              <Sparkles className="w-3.5 h-3.5" /> Ask AI
            </NavLink>
            <NavLink to="/app/profile" className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-500 to-accent-violet flex items-center justify-center text-xs font-bold text-white">
              {user?.name?.[0]?.toUpperCase() || 'A'}
            </NavLink>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
