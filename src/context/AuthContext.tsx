import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { UserProfile, SyntheticAccount } from '../types/auth';
import { SYNTHETIC_ACCOUNTS } from '../data/syntheticAccounts';

// 1 Hour Inactivity Timeout (60 minutes * 60 seconds * 1000 milliseconds)
export const INACTIVITY_TIMEOUT_MS = 60 * 60 * 1000; // 3,600,000 ms

interface AuthContextType {
  currentUser: UserProfile | null;
  isLoggedIn: boolean;
  loginWithSynthetic: (account: SyntheticAccount) => void;
  login: (identifier: string, password: string) => { success: boolean; message?: string };
  logout: (isAutoExpired?: boolean) => void;
  updateProfile: (updated: Partial<UserProfile>) => void;
  isLoginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  isLoginAlertOpen: boolean;
  alertReason: string;
  triggerLoginRequired: (reason?: string) => void;
  closeLoginAlert: () => void;
  isSessionExpiredOpen: boolean;
  closeSessionExpiredModal: () => void;
  syntheticAccounts: SyntheticAccount[];
  inactivityTimeoutMs: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'irctc_fairflow_active_user';
const LAST_ACTIVITY_KEY = 'irctc_fairflow_last_activity';
const SESSION_EXPIRED_FLAG_KEY = 'irctc_fairflow_session_expired';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Inactivity & Session Expiry on load
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const lastActivityStr = localStorage.getItem(LAST_ACTIVITY_KEY);
        const lastActivity = lastActivityStr ? parseInt(lastActivityStr, 10) : 0;
        const now = Date.now();

        // If inactive for more than 1 hour, auto-expire session
        if (lastActivity && now - lastActivity >= INACTIVITY_TIMEOUT_MS) {
          localStorage.removeItem(STORAGE_KEY);
          localStorage.removeItem(LAST_ACTIVITY_KEY);
          localStorage.setItem(SESSION_EXPIRED_FLAG_KEY, 'true');
          return null;
        }

