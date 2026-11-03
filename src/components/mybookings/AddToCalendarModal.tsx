import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Train,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Trash2,
  X,
  Bell,
  Users,
  ShieldCheck,
  CalendarCheck
} from 'lucide-react';
import { BookingRecord, UserApplication } from '../../types';
import {
  GoogleCalendarService,
  extractTrainScheduleDetails,
  TrainScheduleParsed,
  GoogleCalendarEventResult
} from '../../services/googleCalendarService';
import { StorageService } from '../../services/storage';

interface AddToCalendarModalProps {
  booking: BookingRecord;
  application?: UserApplication;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (event: GoogleCalendarEventResult) => void;
}

export const AddToCalendarModal: React.FC<AddToCalendarModalProps> = ({
  booking,
  application,
  isOpen,
  onClose,
  onSuccess
}) => {
  // Parsed initial schedule
  const initialSchedule = extractTrainScheduleDetails(booking, application);

  // Form states allowing user to customize the date, departure time, and arrival time
  const [trainName, setTrainName] = useState(initialSchedule.trainName);
  const [trainNumber, setTrainNumber] = useState(initialSchedule.trainNumber);
  const [travelDate, setTravelDate] = useState(
    booking.googleCalendarEvent?.travelDate || initialSchedule.travelDate
  );
  const [departureTime, setDepartureTime] = useState(
    booking.googleCalendarEvent?.departureTime || initialSchedule.departureTime
  );
  const [arrivalTime, setArrivalTime] = useState(
    booking.googleCalendarEvent?.arrivalTime || initialSchedule.arrivalTime
  );
  const [fromStation, setFromStation] = useState(
    `${initialSchedule.fromStationName} (${initialSchedule.fromStationCode})`
  );
  const [toStation, setToStation] = useState(
    `${initialSchedule.toStationName} (${initialSchedule.toStationCode})`
  );
  const [platform, setPlatform] = useState(initialSchedule.platform || '1');

  // Reminder preferences
  const [remind24h, setRemind24h] = useState(true);
  const [remind3h, setRemind3h] = useState(true);
  const [remind1h, setRemind1h] = useState(true);

  // Status & states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successEvent, setSuccessEvent] = useState<GoogleCalendarEventResult | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Reset or load when modal opens
  useEffect(() => {
    if (isOpen) {
      const sch = extractTrainScheduleDetails(booking, application);
      setTrainName(sch.trainName);
      setTrainNumber(sch.trainNumber);
      setTravelDate(booking.googleCalendarEvent?.travelDate || sch.travelDate);
      setDepartureTime(booking.googleCalendarEvent?.departureTime || sch.departureTime);
      setArrivalTime(booking.googleCalendarEvent?.arrivalTime || sch.arrivalTime);
      setFromStation(`${sch.fromStationName} (${sch.fromStationCode})`);
      setToStation(`${sch.toStationName} (${sch.toStationCode})`);
      setPlatform(sch.platform || '1');
      setErrorMsg(null);
      setSuccessEvent(null);
      setShowDeleteConfirm(false);
    }
  }, [isOpen, booking, application]);

  if (!isOpen) return null;

  const isAlreadySynced = Boolean(booking.googleCalendarEvent?.eventId);

  const handleAddOrUpdateCalendar = async () => {
    try {
      setIsLoading(true);
      setErrorMsg(null);

      // Collect reminder minutes
      const reminderMinutes: number[] = [];
      if (remind24h) reminderMinutes.push(1440); // 24 hours
      if (remind3h) reminderMinutes.push(180);   // 3 hours
      if (remind1h) reminderMinutes.push(60);    // 1 hour

      const [fromName, fromCode] = fromStation.includes('(')
        ? [fromStation.split('(')[0].trim(), fromStation.split('(')[1].replace(')', '').trim()]
        : [fromStation, 'DEP'];
      const [toName, toCode] = toStation.includes('(')
        ? [toStation.split('(')[0].trim(), toStation.split('(')[1].replace(')', '').trim()]
        : [toStation, 'ARR'];

      const [depH, depM] = departureTime.split(':').map(Number);
      const [arrH, arrM] = arrivalTime.split(':').map(Number);
      const isOvernight = (arrH * 60 + arrM) <= (depH * 60 + depM);

      const scheduleToSave: TrainScheduleParsed = {
        trainNumber,
        trainName,
        travelDate,
        departureTime,
        arrivalTime,
        fromStationName: fromName,
        fromStationCode: fromCode,
        toStationName: toName,
        toStationCode: toCode,
        platform,
        isOvernight,
        coachAndBerth: booking.seatSyntheticRef,
        passengerNames: booking.passengerSeats && booking.passengerSeats.length > 0
          ? booking.passengerSeats.map((ps) => ps.passengerName)
          : [booking.primaryPassenger],
        pnr: booking.id
      };

      // Call Google Calendar API
      const result = await GoogleCalendarService.addTrainJourneyEvent({
        schedule: scheduleToSave,
        booking,
        application,
        reminderMinutes
      });

      // Update storage with calendar metadata
      StorageService.updateBookingCalendarEvent(booking.id, {
        eventId: result.id,
        htmlLink: result.htmlLink,
        syncedAt: new Date().toISOString(),
        travelDate,
        departureTime,
        arrivalTime,
        trainNumber,
        trainName,
        summary: result.summary
      });

      setSuccessEvent(result);
      if (onSuccess) onSuccess(result);
    } catch (err: any) {
      console.warn('Failed to add to Google Calendar:', err);
      if (err?.code === 'auth/popup-closed-by-user' || String(err?.message || '').includes('popup-closed-by-user')) {
        setErrorMsg('The Google sign-in window was closed before authorization was complete. Please click "Confirm & Add to Google Calendar" again.');
      } else if (err?.code === 'auth/cancelled-popup-request' || String(err?.message || '').includes('cancelled-popup-request')) {
        setErrorMsg('Authorization was interrupted by another request. Please try again.');
      } else if (err?.code === 'auth/popup-blocked' || String(err?.message || '').includes('popup-blocked')) {
        setErrorMsg('Google authorization popup was blocked by your browser. Please allow popups for this site and try again.');
      } else {
        setErrorMsg(err?.message || 'Failed to sync with Google Calendar. Please check permissions and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCalendarEvent = async () => {
    if (!booking.googleCalendarEvent?.eventId) return;
    try {
      setIsDeleting(true);
      setErrorMsg(null);
      await GoogleCalendarService.deleteTrainJourneyEvent(booking.googleCalendarEvent.eventId);
      StorageService.updateBookingCalendarEvent(booking.id, undefined);
      setShowDeleteConfirm(false);
      onClose();
    } catch (err: any) {
      console.warn('Failed to remove event from Google Calendar:', err);
      if (err?.code === 'auth/popup-closed-by-user' || String(err?.message || '').includes('popup-closed-by-user')) {
        setErrorMsg('Authorization was cancelled before completing deletion.');
      } else {
        setErrorMsg(err?.message || 'Failed to remove event from Google Calendar.');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto font-sans">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
        onClick={() => !isLoading && onClose()}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        className="relative bg-white text-slate-900 rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden z-10 animate-in fade-in zoom-in-95 my-8"
      >
        {/* Top Header with authentic Google Calendar & Indian Railways theme */}
        <div className="bg-gradient-to-r from-[#0B2545] via-[#134074] to-[#0B2545] text-white p-5 sm:p-6 relative">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="absolute top-4 right-4 text-slate-300 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            {/* Google Calendar SVG Icon */}
            <div className="w-12 h-12 rounded-xl bg-white p-2 shadow-md flex items-center justify-center shrink-0">
              <svg viewBox="0 0 24 24" className="w-8 h-8">
                <path fill="#4285F4" d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z" />
                <path fill="#34A853" d="M7 11h5v5H7z" />
                <path fill="#EA4335" d="M12 11h5v5h-5z" />
              </svg>
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-[10px] font-bold uppercase tracking-wider mb-1">
                <CalendarCheck className="w-3 h-3 text-amber-300" />
                <span>Google Calendar Sync • IRCTC</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight text-white">
                Add Train Schedule to Google Calendar
              </h2>
              <p className="text-xs text-blue-100">
                Sync train departure date, times, and berth details to your personal Google Calendar.
              </p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Success Notification Banner */}
          {successEvent && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 space-y-2 animate-in fade-in">
              <div className="flex items-center gap-2 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Train journey added to Google Calendar successfully!</span>
              </div>
              <p className="text-xs text-emerald-700">
                The event has been created in your primary Google Calendar with alerts configured for departure.
              </p>
              {successEvent.htmlLink && (
                <div className="pt-1">
                  <a
                    href={successEvent.htmlLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors shadow-xs"
                  >
                    <span>Open in Google Calendar</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">Sync Error: </strong>
                <span>{errorMsg}</span>
              </div>
            </div>
          )}

          {/* Explicit User Confirmation Notice as required by Workspace Skill */}
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#EA580C] shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <div className="font-bold text-[#0B2545]">Confirmation Required</div>
              <p className="text-[11px] text-amber-800 leading-relaxed font-sans">
                Review the train details below. Clicking <strong>Confirm & Add to Calendar</strong> will create a new schedule entry with departure alerts on your Google Calendar account with your permission.
              </p>
            </div>
          </div>

          {/* Train Ticket Summary Badge */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex justify-between items-start text-xs">
              <div className="flex items-center gap-1.5 font-bold text-[#0B2545]">
                <Train className="w-4 h-4 text-[#EA580C]" />
                <span className="font-black text-sm">{trainName} ({trainNumber})</span>
              </div>
              <span className="font-mono text-[11px] font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded border border-emerald-300">
                PNR: {booking.id}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-1 border-t border-slate-200">
              <div>
                <span className="text-[10px] text-slate-600 block">Class & Berth:</span>
                <span className="font-semibold text-slate-800">{booking.seatSyntheticRef}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-600 block">Passenger(s):</span>
                <span className="font-semibold text-slate-800">{booking.primaryPassenger} ({booking.passengerCount})</span>
              </div>
            </div>
          </div>

          {/* Editable Travel Date & Time Form */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#0B2545] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#EA580C]" />
              <span>Journey Schedule & Timings (यात्रा का समय एवं दिनांक)</span>
            </h3>

            {/* Travel Date */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                तारीख / Travel Date:
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={travelDate}
                  onChange={(e) => setTravelDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B2545]"
                  required
                />
              </div>
              <span className="text-[10px] text-slate-600 mt-0.5 block">
                The date when the train departs from {fromStation}.
              </span>
            </div>

            {/* Time Grid: Departure & Arrival */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  प्रस्थान समय / Train Departure Time:
                </label>
                <div className="relative">
                  <input
                    type="time"
                    value={departureTime}
                    onChange={(e) => setDepartureTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B2545]"
                    required
                  />
                </div>
                <span className="text-[10px] text-slate-600 mt-0.5 block">
                  Origin: {fromStation}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  आगमन समय / Train Arrival Time:
                </label>
                <div className="relative">
                  <input
                    type="time"
                    value={arrivalTime}
                    onChange={(e) => setArrivalTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B2545]"
                    required
                  />
                </div>
                <span className="text-[10px] text-slate-600 mt-0.5 block">
                  Destination: {toStation}
                </span>
              </div>
            </div>

            {/* Stations and Platform */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs">
              <div className="sm:col-span-1">
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Platform (प्लेटफॉर्म)</label>
                <input
                  type="text"
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  placeholder="e.g. 1, 16"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-800"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Boarding Station (प्रस्थान स्टेशन)</label>
                <input
                  type="text"
                  value={fromStation}
                  onChange={(e) => setFromStation(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Travel Reminders Configuration */}
          <div className="space-y-2 pt-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#0B2545] flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-[#EA580C]" />
              <span>Travel Alerts & Reminders (यात्रा अनुस्मारक)</span>
            </h3>

            <div className="space-y-2 rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={remind24h}
                  onChange={(e) => setRemind24h(e.target.checked)}
                  className="w-4 h-4 rounded text-[#EA580C] focus:ring-[#EA580C]"
                />
                <span className="font-semibold text-slate-800">24 hours before departure</span>
                <span className="text-[11px] text-slate-600">(Pack luggage & verify PNR current status)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={remind3h}
                  onChange={(e) => setRemind3h(e.target.checked)}
                  className="w-4 h-4 rounded text-[#EA580C] focus:ring-[#EA580C]"
                />
                <span className="font-semibold text-slate-800">3 hours before departure</span>
                <span className="text-[11px] text-slate-600">(Head to railway station & check platform display)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={remind1h}
                  onChange={(e) => setRemind1h(e.target.checked)}
                  className="w-4 h-4 rounded text-[#EA580C] focus:ring-[#EA580C]"
                />
                <span className="font-semibold text-slate-800">1 hour before departure</span>
                <span className="text-[11px] text-slate-600">(Final boarding alert & coach positioning)</span>
              </label>
            </div>
          </div>

          {/* Delete confirmation section (if user requested to remove from calendar) */}
          {showDeleteConfirm && (
            <div className="p-4 rounded-xl bg-rose-50 border-2 border-rose-300 text-rose-900 space-y-3 animate-in fade-in">
              <div className="flex items-center gap-2 font-bold text-xs text-rose-800">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Confirm Removal from Google Calendar?</span>
              </div>
              <p className="text-xs text-rose-700">
                Are you sure you want to delete this train journey event from your Google Calendar? This action cannot be undone.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={handleDeleteCalendarEvent}
                  disabled={isDeleting}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isDeleting ? 'Deleting...' : 'Yes, Delete Event'}</span>
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  className="px-3 py-1.5 rounded-lg bg-white border border-rose-300 text-rose-800 font-bold text-xs hover:bg-rose-100 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-600 flex items-center gap-1.5 self-start sm:self-auto">
            {isAlreadySynced && (
              <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Already synced to Calendar</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {isAlreadySynced && !showDeleteConfirm && (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isLoading}
                className="px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 text-xs font-bold transition-colors flex items-center gap-1"
                title="Remove from Google Calendar"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Remove</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleAddOrUpdateCalendar}
              disabled={isLoading}
              className="px-5 py-2.5 rounded-xl bg-[#0B2545] hover:bg-[#134074] active:scale-[0.98] text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
            >
              {isLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Connecting to Calendar...</span>
                </>
              ) : (
                <>
                  {/* Google Calendar mini colored mark */}
                  <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0">
                    <path fill="#4285F4" d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z" />
                    <path fill="#34A853" d="M7 11h5v5H7z" />
                    <path fill="#EA4335" d="M12 11h5v5h-5z" />
                  </svg>
                  <span>
                    {isAlreadySynced
                      ? 'Update Calendar Event (अपडेट करें)'
                      : 'Confirm & Add to Calendar (कैलेंडर में जोड़ें)'}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
