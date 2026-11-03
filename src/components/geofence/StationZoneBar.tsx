import React, { useState } from 'react';
import {
  MapPin,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  QrCode,
  Train,
  CheckCircle2,
  Sliders,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import {
  MAJOR_STATIONS,
  StationLocation,
  GeofenceZoneType,
  StationClearanceToken,
  getZoneFromDistance,
  GeofenceService
} from '../../services/geofenceService';

interface StationZoneBarProps {
  currentDistance: number;
  onDistanceChange: (distance: number) => void;
  selectedStation: StationLocation;
  onSelectStation: (station: StationLocation) => void;
  activeToken: StationClearanceToken | null;
  onOpenQRScanner: () => void;
  onRevokeToken: () => void;
}

export const StationZoneBar: React.FC<StationZoneBarProps> = ({
  currentDistance,
  onDistanceChange,
  selectedStation,
  onSelectStation,
  activeToken,
  onOpenQRScanner,
  onRevokeToken
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const currentZone: GeofenceZoneType = getZoneFromDistance(currentDistance);

  const zoneConfig = {
    OFF_STATION_SAFE: {
      label: 'Safe Off-Station Zone (>300m)',
      hindi: 'स्टेशन से सुरक्षित दूरी',
      bgColor: 'bg-emerald-900/90 border-emerald-700 text-emerald-100',
      badgeColor: 'bg-emerald-500 text-white',
      icon: ShieldCheck,
      description: 'You are at a safe distance from railway tracks. Ticket booking is unrestricted.'
    },
    STATION_CONCOURSE: {
      label: 'Station Concourse & Waiting Hall (100m - 300m)',
      hindi: 'स्टेशन परिसर / प्रतीक्षालय',
      bgColor: 'bg-amber-900/90 border-amber-700 text-amber-100',
      badgeColor: 'bg-amber-500 text-slate-950',
      icon: AlertTriangle,
      description: 'Located in station foyer. QR verification recommended for fast boarding verification.'
    },
    RESTRICTED_TRACK_ZONE: {
      label: 'Restricted Track Perimeter (<100m)',
      hindi: 'रेलवे ट्रैक प्रतिबंधित सुरक्षा क्षेत्र',
      bgColor: 'bg-red-950/95 border-red-700 text-red-100',
      badgeColor: 'bg-red-600 text-white animate-pulse',
      icon: ShieldAlert,
      description: 'DANGER: Located on or near railway tracks. Online booking is strictly blocked for passenger safety until official Station QR is scanned.'
    }
  };

  const currentCfg = zoneConfig[currentZone];
  const Icon = currentCfg.icon;

  const isBlocked = currentZone === 'RESTRICTED_TRACK_ZONE' && (!activeToken || !activeToken.isSafetyCleared);

  return (
    <div className="w-full bg-[#001428] border-b border-blue-900 text-white font-ticket transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          {/* Left: Zone Alert & Status */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className={`px-2.5 py-1 rounded-md border flex items-center gap-1.5 font-bold text-xs ${currentCfg.bgColor}`}>
              <Icon className="w-4 h-4 shrink-0" />
              <span>{currentCfg.label}</span>
            </div>

            <div className="flex items-center gap-1.5 text-blue-200">
              <MapPin className="w-3.5 h-3.5 text-[#EA580C]" />
              <span>Station: <strong>{selectedStation.code}</strong> ({selectedStation.city})</span>
              <span className="font-mono text-amber-300">[{currentDistance}m from tracks]</span>
            </div>

            {/* Clearance Token Badge */}
            {activeToken && activeToken.isSafetyCleared ? (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500 text-emerald-300 font-bold text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Station Safety Cleared ({activeToken.id})</span>
                <button
                  type="button"
                  onClick={onRevokeToken}
                  title="Revoke for testing"
                  className="text-emerald-400/80 hover:text-white underline ml-1 text-[10px]"
                >
                  Reset
                </button>
              </div>
            ) : isBlocked ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-600 text-white font-black text-[11px] animate-pulse">
                BOOKING BLOCKED BY SAFETY GEOFENCE
              </span>
            ) : null}
          </div>

          {/* Right: Actions & Simulator Toggle */}
          <div className="flex items-center gap-2 flex-wrap sm:shrink-0">
            {isBlocked && (
              <button
                type="button"
                onClick={onOpenQRScanner}
                className="px-3 py-1.5 rounded-lg bg-[#EA580C] hover:bg-[#D94E06] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all animate-bounce"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Scan Station QR to Unlock</span>
              </button>
            )}

            {!isBlocked && (
              <button
                type="button"
                onClick={onOpenQRScanner}
                className="px-2.5 py-1 rounded-lg bg-blue-900/70 hover:bg-blue-800 text-blue-200 hover:text-white text-xs flex items-center gap-1 transition-colors"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Station QR</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-mono flex items-center gap-1 transition-colors"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Zone Simulator</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Expandable Simulator Panel */}
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-blue-900/80 space-y-3 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Station Selector */}
              <div>
                <label className="block text-[11px] text-blue-300 font-bold mb-1">
                  Simulate Location at Station:
                </label>
                <select
                  value={selectedStation.code}
                  onChange={(e) => {
                    const stn = MAJOR_STATIONS.find((s) => s.code === e.target.value);
                    if (stn) onSelectStation(stn);
                  }}
                  className="w-full bg-[#001D3D] border border-blue-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-hidden focus:ring-1 focus:ring-amber-400 font-ticket"
                >
                  {MAJOR_STATIONS.map((s) => (
                    <option key={s.code} value={s.code}>
                      {s.code} - {s.name} ({s.city})
                    </option>
                  ))}
                </select>
              </div>

              {/* Distance Slider */}
              <div className="md:col-span-2 space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-blue-300 font-bold">Track Proximity Meter:</span>
                  <span className="text-amber-300 font-mono font-bold">
                    {currentDistance} meters from platform tracks
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="1000"
                  step="10"
                  value={currentDistance}
                  onChange={(e) => onDistanceChange(Number(e.target.value))}
                  className="w-full accent-[#EA580C] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span className="text-red-400 font-bold">10m (Active Tracks)</span>
                  <span className="text-amber-400 font-bold">200m (Concourse)</span>
                  <span className="text-emerald-400 font-bold">1000m (Off-Station Safe)</span>
                </div>
              </div>
            </div>

            {/* Quick Preset Buttons */}
            <div className="flex items-center gap-2 pt-1 flex-wrap text-xs">
              <span className="text-[11px] text-slate-400 font-bold">Quick Zone Presets:</span>
              <button
                type="button"
                onClick={() => onDistanceChange(650)}
                className="px-2 py-1 rounded bg-emerald-950 border border-emerald-600 hover:bg-emerald-900 text-emerald-300 text-[11px] font-bold"
              >
                Safe Zone (650m)
              </button>
              <button
                type="button"
                onClick={() => onDistanceChange(180)}
                className="px-2 py-1 rounded bg-amber-950 border border-amber-600 hover:bg-amber-900 text-amber-300 text-[11px] font-bold"
              >
                Station Concourse (180m)
              </button>
              <button
                type="button"
                onClick={() => onDistanceChange(35)}
                className="px-2 py-1 rounded bg-red-950 border border-red-600 hover:bg-red-900 text-red-300 text-[11px] font-bold animate-pulse"
              >
                Track Perimeter (35m - Restricted)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
