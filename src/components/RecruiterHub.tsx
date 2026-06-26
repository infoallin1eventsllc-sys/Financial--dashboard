import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

type RecruiterTab = 'tips' | 'architecture' | 'bio';

interface Props {
  showRecruiterHub: boolean;
  recruiterActiveTab: RecruiterTab;
  onToggle: () => void;
  onTabChange: (tab: RecruiterTab) => void;
}

export function RecruiterHub({ showRecruiterHub, recruiterActiveTab, onToggle, onTabChange }: Props) {
  return (
    <div
      className="bg-gradient-to-br from-indigo-950/45 via-slate-900/60 to-emerald-950/20 border border-indigo-500/20 rounded-2xl p-4 md:p-5 shadow-xl relative overflow-hidden shrink-0"
      id="recruiter-spotlight-card"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-900/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-900/30 border border-indigo-500/30 rounded-xl text-indigo-400">
            <Sparkles className="h-5 w-5 text-indigo-400 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-mono font-bold tracking-wider text-slate-200 uppercase flex items-center gap-2">
              RECRUITER EVALUATION CENTER
              <span className="text-[9px] font-mono font-bold bg-indigo-500 text-slate-950 px-1.5 py-0.5 rounded tracking-normal normal-case animate-bounce">
                Portfolio Tour
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              Review the system design, tech stack capabilities, and candidate evaluation guide.
            </p>
          </div>
        </div>

        <button
          onClick={onToggle}
          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-[11px] font-mono text-slate-300 rounded-lg hover:text-slate-100 transition-all flex items-center gap-1 cursor-pointer"
          id="recruiter-toggle-btn"
        >
          {showRecruiterHub ? 'Collapse Evaluation Panel' : 'Expand Evaluation Panel'}
        </button>
      </div>

      {showRecruiterHub && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Tab Selector */}
          <div className="md:col-span-3 flex flex-col gap-1.5">
            <span className="text-[9px] font-mono font-bold text-slate-500 tracking-wider uppercase pl-1 block mb-1">
              Select Spotlight Tab
            </span>
            {(
              [
                { id: 'tips', label: '💡 Evaluation Walkthrough' },
                { id: 'architecture', label: '🛡️ Resilience Architecture' },
                { id: 'bio', label: '👨‍💻 Tech Stack & Contact' },
              ] as { id: RecruiterTab; label: string }[]
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`text-left text-xs font-mono font-bold px-3 py-2.5 rounded-lg border transition-all flex items-center justify-between cursor-pointer ${
                  recruiterActiveTab === tab.id
                    ? 'bg-indigo-950/75 text-indigo-300 border-indigo-500/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.02)]'
                    : 'bg-slate-950/30 text-slate-400 border-transparent hover:bg-slate-900/40 hover:text-slate-200'
                }`}
              >
                <span>{tab.label}</span>
                <ArrowRight
                  className={`h-3 w-3 transition-transform ${
                    recruiterActiveTab === tab.id ? 'translate-x-1 text-indigo-400' : 'opacity-0'
                  }`}
                />
              </button>
            ))}
          </div>

          {/* Panel Content */}
          <div className="md:col-span-9 bg-slate-950/65 rounded-xl border border-slate-900/80 p-4 font-mono text-xs text-slate-300 leading-normal">
            {recruiterActiveTab === 'tips' && (
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">
                  Interactive Testing Suite Checklist
                </span>
                <p className="text-[11px] text-slate-400">
                  Step-by-step suggestions for a deep product walkthrough demonstrating multi-polar state reactivity:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] pt-1">
                  {[
                    {
                      num: '01',
                      title: 'Currency Re-Basing',
                      body: (
                        <>
                          Select <span className="text-emerald-400 font-bold">Rebase Terminal</span> top right. Select BTC or
                          EUR. Watch every ticker, sparkline, KPI valuation, and ledger item calculate into that base asset
                          immediately.
                        </>
                      ),
                    },
                    {
                      num: '02',
                      title: 'Sovereign Shock Simulator',
                      body: (
                        <>
                          Trigger a <span className="text-amber-400 font-bold">US Debt Default</span> or custom crisis (bottom
                          left). Check how capital immediately cascades into safe-haven gold and digital networks.
                        </>
                      ),
                    },
                    {
                      num: '03',
                      title: 'AI Tokenizer & Lab',
                      body: (
                        <>
                          Go to the <span className="text-indigo-400 font-bold">Research Lab</span> tab. Prompt our sovereign AI
                          model for speculative assets (e.g. Carbon Credits). Deploy it to instantly append it to live watchlist
                          charts!
                        </>
                      ),
                    },
                    {
                      num: '04',
                      title: 'Export & Ledger Filters',
                      body: (
                        <>
                          Search or filter client settlements in the <span className="text-emerald-400 font-bold">Sales Hub</span>{' '}
                          ledger. Hit "Export Ledger Report" to download certified CSV sheets.
                        </>
                      ),
                    },
                  ].map((item) => (
                    <div
                      key={item.num}
                      className="bg-slate-900/30 border border-slate-900 p-2.5 rounded-lg space-y-1 hover:border-indigo-500/10 transition-colors"
                    >
                      <div className="font-bold text-slate-200 flex items-center gap-1.5">
                        <span className="text-indigo-400">{item.num}.</span> {item.title}
                      </div>
                      <p className="text-slate-400 text-[10px]">{item.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {recruiterActiveTab === 'architecture' && (
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">
                  Full-Stack Resilience &amp; System Architecture
                </span>
                <p className="text-[11px] text-slate-400">
                  This application implements professional full-stack patterns designed to secure, monitor, and scale sovereign
                  multi-polar workflows:
                </p>
                <ul className="space-y-2 text-[11px] text-slate-300">
                  {[
                    {
                      title: 'Server-Side Secret Isolation',
                      body: "Keeping the Gemini API Key completely client-hidden by proxying all speculative insights through Express endpoints ('/api/gemini/*').",
                    },
                    {
                      title: 'Fail-Safe Exponential Retry Backoff',
                      body: 'Implemented an active exponential backoff scheduler (generateContentWithRetry) to gracefully absorb rate-limiting (429) or demand spikes (503) without disrupting live dashboard operations.',
                    },
                    {
                      title: 'High-Fidelity Offline Simulator Fallback',
                      body: 'Automated intelligent fallback matrices which activate to preserve real-time simulation if third-party endpoints go completely offline.',
                    },
                  ].map((item) => (
                    <li key={item.title} className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold shrink-0">&bull;</span>
                      <div>
                        <strong className="text-slate-200 font-semibold">{item.title}</strong>: {item.body}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {recruiterActiveTab === 'bio' && (
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-900 pb-2">
                  <div>
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">
                      Professional Candidate Profile
                    </span>
                    <h4 className="text-sm font-semibold text-slate-100 mt-0.5">Software Engineer &amp; Systems Architect</h4>
                  </div>
                  <span className="text-[8px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-900/30 px-1.5 py-0.5 rounded">
                    Available for Hire
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[11px]">
                  <div className="space-y-2">
                    <div>
                      <span className="text-slate-500 text-[10px] uppercase block">Core Tech Stack Specialties:</span>
                      <p className="text-slate-300 mt-0.5">
                        React 19+, TypeScript, Tailwind CSS, Node.js (Express), Recharts, Gemini Generative AI SDK, REST APIs,
                        UI/UX Engineering.
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] uppercase block">Design Philosophy:</span>
                      <p className="text-slate-300 mt-0.5">
                        Aesthetic clarity, strict type safety, responsive layout density, and robust exception boundaries.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 bg-slate-900/25 p-3 rounded-lg border border-slate-900 flex flex-col justify-between">
                    <div>
                      <span className="text-slate-500 text-[10px] uppercase block">Recruiter Evaluation Contact:</span>
                      <p className="text-slate-200 font-bold mt-1">LinkedIn &amp; GitHub profiles integrated.</p>
                      <p className="text-slate-400 mt-1 text-[10px]">
                        Please review the responsive viewport grids, high-frequency chart states, and offline tolerance logic.
                      </p>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <a
                        href="https://github.com"
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 bg-slate-950 hover:bg-slate-900 text-slate-300 hover:text-white py-1 rounded text-center border border-slate-800 transition-colors cursor-pointer text-[10px]"
                      >
                        GitHub
                      </a>
                      <a
                        href="https://linkedin.com"
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 bg-indigo-950/40 hover:bg-indigo-950 text-indigo-300 hover:text-indigo-200 py-1 rounded text-center border border-indigo-900/40 transition-colors cursor-pointer text-[10px]"
                      >
                        LinkedIn
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
