import React from 'react';
import {
  Lock,
  AlertTriangle,
  LogIn,
  X,
  ShieldAlert,
  Train,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LoginRequiredAlertModal: React.FC = () => {
  const { isLoginAlertOpen, closeLoginAlert, openLoginModal, alertReason } = useAuth();

  if (!isLoginAlertOpen) return null;

  const handleOpenLogin = () => {
    closeLoginAlert();
    openLoginModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto font-sans">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs transition-opacity"
        onClick={closeLoginAlert}
        aria-hidden="true"
      />

      {/* Alert Dialog */}
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="login-alert-title"
        aria-describedby="login-alert-message"
        className="relative w-full max-w-md rounded-2xl bg-white dark:bg-[#0A192F] border-2 border-[#EA580C] shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Top Livery Strip */}
        <div className="h-1.5 bg-gradient-to-r from-[#FF9933] via-white to-[#138808] w-full" />

        {/* Header Bar */}
        <div className="bg-[#0B2545] p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#EA580C] text-white flex items-center justify-center shadow-xs">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 id="login-alert-title" className="text-sm font-bold text-white font-ticket">
                IRCTC FAIRFLOW • Access Control
              </h3>
              <p className="text-[10px] text-amber-300 font-mono">
                Authentication Required / प्रमाणीकरण आवश्यक
              </p>
            </div>
          </div>

          <button
            onClick={closeLoginAlert}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Dismiss Alert"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 text-center space-y-4">
          {/* Animated Lock Badge */}
          <div className="mx-auto w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border-2 border-amber-300 dark:border-amber-500/40 flex items-center justify-center text-[#EA580C] shadow-sm">
            <Lock className="w-7 h-7 stroke-[2.2]" />
          </div>

          <div className="space-y-2">
            {/* The exact requested alert phrase */}
            <h2
              id="login-alert-message"
              className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-ticket tracking-tight"
            >
              Kindly Login first.
            </h2>
            <div className="text-xs font-bold text-[#EA580C] dark:text-amber-400 font-hindi">
              कृपया पहले अपना लॉगिन पूरा करें
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-sm mx-auto">
            You must be logged in to an IRCTC account to {alertReason}. Please sign in with your phone number, email, or synthetic demo credentials to proceed.
          </p>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#071526] border border-slate-200 dark:border-blue-950 text-left text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Train className="w-3.5 h-3.5 text-[#EA580C]" />
              <span>Available in 1 Click:</span>
            </div>
            <div>• Free Instant login with pre-configured Standard Synthetic Credentials</div>
            <div>• Full access to PRS Tatkal Quota booking & on-board services</div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
            <button
              onClick={handleOpenLogin}
              className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold text-xs uppercase tracking-wide shadow-md transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Login Now / अभी लॉगिन करें</span>
            </button>

            <button
              onClick={closeLoginAlert}
              className="w-full sm:w-auto py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
