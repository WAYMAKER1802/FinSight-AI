import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, TrendingUp, TrendingDown, ShoppingBag, X, Loader2, Sparkles } from 'lucide-react';
import { usePortfolioStore } from '@/store/portfolioStore';
import toast from 'react-hot-toast';

// Dummy Marketplace Data
const marketplaceAssets = [
  { id: '1', symbol: 'RELIANCE', name: 'Reliance Industries', type: 'stock', price: 2954.20, change: 1.2, sector: 'Energy' },
  { id: '2', symbol: 'TCS', name: 'Tata Consultancy Services', type: 'stock', price: 3980.50, change: 0.8, sector: 'IT' },
  { id: '3', symbol: 'HDFCBANK', name: 'HDFC Bank', type: 'stock', price: 1430.25, change: -0.5, sector: 'Banking' },
  { id: '4', symbol: 'INFY', name: 'Infosys', type: 'stock', price: 1482.00, change: -1.2, sector: 'IT' },
  { id: '5', symbol: 'SBIN', name: 'State Bank of India', type: 'stock', price: 752.10, change: 2.1, sector: 'Banking' },
  { id: '6', symbol: 'ZOMATO', name: 'Zomato Ltd', type: 'stock', price: 165.30, change: 4.5, sector: 'Consumer Tech' },
  { id: '7', symbol: 'TATAMOTORS', name: 'Tata Motors', type: 'stock', price: 980.40, change: 3.2, sector: 'Auto' },
  { id: '8', symbol: 'ITC', name: 'ITC Ltd', type: 'stock', price: 410.80, change: 0.2, sector: 'FMCG' },
  { id: '9', symbol: 'NIFTYBEES', name: 'Nippon India Nifty 50 ETF', type: 'etf', price: 245.50, change: 0.6, sector: 'Index ETF' },
  { id: '10', symbol: 'GOLDBEES', name: 'Nippon India Gold ETF', type: 'etf', price: 58.20, change: -0.3, sector: 'Commodity ETF' },
];

export default function Invest() {
  const { activePortfolio, addAsset } = usePortfolioStore();
  const [search, setSearch] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [quantity, setQuantity] = useState('1');
  const [purchasing, setPurchasing] = useState(false);

  const filteredAssets = marketplaceAssets.filter(a => 
    a.symbol.toLowerCase().includes(search.toLowerCase()) || 
    a.name.toLowerCase().includes(search.toLowerCase())
  );

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePortfolio) {
      toast.error('Please create a portfolio first on the Portfolio page.');
      return;
    }
    
    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) {
      toast.error('Please enter a valid quantity.');
      return;
    }

    setPurchasing(true);
    try {
      await addAsset(activePortfolio.id, {
        symbol: selectedAsset.symbol,
        name: selectedAsset.name,
        type: selectedAsset.type,
        quantity: qty,
        avgBuyPrice: selectedAsset.price,
        sector: selectedAsset.sector
      });
      toast.success(`Successfully invested in ${qty} shares of ${selectedAsset.symbol}!`);
      setSelectedAsset(null);
      setQuantity('1');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to complete investment.');
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto h-full flex flex-col relative z-10">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black font-display text-white flex items-center gap-2">
          <ShoppingBag className="w-6 h-6 text-brand-400" /> Investment Marketplace
        </h1>
        <p className="text-slate-400 text-sm mt-0.5">Discover and invest in top Indian assets.</p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
        <input 
          type="text" 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search for stocks, ETFs (e.g. Reliance, NiftyBees)..." 
          className="input-field pl-12 h-14 w-full text-lg shadow-xl"
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 flex-1">
        {filteredAssets.map(asset => (
          <motion.div 
            key={asset.id}
            whileHover={{ y: -4 }}
            className="card-static p-5 flex flex-col justify-between hover:border-brand-500/30 transition-all cursor-pointer bg-dark-900/80 backdrop-blur-md"
            onClick={() => setSelectedAsset(asset)}
          >
            <div>
              <div className="flex justify-between items-start mb-2">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-bold text-white shadow-inner">
                  {asset.symbol.slice(0, 2)}
                </div>
                <span className={`badge border ${asset.change >= 0 ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10' : 'text-rose-400 border-rose-500/20 bg-rose-500/10'}`}>
                  {asset.change >= 0 ? '▲' : '▼'} {Math.abs(asset.change)}%
                </span>
              </div>
              <h3 className="font-bold text-white text-lg font-display truncate">{asset.symbol}</h3>
              <p className="text-xs text-slate-400 truncate mb-4">{asset.name}</p>
            </div>
            
            <div className="flex items-end justify-between mt-auto pt-4 border-t border-white/5">
              <div>
                <div className="text-xs text-slate-500 mb-0.5">Live Price</div>
                <div className="font-numeric font-bold text-lg text-white">₹{asset.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
              </div>
              <button className="btn-primary text-xs px-4 py-1.5 rounded-lg shadow-glow">
                Invest
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredAssets.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 pb-20">
          <Search className="w-12 h-12 mb-4 opacity-20" />
          <p>No assets found matching "{search}"</p>
        </div>
      )}

      {/* Purchase Modal */}
      <AnimatePresence>
        {selectedAsset && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="card-static p-0 w-full max-w-sm relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-500 to-accent-violet" />
              <button onClick={() => setSelectedAsset(null)} className="absolute top-4 right-4 text-slate-500 hover:text-white z-10"><X className="w-5 h-5" /></button>
              
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500/20 to-accent-violet/20 border border-brand-500/30 flex items-center justify-center font-bold text-white text-lg">
                    {selectedAsset.symbol.slice(0, 2)}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white font-display leading-tight">{selectedAsset.symbol}</h2>
                    <p className="text-xs text-slate-400">{selectedAsset.name}</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-6 flex justify-between items-center">
                  <span className="text-sm text-slate-400">Current Market Price</span>
                  <span className="text-lg font-numeric font-bold text-white">₹{selectedAsset.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>

                <form onSubmit={handlePurchase} className="space-y-6">
                  <div>
                    <label className="text-xs text-slate-400 mb-2 block">Quantity to Buy</label>
                    <input 
                      type="number" 
                      min="1"
                      step="1"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="input-field w-full text-lg font-numeric py-3"
                      required
                    />
                  </div>

                  <div className="flex justify-between items-end border-t border-white/10 pt-4">
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Total Estimated Cost</div>
                      <div className="text-2xl font-numeric font-black text-brand-400 shadow-glow">
                        ₹{((parseFloat(quantity) || 0) * selectedAsset.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>

                  <button type="submit" disabled={purchasing || !activePortfolio} className="btn-primary w-full py-3.5 text-base gap-2 shadow-glow">
                    {purchasing ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
                    ) : (
                      <><Sparkles className="w-5 h-5" /> Confirm Investment</>
                    )}
                  </button>
                  
                  {!activePortfolio && (
                    <p className="text-xs text-rose-400 text-center mt-2">
                      Please create a portfolio first to invest.
                    </p>
                  )}
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
