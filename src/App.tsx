import React, { useState } from 'react';
import { DisclaimerBanner } from './components/common/DisclaimerBanner';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { MobileBottomNav } from './components/common/MobileBottomNav';
import { LandingPage } from './components/landing/LandingPage';
import { ApplicationForm } from './components/apply/ApplicationForm';
import { ApplicationStatusView } from './components/status/ApplicationStatusView';
import { PoolsDashboard } from './components/pools/PoolsDashboard';
import { BookingView } from './components/booking/BookingView';
import { MyBookingsView } from './components/mybookings/MyBookingsView';
import { ServicesView } from './components/services/ServicesView';
import { GlossaryView } from './components/glossary/GlossaryView';
import { FindMyTrainView } from './components/findtrain/FindMyTrainView';
import { PhilosophyHub, PhilosophySubTab } from './components/philosophy/PhilosophyHub';
import { ScenarioType } from './types';
import { StorageService } from './services/storage';
import { AccessibilityProvider, useAccessibility } from './context/AccessibilityContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginModal } from './components/auth/LoginModal';
import { LoginRequiredAlertModal } from './components/auth/LoginRequiredAlertModal';
import { SessionExpiredModal } from './components/auth/SessionExpiredModal';
import { SwaminiAssistant } from './components/swamini/SwaminiAssistant';
import { StationQRModal } from './components/geofence/StationQRModal';
import {
  MAJOR_STATIONS,
  StationLocation,
  StationClearanceToken,
  GeofenceService,
  getZoneFromDistance
} from './services/geofenceService';
import { ServiceCategory } from './components/services/ServicesView';

