export type CurrencyCategory = 'fiat' | 'digital' | 'cbdc';

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  category: CurrencyCategory;
  emoji: string;
  currentRate: number; // units per 1 USD
  history: number[];   // historical rates relative to USD (last 30 ticks)
  dayHigh: number;
  dayLow: number;
  changePercent: number; // 24h change or since start
}

export interface MarketState {
  currencies: { [code: string]: Currency };
  lastUpdated: number;
  shockEvent: ShockEvent | null;
  transactions: Transaction[];
  quantumCalendar: QuantumEvent[];
}

export interface Transaction {
  id: string;
  client: string;
  amount: number;      // raw value
  currency: string;    // original currency code
  status: 'completed' | 'pending' | 'processing';
  timestamp: number;
  service: string;
}

export interface QuantumEvent {
  id: string;
  title: string;
  timestamp: number;
  timeLabel: string;
  category: 'fiat' | 'digital' | 'cbdc' | 'macro';
  status: 'Scheduled' | 'Converging' | 'Executed';
  quantumBlock: number;
  volatilityIndex: 'Low' | 'Medium' | 'High' | 'EXTREME';
  description: string;
}

export interface ShockEvent {
  id: string;
  name: string;
  description: string;
  timestamp: number;
  impacts: { [code: string]: number }; // code -> percentage change (e.g. -15 for -15%)
}

export interface AIAnalysis {
  code: string;
  name: string;
  summary: string;
  outlook: 'bullish' | 'neutral' | 'bearish';
  target12m: string;
  risks: string[];
  drivers: string[];
  futuristicForecast: string;
}

export interface AIGlobalOutlook {
  macroTrends: string[];
  cbdcEvolution: string;
  dedollarizationThreat: string;
  cryptoIntegration: string;
  emergingMarketForecast: string;
}
