import React from 'react';
import {
  Clock,
  LogIn,
  X,
  ShieldCheck,
  RotateCcw,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const SessionExpiredModal: React.FC = () => {
  const { isSessionExpiredOpen, closeSessionExpiredModal, openLoginModal } = useAuth();

  if (!isSessionExpiredOpen) return null;

  const handleLoginAgain = () => {
    closeSessionExpiredModal();
    openLoginModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto font-sans">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs transition-opacity"
        onClick={closeSessionExpiredModal}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="session-expired-title"
        aria-describedby="session-expired-message"
        className="relative w-full max-w-md rounded-2xl bg-white dark:bg-[#0A192F] border-2 border-amber-500 shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Top Livery Strip */}
        <div className="h-1.5 bg-gradient-to-r from-[#FF9933] via-white to-[#138808] w-full" />

        {/* Header Bar */}
        <div className="bg-[#0B2545] p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-xs">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 id="session-expired-title" className="text-sm font-bold text-white font-ticket">
                IRCTC FAIRFLOW • Session Security
              </h3>
              <p className="text-[10px] text-amber-300 font-mono">
                Auto-Logout Protocol / स्वचालित सत्र समाप्ति
              </p>
            </div>
          </div>

          <button
            onClick={closeSessionExpiredModal}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 text-center space-y-4">
          {/* Animated Clock / Security Icon */}
          <div className="mx-auto w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border-2 border-amber-300 dark:border-amber-500/40 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-sm">
            <Clock className="w-7 h-7 stroke-[2.2]" />
          </div>

          <div className="space-y-1.5">
            <h2
              id="session-expired-message"
              className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-ticket tracking-tight"
            >
              Session Expired due to Inactivity
            </h2>
            <div className="text-xs font-bold text-amber-600 dark:text-amber-400 font-hindi">
              1 घंटे की निष्क्रियता के बाद स्वतः लॉग आउट किया गया
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-sm mx-auto">
            You were automatically signed out after <strong>1 hour of inactivity</strong> in accordance with IRCTC and CRIS security policies to safeguard your passenger profile and ticketing authorizations.
          </p>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#071526] border border-slate-200 dark:border-blue-950 text-left text-[11px] text-slate-600 dark:text-slate-300 space-y-1.5">
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>IRCTC Security Standard:</span>
            </div>
            <div>• Sessions terminate automatically after 60 minutes of no user activity</div>
            <div>• Protects against unauthorized Tatkal quota bookings on unattended devices</div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
            <button
              onClick={closeSessionExpiredModal}
              className="w-full sm:w-auto flex-1 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors"
            >
              Close / बंद करें
            </button>
            <button
              onClick={handleLoginAgain}
              className="w-full sm:w-auto flex-1 px-5 py-2.5 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all uppercase font-ticket"
            >
              <LogIn className="w-4 h-4" />
              <span>Login Again / पुनः लॉगिन</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
