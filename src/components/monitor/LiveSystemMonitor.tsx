import React, { useState, useEffect } from 'react';
import {
  Radio,
  Cpu,
  ShieldCheck,
  RefreshCw,
  Zap,
  Activity,
  AlertCircle,
  Clock,
  Layers,
  Sparkles,
  Server
} from 'lucide-react';
import { StorageService } from '../../services/storage';
import { InventoryEvent } from '../../types';

export const LiveSystemMonitor: React.FC = () => {
  const [systemLoad, setSystemLoad] = useState(3482);
  const [maxCapacity] = useState(5000);
  const [waitingUsers, setWaitingUsers] = useState(18420);
  const [activePools, setActivePools] = useState(2);
  const [inventoryRemaining, setInventoryRemaining] = useState(437);
  const [successfulBookings, setSuccessfulBookings] = useState(563);
  const [failedBookings, setFailedBookings] = useState(21);
  const [fairnessIndex, setFairnessIndex] = useState(0.94);
  const [utilizationRate, setUtilizationRate] = useState(91.3);

  const [events, setEvents] = useState<InventoryEvent[]>(() => StorageService.getEvents());
  const [isAutoTicking, setIsAutoTicking] = useState(true);

  // Periodic telemetry fluctuation to simulate live operations
  useEffect(() => {
    if (!isAutoTicking) return;

    const interval = setInterval(() => {
      setSystemLoad((prev) => {
        const delta = Math.floor((Math.random() - 0.48) * 80);
        return Math.min(maxCapacity, Math.max(1200, prev + delta));
      });

      setWaitingUsers((prev) => Math.max(0, prev - Math.floor(Math.random() * 25)));

      // Occasionally add live telemetry events
      if (Math.random() > 0.6) {
        const sampleDescriptions = [
          'Pool Beta admitted 480 users via Controlled Admission Controller',
          'Database atomic seat lock completed in 14ms',
          '18 unexercised reservations released and marked for recycling',
          'Synthetic telemetry check passed for batch of 250 pre-registrants',
          'Provisional allocation synced with distributed ledger cache'
        ];
        const randomDesc = sampleDescriptions[Math.floor(Math.random() * sampleDescriptions.length)];

        StorageService.addEvent({
          timestamp: new Date().toLocaleTimeString(),
          poolName: 'Telemetry Engine',
          type: randomDesc.includes('recycled') ? 'recycle' : randomDesc.includes('admitted') ? 'provision' : 'system',
          units: Math.floor(10 + Math.random() * 50),
          description: randomDesc
        });
        setEvents(StorageService.getEvents());
      }
    }, 2800);

    return () => clearInterval(interval);
  }, [isAutoTicking, maxCapacity]);

  const handleManualRecycle = () => {
    const recycledUnits = 32;
    setInventoryRemaining((prev) => prev + recycledUnits);
    StorageService.addEvent({
      timestamp: new Date().toLocaleTimeString(),
      poolName: 'Operator Console',
      type: 'recycle',
      units: recycledUnits,
      description: `Manual operator trigger: ${recycledUnits} inactive units returned to active pool reserve`
    });
    setEvents(StorageService.getEvents());
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8 animate-in fade-in duration-300">
      {/* Control Room Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
            <span>OPERATIONAL TELEMETRY STREAM</span>
          </div>
          <h1 className="text-3xl font-black text-[#0B2545]">Live System Operations Monitor</h1>
          <p className="text-sm text-slate-600 font-sans">
            Real-time infrastructure control room monitoring safe admission gates, active pools, and dynamic recycling.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAutoTicking(!isAutoTicking)}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-700 hover:bg-slate-50 font-semibold flex items-center gap-1.5 shadow-xs"
          >
            <Radio className={`w-3.5 h-3.5 ${isAutoTicking ? 'text-emerald-600 animate-pulse' : 'text-slate-400'}`} />
            <span>{isAutoTicking ? 'Telemetry Live' : 'Telemetry Paused'}</span>
          </button>
          <button
            onClick={handleManualRecycle}
            className="px-4 py-2 rounded-xl bg-[#EA580C] hover:bg-[#D94E06] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-transform active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Trigger Recycle Event</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Grid (Section 19) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Status */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 space-y-2 shadow-xs">
          <div className="text-[11px] text-slate-500 uppercase font-semibold flex items-center justify-between">
            <span>System Status</span>
            <Server className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-black text-emerald-700 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
            <span>OPERATIONAL</span>
          </div>
          <div className="text-[10px] text-slate-500 font-sans">All admission gates stable</div>
        </div>

        {/* Current Load */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 space-y-2 shadow-xs">
          <div className="text-[11px] text-slate-500 uppercase font-semibold flex items-center justify-between">
            <span>Current Load</span>
            <Cpu className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="text-xl font-bold text-[#0B2545] font-mono">
            {systemLoad.toLocaleString()} <span className="text-xs text-slate-500 font-normal">/ {maxCapacity}</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full transition-all"
              style={{ width: `${(systemLoad / maxCapacity) * 100}%` }}
            />
          </div>
        </div>

        {/* Waiting Users */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 space-y-2 shadow-xs">
          <div className="text-[11px] text-slate-500 uppercase font-semibold flex items-center justify-between">
            <span>Waiting Queue</span>
            <Clock className="w-3.5 h-3.5 text-[#EA580C]" />
          </div>
          <div className="text-xl font-bold text-[#EA580C] font-mono">{waitingUsers.toLocaleString()}</div>
          <div className="text-[10px] text-slate-500 font-sans">Scheduled in upcoming pools</div>
        </div>

        {/* Active Pools */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 space-y-2 shadow-xs">
          <div className="text-[11px] text-slate-500 uppercase font-semibold flex items-center justify-between">
            <span>Active Pools</span>
            <Layers className="w-3.5 h-3.5 text-[#0B2545]" />
          </div>
          <div className="text-xl font-bold text-[#0B2545] font-mono">{activePools} Concurrent</div>
          <div className="text-[10px] text-slate-500 font-sans">Window duration: 3 mins</div>
        </div>

        {/* Inventory Remaining */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 space-y-2 shadow-xs">
          <div className="text-[11px] text-slate-500 uppercase font-semibold flex items-center justify-between">
            <span>Inventory Left</span>
            <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-emerald-700 font-mono">{inventoryRemaining} Units</div>
          <div className="text-[10px] text-slate-500 font-sans">Dynamic recycling active</div>
        </div>
      </div>

      {/* Secondary KPI Strip (Bookings, Fairness, Utilization) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 flex items-center justify-between shadow-xs">
          <div>
            <div className="text-[11px] text-slate-500 font-medium">Successful Bookings</div>
            <div className="text-lg font-bold text-emerald-700 font-mono">{successfulBookings}</div>
          </div>
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 flex items-center justify-between shadow-xs">
          <div>
            <div className="text-[11px] text-slate-500 font-medium">Failed / Expired Bookings</div>
            <div className="text-lg font-bold text-slate-600 font-mono">{failedBookings}</div>
          </div>
          <AlertCircle className="w-5 h-5 text-slate-400" />
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 flex items-center justify-between shadow-xs">
          <div>
            <div className="text-[11px] text-slate-500 font-medium">Jain Fairness Index</div>
            <div className="text-lg font-bold text-[#0B2545] font-mono">{fairnessIndex}</div>
          </div>
          <Sparkles className="w-5 h-5 text-[#EA580C]" />
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 flex items-center justify-between shadow-xs">
          <div>
            <div className="text-[11px] text-slate-500 font-medium">Inventory Utilization</div>
            <div className="text-lg font-bold text-blue-700 font-mono">{utilizationRate}%</div>
          </div>
          <RefreshCw className="w-5 h-5 text-blue-600" />
        </div>
      </div>

      {/* Live Event Stream (Section 19) */}
      <div className="p-6 rounded-xl bg-white border border-slate-200 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-[#EA580C] animate-pulse" />
            <h2 className="text-sm font-bold text-[#0B2545] uppercase tracking-wider">Live System Event Stream</h2>
          </div>
          <span className="text-xs text-slate-500 font-mono">Stream status: Active</span>
        </div>

        <div className="space-y-2 max-h-80 overflow-y-auto pr-2 font-mono text-xs">
          {events.map((evt) => (
            <div
              key={evt.id}
              className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <span className="text-slate-500 text-[11px] font-semibold">[{evt.timestamp}]</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${
                    evt.type === 'recycle'
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : evt.type === 'booking'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : evt.type === 'provision'
                      ? 'bg-blue-50 text-blue-800 border-blue-200'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {evt.type}
                </span>
                <span className="text-slate-800 font-sans">{evt.description}</span>
              </div>
              <span className="text-[11px] text-slate-600 shrink-0 font-bold">±{evt.units}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
