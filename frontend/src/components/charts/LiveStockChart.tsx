/**
 * LiveStockChart — Powered by lightweight-charts v5 (100% free, MIT license)
 * Renders a beautiful area chart with live ticking price updates every 2s.
 */
import React, { useEffect, useRef, useState } from 'react';
import {
  createChart,
  ColorType,
  CrosshairMode,
  AreaSeries,
  type UTCTimestamp,
} from 'lightweight-charts';

interface LiveStockChartProps {
  symbol: string;
  currentPrice?: number;
  basePrice?: number;
}

const MOCK_BASE_PRICES: Record<string, number> = {
  RELIANCE: 1307.8, INFY: 1068, HDFCBANK: 824.95, TCS: 2069, WIPRO: 175.46,
  ICICIBANK: 1401.2, KOTAKBANK: 377.6, AXISBANK: 1323.7, BAJFINANCE: 1020.5,
  ADANIENT: 3157.3, MARUTI: 13854, SUNPHARMA: 1935.5, LTIM: 6200,
  TECHM: 1454.8, ONGC: 244.96, BPCL: 309.75, COALINDIA: 429.3, ITC: 281.75,
  SBIN: 1036, ZOMATO: 230, TATAMOTORS: 960, POWERGRID: 283.1, NTPC: 344.55,
  TATASTEEL: 191.19,
};

function generateHistoricalData(base: number): { time: UTCTimestamp; value: number }[] {
  const data: { time: UTCTimestamp; value: number }[] = [];
  const now = new Date();
  // Market opens 9:15 AM IST = 3:45 AM UTC
  const startMs = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 3, 45, 0);
  const minutesPassed = Math.max(5, Math.min(375, Math.floor((Date.now() - startMs) / 60000)));

  let price = base;
  let seed = base * 9999;
  const rng = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };

  for (let i = 0; i < minutesPassed; i++) {
    const t = Math.floor((startMs + i * 60000) / 1000) as UTCTimestamp;
    price = Math.max(base * 0.88, Math.min(base * 1.12, price + (rng() - 0.495) * base * 0.003));
    data.push({ time: t, value: parseFloat(price.toFixed(2)) });
  }
  return data;
}

const LiveStockChart: React.FC<LiveStockChartProps> = ({ symbol, currentPrice, basePrice }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ReturnType<typeof createChart> | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const seriesRef = useRef<any>(null);
  const [crosshairPrice, setCrosshairPrice] = useState<number | null>(null);

  const base = basePrice || MOCK_BASE_PRICES[symbol?.toUpperCase()] || 1000;

  // ─── Create chart on mount ───────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#94a3b8',
        fontSize: 12,
      },
      grid: {
        vertLines: { color: 'rgba(255,255,255,0.04)' },
        horzLines: { color: 'rgba(255,255,255,0.04)' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { color: '#6366f1', width: 1, style: 3, labelBackgroundColor: '#4f46e5' },
        horzLine: { color: '#6366f1', width: 1, style: 3, labelBackgroundColor: '#4f46e5' },
      },
      rightPriceScale: { borderColor: 'rgba(255,255,255,0.08)' },
      timeScale: { borderColor: 'rgba(255,255,255,0.08)', timeVisible: true, secondsVisible: false },
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight || 400,
    });

    // v5 API: chart.addSeries(SeriesType, options)
    const series = chart.addSeries(AreaSeries, {
      lineColor: '#6366f1',
      topColor: 'rgba(99,102,241,0.35)',
      bottomColor: 'rgba(99,102,241,0.0)',
      lineWidth: 2,
      crosshairMarkerVisible: true,
      crosshairMarkerRadius: 5,
      priceFormat: { type: 'price', precision: 2, minMove: 0.01 },
    });

    chartRef.current = chart;
    seriesRef.current = series;

    series.setData(generateHistoricalData(base));
    chart.timeScale().fitContent();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    chart.subscribeCrosshairMove((param: any) => {
      if (param?.point && seriesRef.current) {
        const p = param.seriesData?.get(seriesRef.current);
        if (p && 'value' in p) setCrosshairPrice(p.value as number);
      } else {
        setCrosshairPrice(null);
      }
    });

    const ro = new ResizeObserver(() => {
      if (containerRef.current) {
        chart.applyOptions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight || 400,
        });
      }
    });
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [symbol, base]);

  // ─── Append new tick on every price update ───────────────────────────────
  useEffect(() => {
    if (!seriesRef.current || !currentPrice) return;
    const now = Math.floor(Date.now() / 1000) as UTCTimestamp;
    seriesRef.current.update({ time: now, value: currentPrice });
  }, [currentPrice]);

  const price = crosshairPrice ?? currentPrice ?? base;
  const change = price - base;
  const changePct = (change / base) * 100;
  const up = change >= 0;

  return (
    <div className="flex flex-col h-full">
      {/* Stats bar */}
      <div className="flex items-center gap-4 px-4 pt-3 pb-1 flex-shrink-0">
        <span className="text-xl font-black font-numeric text-white">
          ₹{price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
        <span className={`text-sm font-semibold font-numeric ${up ? 'text-emerald-400' : 'text-rose-400'}`}>
          {up ? '▲ +' : '▼ '}{change.toFixed(2)} ({up ? '+' : ''}{changePct.toFixed(2)}%)
        </span>
        <span className="ml-auto text-xs text-slate-500 font-medium px-2 py-0.5 rounded bg-white/5">
          1D • NSE
        </span>
      </div>
      {/* Chart canvas */}
      <div ref={containerRef} className="flex-1 w-full min-h-0" />
    </div>
  );
};

export default LiveStockChart;
