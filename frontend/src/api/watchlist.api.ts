import client from './client';

export interface WatchlistItem {
  id: number;
  userId: number;
  symbol: string;
  name: string | null;
  assetType: string;
  addedAt: string;
}

export const watchlistApi = {
  getWatchlist: async () => {
    const { data } = await client.get('/watchlist');
    return data;
  },

  addToWatchlist: async (symbol: string, name?: string, assetType?: string) => {
    const { data } = await client.post('/watchlist', { symbol, name, assetType });
    return data;
  },

  removeFromWatchlist: async (symbol: string) => {
    const { data } = await client.delete(`/watchlist/${symbol}`);
    return data;
  },
};
