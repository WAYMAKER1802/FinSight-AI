import api from './client';

export const portfolioApi = {
  getAll: ()                         => api.get('/portfolio'),
  getOne: (id: number)               => api.get(`/portfolio/${id}`),
  create: (data: any)                => api.post('/portfolio', data),
  update: (id: number, data: any)    => api.put(`/portfolio/${id}`, data),
  delete: (id: number)               => api.delete(`/portfolio/${id}`),

  // Assets
  addAsset   : (portfolioId: number, asset: any)                   => api.post(`/portfolio/${portfolioId}/assets`, asset),
  updateAsset: (portfolioId: number, assetId: number, data: any)   => api.put(`/portfolio/${portfolioId}/assets/${assetId}`, data),
  removeAsset: (portfolioId: number, assetId: number)              => api.delete(`/portfolio/${portfolioId}/assets/${assetId}`),

  // Utilities
  refreshPrices: (portfolioId: number)                    => api.post(`/portfolio/${portfolioId}/refresh-prices`),
  getPerformance:(portfolioId: number, period = '1Y')     => api.get(`/portfolio/${portfolioId}/performance?period=${period}`),
  getAnalytics  :(portfolioId: number)                    => api.get(`/portfolio/${portfolioId}/analytics`),
  importAssets  :(portfolioId: number, file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.post(`/portfolio/${portfolioId}/import`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
};
