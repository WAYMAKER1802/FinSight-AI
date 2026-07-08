import api from './client';

export const goalsApi = {
  getAll: async () => {
    const { data } = await api.get('/goals');
    return data;
  },
  create: async (goalData: any) => {
    const { data } = await api.post('/goals', goalData);
    return data;
  },
  generateAIPlan: async (goalId: string, financialContext: any) => {
    const { data } = await api.post(`/goals/${goalId}/ai-plan`, { financialContext });
    return data;
  },
};
