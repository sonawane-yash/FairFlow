import React, { useState, useMemo, useEffect } from 'react';
import {
  Train,
  Check,
  User,
  Users,
  Sparkles,
  Info,
  RotateCcw,
  Zap,
  Shield,
  Layers,
  ChevronRight,
  Maximize2,
  Minimize2,
  Armchair,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { PassengerInfo, PassengerSeatAssignment } from '../../types';

export interface RailwaySeatMapProps {
  passengers: PassengerInfo[];
  travelClass?: string;
  activeQuota?: string;
  appId?: string;
  selectedSeats: PassengerSeatAssignment[];
  onSeatsChange: (seats: PassengerSeatAssignment[]) => void;
  onAutoAssign?: () => void;
}

export type BerthCategory = 'ALL' | 'LOWER' | 'MIDDLE' | 'UPPER' | 'SIDE_LOWER' | 'SIDE_UPPER' | 'WINDOW' | 'AISLE';

interface BerthModel {
  seatNumber: number;
  berthCode: string; // LB, MB, UB, SL, SU, WS, MS, AS
  berthType: string;
  hindiLabel: string;
  bayNumber: number;
  isSide: boolean;
  isWindow: boolean;
  rowPosition: 'top' | 'middle' | 'bottom' | 'side-top' | 'side-bottom' | 'chair-left' | 'chair-right';
  status: 'available' | 'occupied' | 'tatkal' | 'ladies';
  powerSocket: boolean;
  hasReadingLight: boolean;
}

export const RailwaySeatMap: React.FC<RailwaySeatMapProps> = ({
  passengers,
  travelClass = '3A',
  activeQuota = 'TATKAL',
  appId = 'IR-APP-DEFAULT',
  selectedSeats,
  onSeatsChange,
}) => {
  // Normalize class
  const normalizedClass = useMemo(() => {
    const c = travelClass.toUpperCase();
    if (c.includes('1A') || c.includes('FIRST')) return '1A';
    if (c.includes('2A') || c.includes('2 TIER')) return '2A';
    if (c.includes('CC') || c.includes('CHAIR') || c.includes('VANDE')) return 'CC';
    if (c.includes('EC') || c.includes('EXECUTIVE')) return 'EC';
    if (c.includes('SL') || c.includes('SLEEPER')) return 'SL';
    return '3A'; // default 3A
  }, [travelClass]);

  // Coaches list for the class
  const coachList = useMemo(() => {
    switch (normalizedClass) {
      case '1A':
        return [
          { code: 'H1', label: 'AC First Class (1A)', berthsCount: 24 },
          { code: 'HA1', label: 'Composite 1A/2A', berthsCount: 28 },
        ];
      case '2A':
        return [
          { code: 'A1', label: 'AC 2-Tier (2A)', berthsCount: 54 },
          { code: 'A2', label: 'AC 2-Tier (2A)', berthsCount: 54 },
          { code: 'A3', label: 'AC 2-Tier (2A)', berthsCount: 54 },
        ];
      case 'CC':
        return [
          { code: 'C1', label: 'AC Chair Car', berthsCount: 78 },
          { code: 'C2', label: 'AC Chair Car', berthsCount: 78 },
          { code: 'C3', label: 'AC Chair Car', berthsCount: 78 },
          { code: 'C4', label: 'AC Chair Car', berthsCount: 78 },
        ];
      case 'EC':
        return [
          { code: 'E1', label: 'Executive Anubhuti (EC)', berthsCount: 56 },
          { code: 'E2', label: 'Executive Chair Car', berthsCount: 56 },
        ];
      case 'SL':
        return [
          { code: 'S1', label: 'Sleeper Class (SL)', berthsCount: 72 },
          { code: 'S2', label: 'Sleeper Class (SL)', berthsCount: 72 },
          { code: 'S3', label: 'Sleeper Class (SL)', berthsCount: 72 },
          { code: 'S4', label: 'Sleeper Class (SL)', berthsCount: 72 },
          { code: 'S5', label: 'Sleeper Class (SL)', berthsCount: 72 },
        ];
      case '3A':
      default:
        return [
          { code: 'B1', label: 'AC 3-Tier (3A)', berthsCount: 72 },
          { code: 'B2', label: 'AC 3-Tier (3A)', berthsCount: 72 },
          { code: 'B3', label: 'AC 3-Tier (Tatkal Rake)', berthsCount: 72 },
          { code: 'B4', label: 'AC 3-Tier (3A)', berthsCount: 72 },
          { code: 'B5', label: 'AC 3-Tier (3A)', berthsCount: 72 },
        ];
    }
  }, [normalizedClass]);

  // Initial coach selection
  const [activeCoach, setActiveCoach] = useState<string>(() => {
    if (activeQuota === 'TATKAL' && coachList.some((c) => c.code === 'B3')) {
      return 'B3';
    }
    return coachList[0]?.code || 'B1';
  });

  // Active passenger for picking
  const [activePassengerIndex, setActivePassengerIndex] = useState<number>(0);
  const [selectedBerthFilter, setSelectedBerthFilter] = useState<BerthCategory>('ALL');
  const [hoveredBerth, setHoveredBerth] = useState<BerthModel | null>(null);
  const [expandedView, setExpandedView] = useState<boolean>(false);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // Deterministic generator of berths for a coach
  const berthsData = useMemo<BerthModel[]>(() => {
    const list: BerthModel[] = [];

    // Helper to produce deterministic pseudo-random occupancy
    const isOccupiedSeed = (seedStr: string): boolean => {
      let hash = 0;
      for (let i = 0; i < seedStr.length; i++) {
        hash = (hash << 5) - hash + seedStr.charCodeAt(i);
        hash |= 0;
      }
      const absVal = Math.abs(hash);
      // Keep Bays 3 and 4 with higher availability for user group assignment
      const bayNum = Math.floor((absVal % 100) / 8);
      if (bayNum === 2 || bayNum === 3) {
        return (absVal % 10) > 8; // only 10% occupied in Bay 3 & 4
      }
      return (absVal % 10) > 4; // ~50% occupied elsewhere
    };

    if (normalizedClass === '3A' || normalizedClass === 'SL') {
      // 9 Bays of 8 Berths = 72 Berths
      const totalBays = 9;
      for (let bay = 0; bay < totalBays; bay++) {
        const base = bay * 8 + 1;
        // Bay Compartment Left (facing right)
        // 1: Lower Berth
        // 2: Middle Berth
        // 3: Upper Berth
        // Bay Compartment Right (facing left)
        // 4: Lower Berth
        // 5: Middle Berth
        // 6: Upper Berth
        // Side Berths (across aisle)
        // 7: Side Lower
        // 8: Side Upper

        const bayBerths: { num: number; code: string; type: string; hindi: string; pos: BerthModel['rowPosition']; side: boolean; win: boolean }[] = [
          { num: base + 0, code: 'LB', type: 'Lower Berth', hindi: 'निचली बर्थ', pos: 'bottom', side: false, win: true },
          { num: base + 1, code: 'MB', type: 'Middle Berth', hindi: 'मध्य बर्थ', pos: 'middle', side: false, win: false },
          { num: base + 2, code: 'UB', type: 'Upper Berth', hindi: 'ऊपरी बर्थ', pos: 'top', side: false, win: false },
          { num: base + 3, code: 'LB', type: 'Lower Berth', hindi: 'निचली बर्थ', pos: 'bottom', side: false, win: true },
          { num: base + 4, code: 'MB', type: 'Middle Berth', hindi: 'मध्य बर्थ', pos: 'middle', side: false, win: false },
          { num: base + 5, code: 'UB', type: 'Upper Berth', hindi: 'ऊपरी बर्थ', pos: 'top', side: false, win: false },
          { num: base + 6, code: 'SL', type: 'Side Lower', hindi: 'साइड लोअर', pos: 'side-bottom', side: true, win: true },
          { num: base + 7, code: 'SU', type: 'Side Upper', hindi: 'साइड अपर', pos: 'side-top', side: true, win: false },
        ];

        bayBerths.forEach((b) => {
          const occ = isOccupiedSeed(`${appId}-${activeCoach}-${b.num}`);
          const isTatkalSeat = activeQuota === 'TATKAL' && (b.num % 4 === 0 || b.num % 7 === 0);
          const isLadiesSeat = activeQuota === 'LADIES' && b.num <= 12;

          list.push({
            seatNumber: b.num,
            berthCode: b.code,
            berthType: b.type,
            hindiLabel: b.hindi,
            bayNumber: bay + 1,
            isSide: b.side,
            isWindow: b.win,
            rowPosition: b.pos,
            status: occ ? 'occupied' : isLadiesSeat ? 'ladies' : isTatkalSeat ? 'tatkal' : 'available',
            powerSocket: true,
            hasReadingLight: true,
          });
        });
      }
    } else if (normalizedClass === '2A') {
      // 9 Bays of 6 Berths = 54 Berths
      const totalBays = 9;
      for (let bay = 0; bay < totalBays; bay++) {
        const base = bay * 6 + 1;
        const bayBerths: { num: number; code: string; type: string; hindi: string; pos: BerthModel['rowPosition']; side: boolean; win: boolean }[] = [
          { num: base + 0, code: 'LB', type: 'Lower Berth', hindi: 'निचली बर्थ', pos: 'bottom', side: false, win: true },
          { num: base + 1, code: 'UB', type: 'Upper Berth', hindi: 'ऊपरी बर्थ', pos: 'top', side: false, win: false },
          { num: base + 2, code: 'LB', type: 'Lower Berth', hindi: 'निचली बर्थ', pos: 'bottom', side: false, win: true },
          { num: base + 3, code: 'UB', type: 'Upper Berth', hindi: 'ऊपरी बर्थ', pos: 'top', side: false, win: false },
          { num: base + 4, code: 'SL', type: 'Side Lower', hindi: 'साइड लोअर', pos: 'side-bottom', side: true, win: true },
          { num: base + 5, code: 'SU', type: 'Side Upper', hindi: 'साइड अपर', pos: 'side-top', side: true, win: false },
        ];

        bayBerths.forEach((b) => {
          const occ = isOccupiedSeed(`${appId}-${activeCoach}-${b.num}`);
          list.push({
            seatNumber: b.num,
            berthCode: b.code,
            berthType: b.type,
            hindiLabel: b.hindi,
            bayNumber: bay + 1,
            isSide: b.side,
            isWindow: b.win,
            rowPosition: b.pos,
            status: occ ? 'occupied' : 'available',
            powerSocket: true,
            hasReadingLight: true,
          });
        });
      }
    } else {
      // CC / Chair Car: 15 rows of 5 seats (3 on left: W, M, A; 2 on right: A, W) = 75 seats
      const rows = 15;
      for (let r = 0; r < rows; r++) {
        const base = r * 5 + 1;
        const rowSeats: { num: number; code: string; type: string; hindi: string; pos: BerthModel['rowPosition']; win: boolean }[] = [
          { num: base + 0, code: 'W', type: 'Window Seat', hindi: 'खिड़की सीट', pos: 'chair-left', win: true },
          { num: base + 1, code: 'M', type: 'Middle Seat', hindi: 'मध्य सीट', pos: 'chair-left', win: false },
          { num: base + 2, code: 'A', type: 'Aisle Seat', hindi: 'गलियारा सीट', pos: 'chair-left', win: false },
          { num: base + 3, code: 'A', type: 'Aisle Seat', hindi: 'गलियारा सीट', pos: 'chair-right', win: false },
          { num: base + 4, code: 'W', type: 'Window Seat', hindi: 'खिड़की सीट', pos: 'chair-right', win: true },
        ];

        rowSeats.forEach((s) => {
          const occ = isOccupiedSeed(`${appId}-${activeCoach}-${s.num}`);
          list.push({
            seatNumber: s.num,
            berthCode: s.code,
            berthType: s.type,
            hindiLabel: s.hindi,
            bayNumber: r + 1,
            isSide: false,
            isWindow: s.win,
            rowPosition: s.pos,
            status: occ ? 'occupied' : 'available',
            powerSocket: true,
            hasReadingLight: true,
          });
        });
      }
    }

    return list;
  }, [normalizedClass, appId, activeCoach, activeQuota]);

  // Map of seatNumber -> assignment for active coach
  const currentCoachAssignments = useMemo(() => {
    const map = new Map<number, PassengerSeatAssignment>();
    selectedSeats.forEach((s) => {
      if (s.coach === activeCoach) {
        map.set(s.seatNumber, s);
      }
    });
    return map;
  }, [selectedSeats, activeCoach]);

  // Auto assign seats matching passenger count and preferences
  const handleAutoAssign = () => {
    const newAssignments: PassengerSeatAssignment[] = [];
    const availableBerths = berthsData.filter((b) => b.status !== 'occupied');

    // Group available berths by bay so passengers can sit together
    const baysMap = new Map<number, BerthModel[]>();
    availableBerths.forEach((b) => {
      const arr = baysMap.get(b.bayNumber) || [];
      arr.push(b);
      baysMap.set(b.bayNumber, arr);
    });

    // Find the best bay that can accommodate all or most passengers
    let targetBayBerths: BerthModel[] = [];
    for (const [, berths] of baysMap.entries()) {
      if (berths.length >= passengers.length) {
        targetBayBerths = berths;
        break;
      }
    }
    if (targetBayBerths.length === 0) {
      targetBayBerths = availableBerths;
    }

    const usedSeatNumbers = new Set<number>();

    passengers.forEach((passenger, index) => {
      const pref = (passenger.seatPreference || '').toLowerCase();
      let matchedBerth: BerthModel | undefined;

      // Try matching requested preference
      if (pref.includes('lower')) {
        matchedBerth = targetBayBerths.find(
          (b) => (b.berthCode === 'LB' || b.berthCode === 'SL') && !usedSeatNumbers.has(b.seatNumber)
        );
      } else if (pref.includes('middle')) {
        matchedBerth = targetBayBerths.find(
          (b) => b.berthCode === 'MB' && !usedSeatNumbers.has(b.seatNumber)
        );
      } else if (pref.includes('upper')) {
        matchedBerth = targetBayBerths.find(
          (b) => (b.berthCode === 'UB' || b.berthCode === 'SU') && !usedSeatNumbers.has(b.seatNumber)
        );
      } else if (pref.includes('window')) {
        matchedBerth = targetBayBerths.find(
          (b) => b.isWindow && !usedSeatNumbers.has(b.seatNumber)
        );
      }

      // Fallback: pick any available berth in the target set
      if (!matchedBerth) {
        matchedBerth = targetBayBerths.find((b) => !usedSeatNumbers.has(b.seatNumber));
      }
      // Ultimate fallback: pick any available berth in coach
      if (!matchedBerth) {
        matchedBerth = availableBerths.find((b) => !usedSeatNumbers.has(b.seatNumber));
      }

      if (matchedBerth) {
        usedSeatNumbers.add(matchedBerth.seatNumber);
        newAssignments.push({
          passengerIndex: index,
          passengerName: passenger.name,
          coach: activeCoach,
          seatNumber: matchedBerth.seatNumber,
          berthType: matchedBerth.berthType,
          berthCode: matchedBerth.berthCode,
          bayNumber: matchedBerth.bayNumber,
        });
      }
    });

    onSeatsChange(newAssignments);
    setFeedbackToast(`Auto-assigned ${newAssignments.length} adjacent berths in Coach ${activeCoach}!`);
    setTimeout(() => setFeedbackToast(null), 3500);
  };

  // If no seats selected yet, automatically run auto-assign once on initial load
  useEffect(() => {
    if (selectedSeats.length === 0 && passengers.length > 0 && berthsData.length > 0) {
      handleAutoAssign();
    }
  }, []); // run on initial mount

  // Clear all selections
  const handleClearAll = () => {
    onSeatsChange([]);
    setFeedbackToast('Cleared selected seats.');
    setTimeout(() => setFeedbackToast(null), 2500);
  };

  // Click on a seat
  const handleSeatClick = (berth: BerthModel) => {
    if (berth.status === 'occupied') {
      setFeedbackToast(`Seat ${berth.seatNumber} is already occupied by another passenger.`);
      setTimeout(() => setFeedbackToast(null), 2500);
      return;
    }

    // Check if this seat is already assigned to a passenger
    const existingIndex = selectedSeats.findIndex(
      (s) => s.coach === activeCoach && s.seatNumber === berth.seatNumber
    );

    if (existingIndex !== -1) {
      // Toggle off / remove assignment
      const updated = [...selectedSeats];
      updated.splice(existingIndex, 1);
      onSeatsChange(updated);
      setFeedbackToast(`Unassigned Seat ${berth.seatNumber} (${berth.berthCode})`);
      setTimeout(() => setFeedbackToast(null), 2000);
      return;
    }

    // Assign to active passenger
    const currentPassenger = passengers[activePassengerIndex] || passengers[0];
    const newAssignment: PassengerSeatAssignment = {
      passengerIndex: activePassengerIndex,
      passengerName: currentPassenger.name,
      coach: activeCoach,
      seatNumber: berth.seatNumber,
      berthType: berth.berthType,
      berthCode: berth.berthCode,
      bayNumber: berth.bayNumber,
    };

    // Replace if this passenger already had a seat, otherwise append
    const filtered = selectedSeats.filter((s) => s.passengerIndex !== activePassengerIndex);
    const updated = [...filtered, newAssignment];
    onSeatsChange(updated);

    setFeedbackToast(`Assigned Seat ${berth.seatNumber} (${berth.berthCode}) to ${currentPassenger.name}`);
    setTimeout(() => setFeedbackToast(null), 2500);

    // Auto-advance to next unassigned passenger if any
    const nextUnassigned = passengers.findIndex(
      (_, idx) => !updated.some((s) => s.passengerIndex === idx)
    );
    if (nextUnassigned !== -1) {
      setActivePassengerIndex(nextUnassigned);
    }
  };

  // Filter check
  const isSeatVisibleUnderFilter = (berth: BerthModel) => {
    if (selectedBerthFilter === 'ALL') return true;
    if (selectedBerthFilter === 'LOWER') return berth.berthCode === 'LB';
    if (selectedBerthFilter === 'MIDDLE') return berth.berthCode === 'MB';
    if (selectedBerthFilter === 'UPPER') return berth.berthCode === 'UB';
    if (selectedBerthFilter === 'SIDE_LOWER') return berth.berthCode === 'SL';
    if (selectedBerthFilter === 'SIDE_UPPER') return berth.berthCode === 'SU';
    if (selectedBerthFilter === 'WINDOW') return berth.isWindow;
    if (selectedBerthFilter === 'AISLE') return berth.berthCode === 'A' || berth.berthCode === 'SL';
    return true;
  };

  // Stats
  const totalBerthsCount = berthsData.length;
  const availableCount = berthsData.filter((b) => b.status !== 'occupied').length;
  const occupiedCount = totalBerthsCount - availableCount;

  return (
    <div className="rounded-2xl bg-white border-2 border-[#0B2545]/20 shadow-sm overflow-hidden font-ticket text-slate-900 transition-all">
      {/* Header Bar */}
      <div className="bg-[#0B2545] text-white p-4 sm:p-5 border-b-4 border-[#EA580C]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-300">
              <Train className="w-4 h-4 text-amber-400" />
              <span>IRCTC INTERACTIVE COACH & SEAT SELECTOR / बोगी एवं सीट चयन</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-wide text-white flex items-center gap-2">
              <span>Coach {activeCoach}</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-900/80 border border-blue-700 text-blue-200 font-mono font-normal">
                {coachList.find((c) => c.code === activeCoach)?.label || travelClass}
              </span>
            </h2>
            <p className="text-xs text-blue-100/90 font-sans">
              Select specific berths for each passenger in your group. Real-time Indian Railways seat map with Lower, Middle, Upper & Side layout.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 self-start md:self-auto shrink-0 flex-wrap">
            <button
              type="button"
              onClick={handleAutoAssign}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-slate-950" />
              <span>Auto-Assign Best (स्वतः चयन)</span>
            </button>
            <button
              type="button"
              onClick={handleClearAll}
              className="px-3 py-2 rounded-xl bg-blue-900/60 hover:bg-blue-800 text-blue-200 hover:text-white border border-blue-700/70 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Clear all selected berths"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
            <button
              type="button"
              onClick={() => setExpandedView(!expandedView)}
              className="p-2 rounded-xl bg-blue-900/60 hover:bg-blue-800 text-blue-200 border border-blue-700/70 text-xs font-bold transition-colors hidden sm:flex items-center justify-center cursor-pointer"
              title={expandedView ? 'Collapse View' : 'Expand Coach View'}
            >
              {expandedView ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Coach Tabs Rail */}
        <div className="mt-4 pt-3 border-t border-blue-800/60 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          <span className="text-[11px] font-bold text-amber-300 uppercase shrink-0 mr-1 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" /> Coach:
          </span>
          {coachList.map((coach) => {
            const isSelected = activeCoach === coach.code;
            const assignedInThisCoach = selectedSeats.filter((s) => s.coach === coach.code).length;
            return (
              <button
                key={coach.code}
                type="button"
                onClick={() => setActiveCoach(coach.code)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-[#EA580C] text-white shadow-sm ring-2 ring-amber-400 font-black scale-105'
                    : 'bg-[#001D3D] text-blue-200 hover:bg-blue-900/70 border border-blue-800'
                }`}
              >
                <span>{coach.code}</span>
                {assignedInThisCoach > 0 && (
                  <span className="w-4 h-4 rounded-full bg-emerald-500 text-white text-[10px] flex items-center justify-center font-bold">
                    {assignedInThisCoach}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Passenger Assignment Selector Bar */}
      <div className="p-3 sm:p-4 bg-amber-50/70 border-b border-amber-200/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#EA580C]" />
            <span className="text-xs font-black text-[#0B2545] uppercase tracking-wider">
              Assign Berths to Passengers ({selectedSeats.length}/{passengers.length} Assigned):
            </span>
          </div>
          <span className="text-[11px] text-slate-600 font-sans">
            Click a passenger card below, then tap an available berth on the coach.
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {passengers.map((passenger, index) => {
            const isActive = activePassengerIndex === index;
            const assignment = selectedSeats.find((s) => s.passengerIndex === index);

            return (
              <button
                key={index}
                type="button"
                onClick={() => setActivePassengerIndex(index)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer relative ${
                  isActive
                    ? 'bg-white border-[#EA580C] shadow-md ring-2 ring-[#EA580C]/20'
                    : assignment
                    ? 'bg-emerald-50/80 border-emerald-300 hover:border-emerald-400'
                    : 'bg-white/80 border-slate-300 hover:border-slate-400'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                          assignment
                            ? 'bg-emerald-600 text-white'
                            : isActive
                            ? 'bg-[#EA580C] text-white'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        P{index + 1}
                      </span>
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {passenger.name}
                      </span>
                      <span className="text-[10px] text-slate-500 font-normal">
                        ({passenger.age}y • {passenger.idType || 'Aadhaar'})
                      </span>
                    </div>

                    <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-2">
                      <span>Pref: <strong>{passenger.seatPreference || 'Lower Berth'}</strong></span>
                    </div>
                  </div>

                  {/* Seat Assigned Badge */}
                  <div className="shrink-0 text-right">
                    {assignment ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-600 text-white text-[11px] font-mono font-bold shadow-xs">
                        <Check className="w-3 h-3" />
                        <span>{assignment.coach}-{assignment.seatNumber} ({assignment.berthCode})</span>
                      </span>
                    ) : (
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          isActive
                            ? 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {isActive ? 'Select Berth' : 'Unassigned'}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter and Legend Bar */}
      <div className="px-4 py-2.5 bg-slate-100 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Berth Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <span className="text-[11px] font-bold text-slate-600 shrink-0 uppercase mr-1">Filter:</span>
          {(
            [
              { id: 'ALL', label: 'All Berths (सभी)' },
              { id: 'LOWER', label: 'Lower (निचली)' },
              { id: 'MIDDLE', label: 'Middle (मध्य)' },
              { id: 'UPPER', label: 'Upper (ऊपरी)' },
              { id: 'SIDE_LOWER', label: 'Side Lower' },
              { id: 'SIDE_UPPER', label: 'Side Upper' },
              { id: 'WINDOW', label: 'Window View' },
            ] as const
          ).map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => setSelectedBerthFilter(filter.id)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedBerthFilter === filter.id
                  ? 'bg-[#0B2545] text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px] font-sans text-slate-700">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-emerald-50 border-2 border-emerald-500" />
            <span>Available ({availableCount})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-[#EA580C] text-white flex items-center justify-center font-bold text-[8px]">✓</span>
            <span className="font-bold text-slate-900">Selected ({selectedSeats.length})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-slate-300 border border-slate-400" />
            <span className="text-slate-500">Occupied ({occupiedCount})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-blue-100 border border-blue-400" />
            <span className="text-blue-800">Tatkal Quota</span>
          </div>
        </div>
      </div>

      {/* Floating Feedback Notification Toast */}
      {feedbackToast && (
        <div className="mx-4 mt-3 p-2.5 rounded-xl bg-[#0B2545] text-amber-300 text-xs font-mono font-bold flex items-center gap-2 shadow-md animate-in fade-in slide-in-from-top-1">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{feedbackToast}</span>
        </div>
      )}

      {/* Interactive Coach Body Container */}
      <div className="p-4 sm:p-6 overflow-x-auto bg-[#F4F6F9]">
        <div className="min-w-[820px] max-w-full mx-auto space-y-4">
          {/* Coach Exterior Metal Shell simulation */}
          <div className="relative rounded-2xl bg-gradient-to-b from-slate-200 via-slate-100 to-slate-200 border-4 border-slate-400 p-4 shadow-inner">
            {/* Coach Livery Band */}
            <div className="h-2.5 -mt-2 -mx-2 mb-4 bg-gradient-to-r from-[#0B2545] via-[#EA580C] to-[#0B2545] rounded-t flex items-center justify-between px-4">
              <span className="text-[8px] text-amber-200 uppercase font-mono tracking-widest font-bold">
                INDIAN RAILWAYS • COACH {activeCoach} • {normalizedClass} LHB RAKE
              </span>
              <span className="text-[8px] text-white font-mono">
                FORWARD ➔
              </span>
            </div>

            {/* Coach Layout Header: Left Vestibule Door / Toilets */}
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2 border-b border-slate-300 pb-1.5 px-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-slate-300 text-slate-700 font-bold text-[10px]">
                  🚪 Door / Vestibule
                </span>
                <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-[10px]">
                  🚻 Bio-Toilet 1 & 2
                </span>
              </div>
              <div className="font-mono text-[11px] text-[#0B2545] font-black uppercase flex items-center gap-1.5">
                <span>गाड़ी चलने की दिशा / DIRECTION OF TRAVEL</span>
                <span className="text-[#EA580C] font-bold text-sm">➔</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-[10px]">
                  🚻 Bio-Toilet 3 & 4
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-300 text-slate-700 font-bold text-[10px]">
                  🚪 Door / Vestibule
                </span>
              </div>
            </div>

            {/* SEAT GRID: Organised by Bays / Cabins */}
            <div className="space-y-4">
              {/* Group berths by Bay */}
              {Array.from(new Set(berthsData.map((b) => b.bayNumber))).map((bayNumber) => {
                const bayBerths = berthsData.filter((b) => b.bayNumber === bayNumber);
                const regularBerths = bayBerths.filter((b) => !b.isSide);
                const sideBerths = bayBerths.filter((b) => b.isSide);

                return (
                  <div
                    key={bayNumber}
                    className="p-3 rounded-xl bg-white border border-slate-300/80 shadow-xs space-y-2 hover:border-blue-400 transition-colors"
                  >
                    {/* Bay Label Header */}
                    <div className="flex items-center justify-between text-[11px] border-b border-slate-200 pb-1 px-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#0B2545] font-mono">
                          BAY / केबिन {bayNumber}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          (Berths {bayBerths[0]?.seatNumber} - {bayBerths[bayBerths.length - 1]?.seatNumber})
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-sans">
                        Window Facing • 220V AC Socket • Reading Lamp
                      </span>
                    </div>

                    {/* Compartment & Side Berth Row */}
                    <div className="grid grid-cols-12 gap-3 items-center">
                      {/* Main Compartment: 6 Berths (Left Row 3, Right Row 3) */}
                      <div className="col-span-8 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                        <div className="text-[9px] uppercase font-bold text-slate-500 mb-1.5 flex justify-between">
                          <span>Main Bay Compartment (मुख्य केबिन)</span>
                          <span className="text-slate-400">Window 🪟</span>
                        </div>

                        {/* Top: Upper Berths (UB) */}
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          {regularBerths
                            .filter((b) => b.rowPosition === 'top')
                            .map((berth) => renderBerthButton(berth))}
                        </div>

                        {/* Middle: Middle Berths (MB) - if applicable in 3A/SL */}
                        {regularBerths.some((b) => b.rowPosition === 'middle') && (
                          <div className="grid grid-cols-2 gap-2 mb-2">
                            {regularBerths
                              .filter((b) => b.rowPosition === 'middle')
                              .map((berth) => renderBerthButton(berth))}
                          </div>
                        )}

                        {/* Bottom: Lower Berths (LB) */}
                        <div className="grid grid-cols-2 gap-2">
                          {regularBerths
                            .filter((b) => b.rowPosition === 'bottom')
                            .map((berth) => renderBerthButton(berth))}
                        </div>
                      </div>

                      {/* Gangway / Aisle Corridor */}
                      <div className="col-span-1 flex flex-col items-center justify-center py-4 bg-blue-50/50 rounded border border-dashed border-blue-200">
                        <span className="text-[8px] font-mono uppercase text-blue-700 font-bold rotate-90 whitespace-nowrap tracking-widest">
                          AISLE • गलियारा
                        </span>
                      </div>

                      {/* Side Berths: 2 Berths (Side Upper & Side Lower) */}
                      <div className="col-span-3 bg-amber-50/50 p-2.5 rounded-lg border border-amber-200">
                        <div className="text-[9px] uppercase font-bold text-amber-800 mb-1.5 flex justify-between">
                          <span>Side (साइड)</span>
                          <span className="text-amber-600">Window 🪟</span>
                        </div>

                        <div className="space-y-2">
                          {sideBerths.map((berth) => renderBerthButton(berth))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Hovered / Focused Berth Quick Detail Drawer */}
      <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white border border-slate-300 flex items-center justify-center text-[#EA580C] font-mono font-black text-base shadow-xs">
            {hoveredBerth ? hoveredBerth.seatNumber : '—'}
          </div>
          <div>
            <div className="font-bold text-slate-900 flex items-center gap-2">
              <span>
                {hoveredBerth
                  ? `Berth ${hoveredBerth.seatNumber} • ${hoveredBerth.berthType} (${hoveredBerth.hindiLabel})`
                  : 'Hover or tap any berth to inspect detailed amenities & position'}
              </span>
              {hoveredBerth && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                    hoveredBerth.status === 'occupied'
                      ? 'bg-slate-200 text-slate-700'
                      : hoveredBerth.status === 'tatkal'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {hoveredBerth.status.toUpperCase()}
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-500 font-sans">
              {hoveredBerth
                ? `Coach ${activeCoach} • Bay ${hoveredBerth.bayNumber} • 220V Mobile Charger • Individual LED Night Lamp • Clean Linen Provided`
                : `Currently assigned: ${selectedSeats.length} of ${passengers.length} passenger berths.`}
            </div>
          </div>
        </div>

        {/* Status Confirmation Badge */}
        <div className="shrink-0 flex items-center gap-2">
          {selectedSeats.length === passengers.length ? (
            <div className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>All Passenger Berths Selected!</span>
            </div>
          ) : (
            <div className="px-3 py-1.5 rounded-xl bg-amber-100 border border-amber-300 text-amber-900 font-bold text-xs flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-700" />
              <span>{passengers.length - selectedSeats.length} berth(s) left to assign</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Helper renderer for a single berth button
  function renderBerthButton(berth: BerthModel) {
    const isVisible = isSeatVisibleUnderFilter(berth);
    const assignment = currentCoachAssignments.get(berth.seatNumber);
    const isSelected = !!assignment;
    const isOccupied = berth.status === 'occupied';
    const isTatkal = berth.status === 'tatkal';

    return (
      <button
        key={berth.seatNumber}
        type="button"
        disabled={isOccupied}
        onMouseEnter={() => setHoveredBerth(berth)}
        onClick={() => handleSeatClick(berth)}
        className={`group relative p-2.5 rounded-xl border text-center transition-all flex flex-col justify-between select-none ${
          !isVisible ? 'opacity-30' : 'opacity-100'
        } ${
          isSelected
            ? 'bg-[#EA580C] text-white border-[#EA580C] shadow-md ring-2 ring-amber-400 scale-[1.02] cursor-pointer'
            : isOccupied
            ? 'bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed'
            : isTatkal
            ? 'bg-blue-50 hover:bg-blue-100 text-blue-900 border-blue-300 hover:border-blue-400 cursor-pointer shadow-2xs'
            : 'bg-white hover:bg-emerald-50 text-slate-800 border-slate-300 hover:border-emerald-500 cursor-pointer shadow-2xs'
        }`}
      >
        {/* Top Mini Header: Seat No. & Berth Code */}
        <div className="flex items-center justify-between text-xs font-mono font-bold w-full">
          <span className={`text-sm ${isSelected ? 'text-white font-black' : isOccupied ? 'text-slate-400' : 'text-[#0B2545]'}`}>
            {berth.seatNumber}
          </span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
              isSelected
                ? 'bg-white text-[#EA580C]'
                : isOccupied
                ? 'bg-slate-300 text-slate-500'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {berth.berthCode}
          </span>
        </div>

        {/* Center label: Hindi / English Berth Name */}
        <div className="my-1 text-center">
          <div className={`text-[10px] font-sans font-bold leading-tight ${isSelected ? 'text-amber-100' : isOccupied ? 'text-slate-400' : 'text-slate-700'}`}>
            {berth.berthType}
          </div>
          <div className={`text-[9px] ${isSelected ? 'text-amber-200' : 'text-slate-400'}`}>
            {berth.hindiLabel}
          </div>
        </div>

        {/* Bottom Tag: Passenger assignment or Occupied status */}
        <div className="mt-1 pt-1 border-t border-black/10 flex items-center justify-center text-[10px] font-mono">
          {isSelected && assignment ? (
            <span className="font-bold text-white flex items-center gap-1">
              <span>✓ P{assignment.passengerIndex + 1}</span>
            </span>
          ) : isOccupied ? (
            <span className="text-slate-400 text-[9px] flex items-center gap-0.5">
              <span>Booked</span>
            </span>
          ) : isTatkal ? (
            <span className="text-blue-700 font-bold text-[9px]">Tatkal</span>
          ) : (
            <span className="text-emerald-700 font-medium text-[9px] group-hover:font-bold">Available</span>
          )}
        </div>

        {/* Window icon indicator if applicable */}
        {berth.isWindow && (
          <span
            className="absolute -top-1.5 -right-1 text-[9px] px-1 rounded-full bg-slate-100 border border-slate-300 text-slate-600 font-sans shadow-2xs"
            title="Window View"
          >
            🪟
          </span>
        )}
      </button>
    );
  }
};
