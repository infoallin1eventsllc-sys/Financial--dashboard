import { describe, it, expect } from 'vitest';
import { computeKPIs, computeSentiment, buildChartData } from '../utils/calculations';
import type { MarketState, Currency, AIAnalysis } from '../types';

const makeCurrency = (overrides: Partial<Currency> = {}): Currency => ({
  code: 'USD', name: 'US Dollar', symbol: '$', category: 'fiat', emoji: '🇺🇸',
  currentRate: 1.0, history: Array(30).fill(1.0), dayHigh: 1.01, dayLow: 0.99, changePercent: 0,
  ...overrides,
});

const makeMarket = (overrides: Partial<MarketState> = {}): MarketState => ({
  currencies: { USD: makeCurrency() },
  lastUpdated: Date.now(),
  shockEvent: null,
  transactions: [],
  quantumCalendar: [],
  ...overrides,
});

describe('computeKPIs', () => {
  it('returns zeros for empty transactions', () => {
    const market = makeMarket();
    const result = computeKPIs(market, 'USD');
    expect(result.totalRevenueBase).toBe(0);
    expect(result.completedCount).toBe(0);
    expect(result.activeClientsCount).toBe(0);
  });

  it('counts unique clients correctly', () => {
    const market = makeMarket({
      currencies: { USD: makeCurrency() },
      transactions: [
        { id: '1', client: 'Alpha Corp', amount: 100, currency: 'USD', status: 'completed', timestamp: Date.now(), service: 'Advisory' },
        { id: '2', client: 'Alpha Corp', amount: 200, currency: 'USD', status: 'pending', timestamp: Date.now(), service: 'Consulting' },
        { id: '3', client: 'Beta LLC', amount: 300, currency: 'USD', status: 'completed', timestamp: Date.now(), service: 'Trading' },
      ],
    });
    const result = computeKPIs(market, 'USD');
    expect(result.activeClientsCount).toBe(2);
    expect(result.completedCount).toBe(2);
  });

  it('converts revenue to base currency correctly', () => {
    const eur = makeCurrency({ code: 'EUR', symbol: '€', currentRate: 0.92 });
    const usd = makeCurrency();
    const market = makeMarket({
      currencies: { USD: usd, EUR: eur },
      transactions: [
        { id: '1', client: 'Corp', amount: 92, currency: 'EUR', status: 'completed', timestamp: Date.now(), service: 'Service' },
      ],
    });
    const result = computeKPIs(market, 'USD');
    expect(result.totalRevenueBase).toBeCloseTo(100, 1);
  });

  it('calculates digital mix ratio', () => {
    const btc = makeCurrency({ code: 'BTC', category: 'digital', currentRate: 0.000015 });
    const usd = makeCurrency();
    const market = makeMarket({
      currencies: { USD: usd, BTC: btc },
      transactions: [
        { id: '1', client: 'Corp', amount: 1, currency: 'USD', status: 'completed', timestamp: Date.now(), service: 'S' },
        { id: '2', client: 'Corp', amount: 0.000015, currency: 'BTC', status: 'completed', timestamp: Date.now(), service: 'S' },
      ],
    });
    const result = computeKPIs(market, 'USD');
    expect(result.digitalMixRatio).toBeCloseTo(50, 0);
  });
});

describe('computeSentiment', () => {
  it('returns neutral for undefined currency', () => {
    const result = computeSentiment(undefined, null);
    expect(result.label).toBe('Neutral');
    expect(result.score).toBe(50);
  });

  it('shifts score toward bullish with bullish analysis', () => {
    const currency = makeCurrency();
    const analysis: AIAnalysis = {
      code: 'USD', name: 'US Dollar', summary: '', outlook: 'bullish',
      target12m: '$1.02', risks: [], drivers: ['Strong economy'],
      futuristicForecast: 'Stable',
    };
    const result = computeSentiment(currency, analysis);
    expect(result.score).toBeGreaterThan(50);
  });

  it('shifts score toward bearish with bearish analysis', () => {
    const currency = makeCurrency();
    const analysis: AIAnalysis = {
      code: 'USD', name: 'US Dollar', summary: '', outlook: 'bearish',
      target12m: '$0.90', risks: ['Inflation', 'Debt'], drivers: [],
      futuristicForecast: 'Declining',
    };
    const result = computeSentiment(currency, analysis);
    expect(result.score).toBeLessThan(50);
  });

  it('clamps score between 0 and 100', () => {
    const currency = makeCurrency({ changePercent: 10 });
    const analysis: AIAnalysis = {
      code: 'USD', name: 'US Dollar', summary: '', outlook: 'bullish',
      target12m: '$2', risks: [], drivers: Array(10).fill('driver'),
      futuristicForecast: 'Excellent',
    };
    const result = computeSentiment(currency, analysis);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });
});

describe('buildChartData', () => {
  it('returns empty array when currencies are undefined', () => {
    expect(buildChartData(undefined, undefined, undefined)).toEqual([]);
  });

  it('builds 30 data points from history', () => {
    const active = makeCurrency({ history: Array(30).fill(0.92) });
    const base = makeCurrency({ history: Array(30).fill(1.0) });
    const result = buildChartData(active, base, undefined);
    expect(result).toHaveLength(30);
  });

  it('inverts rate for digital (crypto) currencies', () => {
    const btc = makeCurrency({ code: 'BTC', category: 'digital', currentRate: 0.000015, history: Array(30).fill(0.000015) });
    const usd = makeCurrency({ history: Array(30).fill(1.0) });
    const result = buildChartData(btc, usd, undefined);
    expect(result[0].rate).toBeGreaterThan(1);
  });

  it('includes compRate when comparison currency is provided', () => {
    const active = makeCurrency({ history: Array(30).fill(1.0) });
    const base = makeCurrency({ history: Array(30).fill(1.0) });
    const comp = makeCurrency({ code: 'EUR', history: Array(30).fill(0.92) });
    const result = buildChartData(active, base, comp);
    expect(result[0].compRate).toBeDefined();
  });
});
