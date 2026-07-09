import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const indices = [
  { name: 'NIFTY 50', value: '23,962.80', change: '+80.75', percent: '+0.34%', up: true },
  { name: 'SENSEX', value: '76,741.82', change: '+238.22', percent: '+0.31%', up: true },
  { name: 'BANKNIFTY', value: '57,252.45', change: '+509.85', percent: '+0.90%', up: true },
  { name: 'MIDCPNIFTY', value: '14,654.80', change: '+235.70', percent: '+1.63%', up: true },
  { name: 'FINNIFTY', value: '26,482.45', change: '-12.30', percent: '-0.05%', up: false },
  { name: 'NIFTY IT', value: '35,124.50', change: '-45.60', percent: '-0.13%', up: false },
  { name: 'NIFTY AUTO', value: '22,450.90', change: '+120.45', percent: '+0.54%', up: true },
];

export default function TickerTape() {
  return (
    <div className="flex overflow-hidden bg-dark-900 border-b border-white/5 h-10 items-center select-none flex-shrink-0">
      <div className="flex animate-marquee whitespace-nowrap">
        {[...indices, ...indices, ...indices].map((idx, i) => (
          <div key={i} className="flex items-center gap-3 px-6 border-r border-white/5">
            <span className="text-xs font-bold text-slate-300 font-display">{idx.name}</span>
            <span className="text-xs font-numeric text-white">{idx.value}</span>
            <span className={`text-xs font-numeric flex items-center gap-1 ${idx.up ? 'text-emerald-400' : 'text-rose-400'}`}>
              {idx.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {idx.change} ({idx.percent})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
