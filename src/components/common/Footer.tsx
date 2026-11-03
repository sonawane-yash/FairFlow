import React from 'react';
import { ShieldCheck, Cpu, RefreshCw } from 'lucide-react';
import { StorageService } from '../../services/storage';

interface FooterProps {
  setCurrentTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setCurrentTab }) => {
  const handleResetData = () => {
    if (window.confirm('Reset all synthetic applications and local simulation data to defaults?')) {
      StorageService.resetToDefaults();
      window.location.reload();
    }
  };

  return (
    <footer className="bg-[#0B2545] border-t-2 border-[#EA580C] text-slate-300 py-10 mt-16 text-xs font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-blue-900">
          {/* Brand & Purpose */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-sm tracking-wide">
              <Cpu className="w-4 h-4 text-[#FFB703]" />
              <span>FAIRFLOW RESERVATION ARCHITECTURE</span>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed max-w-lg">
              A simulation-first experimental model demonstrating how decoupling demand intake from instant booking
              prevents server crashes, neutralizes automated millisecond bot advantages, and dynamically recycles scarce
              inventory.
            </p>
            <div className="flex items-center gap-2 pt-1 text-[11px] text-[#FFB703]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Academic proof-of-concept. All personal identifiers, schedules, and transactions are synthetic.</span>
            </div>
          </div>

          {/* Architecture Sections */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">Core Modules</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => setCurrentTab('services')} className="hover:text-[#FFB703] text-white font-medium transition-colors text-left">
                  On-Board Services (Food, Cleaning, Complaint)
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('glossary')} className="hover:text-[#FFB703] text-white font-medium transition-colors flex items-center gap-1.5 text-left">
                  <span>Glossary of IRCTC (Terminologies & Full Forms)</span>
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('simulation')} className="hover:text-[#FFB703] text-slate-300 transition-colors text-left">
                  Methodology: Simulation Laboratory
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('pools')} className="hover:text-[#FFB703] text-slate-300 transition-colors text-left">
                  Methodology: Tatkal Pools Allocation
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('monitor')} className="hover:text-[#FFB703] text-slate-300 transition-colors text-left">
                  Methodology: Live CRIS Monitor
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('analytics')} className="hover:text-[#FFB703] text-slate-300 transition-colors text-left">
                  Methodology: Fairness & Jain Index
                </button>
              </li>
            </ul>
          </div>

          {/* Research & Reset */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">Research & Controls</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => setCurrentTab('methodology')} className="hover:text-[#FFB703] text-slate-300 transition-colors text-left">
                  Mathematical Methodology
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('admin')} className="hover:text-[#FFB703] text-slate-300 transition-colors text-left">
                  Experiment Control Panel
                </button>
              </li>
              <li>
                <button onClick={handleResetData} className="inline-flex items-center gap-1.5 text-rose-300 hover:text-rose-200 transition-colors">
                  <RefreshCw className="w-3 h-3" />
                  Reset Prototype State
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-300">
          <div>
            FAIRFLOW Research Architecture • High-Demand Reservation Proof-of-Concept
          </div>
          <div className="text-slate-300">
            Strictly synthetic simulation data • Not affiliated with IRCTC or any official authority.
          </div>
        </div>
      </div>
    </footer>
  );
};
