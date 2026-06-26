import React from 'react';
import { TrendingUp, Info } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { Currency } from '../types';
import type { ChartEntry } from '../utils/calculations';
import { formatCurrencyValue } from '../utils/formatters';

interface Props {
  activeCurrency: Currency;
  baseCurrency: Currency;
  baseCurrencyCode: string;
  comparisonCurrencyCode: string | null;
  comparisonCurrency: Currency | undefined;
  currenciesMap: Record<string, Currency>;
  chartData: ChartEntry[];
  onComparisonChange: (code: string | null) => void;
}

export function PriceChart({
  activeCurrency,
  baseCurrency,
  baseCurrencyCode,
  comparisonCurrencyCode,
  comparisonCurrency,
  currenciesMap,
  chartData,
  onComparisonChange,
}: Props) {
  const rateText = formatCurrencyValue(activeCurrency.code, currenciesMap, baseCurrencyCode);

  return (
    <div
      className="bg-slate-900/20 border border-slate-900 p-4 rounded-2xl flex flex-col gap-4"
      id="active-terminal-card"
    >
      {/* Heading */}
      <div className="flex items-start justify-between flex-wrap gap-3 pb-3 border-b border-slate-900/60">
        <div className="flex items-center gap-3">
          <span className="text-3xl select-none">{activeCurrency.emoji}</span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-100">{activeCurrency.name}</h2>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded">
                {activeCurrency.code}
              </span>
            </div>
            <p className="text-[11px] text-slate-400/80 font-mono mt-0.5">{rateText}</p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs font-mono text-slate-500 uppercase tracking-wider">High/Low Range</div>
          <div className="text-xs font-mono font-bold text-slate-300 mt-0.5">
            {activeCurrency.category === 'digital' ? (
              <>
                H: {baseCurrency.symbol}
                {(baseCurrency.currentRate / activeCurrency.dayLow).toLocaleString(undefined, { maximumFractionDigits: 1 })}
                {' • '}
                L: {baseCurrency.symbol}
                {(baseCurrency.currentRate / activeCurrency.dayHigh).toLocaleString(undefined, { maximumFractionDigits: 1 })}
              </>
            ) : (
              <>
                H: {activeCurrency.symbol}
                {(activeCurrency.dayHigh / baseCurrency.currentRate).toLocaleString(undefined, { maximumFractionDigits: 4 })}
                {' • '}
                L: {activeCurrency.symbol}
                {(activeCurrency.dayLow / baseCurrency.currentRate).toLocaleString(undefined, { maximumFractionDigits: 4 })}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Correlation Overlay Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-950/40 px-3 py-2 rounded-xl border border-slate-900/60 text-xs font-mono gap-2 shrink-0">
        <div className="flex items-center gap-1.5 text-slate-400">
          <TrendingUp className="h-3.5 w-3.5 text-indigo-400 animate-pulse" />
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-300">Correlation Overlay</span>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={comparisonCurrencyCode ?? ''}
            onChange={(e) => onComparisonChange(e.target.value || null)}
            className="bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-200 px-2 py-1 rounded outline-none cursor-pointer focus:border-indigo-500/50"
          >
            <option value="">None (Single Asset)</option>
            {Object.keys(currenciesMap)
              .filter((code) => code !== activeCurrency.code)
              .map((code) => (
                <option key={code} value={code}>
                  Compare: {currenciesMap[code].emoji} {code}
                </option>
              ))}
          </select>
          {comparisonCurrencyCode && (
            <button
              type="button"
              onClick={() => onComparisonChange(null)}
              className="text-[9px] bg-indigo-950 hover:bg-indigo-900 border border-indigo-800/40 text-indigo-300 px-1.5 py-0.5 rounded transition-colors cursor-pointer font-bold uppercase tracking-wider"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="h-56 w-full" id="chart-viewport">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: comparisonCurrency ? 15 : 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorCompRate" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="tickIndex"
              stroke="#475569"
              fontSize={9}
              fontFamily="monospace"
              tickFormatter={(val) => `T-${30 - val}`}
            />
            <YAxis
              yAxisId="left"
              stroke="#10b981"
              fontSize={9}
              fontFamily="monospace"
              domain={['auto', 'auto']}
              tickFormatter={(val) => val.toLocaleString(undefined, { maximumSignificantDigits: 4 })}
            />
            {comparisonCurrency && (
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#6366f1"
                fontSize={9}
                fontFamily="monospace"
                domain={['auto', 'auto']}
                tickFormatter={(val) => val.toLocaleString(undefined, { maximumSignificantDigits: 4 })}
              />
            )}
            <Tooltip
              contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b' }}
              labelStyle={{ color: '#94a3b8', fontSize: '10px', fontFamily: 'monospace' }}
              itemStyle={{ fontSize: '11px', fontFamily: 'monospace' }}
              formatter={(val, name) => {
                if (name === 'rate') {
                  return [
                    `${val} ${activeCurrency.category === 'digital' ? `${baseCurrencyCode} per ${activeCurrency.code}` : activeCurrency.code}`,
                    `${activeCurrency.code} Rate`,
                  ];
                }
                if (name === 'compRate') {
                  return [
                    `${val} ${comparisonCurrency?.category === 'digital' ? `${baseCurrencyCode} per ${comparisonCurrencyCode}` : comparisonCurrencyCode}`,
                    `${comparisonCurrencyCode} (Overlay)`,
                  ];
                }
                return [val, name];
              }}
              labelFormatter={(val) => `Time interval: Tick ${val}`}
            />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="rate"
              stroke="#10b981"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorRate)"
              name="rate"
            />
            {comparisonCurrency && (
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="compRate"
                stroke="#6366f1"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorCompRate)"
                name="compRate"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 bg-slate-950/30 p-2 rounded-lg">
        <span className="flex items-center gap-1">
          <Info className="h-3.5 w-3.5 text-slate-400" />
          Chart tracks pricing ticks over consecutive system rebalancing events.
        </span>
        <span>Grid Interval: 3000ms</span>
      </div>
    </div>
  );
}
