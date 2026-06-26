import React from 'react';
import { Activity, Sparkles } from 'lucide-react';
import type { Currency } from '../types';

interface Props {
  currenciesMap: Record<string, Currency>;
  baseCurrencyCode: string;
  onBaseCurrencyChange: (code: string) => void;
  isLoadingForecast: boolean;
  onForecastClick: () => void;
}

export function Header({
  currenciesMap,
  baseCurrencyCode,
  onBaseCurrencyChange,
  isLoadingForecast,
  onForecastClick,
}: Props) {
  return (
    <header
      className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-900 pb-5 shrink-0"
      id="terminal-header"
    >
      <div>
        <div className="flex items-center gap-2.5">
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 pulse-ring-green" />
          <h1 className="text-lg font-mono font-bold tracking-wider text-slate-300">
            SOVEREIGN RESERVE TERMINAL
          </h1>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          Live multi-polar capital orbit &bull; Programmable CBDC integrations
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3.5">
        <div className="flex items-center gap-2 bg-slate-900/60 border border-slate-800/80 px-3 py-1.5 rounded-lg">
          <span className="text-xs text-slate-400 font-mono font-medium">Rebase Terminal:</span>
          <select
            value={baseCurrencyCode}
            onChange={(e) => onBaseCurrencyChange(e.target.value)}
            className="bg-transparent text-xs font-mono font-bold text-emerald-400 outline-none cursor-pointer focus:ring-0"
          >
            {Object.keys(currenciesMap).map((code) => (
              <option key={code} value={code} className="bg-slate-950 text-slate-100">
                {code} ({currenciesMap[code].symbol})
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={onForecastClick}
          disabled={isLoadingForecast}
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-950 to-emerald-950 hover:from-indigo-900 hover:to-emerald-900 text-slate-100 px-3.5 py-1.5 rounded-lg border border-emerald-500/20 text-xs font-mono font-medium transition-all cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.05)]"
          id="ai-forecast-btn"
        >
          <Sparkles className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
          {isLoadingForecast ? 'Decrypting...' : 'AI GLOBAL PREVIEW'}
        </button>

        <div className="flex items-center gap-2 bg-slate-900/40 border border-slate-800/60 px-2.5 py-1.5 rounded-lg text-slate-400 text-xs font-mono">
          <Activity
            className="h-3.5 w-3.5 text-emerald-400 animate-spin"
            style={{ animationDuration: '6s' }}
          />
          <span>LIVE FEED</span>
        </div>
      </div>
    </header>
  );
}
