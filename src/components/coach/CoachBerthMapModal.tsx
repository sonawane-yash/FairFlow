import React, { useState, useMemo } from 'react';
import {
  Train,
  X,
  Check,
  User,
  Users,
  Info,
  Maximize2,
  Minimize2,
  ChevronRight,
  Shield,
  Zap,
  CheckCircle2,
  AlertCircle,
  Eye,
  SlidersHorizontal,
  BookmarkCheck
} from 'lucide-react';
import { PassengerSeatAssignment, PassengerInfo } from '../../types';

export interface CoachBerthMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  trainNumber?: string;
  trainName?: string;
  travelClass?: string;
  activeQuota?: string;
  passengers?: PassengerInfo[];
  selectedSeats: PassengerSeatAssignment[];
  onSelectBerth?: (seat: PassengerSeatAssignment) => void;
  onRemoveBerth?: (passengerIndex: number) => void;
  highlightCoach?: string;
  highlightBerth?: number;
  readOnly?: boolean;
}

interface BerthSlot {
  seatNumber: number;
  berthCode: string;
  berthType: string;
  hindiLabel: string;
  bayNumber: number;
  isSide: boolean;
  isWindow: boolean;
  isEmergencyExit: boolean;
  status: 'available' | 'occupied' | 'tatkal' | 'ladies' | 'senior';
  hasPowerSocket: boolean;
}

