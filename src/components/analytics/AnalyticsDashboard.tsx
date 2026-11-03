import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  ShieldCheck,
  RefreshCw,
  Clock,
  Layers,
  Info,
  Filter,
  ArrowRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import { runSimulation } from '../../services/simulationEngine';
import { SimulationConfig } from '../../types';

export const AnalyticsDashboard: React.FC = () => {
  const [modelFilter, setModelFilter] = useState<'both' | 'baseline' | 'fairflow'>('both');

  // Generate reference benchmark simulation for analytics
  const [analyticsData] = useState(() => {
    const config: SimulationConfig = {
      applicants: 100000,
      inventory: 1000,
      systemCapacity: 5000,
      numberOfPools: 10,
      riskyTrafficPercent: 10,
      bookingBehavior: 'burst',
      allocationMethod: 'dynamic_recycling',
      randomSeed: 42,
      simulationDurationSeconds: 180,
      userFailureRatePercent: 6
    };
    return runSimulation(config);
  });

  const { baseline, fairflow, timeline, poolResults } = analyticsData;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8 animate-in fade-in duration-300">
      {/* Title & Filter bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-[#EA580C] text-xs font-bold mb-2">
            <BarChart3 className="w-3.5 h-3.5 text-[#EA580C]" />
            <span>Empirical Fairness & Load Analytics</span>
          </div>
          <h1 className="text-3xl font-black text-[#0B2545]">Fairness & Performance Analytics</h1>
          <p className="text-sm text-slate-600 font-sans">
            Rigorous mathematical evaluation comparing unconstrained concurrency against controlled pool allocation.
          </p>
        </div>

        {/* Filter Toggle */}
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-slate-200 shadow-xs self-start md:self-auto">
          <span className="text-xs text-slate-500 px-2 font-medium flex items-center gap-1">
            <Filter className="w-3 h-3" />
            <span>Overlay:</span>
          </span>
          <button
            onClick={() => setModelFilter('both')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              modelFilter === 'both' ? 'bg-[#0B2545] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Both Models
          </button>
          <button
            onClick={() => setModelFilter('baseline')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              modelFilter === 'baseline' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Baseline Only
          </button>
          <button
            onClick={() => setModelFilter('fairflow')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              modelFilter === 'fairflow' ? 'bg-emerald-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            FairFlow Only
          </button>
        </div>
      </div>

      {/* Jain's Fairness Mathematics Card (Section 17) */}
      <div className="p-6 sm:p-8 rounded-xl bg-white border border-slate-200 space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <div className="text-xs font-bold uppercase tracking-widest text-[#EA580C]">Section 17 Implementation</div>
            <h2 className="text-xl font-black text-[#0B2545]">Jain's Fairness Index & Variance Analysis</h2>
            <p className="text-xs text-slate-600 max-w-2xl font-sans">
              Measures whether booking opportunities are equally distributed across pools or monopolized by early burst
              arrivals.
            </p>
          </div>

          <div className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-right">
            <div className="text-[10px] text-slate-500 uppercase font-semibold">Jain Fairness Index (J)</div>
            <div className="text-3xl font-black font-mono text-emerald-700">{fairflow.jainFairnessIndex}</div>
            <div className="text-[10px] text-slate-500">Range: 0 (Unequal) → 1 (Equal)</div>
          </div>
        </div>

        {/* Interpretation Note */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="text-slate-500">Average Pool Probability</div>
            <div className="text-lg font-bold text-[#0B2545] font-mono">{fairflow.avgPoolSuccessProb}</div>
            <div className="text-[10px] text-slate-500">Mean success rate per pool</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="text-slate-500">Min Pool Probability</div>
            <div className="text-lg font-bold text-[#EA580C] font-mono">{fairflow.minPoolSuccessProb}</div>
            <div className="text-[10px] text-slate-500">Floor opportunity guarantee</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="text-slate-500">Max Pool Probability</div>
            <div className="text-lg font-bold text-blue-700 font-mono">{fairflow.maxPoolSuccessProb}</div>
            <div className="text-[10px] text-slate-500">Peak pool capture</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="text-slate-500">Inter-Pool Variance (σ²)</div>
            <div className="text-lg font-bold text-emerald-700 font-mono">{fairflow.fairnessVariance}</div>
            <div className="text-[10px] text-slate-500">Near-zero skew</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-orange-50 border border-orange-200 text-xs text-slate-700 flex items-start gap-3">
          <Info className="w-4 h-4 text-[#EA580C] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold text-[#0B2545]">Methodological Safeguard:</div>
            <p className="text-slate-600 leading-relaxed text-[11px] font-sans">
              "Do not call J = 1 automatically good." A system allocating zero inventory to all applicants achieves a
              perfect J = 1.0! True evaluation requires measuring Jain's Index jointly with Inventory Utilization (
              {fairflow.inventoryUtilizationRate}%) and Overall Booking Success.
            </p>
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid (Section 18) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Concurrent Users vs Time */}
        <div className="p-6 rounded-xl bg-white border border-slate-200 space-y-4 shadow-xs">
          <div>
            <h3 className="text-sm font-bold text-[#0B2545]">1. Concurrent Users vs Time</h3>
            <p className="text-xs text-slate-500">Safe Capacity Threshold = 5,000 Concurrent Connections</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="timeFormatted" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', color: '#0f172a', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                {(modelFilter === 'both' || modelFilter === 'baseline') && (
                  <Line
                    type="monotone"
                    name="Baseline Load (Crash Zone)"
                    dataKey="baselineActiveSessions"
                    stroke="#e11d48"
                    strokeWidth={2}
                    dot={false}
                  />
                )}
                {(modelFilter === 'both' || modelFilter === 'fairflow') && (
                  <Line
                    type="monotone"
                    name="FairFlow Load (Bounded)"
                    dataKey="fairflowActiveSessions"
                    stroke="#047857"
                    strokeWidth={2}
                    dot={false}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Inventory Remaining vs Time */}
        <div className="p-6 rounded-xl bg-white border border-slate-200 space-y-4 shadow-xs">
          <div>
            <h3 className="text-sm font-bold text-[#0B2545]">2. Inventory Remaining vs Time</h3>
            <p className="text-xs text-slate-500">Smooth pool exhaustion vs instant cliff depletion</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="timeFormatted" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', color: '#0f172a', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                {(modelFilter === 'both' || modelFilter === 'baseline') && (
                  <Line
                    type="monotone"
                    name="Baseline Inventory"
                    dataKey="baselineInventoryRemaining"
                    stroke="#f43f5e"
                    strokeWidth={2}
                    dot={false}
                  />
                )}
                {(modelFilter === 'both' || modelFilter === 'fairflow') && (
                  <Line
                    type="monotone"
                    name="FairFlow Inventory"
                    dataKey="fairflowInventoryRemaining"
                    stroke="#0284c7"
                    strokeWidth={2}
                    dot={false}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Successful Bookings vs Time */}
        <div className="p-6 rounded-xl bg-white border border-slate-200 space-y-4 shadow-xs">
          <div>
            <h3 className="text-sm font-bold text-[#0B2545]">3. Cumulative Successful Bookings</h3>
            <p className="text-xs text-slate-500">Total verified transactions committed to database</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="timeFormatted" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', color: '#0f172a', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                {(modelFilter === 'both' || modelFilter === 'baseline') && (
                  <Area
                    type="monotone"
                    name="Baseline Confirmed"
                    dataKey="baselineCompletedBookings"
                    stroke="#e11d48"
                    fill="#e11d48"
                    fillOpacity={0.15}
                  />
                )}
                {(modelFilter === 'both' || modelFilter === 'fairflow') && (
                  <Area
                    type="monotone"
                    name="FairFlow Confirmed"
                    dataKey="fairflowCompletedBookings"
                    stroke="#047857"
                    fill="#047857"
                    fillOpacity={0.15}
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Waiting Users vs Admission Rate */}
        <div className="p-6 rounded-xl bg-white border border-slate-200 space-y-4 shadow-xs">
          <div>
            <h3 className="text-sm font-bold text-[#0B2545]">4. Waiting Queue Depletion vs Admission Rate</h3>
            <p className="text-xs text-slate-500">Managed drain through safe admission controller</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="timeFormatted" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', color: '#0f172a', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line
                  type="monotone"
                  name="FairFlow Waiting Queue"
                  dataKey="fairflowWaiting"
                  stroke="#ea580c"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  name="Active Admission"
                  dataKey="fairflowActiveSessions"
                  stroke="#0284c7"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
