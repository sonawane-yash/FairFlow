import React, { useState } from 'react';
import {
  Sliders,
  Play,
  Pause,
  RotateCcw,
  ShieldAlert,
  Flame,
  RefreshCw,
  Cpu,
  Zap,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { StorageService } from '../../services/storage';

interface AdminControlPanelProps {
  onRunSimulationTab: () => void;
}

export const AdminControlPanel: React.FC<AdminControlPanelProps> = ({ onRunSimulationTab }) => {
  const [experimentActive, setExperimentActive] = useState(true);
  const [throttleCapacity, setThrottleCapacity] = useState(5000);
  const [recycleFrequencySec, setRecycleFrequencySec] = useState(180);
  const [syntheticBotStorm, setSyntheticBotStorm] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleInjectBotStorm = () => {
    setSyntheticBotStorm(true);
    setStatusMessage('Synthetic bot attack wave injected (+15,000 automated queries intercepted by eligibility gate).');
    StorageService.addEvent({
      timestamp: new Date().toLocaleTimeString(),
      poolName: 'Security Gate',
      type: 'system',
      units: 15000,
      description: 'Bot traffic surge intercepted: synthetic signatures rejected before pool formation'
    });

    setTimeout(() => {
      setSyntheticBotStorm(false);
      setStatusMessage(null);
    }, 4000);
  };

  const handleResetData = () => {
    if (window.confirm('Reset all synthetic applications, bookings, and simulation event ledgers?')) {
      StorageService.resetToDefaults();
      setStatusMessage('All prototype data has been reset to defaults.');
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-[#EA580C] text-xs font-bold mb-2">
          <Sliders className="w-3.5 h-3.5 text-[#EA580C]" />
          <span>System Operator Console</span>
        </div>
        <h1 className="text-3xl font-black text-[#0B2545]">Admin & Experiment Control Panel</h1>
        <p className="text-sm text-slate-600 font-sans">
          Configure admission governor rates, test failure injection, and simulate traffic bursts for stress testing.
        </p>
      </div>

      {statusMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between animate-in fade-in shadow-xs">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{statusMessage}</span>
          </div>
        </div>
      )}

      {/* Control Levers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Capacity & Throttle Governor */}
        <div className="p-6 rounded-xl bg-white border border-slate-200 space-y-5 shadow-xs">
          <div className="flex items-center gap-2 text-[#0B2545] font-bold text-sm">
            <Cpu className="w-4 h-4 text-[#EA580C]" />
            <span>Admission Governor Throttle</span>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs text-slate-700 font-medium mb-1.5">
                <span>Safe Concurrent Capacity Threshold (C)</span>
                <span className="font-mono text-[#0B2545] font-bold">{throttleCapacity.toLocaleString()} conn</span>
              </div>
              <input
                type="range"
                min={500}
                max={15000}
                step={500}
                value={throttleCapacity}
                onChange={(e) => setThrottleCapacity(parseInt(e.target.value))}
                className="w-full accent-[#EA580C]"
              />
              <div className="flex justify-between text-[10px] text-slate-500 pt-1 font-sans">
                <span>500 (Strict)</span>
                <span>5,000 (Standard)</span>
                <span>15,000 (Stress test)</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-700 font-medium mb-1.5">
                <span>Pool Window Recycling Interval</span>
                <span className="font-mono text-blue-700 font-bold">{recycleFrequencySec} seconds</span>
              </div>
              <input
                type="range"
                min={60}
                max={360}
                step={30}
                value={recycleFrequencySec}
                onChange={(e) => setRecycleFrequencySec(parseInt(e.target.value))}
                className="w-full accent-[#0B2545]"
              />
              <div className="flex justify-between text-[10px] text-slate-500 pt-1 font-sans">
                <span>1 min (Rapid)</span>
                <span>3 mins (Realistic)</span>
                <span>6 mins (Extended)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Experiment State & Synthetic Attack Injections */}
        <div className="p-6 rounded-xl bg-white border border-slate-200 space-y-5 shadow-xs">
          <div className="flex items-center gap-2 text-[#0B2545] font-bold text-sm">
            <ShieldAlert className="w-4 h-4 text-red-600" />
            <span>Stress & Chaos Injections</span>
          </div>

          <div className="space-y-4 text-xs">
            <p className="text-slate-600 leading-relaxed font-sans">
              Inject synthetic bot storms or sudden checkout abandonment waves to evaluate how FairFlow's dynamic
              recycling recovers orphaned inventory.
            </p>

            <div className="pt-2 flex flex-col gap-3">
              <button
                onClick={handleInjectBotStorm}
                disabled={syntheticBotStorm}
                className="w-full py-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                <Flame className="w-4 h-4 text-red-600" />
                <span>{syntheticBotStorm ? 'Bot Surge Active...' : 'Inject 15,000 Bot Stampede'}</span>
              </button>

              <button
                onClick={onRunSimulationTab}
                className="w-full py-3 rounded-xl bg-[#EA580C] hover:bg-[#D94E06] text-white font-bold flex items-center justify-center gap-2 shadow-xs transition-transform active:scale-95"
              >
                <Zap className="w-4 h-4" />
                <span>Open Full Simulation Benchmark</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Database State Management */}
      <div className="p-6 rounded-xl bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1">
          <div className="text-sm font-bold text-[#0B2545]">Reset Local Simulation Sandbox</div>
          <p className="text-xs text-slate-600 font-sans">
            Restore sample applications, seeded bookings, and real-time inventory ledger logs to pristine state.
          </p>
        </div>

        <button
          onClick={handleResetData}
          className="px-5 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-red-700 border border-slate-300 text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Sandbox</span>
        </button>
      </div>
    </div>
  );
};
