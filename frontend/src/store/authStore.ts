import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/api/client';

interface User {
  _id        : string;
  name       : string;
  email      : string;
  avatar     : string | null;
  role       : 'user' | 'premium' | 'admin';
  riskProfile: string;
  wealthScore: { score: number; level: string; badges: string[] };
  isPremium  : boolean;
  phone?     : string;
  investmentHorizon?: string;
  mfaEnabled?: boolean;
}

interface AuthState {
  user            : User | null;
  accessToken     : string | null;
  isAuthenticated : boolean;
  isLoading       : boolean;

  login           : (email: string, password: string) => Promise<{ requiresMPin: boolean; tempToken?: string }>;
  verifyMPin      : (tempToken: string, pin: string) => Promise<void>;
  googleLogin     : (token: string) => Promise<void>;
  register        : (data: { name: string; email: string; password: string; riskProfile?: string }) => Promise<void>;
  logout          : () => Promise<void>;
  setUser         : (user: User) => void;
  updateUser      : (updates: Partial<User>) => void;
  initialize      : () => Promise<void>;
  initializeAuth  : () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user            : null,
      accessToken     : null,
      isAuthenticated : false,
      isLoading       : true,

      initialize: async () => {
        const { accessToken } = get();
        if (!accessToken) {
          set({ isLoading: false });
          return;
        }
        // Restore Authorization header from persisted token
        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        try {
          const response = await api.get('/auth/me');
          set({ user: response.data.data.user, isAuthenticated: true, isLoading: false });
        } catch {
          delete api.defaults.headers.common['Authorization'];
          set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false });
        }
      },

      // Alias — App.tsx calls initializeAuth()
      initializeAuth: async () => {
        return get().initialize();
      },

      login: async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        
        if (response.data.requiresMPin) {
          return { requiresMPin: true, tempToken: response.data.tempToken };
        }

        const { user, accessToken } = response.data;
        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        set({ user, accessToken, isAuthenticated: true });
        return { requiresMPin: false };
      },

      verifyMPin: async (tempToken, pin) => {
        const response = await api.post('/auth/verify-mpin', { tempToken, pin });
        const { user, accessToken } = response.data;
        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        set({ user, accessToken, isAuthenticated: true });
      },

      googleLogin: async (token) => {
        const response = await api.post('/auth/google', { token });
        const { user, accessToken } = response.data;
        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        set({ user, accessToken, isAuthenticated: true });
      },

      register: async (data) => {
        const response = await api.post('/auth/register', data);
        const { user, accessToken } = response.data;
        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        set({ user, accessToken, isAuthenticated: true });
      },

      logout: async () => {
        try { await api.post('/auth/logout'); } catch (_) {}
        delete api.defaults.headers.common['Authorization'];
        set({ user: null, accessToken: null, isAuthenticated: false });
      },

      setUser: (user) => set({ user }),
      updateUser: (updates) => set((state) => ({ user: state.user ? { ...state.user, ...updates } : null })),
    }),
    {
      name      : 'investiq-auth',
      partialize : (state) => ({ accessToken: state.accessToken, user: state.user }),
    }
  )
);
