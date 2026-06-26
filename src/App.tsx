import React, { useState, useEffect, useRef } from 'react';
import { 
  Globe, 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  RefreshCw, 
  Calculator, 
  AlertTriangle, 
  RotateCcw, 
  Sparkles, 
  ArrowRight, 
  FileText, 
  Coins, 
  ShieldAlert, 
  Info,
  DollarSign,
  Calendar,
  Users,
  CheckCircle,
  Clock,
  Plus,
  Database,
  ShoppingBag
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { MarketState, Currency, ShockEvent, AIAnalysis, AIGlobalOutlook, CurrencyCategory } from './types';

export default function App() {
  // Market State
  const [market, setMarket] = useState<MarketState | null>(null);
  const [selectedCurrencyCode, setSelectedCurrencyCode] = useState<string>('BTC');
  const [baseCurrencyCode, setBaseCurrencyCode] = useState<string>('USD');
  const [filterCategory, setFilterCategory] = useState<CurrencyCategory | 'all'>('all');
  const [isLoadingRates, setIsLoadingRates] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Conversion calculator state
  const [calcAmount, setCalcAmount] = useState<number>(1);
  const [calcFrom, setCalcFrom] = useState<string>('BTC');
  const [calcTo, setCalcTo] = useState<string>('EUR');

  // AI analysis panel states
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Global forecast overlay state
  const [globalForecast, setGlobalForecast] = useState<AIGlobalOutlook | null>(null);
  const [showForecastModal, setShowForecastModal] = useState<boolean>(false);
  const [isLoadingForecast, setIsLoadingForecast] = useState<boolean>(false);

  // Shock controller states
  const [isTriggeringShock, setIsTriggeringShock] = useState<boolean>(false);
  const [selectedShockType, setSelectedShockType] = useState<string>('usd_default');
  const [customShockText, setCustomShockText] = useState<string>('');

  // Business Dashboard tab and logger states
  const [activeTab, setActiveTab] = useState<'sales' | 'calendar' | 'sandbox'>('sales');
  const [salesSubTab, setSalesSubTab] = useState<'ledger' | 'treemap'>('ledger');
  const [hoveredNode, setHoveredNode] = useState<any | null>(null);
  const [manualSaleClient, setManualSaleClient] = useState<string>('');
  const [manualSaleAmount, setManualSaleAmount] = useState<string>('');
  const [manualSaleCurrency, setManualSaleCurrency] = useState<string>('USD');
  const [manualSaleService, setManualSaleService] = useState<string>('');
  const [isLoggingSale, setIsLoggingSale] = useState<boolean>(false);
  const [saleError, setSaleError] = useState<string | null>(null);
  const [saleSuccess, setSaleSuccess] = useState<boolean>(false);

  // Asset comparison overlay state
  const [comparisonCurrencyCode, setComparisonCurrencyCode] = useState<string | null>(null);

  // Tokenizer and Research states
  const [researchPrompt, setResearchPrompt] = useState<string>('');
  const [isResearching, setIsResearching] = useState<boolean>(false);
  const [researchError, setResearchError] = useState<string | null>(null);
  const [researchResult, setResearchResult] = useState<{
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
  } | null>(null);

  const [tokCode, setTokCode] = useState<string>('');
  const [tokName, setTokName] = useState<string>('');
  const [tokSymbol, setTokSymbol] = useState<string>('');
  const [tokCategory, setTokCategory] = useState<'digital' | 'cbdc'>('cbdc');
  const [tokEmoji, setTokEmoji] = useState<string>('🪙');
  const [tokBaseRate, setTokBaseRate] = useState<string>('1.0');
  const [tokVolatility, setTokVolatility] = useState<string>('0.0015');
  const [isTokenizing, setIsTokenizing] = useState<boolean>(false);
  const [tokenizeError, setTokenizeError] = useState<string | null>(null);
  const [tokenizeSuccess, setTokenizeSuccess] = useState<boolean>(false);

  // Advanced Recruiter & Resiliency States
  const [showRecruiterHub, setShowRecruiterHub] = useState<boolean>(true);
  const [recruiterActiveTab, setRecruiterActiveTab] = useState<'tips' | 'architecture' | 'bio'>('tips');
  const [txSearch, setTxSearch] = useState<string>('');
  const [txSort, setTxSort] = useState<'recent' | 'highest' | 'lowest'>('recent');
  const [txStatusFilter, setTxStatusFilter] = useState<'all' | 'completed' | 'processing' | 'pending'>('all');
  const [telemetryLatency, setTelemetryLatency] = useState<number>(240);
  const [telemetryRequests, setTelemetryRequests] = useState<number>(16);
  const [telemetryFailures, setTelemetryFailures] = useState<number>(0);

  // Keep track of previous prices to show visual green/red flash ticks
  const prevRatesRef = useRef<{ [code: string]: number }>({});
  const [flashStates, setFlashStates] = useState<{ [code: string]: 'up' | 'down' | null }>({});

  // Fetch Live Market Data
  const fetchRates = async (silent = false) => {
    if (!silent) setIsLoadingRates(true);
    try {
      const response = await fetch('/api/rates');
      if (response.ok) {
        const data: MarketState = await response.json();
        
        // Calculate flashing indicators
        const newFlashStates: { [code: string]: 'up' | 'down' | null } = {};
        Object.keys(data.currencies).forEach(code => {
          const oldVal = prevRatesRef.current[code];
          const newVal = data.currencies[code].currentRate;
          
          if (oldVal !== undefined && oldVal !== newVal) {
            newFlashStates[code] = newVal > oldVal ? 'up' : 'down';
          } else {
            newFlashStates[code] = null;
          }
          prevRatesRef.current[code] = newVal;
        });

        setFlashStates(newFlashStates);
        setMarket(data);

        // Clear flashes after 1 second
        setTimeout(() => {
          setFlashStates({});
        }, 1200);

      }
    } catch (error) {
      console.error("Error fetching market rates:", error);
    } finally {
      setIsLoadingRates(false);
      setIsRefreshing(false);
    }
  };

  // Poll for live-action rates updates every 3 seconds (stable primitive dependency key)
  useEffect(() => {
    fetchRates();
    const interval = setInterval(() => {
      fetchRates(true);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Fetch AI Strategic Intelligence report for the active currency
  const fetchAIAnalysis = async (code: string) => {
    setIsLoadingAnalysis(true);
    setAnalysisError(null);
    try {
      const res = await fetch('/api/gemini/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });
      if (res.ok) {
        const data: AIAnalysis = await res.json();
        setAiAnalysis(data);
      } else {
        setAnalysisError("Could not retrieve AI Brief.");
      }
    } catch (err) {
      console.error("Error fetching AI Analysis:", err);
      setAnalysisError("Network timeout connecting to AI Analyst.");
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  // Trigger AI analysis when active currency selection changes
  useEffect(() => {
    if (selectedCurrencyCode) {
      fetchAIAnalysis(selectedCurrencyCode);
    }
  }, [selectedCurrencyCode]);

  // Fetch Global Futuristic Monetary Outlook
  const fetchGlobalForecast = async () => {
    setIsLoadingForecast(true);
    try {
      const res = await fetch('/api/gemini/global-forecast');
      if (res.ok) {
        const data: AIGlobalOutlook = await res.json();
        setGlobalForecast(data);
        setShowForecastModal(true);
      }
    } catch (err) {
      console.error("Error fetching global monetary forecast:", err);
    } finally {
      setIsLoadingForecast(false);
    }
  };

  // Trigger simulated shock event
  const triggerShock = async () => {
    setIsTriggeringShock(true);
    try {
      const res = await fetch('/api/simulate-shock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shockType: selectedShockType,
          customShockName: customShockText.trim() || undefined
        })
      });
      if (res.ok) {
        // Flash fetch and clear inputs
        await fetchRates(false);
        setCustomShockText('');
      }
    } catch (error) {
      console.error("Error triggering macroeconomic shock:", error);
    } finally {
      setIsTriggeringShock(false);
    }
  };

  // Reset/Resolve shock crisis
  const resolveCrisis = async () => {
    setIsTriggeringShock(true);
    try {
      // Create a dummy mock POST to clear shock or simply restore standard random walks
      const res = await fetch('/api/simulate-shock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shockType: 'reset', customShockName: "Market Rebalancing" })
      });
      if (res.ok) {
        if (market) {
          // Manually reset local state shock event to clear banner instantly
          setMarket({
            ...market,
            shockEvent: null
          });
        }
        await fetchRates(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsTriggeringShock(false);
    }
  };

  // Submit manual sale transaction to the real-time business ledger
  const handleLogSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualSaleClient.trim() || !manualSaleAmount || !manualSaleService.trim()) {
      setSaleError("Please complete all fields.");
      return;
    }

    const amountNum = parseFloat(manualSaleAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setSaleError("Amount must be a positive number.");
      return;
    }

    setIsLoggingSale(true);
    setSaleError(null);
    setSaleSuccess(false);

    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client: manualSaleClient.trim(),
          amount: amountNum,
          currency: manualSaleCurrency,
          service: manualSaleService.trim()
        })
      });

      if (res.ok) {
        setSaleSuccess(true);
        setManualSaleClient('');
        setManualSaleAmount('');
        setManualSaleService('');
        // Quietly fetch updated rates and sales list immediately
        await fetchRates(true);
        setTimeout(() => setSaleSuccess(false), 3000);
      } else {
        setSaleError("Failed to register corporate sale.");
      }
    } catch (err) {
      console.error(err);
      setSaleError("Network error registering transaction.");
    } finally {
      setIsLoggingSale(false);
    }
  };

  const handleResearchFutureCurrency = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!researchPrompt.trim()) return;

    setIsResearching(true);
    setResearchError(null);
    setResearchResult(null);

    try {
      const res = await fetch('/api/research-currency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: researchPrompt.trim() })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.research) {
          setResearchResult(data.research);
          // Autofill tokenization inputs with the researched spec so they can instantly deploy!
          const r = data.research;
          // Generate a ticker symbol e.g. BRICS -> BRC, gold -> GLD, etc.
          const tickerName = r.name.replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase();
          setTokCode(tickerName);
          setTokName(r.name);
          setTokSymbol(r.symbol || '₮');
          setTokCategory(r.category || 'cbdc');
          setTokEmoji(r.emoji || '🪙');
          setTokBaseRate(r.baseRate ? r.baseRate.toString() : '1.0');
          setTokVolatility(r.volatility ? r.volatility.toString() : '0.0015');
        } else {
          setResearchError("AI response formatting error. Please try again.");
        }
      } else {
        const data = await res.json();
        setResearchError(data.error || "Failed to analyze future global currency.");
      }
    } catch (err) {
      console.error(err);
      setResearchError("Network error. AI sovereign server is offline.");
    } finally {
      setIsResearching(false);
    }
  };

  const handleTokenizeDeploy = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    // Fallback values if called programmatically from deployment click
    const codeToUse = tokCode.trim().toUpperCase();
    const nameToUse = tokName.trim();
    const symbolToUse = tokSymbol.trim() || '₮';
    const baseRateToUse = tokBaseRate;

    if (!codeToUse || !nameToUse || !symbolToUse || !baseRateToUse) {
      setTokenizeError("All core parameters are required.");
      return;
    }

    const rateNum = parseFloat(baseRateToUse);
    if (isNaN(rateNum) || rateNum <= 0) {
      setTokenizeError("Base rate must be a positive number.");
      return;
    }

    setIsTokenizing(true);
    setTokenizeError(null);
    setTokenizeSuccess(false);

    try {
      const res = await fetch('/api/tokenize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: codeToUse,
          name: nameToUse,
          symbol: symbolToUse,
          category: tokCategory,
          emoji: tokEmoji.trim() || '🪙',
          baseRate: rateNum,
          volatility: parseFloat(tokVolatility) || 0.0015
        })
      });

      if (res.ok) {
        setTokenizeSuccess(true);
        // Reset deploy form
        setTokCode('');
        setTokName('');
        setTokSymbol('');
        // Refresh rates so the newly tokenized currency is instantly live in the dashboard!
        await fetchRates(false);
        // Set selected currency code so they instantly inspect their freshly tokenized asset!
        setSelectedCurrencyCode(codeToUse);
        setTimeout(() => setTokenizeSuccess(false), 4000);
      } else {
        const data = await res.json();
        setTokenizeError(data.error || "Failed to deploy tokenized ledger.");
      }
    } catch (err) {
      console.error(err);
      setTokenizeError("Network error deploying tokenized ledger.");
    } finally {
      setIsTokenizing(false);
    }
  };

  // Data Export Functions for Recruiter evaluation & corporate audits
  const exportTransactionsCSV = () => {
    if (!market?.transactions) return;
    const headers = ["ID", "Client", "Service", "Amount", "Currency", "Status", "Timestamp"];
    const rows = market.transactions.map(tx => [
      tx.id,
      `"${tx.client.replace(/"/g, '""')}"`,
      `"${tx.service.replace(/"/g, '""')}"`,
      tx.amount,
      tx.currency,
      tx.status,
      new Date(tx.timestamp).toISOString()
    ]);
    const csvData = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = "data:text/csv;charset=utf-8," + encodeURIComponent(csvData);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sovereign_transactions_ledger_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Increment telemetry
    setTelemetryRequests(prev => prev + 1);
  };

  const exportTransactionsJSON = () => {
    if (!market?.transactions) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(market.transactions, null, 2));
    const link = document.createElement("a");
    link.setAttribute("href", dataStr);
    link.setAttribute("download", `sovereign_transactions_ledger_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Increment telemetry
    setTelemetryRequests(prev => prev + 1);
  };

  const exportExchangeRatesCSV = () => {
    if (!market?.currencies) return;
    const headers = ["Currency Code", "Name", "Symbol", "Category", "Rate relative to USD", "Change 24h (%)"];
    const rows = Object.entries(market.currencies).map(([code, entry]) => {
      const c = entry as any;
      return [
        code,
        `"${c.name ? c.name.replace(/"/g, '""') : ''}"`,
        c.symbol || '',
        c.category || '',
        c.currentRate || 0,
        c.changePercent || 0
      ];
    });
    const csvData = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = "data:text/csv;charset=utf-8," + encodeURIComponent(csvData);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `exchange_rates_feed_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Increment telemetry
    setTelemetryRequests(prev => prev + 1);
  };

  if (!market) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-slate-100 font-sans p-6 text-center animate-fade-in" id="loading-screen">
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
            onClick={() => fetchRates()}
            className="mt-6 px-4 py-2 text-xs font-mono font-bold bg-emerald-950/40 text-emerald-400 hover:bg-emerald-900/40 border border-emerald-500/30 rounded-lg cursor-pointer transition-all active:scale-95"
            id="retry-connection-btn"
          >
            ESTABLISH FEED CONNECTION
          </button>
        )}
      </div>
    );
  }

  // Get active currency objects
  const currenciesMap: { [code: string]: Currency } = market?.currencies || {};
  const activeCurrency: Currency | undefined = currenciesMap[selectedCurrencyCode];
  const baseCurrency: Currency | undefined = currenciesMap[baseCurrencyCode];
  const comparisonCurrency: Currency | undefined = comparisonCurrencyCode ? currenciesMap[comparisonCurrencyCode] : undefined;

  // Calculate real-time aggregate business metrics and pipeline value rebased into Base Currency
  const getKPIData = () => {
    const txs = market?.transactions || [];
    let totalRevenueBase = 0;
    let completedCount = 0;
    
    txs.forEach(tx => {
      if (tx.status === 'completed') {
        completedCount++;
      }
      
      const txCurrency = currenciesMap[tx.currency];
      if (!txCurrency || !baseCurrency) return;
      
      // Amount in USD = tx.amount / txCurrency.currentRate
      // Amount in Base = USD * baseCurrency.currentRate
      const valueInUSD = tx.amount / txCurrency.currentRate;
      const valueInBase = valueInUSD * baseCurrency.currentRate;
      
      totalRevenueBase += valueInBase;
    });

    // Active clients count
    const uniqueClients = new Set(txs.map(t => t.client));
    
    // Digital & CBDC allocation percentage
    let digitalUSD = 0;
    let totalUSD = 0;
    txs.forEach(tx => {
      const txCurrency = currenciesMap[tx.currency];
      if (!txCurrency) return;
      
      const valueInUSD = tx.amount / txCurrency.currentRate;
      totalUSD += valueInUSD;
      if (txCurrency.category === 'digital' || txCurrency.category === 'cbdc') {
        digitalUSD += valueInUSD;
      }
    });

    const digitalPercentage = totalUSD > 0 ? (digitalUSD / totalUSD) * 100 : 50;

    return {
      totalRevenueBase,
      completedCount,
      activeClientsCount: uniqueClients.size,
      digitalMixRatio: digitalPercentage
    };
  };

  const kpis = getKPIData();

  // Helper function to rebase a rate relative to the chosen Base Currency
  // Rate values are "units of currency per 1 USD" (e.g. USD = 1.0, EUR = 0.92)
  // Converting rate of target relative to base: target / base
  // e.g. Base = EUR (0.92), Target = JPY (155.4) -> rate in EUR = 155.4 / 0.92 = 168.91 JPY per 1 EUR.
  // Exception: For BTC/ETH which are high value and natively quoted, they are stored as "units per USD" e.g. 0.000015 BTC per 1 USD.
  // Inverting high-value cryptos is much more intuitive for humans (e.g. 1 BTC = $66,000 USD).
  // Let's implement human-friendly rebasing format:
  const getRebasedRate = (targetCode: string): number => {
    const target = currenciesMap[targetCode];
    if (!target || !baseCurrency) return 0;
    
    // Calculate exchange rate: Units of Target per 1 Unit of Base
    return target.currentRate / baseCurrency.currentRate;
  };

  const getRebasedValueText = (targetCode: string, value: number = 1): string => {
    const target = currenciesMap[targetCode];
    if (!target || !baseCurrency) return '-';

    const rebasedRate = target.currentRate / baseCurrency.currentRate;

    // Human-friendly crypto quotation rule: If asset value relative to base is tiny (e.g. < 0.01),
    // display the inverse quotation: 1 Unit of Target = X Units of Base (e.g., 1 BTC = 66,000 EUR)
    if (target.category === 'digital') {
      const inverse = baseCurrency.currentRate / target.currentRate;
      return `1 ${targetCode} = ${baseCurrency.symbol}${inverse.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    return `${value} ${baseCurrencyCode} = ${target.symbol}${rebasedRate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })} ${targetCode}`;
  };

  const getSentimentData = (currency: Currency | undefined, analysis: AIAnalysis | null) => {
    if (!currency) return { score: 50, label: "Neutral", color: "text-amber-500", bg: "bg-amber-500", hex: "#f59e0b" };
    
    let score = 50; // Neutral baseline
    
    // 1. AI Outlook component
    if (analysis) {
      if (analysis.outlook === 'bullish') score += 25;
      if (analysis.outlook === 'bearish') score -= 25;
      
      // Drivers and risks count
      const numDrivers = analysis.drivers?.length || 0;
      const numRisks = analysis.risks?.length || 0;
      score += numDrivers * 5;
      score -= numRisks * 5;
    }
    
    // 2. Real-time market performance component (fully reactive!)
    // If price is up, greed is up. If price is down, fear is up.
    const change = currency.changePercent || 0;
    score += Math.max(-15, Math.min(15, change * 15));
    
    // Clamp score between 0 and 100
    score = Math.max(0, Math.min(100, Math.round(score)));
    
    let label = "Neutral";
    let color = "text-amber-500";
    let bg = "bg-amber-500";
    let hex = "#f59e0b";
    
    if (score <= 20) {
      label = "Extreme Fear";
      color = "text-red-500";
      bg = "bg-red-500";
      hex = "#ef4444";
    } else if (score <= 40) {
      label = "Fear";
      color = "text-orange-500";
      bg = "bg-orange-500";
      hex = "#f97316";
    } else if (score <= 60) {
      label = "Neutral";
      color = "text-amber-500";
      bg = "bg-amber-500";
      hex = "#f59e0b";
    } else if (score <= 80) {
      label = "Greed";
      color = "text-lime-500";
      bg = "bg-lime-500";
      hex = "#84cc16";
    } else {
      label = "Extreme Greed";
      color = "text-emerald-500";
      bg = "bg-emerald-500";
      hex = "#10b981";
    }
    
    return { score, label, color, bg, hex };
  };

  const getTreemapData = (width: number, height: number) => {
    const transactions = market?.transactions || [];
    
    // Group-by currency and category
    // Initialize standard categories
    const categories: {
      [cat: string]: {
        name: string;
        displayName: string;
        color: string;
        borderColor: string;
        textColor: string;
        value: number;
        currencies: { [code: string]: number };
      };
    } = {
      fiat: { name: 'fiat', displayName: 'Sovereign Fiat', color: 'from-emerald-950/40 to-emerald-900/10', borderColor: 'border-emerald-500/20', textColor: 'text-emerald-400', value: 0, currencies: {} },
      digital: { name: 'digital', displayName: 'Decentralized Digital', color: 'from-amber-950/40 to-amber-900/10', borderColor: 'border-amber-500/20', textColor: 'text-amber-400', value: 0, currencies: {} },
      cbdc: { name: 'cbdc', displayName: 'Central Bank Digital', color: 'from-indigo-950/40 to-indigo-900/10', borderColor: 'border-indigo-500/20', textColor: 'text-indigo-400', value: 0, currencies: {} }
    };

    let grandTotal = 0;

    // Process transactions
    transactions.forEach(tx => {
      const txCurr = currenciesMap[tx.currency];
      if (!txCurr) return;

      const category = txCurr.category || 'fiat';
      const valueInUSD = tx.amount / txCurr.currentRate;
      const valueInBase = valueInUSD * (baseCurrency ? baseCurrency.currentRate : 1);

      if (!categories[category]) {
        categories[category] = {
          name: category,
          displayName: category.toUpperCase(),
          color: 'from-slate-900/40 to-slate-800/10',
          borderColor: 'border-slate-700/20',
          textColor: 'text-slate-400',
          value: 0,
          currencies: {}
        };
      }

      categories[category].currencies[tx.currency] = (categories[category].currencies[tx.currency] || 0) + valueInBase;
      categories[category].value += valueInBase;
      grandTotal += valueInBase;
    });

    // Convert categories to array
    let categoryList = Object.values(categories).filter(c => c.value > 0);

    // If grandTotal is 0 (no revenue logged yet), let's seed with standard transactions
    if (grandTotal === 0) {
      const seedCurrencies = [
        { code: 'USD', category: 'fiat', val: 125000 },
        { code: 'EUR', category: 'fiat', val: 85000 },
        { code: 'BTC', category: 'digital', val: 240000 },
        { code: 'ETH', category: 'digital', val: 110000 },
        { code: 'e-USD', category: 'cbdc', val: 95000 },
        { code: 'e-CNY', category: 'cbdc', val: 60000 }
      ];

      seedCurrencies.forEach(seed => {
        const c = seed.category;
        const baseRate = baseCurrency ? baseCurrency.currentRate : 1;
        // Adjust seed value by base rate (assuming seed was USD)
        const valueInBase = seed.val * baseRate;
        categories[c].currencies[seed.code] = valueInBase;
        categories[c].value += valueInBase;
        grandTotal += valueInBase;
      });

      categoryList = Object.values(categories).filter(c => c.value > 0);
    }

    // Sort categories descending by value
    categoryList.sort((a, b) => b.value - a.value);

    // Partition 1D layout helper
    interface LayoutBox {
      x: number;
      y: number;
      w: number;
      h: number;
    }

    const partition1D = (
      items: { name: string; value: number }[],
      x: number,
      y: number,
      w: number,
      h: number
    ): { [name: string]: LayoutBox } => {
      const results: { [name: string]: LayoutBox } = {};
      if (items.length === 0) return results;

      const totalVal = items.reduce((sum, item) => sum + item.value, 0);
      let currentX = x;
      let currentY = y;

      const isVertical = w > h;

      items.forEach(item => {
        const fraction = totalVal > 0 ? (item.value / totalVal) : (1 / items.length);
        if (isVertical) {
          const itemW = w * fraction;
          results[item.name] = { x: currentX, y: currentY, w: itemW, h };
          currentX += itemW;
        } else {
          const itemH = h * fraction;
          results[item.name] = { x: currentX, y: currentY, w, h: itemH };
          currentY += itemH;
        }
      });

      return results;
    };

    const categoryLayouts = partition1D(
      categoryList.map(c => ({ name: c.name, value: c.value })),
      0,
      0,
      width,
      height
    );

    // Now, for each category, partition its inner space among its currencies
    interface RenderableCurrencyNode {
      code: string;
      category: string;
      value: number;
      percentageOfCategory: number;
      percentageOfTotal: number;
      x: number;
      y: number;
      w: number;
      h: number;
      emoji: string;
    }

    interface RenderableCategoryNode {
      name: string;
      displayName: string;
      value: number;
      percentageOfTotal: number;
      x: number;
      y: number;
      w: number;
      h: number;
      color: string;
      borderColor: string;
      textColor: string;
      children: RenderableCurrencyNode[];
    }

    const finalTreemap: RenderableCategoryNode[] = [];

    categoryList.forEach(cat => {
      const layout = categoryLayouts[cat.name];
      if (!layout) return;

      const currenciesArray = Object.entries(cat.currencies).map(([code, val]) => ({
        code,
        value: val
      }));
      currenciesArray.sort((a, b) => b.value - a.value);

      const padding = layout.w > 20 && layout.h > 20 ? 4 : 1;
      const headerHeight = layout.h > 40 ? 16 : 0; 

      const innerX = layout.x + padding;
      const innerY = layout.y + padding + headerHeight;
      const innerW = Math.max(0, layout.w - (padding * 2));
      const innerH = Math.max(0, layout.h - (padding * 2) - headerHeight);

      const currencyLayouts = partition1D(
        currenciesArray.map(c => ({ name: c.code, value: c.value })),
        innerX,
        innerY,
        innerW,
        innerH
      );

      const renderableCurrencies: RenderableCurrencyNode[] = [];

      currenciesArray.forEach(curr => {
        const currLayout = currencyLayouts[curr.code];
        if (!currLayout) return;

        const currencyMeta = currenciesMap[curr.code];
        const emoji = currencyMeta ? currencyMeta.emoji : '🪙';

        renderableCurrencies.push({
          code: curr.code,
          category: cat.name,
          value: curr.value,
          percentageOfCategory: cat.value > 0 ? (curr.value / cat.value) * 100 : 0,
          percentageOfTotal: grandTotal > 0 ? (curr.value / grandTotal) * 100 : 0,
          x: currLayout.x,
          y: currLayout.y,
          w: currLayout.w,
          h: currLayout.h,
          emoji
        });
      });

      finalTreemap.push({
        name: cat.name,
        displayName: cat.displayName,
        value: cat.value,
        percentageOfTotal: grandTotal > 0 ? (cat.value / grandTotal) * 100 : 0,
        x: layout.x,
        y: layout.y,
        w: layout.w,
        h: layout.h,
        color: cat.color,
        borderColor: cat.borderColor,
        textColor: cat.textColor,
        children: renderableCurrencies
      });
    });

    return {
      grandTotal,
      categories: finalTreemap
    };
  };

  // Convert histories into chart data relative to Base Currency
  const getChartData = () => {
    if (!activeCurrency || !baseCurrency) return [];
    
    const comparisonCurrency = comparisonCurrencyCode ? currenciesMap[comparisonCurrencyCode] : undefined;

    return activeCurrency.history.map((rateAtTick, index) => {
      const baseAtTick = baseCurrency.history[index] || baseCurrency.currentRate;
      const rebasedVal = rateAtTick / baseAtTick;

      // For crypto, standard Area chart is cleaner in absolute inverse values (USD per 1 BTC)
      // but let's keep it strictly consistent with the selected base!
      const finalVal = activeCurrency.category === 'digital' 
        ? baseAtTick / rateAtTick // Inverse rate: Base Units per 1 Crypto
        : rebasedVal;             // Standard rate: Target Units per 1 Base

      const entry: any = {
        tickIndex: index,
        rate: parseFloat(finalVal.toFixed(activeCurrency.category === 'digital' ? 2 : 5))
      };

      if (comparisonCurrency) {
        const compRateAtTick = comparisonCurrency.history[index] || comparisonCurrency.currentRate;
        const compRebasedVal = compRateAtTick / baseAtTick;
        const compFinalVal = comparisonCurrency.category === 'digital'
          ? baseAtTick / compRateAtTick
          : compRebasedVal;

        entry.compRate = parseFloat(compFinalVal.toFixed(comparisonCurrency.category === 'digital' ? 2 : 5));
      }

      return entry;
    });
  };

  const chartData = getChartData();

  // Instant converted calculation
  const getCalculatedConversion = (): string => {
    const fromCurr = currenciesMap[calcFrom];
    const toCurr = currenciesMap[calcTo];
    if (!fromCurr || !toCurr) return '0.00';

    // From -> USD -> To
    // Value in USD = calcAmount / fromCurr.currentRate
    const valueInUSD = calcAmount / fromCurr.currentRate;
    const finalVal = valueInUSD * toCurr.currentRate;

    return finalVal.toLocaleString(undefined, { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: toCurr.category === 'digital' ? 6 : 4 
    });
  };

  // Filter currency codes
  const filteredCurrencies = Object.values(currenciesMap).filter(c => {
    if (filterCategory === 'all') return true;
    return c.category === filterCategory;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col antialiased selection:bg-emerald-500 selection:text-slate-950" id="currency-terminal-root">
      
      {/* Dynamic Global Shock Crisis Banner */}
      {market?.shockEvent && (
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
                  <h4 className="text-sm font-semibold tracking-tight text-red-200">
                    {market.shockEvent.name}
                  </h4>
                  <span className="text-xs text-slate-400 font-mono">
                    [{new Date(market.shockEvent.timestamp).toLocaleTimeString()}]
                  </span>
                </div>
                <p className="text-xs text-red-300/85 max-w-4xl mt-1 leading-relaxed">
                  {market.shockEvent.description}
                </p>
              </div>
            </div>
            
            <button
              onClick={resolveCrisis}
              disabled={isTriggeringShock}
              className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 disabled:bg-slate-800 text-white font-mono text-xs font-bold px-3.5 py-2 rounded-lg border border-red-400/30 transition-all duration-200 hover:shadow-[0_0_12px_rgba(239,68,68,0.3)] cursor-pointer self-start md:self-center"
              id="resolve-crisis-btn"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              RESOLVE & RESET
            </button>
          </div>
        </div>
      )}

      {/* Main Grid Workspace */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 flex-1 flex flex-col gap-6">
        
        {/* Sleek Minimal Sovereign Terminal Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-900 pb-5 shrink-0" id="terminal-header">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 pulse-ring-green" />
              <h1 className="text-lg font-mono font-bold tracking-wider text-slate-300">
                SOVEREIGN RESERVE TERMINAL
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Live multi-polar capital orbit &bull; Programmable CBDC integrations
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3.5">
            {/* Base Currency Selection Selector */}
            <div className="flex items-center gap-2 bg-slate-900/60 border border-slate-800/80 px-3 py-1.5 rounded-lg">
              <span className="text-xs text-slate-400 font-mono font-medium">Rebase Terminal:</span>
              <select 
                value={baseCurrencyCode} 
                onChange={(e) => setBaseCurrencyCode(e.target.value)}
                className="bg-transparent text-xs font-mono font-bold text-emerald-400 outline-none cursor-pointer focus:ring-0"
              >
                {Object.keys(currenciesMap).map(code => (
                  <option key={code} value={code} className="bg-slate-950 text-slate-100">
                    {code} ({currenciesMap[code].symbol})
                  </option>
                ))}
              </select>
            </div>

            {/* AI Insights Button */}
            <button
              onClick={fetchGlobalForecast}
              disabled={isLoadingForecast}
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-950 to-emerald-950 hover:from-indigo-900 hover:to-emerald-900 text-slate-100 px-3.5 py-1.5 rounded-lg border border-emerald-500/20 text-xs font-mono font-medium transition-all cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.05)]"
              id="ai-forecast-btn"
            >
              <Sparkles className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
              {isLoadingForecast ? "Decrypting..." : "AI GLOBAL PREVIEW"}
            </button>

            {/* Active Polling Status Pulse */}
            <div className="flex items-center gap-2 bg-slate-900/40 border border-slate-800/60 px-2.5 py-1.5 rounded-lg text-slate-400 text-xs font-mono">
              <Activity className="h-3.5 w-3.5 text-emerald-400 animate-spin" style={{ animationDuration: '6s' }} />
              <span>LIVE FEED</span>
            </div>
          </div>
        </header>

        {/* KPI Dashboard Row: Real-time Converted Sovereign Business Metrics */}
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
                <span>{kpis.totalRevenueBase.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: baseCurrency?.category === 'digital' ? 5 : 2 })}</span>
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

          {/* Business Velocity */}
          <div className="bg-slate-900/40 border border-slate-900/80 p-4 rounded-xl flex items-center justify-between shadow-[inset_0_1px_1px_rgba(255,255,255,0.02)] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-2 opacity-5 text-slate-100 font-mono text-7xl select-none group-hover:opacity-10 transition-opacity pointer-events-none">
              %
            </div>
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">24H Velocity Multiplier</span>
              <div className="text-xl font-mono font-black text-amber-400 flex items-baseline gap-1">
                <span>+18.42%</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400">
                <TrendingUp className="h-3 w-3" />
                <span>Above threshold &bull; Optimal</span>
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
                <div className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-1.5 rounded-full" style={{ width: `${kpis.digitalMixRatio}%` }} />
              </div>
            </div>
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/60 text-indigo-400 shrink-0">
              <Coins className="h-5 w-5" />
            </div>
          </div>

        </section>

        {/* Recruiter & Candidate Spotlight Hub */}
        <div className="bg-gradient-to-br from-indigo-950/45 via-slate-900/60 to-emerald-950/20 border border-indigo-500/20 rounded-2xl p-4 md:p-5 shadow-xl relative overflow-hidden shrink-0" id="recruiter-spotlight-card">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none animate-pulse" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-900/80 pb-3" id="recruiter-card-header">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-indigo-900/30 border border-indigo-500/30 rounded-xl text-indigo-400" id="recruiter-spark-icon">
                <Sparkles className="h-5 w-5 text-indigo-400 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-mono font-bold tracking-wider text-slate-200 uppercase flex items-center gap-2" id="recruiter-heading-text">
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
              onClick={() => {
                setShowRecruiterHub(!showRecruiterHub);
                setTelemetryRequests(prev => prev + 1);
              }}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-[11px] font-mono text-slate-300 rounded-lg hover:text-slate-100 transition-all flex items-center gap-1 cursor-pointer"
              id="recruiter-toggle-btn"
            >
              {showRecruiterHub ? "Collapse Evaluation Panel" : "Expand Evaluation Panel"}
            </button>
          </div>

          {showRecruiterHub && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-12 gap-5" id="recruiter-spotlight-content">
              
              {/* Left Selector: Navigation Tabs */}
              <div className="md:col-span-3 flex flex-col gap-1.5" id="recruiter-spotlight-tabs">
                <span className="text-[9px] font-mono font-bold text-slate-500 tracking-wider uppercase pl-1 block mb-1">Select Spotlight Tab</span>
                <button
                  onClick={() => {
                    setRecruiterActiveTab('tips');
                    setTelemetryRequests(prev => prev + 1);
                  }}
                  className={`text-left text-xs font-mono font-bold px-3 py-2.5 rounded-lg border transition-all flex items-center justify-between cursor-pointer ${
                    recruiterActiveTab === 'tips'
                      ? 'bg-indigo-950/75 text-indigo-300 border-indigo-500/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.02)]'
                      : 'bg-slate-950/30 text-slate-400 border-transparent hover:bg-slate-900/40 hover:text-slate-200'
                  }`}
                  id="tab-eval-walkthrough"
                >
                  <span>💡 Evaluation Walkthrough</span>
                  <ArrowRight className={`h-3 w-3 transition-transform ${recruiterActiveTab === 'tips' ? 'translate-x-1 text-indigo-400' : 'opacity-0'}`} />
                </button>

                <button
                  onClick={() => {
                    setRecruiterActiveTab('architecture');
                    setTelemetryRequests(prev => prev + 1);
                  }}
                  className={`text-left text-xs font-mono font-bold px-3 py-2.5 rounded-lg border transition-all flex items-center justify-between cursor-pointer ${
                    recruiterActiveTab === 'architecture'
                      ? 'bg-indigo-950/75 text-indigo-300 border-indigo-500/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.02)]'
                      : 'bg-slate-950/30 text-slate-400 border-transparent hover:bg-slate-900/40 hover:text-slate-200'
                  }`}
                  id="tab-resilience-arch"
                >
                  <span>🛡️ Resilience Architecture</span>
                  <ArrowRight className={`h-3 w-3 transition-transform ${recruiterActiveTab === 'architecture' ? 'translate-x-1 text-indigo-400' : 'opacity-0'}`} />
                </button>

                <button
                  onClick={() => {
                    setRecruiterActiveTab('bio');
                    setTelemetryRequests(prev => prev + 1);
                  }}
                  className={`text-left text-xs font-mono font-bold px-3 py-2.5 rounded-lg border transition-all flex items-center justify-between cursor-pointer ${
                    recruiterActiveTab === 'bio'
                      ? 'bg-indigo-950/75 text-indigo-300 border-indigo-500/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.02)]'
                      : 'bg-slate-950/30 text-slate-400 border-transparent hover:bg-slate-900/40 hover:text-slate-200'
                  }`}
                  id="tab-candidate-contact"
                >
                  <span>👨‍💻 Tech Stack & Contact</span>
                  <ArrowRight className={`h-3 w-3 transition-transform ${recruiterActiveTab === 'bio' ? 'translate-x-1 text-indigo-400' : 'opacity-0'}`} />
                </button>
              </div>

              {/* Right Content Panels */}
              <div className="md:col-span-9 bg-slate-950/65 rounded-xl border border-slate-900/80 p-4 font-mono text-xs text-slate-300 leading-normal" id="recruiter-spotlight-panel-wrapper">
                {recruiterActiveTab === 'tips' && (
                  <div className="space-y-3" id="panel-walkthrough-content">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">Interactive Testing Suite Checklist</span>
                    <p className="text-[11px] text-slate-400">
                      Step-by-step suggestions for a deep product walkthrough demonstrating multi-polar state reactivity:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] pt-1" id="walkthrough-grid">
                      <div className="bg-slate-900/30 border border-slate-900 p-2.5 rounded-lg space-y-1 hover:border-indigo-500/10 transition-colors">
                        <div className="font-bold text-slate-200 flex items-center gap-1.5">
                          <span className="text-indigo-400">01.</span> Currency Re-Basing
                        </div>
                        <p className="text-slate-400 text-[10px]">
                          Select <span className="text-emerald-400 font-bold">Rebase Terminal</span> top right. Select BTC or EUR. Watch every ticker, sparkline, KPI valuation, and ledger item calculate into that base asset immediately.
                        </p>
                      </div>

                      <div className="bg-slate-900/30 border border-slate-900 p-2.5 rounded-lg space-y-1 hover:border-indigo-500/10 transition-colors">
                        <div className="font-bold text-slate-200 flex items-center gap-1.5">
                          <span className="text-indigo-400">02.</span> Sovereign Shock Simulator
                        </div>
                        <p className="text-slate-400 text-[10px]">
                          Trigger a <span className="text-amber-400 font-bold">US Debt Default</span> or custom crisis (bottom left). Check how capital immediately cascades into safe-haven gold and digital networks.
                        </p>
                      </div>

                      <div className="bg-slate-900/30 border border-slate-900 p-2.5 rounded-lg space-y-1 hover:border-indigo-500/10 transition-colors">
                        <div className="font-bold text-slate-200 flex items-center gap-1.5">
                          <span className="text-indigo-400">03.</span> AI Tokenizer & Lab
                        </div>
                        <p className="text-slate-400 text-[10px]">
                          Go to the <span className="text-indigo-400 font-bold">Research Lab</span> tab. Prompt our sovereign AI model for speculative assets (e.g. Carbon Credits). Deploy it to instantly append it to live watchlist charts!
                        </p>
                      </div>

                      <div className="bg-slate-900/30 border border-slate-900 p-2.5 rounded-lg space-y-1 hover:border-indigo-500/10 transition-colors">
                        <div className="font-bold text-slate-200 flex items-center gap-1.5">
                          <span className="text-indigo-400">04.</span> Export & Ledger Filters
                        </div>
                        <p className="text-slate-400 text-[10px]">
                          Search or filter client settlements in the <span className="text-emerald-400 font-bold">Sales Hub</span> ledger. Hit "Export Ledger Report" to download certified CSV sheets.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {recruiterActiveTab === 'architecture' && (
                  <div className="space-y-3" id="panel-architecture-content">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">Full-Stack Resilience & System Architecture</span>
                    <p className="text-[11px] text-slate-400">
                      This application implements professional full-stack patterns designed to secure, monitor, and scale sovereign multi-polar workflows:
                    </p>
                    <ul className="space-y-2 text-[11px] text-slate-300">
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-400 font-bold shrink-0">&bull;</span>
                        <div>
                          <strong className="text-slate-200 font-semibold">Server-Side Secret Isolation</strong>: Keeping the Gemini API Key completely client-hidden by proxying all speculative insights through Express endpoints (`/api/gemini/*`).
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-400 font-bold shrink-0">&bull;</span>
                        <div>
                          <strong className="text-slate-200 font-semibold">Fail-Safe Exponential Retry Backoff</strong>: Implemented an active exponential backoff scheduler (`generateContentWithRetry`) to gracefully absorb rate-limiting (429) or demand spikes (503) without disrupting live dashboard operations.
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-400 font-bold shrink-0">&bull;</span>
                        <div>
                          <strong className="text-slate-200 font-semibold">High-Fidelity Offline Simulator fallback</strong>: Automated intelligent fallback matrices which activate to preserve real-time simulation if third-party endpoints go completely offline.
                        </div>
                      </li>
                    </ul>
                  </div>
                )}

                {recruiterActiveTab === 'bio' && (
                  <div className="space-y-3" id="panel-bio-content">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-900 pb-2">
                      <div>
                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">Professional Candidate Profile</span>
                        <h4 className="text-sm font-semibold text-slate-100 mt-0.5">Software Engineer & Systems Architect</h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[8px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-900/30 px-1.5 py-0.5 rounded">
                          Available for Hire
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[11px]">
                      <div className="space-y-2">
                        <div>
                          <span className="text-slate-500 text-[10px] uppercase block">Core Tech Stack Specialties:</span>
                          <p className="text-slate-300 mt-0.5">React 18+, TypeScript, Tailwind CSS, Node.js (Express), Recharts, Gemini Generative AI SDK, REST APIs, UI/UX Engineering.</p>
                        </div>
                        <div>
                          <span className="text-slate-500 text-[10px] uppercase block">Design Philosophy:</span>
                          <p className="text-slate-300 mt-0.5">Aesthetic clarity, strict type safety, responsive layout density, and robust exception boundaries.</p>
                        </div>
                      </div>

                      <div className="space-y-2 bg-slate-900/25 p-3 rounded-lg border border-slate-900 flex flex-col justify-between">
                        <div>
                          <span className="text-slate-500 text-[10px] uppercase block">Recruiter Evaluation Contact:</span>
                          <p className="text-slate-200 font-bold mt-1">LinkedIn & Github placeholders integrated.</p>
                          <p className="text-slate-400 mt-1 text-[10px]">Please review the responsive viewport grids, high-frequency chart states, and offline tolerance logic.</p>
                        </div>
                        <div className="flex gap-2 mt-2">
                          <a href="https://github.com" target="_blank" rel="noreferrer" className="flex-1 bg-slate-950 hover:bg-slate-900 text-slate-300 hover:text-white py-1 rounded text-center border border-slate-800 transition-colors cursor-pointer text-[10px]">
                            GitHub
                          </a>
                          <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="flex-1 bg-indigo-950/40 hover:bg-indigo-950 text-indigo-300 hover:text-indigo-200 py-1 rounded text-center border border-indigo-900/40 transition-colors cursor-pointer text-[10px]">
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

        {/* Bento Board Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 items-start">
          
          {/* Watchlist & Live Feeds Side (4 Columns) */}
          <div className="lg:col-span-4 flex flex-col gap-5 h-[calc(100vh-180px)] lg:h-[760px] overflow-hidden" id="watchlist-panel">
            
            {/* Filter Hub */}
            <div className="bg-slate-900/30 border border-slate-900 p-3 rounded-xl shrink-0 flex flex-col gap-2.5">
              <div className="flex justify-between items-center">
                <span className="text-xs font-mono text-slate-400 font-bold tracking-tight">MONETARY SECTOR</span>
                <span className="text-[10px] font-mono text-slate-500">
                  Refreshed: {new Date(market?.lastUpdated || Date.now()).toLocaleTimeString()}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {(['all', 'fiat', 'digital', 'cbdc'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    className={`text-[10px] font-mono font-semibold py-1.5 rounded transition-all capitalize border cursor-pointer ${
                      filterCategory === cat
                        ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.1)]'
                        : 'bg-slate-950/40 text-slate-400 border-slate-900 hover:bg-slate-900/60'
                    }`}
                  >
                    {cat === 'all' ? 'All Units' : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrolling Tickers Window */}
            <div className="flex-1 overflow-y-auto bg-slate-900/25 border border-slate-900 rounded-xl pr-1 divide-y divide-slate-900/60">
              {filteredCurrencies.map((c) => {
                const rebasedRate = getRebasedRate(c.code);
                const flash = flashStates[c.code];
                const isSelected = selectedCurrencyCode === c.code;

                // Color configuration based on flash ticks
                let flashBg = '';
                if (flash === 'up') flashBg = 'bg-emerald-950/30 border-emerald-500/30';
                else if (flash === 'down') flashBg = 'bg-red-950/30 border-red-500/30';

                return (
                  <div
                    key={c.code}
                    onClick={() => setSelectedCurrencyCode(c.code)}
                    className={`p-3.5 flex items-center justify-between gap-4 cursor-pointer transition-all border-l-2 ${
                      isSelected 
                        ? 'bg-slate-900/65 border-l-emerald-500' 
                        : 'hover:bg-slate-900/20 border-l-transparent'
                    } ${flashBg}`}
                    id={`row-${c.code}`}
                  >
                    {/* Flag & Asset Label */}
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xl shrink-0 select-none">{c.emoji}</span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-mono font-bold text-slate-100">{c.code}</span>
                          <span className={`text-[9px] font-mono font-semibold px-1 rounded uppercase ${
                            c.category === 'cbdc' ? 'bg-indigo-950/70 text-indigo-300 border border-indigo-900' :
                            c.category === 'digital' ? 'bg-amber-950/70 text-amber-300 border border-amber-900' :
                            'bg-slate-950/70 text-slate-400 border border-slate-900'
                          }`}>
                            {c.category}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400/80 truncate">{c.name}</p>
                      </div>
                    </div>

                    {/* Micro Sparkline (SVG Chart) */}
                    <div className="hidden sm:block w-16 h-8 shrink-0">
                      <svg className="w-full h-full overflow-visible">
                        <polyline
                          fill="none"
                          stroke={c.changePercent >= 0 ? "#10b981" : "#ef4444"}
                          strokeWidth="1.5"
                          points={c.history.map((val, i) => {
                            const x = (i / 29) * 64;
                            const max = Math.max(...c.history);
                            const min = Math.min(...c.history);
                            const range = max - min || 1;
                            // Invert relative coordinate so high is on top
                            const y = 30 - ((val - min) / range) * 26 - 2;
                            return `${x},${y}`;
                          }).join(' ')}
                        />
                      </svg>
                    </div>

                    {/* Rates & Ticks change */}
                    <div className="text-right shrink-0">
                      <div className="text-xs font-mono font-bold text-slate-100">
                        {c.category === 'digital' ? (
                          // For crypto, inverse is usually way more recognizable
                          // e.g. "66k USD per BTC" instead of "0.000015 BTC per USD"
                          // Relative to Base: 1 target = X units of Base
                          `${baseCurrency?.symbol}${(baseCurrency!.currentRate / c.currentRate).toLocaleString(undefined, { 
                            minimumFractionDigits: 2, 
                            maximumFractionDigits: 2 
                          })}`
                        ) : (
                          // Standard Units per 1 Base Currency
                          `${c.symbol}${rebasedRate.toLocaleString(undefined, { 
                            minimumFractionDigits: 2, 
                            maximumFractionDigits: 4 
                          })}`
                        )}
                      </div>
                      
                      <div className={`flex items-center justify-end gap-0.5 text-[10px] font-mono font-medium ${
                        c.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        {c.changePercent >= 0 ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
                        <span>{c.changePercent >= 0 ? '+' : ''}{c.changePercent.toFixed(2)}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Sandbox Crisis Controller Panel */}
            <div className="bg-slate-900/30 border border-slate-900 p-4 rounded-xl shrink-0" id="shock-control-box">
              <h3 className="text-xs font-mono font-bold text-slate-300 tracking-wider flex items-center gap-1.5 uppercase">
                <Zap className="h-3.5 w-3.5 text-amber-400" />
                Sovereign Shock Engine
              </h3>
              <p className="text-[10px] text-slate-400/80 mt-1 leading-relaxed">
                Inject sudden geopolitical crises into memory and see how capital flows adjust based on real-time AI-calculated risk parameters.
              </p>

              <div className="flex flex-col gap-2.5 mt-3.5">
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-mono text-slate-500 uppercase">Crisis Template</label>
                    <select
                      value={selectedShockType}
                      onChange={(e) => setSelectedShockType(e.target.value)}
                      className="bg-slate-950 border border-slate-800 text-xs font-mono font-medium text-slate-200 px-2 py-1.5 rounded outline-none"
                    >
                      <option value="usd_default">🛡️ US Debt Default</option>
                      <option value="cbdc_mandate">🪙 CBDC Mandate</option>
                      <option value="hyperinflation">🌶️ Food Hyperinflation</option>
                      <option value="green_transition">🔋 OPEC Petro-Dollar Abandon</option>
                      <option value="ai_automation">🤖 AI Automation Wave</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-mono text-slate-500 uppercase">Override Headline</label>
                    <input
                      type="text"
                      placeholder="Optional Custom News..."
                      value={customShockText}
                      onChange={(e) => setCustomShockText(e.target.value)}
                      className="bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 px-2 py-1.5 rounded outline-none focus:border-slate-750 placeholder:text-slate-600"
                    />
                  </div>
                </div>

                <button
                  onClick={triggerShock}
                  disabled={isTriggeringShock}
                  className="w-full bg-slate-900 hover:bg-slate-850 hover:border-amber-500/30 text-amber-400 border border-slate-800 text-[10px] font-mono font-bold py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  id="trigger-shock-btn"
                >
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
                  {isTriggeringShock ? "COMPUTING CASCADE..." : "INJECT GEOPOLITICAL SHOCK"}
                </button>
              </div>
            </div>

          </div>

          {/* Active Chart & Intelligence Center (5 Columns) */}
          <div className="lg:col-span-5 flex flex-col gap-5 h-[calc(100vh-180px)] lg:h-[760px] overflow-y-auto pr-1" id="trading-desk">
            
            {/* Active Asset Terminal Card */}
            {activeCurrency && (
              <div className="bg-slate-900/20 border border-slate-900 p-4 rounded-2xl flex flex-col gap-4" id="active-terminal-card">
                
                {/* Heading Metrics */}
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
                      <p className="text-[11px] text-slate-400/80 font-mono mt-0.5">
                        {getRebasedValueText(activeCurrency.code)}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-mono text-slate-500 uppercase tracking-wider">High/Low Range</div>
                    <div className="text-xs font-mono font-bold text-slate-300 mt-0.5">
                      {activeCurrency.category === 'digital' ? (
                        <>
                          H: {baseCurrency?.symbol || '$'}{(baseCurrency!.currentRate / activeCurrency.dayLow).toLocaleString(undefined, { maximumFractionDigits: 1 })} &bull; 
                          L: {baseCurrency?.symbol || '$'}{(baseCurrency!.currentRate / activeCurrency.dayHigh).toLocaleString(undefined, { maximumFractionDigits: 1 })}
                        </>
                      ) : (
                        <>
                          H: {activeCurrency.symbol}{(activeCurrency.dayHigh / baseCurrency!.currentRate).toLocaleString(undefined, { maximumFractionDigits: 4 })} &bull; 
                          L: {activeCurrency.symbol}{(activeCurrency.dayLow / baseCurrency!.currentRate).toLocaleString(undefined, { maximumFractionDigits: 4 })}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Asset Comparison Selector Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-950/40 px-3 py-2 rounded-xl border border-slate-900/60 text-xs font-mono gap-2 shrink-0">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <TrendingUp className="h-3.5 w-3.5 text-indigo-400 animate-pulse" />
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-300">Correlation Overlay</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={comparisonCurrencyCode || ''}
                      onChange={(e) => setComparisonCurrencyCode(e.target.value || null)}
                      className="bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-200 px-2 py-1 rounded outline-none cursor-pointer focus:border-indigo-500/50"
                    >
                      <option value="">None (Single Asset)</option>
                      {Object.keys(currenciesMap)
                        .filter(code => code !== activeCurrency.code)
                        .map(code => (
                          <option key={code} value={code}>
                            Compare: {currenciesMap[code].emoji} {code}
                          </option>
                        ))
                      }
                    </select>
                    {comparisonCurrencyCode && (
                      <button
                        type="button"
                        onClick={() => setComparisonCurrencyCode(null)}
                        className="text-[9px] bg-indigo-950 hover:bg-indigo-900 border border-indigo-800/40 text-indigo-300 px-1.5 py-0.5 rounded transition-colors cursor-pointer font-bold uppercase tracking-wider"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>

                {/* Primary Chart Area */}
                <div className="h-56 w-full" id="chart-viewport">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: comparisonCurrency ? 15 : 5, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                        </linearGradient>
                        <linearGradient id="colorCompRate" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0}/>
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
                            return [`${val} ${activeCurrency.category === 'digital' ? `${baseCurrencyCode} per ${activeCurrency.code}` : activeCurrency.code}`, `${activeCurrency.code} Rate`]
                          } else if (name === 'compRate') {
                            return [`${val} ${comparisonCurrency?.category === 'digital' ? `${baseCurrencyCode} per ${comparisonCurrencyCode}` : comparisonCurrencyCode}`, `${comparisonCurrencyCode} (Overlay)`]
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
            )}

            {/* AI Strategic Intelligence desk */}
            <div className="bg-slate-900/25 border border-slate-900 p-4 rounded-2xl flex flex-col gap-4" id="ai-strategic-console">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono font-bold text-slate-200 tracking-wider flex items-center gap-2 uppercase">
                  <Sparkles className="h-4 w-4 text-emerald-400 animate-pulse" />
                  AI Intelligence Desk
                </h3>
                
                {aiAnalysis && (
                  <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${
                    aiAnalysis.outlook === 'bullish' ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30' :
                    aiAnalysis.outlook === 'bearish' ? 'bg-red-950/40 text-red-400 border-red-500/30' :
                    'bg-slate-900 text-slate-400 border-slate-800'
                  }`}>
                    Outlook: {aiAnalysis.outlook}
                  </span>
                )}
              </div>

              {isLoadingAnalysis ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2">
                  <RefreshCw className="h-6 w-6 text-emerald-400 animate-spin" />
                  <p className="text-xs text-slate-500 font-mono">Consolidating central bank policies & liquidity data...</p>
                </div>
              ) : analysisError ? (
                <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-900 text-center">
                  <p className="text-xs text-slate-400 font-mono">{analysisError}</p>
                </div>
              ) : aiAnalysis ? (() => {
                const sentiment = getSentimentData(activeCurrency, aiAnalysis);
                return (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4" id="ai-brief-grid">
                    
                    {/* Column 1: Real-Time Sentiment Gauge */}
                    <div className="flex flex-col bg-slate-950/40 p-4 rounded-xl border border-slate-900/80 justify-between min-h-[300px]" id="sentiment-gauge-card">
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

                      {/* SVG Dial */}
                      <div className="relative w-full max-w-[170px] aspect-[170/105] flex items-center justify-center mt-3 mx-auto" id="sentiment-svg-wrapper">
                        <svg viewBox="0 0 200 120" className="w-full h-full select-none">
                          <defs>
                            <linearGradient id="sentiment-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#ef4444" />       {/* Red */}
                              <stop offset="25%" stopColor="#f97316" />      {/* Orange */}
                              <stop offset="50%" stopColor="#eab308" />      {/* Yellow */}
                              <stop offset="75%" stopColor="#84cc16" />      {/* Lime */}
                              <stop offset="100%" stopColor="#10b981" />     {/* Emerald */}
                            </linearGradient>
                          </defs>

                          {/* Background track */}
                          <path 
                            d="M 20 100 A 80 80 0 0 1 180 100" 
                            fill="none" 
                            stroke="#1e293b" 
                            strokeWidth="11" 
                            strokeLinecap="round" 
                          />

                          {/* Active segment with glowing gradient */}
                          <path 
                            d="M 20 100 A 80 80 0 0 1 180 100" 
                            fill="none" 
                            stroke="url(#sentiment-gradient)" 
                            strokeWidth="12" 
                            strokeLinecap="round" 
                            strokeDasharray="251.3"
                            strokeDashoffset={251.3 - (sentiment.score / 100) * 251.3}
                            style={{
                              transition: 'stroke-dashoffset 1s cubic-bezier(0.34, 1.56, 0.64, 1)'
                            }}
                          />

                          {/* Inner ring for aesthetic layout */}
                          <path 
                            d="M 35 100 A 65 65 0 0 1 165 100" 
                            fill="none" 
                            stroke="#0f172a" 
                            strokeWidth="1.5" 
                            strokeDasharray="4,4"
                          />

                          {/* Gauge needles & Pivot pin */}
                          {/* Center pivot */}
                          <circle cx="100" cy="100" r="7" fill="#0f172a" stroke="#475569" strokeWidth="2" />
                          <circle cx="100" cy="100" r="3" fill="#94a3b8" />

                          {/* Rotating indicator needle */}
                          <line 
                            x1="100" y1="100" 
                            x2="100" y2="35" 
                            stroke="#f1f5f9" 
                            strokeWidth="2.5" 
                            strokeLinecap="round"
                            style={{
                              transform: `rotate(${-180 + (sentiment.score / 100) * 180}deg)`,
                              transformOrigin: '100px 100px',
                              transition: 'transform 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
                            }}
                          />

                          {/* Tip glowing bead */}
                          <circle 
                            cx="100" cy="35" r="4" 
                            fill={sentiment.hex}
                            className="animate-pulse"
                            style={{
                              transform: `rotate(${-180 + (sentiment.score / 100) * 180}deg)`,
                              transformOrigin: '100px 100px',
                              transition: 'transform 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
                            }}
                          />

                          {/* Tick markings and labels inside dial */}
                          <text x="24" y="115" fill="#64748b" fontSize="8" fontFamily="monospace" textAnchor="middle">0 (Fear)</text>
                          <text x="100" y="15" fill="#64748b" fontSize="8" fontFamily="monospace" textAnchor="middle">50 (Neutral)</text>
                          <text x="174" y="115" fill="#64748b" fontSize="8" fontFamily="monospace" textAnchor="middle">100 (Greed)</text>
                        </svg>

                        {/* Overlaid center value for higher density display */}
                        <div className="absolute bottom-1 text-center">
                          <span className="text-2xl font-black font-mono tracking-tighter text-slate-100">{sentiment.score}</span>
                          <span className="text-[8px] font-mono text-slate-500 block uppercase tracking-widest mt-[-2px]">MOOD</span>
                        </div>
                      </div>

                      {/* Quick constituent variables review */}
                      <div className="w-full bg-slate-900/40 p-2 rounded-lg border border-slate-950 text-[9px] font-mono text-slate-400 space-y-1 mt-2" id="sentiment-metrics-list">
                        <div className="flex justify-between items-center">
                          <span>Central Bank Bias:</span>
                          <span className={`font-bold capitalize ${
                            aiAnalysis.outlook === 'bullish' ? 'text-emerald-400' :
                            aiAnalysis.outlook === 'bearish' ? 'text-red-400' :
                            'text-amber-400'
                          }`}>{aiAnalysis.outlook}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>24h Rate Impact:</span>
                          <span className={`font-bold ${
                            (activeCurrency?.changePercent || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'
                          }`}>
                            {(activeCurrency?.changePercent || 0) >= 0 ? '+' : ''}{(activeCurrency?.changePercent || 0).toFixed(2)}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Sentiment Anchors:</span>
                          <span className="text-slate-300 font-bold">
                            {aiAnalysis.drivers?.length || 0} U &bull; {aiAnalysis.risks?.length || 0} D
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Column 2: General positions & Outlook */}
                    <div className="flex flex-col gap-3">
                      <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-900/80">
                        <div className="text-[10px] font-mono text-slate-500 uppercase tracking-tight">Executive Brief</div>
                        <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                          {aiAnalysis.summary}
                        </p>
                      </div>

                      <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-900/80">
                        <div className="text-[10px] font-mono text-slate-500 uppercase tracking-tight">12M Sovereign Target</div>
                        <div className="text-sm font-mono font-bold text-emerald-400 mt-1">
                          {aiAnalysis.target12m}
                        </div>
                      </div>

                      {/* Speculative 2030 Roadmap */}
                      <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-900/80">
                        <div className="text-[10px] font-mono text-slate-500 uppercase tracking-tight flex items-center gap-1">
                          <Coins className="h-3 w-3 text-indigo-400" />
                          Futuristic Roadmap (2030+)
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                          {aiAnalysis.futuristicForecast}
                        </p>
                      </div>
                    </div>

                    {/* Column 3: Drivers & Risks */}
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
                );
              })() : null}
            </div>

            {/* Dynamic Multi-Way Converter Grid */}
            <div className="bg-slate-900/20 border border-slate-900 p-4 rounded-2xl flex flex-col gap-3" id="quick-converter">
              <h3 className="text-xs font-mono font-bold text-slate-300 tracking-wider flex items-center gap-1.5 uppercase">
                <Calculator className="h-3.5 w-3.5 text-emerald-400" />
                Cross-Asset Calculator
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center mt-1">
                {/* Quantity */}
                <div className="sm:col-span-3 flex flex-col gap-1">
                  <label className="text-[9px] font-mono text-slate-500 uppercase">Amount</label>
                  <input
                    type="number"
                    min="0"
                    value={calcAmount}
                    onChange={(e) => setCalcAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="bg-slate-950 border border-slate-900 text-xs font-mono font-bold text-slate-100 px-3 py-2 rounded-lg outline-none focus:border-slate-800"
                  />
                </div>

                {/* From Selector */}
                <div className="sm:col-span-3 flex flex-col gap-1">
                  <label className="text-[9px] font-mono text-slate-500 uppercase">From</label>
                  <select
                    value={calcFrom}
                    onChange={(e) => setCalcFrom(e.target.value)}
                    className="bg-slate-950 border border-slate-900 text-xs font-mono text-slate-200 px-2.5 py-2 rounded-lg outline-none cursor-pointer"
                  >
                    {Object.keys(currenciesMap).map(code => (
                      <option key={code} value={code}>
                        {currenciesMap[code].emoji} {code}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Swap Icon */}
                <div className="sm:col-span-1 flex justify-center pt-3">
                  <button 
                    onClick={() => {
                      const temp = calcFrom;
                      setCalcFrom(calcTo);
                      setCalcTo(temp);
                    }}
                    className="p-1.5 bg-slate-900 hover:bg-slate-800 rounded-lg text-slate-400 transition-all border border-slate-800 cursor-pointer"
                    title="Swap Currencies"
                  >
                    <ArrowRight className="h-3 w-3 transform rotate-90 sm:rotate-0" />
                  </button>
                </div>

                {/* To Selector */}
                <div className="sm:col-span-3 flex flex-col gap-1">
                  <label className="text-[9px] font-mono text-slate-500 uppercase">To</label>
                  <select
                    value={calcTo}
                    onChange={(e) => setCalcTo(e.target.value)}
                    className="bg-slate-950 border border-slate-900 text-xs font-mono text-slate-200 px-2.5 py-2 rounded-lg outline-none cursor-pointer"
                  >
                    {Object.keys(currenciesMap).map(code => (
                      <option key={code} value={code}>
                        {currenciesMap[code].emoji} {code}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Swap Result value text */}
                <div className="sm:col-span-2 text-right pt-3">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">Result</span>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    {getCalculatedConversion()}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Column 3: Real-Time Sales & Quantum Calendar (3 Columns) */}
          <div className="lg:col-span-3 flex flex-col gap-5 h-[calc(100vh-180px)] lg:h-[760px] overflow-hidden" id="sales-calendar-panel">
            
            {/* Header Tabs with active selectors */}
            <div className="bg-slate-900/30 border border-slate-900 p-1.5 rounded-xl shrink-0 flex gap-1">
              <button
                type="button"
                onClick={() => setActiveTab('sales')}
                className={`flex-1 text-[10px] font-mono font-bold py-1.5 rounded transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  activeTab === 'sales'
                    ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]'
                    : 'text-slate-400 hover:text-slate-200 border border-transparent'
                }`}
              >
                <ShoppingBag className="h-3 w-3" />
                Sales Hub
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('calendar')}
                className={`flex-1 text-[10px] font-mono font-bold py-1.5 rounded transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  activeTab === 'calendar'
                    ? 'bg-indigo-950/60 text-indigo-400 border border-indigo-800/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]'
                    : 'text-slate-400 hover:text-slate-200 border border-transparent'
                }`}
              >
                <Calendar className="h-3 w-3" />
                Calendar
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('sandbox')}
                className={`flex-1 text-[10px] font-mono font-bold py-1.5 rounded transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  activeTab === 'sandbox'
                    ? 'bg-indigo-950/60 text-indigo-400 border border-indigo-800/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]'
                    : 'text-slate-400 hover:text-slate-200 border border-transparent'
                }`}
              >
                <Sparkles className="h-3 w-3" />
                Research Lab
              </button>
            </div>

            {/* Content area based on tab state */}
            <div className="flex-1 overflow-y-auto pr-0.5 space-y-4">
              
              {activeTab === 'sales' && (
                <div className="space-y-4 flex flex-col h-full">
                  
                  {/* Sub-tab selection pill */}
                  <div className="flex bg-slate-950/40 p-1 border border-slate-900 rounded-xl shrink-0" id="sales-sub-tab-selector">
                    <button
                      type="button"
                      onClick={() => setSalesSubTab('ledger')}
                      className={`flex-1 text-[9px] font-mono font-bold py-1.5 rounded-lg transition-all cursor-pointer text-center ${
                        salesSubTab === 'ledger'
                          ? 'bg-slate-900 text-emerald-400 border border-slate-850 shadow-[0_1px_3px_rgba(0,0,0,0.3)]'
                          : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      Ledger Entries
                    </button>
                    <button
                      type="button"
                      onClick={() => setSalesSubTab('treemap')}
                      className={`flex-1 text-[9px] font-mono font-bold py-1.5 rounded-lg transition-all cursor-pointer text-center ${
                        salesSubTab === 'treemap'
                          ? 'bg-slate-900 text-emerald-400 border border-slate-850 shadow-[0_1px_3px_rgba(0,0,0,0.3)]'
                          : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      Revenue Treemap
                    </button>
                  </div>

                  {salesSubTab === 'treemap' ? (
                    /* Treemap View */
                    <div className="bg-slate-900/20 border border-slate-900/80 rounded-xl p-3 flex-1 flex flex-col overflow-hidden min-h-[420px] justify-between" id="corporate-treemap-container">
                      {/* Header */}
                      <div className="flex items-center justify-between pb-2 border-b border-slate-900/80 mb-2.5 shrink-0" id="treemap-header">
                        <div className="flex items-center gap-1.5">
                          <Database className="h-3.5 w-3.5 text-emerald-400" />
                          <h4 className="text-[10px] font-mono font-bold tracking-wider text-slate-300 uppercase">Hierarchical Revenue Allocation</h4>
                        </div>
                        <span className="text-[9px] font-mono text-emerald-500 bg-emerald-950/40 px-1 py-0.5 rounded uppercase">
                          Categories Map
                        </span>
                      </div>

                      {/* Treemap Content */}
                      <div className="flex-1 flex flex-col justify-center min-h-[280px]" id="treemap-visual-body">
                        {(() => {
                          const { grandTotal, categories } = getTreemapData(400, 260);
                          
                          return (
                            <div className="space-y-3 flex flex-col justify-between h-full">
                              <div className="relative w-full aspect-[400/260]" id="treemap-svg-wrapper">
                                <svg viewBox="0 0 400 260" className="w-full h-full select-none rounded-lg overflow-hidden border border-slate-900 bg-slate-950/40">
                                  {categories.map(cat => (
                                    <g key={cat.name} id={`treemap-group-${cat.name}`}>
                                      {/* Outer Category Area Group Container */}
                                      <rect
                                        x={cat.x}
                                        y={cat.y}
                                        width={cat.w}
                                        height={cat.h}
                                        fill="rgba(15, 23, 42, 0.4)"
                                        stroke="#1e293b"
                                        strokeWidth="1.5"
                                        rx="4"
                                      />
                                      
                                      {/* Category Header Label */}
                                      {cat.w > 65 && cat.h > 24 && (
                                        <text
                                          x={cat.x + 5}
                                          y={cat.y + 11}
                                          fontSize="8"
                                          fontWeight="bold"
                                          fontFamily="monospace"
                                          className={`${cat.textColor} uppercase tracking-wider select-none`}
                                        >
                                          {cat.displayName} <span className="opacity-60 text-[7px]">({cat.percentageOfTotal.toFixed(1)}%)</span>
                                        </text>
                                      )}

                                      {/* Children nodes (Currencies) */}
                                      {cat.children.map(curr => {
                                        if (curr.w < 2 || curr.h < 2) return null;
                                        const isHovered = hoveredNode && hoveredNode.code === curr.code;
                                        
                                        return (
                                          <g
                                            key={curr.code}
                                            onMouseEnter={() => setHoveredNode(curr)}
                                            onMouseLeave={() => setHoveredNode(null)}
                                            className="cursor-pointer group"
                                          >
                                            {/* Currency tile */}
                                            <rect
                                              x={curr.x}
                                              y={curr.y}
                                              width={curr.w}
                                              height={curr.h}
                                              fill={
                                                curr.category === 'fiat' ? 'rgba(16, 185, 129, 0.08)' :
                                                curr.category === 'digital' ? 'rgba(245, 158, 11, 0.08)' :
                                                'rgba(99, 102, 241, 0.08)'
                                              }
                                              stroke={
                                                isHovered ? '#f1f5f9' :
                                                curr.category === 'fiat' ? 'rgba(16, 185, 129, 0.25)' :
                                                curr.category === 'digital' ? 'rgba(245, 158, 11, 0.25)' :
                                                'rgba(99, 102, 241, 0.25)'
                                              }
                                              strokeWidth={isHovered ? "1.5" : "1"}
                                              rx="3"
                                              className="transition-all duration-150 group-hover:fill-slate-900/30"
                                            />

                                            {/* Labels */}
                                            {curr.w > 26 && curr.h > 18 ? (
                                              <g>
                                                <text
                                                  x={curr.x + curr.w / 2}
                                                  y={curr.y + curr.h / 2 - (curr.h > 30 ? 2 : -3)}
                                                  textAnchor="middle"
                                                  fontSize={curr.w > 50 ? "10" : "8"}
                                                  fontFamily="monospace"
                                                  fill="#f1f5f9"
                                                  fontWeight="bold"
                                                >
                                                  {curr.w > 45 ? `${curr.emoji} ${curr.code}` : curr.code}
                                                </text>
                                                {curr.h > 30 && (
                                                  <text
                                                    x={curr.x + curr.w / 2}
                                                    y={curr.y + curr.h / 2 + 10}
                                                    textAnchor="middle"
                                                    fontSize="7.5"
                                                    fontFamily="monospace"
                                                    fill="#64748b"
                                                  >
                                                    {curr.percentageOfTotal.toFixed(1)}%
                                                  </text>
                                                )}
                                              </g>
                                            ) : curr.w > 12 && curr.h > 12 ? (
                                              <text
                                                x={curr.x + curr.w / 2}
                                                y={curr.y + curr.h / 2 + 3.5}
                                                textAnchor="middle"
                                                fontSize="7"
                                                fontFamily="monospace"
                                                fill="#94a3b8"
                                              >
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
                              <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-900" id="treemap-hud">
                                {hoveredNode ? (
                                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 font-mono text-[10px]">
                                    <div className="flex justify-between border-b border-slate-900/40 pb-1">
                                      <span className="text-slate-500 uppercase text-[8px]">Asset Code</span>
                                      <span className="text-slate-200 font-bold flex items-center gap-1">
                                        {hoveredNode.emoji} {hoveredNode.code}
                                      </span>
                                    </div>
                                    <div className="flex justify-between border-b border-slate-900/40 pb-1">
                                      <span className="text-slate-500 uppercase text-[8px]">Revenue Volume</span>
                                      <span className="text-emerald-400 font-bold">
                                        {baseCurrency?.symbol}{hoveredNode.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: baseCurrency?.category === 'digital' ? 4 : 2 })}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-slate-500 uppercase text-[8px]">Category Share</span>
                                      <span className="text-indigo-400 font-bold">
                                        {hoveredNode.percentageOfCategory.toFixed(1)}% <span className="text-slate-600 text-[8px]">({hoveredNode.category})</span>
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-slate-500 uppercase text-[8px]">Total Share</span>
                                      <span className="text-amber-400 font-bold">
                                        {hoveredNode.percentageOfTotal.toFixed(1)}% of Total
                                      </span>
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
                          );
                        })()}
                      </div>
                    </div>
                  ) : (
                    /* Live Transactions list */
                    <div className="bg-slate-900/20 border border-slate-900/80 rounded-xl p-3 flex-1 flex flex-col overflow-hidden min-h-[420px]" id="corporate-ledger-container">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-900/80 mb-2.5 shrink-0" id="ledger-header">
                      <div className="flex items-center gap-1.5">
                        <Activity className="h-3.5 w-3.5 text-emerald-400 animate-spin" style={{ animationDuration: '4s' }} />
                        <h4 className="text-[10px] font-mono font-bold tracking-wider text-slate-300 uppercase">Real-Time Transactions</h4>
                      </div>
                      <span className="text-[9px] font-mono text-emerald-500 bg-emerald-950/40 px-1 py-0.5 rounded">
                        Auto-Updating
                      </span>
                    </div>

                    {/* Advanced Ledger Filters & Sorters */}
                    <div className="space-y-2 mb-3 bg-slate-950/40 p-2.5 rounded-lg border border-slate-900 shrink-0" id="ledger-filters-wrapper">
                      {/* Search input */}
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search client, service, or code..."
                          value={txSearch}
                          onChange={(e) => {
                            setTxSearch(e.target.value);
                            setTelemetryRequests(prev => prev + 1);
                          }}
                          className="w-full bg-slate-950 border border-slate-800 text-[10px] text-slate-200 pl-2.5 pr-8 py-1.5 rounded-lg outline-none focus:border-slate-700 placeholder:text-slate-600 font-mono"
                          id="ledger-search-input"
                        />
                        {txSearch && (
                          <button
                            type="button"
                            onClick={() => {
                              setTxSearch('');
                              setTelemetryRequests(prev => prev + 1);
                            }}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 font-mono text-[9px]"
                            id="ledger-search-clear"
                          >
                            clear
                          </button>
                        )}
                      </div>

                      {/* Status Filter + Sorter */}
                      <div className="grid grid-cols-2 gap-2" id="ledger-selectors-row">
                        <div>
                          <label className="text-[8px] font-mono text-slate-500 uppercase block mb-1">Status filter</label>
                          <select
                            value={txStatusFilter}
                            onChange={(e) => {
                              setTxStatusFilter(e.target.value as any);
                              setTelemetryRequests(prev => prev + 1);
                            }}
                            className="w-full bg-slate-950 border border-slate-800 text-[9px] font-mono font-medium text-slate-300 px-1.5 py-1 rounded outline-none"
                            id="ledger-status-filter"
                          >
                            <option value="all">All Statuses</option>
                            <option value="completed">Completed</option>
                            <option value="processing">Processing</option>
                            <option value="pending">Pending</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[8px] font-mono text-slate-500 uppercase block mb-1">Sort Ledger</label>
                          <select
                            value={txSort}
                            onChange={(e) => {
                              setTxSort(e.target.value as any);
                              setTelemetryRequests(prev => prev + 1);
                            }}
                            className="w-full bg-slate-950 border border-slate-800 text-[9px] font-mono font-medium text-slate-300 px-1.5 py-1 rounded outline-none"
                            id="ledger-sort-selector"
                          >
                            <option value="recent">Recent First</option>
                            <option value="highest">Highest Value</option>
                            <option value="lowest">Lowest Value</option>
                          </select>
                        </div>
                      </div>

                      {/* Export Buttons */}
                      <div className="flex gap-1.5 pt-1 border-t border-slate-900/40" id="ledger-export-row">
                        <button
                          type="button"
                          onClick={exportTransactionsCSV}
                          className="flex-1 bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-emerald-400 border border-slate-850 hover:border-emerald-950 px-2 py-1 rounded text-[9px] font-mono transition-colors text-center cursor-pointer"
                          id="export-csv-btn"
                        >
                          Export CSV Report
                        </button>
                        <button
                          type="button"
                          onClick={exportTransactionsJSON}
                          className="flex-1 bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-indigo-400 border border-slate-850 hover:border-indigo-950 px-2 py-1 rounded text-[9px] font-mono transition-colors text-center cursor-pointer"
                          id="export-json-btn"
                        >
                          Export JSON Schema
                        </button>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-2.5 pr-0.5" id="ledger-transactions-scroller">
                      {(() => {
                        let list = [...(market?.transactions || [])];
                        
                        // 1. Search Query Filter
                        if (txSearch.trim()) {
                          const query = txSearch.toLowerCase();
                          list = list.filter(tx => 
                            tx.client.toLowerCase().includes(query) || 
                            tx.service.toLowerCase().includes(query) ||
                            tx.currency.toLowerCase().includes(query)
                          );
                        }

                        // 2. Status Filter
                        if (txStatusFilter !== 'all') {
                          list = list.filter(tx => tx.status === txStatusFilter);
                        }

                        // 3. Sorting list
                        if (txSort === 'highest') {
                          list.sort((a, b) => {
                            const aCurr = currenciesMap[a.currency];
                            const bCurr = currenciesMap[b.currency];
                            const aUsd = aCurr ? (a.amount / aCurr.currentRate) : 0;
                            const bUsd = bCurr ? (b.amount / bCurr.currentRate) : 0;
                            return bUsd - aUsd;
                          });
                        } else if (txSort === 'lowest') {
                          list.sort((a, b) => {
                            const aCurr = currenciesMap[a.currency];
                            const bCurr = currenciesMap[b.currency];
                            const aUsd = aCurr ? (a.amount / aCurr.currentRate) : 0;
                            const bUsd = bCurr ? (b.amount / bCurr.currentRate) : 0;
                            return aUsd - bUsd;
                          });
                        } else {
                          // 'recent'
                          list.sort((a, b) => b.timestamp - a.timestamp);
                        }

                        return list.map((tx) => {
                          const txCurr = currenciesMap[tx.currency];
                          // Convert tx amount in real-time
                          const valueInUSD = txCurr ? (tx.amount / txCurr.currentRate) : 0;
                          const valueInBase = valueInUSD * (baseCurrency ? baseCurrency.currentRate : 1);
                          
                          return (
                            <div key={tx.id} className="bg-slate-950/40 border border-slate-900 rounded-lg p-2.5 hover:border-slate-800 transition-colors flex flex-col gap-1.5" id={`tx-item-${tx.id}`}>
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[10px] font-mono font-bold text-slate-200 truncate max-w-[130px]" title={tx.client}>
                                  {tx.client}
                                </span>
                                <span className={`text-[8px] font-mono uppercase px-1 rounded border shrink-0 ${
                                  tx.status === 'completed' ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/20' :
                                  tx.status === 'processing' ? 'bg-amber-950/40 text-amber-400 border-amber-500/20' :
                                  'bg-slate-900 text-slate-400 border-slate-800'
                                }`}>
                                  {tx.status}
                                </span>
                              </div>
                              <div className="text-[10px] text-slate-400 truncate">{tx.service}</div>
                              
                              <div className="flex items-center justify-between border-t border-slate-900/50 pt-1.5 mt-1">
                                <span className="text-[10px] font-mono text-slate-300">
                                  {txCurr?.emoji} {tx.amount.toLocaleString(undefined, { maximumFractionDigits: 4 })} <span className="text-slate-500">{tx.currency}</span>
                                </span>
                                <span className="text-[10px] font-mono font-bold text-emerald-400">
                                  ≈ {baseCurrency?.symbol}{valueInBase.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: baseCurrency?.category === 'digital' ? 4 : 2 })}
                                </span>
                              </div>
                            </div>
                          );
                        });
                      })()}
                      {(!market?.transactions || market.transactions.length === 0) && (
                        <div className="py-12 text-center text-[10px] font-mono text-slate-600" id="empty-ledger-state">
                          No corporate settlements detected on network.
                        </div>
                      )}
                    </div>
                  </div>
                  )}

                  {/* Log Sale Quick Form */}
                  <form onSubmit={handleLogSale} className="bg-slate-900/30 border border-slate-900 p-3.5 rounded-xl shrink-0 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-900/60 pb-1.5">
                      <h4 className="text-[10px] font-mono font-bold text-slate-300 uppercase flex items-center gap-1">
                        <Plus className="h-3 w-3 text-emerald-400" />
                        Log Manual Sale
                      </h4>
                      <span className="text-[8px] font-mono text-slate-500">Corporate Ledger</span>
                    </div>

                    <div className="space-y-2">
                      {/* Client */}
                      <div className="flex flex-col gap-0.5">
                        <label className="text-[8px] font-mono text-slate-500 uppercase">Client Organization</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Acme Capital"
                          value={manualSaleClient}
                          onChange={(e) => setManualSaleClient(e.target.value)}
                          className="bg-slate-950 border border-slate-900 text-xs text-slate-200 px-2 py-1.5 rounded outline-none focus:border-slate-800 placeholder:text-slate-700"
                        />
                      </div>

                      {/* Service */}
                      <div className="flex flex-col gap-0.5">
                        <label className="text-[8px] font-mono text-slate-500 uppercase">Product / Service</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Treasury Arbitrage"
                          value={manualSaleService}
                          onChange={(e) => setManualSaleService(e.target.value)}
                          className="bg-slate-950 border border-slate-900 text-xs text-slate-200 px-2 py-1.5 rounded outline-none focus:border-slate-800 placeholder:text-slate-700"
                        />
                      </div>

                      {/* Amount & Currency Grid */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-col gap-0.5">
                          <label className="text-[8px] font-mono text-slate-500 uppercase">Amount</label>
                          <input
                            type="number"
                            required
                            min="0.0001"
                            step="any"
                            placeholder="Amount"
                            value={manualSaleAmount}
                            onChange={(e) => setManualSaleAmount(e.target.value)}
                            className="bg-slate-950 border border-slate-900 text-xs font-mono font-bold text-slate-200 px-2 py-1.5 rounded outline-none focus:border-slate-800 placeholder:text-slate-700"
                          />
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <label className="text-[8px] font-mono text-slate-500 uppercase">Currency</label>
                          <select
                            value={manualSaleCurrency}
                            onChange={(e) => setManualSaleCurrency(e.target.value)}
                            className="bg-slate-950 border border-slate-900 text-xs font-mono text-slate-200 px-1.5 py-1.5 rounded outline-none cursor-pointer"
                          >
                            {Object.keys(currenciesMap).map(code => (
                              <option key={code} value={code}>
                                {currenciesMap[code].emoji} {code}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {saleError && (
                      <p className="text-[9px] font-mono text-red-400 bg-red-950/20 p-1 rounded border border-red-900/30 text-center">
                        {saleError}
                      </p>
                    )}

                    {saleSuccess && (
                      <p className="text-[9px] font-mono text-emerald-400 bg-emerald-950/20 p-1 rounded border border-emerald-900/30 text-center animate-bounce">
                        ✓ Registered successfully!
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={isLoggingSale}
                      className="w-full bg-emerald-900 hover:bg-emerald-800 disabled:bg-slate-800 text-emerald-100 text-[10px] font-mono font-bold py-2 rounded transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-[0_1px_5px_rgba(16,185,129,0.15)]"
                    >
                      {isLoggingSale ? "Registering..." : "REGISTER TRANSACTION"}
                    </button>
                  </form>

                </div>
              )}

              {activeTab === 'calendar' && (
                <div className="bg-slate-900/20 border border-slate-900/80 rounded-xl p-3.5 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-900/80">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-indigo-400" />
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
                    {market?.quantumCalendar?.map((evt) => (
                      <div key={evt.id} className="relative pl-4 border-l-2 border-indigo-500/30 hover:border-indigo-400 transition-colors py-0.5">
                        {/* Node point */}
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
                            }`}>
                              {evt.category}
                            </span>
                            <span className="text-[8px] font-mono text-slate-500">
                              Block #{evt.quantumBlock}
                            </span>
                          </div>

                          <h5 className="text-[10px] font-bold text-slate-200 leading-tight">
                            {evt.title}
                          </h5>

                          <p className="text-[9px] text-slate-400/90 leading-normal">
                            {evt.description}
                          </p>

                          <div className="flex items-center justify-between text-[8px] font-mono text-slate-500 border-t border-slate-950/30 pt-1 font-mono">
                            <span className="flex items-center gap-1">
                              <Clock className="h-2.5 w-2.5 text-slate-500" />
                              {evt.timeLabel}
                            </span>
                            <span className={`font-bold ${
                              evt.volatilityIndex === 'EXTREME' ? 'text-red-400 animate-pulse' :
                              evt.volatilityIndex === 'High' ? 'text-amber-400' :
                              evt.volatilityIndex === 'Medium' ? 'text-indigo-400' :
                              'text-slate-400'
                            }`}>
                              Volatility: {evt.volatilityIndex}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'sandbox' && (
                <div className="space-y-4 animate-fadeIn">
                  {/* Part A: Research Future Currency */}
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
                      Query our deep monetary intelligence model to analyze speculative or future sovereign assets positioned to transition into unified global reserve networks.
                    </p>

                    <form onSubmit={handleResearchFutureCurrency} className="flex gap-1.5">
                      <input
                        type="text"
                        required
                        value={researchPrompt}
                        onChange={(e) => setResearchPrompt(e.target.value)}
                        placeholder="e.g. Gold-backed BRICS Common Coin, Carbon Credit Token"
                        className="flex-1 bg-slate-950 border border-slate-900 text-[10px] text-slate-200 px-2.5 py-2 rounded-lg outline-none focus:border-indigo-500/50 placeholder:text-slate-700 font-mono"
                      />
                      <button
                        type="submit"
                        disabled={isResearching}
                        className="bg-indigo-900 hover:bg-indigo-800 disabled:bg-slate-800 text-indigo-100 px-3 rounded-lg text-[10px] font-mono font-bold transition-all shrink-0 cursor-pointer flex items-center justify-center"
                      >
                        {isResearching ? "Searching..." : "RESEARCH"}
                      </button>
                    </form>

                    {researchError && (
                      <p className="text-[9px] font-mono text-red-400 bg-red-950/20 p-1.5 rounded border border-red-900/30 text-center">
                        {researchError}
                      </p>
                    )}

                    {researchResult && (
                      <div className="bg-slate-950/60 rounded-lg p-3 border border-slate-900 space-y-3 font-mono text-[10px] animate-fadeIn">
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
                            <div>
                              <div className="text-slate-500 text-[8px]">TICKER</div>
                              <div className="font-bold text-slate-200">{tokCode || "SPEC"}</div>
                            </div>
                            <div>
                              <div className="text-slate-500 text-[8px]">SYMBOL</div>
                              <div className="font-bold text-slate-200">{tokSymbol || "₮"}</div>
                            </div>
                            <div>
                              <div className="text-slate-500 text-[8px]">BASE RATE</div>
                              <div className="font-bold text-slate-200">{tokBaseRate || "1.00"}</div>
                            </div>
                            <div>
                              <div className="text-slate-500 text-[8px]">VOLATILITY</div>
                              <div className="font-bold text-slate-200">{(parseFloat(tokVolatility) * 100).toFixed(3)}%</div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleTokenizeDeploy()}
                            disabled={isTokenizing}
                            className="w-full mt-1 bg-emerald-900 hover:bg-emerald-800 disabled:bg-slate-800 text-emerald-100 text-[10px] font-mono font-bold py-2 rounded transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-md"
                          >
                            <Plus className="h-3.5 w-3.5 animate-spin" style={{ animationDuration: '3s' }} />
                            DEPLOY & TRACK ON WATCHLIST
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Part B: Manual Tokenizer / Deployment Form */}
                  <form onSubmit={handleTokenizeDeploy} className="bg-slate-900/30 border border-slate-900 p-4 rounded-xl space-y-3.5">
                    <div className="flex items-center justify-between border-b border-slate-900/60 pb-1.5">
                      <h4 className="text-[10px] font-mono font-bold text-slate-200 uppercase flex items-center gap-1">
                        <Plus className="h-3 w-3 text-emerald-400" />
                        Custom Asset Tokenizer
                      </h4>
                      <span className="text-[8px] font-mono text-slate-500">Multi-Chain Deployment</span>
                    </div>

                    <div className="space-y-2 font-mono text-[9px]">
                      {/* Grid 1: Name & Emoji */}
                      <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-2 flex flex-col gap-0.5">
                          <label className="text-slate-500 uppercase">Asset Name</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Sovereign Gold"
                            value={tokName}
                            onChange={(e) => setTokName(e.target.value)}
                            className="bg-slate-950 border border-slate-900 text-xs text-slate-200 px-2 py-1.5 rounded outline-none focus:border-slate-800 placeholder:text-slate-700"
                          />
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <label className="text-slate-500 uppercase">Emoji</label>
                          <input
                            type="text"
                            required
                            placeholder="🪙"
                            value={tokEmoji}
                            onChange={(e) => setTokEmoji(e.target.value)}
                            className="bg-slate-950 border border-slate-900 text-xs text-slate-200 px-2 py-1.5 rounded outline-none focus:border-slate-800 text-center"
                          />
                        </div>
                      </div>

                      {/* Grid 2: Ticker, Symbol, Category */}
                      <div className="grid grid-cols-3 gap-2">
                        <div className="flex flex-col gap-0.5">
                          <label className="text-slate-500 uppercase">Ticker</label>
                          <input
                            type="text"
                            required
                            maxLength={5}
                            placeholder="e.g. SGRC"
                            value={tokCode}
                            onChange={(e) => setTokCode(e.target.value.replace(/[^a-zA-Z]/g, '').toUpperCase())}
                            className="bg-slate-950 border border-slate-900 text-xs text-slate-200 px-2 py-1.5 rounded outline-none focus:border-slate-800 font-bold placeholder:text-slate-700"
                          />
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <label className="text-slate-500 uppercase">Symbol</label>
                          <input
                            type="text"
                            required
                            maxLength={3}
                            placeholder="e.g. ⚜️"
                            value={tokSymbol}
                            onChange={(e) => setTokSymbol(e.target.value)}
                            className="bg-slate-950 border border-slate-900 text-xs text-slate-200 px-2 py-1.5 rounded outline-none focus:border-slate-800 text-center"
                          />
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <label className="text-slate-500 uppercase">Category</label>
                          <select
                            value={tokCategory}
                            onChange={(e) => setTokCategory(e.target.value as 'digital' | 'cbdc')}
                            className="bg-slate-950 border border-slate-900 text-xs text-slate-200 px-1.5 py-1.5 rounded outline-none cursor-pointer"
                          >
                            <option value="cbdc">CBDC</option>
                            <option value="digital">Digital (Crypto)</option>
                          </select>
                        </div>
                      </div>

                      {/* Grid 3: Base Rate & Volatility */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-col gap-0.5">
                          <label className="text-slate-500 uppercase">Base Rate (per USD)</label>
                          <input
                            type="number"
                            required
                            step="any"
                            min="0.0000001"
                            placeholder="1.0"
                            value={tokBaseRate}
                            onChange={(e) => setTokBaseRate(e.target.value)}
                            className="bg-slate-950 border border-slate-900 text-xs font-bold text-slate-200 px-2 py-1.5 rounded outline-none focus:border-slate-800"
                          />
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <label className="text-slate-500 uppercase">Volatility Profile</label>
                          <select
                            value={tokVolatility}
                            onChange={(e) => setTokVolatility(e.target.value)}
                            className="bg-slate-950 border border-slate-900 text-xs text-slate-200 px-1.5 py-1.5 rounded outline-none cursor-pointer"
                          >
                            <option value="0.00015">Low Fluctuation (0.015%)</option>
                            <option value="0.0008">Stable Sovereign (0.08%)</option>
                            <option value="0.0025">Emerging Sovereign (0.25%)</option>
                            <option value="0.012">High Crypto Speculative (1.20%)</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {tokenizeError && (
                      <p className="text-[9px] font-mono text-red-400 bg-red-950/20 p-1 rounded border border-red-900/30 text-center">
                        {tokenizeError}
                      </p>
                    )}

                    {tokenizeSuccess && (
                      <p className="text-[9px] font-mono text-emerald-400 bg-emerald-950/20 p-1 rounded border border-emerald-900/30 text-center animate-bounce">
                        ✓ Deployed & registered successfully!
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={isTokenizing}
                      className="w-full bg-emerald-900 hover:bg-emerald-800 disabled:bg-slate-800 text-emerald-100 text-[10px] font-mono font-bold py-2 rounded transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-[0_1px_5px_rgba(16,185,129,0.15)]"
                    >
                      {isTokenizing ? "Initializing Ledger..." : "DEPLOY DIGITAL TOKEN"}
                    </button>
                  </form>

                  {/* Part C: API Resiliency & Failover Monitor (Live Telemetry) */}
                  <div className="bg-slate-900/30 border border-slate-900 p-4 rounded-xl space-y-3.5" id="telemetry-monitor-container">
                    <div className="flex items-center justify-between border-b border-slate-900/60 pb-1.5" id="telemetry-monitor-header">
                      <h4 className="text-[10px] font-mono font-bold text-slate-200 uppercase flex items-center gap-1.5">
                        <Database className="h-3.5 w-3.5 text-indigo-400" />
                        API Resiliency & Latency Monitor
                      </h4>
                      <div className="flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                        <span className="text-[8px] font-mono text-emerald-400">ACTIVE</span>
                      </div>
                    </div>

                    <p className="text-[9px] text-slate-400 leading-relaxed font-mono">
                      Real-time instrumentation of local and server-side request pipelines. Demonstrates robust failure-tolerance and backoff performance.
                    </p>

                    <div className="grid grid-cols-3 gap-2 font-mono text-[9px] text-center" id="telemetry-metrics-grid">
                      <div className="bg-slate-950 p-2 rounded border border-slate-900/60" id="metric-latency">
                        <div className="text-slate-500 text-[8px]">API LATENCY</div>
                        <div className="font-bold text-slate-200 mt-0.5">{telemetryLatency}ms</div>
                      </div>
                      <div className="bg-slate-950 p-2 rounded border border-slate-900/60" id="metric-requests">
                        <div className="text-slate-500 text-[8px]">CALL COUNTER</div>
                        <div className="font-bold text-slate-200 mt-0.5">{telemetryRequests} Req</div>
                      </div>
                      <div className="bg-slate-950 p-2 rounded border border-slate-900/60" id="metric-fail-protection">
                        <div className="text-slate-500 text-[8px]">FAIL PROTECTION</div>
                        <div className="font-bold text-emerald-400 mt-0.5">HEALED (0)</div>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-1 text-[8px] font-mono text-slate-400" id="telemetry-specifications">
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
              )}

            </div>
          </div>

        </div>

      </div>

      {/* Global Speculative AI Forecast Modal / Drawer Overlay */}
      {showForecastModal && globalForecast && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto" id="forecast-modal">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.8)]">
            
            {/* Modal Header */}
            <div className="p-4.5 border-b border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4.5 w-4.5 text-emerald-400 animate-pulse" />
                <h3 className="text-base font-bold tracking-tight text-slate-100">
                  Global Monetary Landscape (5-10 Year Outlook)
                </h3>
              </div>
              <button
                onClick={() => setShowForecastModal(false)}
                className="text-xs font-mono bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
              >
                Close
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5">
              
              {/* Macro trends bento bullets */}
              <div className="space-y-2">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                  Primary Macro-Economic Shifts
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {globalForecast.macroTrends.map((trend, i) => (
                    <div key={i} className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 text-xs text-slate-300 leading-relaxed flex gap-2">
                      <span className="text-emerald-500 font-mono font-bold">0{i+1}.</span>
                      <span>{trend}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Comprehensive Category Breakdowns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-800/50">
                <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/60">
                  <div className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                    <Coins className="h-4 w-4" />
                    Sovereign CBDC Proliferation
                  </div>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    {globalForecast.cbdcEvolution}
                  </p>
                </div>

                <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/60">
                  <div className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <Globe className="h-4 w-4" />
                    De-Dollarization Networks
                  </div>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    {globalForecast.dedollarizationThreat}
                  </p>
                </div>

                <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/60">
                  <div className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4" />
                    Decentralized Liquidity Bridges
                  </div>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    {globalForecast.cryptoIntegration}
                  </p>
                </div>

                <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/60">
                  <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <FileText className="h-4 w-4" />
                    Emerging Sovereign Hard Assets
                  </div>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    {globalForecast.emergingMarketForecast}
                  </p>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/30 shrink-0 text-center text-[10px] font-mono text-slate-500">
              Generative forecasts are synthesized based on continuous macroeconomic telemetry simulations.
            </div>

          </div>
        </div>
      )}

      {/* Terminal Footer */}
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

    </div>
  );
}
