import React from 'react';
import { Activity, Database, Plus, Clock } from 'lucide-react';
import type { Currency, MarketState, QuantumEvent } from '../types';
import type { RenderableCurrencyNode } from '../utils/calculations';
import { buildTreemap } from '../utils/calculations';

interface SaleForm {
  client: string;
  amount: string;
  currency: string;
  service: string;
}

interface Props {
  market: MarketState;
  currenciesMap: Record<string, Currency>;
  baseCurrency: Currency | undefined;
  baseCurrencyCode: string;
  activeTab: 'sales' | 'calendar' | 'sandbox';
  salesSubTab: 'ledger' | 'treemap';
  txSearch: string;
  txSort: 'recent' | 'highest' | 'lowest';
  txStatusFilter: 'all' | 'completed' | 'processing' | 'pending';
  saleForm: SaleForm;
  isLoggingSale: boolean;
  saleError: string | null;
  saleSuccess: boolean;
  hoveredNode: RenderableCurrencyNode | null;
  onTabChange: (tab: 'sales' | 'calendar' | 'sandbox') => void;
  onSalesSubTabChange: (tab: 'ledger' | 'treemap') => void;
  onTxSearchChange: (v: string) => void;
  onTxSortChange: (v: 'recent' | 'highest' | 'lowest') => void;
  onTxStatusFilterChange: (v: 'all' | 'completed' | 'processing' | 'pending') => void;
  onSaleFormChange: (field: keyof SaleForm, value: string) => void;
  onLogSale: (e: React.FormEvent) => void;
  onExportCSV: () => void;
  onExportJSON: () => void;
  onHoverNode: (node: RenderableCurrencyNode | null) => void;
  sandboxSlot: React.ReactNode;
}

