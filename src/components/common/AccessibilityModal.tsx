import React, { useRef, useEffect } from 'react';
import {
  Languages,
  Type,
  Sun,
  Moon,
  Eye,
  RotateCcw,
  Check,
  X,
  Volume2,
  Sparkles,
  Train
} from 'lucide-react';
import { useAccessibility, LANGUAGES, FontSizeScale, LanguageCode } from '../../context/AccessibilityContext';

interface AccessibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccessibilityModal: React.FC<AccessibilityModalProps> = ({ isOpen, onClose }) => {
  const {
    theme,
    toggleTheme,
    fontSize,
    setFontSize,
    language,
    setLanguage,
    highContrast,
    toggleHighContrast,
    resetDefaults,
    t
  } = useAccessibility();

  const modalRef = useRef<HTMLDivElement>(null);

  // Close on Escape or click outside
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const fontOptions: { id: FontSizeScale; label: string; sub: string; symbol: string }[] = [
    { id: 'standard', label: 'Standard', sub: '100% (Default)', symbol: 'A' },
    { id: 'medium', label: 'Medium', sub: '112% (+12%)', symbol: 'A+' },
    { id: 'large', label: 'Large', sub: '125% (+25%)', symbol: 'A++' },
    { id: 'xlarge', label: 'Extra Large', sub: '138% (+38%)', symbol: 'A+++' }
  ];

