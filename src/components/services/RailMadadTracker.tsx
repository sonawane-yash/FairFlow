import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  PhoneCall,
  CheckCircle2,
  Clock,
  AlertTriangle,
  User,
  Train,
  MapPin,
  Send,
  Search,
  ExternalLink,
  ChevronRight,
  Printer,
  Sparkles,
  Zap,
  Star,
  ThumbsUp,
  RefreshCw,
  FileText
} from 'lucide-react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useAuth } from '../../context/AuthContext';

export interface RailMadadIncident {
  crn: string; // Complaint Reference Number (e.g., RM-2026-88412)
  pnr: string;
  category: 'medical' | 'electrical' | 'cleaning' | 'catering' | 'security' | 'linen' | 'water';
  categoryLabel: string;
  trainNumber: string;
  trainName: string;
  coach: string;
  berth: string;
  passengerName: string;
  contactNumber: string;
  description: string;
  filedAt: string;
  urgency: 'critical' | 'high' | 'standard';
  currentStage: 1 | 2 | 3 | 4 | 5; // 1: Logged, 2: Dispatched, 3: Next Junction, 4: OTP Verification, 5: Closed
  assignedStaff: {
    role: string;
    name: string;
    empId: string;
    phone: string;
    badge: string;
  };
  interceptStation: {
    stationName: string;
    stationCode: string;
    etaMinutes: number;
    platform: string;
  };
  otp: string;
  status: 'Open' | 'In Progress' | 'Action Scheduled' | 'Verification Pending' | 'Resolved';
  rating?: number;
  passengerFeedback?: string;
}

const SAMPLE_INCIDENTS: RailMadadIncident[] = [
  {
    crn: 'RM-2026-88412',
    pnr: '2418-904128',
    category: 'electrical',
    categoryLabel: 'AC Breakdown & Insufficient Cooling',
    trainNumber: '12952',
    trainName: 'Mumbai Tejas Rajdhani Express',
    coach: 'B4',
    berth: '42 (Lower Berth)',
    passengerName: 'Yash Sonar',
    contactNumber: '+91 98201-99482',
    description: 'AC unit in Coach B4 Bay 6 not functioning since Surat. Coach temperature reaching 32°C.',
    filedAt: 'Today, 11:24 AM',
    urgency: 'high',
    currentStage: 3,
    assignedStaff: {
      role: 'Carriage & Wagon (TXR) Electrical Engineer',
      name: 'Santosh Kumar Verma',
      empId: 'TXR-WR-4091',
      phone: '+91 94250-18491',
      badge: 'Certified IR Electrical Staff'
    },
    interceptStation: {
      stationName: 'Vadodara Junction',
      stationCode: 'BRC',
      etaMinutes: 12,
      platform: 'Platform #2'
    },
    otp: '4821',
    status: 'In Progress'
  },
  {
    crn: 'RM-2026-67104',
    pnr: '2418-904128',
    category: 'cleaning',
    categoryLabel: 'Bio-Toilet Sanitization & Odor Control',
    trainNumber: '12952',
    trainName: 'Mumbai Tejas Rajdhani Express',
    coach: 'B4',
    berth: 'Lavatory C & D',
    passengerName: 'Yash Sonar',
    contactNumber: '+91 98201-99482',
    description: 'Washroom water flush clogged and needs immediate chemical disinfection.',
    filedAt: 'Today, 09:15 AM',
    urgency: 'standard',
    currentStage: 5,
    assignedStaff: {
      role: 'On-Board Housekeeping Staff (OBHS)',
      name: 'Rameshwar Yadav',
      empId: 'OBHS-4402',
      phone: '+91 97120-88419',
      badge: 'Clean Train Scheme'
    },
    interceptStation: {
      stationName: 'Surat',
      stationCode: 'ST',
      etaMinutes: 0,
      platform: 'Platform #1'
    },
    otp: '6829',
    status: 'Resolved',
    rating: 5,
    passengerFeedback: 'Attended promptly within 15 minutes by OBHS team.'
  }
];

