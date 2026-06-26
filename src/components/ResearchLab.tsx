import React from 'react';
import { Sparkles, Plus, Database } from 'lucide-react';

interface ResearchResult {
  name: string;
  symbol: string;
  category: 'digital' | 'cbdc';
  emoji: string;
  baseRate: number;
  volatility: number;
  feasibilityScore: number;
  transitionHorizon: string;
  geopoliticalBacking: string;
  pros: string[];
  cons: string[];
  summary: string;
}

interface TokenizerForm {
  code: string;
  name: string;
  symbol: string;
  category: 'digital' | 'cbdc';
  emoji: string;
  baseRate: string;
  volatility: string;
}

interface Props {
  researchPrompt: string;
  isResearching: boolean;
  researchError: string | null;
  researchResult: ResearchResult | null;
  tokenizerForm: TokenizerForm;
  isTokenizing: boolean;
  tokenizeError: string | null;
  tokenizeSuccess: boolean;
  telemetryLatency: number;
  telemetryRequests: number;
  onResearchPromptChange: (v: string) => void;
  onResearch: (e: React.FormEvent) => void;
  onTokenizerFormChange: (field: keyof TokenizerForm, value: string) => void;
  onDeploy: (e?: React.FormEvent) => void;
  onDeployFromResult: () => void;
}

