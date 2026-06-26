import { describe, it, expect } from 'vitest';
import { getRebasedRate, formatCurrencyValue } from '../utils/formatters';
import type { Currency } from '../types';

const makeCurrency = (overrides: Partial<Currency> = {}): Currency => ({
  code: 'USD', name: 'US Dollar', symbol: '$', category: 'fiat', emoji: '🇺🇸',
  currentRate: 1.0, history: [], dayHigh: 1.01, dayLow: 0.99, changePercent: 0,
  ...overrides,
});

describe('getRebasedRate', () => {
  it('returns 0 for unknown currency', () => {
    const map = { USD: makeCurrency() };
    expect(getRebasedRate('BTC', map, 'USD')).toBe(0);
  });

  it('returns 1 when target and base are the same', () => {
    const map = { USD: makeCurrency() };
    expect(getRebasedRate('USD', map, 'USD')).toBe(1);
  });

  it('correctly converts EUR relative to USD base', () => {
    const map = {
      USD: makeCurrency(),
      EUR: makeCurrency({ code: 'EUR', currentRate: 0.92 }),
    };
    expect(getRebasedRate('EUR', map, 'USD')).toBeCloseTo(0.92, 4);
  });

  it('correctly converts JPY relative to EUR base', () => {
    const map = {
      USD: makeCurrency(),
      EUR: makeCurrency({ code: 'EUR', currentRate: 0.92 }),
      JPY: makeCurrency({ code: 'JPY', currentRate: 155.4 }),
    };
    const result = getRebasedRate('JPY', map, 'EUR');
    expect(result).toBeCloseTo(155.4 / 0.92, 2);
  });
});

describe('formatCurrencyValue', () => {
  it('returns dash for unknown currency', () => {
    const map = { USD: makeCurrency() };
    expect(formatCurrencyValue('BTC', map, 'USD')).toBe('-');
  });

  it('returns inverse format for digital currencies', () => {
    const map = {
      USD: makeCurrency(),
      BTC: makeCurrency({ code: 'BTC', category: 'digital', symbol: '₿', currentRate: 0.000015 }),
    };
    const result = formatCurrencyValue('BTC', map, 'USD');
    expect(result).toContain('1 BTC');
    expect(result).toContain('$');
  });

  it('returns standard format for fiat currencies', () => {
    const map = {
      USD: makeCurrency(),
      EUR: makeCurrency({ code: 'EUR', symbol: '€', currentRate: 0.92 }),
    };
    const result = formatCurrencyValue('EUR', map, 'USD');
    expect(result).toContain('EUR');
    expect(result).toContain('€');
  });
});