export const RailMadadTracker: React.FC = () => {
  const { t } = useAccessibility();
  const { currentUser, isLoggedIn } = useAuth();

  const [activeTab, setActiveTab] = useState<'track' | 'file'>('track');
  const [incidents, setIncidents] = useState<RailMadadIncident[]>(() => {
    try {
      const stored = localStorage.getItem('fairflow_railmadad_incidents');
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return SAMPLE_INCIDENTS;
  });

  const [searchQuery, setSearchQuery] = useState('RM-2026-88412');
  const [selectedIncident, setSelectedIncident] = useState<RailMadadIncident | null>(() => incidents[0] || null);

  // Form State
  const [category, setCategory] = useState<RailMadadIncident['category']>('electrical');
  const [pnrInput, setPnrInput] = useState('2418-904128');
  const [trainInput, setTrainInput] = useState('12952 Mumbai Tejas Rajdhani');
  const [coachInput, setCoachInput] = useState('B4');
  const [berthInput, setBerthInput] = useState('42');
  const [mobileInput, setMobileInput] = useState('+91 98201-99482');
  const [descriptionInput, setDescriptionInput] = useState('');
  const [urgencyInput, setUrgencyInput] = useState<'critical' | 'high' | 'standard'>('high');

  // Rating state for current incident
  const [ratingInput, setRatingInput] = useState<number>(5);
  const [feedbackInput, setFeedbackInput] = useState<string>('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<boolean>(false);

  // Save incidents to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('fairflow_railmadad_incidents', JSON.stringify(incidents));
    } catch {
      // ignore
    }
  }, [incidents]);

  // Handle Search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim().toUpperCase();
    const found = incidents.find(
      (inc) =>
        inc.crn.toUpperCase() === query ||
        inc.pnr.toUpperCase().includes(query) ||
        inc.coach.toUpperCase() === query
    );
    if (found) {
      setSelectedIncident(found);
    }
  };

  // Submit New Incident
  const handleSubmitGrievance = (e: React.FormEvent) => {
    e.preventDefault();

    const crn = `RM-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    const categoryLabels: Record<RailMadadIncident['category'], string> = {
      medical: 'Emergency Medical Care / Doctor on Call',
      electrical: 'Coach AC & Electrical Breakdown',
      cleaning: 'Bio-Toilet & Coach Hygiene (Coach Mitra)',
      catering: 'Catering Overcharging & Food Quality',
      security: 'Security & RPF Assistance',
      linen: 'Bedroll, Linen & Blanket Replacement',
      water: 'Coach Water Supply Failure'
    };

    const newIncident: RailMadadIncident = {
      crn,
      pnr: pnrInput,
      category,
      categoryLabel: categoryLabels[category],
      trainNumber: trainInput.split(' ')[0] || '12952',
      trainName: trainInput,
      coach: coachInput,
      berth: berthInput,
      passengerName: currentUser?.fullName || 'Passenger',
      contactNumber: mobileInput,
      description: descriptionInput || `Reported ${categoryLabels[category]} in Coach ${coachInput}`,
      filedAt: 'Just now',
      urgency: urgencyInput,
      currentStage: 1,
      assignedStaff: {
        role: category === 'security' ? 'RPF Escort Party' : category === 'cleaning' ? 'OBHS Housekeeping Team' : 'Carriage & Wagon (TXR) Engineer',
        name: 'Divisional Control Assigned',
        empId: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
        phone: '139 (Toll-Free RailMadad)',
        badge: 'CRIS Live Control'
      },
      interceptStation: {
        stationName: 'Vadodara Junction',
        stationCode: 'BRC',
        etaMinutes: 18,
        platform: 'Platform #2'
      },
      otp,
      status: 'Open'
    };

    const updated = [newIncident, ...incidents];
    setIncidents(updated);
    setSelectedIncident(newIncident);
    setSearchQuery(crn);
    setActiveTab('track');
    setDescriptionInput('');
  };

  // Simulate Next Progression Step (Demonstration / Real-time testing)
  const handleSimulateNextStep = () => {
    if (!selectedIncident) return;

    let nextStage: 1 | 2 | 3 | 4 | 5 = selectedIncident.currentStage;
    let nextStatus = selectedIncident.status;

    if (nextStage === 1) {
      nextStage = 2;
      nextStatus = 'In Progress';
    } else if (nextStage === 2) {
      nextStage = 3;
      nextStatus = 'Action Scheduled';
    } else if (nextStage === 3) {
      nextStage = 4;
      nextStatus = 'Verification Pending';
    } else if (nextStage === 4) {
      nextStage = 5;
      nextStatus = 'Resolved';
    }

    const updatedIncident: RailMadadIncident = {
      ...selectedIncident,
      currentStage: nextStage,
      status: nextStatus,
      assignedStaff: {
        role: selectedIncident.category === 'security' ? 'RPF Escort ASI' : 'Lead TXR Technical Officer',
        name: 'Inspector R. K. Shrivastav',
        empId: 'WR-TXR-8812',
        phone: '+91 98201-44021',
        badge: 'On-Board RailMadad Authority'
      }
    };

    const nextList = incidents.map((inc) => (inc.crn === selectedIncident.crn ? updatedIncident : inc));
    setIncidents(nextList);
    setSelectedIncident(updatedIncident);
  };

  const handleRateResolution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIncident) return;

    const updated = {
      ...selectedIncident,
      rating: ratingInput,
      passengerFeedback: feedbackInput || 'Satisfied with resolution.'
    };

    const nextList = incidents.map((inc) => (inc.crn === selectedIncident.crn ? updated : inc));
    setIncidents(nextList);
    setSelectedIncident(updated);
    setFeedbackSubmitted(true);
  };

  return (
    <div className="space-y-6 font-ticket text-white">
      {/* Station Indicator Top Bar */}
      <div className="p-6 rounded-2xl bg-[#001D3D] border-2 border-[#EA580C] shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#EA580C] text-white flex items-center justify-center shadow-md shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg sm:text-xl font-black text-white">
                रेल मदद • RAILMADAD 139 CENTRAL GRIEVANCE SYSTEM
              </span>
              <span className="px-2 py-0.5 rounded bg-amber-400 text-slate-950 text-[10px] font-mono font-black uppercase">
                30-MIN SLA ESCALATION
              </span>
            </div>
            <p className="text-xs text-blue-200 font-sans">
              Ministry of Railways National Portal for Real-time Grievance Redressal, Security, Medical & Passenger Amenities.
            </p>
          </div>
        </div>

        {/* Emergency SOS Hotlines */}
        <div className="flex items-center gap-2 shrink-0">
          <a
            href="tel:139"
            className="px-3.5 py-2 rounded-xl bg-[#0B2545] hover:bg-[#002855] border border-blue-700 text-amber-300 text-xs font-bold font-mono flex items-center gap-2 shadow-sm transition-colors"
          >
            <PhoneCall className="w-4 h-4 text-emerald-400" />
            <span>Toll-Free 139</span>
          </a>
          <div className="px-3 py-1.5 rounded-xl bg-rose-950/80 border border-rose-600 text-rose-200 text-xs font-bold font-mono flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span>RPF Security 182</span>
          </div>
        </div>
      </div>

      {/* Tabs: Track Existing Grievance vs Lodge New Grievance */}
      <div className="flex items-center gap-2 border-b border-blue-900 pb-2">
        <button
          onClick={() => setActiveTab('track')}
          className={`px-4 py-2 rounded-xl text-xs font-bold font-ticket uppercase transition-all flex items-center gap-2 ${
            activeTab === 'track'
              ? 'bg-[#EA580C] text-white shadow-md'
              : 'bg-[#0B2545] text-slate-300 hover:bg-[#002244] border border-blue-900'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>Live Grievance Tracker / स्थिति ट्रैक करें</span>
        </button>

        <button
          onClick={() => setActiveTab('file')}
          className={`px-4 py-2 rounded-xl text-xs font-bold font-ticket uppercase transition-all flex items-center gap-2 ${
            activeTab === 'file'
              ? 'bg-[#EA580C] text-white shadow-md'
              : 'bg-[#0B2545] text-slate-300 hover:bg-[#002244] border border-blue-900'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>Lodge New Grievance / नई शिकायत दर्ज करें</span>
        </button>
      </div>

      {/* VIEW 1: LIVE GRIEVANCE TRACKER */}
      {activeTab === 'track' && (
        <div className="space-y-6">
          {/* Search CRN or PNR */}
          <form onSubmit={handleSearch} className="p-4 rounded-xl bg-[#0B2545] border border-blue-900 flex items-center gap-3">
            <Search className="w-5 h-5 text-amber-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter Complaint Reference Number (e.g. RM-2026-88412) or PNR Number..."
              className="w-full bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none font-mono font-bold"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-[#EA580C] hover:bg-[#D94E06] text-white text-xs font-bold uppercase transition-colors shrink-0"
            >
              Track Status
            </button>
          </form>

          {/* Quick Recent Complaint Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono">
            <span className="text-slate-400 text-[11px] uppercase shrink-0 font-ticket">Recent Cases:</span>
            {incidents.map((inc) => (
              <button
                key={inc.crn}
                onClick={() => {
                  setSelectedIncident(inc);
                  setSearchQuery(inc.crn);
                }}
                className={`px-2.5 py-1 rounded-lg border transition-all shrink-0 flex items-center gap-1.5 ${
                  selectedIncident?.crn === inc.crn
                    ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold'
                    : 'bg-[#001D3D] text-slate-300 border-blue-800 hover:bg-[#002855]'
                }`}
              >
                <span>{inc.crn}</span>
                <span className="text-[10px] opacity-75">({inc.coach})</span>
              </button>
            ))}
          </div>

          {/* Incident Timeline Display */}
          {selectedIncident ? (
            <div className="rounded-2xl bg-[#07162C] border-2 border-blue-800 p-6 space-y-6 shadow-xl">
              {/* Header Details */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-blue-900 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-lg font-black text-amber-300">{selectedIncident.crn}</span>
                    <span
                      className={`px-2.5 py-0.5 rounded text-[11px] font-mono font-bold uppercase ${
                        selectedIncident.status === 'Resolved'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-600'
                          : 'bg-amber-950 text-amber-300 border border-amber-600 animate-pulse'
                      }`}
                    >
                      {selectedIncident.status}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-600 font-mono text-[10px] uppercase font-bold">
                      Priority: {selectedIncident.urgency}
                    </span>
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-white mt-1">
                    {selectedIncident.categoryLabel}
                  </h2>
                  <p className="text-xs text-slate-300 font-sans mt-0.5">
                    {selectedIncident.description}
                  </p>
                </div>

                <div className="text-right shrink-0 font-mono text-xs text-slate-300 space-y-0.5">
                  <div>Train: <strong className="text-white">{selectedIncident.trainNumber} {selectedIncident.trainName}</strong></div>
                  <div>Location: <strong className="text-amber-300">Coach {selectedIncident.coach} • Berth {selectedIncident.berth}</strong></div>
                  <div>PNR: <strong className="text-white">{selectedIncident.pnr}</strong></div>
                </div>
              </div>

              {/* Real-time 5-Stage Visual Progression Timeline */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-ticket uppercase text-amber-300 font-bold">
                  <span>RailMadad Live Escalation & Resolution Chain</span>
                  <span className="text-[11px] text-slate-400 font-mono">Stage {selectedIncident.currentStage} of 5</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  {/* Stage 1 */}
                  <div
                    className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${
                      selectedIncident.currentStage >= 1
                        ? 'bg-[#0B2545] border-emerald-500 text-white'
                        : 'bg-[#001D3D] border-blue-950 text-slate-500'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold">STAGE 01</span>
                        {selectedIncident.currentStage >= 1 && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                      </div>
                      <div className="font-bold text-xs mt-1">Grievance Registered</div>
                      <p className="text-[10px] text-slate-300 font-sans mt-0.5">
                        CRIS Central Control Room logged complaint with 30-min SLA timer.
                      </p>
                    </div>
                    <div className="text-[9px] text-amber-300 font-mono mt-2">{selectedIncident.filedAt}</div>
                  </div>

                  {/* Stage 2 */}
                  <div
                    className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${
                      selectedIncident.currentStage >= 2
                        ? 'bg-[#0B2545] border-emerald-500 text-white'
                        : 'bg-[#001D3D] border-blue-950 text-slate-500'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold">STAGE 02</span>
                        {selectedIncident.currentStage >= 2 && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                      </div>
                      <div className="font-bold text-xs mt-1">Personnel Dispatched</div>
                      <p className="text-[10px] text-slate-300 font-sans mt-0.5">
                        {selectedIncident.assignedStaff.role} assigned to Coach {selectedIncident.coach}.
                      </p>
                    </div>
                    <div className="text-[9px] text-slate-300 font-mono mt-2">
                      Staff: {selectedIncident.assignedStaff.name}
                    </div>
                  </div>

                  {/* Stage 3 */}
                  <div
                    className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${
                      selectedIncident.currentStage >= 3
                        ? 'bg-[#0B2545] border-amber-400 text-white ring-1 ring-amber-400'
                        : 'bg-[#001D3D] border-blue-950 text-slate-500'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-amber-400">STAGE 03</span>
                        {selectedIncident.currentStage > 3 ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : selectedIncident.currentStage === 3 ? (
                          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                        ) : null}
                      </div>
                      <div className="font-bold text-xs mt-1">Station Intercept</div>
                      <p className="text-[10px] text-slate-300 font-sans mt-0.5">
                        Team boarding at {selectedIncident.interceptStation.stationName} ({selectedIncident.interceptStation.stationCode}).
                      </p>
                    </div>
                    <div className="text-[9px] text-amber-300 font-mono mt-2">
                      ETA: {selectedIncident.interceptStation.etaMinutes} mins ({selectedIncident.interceptStation.platform})
                    </div>
                  </div>

                  {/* Stage 4 */}
                  <div
                    className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${
                      selectedIncident.currentStage >= 4
                        ? 'bg-[#0B2545] border-emerald-500 text-white'
                        : 'bg-[#001D3D] border-blue-950 text-slate-500'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold">STAGE 04</span>
                        {selectedIncident.currentStage >= 4 && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                      </div>
                      <div className="font-bold text-xs mt-1">OTP Verification</div>
                      <p className="text-[10px] text-slate-300 font-sans mt-0.5">
                        Share verification code with staff only after work is satisfactorily inspected.
                      </p>
                    </div>
                    <div className="text-[10px] text-amber-300 font-mono font-bold mt-2">
                      OTP: {selectedIncident.otp}
                    </div>
                  </div>

                  {/* Stage 5 */}
                  <div
                    className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${
                      selectedIncident.currentStage === 5
                        ? 'bg-emerald-950 border-emerald-500 text-white'
                        : 'bg-[#001D3D] border-blue-950 text-slate-500'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold">STAGE 05</span>
                        {selectedIncident.currentStage === 5 && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                      </div>
                      <div className="font-bold text-xs mt-1">Closed & Verified</div>
                      <p className="text-[10px] text-slate-300 font-sans mt-0.5">
                        Passenger confirmation recorded. Case closed in Railway Board database.
                      </p>
                    </div>
                    <div className="text-[9px] text-emerald-300 font-mono mt-2">
                      {selectedIncident.rating ? `Rated ★ ${selectedIncident.rating}/5` : 'Closure Verified'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Assigned Staff & Live Intercept Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-blue-900/80 text-xs">
                {/* Staff Card */}
                <div className="p-4 rounded-xl bg-[#001D3D] border border-blue-900 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#EA580C] text-white flex items-center justify-center font-black shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="text-[10px] text-amber-300 uppercase font-mono font-bold">
                      Assigned Railway Executive / नामित रेलकर्मी:
                    </div>
                    <div className="font-bold text-white text-sm">{selectedIncident.assignedStaff.name}</div>
                    <div className="text-[11px] text-slate-300">
                      {selectedIncident.assignedStaff.role} ({selectedIncident.assignedStaff.empId})
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      Phone: <span className="text-amber-300">{selectedIncident.assignedStaff.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Next Station Intercept Card */}
                <div className="p-4 rounded-xl bg-[#001D3D] border border-blue-900 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-900/80 text-amber-400 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="text-[10px] text-amber-300 uppercase font-mono font-bold">
                      Upcoming Action Junction / आगामी स्टेशन कार्रवाई:
                    </div>
                    <div className="font-bold text-white text-sm">
                      {selectedIncident.interceptStation.stationName} ({selectedIncident.interceptStation.stationCode})
                    </div>
                    <div className="text-[11px] text-slate-300">
                      {selectedIncident.interceptStation.platform} • Escalation Window: 30 mins
                    </div>
                    <div className="text-[10px] text-emerald-400 font-mono mt-0.5">
                      Train Arrives in ~{selectedIncident.interceptStation.etaMinutes} minutes
                    </div>
                  </div>
                </div>
              </div>

              {/* Simulation Progression Trigger (Test button for user demonstration) */}
              <div className="p-4 rounded-xl bg-[#0B2545] border border-dashed border-amber-400/60 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <div className="font-bold text-amber-300 text-xs flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>Real-Time Incident Simulation Controller (लाइव प्रगति आगे बढ़ाएं):</span>
                  </div>
                  <div className="text-[11px] text-slate-300 font-sans">
                    Click to test the next operational step (Staff dispatch ➔ Station arrival ➔ OTP verification ➔ Case closure).
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {selectedIncident.currentStage < 5 ? (
                    <button
                      onClick={handleSimulateNextStep}
                      className="px-4 py-2 rounded-xl bg-[#EA580C] hover:bg-[#D94E06] text-white font-bold text-xs uppercase flex items-center gap-1.5 transition-colors shadow-sm shrink-0"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Simulate Next Stage ({selectedIncident.currentStage + 1}/5)</span>
                    </button>
                  ) : (
                    <span className="px-3 py-1.5 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-600 text-xs font-mono font-bold">
                      Case Fully Resolved ✓
                    </span>
                  )}
                  <button
                    onClick={() => window.print()}
                    className="p-2 rounded-xl bg-blue-950 border border-blue-800 text-slate-300 hover:text-white"
                    title="Print RailMadad Receipt"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Passenger Satisfaction Feedback Section (When Resolved or in Verification) */}
              {selectedIncident.currentStage >= 4 && (
                <div className="p-4 rounded-xl bg-[#001D3D] border border-emerald-500/80 space-y-3">
                  <div className="font-bold text-white text-xs flex items-center gap-2">
                    <ThumbsUp className="w-4 h-4 text-emerald-400" />
                    <span>Passenger Feedback & Resolution Rating / यात्री संतुष्टि प्रतिक्रिया:</span>
                  </div>

                  {selectedIncident.rating || feedbackSubmitted ? (
                    <div className="text-xs text-emerald-300 font-mono">
                      Feedback submitted: ★★★★★ ({selectedIncident.rating || ratingInput}/5) • "{selectedIncident.passengerFeedback || feedbackInput || 'Resolved promptly'}"
                    </div>
                  ) : (
                    <form onSubmit={handleRateResolution} className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-300">Rate Resolution Quality:</span>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setRatingInput(star)}
                              className={`p-1 rounded text-base transition-transform ${
                                star <= ratingInput ? 'text-amber-400 scale-110' : 'text-slate-600'
                              }`}
                            >
                              ★
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={feedbackInput}
                          onChange={(e) => setFeedbackInput(e.target.value)}
                          placeholder="Add brief remarks (e.g., Technician arrived on time, problem solved)..."
                          className="flex-1 bg-[#07162C] border border-blue-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase"
                        >
                          Submit Rating
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 font-ticket">
              No complaint found matching query "{searchQuery}". Please check CRN or PNR number.
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: LODGE NEW GRIEVANCE */}
      {activeTab === 'file' && (
        <form onSubmit={handleSubmitGrievance} className="p-6 rounded-2xl bg-[#07162C] border-2 border-blue-800 space-y-6 shadow-xl">
          <div className="border-b border-blue-900 pb-3">
            <h2 className="text-base sm:text-lg font-bold text-white font-ticket">
              भारतीय रेल • LODGE PASSENGER GRIEVANCE (RAILMADAD 139)
            </h2>
            <p className="text-xs text-slate-300 font-sans">
              Complaints are escalated directly to Divisional Commercial Managers (DCM) and verified via OTP upon completion.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            {/* Category */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-amber-300 uppercase">Grievance Category / प्रकार:</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-[#001D3D] border border-blue-800 rounded-xl px-3 py-2.5 text-white font-bold focus:outline-none focus:border-amber-400"
              >
                <option value="electrical">Coach AC / Power / Electrical Breakdown</option>
                <option value="cleaning">Bio-Toilet Sanitization (Coach Mitra)</option>
                <option value="medical">Medical First-Aid / Emergency Assistance</option>
                <option value="catering">Catering Quality / Overcharging Grievance</option>
                <option value="security">Security / RPF Assistance</option>
                <option value="linen">Bedroll, Blanket & Linen Quality</option>
                <option value="water">Water Supply in Washroom/Coach</option>
              </select>
            </div>

            {/* PNR Number */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-amber-300 uppercase">10-Digit PNR Number / पीएनआर:</label>
              <input
                type="text"
                value={pnrInput}
                onChange={(e) => setPnrInput(e.target.value)}
                placeholder="2418-904128"
                className="w-full bg-[#001D3D] border border-blue-800 rounded-xl px-3 py-2.5 text-white font-mono font-bold focus:outline-none focus:border-amber-400"
                required
              />
            </div>

            {/* Train Info */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-amber-300 uppercase">Train Number & Name:</label>
              <input
                type="text"
                value={trainInput}
                onChange={(e) => setTrainInput(e.target.value)}
                className="w-full bg-[#001D3D] border border-blue-800 rounded-xl px-3 py-2.5 text-white font-bold focus:outline-none focus:border-amber-400"
                required
              />
            </div>

            {/* Coach Number */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-amber-300 uppercase">Coach Number (e.g. B4, S3, A1):</label>
              <input
                type="text"
                value={coachInput}
                onChange={(e) => setCoachInput(e.target.value)}
                className="w-full bg-[#001D3D] border border-blue-800 rounded-xl px-3 py-2.5 text-white font-mono font-bold focus:outline-none focus:border-amber-400"
                required
              />
            </div>

            {/* Berth Number */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-amber-300 uppercase">Berth / Seat Number:</label>
              <input
                type="text"
                value={berthInput}
                onChange={(e) => setBerthInput(e.target.value)}
                className="w-full bg-[#001D3D] border border-blue-800 rounded-xl px-3 py-2.5 text-white font-mono font-bold focus:outline-none focus:border-amber-400"
                required
              />
            </div>

            {/* Passenger Mobile */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-amber-300 uppercase">Passenger Mobile (for SMS Updates):</label>
              <input
                type="tel"
                value={mobileInput}
                onChange={(e) => setMobileInput(e.target.value)}
                className="w-full bg-[#001D3D] border border-blue-800 rounded-xl px-3 py-2.5 text-white font-mono font-bold focus:outline-none focus:border-amber-400"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1 text-xs">
            <label className="text-[11px] font-bold text-amber-300 uppercase">Incident Description / समस्या का विवरण:</label>
            <textarea
              rows={3}
              value={descriptionInput}
              onChange={(e) => setDescriptionInput(e.target.value)}
              placeholder="Describe the issue clearly (e.g. AC cooling vents not blowing cold air since Surat station, water dripping from vent)..."
              className="w-full bg-[#001D3D] border border-blue-800 rounded-xl p-3 text-white focus:outline-none focus:border-amber-400 font-sans"
              required
            />
          </div>

          {/* Urgency */}
          <div className="flex items-center gap-4 text-xs font-ticket">
            <span className="font-bold text-amber-300 uppercase text-[11px]">Priority Level:</span>
            {(['standard', 'high', 'critical'] as const).map((urg) => (
              <label key={urg} className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="urgency"
                  checked={urgencyInput === urg}
                  onChange={() => setUrgencyInput(urg)}
                  className="accent-[#EA580C]"
                />
                <span className="capitalize font-bold text-white">{urg}</span>
              </label>
            ))}
          </div>

          <div className="pt-2 border-t border-blue-900 flex items-center justify-between">
            <p className="text-[11px] text-slate-400 font-sans">
              Submitting registers an official complaint with Indian Railways central grievance gateway (RailMadad 139).
            </p>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#EA580C] hover:bg-[#D94E06] text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-colors flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Submit Grievance</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
