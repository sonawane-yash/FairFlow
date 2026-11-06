import React, { useState } from 'react';
import {
  X,
  Phone,
  Mail,
  User,
  Lock,
  Eye,
  EyeOff,
  Train,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Check,
  Copy,
  KeyRound,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { SyntheticAccount } from '../../types/auth';
import { signInWithGoogle } from '../../services/firebase';

type LoginIdentifierTab = 'phone' | 'email' | 'username';

export const LoginModal: React.FC = () => {
  const {
    isLoginModalOpen,
    closeLoginModal,
    login,
    loginWithSynthetic,
    syntheticAccounts
  } = useAuth();

  const [activeTab, setActiveTab] = useState<LoginIdentifierTab>('phone');
  const [identifier, setIdentifier] = useState('9876543210');
  const [password, setPassword] = useState('IRCTC@2026');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  if (!isLoginModalOpen) return null;

  const handleTabChange = (tab: LoginIdentifierTab) => {
    setActiveTab(tab);
    setErrorMsg(null);
    if (tab === 'phone') {
      setIdentifier('9876543210');
      setPassword('IRCTC@2026');
    } else if (tab === 'email') {
      setIdentifier('rahul.sharma@fairflow.in');
      setPassword('IRCTC@2026');
    } else {
      setIdentifier('rahul_sharma');
      setPassword('IRCTC@2026');
    }
  };

  const handleAutoFill = (acc: SyntheticAccount) => {
    setErrorMsg(null);
    if (activeTab === 'phone') {
      setIdentifier(acc.mobile);
    } else if (activeTab === 'email') {
      setIdentifier(acc.email);
    } else {
      setIdentifier(acc.username);
    }
    setPassword(acc.password);
    setCopiedAccount(acc.id);
    setTimeout(() => setCopiedAccount(null), 2500);
  };

  const handleOneClickLogin = (acc: SyntheticAccount) => {
    loginWithSynthetic(acc);
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true);
      setErrorMsg(null);
      const user = await signInWithGoogle();
      if (user) {
        login(user.email || user.displayName || 'Google Passenger', 'firebase_oauth_verified');
        closeLoginModal();
      }
    } catch (err: any) {
      console.warn('Google Sign In:', err);
      if (err?.code === 'auth/popup-closed-by-user' || String(err?.message || '').includes('popup-closed-by-user')) {
        setErrorMsg('Google sign-in popup was closed before completing sign in. Please try again.');
      } else if (err?.code === 'auth/cancelled-popup-request' || String(err?.message || '').includes('cancelled-popup-request')) {
        setErrorMsg('Sign-in request was interrupted. Please try again.');
      } else if (err?.code === 'auth/popup-blocked' || String(err?.message || '').includes('popup-blocked')) {
        setErrorMsg('Google sign-in popup was blocked by your browser. Please allow popups for this site.');
      } else {
        setErrorMsg(err?.message || 'Google sign in was cancelled or failed.');
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const result = login(identifier, password);
    if (!result.success && result.message) {
      setErrorMsg(result.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto font-sans">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
        onClick={closeLoginModal}
        aria-hidden="true"
      />

      {/* Login Dialog Box */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-modal-title"
        className="relative w-full max-w-xl rounded-2xl bg-white dark:bg-[#0A192F] border border-slate-200 dark:border-blue-900 shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header Ribbon */}
        <div className="bg-[#0B2545] p-4 sm:p-5 border-b-2 border-[#EA580C] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EA580C] text-white flex items-center justify-center shadow-sm">
              <Train className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="login-modal-title" className="text-base sm:text-lg font-black tracking-tight text-white font-ticket">
                  IRCTC Passenger Login • प्रवेश
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#EA580C] text-white font-bold uppercase font-mono">
                  PRS v2.4
                </span>
              </div>
              <p className="text-[11px] text-blue-200/90 font-sans">
                Indian Railways CRIS FairFlow Next-Gen Ticketing Authentication
              </p>
            </div>
          </div>

          <button
            onClick={closeLoginModal}
            className="p-2 rounded-xl text-blue-200 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close Login Window"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-5 max-h-[82vh] overflow-y-auto">
          {/* Firebase Google Sign-In */}
          <div className="space-y-2.5">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-xs border border-slate-300 dark:border-slate-600 shadow-xs flex items-center justify-center gap-2.5 transition-all cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isGoogleLoading ? 'Connecting to Google...' : 'Sign In with Google (Firebase Auth)'}</span>
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
              <span className="text-[10px] text-slate-400 font-mono uppercase font-bold">OR IRCTC / PRS PASSENGER CREDENTIALS</span>
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
            </div>
          </div>

          {/* Option Selector: Phone Number, Email, or Username */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-mono">
              Sign In Using / लॉगिन का माध्यम चुनें:
            </label>
            <div className="grid grid-cols-3 gap-2 p-1 rounded-xl bg-slate-100 dark:bg-[#071322] border border-slate-200 dark:border-blue-950">
              <button
                type="button"
                onClick={() => handleTabChange('phone')}
                className={`py-2 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'phone'
                    ? 'bg-[#0B2545] dark:bg-[#EA580C] text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Phone No.</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('email')}
                className={`py-2 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'email'
                    ? 'bg-[#0B2545] dark:bg-[#EA580C] text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email ID</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('username')}
                className={`py-2 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'username'
                    ? 'bg-[#0B2545] dark:bg-[#EA580C] text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Username</span>
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Identifier Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                {activeTab === 'phone' && '10-Digit Mobile Number / मोबाइल नंबर:'}
                {activeTab === 'email' && 'Registered Email Address / ईमेल पता:'}
                {activeTab === 'username' && 'IRCTC Username / यूज़रनेम:'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  {activeTab === 'phone' && <Phone className="w-4 h-4" />}
                  {activeTab === 'email' && <Mail className="w-4 h-4" />}
                  {activeTab === 'username' && <User className="w-4 h-4" />}
                </div>
                <input
                  type={activeTab === 'email' ? 'email' : 'text'}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={
                    activeTab === 'phone'
                      ? 'e.g. 9876543210 or your mobile'
                      : activeTab === 'email'
                      ? 'e.g. rahul.sharma@fairflow.in'
                      : 'e.g. rahul_sharma or custom ID'
                  }
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-blue-900 bg-white dark:bg-[#071526] text-slate-900 dark:text-white text-sm font-sans focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:border-transparent transition-all shadow-xs"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                  Password / पासवर्ड:
                </label>
                <span className="text-[11px] text-amber-600 dark:text-amber-400 font-mono">
                  Default Demo: IRCTC@2026
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter IRCTC password"
                  required
                  className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-slate-300 dark:border-blue-900 bg-white dark:bg-[#071526] text-slate-900 dark:text-white text-sm font-sans focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:border-transparent transition-all shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Security Guarantee */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 text-[11px] text-emerald-800 dark:text-emerald-300">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Protected by 256-Bit SSL & CRIS Bot Governor</span>
              </div>
              <span className="font-mono font-bold text-[10px] bg-emerald-100 dark:bg-emerald-900/60 px-1.5 py-0.5 rounded">
                SECURE
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 uppercase tracking-wide cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
            >
              <KeyRound className="w-4 h-4" />
              <span>Sign In with Credentials / लॉगिन करें</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* SYNTHETIC CREDENTIALS SHOWCASE SECTION */}
          <div className="pt-4 border-t border-slate-200 dark:border-blue-900/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white font-ticket">
                  Standard Synthetic Account Credential / मानक सिंथेटिक खाता
                </h3>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                Click to preview & test
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Use this official synthetic test credential to test authentication, explore live Tatkal booking, and access IRCTC services:
            </p>

            <div className="space-y-2.5">
              {syntheticAccounts.map((acc, index) => {
                const isSelected = copiedAccount === acc.id;
                return (
                  <div
                    key={acc.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      index === 0
                        ? 'bg-amber-50/70 dark:bg-[#0D233A] border-amber-300 dark:border-amber-500/40 shadow-xs'
                        : 'bg-slate-50 dark:bg-[#07182E] border-slate-200 dark:border-blue-950'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-[#EA580C] text-white font-black flex items-center justify-center text-xs font-ticket">
                          {acc.avatarInitials}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <span>{acc.fullName}</span>
                            {index === 0 && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 font-bold">
                                Primary
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                            {acc.roleTitle}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleAutoFill(acc)}
                          className="px-2.5 py-1 rounded-lg bg-white dark:bg-blue-950/80 hover:bg-slate-100 dark:hover:bg-blue-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-blue-800 text-[11px] font-semibold transition-colors flex items-center gap-1"
                          title="Fill credentials in form above"
                        >
                          {isSelected ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          <span>{isSelected ? 'Filled!' : 'Fill Fields'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOneClickLogin(acc)}
                          className="px-3 py-1 rounded-lg bg-[#0B2545] dark:bg-[#EA580C] hover:bg-[#002244] dark:hover:bg-[#C2410C] text-white text-[11px] font-bold transition-all shadow-xs flex items-center gap-1"
                        >
                          <span>One-Click Login</span>
                        </button>
                      </div>
                    </div>

                    {/* Credential Data Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-200/80 dark:border-blue-900/50 text-[11px] font-mono">
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase">Username:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">
                          {acc.username}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase">Phone:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">
                          {acc.mobile}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase">Email:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">
                          {acc.email}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase">Password:</span>
                        <span className="font-bold text-amber-600 dark:text-amber-400 truncate block">
                          {acc.password}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-100 dark:bg-[#06111D] border-t border-slate-200 dark:border-blue-950 text-center text-[11px] text-slate-500 dark:text-slate-400">
          Centre for Railway Information Systems (CRIS) • All passenger accounts are encrypted and synthetic for testing.
        </div>
      </div>
    </div>
  );
};
