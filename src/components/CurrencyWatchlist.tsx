import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { Currency, CurrencyCategory } from '../types';
import { getRebasedRate } from '../utils/formatters';

interface Props {
  currencies: Currency[];
  currenciesMap: Record<string, Currency>;
  baseCurrencyCode: string;
  baseCurrency: Currency | undefined;
  selectedCurrencyCode: string;
  filterCategory: CurrencyCategory | 'all';
  flashStates: Record<string, 'up' | 'down' | null>;
  lastUpdated: number;
  onSelectCurrency: (code: string) => void;
  onFilterChange: (cat: CurrencyCategory | 'all') => void;
}

export function CurrencyWatchlist({
  currencies,
  currenciesMap,
  baseCurrencyCode,
  baseCurrency,
  selectedCurrencyCode,
  filterCategory,
  flashStates,
  lastUpdated,
  onSelectCurrency,
  onFilterChange,
}: Props) {
  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Filter Hub */}
      <div className="bg-slate-900/30 border border-slate-900 p-3 rounded-xl shrink-0 flex flex-col gap-2.5">
        <div className="flex justify-between items-center">
          <span className="text-xs font-mono text-slate-400 font-bold tracking-tight">MONETARY SECTOR</span>
          <span className="text-[10px] font-mono text-slate-500">
            Refreshed: {new Date(lastUpdated).toLocaleTimeString()}
          </span>
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {(['all', 'fiat', 'digital', 'cbdc'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => onFilterChange(cat)}
              className={`text-[10px] font-mono font-semibold py-1.5 rounded transition-all capitalize border cursor-pointer ${
                filterCategory === cat
                  ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.1)]'
                  : 'bg-slate-950/40 text-slate-400 border-slate-900 hover:bg-slate-900/60'
              }`}
            >
              {cat === 'all' ? 'All Units' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Scrolling Tickers */}
      <div className="flex-1 overflow-y-auto bg-slate-900/25 border border-slate-900 rounded-xl pr-1 divide-y divide-slate-900/60">
        {currencies.map((c) => {
          const rebased = getRebasedRate(c.code, currenciesMap, baseCurrencyCode);
          const flash = flashStates[c.code];
          const isSelected = selectedCurrencyCode === c.code;

          let flashBg = '';
          if (flash === 'up') flashBg = 'bg-emerald-950/30 border-emerald-500/30';
          else if (flash === 'down') flashBg = 'bg-red-950/30 border-red-500/30';

          return (
            <div
              key={c.code}
              onClick={() => onSelectCurrency(c.code)}
              className={`p-3.5 flex items-center justify-between gap-4 cursor-pointer transition-all border-l-2 ${
                isSelected
                  ? 'bg-slate-900/65 border-l-emerald-500'
                  : 'hover:bg-slate-900/20 border-l-transparent'
              } ${flashBg}`}
              id={`row-${c.code}`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-xl shrink-0 select-none">{c.emoji}</span>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-mono font-bold text-slate-100">{c.code}</span>
                    <span
                      className={`text-[9px] font-mono font-semibold px-1 rounded uppercase ${
                        c.category === 'cbdc'
                          ? 'bg-indigo-950/70 text-indigo-300 border border-indigo-900'
                          : c.category === 'digital'
                          ? 'bg-amber-950/70 text-amber-300 border border-amber-900'
                          : 'bg-slate-950/70 text-slate-400 border border-slate-900'
                      }`}
                    >
                      {c.category}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400/80 truncate">{c.name}</p>
                </div>
              </div>

              {/* Micro Sparkline */}
              <div className="hidden sm:block w-16 h-8 shrink-0">
                <svg className="w-full h-full overflow-visible">
                  <polyline
                    fill="none"
                    stroke={c.changePercent >= 0 ? '#10b981' : '#ef4444'}
                    strokeWidth="1.5"
                    points={c.history
                      .map((val, i) => {
                        const x = (i / 29) * 64;
                        const max = Math.max(...c.history);
                        const min = Math.min(...c.history);
                        const range = max - min || 1;
                        const y = 30 - ((val - min) / range) * 26 - 2;
                        return `${x},${y}`;
                      })
                      .join(' ')}
                  />
                </svg>
              </div>

              {/* Rate & Change */}
              <div className="text-right shrink-0">
                <div className="text-xs font-mono font-bold text-slate-100">
                  {c.category === 'digital'
                    ? `${baseCurrency?.symbol}${(baseCurrency!.currentRate / c.currentRate).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}`
                    : `${c.symbol}${rebased.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 4,
                      })}`}
                </div>
                <div
                  className={`flex items-center justify-end gap-0.5 text-[10px] font-mono font-medium ${
                    c.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {c.changePercent >= 0 ? (
                    <TrendingUp className="h-2.5 w-2.5" />
                  ) : (
                    <TrendingDown className="h-2.5 w-2.5" />
                  )}
                  <span>
                    {c.changePercent >= 0 ? '+' : ''}
                    {c.changePercent.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
