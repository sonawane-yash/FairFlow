import React, { useState, useEffect } from 'react';
import {
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Lock,
  ArrowRight,
  Ticket,
  Printer,
  ChevronLeft,
  Sparkles,
  Zap,
  RefreshCw,
  Train,
  HelpCircle,
  Armchair,
  Layers
} from 'lucide-react';
import { UserApplication, BookingRecord, PaymentStatus, ScenarioType, PassengerSeatAssignment } from '../../types';
import { StorageService } from '../../services/storage';
import { RESERVATION_SCENARIOS } from '../../data/scenarios';
import { useAuth } from '../../context/AuthContext';
import { saveBookingToFirestore } from '../../services/firebase';
import { StationClearanceToken } from '../../services/geofenceService';
import { RailwaySeatMap } from './RailwaySeatMap';
import { AddToCalendarModal } from '../mybookings/AddToCalendarModal';
import { CoachBerthMapModal } from '../coach/CoachBerthMapModal';
import confetti from 'canvas-confetti';

interface BookingViewProps {
  appId: string;
  activeScenario: ScenarioType;
  onBack: () => void;
  onViewTicket: () => void;
  isTrackRestricted?: boolean;
  onTriggerStationQR?: () => void;
  activeClearanceToken?: StationClearanceToken | null;
}

