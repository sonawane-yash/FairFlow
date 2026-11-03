import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Ticket,
  X,
  Minimize2,
  Maximize2,
  Train,
  Clock,
  ShieldCheck,
  Zap,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Printer,
  ChevronDown,
  GripVertical
} from 'lucide-react';
import { StorageService } from '../../services/storage';
import { UserApplication, RiskLevel } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface FloatingRailwayTicketBookingProps {
  onProceedToBooking: (appId: string) => void;
  onViewApplication: (appId: string) => void;
}

export type RailwayQuota = 'GENERAL' | 'RESERVATION' | 'TATKAL' | 'PREMIUM_TATKAL' | 'LADIES';

export const FloatingRailwayTicketBooking: React.FC<FloatingRailwayTicketBookingProps> = ({
  onProceedToBooking,
  onViewApplication
}) => {
  const { currentUser, isLoggedIn, triggerLoginRequired } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Default position: positioned at the bottom left corner
  const getDefaultPosition = useCallback(() => {
    if (typeof window !== 'undefined') {
      const isMobile = window.innerWidth < 640;
      const height = 58;
      const bottomOffset = isMobile ? 80 : 28;
      const targetY = Math.max(80, window.innerHeight - height - bottomOffset);
      const targetX = isMobile ? 14 : 24;
      return { x: targetX, y: targetY };
    }
    return { x: 24, y: 600 };
  }, []);

  // Draggable position state (always resets to bottom left default on reload)
  const [position, setPosition] = useState<{ x: number; y: number }>(getDefaultPosition);

  // Position at bottom left on mount with measured height and clear legacy local storage
  useEffect(() => {
    try {
      localStorage.removeItem('fairflow_floating_ticket_pos');
    } catch {
      // ignore
    }
    if (typeof window !== 'undefined') {
      const isMobile = window.innerWidth < 640;
      const height = dragRef.current?.offsetHeight || 58;
      const bottomOffset = isMobile ? 80 : 28;
      const targetY = Math.max(80, window.innerHeight - height - bottomOffset);
      const targetX = isMobile ? 14 : 24;
      setPosition({ x: targetX, y: targetY });
    }
  }, []);

  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);
  const wasJustDraggedRef = useRef(false);
  const dragInfoRef = useRef({
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
    hasMoved: false
  });

  // Clamp position to viewport whenever window is resized
  useEffect(() => {
    const handleResize = () => {
      setPosition((prev) => {
        const width = dragRef.current?.offsetWidth || 240;
        const height = dragRef.current?.offsetHeight || 58;
        const minX = 8;
        const maxX = Math.max(minX, window.innerWidth - width - 8);
        const minY = 60; // clearance below sticky top header
        const maxY = Math.max(minY, window.innerHeight - height - 8);
        const clampedX = Math.min(Math.max(minX, prev.x), maxX);
        const clampedY = Math.min(Math.max(minY, prev.y), maxY);
        if (clampedX !== prev.x || clampedY !== prev.y) {
          return { x: clampedX, y: clampedY };
        }
        return prev;
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Drag interaction handler supporting Mouse and Touch
  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    // Only primary button for mouse
    if (e.pointerType === 'mouse' && e.button !== 0) return;

    // Do not initiate drag if user clicked dismiss button
    const target = e.target as HTMLElement;
    if (target.closest('#dismiss-floating-book-ticket-button')) {
      return;
    }

    const startX = e.clientX;
    const startY = e.clientY;
    const originX = position.x;
    const originY = position.y;

    dragInfoRef.current = {
      startX,
      startY,
      originX,
      originY,
      hasMoved: false
    };

    const handlePointerMove = (moveEv: PointerEvent) => {
      const deltaX = moveEv.clientX - dragInfoRef.current.startX;
      const deltaY = moveEv.clientY - dragInfoRef.current.startY;
      const distance = Math.hypot(deltaX, deltaY);

      if (distance > 5) {
        if (!dragInfoRef.current.hasMoved) {
          dragInfoRef.current.hasMoved = true;
          setIsDragging(true);
        }

        const width = dragRef.current?.offsetWidth || 240;
        const height = dragRef.current?.offsetHeight || 65;
        const minX = 8;
        const maxX = Math.max(minX, window.innerWidth - width - 8);
        const minY = 120; // safe clearance below the sticky top horizontal navigation bar
        const maxY = Math.max(minY, window.innerHeight - height - 8);

        const targetX = Math.min(Math.max(minX, dragInfoRef.current.originX + deltaX), maxX);
        const targetY = Math.min(Math.max(minY, dragInfoRef.current.originY + deltaY), maxY);

        setPosition({ x: targetX, y: targetY });
      }
    };

    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);

      if (dragInfoRef.current.hasMoved) {
        wasJustDraggedRef.current = true;
        setIsDragging(false);

        // Clear drag flag after short delay so click listener ignores the release
        setTimeout(() => {
          wasJustDraggedRef.current = false;
        }, 120);
      }
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: false });
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);
  }, [position]);

  // Click handler that opens the modal only if user did not drag
  const handleButtonClick = (e: React.MouseEvent) => {
    if (wasJustDraggedRef.current || dragInfoRef.current.hasMoved) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    setIsOpen(true);
  };

  // Ticket configuration state
  const [selectedQuota, setSelectedQuota] = useState<RailwayQuota>('TATKAL');
  const [selectedTrain, setSelectedTrain] = useState('12951');
  const [selectedClass, setSelectedClass] = useState('3A');
  const [passengerName, setPassengerName] = useState(currentUser?.fullName || 'Ananya Sen');
  const [passengerAge, setPassengerAge] = useState('29');
  const [berthPreference, setBerthPreference] = useState('LOWER');
  const [foodChoice, setFoodChoice] = useState('VEG');

  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);

  // Train database for the ticket
  const trains = [
    {
      no: '12951',
      name: 'NDLS TEJAS RAJDHANI',
      from: 'NEW DELHI (NDLS)',
      to: 'MUMBAI CENTRAL (MMCT)',
      dep: '16:55',
      arr: '08:35 +1D',
      distance: '1386 KM'
    },
    {
      no: '22436',
      name: 'VANDE BHARAT EXP',
      from: 'NEW DELHI (NDLS)',
      to: 'VARANASI JN (BSB)',
      dep: '06:00',
      arr: '14:00',
      distance: '759 KM'
    },
    {
      no: '12002',
      name: 'BHOPAL SHATABDI',
      from: 'NEW DELHI (NDLS)',
      to: 'RANI KAMLAPATI (RKMP)',
      dep: '06:00',
      arr: '14:40',
      distance: '708 KM'
    },
    {
      no: '12302',
      name: 'HOWRAH RAJDHANI',
      from: 'NEW DELHI (NDLS)',
      to: 'HOWRAH JN (HWH)',
      dep: '16:50',
      arr: '09:55 +1D',
      distance: '1451 KM'
    }
  ];

  const currentTrain = trains.find((t) => t.no === selectedTrain) || trains[0];

  // Fare calculation based on class and quota
  const baseFares: Record<string, number> = {
    '1A': 4250,
    '2A': 2850,
    '3A': 1850,
    'SL': 620,
    'CC': 1420
  };

  const basePrice = baseFares[selectedClass] || 1850;
  const tatkalCharges: Record<RailwayQuota, number> = {
    GENERAL: 0,
    RESERVATION: 40,
    TATKAL: 400,
    PREMIUM_TATKAL: 850,
    LADIES: 0
  };
  const tatkalExtra = tatkalCharges[selectedQuota];
  const gst = Math.round((basePrice + tatkalExtra) * 0.05);
  const totalFare = basePrice + tatkalExtra + gst;

  const quotaCodes: Record<RailwayQuota, { code: string; label: string; hindi: string; color: string }> = {
    GENERAL: { code: 'GN', label: 'General Quota', hindi: 'सामान्य कोटा', color: 'bg-blue-600' },
    RESERVATION: { code: 'RS', label: 'Advance Reservation', hindi: 'अग्रिम आरक्षण', color: 'bg-emerald-700' },
    TATKAL: { code: 'TQ', label: 'Tatkal Quota', hindi: 'तत्काल कोटा', color: 'bg-amber-600' },
    PREMIUM_TATKAL: { code: 'PT', label: 'Premium Tatkal', hindi: 'प्रीमियम तत्काल', color: 'bg-purple-700' },
    LADIES: { code: 'LD', label: 'Ladies Quota', hindi: 'महिला कोटा', color: 'bg-rose-700' }
  };

  // Generate synthetic PNR based on inputs
  const pnrNumber = `245-${selectedTrain.slice(0, 3)}${selectedQuota === 'TATKAL' ? '9' : '4'}2026`;

  const handleCreateIndianRailwayTicket = () => {
    if (!isLoggedIn) {
      triggerLoginRequired('book an Indian Railways train ticket');
      return;
    }
    const syntheticAppId = `APP-IR-${Date.now().toString().slice(-5)}`;
    const now = Date.now();
    const newApp: UserApplication = {
      id: syntheticAppId,
      scenarioId: 'railway',
      routeOrEventId: selectedTrain,
      routeOrEventLabel: `${currentTrain.no} / ${currentTrain.name}`,
      tierOrClass: `${selectedClass} - ${selectedQuota} Quota (${quotaCodes[selectedQuota].code})`,
      quotaOrType: quotaCodes[selectedQuota].label,
      date: 'Tomorrow (Opening 10:00 AM)',
      flexibleTiming: true,
      passengers: [
        {
          name: passengerName || 'Ananya Sen',
          age: parseInt(passengerAge) || 29,
          idType: 'Synthetic Citizen ID',
          idNumberSynthetic: 'SYN-8821-4902',
          seatPreference: `${berthPreference} Berth (${foodChoice})`
        }
      ],
      riskAssessment: {
        score: selectedQuota === 'TATKAL' ? 12 : 8,
        level: 'low' as RiskLevel,
        verificationFlag: 'Clean pre-registration device token & verified citizen KYC signature',
        explanation: 'Risk assessment is used only for eligibility/verification in this prototype.'
      },
      allocation: {
        poolId: `pool-${quotaCodes[selectedQuota].code.toLowerCase()}-1`,
        poolName: `Indian Railways ${quotaCodes[selectedQuota].code} Batch 1`,
        bookingWindowStart: new Date(now).toISOString(),
        bookingWindowEnd: new Date(now + 3 * 60 * 1000).toISOString(),
        windowDurationMinutes: 3,
        priorityOrder: 1,
        randomSeedUsed: `0x${Math.floor(Math.random() * 0xffffff).toString(16).toUpperCase()}`
      },
      status: 'window_active',
      submittedAt: new Date().toISOString()
    };

    StorageService.saveApplication(newApp);
    setBookingSuccess(syntheticAppId);

    // Add live monitor event
    StorageService.addEvent({
      timestamp: new Date().toLocaleTimeString(),
      poolName: `IRCTC ${quotaCodes[selectedQuota].code} Gate`,
      type: 'provision',
      units: 1,
      description: `E-Ticket request queued for PNR ${pnrNumber} (${currentTrain.name}) under ${selectedQuota}`
    });

    setTimeout(() => {
      onProceedToBooking(syntheticAppId);
      setIsOpen(false);
      setBookingSuccess(null);
    }, 1200);
  };

  return (
    <>
      {/* Draggable Floating Book Ticket Button */}
      {!isOpen && !isDismissed && (
        <div
          ref={dragRef}
          onPointerDown={handlePointerDown}
          style={{
            position: 'fixed',
            left: 0,
            top: 0,
            transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
            touchAction: 'none'
          }}
          className={`z-50 select-none ${
            isDragging
              ? 'cursor-grabbing scale-105'
              : 'cursor-grab'
          }`}
        >
          <div className="relative inline-flex items-center group">
            {/* Main Draggable Book Ticket button */}
            <div
              id="floating-book-ticket-button"
              role="button"
              tabIndex={0}
              onClick={handleButtonClick}
              className={`flex items-center gap-2 pl-2.5 pr-7 py-2 sm:py-2.5 rounded-xl bg-[#0B2545] hover:bg-[#002244] text-white border-2 border-[#EA580C] shadow-xl transition-all text-left ${
                isDragging
                  ? 'ring-4 ring-amber-400/50 shadow-2xl border-amber-400 bg-[#001733]'
                  : 'hover:shadow-2xl hover:border-amber-400'
              }`}
              title="Drag anywhere on page • Click to Book Ticket"
            >
              {/* Drag Grip Handle */}
              <div
                className="p-0.5 text-amber-400/70 group-hover:text-amber-400 transition-colors flex items-center justify-center shrink-0 cursor-grab active:cursor-grabbing"
                title="Drag to move anywhere"
              >
                <GripVertical className="w-4 h-4 stroke-[2.5]" />
              </div>

              {/* Icon */}
              <div className="w-8 h-8 rounded-lg bg-[#EA580C] flex items-center justify-center shrink-0 shadow-sm text-white">
                <Ticket className="w-4 h-4 text-white group-hover:rotate-12 transition-transform" />
              </div>

              {/* Text */}
              <div className="leading-tight pr-1">
                <div className="text-[9px] uppercase font-bold tracking-wider text-[#FFB703] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>IRCTC RESERVATION</span>
                </div>
                <div className="text-xs sm:text-sm font-black text-white tracking-wide font-ticket flex items-center gap-1.5">
                  <span>Book Ticket</span>
                  <span className="text-[11px] text-slate-300 font-normal hidden sm:inline">/ टिकट बुक करें</span>
                </div>
              </div>
            </div>

            {/* Cross button to disappear the floating button when clicked */}
            <button
              id="dismiss-floating-book-ticket-button"
              onClick={(e) => {
                e.stopPropagation();
                setIsDismissed(true);
              }}
              onPointerDown={(e) => {
                e.stopPropagation();
              }}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#EA580C] hover:bg-rose-600 text-white border-2 border-white shadow-md flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer z-10"
              title="Close & Disappear button"
              aria-label="Disappear Book Ticket button"
            >
              <X className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>
        </div>
      )}

      {/* Discreet restore button if floating button was dismissed */}
      {isDismissed && !isOpen && (
        <button
          onClick={() => {
            setIsDismissed(false);
            setPosition(getDefaultPosition());
          }}
          className="fixed bottom-5 left-4 z-40 px-3 py-1.5 rounded-xl bg-[#0B2545] hover:bg-[#002244] text-white border border-[#EA580C]/60 shadow-lg flex items-center gap-2 text-xs font-semibold backdrop-blur-xs transition-all hover:scale-105 active:scale-95"
          title="Restore Draggable Book Ticket Button to default position"
        >
          <Ticket className="w-3.5 h-3.5 text-[#EA580C]" />
          <span>Restore Book Ticket</span>
        </button>
      )}

      {/* Floating Railway Ticket Modal Window */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all duration-300 ${
            isMinimized
              ? 'bottom-6 left-6 right-auto top-auto max-w-md w-full'
              : 'inset-0 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs'
          }`}
        >
          {/* Backdrop for expanded modal */}
          {!isMinimized && (
            <div
              className="fixed inset-0"
              onClick={() => setIsOpen(false)}
            />
          )}

          <div
            role="dialog"
            aria-label="Floating Railway Ticket Booking"
            className={`relative w-full max-w-xl mx-auto rounded-2xl shadow-2xl border border-slate-200 dark:border-[#1E3A5F] overflow-hidden transition-all duration-300 z-10 ${
              isMinimized ? 'h-16 shadow-2xl ring-2 ring-[#EA580C]/40' : 'max-h-[90vh] overflow-y-auto'
            } bg-white dark:bg-[#0B1E38] text-slate-900 dark:text-[#F8FAFC]`}
          >
            {/* Authentic Indian Railways Ticket Header Bar */}
            <div className="bg-[#0B2545] p-3 sm:px-4 border-b-2 border-[#EA580C] flex items-center justify-between text-white">
              <div className="flex items-center gap-2.5">
                {/* Indian Railways Emblem Motif */}
                <div className="w-9 h-9 rounded-lg bg-[#EA580C] flex items-center justify-center text-white shadow-sm">
                  <Train className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-black text-white tracking-wide font-ticket">
                      भारतीय रेल • INDIAN RAILWAYS
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#EA580C] text-white font-bold uppercase font-mono">
                      FAIRFLOW PRS
                    </span>
                  </div>
                  <div className="text-[10px] text-blue-200 font-sans flex items-center gap-1">
                    <span>ई-आरक्षण पर्ची / ELECTRONIC RESERVATION SLIP (ERS)</span>
                    <span>•</span>
                    <span className="text-emerald-300 font-medium">शुभयात्रा / HAPPY JOURNEY</span>
                  </div>
                </div>
              </div>

              {/* Window Controls */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1 rounded-lg hover:bg-white/10 text-slate-200 hover:text-white"
                  title={isMinimized ? 'Expand Ticket' : 'Minimize Ticket'}
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg hover:bg-rose-600 text-slate-200 hover:text-white"
                  title="Close Ticket Window"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <div className="p-4 sm:p-5 space-y-4 text-xs font-sans">
                {/* Quota Switcher Strip (General, Reservation, Tatkal, Premium Tatkal, Ladies) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-sans">
                    <span className="font-bold text-[#0B2545] flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-[#EA580C]" />
                      <span>SELECT QUOTA / कोटा का चयन करें:</span>
                    </span>
                    <span className="text-[10px] text-slate-600 font-sans">
                      Active: <strong className="text-[#EA580C]">{quotaCodes[selectedQuota].label} ({quotaCodes[selectedQuota].code})</strong>
                    </span>
                  </div>

                  {/* 5 Authentic Railway Quotas */}
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                    {(['GENERAL', 'RESERVATION', 'TATKAL', 'PREMIUM_TATKAL', 'LADIES'] as RailwayQuota[]).map((q) => {
                      const isSelected = selectedQuota === q;
                      const info = quotaCodes[q];
                      return (
                        <button
                          key={q}
                          type="button"
                          onClick={() => setSelectedQuota(q)}
                          className={`p-2 rounded-xl text-center border transition-all flex flex-col items-center justify-center ${
                            isSelected
                              ? 'bg-[#EA580C] text-white border-[#C2410C] shadow-md font-bold'
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          <span className="text-[11px] font-extrabold font-mono tracking-wider">{info.code}</span>
                          <span className="text-[9px] truncate w-full font-sans">{info.label}</span>
                          <span className="text-[8px] opacity-75 font-sans hidden sm:inline">{info.hindi}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Simulated Computerized Railway Ticket Canvas (Pale Green Paper) */}
                <div className="relative rounded-xl railway-ticket-paper bg-[#F0FDF4] text-slate-900 p-4 border border-emerald-300 dark:border-emerald-800 shadow-xs font-sans space-y-3 overflow-hidden">
                  {/* Watermark in background */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5 select-none">
                    <span className="text-5xl font-black rotate-[-25deg] text-emerald-950 uppercase">
                      INDIAN RAILWAYS • भारतीय रेल
                    </span>
                  </div>

                  {/* Ticket Header & PNR Strip */}
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-dashed border-emerald-600/30 pb-2 text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-900 font-bold">पी.एन.आर / PNR:</span>
                      <span className="bg-[#0B2545] text-amber-300 px-2.5 py-0.5 rounded font-mono font-bold tracking-widest text-xs">
                        {pnrNumber}
                      </span>
                    </div>
                    <div className="text-[10px] text-emerald-900 font-semibold flex items-center gap-2 mt-1 sm:mt-0">
                      <span>QUOTA: <strong className="text-[#EA580C]">{quotaCodes[selectedQuota].code}</strong></span>
                      <span>•</span>
                      <span>DATE: <strong>TOMORROW</strong></span>
                    </div>
                  </div>

                  {/* Train and Journey Details (Bilingual Indian Railways PRS format) */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-1 text-[11px] border-b border-dashed border-emerald-600/30">
                    <div>
                      <div className="text-[9px] text-emerald-800 uppercase font-semibold">गाड़ी सं. एवं नाम / Train No & Name</div>
                      <select
                        value={selectedTrain}
                        onChange={(e) => setSelectedTrain(e.target.value)}
                        className="w-full bg-white border border-emerald-300 rounded p-1 text-[11px] font-bold text-slate-900 focus:outline-none"
                      >
                        {trains.map((t) => (
                          <option key={t.no} value={t.no}>
                            {t.no} - {t.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <div className="text-[9px] text-emerald-800 uppercase font-semibold">प्रस्थान / From Station (Dep)</div>
                      <div className="font-bold text-slate-900 truncate">
                        {currentTrain.from} • {currentTrain.dep}
                      </div>
                    </div>

                    <div>
                      <div className="text-[9px] text-emerald-800 uppercase font-semibold">गंतव्य / To Station (Arr)</div>
                      <div className="font-bold text-slate-900 truncate">
                        {currentTrain.to} • {currentTrain.arr}
                      </div>
                    </div>
                  </div>

                  {/* Class, Distance, Quota Indicator */}
                  <div className="grid grid-cols-3 gap-2 text-[10px] py-1 border-b border-dashed border-emerald-600/30">
                    <div>
                      <span className="text-emerald-800 block font-semibold">श्रेणी / CLASS:</span>
                      <select
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                        className="bg-white border border-emerald-300 rounded px-1.5 py-0.5 font-bold text-slate-900 focus:outline-none"
                      >
                        <option value="3A">3A (AC 3-Tier)</option>
                        <option value="2A">2A (AC 2-Tier)</option>
                        <option value="1A">1A (First AC)</option>
                        <option value="SL">SL (Sleeper Class)</option>
                        <option value="CC">CC (AC Chair Car)</option>
                      </select>
                    </div>
                    <div>
                      <span className="text-emerald-800 block font-semibold">दूरी / DISTANCE:</span>
                      <span className="font-bold text-slate-900">{currentTrain.distance}</span>
                    </div>
                    <div>
                      <span className="text-emerald-800 block font-semibold">कोटा स्थिति / QUOTA STATUS:</span>
                      <span
                        className={`px-1.5 py-0.5 rounded font-bold text-[9px] ${
                          selectedQuota === 'TATKAL'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : selectedQuota === 'PREMIUM_TATKAL'
                            ? 'bg-purple-100 text-purple-900 border border-purple-300'
                            : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        }`}
                      >
                        {selectedQuota === 'TATKAL' ? 'AVAILABLE 120 (POOL A)' : 'CONFIRMED (CNF)'}
                      </span>
                    </div>
                  </div>

                  {/* Passenger Reservation Table (Classic Indian Railways layout) */}
                  <div className="space-y-1 py-1">
                    <div className="text-[10px] font-bold text-emerald-950 flex justify-between">
                      <span>यात्री विवरण / PASSENGER DETAILS:</span>
                      <span className="text-emerald-800 text-[9px] font-semibold">1 ADULT</span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-[10px] border border-emerald-300 bg-white rounded">
                        <thead className="bg-emerald-50 border-b border-emerald-200 text-emerald-900 font-bold">
                          <tr>
                            <th className="p-1">क्र / S.No</th>
                            <th className="p-1">नाम / Name</th>
                            <th className="p-1">आयु / Age</th>
                            <th className="p-1">लिंग / Sex</th>
                            <th className="p-1">बर्थ / Berth</th>
                            <th className="p-1">स्थिति / Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-emerald-100 text-slate-900 font-medium">
                          <tr>
                            <td className="p-1 font-bold">1</td>
                            <td className="p-1">
                              <input
                                type="text"
                                value={passengerName}
                                onChange={(e) => setPassengerName(e.target.value)}
                                className="bg-slate-50 border border-slate-300 rounded px-1.5 py-0.5 w-28 text-[10px] font-bold text-slate-900"
                              />
                            </td>
                            <td className="p-1">
                              <input
                                type="number"
                                value={passengerAge}
                                onChange={(e) => setPassengerAge(e.target.value)}
                                className="bg-slate-50 border border-slate-300 rounded px-1 w-10 text-[10px] font-bold text-slate-900"
                              />
                            </td>
                            <td className="p-1 font-bold">F</td>
                            <td className="p-1">
                              <select
                                value={berthPreference}
                                onChange={(e) => setBerthPreference(e.target.value)}
                                className="bg-slate-50 border border-slate-300 rounded text-[9px] p-0.5 text-slate-900"
                              >
                                <option value="LOWER">Lower (LB)</option>
                                <option value="MIDDLE">Middle (MB)</option>
                                <option value="UPPER">Upper (UB)</option>
                                <option value="SIDE LOWER">Side Lower (SLB)</option>
                              </select>
                            </td>
                            <td className="p-1">
                              {selectedQuota === 'TATKAL' ? (
                                <span className="text-[#EA580C] font-bold">CNF / B3 / 21 (TQ)</span>
                              ) : (
                                <span className="text-emerald-700 font-bold">CNF / B4 / 14 (GN)</span>
                              )}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Fare Breakdown */}
                  <div className="flex justify-between items-center bg-white p-2.5 rounded border border-emerald-200 text-[11px]">
                    <div>
                      <div className="text-[9px] text-slate-600">
                        मूल किराया ₹{basePrice} + {quotaCodes[selectedQuota].code} प्रभार ₹{tatkalExtra} + जीएसटी ₹{gst}
                      </div>
                      <div className="text-[#0B2545] font-bold text-xs">
                        कुल किराया / TOTAL FARE: <span className="text-base text-[#EA580C] font-black">₹ {totalFare}</span>
                      </div>
                    </div>
                    <div className="text-right text-[9px] text-slate-600 font-sans">
                      <div>FairFlow Zero Bot Fee: ₹0</div>
                      <div className="text-emerald-700 font-bold">IRCTC PG Synthetic</div>
                    </div>
                  </div>

                  {/* Anti-Bot FairFlow Protection Stamp */}
                  <div className="pt-1 flex items-center justify-between text-[10px] text-emerald-900 border-t border-dashed border-emerald-600/30">
                    <div className="flex items-center gap-1.5 font-bold">
                      <ShieldCheck className="w-4 h-4 text-emerald-700" />
                      <span>FAIRFLOW QUEUE GATE: 100% BOT MONOPOLY RESISTANT</span>
                    </div>
                    <div className="font-mono text-[9px] text-emerald-800">
                      SECURE TOKEN: {pnrNumber.slice(-6)}
                    </div>
                  </div>
                </div>

                {/* Tatkal Opening Notice if Tatkal Selected */}
                {selectedQuota === 'TATKAL' && (
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-center justify-between font-sans">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#EA580C] shrink-0" />
                      <span>
                        <strong>Tatkal Window:</strong> AC Tatkal pre-registration opens at 10:00 AM. FairFlow eliminates
                        the 10:00:01 AM server crash!
                      </span>
                    </div>
                    <span className="font-mono text-[#EA580C] font-bold text-xs shrink-0">120 Seats</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-2 flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={handleCreateIndianRailwayTicket}
                    className="flex-1 py-3 px-4 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md uppercase transition-all"
                  >
                    {bookingSuccess ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-white" />
                        <span>Ticket Generated • Launching Gate...</span>
                      </>
                    ) : (
                      <>
                        <Train className="w-4 h-4 text-white" />
                        <span>Book Synthetic E-Ticket ({quotaCodes[selectedQuota].code})</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setPassengerName('Rajesh Kumar');
                      setPassengerAge('42');
                      setSelectedQuota('TATKAL');
                      setSelectedClass('3A');
                    }}
                    className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-sans flex items-center justify-center gap-1 border border-slate-200"
                    title="Load sample passenger details"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
