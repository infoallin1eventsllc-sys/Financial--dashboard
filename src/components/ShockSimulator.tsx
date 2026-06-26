import React from 'react';
import { Zap, AlertTriangle } from 'lucide-react';

interface Props {
  selectedShockType: string;
  customShockText: string;
  isTriggeringShock: boolean;
  onShockTypeChange: (type: string) => void;
  onCustomTextChange: (text: string) => void;
  onTrigger: () => void;
}

export function ShockSimulator({
  selectedShockType,
  customShockText,
  isTriggeringShock,
  onShockTypeChange,
  onCustomTextChange,
  onTrigger,
}: Props) {
  return (
    <div className="bg-slate-900/30 border border-slate-900 p-4 rounded-xl shrink-0" id="shock-control-box">
      <h3 className="text-xs font-mono font-bold text-slate-300 tracking-wider flex items-center gap-1.5 uppercase">
        <Zap className="h-3.5 w-3.5 text-amber-400" />
        Sovereign Shock Engine
      </h3>
      <p className="text-[10px] text-slate-400/80 mt-1 leading-relaxed">
        Inject sudden geopolitical crises into memory and see how capital flows adjust based on real-time
        AI-calculated risk parameters.
      </p>

      <div className="flex flex-col gap-2.5 mt-3.5">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-mono text-slate-500 uppercase">Crisis Template</label>
            <select
              value={selectedShockType}
              onChange={(e) => onShockTypeChange(e.target.value)}
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
              onChange={(e) => onCustomTextChange(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 px-2 py-1.5 rounded outline-none focus:border-slate-750 placeholder:text-slate-600"
            />
          </div>
        </div>

        <button
          onClick={onTrigger}
          disabled={isTriggeringShock}
          className="w-full bg-slate-900 hover:bg-slate-850 hover:border-amber-500/30 text-amber-400 border border-slate-800 text-[10px] font-mono font-bold py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          id="trigger-shock-btn"
        >
          <AlertTriangle className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
          {isTriggeringShock ? 'COMPUTING CASCADE...' : 'INJECT GEOPOLITICAL SHOCK'}
        </button>
      </div>
    </div>
  );
}
