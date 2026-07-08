import api from './client';

export const newsApi = {
  getLatest: async () => {
    const { data } = await api.get('/news');
    return data;
  },
  getCompanyNews: async (symbol: string) => {
    const { data } = await api.get(`/news/company/${symbol}`);
    return data;
  },
};
