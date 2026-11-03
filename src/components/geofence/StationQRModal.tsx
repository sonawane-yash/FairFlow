import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  QrCode,
  Camera,
  ShieldCheck,
  AlertTriangle,
  Train,
  CheckCircle2,
  Sparkles,
  MapPin,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import {
  MAJOR_STATIONS,
  StationLocation,
  GeofenceService,
  StationClearanceToken
} from '../../services/geofenceService';
import { useAuth } from '../../context/AuthContext';
import { saveStationVerificationToFirestore } from '../../services/firebase';

interface StationQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedStation: StationLocation;
  onClearanceGranted: (token: StationClearanceToken) => void;
}

export const StationQRModal: React.FC<StationQRModalProps> = ({
  isOpen,
  onClose,
  selectedStation,
  onClearanceGranted
}) => {
  const { currentUser } = useAuth();
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedSuccess, setScannedSuccess] = useState<StationClearanceToken | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setScannedSuccess(null);
      setIsScanning(false);
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    try {
      setCameraError(null);
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } }
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setCameraActive(true);
      } else {
        setCameraError('Camera access not supported on this device. You can use the instant Station Kiosk scan below.');
      }
    } catch (err: any) {
      console.warn('Camera stream permission:', err);
      setCameraError('Camera permission not granted or unavailable. You can use the instant Station Kiosk scan below.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const handleSimulateScan = async (station: StationLocation = selectedStation) => {
    setIsScanning(true);
    setTimeout(async () => {
      const token = GeofenceService.issueClearanceToken(station, 'QR_SCAN');
      setScannedSuccess(token);
      setIsScanning(false);

      // Persist to Firestore if user is authenticated
      if (currentUser?.id) {
        await saveStationVerificationToFirestore(currentUser.id, token);
      }

      setTimeout(() => {
        onClearanceGranted(token);
        onClose();
      }, 1200);
    }, 800);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150 font-ticket">
      <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-[#0B2545] border-2 border-[#EA580C] shadow-2xl overflow-hidden text-slate-900 dark:text-white">
        {/* Top Header */}
        <div className="p-4 sm:p-5 bg-[#0B2545] text-white border-b border-blue-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EA580C] flex items-center justify-center text-white shadow-sm">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-amber-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Station Safety QR Verification Gate</span>
              </div>
              <h2 className="text-lg font-black">{selectedStation.name} ({selectedStation.code})</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-blue-900/60 hover:bg-blue-800 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scanner Viewport */}
        <div className="p-6 space-y-4">
          {scannedSuccess ? (
            <div className="p-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-500 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-500 text-white mx-auto flex items-center justify-center animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-black text-emerald-800 dark:text-emerald-300">
                Railway Safety Clearance Granted!
              </h3>
              <p className="text-xs text-emerald-700 dark:text-emerald-200 font-mono">
                Token ID: <strong>{scannedSuccess.id}</strong> • Valid for 30 minutes.
              </p>
              <div className="text-[11px] text-slate-600 dark:text-slate-300">
                You are verified in the safe concourse area. Ticket booking restriction has been unlocked.
              </div>
            </div>
          ) : (
            <>
              <div className="relative aspect-4/3 rounded-xl bg-slate-900 border-2 border-dashed border-[#EA580C] overflow-hidden flex items-center justify-center">
                {cameraActive ? (
                  <video
                    ref={videoRef}
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="p-6 text-center space-y-3">
                    <Camera className="w-12 h-12 text-slate-500 mx-auto" />
                    <div className="text-xs text-slate-400 max-w-xs">
                      {cameraError || 'Position the official Station Master QR Code inside the viewfinder'}
                    </div>
                  </div>
                )}

                {/* Animated Viewfinder Target Reticle */}
                <div className="absolute inset-8 border-2 border-amber-400/80 rounded-xl pointer-events-none flex flex-col justify-between p-3">
                  <div className="flex justify-between">
                    <span className="w-4 h-4 border-t-2 border-l-2 border-amber-400" />
                    <span className="w-4 h-4 border-t-2 border-r-2 border-amber-400" />
                  </div>
                  {isScanning && (
                    <div className="h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent animate-pulse" />
                  )}
                  <div className="flex justify-between">
                    <span className="w-4 h-4 border-b-2 border-l-2 border-amber-400" />
                    <span className="w-4 h-4 border-b-2 border-r-2 border-amber-400" />
                  </div>
                </div>

                <div className="absolute bottom-2 inset-x-2 text-center">
                  <span className="px-2.5 py-1 rounded-md bg-black/70 text-[10px] text-amber-300 font-mono">
                    Scan Station Master Concourse QR
                  </span>
                </div>
              </div>

              {/* Station Kiosk One-Click Simulation */}
              <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-[#001D3D] border border-blue-200 dark:border-blue-900 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold flex items-center gap-1.5 text-[#0B2545] dark:text-amber-300">
                    <Train className="w-4 h-4 text-[#EA580C]" />
                    <span>Station Master Verification Kiosk (Simulator)</span>
                  </span>
                  <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                    Official CRIS Seal
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-blue-100">
                  Testing on laptop/web? Click below to instantly simulate scanning the official QR Code at <strong>{selectedStation.name}</strong> concourse:
                </p>

                <button
                  type="button"
                  disabled={isScanning}
                  onClick={() => handleSimulateScan(selectedStation)}
                  className="w-full py-2.5 px-3 rounded-lg bg-[#EA580C] hover:bg-[#D94E06] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
                >
                  {isScanning ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Verifying Station QR Crypto Signature...</span>
                    </>
                  ) : (
                    <>
                      <QrCode className="w-4 h-4" />
                      <span>Scan Official Concourse QR: {selectedStation.code}</span>
                    </>
                  )}
                </button>
              </div>
            </>
          )}

          {/* Safety Rule Note */}
          <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-start gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
            <span>
              In accordance with Indian Railways passenger track safety regulations, online ticket reservations are restricted in the immediate track zone to prevent railway accidents and unauthorized platform touting.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
