import React from 'react';
import { DollarSign, TrendingUp, TrendingDown, Users, Coins } from 'lucide-react';
import type { Currency } from '../types';
import type { KPIData } from '../utils/calculations';

interface Props {
  kpis: KPIData;
  baseCurrency: Currency | undefined;
  baseCurrencyCode: string;
}

export function KPIRow({ kpis, baseCurrency, baseCurrencyCode }: Props) {
  const velocityPositive = kpis.velocityPercent >= 0;
  const velocityDisplay = `${velocityPositive ? '+' : ''}${kpis.velocityPercent.toFixed(2)}%`;

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0" id="kpi-dashboard-board">
      {/* Converted Treasury */}
      <div className="bg-slate-900/40 border border-slate-900/80 p-4 rounded-xl flex items-center justify-between shadow-[inset_0_1px_1px_rgba(255,255,255,0.02)] relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-2 opacity-5 text-slate-100 font-mono text-7xl select-none group-hover:opacity-10 transition-opacity pointer-events-none">
          {baseCurrency?.symbol}
        </div>
        <div className="space-y-1.5">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Converted Corporate Revenue</span>
          <div className="text-xl font-mono font-black text-emerald-400 flex items-baseline gap-1 animate-pulse" style={{ animationDuration: '4s' }}>
            <span>{baseCurrency?.symbol}</span>
            <span>
              {kpis.totalRevenueBase.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: baseCurrency?.category === 'digital' ? 5 : 2,
              })}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
            <span>Real-time converting ({baseCurrencyCode})</span>
          </div>
        </div>
        <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/60 text-emerald-500 shrink-0">
          <DollarSign className="h-5 w-5" />
        </div>
      </div>

      {/* Business Velocity — calculated from actual transaction volume delta */}
      <div className="bg-slate-900/40 border border-slate-900/80 p-4 rounded-xl flex items-center justify-between shadow-[inset_0_1px_1px_rgba(255,255,255,0.02)] relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-2 opacity-5 text-slate-100 font-mono text-7xl select-none group-hover:opacity-10 transition-opacity pointer-events-none">
          %
        </div>
        <div className="space-y-1.5">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">24H Velocity Multiplier</span>
          <div className={`text-xl font-mono font-black flex items-baseline gap-1 ${velocityPositive ? 'text-amber-400' : 'text-red-400'}`}>
            <span>{velocityDisplay}</span>
          </div>
          <div className={`flex items-center gap-1.5 text-[10px] font-mono ${velocityPositive ? 'text-emerald-400' : 'text-red-400'}`}>
            {velocityPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            <span>{velocityPositive ? 'Above threshold • Optimal' : 'Below threshold • Slowing'}</span>
          </div>
        </div>
        <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/60 text-amber-500 shrink-0">
          <TrendingUp className="h-5 w-5" />
        </div>
      </div>

      {/* Active Ledger Clients */}
      <div className="bg-slate-900/40 border border-slate-900/80 p-4 rounded-xl flex items-center justify-between shadow-[inset_0_1px_1px_rgba(255,255,255,0.02)] relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-2 opacity-5 text-slate-100 font-mono text-7xl select-none group-hover:opacity-10 transition-opacity pointer-events-none">
          C
        </div>
        <div className="space-y-1.5">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Active Client Ledgers</span>
          <div className="text-xl font-mono font-black text-slate-100 flex items-baseline gap-1">
            <span>{kpis.activeClientsCount}</span>
            <span className="text-xs text-slate-400 font-medium">Organizations</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
            <Users className="h-3.5 w-3.5 text-slate-500" />
            <span>{kpis.completedCount} Completed Settlements</span>
          </div>
        </div>
        <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/60 text-slate-400 shrink-0">
          <Users className="h-5 w-5" />
        </div>
      </div>

      {/* Asset Mix Ratio */}
      <div className="bg-slate-900/40 border border-slate-900/80 p-4 rounded-xl flex items-center justify-between shadow-[inset_0_1px_1px_rgba(255,255,255,0.02)] relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-2 opacity-5 text-slate-100 font-mono text-7xl select-none group-hover:opacity-10 transition-opacity pointer-events-none">
          M
        </div>
        <div className="space-y-1.5 flex-1 pr-2">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Digital Asset/CBDC Ratio</span>
          <div className="text-xl font-mono font-black text-indigo-400 flex items-baseline gap-1">
            <span>{kpis.digitalMixRatio.toFixed(1)}%</span>
          </div>
          <div className="mt-1 w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-900">
            <div
              className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-1.5 rounded-full"
              style={{ width: `${kpis.digitalMixRatio}%` }}
            />
          </div>
        </div>
        <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/60 text-indigo-400 shrink-0">
          <Coins className="h-5 w-5" />
        </div>
      </div>
    </section>
  );
}
