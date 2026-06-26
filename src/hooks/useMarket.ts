import { useState, useEffect, useRef, type Dispatch, type SetStateAction } from 'react';
import type { MarketState } from '../types';

export interface MarketHook {
  market: MarketState | null;
  isLoadingRates: boolean;
  isRefreshing: boolean;
  flashStates: Record<string, 'up' | 'down' | null>;
  fetchRates: (silent?: boolean) => Promise<void>;
  setMarket: Dispatch<SetStateAction<MarketState | null>>;
}

export function useMarket(): MarketHook {
  const [market, setMarket] = useState<MarketState | null>(null);
  const [isLoadingRates, setIsLoadingRates] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [flashStates, setFlashStates] = useState<Record<string, 'up' | 'down' | null>>({});
  const prevRatesRef = useRef<Record<string, number>>({});

  const fetchRates = async (silent = false) => {
    if (!silent) setIsLoadingRates(true);
    try {
      const response = await fetch('/api/rates');
      if (!response.ok) return;
      const data: MarketState = await response.json();

      const newFlashStates: Record<string, 'up' | 'down' | null> = {};
      Object.keys(data.currencies).forEach((code) => {
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
      setTimeout(() => setFlashStates({}), 1200);
    } catch (error) {
      console.error('Error fetching market rates:', error);
    } finally {
      setIsLoadingRates(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRates();
    const interval = setInterval(() => fetchRates(true), 3000);
    return () => clearInterval(interval);
  }, []);

  return { market, isLoadingRates, isRefreshing, flashStates, fetchRates, setMarket };
}
