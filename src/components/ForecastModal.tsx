import React from 'react';
import { Sparkles, Coins, Globe, FileText } from 'lucide-react';
import type { AIGlobalOutlook } from '../types';

interface Props {
  forecast: AIGlobalOutlook;
  onClose: () => void;
}

export function ForecastModal({ forecast, onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      id="forecast-modal"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.8)]">
        <div className="p-4.5 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4.5 w-4.5 text-emerald-400 animate-pulse" />
            <h3 className="text-base font-bold tracking-tight text-slate-100">
              Global Monetary Landscape (5-10 Year Outlook)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-xs font-mono bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
          >
            Close
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5">
          <div className="space-y-2">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              Primary Macro-Economic Shifts
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {forecast.macroTrends.map((trend, i) => (
                <div
                  key={i}
                  className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 text-xs text-slate-300 leading-relaxed flex gap-2"
                >
                  <span className="text-emerald-500 font-mono font-bold">0{i + 1}.</span>
                  <span>{trend}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-800/50">
            <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/60">
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                <Coins className="h-4 w-4" />
                Sovereign CBDC Proliferation
              </div>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">{forecast.cbdcEvolution}</p>
            </div>

            <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/60">
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Globe className="h-4 w-4" />
                De-Dollarization Networks
              </div>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">{forecast.dedollarizationThreat}</p>
            </div>

            <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/60">
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4" />
                Decentralized Liquidity Bridges
              </div>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">{forecast.cryptoIntegration}</p>
            </div>

            <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/60">
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <FileText className="h-4 w-4" />
                Emerging Sovereign Hard Assets
              </div>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">{forecast.emergingMarketForecast}</p>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-950/30 shrink-0 text-center text-[10px] font-mono text-slate-500">
          Generative forecasts are synthesized based on continuous macroeconomic telemetry simulations.
        </div>
      </div>
    </div>
  );
}
