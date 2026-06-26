import type { Currency, MarketState, AIAnalysis, Transaction } from '../types';

export interface KPIData {
  totalRevenueBase: number;
  completedCount: number;
  activeClientsCount: number;
  digitalMixRatio: number;
  velocityPercent: number;
}

export function computeKPIs(
  market: MarketState,
  baseCurrencyCode: string
): KPIData {
  const txs = market.transactions;
  const currenciesMap = market.currencies;
  const base = currenciesMap[baseCurrencyCode];

  let totalRevenueBase = 0;
  let completedCount = 0;
  let digitalUSD = 0;
  let totalUSD = 0;

  txs.forEach((tx) => {
    const txCurrency = currenciesMap[tx.currency];
    if (!txCurrency || !base) return;

    if (tx.status === 'completed') completedCount++;

    const valueInUSD = tx.amount / txCurrency.currentRate;
    const valueInBase = valueInUSD * base.currentRate;
    totalRevenueBase += valueInBase;
    totalUSD += valueInUSD;

    if (txCurrency.category === 'digital' || txCurrency.category === 'cbdc') {
      digitalUSD += valueInUSD;
    }
  });

  const uniqueClients = new Set(txs.map((t) => t.client));
  const digitalMixRatio = totalUSD > 0 ? (digitalUSD / totalUSD) * 100 : 50;
  const velocityPercent = computeVelocityPercent(txs);

  return {
    totalRevenueBase,
    completedCount,
    activeClientsCount: uniqueClients.size,
    digitalMixRatio,
    velocityPercent,
  };
}

function computeVelocityPercent(txs: Transaction[]): number {
  if (txs.length < 2) return 0;
  const now = Date.now();
  const windowMs = 24 * 60 * 60 * 1000;
  const recent = txs.filter((t) => now - t.timestamp < windowMs);
  const older = txs.filter((t) => now - t.timestamp >= windowMs);

  if (older.length === 0) return recent.length > 0 ? 100 : 0;

  const recentVolume = recent.reduce((s, t) => s + t.amount, 0);
  const olderVolume = older.reduce((s, t) => s + t.amount, 0);

  if (olderVolume === 0) return 0;
  return parseFloat((((recentVolume - olderVolume) / olderVolume) * 100).toFixed(2));
}

export interface SentimentData {
  score: number;
  label: string;
  color: string;
  bg: string;
  hex: string;
}

export function computeSentiment(
  currency: Currency | undefined,
  analysis: AIAnalysis | null
): SentimentData {
  if (!currency) {
    return { score: 50, label: 'Neutral', color: 'text-amber-500', bg: 'bg-amber-500', hex: '#f59e0b' };
  }

  let score = 50;

  if (analysis) {
    if (analysis.outlook === 'bullish') score += 25;
    if (analysis.outlook === 'bearish') score -= 25;
    score += (analysis.drivers?.length ?? 0) * 5;
    score -= (analysis.risks?.length ?? 0) * 5;
  }

  const change = currency.changePercent || 0;
  score += Math.max(-15, Math.min(15, change * 15));
  score = Math.max(0, Math.min(100, Math.round(score)));

  if (score <= 20) return { score, label: 'Extreme Fear', color: 'text-red-500', bg: 'bg-red-500', hex: '#ef4444' };
  if (score <= 40) return { score, label: 'Fear', color: 'text-orange-500', bg: 'bg-orange-500', hex: '#f97316' };
  if (score <= 60) return { score, label: 'Neutral', color: 'text-amber-500', bg: 'bg-amber-500', hex: '#f59e0b' };
  if (score <= 80) return { score, label: 'Greed', color: 'text-lime-500', bg: 'bg-lime-500', hex: '#84cc16' };
  return { score, label: 'Extreme Greed', color: 'text-emerald-500', bg: 'bg-emerald-500', hex: '#10b981' };
}

export interface ChartEntry {
  tickIndex: number;
  rate: number;
  compRate?: number;
}

export function buildChartData(
  activeCurrency: Currency | undefined,
  baseCurrency: Currency | undefined,
  comparisonCurrency: Currency | undefined
): ChartEntry[] {
  if (!activeCurrency || !baseCurrency) return [];

  return activeCurrency.history.map((rateAtTick, index) => {
    const baseAtTick = baseCurrency.history[index] ?? baseCurrency.currentRate;
    const rebasedVal = rateAtTick / baseAtTick;
    const finalVal =
      activeCurrency.category === 'digital'
        ? baseAtTick / rateAtTick
        : rebasedVal;

    const entry: ChartEntry = {
      tickIndex: index,
      rate: parseFloat(finalVal.toFixed(activeCurrency.category === 'digital' ? 2 : 5)),
    };

    if (comparisonCurrency) {
      const compRateAtTick = comparisonCurrency.history[index] ?? comparisonCurrency.currentRate;
      const compRebasedVal = compRateAtTick / baseAtTick;
      const compFinalVal =
        comparisonCurrency.category === 'digital'
          ? baseAtTick / compRateAtTick
          : compRebasedVal;
      entry.compRate = parseFloat(compFinalVal.toFixed(comparisonCurrency.category === 'digital' ? 2 : 5));
    }

    return entry;
  });
}

