import React from 'react';
import { Sparkles, RefreshCw, TrendingUp, AlertTriangle, Coins } from 'lucide-react';
import type { Currency, AIAnalysis } from '../types';
import { computeSentiment } from '../utils/calculations';

interface Props {
  activeCurrency: Currency | undefined;
  aiAnalysis: AIAnalysis | null;
  isLoadingAnalysis: boolean;
  analysisError: string | null;
}

export function AIBrief({ activeCurrency, aiAnalysis, isLoadingAnalysis, analysisError }: Props) {
  const sentiment = computeSentiment(activeCurrency, aiAnalysis);

  return (
    <div className="bg-slate-900/25 border border-slate-900 p-4 rounded-2xl flex flex-col gap-4" id="ai-strategic-console">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-mono font-bold text-slate-200 tracking-wider flex items-center gap-2 uppercase">
          <Sparkles className="h-4 w-4 text-emerald-400 animate-pulse" />
          AI Intelligence Desk
        </h3>
        {aiAnalysis && (
          <span
            className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${
              aiAnalysis.outlook === 'bullish'
                ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30'
                : aiAnalysis.outlook === 'bearish'
                ? 'bg-red-950/40 text-red-400 border-red-500/30'
                : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}
          >
            Outlook: {aiAnalysis.outlook}
          </span>
        )}
      </div>

      {isLoadingAnalysis ? (
        <div className="py-12 flex flex-col items-center justify-center gap-2">
          <RefreshCw className="h-6 w-6 text-emerald-400 animate-spin" />
          <p className="text-xs text-slate-500 font-mono">Consolidating central bank policies &amp; liquidity data...</p>
        </div>
      ) : analysisError ? (
        <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-900 text-center">
          <p className="text-xs text-slate-400 font-mono">{analysisError}</p>
        </div>
      ) : aiAnalysis ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4" id="ai-brief-grid">
          {/* Sentiment Gauge */}
          <div
            className="flex flex-col bg-slate-950/40 p-4 rounded-xl border border-slate-900/80 justify-between min-h-[300px]"
            id="sentiment-gauge-card"
          >
            <div className="w-full text-left">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Market Mood Index</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className={`text-xs font-bold font-mono tracking-tight ${sentiment.color}`}>
                  {sentiment.label}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  Score: <span className="text-slate-200 font-bold">{sentiment.score}</span>/100
                </span>
              </div>
            </div>

            {/* SVG Gauge Dial */}
            <div
              className="relative w-full max-w-[170px] aspect-[170/105] flex items-center justify-center mt-3 mx-auto"
              id="sentiment-svg-wrapper"
            >
              <svg viewBox="0 0 200 120" className="w-full h-full select-none">
                <defs>
                  <linearGradient id="sentiment-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ef4444" />
                    <stop offset="25%" stopColor="#f97316" />
                    <stop offset="50%" stopColor="#eab308" />
                    <stop offset="75%" stopColor="#84cc16" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>
                <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#1e293b" strokeWidth="11" strokeLinecap="round" />
                <path
                  d="M 20 100 A 80 80 0 0 1 180 100"
                  fill="none"
                  stroke="url(#sentiment-gradient)"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray="251.3"
                  strokeDashoffset={251.3 - (sentiment.score / 100) * 251.3}
                  style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
                />
                <path d="M 35 100 A 65 65 0 0 1 165 100" fill="none" stroke="#0f172a" strokeWidth="1.5" strokeDasharray="4,4" />
                <circle cx="100" cy="100" r="7" fill="#0f172a" stroke="#475569" strokeWidth="2" />
                <circle cx="100" cy="100" r="3" fill="#94a3b8" />
                <line
                  x1="100" y1="100" x2="100" y2="35"
                  stroke="#f1f5f9" strokeWidth="2.5" strokeLinecap="round"
                  style={{
                    transform: `rotate(${-180 + (sentiment.score / 100) * 180}deg)`,
                    transformOrigin: '100px 100px',
                    transition: 'transform 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  }}
                />
                <circle
                  cx="100" cy="35" r="4"
                  fill={sentiment.hex}
                  className="animate-pulse"
                  style={{
                    transform: `rotate(${-180 + (sentiment.score / 100) * 180}deg)`,
                    transformOrigin: '100px 100px',
                    transition: 'transform 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  }}
                />
                <text x="24" y="115" fill="#64748b" fontSize="8" fontFamily="monospace" textAnchor="middle">0 (Fear)</text>
                <text x="100" y="15" fill="#64748b" fontSize="8" fontFamily="monospace" textAnchor="middle">50 (Neutral)</text>
                <text x="174" y="115" fill="#64748b" fontSize="8" fontFamily="monospace" textAnchor="middle">100 (Greed)</text>
              </svg>

              <div className="absolute bottom-1 text-center">
                <span className="text-2xl font-black font-mono tracking-tighter text-slate-100">{sentiment.score}</span>
                <span className="text-[8px] font-mono text-slate-500 block uppercase tracking-widest mt-[-2px]">MOOD</span>
              </div>
            </div>

            <div className="w-full bg-slate-900/40 p-2 rounded-lg border border-slate-950 text-[9px] font-mono text-slate-400 space-y-1 mt-2">
              <div className="flex justify-between items-center">
                <span>Central Bank Bias:</span>
                <span
                  className={`font-bold capitalize ${
                    aiAnalysis.outlook === 'bullish' ? 'text-emerald-400' : aiAnalysis.outlook === 'bearish' ? 'text-red-400' : 'text-amber-400'
                  }`}
                >
                  {aiAnalysis.outlook}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>24h Rate Impact:</span>
                <span className={`font-bold ${(activeCurrency?.changePercent ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {(activeCurrency?.changePercent ?? 0) >= 0 ? '+' : ''}
                  {(activeCurrency?.changePercent ?? 0).toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Sentiment Anchors:</span>
                <span className="text-slate-300 font-bold">
                  {aiAnalysis.drivers?.length ?? 0} U &bull; {aiAnalysis.risks?.length ?? 0} D
                </span>
              </div>
            </div>
          </div>

          {/* Outlook Column */}
          <div className="flex flex-col gap-3">
            <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-900/80">
              <div className="text-[10px] font-mono text-slate-500 uppercase tracking-tight">Executive Brief</div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">{aiAnalysis.summary}</p>
            </div>
            <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-900/80">
              <div className="text-[10px] font-mono text-slate-500 uppercase tracking-tight">12M Sovereign Target</div>
              <div className="text-sm font-mono font-bold text-emerald-400 mt-1">{aiAnalysis.target12m}</div>
            </div>
            <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-900/80">
              <div className="text-[10px] font-mono text-slate-500 uppercase tracking-tight flex items-center gap-1">
                <Coins className="h-3 w-3 text-indigo-400" />
                Futuristic Roadmap (2030+)
              </div>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{aiAnalysis.futuristicForecast}</p>
            </div>
          </div>

          {/* Drivers & Risks Column */}
          <div className="flex flex-col gap-3">
            <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-900/80 flex-1">
              <div className="text-[10px] font-mono text-slate-500 uppercase tracking-tight flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                Catalytic Growth Drivers
              </div>
              <ul className="list-none space-y-2 mt-2">
                {aiAnalysis.drivers.map((drv, i) => (
                  <li key={i} className="text-xs text-slate-300 flex items-start gap-1.5">
                    <span className="text-emerald-500 font-mono mt-0.5">&bull;</span>
                    <span>{drv}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-900/80 flex-1">
              <div className="text-[10px] font-mono text-slate-500 uppercase tracking-tight flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
                Structural Vulnerability Risks
              </div>
              <ul className="list-none space-y-2 mt-2">
                {aiAnalysis.risks.map((rsk, i) => (
                  <li key={i} className="text-xs text-slate-300 flex items-start gap-1.5">
                    <span className="text-red-500 font-mono mt-0.5">&bull;</span>
                    <span>{rsk}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
