import React, { useEffect, useState } from 'react';
import { watchlistApi, WatchlistItem } from '@/api/watchlist.api';
import { Trash2, TrendingUp, TrendingDown, Target } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

// Dummy live data since backend only stores symbol and name
const dummyPrices: Record<string, { price: string, percent: string, up: boolean }> = {
  'RELIANCE': { price: '2,954.20', percent: '+2.45%', up: true },
  'TATASTEEL': { price: '142.50', percent: '+1.80%', up: true },
  'ZOMATO': { price: '165.30', percent: '+4.12%', up: true },
  'HDFCBANK': { price: '1,430.25', percent: '-0.85%', up: false },
};

export default function Watchlist() {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchWatchlist = async () => {
    try {
      const data = await watchlistApi.getWatchlist();
      setItems(data.data || []);
    } catch (error) {
      toast.error('Failed to load watchlist');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const handleRemove = async (symbol: string) => {
    try {
      await watchlistApi.removeFromWatchlist(symbol);
      setItems(items.filter(i => i.symbol !== symbol));
      toast.success(`${symbol} removed from watchlist`);
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-400 font-semibold">Loading watchlist...</div>;
  }

  return (
    <div className="space-y-6 max-w-[1000px] mx-auto">
      <div>
        <h1 className="text-2xl font-black font-display text-white flex items-center gap-2">
          <Target className="w-6 h-6 text-brand-400" /> Watchlist
        </h1>
        <p className="text-slate-400 text-sm mt-0.5">Track your favorite stocks and assets.</p>
      </div>

      {items.length === 0 ? (
        <div className="card-static p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-brand-500/10 flex items-center justify-center mb-4">
            <Target className="w-8 h-8 text-brand-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Your watchlist is empty</h3>
          <p className="text-slate-400 max-w-sm mb-6">
            Go to the Explore page to discover and add stocks to your watchlist.
          </p>
        </div>
      ) : (
        <div className="card-static overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-xs text-slate-400 uppercase tracking-wider">
                <th className="p-4 font-semibold">Company</th>
                <th className="p-4 font-semibold text-right">Market Price</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => {
                const live = dummyPrices[item.symbol] || { price: '0.00', percent: '0.00%', up: true };
                return (
                  <tr 
                    key={item.id} 
                    onClick={() => navigate(`/app/stock/${item.symbol}`)}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors group cursor-pointer"
                  >
                    <td className="p-4">
                      <div className="text-sm font-bold text-white">{item.name || item.symbol}</div>
                      <div className="text-xs text-slate-500">{item.symbol} &bull; {item.assetType}</div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="text-sm font-bold text-white font-numeric">₹{live.price}</div>
                      <div className={`text-xs font-semibold flex items-center justify-end gap-1 ${live.up ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {live.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {live.percent}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleRemove(item.symbol); }}
                        className="p-2 rounded-lg bg-white/5 text-slate-400 hover:bg-rose-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