export interface LayoutBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface RenderableCurrencyNode {
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

export interface RenderableCategoryNode {
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

export interface TreemapData {
  grandTotal: number;
  categories: RenderableCategoryNode[];
}

function partition1D(
  items: { name: string; value: number }[],
  x: number,
  y: number,
  w: number,
  h: number
): Record<string, LayoutBox> {
  const results: Record<string, LayoutBox> = {};
  if (items.length === 0) return results;

  const totalVal = items.reduce((sum, item) => sum + item.value, 0);
  let currentX = x;
  let currentY = y;
  const isVertical = w > h;

  items.forEach((item) => {
    const fraction = totalVal > 0 ? item.value / totalVal : 1 / items.length;
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
}

export function buildTreemap(
  market: MarketState,
  baseCurrencyCode: string,
  width: number,
  height: number
): TreemapData {
  const transactions = market.transactions;
  const currenciesMap = market.currencies;
  const baseCurrency = currenciesMap[baseCurrencyCode];

  type CategoryState = {
    name: string;
    displayName: string;
    color: string;
    borderColor: string;
    textColor: string;
    value: number;
    currencies: Record<string, number>;
  };

  const categories: Record<string, CategoryState> = {
    fiat: { name: 'fiat', displayName: 'Sovereign Fiat', color: 'from-emerald-950/40 to-emerald-900/10', borderColor: 'border-emerald-500/20', textColor: 'text-emerald-400', value: 0, currencies: {} },
    digital: { name: 'digital', displayName: 'Decentralized Digital', color: 'from-amber-950/40 to-amber-900/10', borderColor: 'border-amber-500/20', textColor: 'text-amber-400', value: 0, currencies: {} },
    cbdc: { name: 'cbdc', displayName: 'Central Bank Digital', color: 'from-indigo-950/40 to-indigo-900/10', borderColor: 'border-indigo-500/20', textColor: 'text-indigo-400', value: 0, currencies: {} },
  };

  let grandTotal = 0;

  transactions.forEach((tx) => {
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
        currencies: {},
      };
    }

    categories[category].currencies[tx.currency] = (categories[category].currencies[tx.currency] || 0) + valueInBase;
    categories[category].value += valueInBase;
    grandTotal += valueInBase;
  });

  let categoryList = Object.values(categories).filter((c) => c.value > 0);

  if (grandTotal === 0) {
    const seedCurrencies = [
      { code: 'USD', category: 'fiat', val: 125000 },
      { code: 'EUR', category: 'fiat', val: 85000 },
      { code: 'BTC', category: 'digital', val: 240000 },
      { code: 'ETH', category: 'digital', val: 110000 },
      { code: 'e-USD', category: 'cbdc', val: 95000 },
      { code: 'e-CNY', category: 'cbdc', val: 60000 },
    ];

    const baseRate = baseCurrency ? baseCurrency.currentRate : 1;
    seedCurrencies.forEach((seed) => {
      const c = seed.category;
      const valueInBase = seed.val * baseRate;
      categories[c].currencies[seed.code] = valueInBase;
      categories[c].value += valueInBase;
      grandTotal += valueInBase;
    });

    categoryList = Object.values(categories).filter((c) => c.value > 0);
  }

  categoryList.sort((a, b) => b.value - a.value);

  const categoryLayouts = partition1D(
    categoryList.map((c) => ({ name: c.name, value: c.value })),
    0,
    0,
    width,
    height
  );

  const finalTreemap: RenderableCategoryNode[] = [];

  categoryList.forEach((cat) => {
    const layout = categoryLayouts[cat.name];
    if (!layout) return;

    const currenciesArray = Object.entries(cat.currencies)
      .map(([code, val]) => ({ code, value: val }))
      .sort((a, b) => b.value - a.value);

    const padding = layout.w > 20 && layout.h > 20 ? 4 : 1;
    const headerHeight = layout.h > 40 ? 16 : 0;

    const innerX = layout.x + padding;
    const innerY = layout.y + padding + headerHeight;
    const innerW = Math.max(0, layout.w - padding * 2);
    const innerH = Math.max(0, layout.h - padding * 2 - headerHeight);

    const currencyLayouts = partition1D(
      currenciesArray.map((c) => ({ name: c.code, value: c.value })),
      innerX,
      innerY,
      innerW,
      innerH
    );

    const renderableCurrencies: RenderableCurrencyNode[] = currenciesArray
      .map((curr) => {
        const currLayout = currencyLayouts[curr.code];
        if (!currLayout) return null;
        const meta = currenciesMap[curr.code];
        return {
          code: curr.code,
          category: cat.name,
          value: curr.value,
          percentageOfCategory: cat.value > 0 ? (curr.value / cat.value) * 100 : 0,
          percentageOfTotal: grandTotal > 0 ? (curr.value / grandTotal) * 100 : 0,
          x: currLayout.x,
          y: currLayout.y,
          w: currLayout.w,
          h: currLayout.h,
          emoji: meta ? meta.emoji : '🪙',
        };
      })
      .filter((n): n is RenderableCurrencyNode => n !== null);

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
      children: renderableCurrencies,
    });
  });

  return { grandTotal, categories: finalTreemap };
}