  // Optional Voice announcement for accessibility
  const handleAnnounceStatus = () => {
    if ('speechSynthesis' in window) {
      const text = `Indian Railways FairFlow Reservation System. Active Quota: Tatkal. Font size is currently set to ${fontSize}. Current language is ${language}. All systems operating normally.`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="accessibility-title"
        className="relative w-full max-w-xl rounded-2xl border-2 border-[#0B2545] dark:border-[#1E3A5F] shadow-2xl p-6 overflow-hidden bg-white dark:bg-[#0B1E38] text-slate-900 dark:text-[#F8FAFC] transition-colors"
      >
        {/* Header Ribbon */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0B2545] dark:bg-[#071526] text-white flex items-center justify-center font-bold shadow-xs border border-blue-900 dark:border-blue-700">
              <Eye className="w-5 h-5 text-[#EA580C]" />
            </div>
            <div>
              <h2 id="accessibility-title" className="text-lg font-black tracking-tight text-[#0B2545] dark:text-[#F8FAFC] flex items-center gap-2">
                <span>सुगमता केंद्र • ACCESSIBILITY & THEME</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">
                Customize theme, typography, multilingual display, and contrast
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
            aria-label="Close accessibility options"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="py-5 space-y-6 max-h-[75vh] overflow-y-auto pr-1">
          {/* 0. THEME SELECTION: LIGHT VS DARK */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-[#0B2545] dark:text-[#F8FAFC]">
                {theme === 'dark' ? (
                  <Moon className="w-4 h-4 text-amber-400" />
                ) : (
                  <Sun className="w-4 h-4 text-[#EA580C]" />
                )}
                <span>1. दृश्य मोड / THEME & DISPLAY MODE</span>
              </span>
              <span className="text-[11px] font-mono text-slate-600 dark:text-slate-300">
                Active: <strong className="text-[#EA580C] uppercase">{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</strong>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Light Mode Card */}
              <button
                type="button"
                onClick={() => theme === 'dark' && toggleTheme()}
                className={`p-3.5 rounded-xl border text-left transition-all flex items-center gap-3 ${
                  theme === 'light'
                    ? 'bg-amber-50/80 border-[#EA580C] ring-2 ring-[#EA580C]/20 shadow-xs'
                    : 'bg-slate-50 dark:bg-[#08162A] border-slate-200 dark:border-slate-700 hover:border-amber-400'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  theme === 'light' ? 'bg-[#EA580C] text-white shadow-sm' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}>
                  <Sun className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>Light Mode</span>
                    {theme === 'light' && <span className="text-[10px] text-[#EA580C] font-mono font-bold">✓ Active</span>}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">Crisp IRCTC Day Canvas</div>
                </div>
              </button>

              {/* Dark Mode Card */}
              <button
                type="button"
                onClick={() => theme === 'light' && toggleTheme()}
                className={`p-3.5 rounded-xl border text-left transition-all flex items-center gap-3 ${
                  theme === 'dark'
                    ? 'bg-blue-950/60 border-amber-400 ring-2 ring-amber-400/20 shadow-xs'
                    : 'bg-slate-50 dark:bg-[#08162A] border-slate-200 dark:border-slate-700 hover:border-amber-400'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  theme === 'dark' ? 'bg-amber-400 text-slate-950 shadow-[0_0_10px_#fbbf24]' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}>
                  <Moon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>Dark Mode</span>
                    {theme === 'dark' && <span className="text-[10px] text-amber-400 font-mono font-bold">✓ Active</span>}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">Midnight High-Contrast Navy</div>
                </div>
              </button>
            </div>
          </section>

          {/* 2. FONT SIZE OPTIONS */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-[#0B2545] dark:text-[#F8FAFC]">
                <Type className="w-4 h-4 text-[#EA580C]" />
                <span>2. फ़ॉन्ट आकार / FONT SIZE SCALING</span>
              </span>
              <span className="text-[11px] font-mono text-slate-600 dark:text-slate-300">
                Active: <strong className="text-[#EA580C] uppercase">{fontSize}</strong>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {fontOptions.map((opt) => {
                const isSelected = fontSize === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setFontSize(opt.id)}
                    className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center ${
                      isSelected
                        ? 'bg-[#0B2545] text-white border-[#0B2545] font-bold shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    <span className="text-lg font-bold font-mono">{opt.symbol}</span>
                    <span className="text-xs font-bold mt-0.5">{opt.label}</span>
                    <span className="text-[9px] opacity-80">{opt.sub}</span>
                  </button>
                );
              })}
            </div>

            {/* Typography Live Preview */}
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#08162A] text-xs font-sans text-slate-800 dark:text-slate-200">
              <div className="text-[10px] text-[#EA580C] uppercase font-bold mb-1">
                Preview / पूर्वावलोकन:
              </div>
              <div className="leading-relaxed">
                भारतीय रेल आरक्षण प्रणाली • Indian Railways PRS E-Ticket Slip (PNR: 245-890214)
              </div>
            </div>
          </section>

          {/* 3. MULTILINGUAL LANGUAGE OPTIONS */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-[#0B2545] dark:text-[#F8FAFC]">
                <Languages className="w-4 h-4 text-[#EA580C]" />
                <span>3. भाषा चयन / SELECT LANGUAGE ({LANGUAGES.length})</span>
              </span>
              <span className="text-[11px] font-mono text-slate-600 dark:text-slate-300">
                Current: <strong className="text-[#EA580C]">{language.toUpperCase()}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {LANGUAGES.map((lang) => {
                const isSelected = language === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => setLanguage(lang.code)}
                    className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-orange-50 dark:bg-orange-950/40 text-orange-950 dark:text-orange-200 border-[#EA580C] font-bold shadow-xs'
                        : 'bg-slate-50 dark:bg-[#08162A] hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-slate-900 dark:text-white">{lang.nativeLabel}</span>
                        <span className="text-xs opacity-75 font-sans">({lang.label})</span>
                      </div>
                      <span className="text-[10px] block opacity-80 mt-0.5">{lang.region}</span>
                    </div>

                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-[#EA580C] text-white flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          {/* 4. VISUAL CONTRAST & VOICE AIDS */}
          <section className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-700">
            <span className="text-xs font-bold uppercase tracking-wider block text-[#0B2545] dark:text-[#F8FAFC]">
              4. अतिरिक्त सुगमता / ADDITIONAL CONTROLS
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* High Contrast Toggle */}
              <button
                type="button"
                onClick={toggleHighContrast}
                className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                  highContrast
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-bold'
                    : 'bg-slate-50 dark:bg-[#08162A] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5 text-left">
                  <Eye className="w-4 h-4 text-[#EA580C] shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">High Contrast Borders</div>
                    <div className="text-[10px] opacity-75">Enhance card edges & text</div>
                  </div>
                </div>
                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${highContrast ? 'bg-emerald-700 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>
                  {highContrast ? 'ON' : 'OFF'}
                </span>
              </button>

              {/* Screen Reader Voice Announcement */}
              <button
                type="button"
                onClick={handleAnnounceStatus}
                className="p-3 rounded-xl border flex items-center justify-between transition-all bg-slate-50 dark:bg-[#08162A] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-[#0B2545] dark:hover:border-amber-400"
              >
                <div className="flex items-center gap-2.5 text-left">
                  <Volume2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">Voice Announce (TTS)</div>
                    <div className="text-[10px] opacity-75">Speak current system status</div>
                  </div>
                </div>
                <span className="text-xs font-bold text-[#EA580C]">Play</span>
              </button>
            </div>
          </section>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <button
            type="button"
            onClick={resetDefaults}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>रीसेट / Reset to Default</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#EA580C] hover:bg-[#D94E06] text-white font-bold text-xs uppercase tracking-wider shadow-xs transition-transform active:scale-95"
          >
            सत्यापित करें / Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};
