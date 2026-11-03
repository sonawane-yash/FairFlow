import React, { useState, useEffect } from 'react';
import {
  Ticket,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Plus,
  Calendar,
  Layers,
  MapPin,
  ExternalLink,
  Trash2,
  Train,
  Printer,
  Search,
  CalendarCheck,
  ShieldAlert
} from 'lucide-react';
import { StorageService } from '../../services/storage';
import { UserApplication, BookingRecord } from '../../types';
import { AddToCalendarModal } from './AddToCalendarModal';
import { CoachBerthMapModal } from '../coach/CoachBerthMapModal';
import { extractTrainScheduleDetails } from '../../services/googleCalendarService';

interface MyBookingsViewProps {
  onNewApplication: () => void;
  onViewApplication: (id: string) => void;
  onProceedToBooking: (id: string) => void;
  onOpenServices?: (category?: 'food' | 'cleaning' | 'repair' | 'complaint') => void;
}

export const MyBookingsView: React.FC<MyBookingsViewProps> = ({
  onNewApplication,
  onViewApplication,
  onProceedToBooking,
  onOpenServices
}) => {
  const [applications, setApplications] = useState<UserApplication[]>([]);
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [searchPnr, setSearchPnr] = useState('');
  const [calendarTarget, setCalendarTarget] = useState<{
    booking: BookingRecord;
    application?: UserApplication;
  } | null>(null);
  const [coachMapTarget, setCoachMapTarget] = useState<{
    booking: BookingRecord;
    application?: UserApplication;
  } | null>(null);

  useEffect(() => {
    setApplications(StorageService.getApplications());
    setBookings(StorageService.getBookings());

    const updateHandler = () => {
      setApplications(StorageService.getApplications());
      setBookings(StorageService.getBookings());
    };

    window.addEventListener('fairflow_storage_updated', updateHandler);
    return () => window.removeEventListener('fairflow_storage_updated', updateHandler);
  }, []);

  const filteredBookings = bookings.filter((b) =>
    b.id.toLowerCase().includes(searchPnr.toLowerCase()) ||
    b.primaryPassenger.toLowerCase().includes(searchPnr.toLowerCase()) ||
    b.itemDetails.toLowerCase().includes(searchPnr.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8 font-ticket">
      {/* Header banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#0B2545] text-xs font-bold mb-2">
            <Train className="w-3.5 h-3.5 text-[#EA580C]" />
            <span>भारतीय रेल • INDIAN RAILWAYS PASSENGER REGISTER</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0B2545]">मेरे ई-टिकट एवं पीएनआर / MY E-TICKETS & PNR</h1>
          <p className="text-xs sm:text-sm text-slate-600 font-sans">
            Track your verified Tatkal, General, and Advance Reservation tickets and PNR status.
          </p>
        </div>

        <button
          onClick={onNewApplication}
          className="px-5 py-2.5 rounded-xl bg-[#EA580C] hover:bg-[#D94E06] text-white font-bold text-xs flex items-center gap-2 shadow-sm self-start sm:self-auto uppercase tracking-wider transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Railway Requisition (नया टिकट)</span>
        </button>
      </div>

      {/* PNR Search Bar */}
      <div className="p-4 rounded-xl bg-white border border-slate-300 shadow-xs flex items-center gap-3">
        <Search className="w-5 h-5 text-[#EA580C] shrink-0" />
        <input
          type="text"
          value={searchPnr}
          onChange={(e) => setSearchPnr(e.target.value)}
          placeholder="पीएनआर सं. या यात्री का नाम खोजें / Enter 10-digit PNR or Passenger Name..."
          className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none font-sans"
        />
        {searchPnr && (
          <button
            onClick={() => setSearchPnr('')}
            className="text-xs text-slate-600 hover:text-slate-900 px-2 py-1 bg-slate-100 border border-slate-200 rounded"
          >
            Clear
          </button>
        )}
      </div>

      {/* Confirmed Bookings Section styled as authentic Indian Railway Tickets */}
      {bookings.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#0B2545] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>CONFIRMED RAILWAY TICKETS / पुष्ट आरक्षण ई-पर्ची ({filteredBookings.length})</span>
            </h2>

            <span className="text-[11px] text-slate-500 font-sans">
              Google Calendar enabled for all confirmed bookings
            </span>
          </div>

          {/* Google Calendar Informational Banner */}
          <div className="rounded-xl bg-gradient-to-r from-blue-50 via-slate-50 to-orange-50/50 border border-blue-200/80 p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white border border-blue-200 flex items-center justify-center shrink-0 shadow-xs">
                <svg viewBox="0 0 24 24" className="w-5 h-5">
                  <path fill="#4285F4" d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z" />
                  <path fill="#34A853" d="M7 11h5v5H7z" />
                  <path fill="#EA4335" d="M12 11h5v5h-5z" />
                </svg>
              </div>
              <div>
                <span className="font-bold text-[#0B2545] block">
                  Google Calendar Journey Sync (गूगल कैलेंडर में जोड़ें)
                </span>
                <span className="text-[11px] text-slate-600">
                  Sync train departure time, travel date, coach & berth allocations directly to your Google Calendar with automated station & packing alerts.
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredBookings.map((b) => {
              const linkedApp = applications.find((a) => a.id === b.applicationId);
              const sched = extractTrainScheduleDetails(b, linkedApp);
              const isCalSynced = Boolean(b.googleCalendarEvent?.eventId);

              return (
                <div
                  key={b.id}
                  className="rounded-2xl bg-white text-slate-900 border-2 border-emerald-700 p-5 space-y-3 shadow-xs relative overflow-hidden group hover:border-emerald-800 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Authentic ERS Ticket Header */}
                    <div className="flex justify-between items-start border-b border-dashed border-emerald-800/40 pb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-700 flex items-center justify-center text-emerald-800">
                          <Train className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[9px] font-bold text-emerald-800 uppercase block">
                            भारतीय रेल • INDIAN RAILWAYS
                          </span>
                          <div className="text-base font-black text-[#EA580C]">{b.id}</div>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-300">
                        CNF (CONFIRMED)
                      </span>
                    </div>

                    {/* Train Details */}
                    <div className="text-xs space-y-1.5 py-0.5">
                      <div className="font-black text-[#0B2545] text-sm">{b.itemDetails}</div>

                      {/* Travel Date & Schedule Box */}
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 space-y-1 text-xs">
                        <div className="flex items-center justify-between font-bold text-[#0B2545]">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-[#EA580C]" />
                            <span>दिनांक / Date: {b.googleCalendarEvent?.travelDate || sched.travelDate}</span>
                          </span>
                          <span className="flex items-center gap-1 text-[11px] text-slate-700 font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-200">
                            <Clock className="w-3 h-3 text-[#0B2545]" />
                            <span>{b.googleCalendarEvent?.departureTime || sched.departureTime} hrs</span>
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-600 font-sans">
                          <span className="truncate">प्रस्थान / From: <strong>{sched.fromStationName}</strong></span>
                          <span className="truncate">आगमन / To: <strong>{sched.toStationName}</strong></span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-slate-700 font-bold text-[11px] gap-1">
                        <span>यात्री / Passenger: {b.primaryPassenger} ({b.passengerCount})</span>
                        <span className="font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[11px] self-start sm:self-auto">
                          {b.seatSyntheticRef}
                        </span>
                      </div>
                      {b.passengerSeats && b.passengerSeats.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                          {b.passengerSeats.map((ps, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-mono">
                              {ps.passengerName.split(' ')[0]}: <strong>{ps.coach}-{ps.seatNumber} ({ps.berthCode})</strong>
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="text-[10px] text-slate-500">
                        Admission Batch: <span className="font-bold text-[#EA580C]">{b.poolId}</span> • Fare: ₹ {b.amountSynthetic}
                      </div>
                    </div>
                  </div>

                  {/* Footer Action Buttons with Google Calendar Integration */}
                  <div className="pt-2 border-t border-dashed border-slate-200 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      {/* Google Calendar Sync Action */}
                      {isCalSynced ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setCalendarTarget({ booking: b, application: linkedApp })}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-[11px] flex items-center gap-1.5 transition-colors shadow-xs"
                            title="Synced to Google Calendar - Click to edit or remove"
                          >
                            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 shrink-0">
                              <path fill="#4285F4" d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z" />
                              <path fill="#34A853" d="M7 11h5v5H7z" />
                              <path fill="#EA4335" d="M12 11h5v5h-5z" />
                            </svg>
                            <span>In Calendar ✓</span>
                          </button>
                          {b.googleCalendarEvent?.htmlLink && (
                            <a
                              href={b.googleCalendarEvent.htmlLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                              title="Open Event in Google Calendar"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={() => setCalendarTarget({ booking: b, application: linkedApp })}
                          className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#0B2545] border border-blue-200 font-bold text-[11px] flex items-center gap-1.5 transition-colors shadow-xs"
                          title="Add train departure time and details to Google Calendar"
                        >
                          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 shrink-0">
                            <path fill="#4285F4" d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z" />
                            <path fill="#34A853" d="M7 11h5v5H7z" />
                            <path fill="#EA4335" d="M12 11h5v5h-5z" />
                          </svg>
                          <span>Add to Google Calendar</span>
                        </button>
                      )}

                      {/* Coach Layout Visual Map Button */}
                      <button
                        onClick={() => setCoachMapTarget({ booking: b, application: linkedApp })}
                        className="px-2.5 py-1 rounded-lg bg-[#0B2545] hover:bg-[#002244] text-amber-300 border border-blue-900 font-bold text-[11px] flex items-center gap-1.5 transition-colors shadow-2xs"
                        title="View coach layout and assigned seat location"
                      >
                        <Train className="w-3.5 h-3.5 text-[#EA580C]" />
                        <span>Coach Layout (कोच देखें)</span>
                      </button>

                      <button
                        onClick={() => {
                          if (onOpenServices) {
                            onOpenServices('complaint');
                          }
                        }}
                        className="px-2.5 py-1 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-700/80 font-bold text-[11px] flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                        title="File Grievance or Emergency Issue on RailMadad 139"
                      >
                        <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                        <span>RailMadad 139</span>
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => window.print()}
                          className="text-slate-600 hover:text-slate-900 p-1.5 rounded hover:bg-slate-100"
                          title="Print Ticket"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onViewApplication(b.applicationId)}
                          className="px-3 py-1 rounded-lg bg-[#0B2545] hover:bg-[#002244] text-white font-bold text-[11px] flex items-center gap-1 transition-colors"
                        >
                          <span>PNR Status</span>
                          <ArrowRight className="w-3 h-3 text-amber-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Submitted Pre-Registration Applications Section */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-widest text-[#0B2545]">
          WAITING & POOL ASSIGNED REQUISITIONS / कतार में लंबित आरक्षण ({applications.length})
        </h2>

        {applications.length === 0 ? (
          <div className="p-12 rounded-2xl bg-white border border-slate-200 text-center space-y-3 shadow-xs">
            <Train className="w-10 h-10 text-slate-400 mx-auto" />
            <div className="text-base font-bold text-[#0B2545]">No active railway applications</div>
            <p className="text-xs text-slate-500 font-sans">
              Submit your synthetic passenger requisition slip to participate in controlled Tatkal or General pool allocation.
            </p>
            <button
              onClick={onNewApplication}
              className="px-5 py-2.5 rounded-xl bg-[#EA580C] hover:bg-[#D94E06] text-white font-bold text-xs uppercase transition-colors"
            >
              Book Now
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {applications.map((app) => {
              const isWindowOpen = app.status === 'window_active';
              const isBooked = app.status === 'booked';

              return (
                <div
                  key={app.id}
                  className="p-5 rounded-xl bg-white border border-slate-200 hover:border-blue-300 shadow-xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#0B2545] text-xs">{app.id}</span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                          isBooked
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : isWindowOpen
                            ? 'bg-orange-50 text-[#EA580C] border-orange-200 animate-pulse'
                            : 'bg-blue-50 text-blue-800 border-blue-200'
                        }`}
                      >
                        {isBooked ? 'CONFIRMED E-TICKET' : isWindowOpen ? 'BOOKING WINDOW ACTIVE • ADMITTED' : 'TATKAL POOL ASSIGNED'}
                      </span>
                    </div>

                    <div className="font-bold text-slate-900 text-sm">{app.routeOrEventLabel}</div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                      <span>{app.tierOrClass}</span>
                      <span>•</span>
                      <span>{app.quotaOrType}</span>
                      <span>•</span>
                      <span>{app.passengers.length} passenger(s)</span>
                      <span>•</span>
                      <span className="text-[#EA580C] font-semibold">{app.allocation?.poolName}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start md:self-auto">
                    <button
                      onClick={() => onViewApplication(app.id)}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-300 transition-colors"
                    >
                      PNR Lifecycle
                    </button>

                    {isWindowOpen && !isBooked && (
                      <button
                        onClick={() => onProceedToBooking(app.id)}
                        className="px-4 py-2 rounded-xl bg-[#EA580C] hover:bg-[#D94E06] text-white text-xs font-bold shadow-xs flex items-center gap-1 uppercase transition-colors"
                      >
                        <span>Book E-Ticket</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {isBooked && (
                      <button
                        onClick={() => onProceedToBooking(app.id)}
                        className="px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 text-xs font-bold transition-colors"
                      >
                        View Ticket
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Google Calendar Add / Update / Delete Modal */}
      {calendarTarget && (
        <AddToCalendarModal
          booking={calendarTarget.booking}
          application={calendarTarget.application}
          isOpen={Boolean(calendarTarget)}
          onClose={() => setCalendarTarget(null)}
          onSuccess={() => {
            setBookings(StorageService.getBookings());
          }}
        />
      )}

      {/* Coach Layout Visual Map Modal */}
      {coachMapTarget && (
        <CoachBerthMapModal
          isOpen={Boolean(coachMapTarget)}
          onClose={() => setCoachMapTarget(null)}
          trainNumber="12952"
          trainName={coachMapTarget.booking.itemDetails?.split('•')[0]?.trim() || "Mumbai Tejas Rajdhani Express"}
          travelClass={coachMapTarget.booking.itemDetails?.split('•')[1]?.trim() || "3A"}
          activeQuota="GENERAL"
          passengers={coachMapTarget.application?.passengers || []}
          selectedSeats={coachMapTarget.booking.passengerSeats || []}
          highlightCoach={coachMapTarget.booking.passengerSeats?.[0]?.coach}
          highlightBerth={coachMapTarget.booking.passengerSeats?.[0]?.seatNumber}
          readOnly={true}
        />
      )}
    </div>
  );
};
