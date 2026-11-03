import React from 'react';
import { ShieldAlert, Train } from 'lucide-react';

export const DisclaimerBanner: React.FC = () => {
  return (
    <div className="bg-[#FFFBEB] dark:bg-[#1A1303] border-b border-[#FCD34D] dark:border-[#78350F] px-4 py-1.5 text-xs text-[#92400E] dark:text-[#FDE68A] flex items-center justify-between font-sans transition-colors">
      <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#EA580C] text-white font-bold uppercase tracking-wider text-[10px]">
          <ShieldAlert className="w-3 h-3 text-white" />
          <span>सूचना / ADVISORY</span>
        </span>
        <span className="font-medium text-[#92400E] dark:text-[#FDE68A] text-[11px] sm:text-xs">
          Academic Research Prototype • Simulation-Based • Not affiliated with IRCTC, Indian Railways (भारतीय रेल), or CRIS.
        </span>
        <span className="hidden md:inline text-[#B45309] dark:text-[#FBBF24] border-l border-[#FCD34D] dark:border-[#78350F] pl-2 font-mono text-[10px]">
          All PNRs, Tatkal slots, and ticket vouchers are synthetic.
        </span>
      </div>
      <div className="hidden lg:flex items-center gap-1 text-[11px] text-[#92400E] dark:text-[#FDE68A] font-medium">
        <Train className="w-3 h-3 text-[#EA580C]" />
        <span>शुभयात्रा / Happy Journey</span>
      </div>
    </div>
  );
};
