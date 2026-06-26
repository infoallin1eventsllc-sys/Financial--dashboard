import React from 'react';
import { Activity } from 'lucide-react';

interface Props {
  isLoadingRates: boolean;
  onRetry: () => void;
}

export function LoadingScreen({ isLoadingRates, onRetry }: Props) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-slate-100 font-sans p-6 text-center" id="loading-screen">
      <Activity className={`h-12 w-12 text-emerald-500 mb-4 ${isLoadingRates ? 'animate-pulse' : ''}`} />
      <h2 className="text-xl font-medium tracking-tight">
        {isLoadingRates ? 'Initializing Sovereign Capital Orbit...' : 'Feeds Connection Latency'}
      </h2>
      <p className="text-xs text-slate-500 font-mono mt-2 max-w-md">
        {isLoadingRates
          ? 'Loading high-frequency global clearing feeds...'
          : 'The high-frequency market orbit is waiting to establish a secure clearing link.'}
      </p>
      {!isLoadingRates && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-6 px-4 py-2 text-xs font-mono font-bold bg-emerald-950/40 text-emerald-400 hover:bg-emerald-900/40 border border-emerald-500/30 rounded-lg cursor-pointer transition-all active:scale-95"
          id="retry-connection-btn"
        >
          ESTABLISH FEED CONNECTION
        </button>
      )}
    </div>
  );
}
