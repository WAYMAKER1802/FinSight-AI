import api from './client';

export const marketApi = {
  getOverview  : ()              => api.get('/market/overview'),
  getQuote     : (symbol: string) => api.get(`/market/quote/${symbol}`),
  getBatchQuotes:(symbols: string[]) => api.post('/market/quotes', { symbols }),
  search       : (q: string)    => api.get(`/market/search?q=${encodeURIComponent(q)}`),
};

export const aiApi = {
  getDailyBrief     : ()                          => api.get('/ai/daily-brief'),
  analyzePortfolio  : (portfolioId: number)        => api.post(`/ai/analyze-portfolio/${portfolioId}`),
  getRecommendations: (portfolioId: number)        => api.get(`/ai/recommendations/${portfolioId}`),
  chat              : (message: string, history?: any[]) => api.post('/ai/chat', { message, conversationHistory: history }),
  getSentiment      : ()                           => api.get('/ai/sentiment'),
  planGoal          : (data: any)                  => api.post('/ai/plan-goal', data),
  simulateCrash     : (portfolioId: number, scenario: any) => api.post(`/ai/simulate-crash/${portfolioId}`, { scenario }),
};
