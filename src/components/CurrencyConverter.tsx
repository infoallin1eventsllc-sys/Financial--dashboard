import React from 'react';
import { Calculator, ArrowRight } from 'lucide-react';
import type { Currency } from '../types';

interface Props {
  currenciesMap: Record<string, Currency>;
  calcAmount: number;
  calcFrom: string;
  calcTo: string;
  onAmountChange: (v: number) => void;
  onFromChange: (code: string) => void;
  onToChange: (code: string) => void;
  onSwap: () => void;
}

export function CurrencyConverter({
  currenciesMap,
  calcAmount,
  calcFrom,
  calcTo,
  onAmountChange,
  onFromChange,
  onToChange,
  onSwap,
}: Props) {
  const fromCurr = currenciesMap[calcFrom];
  const toCurr = currenciesMap[calcTo];

  const getConversion = (): string => {
    if (!fromCurr || !toCurr) return '0.00';
    const valueInUSD = calcAmount / fromCurr.currentRate;
    const finalVal = valueInUSD * toCurr.currentRate;
    return finalVal.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: toCurr.category === 'digital' ? 6 : 4,
    });
  };

  return (
    <div className="bg-slate-900/20 border border-slate-900 p-4 rounded-2xl flex flex-col gap-3" id="quick-converter">
      <h3 className="text-xs font-mono font-bold text-slate-300 tracking-wider flex items-center gap-1.5 uppercase">
        <Calculator className="h-3.5 w-3.5 text-emerald-400" />
        Cross-Asset Calculator
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center mt-1">
        <div className="sm:col-span-3 flex flex-col gap-1">
          <label className="text-[9px] font-mono text-slate-500 uppercase">Amount</label>
          <input
            type="number"
            min="0"
            value={calcAmount}
            onChange={(e) => onAmountChange(Math.max(0, parseFloat(e.target.value) || 0))}
            className="bg-slate-950 border border-slate-900 text-xs font-mono font-bold text-slate-100 px-3 py-2 rounded-lg outline-none focus:border-slate-800"
          />
        </div>

        <div className="sm:col-span-3 flex flex-col gap-1">
          <label className="text-[9px] font-mono text-slate-500 uppercase">From</label>
          <select
            value={calcFrom}
            onChange={(e) => onFromChange(e.target.value)}
            className="bg-slate-950 border border-slate-900 text-xs font-mono text-slate-200 px-2.5 py-2 rounded-lg outline-none cursor-pointer"
          >
            {Object.keys(currenciesMap).map((code) => (
              <option key={code} value={code}>
                {currenciesMap[code].emoji} {code}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-1 flex justify-center pt-3">
          <button
            onClick={onSwap}
            className="p-1.5 bg-slate-900 hover:bg-slate-800 rounded-lg text-slate-400 transition-all border border-slate-800 cursor-pointer"
            title="Swap Currencies"
          >
            <ArrowRight className="h-3 w-3 transform rotate-90 sm:rotate-0" />
          </button>
        </div>

        <div className="sm:col-span-3 flex flex-col gap-1">
          <label className="text-[9px] font-mono text-slate-500 uppercase">To</label>
          <select
            value={calcTo}
            onChange={(e) => onToChange(e.target.value)}
            className="bg-slate-950 border border-slate-900 text-xs font-mono text-slate-200 px-2.5 py-2 rounded-lg outline-none cursor-pointer"
          >
            {Object.keys(currenciesMap).map((code) => (
              <option key={code} value={code}>
                {currenciesMap[code].emoji} {code}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2 text-right pt-3">
          <span className="text-[9px] font-mono text-slate-500 uppercase block">Result</span>
          <span className="text-xs font-mono font-bold text-emerald-400">{getConversion()}</span>
        </div>
      </div>
    </div>
  );
}
