import React, { useState } from 'react';
import type { CurrencyCategory } from './types';
import type { RenderableCurrencyNode } from './utils/calculations';
import { computeKPIs, buildChartData } from './utils/calculations';
import { useMarket } from './hooks/useMarket';
import { useAI } from './hooks/useAI';
import { LoadingScreen } from './components/LoadingScreen';
import { CrisisBanner } from './components/CrisisBanner';
import { Header } from './components/Header';
import { KPIRow } from './components/KPIRow';
import { RecruiterHub } from './components/RecruiterHub';
import { CurrencyWatchlist } from './components/CurrencyWatchlist';
import { ShockSimulator } from './components/ShockSimulator';
import { PriceChart } from './components/PriceChart';
import { AIBrief } from './components/AIBrief';
import { CurrencyConverter } from './components/CurrencyConverter';
import { SalesHub } from './components/SalesHub';
import { ResearchLab } from './components/ResearchLab';
import { ForecastModal } from './components/ForecastModal';

export default function App() {
  // Navigation state
  const [selectedCurrencyCode, setSelectedCurrencyCode] = useState('BTC');
  const [baseCurrencyCode, setBaseCurrencyCode] = useState('USD');
  const [filterCategory, setFilterCategory] = useState<CurrencyCategory | 'all'>('all');
  const [comparisonCurrencyCode, setComparisonCurrencyCode] = useState<string | null>(null);

  // Market data hook
  const { market, isLoadingRates, flashStates, fetchRates, setMarket } = useMarket();

  // AI hook
  const {
    aiAnalysis,
    isLoadingAnalysis,
    analysisError,
    globalForecast,
    showForecastModal,
    isLoadingForecast,
    fetchGlobalForecast,
    setShowForecastModal,
  } = useAI(selectedCurrencyCode);

  // Shock simulator state
  const [isTriggeringShock, setIsTriggeringShock] = useState(false);
  const [selectedShockType, setSelectedShockType] = useState('usd_default');
  const [customShockText, setCustomShockText] = useState('');

  // Converter state
  const [calcAmount, setCalcAmount] = useState(1);
  const [calcFrom, setCalcFrom] = useState('BTC');
  const [calcTo, setCalcTo] = useState('EUR');

  // Sales Hub state
  const [activeTab, setActiveTab] = useState<'sales' | 'calendar' | 'sandbox'>('sales');
  const [salesSubTab, setSalesSubTab] = useState<'ledger' | 'treemap'>('ledger');
  const [txSearch, setTxSearch] = useState('');
  const [txSort, setTxSort] = useState<'recent' | 'highest' | 'lowest'>('recent');
  const [txStatusFilter, setTxStatusFilter] = useState<'all' | 'completed' | 'processing' | 'pending'>('all');
  const [hoveredNode, setHoveredNode] = useState<RenderableCurrencyNode | null>(null);
  const [saleForm, setSaleForm] = useState({ client: '', amount: '', currency: 'USD', service: '' });
  const [isLoggingSale, setIsLoggingSale] = useState(false);
  const [saleError, setSaleError] = useState<string | null>(null);
  const [saleSuccess, setSaleSuccess] = useState(false);

  // Research Lab state
  const [researchPrompt, setResearchPrompt] = useState('');
  const [isResearching, setIsResearching] = useState(false);
  const [researchError, setResearchError] = useState<string | null>(null);
  const [researchResult, setResearchResult] = useState<{
    name: string; symbol: string; category: 'digital' | 'cbdc'; emoji: string;
    baseRate: number; volatility: number; feasibilityScore: number; transitionHorizon: string;
    geopoliticalBacking: string; pros: string[]; cons: string[]; summary: string;
  } | null>(null);
  const [tokenizerForm, setTokenizerForm] = useState({
    code: '', name: '', symbol: '', category: 'cbdc' as 'digital' | 'cbdc',
    emoji: '🪙', baseRate: '1.0', volatility: '0.0015',
  });
  const [isTokenizing, setIsTokenizing] = useState(false);
  const [tokenizeError, setTokenizeError] = useState<string | null>(null);
  const [tokenizeSuccess, setTokenizeSuccess] = useState(false);

  // Recruiter Hub state
  const [showRecruiterHub, setShowRecruiterHub] = useState(true);
  const [recruiterActiveTab, setRecruiterActiveTab] = useState<'tips' | 'architecture' | 'bio'>('tips');

  // Telemetry
  const [telemetryLatency] = useState(240);
  const [telemetryRequests, setTelemetryRequests] = useState(16);

  // ─── Derived values ────────────────────────────────────────────────────────
  if (!market) {
    return <LoadingScreen isLoadingRates={isLoadingRates} onRetry={() => fetchRates()} />;
  }

  const currenciesMap = market.currencies;
  const activeCurrency = currenciesMap[selectedCurrencyCode];
  const baseCurrency = currenciesMap[baseCurrencyCode];
  const comparisonCurrency = comparisonCurrencyCode ? currenciesMap[comparisonCurrencyCode] : undefined;
  const kpis = computeKPIs(market, baseCurrencyCode);
  const chartData = buildChartData(activeCurrency, baseCurrency, comparisonCurrency);
  const filteredCurrencies = Object.values(currenciesMap).filter(
    (c) => filterCategory === 'all' || c.category === filterCategory
  );

  // ─── Actions ───────────────────────────────────────────────────────────────
  const triggerShock = async () => {
    setIsTriggeringShock(true);
    try {
      const res = await fetch('/api/simulate-shock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shockType: selectedShockType, customShockName: customShockText.trim() || undefined }),
      });
      if (res.ok) { await fetchRates(false); setCustomShockText(''); }
    } catch (err) { console.error(err); }
    finally { setIsTriggeringShock(false); }
  };

  const resolveCrisis = async () => {
    setIsTriggeringShock(true);
    try {
      const res = await fetch('/api/simulate-shock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shockType: 'reset', customShockName: 'Market Rebalancing' }),
      });
      if (res.ok) {
        setMarket((prev) => prev ? { ...prev, shockEvent: null } : prev);
        await fetchRates(false);
      }
    } catch (err) { console.error(err); }
    finally { setIsTriggeringShock(false); }
  };

  const handleLogSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!saleForm.client.trim() || !saleForm.amount || !saleForm.service.trim()) {
      setSaleError('Please complete all fields.'); return;
    }
    const amountNum = parseFloat(saleForm.amount);
    if (isNaN(amountNum) || amountNum <= 0) { setSaleError('Amount must be a positive number.'); return; }

    setIsLoggingSale(true); setSaleError(null); setSaleSuccess(false);
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client: saleForm.client.trim(), amount: amountNum, currency: saleForm.currency, service: saleForm.service.trim() }),
      });
      if (res.ok) {
        setSaleSuccess(true);
        setSaleForm({ client: '', amount: '', currency: 'USD', service: '' });
        await fetchRates(true);
        setTimeout(() => setSaleSuccess(false), 3000);
      } else { setSaleError('Failed to register corporate sale.'); }
    } catch { setSaleError('Network error registering transaction.'); }
    finally { setIsLoggingSale(false); }
  };

  const handleResearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!researchPrompt.trim()) return;
    setIsResearching(true); setResearchError(null); setResearchResult(null);
    try {
      const res = await fetch('/api/research-currency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: researchPrompt.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.research) {
          setResearchResult(data.research);
          const r = data.research;
          const ticker = r.name.replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase();
          setTokenizerForm({
            code: ticker, name: r.name, symbol: r.symbol || '₮',
            category: r.category || 'cbdc', emoji: r.emoji || '🪙',
            baseRate: r.baseRate ? String(r.baseRate) : '1.0',
            volatility: r.volatility ? String(r.volatility) : '0.0015',
          });
        } else { setResearchError('AI response formatting error. Please try again.'); }
      } else {
        const data = await res.json();
        setResearchError(data.error || 'Failed to analyze future global currency.');
      }
    } catch { setResearchError('Network error. AI sovereign server is offline.'); }
    finally { setIsResearching(false); }
  };

  const handleDeploy = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const codeToUse = tokenizerForm.code.trim().toUpperCase();
    const nameToUse = tokenizerForm.name.trim();
    const symbolToUse = tokenizerForm.symbol.trim() || '₮';
    const rateNum = parseFloat(tokenizerForm.baseRate);
    if (!codeToUse || !nameToUse || !symbolToUse || isNaN(rateNum) || rateNum <= 0) {
      setTokenizeError('All core parameters are required.'); return;
    }
    setIsTokenizing(true); setTokenizeError(null); setTokenizeSuccess(false);
    try {
      const res = await fetch('/api/tokenize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: codeToUse, name: nameToUse, symbol: symbolToUse,
          category: tokenizerForm.category, emoji: tokenizerForm.emoji.trim() || '🪙',
          baseRate: rateNum, volatility: parseFloat(tokenizerForm.volatility) || 0.0015,
        }),
      });
      if (res.ok) {
        setTokenizeSuccess(true);
        setTokenizerForm({ code: '', name: '', symbol: '', category: 'cbdc', emoji: '🪙', baseRate: '1.0', volatility: '0.0015' });
        await fetchRates(false);
        setSelectedCurrencyCode(codeToUse);
        setTimeout(() => setTokenizeSuccess(false), 4000);
      } else {
        const data = await res.json();
        setTokenizeError(data.error || 'Failed to deploy tokenized ledger.');
      }
    } catch { setTokenizeError('Network error deploying tokenized ledger.'); }
    finally { setIsTokenizing(false); }
  };

  const exportTransactionsCSV = () => {
    if (!market.transactions) return;
    const headers = ['ID', 'Client', 'Service', 'Amount', 'Currency', 'Status', 'Timestamp'];
    const rows = market.transactions.map((tx) => [
      tx.id, `"${tx.client.replace(/"/g, '""')}"`, `"${tx.service.replace(/"/g, '""')}"`,
      tx.amount, tx.currency, tx.status, new Date(tx.timestamp).toISOString(),
    ]);
    const csvData = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvData));
    link.setAttribute('download', `sovereign_transactions_ledger_${Date.now()}.csv`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
    setTelemetryRequests((p) => p + 1);
  };

  const exportTransactionsJSON = () => {
    if (!market.transactions) return;
    const link = document.createElement('a');
    link.setAttribute('href', 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(market.transactions, null, 2)));
    link.setAttribute('download', `sovereign_transactions_ledger_${Date.now()}.json`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
    setTelemetryRequests((p) => p + 1);
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col antialiased selection:bg-emerald-500 selection:text-slate-950" id="currency-terminal-root">

      {market.shockEvent && (
        <CrisisBanner shockEvent={market.shockEvent} isResolving={isTriggeringShock} onResolve={resolveCrisis} />
      )}

      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 flex-1 flex flex-col gap-6">

        <Header
          currenciesMap={currenciesMap}
          baseCurrencyCode={baseCurrencyCode}
          onBaseCurrencyChange={setBaseCurrencyCode}
          isLoadingForecast={isLoadingForecast}
          onForecastClick={fetchGlobalForecast}
        />

        <KPIRow kpis={kpis} baseCurrency={baseCurrency} baseCurrencyCode={baseCurrencyCode} />

        <RecruiterHub
          showRecruiterHub={showRecruiterHub}
          recruiterActiveTab={recruiterActiveTab}
          onToggle={() => { setShowRecruiterHub((v) => !v); setTelemetryRequests((p) => p + 1); }}
          onTabChange={(tab) => { setRecruiterActiveTab(tab); setTelemetryRequests((p) => p + 1); }}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 items-start">

          {/* Left Column: Watchlist + Shock Simulator */}
          <div className="lg:col-span-4 flex flex-col gap-5 h-[calc(100vh-180px)] lg:h-[760px] overflow-hidden" id="watchlist-panel">
            <div className="flex-1 overflow-hidden flex flex-col gap-3">
              <CurrencyWatchlist
                currencies={filteredCurrencies}
                currenciesMap={currenciesMap}
                baseCurrencyCode={baseCurrencyCode}
                baseCurrency={baseCurrency}
                selectedCurrencyCode={selectedCurrencyCode}
                filterCategory={filterCategory}
                flashStates={flashStates}
                lastUpdated={market.lastUpdated}
                onSelectCurrency={setSelectedCurrencyCode}
                onFilterChange={setFilterCategory}
              />
            </div>
            <ShockSimulator
              selectedShockType={selectedShockType}
              customShockText={customShockText}
              isTriggeringShock={isTriggeringShock}
              onShockTypeChange={setSelectedShockType}
              onCustomTextChange={setCustomShockText}
              onTrigger={triggerShock}
            />
          </div>

          {/* Center Column: Chart + AI Brief + Converter */}
          <div className="lg:col-span-5 flex flex-col gap-5 h-[calc(100vh-180px)] lg:h-[760px] overflow-y-auto pr-1" id="trading-desk">
            {activeCurrency && (
              <PriceChart
                activeCurrency={activeCurrency}
                baseCurrency={baseCurrency}
                baseCurrencyCode={baseCurrencyCode}
                comparisonCurrencyCode={comparisonCurrencyCode}
                comparisonCurrency={comparisonCurrency}
                currenciesMap={currenciesMap}
                chartData={chartData}
                onComparisonChange={setComparisonCurrencyCode}
              />
            )}
            <AIBrief
              activeCurrency={activeCurrency}
              aiAnalysis={aiAnalysis}
              isLoadingAnalysis={isLoadingAnalysis}
              analysisError={analysisError}
            />
            <CurrencyConverter
              currenciesMap={currenciesMap}
              calcAmount={calcAmount}
              calcFrom={calcFrom}
              calcTo={calcTo}
              onAmountChange={setCalcAmount}
              onFromChange={setCalcFrom}
              onToChange={setCalcTo}
              onSwap={() => { const t = calcFrom; setCalcFrom(calcTo); setCalcTo(t); }}
            />
          </div>

          {/* Right Column: Sales Hub (with Research Lab in sandbox tab) */}
          <SalesHub
            market={market}
            currenciesMap={currenciesMap}
            baseCurrency={baseCurrency}
            baseCurrencyCode={baseCurrencyCode}
            activeTab={activeTab}
            salesSubTab={salesSubTab}
            txSearch={txSearch}
            txSort={txSort}
            txStatusFilter={txStatusFilter}
            saleForm={saleForm}
            isLoggingSale={isLoggingSale}
            saleError={saleError}
            saleSuccess={saleSuccess}
            hoveredNode={hoveredNode}
            onTabChange={setActiveTab}
            onSalesSubTabChange={setSalesSubTab}
            onTxSearchChange={setTxSearch}
            onTxSortChange={setTxSort}
            onTxStatusFilterChange={setTxStatusFilter}
            onSaleFormChange={(field, value) => setSaleForm((prev) => ({ ...prev, [field]: value }))}
            onLogSale={handleLogSale}
            onExportCSV={exportTransactionsCSV}
            onExportJSON={exportTransactionsJSON}
            onHoverNode={setHoveredNode}
            sandboxSlot={
              <ResearchLab
                researchPrompt={researchPrompt}
                isResearching={isResearching}
                researchError={researchError}
                researchResult={researchResult}
                tokenizerForm={tokenizerForm}
                isTokenizing={isTokenizing}
                tokenizeError={tokenizeError}
                tokenizeSuccess={tokenizeSuccess}
                telemetryLatency={telemetryLatency}
                telemetryRequests={telemetryRequests}
                onResearchPromptChange={setResearchPrompt}
                onResearch={handleResearch}
                onTokenizerFormChange={(field, value) => setTokenizerForm((prev) => ({ ...prev, [field]: value }))}
                onDeploy={handleDeploy}
                onDeployFromResult={() => handleDeploy()}
              />
            }
          />

        </div>
      </div>

      <footer className="border-t border-slate-900 bg-slate-950/60 px-4 py-3.5 shrink-0 mt-auto" id="terminal-footer">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
            <span>TERMINAL ID: ais-capital-orbit-3.5</span>
            <span>&bull;</span>
            <span>SYSTEM LATENCY: 42ms</span>
            <span>&bull;</span>
            <span className="text-emerald-500">SECURE SHELL INITIALIZED</span>
          </div>
          <div className="text-[10px] font-mono text-slate-500">
            Sovereign Reserve System &copy; {new Date().getFullYear()} &bull; Live Macroeconomic Sandbox
          </div>
        </div>
      </footer>

      {showForecastModal && globalForecast && (
        <ForecastModal forecast={globalForecast} onClose={() => setShowForecastModal(false)} />
      )}
    </div>
  );
}
