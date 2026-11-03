import React from 'react';
import {
  Train,
  Search,
  Send,
  Ticket,
  UtensilsCrossed,
  Activity,
  BookMarked
} from 'lucide-react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useAuth } from '../../context/AuthContext';

interface MobileBottomNavProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenQuickDemo?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  onSelectTab
}) => {
  const { t } = useAccessibility();
  const { isLoggedIn, triggerLoginRequired } = useAuth();

  const navItems = [
    {
      id: 'landing',
      label: 'Home',
      hindiLabel: 'मुख्य',
      icon: Train
    },
    {
      id: 'find-train',
      label: 'Find Train',
      hindiLabel: 'ट्रेन खोजें',
      icon: Search
    },
    {
      id: 'apply',
      label: 'Book Ticket',
      hindiLabel: 'आरक्षण',
      icon: Send,
      requiresAuth: true,
      authReason: 'book train tickets'
    },
    {
      id: 'my-bookings',
      label: 'My PNR',
      hindiLabel: 'ई-टिकट',
      icon: Ticket
    },
    {
      id: 'services',
      label: 'Services',
      hindiLabel: 'सेवाएँ',
      icon: UtensilsCrossed,
      requiresAuth: true,
      authReason: 'use IRCTC passenger services'
    },
    {
      id: 'philosophy',
      label: '100K Lab',
      hindiLabel: 'सिमुलेशन',
      icon: Activity,
      isSpecial: true
    }
  ];

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-[#0B2545]/98 backdrop-blur-md border-t-2 border-[#EA580C] shadow-[0_-4px_20px_rgba(0,0,0,0.35)] transition-all font-ticket"
    >
      {/* Indian Railways subtle livery accent */}
      <div className="h-0.5 bg-gradient-to-r from-[#FF9933] via-white to-[#138808] w-full" />

      <div className="grid grid-cols-6 h-16 max-w-lg mx-auto px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.requiresAuth && !isLoggedIn) {
                  triggerLoginRequired(item.authReason);
                  return;
                }
                onSelectTab(item.id);
              }}
              className={`flex flex-col items-center justify-center py-1 px-0.5 text-center transition-all relative ${
                isActive
                  ? 'text-[#FFB703]'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {/* Active Indicator Top Glow */}
              {isActive && (
                <span className="absolute top-0 w-8 h-1 rounded-full bg-[#EA580C] shadow-[0_0_8px_#EA580C]" />
              )}

              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-transform ${
                  isActive
                    ? 'bg-[#EA580C] text-white shadow-md scale-110'
                    : item.isSpecial
                    ? 'bg-blue-900/60 text-amber-300 border border-amber-400/30'
                    : 'text-slate-300'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>

              <span
                className={`text-[10px] leading-tight mt-1 tracking-tight truncate max-w-full ${
                  isActive ? 'font-black text-[#FFB703]' : 'font-semibold'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