function AppContent() {
  const [currentTab, setCurrentTab] = useState<string>('landing');
  const [philosophySubTab, setPhilosophySubTab] = useState<PhilosophySubTab>('simulation');
  const [activeScenario, setActiveScenario] = useState<ScenarioType>(() => StorageService.getActiveScenario());
  const [selectedAppId, setSelectedAppId] = useState<string>('APP-2026-90412');
  const [servicesInitialCategory, setServicesInitialCategory] = useState<ServiceCategory | undefined>(undefined);

  // Geofence & Station QR Safety State
  const [selectedStation, setSelectedStation] = useState<StationLocation>(MAJOR_STATIONS[0]);
  const [simulatedDistance, setSimulatedDistance] = useState<number>(450); // Safe off-station by default
  const [activeClearanceToken, setActiveClearanceToken] = useState<StationClearanceToken | null>(() =>
    GeofenceService.getActiveClearanceToken()
  );
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  const { theme } = useAccessibility();
  const { isLoggedIn, triggerLoginRequired } = useAuth();

  const currentZone = getZoneFromDistance(simulatedDistance);
  const isTrackRestricted = currentZone === 'RESTRICTED_TRACK_ZONE' && (!activeClearanceToken || !activeClearanceToken.isSafetyCleared);

  const handleScenarioChange = (s: ScenarioType) => {
    setActiveScenario(s);
    StorageService.setActiveScenario(s);
  };

  const handleRunQuickDemo = () => {
    setPhilosophySubTab('simulation');
    setCurrentTab('philosophy');
  };

  const handleViewApplication = (appId: string) => {
    setSelectedAppId(appId);
    setCurrentTab('status');
  };

  const handleProceedToBooking = (appId: string) => {
    if (!isLoggedIn) {
      triggerLoginRequired('complete ticket booking & payment');
      return;
    }

    if (isTrackRestricted) {
      setIsQRModalOpen(true);
      return;
    }

    setSelectedAppId(appId);
    setCurrentTab('book');
  };

  const handleNavigateFromSwamini = (tab: string, subCategory?: string) => {
    if (tab === 'services') {
      if (!isLoggedIn) {
        triggerLoginRequired('use IRCTC passenger services');
        return;
      }
      if (subCategory) {
        setServicesInitialCategory(subCategory as ServiceCategory);
      }
      setCurrentTab('services');
    } else if (tab === 'apply') {
      if (!isLoggedIn) {
        triggerLoginRequired('book a train ticket');
        return;
      }
      setCurrentTab('apply');
    } else {
      setCurrentTab(tab);
    }
  };

  const handleOpenPhilosophy = (subTab: PhilosophySubTab = 'simulation') => {
    setPhilosophySubTab(subTab);
    setCurrentTab('philosophy');
  };

  // Determine active sub-tab for Philosophy
  let resolvedPhilosophySubTab: PhilosophySubTab = philosophySubTab;
  if (currentTab === 'simulation') resolvedPhilosophySubTab = 'simulation';
  else if (currentTab === 'pools') resolvedPhilosophySubTab = 'pools';
  else if (currentTab === 'monitor') resolvedPhilosophySubTab = 'monitor';
  else if (currentTab === 'analytics') resolvedPhilosophySubTab = 'analytics';
  else if (currentTab === 'admin') resolvedPhilosophySubTab = 'control';
  else if (currentTab === 'methodology') resolvedPhilosophySubTab = 'methods';

  const isPhilosophyActive =
    currentTab === 'philosophy' ||
    currentTab === 'simulation' ||
    currentTab === 'pools' ||
    currentTab === 'monitor' ||
    currentTab === 'analytics' ||
    currentTab === 'admin' ||
    currentTab === 'methodology';

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-200 selection:bg-[#EA580C] selection:text-white ${
        theme === 'dark' ? 'bg-[#05101E] text-[#F8FAFC]' : 'bg-[#F4F6F9] text-[#1E293B]'
      }`}
    >
      {/* Indian Railways research disclaimer banner */}
      <DisclaimerBanner />

      {/* Primary Navigation Header with single Philosophy of the project tab */}
      <Header
        currentTab={isPhilosophyActive ? 'philosophy' : currentTab}
        setCurrentTab={(tab) => {
          if ((tab === 'apply' || tab === 'book' || tab === 'services') && !isLoggedIn) {
            triggerLoginRequired(tab === 'services' ? 'use IRCTC passenger services' : 'book a train ticket');
            return;
          }
          if (tab === 'philosophy') {
            handleOpenPhilosophy('simulation');
          } else {
            setCurrentTab(tab);
          }
        }}
        activeScenario={activeScenario}
        onScenarioChange={handleScenarioChange}
        onRunQuickDemo={handleRunQuickDemo}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-20 md:pb-0">
        {currentTab === 'landing' && (
          <LandingPage
            setCurrentTab={setCurrentTab}
            activeScenario={activeScenario}
            onScenarioChange={handleScenarioChange}
            onRunQuickDemo={handleRunQuickDemo}
          />
        )}

        {currentTab === 'find-train' && (
          <FindMyTrainView
            onBookTrain={(trainNum) => {
              if (!isLoggedIn) {
                triggerLoginRequired('book train tickets');
                return;
              }
              setCurrentTab('apply');
            }}
            onNavigateHome={() => setCurrentTab('landing')}
          />
        )}

        {currentTab === 'apply' && (
          <ApplicationForm
            activeScenario={activeScenario}
            onScenarioChange={handleScenarioChange}
            onViewApplication={handleViewApplication}
          />
        )}

        {currentTab === 'status' && (
          <ApplicationStatusView
            appId={selectedAppId}
            onBack={() => setCurrentTab('my-bookings')}
            onProceedToBooking={handleProceedToBooking}
          />
        )}

        {currentTab === 'book' && (
          <BookingView
            appId={selectedAppId}
            activeScenario={activeScenario}
            onBack={() => setCurrentTab('status')}
            onViewTicket={() => setCurrentTab('my-bookings')}
            isTrackRestricted={isTrackRestricted}
            onTriggerStationQR={() => setIsQRModalOpen(true)}
            activeClearanceToken={activeClearanceToken}
          />
        )}

        {currentTab === 'my-bookings' && (
          <MyBookingsView
            onNewApplication={() => {
              if (!isLoggedIn) {
                triggerLoginRequired('book a train ticket');
                return;
              }
              setCurrentTab('apply');
            }}
            onViewApplication={handleViewApplication}
            onProceedToBooking={handleProceedToBooking}
            onOpenServices={(cat) => {
              if (cat) setServicesInitialCategory(cat);
              setCurrentTab('services');
            }}
          />
        )}

        {currentTab === 'services' && (
          <ServicesView initialCategory={servicesInitialCategory} />
        )}

        {currentTab === 'glossary' && (
          <GlossaryView
            onBookTicket={() => {
              if (!isLoggedIn) {
                triggerLoginRequired('book a train ticket');
                return;
              }
              setCurrentTab('apply');
            }}
            onCheckBookings={() => setCurrentTab('my-bookings')}
          />
        )}

        {/* Unified Single Tab: Philosophy of the project with floating tabs */}
        {isPhilosophyActive && (
          <PhilosophyHub
            initialSubTab={resolvedPhilosophySubTab}
            activeScenario={activeScenario}
            onProceedToBooking={handleProceedToBooking}
            onViewApplication={handleViewApplication}
          />
        )}
      </main>

      {/* Floating Draggable Swamini AI Travel & Rail Companion */}
      <SwaminiAssistant
        onNavigateTab={handleNavigateFromSwamini}
        onOpenQRScanner={() => setIsQRModalOpen(true)}
        currentZoneRestricted={isTrackRestricted}
      />

      {/* Station Master QR Code Verification Modal */}
      <StationQRModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        selectedStation={selectedStation}
        onClearanceGranted={(token) => setActiveClearanceToken(token)}
      />

      {/* Modals for Authentication, Inactivity Session Expiry, and Login Required Alert */}
      <LoginModal />
      <LoginRequiredAlertModal />
      <SessionExpiredModal />

      {/* Footer */}
      <Footer
        setCurrentTab={(tab) => {
          if (['simulation', 'pools', 'monitor', 'analytics', 'admin', 'methodology'].includes(tab)) {
            let sub: PhilosophySubTab = 'simulation';
            if (tab === 'pools') sub = 'pools';
            else if (tab === 'monitor') sub = 'monitor';
            else if (tab === 'analytics') sub = 'analytics';
            else if (tab === 'admin') sub = 'control';
            else if (tab === 'methodology') sub = 'methods';
            handleOpenPhilosophy(sub);
          } else {
            setCurrentTab(tab);
          }
        }}
      />

      {/* 1-Tap Thumb Navigation Bar on Mobile Smartphones */}
      <MobileBottomNav
        currentTab={isPhilosophyActive ? 'philosophy' : currentTab}
        onSelectTab={(tab) => {
          if ((tab === 'apply' || tab === 'book' || tab === 'services') && !isLoggedIn) {
            triggerLoginRequired(tab === 'services' ? 'use IRCTC passenger services' : 'book a train ticket');
            return;
          }
          if (tab === 'philosophy') {
            handleOpenPhilosophy('simulation');
          } else {
            setCurrentTab(tab);
          }
        }}
        onOpenQuickDemo={handleRunQuickDemo}
      />
    </div>
  );
}

export default function App() {
  return (
    <AccessibilityProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </AccessibilityProvider>
  );
}
