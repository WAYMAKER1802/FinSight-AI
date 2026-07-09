import { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Layouts
import AuthLayout  from '@/layouts/AuthLayout';
import AppLayout   from '@/layouts/AppLayout';

// Pages
import LandingPage      from '@/pages/LandingPage';
import LoginPage        from '@/pages/auth/LoginPage';
import RegisterPage     from '@/pages/auth/RegisterPage';
import ForgotPassword   from '@/pages/auth/ForgotPassword';
import NotFound         from '@/pages/NotFound';

// App Pages
import Dashboard        from '@/pages/app/Dashboard';
import Portfolio        from '@/pages/app/Portfolio';
import AIChat           from '@/pages/app/AIChat';
import Analytics        from '@/pages/app/Analytics';
import News             from '@/pages/app/News';
import GoalPlanner      from '@/pages/app/GoalPlanner';
import RiskSimulator    from '@/pages/app/RiskSimulator';
import Calculators      from '@/pages/app/Calculators';
import Reports          from '@/pages/app/Reports';
import Alerts           from '@/pages/app/Alerts';
import LiveMarket       from '@/pages/app/LiveMarket';
import WealthScore      from '@/pages/app/WealthScore';
import PersonalityTest  from '@/pages/app/PersonalityTest';
import RetirementPlanner from '@/pages/app/RetirementPlanner';
import Settings         from '@/pages/app/Settings';
import Profile          from '@/pages/app/Profile';
import Recommendation   from '@/pages/app/Recommendation';
import LoadingScreen    from '@/components/ui/LoadingScreen';

// Auth store
import { useAuthStore } from '@/store/authStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime : 5 * 60 * 1000, // 5 minutes
      retry     : 1,
      refetchOnWindowFocus: false,
    },
  },
});

// ── Protected Route ────────────────────────────────────────────────────────
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) return <LoadingScreen message="Verifying your session..." />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

// ── Public Route (redirect if already logged in) ──────────────────────────
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) return <LoadingScreen />;
  if (isAuthenticated) return <Navigate to="/app/dashboard" replace />;
  return <>{children}</>;
}

// ── Page Transition ────────────────────────────────────────────────────────
const pageVariants = {
  initial : { opacity: 0, y: 8 },
  animate : { opacity: 1, y: 0, transition: { duration: 0.25 } },
  exit    : { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

function AnimatedPage({ children }: { children: React.ReactNode }) {
  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
      {children}
    </motion.div>
  );
}

// ── App Routes ─────────────────────────────────────────────────────────────
function AppRoutes() {
  const location = useLocation();
  const { initializeAuth } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, []);

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>

        {/* Public Routes */}
        <Route path="/"     element={<AnimatedPage><LandingPage /></AnimatedPage>} />
        <Route path="/login"    element={<PublicRoute><AuthLayout><AnimatedPage><LoginPage /></AnimatedPage></AuthLayout></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><AuthLayout><AnimatedPage><RegisterPage /></AnimatedPage></AuthLayout></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><AuthLayout><AnimatedPage><ForgotPassword /></AnimatedPage></AuthLayout></PublicRoute>} />

        {/* Protected App Routes */}
        <Route path="/app" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard"          element={<AnimatedPage><Dashboard /></AnimatedPage>} />
          <Route path="portfolio"          element={<AnimatedPage><Portfolio /></AnimatedPage>} />
          <Route path="ai-chat"            element={<AnimatedPage><AIChat /></AnimatedPage>} />
          <Route path="analytics"          element={<AnimatedPage><Analytics /></AnimatedPage>} />
          <Route path="news"               element={<AnimatedPage><News /></AnimatedPage>} />
          <Route path="goals"              element={<AnimatedPage><GoalPlanner /></AnimatedPage>} />
          <Route path="risk-simulator"     element={<AnimatedPage><RiskSimulator /></AnimatedPage>} />
          <Route path="calculators"        element={<AnimatedPage><Calculators /></AnimatedPage>} />
          <Route path="reports"            element={<AnimatedPage><Reports /></AnimatedPage>} />
          <Route path="alerts"             element={<AnimatedPage><Alerts /></AnimatedPage>} />
          <Route path="live-market"        element={<AnimatedPage><LiveMarket /></AnimatedPage>} />
          <Route path="wealth-score"       element={<AnimatedPage><WealthScore /></AnimatedPage>} />
          <Route path="personality-test"   element={<AnimatedPage><PersonalityTest /></AnimatedPage>} />
          <Route path="retirement-planner" element={<AnimatedPage><RetirementPlanner /></AnimatedPage>} />
          <Route path="settings"           element={<AnimatedPage><Settings /></AnimatedPage>} />
          <Route path="profile"            element={<AnimatedPage><Profile /></AnimatedPage>} />
          <Route path="recommendation"     element={<AnimatedPage><Recommendation /></AnimatedPage>} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
}

// ── Root App ───────────────────────────────────────────────────────────────
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background : 'rgba(15, 23, 42, 0.95)',
              color      : '#f1f5f9',
              border     : '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              fontSize   : '13px',
              backdropFilter: 'blur(16px)',
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#f0fdf4' } },
            error  : { iconTheme: { primary: '#f43f5e', secondary: '#fff1f2' } },
          }}
        />
      </Router>
    </QueryClientProvider>
  );
}
