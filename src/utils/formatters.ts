import type { Currency } from '../types';

export function formatCurrencyValue(
  targetCode: string,
  currenciesMap: Record<string, Currency>,
  baseCurrencyCode: string,
  value = 1
): string {
  const target = currenciesMap[targetCode];
  const base = currenciesMap[baseCurrencyCode];
  if (!target || !base) return '-';

  const rebasedRate = target.currentRate / base.currentRate;

  if (target.category === 'digital') {
    const inverse = base.currentRate / target.currentRate;
    return `1 ${targetCode} = ${base.symbol}${inverse.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  return `${value} ${baseCurrencyCode} = ${target.symbol}${rebasedRate.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  })} ${targetCode}`;
}

export function getRebasedRate(
  targetCode: string,
  currenciesMap: Record<string, Currency>,
  baseCurrencyCode: string
): number {
  const target = currenciesMap[targetCode];
  const base = currenciesMap[baseCurrencyCode];
  if (!target || !base) return 0;
  return target.currentRate / base.currentRate;
}

export function formatNumber(n: number, decimals = 2): string {
  return n.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}
