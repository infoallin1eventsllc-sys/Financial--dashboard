import { useState, useEffect } from 'react';
import type { AIAnalysis, AIGlobalOutlook } from '../types';

export interface AIHook {
  aiAnalysis: AIAnalysis | null;
  isLoadingAnalysis: boolean;
  analysisError: string | null;
  globalForecast: AIGlobalOutlook | null;
  showForecastModal: boolean;
  isLoadingForecast: boolean;
  fetchAIAnalysis: (code: string) => Promise<void>;
  fetchGlobalForecast: () => Promise<void>;
  setShowForecastModal: (show: boolean) => void;
}

export function useAI(selectedCurrencyCode: string): AIHook {
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [globalForecast, setGlobalForecast] = useState<AIGlobalOutlook | null>(null);
  const [showForecastModal, setShowForecastModal] = useState(false);
  const [isLoadingForecast, setIsLoadingForecast] = useState(false);

  const fetchAIAnalysis = async (code: string) => {
    setIsLoadingAnalysis(true);
    setAnalysisError(null);
    try {
      const res = await fetch('/api/gemini/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      if (res.ok) {
        const data: AIAnalysis = await res.json();
        setAiAnalysis(data);
      } else {
        setAnalysisError('Could not retrieve AI Brief.');
      }
    } catch {
      setAnalysisError('Network timeout connecting to AI Analyst.');
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

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
      console.error('Error fetching global monetary forecast:', err);
    } finally {
      setIsLoadingForecast(false);
    }
  };

  useEffect(() => {
    if (selectedCurrencyCode) {
      fetchAIAnalysis(selectedCurrencyCode);
    }
  }, [selectedCurrencyCode]);

  return {
    aiAnalysis,
    isLoadingAnalysis,
    analysisError,
    globalForecast,
    showForecastModal,
    isLoadingForecast,
    fetchAIAnalysis,
    fetchGlobalForecast,
    setShowForecastModal,
  };
}
