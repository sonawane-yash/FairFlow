import React, { useState, useEffect } from 'react';
import {
  User,
  Settings,
  Ticket,
  ShieldCheck,
  Check,
  X,
  CreditCard,
  Bell,
  Sparkles,
  Smartphone,
  Mail,
  Award,
  Users,
  Train,
  Save,
  Lock,
  ChevronRight,
  LogOut
} from 'lucide-react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useAuth } from '../../context/AuthContext';

export type ProfileModalTab = 'update-profile' | 'settings';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: ProfileModalTab;
  onNavigateToBookings: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'update-profile',
  onNavigateToBookings
}) => {
  const { theme } = useAccessibility();
  const { currentUser, updateProfile, logout, openLoginModal } = useAuth();
  const [activeTab, setActiveTab] = useState<ProfileModalTab>(initialTab);

  // Profile Form State synced with AuthContext
  const [profileData, setProfileData] = useState({
    fullName: currentUser?.fullName || 'Rahul Sharma',
    username: currentUser?.username || 'rahul_sharma',
    email: currentUser?.email || 'rahul.sharma@fairflow.in',
    mobile: currentUser?.mobile || '9876543210',
    aadhaarStatus: currentUser?.aadhaarStatus || 'Aadhaar Verified (UIDAI • XXXX-XXXX-7842)',
    berthPreference: currentUser?.berthPreference || 'Lower Berth (LB)',
    foodChoice: currentUser?.foodChoice || 'Veg',
    seniorCitizen: currentUser?.seniorCitizen || false,
    state: currentUser?.state || 'New Delhi',
    pincode: currentUser?.pincode || '110001'
  });

  useEffect(() => {
    if (currentUser) {
      setProfileData({
        fullName: currentUser.fullName,
        username: currentUser.username,
        email: currentUser.email,
        mobile: currentUser.mobile,
        aadhaarStatus: currentUser.aadhaarStatus,
        berthPreference: currentUser.berthPreference,
        foodChoice: currentUser.foodChoice,
        seniorCitizen: currentUser.seniorCitizen,
        state: currentUser.state,
        pincode: currentUser.pincode
      });
    }
  }, [currentUser]);

  // Settings State
  const [settingsData, setSettingsData] = useState({
    autoUpgrade: true,
    tatkalFastPass: true,
    whatsappAlerts: true,
    smsAlerts: true,
    twoFactorAuth: true,
    preferredPayment: 'UPI (Google Pay / PhonePe)',
    serverFailoverMode: true
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      fullName: profileData.fullName,
      username: profileData.username,
      email: profileData.email,
      mobile: profileData.mobile,
      berthPreference: profileData.berthPreference,
      foodChoice: profileData.foodChoice as 'Veg' | 'Non-Veg' | 'Jain',
      state: profileData.state,
      pincode: profileData.pincode
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
    }, 3000);
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-modal-title"
        className="relative w-full max-w-2xl rounded-2xl border border-slate-200 dark:border-[#1E3A5F] bg-white dark:bg-[#0B1E38] text-slate-800 dark:text-[#F8FAFC] shadow-2xl overflow-hidden my-auto transition-all"
      >
        {/* Header Ribbon */}
        <div className="bg-[#0B2545] dark:bg-[#071526] p-5 text-white flex items-center justify-between border-b-2 border-[#EA580C]">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#EA580C] text-white font-black flex items-center justify-center text-lg font-ticket shadow-sm border border-orange-400">
              {currentUser?.avatarInitials || profileData.fullName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="profile-modal-title" className="text-lg font-black font-ticket tracking-tight text-white">
                  {profileData.fullName}
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 font-mono font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>KYC Verified</span>
                </span>
              </div>
              <p className="text-xs text-blue-200 font-mono">
                IRCTC User: @{profileData.username} • {profileData.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentUser && (
              <button
                type="button"
                onClick={handleLogout}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600/90 hover:bg-rose-700 text-white text-xs font-bold transition-colors"
                title="Log Out of this account"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close Profile Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs inside Modal */}
        <div className="flex items-center border-b border-slate-200 dark:border-slate-700 px-6 pt-3 bg-slate-50 dark:bg-[#08162A] gap-3">
          <button
            type="button"
            onClick={() => setActiveTab('update-profile')}
            className={`pb-3 text-xs font-bold font-ticket uppercase tracking-wider flex items-center gap-2 transition-all border-b-2 ${
              activeTab === 'update-profile'
                ? 'border-[#EA580C] text-[#EA580C]'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Update Profile / प्रोफ़ाइल</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`pb-3 text-xs font-bold font-ticket uppercase tracking-wider flex items-center gap-2 transition-all border-b-2 ${
              activeTab === 'settings'
                ? 'border-[#EA580C] text-[#EA580C]'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Settings / सेटिंग्स</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onNavigateToBookings();
            }}
            className="ml-auto pb-3 text-xs font-bold font-ticket uppercase tracking-wider flex items-center gap-1.5 text-[#0B2545] dark:text-amber-400 hover:text-[#EA580C] transition-colors"
          >
            <Ticket className="w-4 h-4 text-[#EA580C]" />
            <span>Go to My Bookings</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Notification Banner when saved */}
        {savedSuccess && (
          <div className="m-4 p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>Profile and IRCTC preferences updated successfully! / विवरण सुरक्षित कर दिया गया है।</span>
          </div>
        )}

        {/* Tab 1: Update Profile */}
        {activeTab === 'update-profile' && (
          <form onSubmit={handleSaveProfile} className="p-6 space-y-5 max-h-[65vh] overflow-y-auto">
            {/* Indian Railways Identification details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 font-ticket">
                  Full Name (As per Govt ID)
                </label>
                <input
                  type="text"
                  value={profileData.fullName}
                  onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs font-sans bg-white border border-slate-300 focus:border-[#EA580C] focus:outline-none text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 font-ticket">
                  IRCTC User ID
                </label>
                <input
                  type="text"
                  value={profileData.username}
                  onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs font-mono bg-white border border-slate-300 focus:border-[#EA580C] focus:outline-none text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 font-ticket">
                  Email ID (For ERS Slip)
                </label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs font-sans bg-white border border-slate-300 focus:border-[#EA580C] focus:outline-none text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 font-ticket">
                  Mobile Number (SMS Alerts)
                </label>
                <input
                  type="tel"
                  value={profileData.mobile}
                  onChange={(e) => setProfileData({ ...profileData, mobile: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs font-mono bg-white border border-slate-300 focus:border-[#EA580C] focus:outline-none text-slate-900"
                  required
                />
              </div>
            </div>

            {/* Travel Preferences */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="text-xs font-bold font-ticket text-[#0B2545] uppercase tracking-wider flex items-center gap-2">
                <Train className="w-4 h-4 text-[#EA580C]" />
                <span>Railway Travel Preferences / यात्रा प्राथमिकताएं</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1 font-sans">Default Berth Choice</label>
                  <select
                    value={profileData.berthPreference}
                    onChange={(e) => setProfileData({ ...profileData, berthPreference: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-white border border-slate-300 text-slate-800 focus:outline-none focus:border-[#EA580C]"
                  >
                    <option value="Lower Berth (LB)">Lower Berth (LB) / निचली बर्थ</option>
                    <option value="Middle Berth (MB)">Middle Berth (MB) / मध्य बर्थ</option>
                    <option value="Upper Berth (UB)">Upper Berth (UB) / ऊपरी बर्थ</option>
                    <option value="Side Lower (SLB)">Side Lower (SLB) / साइड लोअर</option>
                    <option value="Side Upper (SUB)">Side Upper (SUB) / साइड अपर</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-600 mb-1 font-sans">Catering / Food Option</label>
                  <select
                    value={profileData.foodChoice}
                    onChange={(e) => setProfileData({ ...profileData, foodChoice: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-white border border-slate-300 text-slate-800 focus:outline-none focus:border-[#EA580C]"
                  >
                    <option value="Veg">Vegetarian / शाकाहारी</option>
                    <option value="Non-Veg">Non-Vegetarian / मांसाहारी</option>
                    <option value="Jain">Jain Meal / जैन भोजन</option>
                    <option value="No-Food">No Food Required (Opt out)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Master Passenger List for 1-Click Tatkal Autofill */}
            <div className="p-4 rounded-xl bg-orange-50 border border-orange-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold font-ticket text-[#0B2545] uppercase flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-[#EA580C]" />
                  <span>Master Passenger List (Tatkal Fast Autofill)</span>
                </span>
                <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-bold">3 Passengers Saved</span>
              </div>
              <p className="text-[11px] text-slate-600 font-sans">
                Pre-saved passengers are auto-selected during 10:00 AM Tatkal rush, saving 45 seconds of critical entry time.
              </p>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              {currentUser ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-3.5 py-2 rounded-xl text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-bold flex items-center gap-1.5 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out / साइन आउट</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    openLoginModal();
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs text-[#EA580C] hover:bg-orange-50 font-bold flex items-center gap-1.5 transition-colors"
                >
                  <span>Sign In / लॉगिन करें</span>
                </button>
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs text-slate-600 hover:text-slate-900 font-bold"
                >
                  Cancel / रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#EA580C] hover:bg-[#D94E06] text-white font-bold text-xs uppercase font-ticket shadow-sm flex items-center gap-2 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Profile / विवरण सुरक्षित करें</span>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Tab 2: Settings */}
        {activeTab === 'settings' && (
          <div className="p-6 space-y-5 max-h-[65vh] overflow-y-auto">
            <div className="space-y-3">
              <div className="text-xs font-bold font-ticket text-[#0B2545] uppercase tracking-wider flex items-center gap-2">
                <Settings className="w-4 h-4 text-[#EA580C]" />
                <span>IRCTC & FairFlow System Preferences</span>
              </div>

              {/* Setting 1: Auto Upgrade */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-[#0B2545]">Auto-Upgrade on Vacancy</div>
                  <div className="text-[11px] text-slate-600 font-sans">
                    Automatically upgrade from Sleeper to 3AC or 3AC to 2AC if quota remains vacant at chart preparation.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSettingsData({ ...settingsData, autoUpgrade: !settingsData.autoUpgrade })}
                  className={`w-12 h-6 rounded-full transition-colors p-0.5 flex items-center ${
                    settingsData.autoUpgrade ? 'bg-[#EA580C]' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${
                      settingsData.autoUpgrade ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Setting 2: FairFlow Fast Admission */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-[#0B2545]">Controlled Admission Fast Token</div>
                  <div className="text-[11px] text-slate-600 font-sans">
                    Pre-compute cryptographic biometric token to skip browser re-captcha during 10:00 AM rush.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSettingsData({ ...settingsData, tatkalFastPass: !settingsData.tatkalFastPass })}
                  className={`w-12 h-6 rounded-full transition-colors p-0.5 flex items-center ${
                    settingsData.tatkalFastPass ? 'bg-[#EA580C]' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${
                      settingsData.tatkalFastPass ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Setting 3: WhatsApp & SMS Notifications */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-[#0B2545]">Real-Time PNR Confirmation Alerts</div>
                  <div className="text-[11px] text-slate-600 font-sans">
                    Send WhatsApp & SMS notification the instant your queue position converts to Confirmed (CNF).
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSettingsData({ ...settingsData, whatsappAlerts: !settingsData.whatsappAlerts })}
                  className={`w-12 h-6 rounded-full transition-colors p-0.5 flex items-center ${
                    settingsData.whatsappAlerts ? 'bg-[#EA580C]' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${
                      settingsData.whatsappAlerts ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Setting 4: Preferred Payment */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="text-xs font-bold text-[#0B2545] flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-[#EA580C]" />
                  <span>Default Payment Gateway</span>
                </div>
                <select
                  value={settingsData.preferredPayment}
                  onChange={(e) => setSettingsData({ ...settingsData, preferredPayment: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-white border border-slate-300 text-slate-800 focus:outline-none focus:border-[#EA580C] font-mono"
                >
                  <option value="UPI (Google Pay / PhonePe)">UPI Fast Checkout (0% PG Surcharge)</option>
                  <option value="IRCTC iMudra Wallet">IRCTC iMudra Prepaid Wallet</option>
                  <option value="NetBanking (SBI / HDFC / ICICI)">State Bank of India / HDFC NetBanking</option>
                  <option value="Credit / Debit Card">Credit / Debit Card</option>
                </select>
              </div>

              {/* Setting 5: 1-Hour Inactivity Auto-Logout Protocol */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-[#0B2545] flex items-center gap-1.5">
                    <span>1-Hour Inactivity Auto-Logout</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono font-bold">
                      Active
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 font-sans">
                    Automatically terminates active sessions after 60 minutes of no user interaction to safeguard passenger credentials.
                  </div>
                </div>
                <div className="text-xs font-mono font-bold text-slate-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shrink-0 ml-3">
                  60 min
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-[#EA580C] hover:bg-[#D94E06] text-white font-bold text-xs uppercase font-ticket shadow-sm transition-colors"
              >
                Save Preferences / सेटिंग्स सहेजें
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
