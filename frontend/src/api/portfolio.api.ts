import api from './client';

export const portfolioApi = {
  getAll: async () => {
    const { data } = await api.get('/portfolio');
    return data;
  },
  getById: async (id: string) => {
    const { data } = await api.get(`/portfolio/${id}`);
    return data;
  },
  create: async (portfolio: any) => {
    const { data } = await api.post('/portfolio', portfolio);
    return data;
  },
  addAsset: async (portfolioId: string, asset: any) => {
    const { data } = await api.post(`/portfolio/${portfolioId}/assets`, asset);
    return data;
  },
  refreshPrices: async (portfolioId: string) => {
    const { data } = await api.post(`/portfolio/${portfolioId}/refresh`);
    return data;
  },
};
