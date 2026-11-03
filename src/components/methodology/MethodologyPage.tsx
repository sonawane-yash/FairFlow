import React from 'react';
import {
  BookOpen,
  Cpu,
  ShieldCheck,
  RefreshCw,
  Zap,
  Sliders,
  AlertTriangle,
  Info,
  CheckCircle2,
  Lock,
  BarChart3,
  FileText
} from 'lucide-react';

export const MethodologyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-12 text-slate-700">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-[#EA580C] text-xs font-bold">
          <BookOpen className="w-3.5 h-3.5 text-[#EA580C]" />
          <span>Research & Engineering Specification</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-[#0B2545] tracking-tight">
          FAIRFLOW System Methodology & Mathematical Model
        </h1>
        <p className="text-base text-slate-600 leading-relaxed font-sans">
          Decoupling Demand Intake from Access: A Controlled, Queue-Partitioned Allocation Architecture for
          High-Demand Scarce Reservations.
        </p>
      </div>

      {/* Abstract Callout */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-xs">
        <h3 className="text-xs font-bold uppercase tracking-widest text-[#0B2545]">Abstract</h3>
        <p className="text-xs text-slate-600 leading-relaxed font-serif italic">
          High-demand reservation systems (such as railway Tatkal booking, stadium tour tickets, and high-demand consular
          appointments) fail primarily due to a synchronized stampede: thousands of users and automated bot scripts hit
          database locking endpoints simultaneously at T = 0. We demonstrate an alternative paradigm that replaces
          instant access with asynchronous pre-registration, eligibility screening, deterministic randomized pool
          partitioning, capacity-bounded admission gating, and dynamic inventory recycling.
        </p>
      </div>

      {/* 1. Problem */}
      <section className="space-y-4">
        <h2 className="text-xl font-black text-[#0B2545] flex items-center gap-2">
          <span className="text-[#EA580C] font-mono">1.</span>
          <span>The Synchronized Stampede Problem</span>
        </h2>
        <p className="text-sm leading-relaxed text-slate-700 font-sans">
          In legacy high-demand reservation systems, 100,000+ applicants compete for 1,000 inventory items at the exact
          same second. This creates two catastrophic failure modes:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm text-slate-600 font-sans">
          <li>
            <strong className="text-[#0B2545]">Infrastructure Cascade Failures:</strong> Database connection pools saturate,
            thread pools exhaust, and server response times jump from 200ms to &gt;10,000ms, causing random connection
            drops and payment gateway timeouts.
          </li>
          <li>
            <strong className="text-[#0B2545]">Unfair Speed Monopolization:</strong> Automated optical form-filling scripts and
            low-latency edge bots consistently beat human users by hundreds of milliseconds, converting scarce public
            inventory into a race rewarded purely by execution speed.
          </li>
        </ul>
      </section>

      {/* 2. Proposed Architecture */}
      <section className="space-y-4">
        <h2 className="text-xl font-black text-[#0B2545] flex items-center gap-2">
          <span className="text-[#EA580C] font-mono">2.</span>
          <span>The Decoupled Architecture Pipeline</span>
        </h2>
        <p className="text-sm leading-relaxed text-slate-700 font-sans">
          FAIRFLOW decomposes the atomic reservation transaction into asynchronous sequential stages:
        </p>

        <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs text-[#0B2545] space-y-1 shadow-xs">
          <div className="font-bold">USER APPLICATION (Intake Phase)</div>
          <div className="text-slate-500 pl-4">↓ Asynchronous ingest over hours</div>
          <div className="font-bold">ELIGIBILITY / RISK ANALYSIS</div>
          <div className="text-slate-500 pl-4">↓ Filter automated bots & duplicate telemetry</div>
          <div className="font-bold">FAIR RANDOMIZATION (Deterministic Seed)</div>
          <div className="text-slate-500 pl-4">↓ Partition into Pools A, B, C, ... K</div>
          <div className="font-bold text-[#EA580C]">CONTROLLED ADMISSION GATE: A_t = min(W_t, C - L_t)</div>
          <div className="text-slate-500 pl-4">↓ Ensure active load never exceeds safe capacity C</div>
          <div className="font-bold text-blue-700">DYNAMIC PROPORTIONAL INVENTORY: Q_k = S_t × (N_k / N_t)</div>
          <div className="text-slate-500 pl-4">↓ Expired allocations auto-recycled to subsequent pools</div>
          <div className="font-bold text-emerald-700">ATOMIC BOOKING & INVENTORY CONFIRMATION</div>
        </div>
      </section>

      {/* 3 & 4: Pre-reg & Eligibility */}
      <section className="space-y-4">
        <h2 className="text-xl font-black text-[#0B2545] flex items-center gap-2">
          <span className="text-[#EA580C] font-mono">3.</span>
          <span>Pre-Registration & Risk Screening</span>
        </h2>
        <p className="text-sm leading-relaxed text-slate-700 font-sans">
          Demand intake occurs hours ahead through standard asynchronous HTTP submissions. Users do not need to refresh
          repeatedly. Before the allocation window opens:
        </p>
        <div className="p-4 rounded-xl bg-white border border-slate-200 text-xs space-y-2 shadow-xs">
          <div className="font-bold text-[#0B2545] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Eligibility Protocol Notice</span>
          </div>
          <p className="text-slate-600 leading-relaxed font-sans">
            "Risk assessment is used only for eligibility/verification in this prototype." It detects bot-like telemetry,
            synthetic fingerprint anomalies, and mass duplicates. It does not rank human applicants by merit or
            entitlement.
          </p>
        </div>
      </section>

      {/* 5 & 6: Controlled Admission Mathematics */}
      <section className="space-y-4">
        <h2 className="text-xl font-black text-[#0B2545] flex items-center gap-2">
          <span className="text-[#EA580C] font-mono">4.</span>
          <span>Controlled Admission Governor</span>
        </h2>
        <p className="text-sm leading-relaxed text-slate-700 font-sans">
          The admission controller guarantees that simulated active concurrent requests never breach safe physical
          capacity <span className="font-mono font-bold text-blue-700">C</span>. At every time interval <span className="font-mono text-slate-600">t</span>:
        </p>

        <div className="p-5 rounded-xl bg-white border border-slate-200 text-center space-y-2 shadow-xs">
          <div className="text-xl font-mono font-black text-[#0B2545]">
            A_t = min(W_t, &nbsp; C − L_t)
          </div>
          <div className="text-xs text-slate-500">
            Where: <strong className="text-slate-800 font-mono">W_t</strong> = waiting users,{' '}
            <strong className="text-slate-800 font-mono">C</strong> = maximum safe concurrent capacity,{' '}
            <strong className="text-slate-800 font-mono">L_t</strong> = current active sessions.
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed font-sans">
          If active load <span className="font-mono text-slate-800">L_t</span> equals capacity{' '}
          <span className="font-mono text-slate-800">C</span>, admitted users{' '}
          <span className="font-mono text-slate-800">A_t = 0</span> until earlier active sessions terminate or complete
          checkout. This mathematical bound prevents server degradation.
        </p>
      </section>

      {/* 7. Dynamic Inventory Allocation & Recycling */}
      <section className="space-y-4">
        <h2 className="text-xl font-black text-[#0B2545] flex items-center gap-2">
          <span className="text-[#EA580C] font-mono">5.</span>
          <span>Dynamic Proportional Inventory & Recycling</span>
        </h2>
        <p className="text-sm leading-relaxed text-slate-700 font-sans">
          Inventory is not permanently sequestered into static partitions. For active pool{' '}
          <span className="font-mono font-bold text-blue-700">k</span>:
        </p>

        <div className="p-5 rounded-xl bg-white border border-slate-200 text-center space-y-2 shadow-xs">
          <div className="text-xl font-mono font-black text-[#EA580C]">
            Q_k = S_t × (N_k / N_t)
          </div>
          <div className="text-xs text-slate-500">
            Where: <strong className="text-slate-800 font-mono">S_t</strong> = currently available unbooked inventory,{' '}
            <strong className="text-slate-800 font-mono">N_k</strong> = eligible applicants in pool k,{' '}
            <strong className="text-slate-800 font-mono">N_t</strong> = total remaining eligible applicants across all
            active and subsequent pools.
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2 text-xs shadow-xs">
          <div className="font-bold text-[#0B2545] flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-[#EA580C]" />
            <span>Recycling Mechanism</span>
          </div>
          <p className="text-slate-600 leading-relaxed font-sans">
            If Pool A is allocated 100 units, but only 72 are confirmed by the end of its 3-minute booking window, the
            unclaimed <strong className="text-[#EA580C] font-mono font-bold">28 units</strong> are dynamically recycled back into{' '}
            <span className="font-mono text-slate-800 font-semibold">S_t+1</span> and allocated to Pool B, C, etc. Inventory is never
            permanently lost or orphaned.
          </p>
        </div>
      </section>

      {/* 8. Jain's Fairness Index */}
      <section className="space-y-4">
        <h2 className="text-xl font-black text-[#0B2545] flex items-center gap-2">
          <span className="text-[#EA580C] font-mono">6.</span>
          <span>Fairness Formulation (Jain's Fairness Index)</span>
        </h2>
        <p className="text-sm leading-relaxed text-slate-700 font-sans">
          We quantify equitable opportunity across pools using Jain's Fairness Index:
        </p>

        <div className="p-5 rounded-xl bg-white border border-slate-200 text-center space-y-2 shadow-xs">
          <div className="text-xl font-mono font-black text-emerald-700">
            J = (Σ p_k)² / (K × Σ p_k²)
          </div>
          <div className="text-xs text-slate-500">
            Where <strong className="text-slate-800 font-mono">p_k</strong> = successful booking probability for pool k,
            and <strong className="text-slate-800 font-mono">K</strong> = number of pools.
          </div>
        </div>

        <div className="p-4 rounded-xl bg-orange-50 border border-orange-200 text-xs text-slate-700 space-y-1">
          <div className="font-bold text-[#EA580C]">Why J=1 alone is insufficient:</div>
          <p className="text-slate-600 text-[11px] leading-relaxed font-sans">
            A system allocating 0 items to all pools yields J = 1.0! Hence, FAIRFLOW reports Jain's Index jointly with
            Inventory Clearance Utilization and Inter-Pool Variance.
          </p>
        </div>
      </section>

      {/* 9. Known Limitations (Section 21) */}
      <section className="space-y-4 pt-4 border-t border-slate-200">
        <h2 className="text-xl font-black text-[#0B2545] flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-[#EA580C]" />
          <span>Known Research Limitations</span>
        </h2>
        <p className="text-xs text-slate-500">
          This prototype intentionally uses simplified allocation rules to create an empirical test harness for future
          research:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1 shadow-xs">
            <span className="font-bold text-[#0B2545]">• Simplified Risk Model:</span>
            <p className="text-slate-600 text-[11px]">Synthetic device heuristics only; not a production fraud engine.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1 shadow-xs">
            <span className="font-bold text-[#0B2545]">• Synthetic Data & Accounts:</span>
            <p className="text-slate-600 text-[11px]">No real identity documents or personal data are ingested.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1 shadow-xs">
            <span className="font-bold text-[#0B2545]">• Simulated Financial Settlement:</span>
            <p className="text-slate-600 text-[11px]">No real payment gateways or monetary transactions occur.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1 shadow-xs">
            <span className="font-bold text-[#0B2545]">• No Real Railway Connection:</span>
            <p className="text-slate-600 text-[11px]">Not affiliated with IRCTC or Indian Railways; no official APIs.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1 shadow-xs">
            <span className="font-bold text-[#0B2545]">• Simulated Hardware Latency:</span>
            <p className="text-slate-600 text-[11px]">Server load calculations are derived mathematically from queue formulas.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1 shadow-xs">
            <span className="font-bold text-[#0B2545]">• Open Research Question:</span>
            <p className="text-slate-600 text-[11px]">
              No claim of an optimal allocation algorithm. Trade-offs between pool window lengths, abandonment rates, and
              fairness remain an active mathematical problem.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
