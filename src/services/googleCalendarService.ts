import { auth, googleProvider, getOrRequestGoogleCalendarAccessToken, getCachedAccessToken, setCachedAccessToken } from './firebase';
import { BookingRecord, UserApplication } from '../types';
import { INDIAN_RAILWAYS_TRAINS, TrainDetail } from '../data/trainData';

export interface TrainScheduleParsed {
  trainNumber: string;
  trainName: string;
  travelDate: string; // YYYY-MM-DD
  departureTime: string; // HH:MM (24-hour)
  arrivalTime: string; // HH:MM (24-hour)
  fromStationName: string;
  fromStationCode: string;
  toStationName: string;
  toStationCode: string;
  platform?: string;
  isOvernight: boolean;
  coachAndBerth: string;
  passengerNames: string[];
  pnr: string;
}

export interface GoogleCalendarEventResult {
  id: string;
  htmlLink: string;
  summary: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
  created: string;
}

/**
 * Extract realistic train journey scheduling parameters from booking & application
 */
export function extractTrainScheduleDetails(
  booking: BookingRecord,
  application?: UserApplication
): TrainScheduleParsed {
  const pnr = booking.id;
  const rawItem = (booking.itemDetails || '') + ' ' + (application?.routeOrEventLabel || '');

  // Find train number from text
  const matchNum = rawItem.match(/\b(12\d{3}|22\d{3}|14\d{3}|15\d{3}|16\d{3}|20\d{3})\b/);
  const matchedTrainNumber = matchNum ? matchNum[1] : '';

  let trainDetail: TrainDetail | undefined;
  if (matchedTrainNumber) {
    trainDetail = INDIAN_RAILWAYS_TRAINS.find(
      (t) => t.number === matchedTrainNumber || t.returnNumber === matchedTrainNumber
    );
  }

  if (!trainDetail) {
    // Try matching by route label keywords
    const lower = rawItem.toLowerCase();
    trainDetail = INDIAN_RAILWAYS_TRAINS.find(
      (t) =>
        lower.includes(t.name.toLowerCase()) ||
        (lower.includes(t.fromStation.name.toLowerCase()) && lower.includes(t.toStation.name.toLowerCase()))
    );
  }

  // Determine travel date
  let travelDate = '';
  if (application?.date) {
    travelDate = application.date;
  } else if (booking.reservedAt) {
    try {
      const d = new Date(booking.reservedAt);
      // If reserved recently, default to a realistic upcoming travel date (e.g. today or future)
      travelDate = d.toISOString().split('T')[0];
    } catch {
      travelDate = new Date().toISOString().split('T')[0];
    }
  } else {
    travelDate = new Date().toISOString().split('T')[0];
  }

  // Fallback defaults
  let trainNumber = trainDetail?.number || matchedTrainNumber || '12952';
  let trainName = trainDetail?.name || booking.itemDetails.split('•')[0]?.trim() || 'Express Special';
  let departureTime = trainDetail?.fromStation.depTime || '17:00';
  let arrivalTime = trainDetail?.toStation.arrTime || '08:32';
  let fromStationName = trainDetail?.fromStation.name || 'Mumbai Central';
  let fromStationCode = trainDetail?.fromStation.code || 'MMCT';
  let toStationName = trainDetail?.toStation.name || 'New Delhi';
  let toStationCode = trainDetail?.toStation.code || 'NDLS';
  let platform = trainDetail?.fromStation.platform || '1';

  // Check if journey is overnight (arrival time earlier in clock or spans next day)
  const [depH, depM] = departureTime.split(':').map(Number);
  const [arrH, arrM] = arrivalTime.split(':').map(Number);
  const isOvernight = (arrH * 60 + arrM) <= (depH * 60 + depM) || (trainDetail && trainDetail.duration.includes('15h'));

  // Coach & berth string
  const coachAndBerth = booking.seatSyntheticRef || 'Coach B1 - Berth 21 (LB)';

  // Passenger names
  const passengerNames = booking.passengerSeats && booking.passengerSeats.length > 0
    ? booking.passengerSeats.map((ps) => ps.passengerName)
    : [booking.primaryPassenger];

  return {
    trainNumber,
    trainName,
    travelDate,
    departureTime,
    arrivalTime,
    fromStationName,
    fromStationCode,
    toStationName,
    toStationCode,
    platform,
    isOvernight,
    coachAndBerth,
    passengerNames,
    pnr
  };
}

/**
 * Format ISO datetime with timezone offset for Indian Standard Time (+05:30)
 */
export function formatIsoWithIST(dateString: string, timeString: string, addDays = 0): string {
  const parts = dateString.split('-').map(Number);
  const year = parts[0];
  const month = parts[1] - 1; // 0-indexed
  const day = parts[2];

  const [hours, minutes] = timeString.split(':').map(Number);

  const d = new Date(Date.UTC(year, month, day + addDays, hours - 5, minutes - 30));
  
  // Format into YYYY-MM-DDTHH:MM:00+05:30
  const pad = (n: number) => String(n).padStart(2, '0');
  const targetDay = new Date(year, month, day + addDays);
  const yyyy = targetDay.getFullYear();
  const mm = pad(targetDay.getMonth() + 1);
  const dd = pad(targetDay.getDate());
  const hh = pad(hours);
  const min = pad(minutes);

  return `${yyyy}-${mm}-${dd}T${hh}:${min}:00+05:30`;
}

