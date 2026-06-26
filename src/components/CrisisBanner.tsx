import React from 'react';
import { ShieldAlert, RotateCcw } from 'lucide-react';
import type { ShockEvent } from '../types';

interface Props {
  shockEvent: ShockEvent;
  isResolving: boolean;
  onResolve: () => void;
}

export function CrisisBanner({ shockEvent, isResolving, onResolve }: Props) {
  return (
    <div className="bg-gradient-to-r from-red-950 via-amber-950 to-red-950 border-b border-red-800/60 px-4 py-3.5 relative overflow-hidden shrink-0" id="global-shock-alert">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.15),transparent_80%)] animate-pulse" />
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-red-900/40 border border-red-500/40 rounded-lg text-red-400 shrink-0 mt-0.5">
            <ShieldAlert className="h-5 w-5 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-bold tracking-wider bg-red-500 text-slate-950 px-1.5 py-0.5 rounded">
                MARKET CRISIS
              </span>
              <h4 className="text-sm font-semibold tracking-tight text-red-200">{shockEvent.name}</h4>
              <span className="text-xs text-slate-400 font-mono">
                [{new Date(shockEvent.timestamp).toLocaleTimeString()}]
              </span>
            </div>
            <p className="text-xs text-red-300/85 max-w-4xl mt-1 leading-relaxed">{shockEvent.description}</p>
          </div>
        </div>

        <button
          onClick={onResolve}
          disabled={isResolving}
          className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 disabled:bg-slate-800 text-white font-mono text-xs font-bold px-3.5 py-2 rounded-lg border border-red-400/30 transition-all duration-200 hover:shadow-[0_0_12px_rgba(239,68,68,0.3)] cursor-pointer self-start md:self-center"
          id="resolve-crisis-btn"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          RESOLVE &amp; RESET
        </button>
      </div>
    </div>
  );
}
