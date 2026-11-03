import React, { useState, useEffect } from 'react';
import {
  Radio,
  Play,
  BarChart3,
  Sliders,
  BookOpen,
  Sparkles,
  Train,
  ChevronRight,
  HelpCircle,
  Activity,
  Layers,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { LiveSystemMonitor } from '../monitor/LiveSystemMonitor';
import { SimulationLab } from '../simulation/SimulationLab';
import { PoolsDashboard } from '../pools/PoolsDashboard';
import { AnalyticsDashboard } from '../analytics/AnalyticsDashboard';
import { AdminControlPanel } from '../admin/AdminControlPanel';
import { MethodologyPage } from '../methodology/MethodologyPage';
import { ScenarioType } from '../../types';
import { useAccessibility } from '../../context/AccessibilityContext';

export type PhilosophySubTab = 'monitor' | 'simulation' | 'pools' | 'analytics' | 'control' | 'methods';

interface PhilosophyHubProps {
  initialSubTab?: PhilosophySubTab;
  activeScenario?: ScenarioType;
  onProceedToBooking?: (appId: string) => void;
  onViewApplication?: (appId: string) => void;
}

export const PhilosophyHub: React.FC<PhilosophyHubProps> = ({
  initialSubTab = 'simulation',
  activeScenario = 'railway-tatkal',
  onProceedToBooking = () => {},
  onViewApplication = () => {}
}) => {
  const [activeTab, setActiveTab] = useState<PhilosophySubTab>(initialSubTab);
  const { theme, t } = useAccessibility();

  // Sync if initialSubTab prop changes (e.g. from Quick Demo button)
  useEffect(() => {
    if (initialSubTab) {
      setActiveTab(initialSubTab);
    }
  }, [initialSubTab]);

  const tabs: {
    id: PhilosophySubTab;
    label: string;
    hindiLabel: string;
    icon: React.ComponentType<{ className?: string }>;
    description: string;
    badge?: string;
  }[] = [
    {
      id: 'monitor',
      label: 'Monitor',
      hindiLabel: 'क्रिस मॉनिटर',
      icon: Radio,
      description: 'Real-time CRIS server traffic, queue telemetry & atomic pool admissions',
      badge: 'LIVE 120 FPS'
    },
    {
      id: 'simulation',
      label: 'Simulation Lab',
      hindiLabel: 'तत्काल सिमुलेशन लैब',
      icon: Play,
      description: 'Stress-test 100,000 synthetic Tatkal applicants against traditional vs. FairFlow architecture',
      badge: '100K BENCHMARK'
    },
    {
      id: 'pools',
      label: 'Tatkal Pools',
      hindiLabel: 'पूल आवंटन एवं कतार',
      icon: Layers,
      description: 'Dynamic inventory recycling, queue stages, batch admission windows & unexercised berth sweeps',
      badge: 'POOL PIPELINE'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      hindiLabel: 'निष्पक्षता विश्लेषण',
      icon: BarChart3,
      description: 'Mathematical fairness metrics, Jain’s Index, variance analysis & latency distributions'
    },
    {
      id: 'control',
      label: 'Control',
      hindiLabel: 'सिस्टम नियंत्रण',
      icon: Sliders,
      description: 'Administrative knobs, bot swarm injection, dynamic pool recycling & server throttle levers'
    },
    {
      id: 'methods',
      label: 'Methods',
      hindiLabel: 'गणितीय कार्यप्रणाली',
      icon: BookOpen,
      description: 'Scientific principles, system architecture, decoupled demand equations & proofs'
    }
  ];

  const currentTabObj = tabs.find((t) => t.id === activeTab) || tabs[0];

  return (
    <div className="relative min-h-[calc(100vh-140px)] pb-16">
      {/* Overview Station Header for "Philosophy of the project" */}
      <div className="border-b border-slate-200 py-6 px-4 sm:px-8 bg-[#0B2545] text-white transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-orange-300 text-xs font-bold mb-2 font-ticket">
              <Train className="w-3.5 h-3.5 text-[#EA580C]" />
              <span>भारतीय रेल • RESEARCH & METHODOLOGY FOUNDATION</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-ticket">
              Project Methodology / परियोजना कार्यप्रणाली
            </h1>
            <p className="text-xs sm:text-sm text-white mt-1 max-w-3xl font-sans" style={{ color: '#ffffff' }}>
              Decoupling sudden demand surges from database access: An architectural revolution for high-load reservation systems like Indian Railways Tatkal.
            </p>
          </div>

          {/* Active section summary badge */}
          <div className="hidden lg:flex items-center gap-3 p-3 rounded-xl bg-white/10 border border-white/20 font-sans text-xs text-white">
            <currentTabObj.icon className="w-5 h-5 text-[#EA580C]" />
            <div>
              <div className="text-[10px] uppercase font-bold text-orange-300">Current Methodology View:</div>
              <div className="font-bold text-white text-sm">{currentTabObj.label} ({currentTabObj.hindiLabel})</div>
            </div>
          </div>
        </div>

        {/* Clean, stationary in-header navigation tabs replacing the floating dock */}
        <div className="max-w-7xl mx-auto mt-6 border-t border-blue-900/80 pt-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap group ${
                    isSelected
                      ? 'bg-[#EA580C] text-white shadow-md'
                      : 'bg-[#001D3D] text-slate-200 hover:text-white hover:bg-[#002855] border border-blue-800/80'
                  }`}
                  title={tab.description}
                >
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-amber-400'}`} />
                  <span className="font-ticket">{tab.label}</span>
                  {tab.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-mono uppercase ${
                        isSelected
                          ? 'bg-white/20 text-white font-bold'
                          : 'bg-blue-950 text-amber-300 border border-blue-800'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Active Sub-tab Description Banner */}
          <div className="pt-2.5 mt-2 flex items-center justify-between text-xs text-blue-200/90 font-sans">
            <div className="flex items-center gap-2">
              <span className="font-bold text-amber-400 font-ticket">{currentTabObj.hindiLabel}:</span>
              <span>{currentTabObj.description}</span>
            </div>
            <div className="font-mono text-[10px] text-amber-300 hidden md:block">
              CRIS Research Engine
            </div>
          </div>
        </div>
      </div>

      {/* RENDER ACTIVE VIEW: Monitor | Simulation | Pools | Analytics | Control | Methods */}
      <main className="mt-4">
        {activeTab === 'monitor' && <LiveSystemMonitor />}

        {activeTab === 'simulation' && <SimulationLab />}

        {activeTab === 'pools' && (
          <PoolsDashboard
            activeScenario={activeScenario}
            onProceedToBooking={onProceedToBooking}
            onViewApplication={onViewApplication}
          />
        )}

        {activeTab === 'analytics' && <AnalyticsDashboard />}

        {activeTab === 'control' && (
          <AdminControlPanel onRunSimulationTab={() => setActiveTab('simulation')} />
        )}

        {activeTab === 'methods' && <MethodologyPage />}
      </main>
    </div>
  );
};
