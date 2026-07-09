import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Bookmark, Settings, Info } from 'lucide-react';
import { toast } from 'react-hot-toast';

declare global {
  interface Window {
    TradingView: any;
  }
}

export default function StockDetails() {
  const { symbol } = useParams();
  const navigate = useNavigate();
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [orderType, setOrderType] = useState<'BUY' | 'SELL'>('BUY');
  const [deliveryType, setDeliveryType] = useState<'Delivery' | 'Intraday' | 'MTF'>('Delivery');
  const [qty, setQty] = useState('');
  const [priceLimit, setPriceLimit] = useState('');
  const [isPlacing, setIsPlacing] = useState(false);

  // Fallback to CUPID if no symbol is provided
  const stockSymbol = symbol ? symbol.toUpperCase() : 'CUPID';
  const exchangePrefix = 'BSE'; // or NSE
  const fullSymbol = `${exchangePrefix}:${stockSymbol}`;

  useEffect(() => {
    // Load TradingView widget script
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      if (typeof window.TradingView !== 'undefined' && chartContainerRef.current) {
        new window.TradingView.widget({
          autosize: true,
          symbol: fullSymbol,
          interval: 'D',
          timezone: 'Asia/Kolkata',
          theme: 'dark', // Using dark to match InvestIQ theme, though Groww uses light
          style: '3', // Area chart
          locale: 'en',
          enable_publishing: false,
          backgroundColor: 'transparent',
          gridColor: 'rgba(255, 255, 255, 0.05)',
          hide_top_toolbar: true,
          hide_legend: true,
          save_image: false,
          container_id: chartContainerRef.current.id,
        });
      }
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [fullSymbol]);

  const handlePlaceOrder = () => {
    if (!qty) {
      toast.error('Please enter quantity');
      return;
    }
    setIsPlacing(true);
    setTimeout(() => {
      toast.success(`${orderType} order placed for ${qty} shares of ${stockSymbol}`);
      setIsPlacing(false);
      setQty('');
    }, 1500);
  };

  return (
    <div className="max-w-[1200px] mx-auto pb-10 space-y-6">
      
      {/* Back Button */}
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-semibold"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Explore
      </button>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column (Chart & Details) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Header */}
          <div className="flex justify-between items-start">
            <div className="flex gap-4">
              <div className="w-14 h-14 rounded-full bg-brand-500/10 flex items-center justify-center text-xl font-black text-brand-400">
                {stockSymbol[0]}
              </div>
              <div>
                <h1 className="text-3xl font-black font-display text-white">{stockSymbol}</h1>
                <div className="text-sm text-slate-400 mt-1 uppercase font-semibold tracking-wider">
                  {stockSymbol} • {exchangePrefix}
                </div>
                <div className="mt-4 flex items-baseline gap-3">
                  <span className="text-3xl font-black font-numeric text-white">₹210.01</span>
                  <span className="text-emerald-400 font-semibold font-numeric">+13.03 (6.61%) <span className="text-slate-500 text-sm">1D</span></span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-all">
                <Bell className="w-4 h-4" />
              </button>
              <button className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-all">
                <Bookmark className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* TradingView Chart Container */}
          <div className="card-static p-1 h-[500px]">
            <div id={`tv_chart_${stockSymbol}`} ref={chartContainerRef} className="w-full h-full" />
          </div>
        </div>

        {/* Right Column (Order Widget) */}
        <div className="lg:col-span-4 sticky top-24">
          <div className="card-static overflow-hidden">
            
            {/* Header Tabs (BUY / SELL) */}
            <div className="flex border-b border-white/5">
              <button 
                onClick={() => setOrderType('BUY')}
                className={`flex-1 py-4 font-bold text-sm tracking-wider transition-all ${
                  orderType === 'BUY' ? 'text-brand-400 border-b-2 border-brand-500 bg-brand-500/5' : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                BUY
              </button>
              <button 
                onClick={() => setOrderType('SELL')}
                className={`flex-1 py-4 font-bold text-sm tracking-wider transition-all ${
                  orderType === 'SELL' ? 'text-rose-400 border-b-2 border-rose-500 bg-rose-500/5' : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                SELL
              </button>
            </div>

            <div className="p-6 space-y-6">
              
              {/* Type Toggles */}
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  {['Delivery', 'Intraday', 'MTF'].map((t) => (
                    <button 
                      key={t}
                      onClick={() => setDeliveryType(t as any)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border ${
                        deliveryType === t 
                          ? 'border-brand-500 text-brand-400 bg-brand-500/10' 
                          : 'border-white/10 text-slate-400 hover:border-white/20'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <button className="text-slate-400 hover:text-white"><Settings className="w-4 h-4" /></button>
              </div>

              {/* Inputs */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-slate-300 flex items-center gap-1">
                    Qty {exchangePrefix} <Info className="w-3 h-3 text-slate-500" />
                  </label>
                  <input 
                    type="number" 
                    value={qty}
                    onChange={(e) => setQty(e.target.value)}
                    className="input w-32 text-right bg-dark-800"
                    placeholder="0"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-slate-300 flex items-center gap-1">
                    Price Limit <Info className="w-3 h-3 text-slate-500" />
                  </label>
                  <input 
                    type="number" 
                    value={priceLimit}
                    onChange={(e) => setPriceLimit(e.target.value)}
                    className="input w-32 text-right bg-dark-800"
                    placeholder="210.01"
                  />
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="p-6 bg-white/5 border-t border-white/5">
              <div className="flex justify-between items-center text-xs font-semibold text-slate-400 mb-4">
                <span>Balance: ₹0.00</span>
                <span>Approx req.: ₹{((parseFloat(qty || '0') * parseFloat(priceLimit || '210.01'))).toFixed(2)}</span>
              </div>
              <button 
                onClick={handlePlaceOrder}
                disabled={isPlacing}
                className={`w-full py-3 rounded-lg font-bold text-white transition-all ${
                  orderType === 'BUY' 
                    ? 'bg-brand-500 hover:bg-brand-600 shadow-[0_0_20px_rgba(16,185,129,0.3)]' 
                    : 'bg-rose-500 hover:bg-rose-600 shadow-[0_0_20px_rgba(244,63,94,0.3)]'
                }`}
              >
                {isPlacing ? <span className="spinner w-5 h-5 border-2" /> : orderType}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