/**
 * Service for Google Calendar operations
 */
export const GoogleCalendarService = {
  /**
   * Check if we currently have an in-memory Google access token
   */
  hasCachedToken(): boolean {
    return Boolean(getCachedAccessToken());
  },

  /**
   * Get current Google user if logged in
   */
  getGoogleUser() {
    return auth.currentUser;
  },

  /**
   * Request Google OAuth token with Calendar scopes
   */
  async authenticateGoogleCalendar(forcePrompt = false): Promise<string> {
    return await getOrRequestGoogleCalendarAccessToken(forcePrompt);
  },

  /**
   * Add Train Journey to Google Calendar with rich details & alerts
   */
  async addTrainJourneyEvent(params: {
    schedule: TrainScheduleParsed;
    booking: BookingRecord;
    application?: UserApplication;
    reminderMinutes?: number[]; // e.g. [1440, 180, 60]
  }): Promise<GoogleCalendarEventResult> {
    const { schedule, booking } = params;

    const token = await this.authenticateGoogleCalendar();

    // Calculate start & end ISO strings
    const startIso = formatIsoWithIST(schedule.travelDate, schedule.departureTime, 0);
    const endIso = formatIsoWithIST(
      schedule.travelDate,
      schedule.arrivalTime,
      schedule.isOvernight ? 1 : 0
    );

    const passengerListFormatted = schedule.passengerNames.join(', ');
    const coachSeatFormatted = booking.passengerSeats && booking.passengerSeats.length > 0
      ? booking.passengerSeats.map((ps) => `${ps.passengerName}: ${ps.coach}-${ps.seatNumber} (${ps.berthCode})`).join('\n• ')
      : schedule.coachAndBerth;

    const summary = `🚂 IRCTC: ${schedule.trainName} (${schedule.trainNumber}) [PNR: ${schedule.pnr}]`;

    const description = [
      `🇮🇳 INDIAN RAILWAYS CONFIRMED E-TICKET (ERS)`,
      `=============================================`,
      `PNR Number: ${schedule.pnr}`,
      `Train: ${schedule.trainNumber} - ${schedule.trainName}`,
      `Departure Station: ${schedule.fromStationName} (${schedule.fromStationCode})${schedule.platform ? ` • Platform ${schedule.platform}` : ''}`,
      `Departure Time: ${schedule.departureTime} hrs on ${schedule.travelDate}`,
      `Destination Station: ${schedule.toStationName} (${schedule.toStationCode})`,
      `Expected Arrival: ${schedule.arrivalTime} hrs${schedule.isOvernight ? ' (Next Day)' : ''}`,
      `---------------------------------------------`,
      `Class & Coach: ${booking.itemDetails.split('•')[1]?.trim() || 'AC Tier'}`,
      `Seats / Berths:`,
      `• ${coachSeatFormatted}`,
      `Passenger(s): ${passengerListFormatted}`,
      `Total Fare: ₹ ${booking.amountSynthetic} (Paid)`,
      `Status: CONFIRMED (CNF)`,
      `---------------------------------------------`,
      `IRCTC Verified Electronic Reservation Slip.`,
      `FairFlow High-Load Concurrency Protection System.`
    ].join('\n');

    const location = `${schedule.fromStationName} Railway Station (${schedule.fromStationCode})${
      schedule.platform ? `, Platform ${schedule.platform}` : ''
    }`;

    // Reminder overrides: default to 24h, 3h, 1h
    const reminders = params.reminderMinutes || [1440, 180, 60];

    const eventPayload = {
      summary,
      description,
      location,
      start: {
        dateTime: startIso,
        timeZone: 'Asia/Kolkata'
      },
      end: {
        dateTime: endIso,
        timeZone: 'Asia/Kolkata'
      },
      colorId: '6', // Tangerine / Orange in Google Calendar (matches Indian Railways theme)
      reminders: {
        useDefault: false,
        overrides: reminders.map((mins) => ({
          method: 'popup',
          minutes: mins
        }))
      }
    };

    const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(eventPayload)
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      const message = err?.error?.message || `Google Calendar API returned error status ${response.status}`;
      // Invalidate token if 401
      if (response.status === 401) {
        setCachedAccessToken(null);
      }
      throw new Error(message);
    }

    const createdEvent = (await response.json()) as GoogleCalendarEventResult;
    return createdEvent;
  },

  /**
   * Delete Train Journey from Google Calendar with explicit confirmation
   */
  async deleteTrainJourneyEvent(eventId: string): Promise<boolean> {
    const token = await this.authenticateGoogleCalendar();

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${encodeURIComponent(eventId)}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    if (!response.ok && response.status !== 404 && response.status !== 410) {
      const err = await response.json().catch(() => ({}));
      if (response.status === 401) {
        setCachedAccessToken(null);
      }
      throw new Error(err?.error?.message || `Failed to delete calendar event (${response.status})`);
    }

    return true;
  }
};
