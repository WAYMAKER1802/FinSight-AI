import React from 'react';
import { FileText, Clock } from 'lucide-react';

export default function Orders() {
  return (
    <div className="space-y-6 max-w-[1000px] mx-auto">
      <div>
        <h1 className="text-2xl font-black font-display text-white flex items-center gap-2">
          <FileText className="w-6 h-6 text-brand-400" /> Orders
        </h1>
        <p className="text-slate-400 text-sm mt-0.5">Track your past and pending orders.</p>
      </div>

      <div className="card-static p-12 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-full bg-brand-500/10 flex items-center justify-center mb-4">
          <Clock className="w-8 h-8 text-brand-400" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">No active orders</h3>
        <p className="text-slate-400 max-w-sm">
          You haven't placed any orders recently. Go to Explore to start investing.
        </p>
      </div>
    </div>
  );
}
