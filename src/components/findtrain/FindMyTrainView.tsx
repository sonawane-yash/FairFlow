import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Train,
  ArrowRightLeft,
  MapPin,
  Clock,
  Calendar,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ShieldCheck,
  Utensils,
  Wifi,
  Gauge,
  Star,
  Compass,
  Layers,
  Info,
  ArrowUpRight,
  X,
  Filter
} from 'lucide-react';
import {
  INDIAN_RAILWAYS_TRAINS,
  MAJOR_STATIONS,
  TrainDetail,
  RailwayStation
} from '../../data/trainData';
import {
  selectTrainForRake,
} from '../common/InteractiveRakeRail';
import { useAuth } from '../../context/AuthContext';

interface FindMyTrainViewProps {
  onBookTrain?: (trainNumber: string) => void;
  onNavigateHome?: () => void;
}

export const FindMyTrainView: React.FC<FindMyTrainViewProps> = ({
  onBookTrain,
  onNavigateHome
}) => {
  const { isLoggedIn, triggerLoginRequired } = useAuth();

  // Search Mode: 'number-or-name' | 'stations'
  const [searchMode, setSearchMode] = useState<'number-or-name' | 'stations'>('number-or-name');

  // Search by Train Number / Name State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeRakeTrainNumber, setActiveRakeTrainNumber] = useState<string>('22436');

  // Sync default train to rake on mount
  useEffect(() => {
    const defaultTrain = INDIAN_RAILWAYS_TRAINS.find((t) => t.number === '22436') || INDIAN_RAILWAYS_TRAINS[0];
    if (defaultTrain) {
      selectTrainForRake(defaultTrain);
      setActiveRakeTrainNumber(defaultTrain.number);
    }
  }, []);

  const handleSelectTrainForLiveRake = (train: TrainDetail) => {
    setActiveRakeTrainNumber(train.number);
    selectTrainForRake(train);
  };

  const handleBookTrainAction = (trainNumber: string) => {
    if (!isLoggedIn) {
      triggerLoginRequired(`book tickets for Train #${trainNumber}`);
      return;
    }
    if (onBookTrain) onBookTrain(trainNumber);
  };

  // Search by Stations State
  const [departingStation, setDepartingStation] = useState<string>('NDLS');
  const [arrivingStation, setArrivingStation] = useState<string>('BSB');
  const [selectedTravelDate, setSelectedTravelDate] = useState<string>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('ALL');

  // Detailed Modal / Drawer State for Selected Train
  const [selectedTrainDetail, setSelectedTrainDetail] = useState<TrainDetail | null>(null);
  const [activeDetailTab, setActiveDetailTab] = useState<'overview' | 'schedule' | 'live-status'>('overview');

  // Swap From and To stations
  const handleSwapStations = () => {
    const temp = departingStation;
    setDepartingStation(arrivingStation);
    setArrivingStation(temp);
  };

  // Filter trains based on current search mode & queries
  const searchResults = useMemo(() => {
    if (searchMode === 'number-or-name') {
      const q = searchQuery.trim().toLowerCase();
      if (!q) {
        return [];
      }
      return INDIAN_RAILWAYS_TRAINS.filter((t) => {
        const matchesNumber =
          t.number.toLowerCase().includes(q) ||
          t.returnNumber.toLowerCase().includes(q);
        const matchesName =
          t.name.toLowerCase().includes(q) ||
          t.hindiName.toLowerCase().includes(q);
        const matchesStation =
          t.fromStation.name.toLowerCase().includes(q) ||
          t.fromStation.code.toLowerCase().includes(q) ||
          t.toStation.name.toLowerCase().includes(q) ||
          t.toStation.code.toLowerCase().includes(q);
        const matchesType = t.type.toLowerCase().includes(q);

        return matchesNumber || matchesName || matchesStation || matchesType;
      });
    } else {
      // Search by stations: matches if fromStation equals departingStation and toStation equals arrivingStation
      // Or if halt list contains departingStation before arrivingStation
      return INDIAN_RAILWAYS_TRAINS.filter((t) => {
        // Direct origin & destination match
        const directMatch =
          t.fromStation.code === departingStation &&
          t.toStation.code === arrivingStation;

        // Route Halts match: departing station appears before arriving station in halts
        const depHaltIdx = t.halts.findIndex((h) => h.stationCode === departingStation);
        const arrHaltIdx = t.halts.findIndex((h) => h.stationCode === arrivingStation);
        const haltMatch = depHaltIdx !== -1 && arrHaltIdx !== -1 && depHaltIdx < arrHaltIdx;

        const matchesRoute = directMatch || haltMatch;

        // Class filter
        if (!matchesRoute) return false;
        if (selectedClassFilter === 'ALL') return true;
        return t.classes.some((c) => c.code === selectedClassFilter);
      });
    }
  }, [searchMode, searchQuery, departingStation, arrivingStation, selectedClassFilter]);

  // Popular Trains list filtered by category
  const popularTrains = useMemo(() => {
    return INDIAN_RAILWAYS_TRAINS.filter((t) => {
      if (selectedCategory === 'All') return true;
      if (selectedCategory === 'Vande Bharat') return t.type === 'Vande Bharat';
      if (selectedCategory === 'Rajdhani') return t.type === 'Rajdhani';
      if (selectedCategory === 'Shatabdi') return t.type === 'Shatabdi';
      if (selectedCategory === 'Duronto') return t.type === 'Duronto';
      if (selectedCategory === 'Gatimaan') return t.type === 'Gatimaan';
      if (selectedCategory === 'Superfast') return t.type === 'Superfast Mail';
      if (selectedCategory === 'Double Decker') return t.type === 'Double Decker';
      return true;
    });
  }, [selectedCategory]);

  const categories = [
    'All',
    'Vande Bharat',
    'Rajdhani',
    'Shatabdi',
    'Duronto',
    'Gatimaan',
    'Superfast',
    'Double Decker'
  ];

  const quickPicks = [
    { label: '22436 Vande Bharat (NDLS - BSB)', query: '22436' },
    { label: '12951 Tejas Rajdhani (MMCT - NDLS)', query: '12951' },
    { label: '12931 AC Double Decker (MMCT - ADI)', query: '12931' },
    { label: '12002 Bhopal Shatabdi', query: '12002' },
    { label: '12301 Howrah Rajdhani', query: '12301' },
    { label: '20901 Vande Bharat (Gujarat)', query: '20901' },
    { label: '12049 Gatimaan Express', query: '12049' }
  ];

  // Helper badge color
  const getTypeBadge = (type: TrainDetail['type']) => {
    switch (type) {
      case 'Vande Bharat':
        return 'bg-gradient-to-r from-orange-600 to-amber-500 text-white border-orange-400';
      case 'Rajdhani':
        return 'bg-gradient-to-r from-red-900 to-amber-700 text-white border-amber-400';
      case 'Shatabdi':
        return 'bg-gradient-to-r from-blue-900 to-cyan-700 text-white border-cyan-400';
      case 'Tejas':
        return 'bg-gradient-to-r from-amber-600 to-yellow-500 text-slate-950 border-amber-300 font-black';
      case 'Duronto':
        return 'bg-gradient-to-r from-emerald-800 to-teal-600 text-white border-emerald-400';
      case 'Gatimaan':
        return 'bg-gradient-to-r from-indigo-900 to-purple-800 text-white border-indigo-400';
      case 'Double Decker':
        return 'bg-gradient-to-r from-yellow-700 to-amber-600 text-white border-yellow-400';
      default:
        return 'bg-[#0B2545] text-white border-blue-400';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#05101E] text-slate-900 dark:text-[#F8FAFC] pb-24 transition-colors">
      {/* Top Banner / Breadcrumb */}
      <div className="bg-[#001D3D] border-b border-blue-900 text-white py-2 px-4 sm:px-8 text-xs font-sans flex items-center justify-between">
        <div className="flex items-center gap-2 text-blue-200">
          <span>भारतीय रेल / Indian Railways PRS</span>
          <span>•</span>
          <span className="text-amber-400 font-bold">Find My Train / ट्रेन पूछताछ सेवा</span>
        </div>
        <div className="hidden sm:flex items-center gap-3 text-[11px] text-slate-300">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>CRIS Real-Time National Train Enquiry System (NTES)</span>
          </span>
        </div>
      </div>

      {/* Hero Header */}
      <div className="relative bg-gradient-to-b from-[#0B2545] to-[#04192f] text-white py-8 sm:py-12 px-4 sm:px-8 border-b-2 border-[#EA580C] shadow-md overflow-hidden">
        {/* Subtle Railway Grid / Motif Background */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-mono font-bold mb-3">
                <Compass className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '8s' }} />
                <span>IRCTC Live Train Tracking & Route Explorer</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black font-ticket tracking-tight text-white flex items-center gap-3">
                <span>Find My Train</span>
                <span className="text-amber-400 text-xl sm:text-2xl font-normal font-sans">
                  / अपनी ट्रेन खोजें
                </span>
              </h1>
              <p className="mt-2 text-sm sm:text-base text-blue-200/90 max-w-2xl font-sans">
                Search authentic Indian Railways train timetables, live running status, halts schedule, coach composition, and berth availability across all premier trains.
              </p>
            </div>

            {/* Quick Stats Pill */}
            <div className="flex items-center gap-3 bg-[#001D3D]/90 border border-blue-800/80 p-3.5 rounded-2xl shadow-lg self-start md:self-auto shrink-0">
              <div className="w-11 h-11 rounded-xl bg-[#EA580C] flex items-center justify-center text-white shadow-sm">
                <Train className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs text-blue-200 uppercase font-mono tracking-wider">
                  Active Express Trains
                </div>
                <div className="text-lg font-black text-amber-300 font-ticket">
                  12,000+ Services
                </div>
                <div className="text-[10px] text-emerald-400 flex items-center gap-1 font-sans">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>GPS Tracking Synced</span>
                </div>
              </div>
            </div>
          </div>

          {/* Search Mode Tab Switcher */}
          <div className="mt-8 flex items-center gap-2 bg-[#001D3D]/80 p-1.5 rounded-2xl border border-blue-800/80 max-w-md shadow-inner">
            <button
              onClick={() => setSearchMode('number-or-name')}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold font-sans flex items-center justify-center gap-2 transition-all ${
                searchMode === 'number-or-name'
                  ? 'bg-[#EA580C] text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>By Train No. / Name</span>
            </button>

            <button
              onClick={() => setSearchMode('stations')}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold font-sans flex items-center justify-center gap-2 transition-all ${
                searchMode === 'stations'
                  ? 'bg-[#EA580C] text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>By Stations (From ➔ To)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 -mt-5 relative z-20 space-y-8">
        {/* Search Bar & Controls Card */}
        <div className="bg-white dark:bg-[#0B1E38] rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-[#1E3A5F] shadow-xl text-slate-900 dark:text-[#F8FAFC]">
          {searchMode === 'number-or-name' ? (
            /* MODE 1: SEARCH BY TRAIN NUMBER OR NAME */
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                    <Search className="w-5 h-5 text-[#EA580C]" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by Train Number (e.g. 22436, 12951) or Train Name (e.g. Vande Bharat, Rajdhani, Shatabdi)..."
                    className="w-full pl-11 pr-10 py-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#081728] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:border-transparent transition-all shadow-inner"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <button
                  onClick={() => {
                    if (!searchQuery) setSearchQuery('Vande Bharat');
                  }}
                  className="px-6 py-3.5 rounded-xl bg-[#0B2545] hover:bg-[#002855] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all shrink-0 border border-blue-900"
                >
                  <Search className="w-4 h-4 text-amber-400" />
                  <span>Search Train</span>
                </button>
              </div>

              {/* Quick Search Chips */}
              <div className="flex items-center gap-2 flex-wrap pt-1 text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#EA580C]" />
                  <span>Quick Search:</span>
                </span>
                {quickPicks.map((pick) => (
                  <button
                    key={pick.query}
                    onClick={() => setSearchQuery(pick.query)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-[#08162A] hover:bg-orange-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-[#EA580C] border border-slate-200 dark:border-slate-700 font-mono transition-colors"
                  >
                    {pick.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* MODE 2: SEARCH BY DEPARTING & ARRIVING STATIONS */
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                {/* From Station */}
                <div className="md:col-span-4">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 font-ticket flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#EA580C]" />
                    <span>प्रस्थान स्टेशन / FROM STATION</span>
                  </label>
                  <select
                    value={departingStation}
                    onChange={(e) => setDepartingStation(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#081728] text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#EA580C]"
                  >
                    {MAJOR_STATIONS.map((s) => (
                      <option key={s.code} value={s.code}>
                        {s.name} ({s.code}) - {s.city}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Swap Button */}
                <div className="md:col-span-1 flex items-center justify-center pt-2 md:pt-4">
                  <button
                    type="button"
                    onClick={handleSwapStations}
                    className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-orange-100 dark:hover:bg-orange-950/60 text-[#EA580C] border border-slate-300 dark:border-slate-700 transition-all shadow-xs hover:rotate-180 duration-300"
                    title="Swap Origin & Destination Stations"
                  >
                    <ArrowRightLeft className="w-4 h-4" />
                  </button>
                </div>

                {/* To Station */}
                <div className="md:col-span-4">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 font-ticket flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                    <span>गंतव्य स्टेशन / TO STATION</span>
                  </label>
                  <select
                    value={arrivingStation}
                    onChange={(e) => setArrivingStation(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#081728] text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#EA580C]"
                  >
                    {MAJOR_STATIONS.map((s) => (
                      <option key={s.code} value={s.code}>
                        {s.name} ({s.code}) - {s.city}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Travel Date */}
                <div className="md:col-span-3">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 font-ticket flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-500" />
                    <span>यात्रा तिथि / DATE</span>
                  </label>
                  <input
                    type="date"
                    value={selectedTravelDate}
                    onChange={(e) => setSelectedTravelDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#081728] text-slate-900 dark:text-white text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#EA580C]"
                  />
                </div>
              </div>

              {/* Class Filter Pills */}
              <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-slate-100 dark:border-slate-700 text-xs">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1">
                    <Filter className="w-3.5 h-3.5 text-blue-500" />
                    <span>Travel Class:</span>
                  </span>
                  {['ALL', '1A', '2A', '3A', 'CC', 'EC', 'SL'].map((cls) => (
                    <button
                      key={cls}
                      onClick={() => setSelectedClassFilter(cls)}
                      className={`px-2.5 py-1 rounded-lg font-mono font-bold text-[11px] transition-all ${
                        selectedClassFilter === cls
                          ? 'bg-[#0B2545] dark:bg-[#1D4ED8] text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {cls === 'ALL' ? 'All Classes' : cls}
                    </button>
                  ))}
                </div>

                <div className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                  Showing connecting & direct high-speed links
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SEARCH RESULTS (Visible when query is present in Mode 1 or always in Mode 2) */}
        {(searchQuery.trim() !== '' || searchMode === 'stations') && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black font-ticket text-[#0B2545] dark:text-white flex items-center gap-2">
                  <Train className="w-5 h-5 text-[#EA580C]" />
                  <span>
                    {searchMode === 'number-or-name'
                      ? `Search Results for "${searchQuery}"`
                      : `Trains Between ${departingStation} ➔ ${arrivingStation}`}
                  </span>
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950/60 text-[#EA580C] text-xs font-bold font-mono">
                  {searchResults.length} {searchResults.length === 1 ? 'Train' : 'Trains'} Found
                </span>
              </div>

              {searchMode === 'number-or-name' && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white underline font-sans"
                >
                  Clear search
                </button>
              )}
            </div>

            {searchResults.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {searchResults.map((train) => (
                  <TrainCard
                    key={train.number}
                    train={train}
                    badgeClass={getTypeBadge(train.type)}
                    isSelectedForRake={train.number === activeRakeTrainNumber}
                    onSelectForRake={() => handleSelectTrainForLiveRake(train)}
                    onViewDetails={() => {
                      setSelectedTrainDetail(train);
                      handleSelectTrainForLiveRake(train);
                      setActiveDetailTab('overview');
                    }}
                    onBookNow={() => handleBookTrainAction(train.number)}
                  />
                ))}
              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-white dark:bg-[#0B1E38] border border-slate-200 dark:border-[#1E3A5F] text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center mx-auto">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                  No Direct Trains Found
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  {searchMode === 'number-or-name'
                    ? `No train matching "${searchQuery}". Please check the train number or try searching popular trains below.`
                    : `No direct service indexed between ${departingStation} and ${arrivingStation}. Try swapping the stations or selecting popular routes below.`}
                </p>
                <button
                  onClick={() => {
                    setSearchMode('number-or-name');
                    setSearchQuery('22436');
                  }}
                  className="px-4 py-2 rounded-xl bg-[#EA580C] text-white font-bold text-xs shadow-sm hover:bg-[#C2410C] transition-all"
                >
                  View Flagship Vande Bharat (22436)
                </button>
              </div>
            )}
          </div>
        )}

        {/* SECTION: POPULAR TRAINS OF INDIAN RAILWAYS */}
        <div className="space-y-4 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
                <h2 className="text-lg sm:text-xl font-black font-ticket text-[#0B2545] dark:text-white">
                  Popular & Flagship Trains of Indian Railways
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-0.5">
                Premier Vande Bharat, Tejas Rajdhani, Shatabdi & Duronto express services operating across major trunk corridors.
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-[#0B2545] dark:bg-[#1D4ED8] text-white shadow-xs'
                      : 'bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Popular Trains Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {popularTrains.map((train) => (
              <TrainCard
                key={train.number}
                train={train}
                badgeClass={getTypeBadge(train.type)}
                isSelectedForRake={train.number === activeRakeTrainNumber}
                onSelectForRake={() => handleSelectTrainForLiveRake(train)}
                onViewDetails={() => {
                  setSelectedTrainDetail(train);
                  handleSelectTrainForLiveRake(train);
                  setActiveDetailTab('overview');
                }}
                onBookNow={() => handleBookTrainAction(train.number)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* COMPREHENSIVE TRAIN DETAIL & LIVE STATUS MODAL */}
      {selectedTrainDetail && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in"
        >
          <div
            className="relative w-full max-w-3xl max-h-[90vh] rounded-2xl bg-white dark:bg-[#0B1E38] text-slate-900 dark:text-[#F8FAFC] border-2 border-[#0B2545] dark:border-[#1E3A5F] shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-[#0B2545] text-white p-4 sm:p-5 border-b-2 border-[#EA580C] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-[#EA580C] text-white flex items-center justify-center shadow-md font-ticket font-black text-sm">
                  {selectedTrainDetail.number}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base sm:text-lg font-black font-ticket text-white">
                      {selectedTrainDetail.name}
                    </h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase border ${getTypeBadge(selectedTrainDetail.type)}`}>
                      {selectedTrainDetail.type}
                    </span>
                  </div>
                  <p className="text-xs text-amber-300 font-sans mt-0.5">
                    {selectedTrainDetail.hindiName} • {selectedTrainDetail.zone}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedTrainDetail(null)}
                  className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Close Train Details"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Subnav Tabs */}
            <div className="flex items-center border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#08162A] px-4 pt-2 gap-2 shrink-0">
              <button
                onClick={() => setActiveDetailTab('overview')}
                className={`pb-2.5 px-3 text-xs font-bold font-sans flex items-center gap-1.5 transition-all border-b-2 ${
                  activeDetailTab === 'overview'
                    ? 'border-[#EA580C] text-[#EA580C]'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Info className="w-4 h-4" />
                <span>Overview & Amenities</span>
              </button>

              <button
                onClick={() => setActiveDetailTab('schedule')}
                className={`pb-2.5 px-3 text-xs font-bold font-sans flex items-center gap-1.5 transition-all border-b-2 ${
                  activeDetailTab === 'schedule'
                    ? 'border-[#EA580C] text-[#EA580C]'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>Halts & Timetable ({selectedTrainDetail.halts.length} Stations)</span>
              </button>

              <button
                onClick={() => setActiveDetailTab('live-status')}
                className={`pb-2.5 px-3 text-xs font-bold font-sans flex items-center gap-1.5 transition-all border-b-2 ${
                  activeDetailTab === 'live-status'
                    ? 'border-[#EA580C] text-[#EA580C]'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Gauge className="w-4 h-4" />
                <span>Live GPS Status (Simulated)</span>
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-5 overflow-y-auto flex-1 space-y-5 text-xs font-sans">
              {activeDetailTab === 'overview' && (
                <div className="space-y-4">
                  {/* Route & Timing Summary Banner */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#081728] border border-slate-200 dark:border-slate-700 grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">DEPARTURE</div>
                      <div className="text-sm font-black text-slate-900 dark:text-white font-mono mt-0.5">
                        {selectedTrainDetail.fromStation.depTime}
                      </div>
                      <div className="text-[11px] font-bold text-[#0B2545] dark:text-amber-300 truncate">
                        {selectedTrainDetail.fromStation.name} ({selectedTrainDetail.fromStation.code})
                      </div>
                      <div className="text-[9px] text-slate-500">Platform #{selectedTrainDetail.fromStation.platform}</div>
                    </div>

                    <div className="flex flex-col items-center justify-center">
                      <div className="text-[10px] text-[#EA580C] font-mono font-bold">
                        {selectedTrainDetail.duration}
                      </div>
                      <div className="w-full flex items-center my-1 px-2">
                        <div className="h-0.5 flex-1 bg-slate-300 dark:bg-slate-600" />
                        <Train className="w-4 h-4 text-[#EA580C] mx-1" />
                        <div className="h-0.5 flex-1 bg-slate-300 dark:bg-slate-600" />
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">
                        {selectedTrainDetail.distanceKm} KM • Avg {selectedTrainDetail.avgSpeedKmH} km/h
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">ARRIVAL</div>
                      <div className="text-sm font-black text-slate-900 dark:text-white font-mono mt-0.5">
                        {selectedTrainDetail.toStation.arrTime}
                      </div>
                      <div className="text-[11px] font-bold text-[#0B2545] dark:text-amber-300 truncate">
                        {selectedTrainDetail.toStation.name} ({selectedTrainDetail.toStation.code})
                      </div>
                      <div className="text-[9px] text-slate-500">Platform #{selectedTrainDetail.toStation.platform}</div>
                    </div>
                  </div>

                  {/* Operational Days */}
                  <div>
                    <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 font-ticket">
                      Runs On Days / चलने के दिन:
                    </div>
                    <div className="flex items-center gap-1.5">
                      {(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const).map((day) => {
                        const runs = selectedTrainDetail.runningDays.includes(day);
                        return (
                          <span
                            key={day}
                            className={`px-2.5 py-1 rounded-lg font-mono font-bold text-xs ${
                              runs
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 line-through opacity-50'
                            }`}
                          >
                            {day}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Available Travel Classes & Fares */}
                  <div>
                    <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 font-ticket">
                      Available Classes & Synthetic Fares / उपलब्ध श्रेणियां:
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {selectedTrainDetail.classes.map((cls) => (
                        <div
                          key={cls.code}
                          className="p-3 rounded-xl bg-slate-50 dark:bg-[#081728] border border-slate-200 dark:border-slate-700 flex items-center justify-between"
                        >
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="px-1.5 py-0.5 rounded bg-[#0B2545] dark:bg-blue-900 text-amber-300 font-mono font-bold text-[10px]">
                                {cls.code}
                              </span>
                              <span className="font-bold text-slate-900 dark:text-white">
                                {cls.name}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                              {cls.seatType}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-mono font-bold text-slate-900 dark:text-white text-xs">
                              ₹{cls.baseFare}
                            </div>
                            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                              {cls.quotaStatus}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Train Amenities & Specifications */}
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#081728] border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="font-bold text-slate-700 dark:text-slate-300 font-ticket">
                      Onboard Facilities & Technical Rake Specs:
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                        <Utensils className="w-3.5 h-3.5 text-[#EA580C]" />
                        <span>{selectedTrainDetail.catering}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                        <Wifi className="w-3.5 h-3.5 text-blue-500" />
                        <span>{selectedTrainDetail.wifi ? 'Satellite Wi-Fi' : 'No Wi-Fi'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                        <Gauge className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Max {selectedTrainDetail.maxSpeedKmH} km/h</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                        <span>{selectedTrainDetail.coachesCount} Coaches Rake</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeDetailTab === 'schedule' && (
                <div className="space-y-3">
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                    Full route timetable from source station to destination. Scheduled times are in Indian Standard Time (IST).
                  </div>
                  <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#0B2545] text-white font-mono text-[10px] uppercase">
                        <tr>
                          <th className="p-2.5">#</th>
                          <th className="p-2.5">Code</th>
                          <th className="p-2.5">Station Name</th>
                          <th className="p-2.5">Arr</th>
                          <th className="p-2.5">Dep</th>
                          <th className="p-2.5">Halt</th>
                          <th className="p-2.5">Dist (KM)</th>
                          <th className="p-2.5">Platform</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-[#0B1E38]">
                        {selectedTrainDetail.halts.map((halt) => (
                          <tr
                            key={halt.stationCode}
                            className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                          >
                            <td className="p-2.5 font-mono font-bold text-slate-500">
                              {halt.stopNo}
                            </td>
                            <td className="p-2.5 font-mono font-black text-[#EA580C]">
                              {halt.stationCode}
                            </td>
                            <td className="p-2.5 font-bold text-slate-900 dark:text-white">
                              {halt.stationName}
                            </td>
                            <td className="p-2.5 font-mono text-slate-700 dark:text-slate-300">
                              {halt.arrival}
                            </td>
                            <td className="p-2.5 font-mono text-slate-700 dark:text-slate-300">
                              {halt.departure}
                            </td>
                            <td className="p-2.5 font-mono text-slate-500">
                              {halt.haltMins > 0 ? `${halt.haltMins}m` : '--'}
                            </td>
                            <td className="p-2.5 font-mono text-slate-600 dark:text-slate-400">
                              {halt.distanceKm}
                            </td>
                            <td className="p-2.5 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                              PF #{halt.platform}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeDetailTab === 'live-status' && (
                <div className="space-y-4">
                  {/* Live GPS Telemetry Dashboard */}
                  <div className="p-4 rounded-xl bg-gradient-to-br from-[#0B2545] to-[#04192f] text-white space-y-3 border border-blue-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                        <span className="font-mono text-xs font-bold text-emerald-300 uppercase tracking-wider">
                          LIVE RUNNING STATUS (NTES GPS)
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-mono text-[10px] font-bold">
                        {selectedTrainDetail.liveStatusSimulation.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-1">
                      <div>
                        <div className="text-[10px] text-blue-200">Current Position:</div>
                        <div className="text-sm font-bold text-amber-300 mt-0.5">
                          {selectedTrainDetail.liveStatusSimulation.currentLocation}
                        </div>
                      </div>

                      <div>
                        <div className="text-[10px] text-blue-200">Next Approaching Station:</div>
                        <div className="text-sm font-bold text-white mt-0.5">
                          {selectedTrainDetail.liveStatusSimulation.nextStation}
                        </div>
                      </div>
                    </div>

                    {/* Telemetry Numbers */}
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-blue-900 text-center font-mono">
                      <div>
                        <div className="text-[10px] text-blue-300">CURRENT SPEED</div>
                        <div className="text-base font-black text-amber-400">
                          {selectedTrainDetail.liveStatusSimulation.currentSpeedKmH} km/h
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-blue-300">COVERED DISTANCE</div>
                        <div className="text-base font-black text-white">
                          {selectedTrainDetail.liveStatusSimulation.completedDistanceKm} / {selectedTrainDetail.distanceKm} KM
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-blue-300">PUNCTUALITY</div>
                        <div className="text-base font-black text-emerald-400">
                          {selectedTrainDetail.punctualityScore}%
                        </div>
                      </div>
                    </div>

                    {/* Visual Route Progress Track */}
                    <div className="space-y-1 pt-2">
                      <div className="w-full bg-blue-950 rounded-full h-2.5 overflow-hidden border border-blue-800">
                        <div
                          className="bg-gradient-to-r from-emerald-400 via-amber-400 to-[#EA580C] h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.round(
                              (selectedTrainDetail.liveStatusSimulation.completedDistanceKm /
                                selectedTrainDetail.distanceKm) *
                                100
                            )}%`
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-blue-200 font-mono">
                        <span>{selectedTrainDetail.fromStation.code}</span>
                        <span className="text-amber-300 font-bold">
                          {Math.round(
                            (selectedTrainDetail.liveStatusSimulation.completedDistanceKm /
                              selectedTrainDetail.distanceKm) *
                              100
                          )}% Completed
                        </span>
                        <span>{selectedTrainDetail.toStation.code}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer CTA */}
            <div className="p-4 bg-slate-50 dark:bg-[#08162A] border-t border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 shrink-0">
              <button
                onClick={() => setSelectedTrainDetail(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              >
                Close
              </button>

              <button
                onClick={() => {
                  const trainNo = selectedTrainDetail.number;
                  setSelectedTrainDetail(null);
                  handleBookTrainAction(trainNo);
                }}
                className="px-6 py-2.5 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold text-xs flex items-center gap-2 shadow-md uppercase transition-all"
              >
                <Train className="w-4 h-4" />
                <span>Book on FairFlow PRS</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* TRAIN CARD COMPONENT */
interface TrainCardProps {
  train: TrainDetail;
  badgeClass: string;
  isSelectedForRake: boolean;
  onSelectForRake: () => void;
  onViewDetails: () => void;
  onBookNow: () => void;
}

const TrainCard: React.FC<TrainCardProps> = ({
  train,
  badgeClass,
  isSelectedForRake,
  onSelectForRake,
  onViewDetails,
  onBookNow
}) => {
  return (
    <div
      onClick={onSelectForRake}
      className={`rounded-2xl cursor-pointer p-4 sm:p-5 shadow-sm hover:shadow-md transition-all text-slate-900 dark:text-[#F8FAFC] space-y-3.5 ${
        isSelectedForRake
          ? 'bg-amber-50/40 dark:bg-amber-950/20 border-2 border-amber-500 shadow-md ring-2 ring-amber-400/20'
          : 'bg-white dark:bg-[#0B1E38] border border-slate-200 dark:border-[#1E3A5F]'
      }`}
    >
      {/* Top Strip: Train No, Name, Type & Highlight */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="px-2.5 py-1 rounded-lg bg-[#0B2545] text-amber-300 font-mono font-black text-xs shadow-xs">
            #{train.number}
          </span>
          <div>
            <h3 className="font-bold text-sm sm:text-base font-ticket text-[#0B2545] dark:text-white leading-tight">
              {train.name}
            </h3>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-sans">
              {train.hindiName}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto flex-wrap">
          {/* Live Rake Active Status Pill */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelectForRake();
            }}
            className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1 transition-all ${
              isSelectedForRake
                ? 'bg-amber-400 text-slate-950 shadow-xs ring-1 ring-amber-500'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-amber-100 hover:text-amber-800'
            }`}
            title="Click to select this train's architecture and coaches on the live vertical rail"
          >
            <Layers className="w-3 h-3" />
            <span>{isSelectedForRake ? 'Live Rail Active' : 'Select on Rail'}</span>
          </button>

          <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase border ${badgeClass}`}>
            {train.type}
          </span>
          {train.highlightTag && (
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-sans font-semibold hidden md:inline">
              {train.highlightTag}
            </span>
          )}
        </div>
      </div>

      {/* Origin, Timings, Duration, Destination */}
      <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#081728] border border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-2 items-center text-center">
        {/* From */}
        <div>
          <div className="text-base sm:text-lg font-black font-mono text-slate-900 dark:text-white">
            {train.fromStation.depTime}
          </div>
          <div className="text-xs font-bold text-[#0B2545] dark:text-amber-300 truncate">
            {train.fromStation.name}
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            {train.fromStation.code} • PF #{train.fromStation.platform}
          </div>
        </div>

        {/* Center arrow with duration */}
        <div className="flex flex-col items-center">
          <div className="text-[10px] font-mono font-bold text-[#EA580C]">
            {train.duration}
          </div>
          <div className="w-full flex items-center my-0.5 px-2">
            <div className="h-0.5 flex-1 bg-slate-300 dark:bg-slate-600" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#EA580C] mx-1" />
            <div className="h-0.5 flex-1 bg-slate-300 dark:bg-slate-600" />
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400">
            {train.distanceKm} KM
          </div>
        </div>

        {/* To */}
        <div>
          <div className="text-base sm:text-lg font-black font-mono text-slate-900 dark:text-white">
            {train.toStation.arrTime}
          </div>
          <div className="text-xs font-bold text-[#0B2545] dark:text-amber-300 truncate">
            {train.toStation.name}
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            {train.toStation.code} • PF #{train.toStation.platform}
          </div>
        </div>
      </div>

      {/* Available Classes & Running Days */}
      <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">Classes:</span>
          {train.classes.map((c) => (
            <span
              key={c.code}
              className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-mono font-bold text-slate-800 dark:text-slate-200"
            >
              {c.code}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
          <span>Runs:</span>
          <span className="font-bold text-emerald-600 dark:text-emerald-400">
            {train.runningDays.length === 7 ? 'Daily' : `${train.runningDays.length} Days/Wk`}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div
        className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onViewDetails}
          className="flex-1 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
        >
          <Info className="w-3.5 h-3.5 text-blue-500" />
          <span>Full Route & Halts</span>
        </button>

        <button
          onClick={onBookNow}
          className="flex-1 py-2 px-3 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs uppercase transition-all"
        >
          <span>Book E-Ticket</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