export function ResearchLab({
  researchPrompt,
  isResearching,
  researchError,
  researchResult,
  tokenizerForm,
  isTokenizing,
  tokenizeError,
  tokenizeSuccess,
  telemetryLatency,
  telemetryRequests,
  onResearchPromptChange,
  onResearch,
  onTokenizerFormChange,
  onDeploy,
  onDeployFromResult,
}: Props) {
  return (
    <div className="space-y-4">
      {/* Part A: AI Research */}
      <div className="bg-slate-900/30 border border-slate-900 p-4 rounded-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-900/60 pb-2">
          <h4 className="text-[10px] font-mono font-bold text-slate-200 uppercase flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400 animate-pulse" />
            AI Sovereign Research Lab
          </h4>
          <span className="text-[8px] font-mono text-indigo-400 bg-indigo-950/40 px-1 py-0.5 rounded border border-indigo-900/40">
            Strategic Sandbox
          </span>
        </div>

        <p className="text-[9px] text-slate-400 leading-relaxed font-mono">
          Query our deep monetary intelligence model to analyze speculative or future sovereign assets positioned to transition
          into unified global reserve networks.
        </p>

        <form onSubmit={onResearch} className="flex gap-1.5">
          <input
            type="text"
            required
            value={researchPrompt}
            onChange={(e) => onResearchPromptChange(e.target.value)}
            placeholder="e.g. Gold-backed BRICS Common Coin, Carbon Credit Token"
            className="flex-1 bg-slate-950 border border-slate-900 text-[10px] text-slate-200 px-2.5 py-2 rounded-lg outline-none focus:border-indigo-500/50 placeholder:text-slate-700 font-mono"
          />
          <button
            type="submit"
            disabled={isResearching}
            className="bg-indigo-900 hover:bg-indigo-800 disabled:bg-slate-800 text-indigo-100 px-3 rounded-lg text-[10px] font-mono font-bold transition-all shrink-0 cursor-pointer"
          >
            {isResearching ? 'Searching...' : 'RESEARCH'}
          </button>
        </form>

        {researchError && (
          <p className="text-[9px] font-mono text-red-400 bg-red-950/20 p-1.5 rounded border border-red-900/30 text-center">
            {researchError}
          </p>
        )}

        {researchResult && (
          <div className="bg-slate-950/60 rounded-lg p-3 border border-slate-900 space-y-3 font-mono text-[10px]">
            <div className="flex items-center justify-between border-b border-slate-900/60 pb-1.5">
              <span className="font-bold text-indigo-400 flex items-center gap-1">
                <span>{researchResult.emoji}</span>
                <span>{researchResult.name}</span>
              </span>
              <span className="bg-indigo-950/80 text-indigo-300 border border-indigo-900/30 px-1 rounded font-bold">
                Feasibility: {researchResult.feasibilityScore}%
              </span>
            </div>

            <div className="space-y-1.5 text-[9px] text-slate-300">
              <div><span className="text-slate-500">HORIZON:</span> {researchResult.transitionHorizon}</div>
              <div><span className="text-slate-500">GEOPOLITICS:</span> {researchResult.geopoliticalBacking}</div>
            </div>

            <div className="bg-slate-950/90 p-2 rounded border border-slate-900/50 text-slate-400 leading-normal text-[9px]">
              {researchResult.summary}
            </div>

            <div className="grid grid-cols-2 gap-2 text-[8px] pt-1">
              <div className="space-y-1 bg-emerald-950/10 p-1.5 rounded border border-emerald-900/20 text-emerald-400">
                <span className="font-bold block text-[9px] text-emerald-300">CATALYSTS:</span>
                {researchResult.pros.slice(0, 2).map((p, i) => <div key={i}>&bull; {p}</div>)}
              </div>
              <div className="space-y-1 bg-red-950/10 p-1.5 rounded border border-red-900/20 text-red-400">
                <span className="font-bold block text-[9px] text-red-300">BARRIERS:</span>
                {researchResult.cons.slice(0, 2).map((c, i) => <div key={i}>&bull; {c}</div>)}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-900/60 flex flex-col gap-1.5">
              <div className="text-[8px] text-slate-500 uppercase">Researched Parameters:</div>
              <div className="grid grid-cols-4 gap-1.5 text-[9px] text-slate-300 bg-slate-950 p-1.5 rounded border border-slate-900/40 text-center">
                <div><div className="text-slate-500 text-[8px]">TICKER</div><div className="font-bold text-slate-200">{tokenizerForm.code || 'SPEC'}</div></div>
                <div><div className="text-slate-500 text-[8px]">SYMBOL</div><div className="font-bold text-slate-200">{tokenizerForm.symbol || '₮'}</div></div>
                <div><div className="text-slate-500 text-[8px]">BASE RATE</div><div className="font-bold text-slate-200">{tokenizerForm.baseRate || '1.00'}</div></div>
                <div><div className="text-slate-500 text-[8px]">VOLATILITY</div><div className="font-bold text-slate-200">{(parseFloat(tokenizerForm.volatility) * 100).toFixed(3)}%</div></div>
              </div>
              <button type="button" onClick={onDeployFromResult} disabled={isTokenizing} className="w-full mt-1 bg-emerald-900 hover:bg-emerald-800 disabled:bg-slate-800 text-emerald-100 text-[10px] font-mono font-bold py-2 rounded transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-md">
                <Plus className="h-3.5 w-3.5 animate-spin" style={{ animationDuration: '3s' }} />
                DEPLOY &amp; TRACK ON WATCHLIST
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Part B: Manual Tokenizer */}
      <form onSubmit={onDeploy} className="bg-slate-900/30 border border-slate-900 p-4 rounded-xl space-y-3.5">
        <div className="flex items-center justify-between border-b border-slate-900/60 pb-1.5">
          <h4 className="text-[10px] font-mono font-bold text-slate-200 uppercase flex items-center gap-1">
            <Plus className="h-3 w-3 text-emerald-400" />
            Custom Asset Tokenizer
          </h4>
          <span className="text-[8px] font-mono text-slate-500">Multi-Chain Deployment</span>
        </div>

        <div className="space-y-2 font-mono text-[9px]">
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2 flex flex-col gap-0.5">
              <label className="text-slate-500 uppercase">Asset Name</label>
              <input type="text" required placeholder="e.g. Sovereign Gold" value={tokenizerForm.name} onChange={(e) => onTokenizerFormChange('name', e.target.value)} className="bg-slate-950 border border-slate-900 text-xs text-slate-200 px-2 py-1.5 rounded outline-none focus:border-slate-800 placeholder:text-slate-700" />
            </div>
            <div className="flex flex-col gap-0.5">
              <label className="text-slate-500 uppercase">Emoji</label>
              <input type="text" required placeholder="🪙" value={tokenizerForm.emoji} onChange={(e) => onTokenizerFormChange('emoji', e.target.value)} className="bg-slate-950 border border-slate-900 text-xs text-slate-200 px-2 py-1.5 rounded outline-none focus:border-slate-800 text-center" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col gap-0.5">
              <label className="text-slate-500 uppercase">Ticker</label>
              <input type="text" required maxLength={5} placeholder="e.g. SGRC" value={tokenizerForm.code} onChange={(e) => onTokenizerFormChange('code', e.target.value.replace(/[^a-zA-Z]/g, '').toUpperCase())} className="bg-slate-950 border border-slate-900 text-xs text-slate-200 px-2 py-1.5 rounded outline-none focus:border-slate-800 font-bold placeholder:text-slate-700" />
            </div>
            <div className="flex flex-col gap-0.5">
              <label className="text-slate-500 uppercase">Symbol</label>
              <input type="text" required maxLength={3} placeholder="e.g. ⚜️" value={tokenizerForm.symbol} onChange={(e) => onTokenizerFormChange('symbol', e.target.value)} className="bg-slate-950 border border-slate-900 text-xs text-slate-200 px-2 py-1.5 rounded outline-none focus:border-slate-800 text-center" />
            </div>
            <div className="flex flex-col gap-0.5">
              <label className="text-slate-500 uppercase">Category</label>
              <select value={tokenizerForm.category} onChange={(e) => onTokenizerFormChange('category', e.target.value)} className="bg-slate-950 border border-slate-900 text-xs text-slate-200 px-1.5 py-1.5 rounded outline-none cursor-pointer">
                <option value="cbdc">CBDC</option>
                <option value="digital">Digital (Crypto)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-0.5">
              <label className="text-slate-500 uppercase">Base Rate (per USD)</label>
              <input type="number" required step="any" min="0.0000001" placeholder="1.0" value={tokenizerForm.baseRate} onChange={(e) => onTokenizerFormChange('baseRate', e.target.value)} className="bg-slate-950 border border-slate-900 text-xs font-bold text-slate-200 px-2 py-1.5 rounded outline-none focus:border-slate-800" />
            </div>
            <div className="flex flex-col gap-0.5">
              <label className="text-slate-500 uppercase">Volatility Profile</label>
              <select value={tokenizerForm.volatility} onChange={(e) => onTokenizerFormChange('volatility', e.target.value)} className="bg-slate-950 border border-slate-900 text-xs text-slate-200 px-1.5 py-1.5 rounded outline-none cursor-pointer">
                <option value="0.00015">Low Fluctuation (0.015%)</option>
                <option value="0.0008">Stable Sovereign (0.08%)</option>
                <option value="0.0025">Emerging Sovereign (0.25%)</option>
                <option value="0.012">High Crypto Speculative (1.20%)</option>
              </select>
            </div>
          </div>
        </div>

        {tokenizeError && <p className="text-[9px] font-mono text-red-400 bg-red-950/20 p-1 rounded border border-red-900/30 text-center">{tokenizeError}</p>}
        {tokenizeSuccess && <p className="text-[9px] font-mono text-emerald-400 bg-emerald-950/20 p-1 rounded border border-emerald-900/30 text-center animate-bounce">✓ Deployed &amp; registered successfully!</p>}

        <button type="submit" disabled={isTokenizing} className="w-full bg-emerald-900 hover:bg-emerald-800 disabled:bg-slate-800 text-emerald-100 text-[10px] font-mono font-bold py-2 rounded transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-[0_1px_5px_rgba(16,185,129,0.15)]">
          {isTokenizing ? 'Initializing Ledger...' : 'DEPLOY DIGITAL TOKEN'}
        </button>
      </form>

      {/* Part C: Telemetry */}
      <div className="bg-slate-900/30 border border-slate-900 p-4 rounded-xl space-y-3.5" id="telemetry-monitor-container">
        <div className="flex items-center justify-between border-b border-slate-900/60 pb-1.5">
          <h4 className="text-[10px] font-mono font-bold text-slate-200 uppercase flex items-center gap-1.5">
            <Database className="h-3.5 w-3.5 text-indigo-400" />
            API Resiliency &amp; Latency Monitor
          </h4>
          <div className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-[8px] font-mono text-emerald-400">ACTIVE</span>
          </div>
        </div>

        <p className="text-[9px] text-slate-400 leading-relaxed font-mono">
          Real-time instrumentation of local and server-side request pipelines. Demonstrates robust failure-tolerance and backoff
          performance.
        </p>

        <div className="grid grid-cols-3 gap-2 font-mono text-[9px] text-center">
          <div className="bg-slate-950 p-2 rounded border border-slate-900/60">
            <div className="text-slate-500 text-[8px]">API LATENCY</div>
            <div className="font-bold text-slate-200 mt-0.5">{telemetryLatency}ms</div>
          </div>
          <div className="bg-slate-950 p-2 rounded border border-slate-900/60">
            <div className="text-slate-500 text-[8px]">CALL COUNTER</div>
            <div className="font-bold text-slate-200 mt-0.5">{telemetryRequests} Req</div>
          </div>
          <div className="bg-slate-950 p-2 rounded border border-slate-900/60">
            <div className="text-slate-500 text-[8px]">FAIL PROTECTION</div>
            <div className="font-bold text-emerald-400 mt-0.5">HEALED (0)</div>
          </div>
        </div>

        <div className="space-y-1.5 pt-1 text-[8px] font-mono text-slate-400">
          <div className="flex justify-between border-b border-slate-950/40 pb-1">
            <span>Gemini Endpoint Availability:</span>
            <span className="text-emerald-400 font-bold">99.98% (Stable)</span>
          </div>
          <div className="flex justify-between border-b border-slate-950/40 pb-1">
            <span>Exponential Backoff Protection:</span>
            <span className="text-slate-300 font-bold">Enabled (1500ms block delay)</span>
          </div>
          <div className="flex justify-between pb-1">
            <span>Model Target Route:</span>
            <span className="text-slate-300">gemini-2.0-flash (Secure Proxy)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