export const CoachBerthMapModal: React.FC<CoachBerthMapModalProps> = ({
  isOpen,
  onClose,
  trainNumber = '12952',
  trainName = 'Mumbai Tejas Rajdhani Express',
  travelClass = '3A',
  activeQuota = 'TATKAL',
  passengers = [],
  selectedSeats,
  onSelectBerth,
  onRemoveBerth,
  highlightCoach,
  highlightBerth,
  readOnly = false
}) => {
  if (!isOpen) return null;

  // Normalized Travel Class
  const normalizedClass = useMemo(() => {
    const c = travelClass.toUpperCase();
    if (c.includes('1A') || c.includes('FIRST')) return '1A';
    if (c.includes('2A') || c.includes('2 TIER')) return '2A';
    if (c.includes('CC') || c.includes('CHAIR') || c.includes('VANDE')) return 'CC';
    if (c.includes('SL') || c.includes('SLEEPER')) return 'SL';
    return '3A';
  }, [travelClass]);

  // Coach lists per class
  const coachList = useMemo(() => {
    switch (normalizedClass) {
      case '1A':
        return [
          { code: 'H1', label: 'AC First Class (1A)', totalBerths: 24, available: 6 },
          { code: 'HA1', label: 'Composite 1A/2A', totalBerths: 28, available: 8 }
        ];
      case '2A':
        return [
          { code: 'A1', label: 'AC 2-Tier (2A)', totalBerths: 54, available: 14 },
          { code: 'A2', label: 'AC 2-Tier (2A)', totalBerths: 54, available: 9 },
          { code: 'A3', label: 'AC 2-Tier (2A)', totalBerths: 54, available: 18 }
        ];
      case 'CC':
        return [
          { code: 'C1', label: 'AC Chair Car', totalBerths: 78, available: 26 },
          { code: 'C2', label: 'AC Chair Car', totalBerths: 78, available: 31 },
          { code: 'C3', label: 'AC Chair Car', totalBerths: 78, available: 19 },
          { code: 'C4', label: 'AC Chair Car', totalBerths: 78, available: 22 }
        ];
      case 'SL':
        return [
          { code: 'S1', label: 'Sleeper Class (SL)', totalBerths: 72, available: 12 },
          { code: 'S2', label: 'Sleeper Class (SL)', totalBerths: 72, available: 8 },
          { code: 'S3', label: 'Sleeper Class (SL)', totalBerths: 72, available: 16 },
          { code: 'S4', label: 'Sleeper Class (SL)', totalBerths: 72, available: 21 },
          { code: 'S5', label: 'Sleeper Class (SL)', totalBerths: 72, available: 14 }
        ];
      case '3A':
      default:
        return [
          { code: 'B1', label: 'AC 3-Tier (3A)', totalBerths: 72, available: 18 },
          { code: 'B2', label: 'AC 3-Tier (3A)', totalBerths: 72, available: 14 },
          { code: 'B3', label: 'AC 3-Tier (Tatkal Rake)', totalBerths: 72, available: 24 },
          { code: 'B4', label: 'AC 3-Tier (3A)', totalBerths: 72, available: 19 },
          { code: 'B5', label: 'AC 3-Tier (3A)', totalBerths: 72, available: 12 }
        ];
    }
  }, [normalizedClass]);

  const [activeCoach, setActiveCoach] = useState<string>(() => {
    if (highlightCoach && coachList.some((c) => c.code === highlightCoach)) {
      return highlightCoach;
    }
    if (activeQuota === 'TATKAL' && coachList.some((c) => c.code === 'B3')) {
      return 'B3';
    }
    return coachList[0]?.code || 'B1';
  });

  const [selectedBerthPreview, setSelectedBerthPreview] = useState<BerthSlot | null>(null);
  const [activePassengerIndex, setActivePassengerIndex] = useState<number>(0);
  const [filterBerthType, setFilterBerthType] = useState<string>('ALL');

  // Generate Berths for active coach
  const berths: BerthSlot[] = useMemo(() => {
    const list: BerthSlot[] = [];
    const count = coachList.find((c) => c.code === activeCoach)?.totalBerths || 72;

    if (normalizedClass === '1A') {
      // 1A layout: 6 cabins (4-berth) and 2 coupes (2-berth) = 24 berths
      let seatNum = 1;
      for (let bay = 1; bay <= 6; bay++) {
        const isCoupe = bay >= 5;
        const berthsInBay = isCoupe ? 2 : 4;
        for (let b = 1; b <= berthsInBay; b++) {
          const isLower = b % 2 === 1;
          const isEmergency = seatNum === 1 || seatNum === 24;
          const isBooked = !isEmergency && (seatNum % 3 === 0 || seatNum === 7 || seatNum === 14);
          list.push({
            seatNumber: seatNum,
            berthCode: isLower ? 'LB' : 'UB',
            berthType: isCoupe ? (isLower ? 'Coupe Lower' : 'Coupe Upper') : (isLower ? 'Cabin Lower' : 'Cabin Upper'),
            hindiLabel: isCoupe ? 'कूप' : 'केबिन',
            bayNumber: bay,
            isSide: false,
            isWindow: isLower,
            isEmergencyExit: isEmergency,
            status: isBooked ? 'occupied' : 'available',
            hasPowerSocket: true
          });
          seatNum++;
        }
      }
      return list;
    }

    if (normalizedClass === 'CC') {
      // Chair Car layout: 78 seats across 16 rows (3x2 configuration)
      const seatTypes = ['Window (WS)', 'Middle (MS)', 'Aisle (AS)', 'Aisle (AS)', 'Window (WS)'];
      const codes = ['WS', 'MS', 'AS', 'AS', 'WS'];
      let seatNum = 1;
      for (let row = 1; row <= 16; row++) {
        for (let col = 0; col < 5; col++) {
          if (seatNum > count) break;
          const isBooked = (seatNum * 7) % 5 === 0 || seatNum === 12 || seatNum === 28;
          const isWindow = col === 0 || col === 4;
          list.push({
            seatNumber: seatNum,
            berthCode: codes[col],
            berthType: seatTypes[col],
            hindiLabel: isWindow ? 'खिड़की सीट' : 'कुर्सी',
            bayNumber: row,
            isSide: col >= 3,
            isWindow,
            isEmergencyExit: row === 1 || row === 8 || row === 16,
            status: isBooked ? 'occupied' : 'available',
            hasPowerSocket: row % 2 === 1
          });
          seatNum++;
        }
      }
      return list;
    }

    // 2A, 3A, SL layout (Compartment Bays with Main Bay + Side Bay)
    // 3A/SL: 8 berths per bay (1..6 main + 7..8 side)
    // 2A: 6 berths per bay (1..4 main + 5..6 side)
    const is2A = normalizedClass === '2A';
    const berthsPerBay = is2A ? 6 : 8;
    const totalBays = Math.ceil(count / berthsPerBay);

    let curSeat = 1;
    for (let bay = 1; bay <= totalBays; bay++) {
      for (let pos = 1; pos <= berthsPerBay; pos++) {
        if (curSeat > count) break;

        let code = 'LB';
        let typeName = 'Lower Berth';
        let hindi = 'निचली बर्थ';
        let isSide = false;
        let isWindow = false;

        if (is2A) {
          // 2A: 1:LB, 2:UB, 3:LB, 4:UB, 5:SL, 6:SU
          if (pos === 1 || pos === 3) {
            code = 'LB';
            typeName = 'Lower Berth';
            hindi = 'निचली बर्थ';
            isWindow = true;
          } else if (pos === 2 || pos === 4) {
            code = 'UB';
            typeName = 'Upper Berth';
            hindi = 'ऊपरी बर्थ';
          } else if (pos === 5) {
            code = 'SL';
            typeName = 'Side Lower';
            hindi = 'साइड लोअर';
            isSide = true;
            isWindow = true;
          } else {
            code = 'SU';
            typeName = 'Side Upper';
            hindi = 'साइड अपर';
            isSide = true;
          }
        } else {
          // 3A / SL: 1:LB, 2:MB, 3:UB, 4:LB, 5:MB, 6:UB, 7:SL, 8:SU
          if (pos === 1 || pos === 4) {
            code = 'LB';
            typeName = 'Lower Berth';
            hindi = 'निचली बर्थ';
            isWindow = true;
          } else if (pos === 2 || pos === 5) {
            code = 'MB';
            typeName = 'Middle Berth';
            hindi = 'मध्य बर्थ';
          } else if (pos === 3 || pos === 6) {
            code = 'UB';
            typeName = 'Upper Berth';
            hindi = 'ऊपरी बर्थ';
          } else if (pos === 7) {
            code = 'SL';
            typeName = 'Side Lower';
            hindi = 'साइड लोअर';
            isSide = true;
            isWindow = true;
          } else {
            code = 'SU';
            typeName = 'Side Upper';
            hindi = 'साइड अपर';
            isSide = true;
          }
        }

        const isEmergency = curSeat === 1 || curSeat === count || curSeat === 32;
        // Deterministic status based on seat number
        let status: BerthSlot['status'] = 'available';
        if ((curSeat * 11) % 7 === 0 || curSeat === 19 || curSeat === 45) {
          status = 'occupied';
        } else if (activeQuota === 'LADIES' && (curSeat === 1 || curSeat === 4 || curSeat === 7)) {
          status = 'ladies';
        } else if (curSeat === 2 || curSeat === 5) {
          status = 'senior';
        }

        list.push({
          seatNumber: curSeat,
          berthCode: code,
          berthType: typeName,
          hindiLabel: hindi,
          bayNumber: bay,
          isSide,
          isWindow,
          isEmergencyExit: isEmergency,
          status,
          hasPowerSocket: true
        });

        curSeat++;
      }
    }

    return list;
  }, [coachList, activeCoach, normalizedClass, activeQuota]);

  // Handle Berth Selection
  const handleBerthClick = (berth: BerthSlot) => {
    if (readOnly) {
      setSelectedBerthPreview(berth);
      return;
    }

    if (berth.status === 'occupied') {
      setSelectedBerthPreview(berth);
      return;
    }

    setSelectedBerthPreview(berth);

    if (!onSelectBerth) return;

    // Check if this berth is already selected
    const existingIndex = selectedSeats.findIndex(
      (s) => s.coach === activeCoach && s.seatNumber === berth.seatNumber
    );

    if (existingIndex >= 0) {
      // Toggle off / remove
      if (onRemoveBerth) {
        onRemoveBerth(selectedSeats[existingIndex].passengerIndex);
      }
      return;
    }

    // Assign to active passenger
    const targetPassenger = passengers[activePassengerIndex] || {
      name: `Passenger ${activePassengerIndex + 1}`,
      age: 28,
      gender: 'M'
    };

    const newAssignment: PassengerSeatAssignment = {
      passengerIndex: activePassengerIndex,
      passengerName: targetPassenger.name,
      coach: activeCoach,
      seatNumber: berth.seatNumber,
      berthType: berth.berthType,
      berthCode: berth.berthCode,
      bayNumber: berth.bayNumber
    };

    onSelectBerth(newAssignment);

    // Auto-advance to next passenger if more passengers exist
    if (passengers.length > 0 && activePassengerIndex < passengers.length - 1) {
      setActivePassengerIndex((prev) => prev + 1);
    }
  };

  // Group berths by bay
  const bayNumbers = useMemo(() => {
    const set = new Set<number>();
    berths.forEach((b) => set.add(b.bayNumber));
    return Array.from(set).sort((a, b) => a - b);
  }, [berths]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#0B2545] border-2 border-[#EA580C] rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl text-white font-ticket overflow-hidden">
        {/* Top Header - Indian Railways Station Board Aesthetic */}
        <div className="px-4 sm:px-6 py-4 bg-[#001D3D] border-b border-blue-900 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EA580C] text-white flex items-center justify-center shadow-md shrink-0">
              <Train className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-black text-white">
                  भारतीय रेल • {trainNumber} {trainName}
                </span>
                <span className="px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-mono text-[10px] font-black uppercase">
                  {normalizedClass} CLASS
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-sans">
                Interactive Coach & Berth Visual Architecture • Quota: <strong className="text-amber-300">{activeQuota}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-blue-950/80 hover:bg-rose-900/80 text-slate-300 hover:text-white border border-blue-800 transition-colors"
            title="Close Coach Map (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Coach Selector Ribbon */}
        <div className="px-4 sm:px-6 py-2.5 bg-[#07162C] border-b border-blue-950 flex items-center justify-between gap-4 overflow-x-auto scrollbar-none shrink-0">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[11px] font-bold text-amber-300 uppercase mr-1">Coaches:</span>
            {coachList.map((c) => {
              const isActive = activeCoach === c.code;
              const isHighlighted = highlightCoach === c.code;
              return (
                <button
                  key={c.code}
                  onClick={() => setActiveCoach(c.code)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-[#EA580C] text-white shadow-sm ring-2 ring-amber-300'
                      : 'bg-[#001D3D] text-slate-300 hover:bg-blue-900/60 border border-blue-800/80'
                  }`}
                >
                  <span>{c.code}</span>
                  {isHighlighted && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />}
                  <span className="text-[9px] opacity-80">({c.available} vac)</span>
                </button>
              );
            })}
          </div>

          {/* Quick Filter */}
          <div className="hidden md:flex items-center gap-1 shrink-0 text-xs font-sans">
            <span className="text-[11px] text-slate-400 mr-1">Filter:</span>
            {['ALL', 'LB', 'MB', 'UB', 'SL', 'SU'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterBerthType(type)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono transition-colors ${
                  filterBerthType === type
                    ? 'bg-amber-400 text-slate-950'
                    : 'text-slate-300 hover:bg-blue-900/50'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Passenger Assignment Ribbon (When booking with multiple passengers) */}
        {!readOnly && passengers.length > 0 && (
          <div className="px-4 sm:px-6 py-2 bg-[#0B2545] border-b border-blue-900 flex items-center justify-between gap-3 text-xs overflow-x-auto scrollbar-none shrink-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-amber-300 uppercase text-[10px]">Assign Berth for:</span>
              <div className="flex items-center gap-1.5">
                {passengers.map((p, idx) => {
                  const assigned = selectedSeats.find((s) => s.passengerIndex === idx);
                  const isCurrent = activePassengerIndex === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => setActivePassengerIndex(idx)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 border ${
                        isCurrent
                          ? 'bg-white text-[#0B2545] border-amber-400 shadow-sm'
                          : assigned
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600/80'
                          : 'bg-[#001D3D] text-slate-300 border-blue-800'
                      }`}
                    >
                      <User className="w-3 h-3" />
                      <span>{p.name.split(' ')[0]}</span>
                      {assigned ? (
                        <span className="font-mono text-[9px] bg-emerald-500/20 px-1 rounded text-emerald-300">
                          {assigned.coach}-{assigned.seatNumber}
                        </span>
                      ) : (
                        <span className="text-amber-400 text-[10px]">•</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="text-[11px] text-slate-300 font-sans hidden sm:block">
              {selectedSeats.length} of {passengers.length} berths assigned
            </div>
          </div>
        )}

        {/* Coach Layout Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Station Departure Board Legend */}
          <div className="p-3 rounded-xl bg-[#001D3D] border border-blue-900/80 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-emerald-600 border border-emerald-400 inline-block shadow-2xs" />
                <span className="text-slate-200">Available</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-amber-400 border border-amber-300 text-slate-950 font-bold flex items-center justify-center text-[9px]">
                  ✓
                </span>
                <span className="text-amber-300 font-bold">Your Selection</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-slate-700 border border-slate-600 inline-block opacity-60" />
                <span className="text-slate-400">Booked / Occupied</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-purple-900 border border-purple-500 inline-block" />
                <span className="text-purple-300">Senior Citizen / Ladies</span>
              </span>
            </div>

            <div className="text-[11px] text-amber-200 font-mono">
              Coach: <strong className="text-white font-bold">{activeCoach}</strong> • Layout: Indian Railways LHB Standard
            </div>
          </div>

          {/* Coach Exterior Frame Simulation */}
          <div className="rounded-2xl bg-[#001428] border-2 border-blue-700/80 p-4 sm:p-6 space-y-4 shadow-inner relative overflow-hidden">
            {/* Coach Label & Door indicators */}
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono border-b border-blue-900/80 pb-3">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-blue-900/80 text-blue-200 font-bold">
                  DOOR 1 / VESTIBULE ◄
                </span>
                <span className="text-[10px] text-slate-400">Lavatory A & B</span>
              </div>
              <div className="font-bold text-amber-400 tracking-wider uppercase font-ticket text-sm">
                INDIAN RAILWAYS COACH {activeCoach} ({normalizedClass})
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400">Lavatory C & D</span>
                <span className="px-2 py-0.5 rounded bg-blue-900/80 text-blue-200 font-bold">
                  ► DOOR 2 / VESTIBULE
                </span>
              </div>
            </div>

            {/* Bays Architecture */}
            <div className="space-y-4">
              {bayNumbers.map((bayNum) => {
                const bayBerths = berths.filter((b) => b.bayNumber === bayNum);
                const mainBerths = bayBerths.filter((b) => !b.isSide);
                const sideBerths = bayBerths.filter((b) => b.isSide);

                return (
                  <div
                    key={bayNum}
                    className="p-3.5 rounded-xl bg-[#001D3D] border border-blue-900 flex flex-col md:flex-row items-stretch justify-between gap-4"
                  >
                    {/* Bay Number Header */}
                    <div className="flex md:flex-col justify-between items-center md:justify-center p-2 rounded-lg bg-[#07162C] border border-blue-950 md:w-16 shrink-0">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Bay</span>
                      <span className="text-lg font-black text-amber-400 font-mono">#{bayNum}</span>
                      <span className="text-[9px] text-slate-500 font-mono">
                        {mainBerths[0]?.seatNumber}–{bayBerths[bayBerths.length - 1]?.seatNumber}
                      </span>
                    </div>

                    {/* Main Compartment Berths (Left Side) */}
                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 px-1 font-mono">
                        <span>Window (Window Seat / LB)</span>
                        <span>Compartment Berths</span>
                        <span>Aisle Side</span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                        {mainBerths.map((berth) => {
                          const isSelected = selectedSeats.some(
                            (s) => s.coach === activeCoach && s.seatNumber === berth.seatNumber
                          );
                          const isHighlighted =
                            highlightCoach === activeCoach && highlightBerth === berth.seatNumber;
                          const matchesFilter =
                            filterBerthType === 'ALL' || berth.berthCode === filterBerthType;

                          let bgClass = 'bg-[#0B2545] border-blue-800 text-slate-200 hover:border-amber-400';
                          if (isSelected) {
                            bgClass = 'bg-amber-400 border-amber-300 text-slate-950 ring-2 ring-white shadow-md scale-102';
                          } else if (isHighlighted) {
                            bgClass = 'bg-emerald-600 border-emerald-400 text-white animate-pulse ring-2 ring-emerald-300';
                          } else if (berth.status === 'occupied') {
                            bgClass = 'bg-slate-800/60 border-slate-700/60 text-slate-500 cursor-not-allowed opacity-50';
                          } else if (berth.status === 'ladies') {
                            bgClass = 'bg-purple-950/80 border-purple-600 text-purple-200 hover:border-purple-400';
                          } else if (berth.status === 'senior') {
                            bgClass = 'bg-indigo-950/80 border-indigo-600 text-indigo-200 hover:border-indigo-400';
                          }

                          return (
                            <button
                              key={berth.seatNumber}
                              type="button"
                              onClick={() => handleBerthClick(berth)}
                              disabled={berth.status === 'occupied' && !readOnly}
                              className={`p-2 rounded-lg border text-left transition-all relative flex flex-col justify-between h-16 ${bgClass} ${
                                !matchesFilter ? 'opacity-30' : ''
                              }`}
                            >
                              <div className="flex items-center justify-between w-full">
                                <span className="font-mono font-black text-sm">{berth.seatNumber}</span>
                                <span
                                  className={`text-[9px] font-mono font-bold px-1 rounded uppercase ${
                                    isSelected
                                      ? 'bg-slate-900 text-amber-300'
                                      : 'bg-blue-900/60 text-amber-300'
                                  }`}
                                >
                                  {berth.berthCode}
                                </span>
                              </div>

                              <div className="text-[10px] leading-tight">
                                <div className="truncate font-semibold">{berth.berthType.split(' ')[0]}</div>
                                <div className="text-[9px] opacity-75 font-sans">{berth.hindiLabel}</div>
                              </div>

                              {berth.isWindow && (
                                <div className="absolute top-1 right-1 text-[8px] text-blue-300" title="Window View">
                                  🪟
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Gangway Corridor Divider */}
                    <div className="hidden md:flex flex-col items-center justify-center px-2 border-x border-dashed border-blue-800/60 text-[9px] font-mono text-slate-500 uppercase tracking-widest select-none">
                      <span>G</span>
                      <span>A</span>
                      <span>N</span>
                      <span>G</span>
                      <span>W</span>
                      <span>A</span>
                      <span>Y</span>
                    </div>

                    {/* Side Berths (Right Side) */}
                    {sideBerths.length > 0 && (
                      <div className="md:w-44 space-y-1.5 shrink-0">
                        <div className="text-[10px] text-slate-400 px-1 font-mono text-right">
                          Side Corridor (SL / SU)
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          {sideBerths.map((berth) => {
                            const isSelected = selectedSeats.some(
                              (s) => s.coach === activeCoach && s.seatNumber === berth.seatNumber
                            );
                            const isHighlighted =
                              highlightCoach === activeCoach && highlightBerth === berth.seatNumber;
                            const matchesFilter =
                              filterBerthType === 'ALL' || berth.berthCode === filterBerthType;

                            let bgClass = 'bg-[#0B2545] border-blue-800 text-slate-200 hover:border-amber-400';
                            if (isSelected) {
                              bgClass = 'bg-amber-400 border-amber-300 text-slate-950 ring-2 ring-white shadow-md scale-102';
                            } else if (isHighlighted) {
                              bgClass = 'bg-emerald-600 border-emerald-400 text-white animate-pulse ring-2 ring-emerald-300';
                            } else if (berth.status === 'occupied') {
                              bgClass = 'bg-slate-800/60 border-slate-700/60 text-slate-500 cursor-not-allowed opacity-50';
                            }

                            return (
                              <button
                                key={berth.seatNumber}
                                type="button"
                                onClick={() => handleBerthClick(berth)}
                                disabled={berth.status === 'occupied' && !readOnly}
                                className={`p-2 rounded-lg border text-left transition-all relative flex flex-col justify-between h-16 ${bgClass} ${
                                  !matchesFilter ? 'opacity-30' : ''
                                }`}
                              >
                                <div className="flex items-center justify-between w-full">
                                  <span className="font-mono font-black text-sm">{berth.seatNumber}</span>
                                  <span
                                    className={`text-[9px] font-mono font-bold px-1 rounded uppercase ${
                                      isSelected
                                        ? 'bg-slate-900 text-amber-300'
                                        : 'bg-blue-900/60 text-amber-300'
                                    }`}
                                  >
                                    {berth.berthCode}
                                  </span>
                                </div>
                                <div className="text-[10px] leading-tight">
                                  <div className="truncate font-semibold">{berth.berthType.replace('Side ', '')}</div>
                                  <div className="text-[9px] opacity-75 font-sans">{berth.hindiLabel}</div>
                                </div>
                                {berth.isWindow && (
                                  <div className="absolute top-1 right-1 text-[8px] text-blue-300" title="Window View">
                                    🪟
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Berth Preview Tooltip / Detail Box */}
          {selectedBerthPreview && (
            <div className="p-4 rounded-xl bg-[#001D3D] border border-amber-400 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg animate-in fade-in">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 font-black flex items-center justify-center text-base font-mono">
                  {selectedBerthPreview.seatNumber}
                </div>
                <div>
                  <div className="font-bold text-white text-sm">
                    Coach {activeCoach} • Berth {selectedBerthPreview.seatNumber} ({selectedBerthPreview.berthCode})
                  </div>
                  <div className="text-[11px] text-slate-300 font-sans">
                    {selectedBerthPreview.berthType} ({selectedBerthPreview.hindiLabel}) • Bay #{selectedBerthPreview.bayNumber}
                    {selectedBerthPreview.isWindow ? ' • Window Side' : ' • Gangway Side'}
                    {selectedBerthPreview.hasPowerSocket ? ' • 220V Mobile/Laptop Socket' : ''}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <span
                  className={`px-2.5 py-1 rounded text-[11px] font-bold font-mono uppercase ${
                    selectedBerthPreview.status === 'available'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-600'
                      : 'bg-rose-950 text-rose-300 border border-rose-600'
                  }`}
                >
                  {selectedBerthPreview.status.toUpperCase()}
                </span>
                {!readOnly && selectedBerthPreview.status !== 'occupied' && (
                  <button
                    onClick={() => handleBerthClick(selectedBerthPreview)}
                    className="px-4 py-1.5 rounded-lg bg-[#EA580C] hover:bg-[#D94E06] text-white font-bold text-xs uppercase transition-colors"
                  >
                    Select this Berth
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer Actions */}
        <div className="px-4 sm:px-6 py-3.5 bg-[#001D3D] border-t border-blue-900 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-300 flex items-center gap-2">
            <span className="font-bold text-amber-300">Selected Berths:</span>
            {selectedSeats.length === 0 ? (
              <span className="text-slate-400 italic">None selected yet</span>
            ) : (
              <div className="flex flex-wrap gap-1">
                {selectedSeats.map((s, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-600 text-emerald-300 font-mono text-[10px] font-bold"
                  >
                    {s.coach}-{s.seatNumber} ({s.berthCode})
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-[#EA580C] hover:bg-[#D94E06] text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-colors"
            >
              Confirm & Return to Ticket
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
