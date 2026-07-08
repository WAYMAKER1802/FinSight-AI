import { create } from 'zustand';
import { portfolioApi } from '@/api/portfolio.api';

interface PortfolioState {
  portfolios: any[];
  activePortfolioId: string | null;
  loading: boolean;
  error: string | null;
  fetchPortfolios: () => Promise<void>;
  setActivePortfolio: (id: string) => void;
}

export const usePortfolioStore = create<PortfolioState>((set) => ({
  portfolios: [],
  activePortfolioId: null,
  loading: false,
  error: null,
  fetchPortfolios: async () => {
    set({ loading: true, error: null });
    try {
      const data = await portfolioApi.getAll();
      set({ portfolios: data.data?.portfolios || [], loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },
  setActivePortfolio: (id: string) => set({ activePortfolioId: id }),
}));