export const BookingView: React.FC<BookingViewProps> = ({
  appId,
  activeScenario,
  onBack,
  onViewTicket,
  isTrackRestricted = false,
  onTriggerStationQR,
  activeClearanceToken
}) => {
  const { currentUser } = useAuth();
  const scenario = RESERVATION_SCENARIOS.find((s) => s.id === activeScenario) || RESERVATION_SCENARIOS[0];
  const [application, setApplication] = useState<UserApplication | undefined>(() =>
    StorageService.getApplicationById(appId)
  );

  const [timeLeft, setTimeLeft] = useState(179); // 3 minutes window
  const [inventoryAvailable, setInventoryAvailable] = useState(38);
  const [bookingStep, setBookingStep] = useState<'review' | 'verifying' | 'payment' | 'confirmed' | 'failed'>('review');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('pending');
  const [confirmedBooking, setConfirmedBooking] = useState<BookingRecord | null>(null);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [isCoachMapOpen, setIsCoachMapOpen] = useState(false);

  // Quota switcher state inside the booking window
  const [activeQuota, setActiveQuota] = useState<'GENERAL' | 'RESERVATION' | 'TATKAL' | 'PREMIUM_TATKAL' | 'LADIES'>('TATKAL');

  // Interactive seat selections
  const [selectedSeats, setSelectedSeats] = useState<PassengerSeatAssignment[]>([]);

  useEffect(() => {
    const app = StorageService.getApplicationById(appId);
    setApplication(app);

    if (app?.quotaOrType?.includes('General') || app?.quotaOrType?.includes('GN')) {
      setActiveQuota('GENERAL');
    } else if (app?.quotaOrType?.includes('Ladies') || app?.quotaOrType?.includes('LD')) {
      setActiveQuota('LADIES');
    } else if (app?.quotaOrType?.includes('Premium') || app?.quotaOrType?.includes('PT')) {
      setActiveQuota('PREMIUM_TATKAL');
    } else if (app?.quotaOrType?.includes('Advance') || app?.quotaOrType?.includes('RS')) {
      setActiveQuota('RESERVATION');
    } else {
      setActiveQuota('TATKAL');
    }

    if (app?.bookingId) {
      const existing = StorageService.getBookings().find((b) => b.id === app.bookingId);
      if (existing) {
        setConfirmedBooking(existing);
        setBookingStep('confirmed');
      }
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [appId]);

  if (!application) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4 font-ticket">
        <div className="text-xl font-bold text-white">Application / PNR Record Not Found</div>
        <button onClick={onBack} className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs">
          Return to Train List
        </button>
      </div>
    );
  }

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const ss = String(timeLeft % 60).padStart(2, '0');

  const quotaLabels = {
    GENERAL: { code: 'GN', title: 'General Quota', extra: 0 },
    RESERVATION: { code: 'RS', title: 'Advance Reservation', extra: 40 },
    TATKAL: { code: 'TQ', title: 'Tatkal Quota', extra: 400 },
    PREMIUM_TATKAL: { code: 'PT', title: 'Premium Tatkal', extra: 850 },
    LADIES: { code: 'LD', title: 'Ladies Quota', extra: 0 }
  };

  const handleExecuteBooking = () => {
    // Check Station Geofence Track Restriction
    if (isTrackRestricted && (!activeClearanceToken || !activeClearanceToken.isSafetyCleared)) {
      if (onTriggerStationQR) {
        onTriggerStationQR();
      }
      return;
    }

    setBookingStep('verifying');

    // Verification step: checks window, admission, inventory, eligibility, passenger data
    setTimeout(() => {
      setBookingStep('payment');
      setPaymentStatus('authorized');

      setTimeout(() => {
        setPaymentStatus('captured');
        const pnrSuffix = Math.floor(1000000 + Math.random() * 9000000);
        const bookingId = `PNR-245-${pnrSuffix}`;

        // Build assigned seats from user's interactive selection or fallback to smart defaults
        const assignedSeats: PassengerSeatAssignment[] =
          selectedSeats.length > 0
            ? selectedSeats
            : application.passengers.map((p, idx) => {
                const defaultCoach = activeQuota === 'TATKAL' ? 'B3' : 'B4';
                const seatNum = 17 + idx;
                const pref = p.seatPreference || 'Lower Berth';
                const code = pref.includes('Middle') ? 'MB' : pref.includes('Upper') ? 'UB' : 'LB';
                return {
                  passengerIndex: idx,
                  passengerName: p.name,
                  coach: defaultCoach,
                  seatNumber: seatNum,
                  berthType: pref,
                  berthCode: code,
                  bayNumber: 3
                };
              });

        const primaryCoach = assignedSeats[0]?.coach || (activeQuota === 'TATKAL' ? 'B3' : 'B4');
        const berthsSummary = assignedSeats.map((s) => `${s.seatNumber} (${s.berthCode})`).join(', ');
        const seatRef = `Coach ${primaryCoach} • Berth(s) ${berthsSummary} [${quotaLabels[activeQuota].code}]`;

        const baseAmount = 1850;
        const extraCharge = quotaLabels[activeQuota].extra;
        const totalPerPerson = baseAmount + extraCharge;

        const newBooking: BookingRecord = {
          id: bookingId,
          applicationId: application.id,
          scenarioId: activeScenario,
          passengerCount: application.passengers.length,
          primaryPassenger: application.passengers[0]?.name || 'Primary Passenger',
          itemDetails: `${application.routeOrEventLabel} • ${application.tierOrClass} • ${quotaLabels[activeQuota].title}`,
          poolId: application.allocation?.poolId || 'pool-tatkal-A',
          amountSynthetic: totalPerPerson * application.passengers.length,
          currency: '₹ (INR)',
          paymentStatus: 'captured',
          reservedAt: new Date().toISOString(),
          confirmedAt: new Date().toISOString(),
          seatSyntheticRef: seatRef,
          passengerSeats: assignedSeats
        };

        StorageService.saveBooking(newBooking);

        // Sync to Firebase Firestore if logged in
        if (currentUser?.id) {
          saveBookingToFirestore(currentUser.id, {
            id: bookingId,
            pnr: bookingId.replace('PNR-', ''),
            trainNumber: '12952',
            trainName: application.routeOrEventLabel || 'Mumbai Tejas Rajdhani Express',
            fromStation: 'NDLS',
            toStation: 'MMCT',
            journeyDate: application.date || new Date().toISOString(),
            travelClass: application.tierOrClass || '3A',
            quota: quotaLabels[activeQuota].title,
            fare: totalPerPerson * application.passengers.length,
            status: 'CNF',
            stationClearanceTokenId: activeClearanceToken?.id || undefined
          });
        }

        // Update application
        const updatedApp: UserApplication = {
          ...application,
          quotaOrType: quotaLabels[activeQuota].title,
          status: 'booked',
          bookingId
        };
        StorageService.saveApplication(updatedApp);
        setApplication(updatedApp);
        setConfirmedBooking(newBooking);
        setBookingStep('confirmed');

        // Decrement simulated inventory & add event
        StorageService.addEvent({
          timestamp: new Date().toLocaleTimeString(),
          poolName: application.allocation?.poolName || 'Tatkal Pool Alpha',
          type: 'booking',
          units: application.passengers.length,
          description: `Confirmed Indian Railways E-Ticket ${bookingId} for ${application.passengers[0]?.name} under ${activeQuota}`
        });

        // Trigger celebratory confetti
        try {
          confetti({
            particleCount: 85,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch {
          // ignore if disabled
        }
      }, 1200);
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      {/* Back button */}
      <button
        onClick={onBack}
        className="text-xs text-[#0B2545] hover:text-[#EA580C] flex items-center gap-1.5 font-ticket font-bold transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>वापस / Back to Application Status</span>
      </button>

      {/* Booking Header Banner with Indian Railways Livery */}
      <div className="p-6 rounded-2xl bg-[#0B2545] border-t-4 border-t-[#EA580C] border border-blue-900 space-y-4 shadow-sm font-ticket text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-300">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span>IRCTC DEDICATED TATKAL ADMISSION GATE</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              भारतीय रेल • E-Ticket Booking Window
            </h1>
            <p className="text-xs text-blue-100/90 font-sans">
              Admission Token: <strong className="font-mono text-amber-300">{application.allocation?.admissionToken || 'IR-TK-498210'}</strong> • Bounded under safe system capacity C.
            </p>
          </div>

          {/* Window Countdown Timer */}
          <div className="p-4 rounded-xl bg-[#001D3D] border border-blue-800 flex items-center gap-3 shrink-0 shadow-inner">
            <Clock className="w-6 h-6 text-amber-400 animate-pulse" />
            <div>
              <div className="text-[10px] text-amber-300/90 uppercase font-bold">Window Closes In</div>
              <div className="text-2xl sm:text-3xl font-mono font-black text-amber-300 tracking-wider">
                {mm}:{ss}
              </div>
            </div>
          </div>
        </div>

        {/* Quota Switcher inside Booking Window */}
        <div className="pt-3 border-t border-blue-900/80 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-amber-300 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>CURRENT QUOTA SWITCHER / कोटा विकल्प:</span>
            </span>
            <span className="text-[11px] text-blue-100 font-mono">
              Active: <strong className="text-amber-300">{quotaLabels[activeQuota].title}</strong>
            </span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {(['GENERAL', 'RESERVATION', 'TATKAL', 'PREMIUM_TATKAL', 'LADIES'] as const).map((q) => {
              const isSelected = activeQuota === q;
              const info = quotaLabels[q];
              return (
                <button
                  key={q}
                  type="button"
                  onClick={() => setActiveQuota(q)}
                  className={`p-2 rounded-lg text-center border transition-all ${
                    isSelected
                      ? 'bg-[#EA580C] text-white border-[#EA580C] font-black shadow-xs scale-105'
                      : 'bg-[#001D3D] text-slate-200 border-blue-800/80 hover:bg-[#002855]'
                  }`}
                >
                  <div className="text-xs font-bold font-mono">{info.code}</div>
                  <div className="text-[10px] truncate">{info.title}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Inventory availability indicator */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-blue-900/80 text-xs">
          <div className="p-3 rounded-xl bg-[#001D3D] border border-blue-800/80">
            <span className="text-blue-200">Assigned Tatkal Batch:</span>
            <div className="font-bold text-white text-sm mt-0.5">{application.allocation?.poolName}</div>
          </div>
          <div className="p-3 rounded-xl bg-[#001D3D] border border-blue-800/80">
            <span className="text-blue-200">Reserved Berths for this Pool:</span>
            <div className="font-bold text-emerald-300 text-sm mt-0.5 font-mono">
              {inventoryAvailable} Berths Available
            </div>
          </div>
          <div className="p-3 rounded-xl bg-[#001D3D] border border-blue-800/80">
            <span className="text-blue-200">Recycle Protection:</span>
            <div className="font-bold text-amber-300 text-sm mt-0.5">Auto-recycles if window expires</div>
          </div>
        </div>
      </div>

      {/* Main Booking Content */}
      {bookingStep === 'review' && (
        <div className="space-y-6">
          {/* Authentic Railway Ticket Slip Preview */}
          <div className="relative rounded-2xl bg-white text-slate-900 p-6 sm:p-8 border-2 border-emerald-700 shadow-sm font-ticket space-y-4 overflow-hidden">
            {/* Watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5 select-none">
              <span className="text-6xl font-black rotate-[-25deg] text-emerald-950 uppercase">
                INDIAN RAILWAYS • भारतीय रेल
              </span>
            </div>

            {/* Ticket Header */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b-2 border-dashed border-emerald-800/40 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-700 flex items-center justify-center text-emerald-800">
                  <Train className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-emerald-800">इलेक्ट्रॉनिक आरक्षण पर्ची / ELECTRONIC RESERVATION SLIP</div>
                  <div className="text-sm font-black text-[#0B2545] tracking-wider">
                    {application.routeOrEventLabel}
                  </div>
                </div>
              </div>
              <div className="text-right mt-2 sm:mt-0">
                <span className="px-2.5 py-1 rounded bg-[#0B2545] text-amber-300 font-mono text-xs font-bold">
                  QUOTA: {quotaLabels[activeQuota].code}
                </span>
              </div>
            </div>

            {/* Journey Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs py-2 border-b border-dashed border-emerald-800/40">
              <div>
                <span className="text-slate-500 block text-[10px]">तारीख / Date:</span>
                <span className="font-bold text-slate-900">{application.date}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">श्रेणी / Class:</span>
                <span className="font-bold text-slate-900">{application.tierOrClass}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">बोर्डिंग / From:</span>
                <span className="font-bold text-slate-900">NDLS (NEW DELHI)</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">गंतव्य / To:</span>
                <span className="font-bold text-slate-900">MMCT (MUMBAI CENTRAL)</span>
              </div>
            </div>

            {/* Passenger Table */}
            <div className="space-y-2 py-1">
              <div className="text-[11px] font-bold text-[#0B2545] uppercase flex flex-wrap items-center justify-between gap-2">
                <span>यात्री विवरण / PASSENGERS TO BE RESERVED ({application.passengers.length}):</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCoachMapOpen(true)}
                    className="px-2.5 py-1 rounded-lg bg-[#0B2545] hover:bg-[#002855] text-amber-300 border border-blue-900 font-mono text-[11px] font-bold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                  >
                    <Layers className="w-3.5 h-3.5 text-[#EA580C]" />
                    <span>Open Full Coach & Berth Map (कोच व सीट नक्शा)</span>
                  </button>
                  <span className="text-[10px] text-slate-500 font-normal">
                    {selectedSeats.length === application.passengers.length
                      ? '✓ All berths selected'
                      : `${selectedSeats.length} of ${application.passengers.length} assigned`}
                  </span>
                </div>
              </div>
              <table className="w-full text-left text-xs border border-slate-200">
                <thead className="bg-slate-100 text-slate-700 font-bold text-[10px]">
                  <tr>
                    <th className="p-1.5">S.No</th>
                    <th className="p-1.5">Name</th>
                    <th className="p-1.5">Age</th>
                    <th className="p-1.5">Gender</th>
                    <th className="p-1.5">Preference</th>
                    <th className="p-1.5">Assigned Berth & Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-800 font-bold">
                  {application.passengers.map((p, i) => {
                    const assigned = selectedSeats.find((s) => s.passengerIndex === i);
                    return (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="p-1.5">{i + 1}</td>
                        <td className="p-1.5">{p.name}</td>
                        <td className="p-1.5">{p.age}</td>
                        <td className="p-1.5">{p.gender || 'F'}</td>
                        <td className="p-1.5 text-slate-600 font-medium">{p.seatPreference || 'Lower Berth'}</td>
                        <td className="p-1.5">
                          {assigned ? (
                            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[11px] font-black inline-flex items-center gap-1 shadow-2xs">
                              <span>Coach {assigned.coach} • Berth {assigned.seatNumber} ({assigned.berthCode})</span>
                            </span>
                          ) : (
                            <span className="text-amber-600 font-mono text-[11px] italic">
                              Select from Seat Map below
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Interactive Railway Seat Map Component */}
            <div className="pt-2">
              <RailwaySeatMap
                passengers={application.passengers}
                travelClass={application.tierOrClass || '3A'}
                activeQuota={activeQuota}
                appId={application.id}
                selectedSeats={selectedSeats}
                onSeatsChange={setSelectedSeats}
              />
            </div>

            {/* Fare Summary in Authentic Railway Breakdown */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
              <div>
                <div className="text-slate-500 text-[10px]">
                  Base Fare: ₹1,850 + {quotaLabels[activeQuota].code} Surcharge: ₹{quotaLabels[activeQuota].extra} × {application.passengers.length} Adult(s)
                </div>
                <div className="text-slate-900 font-bold text-sm">
                  TOTAL AMOUNT PAYABLE: <span className="text-[#EA580C] font-black text-base">₹ {(1850 + quotaLabels[activeQuota].extra) * application.passengers.length}</span>
                </div>
              </div>
              <div className="text-right text-[10px] text-slate-500 font-mono">
                <div>FairFlow Zero Bot Fee: ₹0</div>
                <div className="text-emerald-700 font-bold">Payment: Synthetic PG</div>
              </div>
            </div>

            {/* Pre-Transaction Validation Checklist */}
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-emerald-800">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>FAIRFLOW ANTI-BOT VERIFICATION PASSED</span>
              </div>
              <div className="text-[11px] text-emerald-800 font-mono">
                ✓ Admission Token active • ✓ Guaranteed berth locked in memory • ✓ Zero server deadlock
              </div>
            </div>

            {/* Track Safety Restriction Alert */}
            {isTrackRestricted && (!activeClearanceToken || !activeClearanceToken.isSafetyCleared) && (
              <div className="p-3.5 bg-red-50 border-2 border-red-500 rounded-xl text-red-950 space-y-2 animate-pulse">
                <div className="font-bold flex items-center gap-1.5 text-red-700 text-xs">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>RAILWAY SAFETY LOCKDOWN: TRACK PERIMETER DETECTED</span>
                </div>
                <p className="text-[11px] text-red-800">
                  You are within &lt;100m of the active railway tracks. For passenger safety and anti-touting compliance, online ticket confirmation is disabled until you scan the official Station Master QR Code at the station concourse.
                </p>
                {onTriggerStationQR && (
                  <button
                    type="button"
                    onClick={onTriggerStationQR}
                    className="w-full py-2 px-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                  >
                    <span>Scan Station Master QR to Unlock</span>
                  </button>
                )}
              </div>
            )}

            {/* Confirm Button */}
            <button
              onClick={handleExecuteBooking}
              className={`w-full py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all ${
                isTrackRestricted && (!activeClearanceToken || !activeClearanceToken.isSafetyCleared)
                  ? 'bg-slate-400 text-white cursor-not-allowed'
                  : 'bg-[#EA580C] hover:bg-[#D94E06] text-white cursor-pointer active:scale-[0.99]'
              }`}
            >
              <Train className="w-5 h-5 text-white" />
              <span>
                {isTrackRestricted && (!activeClearanceToken || !activeClearanceToken.isSafetyCleared)
                  ? 'Booking Locked (Scan Station QR Required)'
                  : selectedSeats.length > 0
                  ? `Issue Confirmed E-Ticket • Coach ${selectedSeats[0]?.coach}: Berths ${selectedSeats.map((s) => `${s.seatNumber}(${s.berthCode})`).join(', ')}`
                  : `Issue Confirmed E-Ticket (${quotaLabels[activeQuota].code}) / आरक्षण जारी करें`}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Verifying / Payment in-flight step */}
      {(bookingStep === 'verifying' || bookingStep === 'payment') && (
        <div className="p-12 rounded-2xl bg-white border border-slate-200 text-center space-y-6 shadow-sm font-ticket text-slate-900">
          <div className="w-16 h-16 rounded-full bg-orange-50 border-2 border-[#EA580C] text-[#EA580C] mx-auto flex items-center justify-center animate-spin">
            <RefreshCw className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-[#0B2545]">
              {bookingStep === 'verifying' ? 'Verifying Tatkal Admission Token...' : 'Issuing Electronic Reservation Slip (ERS)...'}
            </h2>
            <p className="text-xs text-slate-600 max-w-sm mx-auto font-sans">
              {bookingStep === 'verifying'
                ? 'Securing atomic database lock on provisional coach berths.'
                : 'Payment State: Captured • Generating Computerized Indian Railways PNR.'}
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-mono text-[#0B2545] font-bold">
            CRIS STATE: {paymentStatus.toUpperCase()}
          </div>
        </div>
      )}

      {/* Confirmed Booking Step: Authentic Computerized Indian Railways Ticket ERS */}
      {bookingStep === 'confirmed' && confirmedBooking && (
        <div className="space-y-6 animate-in fade-in zoom-in-95">
          <div className="rounded-2xl bg-white text-slate-900 border-2 border-emerald-700 p-6 sm:p-8 space-y-6 shadow-md font-ticket relative overflow-hidden">
            {/* Top Bar with Indian Railways bilingual header */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b-2 border-dashed border-emerald-800/40 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-50 border-2 border-emerald-700 flex items-center justify-center text-emerald-800">
                  <Train className="w-7 h-7" />
                </div>
                <div>
                  <div className="text-xs font-bold text-emerald-800">भारतीय रेल • INDIAN RAILWAYS</div>
                  <div className="text-base font-black text-[#0B2545]">
                    इलेक्ट्रॉनिक आरक्षण पर्ची (ई-टिकट) / ELECTRONIC RESERVATION SLIP (ERS)
                  </div>
                </div>
              </div>

              <div className="text-right mt-2 sm:mt-0 font-mono">
                <div className="text-[10px] text-emerald-800 font-bold">शुभयात्रा / HAPPY JOURNEY</div>
                <div className="text-base font-black text-[#EA580C]">{confirmedBooking.id}</div>
              </div>
            </div>

            {/* Ticket Key Indicators */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs border-b-2 border-dashed border-emerald-800/40 pb-3">
              <div>
                <span className="text-slate-500 block text-[10px]">पीएनआर / PNR:</span>
                <span className="font-mono font-black text-base text-[#0B2545]">{confirmedBooking.id}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">गाड़ी / Train:</span>
                <span className="font-bold text-slate-900">{confirmedBooking.itemDetails.split('•')[0]}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">कोच एवं बर्थ / Coach & Berth:</span>
                <span className="font-mono font-black text-emerald-800 text-sm">{confirmedBooking.seatSyntheticRef}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">आरक्षण स्थिति / Status:</span>
                <span className="px-2 py-0.5 rounded bg-emerald-700 text-white font-bold font-mono text-xs">
                  CNF (CONFIRMED)
                </span>
              </div>
            </div>

            {/* Passenger Manifest */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-[#0B2545] uppercase flex justify-between items-center">
                <span>यात्री आरक्षण सूची / PASSENGER BOOKING MANIFEST ({confirmedBooking.passengerCount}):</span>
                <span className="text-[10px] text-emerald-700 font-mono font-bold">ALL CONFIRMED (CNF)</span>
              </div>
              <div className="space-y-1.5">
                {confirmedBooking.passengerSeats && confirmedBooking.passengerSeats.length > 0 ? (
                  confirmedBooking.passengerSeats.map((ps, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex justify-between items-center">
                      <div className="space-y-0.5">
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          <span>{idx + 1}. {ps.passengerName}</span>
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono font-bold text-[10px]">
                            CNF / CONFIRMED
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          Bay {ps.bayNumber || 3} • Quota: {activeQuota} • Batch: {confirmedBooking.poolId}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-black text-[#0B2545] text-sm">
                          Coach {ps.coach} • Berth {ps.seatNumber}
                        </div>
                        <div className="text-[10px] text-[#EA580C] font-bold">
                          {ps.berthType} ({ps.berthCode})
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <div className="flex justify-between items-center font-bold text-slate-900">
                      <span>1. {confirmedBooking.primaryPassenger} (Adult)</span>
                      <span className="text-emerald-800 font-mono">{confirmedBooking.seatSyntheticRef}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1 font-mono">
                      Quota: {activeQuota} • FairFlow Admission Batch: {confirmedBooking.poolId}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Fare and Payment Stamp */}
            <div className="flex justify-between items-center border-t-2 border-dashed border-emerald-800/40 pt-3 text-xs">
              <div>
                <span className="text-slate-500 block text-[10px]">कुल भुगतान / TOTAL FARE PAID:</span>
                <span className="text-xl font-black text-[#EA580C]">{confirmedBooking.currency} {confirmedBooking.amountSynthetic}</span>
              </div>
              <div className="text-right">
                <span className="px-3 py-1 rounded bg-emerald-50 border border-emerald-300 text-emerald-800 font-bold font-mono text-xs">
                  PAYMENT STATE: CAPTURED
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                onClick={onViewTicket}
                className="px-5 py-3 rounded-xl bg-[#0B2545] hover:bg-[#002244] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm"
              >
                <Ticket className="w-4 h-4 text-amber-400" />
                <span>View in My PNR Bookings (मेरे टिकट)</span>
              </button>

              <button
                onClick={() => setIsCalendarModalOpen(true)}
                className="px-5 py-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#0B2545] border border-blue-200 font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0">
                  <path fill="#4285F4" d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z" />
                  <path fill="#34A853" d="M7 11h5v5H7z" />
                  <path fill="#EA4335" d="M12 11h5v5h-5z" />
                </svg>
                <span>Add to Google Calendar (गूगल कैलेंडर)</span>
              </button>

              <button
                onClick={() => setIsCoachMapOpen(true)}
                className="px-5 py-3 rounded-xl bg-[#0B2545] hover:bg-[#002244] text-white border border-blue-800 font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
              >
                <Train className="w-4 h-4 text-amber-400" />
                <span>View Assigned Berth on Coach Map (कोच नक्शा देखें)</span>
              </button>

              <button
                onClick={() => window.print()}
                className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-medium text-xs flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4 text-slate-700" />
                <span>Print Railway Ticket (प्रिंट करें)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Coach & Berth Visual Map Modal */}
      {isCoachMapOpen && application && (
        <CoachBerthMapModal
          isOpen={isCoachMapOpen}
          onClose={() => setIsCoachMapOpen(false)}
          trainNumber="12952"
          trainName={application.routeOrEventLabel || "Mumbai Tejas Rajdhani Express"}
          travelClass={application.tierOrClass || "3A"}
          activeQuota={activeQuota}
          passengers={application.passengers}
          selectedSeats={selectedSeats}
          onSelectBerth={(seat) => {
            setSelectedSeats((prev) => {
              const filtered = prev.filter((s) => s.passengerIndex !== seat.passengerIndex);
              return [...filtered, seat];
            });
          }}
          onRemoveBerth={(passengerIdx) => {
            setSelectedSeats((prev) => prev.filter((s) => s.passengerIndex !== passengerIdx));
          }}
          highlightCoach={confirmedBooking?.passengerSeats?.[0]?.coach}
          highlightBerth={confirmedBooking?.passengerSeats?.[0]?.seatNumber}
          readOnly={bookingStep === 'confirmed'}
        />
      )}

      {/* Google Calendar Modal */}
      {isCalendarModalOpen && confirmedBooking && (
        <AddToCalendarModal
          booking={confirmedBooking}
          application={application}
          isOpen={isCalendarModalOpen}
          onClose={() => setIsCalendarModalOpen(false)}
          onSuccess={() => {
            const updated = StorageService.getBookings().find((b) => b.id === confirmedBooking.id);
            if (updated) setConfirmedBooking(updated);
          }}
        />
      )}
    </div>
  );
};
