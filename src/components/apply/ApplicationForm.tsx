import React, { useState, useEffect } from 'react';
import {
  Train,
  Ticket,
  Calendar,
  Clock,
  User,
  Plus,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileText,
  CreditCard,
  Check,
  Zap
} from 'lucide-react';
import { RESERVATION_SCENARIOS } from '../../data/scenarios';
import { ScenarioType, UserApplication, PassengerInfo, RiskLevel } from '../../types';
import { StorageService } from '../../services/storage';
import { SYNTHETIC_ACCOUNTS } from '../../data/syntheticAccounts';

interface ExtendedPassengerInfo extends PassengerInfo {
  gender?: 'Male' | 'Female' | 'Transgender';
  foodChoice?: 'Veg' | 'Non-Veg' | 'Jain Meal' | 'No Food';
  seniorCitizenConcession?: boolean;
}

interface ApplicationFormProps {
  activeScenario: ScenarioType;
  onScenarioChange: (s: ScenarioType) => void;
  onViewApplication: (appId: string) => void;
  onProceedToBooking?: (appId: string) => void;
}

export const ApplicationForm: React.FC<ApplicationFormProps> = ({
  activeScenario,
  onScenarioChange,
  onViewApplication,
  onProceedToBooking
}) => {
  const currentScenario = RESERVATION_SCENARIOS.find((s) => s.id === activeScenario) || RESERVATION_SCENARIOS[0];
  const sampleService = currentScenario.sampleRoutesOrEvents[0];

  const [selectedRouteId, setSelectedRouteId] = useState(sampleService?.id || '');
  const [journeyDate, setJourneyDate] = useState(sampleService?.date || '2026-09-20');
  const [selectedClass, setSelectedClass] = useState('3A (AC 3 Tier)');
  const [selectedQuota, setSelectedQuota] = useState('GENERAL (सामान्य)');

  // General Quota streamlined states: only adults and kids count
  const [numAdults, setNumAdults] = useState<number>(1);
  const [numKids, setNumKids] = useState<number>(0);

  // Other quotas specific states (Tatkal, Premium, Advance, Ladies)
  const [tatkalRollover, setTatkalRollover] = useState(true);
  const [dynamicMultiplier] = useState(1.55);
  const [surgeAcceptance, setSurgeAcceptance] = useState(true);
  const [vikalpEnabled, setVikalpEnabled] = useState(false);
  const [vikalpTrains] = useState<string[]>(['12954 August Kranti Rajdhani', '22222 CSMT Rajdhani']);
  const [meriSaheliEscort, setMeriSaheliEscort] = useState(true);
  const [emergencyPhone, setEmergencyPhone] = useState('9876543210');
  const [emergencyContactName, setEmergencyContactName] = useState('Sunita Sharma (Mother)');

  // Passengers list for specialized quotas (Tatkal, Premium, Advance, Ladies)
  const [passengers, setPassengers] = useState<ExtendedPassengerInfo[]>([
    {
      name: 'Rahul Sharma',
      age: 32,
      gender: 'Male',
      idType: 'Synthetic Citizen ID',
      idNumberSynthetic: 'SYN-5821-4920',
      seatPreference: 'Lower Berth (LB)',
      foodChoice: 'Veg',
      seniorCitizenConcession: false
    }
  ]);

  // Submission state
  const [submittedApp, setSubmittedApp] = useState<UserApplication | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  const isGeneral = selectedQuota.includes('GENERAL') || selectedQuota.includes('GN');
  const isTatkal = selectedQuota.includes('TATKAL') && !selectedQuota.includes('PREMIUM');
  const isPremiumTatkal = selectedQuota.includes('PREMIUM');
  const isAdvanceReservation = selectedQuota.includes('RESERVATION') || selectedQuota.includes('ADVANCE');
  const isLadies = selectedQuota.includes('LADIES');

  // When quota changes, adjust passenger constraints & defaults
  useEffect(() => {
    if (selectedQuota.includes('TATKAL') || selectedQuota.includes('PREMIUM')) {
      if (passengers.length > 4) {
        setPassengers(passengers.slice(0, 4));
        setStatusNotice('Tatkal and Premium Tatkal quotas allow a maximum of 4 passengers per requisition.');
      }
    } else if (selectedQuota.includes('LADIES')) {
      setPassengers((prev) =>
        prev.map((p) => {
          if (p.age > 12 && p.gender !== 'Female') {
            return { ...p, gender: 'Female' };
          }
          return p;
        })
      );
    }
  }, [selectedQuota]);

  const maxPassengersAllowed =
    selectedQuota.includes('TATKAL') || selectedQuota.includes('PREMIUM') ? 4 : 6;

  const handleAddPassenger = () => {
    if (passengers.length >= maxPassengersAllowed) return;

    const defaultGender = selectedQuota.includes('LADIES') ? 'Female' : 'Male';

    setPassengers([
      ...passengers,
      {
        name: '',
        age: 30,
        gender: defaultGender,
        idType: 'Synthetic Citizen ID',
        idNumberSynthetic: `SYN-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
        seatPreference: 'Middle Berth (MB)',
        foodChoice: 'Veg',
        seniorCitizenConcession: false
      }
    ]);
  };

  const handleRemovePassenger = (index: number) => {
    if (passengers.length <= 1) return;
    setPassengers(passengers.filter((_, i) => i !== index));
  };

  const handlePassengerChange = (
    index: number,
    field: keyof ExtendedPassengerInfo,
    val: any
  ) => {
    const next = [...passengers];
    next[index] = { ...next[index], [field]: val };

    if (field === 'age') {
      const ageNum = parseInt(val) || 0;
      if (ageNum >= 60) {
        next[index].seniorCitizenConcession = true;
      }
    }

    setPassengers(next);
  };

  // One-click Auto-fill from Master Passenger List
  const handleAutoFillMasterList = () => {
    const master = SYNTHETIC_ACCOUNTS[0];
    if (master) {
      setPassengers([
        {
          name: master.fullName,
          age: 34,
          gender: selectedQuota.includes('LADIES') ? 'Female' : 'Male',
          idType: 'Synthetic Citizen ID',
          idNumberSynthetic: 'SYN-8821-4902',
          seatPreference: master.berthPreference || 'Lower Berth (LB)',
          foodChoice: 'Veg',
          seniorCitizenConcession: false
        }
      ]);
      setStatusNotice('Pre-filled from CRIS Master Passenger List (Verified KYC).');
      setTimeout(() => setStatusNotice(null), 4000);
    }
  };

  // Base fare per passenger estimation across classes
  const classBaseFares: Record<string, number> = {
    '1A (First AC)': 3200,
    '2A (AC 2 Tier)': 2150,
    '3A (AC 3 Tier)': 1450,
    'SL (Sleeper Class)': 540,
    'CC (AC Chair Car)': 980,
    'EC (Executive Chair)': 1850
  };

  const currentBaseFare = classBaseFares[selectedClass] || 1450;
  const childBaseFare = Math.round(currentBaseFare * 0.5); // 50% child fare for ages 5-11

  // General Quota Basic Fare calculation
  const generalAdultsFare = numAdults * currentBaseFare;
  const generalKidsFare = numKids * childBaseFare;
  const generalTotalBasicFare = generalAdultsFare + generalKidsFare;

  // Other Quotas Fare calculation
  let fareMultiplier = 1.0;
  let quotaSurcharge = 0;
  if (isTatkal) {
    quotaSurcharge = selectedClass.includes('1A') || selectedClass.includes('2A') || selectedClass.includes('3A') ? 400 : 150;
  } else if (isPremiumTatkal) {
    fareMultiplier = dynamicMultiplier;
    quotaSurcharge = 450;
  } else if (isAdvanceReservation) {
    quotaSurcharge = 40;
  }

  const specializedPerPersonFare = Math.round(currentBaseFare * fareMultiplier + quotaSurcharge);
  const specializedTotalFare = specializedPerPersonFare * passengers.length;

  const currentTripBasicFare = isGeneral ? generalTotalBasicFare : specializedTotalFare;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const activeRoute = currentScenario.sampleRoutesOrEvents.find((r) => r.id === selectedRouteId) || sampleService;
      const appId = `APP-IR-${Math.floor(10000 + Math.random() * 90000)}`;
      const now = Date.now();

      // For General Quota, construct synthesized passenger list from Adults and Kids counts
      let finalPassengers: PassengerInfo[] = [];
      if (isGeneral) {
        for (let i = 1; i <= numAdults; i++) {
          finalPassengers.push({
            name: i === 1 ? 'Primary Adult Passenger' : `Adult Passenger ${i}`,
            age: 32,
            idType: 'Synthetic Citizen ID',
            idNumberSynthetic: `SYN-ADULT-${1000 + i}`,
            seatPreference: 'Adult (12+ yrs) • Standard Berth'
          });
        }
        for (let j = 1; j <= numKids; j++) {
          finalPassengers.push({
            name: `Child Passenger ${j}`,
            age: 8,
            idType: 'Child ID (Under 12)',
            idNumberSynthetic: `SYN-CHILD-${2000 + j}`,
            seatPreference: 'Child (5-11 yrs) • Half Fare'
          });
        }
      } else {
        finalPassengers = passengers.map((p) => ({
          name: p.name.trim() || 'Passenger Citizen',
          age: p.age,
          idType: p.idType,
          idNumberSynthetic: p.idNumberSynthetic,
          seatPreference: `${p.seatPreference || 'Lower Berth'} • ${p.foodChoice || 'Veg'}${p.gender ? ` • ${p.gender}` : ''}`
        }));
      }

      const poolLetters = ['Alpha', 'Beta', 'Gamma', 'Delta'];
      const chosenPoolLetter = poolLetters[Math.floor(Math.random() * poolLetters.length)];

      const newApp: UserApplication = {
        id: appId,
        scenarioId: activeScenario,
        submittedAt: new Date().toISOString(),
        routeOrEventId: selectedRouteId,
        routeOrEventLabel: activeRoute.label,
        date: journeyDate,
        tierOrClass: selectedClass,
        quotaOrType: selectedQuota,
        passengers: finalPassengers,
        flexibleTiming: isGeneral ? true : tatkalRollover,
        status: isGeneral ? 'window_active' : 'pool_assigned',
        riskAssessment: {
          level: 'low',
          score: Math.floor(4 + Math.random() * 8),
          verificationFlag: isGeneral
            ? 'General Quota Instant E-Ticket Allotment'
            : 'Pre-registered citizen KYC token verified against anti-tout filters',
          explanation: isGeneral
            ? 'General Quota booking complete. Direct basic fare calculation verified.'
            : 'Risk assessment used for fair pool admission.'
        },
        allocation: {
          poolId: isGeneral ? 'general-direct-pool' : `pool-${chosenPoolLetter.toLowerCase()}`,
          poolName: isGeneral
            ? 'General Quota Direct Allocation (Immediate IRCTC E-Ticket)'
            : `Tatkal Pool ${chosenPoolLetter} (Batch Window 10:00 - 10:03)`,
          bookingWindowStart: new Date(now).toISOString(),
          bookingWindowEnd: new Date(now + (isGeneral ? 60 : 3) * 60 * 1000).toISOString(),
          windowDurationMinutes: isGeneral ? 60 : 3,
          priorityOrder: isGeneral ? 1 : poolLetters.indexOf(chosenPoolLetter) + 1,
          randomSeedUsed: isGeneral
            ? `0xGN_${Math.floor(100000 + Math.random() * 900000)}`
            : `0x${Math.floor(Math.random() * 0xffffff).toString(16).toUpperCase()}`
        }
      };

      StorageService.saveApplication(newApp);
      StorageService.addEvent({
        timestamp: new Date().toLocaleTimeString(),
        poolName: isGeneral ? 'General Direct E-Ticketing' : `Tatkal Pool ${chosenPoolLetter}`,
        type: 'provision',
        units: finalPassengers.length,
        description: isGeneral
          ? `General Ticket ${appId} generated for ${numAdults} Adults & ${numKids} Kids. Basic Fare: ₹${generalTotalBasicFare}.`
          : `Tatkal Requisition ${appId} pre-registered and assigned to Pool ${chosenPoolLetter}.`
      });

      setSubmittedApp(newApp);
      setIsSubmitting(false);
    }, 600);
  };

  // -------------------------------------------------------------
  // POST SUBMISSION CONFIRMATION SCREENS
  // -------------------------------------------------------------
  if (submittedApp) {
    const isAppGeneral = submittedApp.quotaOrType.includes('GENERAL') || submittedApp.quotaOrType.includes('GN');
    const isAppTatkal = submittedApp.quotaOrType.includes('TATKAL') && !submittedApp.quotaOrType.includes('PREMIUM');
    const isAppPremium = submittedApp.quotaOrType.includes('PREMIUM');
    const isAppLadies = submittedApp.quotaOrType.includes('LADIES');

    return (
      <div className="max-w-3xl mx-auto py-8 px-4 font-ticket">
        <div className="rounded-2xl bg-white border-2 border-[#0B2545] p-6 sm:p-8 space-y-6 shadow-xl animate-in fade-in zoom-in-95 text-slate-900">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b-2 border-dashed border-slate-300 pb-4 gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#0B2545]">
                <Train className="w-6 h-6 text-[#EA580C]" />
              </div>
              <div>
                <div className="text-base font-black text-[#0B2545]">भारतीय रेल • INDIAN RAILWAYS (IRCTC)</div>
                <div className="text-[11px] font-bold text-[#EA580C]">
                  {isAppGeneral
                    ? 'सामान्य ई-टिकट बुकिंग रसीद / GENERAL E-TICKET BOOKING SUMMARY'
                    : isAppTatkal
                    ? 'आरक्षण पावती पर्ची / TATKAL RESERVATION ACKNOWLEDGEMENT SLIP'
                    : isAppPremium
                    ? 'प्रीमियम तत्काल गतिशील मूल्य लॉक / PREMIUM TATKAL FARE LOCK'
                    : 'आरक्षण मांग पत्र / RESERVATION REQUISITION SLIP'}
                </div>
              </div>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border ${
                isAppGeneral
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : 'bg-amber-100 text-amber-800 border-amber-300'
              }`}
            >
              {isAppGeneral ? '✓ DIRECT BOOKING READY' : 'POOL ALLOCATED'}
            </span>
          </div>

          {/* Central Title */}
          <div className="space-y-1 text-center">
            <div className="text-xs uppercase font-mono font-bold text-[#EA580C]">
              {isAppGeneral
                ? 'General Quota Trip Basic Fare Calculated'
                : 'Controlled Requisition Queue Window Assigned'}
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0B2545]">{submittedApp.id}</h2>
            <p className="text-xs text-slate-600 font-sans">
              {isAppGeneral
                ? 'Your General Quota booking is confirmed. No reservation slip or passenger details required at this stage.'
                : 'Your requisition is securely queued in the anti-bot Tatkal batch pool.'}
            </p>
          </div>

          {/* Detailed Summary Card */}
          <div
            className={`rounded-xl p-5 border space-y-3 ${
              isAppGeneral
                ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                : 'bg-blue-50/70 border-blue-200 text-blue-950'
            }`}
          >
            <div className="flex items-center justify-between border-b border-dashed border-slate-300 pb-2 text-xs">
              <span className="font-bold">गाड़ी सं. / Train Service:</span>
              <span className="font-bold truncate max-w-[280px] text-[#0B2545]">
                {submittedApp.routeOrEventLabel}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs border-b border-dashed border-slate-300 pb-2">
              <div>
                <span className="text-[10px] block opacity-75">कोटा / Quota:</span>
                <span className="font-bold text-[#EA580C]">{submittedApp.quotaOrType}</span>
              </div>
              <div>
                <span className="text-[10px] block opacity-75">श्रेणी / Class:</span>
                <span className="font-bold">{submittedApp.tierOrClass}</span>
              </div>
              <div>
                <span className="text-[10px] block opacity-75">यात्रा तिथि / Date:</span>
                <span className="font-bold">{submittedApp.date}</span>
              </div>
              <div>
                <span className="text-[10px] block opacity-75" style={{ color: '#ffffff' }}>मूल किराया / Basic Fare:</span>
                <span className="font-bold text-emerald-700 font-mono">₹ {currentTripBasicFare}</span>
              </div>
            </div>

            {/* General Quota Passenger Breakdown */}
            {isAppGeneral ? (
              <div className="space-y-2 pt-1 text-xs">
                <span className="text-[10px] block font-bold uppercase opacity-80">
                  यात्री गणना एवं मूल किराया / Passengers &amp; Basic Fare:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="bg-white/90 p-3 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-500 uppercase block">वयस्क / Adults (Age 12+ Yrs):</span>
                    <span className="font-bold text-sm text-[#0B2545]">
                      {numAdults} Adult(s) × ₹{currentBaseFare} = ₹{generalAdultsFare}
                    </span>
                  </div>
                  <div className="bg-white/90 p-3 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-500 uppercase block">बच्चे / Kids (Age 5-11 Yrs):</span>
                    <span className="font-bold text-sm text-emerald-700">
                      {numKids} Kid(s) × ₹{childBaseFare} = ₹{generalKidsFare}
                    </span>
                  </div>
                </div>

                <div className="bg-emerald-100/70 p-3 rounded-lg border border-emerald-300 flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-950">कुल यात्रा मूल किराया (Total Basic Fare of Trip):</span>
                  <span className="font-mono font-black text-emerald-900 text-base">₹ {generalTotalBasicFare}</span>
                </div>
              </div>
            ) : (
              <div className="space-y-1.5 text-xs pt-1">
                <span className="text-[10px] block font-bold uppercase opacity-80">
                  यात्री विवरण / Passengers ({submittedApp.passengers.length}):
                </span>
                {submittedApp.passengers.map((p, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center bg-white/90 px-3 py-1.5 rounded border border-slate-200 text-xs font-bold"
                  >
                    <span>
                      {i + 1}. {p.name} ({p.age} yrs)
                    </span>
                    <span className="text-slate-600 text-[11px] font-normal">{p.seatPreference}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            {onProceedToBooking && (
              <button
                onClick={() => onProceedToBooking(submittedApp.id)}
                className="px-6 py-3.5 rounded-xl bg-[#EA580C] hover:bg-[#D94E06] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm uppercase tracking-wider transition-all"
              >
                <span>Proceed to Berth Map & Payment / भुगतान करें</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => onViewApplication(submittedApp.id)}
              className="px-6 py-3.5 rounded-xl bg-[#0B2545] hover:bg-[#002244] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm uppercase tracking-wider transition-all"
            >
              <FileText className="w-4 h-4" />
              <span>Track PNR Lifecycle / पीएनआर देखें</span>
            </button>

            <button
              onClick={() => setSubmittedApp(null)}
              className="px-5 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-semibold"
            >
              Book Another Ticket
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // MAIN FORM RENDER
  // -------------------------------------------------------------
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      <div className="space-y-6">
        {/* Crisp Header with IRCTC Branding */}
        <div className="space-y-2 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#0B2545] text-xs font-bold font-ticket">
            <Train className="w-3.5 h-3.5 text-[#EA580C]" />
            <span>CENTRE FOR RAILWAY INFORMATION SYSTEMS (CRIS) • IRCTC</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0B2545] font-ticket">
            {isGeneral
              ? 'सामान्य कोटा रेल टिकट बुकिंग / GENERAL QUOTA TICKET BOOKING'
              : isTatkal
              ? 'भारतीय रेल तत्काल आरक्षण मांग पत्र / TATKAL RESERVATION REQUISITION'
              : isPremiumTatkal
              ? 'प्रीमियम तत्काल गतिशील आरक्षण / PREMIUM TATKAL DYNAMIC BOOKING'
              : isAdvanceReservation
              ? 'अग्रिम आरक्षण मांग पत्र (120 दिन) / 120-DAY ADVANCE RESERVATION'
              : 'महिला कोटा सुरक्षित आरक्षण / LADIES QUOTA SAFE-CABIN RESERVATION'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-sans">
            {isGeneral
              ? 'Fast & streamlined General Quota booking. Select your journey, specify number of adults and kids, view basic trip fare, and book instantly.'
              : isTatkal
              ? 'Anti-bot Tatkal batch pool intake. Eliminates page crashes at 10:00 AM with tokenized human queue assignment.'
              : isPremiumTatkal
              ? 'Instant dynamic pricing booking with real-time surge lock-in timer and guaranteed human checkout.'
              : isAdvanceReservation
              ? 'Reserve tickets up to 120 days in advance with optional Vikalp alternate train scheme.'
              : 'Exclusive cabin allocation for female passengers and children with dedicated RPF Meri Saheli escort.'}
          </p>
        </div>

        {/* Status Notification Banner if any */}
        {statusNotice && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center gap-2 font-ticket">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{statusNotice}</span>
          </div>
        )}

        {/* Quota Selection Tabs Bar */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3 font-ticket">
          <div className="text-xs font-bold text-[#0B2545] uppercase flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Ticket className="w-4 h-4 text-[#EA580C]" />
              <span>Select Reservation Quota / आरक्षण कोटा चुनें:</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">
              {isGeneral ? 'General: No passenger details needed' : 'Specialized quota forms'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {[
              { id: 'GENERAL (सामान्य)', label: 'GENERAL (GN)', desc: 'Adults & Kids Count', badge: 'Direct' },
              { id: 'TATKAL (तत्काल)', label: 'TATKAL (TQ)', desc: 'Batch Queue Slip', badge: '10 AM' },
              { id: 'PREMIUM TATKAL (प्रीमियम तत्काल)', label: 'PREMIUM (PT)', desc: 'Dynamic Fare Lock', badge: 'Surge' },
              { id: 'RESERVATION (अग्रिम)', label: 'ADVANCE (RS)', desc: '120 Days ARP', badge: 'ARP' },
              { id: 'LADIES (महिला)', label: 'LADIES (LD)', desc: 'Women Safe-Cabin', badge: 'Safe' }
            ].map((q) => {
              const isSelected = selectedQuota === q.id;
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setSelectedQuota(q.id)}
                  className={`p-2.5 rounded-lg text-center border transition-all relative ${
                    isSelected
                      ? 'bg-[#EA580C] text-white border-[#EA580C] font-bold shadow-xs'
                      : 'bg-[#0B2545] hover:bg-[#002244] text-white border-[#0B2545] font-semibold'
                  }`}
                >
                  <div className="text-xs font-bold text-white">{q.label}</div>
                  <div className="text-[10px] text-white opacity-90">{q.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ============================================================== */}
        {/* FORM CONTAINER                                                 */}
        {/* ============================================================== */}
        <form
          onSubmit={handleSubmit}
          className="space-y-6 bg-white border border-slate-200 p-6 sm:p-8 rounded-2xl shadow-xs font-ticket text-slate-900"
        >
          {/* SECTION 1: JOURNEY DETAILS (Common across all forms) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2">
                <Train className="w-5 h-5 text-[#0B2545]" />
                <h2 className="text-sm font-black uppercase text-[#0B2545]">
                  1. गाड़ी और यात्रा विवरण / TRAIN & JOURNEY DETAILS
                </h2>
              </div>
              <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">
                {selectedQuota.split(' ')[0]} Quota
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  गाड़ी सं. एवं नाम / Train No & Name
                </label>
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
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  यात्रा तिथि / Journey Date
                </label>
                <input
                  type="date"
                  value={journeyDate}
                  onChange={(e) => setJourneyDate(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 font-bold focus:outline-none focus:border-[#0B2545]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  श्रेणी / Class
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 font-bold focus:outline-none focus:border-[#0B2545]"
                >
                  <option value="3A (AC 3 Tier)">3A (AC 3 Tier) - ₹{classBaseFares['3A (AC 3 Tier)']}</option>
                  <option value="2A (AC 2 Tier)">2A (AC 2 Tier) - ₹{classBaseFares['2A (AC 2 Tier)']}</option>
                  <option value="1A (First AC)">1A (First AC) - ₹{classBaseFares['1A (First AC)']}</option>
                  <option value="SL (Sleeper Class)">SL (Sleeper Class) - ₹{classBaseFares['SL (Sleeper Class)']}</option>
                  <option value="CC (AC Chair Car)">CC (AC Chair Car) - ₹{classBaseFares['CC (AC Chair Car)']}</option>
                  <option value="EC (Executive Chair)">EC (Executive Chair) - ₹{classBaseFares['EC (Executive Chair)']}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  बोर्डिंग स्टेशन / Boarding Station
                </label>
                <input
                  type="text"
                  readOnly
                  value="NDLS - NEW DELHI"
                  className="w-full bg-slate-100 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  गंतव्य स्टेशन / Destination
                </label>
                <input
                  type="text"
                  readOnly
                  value="MMCT - MUMBAI CENTRAL"
                  className="w-full bg-slate-100 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 font-bold"
                />
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* GENERAL QUOTA: REDESIGNED STREAMLINED FORM                     */}
          {/* (NO PASSENGER DETAILS • ONLY ADULTS & KIDS • AGE CRITERIA      */}
          {/* • BASIC FARE OF THE TRIP • THAT'S IT!)                         */}
          {/* ============================================================== */}
          {isGeneral ? (
            <div className="space-y-6 pt-4 border-t border-slate-200">
              {/* SECTION 2: NUMBER OF ADULTS & KIDS */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-[#0B2545]" />
                    <h2 className="text-sm font-black uppercase text-[#0B2545]">
                      2. यात्रियों की संख्या एवं आयु मानदंड / PASSENGERS &amp; AGE CRITERIA
                    </h2>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    No Passenger Details Required
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Adults Counter Card */}
                  <div className="p-5 rounded-2xl bg-[#0B2545] border-2 border-blue-800 text-white hover:border-blue-500 transition-all space-y-3 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-sm font-black text-white flex items-center gap-2">
                          <span>वयस्क / Adults</span>
                          <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-mono font-bold">
                            Age 12+ Yrs
                          </span>
                        </div>
                        <p className="text-xs text-white font-sans mt-0.5 opacity-90">
                          Full standard basic fare with allocated berth.
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-mono text-white block opacity-80">Rate / Adult:</span>
                        <span className="text-sm font-black text-white font-mono">₹ {currentBaseFare}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-blue-800/80">
                      <span className="text-xs font-bold text-white">Number of Adults:</span>
                      <div className="flex items-center gap-3 bg-white p-1 rounded-xl border border-slate-300 shadow-xs">
                        <button
                          type="button"
                          onClick={() => setNumAdults(Math.max(1, numAdults - 1))}
                          disabled={numAdults <= 1}
                          className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed text-[#0B2545] font-black flex items-center justify-center transition-colors text-base"
                          title="Decrease adults"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-mono font-black text-base text-[#0B2545]">
                          {numAdults}
                        </span>
                        <button
                          type="button"
                          onClick={() => setNumAdults(Math.min(6, numAdults + 1))}
                          disabled={numAdults + numKids >= 6}
                          className="w-8 h-8 rounded-lg bg-[#0B2545] hover:bg-[#002244] disabled:opacity-40 disabled:cursor-not-allowed text-white font-black flex items-center justify-center transition-colors text-base shadow-xs"
                          title="Increase adults"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Kids Counter Card */}
                  <div className="p-5 rounded-2xl bg-[#0B2545] border-2 border-blue-800 text-white hover:border-emerald-500 transition-all space-y-3 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-sm font-black text-white flex items-center gap-2">
                          <span>बच्चे / Kids</span>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-mono font-bold">
                            Age 5 to 11 Yrs
                          </span>
                        </div>
                        <p className="text-xs text-white font-sans mt-0.5 opacity-90">
                          Half basic fare (50%). Infants under 5 yrs travel free.
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-mono text-white block opacity-80">Rate / Child:</span>
                        <span className="text-sm font-black text-white font-mono">₹ {childBaseFare}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-blue-800/80">
                      <span className="text-xs font-bold text-white">Number of Kids:</span>
                      <div className="flex items-center gap-3 bg-white p-1 rounded-xl border border-slate-300 shadow-xs">
                        <button
                          type="button"
                          onClick={() => setNumKids(Math.max(0, numKids - 1))}
                          disabled={numKids <= 0}
                          className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed text-[#0B2545] font-black flex items-center justify-center transition-colors text-base"
                          title="Decrease kids"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-mono font-black text-base text-[#0B2545]">
                          {numKids}
                        </span>
                        <button
                          type="button"
                          onClick={() => setNumKids(Math.min(4, numKids + 1))}
                          disabled={numAdults + numKids >= 6}
                          className="w-8 h-8 rounded-lg bg-[#0B2545] hover:bg-[#002244] disabled:opacity-40 disabled:cursor-not-allowed text-white font-black flex items-center justify-center transition-colors text-base shadow-xs"
                          title="Increase kids"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Age Criteria Specification Cards */}
                <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 space-y-2">
                  <div className="text-xs font-bold text-[#0B2545] uppercase flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-[#EA580C]" />
                    <span>आयु मानदंड विवरण / Passenger Age Criteria Specifications:</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-sans text-slate-700">
                    <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1">
                      <div className="font-bold text-[#0B2545] flex items-center gap-1.5 font-ticket">
                        <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                        <span>Adults (वयस्क): Age 12+</span>
                      </div>
                      <div className="text-[11px] text-slate-600 leading-relaxed">
                        Full standard basic fare applies. Guaranteed separate berth or seat allotted.
                      </div>
                    </div>

                    <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1">
                      <div className="font-bold text-emerald-800 flex items-center gap-1.5 font-ticket">
                        <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                        <span>Kids (बच्चे): Age 5 to 11</span>
                      </div>
                      <div className="text-[11px] text-slate-600 leading-relaxed">
                        50% of adult basic fare (₹{childBaseFare}). Child travels comfortably with parents.
                      </div>
                    </div>

                    <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1">
                      <div className="font-bold text-amber-800 flex items-center gap-1.5 font-ticket">
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                        <span>Infants (शिशु): Under 5</span>
                      </div>
                      <div className="text-[11px] text-slate-600 leading-relaxed">
                        100% Free of cost. No ticket booking or separate reservation required.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 3: BASIC FARE OF THE TRIP BREAKDOWN */}
              <div className="p-5 rounded-2xl bg-white border-2 border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
                      ₹
                    </div>
                    <div>
                      <h3 className="text-xs font-black uppercase text-[#0B2545] font-ticket">
                        यात्रा का मूल किराया / Basic Fare of the Trip
                      </h3>
                      <span className="text-[11px] text-slate-500 font-sans">
                        Base passenger fare for {selectedClass}
                      </span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 text-xs font-bold font-mono">
                    {numAdults + numKids} {numAdults + numKids === 1 ? 'Passenger' : 'Passengers'}
                  </span>
                </div>

                <div className="space-y-2.5 text-xs font-ticket">
                  {/* Adults Basic Fare */}
                  <div className="flex items-center justify-between py-1.5 border-b border-dashed border-slate-200">
                    <span className="text-slate-700 flex items-center gap-2">
                      <span className="font-bold text-[#0B2545]">{numAdults} Adult(s)</span>
                      <span className="text-[11px] text-slate-500 font-mono">(Age 12+ • ₹{currentBaseFare} each)</span>
                    </span>
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      ₹ {generalAdultsFare}
                    </span>
                  </div>

                  {/* Kids Basic Fare */}
                  {numKids > 0 && (
                    <div className="flex items-center justify-between py-1.5 border-b border-dashed border-slate-200">
                      <span className="text-slate-700 flex items-center gap-2">
                        <span className="font-bold text-emerald-800">{numKids} Child(ren)</span>
                        <span className="text-[11px] text-slate-500 font-mono">(Age 5-11 • 50% Fare: ₹{childBaseFare} each)</span>
                      </span>
                      <span className="font-mono font-bold text-emerald-700 text-sm">
                        ₹ {generalKidsFare}
                      </span>
                    </div>
                  )}

                  {/* Total Basic Trip Fare */}
                  <div className="flex items-center justify-between pt-2 text-sm font-black text-[#0B2545]">
                    <span className="uppercase tracking-wide">कुल यात्रा मूल किराया / Total Basic Fare:</span>
                    <span className="text-2xl text-[#EA580C] font-mono font-black">
                      ₹ {generalTotalBasicFare}
                    </span>
                  </div>
                </div>
              </div>

              {/* ACTION BUTTON FOR GENERAL QUOTA */}
              <div className="space-y-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-xl text-white font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99]"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Generating IRCTC General E-Ticket (₹{generalTotalBasicFare})...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-white" />
                      <span>Proceed to Book Ticket (₹{generalTotalBasicFare}) / टिकट बुक करें</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="text-center text-[11px] text-slate-500 font-sans">
                  ✓ General Quota: No individual passenger details or reservation slip required. Instant basic fare booking.
                </div>
              </div>
            </div>
          ) : (
            /* ============================================================== */
            /* SPECIALIZED QUOTAS (TATKAL, PREMIUM, ADVANCE, LADIES)          */
            /* ============================================================== */
            <div className="space-y-6 pt-4 border-t border-slate-200">
              {/* QUOTA SPECIFIC HERO BANNER */}
              {isTatkal && (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-600 text-white flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-black uppercase text-amber-900">
                        Tatkal Controlled Batch Requisition Slip
                      </div>
                      <div className="text-[11px] text-amber-800 font-sans">
                        Opens 10:00 AM (AC) & 11:00 AM (Non-AC). Pre-register your requisition slip to secure your batch admission token.
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={handleAutoFillMasterList}
                      className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] shadow-xs flex items-center gap-1.5"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Auto-Fill Master List</span>
                    </button>
                  </div>
                </div>
              )}

              {isPremiumTatkal && (
                <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 text-purple-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-700 text-white flex items-center justify-center shrink-0">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-black uppercase text-purple-900">
                        Premium Tatkal Dynamic Pricing Engine
                      </div>
                      <div className="text-[11px] text-purple-800 font-sans">
                        Dynamic demand multiplier active ({dynamicMultiplier}x base fare). Only confirmed berths available.
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-purple-700 block uppercase font-mono">Dynamic Base:</span>
                    <span className="text-xs font-bold text-purple-950">₹ {specializedPerPersonFare} / person</span>
                  </div>
                </div>
              )}

              {isAdvanceReservation && (
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-700 text-white flex items-center justify-center shrink-0">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-black uppercase text-blue-900">
                        120-Day Advance Reservation Period (ARP)
                      </div>
                      <div className="text-[11px] text-blue-800 font-sans">
                        Book up to 120 days in advance with optional Vikalp Alternative Train Accommodation Scheme.
                      </div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-blue-200 text-blue-950 font-mono text-[10px] font-bold uppercase shrink-0">
                    120 Days ARP
                  </span>
                </div>
              )}

              {isLadies && (
                <div className="p-4 rounded-xl bg-pink-50 border border-pink-200 text-pink-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-pink-600 text-white flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-black uppercase text-pink-900">
                        Women Passenger Safe-Cabin Quota (LD)
                      </div>
                      <div className="text-[11px] text-pink-800 font-sans">
                        Reserved exclusively for solo female travelers or women accompanying children under 12 years.
                      </div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-pink-200 text-pink-950 font-mono text-[10px] font-bold uppercase shrink-0">
                    RPF Escort Enabled
                  </span>
                </div>
              )}

              {/* Section 2: Passengers Information */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-[#0B2545]" />
                    <h2 className="text-sm font-black uppercase text-[#0B2545]">
                      2. यात्री विवरण / PASSENGER DETAILS ({passengers.length}/{maxPassengersAllowed})
                    </h2>
                  </div>
                  {passengers.length < maxPassengersAllowed && (
                    <button
                      type="button"
                      onClick={handleAddPassenger}
                      className="text-xs text-[#0B2545] hover:text-[#EA580C] font-bold flex items-center gap-1 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-300 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Passenger (Max {maxPassengersAllowed})</span>
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  {passengers.map((p, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between text-xs text-slate-600">
                        <span className="font-bold text-[#0B2545] flex items-center gap-2">
                          <span>यात्री सं. #{idx + 1}</span>
                          {idx === 0 && (
                            <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-900 text-[10px] font-bold">
                              Primary
                            </span>
                          )}
                        </span>
                        {passengers.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemovePassenger(idx)}
                            className="text-red-600 hover:text-red-700 flex items-center gap-1 text-[11px]"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                        <div className="sm:col-span-4">
                          <label className="block text-[10px] text-slate-600 uppercase mb-1 font-semibold">
                            यात्री का नाम / Full Name
                          </label>
                          <input
                            type="text"
                            required
                            value={p.name}
                            onChange={(e) => handlePassengerChange(idx, 'name', e.target.value)}
                            placeholder="e.g. Rahul Sharma"
                            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#0B2545] font-bold"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[10px] text-slate-600 uppercase mb-1 font-semibold">
                            आयु / Age
                          </label>
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

                        <div className="sm:col-span-2">
                          <label className="block text-[10px] text-slate-600 uppercase mb-1 font-semibold">
                            लिंग / Gender
                          </label>
                          <select
                            value={p.gender || 'Male'}
                            disabled={isLadies && p.age > 12}
                            onChange={(e) => handlePassengerChange(idx, 'gender', e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-lg px-2 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#0B2545] font-bold disabled:bg-slate-100"
                          >
                            {isLadies ? (
                              <>
                                <option value="Female">Female</option>
                                {p.age <= 12 && <option value="Male">Male (Child &le;12)</option>}
                              </>
                            ) : (
                              <>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Transgender">Transgender</option>
                              </>
                            )}
                          </select>
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[10px] text-slate-600 uppercase mb-1 font-semibold">
                            बर्थ विकल्प / Berth
                          </label>
                          <select
                            value={p.seatPreference || 'Lower Berth (LB)'}
                            onChange={(e) => handlePassengerChange(idx, 'seatPreference', e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-lg px-2 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#0B2545] font-bold"
                          >
                            <option value="No Preference">No Preference</option>
                            <option value="Lower Berth (LB)">Lower Berth (LB)</option>
                            <option value="Middle Berth (MB)">Middle Berth (MB)</option>
                            <option value="Upper Berth (UB)">Upper Berth (UB)</option>
                            <option value="Side Lower (SL)">Side Lower (SL)</option>
                            <option value="Side Upper (SU)">Side Upper (SU)</option>
                            <option value="Window Seat (WS)">Window Seat (WS)</option>
                          </select>
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[10px] text-slate-600 uppercase mb-1 font-semibold">
                            भोजन / Food Choice
                          </label>
                          <select
                            value={p.foodChoice || 'Veg'}
                            onChange={(e) => handlePassengerChange(idx, 'foodChoice', e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-lg px-2 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#0B2545] font-bold"
                          >
                            <option value="Veg">Veg Meal</option>
                            <option value="Non-Veg">Non-Veg Meal</option>
                            <option value="Jain Meal">Jain Meal</option>
                            <option value="No Food">No Food</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 3: SPECIFIC QUOTA OPTIONS */}
              {isTatkal && (
                <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-300 space-y-2">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={tatkalRollover}
                      onChange={(e) => setTatkalRollover(e.target.checked)}
                      className="mt-0.5 rounded text-[#EA580C] focus:ring-[#EA580C]"
                    />
                    <div>
                      <div className="font-bold text-xs text-amber-950">
                        ऑटो-अपग्रेडेशन एवं रीसाइक्लिंग पूल / Auto-Recycled Inventory Pool:
                      </div>
                      <div className="text-[11px] text-amber-900 font-sans leading-relaxed">
                        If your primary Tatkal window fills, automatically roll over into subsequent batch allocation.
                      </div>
                    </div>
                  </label>
                </div>
              )}

              {isPremiumTatkal && (
                <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 space-y-2 text-xs">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={surgeAcceptance}
                      onChange={(e) => setSurgeAcceptance(e.target.checked)}
                      className="mt-0.5 rounded text-purple-700 focus:ring-purple-700"
                    />
                    <div>
                      <div className="font-bold text-purple-950">
                        I understand Premium Tatkal pricing is dynamic and strictly non-refundable:
                      </div>
                      <div className="text-[11px] text-purple-900 font-sans leading-relaxed">
                        Fare locked at current tier (₹{specializedPerPersonFare}/person). Zero refund upon cancellation.
                      </div>
                    </div>
                  </label>
                </div>
              )}

              {isAdvanceReservation && (
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 space-y-3">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={vikalpEnabled}
                      onChange={(e) => setVikalpEnabled(e.target.checked)}
                      className="mt-0.5 rounded text-[#EA580C] focus:ring-[#EA580C]"
                    />
                    <div>
                      <div className="font-bold text-xs text-[#0B2545]">
                        Opt for Vikalp Alternate Train Accommodation Scheme (ATAS)
                      </div>
                      <div className="text-[11px] text-slate-600 font-sans leading-relaxed">
                        Automatically transfer waitlisted passengers to alternate Rajdhani or Express trains without extra fare.
                      </div>
                    </div>
                  </label>
                </div>
              )}

              {isLadies && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-pink-50 border border-pink-200 space-y-2">
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={meriSaheliEscort}
                        onChange={(e) => setMeriSaheliEscort(e.target.checked)}
                        className="mt-0.5 rounded text-pink-600 focus:ring-pink-600"
                      />
                      <div>
                        <div className="font-bold text-xs text-pink-950">
                          RPF 'Meri Saheli' Dedicated Officer Escort
                        </div>
                        <div className="text-[11px] text-pink-900 font-sans leading-relaxed">
                          Female RPF personnel verify passenger safety during boarding, halts, and arrival.
                        </div>
                      </div>
                    </label>
                  </div>

                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Emergency Contact Name"
                      value={emergencyContactName}
                      onChange={(e) => setEmergencyContactName(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 font-bold focus:outline-none focus:border-pink-600"
                    />
                    <input
                      type="tel"
                      placeholder="Emergency Contact Phone"
                      value={emergencyPhone}
                      onChange={(e) => setEmergencyPhone(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 font-bold focus:outline-none focus:border-pink-600"
                    />
                  </div>
                </div>
              )}

              {/* FARE BAR & SUBMIT FOR SPECIALIZED QUOTAS */}
              <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3 text-left">
                  <div className="w-10 h-10 rounded-lg bg-[#EA580C] text-white flex items-center justify-center font-bold text-sm">
                    ₹
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-300">
                      Estimated Total ({passengers.length} {passengers.length > 1 ? 'Passengers' : 'Passenger'} • {selectedClass})
                    </div>
                    <div className="text-lg font-black text-white">
                      ₹ {specializedTotalFare}
                    </div>
                  </div>
                </div>

                <div className="text-xs text-slate-300 text-right">
                  <span className="text-[10px] uppercase font-mono block text-amber-400">
                    Controlled Pool Requisition
                  </span>
                  <span>{selectedQuota.split(' ')[0]} Quota</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-4 rounded-xl text-white font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all ${
                  isPremiumTatkal
                    ? 'bg-purple-700 hover:bg-purple-800 active:scale-[0.99]'
                    : 'bg-[#EA580C] hover:bg-[#D94E06] active:scale-[0.99]'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing Indian Railways Requisition...</span>
                  </>
                ) : (
                  <>
                    {isTatkal ? (
                      <>
                        <Clock className="w-4 h-4 text-white" />
                        <span>Submit Tatkal Requisition Slip / तत्काल आरक्षण पर्ची जमा करें</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    ) : isPremiumTatkal ? (
                      <>
                        <Sparkles className="w-4 h-4 text-white" />
                        <span>Lock Dynamic Fare & Instant Book (PT) / गतिशील किराया लॉक करें</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    ) : isAdvanceReservation ? (
                      <>
                        <Calendar className="w-4 h-4 text-white" />
                        <span>Submit Advance Reservation Form / अग्रिम आरक्षण दर्ज करें</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4 text-white" />
                        <span>Book Under Ladies Quota (LD) / महिला कोटा आरक्षण दर्ज करें</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </>
                )}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
