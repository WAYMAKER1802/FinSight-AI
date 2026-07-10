import { create } from 'zustand';
import { portfolioApi } from '@/api/portfolio.api';
import { marketApi } from '@/api/market.api';

export interface Asset {
  id: number;
  portfolioId: number;
  symbol: string;
  name: string;
  type: string;
  sector: string;
  quantity: number;
  avgBuyPrice: number;
  investedAmount: number;
  currentPrice: number;
  currentValue: number;
  allocationPct: number;
  absoluteReturn: number;
  percentageReturn: number;
  dayChange: number;
  dayChangePct: number;
  recommendation: string;
  confidenceScore: number;
  riskScore: number;
  targetPrice?: number;
  stopLoss?: number;
  notes?: string;
}

export interface Portfolio {
  id: number;
  name: string;
  description?: string;
  currency: string;
  isDefault: boolean;
  color: string;
  totalInvested: number;
  totalCurrentValue: number;
  totalReturns: number;
  returnsPercent: number;
  dayPnl: number;
  dayPnlPercent: number;
  cagr: number;
  sharpeRatio: number;
  healthScore: number;
  riskScore: number;
  diversificationScore: number;
  wealthScore: number;
  sectorAllocation: { sector: string; value: number; percentage: number }[];
  assetClassAllocation: { assetClass: string; value: number; percentage: number }[];
  assets: Asset[];
  assetCount: number;
  lastAIAnalysis?: any;
  overallSentiment?: string;
  createdAt?: string;
  updatedAt?: string;
  lastUpdated?: string; // or Date
  maxDrawdown?: number;
  volatility?: number;
  beta?: number;
  alpha?: number;
  winRate?: number;
  sortinoRatio?: number;
}

interface PortfolioState {
  portfolios: Portfolio[];
  activePortfolio: Portfolio | null;
  loading: boolean;
  priceRefreshing: boolean;
  error: string | null;
  lastUpdated: Date | null;

  // Actions
  fetchPortfolios: () => Promise<void>;
  createPortfolio: (data: { name: string; description?: string; currency?: string }) => Promise<Portfolio>;
  setActivePortfolio: (id: number) => void;
  addAsset: (portfolioId: number, asset: Partial<Asset>) => Promise<void>;
  updateAsset: (portfolioId: number, assetId: number, updates: Partial<Asset>) => Promise<void>;
  removeAsset: (portfolioId: number, assetId: number) => Promise<void>;
  refreshPrices: (portfolioId: number) => Promise<void>;
  importAssets: (portfolioId: number, file: File) => Promise<{ imported: number }>;
  getPerformance: (portfolioId: number, period?: string) => Promise<any>;
  getAnalytics: (portfolioId: number) => Promise<any>;
}

export const usePortfolioStore = create<PortfolioState>((set, get) => ({
  portfolios  : [],
  activePortfolio: null,
  loading     : false,
  priceRefreshing: false,
  error       : null,
  lastUpdated : null,

  fetchPortfolios: async () => {
    set({ loading: true, error: null });
    try {
      const res = await portfolioApi.getAll();
      const portfolios = res.data?.data?.portfolios || [];
      const active = get().activePortfolio;
      const newActive = active
        ? portfolios.find((p: Portfolio) => p.id === active.id) || portfolios[0] || null
        : portfolios.find((p: Portfolio) => p.isDefault) || portfolios[0] || null;
      set({ portfolios, activePortfolio: newActive, loading: false, lastUpdated: new Date() });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  createPortfolio: async (data) => {
    const res = await portfolioApi.create(data);
    const portfolio = res.data?.data?.portfolio;
    set(s => ({ portfolios: [...s.portfolios, portfolio], activePortfolio: portfolio }));
    return portfolio;
  },

  setActivePortfolio: (id: number) => {
    const p = get().portfolios.find(p => p.id === id) || null;
    set({ activePortfolio: p });
  },

  addAsset: async (portfolioId, asset) => {
    const res = await portfolioApi.addAsset(portfolioId, asset);
    const updated = res.data?.data?.portfolio;
    if (updated) {
      set(s => ({
        portfolios: s.portfolios.map(p => p.id === portfolioId ? updated : p),
        activePortfolio: s.activePortfolio?.id === portfolioId ? updated : s.activePortfolio,
      }));
    }
  },

  updateAsset: async (portfolioId, assetId, updates) => {
    const res = await portfolioApi.updateAsset(portfolioId, assetId, updates);
    const updated = res.data?.data?.portfolio;
    if (updated) {
      set(s => ({
        portfolios: s.portfolios.map(p => p.id === portfolioId ? updated : p),
        activePortfolio: s.activePortfolio?.id === portfolioId ? updated : s.activePortfolio,
      }));
    }
  },

  removeAsset: async (portfolioId, assetId) => {
    await portfolioApi.removeAsset(portfolioId, assetId);
    await get().fetchPortfolios();
  },

  refreshPrices: async (portfolioId) => {
    set({ priceRefreshing: true });
    try {
      const res = await portfolioApi.refreshPrices(portfolioId);
      const updated = res.data?.portfolio;
      if (updated) {
        set(s => ({
          portfolios: s.portfolios.map(p => p.id === portfolioId ? updated : p),
          activePortfolio: s.activePortfolio?.id === portfolioId ? updated : s.activePortfolio,
          lastUpdated: new Date(),
        }));
      }
    } finally {
      set({ priceRefreshing: false });
    }
  },

  importAssets: async (portfolioId, file) => {
    const res = await portfolioApi.importAssets(portfolioId, file);
    await get().fetchPortfolios();
    return { imported: res.data?.imported || 0 };
  },

  getPerformance: async (portfolioId, period = '1Y') => {
    const res = await portfolioApi.getPerformance(portfolioId, period);
    return res.data?.data;
  },

  getAnalytics: async (portfolioId) => {
    const res = await portfolioApi.getAnalytics(portfolioId);
    return res.data?.data;
  },
}));