        // Active session: refresh last activity
        localStorage.setItem(LAST_ACTIVITY_KEY, String(now));
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return null;
  });

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isLoginAlertOpen, setIsLoginAlertOpen] = useState(false);
  const [alertReason, setAlertReason] = useState<string>('book a ticket or use any service of irctc');

  const [isSessionExpiredOpen, setIsSessionExpiredOpen] = useState<boolean>(() => {
    try {
      if (localStorage.getItem(SESSION_EXPIRED_FLAG_KEY) === 'true') {
        localStorage.removeItem(SESSION_EXPIRED_FLAG_KEY);
        return true;
      }
    } catch {
      // ignore
    }
    return false;
  });

  // Track timestamp of last user interaction in ref to avoid excessive re-renders
  const lastActivityRef = useRef<number>(Date.now());
  const lastSavedStorageRef = useRef<number>(Date.now());

  // Logout handler (supports manual or auto-expired due to inactivity)
  const logout = useCallback((isAutoExpired = false) => {
    setCurrentUser(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(LAST_ACTIVITY_KEY);
      if (isAutoExpired) {
        localStorage.setItem(SESSION_EXPIRED_FLAG_KEY, 'true');
        setIsSessionExpiredOpen(true);
      } else {
        localStorage.removeItem(SESSION_EXPIRED_FLAG_KEY);
        setIsSessionExpiredOpen(false);
      }
    } catch {
      // ignore
    }
  }, []);

  // Update storage on user state changes
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(currentUser));
        const now = Date.now();
        lastActivityRef.current = now;
        localStorage.setItem(LAST_ACTIVITY_KEY, String(now));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // ignore
    }
  }, [currentUser]);

  // Record user activity to prevent auto-logout
  const recordUserActivity = useCallback(() => {
    const now = Date.now();
    lastActivityRef.current = now;

    // Throttle writing to localStorage to once every 5 seconds
    if (now - lastSavedStorageRef.current > 5000) {
      lastSavedStorageRef.current = now;
      try {
        localStorage.setItem(LAST_ACTIVITY_KEY, String(now));
      } catch {
        // ignore
      }
    }
  }, []);

  // Set up listeners for user activity & periodic inactivity checks
  useEffect(() => {
    if (!currentUser) return;

    // Activity event types to listen to
    const activityEvents: (keyof WindowEventMap)[] = [
      'mousedown',
      'mousemove',
      'keydown',
      'scroll',
      'touchstart',
      'click',
      'wheel'
    ];

    const handleActivity = () => {
      recordUserActivity();
    };

    // Attach passive listeners
    activityEvents.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // Check inactivity periodically every 15 seconds
    const intervalTimer = setInterval(() => {
      try {
        const lastActivityStr = localStorage.getItem(LAST_ACTIVITY_KEY);
        const lastActivity = lastActivityStr ? parseInt(lastActivityStr, 10) : lastActivityRef.current;
        const now = Date.now();

        if (now - lastActivity >= INACTIVITY_TIMEOUT_MS) {
          logout(true);
        }
      } catch {
        // ignore
      }
    }, 15000);

    // Also check immediately when browser tab regains visibility / focus
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        try {
          const lastActivityStr = localStorage.getItem(LAST_ACTIVITY_KEY);
          const lastActivity = lastActivityStr ? parseInt(lastActivityStr, 10) : lastActivityRef.current;
          const now = Date.now();

          if (now - lastActivity >= INACTIVITY_TIMEOUT_MS) {
            logout(true);
          } else {
            recordUserActivity();
          }
        } catch {
          // ignore
        }
      }
    };

    // Sync across browser tabs
    const handleStorage = (e: StorageEvent) => {
      if (e.key === LAST_ACTIVITY_KEY && e.newValue) {
        const remoteTime = parseInt(e.newValue, 10);
        if (!isNaN(remoteTime)) {
          lastActivityRef.current = remoteTime;
        }
      } else if (e.key === STORAGE_KEY && !e.newValue) {
        // Logged out in another tab
        setCurrentUser(null);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('storage', handleStorage);

    return () => {
      activityEvents.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      clearInterval(intervalTimer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('storage', handleStorage);
    };
  }, [currentUser, logout, recordUserActivity]);

  const loginWithSynthetic = (account: SyntheticAccount) => {
    const profile: UserProfile = {
      id: account.id,
      fullName: account.fullName,
      username: account.username,
      email: account.email,
      mobile: account.mobile,
      roleTitle: account.roleTitle,
      aadhaarStatus: account.aadhaarStatus,
      berthPreference: account.berthPreference,
      foodChoice: account.foodChoice,
      seniorCitizen: account.seniorCitizen,
      state: account.state,
      pincode: account.pincode,
      avatarInitials: account.avatarInitials
    };

    const now = Date.now();
    lastActivityRef.current = now;
    lastSavedStorageRef.current = now;
    try {
      localStorage.setItem(LAST_ACTIVITY_KEY, String(now));
      localStorage.removeItem(SESSION_EXPIRED_FLAG_KEY);
    } catch {
      // ignore
    }

    setCurrentUser(profile);
    setIsLoginModalOpen(false);
    setIsLoginAlertOpen(false);
    setIsSessionExpiredOpen(false);
  };

  const login = (identifier: string, password: string): { success: boolean; message?: string } => {
    const trimmedId = identifier.trim();
    if (!trimmedId) {
      return { success: false, message: 'Please enter your Phone Number, Email, or Username.' };
    }
    if (!password || password.trim().length === 0) {
      return { success: false, message: 'Please enter your password.' };
    }

    const cleanInput = trimmedId.toLowerCase().replace(/[\s-+]/g, '');

    // Check if matches any synthetic accounts
    const matchedSynthetic = SYNTHETIC_ACCOUNTS.find((acc) => {
      const cleanMobile = acc.mobile.replace(/[\s-+]/g, '');
      const cleanEmail = acc.email.toLowerCase();
      const cleanUser = acc.username.toLowerCase();
      return cleanInput === cleanMobile || cleanInput === cleanEmail || cleanInput === cleanUser || cleanInput === acc.username;
    });

    if (matchedSynthetic) {
      loginWithSynthetic(matchedSynthetic);
      return { success: true };
    }

    // Otherwise, allow custom user login with their custom entered credentials!
    let detectedName = trimmedId;
    let detectedEmail = `${trimmedId.replace(/[^a-zA-Z0-9]/g, '')}@fairflow.in`;
    let detectedMobile = '+91 98765 00000';
    let detectedUsername = trimmedId.toLowerCase().replace(/[^a-zA-Z0-9_]/g, '');

    if (trimmedId.includes('@')) {
      detectedEmail = trimmedId;
      detectedUsername = trimmedId.split('@')[0];
      detectedName = detectedUsername.replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    } else if (/^\d{10}$/.test(trimmedId.replace(/[\s-+]/g, ''))) {
      detectedMobile = `+91 ${trimmedId.slice(-10, -5)} ${trimmedId.slice(-5)}`;
      detectedUsername = `user_${trimmedId.slice(-4)}`;
      detectedName = `Passenger ${trimmedId.slice(-4)}`;
    } else {
      detectedName = trimmedId.replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    }

    const initials = detectedName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0].toUpperCase())
      .join('') || 'IR';

    const customProfile: UserProfile = {
      id: `usr-custom-${Date.now()}`,
      fullName: detectedName,
      username: detectedUsername,
      email: detectedEmail,
      mobile: detectedMobile,
      roleTitle: 'IRCTC Registered Passenger',
      aadhaarStatus: 'Aadhaar Verified (UIDAI • Verified in Session)',
      berthPreference: 'Lower Berth (LB)',
      foodChoice: 'Veg',
      seniorCitizen: false,
      state: 'New Delhi',
      pincode: '110001',
      avatarInitials: initials
    };

    const now = Date.now();
    lastActivityRef.current = now;
    lastSavedStorageRef.current = now;
    try {
      localStorage.setItem(LAST_ACTIVITY_KEY, String(now));
      localStorage.removeItem(SESSION_EXPIRED_FLAG_KEY);
    } catch {
      // ignore
    }

    setCurrentUser(customProfile);
    setIsLoginModalOpen(false);
    setIsLoginAlertOpen(false);
    setIsSessionExpiredOpen(false);
    return { success: true };
  };

  const updateProfile = (updated: Partial<UserProfile>) => {
    recordUserActivity();
    setCurrentUser((prev) => (prev ? { ...prev, ...updated } : null));
  };

  const openLoginModal = () => {
    setIsLoginModalOpen(true);
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
  };

  const triggerLoginRequired = (reason?: string) => {
    if (reason) setAlertReason(reason);
    setIsLoginAlertOpen(true);
  };

  const closeLoginAlert = () => {
    setIsLoginAlertOpen(false);
  };

  const closeSessionExpiredModal = () => {
    setIsSessionExpiredOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoggedIn: Boolean(currentUser),
        loginWithSynthetic,
        login,
        logout,
        updateProfile,
        isLoginModalOpen,
        openLoginModal,
        closeLoginModal,
        isLoginAlertOpen,
        alertReason,
        triggerLoginRequired,
        closeLoginAlert,
        isSessionExpiredOpen,
        closeSessionExpiredModal,
        syntheticAccounts: SYNTHETIC_ACCOUNTS,
        inactivityTimeoutMs: INACTIVITY_TIMEOUT_MS
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

