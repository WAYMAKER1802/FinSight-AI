import React, { useState, useRef, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const suggestions = [
  { symbol: 'RELIANCE', name: 'Reliance Industries' },
  { symbol: 'TCS', name: 'Tata Consultancy Services' },
  { symbol: 'HDFCBANK', name: 'HDFC Bank' },
  { symbol: 'INFY', name: 'Infosys' },
  { symbol: 'ZOMATO', name: 'Zomato Ltd' },
  { symbol: 'SUZLON', name: 'Suzlon Energy' },
  { symbol: 'TATAMOTORS', name: 'Tata Motors' },
  { symbol: 'WIPRO', name: 'Wipro Ltd' },
];

export default function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (symbol: string) => {
    setQuery('');
    setIsOpen(false);
    navigate(`/app/stock/${symbol.toUpperCase()}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && query.trim()) {
      // If matches a suggestion, use that symbol, otherwise just use the query as symbol
      const match = suggestions.find(s => 
        s.symbol.toLowerCase() === query.toLowerCase() || 
        s.name.toLowerCase().includes(query.toLowerCase())
      );
      handleSearch(match ? match.symbol : query.trim());
    }
  };

  const filtered = suggestions.filter(s => 
    s.symbol.toLowerCase().includes(query.toLowerCase()) || 
    s.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="relative z-50 flex-1 max-w-md ml-4" ref={wrapperRef}>
      <div className="relative flex items-center">
        <Search className="w-4 h-4 text-slate-400 absolute left-3" />
        <input
          type="text"
          placeholder="Search stocks, mutual funds on NSE & BSE..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="w-full bg-dark-800 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
        />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10, transition: { duration: 0.1 } }}
            className="absolute top-full left-0 right-0 mt-2 bg-dark-800 border border-white/10 rounded-xl shadow-2xl overflow-hidden py-2"
          >
            {filtered.length > 0 ? (
              filtered.map((item) => (
                <div
                  key={item.symbol}
                  onClick={() => handleSearch(item.symbol)}
                  className="px-4 py-2 hover:bg-white/5 cursor-pointer flex justify-between items-center transition-colors"
                >
                  <span className="text-sm font-semibold text-white">{item.name}</span>
                  <span className="text-xs text-slate-500">{item.symbol}</span>
                </div>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-slate-400 text-center">
                Press Enter to search for "{query}"
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
