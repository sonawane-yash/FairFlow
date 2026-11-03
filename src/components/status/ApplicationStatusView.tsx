import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Hash,
  Share2,
  Lock,
  Zap,
  Calendar,
  Layers,
  ChevronLeft
} from 'lucide-react';
import { UserApplication } from '../../types';
import { StorageService } from '../../services/storage';

interface ApplicationStatusViewProps {
  appId: string;
  onBack: () => void;
  onProceedToBooking: (appId: string) => void;
}

export const ApplicationStatusView: React.FC<ApplicationStatusViewProps> = ({
  appId,
  onBack,
  onProceedToBooking
}) => {
  const [application, setApplication] = useState<UserApplication | undefined>(() =>
    StorageService.getApplicationById(appId)
  );
  const [copied, setCopied] = useState(false);
  const [secondsUntilWindow, setSecondsUntilWindow] = useState(30);

  useEffect(() => {
    const app = StorageService.getApplicationById(appId);
    setApplication(app);

    const timer = setInterval(() => {
      setSecondsUntilWindow((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [appId]);

  if (!application) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center space-y-4">
        <div className="text-xl font-bold text-[#0B2545]">Application Not Found</div>
        <p className="text-sm text-slate-600">The application ID {appId} could not be located in synthetic local store.</p>
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-xl bg-[#0B2545] text-white text-xs font-bold hover:bg-[#002244] transition-colors"
        >
          Return to Applications
        </button>
      </div>
    );
  }

  const isWindowOpen = application.status === 'window_active' || secondsUntilWindow === 0 || application.status === 'booked';

  const handleFastForwardWindow = () => {
    const updated = {
      ...application,
      status: 'window_active' as const
    };
    StorageService.saveApplication(updated);
    setApplication(updated);
    setSecondsUntilWindow(0);
  };

  const handleCopyId = () => {
    navigator.clipboard?.writeText(application.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Timeline definition with 8 clear states
  const timelineSteps = [
    {
      title: '1. Application Submitted',
      status: 'completed',
      timestamp: new Date(application.submittedAt).toLocaleTimeString(),
      description: 'Asynchronous pre-registration details received and indexed.'
    },
    {
      title: '2. Eligibility Analysis',
      status: 'completed',
      timestamp: new Date(new Date(application.submittedAt).getTime() + 15000).toLocaleTimeString(),
      description: 'Telemetry verification, bot fingerprint audit, and synthetic ID validation.'
    },
    {
      title: '3. Eligibility Result',
      status: 'completed',
      timestamp: new Date(new Date(application.submittedAt).getTime() + 20000).toLocaleTimeString(),
      description: `Risk Assessment: ${application.riskAssessment.level.toUpperCase()} (Score: ${application.riskAssessment.score}/100). Validated for quota.`
    },
    {
      title: '4. Randomized Allocation',
      status: 'completed',
      timestamp: new Date(new Date(application.submittedAt).getTime() + 35000).toLocaleTimeString(),
      description: `Seeded deterministic pseudo-random shuffle (Seed: ${application.allocation?.randomSeedUsed || '0x4F9B'}).`
    },
    {
      title: '5. Booking Pool Assigned',
      status: 'completed',
      timestamp: new Date(new Date(application.submittedAt).getTime() + 40000).toLocaleTimeString(),
      description: `Assigned to ${application.allocation?.poolName || 'Pool Alpha'}. Priority window fixed.`
    },
    {
      title: '6. Booking Window',
      status: isWindowOpen ? 'active' : 'waiting',
      timestamp: isWindowOpen ? 'NOW OPEN' : `Opens in ${secondsUntilWindow}s`,
      description: isWindowOpen
        ? 'Your controlled booking window is currently live. Safe admission granted.'
        : 'Waiting for earlier pools to complete their assigned booking slots.'
    },
    {
      title: '7. Booking Transaction',
      status: application.status === 'booked' ? 'completed' : isWindowOpen ? 'ready' : 'pending',
      timestamp: application.bookingId ? 'Confirmed' : 'Pending Window',
      description: application.bookingId
        ? `Confirmed under Booking ID: ${application.bookingId}`
        : 'Atomic seat reservation with payment simulation.'
    },
    {
      title: '8. Inventory Settled',
      status: application.status === 'booked' ? 'completed' : 'pending',
      timestamp: application.status === 'booked' ? 'Settled' : 'Dynamic',
      description: application.status === 'booked'
        ? 'Inventory seat deducted; transaction logged to ledger.'
        : 'Unexercised units will be dynamically recycled to subsequent pools.'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={onBack}
            className="text-xs text-slate-500 hover:text-[#0B2545] font-semibold flex items-center gap-1 mb-2 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Back to All Applications</span>
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-[#0B2545]">Application Pipeline Status</h1>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                application.status === 'booked'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : isWindowOpen
                  ? 'bg-orange-50 text-[#EA580C] border-orange-200 animate-pulse'
                  : 'bg-blue-50 text-blue-800 border-blue-200'
              }`}
            >
              {application.status === 'booked'
                ? 'Booking Confirmed'
                : isWindowOpen
                ? 'Window Active • Ready to Book'
                : 'Pool Assigned • Waiting'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyId}
            className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:border-slate-400 text-xs text-slate-700 flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Hash className="w-3.5 h-3.5 text-[#0B2545]" />
            <span className="font-mono font-bold">{application.id}</span>
            {copied ? <span className="text-emerald-600 text-[10px] font-bold">Copied</span> : <Share2 className="w-3 h-3 ml-1 text-slate-400" />}
          </button>

          {!isWindowOpen && (
            <button
              onClick={handleFastForwardWindow}
              className="px-3 py-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 text-[#EA580C] border border-orange-200 text-xs font-bold flex items-center gap-1 transition-colors"
              title="Fast-forward the simulation timer to open window immediately"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Fast-Forward Window</span>
            </button>
          )}
        </div>
      </div>

      {/* Target Route & Pool Info Card */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-6 shadow-xs">
        <div className="space-y-1 md:col-span-2">
          <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Service Details</div>
          <div className="text-lg font-black text-[#0B2545]">{application.routeOrEventLabel}</div>
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-600">
            <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 font-medium">{application.tierOrClass}</span>
            <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 font-medium">{application.quotaOrType}</span>
            <span className="flex items-center gap-1 text-slate-500">
              <Calendar className="w-3 h-3" />
              {application.date}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="text-xs text-slate-500 uppercase font-semibold flex items-center justify-between">
            <span>Allocated Pool</span>
            <Layers className="w-3.5 h-3.5 text-[#0B2545]" />
          </div>
          <div className="text-base font-bold text-[#0B2545]">{application.allocation?.poolName}</div>
          <div className="text-[11px] text-slate-500 font-mono">
            Seed: {application.allocation?.randomSeedUsed}
          </div>
        </div>
      </div>

      {/* Booking Window Active Callout Banner */}
      {isWindowOpen && application.status !== 'booked' && (
        <div className="p-6 rounded-2xl bg-orange-50/80 border-2 border-orange-300 space-y-4 shadow-sm animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#EA580C]">
                <span className="w-2 h-2 rounded-full bg-[#EA580C] animate-ping" />
                <span>YOUR BOOKING WINDOW IS NOW OPEN</span>
              </div>
              <h2 className="text-xl font-black text-[#0B2545]">Controlled Admission Granted</h2>
              <p className="text-xs text-slate-700 max-w-xl font-sans">
                The admission controller has opened your slot. You are NOT competing against 100,000 users at once.
                Inventory is provisionally reserved for your pool.
              </p>
            </div>

            <button
              onClick={() => onProceedToBooking(application.id)}
              className="px-6 py-3 rounded-xl bg-[#EA580C] hover:bg-[#D94E06] text-white font-bold text-sm shadow-sm flex items-center justify-center gap-2 transition-all shrink-0"
            >
              <span>Proceed to Booking</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Confirmed Booking Notice */}
      {application.status === 'booked' && (
        <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Reservation Confirmed</span>
            </div>
            <div className="text-lg font-black text-[#0B2545]">Booking Ref: {application.bookingId}</div>
            <p className="text-xs text-slate-600">
              Inventory seat atomically secured. You can view or download your synthetic confirmation voucher.
            </p>
          </div>
          <button
            onClick={() => onProceedToBooking(application.id)}
            className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shrink-0 transition-colors"
          >
            View Ticket Voucher
          </button>
        </div>
      )}

      {/* Risk Assessment Box */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#0B2545]">Eligibility & Risk Assessment</h2>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-800 px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200">
            Status: {application.riskAssessment.level === 'low' ? 'Eligible' : 'Review'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
            <div className="text-slate-500 font-semibold">Risk Score</div>
            <div className="text-sm font-bold text-[#0B2545] font-mono">{application.riskAssessment.score} / 100 (Low Risk)</div>
            <div className="text-[11px] text-slate-600">{application.riskAssessment.verificationFlag}</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
            <div className="text-slate-500 font-semibold">Prototype Purpose Clarification</div>
            <div className="text-slate-700 leading-relaxed text-[11px]">
              "{application.riskAssessment.explanation}"
            </div>
            <div className="text-[10px] text-slate-500">
              Risk metrics evaluate synthetic bot behavior, not human entitlement.
            </div>
          </div>
        </div>
      </div>

      {/* Visual Timeline Component */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-widest text-[#0B2545]">Lifecycle Progression Timeline</h2>

        <div className="relative border-l-2 border-slate-200 ml-4 pl-6 space-y-6">
          {timelineSteps.map((step, idx) => {
            const isDone = step.status === 'completed';
            const isActive = step.status === 'active' || step.status === 'ready';

            return (
              <div key={idx} className="relative group">
                {/* Marker dot */}
                <div
                  className={`absolute -left-[31px] top-1 w-5 h-5 rounded-full flex items-center justify-center border-2 ${
                    isDone
                      ? 'bg-emerald-600 border-emerald-500 text-white'
                      : isActive
                      ? 'bg-[#EA580C] border-orange-300 text-white animate-pulse'
                      : 'bg-white border-slate-300 text-slate-400'
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-3 h-3 text-white stroke-[3]" />
                  ) : isActive ? (
                    <Zap className="w-3 h-3 text-white" />
                  ) : (
                    <span className="text-[9px] font-mono font-bold text-slate-500">{idx + 1}</span>
                  )}
                </div>

                {/* Content Box */}
                <div
                  className={`p-4 rounded-xl border transition-colors ${
                    isActive
                      ? 'bg-orange-50/50 border-orange-300 shadow-xs'
                      : isDone
                      ? 'bg-white border-slate-200 shadow-xs'
                      : 'bg-slate-50/50 border-slate-200 text-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-bold ${isActive ? 'text-[#EA580C]' : isDone ? 'text-[#0B2545]' : 'text-slate-500'}`}>
                      {step.title}
                    </span>
                    <span className="text-[11px] font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {step.timestamp}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-sans">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
