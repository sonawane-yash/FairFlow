import React, { useState } from 'react';
import {
  Ticket,
  ArrowRight,
  Bell,
  Info,
  AlertTriangle,
  UtensilsCrossed,
  CheckCircle2,
  Calendar,
  ChevronRight,
  Building2,
  Award,
  Cpu,
  Search,
  Train,
  Clock,
  ShieldCheck,
  Sparkles,
  MapPin,
  Activity,
  ArrowRightLeft,
  QrCode,
  BookMarked,
  Zap,
  Wrench
} from 'lucide-react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useAuth } from '../../context/AuthContext';

interface LandingPageProps {
  setCurrentTab: (tab: string) => void;
  activeScenario?: string;
  onScenarioChange?: (scenario: any) => void;
  onRunQuickDemo?: () => void;
  onOpenTicketSlip?: () => void;
}

interface NoticeItem {
  id: string;
  tag: string;
  tagColor: 'amber' | 'emerald' | 'blue' | 'rose';
  title: string;
  hindiTitle?: string;
  date: string;
  summary: string;
  isImportant?: boolean;
}

const IRCTC_NOTICES: NoticeItem[] = [
  {
    id: 'n-1',
    tag: 'IMPORTANT ADVISORY',
    tagColor: 'rose',
    title: 'Aadhaar Verification Mandatory for Tatkal & Premium Tatkal Reservations',
    hindiTitle: 'तत्काल आरक्षण हेतु आधार प्रमाणीकरण अनिवार्य',
    date: '19 Sep 2026',
    summary: 'In accordance with Ministry of Railways directives, master passenger profiles verified with Aadhaar/DigiLocker will be granted priority admission to FairFlow intake pools to prevent automated bot bookings.',
    isImportant: true
  },
  {
    id: 'n-2',
    tag: 'TIMINGS UPDATE',
    tagColor: 'amber',
    title: 'AC & Non-AC Tatkal Booking Opening Schedule (10:00 AM & 11:00 AM IST)',
    hindiTitle: 'एसी एवं नॉन-एसी तत्काल समय सारणी',
    date: '18 Sep 2026',
    summary: 'AC classes (1A, 2A, 3A, 3E, CC, EC) open daily at 10:00:00 AM IST. Non-AC classes (SL, 2S) open at 11:00:00 AM IST one day in advance of journey station departure.',
    isImportant: true
  },
  {
    id: 'n-3',
    tag: 'E-CATERING SERVICE',
    tagColor: 'emerald',
    title: 'IRCTC WhatsApp Food Delivery & Pre-Cooked Jain Thali Availability',
    hindiTitle: 'व्हाट्सएप एवं ई-कैटरिंग भोजन सेवा विस्तार',
    date: '15 Sep 2026',
    summary: 'Passengers can order hot hygienic meals to their confirmed berth via Rail Food on WhatsApp (+91-8750001323) or using our On-Board Services tab across 450+ en-route stations.',
    isImportant: false
  },
  {
    id: 'n-4',
    tag: 'REFUND & TDR',
    tagColor: 'blue',
    title: 'Instant Refund Protocol via IRCTC iMudra & UPI AutoPay',
    hindiTitle: 'आईएमूद्रा एवं यूपीआई तत्काल रिफंड नीति',
    date: '12 Sep 2026',
    summary: 'Cancelled waitlisted Tatkal pool applications and failed payment authorizations are now reversed instantaneously without standard banking gateway delays (T+0 settlement).',
    isImportant: false
  },
  {
    id: 'n-5',
    tag: 'PASSENGER SAFETY',
    tagColor: 'emerald',
    title: 'RailMadad One-Stop 24x7 Helpline 139 for Security & Medical Assistance',
    hindiTitle: 'रेल मदद 139 चौबीसों घंटे एकीकृत सहायता सेवा',
    date: '08 Sep 2026',
    summary: 'For any emergency medical attention, coach cleaning, electrical repair, or RPF escort during the train journey, dial 139 or lodge an immediate request in Services.',
    isImportant: false
  }
];

