import api from './client';

export const aiApi = {
  analyzePortfolio: async (portfolioId: string) => {
    const { data } = await api.post(`/ai/analyze-portfolio/${portfolioId}`);
    return data;
  },
  chat: async (message: string, context?: any) => {
    const { data } = await api.post('/ai/chat', { message, context });
    return data;
  },
  getStockRecommendation: async (symbol: string) => {
    const { data } = await api.post('/ai/stock-recommendation', { symbol });
    return data;
  },
  analyzeRisk: async (portfolioId: string) => {
    const { data } = await api.post(`/ai/risk-analysis/${portfolioId}`);
    return data;
  }
};