export function SalesHub({
  market,
  currenciesMap,
  baseCurrency,
  baseCurrencyCode,
  activeTab,
  salesSubTab,
  txSearch,
  txSort,
  txStatusFilter,
  saleForm,
  isLoggingSale,
  saleError,
  saleSuccess,
  hoveredNode,
  onTabChange,
  onSalesSubTabChange,
  onTxSearchChange,
  onTxSortChange,
  onTxStatusFilterChange,
  onSaleFormChange,
  onLogSale,
  onExportCSV,
  onExportJSON,
  onHoverNode,
  sandboxSlot,
}: Props) {
  const getFilteredTransactions = () => {
    let list = [...(market.transactions || [])];
    if (txSearch.trim()) {
      const query = txSearch.toLowerCase();
      list = list.filter(
        (tx) =>
          tx.client.toLowerCase().includes(query) ||
          tx.service.toLowerCase().includes(query) ||
          tx.currency.toLowerCase().includes(query)
      );
    }
    if (txStatusFilter !== 'all') {
      list = list.filter((tx) => tx.status === txStatusFilter);
    }
    if (txSort === 'highest') {
      list.sort((a, b) => {
        const aCurr = currenciesMap[a.currency];
        const bCurr = currenciesMap[b.currency];
        return (bCurr ? b.amount / bCurr.currentRate : 0) - (aCurr ? a.amount / aCurr.currentRate : 0);
      });
    } else if (txSort === 'lowest') {
      list.sort((a, b) => {
        const aCurr = currenciesMap[a.currency];
        const bCurr = currenciesMap[b.currency];
        return (aCurr ? a.amount / aCurr.currentRate : 0) - (bCurr ? b.amount / bCurr.currentRate : 0);
      });
    } else {
      list.sort((a, b) => b.timestamp - a.timestamp);
    }
    return list;
  };

  const { grandTotal, categories } = buildTreemap(market, baseCurrencyCode, 400, 260);

  return (
    <div className="lg:col-span-3 flex flex-col gap-5 h-[calc(100vh-180px)] lg:h-[760px] overflow-hidden" id="sales-calendar-panel">
      {/* Tab Bar */}
      <div className="bg-slate-900/30 border border-slate-900 p-1.5 rounded-xl shrink-0 flex gap-1">
        {(
          [
            { id: 'sales' as const, label: 'Sales Hub', activeClass: 'bg-emerald-950/60 text-emerald-400 border-emerald-800/30' },
            { id: 'calendar' as const, label: 'Calendar', activeClass: 'bg-indigo-950/60 text-indigo-400 border-indigo-800/30' },
            { id: 'sandbox' as const, label: 'Research Lab', activeClass: 'bg-indigo-950/60 text-indigo-400 border-indigo-800/30' },
          ]
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 text-[10px] font-mono font-bold py-1.5 rounded transition-all flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === tab.id
                ? `${tab.activeClass} border shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]`
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto pr-0.5 space-y-4">
        {activeTab === 'sales' && (
          <div className="space-y-4 flex flex-col h-full">
            {/* Sub-tab selector */}
            <div className="flex bg-slate-950/40 p-1 border border-slate-900 rounded-xl shrink-0">
              {(['ledger', 'treemap'] as const).map((sub) => (
                <button
                  key={sub}
                  type="button"
                  onClick={() => onSalesSubTabChange(sub)}
                  className={`flex-1 text-[9px] font-mono font-bold py-1.5 rounded-lg transition-all cursor-pointer text-center ${
                    salesSubTab === sub
                      ? 'bg-slate-900 text-emerald-400 border border-slate-850 shadow-[0_1px_3px_rgba(0,0,0,0.3)]'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {sub === 'ledger' ? 'Ledger Entries' : 'Revenue Treemap'}
                </button>
              ))}
            </div>

            {salesSubTab === 'treemap' ? (
              <div className="bg-slate-900/20 border border-slate-900/80 rounded-xl p-3 flex-1 flex flex-col overflow-hidden min-h-[420px] justify-between">
                <div className="flex items-center justify-between pb-2 border-b border-slate-900/80 mb-2.5 shrink-0">
                  <div className="flex items-center gap-1.5">
                    <Database className="h-3.5 w-3.5 text-emerald-400" />
                    <h4 className="text-[10px] font-mono font-bold tracking-wider text-slate-300 uppercase">
                      Hierarchical Revenue Allocation
                    </h4>
                  </div>
                  <span className="text-[9px] font-mono text-emerald-500 bg-emerald-950/40 px-1 py-0.5 rounded uppercase">
                    Categories Map
                  </span>
                </div>

                <div className="flex-1 flex flex-col justify-center min-h-[280px]">
                  <div className="space-y-3 flex flex-col justify-between h-full">
                    <div className="relative w-full aspect-[400/260]">
                      <svg viewBox="0 0 400 260" className="w-full h-full select-none rounded-lg overflow-hidden border border-slate-900 bg-slate-950/40">
                        {categories.map((cat) => (
                          <g key={cat.name}>
                            <rect x={cat.x} y={cat.y} width={cat.w} height={cat.h} fill="rgba(15,23,42,0.4)" stroke="#1e293b" strokeWidth="1.5" rx="4" />
                            {cat.w > 65 && cat.h > 24 && (
                              <text x={cat.x + 5} y={cat.y + 11} fontSize="8" fontWeight="bold" fontFamily="monospace" fill="#94a3b8">
                                {cat.displayName} ({cat.percentageOfTotal.toFixed(1)}%)
                              </text>
                            )}
                            {cat.children.map((curr) => {
                              if (curr.w < 2 || curr.h < 2) return null;
                              const isHovered = hoveredNode?.code === curr.code;
                              return (
                                <g
                                  key={curr.code}
                                  onMouseEnter={() => onHoverNode(curr)}
                                  onMouseLeave={() => onHoverNode(null)}
                                  className="cursor-pointer"
                                >
                                  <rect
                                    x={curr.x} y={curr.y} width={curr.w} height={curr.h}
                                    fill={curr.category === 'fiat' ? 'rgba(16,185,129,0.08)' : curr.category === 'digital' ? 'rgba(245,158,11,0.08)' : 'rgba(99,102,241,0.08)'}
                                    stroke={isHovered ? '#f1f5f9' : curr.category === 'fiat' ? 'rgba(16,185,129,0.25)' : curr.category === 'digital' ? 'rgba(245,158,11,0.25)' : 'rgba(99,102,241,0.25)'}
                                    strokeWidth={isHovered ? '1.5' : '1'}
                                    rx="3"
                                  />
                                  {curr.w > 26 && curr.h > 18 ? (
                                    <g>
                                      <text x={curr.x + curr.w / 2} y={curr.y + curr.h / 2 - (curr.h > 30 ? 2 : -3)} textAnchor="middle" fontSize={curr.w > 50 ? '10' : '8'} fontFamily="monospace" fill="#f1f5f9" fontWeight="bold">
                                        {curr.w > 45 ? `${curr.emoji} ${curr.code}` : curr.code}
                                      </text>
                                      {curr.h > 30 && (
                                        <text x={curr.x + curr.w / 2} y={curr.y + curr.h / 2 + 10} textAnchor="middle" fontSize="7.5" fontFamily="monospace" fill="#64748b">
                                          {curr.percentageOfTotal.toFixed(1)}%
                                        </text>
                                      )}
                                    </g>
                                  ) : curr.w > 12 && curr.h > 12 ? (
                                    <text x={curr.x + curr.w / 2} y={curr.y + curr.h / 2 + 3.5} textAnchor="middle" fontSize="7" fontFamily="monospace" fill="#94a3b8">
                                      {curr.code.substring(0, 2)}
                                    </text>
                                  ) : null}
                                </g>
                              );
                            })}
                          </g>
                        ))}
                      </svg>
                    </div>

                    {/* Inspector HUD */}
                    <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-900">
                      {hoveredNode ? (
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 font-mono text-[10px]">
                          <div className="flex justify-between border-b border-slate-900/40 pb-1">
                            <span className="text-slate-500 uppercase text-[8px]">Asset Code</span>
                            <span className="text-slate-200 font-bold">{hoveredNode.emoji} {hoveredNode.code}</span>
                          </div>
                          <div className="flex justify-between border-b border-slate-900/40 pb-1">
                            <span className="text-slate-500 uppercase text-[8px]">Revenue Volume</span>
                            <span className="text-emerald-400 font-bold">
                              {baseCurrency?.symbol}{hoveredNode.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: baseCurrency?.category === 'digital' ? 4 : 2 })}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500 uppercase text-[8px]">Category Share</span>
                            <span className="text-indigo-400 font-bold">{hoveredNode.percentageOfCategory.toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500 uppercase text-[8px]">Total Share</span>
                            <span className="text-amber-400 font-bold">{hoveredNode.percentageOfTotal.toFixed(1)}% of Total</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-1 text-center font-mono text-[10px]">
                          <span className="text-slate-400 font-medium">TREEMAP INSPECTION SENSOR ACTIVE</span>
                          <span className="text-slate-600 text-[9px] mt-0.5">Hover cursor over currency tiles to trace relative revenue flows</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Ledger */
              <div className="bg-slate-900/20 border border-slate-900/80 rounded-xl p-3 flex-1 flex flex-col overflow-hidden min-h-[420px]">
                <div className="flex items-center justify-between pb-2 border-b border-slate-900/80 mb-2.5 shrink-0">
                  <div className="flex items-center gap-1.5">
                    <Activity className="h-3.5 w-3.5 text-emerald-400 animate-spin" style={{ animationDuration: '4s' }} />
                    <h4 className="text-[10px] font-mono font-bold tracking-wider text-slate-300 uppercase">Real-Time Transactions</h4>
                  </div>
                  <span className="text-[9px] font-mono text-emerald-500 bg-emerald-950/40 px-1 py-0.5 rounded">Auto-Updating</span>
                </div>

                {/* Filters */}
                <div className="space-y-2 mb-3 bg-slate-950/40 p-2.5 rounded-lg border border-slate-900 shrink-0">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search client, service, or code..."
                      value={txSearch}
                      onChange={(e) => onTxSearchChange(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-[10px] text-slate-200 pl-2.5 pr-8 py-1.5 rounded-lg outline-none focus:border-slate-700 placeholder:text-slate-600 font-mono"
                    />
                    {txSearch && (
                      <button type="button" onClick={() => onTxSearchChange('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 font-mono text-[9px]">
                        clear
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[8px] font-mono text-slate-500 uppercase block mb-1">Status filter</label>
                      <select value={txStatusFilter} onChange={(e) => onTxStatusFilterChange(e.target.value as typeof txStatusFilter)} className="w-full bg-slate-950 border border-slate-800 text-[9px] font-mono font-medium text-slate-300 px-1.5 py-1 rounded outline-none">
                        <option value="all">All Statuses</option>
                        <option value="completed">Completed</option>
                        <option value="processing">Processing</option>
                        <option value="pending">Pending</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[8px] font-mono text-slate-500 uppercase block mb-1">Sort Ledger</label>
                      <select value={txSort} onChange={(e) => onTxSortChange(e.target.value as typeof txSort)} className="w-full bg-slate-950 border border-slate-800 text-[9px] font-mono font-medium text-slate-300 px-1.5 py-1 rounded outline-none">
                        <option value="recent">Recent First</option>
                        <option value="highest">Highest Value</option>
                        <option value="lowest">Lowest Value</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-1.5 pt-1 border-t border-slate-900/40">
                    <button type="button" onClick={onExportCSV} className="flex-1 bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-emerald-400 border border-slate-850 hover:border-emerald-950 px-2 py-1 rounded text-[9px] font-mono transition-colors cursor-pointer">
                      Export CSV Report
                    </button>
                    <button type="button" onClick={onExportJSON} className="flex-1 bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-indigo-400 border border-slate-850 hover:border-indigo-950 px-2 py-1 rounded text-[9px] font-mono transition-colors cursor-pointer">
                      Export JSON Schema
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2.5 pr-0.5">
                  {getFilteredTransactions().map((tx) => {
                    const txCurr = currenciesMap[tx.currency];
                    const valueInUSD = txCurr ? tx.amount / txCurr.currentRate : 0;
                    const valueInBase = valueInUSD * (baseCurrency ? baseCurrency.currentRate : 1);
                    return (
                      <div key={tx.id} className="bg-slate-950/40 border border-slate-900 rounded-lg p-2.5 hover:border-slate-800 transition-colors flex flex-col gap-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-mono font-bold text-slate-200 truncate max-w-[130px]">{tx.client}</span>
                          <span className={`text-[8px] font-mono uppercase px-1 rounded border shrink-0 ${
                            tx.status === 'completed' ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/20' :
                            tx.status === 'processing' ? 'bg-amber-950/40 text-amber-400 border-amber-500/20' :
                            'bg-slate-900 text-slate-400 border-slate-800'
                          }`}>{tx.status}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">{tx.service}</div>
                        <div className="flex items-center justify-between border-t border-slate-900/50 pt-1.5 mt-1">
                          <span className="text-[10px] font-mono text-slate-300">
                            {txCurr?.emoji} {tx.amount.toLocaleString(undefined, { maximumFractionDigits: 4 })}{' '}
                            <span className="text-slate-500">{tx.currency}</span>
                          </span>
                          <span className="text-[10px] font-mono font-bold text-emerald-400">
                            ≈ {baseCurrency?.symbol}{valueInBase.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: baseCurrency?.category === 'digital' ? 4 : 2 })}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  {!market.transactions.length && (
                    <div className="py-12 text-center text-[10px] font-mono text-slate-600">
                      No corporate settlements detected on network.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Log Sale Form */}
            <form onSubmit={onLogSale} className="bg-slate-900/30 border border-slate-900 p-3.5 rounded-xl shrink-0 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-900/60 pb-1.5">
                <h4 className="text-[10px] font-mono font-bold text-slate-300 uppercase flex items-center gap-1">
                  <Plus className="h-3 w-3 text-emerald-400" />
                  Log Manual Sale
                </h4>
                <span className="text-[8px] font-mono text-slate-500">Corporate Ledger</span>
              </div>
              <div className="space-y-2">
                <div className="flex flex-col gap-0.5">
                  <label className="text-[8px] font-mono text-slate-500 uppercase">Client Organization</label>
                  <input type="text" required placeholder="e.g. Acme Capital" value={saleForm.client} onChange={(e) => onSaleFormChange('client', e.target.value)} className="bg-slate-950 border border-slate-900 text-xs text-slate-200 px-2 py-1.5 rounded outline-none focus:border-slate-800 placeholder:text-slate-700" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <label className="text-[8px] font-mono text-slate-500 uppercase">Product / Service</label>
                  <input type="text" required placeholder="e.g. Treasury Arbitrage" value={saleForm.service} onChange={(e) => onSaleFormChange('service', e.target.value)} className="bg-slate-950 border border-slate-900 text-xs text-slate-200 px-2 py-1.5 rounded outline-none focus:border-slate-800 placeholder:text-slate-700" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-0.5">
                    <label className="text-[8px] font-mono text-slate-500 uppercase">Amount</label>
                    <input type="number" required min="0.0001" step="any" placeholder="Amount" value={saleForm.amount} onChange={(e) => onSaleFormChange('amount', e.target.value)} className="bg-slate-950 border border-slate-900 text-xs font-mono font-bold text-slate-200 px-2 py-1.5 rounded outline-none focus:border-slate-800 placeholder:text-slate-700" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <label className="text-[8px] font-mono text-slate-500 uppercase">Currency</label>
                    <select value={saleForm.currency} onChange={(e) => onSaleFormChange('currency', e.target.value)} className="bg-slate-950 border border-slate-900 text-xs font-mono text-slate-200 px-1.5 py-1.5 rounded outline-none cursor-pointer">
                      {Object.keys(currenciesMap).map((code) => (
                        <option key={code} value={code}>{currenciesMap[code].emoji} {code}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              {saleError && <p className="text-[9px] font-mono text-red-400 bg-red-950/20 p-1 rounded border border-red-900/30 text-center">{saleError}</p>}
              {saleSuccess && <p className="text-[9px] font-mono text-emerald-400 bg-emerald-950/20 p-1 rounded border border-emerald-900/30 text-center animate-bounce">✓ Registered successfully!</p>}
              <button type="submit" disabled={isLoggingSale} className="w-full bg-emerald-900 hover:bg-emerald-800 disabled:bg-slate-800 text-emerald-100 text-[10px] font-mono font-bold py-2 rounded transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-[0_1px_5px_rgba(16,185,129,0.15)]">
                {isLoggingSale ? 'Registering...' : 'REGISTER TRANSACTION'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'calendar' && (
          <CalendarTab quantumCalendar={market.quantumCalendar} />
        )}

        {activeTab === 'sandbox' && sandboxSlot}
      </div>
    </div>
  );
}

function CalendarTab({ quantumCalendar }: { quantumCalendar: QuantumEvent[] }) {
  return (
    <div className="bg-slate-900/20 border border-slate-900/80 rounded-xl p-3.5 space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-900/80">
        <div className="flex items-center gap-1.5">
          <span className="text-indigo-400">📅</span>
          <h4 className="text-[10px] font-mono font-bold tracking-wider text-slate-300 uppercase">Quantum Calendar</h4>
        </div>
        <span className="text-[8px] font-mono text-indigo-400 bg-indigo-950/40 px-1 py-0.5 rounded border border-indigo-900/40">
          Sovereign Grid
        </span>
      </div>

      <p className="text-[9px] text-slate-400/80 leading-relaxed font-mono">
        High-precision temporal coordinates tracing central bank liquidity events and digital consensus block convergence.
      </p>

      <div className="space-y-4 pt-1">
        {quantumCalendar.map((evt) => (
          <div key={evt.id} className="relative pl-4 border-l-2 border-indigo-500/30 hover:border-indigo-400 transition-colors py-0.5">
            <div className={`absolute -left-[5px] top-1.5 h-2 w-2 rounded-full border ${
              evt.status === 'Executed' ? 'bg-emerald-500 border-slate-950' :
              evt.status === 'Converging' ? 'bg-indigo-500 border-slate-950 animate-pulse' :
              'bg-slate-800 border-slate-950'
            }`} />
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-1">
                <span className={`text-[8px] font-mono px-1 rounded capitalize ${
                  evt.category === 'cbdc' ? 'bg-indigo-950/60 text-indigo-300 border border-indigo-900/40' :
                  evt.category === 'digital' ? 'bg-amber-950/60 text-amber-300 border border-amber-900/40' :
                  evt.category === 'macro' ? 'bg-red-950/60 text-red-300 border border-red-900/40' :
                  'bg-slate-950 text-slate-400'
                }`}>{evt.category}</span>
                <span className="text-[8px] font-mono text-slate-500">Block #{evt.quantumBlock}</span>
              </div>
              <h5 className="text-[10px] font-bold text-slate-200 leading-tight">{evt.title}</h5>
              <p className="text-[9px] text-slate-400/90 leading-normal">{evt.description}</p>
              <div className="flex items-center justify-between text-[8px] font-mono text-slate-500 border-t border-slate-950/30 pt-1">
                <span className="flex items-center gap-1">
                  <Clock className="h-2.5 w-2.5 text-slate-500" />
                  {evt.timeLabel}
                </span>
                <span className={`font-bold ${
                  evt.volatilityIndex === 'EXTREME' ? 'text-red-400 animate-pulse' :
                  evt.volatilityIndex === 'High' ? 'text-amber-400' :
                  evt.volatilityIndex === 'Medium' ? 'text-indigo-400' :
                  'text-slate-400'
                }`}>Volatility: {evt.volatilityIndex}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