export const LandingPage: React.FC<LandingPageProps> = ({
  setCurrentTab,
  onRunQuickDemo
}) => {
  const { theme, t } = useAccessibility();
  const { isLoggedIn, triggerLoginRequired } = useAuth();
  const [selectedNotice, setSelectedNotice] = useState<NoticeItem | null>(null);
  const [noticeFilter, setNoticeFilter] = useState<'all' | 'important'>('all');

  // Quick Train Booking Bar State
  const [quickFromStation, setQuickFromStation] = useState('NDLS');
  const [quickToStation, setQuickToStation] = useState('BSB');
  const [quickDate, setQuickDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [quickQuota, setQuickQuota] = useState('TATKAL');

  const handleSwapStations = () => {
    const tmp = quickFromStation;
    setQuickFromStation(quickToStation);
    setQuickToStation(tmp);
  };

  const handleSearchClick = () => {
    setCurrentTab('find-train');
  };

  const handleBookClick = () => {
    if (!isLoggedIn) {
      triggerLoginRequired('book train tickets');
      return;
    }
    setCurrentTab('apply');
  };

  const filteredNotices = noticeFilter === 'important'
    ? IRCTC_NOTICES.filter(n => n.isImportant)
    : IRCTC_NOTICES;

  const quickFeatures = [
    {
      id: 'find-train',
      title: 'Find My Train',
      hindi: 'ट्रेन खोजें',
      desc: 'Live running status, route timetable & coach composition',
      icon: Search,
      color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
      action: () => setCurrentTab('find-train')
    },
    {
      id: 'apply',
      title: 'Tatkal Booking',
      hindi: 'तत्काल आरक्षण',
      desc: 'Decoupled FairFlow intake queue for 10 AM / 11 AM slots',
      icon: Zap,
      color: 'bg-orange-500/10 text-[#EA580C] border-orange-500/30',
      action: handleBookClick
    },
    {
      id: 'my-bookings',
      title: 'My PNR Status',
      hindi: 'ई-टिकट एवं पीएनआर',
      desc: 'Check live confirmation, berth assignment & cancel vouchers',
      icon: Ticket,
      color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
      action: () => setCurrentTab('my-bookings')
    },
    {
      id: 'food',
      title: 'E-Catering Food',
      hindi: 'खान-पान सेवा',
      desc: 'Order hot veg/jain thalis & biryani delivered to your berth',
      icon: UtensilsCrossed,
      color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
      action: () => {
        if (!isLoggedIn) {
          triggerLoginRequired('use IRCTC passenger services');
          return;
        }
        setCurrentTab('services');
      }
    },
    {
      id: 'railmadad',
      title: 'RailMadad 139',
      hindi: 'शिकायत एवं सुरक्षा',
      desc: '24x7 integrated passenger assistance, medical & security',
      icon: ShieldCheck,
      color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30',
      action: () => {
        if (!isLoggedIn) {
          triggerLoginRequired('use IRCTC passenger services');
          return;
        }
        setCurrentTab('services');
      }
    },
    {
      id: 'glossary',
      title: 'Railway Glossary',
      hindi: 'शब्दावली एवं नियम',
      desc: 'Demystifying RAC, WL, GNWL, PQWL, chart & refund rules',
      icon: BookMarked,
      color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30',
      action: () => setCurrentTab('glossary')
    },
    {
      id: 'simulation',
      title: '100K Tatkal Lab',
      hindi: 'सिमुलेशन लैब',
      desc: 'Benchmark 100,000 synthetic applicants vs FairFlow queues',
      icon: Activity,
      color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30',
      action: () => setCurrentTab('philosophy')
    },
    {
      id: 'station-qr',
      title: 'Station Safety QR',
      hindi: 'सुरक्षा प्रमाणीकरण',
      desc: 'Scan official station concourse QR to unlock track restriction',
      icon: QrCode,
      color: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30',
      action: () => {
        // Trigger station QR modal via simulated event or booking flow
        setCurrentTab('apply');
      }
    }
  ];

  return (
    <div className="py-4 sm:py-8 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-8 font-sans">
      {/* 0. MOBILE-FIRST HERO: Quick Train Booking & Live Quota Hub */}
      <section className="rounded-2xl bg-gradient-to-br from-[#0B2545] via-[#091F3A] to-[#001428] text-white p-4 sm:p-6 shadow-xl border-t-4 border-t-[#EA580C] border border-blue-900/60 font-ticket relative overflow-hidden">
        {/* Subtle Railway Grid / Livery Accent */}
        <div className="h-1 bg-gradient-to-r from-[#FF9933] via-white to-[#138808] absolute top-0 inset-x-0" />

        {/* Hero Title & Live Tatkal Time Ribbon */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-blue-800/80">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white/10 text-amber-300 text-[11px] font-bold mb-1">
              <Train className="w-3.5 h-3.5 text-[#EA580C]" />
              <span>भारतीय रेल • FAIRFLOW PRS PASSENGER PORTAL</span>
            </div>
            <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight">
              Reserve Train Tickets & Services
            </h1>
            <p
              className="text-xs text-white !text-white font-sans mt-0.5"
              style={{ color: '#ffffff' }}
            >
              Decoupled intake queues • Anti-bot stampede protection • Seamless Tatkal booking
            </p>
          </div>

          {/* Tatkal Opening Schedule Ticker */}
          <div className="flex items-center gap-2 bg-[#001D3D] p-2.5 rounded-xl border border-blue-800 text-xs self-start md:self-auto shrink-0">
            <Clock className="w-4 h-4 text-white shrink-0" style={{ color: '#ffffff' }} />
            <div className="leading-tight">
              <div className="text-[10px] text-white !text-white uppercase font-mono" style={{ color: '#ffffff' }}>Tatkal Opening Windows</div>
              <div className="font-bold text-white !text-white flex items-center gap-2" style={{ color: '#ffffff' }}>
                <span className="text-white !text-white" style={{ color: '#fdfdfd' }}>
                  AC: <strong className="text-white !text-white font-bold" style={{ color: '#fdfdfd' }}>10:00 AM</strong>
                </span>
                <span className="text-white !text-white opacity-90 border" style={{ borderColor: '#ffffff', color: '#ffffff' }}>•</span>
                <span className="text-white !text-white" style={{ color: '#ffffff' }}>
                  Non-AC: <strong className="text-white !text-white font-bold" style={{ color: '#ffffff' }}>11:00 AM</strong>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Search & Booking Form Card */}
        <div className="mt-4 bg-[#001D3D]/90 p-3.5 sm:p-5 rounded-xl border border-blue-800/80 shadow-md">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
            {/* From Station, Swap Button & To Station */}
            <div className="col-span-1 sm:col-span-2 lg:col-span-2 flex items-end gap-1.5 sm:gap-2">
              <div className="flex-1 min-w-0">
                <label className="block text-[11px] font-bold text-amber-300 mb-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#EA580C]" />
                  <span className="truncate">From Station (कहाँ से)</span>
                </label>
                <select
                  value={quickFromStation}
                  onChange={(e) => setQuickFromStation(e.target.value)}
                  className="w-full bg-[#0B2545] border border-blue-700 rounded-lg px-2.5 py-2 text-xs font-bold text-white focus:outline-hidden focus:ring-1 focus:ring-amber-400"
                >
                  <option value="NDLS">NDLS - New Delhi (नई दिल्ली)</option>
                  <option value="MMCT">MMCT - Mumbai Central (मुंबई)</option>
                  <option value="BSB">BSB - Varanasi Jn (वाराणसी)</option>
                  <option value="HWH">HWH - Howrah Jn (हावड़ा)</option>
                  <option value="MAS">MAS - Chennai Central (चेन्नई)</option>
                  <option value="SBC">SBC - KSR Bengaluru (बेंगलुरु)</option>
                  <option value="PNBE">PNBE - Patna Jn (पटना)</option>
                </select>
              </div>

              {/* Swap Button In Between (Symbol Only) */}
              <button
                type="button"
                onClick={handleSwapStations}
                title="Swap From and To Stations"
                aria-label="Swap Stations"
                className="h-8.5 w-8.5 shrink-0 rounded-full bg-[#0B2545] hover:bg-blue-900 border border-blue-600 hover:border-amber-400 text-amber-300 hover:text-white flex items-center justify-center transition-all shadow-sm hover:scale-110 active:scale-95 mb-0.5 cursor-pointer"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
              </button>

              <div className="flex-1 min-w-0">
                <label className="block text-[11px] font-bold text-amber-300 mb-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-emerald-400" />
                  <span className="truncate">To Station (कहाँ तक)</span>
                </label>
                <select
                  value={quickToStation}
                  onChange={(e) => setQuickToStation(e.target.value)}
                  className="w-full bg-[#0B2545] border border-blue-700 rounded-lg px-2.5 py-2 text-xs font-bold text-white focus:outline-hidden focus:ring-1 focus:ring-amber-400"
                >
                  <option value="BSB">BSB - Varanasi Jn (वाराणसी)</option>
                  <option value="MMCT">MMCT - Mumbai Central (मुंबई)</option>
                  <option value="NDLS">NDLS - New Delhi (नई दिल्ली)</option>
                  <option value="HWH">HWH - Howrah Jn (हावड़ा)</option>
                  <option value="MAS">MAS - Chennai Central (चेन्नई)</option>
                  <option value="SBC">SBC - KSR Bengaluru (बेंगलुरु)</option>
                  <option value="PNBE">PNBE - Patna Jn (पटना)</option>
                </select>
              </div>
            </div>

            {/* Travel Date */}
            <div>
              <label className="block text-[11px] font-bold text-blue-200 mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-amber-400" />
                <span>Date of Journey (यात्रा तिथि)</span>
              </label>
              <input
                type="date"
                value={quickDate}
                onChange={(e) => setQuickDate(e.target.value)}
                className="w-full bg-[#0B2545] border border-blue-700 rounded-lg px-2.5 py-2 text-xs font-mono font-bold text-white focus:outline-hidden focus:ring-1 focus:ring-amber-400"
              />
            </div>

            {/* Quota */}
            <div>
              <label className="block text-[11px] font-bold text-blue-200 mb-1 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-amber-400" />
                <span>Booking Quota (कोटा)</span>
              </label>
              <select
                value={quickQuota}
                onChange={(e) => setQuickQuota(e.target.value)}
                className="w-full bg-[#0B2545] border border-blue-700 rounded-lg px-2.5 py-2 text-xs font-bold text-white focus:outline-hidden focus:ring-1 focus:ring-amber-400"
              >
                <option value="TATKAL">TATKAL (तत्काल)</option>
                <option value="GENERAL">GENERAL (सामान्य)</option>
                <option value="PREMIUM_TATKAL">PREMIUM TATKAL</option>
                <option value="LADIES">LADIES (महिला)</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSearchClick}
                className="flex-1 py-2 px-3 rounded-lg bg-[#0B2545] hover:bg-[#002244] border border-blue-700 text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
              >
                <Search className="w-3.5 h-3.5" />
                <span style={{ color: '#ffffff' }}>Search</span>
              </button>
              <button
                type="button"
                onClick={handleBookClick}
                className="flex-1 py-2 px-3 rounded-lg bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 uppercase"
              >
                <span>Book</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* 8-Item Instant Feature Access Grid */}
        <div className="mt-5">
          <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-[#EA580C]" />
            <span className="text-white" style={{ color: '#ffffff' }}>Essential IRCTC Passenger Features (1-Tap Direct Access)</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {quickFeatures.map((feat) => {
              const Icon = feat.icon;
              return (
                <button
                  key={feat.id}
                  onClick={feat.action}
                  className="p-3 rounded-xl bg-[#001D3D]/80 hover:bg-[#002855] border border-blue-800/80 text-left transition-all hover:scale-[1.02] active:scale-98 group flex flex-col justify-between shadow-xs"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${feat.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-blue-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-white font-ticket group-hover:text-amber-300 transition-colors">
                      {feat.title}
                    </div>
                    <div className="text-[10px] text-amber-300/80 font-hindi leading-tight">
                      {feat.hindi}
                    </div>
                    <p className="text-[10px] text-white font-sans mt-1 line-clamp-1" style={{ color: '#ffffff' }}>
                      {feat.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 1. NOTICES & ALERTS SECTION: Official Railway Bulletins */}
      <section className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#EA580C] flex items-center justify-center border border-orange-200">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[#0B2545] font-ticket flex items-center gap-2">
                <span>Official Notices & Announcements</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-sans font-medium">
                  सूचनाएँ एवं बुलेटिन
                </span>
              </h2>
              <p className="text-xs text-black dark:text-black font-medium" style={{ color: '#000000' }}>
                Official regulatory advisories, Tatkal rules, safety notifications, and circulars issued by IRCTC & Railway Board.
              </p>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <button
              onClick={() => setNoticeFilter('all')}
              style={{
                color: noticeFilter === 'all' ? '#FFFFFF' : undefined,
              }}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                noticeFilter === 'all'
                  ? 'bg-[#0B2545] dark:bg-[#1D4ED8] text-white !text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
              }`}
            >
              All Notices ({IRCTC_NOTICES.length})
            </button>
            <button
              onClick={() => setNoticeFilter('important')}
              style={{
                color: noticeFilter === 'important' ? '#FFFFFF' : undefined,
              }}
              className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                noticeFilter === 'important'
                  ? 'bg-[#EA580C] text-white !text-white shadow-xs'
                  : 'text-slate-600 hover:text-[#EA580C] dark:text-slate-300 dark:hover:text-[#EA580C]'
              }`}
            >
              <AlertTriangle className="w-3 h-3" />
              <span>Urgent Alerts</span>
            </button>
          </div>
        </div>

        {/* Notices Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotices.map((notice) => (
            <div
              key={notice.id}
              onClick={() => setSelectedNotice(notice)}
              className={`p-5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between group hover:-translate-y-0.5 shadow-xs bg-white ${
                notice.isImportant
                  ? 'border-red-300 hover:border-red-500'
                  : 'border-slate-200 hover:border-blue-400'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[11px] font-sans">
                  <span
                    className={`px-2 py-0.5 rounded font-bold uppercase tracking-wider text-[10px] ${
                      notice.tagColor === 'rose'
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : notice.tagColor === 'amber'
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : notice.tagColor === 'emerald'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}
                  >
                    {notice.tag}
                  </span>
                  <span className="text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{notice.date}</span>
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#1D4ED8] transition-colors line-clamp-2">
                    {notice.title}
                  </h3>
                  {notice.hindiTitle && (
                    <div className="text-xs text-[#92400E] font-hindi mt-1">
                      {notice.hindiTitle}
                    </div>
                  )}
                </div>

                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {notice.summary}
                </p>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs text-[#1D4ED8] font-bold">
                <span className="group-hover:underline">Read full circular</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. GENERAL INFORMATION ABOUT IRCTC: Detailed, well-structured encyclopedic & operational guide */}
      <section className="space-y-6">
        <div className="border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1D4ED8] flex items-center justify-center border border-blue-200">
              <Info className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[#0B2545] font-ticket flex items-center gap-2">
                <span>General Information about IRCTC</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-sans font-medium">
                  आई.आर.सी.टी.सी. परिचय एवं जानकारी
                </span>
              </h2>
              <p className="text-xs text-slate-600">
                Key facts, operational pillars, passenger services, and digital infrastructure of the Indian Railway Catering and Tourism Corporation.
              </p>
            </div>
          </div>
        </div>

        {/* Corporate Profile Bento */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Overview & Foundation */}
          <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="w-10 h-10 rounded-lg bg-orange-50 text-[#EA580C] flex items-center justify-center border border-orange-200">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0B2545]">
                Corporate Profile & Mandate
              </h3>
              <p className="text-xs text-[#EA580C] font-semibold">A "Mini Ratna" Central Public Sector Enterprise</p>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Established on <strong>27th September 1999</strong> by the Ministry of Railways, Government of India, IRCTC was
              created to upgrade, professionalize, and manage the catering, hospitality, and tourism services of the Indian
              Railways network. It operates one of the world's highest-transacting single e-commerce platforms.
            </p>
            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
              <div>• <strong>Headquarters:</strong> Statesman House, Barakhamba Road, New Delhi</div>
              <div>• <strong>Ownership:</strong> 67% held by Government of India (NSE/BSE Listed)</div>
            </div>
          </div>

          {/* Card 2: Core Operating Divisions */}
          <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0B2545]">
                The Four Operational Pillars
              </h3>
              <p className="text-xs text-emerald-700 font-semibold">Comprehensive Passenger Ecosystem</p>
            </div>
            <div className="text-xs text-slate-600 space-y-2.5 leading-relaxed">
              <div>
                <strong className="text-slate-900">1. Internet Ticketing (PRS):</strong> Handles over 1.4 million reserved tickets daily, accounting for &gt;80% of all Indian Railways reserved travel.
              </div>
              <div>
                <strong className="text-slate-900">2. Hospitality & On-Board Catering:</strong> Operates pantry cars, base kitchens, executive lounges, and station food plazas across 7,000+ stations.
              </div>
              <div>
                <strong className="text-slate-900">3. Tourism & Luxury Trains:</strong> Operates flagship tourist itineraries including Maharajas' Express, Bharat Gaurav, and Buddhist Circuit trains.
              </div>
              <div>
                <strong className="text-slate-900">4. Packaged Drinking Water (Rail Neer):</strong> State-of-the-art purification plants producing millions of safe 1-litre bottles daily.
              </div>
            </div>
          </div>

          {/* Card 3: Digital Scale & CRIS Architecture */}
          <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#1D4ED8] flex items-center justify-center border border-blue-200">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0B2545]">
                Digital Infrastructure & Scale
              </h3>
              <p className="text-xs text-[#1D4ED8] font-semibold">Powered by CRIS (Centre for Railway Info Systems)</p>
            </div>
            <div className="text-xs text-slate-600 space-y-2.5 leading-relaxed">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-[11px] space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Peak Booking Capacity:</span>
                  <span className="text-[#EA580C] font-bold">28,000+ tickets/min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Active Registered Users:</span>
                  <span className="text-slate-900 font-bold">110+ Million</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Daily Passenger Volume:</span>
                  <span className="text-emerald-700 font-bold">23+ Million</span>
                </div>
              </div>
              <p>
                The next-generation NextGen e-Ticketing system leverages high-concurrency memory databases, bot mitigation governors,
                and microservices to manage extreme spikes during 10:00 AM Tatkal windows.
              </p>
            </div>
          </div>
        </div>

        {/* 4 Quick Facts Pills Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-slate-900">IRCTC iMudra Digital Wallet</div>
              <div className="text-[11px] text-slate-500">Instant one-click checkout for Tatkal without OTP delays.</div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-[#EA580C] shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-slate-900">24x7 RailMadad 139</div>
              <div className="text-[11px] text-slate-500">Unified SMS, interactive voice & web grievance tracking.</div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-[#1D4ED8] shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-slate-900">Vikalp Alternative Train Scheme</div>
              <div className="text-[11px] text-slate-500">Automatic seat confirmation on alternate trains on same route.</div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-slate-900">E-Catering Delivery at Berth</div>
              <div className="text-[11px] text-slate-500">FSSAI-certified meals delivered directly to your coach seat.</div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PASSENGER CONVENIENCE QUICK-LINKS BAR */}
      <section className="p-6 rounded-2xl bg-[#0B2545] border-t-2 border-[#EA580C] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
        <div className="space-y-1">
          <div className="text-xs font-bold text-[#FFB703] uppercase tracking-wider font-ticket">
            Essential Passenger Services
          </div>
          <h3 className="text-lg font-bold text-white">
            Need on-board food, coach cleaning, or to view your booked tickets?
          </h3>
          <p
            className="text-xs text-white border-[#3a657b]"
            style={{ borderColor: '#3a657b', color: '#ffffff' }}
          >
            Access real-time journey assistance directly with your confirmed PNR.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setCurrentTab('find-train')}
            className="px-4 py-2.5 rounded-xl bg-[#001D3D] hover:bg-[#002855] text-amber-300 hover:text-white border border-blue-800 text-xs font-bold transition-colors flex items-center gap-2"
          >
            <Search className="w-4 h-4 text-amber-300" />
            <span>Find My Train / ट्रेन खोजें</span>
          </button>

          <button
            onClick={() => {
              if (!isLoggedIn) {
                triggerLoginRequired('use IRCTC passenger services');
                return;
              }
              setCurrentTab('services');
            }}
            className="px-4 py-2.5 rounded-xl bg-[#001D3D] hover:bg-[#002855] text-slate-200 hover:text-white border border-blue-800 text-xs font-bold transition-colors flex items-center gap-2"
          >
            <UtensilsCrossed className="w-4 h-4 text-amber-300" />
            <span>On-Board Services</span>
          </button>

          <button
            onClick={() => setCurrentTab('my-bookings')}
            className="px-4 py-2.5 rounded-xl bg-[#001D3D] hover:bg-[#002855] text-slate-200 hover:text-white border border-blue-800 text-xs font-bold transition-colors flex items-center gap-2"
          >
            <Ticket className="w-4 h-4 text-[#FFB703]" />
            <span>My Bookings & PNR Status</span>
          </button>

          <button
            onClick={() => {
              if (!isLoggedIn) {
                triggerLoginRequired('book train tickets');
                return;
              }
              setCurrentTab('apply');
            }}
            className="px-5 py-2.5 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold text-xs transition-colors flex items-center gap-1.5 uppercase shadow-md"
          >
            <span>Book Ticket</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* NOTICE DETAIL MODAL */}
      {selectedNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="max-w-xl w-full bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-4 shadow-2xl relative text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded bg-orange-50 text-[#EA580C] text-[11px] font-bold border border-orange-200">
                  {selectedNotice.tag}
                </span>
                <span className="text-xs text-slate-500">{selectedNotice.date}</span>
              </div>
              <button
                onClick={() => setSelectedNotice(null)}
                className="text-slate-500 hover:text-slate-800 text-xs font-medium px-2 py-1 rounded-lg bg-slate-100"
              >
                ✕ Close
              </button>
            </div>

            <div>
              <h3 className="text-lg font-bold text-[#0B2545]">{selectedNotice.title}</h3>
              {selectedNotice.hindiTitle && (
                <div className="text-sm text-[#92400E] font-hindi mt-1">{selectedNotice.hindiTitle}</div>
              )}
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {selectedNotice.summary}
            </p>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1.5">
              <div className="font-bold text-slate-900">Official Directive Circular:</div>
              <div>Ref: IRCTC/CO/PRS/2026/POL-09 • Indian Railways Railway Board, New Delhi</div>
              <div>Applies to: All Zonal Railways, PRS counters, IRCTC Rail Connect App & Web Portal.</div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedNotice(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
              >
                Dismiss
              </button>
              <button
                onClick={() => {
                  setSelectedNotice(null);
                  if (!isLoggedIn) {
                    triggerLoginRequired('book train tickets');
                    return;
                  }
                  setCurrentTab('apply');
                }}
                className="px-5 py-2 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
              >
                <span>Book Ticket Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
