import React, { useState, useRef, useEffect } from 'react';
import {
  Layers,
  Play,
  Activity,
  BarChart3,
  BookOpen,
  Sliders,
  Send,
  Ticket,
  ChevronDown,
  Menu,
  X,
  Radio,
  Train,
  Clock,
  ShieldCheck,
  Sparkles,
  Sun,
  Moon,
  Eye,
  Languages,
  Type,
  User,
  Settings,
  UserCheck,
  LogOut,
  LogIn,
  UtensilsCrossed,
  BookMarked,
  Search
} from 'lucide-react';
import { RESERVATION_SCENARIOS } from '../../data/scenarios';
import { ScenarioType } from '../../types';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useAuth } from '../../context/AuthContext';
import { AccessibilityModal } from './AccessibilityModal';
import { ProfileModal, ProfileModalTab } from '../profile/ProfileModal';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  activeScenario: ScenarioType;
  onScenarioChange: (scenario: ScenarioType) => void;
  onRunQuickDemo: () => void;
  onOpenTicketSlip?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  activeScenario,
  onScenarioChange,
  onRunQuickDemo,
  onOpenTicketSlip
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scenarioDropdownOpen, setScenarioDropdownOpen] = useState(false);
  const [accessibilityModalOpen, setAccessibilityModalOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileProfileDropdownOpen, setMobileProfileDropdownOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileModalTab, setProfileModalTab] = useState<ProfileModalTab>('update-profile');
  const [isTickerPaused, setIsTickerPaused] = useState(false);

  const profileMenuRef = useRef<HTMLDivElement>(null);
  const mobileProfileMenuRef = useRef<HTMLDivElement>(null);
  const { theme, toggleTheme, language, fontSize, t } = useAccessibility();
  const { currentUser, isLoggedIn, openLoginModal, logout, triggerLoginRequired } = useAuth();

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
      if (mobileProfileMenuRef.current && !mobileProfileMenuRef.current.contains(e.target as Node)) {
        setMobileProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedScenario = RESERVATION_SCENARIOS.find((s) => s.id === activeScenario) || RESERVATION_SCENARIOS[0];

  const navItems = [
    { id: 'landing', label: 'Home', icon: Train },
    { id: 'find-train', label: 'Find My Train', icon: Search },
    { id: 'apply', label: 'Book', icon: Send },
    { id: 'my-bookings', label: 'My PNR', icon: Ticket },
    { id: 'services', label: 'Services', icon: UtensilsCrossed },
    { id: 'glossary', label: 'Glossary of IRCTC', icon: BookMarked },
    { id: 'philosophy', label: 'Project Methodology', icon: BookOpen, highlight: true }
  ];

  const handleOpenProfileTab = (tab: ProfileModalTab) => {
    setProfileModalTab(tab);
    setProfileModalOpen(true);
    setProfileDropdownOpen(false);
  };

  const handleNavigateToBookings = () => {
    setCurrentTab('my-bookings');
    setProfileDropdownOpen(false);
    setProfileModalOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#0B2545] border-b-2 border-[#EA580C] shadow-lg transition-colors">
        {/* Indian Railways Tricolor & Livery Ribbon */}
        <div className="h-1 bg-gradient-to-r from-[#FF9933] via-white to-[#138808] w-full" />

        {/* Indian Railways Live Operational Ticker (Animated right-to-left with hover pause & no scrollbar) */}
        <div
          onMouseEnter={() => setIsTickerPaused(true)}
          onMouseLeave={() => setIsTickerPaused(false)}
          className="group relative bg-[#001D3D] border-b border-blue-950 py-1 px-2 text-[11px] font-sans text-slate-200 overflow-hidden whitespace-nowrap select-none cursor-default"
          title="IRCTC Live Operational Ticker (Hover to pause)"
        >
          <div
            className="animate-ticker-marquee flex items-center gap-8 will-change-transform"
            style={{
              animationPlayState: isTickerPaused ? 'paused' : 'running'
            }}
          >
            {/* Ticker Set 1 */}
            <div className="flex items-center gap-4 shrink-0">
              <span className="flex items-center gap-1.5 text-[#FFB703] font-bold uppercase tracking-wider text-[10px]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>IRCTC FAIRFLOW PRS</span>
              </span>
              <span className="text-blue-300/40">|</span>
              <span className="text-slate-200">
                AC Tatkal Quota Opening: <strong className="text-[#FFB703]">10:00:00 AM IST</strong>
              </span>
              <span className="text-blue-300/40">•</span>
              <span className="text-slate-200">
                Non-AC Tatkal: <strong className="text-amber-200">11:00:00 AM IST</strong>
              </span>
              <span className="text-blue-300/40">•</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Anti-Bot Stampede Governor: Protected</span>
              </span>
              <span className="text-blue-300/40">•</span>
              <span className="text-slate-300">
                CRIS Server Cluster: Safe Load &lt; 5,000 req/s
              </span>
              <span className="text-blue-300/40">•</span>
              <span className="text-[#FFB703] font-medium">
                {t('happyJourney', 'शुभयात्रा / Happy Journey')}
              </span>
            </div>

            {/* Ticker Set 2 (Seamless loop repeat) */}
            <div className="flex items-center gap-4 shrink-0" aria-hidden="true">
              <span className="flex items-center gap-1.5 text-[#FFB703] font-bold uppercase tracking-wider text-[10px]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>IRCTC FAIRFLOW PRS</span>
              </span>
              <span className="text-blue-300/40">|</span>
              <span className="text-slate-200">
                AC Tatkal Quota Opening: <strong className="text-[#FFB703]">10:00:00 AM IST</strong>
              </span>
              <span className="text-blue-300/40">•</span>
              <span className="text-slate-200">
                Non-AC Tatkal: <strong className="text-amber-200">11:00:00 AM IST</strong>
              </span>
              <span className="text-blue-300/40">•</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Anti-Bot Stampede Governor: Protected</span>
              </span>
              <span className="text-blue-300/40">•</span>
              <span className="text-slate-300">
                CRIS Server Cluster: Safe Load &lt; 5,000 req/s
              </span>
              <span className="text-blue-300/40">•</span>
              <span className="text-[#FFB703] font-medium">
                {t('happyJourney', 'शुभयात्रा / Happy Journey')}
              </span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-18">
            {/* LEFT SECTION: Horizontal Three Lines Menu Button shifted to Top Left Corner + Brand Logo */}
            <div className="flex items-center gap-3 sm:gap-4">
              {/* SHIFTED TO TOP LEFT CORNER: Main Menu Option (Horizontal Three Lines) */}
              <button
                id="main-nav-menu-btn"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 sm:p-2.5 rounded-xl text-amber-300 hover:text-white bg-[#001D3D] hover:bg-[#002855] border border-blue-800/80 hover:border-amber-400 transition-all focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-sm flex items-center justify-center shrink-0"
                aria-label="Toggle Main Navigation Menu"
                title="मुख्य मेनू / Main Navigation Menu (Horizontal Three Lines)"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              {/* Brand Logo & Indian Railways Livery */}
              <button
                onClick={() => setCurrentTab('landing')}
                className="flex items-center gap-3 text-left group focus:outline-none shrink-0"
              >
                {/* Indian Railways Emblem Badge */}
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-[#800000] via-[#002244] to-[#EA580C] p-0.5 shadow-md group-hover:scale-105 transition-transform shrink-0">
                  <div className="w-full h-full bg-[#001D3D] rounded-[10px] flex items-center justify-center border border-amber-400/40">
                    <Train className="w-5 h-5 sm:w-6 sm:h-6 text-amber-300 group-hover:rotate-6 transition-transform" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm sm:text-lg font-black tracking-tight text-white font-ticket group-hover:text-amber-300 transition-colors whitespace-nowrap">
                      {t('indianRailways', 'भारतीय रेल')} • <span className="text-[#FFB703]">FAIRFLOW</span>
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-blue-200/90 hidden md:block font-sans">
                    Centre for Railway Information Systems (CRIS) Synthetic Prototype
                  </p>
                </div>
              </button>

              {/* Scenario / Quota Selector Pill */}
              <div className="relative hidden xl:block">
                <button
                  type="button"
                  onClick={() => setScenarioDropdownOpen(!scenarioDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#001D3D] border border-blue-800/80 hover:border-amber-400 text-xs text-slate-200 transition-colors"
                  aria-expanded={scenarioDropdownOpen}
                >
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="text-slate-300 font-normal">Domain:</span>
                  <span className="font-bold text-white truncate max-w-[130px]">{selectedScenario.domainName}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-amber-400 transition-transform ${scenarioDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {scenarioDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-72 rounded-2xl bg-white border border-slate-200 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-2 py-1.5 text-[11px] font-bold text-[#0B2545] uppercase tracking-wider font-ticket border-b border-slate-100 pb-2 mb-1">
                      Reservation Architecture Domain
                    </div>
                    {RESERVATION_SCENARIOS.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => {
                          onScenarioChange(s.id);
                          setScenarioDropdownOpen(false);
                        }}
                        className={`w-full text-left p-2.5 rounded-xl text-xs transition-colors flex flex-col gap-0.5 ${
                          activeScenario === s.id
                            ? 'bg-amber-50 text-[#92400E] border border-amber-200'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="font-bold text-slate-900 flex items-center justify-between">
                          <span>{s.title}</span>
                          {activeScenario === s.id && <span className="text-[10px] text-[#EA580C] font-mono font-bold">Active</span>}
                        </div>
                        <span className="text-[11px] text-slate-500 line-clamp-1">{s.subtitle}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>



            {/* TOP RIGHT SECTION (Desktop & Tablet): Theme Switch + Accessibility Button + Profile Button */}
            <div className="hidden sm:flex items-center gap-2 sm:gap-2.5">
              {/* 1. SWITCH BUTTON: Switching between Light Mode and Dark Mode */}
              <button
                id="theme-toggle-switch"
                type="button"
                onClick={toggleTheme}
                aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                title={theme === 'dark' ? 'सक्रिय: डार्क मोड (क्लिक करें: लाइट मोड) / Active: Dark Mode (Click for Light Mode)' : 'सक्रिय: लाइट मोड (क्लिक करें: डार्क मोड) / Active: Light Mode (Click for Dark Mode)'}
                className="group relative flex items-center p-1.5 sm:px-2.5 sm:py-2 rounded-xl bg-[#001D3D] hover:bg-[#002855] border border-blue-800/80 hover:border-amber-400 text-slate-200 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`relative w-8 h-4 rounded-full p-0.5 flex items-center transition-colors duration-300 ${
                      theme === 'dark'
                        ? 'bg-[#1E3A8A] border border-amber-400/60'
                        : 'bg-slate-800 border border-slate-600'
                    }`}
                  >
                    <div
                      className={`w-3 h-3 rounded-full flex items-center justify-center transition-all duration-300 ${
                        theme === 'dark'
                          ? 'translate-x-4 bg-amber-400 text-slate-950 shadow-[0_0_8px_#fbbf24]'
                          : 'translate-x-0 bg-amber-300 text-slate-900 shadow-sm'
                      }`}
                    >
                      {theme === 'dark' ? (
                        <Moon className="w-2 h-2 text-slate-950" />
                      ) : (
                        <Sun className="w-2 h-2 text-slate-950" />
                      )}
                    </div>
                  </div>

                  <span className="text-[11px] font-mono font-bold text-slate-200 hidden xl:inline flex items-center gap-1">
                    <span className={theme === 'dark' ? 'text-amber-300' : 'text-slate-300'}>
                      {theme === 'dark' ? 'Dark' : 'Light'}
                    </span>
                  </span>
                </div>
              </button>

              {/* 2. ACCESSIBILITY BUTTON: Language option, Font size option, contrast */}
              <button
                id="accessibility-options-btn"
                type="button"
                onClick={() => setAccessibilityModalOpen(true)}
                aria-label="Accessibility options: Language, Font Size, Contrast"
                title="सुगमता एवं भाषा विकल्प / Accessibility & Multilingual Options"
                className="group relative flex items-center gap-1.5 p-2 sm:px-2.5 sm:py-2 rounded-xl bg-[#001D3D] hover:bg-[#002855] border border-blue-800/80 hover:border-amber-400 text-slate-200 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                <div className="w-5 h-5 rounded-lg bg-blue-900/60 border border-blue-700/60 flex items-center justify-center text-amber-300 group-hover:bg-[#EA580C] group-hover:text-white transition-colors">
                  <Eye className="w-3 h-3" />
                </div>
                <div className="text-left hidden xl:block">
                  <div className="text-[11px] font-mono font-bold leading-tight flex items-center">
                    <span className="text-amber-300 uppercase font-black">[{language}]</span>
                  </div>
                </div>
              </button>

              {/* 3. PROFILE / LOGIN BUTTON: Right after Accessibility Button */}
              {!isLoggedIn ? (
                <button
                  id="header-login-btn"
                  type="button"
                  onClick={openLoginModal}
                  aria-label="User Login"
                  title="आईआरसीटीसी लॉगिन / IRCTC Passenger Login"
                  className="group relative flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-amber-400 font-bold text-xs cursor-pointer hover:scale-105 active:scale-95 shrink-0"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Login<span className="hidden sm:inline"> / प्रवेश</span></span>
                </button>
              ) : (
                <div className="relative" ref={profileMenuRef}>
                  <button
                    id="user-profile-btn"
                    type="button"
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    aria-expanded={profileDropdownOpen}
                    aria-label="User Profile & Account Menu"
                    title="यात्री प्रोफ़ाइल एवं सेटिंग्स / Passenger Profile & Settings"
                    className="group relative flex items-center gap-1.5 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-[#001D3D] hover:bg-[#002855] border border-blue-800/80 hover:border-amber-400 text-slate-200 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    {/* Passenger Initials / Avatar Badge */}
                    <div className="w-7 h-7 rounded-lg bg-[#EA580C] text-white font-black flex items-center justify-center text-xs font-ticket shadow-sm">
                      {currentUser?.avatarInitials || 'IR'}
                    </div>

                    <div className="text-left hidden md:block pr-1">
                      <div className="text-[11px] font-bold text-white leading-tight flex items-center gap-1">
                        <span className="truncate max-w-[85px]">{currentUser?.fullName || 'Passenger'}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      </div>
                      <div className="text-[9px] text-amber-300/90 font-mono leading-none">
                        IRCTC Verified
                      </div>
                    </div>

                    <ChevronDown
                      className={`w-3.5 h-3.5 text-amber-300 transition-transform ${
                        profileDropdownOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {/* Profile Dropdown Menu - Authentic White Card */}
                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-slate-200 shadow-2xl p-2.5 z-50 animate-in fade-in zoom-in-95 bg-white text-slate-900">
                      {/* Passenger Profile Summary Card */}
                      <div className="p-3 rounded-xl bg-[#0B2545] text-white mb-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-xl bg-[#EA580C] text-white font-black flex items-center justify-center text-sm font-ticket shadow-md">
                            {currentUser?.avatarInitials || 'IR'}
                          </div>
                          <div>
                            <div className="text-xs font-black text-white font-ticket flex items-center gap-1">
                              <span>{currentUser?.fullName}</span>
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                            </div>
                            <div className="text-[10px] text-amber-200/90 font-mono truncate max-w-[180px]">
                              {currentUser?.email}
                            </div>
                            <div className="text-[9px] text-slate-300 font-mono">
                              IRCTC ID: @{currentUser?.username}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Dropdown Options */}
                      <div className="space-y-1">
                        {/* Option 1: My Bookings */}
                        <button
                          type="button"
                          onClick={handleNavigateToBookings}
                          className="w-full p-2.5 rounded-xl text-left transition-colors flex items-center gap-3 group hover:bg-slate-50 text-slate-800"
                        >
                          <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1D4ED8] flex items-center justify-center group-hover:bg-[#1D4ED8] group-hover:text-white transition-colors">
                            <Ticket className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <div className="text-xs font-bold flex items-center justify-between">
                              <span>My Bookings / मेरे टिकट</span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono font-bold">
                                Active
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 font-sans">
                              View active PNRs, ERS slips & cancellation
                            </p>
                          </div>
                        </button>

                        {/* Option 2: Update Profile */}
                        <button
                          type="button"
                          onClick={() => handleOpenProfileTab('update-profile')}
                          className="w-full p-2.5 rounded-xl text-left transition-colors flex items-center gap-3 group hover:bg-slate-50 text-slate-800"
                        >
                          <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#EA580C] flex items-center justify-center group-hover:bg-[#EA580C] group-hover:text-white transition-colors">
                            <UserCheck className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <div className="text-xs font-bold">
                              Update Profile / प्रोफ़ाइल अपडेट
                            </div>
                            <p className="text-[10px] text-slate-500 font-sans">
                              Name, Aadhaar KYC, master passenger list
                            </p>
                          </div>
                        </button>

                        {/* Option 3: Settings */}
                        <button
                          type="button"
                          onClick={() => handleOpenProfileTab('settings')}
                          className="w-full p-2.5 rounded-xl text-left transition-colors flex items-center gap-3 group hover:bg-slate-50 text-slate-800"
                        >
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-700 group-hover:text-white transition-colors">
                            <Settings className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <div className="text-xs font-bold">
                              Settings / सेटिंग्स
                            </div>
                            <p className="text-[10px] text-slate-500 font-sans">
                              Auto-upgrade, alerts & payment gateway
                            </p>
                          </div>
                        </button>

                        {/* Option 4: Logout */}
                        <button
                          type="button"
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            logout();
                          }}
                          className="w-full p-2.5 rounded-xl text-left transition-colors flex items-center gap-3 group hover:bg-rose-50 text-rose-700"
                        >
                          <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-colors">
                            <LogOut className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <div className="text-xs font-bold">
                              Log Out / लॉग आउट
                            </div>
                            <p className="text-[10px] text-rose-500 font-sans">
                              Sign out of this passenger account
                            </p>
                          </div>
                        </button>
                      </div>

                      {/* Quick Footer Action */}
                      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between px-2 text-[10px] text-slate-500 font-sans">
                        <span className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                          <span>Protected • 1h Auto-Logout</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="text-[#EA580C] font-semibold hover:underline"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}


            </div>
          </div>
        </div>

        {/* MOBILE HEAD BAR INTERFACE (< sm): Dark Mode, Accessibility, and Login/Profile placed below the top bar so users don't need to scroll/slide left to right */}
        <div className="sm:hidden bg-[#001730] border-t border-blue-900/70 px-3 py-1.5 transition-colors">
          <div className="flex items-center justify-between gap-2 max-w-md mx-auto">
            {/* 1. Dark Mode Toggle Switch for Mobile */}
            <button
              id="mobile-theme-toggle-switch"
              type="button"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              title={theme === 'dark' ? 'सक्रिय: डार्क मोड (क्लिक करें: लाइट मोड) / Active: Dark Mode (Click for Light Mode)' : 'सक्रिय: लाइट मोड (क्लिक करें: डार्क मोड) / Active: Light Mode (Click for Dark Mode)'}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-[#001D3D] active:bg-[#002855] border border-blue-800 text-slate-200 transition-all text-xs font-mono font-bold shadow-xs cursor-pointer"
            >
              <div
                className={`relative w-7 h-4 rounded-full p-0.5 flex items-center transition-colors duration-300 ${
                  theme === 'dark'
                    ? 'bg-[#1E3A8A] border border-amber-400/60'
                    : 'bg-slate-800 border border-slate-600'
                }`}
              >
                <div
                  className={`w-3 h-3 rounded-full flex items-center justify-center transition-all duration-300 ${
                    theme === 'dark'
                      ? 'translate-x-3 bg-amber-400 text-slate-950 shadow-[0_0_6px_#fbbf24]'
                      : 'translate-x-0 bg-amber-300 text-slate-900 shadow-sm'
                  }`}
                >
                  {theme === 'dark' ? (
                    <Moon className="w-2 h-2 text-slate-950" />
                  ) : (
                    <Sun className="w-2 h-2 text-slate-950" />
                  )}
                </div>
              </div>
              <span className="text-[11px] text-slate-200">
                {theme === 'dark' ? 'Dark' : 'Light'}
              </span>
            </button>

            {/* 2. Accessibility Options Button for Mobile */}
            <button
              id="mobile-accessibility-options-btn"
              type="button"
              onClick={() => setAccessibilityModalOpen(true)}
              aria-label="Accessibility options: Language, Font Size, Contrast"
              title="सुगमता एवं भाषा विकल्प / Accessibility & Multilingual Options"
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-[#001D3D] active:bg-[#002855] border border-blue-800 text-slate-200 transition-all text-xs shadow-xs cursor-pointer"
            >
              <div className="w-5 h-5 rounded-lg bg-blue-900/60 border border-blue-700/60 flex items-center justify-center text-amber-300">
                <Eye className="w-3 h-3" />
              </div>
              <span className="text-[11px] font-mono font-bold text-amber-300 uppercase">
                [{language}]
              </span>
            </button>

            {/* 3. Login / Profile Button for Mobile */}
            {!isLoggedIn ? (
              <button
                id="mobile-header-login-btn"
                type="button"
                onClick={openLoginModal}
                aria-label="User Login"
                title="आईआरसीटीसी लॉगिन / IRCTC Passenger Login"
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white transition-all shadow-md font-bold text-xs cursor-pointer active:scale-95 shrink-0"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Login</span>
              </button>
            ) : (
              <div className="relative flex-1" ref={mobileProfileMenuRef}>
                <button
                  id="mobile-user-profile-btn"
                  type="button"
                  onClick={() => setMobileProfileDropdownOpen(!mobileProfileDropdownOpen)}
                  aria-expanded={mobileProfileDropdownOpen}
                  aria-label="User Profile & Account Menu"
                  title="यात्री प्रोफ़ाइल एवं सेटिंग्स / Passenger Profile & Settings"
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-[#001D3D] active:bg-[#002855] border border-blue-800 text-slate-200 transition-all shadow-xs cursor-pointer"
                >
                  <div className="w-5 h-5 rounded-md bg-[#EA580C] text-white font-black flex items-center justify-center text-[10px] font-ticket shadow-xs shrink-0">
                    {currentUser?.avatarInitials || 'IR'}
                  </div>
                  <span className="text-[11px] font-bold text-white truncate max-w-[65px]">
                    {currentUser?.fullName?.split(' ')[0] || 'User'}
                  </span>
                  <ChevronDown
                    className={`w-3 h-3 text-amber-300 transition-transform ${
                      mobileProfileDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Mobile Profile Dropdown Menu */}
                {mobileProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-slate-200 shadow-2xl p-2.5 z-50 animate-in fade-in zoom-in-95 bg-white text-slate-900">
                    <div className="p-3 rounded-xl bg-[#0B2545] text-white mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-[#EA580C] text-white font-black flex items-center justify-center text-sm font-ticket shadow-md">
                          {currentUser?.avatarInitials || 'IR'}
                        </div>
                        <div>
                          <div className="text-xs font-black text-white font-ticket flex items-center gap-1">
                            <span>{currentUser?.fullName}</span>
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                          </div>
                          <div className="text-[10px] text-amber-200/90 font-mono truncate max-w-[180px]">
                            {currentUser?.email}
                          </div>
                          <div className="text-[9px] text-slate-300 font-mono">
                            IRCTC ID: @{currentUser?.username}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <button
                        type="button"
                        onClick={() => {
                          setMobileProfileDropdownOpen(false);
                          handleNavigateToBookings();
                        }}
                        className="w-full p-2.5 rounded-xl text-left transition-colors flex items-center gap-3 group hover:bg-slate-50 text-slate-800"
                      >
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1D4ED8] flex items-center justify-center group-hover:bg-[#1D4ED8] group-hover:text-white transition-colors">
                          <Ticket className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <div className="text-xs font-bold flex items-center justify-between">
                            <span>My Bookings / मेरे टिकट</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono font-bold">
                              Active
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 font-sans">
                            View active PNRs, ERS slips & cancellation
                          </p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setMobileProfileDropdownOpen(false);
                          handleOpenProfileTab('update-profile');
                        }}
                        className="w-full p-2.5 rounded-xl text-left transition-colors flex items-center gap-3 group hover:bg-slate-50 text-slate-800"
                      >
                        <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#EA580C] flex items-center justify-center group-hover:bg-[#EA580C] group-hover:text-white transition-colors">
                          <UserCheck className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <div className="text-xs font-bold">
                            Update Profile / प्रोफ़ाइल अपडेट
                          </div>
                          <p className="text-[10px] text-slate-500 font-sans">
                            Name, Aadhaar KYC, master passenger list
                          </p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setMobileProfileDropdownOpen(false);
                          handleOpenProfileTab('settings');
                        }}
                        className="w-full p-2.5 rounded-xl text-left transition-colors flex items-center gap-3 group hover:bg-slate-50 text-slate-800"
                      >
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-700 group-hover:text-white transition-colors">
                          <Settings className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <div className="text-xs font-bold">
                            Settings / सेटिंग्स
                          </div>
                          <p className="text-[10px] text-slate-500 font-sans">
                            Auto-upgrade, alerts & payment gateway
                          </p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setMobileProfileDropdownOpen(false);
                          logout();
                        }}
                        className="w-full p-2.5 rounded-xl text-left transition-colors flex items-center gap-3 group hover:bg-rose-50 text-rose-700"
                      >
                        <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-colors">
                          <LogOut className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <div className="text-xs font-bold">
                            Log Out / लॉग आउट
                          </div>
                          <p className="text-[10px] text-rose-500 font-sans">
                            Sign out of this passenger account
                          </p>
                        </div>
                      </button>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between px-2 text-[10px] text-slate-500 font-sans">
                      <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                        <span>Protected • 1h Auto-Logout</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setMobileProfileDropdownOpen(false)}
                        className="text-[#EA580C] font-semibold hover:underline"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Main Navigation Drawer (Triggered by the Horizontal Three Lines button in the Top Left Corner) */}
        {mobileMenuOpen && (
          <div className="border-t border-blue-900 bg-[#001D3D] px-4 pt-3 pb-6 space-y-4 shadow-2xl animate-in slide-in-from-top duration-200">
            {/* Passenger Quick Identity in Drawer */}
            {!isLoggedIn ? (
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#0B2545] border border-blue-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-blue-900/60 text-amber-300 flex items-center justify-center border border-blue-700/60">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Guest Passenger / अतिथि</div>
                    <div className="text-[10px] text-amber-200 font-sans">Login to book tickets & services</div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    openLoginModal();
                    setMobileMenuOpen(false);
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Login</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#0B2545] border border-blue-800">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#EA580C] text-white font-black flex items-center justify-center text-xs font-ticket shadow-sm">
                    {currentUser?.avatarInitials || 'IR'}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">{currentUser?.fullName}</div>
                    <div className="text-[10px] text-amber-200 font-mono truncate max-w-[160px]">{currentUser?.email}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      handleOpenProfileTab('update-profile');
                      setMobileMenuOpen(false);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-[#EA580C] text-white text-xs font-bold"
                  >
                    Profile
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="p-1.5 rounded-lg bg-rose-900/80 hover:bg-rose-800 text-white"
                    title="Log Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Navigation items */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if ((item.id === 'apply' || item.id === 'services') && !isLoggedIn) {
                        setMobileMenuOpen(false);
                        triggerLoginRequired(item.id === 'services' ? 'use IRCTC passenger services' : 'book train tickets');
                        return;
                      }
                      setCurrentTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`p-3 rounded-xl text-xs font-bold text-left flex items-center gap-2.5 transition-all ${
                      isActive
                        ? 'bg-[#EA580C] text-white shadow-md'
                        : 'bg-[#0B2545] text-slate-200 hover:bg-[#002244] border border-blue-900'
                    }`}
                  >
                    {Icon && <Icon className="w-4 h-4 text-amber-300" />}
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Quick Mobile Feature Shortcuts */}
            <div className="pt-2 border-t border-blue-900/80">
              <div className="text-[10px] font-bold text-amber-300 uppercase tracking-wider mb-2 font-ticket">
                Quick Passenger Services / त्वरित सुविधाएँ
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => {
                    if (!isLoggedIn) {
                      setMobileMenuOpen(false);
                      triggerLoginRequired('order meals to your berth');
                      return;
                    }
                    setCurrentTab('services');
                    setMobileMenuOpen(false);
                  }}
                  className="p-2.5 rounded-xl bg-[#0B2545] border border-blue-900 hover:border-amber-400 text-left flex items-center gap-2"
                >
                  <UtensilsCrossed className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div className="leading-tight truncate">
                    <div className="font-bold text-white">E-Catering Food</div>
                    <div className="text-[9px] text-slate-300">Berth Meal Delivery</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    if (!isLoggedIn) {
                      setMobileMenuOpen(false);
                      triggerLoginRequired('file a RailMadad grievance');
                      return;
                    }
                    setCurrentTab('services');
                    setMobileMenuOpen(false);
                  }}
                  className="p-2.5 rounded-xl bg-[#0B2545] border border-blue-900 hover:border-amber-400 text-left flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4 text-rose-400 shrink-0" />
                  <div className="leading-tight truncate">
                    <div className="font-bold text-white">RailMadad 139</div>
                    <div className="text-[9px] text-slate-300">Security & Medical</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Simulation trigger button */}
            <button
              onClick={() => {
                onRunQuickDemo();
                setMobileMenuOpen(false);
              }}
              className="w-full py-3 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md uppercase active:scale-98"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Launch 100K Tatkal Rush Benchmark</span>
            </button>
          </div>
        )}
      </header>

      {/* Accessibility Modal Dialog */}
      <AccessibilityModal
        isOpen={accessibilityModalOpen}
        onClose={() => setAccessibilityModalOpen(false)}
      />

      {/* Profile & Settings Modal Dialog */}
      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        initialTab={profileModalTab}
        onNavigateToBookings={handleNavigateToBookings}
      />
    </>
  );
};
