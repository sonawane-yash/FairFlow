import React, { useState } from 'react';
import {
  Send,
  User,
  Calendar,
  MapPin,
  CheckCircle2,
  Plus,
  Trash2,
  AlertCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Train,
  Ticket,
  Printer
} from 'lucide-react';
import { RESERVATION_SCENARIOS } from '../../data/scenarios';
import { ScenarioType, UserApplication, PassengerInfo, RiskLevel } from '../../types';
import { StorageService } from '../../services/storage';

interface ApplicationFormProps {
  activeScenario: ScenarioType;
  onScenarioChange: (s: ScenarioType) => void;
  onViewApplication: (appId: string) => void;
}

export const ApplicationForm: React.FC<ApplicationFormProps> = ({
  activeScenario,
  onScenarioChange,
  onViewApplication
}) => {
  const currentScenario = RESERVATION_SCENARIOS.find((s) => s.id === activeScenario) || RESERVATION_SCENARIOS[0];
  const sampleService = currentScenario.sampleRoutesOrEvents[0];

  const [selectedRouteId, setSelectedRouteId] = useState(sampleService?.id || '');
  const [journeyDate, setJourneyDate] = useState(sampleService?.date || '2026-09-20');
  const [selectedClass, setSelectedClass] = useState('3A (AC 3 Tier)');
  const [selectedQuota, setSelectedQuota] = useState('TATKAL (तत्काल)');
  const [flexibleTiming, setFlexibleTiming] = useState(true);

  // Passengers
  const [passengers, setPassengers] = useState<PassengerInfo[]>([
    {
      name: 'Dr. Ananya Roy',
      age: 29,
      idType: 'Synthetic Citizen ID',
      idNumberSynthetic: 'SYN-5821-4920',
      seatPreference: 'Lower Berth (LB) - Veg'
    }
  ]);

  // Submission state
  const [submittedApp, setSubmittedApp] = useState<UserApplication | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddPassenger = () => {
    if (passengers.length >= 4) return;
    setPassengers([
      ...passengers,
      {
        name: '',
        age: 30,
        idType: 'Synthetic Citizen ID',
        idNumberSynthetic: `SYN-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
        seatPreference: 'Middle Berth (MB) - Veg'
      }
    ]);
  };

  const handleRemovePassenger = (index: number) => {
    if (passengers.length <= 1) return;
    setPassengers(passengers.filter((_, i) => i !== index));
  };

  const handlePassengerChange = (index: number, field: keyof PassengerInfo, val: string | number) => {
    const next = [...passengers];
    next[index] = { ...next[index], [field]: val };
    setPassengers(next);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const activeRoute = currentScenario.sampleRoutesOrEvents.find((r) => r.id === selectedRouteId) || sampleService;
      const appId = `APP-IR-${Math.floor(10000 + Math.random() * 90000)}`;

      // Compute synthetic risk assessment
      const riskScore = Math.floor(5 + Math.random() * 12);
      const riskLevel: RiskLevel = 'low';

      // Assign to a pool
      const poolLetters = ['Alpha', 'Beta', 'Gamma', 'Delta'];
      const chosenPoolLetter = poolLetters[Math.floor(Math.random() * poolLetters.length)];
      const now = Date.now();

      const newApp: UserApplication = {
        id: appId,
        scenarioId: activeScenario,
        submittedAt: new Date().toISOString(),
        routeOrEventId: selectedRouteId,
        routeOrEventLabel: activeRoute.label,
        date: journeyDate,
        tierOrClass: selectedClass,
        quotaOrType: selectedQuota,
        passengers: passengers.map((p) => ({
          ...p,
          name: p.name.trim() || 'Passenger Citizen'
        })),
        flexibleTiming,
        status: 'pool_assigned',
        riskAssessment: {
          level: riskLevel,
          score: riskScore,
          verificationFlag: 'Clean pre-registration device token & verified citizen KYC signature',
          explanation: 'Risk assessment is used only for eligibility/verification in this prototype.'
        },
        allocation: {
          poolId: `pool-${chosenPoolLetter.toLowerCase()}`,
          poolName: `Tatkal Pool ${chosenPoolLetter} (Batch Window 10:00 - 10:03)`,
          bookingWindowStart: new Date(now + 2 * 60 * 1000).toISOString(),
          bookingWindowEnd: new Date(now + 5 * 60 * 1000).toISOString(),
          windowDurationMinutes: 3,
          priorityOrder: poolLetters.indexOf(chosenPoolLetter) + 1,
          randomSeedUsed: `0x${Math.floor(Math.random() * 0xffffff).toString(16).toUpperCase()}`
        }
      };

      StorageService.saveApplication(newApp);
      StorageService.addEvent({
        timestamp: new Date().toLocaleTimeString(),
        poolName: `Tatkal Pool ${chosenPoolLetter}`,
        type: 'provision',
        units: passengers.length,
        description: `Indian Railways Requisition ${appId} pre-registered and assigned to Pool ${chosenPoolLetter}`
      });

      setSubmittedApp(newApp);
      setIsSubmitting(false);
    }, 600);
  };

  if (submittedApp) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4">
        {/* Ticket styled confirmation receipt */}
        <div className="rounded-2xl bg-white border-2 border-[#0B2545] p-6 sm:p-8 space-y-6 shadow-xl animate-in fade-in zoom-in-95 font-ticket text-slate-900">
          {/* Perforated ticket top header */}
          <div className="flex items-center justify-between border-b-2 border-dashed border-slate-300 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#0B2545]">
                <Train className="w-6 h-6" />
              </div>
              <div>
                <div className="text-base font-black text-[#0B2545]">भारतीय रेल • INDIAN RAILWAYS</div>
                <div className="text-[11px] text-[#EA580C] font-semibold">आरक्षण पावती / RESERVATION ACKNOWLEDGEMENT SLIP</div>
              </div>
            </div>
            <span className="px-3 py-1 rounded bg-emerald-50 text-emerald-800 font-mono text-xs font-bold border border-emerald-200">
              POOL ASSIGNED
            </span>
          </div>

          <div className="space-y-1 text-center">
            <div className="text-xs text-[#EA580C] uppercase font-mono font-bold">Pre-Registration Confirmed</div>
            <h2 className="text-2xl font-black text-[#0B2545]">{submittedApp.id}</h2>
            <p className="text-xs text-slate-600 font-sans">
              Your Tatkal application is verified and scheduled for controlled pool admission.
            </p>
          </div>

          {/* Computerized Ticket Slip Display */}
          <div className="bg-emerald-50/60 text-slate-900 rounded-xl p-5 border border-emerald-300 space-y-3 font-ticket">
            <div className="flex items-center justify-between border-b border-dashed border-emerald-300 pb-2 text-xs">
              <span className="text-emerald-950 font-bold">गाड़ी सं. / Train Service:</span>
              <span className="font-bold text-emerald-900 truncate max-w-[280px]">
                {submittedApp.routeOrEventLabel}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs border-b border-dashed border-emerald-300 pb-2">
              <div>
                <span className="text-emerald-900/70 text-[10px] block">कोटा / Quota:</span>
                <span className="font-bold text-emerald-950">{submittedApp.quotaOrType}</span>
              </div>
              <div>
                <span className="text-emerald-900/70 text-[10px] block">श्रेणी / Class:</span>
                <span className="font-bold text-emerald-950">{submittedApp.tierOrClass}</span>
              </div>
            </div>

            <div className="flex items-center justify-between border-b border-dashed border-emerald-300 pb-2 text-xs">
              <span className="text-emerald-950 font-bold">आवंटित कतार / Assigned Pool:</span>
              <span className="font-bold text-[#EA580C]">{submittedApp.allocation?.poolName}</span>
            </div>

            <div className="space-y-1 text-xs">
              <span className="text-emerald-900/80 text-[10px] block">यात्री / Passengers:</span>
              {submittedApp.passengers.map((p, i) => (
                <div key={i} className="flex justify-between text-emerald-950 font-bold">
                  <span>{i + 1}. {p.name} ({p.age} yrs)</span>
                  <span className="text-emerald-800">{p.seatPreference}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-center justify-center gap-2 font-sans">
            <Clock className="w-4 h-4 text-[#1D4ED8] shrink-0" />
            <span>Tatkal booking window opens at designated pool schedule. Safe from bot rush!</span>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => onViewApplication(submittedApp.id)}
              className="px-6 py-3 rounded-xl bg-[#EA580C] hover:bg-[#D94E06] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm font-ticket uppercase"
            >
              <span>Track PNR Lifecycle</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setSubmittedApp(null);
              }}
              className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-semibold font-ticket"
            >
              New Requisition Form
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      <div className="space-y-6">
        {/* Authentic Indian Railways Form Header */}
        <div className="space-y-2 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#0B2545] text-xs font-bold font-ticket">
            <Train className="w-3.5 h-3.5 text-[#EA580C]" />
            <span>CENTRE FOR RAILWAY INFORMATION SYSTEMS (CRIS)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0B2545] font-ticket">
            भारतीय रेल आरक्षण मांग पत्र / PASSENGER RESERVATION FORM
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-sans">
            Asynchronous Tatkal and General reservation intake. No need to repeatedly refresh the page at 10:00 AM.
          </p>
        </div>

        {/* Quota Selection Tabs Bar (General, Reservation, Tatkal, Premium Tatkal, Ladies) */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3 font-ticket">
          <div className="text-xs font-bold text-[#0B2545] uppercase flex items-center gap-2">
            <Ticket className="w-4 h-4 text-[#EA580C]" />
            <span>Select Reservation Quota / आरक्षण कोटा चुनें:</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {[
              { id: 'TATKAL (तत्काल)', label: 'TATKAL (TQ)', desc: 'Tatkal Quota' },
              { id: 'GENERAL (सामान्य)', label: 'GENERAL (GN)', desc: 'General Quota' },
              { id: 'PREMIUM TATKAL (प्रीमियम तत्काल)', label: 'PREMIUM (PT)', desc: 'Dynamic Quota' },
              { id: 'RESERVATION (अग्रिम)', label: 'ADVANCE (RS)', desc: '120 Days Adv' },
              { id: 'LADIES (महिला)', label: 'LADIES (LD)', desc: 'Women Quota' }
            ].map((q) => {
              const isSelected = selectedQuota === q.id;
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setSelectedQuota(q.id)}
                  className={`p-2.5 rounded-lg text-center border transition-all ${
                    isSelected
                      ? 'bg-[#EA580C] text-white border-[#EA580C] font-bold shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 font-semibold'
                  }`}
                >
                  <div className="text-xs font-bold">{q.label}</div>
                  <div className="text-[10px] opacity-80">{q.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* The Requisition Form Container */}
        <form onSubmit={handleSubmit} className="space-y-6 bg-white border border-slate-200 p-6 sm:p-8 rounded-2xl shadow-xs font-ticket text-slate-900">
          {/* Section 1: Journey Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <Train className="w-5 h-5 text-[#0B2545]" />
              <h2 className="text-sm font-black uppercase text-[#0B2545]">
                1. गाड़ी और यात्रा विवरण / TRAIN & JOURNEY DETAILS
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">गाड़ी सं. एवं नाम / Train No & Name</label>
                <select
                  value={selectedRouteId}
                  onChange={(e) => setSelectedRouteId(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 font-bold focus:outline-none focus:border-[#0B2545]"
                >
                  {currentScenario.sampleRoutesOrEvents.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">यात्रा तिथि / Journey Date</label>
                <input
                  type="date"
                  value={journeyDate}
                  onChange={(e) => setJourneyDate(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 font-bold focus:outline-none focus:border-[#0B2545]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">श्रेणी / Class</label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 font-bold focus:outline-none focus:border-[#0B2545]"
                >
                  <option value="3A (AC 3 Tier)">3A (AC 3 Tier)</option>
                  <option value="2A (AC 2 Tier)">2A (AC 2 Tier)</option>
                  <option value="1A (First AC)">1A (First AC)</option>
                  <option value="SL (Sleeper Class)">SL (Sleeper Class)</option>
                  <option value="CC (AC Chair Car)">CC (AC Chair Car)</option>
                  <option value="EC (Executive Chair)">EC (Executive Chair)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">बोर्डिंग स्टेशन / Boarding Station</label>
                <input
                  type="text"
                  readOnly
                  value="NDLS - NEW DELHI"
                  className="w-full bg-slate-100 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">गंतव्य स्टेशन / Destination</label>
                <input
                  type="text"
                  readOnly
                  value="MMCT - MUMBAI CENTRAL"
                  className="w-full bg-slate-100 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 font-bold"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Passengers */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-[#0B2545]" />
                <h2 className="text-sm font-black uppercase text-[#0B2545]">
                  2. यात्री विवरण / PASSENGER REQUISITION
                </h2>
              </div>
              {passengers.length < 4 && (
                <button
                  type="button"
                  onClick={handleAddPassenger}
                  className="text-xs text-[#0B2545] hover:text-[#EA580C] font-bold flex items-center gap-1 bg-slate-100 px-3 py-1 rounded-lg border border-slate-300 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Passenger (Max 4)</span>
                </button>
              )}
            </div>

            <div className="space-y-3">
              {passengers.map((p, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span className="font-bold text-[#0B2545]">यात्री सं. #{idx + 1}</span>
                    {passengers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemovePassenger(idx)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] text-slate-600 uppercase mb-1 font-semibold">यात्री का नाम / Passenger Full Name</label>
                      <input
                        type="text"
                        required
                        value={p.name}
                        onChange={(e) => handlePassengerChange(idx, 'name', e.target.value)}
                        placeholder="e.g. Vikramaditya Sharma"
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#0B2545] font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-600 uppercase mb-1 font-semibold">आयु / Age</label>
                      <input
                        type="number"
                        min={1}
                        max={110}
                        required
                        value={p.age}
                        onChange={(e) => handlePassengerChange(idx, 'age', parseInt(e.target.value) || 18)}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#0B2545] font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-600 uppercase mb-1 font-semibold">बर्थ विकल्प / Berth & Meal</label>
                      <select
                        value={p.seatPreference || 'Lower Berth (LB) - Veg'}
                        onChange={(e) => handlePassengerChange(idx, 'seatPreference', e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg px-2 py-2 text-[11px] text-slate-800 focus:outline-none focus:border-[#0B2545] font-bold"
                      >
                        <option value="Lower Berth (LB) - Veg">Lower Berth (LB) - Veg</option>
                        <option value="Middle Berth (MB) - Veg">Middle Berth (MB) - Veg</option>
                        <option value="Upper Berth (UB) - Veg">Upper Berth (UB) - Veg</option>
                        <option value="Side Lower (SLB) - Veg">Side Lower (SLB) - Veg</option>
                        <option value="Side Upper (SUB) - Non-Veg">Side Upper (SUB) - Non-Veg</option>
                        <option value="Window Seat (CC)">Window Seat (CC)</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: FairFlow Queue Governance & Flexible Recycling */}
          <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200 space-y-2 text-xs">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={flexibleTiming}
                onChange={(e) => setFlexibleTiming(e.target.checked)}
                className="mt-0.5 rounded text-[#EA580C] focus:ring-[#EA580C] bg-white border-slate-300"
              />
              <div className="space-y-0.5">
                <div className="font-bold text-[#0B2545]">
                  ऑटो-अपग्रेडेशन एवं रीसाइक्लिंग पूल / Auto-Recycled Inventory Pool:
                </div>
                <div className="text-slate-600 font-sans text-[11px]">
                  If your primary Tatkal allocation window experiences unexercised quotas, automatically roll over into
                  subsequent batch allocation. Increases probability of confirmed berth by up to 28%.
                </div>
              </div>
            </label>
          </div>

          {/* Submit Requisition Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-xl bg-[#EA580C] hover:bg-[#D94E06] text-white font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Processing Indian Railways Requisition...</span>
              </>
            ) : (
              <>
                <Train className="w-4 h-4 text-white" />
                <span>Submit Reservation Slip / आरक्षण दर्ज करें</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
