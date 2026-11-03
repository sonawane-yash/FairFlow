import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Train, MapPin, Gauge, Sparkles } from 'lucide-react';

interface StationMilestone {
  code: string;
  name: string;
  percent: number;
  km: number;
}

const STATIONS: StationMilestone[] = [
  { code: 'NDLS', name: 'New Delhi', percent: 0, km: 0 },
  { code: 'CNB', name: 'Kanpur Central', percent: 38, km: 440 },
  { code: 'PRYJ', name: 'Prayagraj Jn', percent: 72, km: 635 },
  { code: 'BSB', name: 'Varanasi Cantt', percent: 100, km: 759 },
];

interface BogieSpec {
  id: string;
  code: string;
  name: string;
  type: 'rear-engine' | 'coach' | 'executive' | 'lead-engine';
  height: number;
}

// Complete authentic Vande Bharat Express Rake (5-car formation)
// Rendered from REAR (top) to FRONT (bottom):
// 1. DTC-2: Rear Driving Trailer Coach with active red tail markers & pantograph
// 2. C2: Chair Car Coach
// 3. EC: Executive Chair Car with signature gold livery
// 4. C1: Chair Car Coach
// 5. DTC-1: Lead Aerodynamic Bullet Engine with dual headlights & cowcatcher
const VANDE_BHARAT_RAKE: BogieSpec[] = [
  {
    id: 'dtc-rear',
    code: 'DTC-2',
    name: 'Rear Driving Trailer Coach',
    type: 'rear-engine',
    height: 34,
  },
  {
    id: 'coach-c2',
    code: 'C2',
    name: 'Chair Car (C2)',
    type: 'coach',
    height: 28,
  },
  {
    id: 'coach-ec',
    code: 'EC',
    name: 'Executive Chair Car',
    type: 'executive',
    height: 28,
  },
  {
    id: 'coach-c1',
    code: 'C1',
    name: 'Chair Car (C1)',
    type: 'coach',
    height: 28,
  },
  {
    id: 'dtc-lead',
    code: 'DTC-1',
    name: 'Lead Driving Engine',
    type: 'lead-engine',
    height: 38,
  },
];

const COUPLER_HEIGHT = 4; // Height of flexible vestibule gangway between coaches
// Total fixed height of the full train: (34 + 28 + 28 + 28 + 38) + (4 * 4) = 156 + 16 = 172px
const TOTAL_TRAIN_HEIGHT =
  VANDE_BHARAT_RAKE.reduce((sum, b) => sum + b.height, 0) +
  (VANDE_BHARAT_RAKE.length - 1) * COUPLER_HEIGHT;

