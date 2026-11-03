import React, { useState, useEffect } from 'react';
import {
  Layers,
  Clock,
  RefreshCw,
  Users,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  TrendingUp,
  Cpu,
  Sparkles,
  Zap
} from 'lucide-react';
import { StorageService } from '../../services/storage';
import { ScenarioType } from '../../types';
import { RESERVATION_SCENARIOS } from '../../data/scenarios';

interface PoolsDashboardProps {
  activeScenario: ScenarioType;
  onProceedToBooking: (appId: string) => void;
  onViewApplication: (appId: string) => void;
}

export const PoolsDashboard: React.FC<PoolsDashboardProps> = ({
  activeScenario,
  onProceedToBooking,
  onViewApplication
}) => {
  const scenario = RESERVATION_SCENARIOS.find((s) => s.id === activeScenario) || RESERVATION_SCENARIOS[0];

  // Pools state
  const [activePoolIndex, setActivePoolIndex] = useState(1); // 0 = Pool A completed, 1 = Pool B active, etc.
  const [systemCapacity] = useState(5000);
  const [currentActiveSessions, setCurrentActiveSessions] = useState(3420);
  const [events, setEvents] = useState(() => StorageService.getEvents());

  useEffect(() => {
    const handleEventsUpdated = () => {
      setEvents(StorageService.getEvents());
    };
    window.addEventListener('fairflow_events_updated', handleEventsUpdated);
    return () => window.removeEventListener('fairflow_events_updated', handleEventsUpdated);
  }, []);

  // Pools definition
  const initialPools = [
    {
      id: 'pool-A',
      name: 'Pool Alpha',
      applicants: 10000,
      eligible: 9420,
      window: '10:00 – 10:03',
      status: 'completed' as const,
      provisionalInventory: 120,
      booked: 86,
      recycled: 34,
      activeUsers: 0
    },
    {
      id: 'pool-B',
      name: 'Pool Beta',
      applicants: 10000,
      eligible: 9380,
      window: '10:03 – 10:06',
      status: 'active' as const,
      provisionalInventory: 140, // includes 34 recycled from Pool A
      booked: 78,
      recycled: 0,
      activeUsers: 3420
    },
    {
      id: 'pool-C',
      name: 'Pool Gamma',
      applicants: 10000,
      eligible: 9410,
      window: '10:06 – 10:09',
      status: 'upcoming' as const,
      provisionalInventory: 110,
      booked: 0,
      recycled: 0,
      activeUsers: 0
    },
    {
      id: 'pool-D',
      name: 'Pool Delta',
      applicants: 10000,
      eligible: 9350,
      window: '10:09 – 10:12',
      status: 'upcoming' as const,
      provisionalInventory: 110,
      booked: 0,
      recycled: 0,
      activeUsers: 0
    },
    {
      id: 'pool-E',
      name: 'Pool Epsilon',
      applicants: 10000,
      eligible: 9450,
      window: '10:12 – 10:15',
      status: 'upcoming' as const,
      provisionalInventory: 110,
      booked: 0,
      recycled: 0,
      activeUsers: 0
    }
  ];

  const [pools, setPools] = useState(initialPools);

  // Controlled admission formula:
  // A_t = min(W_t, C - L_t)
  const waitingUsers = pools.slice(activePoolIndex).reduce((sum, p) => sum + p.eligible, 0) - currentActiveSessions;
  const availableCapacity = Math.max(0, systemCapacity - currentActiveSessions);
  const admittedThisInterval = Math.min(waitingUsers, availableCapacity);

  const handleAdvancePool = () => {
    if (activePoolIndex >= pools.length - 1) return;

    const nextIndex = activePoolIndex + 1;
    const currentPool = pools[activePoolIndex];
    const unused = Math.max(0, currentPool.provisionalInventory - currentPool.booked);

    const updatedPools = pools.map((p, idx) => {
      if (idx === activePoolIndex) {
        return {
          ...p,
          status: 'completed' as const,
          recycled: unused,
          activeUsers: 0
        };
      }
      if (idx === nextIndex) {
        return {
          ...p,
          status: 'active' as const,
          provisionalInventory: p.provisionalInventory + unused, // Dynamic recycling!
          activeUsers: 3600
        };
      }
      return p;
    });

    setPools(updatedPools);
    setActivePoolIndex(nextIndex);
    setCurrentActiveSessions(3600);

    // Add recycling event to persistent store
    StorageService.addEvent({
      timestamp: new Date().toLocaleTimeString(),
      poolName: currentPool.name,
      type: 'recycle',
      units: unused,
      description: `${unused} unused ${scenario.inventoryTerm} recycled from ${currentPool.name} to ${pools[nextIndex].name}`
    });
  };

  const applications = StorageService.getApplications();
  const myActiveApp = applications.find((a) => a.status === 'window_active' || a.status === 'pool_assigned');

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8 animate-in fade-in duration-300">
      {/* Title & Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-[#EA580C] text-xs font-bold mb-2">
            <Layers className="w-3.5 h-3.5 text-[#EA580C]" />
            <span>Pool Dashboard & Admission Gate</span>
          </div>
          <h1 className="text-3xl font-black text-[#0B2545]">Booking Pools & Waiting Room</h1>
          <p className="text-sm text-slate-600 font-sans">
            Eligible applicants are partitioned into randomized pools with staggered booking windows to enforce safe system load.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleAdvancePool}
            disabled={activePoolIndex >= pools.length - 1}
            className="px-4 py-2.5 rounded-xl bg-[#EA580C] hover:bg-[#D94E06] disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-transform active:scale-95"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Advance Active Pool Window & Recycle</span>
          </button>
        </div>
      </div>

      {/* Controlled Admission System Monitor (Section 10) */}
      <div className="p-6 rounded-xl bg-white border border-slate-200 space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-[#EA580C]">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#EA580C]">Section 10 Implementation</div>
              <h2 className="text-lg font-bold text-[#0B2545]">Controlled Admission Controller</h2>
            </div>
          </div>

          {/* Formula pill */}
          <div className="px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs text-[#0B2545]">
            Admission Formula: <span className="font-bold text-[#EA580C]">A_t = min(W_t, C - L_t)</span>
          </div>
        </div>

        {/* Visual Capacity Meter */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-slate-600 font-medium">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#EA580C] animate-pulse" />
              Current Active Sessions (L_t): <strong className="text-[#0B2545] font-mono text-sm">{currentActiveSessions.toLocaleString()}</strong>
            </span>
            <span className="text-slate-500">
              Safe Capacity (C): <strong className="text-[#0B2545] font-mono text-sm">{systemCapacity.toLocaleString()}</strong>
            </span>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-3.5 p-0.5 border border-slate-200 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                currentActiveSessions / systemCapacity > 0.9 ? 'bg-red-500' : 'bg-gradient-to-r from-blue-700 to-[#EA580C]'
              }`}
              style={{ width: `${Math.min(100, (currentActiveSessions / systemCapacity) * 100)}%` }}
            />
          </div>

          <div className="flex justify-between text-[11px] text-slate-500 pt-0.5 font-sans">
            <span>0 Concurrent</span>
            <span className="text-emerald-700 font-bold">Safe Limit Enforced (Zero Server Drops)</span>
            <span>Max 5,000 Concurrent</span>
          </div>
        </div>

        {/* Admission Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 border-t border-slate-100">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-[11px] text-slate-500 font-medium">Waiting Users (W_t)</div>
            <div className="text-lg font-bold text-[#0B2545] font-mono">{waitingUsers.toLocaleString()}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-[11px] text-slate-500 font-medium">Available Headroom (C - L_t)</div>
            <div className="text-lg font-bold text-blue-700 font-mono">{availableCapacity.toLocaleString()}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-[11px] text-slate-500 font-medium">Admitted This Batch (A_t)</div>
            <div className="text-lg font-bold text-emerald-700 font-mono">{admittedThisInterval.toLocaleString()}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-[11px] text-slate-500 font-medium">Capacity Violation Count</div>
            <div className="text-lg font-bold text-emerald-700 font-mono">0 (Protected)</div>
          </div>
        </div>
      </div>

      {/* User's Own Active Window Banner if exists */}
      {myActiveApp && (
        <div className="p-5 rounded-xl bg-orange-50 border border-orange-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-[#EA580C] shrink-0" />
            <div>
              <div className="text-xs font-bold text-[#EA580C]">Your Active Application Found</div>
              <div className="text-sm font-black text-[#0B2545]">
                {myActiveApp.id} • Assigned to {myActiveApp.allocation?.poolName}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onViewApplication(myActiveApp.id)}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
            >
              Status Timeline
            </button>
            <button
              onClick={() => onProceedToBooking(myActiveApp.id)}
              className="px-4 py-1.5 rounded-lg bg-[#EA580C] text-white text-xs font-bold hover:bg-[#D94E06] flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <span>Go to Booking Room</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Pools Grid (Section 9) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#0B2545]">
            Partitioned Pools & Dynamic Inventory Recycling
          </h2>
          <span className="text-xs text-slate-500 font-sans">
            Total Inventory Provisioned: <strong className="text-[#0B2545] font-mono">1,000 {scenario.inventoryTerm}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pools.map((pool) => {
            const isActive = pool.status === 'active';
            const isCompleted = pool.status === 'completed';

            return (
              <div
                key={pool.id}
                className={`p-6 rounded-xl border transition-all space-y-4 shadow-xs ${
                  isActive
                    ? 'bg-white border-2 border-[#EA580C] ring-1 ring-[#EA580C]/20 shadow-md'
                    : isCompleted
                    ? 'bg-slate-50/70 border-slate-200'
                    : 'bg-white border-slate-200'
                }`}
              >
                {/* Card Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-black text-[#0B2545] flex items-center gap-2">
                      <span>{pool.name}</span>
                      {isActive && (
                        <span className="px-2 py-0.5 rounded-full bg-orange-50 border border-orange-200 text-[#EA580C] text-[10px] font-mono font-bold animate-pulse">
                          LIVE WINDOW
                        </span>
                      )}
                    </h3>
                    <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>Window: {pool.window}</span>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize border ${
                      isActive
                        ? 'bg-orange-50 text-[#EA580C] border-orange-200'
                        : isCompleted
                        ? 'bg-slate-100 text-slate-600 border-slate-200'
                        : 'bg-slate-50 text-slate-500 border-slate-200'
                    }`}
                  >
                    {pool.status}
                  </span>
                </div>

                {/* Demand Stats */}
                <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <div>
                    <div className="text-slate-500">Total Applicants</div>
                    <div className="font-mono font-bold text-[#0B2545] text-sm">{pool.applicants.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-slate-500">Eligible (Pre-screened)</div>
                    <div className="font-mono font-bold text-blue-700 text-sm">{pool.eligible.toLocaleString()}</div>
                  </div>
                </div>

                {/* Inventory Allocation Meter */}
                <div className="space-y-2 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 font-medium">Provisional Inventory:</span>
                    <span className="font-mono font-bold text-[#0B2545] text-sm">
                      {pool.provisionalInventory} {scenario.inventoryTerm}
                    </span>
                  </div>

                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden flex">
                    <div
                      className="bg-emerald-600 h-full"
                      style={{ width: `${(pool.booked / (pool.provisionalInventory || 1)) * 100}%` }}
                      title={`Booked: ${pool.booked}`}
                    />
                    <div
                      className="bg-[#EA580C] h-full"
                      style={{ width: `${(pool.recycled / (pool.provisionalInventory || 1)) * 100}%` }}
                      title={`Recycled: ${pool.recycled}`}
                    />
                  </div>

                  <div className="flex justify-between text-[11px] pt-1">
                    <span className="text-emerald-700 font-bold">Booked: {pool.booked}</span>
                    {pool.recycled > 0 ? (
                      <span className="text-[#EA580C] font-bold flex items-center gap-1">
                        <RefreshCw className="w-2.5 h-2.5" />
                        Recycled: {pool.recycled}
                      </span>
                    ) : (
                      <span className="text-slate-500 font-medium">
                        Remaining: {Math.max(0, pool.provisionalInventory - pool.booked)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer status */}
                <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 font-sans">
                  <span>Active admitted users:</span>
                  <span className="font-mono font-bold text-[#0B2545]">
                    {pool.activeUsers > 0 ? pool.activeUsers.toLocaleString() : '0'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Real-time Event Stream (Section 12) */}
      <div className="p-6 rounded-xl bg-white border border-slate-200 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-[#EA580C]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#0B2545]">
              Dynamic Inventory & Recycling Event Ledger
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">Live Sync</span>
        </div>

        <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
          {events.map((evt) => (
            <div
              key={evt.id}
              className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs gap-3"
            >
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-[11px] text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded">
                  {evt.timestamp}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                    evt.type === 'recycle'
                      ? 'bg-orange-50 text-[#EA580C] border-orange-200'
                      : evt.type === 'booking'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-blue-50 text-blue-800 border border-blue-200'
                  }`}
                >
                  {evt.type}
                </span>
                <span className="text-slate-700 font-sans">{evt.description}</span>
              </div>
              <span className="font-mono text-[#0B2545] text-[11px] shrink-0 font-bold">
                ±{evt.units} {scenario.inventoryTerm}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
