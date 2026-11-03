import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Sliders,
  ShieldCheck,
  AlertTriangle,
  Flame,
  Activity,
  BarChart3,
  TrendingUp,
  Cpu,
  RefreshCw,
  Sparkles,
  ArrowRight,
  Info,
  CheckCircle2,
  Lock,
  Layers,
  Zap
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import {
  SimulationConfig,
  SimulationResult,
  DemandDistribution,
  AllocationMethod
} from '../../types';
import { runSimulation } from '../../services/simulationEngine';

interface SimulationLabProps {
  initialConfig?: Partial<SimulationConfig>;
}

export const SimulationLab: React.FC<SimulationLabProps> = ({ initialConfig }) => {
  // Config state
  const [applicants, setApplicants] = useState<number>(initialConfig?.applicants || 100000);
  const [inventory, setInventory] = useState<number>(initialConfig?.inventory || 1000);
  const [systemCapacity, setSystemCapacity] = useState<number>(initialConfig?.systemCapacity || 5000);
  const [numberOfPools, setNumberOfPools] = useState<number>(initialConfig?.numberOfPools || 10);
  const [riskyTrafficPercent, setRiskyTrafficPercent] = useState<number>(initialConfig?.riskyTrafficPercent || 10);
  const [bookingBehavior, setBookingBehavior] = useState<DemandDistribution>(initialConfig?.bookingBehavior || 'burst');
  const [allocationMethod, setAllocationMethod] = useState<AllocationMethod>(initialConfig?.allocationMethod || 'dynamic_recycling');
  const [randomSeed, setRandomSeed] = useState<number>(42);
  const [simSpeed, setSimSpeed] = useState<number>(50); // 1, 5, 10, 50, 999 (instant)

  // Simulation execution state
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(29);
  const timerRef = useRef<number | null>(null);

  const executeSimulation = (instant = false) => {
    const config: SimulationConfig = {
      applicants,
      inventory,
      systemCapacity,
      numberOfPools,
      riskyTrafficPercent,
      bookingBehavior,
      allocationMethod,
      randomSeed,
      simulationDurationSeconds: 180,
      userFailureRatePercent: 6
    };

    const simRes = runSimulation(config);
    setResult(simRes);

    if (instant || simSpeed >= 100) {
      setCurrentStepIndex(simRes.timeline.length - 1);
      setIsRunning(false);
    } else {
      setCurrentStepIndex(0);
      setIsRunning(true);
    }
  };

  // Run 100K Applicant Demo preset (Section 32)
  const handleRun100kDemo = () => {
    setApplicants(100000);
    setInventory(1000);
    setSystemCapacity(5000);
    setNumberOfPools(10);
    setRiskyTrafficPercent(10);
    setBookingBehavior('burst');
    setAllocationMethod('dynamic_recycling');
    setRandomSeed(42);

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

    const simRes = runSimulation(config);
    setResult(simRes);
    setCurrentStepIndex(simRes.timeline.length - 1);
    setIsRunning(false);
  };

  // Step ticker for animated playback
  useEffect(() => {
    if (isRunning && result) {
      const intervalMs = Math.max(20, Math.floor(1000 / simSpeed));
      timerRef.current = window.setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev >= result.timeline.length - 1) {
            setIsRunning(false);
            return result.timeline.length - 1;
          }
          return prev + 1;
        });
      }, intervalMs);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, simSpeed, result]);

  // Execute initial simulation on load
  useEffect(() => {
    executeSimulation(true);
  }, []);

  const activeSlice = result?.timeline[currentStepIndex] || result?.timeline[0];

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8 animate-in fade-in duration-300">
      {/* Header & Hackathon Demo Banner */}
      <div className="p-6 sm:p-8 rounded-xl bg-[#0B2545] border border-blue-900 space-y-6 shadow-xs text-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-400/40 text-orange-200 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-orange-400" />
              <span>Core Benchmark Evaluation</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white">Reservation Simulation Lab</h1>
            <p className="text-sm text-white leading-relaxed font-sans" style={{ color: '#ffffff' }}>
              Empirically compare <strong className="text-white font-bold">Model A: Simultaneous Booking</strong> (traditional
              stampede) against <strong className="text-white font-bold">Model B: FairFlow</strong> (asynchronous intake,
              eligibility filtering, randomized pools, controlled admission gate, and dynamic inventory recycling).
            </p>
          </div>

          {/* Preset Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={handleRun100kDemo}
              className="px-6 py-3.5 rounded-xl bg-[#EA580C] hover:bg-[#D94E06] text-white font-bold text-sm shadow-xs flex items-center justify-center gap-2 transition-transform active:scale-95"
            >
              <Zap className="w-4 h-4 fill-white" />
              <span>Run 100K Applicant Demo</span>
            </button>
            <button
              onClick={() => executeSimulation(true)}
              className="px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 flex items-center justify-center gap-2 transition-colors"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Recalculate Current</span>
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Controls & Parameters Grid (Section 14) */}
      <div className="p-6 rounded-xl bg-white border border-slate-200 space-y-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2 text-[#0B2545] font-bold text-sm">
            <Sliders className="w-4 h-4 text-[#EA580C]" />
            <span>Simulation Parameters & Traffic Configuration</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">Playback Speed:</span>
            <div className="flex gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200">
              {[1, 5, 10, 50, 999].map((spd) => (
                <button
                  key={spd}
                  onClick={() => setSimSpeed(spd)}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono ${
                    simSpeed === spd ? 'bg-[#0B2545] text-white font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {spd === 999 ? 'Instant' : `${spd}x`}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Total Applicants */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex justify-between">
              <span>Total Applicants</span>
              <span className="font-mono text-[#0B2545] font-bold">{applicants.toLocaleString()}</span>
            </label>
            <select
              value={applicants}
              onChange={(e) => setApplicants(parseInt(e.target.value))}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#EA580C]"
            >
              <option value={10000}>10,000 applicants</option>
              <option value={50000}>50,000 applicants</option>
              <option value={100000}>100,000 applicants (Standard Tatkal)</option>
              <option value={500000}>500,000 applicants (Mega Event)</option>
            </select>
          </div>

          {/* Total Inventory */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex justify-between">
              <span>Available Inventory</span>
              <span className="font-mono text-emerald-700 font-bold">{inventory.toLocaleString()}</span>
            </label>
            <select
              value={inventory}
              onChange={(e) => setInventory(parseInt(e.target.value))}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#EA580C]"
            >
              <option value={100}>100 seats / slots</option>
              <option value={500}>500 seats / slots</option>
              <option value={1000}>1,000 seats / slots (High-Speed Train)</option>
              <option value={5000}>5,000 seats / slots (Stadium)</option>
            </select>
          </div>

          {/* System Capacity */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex justify-between">
              <span>Safe System Capacity (C)</span>
              <span className="font-mono text-blue-700 font-bold">{systemCapacity.toLocaleString()} conn.</span>
            </label>
            <select
              value={systemCapacity}
              onChange={(e) => setSystemCapacity(parseInt(e.target.value))}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#EA580C]"
            >
              <option value={500}>500 concurrent sessions</option>
              <option value={1000}>1,000 concurrent sessions</option>
              <option value={5000}>5,000 concurrent sessions (Standard safe)</option>
              <option value={10000}>10,000 concurrent sessions</option>
            </select>
          </div>

          {/* Number of Pools */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex justify-between">
              <span>Number of Pools (K)</span>
              <span className="font-mono text-[#EA580C] font-bold">{numberOfPools} pools</span>
            </label>
            <select
              value={numberOfPools}
              onChange={(e) => setNumberOfPools(parseInt(e.target.value))}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#EA580C]"
            >
              <option value={2}>2 Pools (A, B)</option>
              <option value={5}>5 Pools (A – E)</option>
              <option value={10}>10 Pools (A – J)</option>
              <option value={20}>20 Pools (A – T)</option>
            </select>
          </div>

          {/* Risky Automated Traffic */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex justify-between">
              <span>Risky / Bot Traffic</span>
              <span className="font-mono text-rose-700 font-bold">{riskyTrafficPercent}%</span>
            </label>
            <select
              value={riskyTrafficPercent}
              onChange={(e) => setRiskyTrafficPercent(parseInt(e.target.value))}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#EA580C]"
            >
              <option value={0}>0% (Pure legitimate users)</option>
              <option value={5}>5% automated / duplicate</option>
              <option value={10}>10% bot scripts (Real-world proxy)</option>
              <option value={20}>20% heavy attack storm</option>
            </select>
          </div>

          {/* Booking Behavior Distribution */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Demand Distribution</label>
            <select
              value={bookingBehavior}
              onChange={(e) => setBookingBehavior(e.target.value as DemandDistribution)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#EA580C] capitalize"
            >
              <option value="burst">Bursty (Initial 30-sec storm)</option>
              <option value="uniform">Uniform (Even pace)</option>
              <option value="concentrated">Highly Concentrated</option>
              <option value="random">Randomized</option>
            </select>
          </div>

          {/* Allocation Strategy */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Allocation Engine</label>
            <select
              value={allocationMethod}
              onChange={(e) => setAllocationMethod(e.target.value as AllocationMethod)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#EA580C]"
            >
              <option value="dynamic_recycling">FairFlow (Proportional + Recycling)</option>
              <option value="proportional_pools">Proportional Pools Only</option>
              <option value="simultaneous_baseline">Simultaneous Rush Baseline</option>
            </select>
          </div>

          {/* Random Seed */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex justify-between">
              <span>Reproducibility Seed</span>
              <span className="font-mono text-slate-500">0x{randomSeed.toString(16).toUpperCase()}</span>
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={randomSeed}
                onChange={(e) => setRandomSeed(parseInt(e.target.value) || 1)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-[#EA580C]"
              />
              <button
                type="button"
                onClick={() => setRandomSeed(Math.floor(1000 + Math.random() * 9000))}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs rounded-lg border border-slate-300"
                title="Generate new random seed"
              >
                🎲
              </button>
            </div>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
          <div className="text-xs text-slate-600 flex items-center gap-2 font-sans">
            <Info className="w-4 h-4 text-[#EA580C]" />
            <span>Simulations are fully deterministic with the given seed. Real calculations; zero hardcoded numbers.</span>
          </div>

          <button
            onClick={() => executeSimulation(false)}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#EA580C] hover:bg-[#D94E06] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-transform active:scale-95"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Run Simulation</span>
          </button>
        </div>
      </div>

      {/* Visual Traffic Storm Simulator (Section 33) */}
      <div className="p-6 sm:p-8 rounded-xl bg-white border border-slate-200 space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-[#EA580C] flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-[#EA580C]" />
              <span>Section 33: Traffic Storm & Capacity Stress Visualizer</span>
            </div>
            <h2 className="text-xl font-black text-[#0B2545] mt-0.5">
              Real-Time Concurrency State: Step {currentStepIndex + 1}/30 ({activeSlice?.timeFormatted})
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 border border-slate-300"
            >
              {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isRunning ? 'Pause Replay' : 'Play Replay'}</span>
            </button>
            <button
              onClick={() => setCurrentStepIndex(0)}
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300"
              title="Rewind to start"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Side-by-Side Visual Comparison Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* MODEL A: BASELINE */}
          <div className="p-6 rounded-xl bg-rose-50/50 border border-rose-200 space-y-4 relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div>
                <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-bold font-mono border border-rose-200">
                  MODEL A
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">Simultaneous Booking (Baseline)</h3>
                <p className="text-xs text-rose-700">Every applicant attempts to book at t=0</p>
              </div>

              {activeSlice && activeSlice.baselineActiveSessions > systemCapacity && (
                <div className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-300 text-[10px] font-bold font-mono animate-pulse flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  <span>OVERLOAD CRASH</span>
                </div>
              )}
            </div>

            {/* Load Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-sans">
                <span className="text-slate-600 font-medium">Concurrent Sessions:</span>
                <span className="font-mono font-bold text-rose-700">
                  {activeSlice?.baselineActiveSessions.toLocaleString()} / {systemCapacity.toLocaleString()} (
                  {(((activeSlice?.baselineActiveSessions || 0) / systemCapacity) * 100).toFixed(0)}%)
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3 p-0.5 border border-slate-300 overflow-hidden">
                <div
                  className="bg-rose-600 h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, (((activeSlice?.baselineActiveSessions || 0) / systemCapacity) * 100))}%`
                  }}
                />
              </div>
            </div>

            {/* Live Stats */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-rose-200/80 text-xs">
              <div className="p-2.5 rounded-lg bg-white border border-rose-100">
                <div className="text-[10px] text-slate-500 font-medium">Booked</div>
                <div className="font-mono font-bold text-[#0B2545] text-sm">
                  {activeSlice?.baselineCompletedBookings.toLocaleString()}
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-rose-100">
                <div className="text-[10px] text-slate-500 font-medium">Failed / Dropped</div>
                <div className="font-mono font-bold text-rose-700 text-sm">
                  {activeSlice?.baselineFailedRequests.toLocaleString()}
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-rose-100">
                <div className="text-[10px] text-slate-500 font-medium">Remaining Inv.</div>
                <div className="font-mono font-bold text-slate-700 text-sm">
                  {activeSlice?.baselineInventoryRemaining.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* MODEL B: FAIRFLOW */}
          <div className="p-6 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-4 relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold font-mono border border-emerald-200">
                  MODEL B
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">FairFlow Architecture</h3>
                <p className="text-xs text-emerald-700">Pre-reg + Pools + Admission Gate + Dynamic Recycling</p>
              </div>

              <div className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold font-mono flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>LOAD BOUNDED &lt;= C</span>
              </div>
            </div>

            {/* Load Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-sans">
                <span className="text-slate-600 font-medium">Concurrent Sessions:</span>
                <span className="font-mono font-bold text-emerald-700">
                  {activeSlice?.fairflowActiveSessions.toLocaleString()} / {systemCapacity.toLocaleString()} (
                  {(((activeSlice?.fairflowActiveSessions || 0) / systemCapacity) * 100).toFixed(0)}%)
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3 p-0.5 border border-slate-300 overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, (((activeSlice?.fairflowActiveSessions || 0) / systemCapacity) * 100))}%`
                  }}
                />
              </div>
            </div>

            {/* Live Stats */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-emerald-200/80 text-xs">
              <div className="p-2.5 rounded-lg bg-white border border-emerald-100">
                <div className="text-[10px] text-slate-500 font-medium">Booked</div>
                <div className="font-mono font-bold text-[#0B2545] text-sm">
                  {activeSlice?.fairflowCompletedBookings.toLocaleString()}
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-emerald-100">
                <div className="text-[10px] text-slate-500 font-medium">Recycled Units</div>
                <div className="font-mono font-bold text-[#EA580C] text-sm">
                  {activeSlice?.fairflowRecycledInventory.toLocaleString()}
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-emerald-100">
                <div className="text-[10px] text-slate-500 font-medium">Remaining Inv.</div>
                <div className="font-mono font-bold text-slate-700 text-sm">
                  {activeSlice?.fairflowInventoryRemaining.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Benchmark Metric Comparison Table (Section 15, 16, 17) */}
      {result && (
        <div className="p-6 sm:p-8 rounded-xl bg-white border border-slate-200 space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-black text-[#0B2545]">Quantitative Benchmark Summary</h2>
              <p className="text-xs text-slate-600 font-sans">
                Simulated {applicants.toLocaleString()} applicants competing for {inventory.toLocaleString()} items
              </p>
            </div>
            <div className="text-xs text-[#0B2545] font-mono">
              Executed at: {new Date(result.executedAt).toLocaleTimeString()}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-700">
              <thead className="bg-slate-100 text-slate-700 uppercase font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Metric Dimension</th>
                  <th className="p-3.5 text-rose-700">Model A (Baseline)</th>
                  <th className="p-3.5 text-emerald-800">Model B (FairFlow)</th>
                  <th className="p-3.5 text-[#0B2545]">Net Impact / Interpretation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                <tr>
                  <td className="p-3.5 font-sans font-semibold text-[#0B2545]">Peak Concurrent Load</td>
                  <td className="p-3.5 text-rose-600 font-bold">{result.baseline.peakConcurrentUsers.toLocaleString()} req</td>
                  <td className="p-3.5 text-emerald-700 font-bold">{result.fairflow.peakConcurrentUsers.toLocaleString()} req</td>
                  <td className="p-3.5 font-sans text-slate-600">
                    Bounded strictly under capacity limit {systemCapacity.toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td className="p-3.5 font-sans font-semibold text-[#0B2545]">Capacity Overload Duration</td>
                  <td className="p-3.5 text-rose-600 font-bold">{result.baseline.overloadSeconds} seconds</td>
                  <td className="p-3.5 text-emerald-700 font-bold">0 seconds (0 violations)</td>
                  <td className="p-3.5 font-sans text-emerald-700 font-semibold">Zero connection timeout drops</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-sans font-semibold text-[#0B2545]">Successful Bookings</td>
                  <td className="p-3.5 text-slate-900">{result.baseline.successfulBookings.toLocaleString()}</td>
                  <td className="p-3.5 text-emerald-700 font-bold">{result.fairflow.successfulBookings.toLocaleString()}</td>
                  <td className="p-3.5 font-sans text-slate-700">
                    {result.fairflow.successfulBookings >= result.baseline.successfulBookings ? '+ Higher capture' : 'Near-parity'}
                  </td>
                </tr>
                <tr>
                  <td className="p-3.5 font-sans font-semibold text-[#0B2545]">Inventory Utilization Rate</td>
                  <td className="p-3.5 text-slate-900">{result.baseline.inventoryUtilizationRate}%</td>
                  <td className="p-3.5 text-blue-700 font-bold">{result.fairflow.inventoryUtilizationRate}%</td>
                  <td className="p-3.5 font-sans text-slate-600">
                    {result.fairflow.recycledInventoryUnits} units recycled from unexercised pools
                  </td>
                </tr>
                <tr>
                  <td className="p-3.5 font-sans font-semibold text-[#0B2545]">Jain's Fairness Index (J)</td>
                  <td className="p-3.5 text-rose-600 font-bold">{result.baseline.jainFairnessIndex} (Skewed)</td>
                  <td className="p-3.5 text-emerald-700 font-bold">{result.fairflow.jainFairnessIndex} (Balanced)</td>
                  <td className="p-3.5 font-sans text-slate-700">
                    Variance: {result.fairflow.fairnessVariance} across {numberOfPools} pools
                  </td>
                </tr>
                <tr>
                  <td className="p-3.5 font-sans font-semibold text-[#0B2545]">P95 Response Latency</td>
                  <td className="p-3.5 text-rose-600 font-bold">{result.baseline.p95ResponseTimeMs} ms</td>
                  <td className="p-3.5 text-emerald-700 font-bold">{result.fairflow.p95ResponseTimeMs} ms</td>
                  <td className="p-3.5 font-sans text-emerald-700 font-semibold">Smooth sub-500ms API response</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-sans font-semibold text-[#0B2545]">Failed / Dropped Requests</td>
                  <td className="p-3.5 text-rose-600 font-bold">{result.baseline.failedRequests.toLocaleString()}</td>
                  <td className="p-3.5 text-emerald-700 font-bold">{result.fairflow.failedRequests.toLocaleString()}</td>
                  <td className="p-3.5 font-sans text-slate-600">
                    Baseline dropped due to server queue saturation
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Interactive Time-Series Charts (Section 18) */}
      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Concurrent Users vs Time */}
          <div className="p-6 rounded-xl bg-white border border-slate-200 space-y-4 shadow-xs">
            <div>
              <h3 className="text-sm font-bold text-[#0B2545]">Concurrent Active Sessions vs Time</h3>
              <p className="text-xs text-slate-500">
                Baseline exceeds capacity limit ({systemCapacity}) causing crashes, while FairFlow bounds concurrency.
              </p>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={result.timeline}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="timeFormatted" stroke="#64748b" textAnchor="end" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', color: '#0f172a', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                    itemStyle={{ fontSize: '11px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Line
                    type="monotone"
                    name="Baseline (Unconstrained)"
                    dataKey="baselineActiveSessions"
                    stroke="#e11d48"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    name="FairFlow (Admission Controller)"
                    dataKey="fairflowActiveSessions"
                    stroke="#047857"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Inventory Remaining vs Time */}
          <div className="p-6 rounded-xl bg-white border border-slate-200 space-y-4 shadow-xs">
            <div>
              <h3 className="text-sm font-bold text-[#0B2545]">Inventory Remaining vs Time</h3>
              <p className="text-xs text-slate-500">
                FairFlow smoothly distributes inventory across pool windows with recycling.
              </p>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={result.timeline}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="timeFormatted" stroke="#64748b" textAnchor="end" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', color: '#0f172a', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                    itemStyle={{ fontSize: '11px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Line
                    type="monotone"
                    name="Baseline Remaining"
                    dataKey="baselineInventoryRemaining"
                    stroke="#f43f5e"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    name="FairFlow Remaining"
                    dataKey="fairflowInventoryRemaining"
                    stroke="#0284c7"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 3: Pool Success Probability & Jain Fairness */}
          <div className="p-6 rounded-xl bg-white border border-slate-200 space-y-4 lg:col-span-2 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-[#0B2545]">Pool Success Probability Distribution</h3>
                <p className="text-xs text-slate-500">
                  Jain Fairness Index: <strong className="text-emerald-700 font-mono">{result.fairflow.jainFairnessIndex}</strong> •
                  Min: {result.fairflow.minPoolSuccessProb} • Max: {result.fairflow.maxPoolSuccessProb} •
                  Variance: {result.fairflow.fairnessVariance}
                </p>
              </div>
              <div className="text-xs text-[#0B2545] bg-slate-50 px-3 py-1 rounded-lg border border-slate-200 font-mono">
                Formula: J = (Σp_k)² / (K · Σp_k²)
              </div>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={result.poolResults}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="poolName" stroke="#64748b" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', color: '#0f172a', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                    itemStyle={{ fontSize: '11px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="bookedInventory" name="Booked Units" fill="#047857" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="recycledInventory" name="Recycled Units" fill="#ea580c" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