export const RailwayScrollTrack: React.FC = () => {
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [isScrolling, setIsScrolling] = useState<boolean>(false);
  const [currentSpeed, setCurrentSpeed] = useState<number>(0);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [activeStation, setActiveStation] = useState<StationMilestone>(STATIONS[0]);
  const [viewportHeight, setViewportHeight] = useState<number>(() =>
    typeof window !== 'undefined' ? window.innerHeight : 800
  );

  const trackRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<number | null>(null);
  const lastScrollYRef = useRef<number>(0);
  const lastScrollTimeRef = useRef<number>(Date.now());

  const TOP_OFFSET = 38; // space below top terminal bumper (NDLS)
  const BOTTOM_OFFSET = 38; // space above bottom terminal bumper (BSB)

  // Handle scroll and calculate speed
  const handleScroll = useCallback(() => {
    const scrollY = window.scrollY || window.pageYOffset;
    const vh = window.innerHeight;
    setViewportHeight(vh);
    const docHeight = document.documentElement.scrollHeight - vh;
    const progress = docHeight > 0 ? Math.min(1, Math.max(0, scrollY / docHeight)) : 0;

    setScrollProgress(progress);
    setIsScrolling(true);

    // Calculate simulated train speed based on scroll velocity
    const now = Date.now();
    const timeDelta = Math.max(16, now - lastScrollTimeRef.current);
    const scrollDelta = Math.abs(scrollY - lastScrollYRef.current);
    const rawSpeed = (scrollDelta / timeDelta) * 180;
    const targetSpeed = Math.min(160, Math.max(30, Math.round(rawSpeed)));

    setCurrentSpeed(targetSpeed);
    lastScrollYRef.current = scrollY;
    lastScrollTimeRef.current = now;

    // Determine nearest station
    const currentPercent = progress * 100;
    let closest = STATIONS[0];
    for (const station of STATIONS) {
      if (currentPercent >= station.percent - 10) {
        closest = station;
      }
    }
    setActiveStation(closest);

    // Stop timeout for scroll deceleration
    if (scrollTimeoutRef.current) {
      window.clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = window.setTimeout(() => {
      setIsScrolling(false);
      const decelInterval = window.setInterval(() => {
        setCurrentSpeed((prev) => {
          if (prev <= 10) {
            clearInterval(decelInterval);
            return 0;
          }
          return Math.round(prev * 0.7);
        });
      }, 50);
    }, 180);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, [handleScroll]);

  // Click or drag on railway track to navigate page
  const scrollToPercent = (percent: number) => {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const targetScrollY = Math.round(percent * docHeight);
    window.scrollTo({
      top: targetScrollY,
      behavior: 'smooth',
    });
  };

  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const effectiveHeight = rect.height - TOP_OFFSET - BOTTOM_OFFSET;
    const relativeY = Math.max(0, Math.min(effectiveHeight, clickY - TOP_OFFSET));
    const percent = relativeY / effectiveHeight;
    scrollToPercent(percent);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const clickY = e.clientY - rect.top;
      const effectiveHeight = rect.height - TOP_OFFSET - BOTTOM_OFFSET;
      const relativeY = Math.max(0, Math.min(effectiveHeight, clickY - TOP_OFFSET));
      const percent = relativeY / effectiveHeight;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo({
        top: Math.round(percent * docHeight),
        behavior: 'auto',
      });
    };

    const handleMouseUp = () => {
      if (isDragging) setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // PRECISE UNCOMPRESSED TRAVEL DISTANCE:
  // The whole train rake has a constant fixed height = TOTAL_TRAIN_HEIGHT (172px).
  // At scrollProgress = 0: trainTop = TOP_OFFSET (docked right under NDLS terminal buffer)
  // At scrollProgress = 1: trainTop = viewportHeight - BOTTOM_OFFSET - TOTAL_TRAIN_HEIGHT (docked at BSB terminal buffer)
  // The train NEVER squeezes, shrinks, or stretches while moving forward.
  const travelDistance = Math.max(0, viewportHeight - TOP_OFFSET - BOTTOM_OFFSET - TOTAL_TRAIN_HEIGHT);
  const trainTop = TOP_OFFSET + scrollProgress * travelDistance;

  const currentKm = Math.round(scrollProgress * 759);
  const isAtTerminal = scrollProgress >= 0.99;

  return (
    <div
      ref={trackRef}
      onClick={handleTrackClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="fixed right-0 top-0 bottom-0 z-40 w-11 sm:w-12 select-none cursor-pointer group transition-all duration-300"
      style={{
        background: '#1F2937', // dark ballast bed
        boxShadow: '-4px 0 15px rgba(0, 0, 0, 0.25)',
      }}
      title="Vande Bharat Express Scroll Track - Click or drag to travel"
    >
      {/* Ballast Gravel Texture */}
      <div
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#475569 1px, transparent 1px)`,
          backgroundSize: '4px 4px',
        }}
      />

      {/* Railway Concrete Sleepers (Cross Ties) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `repeating-linear-gradient(
            to bottom,
            transparent 0px,
            transparent 12px,
            #64748B 12px,
            #334155 14px,
            #1E293B 16px,
            transparent 16px
          )`,
        }}
      />

      {/* Left Steel Rail */}
      <div
        className="absolute top-0 bottom-0 pointer-events-none"
        style={{
          left: '11px',
          width: '3.5px',
          background: 'linear-gradient(90deg, #94A3B8 0%, #F8FAFC 45%, #64748B 100%)',
          boxShadow: '1px 0 2px rgba(0,0,0,0.6), -1px 0 2px rgba(255,255,255,0.2)',
        }}
      />

      {/* Right Steel Rail */}
      <div
        className="absolute top-0 bottom-0 pointer-events-none"
        style={{
          right: '11px',
          width: '3.5px',
          background: 'linear-gradient(90deg, #94A3B8 0%, #F8FAFC 45%, #64748B 100%)',
          boxShadow: '1px 0 2px rgba(0,0,0,0.6), -1px 0 2px rgba(255,255,255,0.2)',
        }}
      />

      {/* Top Station Buffer / Signal: New Delhi (NDLS) */}
      <div className="absolute top-1 left-1 right-1 flex flex-col items-center pointer-events-none z-10">
        <div className="w-full py-0.5 bg-[#0B2545] border border-blue-400/40 rounded text-center shadow-xs">
          <span className="text-[8px] font-mono font-black text-amber-300 tracking-wider">NDLS</span>
        </div>
        <div className="mt-0.5 flex items-center justify-center gap-1">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isScrolling || scrollProgress < 0.95
                ? 'bg-emerald-400 shadow-[0_0_6px_#34d399] animate-pulse'
                : 'bg-emerald-700'
            }`}
          />
        </div>
      </div>

      {/* Milestone Station Markers along the track */}
      {STATIONS.slice(1, 3).map((stn) => {
        const markerTop = TOP_OFFSET + (stn.percent / 100) * (viewportHeight - TOP_OFFSET - BOTTOM_OFFSET);
        const isReached = scrollProgress * 100 >= stn.percent;
        return (
          <div
            key={stn.code}
            className="absolute left-0 right-0 flex items-center justify-center pointer-events-none z-10"
            style={{ top: `${markerTop}px` }}
          >
            <div
              className={`w-2 h-2 rounded-full border transition-all ${
                isReached
                  ? 'bg-[#EA580C] border-amber-300 shadow-[0_0_6px_#ea580c]'
                  : 'bg-slate-600 border-slate-400 opacity-60'
              }`}
              title={`${stn.name} (${stn.km} KM)`}
            />
          </div>
        );
      })}

      {/* Bottom Terminal Buffer / Signal: Varanasi Cantt (BSB) */}
      <div className="absolute bottom-1 left-1 right-1 flex flex-col items-center pointer-events-none z-10">
        <div className="mb-0.5 flex items-center justify-center gap-1">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isAtTerminal
                ? 'bg-emerald-400 shadow-[0_0_8px_#34d399] animate-ping'
                : 'bg-rose-500 shadow-[0_0_6px_#f43f5e]'
            }`}
          />
        </div>
        <div
          className={`w-full py-0.5 border rounded text-center shadow-xs transition-colors ${
            isAtTerminal
              ? 'bg-[#047857] border-emerald-300 text-white font-bold'
              : 'bg-[#800000] border-rose-400/40 text-amber-200'
          }`}
        >
          <span className="text-[8px] font-mono font-black tracking-wider">BSB</span>
        </div>
      </div>

      {/* COMPLETE VANDE BHARAT EXPRESS TRAIN (FULL RAKE ALWAYS PRESENT & TRAVELS FORWARD TOGETHER) */}
      <div
        onMouseDown={handleMouseDown}
        style={{
          top: `${trainTop}px`,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '28px',
          height: `${TOTAL_TRAIN_HEIGHT}px`,
          transition: isDragging ? 'none' : 'top 0.08s ease-out',
        }}
        className="absolute z-20 cursor-grab active:cursor-grabbing flex flex-col items-center select-none drop-shadow-[0_4px_10px_rgba(0,0,0,0.4)]"
      >
        {/* Render the full authentic train rake from rear cab to front bullet locomotive */}
        {VANDE_BHARAT_RAKE.map((bogie, index) => {
          const isLeadEngine = bogie.type === 'lead-engine';
          const isRearEngine = bogie.type === 'rear-engine';
          const isExecutive = bogie.type === 'executive';
          const hasCouplerBelow = index < VANDE_BHARAT_RAKE.length - 1;

          return (
            <React.Fragment key={bogie.id}>
              {/* 1. REAR DRIVING TRAILER CAB (DTC-2) */}
              {isRearEngine && (
                <div
                  className="w-7 h-[34px] shrink-0 relative bg-gradient-to-b from-slate-200 via-white to-slate-100 border-x border-t border-slate-400 flex flex-col items-center justify-start overflow-hidden shadow-xs"
                  style={{
                    borderTopLeftRadius: '12px 14px',
                    borderTopRightRadius: '12px 14px',
                  }}
                  title="Rear Driving Cab (DTC-2)"
                >
                  {/* Roof Pantograph */}
                  <div className="w-3.5 h-1.5 mt-0.5 bg-slate-800 rounded-t-xs flex items-center justify-center border-t border-slate-600 shrink-0">
                    <div className="w-2 h-0.5 bg-amber-400/90 rounded-full" />
                  </div>

                  {/* Rear Visor & Red Tail Warning Markers */}
                  <div
                    className="w-4 h-2 mt-0.5 bg-[#051622] border border-slate-600 flex items-center justify-center shrink-0"
                    style={{
                      borderTopLeftRadius: '4px',
                      borderTopRightRadius: '4px',
                      borderBottomLeftRadius: '2px',
                      borderBottomRightRadius: '2px',
                    }}
                  >
                    <div className="w-3 flex items-center justify-between px-0.5">
                      <span className="w-1 h-1 rounded-full bg-rose-500 shadow-[0_0_4px_#f43f5e] animate-pulse" />
                      <span className="w-1 h-1 rounded-full bg-rose-500 shadow-[0_0_4px_#f43f5e] animate-pulse" />
                    </div>
                  </div>

                  {/* IRCTC Navy Stripe & Saffron Trim */}
                  <div className="w-full h-2.5 mt-0.5 bg-[#0B2545] border-y border-[#EA580C] flex items-center justify-center shrink-0">
                    <span className="text-[6px] font-black text-amber-300 font-mono tracking-tighter">
                      IR
                    </span>
                  </div>

                  {/* Rear Coach Label */}
                  <div className="w-full bg-[#EA580C] text-white text-[5.5px] font-mono font-bold text-center leading-none py-0.5 shrink-0">
                    DTC-2
                  </div>
                </div>
              )}

              {/* 2 & 4. PASSENGER CHAIR CAR COACHES (C1, C2) & 3. EXECUTIVE COACH (EC) */}
              {!isLeadEngine && !isRearEngine && (
                <div
                  className={`w-7 h-[28px] shrink-0 relative border-x border-slate-400 flex flex-col items-center justify-between overflow-hidden shadow-xs ${
                    isExecutive
                      ? 'bg-gradient-to-r from-amber-50 via-white to-amber-50'
                      : 'bg-gradient-to-r from-slate-100 via-white to-slate-200'
                  }`}
                  title={`${bogie.name} (${bogie.code})`}
                >
                  {/* Roof AC Module with louvers */}
                  <div className="w-4 h-1.5 mt-0.5 bg-slate-300 rounded-[1px] border border-slate-400 flex items-center justify-center gap-0.5 shrink-0">
                    <span className="w-1 h-0.5 bg-slate-500 rounded-full" />
                    <span className="w-1 h-0.5 bg-slate-500 rounded-full" />
                  </div>

                  {/* Continuous Tinted Panoramic Navy Window Ribbon */}
                  <div
                    className={`w-full py-0.5 flex items-center justify-between px-1 border-y shrink-0 ${
                      isExecutive
                        ? 'bg-[#0B2545] border-[#F59E0B]'
                        : 'bg-[#0B2545] border-[#EA580C]'
                    }`}
                  >
                    <div className="w-1 h-1.5 bg-[#1E3A8A] rounded-[1px] opacity-90" />
                    <span
                      className={`text-[6px] font-mono font-black px-0.5 rounded-[1px] ${
                        isExecutive
                          ? 'bg-amber-400 text-slate-950 shadow-xs'
                          : 'bg-white/20 text-amber-200'
                      }`}
                    >
                      {bogie.code}
                    </span>
                    <div className="w-1 h-1.5 bg-[#1E3A8A] rounded-[1px] opacity-90" />
                  </div>

                  {/* Vande Bharat Saffron Accent Stripe at bottom edge */}
                  <div className="w-full h-1 bg-[#EA580C] flex items-center justify-center shrink-0">
                    <div className="w-5 h-0.5 bg-white/40 rounded-full" />
                  </div>
                </div>
              )}

              {/* 5. LEAD DRIVING POWER LOCOMOTIVE (DTC-1) - FIXED PROPORTIONS, NO SQUEEZING */}
              {isLeadEngine && (
                <div
                  className="w-7 h-[38px] shrink-0 relative flex flex-col items-center justify-between"
                  title="Lead Driving Locomotive (DTC-1)"
                >
                  {/* Coach Body Section of Engine */}
                  <div className="w-7 h-[16px] shrink-0 bg-gradient-to-r from-slate-100 via-white to-slate-200 border-x border-slate-400 flex flex-col items-center justify-between overflow-hidden shadow-xs">
                    {/* Roof AC Fairing */}
                    <div className="w-4 h-1.5 mt-0.5 bg-slate-300 rounded-sm border border-slate-400 flex items-center justify-center gap-0.5 shrink-0">
                      <span className="w-1 h-0.5 bg-slate-500 rounded-full" />
                      <span className="w-1 h-0.5 bg-slate-500 rounded-full" />
                    </div>

                    {/* Window Ribbon with IR Emblem */}
                    <div className="w-full h-2.5 bg-[#0B2545] border-y border-[#EA580C] flex items-center justify-center px-1 shrink-0">
                      <div className="w-2.5 h-2 rounded-[1px] bg-[#EA580C] flex items-center justify-center text-[5px] font-mono font-black text-white">
                        IR
                      </div>
                    </div>
                  </div>

                  {/* Aerodynamic Bullet Nose Cone (Pointing Downward) */}
                  <div
                    className="w-7 h-[22px] shrink-0 relative bg-gradient-to-b from-white via-slate-50 to-slate-200 border-x border-b border-slate-400 flex flex-col items-center justify-between overflow-hidden shadow-xs"
                    style={{
                      borderBottomLeftRadius: '14px 18px',
                      borderBottomRightRadius: '14px 18px',
                    }}
                  >
                    {/* Cockpit Windshield Visor */}
                    <div
                      className="w-5 h-2.5 mt-0.5 bg-[#051622] border border-slate-600 shadow-inner flex items-center justify-center shrink-0"
                      style={{
                        borderTopLeftRadius: '2px',
                        borderTopRightRadius: '2px',
                        borderBottomLeftRadius: '5px',
                        borderBottomRightRadius: '5px',
                      }}
                    >
                      <div className="w-3.5 h-0.5 bg-cyan-300/40 rounded-full" />
                    </div>

                    {/* Vande Bharat Saffron Chevron V */}
                    <div className="w-3.5 h-1 bg-[#EA580C] rounded-full my-0.5 shrink-0" />

                    {/* High-Intensity Twin Forward LED Headlights */}
                    <div className="w-4.5 flex items-center justify-between px-0.5 mb-1 shrink-0">
                      <span
                        className={`w-1.5 h-1.5 rounded-full bg-white border border-amber-200 ${
                          isScrolling
                            ? 'shadow-[0_0_8px_#ffffff] scale-110'
                            : 'shadow-[0_0_4px_#fef08a]'
                        }`}
                      />
                      <span
                        className={`w-1.5 h-1.5 rounded-full bg-white border border-amber-200 ${
                          isScrolling
                            ? 'shadow-[0_0_8px_#ffffff] scale-110'
                            : 'shadow-[0_0_4px_#fef08a]'
                        }`}
                      />
                    </div>

                    {/* Front Cowcatcher Guard */}
                    <div className="w-4 h-0.5 bg-slate-700 rounded-full mb-0.5 shrink-0" />
                  </div>

                  {/* Projected Forward Light Beam (Absolute - Never affects train sizing) */}
                  <div
                    className="absolute left-1/2 -translate-x-1/2 pointer-events-none transition-all duration-300"
                    style={{
                      top: '100%',
                      width: '30px',
                      height: isScrolling ? '38px' : '18px',
                      background:
                        'linear-gradient(to bottom, rgba(254, 240, 138, 0.45) 0%, rgba(255, 255, 255, 0.15) 50%, transparent 100%)',
                      clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)',
                      filter: 'blur(1px)',
                      opacity: isAtTerminal ? 0.2 : 0.85,
                    }}
                  />
                </div>
              )}

              {/* Inter-Car Vestibule Coupler Gangway (Between Coaches) */}
              {hasCouplerBelow && (
                <div
                  className="w-5 h-[4px] shrink-0 bg-slate-900 border-x border-slate-700 flex items-center justify-center my-0"
                  style={{
                    backgroundImage:
                      'repeating-linear-gradient(to bottom, #1E293B 0px, #1E293B 1px, #0F172A 1px, #0F172A 2px)',
                  }}
                  title="Vestibule Gangway"
                >
                  <div className="w-1.5 h-1 bg-amber-400/90 rounded-[1px] shadow-xs" />
                </div>
              )}
            </React.Fragment>
          );
        })}

        {/* Live Speed & Full Rake Status Tag (Active during scroll or hover) */}
        {(isScrolling || isHovered || isDragging) && (
          <div className="absolute right-9 top-1/2 -translate-y-1/2 whitespace-nowrap px-2.5 py-1.5 rounded-lg bg-[#0B2545] border border-[#EA580C] text-white shadow-xl flex items-center gap-2 pointer-events-none animate-in fade-in slide-in-from-right-1 duration-150 z-30">
            <div className="flex items-center gap-1">
              <Gauge className="w-3.5 h-3.5 text-[#EA580C]" />
              <span className="font-mono font-bold text-xs text-amber-300">
                {currentSpeed} <span className="text-[10px] text-slate-300 font-normal">km/h</span>
              </span>
            </div>
            <div className="h-3 w-px bg-slate-600" />
            <div className="flex items-center gap-1 text-[10px] font-mono text-white font-semibold">
              <span className="text-amber-400">Vande Bharat:</span>
              <span>5 Cars</span>
            </div>
          </div>
        )}
      </div>

      {/* Flyout Journey Dashboard Card (Visible on Hover) */}
      {isHovered && (
        <div
          className="absolute right-14 top-16 w-72 p-3.5 rounded-xl bg-white dark:bg-[#0B1E38] border-2 border-[#0B2545] dark:border-[#1E3A5F] shadow-2xl text-slate-900 dark:text-[#F8FAFC] pointer-events-auto animate-in fade-in slide-in-from-right-2 duration-200 z-50 font-sans"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-[#0B2545] dark:bg-[#071526] flex items-center justify-center text-white border border-blue-900">
                <Train className="w-4 h-4 text-[#EA580C]" />
              </div>
              <div>
                <div className="text-xs font-black text-[#0B2545] dark:text-white">Vande Bharat Express</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">Train #22436 • 5-Car Rake</div>
              </div>
            </div>
            <span
              className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                isAtTerminal
                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                  : isScrolling
                  ? 'bg-orange-100 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300 border border-orange-300 dark:border-orange-700 animate-pulse'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {isAtTerminal ? 'ARRIVED BSB' : isScrolling ? 'RUNNING' : 'CRUISING'}
            </span>
          </div>

          {/* Full Train Rake Composition */}
          <div className="py-2.5 border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-[#0B2545] dark:text-[#F8FAFC] flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#EA580C]" />
                Train Formation (Full Rake)
              </span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-700 text-[#EA580C] dark:text-orange-300">
                5/5 Cars Connected
              </span>
            </div>

            {/* Coach formation pills */}
            <div className="flex items-center gap-1 justify-between p-1.5 bg-slate-50 dark:bg-[#08162A] rounded-lg border border-slate-200 dark:border-slate-700">
              {VANDE_BHARAT_RAKE.map((bogie) => (
                <div
                  key={bogie.id}
                  className={`flex-1 py-1 px-1 rounded text-center text-[9px] font-mono font-bold transition-all ${
                    bogie.type === 'executive'
                      ? 'bg-amber-400 text-slate-950 shadow-xs'
                      : 'bg-[#0B2545] dark:bg-[#1E3A8A] text-white shadow-xs'
                  }`}
                  title={`${bogie.name} (${bogie.code})`}
                >
                  {bogie.code}
                </div>
              ))}
            </div>
            <div className="text-[9px] text-slate-500 dark:text-slate-400 mt-1 italic">
              *Full Vande Bharat train moves forward smoothly as you scroll.
            </div>
          </div>

          {/* Current Journey Details */}
          <div className="py-2.5 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1 text-[11px]">
                <MapPin className="w-3 h-3 text-[#EA580C]" /> Route
              </span>
              <span className="font-bold text-[#0B2545] dark:text-white text-[11px]">New Delhi ➔ Varanasi</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1 text-[11px]">
                <Gauge className="w-3 h-3 text-blue-600 dark:text-blue-400" /> Current Speed
              </span>
              <span className="font-mono font-bold text-slate-900 dark:text-slate-200 text-[11px]">
                {currentSpeed} km/h (Max 160)
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 text-[11px]">Distance Covered</span>
              <span className="font-mono font-bold text-slate-900 dark:text-slate-200 text-[11px]">
                {currentKm} / 759 KM ({Math.round(scrollProgress * 100)}%)
              </span>
            </div>

            {/* Visual Route Progress Bar */}
            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                <span>NDLS</span>
                <span className="text-[#EA580C] font-bold">Station: {activeStation.code}</span>
                <span>BSB</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-200 dark:border-slate-700">
                <div
                  className="bg-gradient-to-r from-[#0B2545] via-[#EA580C] to-emerald-600 h-full rounded-full transition-all duration-150"
                  style={{ width: `${Math.round(scrollProgress * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick Jump Buttons */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mb-1.5 font-semibold">
              Jump to Milestone Station:
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {STATIONS.map((stn) => (
                <button
                  key={stn.code}
                  onClick={() => scrollToPercent(stn.percent / 100)}
                  className={`px-2 py-1 rounded text-[10px] font-mono font-bold border transition-colors flex items-center justify-between ${
                    activeStation.code === stn.code
                      ? 'bg-[#0B2545] dark:bg-[#1E3A8A] text-white border-[#0B2545] dark:border-[#3B82F6]'
                      : 'bg-slate-50 dark:bg-[#08162A] hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <span>{stn.code}</span>
                  <span className="text-[9px] opacity-75">{stn.percent}%</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-2 text-[10px] text-slate-400 dark:text-slate-500 text-center italic">
            Tip: Scroll the page or drag the train along the tracks to travel.
          </div>
        </div>
      )}
    </div>
  );
};
